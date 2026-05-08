import Protocol, { IProtocol } from '../models/Protocol';
import AIModel from '../models/AIModel';
import { Op } from 'sequelize';
import logger from '../utils/logger';
import { BillingService } from './billing.service'; // Import your BillingService
import { ConflictError, ForbiddenError, BadRequestError } from '../utils/api-errors'; // Import custom errors, ADDED BadRequestError

export interface CreateProtocolData {
  name: string;
  description: string;
  level: 1 | 2 | 3;
  type: 'static' | 'semi-dynamic' | 'compositional';
  promptTemplate: string;
  inputs?: IProtocol['inputs'];
  modifiers?: IProtocol['modifiers'];
  logic?: IProtocol['logic'];
  deliveredBy?: string;
  category?: string;
  aiModelId: string; // AI model ID is now required
  userId?: string;
}

export interface UpdateProtocolData extends Partial<CreateProtocolData> {
  id: string;
}

class ProtocolService {
  /**
   * Retrieves all protocols from the database.
   * @param userId Optional user ID to include user-specific protocols.
   * @returns A promise that resolves to an array of IProtocol objects.
   */
  async getAll(userId?: string): Promise<IProtocol[]> {
    try {
      let whereClause: any = { isActive: true };

      // If userId is provided, include both global protocols (userId: null) and user-specific protocols
      if (userId) {
        whereClause = {
          isActive: true,
          userId: userId,
        };
      } else {
        // If no userId provided, only fetch global protocols
        whereClause = { isActive: true, userId: null };
      }

      const protocols = await Protocol.findAll({
        where: whereClause,
        order: [
          ['category', 'ASC'],
          ['name', 'ASC'],
        ],
      });
      return protocols.map(p => p.get({ plain: true }));
    } catch (error) {
      logger.error('Error fetching all protocols:', error);
      throw new Error('Failed to fetch protocols.');
    }
  }

  /**
   * Retrieves a single protocol by its ID.
   * @param id The ID of the protocol to retrieve.
   * @returns A promise that resolves to an IProtocol object or null if not found.
   */
  async getById(id: string): Promise<IProtocol | null> {
    try {
      const protocol = await Protocol.findByPk(id, {
        include: [
          {
            model: AIModel,
            as: 'aiModel',
            attributes: ['id', 'name', 'displayName', 'provider', 'modelType'],
          },
        ],
      });
      return protocol ? protocol.get({ plain: true }) : null;
    } catch (error) {
      logger.error(`Error fetching protocol with ID ${id}:`, error);
      throw new Error('Failed to fetch protocol by ID.');
    }
  }

  /**
   * Retrieves a single protocol by its ID with user access control.
   * @param id The ID of the protocol to retrieve.
   * @param userId Optional user ID to include user-specific protocols.
   * @returns A promise that resolves to an IProtocol object or null if not found.
   */
  async getByIdWithUserAccess(id: string, userId?: string): Promise<IProtocol | null> {
    try {
      let whereClause: any = { id, isActive: true };

      // If userId is provided, include both global protocols (userId: null) and user-specific protocols
      if (userId) {
        whereClause = {
          id,
          isActive: true,
          [Op.or]: [{ userId: null }, { userId: userId }],
        };
      } else {
        // If no userId provided, only fetch global protocols
        whereClause = { id, isActive: true, userId: null };
      }

      const protocol = await Protocol.findOne({
        where: whereClause,
        include: [
          {
            model: AIModel,
            as: 'aiModel',
            attributes: ['id', 'name', 'displayName', 'provider', 'modelType'],
          },
        ],
      });
      return protocol ? protocol.get({ plain: true }) : null;
    } catch (error) {
      logger.error(`Error fetching protocol with ID ${id}:`, error);
      throw new Error('Failed to fetch protocol by ID with user access.');
    }
  }

