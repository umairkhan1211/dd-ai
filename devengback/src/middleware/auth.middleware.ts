import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 * Reusable across different routes that require authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized: Not logged in' });
};
