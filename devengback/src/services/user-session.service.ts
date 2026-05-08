import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import UserSession from '../models/UserSession';
import logger from '../utils/logger';

export class UserSessionService {
  static async createUserSession(req: Request, userId: string) {
    try {
      const sessionId = req.sessionID || uuidv4();
      const ipAddress = req.ip || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      const session = await UserSession.create({
        id: uuidv4(),
        userId,
        sessionId,
        ipAddress,
        userAgent,
        startedAt: new Date(),
        lastActivity: new Date(),
        active: true,
      });

      logger.debug(`Created session for user ${userId}: ${sessionId}`);
      return session;
    } catch (err) {
      logger.error(`Error creating session: ${err}`);
      throw err;
    }
  }

  static async updateSessionActivity(sessionId: string) {
    try {
      const session = await UserSession.findOne({ where: { sessionId, active: true } });
      if (session) {
        await session.update({ lastActivity: new Date() });
        logger.debug(`Updated last activity for session: ${sessionId}`);
      }
    } catch (err) {
      logger.error(`Error updating session activity: ${err}`);
    }
  }

  static async endSession(sessionId: string) {
    try {
      const session = await UserSession.findOne({ where: { sessionId, active: true } });
      if (session) {
        await session.update({ active: false });
        logger.debug(`Ended session: ${sessionId}`);
      }
    } catch (err) {
      logger.error(`Error ending session: ${err}`);
    }
  }
}
