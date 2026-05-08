import { Request, Response } from 'express';
import { CastService, CreateCastMemberDTO, UpdateCastMemberDTO } from '../services/cast.service';
import { ApiError, BadRequestError, NotFoundError } from '../utils/api-errors';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';
import url from 'url';

// Extend Request interface to include tempAvatarPath
declare module 'express-serve-static-core' {
  interface Request {
    tempAvatarPath?: string;
  }
}

const castService = new CastService();

export class CastController {
  public async createCastMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const {
        name,
        functionalRole,
        description,
        defaultTone,
        invocationPhrases,
        priority,
        aiModelId,
      } = req.body;
      // const aiModelId = 'bb5dc55a-a562-4fdd-af23-f953f1bb2c2a';
      if (!name || !functionalRole || !defaultTone) {
        throw new BadRequestError('Missing required fields: name, functionalRole, defaultTone');
      }

      // AI Model is always required for user-created cast members
      if (!aiModelId) {
        throw new BadRequestError(
          'AI Model selection is required. Please select an AI model for this cast member.'
        );
      }

      let avatar = req.body.avatar;
      if (!avatar) {
        throw new BadRequestError('Avatar is required');
      }

      const dto: CreateCastMemberDTO = {
        userId,
        name,
        functionalRole,
        description,
        defaultTone,
        invocationPhrases,
        priority,
        avatar, // Use provided avatar (full URL for URL case, relative path for blob case)
        aiModelId, // Add AI model ID
        isSystem: false, // User-created cast members are never system cast members
      };

      const castMember = await castService.createCastMember(dto);

      // Handle blob case: move file from temp to cast member directory
      if (req.tempAvatarPath) {
        const castId = castMember.id;
        const castmemberDir = path.join(
          __dirname,
          '../../public/users',
          userId,
          'castmember',
          castId
        );
        if (!fs.existsSync(castmemberDir)) {
          fs.mkdirSync(castmemberDir, { recursive: true });
        }

        const filename = path.basename(req.tempAvatarPath);
        const newFilePath = path.join(castmemberDir, filename);

        fs.renameSync(req.tempAvatarPath, newFilePath);

        const relativePath = path.relative(path.join(__dirname, '../../public'), newFilePath);
        const normalizedPath = relativePath.replace(/\\/g, '/');
        const urlPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

        const BACKEND_URL = process.env.BACKEND_URL;
        if (!BACKEND_URL) {
          throw new Error('BACKEND_URL environment variable is required');
        }
        avatar = `${BACKEND_URL.replace(/\/+$/, '')}${urlPath}`;

        await castService.updateCastMember(castId, userId, { avatar });
      }

      const updatedCastMember = await castService.getCastMemberById(castMember.id, userId);

      res.status(201).json({
        castMember: updatedCastMember,
        deductedDucks: castMember.deductedDucks,
      });
    } catch (error) {
      if (req.tempAvatarPath && fs.existsSync(req.tempAvatarPath)) {
        fs.unlinkSync(req.tempAvatarPath);
      }
      console.error('[CastController] Error creating cast member:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message || 'Error creating cast member' });
      }
    }
  }

  public async getCastMembers(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const castMembers = await castService.getCastMembersByUser(userId);
      res.status(200).json(castMembers);
    } catch (error) {
      console.error('[CastController] Error fetching cast members:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: (error as Error).message || 'Error fetching cast members' });
      }
    }
  }

  public async getCastMemberById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const { castId } = req.params;
      const castMember = await castService.getCastMemberById(castId, userId);
      if (castMember) {
        res.status(200).json(castMember);
      } else {
        throw new NotFoundError('Cast member not found');
      }
    } catch (error) {
      console.error('Error fetching cast member by ID:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message || 'Error fetching cast member' });
      }
    }
  }

  public async updateCastMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const { castId } = req.params;

      const existing = await castService.getCastMemberById(castId, userId);
      if (!existing) {
        throw new NotFoundError('Cast member not found');
      }

      const avatar = req.body.avatar;
      const fullAvatarUrl = avatar;

      const dto: UpdateCastMemberDTO = {
        ...req.body,
        avatar: fullAvatarUrl,
      };

      const updatedCastMember = await castService.updateCastMember(castId, userId, dto);

      if (avatar && req.tempAvatarPath) {
        try {
          this.cleanupCastMemberDirectory(userId, castId, avatar);
        } catch (error) {
          console.error('[CastController] Error cleaning up old avatars:', error);
        }
      }

      if (updatedCastMember) {
        res.status(200).json(updatedCastMember);
      } else {
        throw new NotFoundError('Cast member not found or update failed');
      }
    } catch (error) {
      console.error('[CastController] Error updating cast member:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message || 'Error updating cast member' });
      }
    }
  }

  public async deleteCastMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const { castId } = req.params;

      const castMember = await castService.getCastMemberById(castId, userId);

      const success = await castService.deleteCastMember(castId, userId);
      if (success) {
        if (castMember) {
          try {
            this.cleanupCastMemberDirectory(userId, castId);
          } catch (error) {
            console.error('[CastController] Error cleaning up castmember directory:', error);
          }
        }
        res.status(204).send();
      } else {
        throw new NotFoundError('Cast member not found or delete failed');
      }
    } catch (error) {
      console.error('[CastController] Error deleting cast member:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message || 'Error deleting cast member' });
      }
    }
  }

  private cleanupCastMemberDirectory(userId: string, castId: string, keepAvatarUrl?: string): void {
    try {
      const publicDir = path.resolve(__dirname, '../../public');
      const castmemberDir = path.join(publicDir, 'users', userId, 'castmember', castId);

      const normalizedDir = path.resolve(castmemberDir);
      const usersDir = path.join(publicDir, 'users');

      if (!normalizedDir.startsWith(usersDir) || !fs.existsSync(usersDir)) {
        logger.warn(`Security warning: Invalid castmember directory path: ${castmemberDir}`);
        return;
      }

      let keepFilename: string | undefined;
      if (keepAvatarUrl) {
        const parsedUrl = url.parse(keepAvatarUrl);
        if (parsedUrl.pathname) {
          keepFilename = path.basename(parsedUrl.pathname);
        }
      }

      if (fs.existsSync(normalizedDir)) {
        const files = fs.readdirSync(normalizedDir);
        files.forEach(file => {
          const filePath = path.join(normalizedDir, file);
          if (fs.lstatSync(filePath).isFile()) {
            if (keepFilename && file === keepFilename) {
              return;
            }
            fs.unlinkSync(filePath);
          }
        });

        if (fs.readdirSync(normalizedDir).length === 0) {
          fs.rmdirSync(normalizedDir);
        }
      }
    } catch (error) {
      console.error('[CastController] Error cleaning up castmember directory:', error);
    }
  }
}
