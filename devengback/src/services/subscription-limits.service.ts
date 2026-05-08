// import User from '../models/User';
// import UserSubscription from '../models/UserSubscription'; // Import the UserSubscription model
// import AIUsage from '../models/AIUsage';
// import {
//   FREE_TIER_LIMITS,
//   CORE_TIER_LIMITS,
//   PRO_TIER_LIMITS,
//   isWithinTemplateLimit, // These helper functions in config/subscriptionLimits.ts
//   isWithinDailyAILimit, // also need to be updated to handle 'core'/'pro'
//   hasAccessToModel, // instead of 'premium' if they are not already.
// } from '../config/subscriptionLimits';
// import logger from '../utils/logger';

/**
 * Service to check and enforce subscription limits
 */
export default class SubscriptionLimitsService {
  /**
   * Helper to get the user's current subscription tier.
   * Defaults to 'free' if no subscription record is found.
   */
  // private static async getUserTier(userId: string): Promise<'free' | 'core' | 'pro'> {
  //   const userSubscription = await UserSubscription.findOne({ where: { userId } });
  //   // Default to 'free' if no subscription record or status is not active
  //   // You might refine this based on your 'status' enum to only grant paid tiers if 'active'
  //   return userSubscription?.tier || 'free';
  // }
  /**
   * Check if a user can create a new template
   */
  // static async canCreateTemplate(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  //   try {
  //     const userTier = await this.getUserTier(userId);
  //     // Pro (previously 'premium') users always have unlimited templates
  //     if (userTier === 'pro') {
  //       // Changed 'premium' to 'pro'
  //       return { allowed: true };
  //     }
  //     // Determine limits based on tier
  //     const limits = userTier === 'core' ? CORE_TIER_LIMITS : FREE_TIER_LIMITS;
  //     // This requires Template model. Assuming it will be implemented.
  //     // const templateCount = await Template.count({ where: { ownerId: userId } });
  //     const templateCount = 0; // Temporary solution as indicated by comment
  //     if (templateCount >= limits.MAX_TEMPLATES) {
  //       return {
  //         allowed: false,
  //         reason: `${userTier.charAt(0).toUpperCase() + userTier.slice(1)} tier is limited to ${limits.MAX_TEMPLATES} templates. Upgrade for more or unlimited templates.`, // Dynamic reason
  //       };
  //     }
  //     return { allowed: true };
  //   } catch (error) {
  //     logger.error(`Error checking template limits for userId ${userId}: ${error}`);
  //     return { allowed: false, reason: 'Error checking template limits' };
  //   }
  // }
  /**
   * Check if a user can generate AI content
   */
  // static async canGenerateAI(
  //   userId: string
  // ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  //   try {
  //     const userTier = await this.getUserTier(userId);
  //     // Pro  users always have unlimited AI generations
  //     if (userTier === 'pro') {
  //       return { allowed: true, remaining: Infinity };
  //     }
  //     // Determine limits based on tier
  //     const limits = userTier === 'core' ? CORE_TIER_LIMITS : FREE_TIER_LIMITS;
  //     // For free/core users, check the daily usage count
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0); // Start of the day
  //     let usage = await AIUsage.findOne({
  //       where: {
  //         userId: userId,
  //         date: today,
  //       },
  //     });
  //     const currentCount = usage ? usage.count : 0;
  //     const remaining = limits.DAILY_AI_GENERATIONS - currentCount;
  //     if (currentCount >= limits.DAILY_AI_GENERATIONS) {
  //       return {
  //         allowed: false,
  //         reason: `You've reached your daily limit of ${limits.DAILY_AI_GENERATIONS} AI generations for the ${userTier} tier. Upgrade for more or unlimited access.`, // Dynamic reason
  //         remaining: 0,
  //       };
  //     }
  //     return { allowed: true, remaining };
  //   } catch (error) {
  //     logger.error(`Error checking AI generation limits for userId ${userId}: ${error}`);
  //     return { allowed: false, reason: 'Error checking AI generation limits' };
  //   }
  // }
  /**
   * Increment AI usage count for a user
   */
  // static async incrementAIUsage(userId: string): Promise<void> {
  //   try {
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0); // Start of the day
  //     // Find the usage record
  //     let usage = await AIUsage.findOne({
  //       where: {
  //         userId: userId,
  //         date: today,
  //       },
  //     });
  //     if (usage) {
  //       // Update existing record
  //       await AIUsage.update(
  //         {
  //           count: usage.count + 1,
  //           lastUpdated: new Date(),
  //         },
  //         { where: { id: usage.id } }
  //       );
  //     } else {
  //       // Create new record
  //       await AIUsage.create({
  //         userId: userId,
  //         date: today,
  //         count: 1,
  //         lastUpdated: new Date(),
  //       });
  //     }
  //   } catch (error) {
  //     logger.error(`Error incrementing AI usage count for userId ${userId}: ${error}`);
  //     throw error;
  //   }
  // }
  /**
   * Check if user has access to a specific AI model
   */
  // static async hasModelAccess(
  //   userId: string,
  //   modelName: string
  // ): Promise<{ allowed: boolean; reason?: string }> {
  //   try {
  //     const userTier = await this.getUserTier(userId);
  //     if (!hasAccessToModel(userTier, modelName)) {
  //       // The reason message should be generalized as it might not always be 'Premium'
  //       return {
  //         allowed: false,
  //         reason: `Model ${modelName} requires a higher subscription tier. Upgrade to access advanced AI models.`,
  //       };
  //     }
  //     return { allowed: true };
  //   } catch (error) {
  //     logger.error(
  //       `Error checking model access for userId ${userId}, model ${modelName}: ${error}`
  //     );
  //     return { allowed: false, reason: 'Error checking model access' };
  //   }
  // }
  /**
   * Get user's usage statistics
   */
  // static async getUserUsageStats(userId: string): Promise<{
  //   templates: { count: number; limit: number; unlimited: boolean };
  //   aiUsage: { today: number; limit: number; unlimited: boolean; remaining: number };
  //   availableModels: string[];
  // }> {
  //   try {
  //     const userTier = await this.getUserTier(userId);
  //     const limits =
  //       userTier === 'core'
  //         ? CORE_TIER_LIMITS
  //         : userTier === 'pro'
  //           ? PRO_TIER_LIMITS
  //           : FREE_TIER_LIMITS;
  //     // Get template count - this needs the Template model
  //     // Temporarily disabled until Template model is fixed
  //     // const templateCount = await Template.count({ where: { ownerId: userId } });
  //     const templateCount = 0; // Temporary solution
  //     // Get today's AI usage
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0); // Start of the day
  //     const usage = await AIUsage.findOne({
  //       where: {
  //         userId: userId,
  //         date: today,
  //       },
  //     });
  //     const todayUsage = usage ? usage.count : 0;
  //     return {
  //       templates: {
  //         count: templateCount,
  //         limit: limits.MAX_TEMPLATES,
  //         unlimited: userTier === 'pro', // Changed 'premium' to 'pro'
  //       },
  //       aiUsage: {
  //         today: todayUsage,
  //         limit: limits.DAILY_AI_GENERATIONS,
  //         unlimited: userTier === 'pro', // Changed 'premium' to 'pro'
  //         remaining:
  //           userTier === 'pro' ? Infinity : Math.max(0, limits.DAILY_AI_GENERATIONS - todayUsage), // Changed 'premium' to 'pro'
  //       },
  //       availableModels: limits.AI_MODELS,
  //     };
  //   } catch (error) {
  //     logger.error(`Error getting user usage stats for userId ${userId}: ${error}`);
  //     throw error;
  //   }
  // }
}
