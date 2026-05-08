import User from '../models/User';
import UserSubscription from '../models/UserSubscription';
import UserWallet from '../models/UserWallet';
import AIUsage from '../models/AIUsage';
import DuckTransaction from '../models/DuckTransaction';
import { Op } from 'sequelize';

import CastModel from '../models/Cast';
import ProtocolModel from '../models/Protocol';

import {
  getDuckAllowanceByTier,
  getContentLimitsByTier,
  getModelAccessByTier,
  calculateCostInDucks,
  calculateRollover,
} from '../utils/billing-helpers';
import logger from '../utils/logger';

export class BillingService {
  private static async getUserTier(userId: string): Promise<'trial' | 'core' | 'pro'> {
    const userSubscription = await UserSubscription.findOne({ where: { userId } });
    return userSubscription?.tier!;
  }

  static async logCompletedAIUsageAndDeduct(
    userId: string,
    sessionId: string,
    actualInputTokens: number,
    actualOutputTokens: number,
    interactionType: string,
    modelUsed: string,
    protocolLevel?: number
  ): Promise<{ success: boolean; newBalance: string; reason?: string }> {
    try {
      const tier = await BillingService.getUserTier(userId);

      let actualCost = calculateCostInDucks(
        tier,
        actualInputTokens + actualOutputTokens,
        interactionType,
        protocolLevel
      );
      const wallet = await this.applyDailyAndMonthlyResets(userId);

      // Convert wallet balance to number for comparison
      const currentBalance = parseFloat(wallet.totalDucksAvailable);
      if (currentBalance < actualCost) {
        logger.warn(
          `User ${userId} attempting to overspend. Balance: ${currentBalance}, Cost: ${actualCost}`
        );
      }

      const balanceBeforeDeduction = currentBalance;
      const newBalance = balanceBeforeDeduction - actualCost;

      wallet.set('totalDucksAvailable', newBalance.toFixed(2));
      await wallet.save();

      await AIUsage.create({
        userId: userId,
        sessionId: sessionId,
        modelUsed: modelUsed,
        interactionType: interactionType,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        estimatedDucks: actualCost,
        actualDucks: actualCost,
        status: 'completed',
      });

      await DuckTransaction.create({
        userId: userId,
        type: 'deduction',
        amount: actualCost.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: `AI usage: ${interactionType} with ${modelUsed} (${actualInputTokens} in, ${actualOutputTokens} out)`,
        details: {
          modelUsed,
          interactionType,
          inputTokens: actualInputTokens,
          outputTokens: actualOutputTokens,
        },
      });

      return { success: true, newBalance: newBalance.toFixed(2) };
    } catch (error) {
      logger.error(`Error logging completed AI usage and deducting for user ${userId}:`, error);
      return {
        success: false,
        newBalance: (
          await BillingService.getUserUsageStats(userId)
        ).aiUsage.totalDucksAvailable.toFixed(2),
        reason: 'Failed to process billing after AI usage.',
      };
    }
  }

