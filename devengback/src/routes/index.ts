import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import subscriptionRoutes from './subscription.routes';
import usageRoutes from './usage.routes';
import sessionRoutes from './session.routes';
import protocolRoutes from './protocol.routes';
import operatorRoutes from './operator.routes';
import castRoutes from './cast.routes';
import walletRoutes from './wallet.routes';
import healthRoutes from './health.routes';
import billingRoutes from './billing.routes';
import aiModelRoutes from './aimodel.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/usage', usageRoutes);
router.use('/sessions', sessionRoutes);
router.use('/protocols', protocolRoutes);
router.use('/operators', operatorRoutes);
router.use('/cast', castRoutes);
router.use('/wallet', walletRoutes);
router.use('/billing', billingRoutes);
router.use('/ai-models', aiModelRoutes);
router.use('/health', healthRoutes);

export default router;
