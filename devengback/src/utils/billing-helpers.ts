interface IDuckAllowanceConfig {
  initialDucks: number; // Ducks granted when a new wallet is created for this tier
  monthlyQuota: number; // Ducks granted monthly
  dailyBonus: number; // Ducks granted daily on login
  costPerToken: number; // Cost in Ducks per token (input or output)
  aiImageGenerationCost: number; // Flat cost for image generation
  taskStartCost: number; // Cost for starting tasks
  castCreateCost: number; // Cost for creating casts
  protocolCreateCost: number; // Base cost for creating protocols
  protocolUseCost: { min: number; max: number }; // Cost range for using protocols
}

interface IContentLimitsConfig {
  maxCastMembersLimit: number; // Max number of cast members a user can create
  maxProtocolsLimit: number; // Max number of protocols a user can create
  restrictedProtocolLevels: number[]; // Protocol levels restricted for the tier
}

interface ITierConfig {
  name: string;
  duckAllowance: IDuckAllowanceConfig;
  contentLimits: IContentLimitsConfig;
  modelAccess: string[]; // Array of AI model names accessible by this tier
}

// --- TIER DEFINITIONS ---

export const TRIAL_TIER_LIMITS: ITierConfig = {
  name: 'trial',
  duckAllowance: {
    initialDucks: 20,
    monthlyQuota: 0,
    dailyBonus: 0,
    costPerToken: 0.0154, // 1 Duck = 500 tokens
    aiImageGenerationCost: 10,
    taskStartCost: 0.02,
    castCreateCost: 12,
    protocolCreateCost: 4,
    protocolUseCost: { min: 4, max: 8 },
  },
  contentLimits: {
    maxCastMembersLimit: 3,
    maxProtocolsLimit: 3,
    restrictedProtocolLevels: [2, 3],
  },
  modelAccess: ['gpt-4o-mini', 'gemini-pro'],
};

export const CORE_TIER_LIMITS: ITierConfig = {
  name: 'core',
  duckAllowance: {
    initialDucks: 1500,
    monthlyQuota: 1500,
    dailyBonus: 20,
    costPerToken: 0.0154,
    aiImageGenerationCost: 10,
    taskStartCost: 0.02,
    castCreateCost: 12,
    protocolCreateCost: 4,
    protocolUseCost: { min: 4, max: 8 },
  },
  contentLimits: {
    maxCastMembersLimit: 30, // Soft limit
    maxProtocolsLimit: 30, // Soft limit
    restrictedProtocolLevels: [],
  },
  modelAccess: ['gpt-4o-mini'],
};

export const PRO_TIER_LIMITS: ITierConfig = {
  name: 'pro',
  duckAllowance: {
    initialDucks: 100,
    monthlyQuota: 10000, // TBD, set to 10,000
    dailyBonus: 20,
    costPerToken: 0.0154,
    aiImageGenerationCost: 10,
    taskStartCost: 0.02,
    castCreateCost: 12,
    protocolCreateCost: 4,
    protocolUseCost: { min: 4, max: 8 },
  },
  contentLimits: {
    maxCastMembersLimit: Infinity,
    maxProtocolsLimit: Infinity,
    restrictedProtocolLevels: [],
  },
  modelAccess: ['gpt-4o-mini'],
};

// --- HELPER FUNCTIONS ---

/**
 * Returns the full configuration for a given tier.
 */
export const getTierConfig = (tier: string): ITierConfig => {
  switch (tier) {
    case 'core':
      return CORE_TIER_LIMITS;
    case 'pro':
      return PRO_TIER_LIMITS;
    case 'trial':
      return TRIAL_TIER_LIMITS;
    default:
      return TRIAL_TIER_LIMITS;
  }
};

/**
 * Get duck allowance configuration for a specific tier.
 */
export const getDuckAllowanceByTier = (tier: string): IDuckAllowanceConfig => {
  return getTierConfig(tier).duckAllowance;
};

/**
 * Get content creation limits for a specific tier.
 */
export const getContentLimitsByTier = (tier: string): IContentLimitsConfig => {
  return getTierConfig(tier).contentLimits;
};

/**
 * Get AI model access list for a specific tier.
 */
export const getModelAccessByTier = (tier: string): string[] => {
  return getTierConfig(tier).modelAccess;
};

/**
 * Calculates the cost in Ducks for an interaction.
 *
 * @param tier The user's subscription tier.
 * @param totalTokens Total tokens for token-based interactions.
 * @param interactionType Type of interaction (e.g., 'chat', 'image_gen', 'task_start').
 * @param protocolLevel Protocol level for 'protocol_create' or 'protocol' (optional).
 * @returns The cost in Ducks.
 */
export const calculateCostInDucks = (
  tier: string,
  totalTokens: number,
  interactionType: string,
  protocolLevel?: number
): number => {
  const tierAllowance = getDuckAllowanceByTier(tier);

  switch (interactionType) {
    case 'image_gen':
      return tierAllowance.aiImageGenerationCost;
    case 'task_start':
      return tierAllowance.taskStartCost;
    case 'cast_create':
      return tierAllowance.castCreateCost;
    case 'protocol_create':
      return tierAllowance.protocolCreateCost + (protocolLevel ? (protocolLevel - 1) * 0.1 : 0);
    case 'protocol':
      let protocolCost = tierAllowance.protocolUseCost.min;

      if (protocolLevel && protocolLevel >= 1 && protocolLevel <= 3) {
        const range = tierAllowance.protocolUseCost.max - tierAllowance.protocolUseCost.min;
        protocolCost = tierAllowance.protocolUseCost.min + (range * (protocolLevel - 1)) / 2;
      }
      const tokenCost = totalTokens * tierAllowance.costPerToken;

      return tokenCost + protocolCost;
    default:
      return totalTokens * tierAllowance.costPerToken;
  }
};

/**
 * Grants daily login bonus if eligible.
 *
 * @param wallet The user wallet object.
 * @returns Number of Ducks granted.
 */
export const grantDailyBonus = (wallet: {
  tier: string;
  totalDucksAvailable: number;
  lastDailyBonusReset?: Date;
  dailyDuckBonusRemaining: number;
}): number => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tierAllowance = getDuckAllowanceByTier(wallet.tier);

  if (wallet.lastDailyBonusReset && wallet.lastDailyBonusReset >= todayStart) {
    return 0;
  }

  const bonus = tierAllowance.dailyBonus;
  wallet.totalDucksAvailable += bonus;
  wallet.dailyDuckBonusRemaining = bonus;
  wallet.lastDailyBonusReset = now;
  return bonus;
};

/**
 * Calculates rollover Ducks for the next month.
 *
 * @param unusedDucks Number of unused Ducks.
 * @param tier The user's subscription tier.
 * @returns Number of Ducks to roll over.
 */
export const calculateRollover = (unusedDucks: number, tier: string): number => {
  if (tier === 'trial') return 0;
  return unusedDucks * 0.4; // 40% of remaining Ducks roll over, no fixed cap
};

export const formatStripeStatus = (status: string | null): string => {
  if (!status) return 'Unknown';

  const statusMap: Record<string, string> = {
    requires_payment_method: 'Requires Payment Method',
    requires_confirmation: 'Requires Confirmation',
    requires_action: 'Requires Action',
    processing: 'Processing',
    requires_capture: 'Requires Capture',
    canceled: 'Canceled',
    succeeded: 'Succeeded',
    draft: 'Draft',
    open: 'Open',
    paid: 'Paid',
    uncollectible: 'Uncollectible',
    void: 'Voided',
  };

  if (statusMap[status]) return statusMap[status];

  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
