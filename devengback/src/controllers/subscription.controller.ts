// src/controllers/subscription.controller.ts

import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import UserSubscription, { IUserSubscription } from '../models/UserSubscription';
import UserWallet from '../models/UserWallet'; // UserWallet still exists for other wallet functionality
import logger from '../utils/logger';
import * as stripeService from '../services/stripe.service'; // Corrected import

import dotenv from 'dotenv';
dotenv.config();

const STRIPE_CORE_PRICE_ID = process.env.STRIPE_CORE_PRICE_ID;
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

/**
 * Create a checkout session for subscription
 */
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = req.user as IUser;

    if (!user.email) {
      res.status(400).json({ error: 'User email not found' });
      return;
    }

    // --- MODIFIED: Get 'tier' from request body ---
    const { tier } = req.body;

    if (!tier) {
      res.status(400).json({ error: 'Tier is required to create a checkout session.' });
      return;
    }

    // --- ADDED: Determine Stripe Price ID based on tier ---
    let priceId: string | undefined;
    switch (tier) {
      case 'core':
        priceId = STRIPE_CORE_PRICE_ID;
        break;
      case 'pro':
        priceId = STRIPE_PRO_PRICE_ID;
        break;
      default:
        res.status(400).json({ error: 'Invalid tier provided.' });
        return;
    }

    if (!priceId) {
      res
        .status(500)
        .json({ error: `Stripe Price ID for tier '${tier}' is not configured on the server.` });
      logger.error(`❌ Missing Stripe Price ID for tier: ${tier}. Check environment variables.`);
      return;
    }
    // --- END ADDED ---

    // Ensure a UserWallet exists if it's used for other functionalities (like Ducks).
    // stripeCustomerId is NOT managed here anymore.
    let userWallet = await UserWallet.findOne({ where: { userId: user.id } });
    if (!userWallet) {
      userWallet = await UserWallet.create({ userId: user.id });
      logger.info(`🔗 Created new UserWallet placeholder for userId: ${user.id}`);
    }

    // The stripeService.createCustomer function now updates the UserSubscription model directly
    // with the stripeCustomerId.
    const customerId = await stripeService.createCustomer(user.id, user.email, user.displayName);

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId, // --- MODIFIED: Pass the determined priceId ---
      `${req.headers.origin}/dashboard/subscription?payment=success`, // --- REVERTED: Original success URL ---
      `${req.headers.origin}/dashboard/subscription?payment=canceled` // --- REVERTED: Original cancel URL ---,
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error(`Error creating checkout session: ${error}`);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

/**
 * Get current user's subscription status
 */
