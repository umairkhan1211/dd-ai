import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import aiModelController from '../controllers/aimodel.controller';

const router = Router();

// All AI model routes require authentication
router.use(requireAuth);

/**
 * @route GET /api/ai-models
 * @desc Get all active AI models available for selection
 * @access Private
 */
router.get('/', aiModelController.getAvailableModels);

/**
 * @route GET /api/ai-models/:id
 * @desc Get specific AI model by ID
 * @access Private
 */
router.get('/:id', aiModelController.getModelById);

export default router;