  /**
   * Internal helper to apply daily/monthly resets to a user's wallet if due.
   * This ensures the wallet is up-to-date when accessed, providing a "self-healing" mechanism.
   * It also updates content limits in the wallet based on the current tier.
   */
  static async applyDailyAndMonthlyResets(userId: string): Promise<UserWallet> {
    let wallet = await UserWallet.findOne({ where: { userId } });

    const userTier = await this.getUserTier(userId); // Correctly fetch userTier from subscription
    const tierConfig = getDuckAllowanceByTier(userTier);
    const contentLimitsForTier = getContentLimitsByTier(userTier); // Get current tier's content limits

    let needsUpdate = false;
    let transactionDescription = [];

    if (!wallet) {
      // Create a default wallet for new users
      wallet = await UserWallet.create({
        userId,
        totalDucksAvailable: tierConfig.initialDucks.toFixed(2),
        monthlyDuckQuota: tierConfig.monthlyQuota.toFixed(2),
        dailyDuckBonusRemaining: tierConfig.dailyBonus.toFixed(2),
        rolloverDucks: '0',
        lastDailyBonusReset: new Date(),
        lastMonthlyReset: new Date(),
        // --- MODIFIED: Initialize content limits from the tier config on creation ---
        castMembersCount: contentLimitsForTier.maxCastMembersLimit,
        protocolsCount: contentLimitsForTier.maxProtocolsLimit,
        // --- END MODIFIED ---
        oneTimeDuckGrantGiven: true,
      });
      logger.info(
        `🔗 Created UserWallet for new user: ${userId} with initial ducks: ${tierConfig.initialDucks}`
      );
      await DuckTransaction.create({
        userId,
        type: 'allocation',
        amount: wallet.totalDucksAvailable,
        balanceAfter: wallet.totalDucksAvailable,
        description: `Initial wallet allocation for ${userTier} tier.`,
        details: { tier: userTier },
      });
      needsUpdate = true; // Mark as needing update since it's new
    } else {
      //  Update existing wallet's content limits if tier changed or config updated ---
      if (wallet.castMembersCount !== contentLimitsForTier.maxCastMembersLimit) {
        wallet.castMembersCount = contentLimitsForTier.maxCastMembersLimit;
        needsUpdate = true;
        logger.info(
          `[Wallet Update] User ${userId} castMembersCount updated to ${wallet.castMembersCount} for tier ${userTier}.`
        );
      }
      if (wallet.protocolsCount !== contentLimitsForTier.maxProtocolsLimit) {
        wallet.protocolsCount = contentLimitsForTier.maxProtocolsLimit;
        needsUpdate = true;
        logger.info(
          `[Wallet Update] User ${userId} protocolsCount updated to ${wallet.protocolsCount} for tier ${userTier}.`
        );
      }

      // --- END ADDED ---
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Apply daily bonus reset
    if (!wallet.lastDailyBonusReset || wallet.lastDailyBonusReset < todayStart) {
      const dailyBonusAwarded = tierConfig.dailyBonus;
      if (dailyBonusAwarded > 0) {
        const currentBalance = parseFloat(wallet.totalDucksAvailable);
        const newBalance = currentBalance + dailyBonusAwarded;
        wallet.set('totalDucksAvailable', newBalance.toFixed(2));
        wallet.set('dailyDuckBonusRemaining', dailyBonusAwarded.toFixed(2));
        wallet.lastDailyBonusReset = now;
        needsUpdate = true;
        transactionDescription.push(`Daily bonus awarded (${dailyBonusAwarded} Ducks).`);
        await DuckTransaction.create({
          userId,
          type: 'bonus',
          amount: dailyBonusAwarded.toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          description: `Daily bonus for ${userTier} tier`,
          details: { tier: userTier, bonusType: 'daily' },
        });
      }
    }

    // Apply monthly quota reset and rollover
    if (!wallet.lastMonthlyReset || wallet.lastMonthlyReset < monthStart) {
      let monthlyQuotaAwarded = tierConfig.monthlyQuota;
      let previousMonthDucks = parseFloat(wallet.totalDucksAvailable);

      let rolledOverDucks = calculateRollover(previousMonthDucks, userTier);

      const newBalance = monthlyQuotaAwarded + rolledOverDucks;
      wallet.set('totalDucksAvailable', newBalance.toFixed(2));
      wallet.set('monthlyDuckQuota', monthlyQuotaAwarded.toFixed(2));
      wallet.set('rolloverDucks', rolledOverDucks.toFixed(2));
      wallet.lastMonthlyReset = now;
      needsUpdate = true;

      if (rolledOverDucks > 0) {
        transactionDescription.push(
          `Monthly quota reset (${monthlyQuotaAwarded} Ducks) with ${rolledOverDucks} Ducks rolled over.`
        );
        await DuckTransaction.create({
          userId,
          type: 'rollover',
          amount: rolledOverDucks.toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          description: `Rollover ducks from previous month for ${userTier} tier`,
          details: { tier: userTier },
        });
      } else {
        transactionDescription.push(`Monthly quota reset (${monthlyQuotaAwarded} Ducks).`);
      }
      await DuckTransaction.create({
        userId,
        type: 'allocation',
        amount: monthlyQuotaAwarded.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: `Monthly quota reset for ${userTier} tier`,
        details: { tier: userTier, bonusType: 'monthly' },
      });
    }

    if (needsUpdate) {
      await wallet.save();
      logger.info(`User wallet for ${userId} updated: ${transactionDescription.join(' ')}`);
    }

    return wallet;
  }

  /**
   * Checks if a user is allowed to create a template (cast or protocol) based on content limits AND duck balance.
   * @param userId The ID of the user.
   * @param templateType The type of template ('cast' or 'protocol').
   * @param protocolLevel Optional: The level of the protocol, used for calculating creation cost if applicable.
   * @returns An object indicating if allowed and a reason if not.
   */
  static async canCreateTemplate(
    userId: string,
    templateType: 'cast' | 'protocol',
    //  protocolLevel parameter ---
    protocolLevel?: number
    // --- END ADDED ---
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const userTier = await this.getUserTier(userId); // Correctly fetch userTier from subscription
      const wallet = await this.applyDailyAndMonthlyResets(userId); // Ensure wallet is up-to-date

      if (userTier === 'pro') {
        return { allowed: true }; // Pro tier has no limits
      }

      const tierAllowance = getDuckAllowanceByTier(userTier);
      const contentLimits = getContentLimitsByTier(userTier); // Already imported, good.

      let currentCount = 0;
      let maxLimit = 0;
      let limitType = '';
      // Removed 'creationCost' variable here as it's calculated directly below

      if (templateType === 'cast') {
        currentCount = await CastModel.count({ where: { userId } });
        maxLimit = contentLimits.maxCastMembersLimit;
        limitType = 'Cast Members';
      } else if (templateType === 'protocol') {
        currentCount = await ProtocolModel.count({ where: { userId } });
        maxLimit = contentLimits.maxProtocolsLimit;
        limitType = 'Protocols';
      } else {
        return { allowed: false, reason: 'Invalid template type.' };
      }

      // 1. Check content limits
      if (currentCount >= maxLimit) {
        return {
          allowed: false,
          reason: `${userTier.charAt(0).toUpperCase() + userTier.slice(1)} tier is limited to ${maxLimit} ${limitType}. Upgrade for more or unlimited access.`,
        };
      }

      //  2. Check duck balance for creation cost ---
      const cost = calculateCostInDucks(userTier, 0, `${templateType}_create`, protocolLevel); // Pass protocolLevel
      const currentBalance = parseFloat(wallet.totalDucksAvailable);
      if (currentBalance < cost) {
        return {
          allowed: false,
          reason: `Insufficient Ducks. You need ${cost} Ducks to create this ${templateType}. You have ${currentBalance} Ducks.`,
        };
      }
      // --- END ADDED ---

      return { allowed: true };
    } catch (error) {
      logger.error(`Error checking template limits for userId ${userId}: ${error}`);
      return { allowed: false, reason: 'Error checking template limits' };
    }
  }

