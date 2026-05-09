import { Resend } from 'resend';
import logger from '../utils/logger';

// Check if API key exists
const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      const { data, error } = await resend.emails.send({
        // Resend par verification ke baad aap yahan apna domain use kar sakte hain
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev', 
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Verification Code</h2>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      });

      if (error) {
        logger.error(`Resend API returned an error: ${JSON.stringify(error)}`);
        throw new Error(error.message);
      }

      logger.info(`Verification email sent successfully to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email: ${error}`);
      throw new Error('Failed to send verification email');
    }
  }
}

export const emailService = new EmailService();