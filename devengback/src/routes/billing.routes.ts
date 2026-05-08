import { Router } from 'express';
import billingController from '../controllers/billing.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/billing/status
 * Get current user's billing status
 */
router.get('/status', billingController.getBillingStatus);

export default router;
 