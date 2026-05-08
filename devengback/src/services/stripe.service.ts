import Stripe from 'stripe';
import dotenv from 'dotenv';
import UserSubscription from '../models/UserSubscription';
import logger from '../utils/logger';
import { BillingService } from './billing.service';
import { formatStripeStatus } from '../utils/billing-helpers';

// Load environment variables
dotenv.config();

// Get the Stripe API key from environment
const stripeApiKey = process.env.STRIPE_SECRET_KEY;

if (!stripeApiKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
} else {
  logger.info(' Stripe API key found');
}

// Initialize Stripe
const stripe = new Stripe(stripeApiKey);

// --- UPDATED: New Price IDs from Environment ---
const CORE_PRICE_ID = process.env.STRIPE_CORE_PRICE_ID;
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

// Validate that price IDs are defined
if (!CORE_PRICE_ID) {
  logger.error('STRIPE_CORE_PRICE_ID is not defined in environment variables.');
}
if (!PRO_PRICE_ID) {
  logger.error('STRIPE_PRO_PRICE_ID is not defined in environment variables.');
}
// --- END UPDATED ---

/**
 * Create a new Stripe customer.
 * This function now stores the stripeCustomerId directly in the UserSubscription model.
 */
export const createCustomer = async (
  userId: string,
  email: string,
  name: string
): Promise<string> => {
  try {
    let userSubscription = await UserSubscription.findOne({ where: { userId: userId } });

    if (!userSubscription) {
      userSubscription = await UserSubscription.create({
        userId: userId,
        tier: 'trial',
        cancelAtPeriodEnd: true,
      });
      logger.info(`🔗 Created new UserSubscription placeholder for userId: ${userId}`);
    }

    if (userSubscription.stripeCustomerId) {
      logger.info(
        `Existing Stripe customer ID found for userId ${userId}: ${userSubscription.stripeCustomerId}`
      );
      return userSubscription.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email,
      name,
      // metadata: {
      //   userId,
      //   userSubscriptionId: userSubscription.id,
      // },
    });

    await userSubscription.update({
      stripeCustomerId: customer.id,
      ...(userSubscription.cancelAtPeriodEnd === null && { cancelAtPeriodEnd: false }),
    });
    logger.info(
      `Created new Stripe customer ID ${customer.id} for userId ${userId} and updated UserSubscription`
    );

    return customer.id;
  } catch (error) {
    logger.error(`Error creating Stripe customer for userId ${userId}: ${error}`);
    throw error;
  }
};

/**
 * Create a checkout session for subscription.
 *
 * @param customerId The Stripe Customer ID.
 * @param priceId The Stripe Price ID for the product (e.g., Core or Pro).
 * @param successUrl The URL to redirect to after successful checkout.
 * @param cancelUrl The URL to redirect to if checkout is canceled.
 */
export const createCheckoutSession = async (
  customerId: string,
  priceId: string, // --- UPDATED: Added priceId parameter ---
  successUrl: string,
  cancelUrl: string,
  userId?: string // Optional userId for metadata
) => {
  try {
    // --- UPDATED: Use the passed priceId directly ---
    if (!priceId) {
      throw new Error('Price ID must be provided to create a checkout session.');
    }
    // --- END UPDATED ---

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // metadata: {
      //   userId: userId || '', // Store userId in metadata if provided
      // },
    });

    return session;
  } catch (error) {
    logger.error(`Error creating checkout session: ${error}`);
    throw error;
  }
};

/**
 * Get subscription details from Stripe.
 */
export const getSubscription = async (subscriptionId: string) => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    logger.error(`Error retrieving subscription ${subscriptionId}: ${error}`);
    throw error;
  }
};

/**
 * Cancel a subscription in Stripe.
 */
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error: any) {
    if (error.code === 'resource_missing' || error.message?.includes('No such subscription')) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.status === 'canceled') {
          console.log('⚠️ Subscription was already canceled');
          return subscription;
        }
      } catch (retrieveError) {
        console.error('❌ Could not retrieve subscription:', retrieveError);
      }
    }

    logger.error(`Error canceling subscription ${subscriptionId}: ${error}`);
    throw error;
  }
};

/**
 * Handle Stripe webhook events.
 * This is the central point for updating our database based on Stripe's events.
 */
