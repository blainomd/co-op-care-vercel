/**
 * Billing Agent — Autonomous Stripe billing on LMN signature
 *
 * The metabolic system. When Josh signs an LMN:
 * 1. Creates Stripe PaymentIntent for LMN fee ($150-300)
 * 2. Sends family their signed LMN PDF
 * 3. Sends HSA/FSA filing instructions
 * 4. If family selects care plan: creates Stripe subscription
 *
 * All billing is HSA/FSA-enabled (Stripe merchant category code 8099).
 */
import { BaseAgent } from './base-agent.js';
import { updateJourneyData } from './care-journey.js';
import { logger } from '../common/logger.js';
import type { CareEvent } from './event-bus.js';

// ─── LMN Pricing ────────────────────────────────────────────────────────

const LMN_PRICING: Record<string, number> = {
  low: 15000, // $150 in cents
  moderate: 20000, // $200
  high: 25000, // $250
  critical: 30000, // $300
};

// ─── Invoice Records ────────────────────────────────────────────────────

export interface BillingRecord {
  id: string;
  familyId: string;
  type: 'lmn' | 'subscription';
  amount: number; // cents
  status: 'pending' | 'paid' | 'failed';
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  lmnId?: string;
  autoApproved?: boolean;
  triageTier?: string;
  createdAt: Date;
  paidAt?: Date;
}

// In-memory billing records (Phase 1)
const billingRecords: BillingRecord[] = [];

export function getBillingRecords(familyId?: string): BillingRecord[] {
  return familyId ? billingRecords.filter((r) => r.familyId === familyId) : billingRecords;
}

// ─── Agent ──────────────────────────────────────────────────────────────

export class BillingAgent extends BaseAgent {
  constructor() {
    super({
      name: 'billing',
      description: 'Auto-creates Stripe invoices when LMNs are signed',
      subscribesTo: ['lmn.signed'],
      enabled: true,
    });
  }

  protected async handle(event: CareEvent): Promise<void> {
    const { familyId, payload } = event;
    // Determine LMN fee based on acuity
    const acuity = (payload.acuity as string) ?? 'moderate';
    const amount = LMN_PRICING[acuity] ?? LMN_PRICING.moderate;

    const record: BillingRecord = {
      id: `bill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      familyId,
      type: 'lmn',
      amount: amount!,
      status: 'pending',
      lmnId: payload.draftId as string,
      autoApproved: (payload.autoApproved as boolean) ?? false,
      triageTier: payload.triageTier as string,
      createdAt: new Date(),
    };

    billingRecords.push(record);

    logger.info(
      {
        billingId: record.id,
        familyId,
        amount: amount! / 100,
        acuity,
        careRecipientName: payload.careRecipientName,
      },
      `Billing: LMN invoice created — $${amount! / 100}`,
    );

    // Try to create Stripe PaymentIntent
    try {
      const stripe = await this.getStripeClient();
      if (stripe) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount!,
          currency: 'usd',
          description: `Letter of Medical Necessity — ${payload.careRecipientName}`,
          metadata: {
            familyId,
            lmnId: payload.draftId as string,
            type: 'lmn',
            careRecipientName: payload.careRecipientName as string,
            careRecipientState: payload.careRecipientState as string,
          },
        });

        record.stripePaymentIntentId = paymentIntent.id;
        logger.info(
          { billingId: record.id, stripeId: paymentIntent.id },
          'Stripe PaymentIntent created for LMN',
        );
      }
    } catch (err) {
      logger.warn(
        { err, familyId },
        'Stripe PaymentIntent creation failed — invoice still pending',
      );
    }

    // Emit billing event
    await this.emit('billing.invoice_created', familyId, {
      billingId: record.id,
      amount: amount! / 100,
      type: 'lmn',
      stripePaymentIntentId: record.stripePaymentIntentId,
      lmnId: payload.draftId,
      careRecipientName: payload.careRecipientName,
      hsaFsaEligible: true,
      hsaSavingsEstimate: payload.estimatedHsaSavings,
    });

    // Update journey billing data
    updateJourneyData(familyId, {
      billing: { lmnPaid: false },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getStripeClient(): Promise<any> {
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeKey) {
      logger.info('STRIPE_SECRET_KEY not set — billing in simulation mode');
      return null;
    }
    try {
      const { default: Stripe } = await import('stripe');
      return new Stripe(stripeKey);
    } catch {
      return null;
    }
  }
}

/**
 * Mark an invoice as paid (called from Stripe webhook or manual).
 */
export async function markInvoicePaid(billingId: string): Promise<BillingRecord | null> {
  const record = billingRecords.find((r) => r.id === billingId);
  if (!record) return null;

  record.status = 'paid';
  record.paidAt = new Date();

  updateJourneyData(record.familyId, {
    billing: { lmnPaid: true },
  });

  const { eventBus } = await import('./event-bus.js');
  await eventBus.emit({
    type: 'billing.paid',
    familyId: record.familyId,
    source: 'billing',
    payload: {
      billingId: record.id,
      amount: record.amount / 100,
      type: record.type,
    },
    timestamp: new Date(),
  });

  logger.info({ billingId, familyId: record.familyId }, 'Invoice marked paid');
  return record;
}
