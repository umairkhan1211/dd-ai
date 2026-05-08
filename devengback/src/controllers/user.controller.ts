import { Request, Response } from 'express';
import { IUser } from '../models/User'; // Import IUser explicitly
import { UserService } from '../services/user.service';
import logger from '../utils/logger';

export const getUserProfile = (req: Request, res: Response) => {
  // ... (can add similar logging if needed later)
  if (req.isAuthenticated()) {
    // Explicitly cast req.user as IUser
    const user = req.user as IUser;
    // Now destructure from user instead of directly from req.user
    const { googleId, displayName, email, image, firstName, lastName, activeOperator } = user;
    res.json({ googleId, displayName, email, image, firstName, lastName, activeOperator });
  } else {
    res.status(401).json({ message: 'Unauthorized: Not logged in' });
  }
};

export const getAuthStatus = (req: Request, res: Response) => {
  // First check if we have a session at all
  if (!req.session || !req.sessionID) {
    res.json({ isAuthenticated: false, user: null });
    return;
  }

  // Check for passport-specific session data
  const passportSessionUser = (req.session as any)?.passport?.user;

  // No passport session means no authentication
  if (!passportSessionUser) {
    res.json({ isAuthenticated: false, user: null });
    return;
  }

  // Must have both a session and a verified user from that session
  const isAuthenticated = req.isAuthenticated() && !!req.user;

  const finalPassportSessionUser = (req.session as any)?.passport?.user;

  if (isAuthenticated && req.user) {
    const user = req.user as IUser;
    res.json({
      isAuthenticated: true,
      user: {
        googleId: user.googleId,
        displayName: user.displayName,
        email: user.email,
        image: user.image,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const sessionUser = req.user as IUser;
    if (!sessionUser) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const updatedUser = await UserService.updateUser(sessionUser.id, req.body);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ message: (error as Error).message });
  }
};

export const debugAuth = (req: Request, res: Response) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('Cookies:', req.cookies);
  console.log('Headers:', req.headers);
  console.log('Is Authenticated:', req.isAuthenticated());
  console.log('User:', req.user);

  res.json({
    sessionId: req.sessionID,
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    passportSession: (req.session as any)?.passport,
    hasCookies: !!req.headers.cookie,
    hasSessionCookie: req.headers.cookie?.includes('connect.sid'),
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if session exists at all
    if (!req.session || !req.sessionID) {
      res.status(401).json({
        authenticated: false,
        message: 'No session',
      });
      return;
    }

    // Check if passport session exists
    const passportUser = (req.session as any)?.passport?.user;
    if (!passportUser) {
      res.status(401).json({
        authenticated: false,
        message: 'No passport user in session',
      });
      return;
    }

    // Try to deserialize user — but catch errors gracefully
    try {
      // Manually try to find user — don't rely on req.user
      const user = await req.app.get('sequelize').models.User.findByPk(passportUser);

      if (!user) {
        res.status(404).json({
          authenticated: false,
          message: 'User not found in database',
        });
        return;
      }

      // If user exists but not verified
      if (!user.isVerified) {
        res.status(403).json({
          authenticated: true,
          isVerified: false,
          requiresVerification: true,
          email: user.email,
          message: 'Email not verified',
        });
        return;
      }

      // Fully authenticated and verified
      res.status(200).json({
        authenticated: true,
        isVerified: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (dbError) {
      // Database error — user might be in session but not in DB
      res.status(404).json({
        authenticated: false,
        message: 'User record not found',
      });
      return;
    }
  } catch (error) {
    // Only log actual server errors
    logger.error('Unexpected error in /me endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      authenticated: false,
    });
  }
};
