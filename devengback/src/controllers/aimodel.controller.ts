import { Request, Response } from 'express';
import AIModel from '../models/AIModel';
import logger from '../utils/logger';
import { ApiError } from '../utils/api-errors';

export class AIModelController {
  /**
   * Get all active AI models available for selection
   */
  public async getAvailableModels(req: Request, res: Response): Promise<void> {
    try {
      const models = await AIModel.findAll({
        where: { isActive: true },
        attributes: [
          'id',
          'name',
          'displayName',
          'provider',
          'modelType',
          'maxTokens',
          'capabilities',
          'tierAccess',
          'description',
        ],
        order: [
          ['provider', 'ASC'],
          ['displayName', 'ASC'],
        ],
      });

      res.status(200).json({
        success: true,
        data: models,
      });
    } catch (error) {
      logger.error('Error fetching available AI models:', error);

      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch AI models',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }

  /**
   * Get AI model by ID
   */
  public async getModelById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const model = await AIModel.findOne({
        where: { id, isActive: true },
        attributes: [
          'id',
          'name',
          'displayName',
          'provider',
          'modelType',
          'maxTokens',
          'inputCostPerToken',
          'outputCostPerToken',
          'duckCostMultiplier',
          'capabilities',
          'tierAccess',
          'description',
        ],
      });

      if (!model) {
        res.status(404).json({
          success: false,
          message: 'AI model not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: model,
      });
    } catch (error) {
      logger.error(`Error fetching AI model with ID ${req.params.id}:`, error);

      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch AI model',
          error: (error as Error).message || 'An unknown error occurred',
        });
      }
    }
  }
}

export default new AIModelController();
