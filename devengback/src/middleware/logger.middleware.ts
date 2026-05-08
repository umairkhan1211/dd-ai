import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * HTTP request logger middleware
 * Logs information about each incoming request and its response
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = new Date().getTime();
  
  logger.http(`${req.method} ${req.url} ${req.ip}`);
  
  res.on('finish', () => {
    const duration = new Date().getTime() - start;
    const { statusCode } = res;
    if (statusCode >= 500) {
      logger.error(`${req.method} ${req.url} ${statusCode} ${duration}ms`);
    } else if (statusCode >= 400) {
      logger.warn(`${req.method} ${req.url} ${statusCode} ${duration}ms`);
    } else {
      logger.http(`${req.method} ${req.url} ${statusCode} ${duration}ms`);
    }
  });
  
  next();
};

export default requestLogger; 