  //  New static method to deduct ducks for an action ---
  /**
   * Deducts ducks from a user's wallet for a specific action.
   * This should be called AFTER a successful `canCreateTemplate` or `canGenerateAI` check.
   * @param userId The ID of the user.
   * @param actionType The type of action (e.g., 'cast_create', 'protocol_create', 'image_gen', 'chat', 'task_start', 'protocol').
   * @param totalTokens For token-based actions, the number of tokens.
   * @param protocolLevel For protocol-related actions, the level of the protocol.
   * @returns An object indicating success, new balance, and a reason if failed.
   */
  static async deductDucksForAction(
    userId: string,
    actionType: string,
    totalTokens: number = 0,
    protocolLevel?: number
  ): Promise<{ success: boolean; newBalance?: string; deductedDucks?: string; reason?: string }> {
    try {
      const wallet = await this.applyDailyAndMonthlyResets(userId); // Ensure wallet is up-to-date
      const userTier = await this.getUserTier(userId); // Correctly fetch userTier from subscription

      const cost = calculateCostInDucks(userTier, totalTokens, actionType, protocolLevel);
      const currentBalance = parseFloat(wallet.totalDucksAvailable);

      if (currentBalance < cost) {
        logger.warn(
          `User ${userId} attempted to ${actionType} but has insufficient ducks. Needed: ${cost}, Available: ${currentBalance}`
        );
        return {
          success: false,
          reason: `Insufficient Ducks. You need ${cost} Ducks for this action. You have ${currentBalance} Ducks.`,
        };
      }

      const newBalance = currentBalance - cost;
      wallet.set('totalDucksAvailable', newBalance.toFixed(2));
      await wallet.save();
      logger.info(
        `Deducted ${cost} ducks for ${actionType} from user ${userId}. New balance: ${newBalance}`
      );

      // Log the transaction
      await DuckTransaction.create({
        userId: userId,
        type: 'deduction',
        amount: cost.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: `Deduction for ${actionType}${protocolLevel ? ` (Level ${protocolLevel})` : ''}`,
        details: { actionType, protocolLevel, totalTokens },
      });

      return { success: true, newBalance: newBalance.toFixed(2), deductedDucks: cost.toFixed(2) };
    } catch (error) {
      logger.error(`Error deducting ducks for action ${actionType} for user ${userId}: ${error}`);
      return { success: false, reason: 'Failed to deduct ducks due to an internal error.' };
    }
  }
  // --- END ADDED ---

