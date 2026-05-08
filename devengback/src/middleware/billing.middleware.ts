import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { BillingService } from '../services/billing.service';
import { IUser } from '../models/User';

export const ensureBillingAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as IUser | undefined;
  const userId = user?.id;

  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  try {
    const subscription = await BillingService.getUserSubscriptionWithTrial(userId);
    const { tier, currentPeriodEnd, status } = subscription;
    const now = new Date();

    //  Build billing status object
    const billingStatus = {
      isTrialExpired: false,
      isOutOfDucks: false,
      shouldShowUpgradePrompt: false,
      trialDaysLeft: null as number | null,
      currentTier: tier,
    };

    const wallet = await BillingService.applyDailyAndMonthlyResets(userId);
    const balance = Number(wallet.totalDucksAvailable) || 0;

    // --- Trial user logic ---
    if (tier === 'trial') {
      if (currentPeriodEnd) {
        const isExpired = now > currentPeriodEnd;
        billingStatus.isTrialExpired = isExpired;

        if (!isExpired) {
          const diffTime = currentPeriodEnd.getTime() - now.getTime();
          billingStatus.trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }
      billingStatus.isOutOfDucks = balance <= 0;
      billingStatus.shouldShowUpgradePrompt =
        billingStatus.isTrialExpired || billingStatus.isOutOfDucks;
    }

    // --- Blocking (only for non-GET requests) ---
    // if (req.method !== 'GET') {
    if (tier === 'trial' && billingStatus.isTrialExpired) {
      logger.warn(`[BillingMiddleware] Block TRIAL expired → user=${userId}, path=${req.path}`);
      res.status(402).json({
        error: 'TRIAL_EXPIRED',
        message: 'Your 3-day trial has ended. Please subscribe to continue.',
        action: 'SUBSCRIBE',
        billingStatus,
      });
      return;
    }

    if (tier !== 'trial') {
      if (!currentPeriodEnd || now > currentPeriodEnd) {
        logger.warn(
          `[BillingMiddleware] Block SUBSCRIPTION expired → user=${userId}, path=${req.path}`
        );
        billingStatus.shouldShowUpgradePrompt = true;
        res.status(402).json({
          error: 'SUBSCRIPTION_EXPIRED',
          message: 'Your subscription has expired. Please renew to continue.',
          action: 'SUBSCRIBE',
          billingStatus,
        });
        return;
      }
    }

    if (tier === 'trial' && billingStatus.isOutOfDucks) {
      logger.warn(
        `[BillingMiddleware] Block TRIAL out of ducks → user=${userId}, path=${req.path}`
      );
      res.status(402).json({
        error: 'OUT_OF_DUCKS',
        message: 'You’ve used all your trial ducks. Subscribe to get more!',
        action: 'SUBSCRIBE',
        billingStatus,
      });
      return;
    }
    // }

    next();
  } catch (error) {
    logger.error(`[BillingMiddleware] Error for user=${userId}:`, error);
    res.status(500).json({ error: 'Billing check failed' });
    return;
  }
};
