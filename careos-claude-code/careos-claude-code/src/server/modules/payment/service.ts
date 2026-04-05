/**
 * Payment Service
 * Membership ($100/yr), credit purchases ($15/hr), Comfort Card subscriptions.
 * HSA/FSA eligible — metadata flag on all transactions.
 */
import { TIME_BANK } from '@shared/constants/business-rules';
import {
  createCustomer,
  attachPaymentMethod,
  chargeOneTime,
  createSubscription,
  cancelSubscription as stripeCancelSubscription,
} from './stripe.js';
import { getFamilyById, updateFamily, getUserById } from '../../database/queries/index.js';
import { NotFoundError, ValidationError, ExternalServiceError } from '../../common/errors.js';

export interface MembershipResult {
  familyId: string;
  stripeCustomerId: string;
  paymentIntentId: string;
  membershipStatus: 'active';
  floorHours: number;
  amountCents: number;
}

export interface CreditPurchaseResult {
  hours: number;
  amountCents: number;
  paymentIntentId: string;
  coordinationSplitCents: number;
  respiteSplitCents: number;
}

export interface ComfortCardResult {
  familyId: string;
  subscriptionId: string;
  status: string;
}

export const paymentService = {
  /**
   * Create or retrieve Stripe customer for a family.
   * Links the Stripe customer to the family record.
   */
  async ensureStripeCustomer(familyId: string, userId: string): Promise<string> {
    const family = await getFamilyById(familyId);
    if (!family) throw new NotFoundError('Family');

    if (family.stripeCustomerId) return family.stripeCustomerId;

    const user = await getUserById(userId);
    if (!user) throw new NotFoundError('User');

    const customer = await createCustomer(user.email, `${user.firstName} ${user.lastName}`, {
      familyId,
      userId,
      coopCare: 'true',
    });

    await updateFamily(familyId, { stripeCustomerId: customer.id });
    return customer.id;
  },

  /**
   * Process annual membership payment ($100).
   * On success: activates membership, credits floor hours (40).
   */
  async createMembership(
    userId: string,
    familyId: string,
    paymentMethodId: string,
  ): Promise<MembershipResult> {
    const customerId = await this.ensureStripeCustomer(familyId, userId);

    await attachPaymentMethod(customerId, paymentMethodId);

    const paymentIntent = await chargeOneTime(
      customerId,
      TIME_BANK.MEMBERSHIP_ANNUAL_COST_CENTS,
      paymentMethodId,
      'CareOS Annual Membership ($100)',
      {
        type: 'membership',
        familyId,
        userId,
        hsa_fsa_eligible: 'true',
        irs_pub_502: 'medical_care_services',
      },
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new ExternalServiceError('Stripe payment did not succeed');
    }

    await updateFamily(familyId, { membershipStatus: 'active' });

    return {
      familyId,
      stripeCustomerId: customerId,
      paymentIntentId: paymentIntent.id,
      membershipStatus: 'active',
      floorHours: TIME_BANK.MEMBERSHIP_FLOOR_HOURS,
      amountCents: TIME_BANK.MEMBERSHIP_ANNUAL_COST_CENTS,
    };
  },

  /**
   * Purchase time bank credits ($15/hr).
   * Split: $12 coordination + $3 respite fund.
   */
  async purchaseCredits(
    userId: string,
    hours: number,
    paymentMethodId: string,
  ): Promise<CreditPurchaseResult> {
    if (hours < 1 || hours > 100) {
      throw new ValidationError('Hours must be between 1 and 100');
    }

    const user = await getUserById(userId);
    if (!user) throw new NotFoundError('User');

    // Find or create Stripe customer at the user level
    // For credit purchases, user may not have a family yet (timebank_member)
    const customer = await createCustomer(user.email, `${user.firstName} ${user.lastName}`, {
      userId,
      coopCare: 'true',
    });

    await attachPaymentMethod(customer.id, paymentMethodId);

    const totalCents = hours * TIME_BANK.CASH_RATE_CENTS_PER_HOUR;
    const coordinationCents = hours * TIME_BANK.CASH_COORDINATION_SPLIT_CENTS;
    const respiteCents = hours * TIME_BANK.CASH_RESPITE_SPLIT_CENTS;

    const paymentIntent = await chargeOneTime(
      customer.id,
      totalCents,
      paymentMethodId,
      `CareOS Time Bank: ${hours} hour credits`,
      {
        type: 'credit_purchase',
        hours: String(hours),
        userId,
        coordinationCents: String(coordinationCents),
        respiteCents: String(respiteCents),
        hsa_fsa_eligible: 'true',
      },
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new ExternalServiceError('Stripe payment did not succeed');
    }

    return {
      hours,
      amountCents: totalCents,
      paymentIntentId: paymentIntent.id,
      coordinationSplitCents: coordinationCents,
      respiteSplitCents: respiteCents,
    };
  },

  /**
   * Subscribe to Comfort Card (recurring monthly).
   * Uses the Stripe membership price ID for the subscription.
   */
  async subscribeComfortCard(
    userId: string,
    familyId: string,
    paymentMethodId: string,
  ): Promise<ComfortCardResult> {
    const customerId = await this.ensureStripeCustomer(familyId, userId);

    const family = await getFamilyById(familyId);
    if (family?.stripeSubscriptionId) {
      throw new ValidationError('Family already has an active subscription');
    }

    await attachPaymentMethod(customerId, paymentMethodId);

    const subscription = await createSubscription(
      customerId,
      process.env['STRIPE_COMFORT_CARD_PRICE_ID'] ?? '',
      paymentMethodId,
      {
        type: 'comfort_card',
        familyId,
        userId,
        hsa_fsa_eligible: 'true',
      },
    );

    await updateFamily(familyId, { stripeSubscriptionId: subscription.id });

    return {
      familyId,
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  },

  /**
   * Cancel a family's Comfort Card subscription.
   */
  async cancelComfortCard(familyId: string): Promise<{ cancelled: boolean }> {
    const family = await getFamilyById(familyId);
    if (!family) throw new NotFoundError('Family');
    if (!family.stripeSubscriptionId) {
      throw new ValidationError('No active subscription');
    }

    await stripeCancelSubscription(family.stripeSubscriptionId);
    await updateFamily(familyId, { stripeSubscriptionId: null });

    return { cancelled: true };
  },

  /**
   * Renew membership via Stripe (called by membership-renewal job).
   */
  async renewMembership(familyId: string, paymentMethodId: string): Promise<MembershipResult> {
    const family = await getFamilyById(familyId);
    if (!family) throw new NotFoundError('Family');
    if (!family.stripeCustomerId) {
      throw new ValidationError('Family has no Stripe customer');
    }

    const paymentIntent = await chargeOneTime(
      family.stripeCustomerId,
      TIME_BANK.MEMBERSHIP_ANNUAL_COST_CENTS,
      paymentMethodId,
      'CareOS Annual Membership Renewal ($100)',
      {
        type: 'membership_renewal',
        familyId,
        hsa_fsa_eligible: 'true',
      },
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new ExternalServiceError('Stripe renewal payment failed');
    }

    await updateFamily(familyId, { membershipStatus: 'active' });

    return {
      familyId,
      stripeCustomerId: family.stripeCustomerId,
      paymentIntentId: paymentIntent.id,
      membershipStatus: 'active',
      floorHours: TIME_BANK.MEMBERSHIP_FLOOR_HOURS,
      amountCents: TIME_BANK.MEMBERSHIP_ANNUAL_COST_CENTS,
    };
  },
};