export const handleWebhookEvent = async (event: Stripe.Event) => {
  try {
    logger.info(`🔔 Handling Stripe webhook event: ${event.type}`);
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await updateOrCreateUserSubscription(subscription);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.status === 'canceled') {
          await handleSubscriptionCancellation(subscription);
        } else {
          await updateOrCreateUserSubscription(subscription);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(subscription);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.customer) {
          const userSubscription = await UserSubscription.findOne({
            where: { stripeCustomerId: session.customer as string },
          });

          if (userSubscription) {
            await userSubscription.update({ stripeCustomerId: session.customer as string });
            logger.info(
              `Updated UserSubscription ${userSubscription.id} with userId ${session.customer} from checkout session metadata.`
            );
          } else {
            logger.warn(`No UserSubscription found for customer ${session.customer}.`);
          }
        }
        break;
      }
      default: {
        logger.info(`Unhandled Stripe event type: ${event.type}`);
      }
    }
  } catch (error) {
    logger.error(`❌ Error handling webhook event ${event.type}: ${error}`);
    throw error;
  }
};

/**
 * Helper function to update or create UserSubscription records.
 * This is called by webhook handler for 'customer.subscription.created' and 'updated' events.
 */
const updateOrCreateUserSubscription = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.customer as string;

    let userSubscription = await UserSubscription.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (!userSubscription && subscription.metadata?.userId) {
      userSubscription = await UserSubscription.findOne({
        where: { userId: subscription.metadata.userId as string },
      });
    }

    if (!userSubscription) {
      logger.error(
        `❌ UserSubscription record for Stripe customer ID ${customerId} (or userId from metadata) not found. Cannot update subscription.`
      );
      throw new Error(`UserSubscription record for Stripe customer ID ${customerId} not found.`);
    }

    logger.info(
      ` Found UserSubscription for userId ${userSubscription.userId} with Stripe customer: ${customerId}`
    );

    // --- UPDATED: Determine tier based on price ID from environment variables ---
    let subscriptionTier: 'trial' | 'core' | 'pro' = 'trial'; // Default

    // If subscription is in trial, force tier to 'trial' regardless of price
    if (subscription.status === 'trialing') {
      subscriptionTier = 'trial';
    } else {
      // For active/past_due/canceled, determine tier by price
      if (subscription.items.data.length > 0) {
        const priceIdFromSubscription = subscription.items.data[0].price.id;

        if (priceIdFromSubscription === CORE_PRICE_ID) {
          subscriptionTier = 'core';
        } else if (priceIdFromSubscription === PRO_PRICE_ID) {
          subscriptionTier = 'pro';
        } else {
          // Fallback to product name matching
          const price = await stripe.prices.retrieve(priceIdFromSubscription);
          if (price.product) {
            const product = await stripe.products.retrieve(price.product as string);
            if (product.name?.toLowerCase().includes('core')) {
              subscriptionTier = 'core';
            } else if (product.name?.toLowerCase().includes('pro')) {
              subscriptionTier = 'pro';
            }
          }
        }
      }
    }
    // --- END UPDATED ---

    // Prepare update data for UserSubscription
    const updateData: Partial<UserSubscription> = {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id || undefined,
      status: subscription.status,
      tier: subscriptionTier,
      stripeCustomerId: userSubscription.stripeCustomerId || customerId,
      currentPeriodStart: new Date(subscription.items.data[0]?.current_period_start * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    };

    // Set subscription end date for active/trialing subscriptions
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
      if (currentPeriodEnd) {
        updateData.currentPeriodEnd = new Date(currentPeriodEnd * 1000);
        logger.info(
          `📅 Set subscription end date to: ${updateData.currentPeriodEnd} for active/trialing`
        );
      }
    } else if (subscription.status === 'canceled') {
      const cancelAt = subscription.cancel_at;
      const currentPeriodEnd = subscription.cancel_at;

      if (cancelAt) {
        updateData.currentPeriodEnd = new Date(cancelAt * 1000);
        logger.info(
          `📅 Canceled subscription will end at (cancel_at): ${updateData.currentPeriodEnd}`
        );
      } else if (currentPeriodEnd) {
        updateData.currentPeriodEnd = new Date(currentPeriodEnd * 1000);
        logger.info(
          `📅 Canceled subscription will end at (ended_at): ${updateData.currentPeriodEnd}`
        );
      } else if (subscription.ended_at) {
        // Fallback for already ended subscriptions
        updateData.currentPeriodEnd = new Date(subscription.ended_at * 1000);
        logger.info(
          `📅 Canceled subscription already ended at (ended_at): ${updateData.currentPeriodEnd}`
        );
      }
    }

    logger.info(`📊 Updating subscription ${subscription.id} with data:`, {
      stripePriceId: updateData.stripePriceId,
      currentPeriodStart: updateData.currentPeriodStart?.toISOString(),
      currentPeriodEnd: updateData.currentPeriodEnd?.toISOString(),
      cancelAtPeriodEnd: updateData.cancelAtPeriodEnd,
      status: updateData.status,
      tier: updateData.tier,
    });

    const oldTier = userSubscription.tier;

    await userSubscription.update(updateData);
    logger.info(
      `📝 Updated UserSubscription for userId ${userSubscription.userId} (ID: ${userSubscription.id})`
    );

    if (
      oldTier !== subscriptionTier &&
      (subscription.status === 'active' || subscription.status === 'trialing')
    ) {
      await BillingService.handleTierChangeWithOldTier(
        userSubscription.userId,
        oldTier as 'trial' | 'core' | 'pro',
        subscriptionTier as 'trial' | 'core' | 'pro'
      );
    } else if (oldTier !== subscriptionTier) {
      // Log why we're skipping bonus (for debugging)
      logger.info(
        `ℹ️ Skipping upgrade bonus because subscription status is ${subscription.status}`
      );
    } else {
      // Apply daily/monthly resets for same tier changes
      await BillingService.applyDailyAndMonthlyResets(userSubscription.userId);
      logger.info(
        ` BillingService.applyDailyAndMonthlyResets called for user ${userSubscription.userId} after subscription update.`
      );
    }
  } catch (error) {
    logger.error(`Error updating/creating user subscription from webhook: ${error}`);
    throw error;
  }
};

