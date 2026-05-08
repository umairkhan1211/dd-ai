import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import passport from './config/passport';
import connectDB from './db';
import router from './routes';
import { handleStripeWebhook } from './utils/webhookHandler';
import cors from 'cors';
import logger from './utils/logger';
import requestLogger from './middleware/logger.middleware';
// import vectorStore from './services/vector-store.service';
// import memory from './services/memory.service';
import systemPromptService from './services/ai/system-prompt.service';
import sessionMiddleware from './config/session';
import { updateSessionActivity } from './middleware/session.middleware';
import path from 'path';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
connectDB();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';


app.use(
  cors({
    origin: function (origin, callback) {
      // Localhost aur aapka main Frontend URL hamesha allow honge
      const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'];

      // Agar origin allowed list mein hai ya Vercel ka koi bhi sub-domain hai
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  })
);

app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  logger.info('⚡ Stripe webhook received');
  handleStripeWebhook(req, res).catch(err => {
    logger.error(`Unhandled error in webhook handler: ${err}`);
    if (!res.headersSent) {
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  });
});

app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(updateSessionActivity);

app.use(express.static(path.join(__dirname, '../public')));
app.use(router);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Deviation Engine Backend API is running.' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Global error: ${err.message}`);
  logger.debug(err.stack || '');
  res.status(500).json({ message: 'Something went wrong on the server!', error: err.message });
});

const { version } = require('../package.json');

(async () => {
  try {
    // await vectorStore.init();
    // logger.info('Vector store service initialized successfully.');
    // logger.info('Embedder service initialized successfully.');
    // await memory.init();
    // logger.info('Memory service initialized successfully.');
    await systemPromptService.init();
    logger.info('System prompt service initialized successfully.');
  } catch (error) {
    logger.error('Unable to initialize services:', error);
  }
})();

app.listen(port, () => {
  logger.info(`=================================`);
  logger.info(`Server v${version} started on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`=================================`);
});
