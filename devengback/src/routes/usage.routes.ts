import { Router } from 'express';
import * as usageController from '../controllers/usage.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all usage routes
router.use(requireAuth);

// Get user's usage statistics and limits
router.get('/stats', usageController.getUserUsageStats);

// Check if user can create a new template
router.get('/check-template-limit', usageController.checkTemplateLimit);

// Check if user can generate AI content
router.get('/check-ai-limit', usageController.checkAIGenerationLimit);

// Increment AI usage count
// router.post('/increment-ai-usage', usageController.incrementAIUsage);

// Check model access
router.get('/check-model-access/:modelName', usageController.checkModelAccess);

export default router;
