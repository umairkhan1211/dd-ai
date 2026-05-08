import { Router } from 'express';
import * as operatorController from '../controllers/operator.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { ensureBillingAccess } from '../middleware/billing.middleware';

const router = Router();
router.use(requireAuth);


// POST /api/operators - Create a new operator
router.post('/', ensureBillingAccess, operatorController.createOperator);

// GET /api/operators - Get all operators for the current user
router.get('/', ensureBillingAccess, operatorController.getOperators);

// PUT /api/operators/:operatorId - Update an operator
router.put('/:operatorId', ensureBillingAccess, operatorController.updateOperator);

// DELETE /api/operators/:operatorId - Delete an operator
router.delete('/:operatorId', ensureBillingAccess, operatorController.deleteOperator);

// PUT /api/operators/active/:operatorId - Set an operator as active
router.put('/active/:operatorId', ensureBillingAccess, operatorController.setActiveOperator);

export default router;
