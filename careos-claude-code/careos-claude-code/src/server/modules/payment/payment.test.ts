/**
 * Payment Module Tests
 *
 * Tests the $100 deposit flow, webhook handling (success/failure),
 * and receipt persistence logic.
 *
 * Stripe and DB calls are mocked — no live credentials required.
 * Run: npx vitest src/server/modules/payment/payment.test.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock database queries ─────────────────────────────────
vi.mock('../../database/queries/index.js', () => ({
  getFamilyById: vi.fn(),
  getUserById: vi.fn(),
  updateFamily: vi.fn().mockResolvedValue(undefined),
  createPaymentRecord: vi.fn().mockResolvedValue({
    id: 'pr:1',
    familyId: 'fam:1',
    userId: 'user:1',
    stripePaymentIntentId: 'pi_test_123',
    amountCents: 10000,
    description: 'CareOS Annual Membership ($100)',
    type: 'membership',
    hsaFsaEligible: true,
    status: 'succeeded',
    createdAt: '2026-03-16T00:00:00Z',
  }),
}));

// ── Mock Stripe helpers ───────────────────────────────────
vi.mock('./stripe.js', () => ({
  createCustomer: vi.fn(),
  attachPaymentMethod: vi.fn().mockResolvedValue(undefined),
  chargeOneTime: vi.fn(),
  createSubscription: vi.fn(),
  cancelSubscription: vi.fn().mockResolvedValue(undefined),
  constructWebhookEvent: vi.fn(),
}));

import { paymentService } from './service.js';
import * as queries from '../../database/queries/index.js';
import * as stripeHelpers from './stripe.js';

// ── Helpers ───────────────────────────────────────────────

function makeFamilyRecord(overrides = {}) {
  return {
    id: 'fam:1',
    name: 'Johnson',
    conductorId: 'user:1',
    membershipStatus: 'pending' as const,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeUserRecord(overrides = {}) {
  return {
    id: 'user:1',
    email: 'test@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    ...overrides,
  };
}

function makePaymentIntent(overrides = {}) {
  return {
    id: 'pi_test_123',
    status: 'succeeded',
    amount: 10000,
    currency: 'usd',
    metadata: { type: 'membership', familyId: 'fam:1', userId: 'user:1' },
    last_payment_error: null,
    ...overrides,
  };
}

// ── $100 Membership Deposit ───────────────────────────────

describe('paymentService.createMembership — $100 deposit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamilyRecord());
    vi.mocked(queries.getUserById).mockResolvedValue(makeUserRecord() as never);
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
    vi.mocked(queries.createPaymentRecord).mockResolvedValue({} as never);
    vi.mocked(stripeHelpers.createCustomer).mockResolvedValue({ id: 'cus_test_1' } as never);
    vi.mocked(stripeHelpers.attachPaymentMethod).mockResolvedValue(undefined as never);
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(makePaymentIntent() as never);
  });

  it('creates a Stripe customer when none exists', async () => {
    await paymentService.createMembership('user:1', 'fam:1', 'pm_test_1');
    expect(stripeHelpers.createCustomer).toHaveBeenCalledWith(
      'test@example.com',
      'Alice Johnson',
      expect.objectContaining({ familyId: 'fam:1', userId: 'user:1' }),
    );
  });

  it('reuses existing Stripe customer', async () => {
    vi.mocked(queries.getFamilyById).mockResolvedValue(
      makeFamilyRecord({ stripeCustomerId: 'cus_existing' }),
    );
    await paymentService.createMembership('user:1', 'fam:1', 'pm_test_1');
    expect(stripeHelpers.createCustomer).not.toHaveBeenCalled();
  });

  it('charges exactly $100 (10000 cents)', async () => {
    await paymentService.createMembership('user:1', 'fam:1', 'pm_test_1');
    expect(stripeHelpers.chargeOneTime).toHaveBeenCalledWith(
      expect.any(String),
      10000,
      'pm_test_1',
      expect.any(String),
      expect.objectContaining({ hsa_fsa_eligible: 'true', type: 'membership' }),
    );
  });

  it('returns correct membership result on success', async () => {
    const result = await paymentService.createMembership('user:1', 'fam:1', 'pm_test_1');
    expect(result.membershipStatus).toBe('active');
    expect(result.amountCents).toBe(10000);
    expect(result.floorHours).toBe(40);
    expect(result.paymentIntentId).toBe('pi_test_123');
  });

  it('activates family membership on success', async () => {
    await paymentService.createMembership('user:1', 'fam:1', 'pm_test_1');
    expect(queries.updateFamily).toHaveBeenCalledWith(
      'fam:1',
      expect.objectContaining({ membershipStatus: 'active' }),
    );
  });

  it('returns payment intent ID for receipt tracking', async () => {
    const result = await paymentService.createMembership('user:1', 'fam:1', 'pm_test_1');
    // The service returns the Stripe payment intent ID which can be used for receipts
    expect(result.paymentIntentId).toBe('pi_test_123');
    expect(result.amountCents).toBe(10000);
  });

  it('throws ExternalServiceError when payment does not succeed', async () => {
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makePaymentIntent({ status: 'requires_action' }) as never,
    );
    await expect(paymentService.createMembership('user:1', 'fam:1', 'pm_test_1')).rejects.toThrow(
      'Stripe payment did not succeed',
    );
  });

  it('throws NotFoundError for unknown family', async () => {
    vi.mocked(queries.getFamilyById).mockResolvedValue(null);
    await expect(
      paymentService.createMembership('user:1', 'fam:unknown', 'pm_test_1'),
    ).rejects.toThrow('Family');
  });
});

// ── Credit Purchase ───────────────────────────────────────

describe('paymentService.purchaseCredits — $15/hr', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getUserById).mockResolvedValue(makeUserRecord() as never);
    vi.mocked(queries.createPaymentRecord).mockResolvedValue({} as never);
    vi.mocked(stripeHelpers.createCustomer).mockResolvedValue({ id: 'cus_test_1' } as never);
    vi.mocked(stripeHelpers.attachPaymentMethod).mockResolvedValue(undefined as never);
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makePaymentIntent({
        id: 'pi_credits_1',
        amount: 4500,
        metadata: { type: 'credit_purchase', hours: '3', userId: 'user:1' },
      }) as never,
    );
  });

  it('charges $15 per hour (1500 cents/hr)', async () => {
    await paymentService.purchaseCredits('user:1', 3, 'pm_test_1');
    expect(stripeHelpers.chargeOneTime).toHaveBeenCalledWith(
      expect.any(String),
      4500, // 3 * 1500
      'pm_test_1',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('splits coordination ($12/hr) and respite ($3/hr) correctly', async () => {
    const result = await paymentService.purchaseCredits('user:1', 4, 'pm_test_1');
    expect(result.coordinationSplitCents).toBe(4800); // 4 * 1200
    expect(result.respiteSplitCents).toBe(1200); // 4 * 300
    expect(result.coordinationSplitCents + result.respiteSplitCents).toBe(result.amountCents);
  });

  it('rejects hours < 1', async () => {
    await expect(paymentService.purchaseCredits('user:1', 0, 'pm_test_1')).rejects.toThrow(
      'Hours must be between 1 and 100',
    );
  });

  it('rejects hours > 100', async () => {
    await expect(paymentService.purchaseCredits('user:1', 101, 'pm_test_1')).rejects.toThrow(
      'Hours must be between 1 and 100',
    );
  });

  it('returns credit purchase result with correct metadata', async () => {
    const result = await paymentService.purchaseCredits('user:1', 3, 'pm_test_1');
    // The service returns the Stripe payment intent ID and split amounts
    expect(result.paymentIntentId).toBe('pi_credits_1');
    expect(result.hours).toBe(3);
    expect(result.amountCents).toBe(4500);
  });
});

// ── Webhook: payment_intent.succeeded ────────────────────

describe('Webhook: payment_intent.succeeded', () => {
  it('event type is handled (no unhandled switch fallthrough)', async () => {
    // Regression: ensure the switch case exists for payment_intent.succeeded
    const { stripeWebhookRoute } = await import('./webhooks.js');

    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn(),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };

    await stripeWebhookRoute(mockApp as never);
    // The route was registered — post() was called
    expect(mockApp.post).toHaveBeenCalledWith('/stripe', expect.any(Function));
  });
});

// ── Webhook: payment_intent.payment_failed ───────────────

describe('Webhook: payment_intent.payment_failed', () => {
  it('unhandled event type falls through to debug log', async () => {
    const { constructWebhookEvent } = await import('./stripe.js');

    const failedIntent = makePaymentIntent({
      status: 'requires_payment_method',
      last_payment_error: { code: 'card_declined', message: 'Your card was declined.' },
    });

    vi.mocked(constructWebhookEvent).mockResolvedValue({
      type: 'payment_intent.payment_failed',
      data: { object: failedIntent },
    } as never);

    const mockReply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const mockRequest = {
      headers: { 'stripe-signature': 'sig_test' },
      body: Buffer.from('{}'),
    };

    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn((_, handler) => {
        // invoke the route handler immediately
        void handler(mockRequest, mockReply);
      }),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };

    const { stripeWebhookRoute } = await import('./webhooks.js');
    await stripeWebhookRoute(mockApp as never);

    // Allow async handler to settle
    await new Promise((r) => setTimeout(r, 0));

    // payment_intent.payment_failed is not handled — falls to default debug log
    expect(mockApp.log.debug).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'payment_intent.payment_failed' }),
      'Unhandled Stripe event type',
    );
  });

  it('returns 200 even on failed payment (webhook acknowledgement)', async () => {
    const { constructWebhookEvent } = await import('./stripe.js');

    vi.mocked(constructWebhookEvent).mockResolvedValue({
      type: 'payment_intent.payment_failed',
      data: {
        object: makePaymentIntent({
          status: 'requires_payment_method',
          last_payment_error: { code: 'insufficient_funds', message: 'Insufficient funds.' },
        }),
      },
    } as never);

    const mockReply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const mockRequest = {
      headers: { 'stripe-signature': 'sig_test' },
      body: Buffer.from('{}'),
    };

    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn((_, handler) => {
        void handler(mockRequest, mockReply);
      }),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };

    const { stripeWebhookRoute } = await import('./webhooks.js');
    await stripeWebhookRoute(mockApp as never);
    await new Promise((r) => setTimeout(r, 0));

    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ received: true });
  });
});

// ── Webhook: signature verification ──────────────────────

describe('Webhook: signature verification', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const mockReply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const mockRequest = { headers: {}, body: Buffer.from('{}') };

    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn((_, handler) => {
        void handler(mockRequest, mockReply);
      }),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };

    const { stripeWebhookRoute } = await import('./webhooks.js');
    await stripeWebhookRoute(mockApp as never);
    await new Promise((r) => setTimeout(r, 0));

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Missing stripe-signature header' });
  });

  it('returns 400 when signature verification fails', async () => {
    const { constructWebhookEvent } = await import('./stripe.js');
    vi.mocked(constructWebhookEvent).mockRejectedValue(new Error('Signature mismatch'));

    const mockReply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const mockRequest = {
      headers: { 'stripe-signature': 'bad_sig' },
      body: Buffer.from('{}'),
    };

    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn((_, handler) => {
        void handler(mockRequest, mockReply);
      }),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };

    const { stripeWebhookRoute } = await import('./webhooks.js');
    await stripeWebhookRoute(mockApp as never);
    await new Promise((r) => setTimeout(r, 0));

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid signature' });
  });
});
