import passport from 'passport';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import * as AuthService from '../services/auth.service';
import { UserSessionService } from '../services/user-session.service';
import { User } from '../models';
import { VerificationService } from '../services/verification.service';

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const LOGIN_SUCCESS_REDIRECT = `${FRONTEND_URL}/dashboard`;
const LOGIN_FAILURE_REDIRECT = `${FRONTEND_URL}/login?error=true`;
const MAX_USERS = 20; // Maximum number of users allowed for signup ( Added for Beta launch )

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  passport.authenticate('google', async (err: any, user: any, info: any) => {
    if (err) {
      logger.error(`Error in Google auth callback: ${err}`);
      res.redirect(LOGIN_FAILURE_REDIRECT);
      return;
    }

    if (!user) {
      logger.error('No user returned from Google auth');
      res.redirect(LOGIN_FAILURE_REDIRECT);
      return;
    }

    try {
      if (!user.isVerified) {
        res.status(403).json({
          message: 'Email not verified',
          requiresVerification: true,
          email: user.email,
          verificationType: 'otp',
        });

        return;
      }

      await UserSessionService.createUserSession(req, user.id);
      req.login(user, loginErr => {
        if (loginErr) {
          logger.error(`Login error: ${loginErr}`);
          res.redirect(LOGIN_FAILURE_REDIRECT);
          return;
        }
        res.redirect(LOGIN_SUCCESS_REDIRECT);
      });
    } catch (sessionErr) {
      logger.error(`Session creation error: ${sessionErr}`);
      res.redirect(LOGIN_FAILURE_REDIRECT);
    }
  })(req, res, next);
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;
    // Check the total number of users
    const userCount = await User.count();
    logger.info(`Current user count: ${userCount}`);
    if (userCount >= MAX_USERS) {
      logger.warn('User registration limit reached');
      res.status(403).json({ message: 'User limit reached' });
      return;
    }
    const user = await AuthService.signupWithEmail(email, name, password);

    res.status(201).json({
      message: 'Account created. Please verify your email.',
      requiresVerification: true,
      email: user.email,
      verificationType: 'otp',
    });

    // await UserSessionService.createUserSession(req, user.id);
    // req.login(user, err => {
    //   if (err) {
    //     logger.error(`Login after signup failed: ${err}`);
    //     res.status(500).json({ message: 'Signup succeeded, but login failed' });
    //     return;
    //   }
    //   res.status(201).json({ message: 'Signup successful', user });
    // });
  } catch (error: any) {
    logger.error(`Signup error: ${error}`);
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
  }
};

export const signin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  passport.authenticate('local', async (err: any, user: any, info: any) => {
    if (err) {
      logger.error(`Authentication error: ${err}`);
      res.status(500).json({ message: 'Authentication error' });
      return;
    }
    if (!user) {
      res.status(401).json({ message: info?.message || 'Invalid credentials' });
      return;
    }

    if (!user.isVerified) {
      await VerificationService.createAndSendVerificationToken(user);

      res.status(403).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
        verificationType: 'otp',
      });
      return;
    }

    try {
      await UserSessionService.createUserSession(req, user.id);
      req.login(user, loginErr => {
        if (loginErr) {
          logger.error(`Login error: ${loginErr}`);
          res.status(500).json({ message: 'Login failed' });
          return;
        }
        res.status(200).json({ message: 'Login successful', user });
      });
    } catch (sessionErr) {
      logger.error(`Session creation error: ${sessionErr}`);
      res.status(500).json({ message: 'Session creation failed' });
    }
  })(req, res, next);
};

// Verify OTP endpoint
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const user = await VerificationService.verifyOtp(email, otp);

    await UserSessionService.createUserSession(req, user.id);
    req.login(user, loginErr => {
      if (loginErr) {
        logger.error(`Login after OTP verification failed: ${loginErr}`);
        res.status(500).json({
          message: 'Verification successful but login failed',
        });
        return;
      }

      res.status(200).json({
        message: 'Email verified successfully',
        user,
      });
    });
  } catch (error) {
    logger.error(`OTP verification error: ${error}`);
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Invalid OTP',
    });
  }
};

//  Resend OTP endpoint
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    await VerificationService.resendVerificationToken(email);

    res.status(200).json({
      message: 'Verification code resent',
      requiresVerification: true,
      email,
      verificationType: 'otp',
    });
  } catch (error) {
    logger.error(`Resend OTP error: ${error}`);
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to resend verification code',
    });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.sessionID) {
      await UserSessionService.endSession(req.sessionID);
    }
    req.logout(err => {
      if (err) {
        logger.error(`Logout error: ${err}`);
        res.status(500).json({ message: 'Error logging out' });
        return;
      }
      res.status(200).json({ message: 'Successfully logged out' });
    });
  } catch (err) {
    logger.error(`Logout session error: ${err}`);
    res.status(500).json({ message: 'Error logging out' });
  }
};
