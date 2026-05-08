/\*\*

- @module StripeIntegration
- @description
- This module provides integration with the Stripe API for payment processing.
-
- ## Overview
- - Handles creation and management of Stripe payment intents.
- - Supports customer creation and retrieval.
- - Manages webhooks for payment events.
- - Provides utility functions for interacting with Stripe objects.
-
- ## Functionalities

- ### Index.ts

```
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  logger.info('⚡ Stripe webhook received');
  handleStripeWebhook(req, res).catch(err => {
    logger.error(`Unhandled error in webhook handler: ${err}`);
    if (!res.headersSent) {
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  });
});
```

-- Listens for stripe events and sending it to handleStripeWebhook to process events

-- ###

- - Verifies webhook signature
- - Filters events (only processes subscription events and subscription checkouts)
- - Delegates actual processing to stripeService.handleWebhookEvent().

- ### Stripe.service.ts

- - Creates and manages Stripe customers and subscriptions
- - Processes webhook events to sync subscription data with local database
- - Handles checkout sessions, cancellations, trials, and payment history
- - Updates user subscription tiers and billing status based on Stripe events
