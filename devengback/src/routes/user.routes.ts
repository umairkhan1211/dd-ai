import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { ensureBillingAccess } from '../middleware/billing.middleware';

const router = Router();

// Debug route for authentication issues
router.get('/me', userController.getMe);
// Get authentication status
router.get('/auth/status', userController.getAuthStatus);

router.use(requireAuth);

// Get current user profile
router.get('/profile', userController.getUserProfile);

router.put('/me', ensureBillingAccess, userController.updateUser);

export default router;