  /**
   * Retrieves a single protocol by its name.
   * @param name The name of the protocol to retrieve.
   * @param userId Optional user ID to include user-specific protocols.
   * @returns A promise that resolves to an IProtocol object or null if not found.
   */
  async getByName(name: string, userId?: string): Promise<IProtocol | null> {
    try {
      let whereClause: any = { name, isActive: true };

      // If userId is provided, include both global protocols (userId: null) and user-specific protocols
      if (userId) {
        whereClause = {
          name,
          isActive: true,
          [Op.or]: [{ userId: null }, { userId: userId }],
        };
      } else {
        // If no userId provided, only fetch global protocols
        whereClause = { name, isActive: true, userId: null };
      }

      const protocol = await Protocol.findOne({
        where: whereClause,
        include: [
          {
            model: AIModel,
            as: 'aiModel',
            attributes: ['id', 'name', 'displayName', 'provider', 'modelType'],
          },
        ],
      });
      return protocol ? protocol.get({ plain: true }) : null;
    } catch (error) {
      logger.error(`Error fetching protocol with name ${name}:`, error);
      throw new Error('Failed to fetch protocol by name.');
    }
  }

  /**
   * Creates a new protocol.
   * @param data The protocol data to create.
   * @returns A promise that resolves to the created IProtocol object.
   */
  async create(data: CreateProtocolData): Promise<IProtocol & { deductedDucks?: string }> {
    try {
      // Ensure userId is present for the limit check
      if (!data.userId) {
        throw new Error('User ID is required to check protocol creation limits.');
      }

      // Validate aiModelId (now required)
      const aiModel = await AIModel.findOne({
        where: { id: data.aiModelId, isActive: true },
      });
      if (!aiModel) {
        throw new BadRequestError(
          `Invalid AI model ID: ${data.aiModelId}. Please select a valid AI model.`
        );
      }

      //  1. Check content limits and duck balance using BillingService ---
      // Pass the protocol level to canCreateTemplate for accurate cost calculation
      const canCreateResult = await BillingService.canCreateTemplate(
        data.userId,
        'protocol',
        data.level
      );
      if (!canCreateResult.allowed) {
        // Throw ForbiddenError with the reason from BillingService (which now includes duck reasons)
        throw new ForbiddenError(
          canCreateResult.reason ||
            'You have reached your limit or have insufficient ducks to create protocols.'
        );
      }
      //

      // 2. Check if protocol with same name already exists for this user
      const existingProtocol = await Protocol.findOne({
        where: {
          name: data.name,
          userId: data.userId || null, // Ensure this matches how you store global protocols
        },
      });

      if (existingProtocol) {
        // Throw ConflictError for duplicate name
        throw new ConflictError(`Protocol with name "${data.name}" already exists.`);
      }

      // 3. Deduct ducks for the creation action AFTER all other validations pass ---
      const deductResult = await BillingService.deductDucksForAction(
        data.userId,
        'protocol_create',
        0,
        data.level
      );
      if (!deductResult.success) {
        // This case should ideally not be hit if canCreateTemplate is accurate,
        // but it's a final safeguard against race conditions or unexpected state.
        throw new BadRequestError(
          deductResult.reason || 'Failed to deduct ducks for protocol creation.'
        );
      }

      const protocol = await Protocol.create(data);
      return {
        ...protocol.get({ plain: true }),
        deductedDucks: deductResult.deductedDucks,
      };
    } catch (error) {
      logger.error('Error creating protocol:', error);
      // Re-throw custom errors directly, including BadRequestError
      if (
        error instanceof ConflictError ||
        error instanceof ForbiddenError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }
      // For any other unexpected errors, throw a generic one
      throw new Error('Failed to create protocol.');
    }
  }

