import { Request, Response } from 'express';
import protocolService, {
  CreateProtocolData,
  UpdateProtocolData,
} from '../services/protocol.service';
import logger from '../utils/logger';
import { IUser } from '../models/User';
import {
  ApiError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from '../utils/api-errors'; // Import custom errors

class ProtocolController {
  async getAllProtocols(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as IUser)?.id;
      const protocols = await protocolService.getAll(userId);
      res.status(200).json(protocols);
    } catch (error) {
      logger.error('Error in getAllProtocols controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: 'Failed to retrieve protocols',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }

  async getProtocolById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const protocol = await protocolService.getById(id);
      if (protocol) {
        res.status(200).json(protocol);
      } else {
        throw new NotFoundError(`Protocol with ID ${id} not found`); // Use NotFoundError
      }
    } catch (error) {
      logger.error(`Error in getProtocolById controller for ID ${req.params.id}:`, error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: 'Failed to retrieve protocol',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }

  async createProtocol(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as IUser)?.id;
      if (!userId) {
        // Ensure userId exists for the limit check
        throw new BadRequestError('User ID is required for protocol creation.');
      }

      const protocolData: CreateProtocolData = {
        ...req.body,
        userId: userId,
      };

      // Validate required fields
      const { name, description, level, type, promptTemplate, aiModelId } = protocolData;
      if (!name || !description || !level || !type || !promptTemplate) {
        throw new BadRequestError(
          'Missing required fields: name, description, level, type, and promptTemplate are required'
        );
      }

      if (!aiModelId) {
        throw new BadRequestError(
          'AI Model selection is required. Please select an AI model for this protocol.'
        );
      }

      // Validate level
      if (![1, 2, 3].includes(level)) {
        throw new BadRequestError('Level must be 1, 2, or 3');
      }

      // Validate type
      if (!['static', 'semi-dynamic', 'compositional'].includes(type)) {
        throw new BadRequestError('Type must be static, semi-dynamic, or compositional');
      }

      const protocol = await protocolService.create(protocolData);
      res.status(201).json(protocol);
    } catch (error) {
      logger.error('Error in createProtocol controller:', error);
      if (error instanceof ApiError) {
        // Catch custom API errors
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: 'Failed to create protocol',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }

  async updateProtocol(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req.user as IUser)?.id;

      // Check if protocol exists and belongs to user
      const existingProtocol = await protocolService.getById(id);
      if (!existingProtocol) {
        throw new NotFoundError(`Protocol with ID ${id} not found`); // Use NotFoundError
      }

      // Check ownership (user can only update their own protocols or global ones if they're admin)
      if (existingProtocol.userId && existingProtocol.userId !== userId) {
        throw new ForbiddenError('You can only update your own protocols'); // Use ForbiddenError
      }

      const updateData: UpdateProtocolData = {
        id,
        ...req.body,
        userId: existingProtocol.userId, // Preserve the original userId
      };

      // Validate level if provided
      if (updateData.level && ![1, 2, 3].includes(updateData.level)) {
        throw new BadRequestError('Level must be 1, 2, or 3');
      }

      // Validate type if provided
      if (
        updateData.type &&
        !['static', 'semi-dynamic', 'compositional'].includes(updateData.type)
      ) {
        throw new BadRequestError('Type must be static, semi-dynamic, or compositional');
      }

      const protocol = await protocolService.update(updateData);
      if (protocol) {
        res.status(200).json(protocol);
      } else {
        throw new NotFoundError(`Protocol with ID ${id} not found`); // Use NotFoundError
      }
    } catch (error) {
      logger.error(`Error in updateProtocol controller for ID ${req.params.id}:`, error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: 'Failed to update protocol',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }

  async deleteProtocol(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req.user as IUser)?.id;

      // Check if protocol exists and belongs to user
      const existingProtocol = await protocolService.getById(id);
      if (!existingProtocol) {
        throw new NotFoundError(`Protocol with ID ${id} not found`); // Use NotFoundError
      }

      // Check ownership (user can only delete their own protocols)
      if (existingProtocol.userId && existingProtocol.userId !== userId) {
        throw new ForbiddenError('You can only delete your own protocols'); // Use ForbiddenError
      }

      const success = await protocolService.delete(id);
      if (success) {
        res.status(200).json({ message: 'Protocol deleted successfully' });
      } else {
        throw new NotFoundError(`Protocol with ID ${id} not found`); // Use NotFoundError
      }
    } catch (error) {
      logger.error(`Error in deleteProtocol controller for ID ${req.params.id}:`, error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: 'Failed to delete protocol',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }

  async getProtocolsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const userId = (req.user as IUser)?.id;
      const protocols = await protocolService.getByCategory(category, userId);
      res.status(200).json(protocols);
    } catch (error) {
      logger.error(
        `Error in getProtocolsByCategory controller for category ${req.params.category}:`,
        error
      );
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: 'Failed to retrieve protocols by category',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }

  async getProtocolsByLevel(req: Request, res: Response): Promise<void> {
    try {
      const { level } = req.params;
      const userId = (req.user as IUser)?.id;
      const levelNum = parseInt(level) as 1 | 2 | 3;

      if (![1, 2, 3].includes(levelNum)) {
        throw new BadRequestError('Level must be 1, 2, or 3'); // Use BadRequestError
      }

      const protocols = await protocolService.getByLevel(levelNum, userId);
      res.status(200).json(protocols);
    } catch (error) {
      logger.error(`Error in getProtocolsByLevel controller for level ${req.params.level}:`, error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({
          message: 'Failed to retrieve protocols by level',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }
}

export default new ProtocolController();
