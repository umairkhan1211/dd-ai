import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
         minVersion: 'TLSv1.2'
      },
      debug: true, // Ye logs mein detail dikhayega
      logger: true // Ye SMTP ka pura handshake dikhayega
    });
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@yourapp.com',
        to: email,
        subject: 'Verify Your Email Address',
        text: `Your verification code is: ${otp}`,
        html: `
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `,
      });

      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email: ${error}`);
      throw new Error('Failed to send verification email');
    }
  }
}

export const emailService = new EmailService();
