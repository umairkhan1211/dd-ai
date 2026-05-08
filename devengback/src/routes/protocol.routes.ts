import { Router } from 'express';
import protocolController from '../controllers/protocol.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { ensureBillingAccess } from '../middleware/billing.middleware';

const router = Router();
router.use(requireAuth);

// Get all protocols (public access for global protocols, authenticated for user-specific)
router.get('/', ensureBillingAccess,protocolController.getAllProtocols);

// Get a single protocol by ID
router.get('/:id',ensureBillingAccess, protocolController.getProtocolById);

// Get protocols by category
router.get('/category/:category', ensureBillingAccess,protocolController.getProtocolsByCategory);

// Get protocols by level
router.get('/level/:level', ensureBillingAccess,protocolController.getProtocolsByLevel);

// Create a new protocol
router.post('/', ensureBillingAccess, protocolController.createProtocol);

// Update a protocol
router.put('/:id', ensureBillingAccess, protocolController.updateProtocol);

// Delete a protocol
router.delete('/:id', ensureBillingAccess, protocolController.deleteProtocol);

export default router;
