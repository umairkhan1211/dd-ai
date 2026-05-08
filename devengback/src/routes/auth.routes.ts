import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);

// Simple Signup and Signin
router.post('/signup', authController.signup);

router.post('/signin', authController.signin);

router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);

// Logout route
router.post('/logout', requireAuth, authController.logoutUser); // Changed to POST as it changes state

export default router;
