import { Router } from 'express';
import { getUserWalletStats } from '../controllers/wallet.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { ensureBillingAccess } from '../middleware/billing.middleware';

const router = Router();

router.use(requireAuth);

// Route to get the authenticated user's wallet and usage stats
// Protect this route with your authentication middleware
router.get('/', ensureBillingAccess, getUserWalletStats);

export default router;
