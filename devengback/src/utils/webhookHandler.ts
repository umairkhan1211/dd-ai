import { Request, Response } from 'express';
import Stripe from 'stripe';
import * as stripeService from '../services/stripe.service';

/**
 * Dedicated webhook handler based on Stripe's official example
 */
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

  let event = req.body;

  // Only verify the event if we have an endpoint secret defined
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'] as string;

    console.log(`🔔 Webhook received, signature: ${signature ? 'present' : 'missing'}`);
    console.log(`📦 Body type: ${typeof req.body}, isBuffer: ${Buffer.isBuffer(req.body)}`);

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
      console.log(` Webhook signature verified: ${event.id}`);
    } catch (err: any) {
      console.log(`⚠️ Webhook signature verification failed: ${err.message}`);
      res.sendStatus(400);
      return;
    }
  } else {
    console.log('⚠️ No webhook secret defined, using raw event data');
  }

  // Handle the event
  try {
    // Handle subscription-related events
    if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object;
      console.log(`📊 Subscription event: ${event.type}, ID: ${subscription.id}`);
      await stripeService.handleWebhookEvent(event);
    }
    // Handle checkout.session.completed events
    else if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`💰 Checkout completed: ${session.id}`);

      if (session.mode === 'subscription') {
        await stripeService.handleWebhookEvent(event);
      }
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).send(`Server Error: ${error.message}`);
    }
  }
};
