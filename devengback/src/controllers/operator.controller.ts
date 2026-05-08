import { Request, Response } from 'express';
import { Operator, User } from '../models';
import logger from '../utils/logger';
import { IOperator } from '../models/Operator';
import { IUser } from '../models/User';

export const createOperator = async (req: Request, res: Response) => {
  const { label, profile } = req.body;
  const userId = (req.user as IUser)?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!label || !profile) {
    res.status(400).json({ error: 'Label and profile are required' });
    return;
  }

  try {
    const operator = await Operator.create({
      userId,
      label,
      profile,
    });

    const userInstance = await User.findByPk(userId);
    if (userInstance && !userInstance.activeOperator) {
      userInstance.activeOperator = operator.id;
      await userInstance.save();
    }

    res.status(201).json(operator);
  } catch (error) {
    logger.error('Error creating operator:', error);
    res.status(500).json({ error: 'Failed to create operator' });
  }
};

// Get all operators for the current user
export const getOperators = async (req: Request, res: Response): Promise<void> => {
  const userId = (req.user as IUser)?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const operators = await Operator.findAll({ where: { userId } });
    res.status(200).json(operators);
  } catch (error) {
    logger.error('Error fetching operators:', error);
    res.status(500).json({ error: 'Failed to fetch operators' });
  }
};

// Update an operator
export const updateOperator = async (req: Request, res: Response): Promise<void> => {
  const { operatorId } = req.params;
  const { label, profile } = req.body;
  const userId = (req.user as IUser)?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!label && !profile) {
    res.status(400).json({ error: 'Either label or profile must be provided for update' });
    return;
  }

  try {
    const operator = await Operator.findOne({ where: { id: operatorId, userId } });

    if (!operator) {
      res.status(404).json({ error: 'Operator not found or access denied' });
      return;
    }

    if (label) operator.label = label;
    if (profile) operator.profile = profile;

    await operator.save();
    res.status(200).json(operator);
  } catch (error) {
    logger.error('Error updating operator:', error);
    res.status(500).json({ error: 'Failed to update operator' });
  }
};

// Delete an operator
export const deleteOperator = async (req: Request, res: Response): Promise<void> => {
  const { operatorId } = req.params;
  const userId = (req.user as IUser)?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const operator = await Operator.findOne({ where: { id: operatorId, userId } });

    if (!operator) {
      res.status(404).json({ error: 'Operator not found or access denied' });
      return;
    }

    await operator.destroy();

    const userInstance = await User.findByPk(userId);
    if (userInstance && userInstance.activeOperator === operatorId) {
      userInstance.activeOperator = undefined; // Use undefined for nullable UUID field
      await userInstance.save();
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting operator:', error);
    res.status(500).json({ error: 'Failed to delete operator' });
  }
};

// Set an operator as active for the user
export const setActiveOperator = async (req: Request, res: Response): Promise<void> => {
  const { operatorId } = req.params;
  const userId = (req.user as IUser)?.id;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const operatorToActivate = await Operator.findOne({ where: { id: operatorId, userId } });
    if (!operatorToActivate) {
      res.status(404).json({ error: 'Operator not found or not owned by user' });
      return;
    }

    const userInstance = await User.findByPk(userId);
    if (!userInstance) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    userInstance.activeOperator = operatorToActivate.id;
    await userInstance.save();

    // Fetch the user again to include the populated activeOperatorDetail
    // The `activeOperatorDetail` should be accessible as a property on the User instance due to the association
    const updatedUser = await User.findByPk(userId, {
        include: [{ model: Operator, as: 'activeOperatorDetail' }]
    });

    // Accessing the included association data
    // Sequelize typically adds a property with the alias name if the include is successful.
    // We need to cast updatedUser to a type that acknowledges this dynamic property.
    const responseUser = updatedUser as (User & { activeOperatorDetail?: IOperator });

    res.status(200).json({ message: 'Active operator updated', activeOperator: responseUser?.activeOperatorDetail || null });

  } catch (error) {
    logger.error('Error setting active operator:', error);
    res.status(500).json({ error: 'Failed to set active operator' });
  }
}; 