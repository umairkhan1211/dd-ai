import { Request, Response } from 'express';
import { BillingService } from '../services/billing.service';
import logger from '../utils/logger';
import { User } from '../models';

/**
 * Get the current user's wallet and usage statistics.
 * Requires user to be authenticated (req.user should be available).
 */
export const getUserWalletStats = async (req: Request, res: Response) => {
  // Ensure user is authenticated and userId is available
  const userId = (req.user as User)?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const userStats = await BillingService.getUserUsageStats(userId);
    logger.info(`Fetched wallet stats for user: ${userId}`);
    res.status(200).json(userStats);
  } catch (error: any) {
    logger.error(`Error fetching wallet stats for user ${userId}: ${error.message}`, error);
    res
      .status(500)
      .json({ message: 'Failed to retrieve wallet information.', error: error.message });
  }
};
