import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { ensureBillingAccess } from '../middleware/billing.middleware';
import { processAvatar } from '../middleware/avatar.middleware';

export const router = Router();

// All routes require authentication
router.use(requireAuth);

// Create a new chat session
router.post('/', ensureBillingAccess, processAvatar, sessionController.createSession);

// List user's chat sessions
router.get('/',ensureBillingAccess, sessionController.listSessions);

// Send a message to a chat session (with streaming response)
router.post('/:id/messages', ensureBillingAccess, sessionController.addMessage);

// Get paginated message history for a chat session
router.get('/:id/messages',ensureBillingAccess, sessionController.getMessages);

// Fork/branch a chat session
router.post('/:id/fork', ensureBillingAccess, sessionController.forkSession);

// Get a single chat session
router.get('/:id', ensureBillingAccess,sessionController.getSession);

// Update a chat session
router.put('/:id', ensureBillingAccess, processAvatar, sessionController.updateSession);

// Delete a chat session
router.delete('/:id', ensureBillingAccess, sessionController.deleteSession);

export default router;
