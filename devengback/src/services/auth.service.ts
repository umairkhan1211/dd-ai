// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import UserSubscription from '../models/UserSubscription';
import logger from '../utils/logger';
import { BillingService } from './billing.service';
import { VerificationService } from './verification.service';
import * as stripeService from './stripe.service';

const SALT_ROUNDS = 10;

// ✅ NAME VALIDATOR
const validateName = (name: string) => {
  const nameRegex = /^[A-Za-z\s]+$/;

  if (!name || !name.trim()) {
    const error = new Error('Name is required');
    (error as any).statusCode = 400;
    throw error;
  }

  if (!nameRegex.test(name.trim())) {
    const error = new Error('Name must contain only letters and spaces');
    (error as any).statusCode = 400;
    throw error;
  }
};

// ✅ PASSWORD VALIDATOR
const validatePassword = (password: string) => {
  if (!password) {
    const error = new Error('Password is required');
    (error as any).statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters long');
    (error as any).statusCode = 400;
    throw error;
  }

  if (!/[A-Z]/.test(password)) {
    const error = new Error('Password must contain at least one uppercase letter');
    (error as any).statusCode = 400;
    throw error;
  }

  if (!/[0-9]/.test(password)) {
    const error = new Error('Password must contain at least one number');
    (error as any).statusCode = 400;
    throw error;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    const error = new Error('Password must contain at least one special character');
    (error as any).statusCode = 400;
    throw error;
  }
};

export const signupWithEmail = async (email: string, name: string, password: string) => {
  // ✅ APPLY VALIDATIONS HERE
  validateName(name);
  validatePassword(password);

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    if (existingUser.isVerified) {
      const error = new Error('Email already in use');
      (error as any).statusCode = 409;
      throw error;
    } else {
      await VerificationService.createAndSendVerificationToken(existingUser);
      return existingUser;
    }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || undefined;

  const user = await User.create({
    email,
    password: hashedPassword,
    displayName: name,
    firstName,
    lastName,
    role: 'user',
  });

  await UserSubscription.create({
    userId: user.id,
    tier: 'trial',
    status: null,
    cancelAtPeriodEnd: false,
  });

  logger.info(`🔗 Created UserSubscription (trial tier) for new user: ${user.id}`);

  try {
    const customerId = await stripeService.createCustomer(user.id, user.email, user.displayName);
    await stripeService.createTrialSubscription(user.id, customerId);
    logger.info(` Stripe trial subscription initiated for user: ${user.id}`);
  } catch (error) {
    logger.error(`⚠️ Failed to create Stripe trial for user ${user.id}: ${error}`);
  }

  await BillingService.applyDailyAndMonthlyResets(user.id);
  logger.info(`🔗 Initialized UserWallet for new user: ${user.id}`);

  await VerificationService.createAndSendVerificationToken(user);

  return user;
};

export const loginWithEmail = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !user.password) {
    const error = new Error('Invalid credentials');
    (error as any).statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    (error as any).statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error('Email not verified');
    (error as any).statusCode = 403;
    throw error;
  }

  return user;
};

export const findOrCreateGoogleUser = async (
  googleId: string,
  email: string,
  displayName: string,
  firstName?: string,
  lastName?: string,
  image?: string
): Promise<User> => {
  let user = await User.findOne({ where: { googleId } });

  if (!user) {
    user = await User.findOne({ where: { email } });

    if (user) {
      await user.update({
        googleId,
        isVerified: user.isVerified ?? false,
      });
      logger.info(`🔗 Linked Google ID ${googleId} to existing user: ${user.id}`);
    } else {
      user = await User.create({
        googleId,
        email,
        displayName,
        firstName,
        lastName,
        image,
        isVerified: false,
        role: 'user',
      });

      logger.info(`✨ Created new user via Google signup: ${user.id}`);

      await UserSubscription.create({
        userId: user.id,
        tier: 'trial',
        status: null,
        cancelAtPeriodEnd: false,
      });

      try {
        const customerId = await stripeService.createCustomer(
          user.id,
          user.email,
          user.displayName
        );
        await stripeService.createTrialSubscription(user.id, customerId);
      } catch (error) {
        logger.error(`⚠️ Failed to create Stripe trial for Google user ${user.id}: ${error}`);
      }

      await BillingService.applyDailyAndMonthlyResets(user.id);
      await VerificationService.createAndSendVerificationToken(user);
    }
  }

  return user;
};
