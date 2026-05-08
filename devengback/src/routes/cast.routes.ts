import { Router } from 'express';
import { CastController } from '../controllers/cast.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { processAvatar } from '../middleware/avatar.middleware';
import { ensureBillingAccess } from '../middleware/billing.middleware';

const router = Router();
const castController = new CastController();

router.use(requireAuth);

// POST /api/cast - Create a new cast member
router.post('/', ensureBillingAccess, processAvatar, castController.createCastMember.bind(castController));

// GET /api/cast - Get all cast members for the authenticated user
// (Controller method was getCastMembersByProject, now getCastMembers)
router.get('/', ensureBillingAccess, castController.getCastMembers.bind(castController));

// GET /api/cast/:castId - Get a specific cast member by ID
router.get('/:castId', ensureBillingAccess, castController.getCastMemberById.bind(castController));

// PUT /api/cast/:castId - Update a specific cast member
router.put('/:castId', ensureBillingAccess, processAvatar, castController.updateCastMember.bind(castController));

// DELETE /api/cast/:castId - Delete a specific cast member
router.delete('/:castId', ensureBillingAccess, castController.deleteCastMember.bind(castController));

export default router;