  static async canGenerateAI(
    userId: string,
    estimatedTokens: number,
    interactionType: string,
    modelUsed: string
  ): Promise<{ allowed: boolean; reason?: string; estimatedCost?: number }> {
    try {
      const userTier = await this.getUserTier(userId);
      const wallet = await this.applyDailyAndMonthlyResets(userId);
      const tierConfig = getDuckAllowanceByTier(userTier);
      const modelAccess = getModelAccessByTier(userTier);

      if (userTier === 'pro') {
        return { allowed: true, estimatedCost: 0 };
      }

      if (!modelAccess.includes(modelUsed)) {
        return {
          allowed: false,
          reason: `Model ${modelUsed} requires a higher subscription tier. Upgrade to access advanced AI models.`,
        };
      }

      const estimatedCost = calculateCostInDucks(userTier, estimatedTokens, interactionType);
      if (estimatedCost === 0) {
        return { allowed: true, estimatedCost: 0 };
      }

      const currentBalance = parseFloat(wallet.totalDucksAvailable);
      if (currentBalance < estimatedCost) {
        return {
          allowed: false,
          reason: `Insufficient Ducks. You need ${estimatedCost} Ducks but only have ${currentBalance}. Upgrade or wait for daily/monthly allocation.`,
          estimatedCost,
        };
      }

      return { allowed: true, estimatedCost };
    } catch (error) {
      logger.error(`Error in canGenerateAI for userId ${userId}: ${error}`);
      return { allowed: false, reason: 'Error checking AI generation limits' };
    }
  }

