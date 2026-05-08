import { Request, Response } from 'express';
import { BillingService } from '../services/billing.service';
import { IUser } from '../models/User';
import logger from '../utils/logger';

class BillingController {
  /**
   * GET /api/billing/status
   * Get current user's billing status
   */
  async getBillingStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as IUser)?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const billingStatus = await BillingService.getBillingStatusForUser(userId);
      res.json(billingStatus);
    } catch (error) {
      logger.error(`Error in getBillingStatus controller:`, error);
      res.status(500).json({
        error: 'Failed to fetch billing status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new BillingController();
