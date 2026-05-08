import Cast, { ICastMember } from '../models/Cast';
import AIModel from '../models/AIModel';
import { Op } from 'sequelize';
import { BillingService } from './billing.service'; // Import your BillingService
import { ConflictError, ForbiddenError, BadRequestError } from '../utils/api-errors'; // Import specific custom errors, added BadRequestError for duck issues

export interface CreateCastMemberDTO {
  userId: string;
  name: string;
  functionalRole: string;
  description?: string;
  defaultTone: string;
  invocationPhrases?: string[];
  priority?: number;
  avatar?: string;
  aiModelId?: string; // AI model ID - required for user cast members, optional for system
  isSystem?: boolean;
}

export interface UpdateCastMemberDTO {
  name?: string;
  functionalRole?: string;
  description?: string;
  defaultTone?: string;
  invocationPhrases?: string[];
  priority?: number;
  avatar?: string;
  isSystem?: boolean;
}

export class CastService {
  public async createCastMember(data: CreateCastMemberDTO): Promise<
    ICastMember & {
      deductedDucks?: string;
    }
  > {
    const systemCastMembers = await Cast.findAll({
      where: { isSystem: true },
      attributes: ['name'], // Only fetch name field
    });

    const systemNames = systemCastMembers.map(cm => cm.name.trim().toLowerCase());

    if (systemNames.includes(data.name.trim().toLowerCase())) {
      throw new ForbiddenError(
        `The name "${data.name}" is reserved for a system cast member. Please choose another name.`
      );
    }

    // Validate aiModelId - always required for user cast members
    if (!data.isSystem) {
      // User cast members always require AI model
      if (!data.aiModelId) {
        throw new BadRequestError('AI Model selection is required for user cast members.');
      }
      const aiModel = await AIModel.findOne({
        where: { id: data.aiModelId, isActive: true },
      });
      if (!aiModel) {
        throw new BadRequestError(
          `Invalid AI model ID: ${data.aiModelId}. Please select a valid AI model.`
        );
      }
    } else {
      // System cast members (created programmatically) - aiModelId is optional
      if (data.aiModelId) {
        const aiModel = await AIModel.findOne({
          where: { id: data.aiModelId, isActive: true },
        });
        if (!aiModel) {
          throw new BadRequestError(
            `Invalid AI model ID: ${data.aiModelId}. Please select a valid AI model.`
          );
        }
      }
    }

    //  1. Check content limits AND duck balance using BillingService ---
    const canCreateResult = await BillingService.canCreateTemplate(data.userId, 'cast');
    if (!canCreateResult.allowed) {
      // Throw ForbiddenError with the reason from BillingService (which now includes duck reasons)
      throw new ForbiddenError(
        canCreateResult.reason ||
          'You have reached your limit or have insufficient ducks to create cast members.'
      );
    }

    // 2. Check if a cast member with this name already exists for this user
    const existingByName = await Cast.findOne({
      where: {
        name: data.name,
        userId: data.userId,
      },
    });
    if (existingByName) {
      // Throw ConflictError for duplicate name
      throw new ConflictError('A cast member with this name already exists for this user.');
    }

    // : 3. Deduct ducks for the creation action AFTER all other validations pass ---
    const deductResult = await BillingService.deductDucksForAction(data.userId, 'cast_create');
    if (!deductResult.success) {
      // This case should ideally not be hit if canCreateTemplate is accurate,
      // but it's a final safeguard against race conditions or unexpected state.
      throw new BadRequestError(
        deductResult.reason || 'Failed to deduct ducks for cast member creation.'
      );
    }

    //  4. Create the cast member in the database (original logic) ---
    const castMember = await Cast.create(data as any);
    return {
      ...castMember.toJSON(),
      deductedDucks: deductResult.deductedDucks,
    };
  }

  public async getCastMemberById(castId: string, userId: string): Promise<ICastMember | null> {
    const castMember = await Cast.findOne({
      where: {
        id: castId,
        [Op.or]: [
          { userId }, // Owned by current user
          { isSystem: true }, // OR is a system cast member
        ],
      },
      include: [
        {
          model: AIModel,
          as: 'aiModel',
          attributes: ['id', 'name', 'displayName', 'provider', 'modelType'],
        },
      ],
    });
    return castMember ? (castMember.toJSON() as ICastMember) : null;
  }

  public async getCastMemberByName(name: string, userId: string): Promise<ICastMember | null> {
    const castMember = await Cast.findOne({
      where: {
        name,
        [Op.or]: [
          { userId }, // Owned by current user
          { isSystem: true }, // OR is a system cast member
        ],
      },
      include: [
        {
          model: AIModel,
          as: 'aiModel',
          attributes: ['id', 'name', 'displayName', 'provider', 'modelType'],
        },
      ],
    });
    return castMember ? (castMember.toJSON() as ICastMember) : null;
  }

  public async getCastMembersByUser(userId: string): Promise<ICastMember[]> {
    const castMembers = await Cast.findAll({
      where: {
        [Op.or]: [
          { userId }, // User's own cast members
          { isSystem: true }, // System cast members (like Duck)
        ],
      },
      order: [
        ['priority', 'ASC'],
        ['name', 'ASC'],
      ],
    });
    return castMembers.map(cm => cm.toJSON() as ICastMember);
  }

  public async updateCastMember(
    castId: string,
    userId: string,
    data: UpdateCastMemberDTO
  ): Promise<ICastMember | null> {
    const castMemberInstance = await Cast.findOne({ where: { id: castId, userId } });
    if (!castMemberInstance) {
      return null; // Or throw NotFoundError
    }

    const currentUserId = castMemberInstance.userId;

    if (data.name && data.name !== castMemberInstance.name) {
      const existing = await Cast.findOne({
        where: {
          name: data.name,
          userId: currentUserId,
          id: { [Op.ne]: castId },
        },
      });
      if (existing) {
        // Throw ConflictError for duplicate name on update
        throw new ConflictError('Another cast member with this name already exists for this user.');
      }
    }
    await castMemberInstance.update(data);
    return castMemberInstance.toJSON() as ICastMember;
  }

  public async deleteCastMember(castId: string, userId: string): Promise<boolean> {
    const castMember = await Cast.findByPk(castId);
    if (!castMember) return false;

    if (castMember.isSystem) {
      throw new ForbiddenError('Cannot delete system cast members.');
    }

    if (castMember.userId !== userId) {
      return false;
    }

    const result = await Cast.destroy({ where: { id: castId } });
    return result > 0;
  }
}
