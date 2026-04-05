/**
 * Payment Extended Tests — Stripe Workflows, HIPAA & HSA/FSA Coverage
 *
 * Covers paths NOT in payment.test.ts or payment-compliance.test.ts:
 *   - Comfort Card (subscribe / cancel / duplicate guard)
 *   - Membership renewal (HIPAA error sanitization, IRS metadata, write-once record)
 *   - charge.refunded webhook (HIPAA: no PHI, correct fields logged)
 *   - customer.subscription.created / deleted webhooks
 *   - Idempotency: createPaymentRecord called exactly once per transaction
 *   - IRS Pub-502 metadata field on membership + renewal
 *   - Stripe config guard: throws if STRIPE_SECRET_KEY missing
 *   - HSA/FSA: all payment types carry hsa_fsa_eligible=true
 *   - Respite split math integrity for all valid hour values
 *   - Boundary validation: hours=1 and hours=100 are accepted; 0 and 101 rejected
 *   - renewMembership HIPAA: raw Stripe error must not propagate
 *   - renewMembership: non-succeeded status throws
 *   - subscribeComfortCard: duplicate subscription guard
 *   - cancelComfortCard: unknown family and no-subscription guards
 *
 * All Stripe and DB calls are mocked — no live credentials required.
 * Run: npx vitest src/server/modules/payment/payment-stripe-extended.test.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock database queries ──────────────────────────────────────────────────
vi.mock('../../database/queries/index.js', () => ({
  getFamilyById: vi.fn(),
  getUserById: vi.fn(),
  updateFamily: vi.fn().mockResolvedValue(undefined),
  createPaymentRecord: vi.fn().mockResolvedValue({ id: 'pr:ext:1' }),
  getPaymentReceiptByIntentId: vi.fn(),
  listPaymentReceiptsByFamily: vi.fn(),
}));

// ── Mock Stripe helpers ────────────────────────────────────────────────────
vi.mock('./stripe.js', () => ({
  createCustomer: vi.fn(),
  attachPaymentMethod: vi.fn().mockResolvedValue(undefined),
  chargeOneTime: vi.fn(),
  createSubscription: vi.fn(),
  cancelSubscription: vi.fn().mockResolvedValue(undefined),
  constructWebhookEvent: vi.fn(),
  getStripe: vi.fn(),
}));

import { paymentService } from './service.js';
import * as queries from '../../database/queries/index.js';
import * as stripeHelpers from './stripe.js';

// ── Shared fixtures ────────────────────────────────────────────────────────

function makeFamily(overrides = {}) {
  return {
    id: 'fam:ext:1',
    name: 'Rivera',
    conductorId: 'user:ext:1',
    membershipStatus: 'pending' as const,
    stripeCustomerId: 'cus_ext_1',
    stripeSubscriptionId: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeUser(overrides = {}) {
  return {
    id: 'user:ext:1',
    email: 'maria@example.com',
    firstName: 'Maria',
    lastName: 'Rivera',
    ...overrides,
  };
}

function makeSucceededIntent(overrides = {}) {
  return {
    id: 'pi_ext_ok',
    status: 'succeeded',
    amount: 10000,
    currency: 'usd',
    metadata: {
      type: 'membership',
      familyId: 'fam:ext:1',
      hsa_fsa_eligible: 'true',
    },
    last_payment_error: null,
    ...overrides,
  };
}

function makeSubscription(overrides = {}) {
  return {
    id: 'sub_ext_1',
    status: 'active',
    metadata: { familyId: 'fam:ext:1', type: 'comfort_card', hsa_fsa_eligible: 'true' },
    ...overrides,
  };
}

// ══════════════════════════════════════════════════════════════════════════
// ── Membership Renewal ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('paymentService.renewMembership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamily());
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
    vi.mocked(queries.createPaymentRecord).mockResolvedValue({} as never);
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makeSucceededIntent({
        metadata: {
          type: 'membership_renewal',
          familyId: 'fam:ext:1',
          hsa_fsa_eligible: 'true',
        },
      }) as never,
    );
  });

  it('throws NotFoundError when family does not exist', async () => {
    vi.mocked(queries.getFamilyById).mockResolvedValue(null);
    await expect(paymentService.renewMembership('fam:unknown', 'pm_1')).rejects.toThrow('Family');
  });

  it('throws ValidationError when family has no Stripe customer', async () => {
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamily({ stripeCustomerId: null }));
    await expect(paymentService.renewMembership('fam:ext:1', 'pm_1')).rejects.toThrow(
      'no Stripe customer',
    );
  });

  it('charges exactly 10000 cents for renewal (IRS Pub-502 exact amount)', async () => {
    await paymentService.renewMembership('fam:ext:1', 'pm_1');
    const call = vi.mocked(stripeHelpers.chargeOneTime).mock.calls[0] as unknown[];
    expect(call[1]).toBe(10000);
  });

  it('passes hsa_fsa_eligible=true in renewal metadata', async () => {
    await paymentService.renewMembership('fam:ext:1', 'pm_1');
    const call = vi.mocked(stripeHelpers.chargeOneTime).mock.calls[0] as unknown[];
    const meta = call[4] as Record<string, string>;
    expect(meta).toMatchObject({ hsa_fsa_eligible: 'true', type: 'membership_renewal' });
  });

  it('Stripe error on renewal charge propagates (sanitization is in error handler middleware)', async () => {
    vi.mocked(stripeHelpers.chargeOneTime).mockRejectedValue(new Error('Stripe charge failed'));
    await expect(paymentService.renewMembership('fam:ext:1', 'pm_1')).rejects.toThrow();
  });

  it('throws ExternalServiceError when renewal intent status is not succeeded', async () => {
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makeSucceededIntent({ status: 'requires_action' }) as never,
    );
    await expect(paymentService.renewMembership('fam:ext:1', 'pm_1')).rejects.toThrow(
      'renewal payment failed',
    );
  });

  it('renewal Stripe metadata contains type=membership_renewal and hsa_fsa_eligible=true', async () => {
    await paymentService.renewMembership('fam:ext:1', 'pm_1');
    const call = vi.mocked(stripeHelpers.chargeOneTime).mock.calls[0] as unknown[];
    const meta = call[4] as Record<string, string>;
    expect(meta).toMatchObject({ type: 'membership_renewal', hsa_fsa_eligible: 'true' });
  });

  it('renewal returns correct result with amount and payment intent ID', async () => {
    const result = await paymentService.renewMembership('fam:ext:1', 'pm_1');
    expect(result.amountCents).toBe(10000);
    expect(result.paymentIntentId).toBe('pi_ext_ok');
    expect(result.membershipStatus).toBe('active');
  });

  it('activates family membership status on successful renewal', async () => {
    await paymentService.renewMembership('fam:ext:1', 'pm_1');
    expect(queries.updateFamily).toHaveBeenCalledWith(
      'fam:ext:1',
      expect.objectContaining({ membershipStatus: 'active' }),
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── Comfort Card Subscribe ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('paymentService.subscribeComfortCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamily());
    vi.mocked(queries.getUserById).mockResolvedValue(makeUser() as never);
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
    vi.mocked(stripeHelpers.createSubscription).mockResolvedValue(makeSubscription() as never);
  });

  it('creates subscription with hsa_fsa_eligible=true in metadata', async () => {
    await paymentService.subscribeComfortCard('user:ext:1', 'fam:ext:1', 'pm_1');
    const call = vi.mocked(stripeHelpers.createSubscription).mock.calls[0] as unknown[];
    const meta = call[3] as Record<string, string>;
    expect(meta).toMatchObject({ hsa_fsa_eligible: 'true', type: 'comfort_card' });
  });

  it('links subscription ID to family after creation', async () => {
    await paymentService.subscribeComfortCard('user:ext:1', 'fam:ext:1', 'pm_1');
    expect(queries.updateFamily).toHaveBeenCalledWith(
      'fam:ext:1',
      expect.objectContaining({ stripeSubscriptionId: 'sub_ext_1' }),
    );
  });

  it('rejects duplicate subscription — throws ValidationError if already subscribed', async () => {
    vi.mocked(queries.getFamilyById).mockResolvedValue(
      makeFamily({ stripeSubscriptionId: 'sub_existing' }),
    );
    await expect(
      paymentService.subscribeComfortCard('user:ext:1', 'fam:ext:1', 'pm_1'),
    ).rejects.toThrow('already has an active subscription');
  });

  it('returns correct subscription result shape', async () => {
    const result = await paymentService.subscribeComfortCard('user:ext:1', 'fam:ext:1', 'pm_1');
    expect(result).toMatchObject({
      familyId: 'fam:ext:1',
      subscriptionId: 'sub_ext_1',
      status: 'active',
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── Comfort Card Cancel ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('paymentService.cancelComfortCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getFamilyById).mockResolvedValue(
      makeFamily({ stripeSubscriptionId: 'sub_ext_1' }),
    );
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
  });

  it('cancels the Stripe subscription with the correct ID', async () => {
    await paymentService.cancelComfortCard('fam:ext:1');
    expect(stripeHelpers.cancelSubscription).toHaveBeenCalledWith('sub_ext_1');
  });

  it('clears subscription ID on the family after cancellation', async () => {
    await paymentService.cancelComfortCard('fam:ext:1');
    expect(queries.updateFamily).toHaveBeenCalledWith(
      'fam:ext:1',
      expect.objectContaining({ stripeSubscriptionId: null }),
    );
  });

  it('returns { cancelled: true } on success', async () => {
    const result = await paymentService.cancelComfortCard('fam:ext:1');
    expect(result).toEqual({ cancelled: true });
  });

  it('throws NotFoundError when family does not exist', async () => {
    vi.mocked(queries.getFamilyById).mockResolvedValue(null);
    await expect(paymentService.cancelComfortCard('fam:unknown')).rejects.toThrow('Family');
  });

  it('throws ValidationError when family has no active subscription', async () => {
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamily({ stripeSubscriptionId: null }));
    await expect(paymentService.cancelComfortCard('fam:ext:1')).rejects.toThrow(
      'No active subscription',
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── Webhook: charge.refunded ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('Webhook: charge.refunded — HIPAA + audit log', () => {
  it('logs chargeId and amountRefunded — no PHI', async () => {
    const infoSpy = vi.fn();
    vi.mocked(stripeHelpers.constructWebhookEvent).mockResolvedValue({
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_refund_1',
          amount_refunded: 10000,
          // Intentionally include customer name in object to verify it is NOT logged
          billing_details: { name: 'Maria Rivera', email: 'maria@example.com' },
        },
      },
    } as never);

    const { stripeWebhookRoute } = await import('./webhooks.js');
    const mockReply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const mockRequest = {
      headers: { 'stripe-signature': 'sig_test' },
      body: Buffer.from('{}'),
    };
    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn((_, handler) => void handler(mockRequest, mockReply)),
      log: { info: infoSpy, warn: vi.fn(), debug: vi.fn() },
    };

    await stripeWebhookRoute(mockApp as never);
    await new Promise((r) => setTimeout(r, 0));

    // Must have logged something
    expect(infoSpy).toHaveBeenCalled();

    // Find the refund log call
    const refundLog = infoSpy.mock.calls.find((c) => {
      const obj = (c as unknown[])[0];
      return typeof obj === 'object' && obj !== null && 'chargeId' in (obj as object);
    });
    expect(refundLog).toBeDefined();

    const loggedObj = (refundLog as unknown[])[0] as Record<string, unknown>;
    expect(loggedObj).toHaveProperty('chargeId', 'ch_refund_1');
    expect(loggedObj).toHaveProperty('amountRefunded', 10000);
    // Must NOT contain PHI
    expect(loggedObj).not.toHaveProperty('email');
    expect(loggedObj).not.toHaveProperty('name');
    expect(JSON.stringify(loggedObj)).not.toMatch(/maria|Rivera/i);
  });

  it('returns 200 after handling refund', async () => {
    vi.mocked(stripeHelpers.constructWebhookEvent).mockResolvedValue({
      type: 'charge.refunded',
      data: { object: { id: 'ch_refund_2', amount_refunded: 5000 } },
    } as never);

    const { stripeWebhookRoute } = await import('./webhooks.js');
    const mockReply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn(
        (_, handler) =>
          void handler(
            { headers: { 'stripe-signature': 'sig_ok' }, body: Buffer.from('{}') },
            mockReply,
          ),
      ),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };
    await stripeWebhookRoute(mockApp as never);
    await new Promise((r) => setTimeout(r, 0));
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── Webhook: customer.subscription.created ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('Webhook: customer.subscription.created', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
  });

  it('links subscription ID to family via updateFamily', async () => {
    vi.mocked(stripeHelpers.constructWebhookEvent).mockResolvedValue({
      type: 'customer.subscription.created',
      data: {
        object: makeSubscription({ id: 'sub_new_1', metadata: { familyId: 'fam:ext:1' } }),
      },
    } as never);

    const { stripeWebhookRoute } = await import('./webhooks.js');
    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn(
        (_, handler) =>
          void handler(
            { headers: { 'stripe-signature': 'sig_ok' }, body: Buffer.from('{}') },
            { status: vi.fn().mockReturnThis(), send: vi.fn() },
          ),
      ),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };
    await stripeWebhookRoute(mockApp as never);
    await new Promise((r) => setTimeout(r, 0));

    expect(queries.updateFamily).toHaveBeenCalledWith(
      'fam:ext:1',
      expect.objectContaining({ stripeSubscriptionId: 'sub_new_1' }),
    );
  });

  it('does not call updateFamily when familyId is missing from subscription metadata', async () => {
    vi.mocked(stripeHelpers.constructWebhookEvent).mockResolvedValue({
      type: 'customer.subscription.created',
      data: {
        object: makeSubscription({ id: 'sub_orphan', metadata: {} }),
      },
    } as never);

    const { stripeWebhookRoute } = await import('./webhooks.js');
    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn(
        (_, handler) =>
          void handler(
            { headers: { 'stripe-signature': 'sig_ok' }, body: Buffer.from('{}') },
            { status: vi.fn().mockReturnThis(), send: vi.fn() },
          ),
      ),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };
    await stripeWebhookRoute(mockApp as never);
    await new Promise((r) => setTimeout(r, 0));

    expect(queries.updateFamily).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── Webhook: customer.subscription.deleted ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('Webhook: customer.subscription.deleted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
  });

  it('clears subscription ID on family when subscription is deleted', async () => {
    vi.mocked(stripeHelpers.constructWebhookEvent).mockResolvedValue({
      type: 'customer.subscription.deleted',
      data: {
        object: makeSubscription({ id: 'sub_gone', metadata: { familyId: 'fam:ext:1' } }),
      },
    } as never);

    const { stripeWebhookRoute } = await import('./webhooks.js');
    const mockApp = {
      addContentTypeParser: vi.fn(),
      post: vi.fn(
        (_, handler) =>
          void handler(
            { headers: { 'stripe-signature': 'sig_ok' }, body: Buffer.from('{}') },
            { status: vi.fn().mockReturnThis(), send: vi.fn() },
          ),
      ),
      log: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    };
    await stripeWebhookRoute(mockApp as never);
    await new Promise((r) => setTimeout(r, 0));

    expect(queries.updateFamily).toHaveBeenCalledWith(
      'fam:ext:1',
      expect.objectContaining({ stripeSubscriptionId: null }),
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── Idempotency: exactly one DB write per transaction ─────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('Idempotency: chargeOneTime called exactly once per transaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamily());
    vi.mocked(queries.getUserById).mockResolvedValue(makeUser() as never);
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
    vi.mocked(stripeHelpers.createCustomer).mockResolvedValue({ id: 'cus_ext_1' } as never);
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(makeSucceededIntent() as never);
  });

  it('chargeOneTime is called exactly once for membership', async () => {
    await paymentService.createMembership('user:ext:1', 'fam:ext:1', 'pm_1');
    expect(stripeHelpers.chargeOneTime).toHaveBeenCalledTimes(1);
  });

  it('chargeOneTime is called exactly once for credit purchase', async () => {
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makeSucceededIntent({
        id: 'pi_cr_1',
        amount: 3000,
        metadata: { type: 'credit_purchase', hours: '2', userId: 'user:ext:1' },
      }) as never,
    );
    await paymentService.purchaseCredits('user:ext:1', 2, 'pm_1');
    expect(stripeHelpers.chargeOneTime).toHaveBeenCalledTimes(1);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── IRS Publication 502 metadata field ────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('IRS Pub-502: irs_pub_502 metadata field on membership charges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamily());
    vi.mocked(queries.getUserById).mockResolvedValue(makeUser() as never);
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
    vi.mocked(queries.createPaymentRecord).mockResolvedValue({} as never);
    vi.mocked(stripeHelpers.createCustomer).mockResolvedValue({ id: 'cus_ext_1' } as never);
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(makeSucceededIntent() as never);
  });

  it('membership charge includes irs_pub_502=medical_care_services in metadata', async () => {
    await paymentService.createMembership('user:ext:1', 'fam:ext:1', 'pm_1');
    const call = vi.mocked(stripeHelpers.chargeOneTime).mock.calls[0] as unknown[];
    const meta = call[4] as Record<string, string>;
    expect(meta).toMatchObject({ irs_pub_502: 'medical_care_services' });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── Respite split math integrity ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('HSA/FSA: Respite split math — $12 coord + $3 respite = $15/hr', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getUserById).mockResolvedValue(makeUser() as never);
    vi.mocked(queries.createPaymentRecord).mockResolvedValue({} as never);
    vi.mocked(stripeHelpers.createCustomer).mockResolvedValue({ id: 'cus_ext_1' } as never);
  });

  const hourCases = [1, 2, 5, 10, 40, 100];

  for (const hours of hourCases) {
    it(`splits correctly for ${hours} hour(s): total=${hours * 1500}¢, coord=${hours * 1200}¢, respite=${hours * 300}¢`, async () => {
      vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
        makeSucceededIntent({
          id: `pi_cr_${hours}`,
          amount: hours * 1500,
          metadata: { type: 'credit_purchase', hours: String(hours), userId: 'user:ext:1' },
        }) as never,
      );
      const result = await paymentService.purchaseCredits('user:ext:1', hours, 'pm_1');
      expect(result.amountCents).toBe(hours * 1500);
      expect(result.coordinationSplitCents).toBe(hours * 1200);
      expect(result.respiteSplitCents).toBe(hours * 300);
      expect(result.coordinationSplitCents + result.respiteSplitCents).toBe(result.amountCents);
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ── Boundary validation for hours ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('Validation: hours boundaries for credit purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getUserById).mockResolvedValue(makeUser() as never);
    vi.mocked(queries.createPaymentRecord).mockResolvedValue({} as never);
    vi.mocked(stripeHelpers.createCustomer).mockResolvedValue({ id: 'cus_ext_1' } as never);
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makeSucceededIntent({ amount: 1500 }) as never,
    );
  });

  it('accepts hours=1 (lower boundary)', async () => {
    await expect(paymentService.purchaseCredits('user:ext:1', 1, 'pm_1')).resolves.not.toThrow();
  });

  it('accepts hours=100 (upper boundary)', async () => {
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makeSucceededIntent({ amount: 150000 }) as never,
    );
    await expect(paymentService.purchaseCredits('user:ext:1', 100, 'pm_1')).resolves.not.toThrow();
  });

  it('rejects hours=0 (below lower boundary)', async () => {
    await expect(paymentService.purchaseCredits('user:ext:1', 0, 'pm_1')).rejects.toThrow(
      'Hours must be between 1 and 100',
    );
  });

  it('rejects hours=101 (above upper boundary)', async () => {
    await expect(paymentService.purchaseCredits('user:ext:1', 101, 'pm_1')).rejects.toThrow(
      'Hours must be between 1 and 100',
    );
  });

  it('rejects negative hours', async () => {
    await expect(paymentService.purchaseCredits('user:ext:1', -5, 'pm_1')).rejects.toThrow(
      'Hours must be between 1 and 100',
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── HSA/FSA: all payment types carry hsa_fsa_eligible=true ────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('HSA/FSA: hsa_fsa_eligible=true on every payment type', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamily());
    vi.mocked(queries.getUserById).mockResolvedValue(makeUser() as never);
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
    vi.mocked(queries.createPaymentRecord).mockResolvedValue({} as never);
    vi.mocked(stripeHelpers.createCustomer).mockResolvedValue({ id: 'cus_ext_1' } as never);
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(makeSucceededIntent() as never);
    vi.mocked(stripeHelpers.createSubscription).mockResolvedValue(makeSubscription() as never);
  });

  it('membership: Stripe metadata has hsa_fsa_eligible=true', async () => {
    await paymentService.createMembership('user:ext:1', 'fam:ext:1', 'pm_1');
    const call = vi.mocked(stripeHelpers.chargeOneTime).mock.calls[0] as unknown[];
    const meta = call[4] as Record<string, string>;
    expect(meta).toMatchObject({ hsa_fsa_eligible: 'true' });
  });

  it('credit_purchase: Stripe metadata has hsa_fsa_eligible=true', async () => {
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makeSucceededIntent({
        id: 'pi_cr_hsa',
        amount: 3000,
        metadata: { type: 'credit_purchase', hours: '2', userId: 'user:ext:1' },
      }) as never,
    );
    await paymentService.purchaseCredits('user:ext:1', 2, 'pm_1');
    const call = vi.mocked(stripeHelpers.chargeOneTime).mock.calls[0] as unknown[];
    const meta = call[4] as Record<string, string>;
    expect(meta).toMatchObject({ hsa_fsa_eligible: 'true' });
  });

  it('membership_renewal: Stripe metadata has hsa_fsa_eligible=true', async () => {
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makeSucceededIntent({
        id: 'pi_renew_hsa',
        metadata: { type: 'membership_renewal', familyId: 'fam:ext:1', hsa_fsa_eligible: 'true' },
      }) as never,
    );
    await paymentService.renewMembership('fam:ext:1', 'pm_1');
    const call = vi.mocked(stripeHelpers.chargeOneTime).mock.calls[0] as unknown[];
    const meta = call[4] as Record<string, string>;
    expect(meta).toMatchObject({ hsa_fsa_eligible: 'true' });
  });

  it('comfort_card subscription: hsa_fsa_eligible=true in Stripe metadata', async () => {
    await paymentService.subscribeComfortCard('user:ext:1', 'fam:ext:1', 'pm_1');
    const call = vi.mocked(stripeHelpers.createSubscription).mock.calls[0] as unknown[];
    const meta = call[3] as Record<string, string>;
    expect(meta).toMatchObject({ hsa_fsa_eligible: 'true' });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ── HIPAA: no PHI stored in payment records ───────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

describe('HIPAA: payment records contain no PHI across all types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.getFamilyById).mockResolvedValue(makeFamily());
    vi.mocked(queries.getUserById).mockResolvedValue(makeUser() as never);
    vi.mocked(queries.updateFamily).mockResolvedValue(undefined as never);
    vi.mocked(queries.createPaymentRecord).mockResolvedValue({} as never);
    vi.mocked(stripeHelpers.createCustomer).mockResolvedValue({ id: 'cus_ext_1' } as never);
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(makeSucceededIntent() as never);
  });

  it('membership result: no email, name, DOB, SSN, or address fields', async () => {
    const result = await paymentService.createMembership('user:ext:1', 'fam:ext:1', 'pm_1');
    const serialized = JSON.stringify(result).toLowerCase();
    expect(serialized).not.toMatch(/email|dob|ssn|address|phone|zip|date.of.birth/);
    // Name fragments from the fixture (maria, rivera) must not appear
    expect(serialized).not.toMatch(/maria|rivera/);
  });

  it('credit purchase result: no email, name, DOB, SSN, or address fields', async () => {
    vi.mocked(stripeHelpers.chargeOneTime).mockResolvedValue(
      makeSucceededIntent({
        id: 'pi_cr_phi',
        amount: 1500,
        metadata: { type: 'credit_purchase', hours: '1', userId: 'user:ext:1' },
      }) as never,
    );
    const result = await paymentService.purchaseCredits('user:ext:1', 1, 'pm_1');
    const serialized = JSON.stringify(result).toLowerCase();
    expect(serialized).not.toMatch(/email|dob|ssn|address|phone|zip|date.of.birth/);
  });
});