export const getSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = req.user as IUser;

    // Fetch the user's subscription details from the UserSubscription model
    const userSubscription = await UserSubscription.findOne({ where: { userId: user.id } });
    // UserWallet is retrieved only if needed for other non-Stripe customer ID related functionalities
    // const userWallet = await UserWallet.findOne({ where: { userId: user.id } });

    // Default values if no subscription exists
    let status: IUserSubscription['status'] = undefined; // Set to undefined to match optional status in model
    let tier: IUserSubscription['tier'] = 'trial'; // Default to 'trial'
    let currentPeriodEnd: Date | null | undefined = null; // Use currentPeriodEnd
    let stripeSubscriptionId = ''; // Use stripeSubscriptionId

    if (userSubscription) {
      status = userSubscription.status;
      tier = userSubscription.tier;
      currentPeriodEnd = userSubscription.currentPeriodEnd; // Use currentPeriodEnd
      stripeSubscriptionId = userSubscription.stripeSubscriptionId || ''; // Use stripeSubscriptionId

      // Check if user has 'pro' tier (was 'premium') but missing subscription ID in UserSubscription model
      // Note: 'premium' is mapped to 'pro' in stripe.service.ts
      if (
        userSubscription.tier === 'pro' && // Changed from 'premium' to 'pro'
        userSubscription.status === 'active' &&
        !userSubscription.stripeSubscriptionId && // Use stripeSubscriptionId
        userSubscription.stripeCustomerId // CORRECTED: Use stripeCustomerId from UserSubscription
      ) {
        logger.info(
          `User ${user.id} has pro tier but missing subscription ID. Trying to retrieve from Stripe.`
        );
        try {
          // Try to get subscription ID from Stripe using the Stripe Customer ID from UserSubscription
          const subscription = await stripeService.getActiveSubscriptionByCustomerId(
            userSubscription.stripeCustomerId // CORRECTED: Use stripeCustomerId from UserSubscription
          );
          if (subscription) {
            // Update UserSubscription with subscription ID
            await userSubscription.update({ stripeSubscriptionId: subscription.id }); // Update stripeSubscriptionId
            logger.info(
              `Updated user ${user.id} with subscription ID ${subscription.id} from Stripe`
            );
            stripeSubscriptionId = subscription.id; // Update local variable for response
          }
        } catch (err) {
          logger.error(`Error retrieving subscription from Stripe: ${err}`);
        }
      }

      // Check if canceled subscription has passed its end date
      if (
        userSubscription.status === 'canceled' &&
        userSubscription.tier !== 'trial' && // Check if it was a paid tier
        userSubscription.currentPeriodEnd // Use currentPeriodEnd
      ) {
        const now = new Date();
        if (now > userSubscription.currentPeriodEnd) {
          // Use currentPeriodEnd
          logger.info(
            `Canceled subscription for user ${user.id} has passed its end date. Changing tier to trial.`
          );
          // Update UserSubscription model
          // Ensure status is one of the enum values for your model (e.g., 'expired' or 'inactive')
          await userSubscription.update({ tier: 'trial', status: 'unpaid' });
          tier = 'trial'; // Update local variable for response
          status = 'unpaid';
        }
      }
    }

    res.json({
      status: status,
      tier: tier,
      currentPeriodEnd: currentPeriodEnd, // Use currentPeriodEnd
      stripeSubscriptionId: stripeSubscriptionId, // Use stripeSubscriptionId
    });
  } catch (error) {
    logger.error(`Error getting subscription status: ${error}`);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = req.user as IUser;

    // Verify subscription ID from request body
    const { subscriptionId } = req.body; // This is the Stripe Subscription ID

    logger.info(`🔍 Subscription ID to cancel: ${subscriptionId}`);
    if (!subscriptionId) {
      res.status(400).json({ error: 'Subscription ID is required' });
      return;
    }

    // Find the user's subscription in the database using stripeSubscriptionId
    const userSubscription = await UserSubscription.findOne({
      where: { userId: user.id, stripeSubscriptionId: subscriptionId }, // Use stripeSubscriptionId
    });
    if (!userSubscription) {
      res.status(404).json({ error: 'Subscription not found for this user' });
      return;
    }
    // Cancel subscription in Stripe
    // The stripeService.cancelSubscription will trigger a webhook,
    // which will then update the UserSubscription model directly.
    await stripeService.cancelSubscription(subscriptionId);

    res.json({ success: true, message: 'Subscription canceled successfully' });
  } catch (error) {
    logger.error(`Error canceling subscription: ${error}`);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

/**
 * Process Stripe webhook events
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  logger.info('🔔 Webhook received');
  logger.info(`📋 Signature: ${sig ? sig.substring(0, 10) + '...' : 'missing'}`);
  logger.info(`📦 Body type: ${typeof req.body}`);
  logger.info(`📦 Body is Buffer: ${Buffer.isBuffer(req.body)}`);
  logger.info(`📦 Body length: ${req.body?.length || 0} bytes`);

  if (!sig) {
    logger.error('❌ Webhook Error: Missing Stripe signature header');
    res.status(400).send('Webhook Error: Missing Stripe signature header');
    return;
  }

  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeWebhookSecret) {
    logger.error('❌ Webhook Error: STRIPE_WEBHOOK_SECRET is not configured');
    res.status(500).send('Webhook Error: Webhook secret is not configured');
    return;
  }

  logger.info(`🔑 Using webhook secret: ${stripeWebhookSecret.substring(0, 5)}...`);

  // Create Stripe instance (should be done once globally or imported, but repeated here for context)
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);

    logger.info(` Successfully constructed Stripe event: ${event.type}`);
  } catch (err: any) {
    logger.error(`❌ Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  logger.info(`🎯 Processing Stripe event type: ${event.type}`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'checkout.session.completed':
        await stripeService.handleWebhookEvent(event);
        logger.info(`Processed Stripe event ${event.type} via webhook service.`);
        break;
      default:
        logger.info(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, type: event.type });
  } catch (error: any) {
    logger.error(`❌ Error processing webhook: ${error.message}`);
    res.status(500).json({ error: `Error processing webhook: ${error.message}` });
  }
};

/**
 * Update subscription end date
 * This is a one-time utility function for fixing subscriptions without end dates
 * (Adjusted to use currentPeriodEnd and stripeSubscriptionId)
 */
export const updateSubscriptionEndDate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = req.user as IUser; // Current authenticated user (for ID check)

    const { stripeSubscriptionId } = req.body; // Use stripeSubscriptionId

    if (!stripeSubscriptionId) {
      res.status(400).json({ error: 'Stripe Subscription ID is required' });
      return;
    }

    try {
      // Get the subscription details from Stripe
      const subscription = await stripeService.getSubscription(stripeSubscriptionId);

      const cancelAt = (subscription as any).cancel_at;
      const currentPeriodEnd = (subscription as any).current_period_end;
      const endedAt = (subscription as any).ended_at; // Also consider ended_at for already finished subs

      let endDate: Date | null = null;

      if (cancelAt) {
        endDate = new Date(cancelAt * 1000);
        logger.info(`Found cancel_at date: ${endDate}`);
      } else if (currentPeriodEnd) {
        endDate = new Date(currentPeriodEnd * 1000);
        logger.info(`Found current_period_end date: ${endDate}`);
      } else if (endedAt) {
        endDate = new Date(endedAt * 1000);
        logger.info(`Found ended_at date: ${endDate}`);
      }

      if (!endDate) {
        throw new Error('Could not find end date in subscription data from Stripe');
      }

      // Find the user's subscription record with this stripeSubscriptionId in UserSubscription model
      const userSubscriptionToUpdate = await UserSubscription.findOne({
        where: { stripeSubscriptionId }, // Use stripeSubscriptionId
      });

      if (!userSubscriptionToUpdate) {
        throw new Error(
          'User subscription record with this Stripe subscription ID not found in our database'
        );
      }

      // Update the user's subscription end date in UserSubscription model
      await userSubscriptionToUpdate.update({ currentPeriodEnd: endDate }); // Use currentPeriodEnd

      res.json({
        success: true,
        message: 'Subscription end date updated',
        currentPeriodEnd: endDate.toISOString(), // Use currentPeriodEnd
      });
    } catch (err: any) {
      logger.error(`Error fetching subscription or updating end date: ${err}`);
      res.status(500).json({ error: err.message });
    }
  } catch (error) {
    logger.error(`Error updating subscription end date: ${error}`);
    res.status(500).json({ error: 'Failed to update subscription end date' });
  }
};