/**
 * Helper function to handle subscription deletion events.
 */
const handleSubscriptionDeletion = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.customer as string;

    const userSubscription = await UserSubscription.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (!userSubscription || !userSubscription.userId) {
      logger.error(
        `❌ UserSubscription record for Stripe customer ID ${customerId} not found or missing userId. Cannot handle deletion.`
      );
      throw new Error(
        `UserSubscription record for Stripe customer ID ${customerId} not found or missing userId.`
      );
    }

    logger.info(
      `📊 Processing subscription deletion for Stripe subscription ID: ${subscription.id} for userId: ${userSubscription.userId}`
    );

    // Update the status and set endsAt if not already set by a prior 'canceled' event
    // The status here depends on how you want to represent a 'deleted' subscription.
    // 'trial' might be the default if you downgrade them immediately, or 'inactive'/'ended'
    // if you maintain the record but disable features.

    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const updateData: Partial<UserSubscription> = {
      status: 'canceled',
      tier: 'trial',
      stripePriceId: undefined,
      currentPeriodStart: now,
      currentPeriodEnd: trialEndDate,
      cancelAtPeriodEnd: false,
    };

    if (!userSubscription.currentPeriodEnd) {
      const endedAt = subscription.ended_at;
      if (endedAt) {
        updateData.currentPeriodEnd = new Date(endedAt * 1000);
      } else {
        updateData.currentPeriodEnd = new Date();
        logger.warn(
          `⚠️ No 'ended_at' found for deleted subscription ${subscription.id}. Setting endsAt to now.`
        );
      }
    }

    await userSubscription.update(updateData);
    logger.info(
      `📝 UserSubscription for userId ${userSubscription.userId} (ID: ${userSubscription.id}) marked as deleted/inactive.`
    );

    const oldTier = userSubscription.tier;
    await BillingService.handleTierChangeWithOldTier(
      userSubscription.userId,
      oldTier as 'trial' | 'core' | 'pro', // their old tier (core/pro)
      'trial' // new tier
    );
    logger.info(`🦆 Reset ducks for userId ${userSubscription.userId} from ${oldTier} to trial`);
  } catch (error) {
    logger.error(`Error handling subscription deletion from webhook: ${error}`);
    throw error;
  }
};

/**
 * Get a user's active subscription from Stripe based on customer ID.
 * This method's core logic remains the same as it interacts directly with Stripe.
 */
export const getActiveSubscriptionByCustomerId = async (customerId: string) => {
  try {
    logger.info(`🔍 Looking for active subscriptions for customer: ${customerId}`);

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      logger.info(` Found active subscription: ${subscription.id}`);
      return subscription;
    }

    logger.info(`ℹ️ No active subscription found for customer: ${customerId}`);
    return null;
  } catch (error) {
    logger.error(`Error retrieving customer subscription: ${error}`);
    throw error;
  }
};

