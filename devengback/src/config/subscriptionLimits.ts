/**
 * Subscription Limits Configuration
 *
 * This file defines the limits and permissions for different subscription tiers.
 * These values are used throughout the application to enforce subscription restrictions.
 */

/**
 * Free tier limits
 */
export const TRIAL_TIER_LIMITS = {
  // Maximum number of templates a free user can save
  MAX_TEMPLATES: 5,

  // Maximum daily AI generations for free users
  DAILY_AI_GENERATIONS: 5,

  // Access to AI models
  AI_MODELS: ['gpt-4.1-nano', 'gpt-4.1-mini'],

  // Maximum tokens per AI request
  MAX_TOKENS_PER_REQUEST: 1500,

  // Maximum response length
  MAX_RESPONSE_LENGTH: 300, // words

  // --- Duck Currency & Content Specific Limits for Free Tier ---
  MONTHLY_DUCK_ALLOCATION: 0, // Minimal or no monthly Duck allocation
  DAILY_DUCK_BONUS: 0, // No daily bonus for free users
  MAX_CAST_MEMBERS: 3, // Restricted to 3 cast members
  MAX_PROTOCOLS: 3, // Restricted to 3 protocols
};

/**
 * Core tier limits (previously Premium)
 */
export const CORE_TIER_LIMITS = {
  // Maximum number of templates a core user can save (unlimited for practical purposes)
  MAX_TEMPLATES: Infinity,

  // Maximum daily AI generations for core users (unlimited)
  DAILY_AI_GENERATIONS: Infinity,

  // Access to AI models (including advanced models)
  AI_MODELS: ['gpt-4.1-nano', 'gpt-4.1-mini', 'gpt-4.1'],

  // Maximum tokens per AI request
  MAX_TOKENS_PER_REQUEST: 4000,

  // Maximum response length
  MAX_RESPONSE_LENGTH: 3000, // words

  // --- Duck Currency & Content Specific Limits for Core Tier ---
  MONTHLY_DUCK_ALLOCATION: 4500, // 4,500 Ducks/month
  DAILY_DUCK_BONUS: 20, // 20 Ducks/day for paid users
  MAX_CAST_MEMBERS: 50, // High but not unlimited, for soft limits
  MAX_PROTOCOLS: 50, // High but not unlimited, for soft limits
};

/**
 * Pro tier limits
 */
export const PRO_TIER_LIMITS = {
  // Maximum number of templates a pro user can save (unlimited)
  MAX_TEMPLATES: Infinity,

  // Maximum daily AI generations for pro users (unlimited)
  DAILY_AI_GENERATIONS: Infinity,

  // Access to AI models (including all advanced models)
  AI_MODELS: ['gpt-4.1-nano', 'gpt-4.1-mini', 'gpt-4.1'], // Example for most advanced model

  // Maximum tokens per AI request
  MAX_TOKENS_PER_REQUEST: 8000, // Higher limit

  // Maximum response length
  MAX_RESPONSE_LENGTH: 6000, // Higher limit

  // --- Duck Currency & Content Specific Limits for Pro Tier ---
  MONTHLY_DUCK_ALLOCATION: 10000, // Higher Duck quota (example value)
  DAILY_DUCK_BONUS: 20, // Same daily bonus as Core
  MAX_CAST_MEMBERS: Infinity, // Unlimited cast members
  MAX_PROTOCOLS: Infinity, // Unlimited protocols
};

// Define the type for supported tiers
export type SubscriptionTier = 'trial' | 'core' | 'pro';

/**
 * Get subscription limits based on subscription tier
 */
export const getSubscriptionLimits = (tier: SubscriptionTier) => {
  switch (tier) {
    case 'trial':
      return TRIAL_TIER_LIMITS;
    case 'core':
      return CORE_TIER_LIMITS;
    case 'pro':
      return PRO_TIER_LIMITS;
    default:
      // Fallback to free tier or throw an error for unrecognised tier
      return TRIAL_TIER_LIMITS;
  }
};

/**
 * Check if a user is within their template limit
 */
export const isWithinTemplateLimit = (tier: SubscriptionTier, templateCount: number): boolean => {
  const limits = getSubscriptionLimits(tier);
  return templateCount < limits.MAX_TEMPLATES;
};

/**
 * Check if a user is within their daily AI generation limit
 */
export const isWithinDailyAILimit = (tier: SubscriptionTier, dailyUsageCount: number): boolean => {
  const limits = getSubscriptionLimits(tier);
  return dailyUsageCount < limits.DAILY_AI_GENERATIONS;
};

/**
 * Check if a user has access to a specific AI model
 */
export const hasAccessToModel = (tier: SubscriptionTier, modelName: string): boolean => {
  const limits = getSubscriptionLimits(tier);
  return limits.AI_MODELS.includes(modelName);
};

// New helper functions for content limits (Cast Members, Protocols)
/**
 * Check if a user is within their cast member limit
 */
export const isWithinCastMemberLimit = (
  tier: SubscriptionTier,
  castMemberCount: number
): boolean => {
  const limits = getSubscriptionLimits(tier);
  return castMemberCount < limits.MAX_CAST_MEMBERS;
};

/**
 * Check if a user is within their protocol limit
 */
export const isWithinProtocolLimit = (tier: SubscriptionTier, protocolCount: number): boolean => {
  const limits = getSubscriptionLimits(tier);
  return protocolCount < limits.MAX_PROTOCOLS;
};
