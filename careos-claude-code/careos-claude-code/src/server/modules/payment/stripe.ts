/**
 * Stripe Client Wrapper
 * Typed helpers for CareOS payment operations.
 */
import Stripe from 'stripe';
import { config } from '../../config/settings.js';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!config.stripe.secretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripeInstance = new Stripe(config.stripe.secretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return stripeInstance;
}

export async function createCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>,
): Promise<Stripe.Customer> {
  const stripe = getStripe();
  return stripe.customers.create({
    email,
    name,
    metadata: metadata ?? {},
  });
}

export async function attachPaymentMethod(
  customerId: string,
  paymentMethodId: string,
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripe();
  return stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
}

export async function chargeOneTime(
  customerId: string,
  amountCents: number,
  paymentMethodId: string,
  description: string,
  metadata?: Record<string, string>,
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
    description,
    metadata: {
      ...metadata,
      hsa_fsa_eligible: 'true',
    },
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId: string,
  metadata?: Record<string, string>,
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    default_payment_method: paymentMethodId,
    metadata: metadata ?? {},
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Create a Stripe Checkout Session for LMN purchase ($199)
 * Used by public LMN request flow — no auth required
 */
export async function createLMNCheckoutSession(
  customerEmail: string,
  patientName: string,
  successUrl: string,
  cancelUrl: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Letter of Medical Necessity',
            description: `Physician-reviewed LMN for ${patientName} — HSA/FSA eligible. Valid 12 months.`,
            metadata: {
              type: 'lmn',
              patient_name: patientName,
              hsa_fsa_eligible: 'true',
            },
          },
          unit_amount: 19900, // $199.00
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        type: 'lmn_purchase',
        patient_name: patientName,
        hsa_fsa_eligible: 'true',
      },
    },
    metadata: {
      type: 'lmn_purchase',
      patient_name: patientName,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Promise<Stripe.Event> {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
}
