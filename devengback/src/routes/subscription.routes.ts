import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { ensureBillingAccess } from '../middleware/billing.middleware';

const router = Router();
// All routes require authentication
router.use(requireAuth);

// Create checkout session
router.post('/create-checkout-session', subscriptionController.createCheckoutSession);

// Get user's subscription status
router.get('/status', subscriptionController.getSubscriptionStatus);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Debug subscription details
router.get('/debug/:subscriptionId', subscriptionController.debugSubscription);

// Update subscription end date (utility endpoint for fixing missing end dates)
router.post('/update-end-date', ensureBillingAccess, subscriptionController.updateSubscriptionEndDate);

// Fix specific subscription end date manually (admin utility)
router.post('/fix-end-date', ensureBillingAccess, subscriptionController.fixSubscriptionEndDate);

router.get('/payment-history', subscriptionController.getPaymentHistory);

// Stripe webhook - handled in index.ts with raw body parsing
// We'll remove this since we're handling it directly in index.ts
// router.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   subscriptionController.handleWebhook
// );

export default router;
