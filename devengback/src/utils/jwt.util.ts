import jwt from 'jsonwebtoken';
import logger from './logger';

const VERIFICATION_JWT_SECRET = process.env.VERIFICATION_JWT_SECRET;
const OTP_EXPIRY = '10m'; // 10 minutes

if (!VERIFICATION_JWT_SECRET) {
  logger.error('VERIFICATION_JWT_SECRET is not set in environment variables');
  throw new Error('VERIFICATION_JWT_SECRET must be configured');
}

export const generateVerificationToken = (email: string): { token: string; otp: string } => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const token = jwt.sign({ otp, email, type: 'email_verification' }, VERIFICATION_JWT_SECRET, {
    expiresIn: OTP_EXPIRY,
    algorithm: 'HS256',
  });

  return { token, otp };
};

export const verifyVerificationToken = (token: string): { otp: string; email: string } => {
  try {
    return jwt.verify(token, VERIFICATION_JWT_SECRET, {
      algorithms: ['HS256'],
    }) as { otp: string; email: string };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Verification code has expired');
    }
    logger.error(`Token verification failed: ${error.message}`);
    throw new Error('Invalid verification token');
  }
};
