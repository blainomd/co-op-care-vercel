/**
 * Stripe Webhook Handler
 * Processes payment_intent.succeeded, subscription events, charge.refunded
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type Stripe from 'stripe';
import { constructWebhookEvent } from './stripe.js';
import { updateFamily } from '../../database/queries/index.js';

/**
 * Handle payment_intent.succeeded — log successful payment
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  log: FastifyInstance['log'],
): Promise<void> {
  const type = paymentIntent.metadata?.type;
  log.info({ paymentIntentId: paymentIntent.id, type }, 'Payment succeeded');

  if (type === 'credit_purchase') {
    const hours = Number(paymentIntent.metadata?.hours ?? 0);
    const userId = paymentIntent.metadata?.userId;
    log.info({ userId, hours }, 'Credit purchase confirmed via webhook');
    // Ledger credit is applied synchronously in the route handler.
    // This webhook serves as a confirmation/audit trail.
  }
}

/**
 * Handle subscription.created — update family subscription ID
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  log: FastifyInstance['log'],
): Promise<void> {
  const familyId = subscription.metadata?.familyId;
  if (familyId) {
    await updateFamily(familyId, { stripeSubscriptionId: subscription.id });
    log.info({ familyId, subscriptionId: subscription.id }, 'Subscription linked');
  }
}

/**
 * Handle subscription.deleted — clear family subscription
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  log: FastifyInstance['log'],
): Promise<void> {
  const familyId = subscription.metadata?.familyId;
  if (familyId) {
    await updateFamily(familyId, { stripeSubscriptionId: null });
    log.info({ familyId }, 'Subscription cancelled');
  }
}

/**
 * Handle charge.refunded — log refund
 */
async function handleChargeRefunded(
  charge: Stripe.Charge,
  log: FastifyInstance['log'],
): Promise<void> {
  log.info({ chargeId: charge.id, amountRefunded: charge.amount_refunded }, 'Charge refunded');
}

/**
 * Register the Stripe webhook route.
 * Must use raw body for signature verification.
 */
export async function stripeWebhookRoute(app: FastifyInstance): Promise<void> {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (_req: FastifyRequest, body: Buffer, done: (err: Error | null, body?: Buffer) => void) => {
      done(null, body);
    },
  );

  app.post('/stripe', async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      reply.status(400).send({ error: 'Missing stripe-signature header' });
      return;
    }

    let event: Stripe.Event;
    try {
      event = await constructWebhookEvent(request.body as Buffer, signature);
    } catch (err) {
      app.log.warn({ err }, 'Stripe webhook signature verification failed');
      reply.status(400).send({ error: 'Invalid signature' });
      return;
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, app.log);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, app.log);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, app.log);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge, app.log);
        break;
      default:
        app.log.debug({ type: event.type }, 'Unhandled Stripe event type');
    }

    reply.status(200).send({ received: true });
  });
}
