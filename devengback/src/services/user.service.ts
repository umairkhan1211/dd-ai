import { IUser } from '../models/User';
import { User } from '../models';

export class UserService {
  static async updateUser(userId: string, updates: Partial<IUser>) {
    const allowedFields: (keyof IUser)[] = [
      'firstName',
      'lastName',
      'displayName',
      'image',
      'isFirstLogin',
      'activeOperator',
    ];

    // Filter out only allowed fields with proper typing cast
    const filteredUpdates: Partial<IUser> = {};
    allowedFields.forEach(field => {
      if (field in updates) {
        filteredUpdates[field] = updates[field] as any;
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update(filteredUpdates);
    return user;
  }
}