/**
 * Fix subscription end date for a specific user
 * This is a one-time utility function for fixing particular subscription issues
 * (Adjusted to use currentPeriodEnd and stripeSubscriptionId)
 */
export const fixSubscriptionEndDate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId, stripeSubscriptionId, currentPeriodEnd } = req.body; // Use stripeSubscriptionId and currentPeriodEnd

    if (!userId || !stripeSubscriptionId || !currentPeriodEnd) {
      // Use stripeSubscriptionId and currentPeriodEnd
      res
        .status(400)
        .json({ error: 'userId, stripeSubscriptionId, and currentPeriodEnd are required' });
      return;
    }

    // Convert currentPeriodEnd string to Date object
    const endDateObj = new Date(currentPeriodEnd); // Use currentPeriodEnd
    if (isNaN(endDateObj.getTime())) {
      res.status(400).json({ error: 'Invalid date format for currentPeriodEnd' }); // Specific error message
      return;
    }

    try {
      // Find the user's subscription record
      const userSubscriptionToUpdate = await UserSubscription.findOne({
        where: { userId, stripeSubscriptionId }, // Use stripeSubscriptionId
      });

      if (!userSubscriptionToUpdate) {
        res.status(404).json({
          error: `User subscription with User ID ${userId} and Stripe Subscription ID ${stripeSubscriptionId} not found`, // Specific error message
        });
        return;
      }

      // Update the user's subscription end date
      await userSubscriptionToUpdate.update({ currentPeriodEnd: endDateObj }); // Use currentPeriodEnd

      // Fetch the updated user subscription to return in response
      const updatedUserSubscription = await UserSubscription.findOne({
        where: { userId, stripeSubscriptionId }, // Use stripeSubscriptionId
      });

      res.json({
        success: true,
        message: 'Subscription end date updated manually',
        userSubscription: {
          userId: updatedUserSubscription?.userId,
          stripeSubscriptionId: updatedUserSubscription?.stripeSubscriptionId, // Use stripeSubscriptionId
          status: updatedUserSubscription?.status,
          tier: updatedUserSubscription?.tier,
          currentPeriodEnd: updatedUserSubscription?.currentPeriodEnd, // Use currentPeriodEnd
        },
      });
    } catch (err: any) {
      logger.error(`Error updating user subscription: ${err}`);
      res.status(500).json({ error: err.message });
    }
  } catch (error) {
    logger.error(`Error fixing subscription end date: ${error}`);
    res.status(500).json({ error: 'Failed to fix subscription end date' });
  }
};

