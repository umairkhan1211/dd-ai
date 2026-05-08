import { User } from '../models';
import { generateVerificationToken, verifyVerificationToken } from '../utils/jwt.util';
import { emailService } from './email.service';
import logger from '../utils/logger';

export class VerificationService {
  static async createAndSendVerificationToken(user: User): Promise<void> {
    const { token, otp } = generateVerificationToken(user.email!);

     await user.update({
    verificationToken: token,
    isVerified: true, // User ko direct verify kar diya
  });

    // await emailService.sendVerificationEmail(user.email!, otp);
  }

  static async verifyOtp(email: string, inputOtp: string): Promise<User> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('Email already verified');
    }

    if (!user.verificationToken) {
      throw new Error('No verification token generated');
    }

    try {
      const { otp: storedOtp } = verifyVerificationToken(user.verificationToken);

      if (storedOtp != inputOtp) {
        throw new Error('Invalid verification code');
      }

      await user.update({
        isVerified: true,
        verificationToken: null,
      });

      return user;
    } catch (error: any) {
      // Clear expired tokens
      if (error.message === 'Verification code has expired') {
        await user.update({ verificationToken: null });
      }
      throw error;
    }
  }

  static async resendVerificationToken(email: string): Promise<void> {
    const user = await User.findOne({ where: { email, isVerified: false } });

    if (!user) {
      throw new Error('No unverified account found for this email');
    }

    await this.createAndSendVerificationToken(user);
  }
}