  /**
   * Updates an existing protocol.
   * @param data The protocol data to update, including the ID.
   * @returns A promise that resolves to the updated IProtocol object or null if not found.
   */
  async update(data: UpdateProtocolData): Promise<IProtocol | null> {
    try {
      const { id, ...updateData } = data;

      // If name is being updated, check for conflicts
      if (updateData.name) {
        const existingProtocol = await Protocol.findOne({
          where: {
            name: updateData.name,
            userId: updateData.userId || null, // Ensure this matches how you store global protocols
            id: { [Op.ne]: id }, // Exclude the current protocol
          },
        });

        if (existingProtocol) {
          throw new ConflictError(`Protocol with name "${updateData.name}" already exists.`);
        }
      }

      const [updatedRowsCount] = await Protocol.update(updateData, {
        where: { id },
        returning: true,
      });

      if (updatedRowsCount === 0) {
        return null; // Or throw NotFoundError
      }

      const updatedProtocol = await Protocol.findByPk(id);
      return updatedProtocol ? updatedProtocol.get({ plain: true }) : null;
    } catch (error) {
      logger.error(`Error updating protocol with ID ${data.id}:`, error);
      if (error instanceof ConflictError) {
        // Catch specific errors here too
        throw error;
      }
      throw new Error('Failed to update protocol.');
    }
  }

  /**
   * Hard deletes a protocol from the database.
   * @param id The ID of the protocol to delete.
   * @returns A promise that resolves to true if successful, false if not found.
   */
  async delete(id: string): Promise<boolean> {
    try {
      const deletedRowsCount = await Protocol.destroy({
        where: { id },
      });

      return deletedRowsCount > 0; // Or throw NotFoundError if 0
    } catch (error) {
      logger.error(`Error deleting protocol with ID ${id}:`, error);
      throw new Error('Failed to delete protocol.');
    }
  }

  /**
   * Hard deletes a protocol from the database.
   * @param id The ID of the protocol to permanently delete.
   * @returns A promise that resolves to true if successful, false if not found.
   */
  async hardDelete(id: string): Promise<boolean> {
    try {
      const deletedRowsCount = await Protocol.destroy({
        where: { id },
      });

      return deletedRowsCount > 0; // Or throw NotFoundError if 0
    } catch (error) {
      logger.error(`Error hard deleting protocol with ID ${id}:`, error);
      throw new Error('Failed to permanently delete protocol.');
    }
  }

  /**
   * Retrieves protocols by category.
   * @param category The category to filter by.
   * @param userId Optional user ID to include user-specific protocols.
   * @returns A promise that resolves to an array of IProtocol objects.
   */
  async getByCategory(category: string, userId?: string): Promise<IProtocol[]> {
    try {
      let whereClause: any = { category, isActive: true };

      if (userId) {
        whereClause = {
          category,
          isActive: true,
          [Op.or]: [{ userId: null }, { userId: userId }],
        };
      } else {
        whereClause = { category, isActive: true, userId: null };
      }

      const protocols = await Protocol.findAll({
        where: whereClause,
        order: [['name', 'ASC']],
      });
      return protocols.map(p => p.get({ plain: true }));
    } catch (error) {
      logger.error(`Error fetching protocols by category ${category}:`, error);
      throw new Error('Failed to fetch protocols by category.');
    }
  }

  /**
   * Retrieves protocols by level.
   * @param level The protocol level to filter by.
   * @param userId Optional user ID to include user-specific protocols.
   * @returns A promise that resolves to an array of IProtocol objects.
   */
  async getByLevel(level: 1 | 2 | 3, userId?: string): Promise<IProtocol[]> {
    try {
      let whereClause: any = { level, isActive: true };

      if (userId) {
        whereClause = {
          level,
          isActive: true,
          [Op.or]: [{ userId: null }, { userId: userId }],
        };
      } else {
        whereClause = { level, isActive: true, userId: null };
      }

      const protocols = await Protocol.findAll({
        where: whereClause,
        order: [['name', 'ASC']],
      });
      return protocols.map(p => p.get({ plain: true }));
    } catch (error) {
      logger.error(`Error fetching protocols by level ${level}:`, error);
      throw new Error('Failed to fetch protocols by level.');
    }
  }
}

export default new ProtocolService();
