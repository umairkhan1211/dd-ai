import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Temporary TypeScript declaration to avoid tempAvatarPath error
declare module 'express-serve-static-core' {
  interface Request {
    tempAvatarPath?: string;
  }
}

// Get base URLs from environment with validation
const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error('BACKEND_URL environment variable is required');
}

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error('FRONTEND_URL environment variable is required');
}

// Create base uploads directory with proper path resolution
const BASE_UPLOADS_DIR = path.resolve(__dirname, '../../public');
if (!fs.existsSync(BASE_UPLOADS_DIR)) {
  fs.mkdirSync(BASE_UPLOADS_DIR, { recursive: true });
}

// Create temporary directory for avatar processing
const TEMP_DIR = path.resolve(__dirname, '../../public/temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Helper function to normalize paths for cross-platform use
const normalizePath = (p: string): string => {
  return p.replace(/\\/g, '/'); // Convert Windows path separators to Unix-style
};

// Helper function to determine entity type and ID from route
const getEntityInfo = (req: Request) => {
  const url = req.originalUrl || req.url;

  if (url.includes('/cast')) {
    return {
      entityType: 'cast',
      entityId: req.params.castId || req.params.id,
      folderName: 'castmember',
    };
  } else if (url.includes('/session')) {
    return {
      entityType: 'session',
      entityId: req.params.sessionId || req.params.id,
      folderName: 'sessions',
    };
  }

  // Default to cast for backward compatibility
  return {
    entityType: 'cast',
    entityId: req.params.castId,
    folderName: 'castmember',
  };
};

// Configure storage
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return cb(new Error('User ID not found in request'), '');
    }

    const entityInfo = getEntityInfo(req);

    const usersDir = path.join(BASE_UPLOADS_DIR, 'users');
    const normalizedUsersDir = normalizePath(usersDir);
    if (!fs.existsSync(normalizedUsersDir)) {
      fs.mkdirSync(normalizedUsersDir, { recursive: true });
    }

    const userDir = path.join(usersDir, userId);
    const normalizedUserDir = normalizePath(userDir);
    if (!fs.existsSync(normalizedUserDir)) {
      fs.mkdirSync(normalizedUserDir, { recursive: true });
    }

    const entityDir = path.join(userDir, entityInfo.folderName);
    const normalizedEntityDir = normalizePath(entityDir);
    if (!fs.existsSync(normalizedEntityDir)) {
      fs.mkdirSync(normalizedEntityDir, { recursive: true });
    }

    let finalDir = TEMP_DIR;
    if (entityInfo.entityId) {
      const entityIdDir = path.join(entityDir, entityInfo.entityId);
      const normalizedEntityIdDir = normalizePath(entityIdDir);
      if (!fs.existsSync(normalizedEntityIdDir)) {
        fs.mkdirSync(normalizedEntityIdDir, { recursive: true });
      }
      finalDir = normalizedEntityIdDir;
    }

    cb(null, finalDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const entityInfo = getEntityInfo(req);
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const filename = `${entityInfo.entityType}-avatar-${uniqueSuffix}.webp`;
    cb(null, filename);
  },
});

const fileFilter: multer.Options['fileFilter'] = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const constructUrl = (baseUrl: string, path: string): string => {
  let cleanBase = baseUrl
    .replace(/\/$/, '')
    .replace(/^http:http:\/\//, 'http://')
    .replace(/^https:https:\/\//, 'https://');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const finalUrl = `${cleanBase}${cleanPath}`;

  return finalUrl;
};

// Multer configuration
export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single('avatar');

export const processAvatar = (req: Request, res: Response, next: NextFunction) => {
  avatarUpload(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        message: 'Avatar upload error',
        error: err.message,
      });
    }

    const avatarData = req.body?.avatar;
    const entityInfo = getEntityInfo(req);

    // CASE 1: File uploaded via multer
    if (req.file) {
      const relativePath = path.relative(BASE_UPLOADS_DIR, req.file.path);
      const normalizedPath = normalizePath(relativePath);
      const urlPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

      req.body.avatar = constructUrl(BACKEND_URL, urlPath);
      return next();
    }

    // CASE 2: It's a blob (base64 image data)
    if (avatarData && (avatarData.startsWith('image/') || avatarData.startsWith('data:image/'))) {
      try {
        const matches = avatarData.match(/^(?:data:)?(image\/\w+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          throw new Error('Invalid base64 image format');
        }

        const mimeType = matches[1];
        const imageData = matches[2];

        const userId = (req.user as any)?.id;
        if (!userId) {
          throw new Error('User ID not found in request');
        }

        const usersDir = path.join(BASE_UPLOADS_DIR, 'users');
        const userDir = path.join(usersDir, userId);
        const entityDir = path.join(userDir, entityInfo.folderName);

        [usersDir, userDir, entityDir].forEach(dir => {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        const targetDir = entityInfo.entityId
          ? path.join(entityDir, entityInfo.entityId)
          : TEMP_DIR;

        if (entityInfo.entityId && !fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const filename = `${entityInfo.entityType}-avatar_${Date.now()}_${uuidv4().replace(/-/g, '_')}.webp`;
        const filePath = path.join(targetDir, filename);

        const imageBuffer = Buffer.from(imageData, 'base64');
        sharp(imageBuffer)
          .resize(150, 150, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(filePath)
          .then(() => {
            const relativePath = path.relative(BASE_UPLOADS_DIR, filePath);
            const normalizedPath = normalizePath(relativePath);
            const urlPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

            if (!entityInfo.entityId) {
              req.tempAvatarPath = filePath;
            }

            req.body.avatar = constructUrl(BACKEND_URL, urlPath);
            next();
          })
          .catch(err => {
            logger.error(`Error processing ${entityInfo.entityType} avatar blob:`, err);
            return res.status(500).json({
              message: `Error processing ${entityInfo.entityType} avatar image`,
              code: 'IMAGE_PROCESSING_ERROR',
            });
          });
      } catch (error) {
        logger.error(`Error handling ${entityInfo.entityType} avatar blob:`, error);
        return res.status(400).json({
          message:
            error instanceof Error
              ? error.message
              : `Invalid ${entityInfo.entityType} avatar format`,
          code: 'AVATAR_FORMAT_ERROR',
        });
      }
      return;
    }

    // CASE 3: It's a frontend sample URL
    if (avatarData && (avatarData.startsWith('/') || avatarData.startsWith('http'))) {
      req.body.avatar = avatarData.startsWith('http')
        ? avatarData
        : constructUrl(FRONTEND_URL, avatarData);
      return next();
    }

    // CASE 4: No avatar provided - set default based on entity type
    if (!avatarData) {
      const defaultAvatarPath =
        entityInfo.entityType === 'cast'
          ? '/images/castmember/default-avatar.webp'
          : '/images/default-session-avatar.png';
      req.body.avatar = constructUrl(BACKEND_URL, defaultAvatarPath);
      return next();
    }

    // CASE 5: Invalid avatar format
    logger.warn(
      `Invalid ${entityInfo.entityType} avatar format received: ${avatarData.substring(0, 50)}...`
    );
    return res.status(400).json({
      message: `Invalid ${entityInfo.entityType} avatar format`,
      code: 'AVATAR_FORMAT_ERROR',
    });
  });
};
