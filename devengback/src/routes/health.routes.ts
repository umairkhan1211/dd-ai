import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint for ECS load balancer
 * Returns 200 OK with basic system information
 */
router.get('/', (req: Request, res: Response) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };

  res.status(200).json(healthCheck);
});

/**
 * Detailed health check with database connectivity
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
      },
      database: {
        status: 'checking...'
      }
    };

    // Add database health check if you have a database connection
    // Example with PostgreSQL:
    // try {
    //   await pool.query('SELECT 1');
    //   healthCheck.database.status = 'connected';
    // } catch (error) {
    //   healthCheck.database.status = 'disconnected';
    //   healthCheck.database.error = error.message;
    // }

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
