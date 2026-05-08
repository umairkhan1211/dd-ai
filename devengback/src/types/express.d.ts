import { IUser } from '../models/User';
import User from '../models/User';

declare global {
  namespace Express {
    // Use the specific User model class from your application
    interface User extends User {}

    interface Request {
      user?: User;
      isAuthenticated(): boolean;
      tempAvatarPath?: string;
    }
  }
}

export {}; // Ensures this file is treated as a module