/**
 * Debug endpoint to inspect a subscription's details
 * (Adjusted to use stripeSubscriptionId and currentPeriodEnd consistently)
 */
export const debugSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { stripeSubscriptionId } = req.params; // Use stripeSubscriptionId

    if (!stripeSubscriptionId) {
      // Use stripeSubscriptionId
      res.status(400).json({ error: 'Stripe Subscription ID is required' });
      return;
    }

    try {
      // Get subscription details from Stripe
      const subscription = await stripeService.getSubscription(stripeSubscriptionId); // Use stripeSubscriptionId

      // Check all possible date fields
      const dates = {
        created: (subscription as any).created
          ? new Date((subscription as any).created * 1000)
          : null,
        current_period_start: (subscription as any).current_period_start
          ? new Date((subscription as any).current_period_start * 1000)
          : null,
        current_period_end: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000)
          : null,
        cancel_at: (subscription as any).cancel_at
          ? new Date((subscription as any).cancel_at * 1000)
          : null,
        canceled_at: (subscription as any).canceled_at
          ? new Date((subscription as any).canceled_at * 1000)
          : null,
        ended_at: (subscription as any).ended_at
          ? new Date((subscription as any).ended_at * 1000)
          : null,
        trial_start: (subscription as any).trial_start
          ? new Date((subscription as any).trial_start * 1000)
          : null,
        trial_end: (subscription as any).trial_end
          ? new Date((subscription as any).trial_end * 1000)
          : null,
      };

      let itemCurrentPeriodEnd = null;
      if ((subscription as any).items?.data?.[0]?.current_period_end) {
        itemCurrentPeriodEnd = new Date(
          (subscription as any).items.data[0].current_period_end * 1000
        );
      }

      const subscriptionDetails = {
        id: subscription.id,
        status: subscription.status,
        customer: (subscription as any).customer,
        customerId:
          typeof (subscription as any).customer === 'string'
            ? (subscription as any).customer
            : (subscription as any).customer?.id,
        dates,
        itemCurrentPeriodEnd,
      };

      res.json({
        success: true,
        subscription: subscriptionDetails,
      });
    } catch (err: any) {
      logger.error(`Error retrieving subscription: ${err}`);
      res.status(500).json({ error: err.message });
    }
  } catch (error) {
    logger.error(`Error debugging subscription: ${error}`);
    res.status(500).json({ error: 'Failed to debug subscription' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as IUser)?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Parse pagination parameters
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    // Query UserSubscription directly - simpler approach
    const userSubscription = await UserSubscription.findOne({
      where: { userId },
    });

    if (!userSubscription?.stripeCustomerId) {
      res.status(404).json({
        error: 'No payment history found',
        data: [],
      });
      return;
    }
    // Get payment history from Stripe
    const transactions = await stripeService.getCustomerPaymentHistory(
      userSubscription.stripeCustomerId,
      limit,
      offset
    );

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    res.status(500).json({
      error: 'Failed to fetch payment history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
