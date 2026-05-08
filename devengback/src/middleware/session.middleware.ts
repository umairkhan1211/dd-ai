import { Request, Response, NextFunction } from 'express';
import { UserSessionService } from '../services/user-session.service';
import logger from '../utils/logger';

export const updateSessionActivity = async (req: Request, res: Response, next: NextFunction) => {
  if (req.sessionID && req.user) {
    try {
      await UserSessionService.updateSessionActivity(req.sessionID);
    } catch (err) {
      logger.error(`Error updating session activity: ${err}`);
    }
  }
  next();
};