  static async hasModelAccess(
    userId: string,
    modelName: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const userTier = await this.getUserTier(userId);
      const allowedModels = getModelAccessByTier(userTier);

      if (!allowedModels.includes(modelName)) {
        return {
          allowed: false,
          reason: `Model ${modelName} requires a higher subscription tier. Upgrade to access advanced AI models.`,
        };
      }

      return { allowed: true };
    } catch (error) {
      logger.error(
        `Error checking model access for userId ${userId}, model ${modelName}: ${error}`
      );
      return { allowed: false, reason: 'Error checking model access' };
    }
  }

  static async getUserUsageStats(userId: string): Promise<{
    templates: {
      cast: { count: number; limit: number; unlimited: boolean };
      protocol: { count: number; limit: number; unlimited: boolean };
    };
    aiUsage: {
      totalDucksAvailable: number;
      monthlyDuckQuota: number;
      dailyDuckBonusRemaining: number;
      ducksConsumedThisMonth: number;
      ducksConsumedToday: number;
      unlimitedDucks: boolean;
    };
    availableModels: string[];
    transactions: DuckTransaction[];
  }> {
    try {
      const userTier = await this.getUserTier(userId);
      const wallet = await this.applyDailyAndMonthlyResets(userId);
      const tierConfig = getDuckAllowanceByTier(userTier);
      const contentLimits = getContentLimitsByTier(userTier);

      const currentCastCount = await CastModel.count({ where: { userId } });
      const currentProtocolCount = await ProtocolModel.count({ where: { userId } });

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const ducksConsumedThisMonth =
        (await DuckTransaction.sum('amount', {
          where: {
            userId,
            type: 'deduction',
            createdAt: { [Op.gte]: monthStart },
          },
        })) || 0;

      const ducksConsumedToday =
        (await DuckTransaction.sum('amount', {
          where: {
            userId,
            type: 'deduction',
            createdAt: { [Op.gte]: todayStart },
          },
        })) || 0;

      const recentTransactions = await DuckTransaction.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 10,
      });

      return {
        templates: {
          cast: {
            count: currentCastCount,
            limit: wallet.castMembersCount, // This will now correctly reflect the tier's limit
            unlimited: userTier === 'pro',
          },
          protocol: {
            count: currentProtocolCount,
            limit: wallet.protocolsCount, // This will now correctly reflect the tier's limit
            unlimited: userTier === 'pro',
          },
        },
        aiUsage: {
          totalDucksAvailable: parseFloat(wallet.totalDucksAvailable),
          monthlyDuckQuota: parseFloat(wallet.monthlyDuckQuota),
          dailyDuckBonusRemaining: parseFloat(wallet.dailyDuckBonusRemaining),
          ducksConsumedThisMonth: ducksConsumedThisMonth,
          ducksConsumedToday: ducksConsumedToday,
          unlimitedDucks: userTier === 'pro',
        },
        availableModels: getModelAccessByTier(userTier),
        transactions: recentTransactions,
      };
    } catch (error) {
      logger.error(`Error getting user usage stats for userId ${userId}: ${error}`);
      throw error;
    }
  }

  static async handleTierChangeWithOldTier(
    userId: string,
    oldTier: 'trial' | 'core' | 'pro',
    newTier: 'trial' | 'core' | 'pro'
  ): Promise<void> {
    try {
      logger.info(
        `🔍 handleTierChangeWithOldTier called for user ${userId}, oldTier: ${oldTier}, newTier: ${newTier}`
      );

      const wallet = await UserWallet.findOne({ where: { userId } });
      if (!wallet) {
        logger.warn(`⚠️ Wallet not found for user ${userId} during tier change`);
        return;
      }

      logger.info(
        `📊 Old tier: ${oldTier}, New tier: ${newTier}, oneTimeDuckGrantGiven: ${wallet.oneTimeDuckGrantGiven}`
      );

      if (oldTier === 'trial' && newTier !== 'trial') {
        const newTierConfig = getDuckAllowanceByTier(newTier);
        const initialDucks = newTierConfig.initialDucks;

        logger.info(` Granting ${initialDucks} ducks to user ${userId}`);

        //  Convert string to number for calculations
        const currentBalance = parseFloat(wallet.totalDucksAvailable);
        const newBalance = Math.round((currentBalance + initialDucks) * 100) / 100;

        //  Convert back to string before saving
        wallet.set('totalDucksAvailable', newBalance.toFixed(2));
        wallet.set('oneTimeDuckGrantGiven', true);

        await wallet.save({
          fields: ['totalDucksAvailable', 'oneTimeDuckGrantGiven'],
        });

        logger.info(` Wallet save completed for user ${userId}`);

        //  VERIFY THE SAVE WORKED
        const updatedWallet = await UserWallet.findByPk(wallet.id);
        logger.info(` Verified saved balance: ${updatedWallet?.totalDucksAvailable}`);

        logger.info(` Wallet saved with new balance: ${wallet.totalDucksAvailable}`);

        await DuckTransaction.create({
          userId,
          type: 'allocation',
          amount: initialDucks.toFixed(2),
          balanceAfter: wallet.totalDucksAvailable,
          description: `One-time upgrade bonus for ${newTier} tier.`,
          details: { oldTier, newTier, bonusType: 'upgrade' },
        });

        logger.info(
          ` Granted ${initialDucks} upgrade bonus ducks to user ${userId} for ${newTier} tier`
        );
      } else {
        logger.info(`ℹ️ No bonus granted. Conditions not met.`);
      }
    } catch (error) {
      logger.error(`Error handling tier change for user ${userId}: ${error}`);
    }
  }

  static async getUserSubscriptionWithTrial(userId: string) {
    const subscription = await UserSubscription.findOne({
      where: { userId },
      attributes: ['tier', 'createdAt', 'currentPeriodEnd', 'status'], // ← ADD currentPeriodEnd and status
    });

    if (!subscription) {
      throw new Error('User subscription not found');
    }

    // For trial users: trial ends 3 days after signup
    // if (subscription.tier === 'trial') {
    //   const trialEndDate = new Date(subscription.createdAt);
    //   trialEndDate.setDate(trialEndDate.getDate() + 3);
    //   return {
    //     tier: subscription.tier,
    //     trialEndDate: trialEndDate,
    //     currentPeriodEnd: null, // trial doesn't use this
    //     status: subscription.status,
    //   };
    // }

    // For paid users: subscription ends at currentPeriodEnd (if set)
    return {
      tier: subscription.tier,
      // trialEndDate: null, // not applicable
      currentPeriodEnd: subscription.currentPeriodEnd, // ← USE THIS
      status: subscription.status,
    };
  }

  /**
   * Get comprehensive billing status for a user
   * Used by the billing status endpoint
   */
  static async getBillingStatusForUser(userId: string) {
    const subscription = await BillingService.getUserSubscriptionWithTrial(userId);
    const { tier, currentPeriodEnd } = subscription;
    const now = new Date();

    const billingStatus = {
      isTrialExpired: false,
      isOutOfDucks: false,
      shouldShowUpgradePrompt: false,
      trialDaysLeft: null as number | null,
      currentTier: tier,
    };

    const wallet = await BillingService.applyDailyAndMonthlyResets(userId);

    // Calculate billing status for TRIAL users
    if (tier === 'trial') {
      const isTrialExpired = currentPeriodEnd && now > currentPeriodEnd;
      billingStatus.isTrialExpired = !!isTrialExpired;

      // Calculate days left (if not expired)
      if (!isTrialExpired && currentPeriodEnd) {
        const diffTime = currentPeriodEnd.getTime() - now.getTime();
        billingStatus.trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Check duck balance
      const balance = parseFloat(wallet.totalDucksAvailable);
      const isOutOfDucks = balance <= 0;
      billingStatus.isOutOfDucks = isOutOfDucks;

      // Should show upgrade prompt if expired OR out of ducks
      billingStatus.shouldShowUpgradePrompt = !!isTrialExpired || isOutOfDucks;
    }

    // Also include wallet info for convenience
    return {
      ...billingStatus,
      wallet: {
        totalDucksAvailable: parseFloat(wallet.totalDucksAvailable),
        monthlyDuckQuota: parseFloat(wallet.monthlyDuckQuota),
        dailyDuckBonusRemaining: parseFloat(wallet.dailyDuckBonusRemaining),
        rolloverDucks: parseFloat(wallet.rolloverDucks),
        lastDailyReset: wallet.lastDailyBonusReset?.toISOString() || null,
        lastMonthlyReset: wallet.lastMonthlyReset?.toISOString() || null,
      },
      subscription: {
        tier,
        status: subscription.status,
        // trialEndDate: trialEndDate?.toISOString() || null,
        currentPeriodEnd: currentPeriodEnd?.toISOString() || null,
      },
    };
  }
}