export const createTrialSubscription = async (
  userId: string,
  customerId: string
): Promise<Stripe.Subscription> => {
  try {
    // Validate required price ID
    const priceId = CORE_PRICE_ID;
    if (!priceId) {
      throw new Error('STRIPE_CORE_PRICE_ID is not configured for trial subscriptions');
    }

    // Create subscription with 3-day trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 3,
      payment_behavior: 'default_incomplete', // ← No payment method required
      // metadata: {
      //   userId: userId,
      // },
    });

    logger.info(
      ` Stripe trial subscription created: ${subscription.id} for user ${userId}. Status: ${subscription.status}`
    );

    // Optional: Immediately link subscription ID to UserSubscription (webhook will also do this)
    const userSubscription = await UserSubscription.findOne({ where: { userId } });
    if (userSubscription && !userSubscription.stripeSubscriptionId) {
      await userSubscription.update({ stripeSubscriptionId: subscription.id });
      logger.info(`🔗 Manually linked Stripe subscription ${subscription.id} to UserSubscription`);
    }

    return subscription;
  } catch (error) {
    logger.error(`❌ Failed to create trial subscription for user ${userId}:`, error);
    throw error;
  }
};

const handleSubscriptionCancellation = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.customer as string;

    const userSubscription = await UserSubscription.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (!userSubscription || !userSubscription.userId) {
      logger.error(
        `❌ UserSubscription record for Stripe customer ID ${customerId} not found or missing userId. Cannot handle cancellation.`
      );
      throw new Error(
        `UserSubscription record for Stripe customer ID ${customerId} not found or missing userId.`
      );
    }

    logger.info(
      `📊 Processing subscription cancellation for Stripe subscription ID: ${subscription.id} for userId: ${userSubscription.userId}`
    );

    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

    const updateData: Partial<UserSubscription> = {
      stripePriceId: undefined,
      status: 'canceled',
      tier: 'trial',
      currentPeriodStart: now,
      currentPeriodEnd: trialEndDate,
      cancelAtPeriodEnd: false,
    };

    // Set currentPeriodEnd to cancel_at or ended_at
    if (subscription.cancel_at) {
      updateData.currentPeriodEnd = new Date(subscription.cancel_at * 1000);
    } else if (subscription.ended_at) {
      updateData.currentPeriodEnd = new Date(subscription.ended_at * 1000);
    }

    await userSubscription.update(updateData);
    logger.info(
      `📝 UserSubscription for userId ${userSubscription.userId} (ID: ${userSubscription.id}) marked as canceled.`
    );

    // RESET DUCKS/BILLING FOR TRIAL TIER
    const oldTier = userSubscription.tier;
    await BillingService.handleTierChangeWithOldTier(
      userSubscription.userId,
      oldTier as 'trial' | 'core' | 'pro', // their old tier (core/pro)
      'trial' // new tier
    );
    logger.info(`🦆 Reset ducks for userId ${userSubscription.userId} from ${oldTier} to trial`);
  } catch (error) {
    logger.error(`Error handling subscription cancellation from webhook: ${error}`);
    throw error;
  }
};

export const getCustomerPaymentHistory = async (
  customerId: string,
  limit: number = 10,
  offset: number = 0
) => {
  try {
    // Get payment intents with expanded charges
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: limit + offset,
      expand: ['data.charges'], // This expands the charges data
    });

    // Get invoices with pagination
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: limit + offset,
    });

    // Combine and sort all transactions by date
    const allTransactions = [
      ...paymentIntents.data.map(payment => ({
        id: payment.id,
        type: 'payment',
        amount: payment.amount / 100,
        currency: payment.currency.toUpperCase(),
        status: formatStripeStatus(payment.status),
        description: payment.description || 'One-time Payment',
        created: new Date(payment.created * 1000),
        receiptUrl: (payment as any).charges?.data?.[0]?.receipt_url || null, // Typecast to access expanded charges
      })),
      ...invoices.data.map(invoice => ({
        id: invoice.id,
        type: 'invoice',
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: formatStripeStatus(invoice.status),
        description: invoice.description || 'Subscription Invoice',
        created: new Date(invoice.created * 1000),
        invoiceUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
      })),
    ].sort((a, b) => b.created.getTime() - a.created.getTime());

    // Apply pagination
    return allTransactions.slice(offset, offset + limit);
  } catch (error) {
    logger.error('Error fetching Stripe payment history:', error);
    throw new Error('Failed to fetch payment history from Stripe');
  }
};
