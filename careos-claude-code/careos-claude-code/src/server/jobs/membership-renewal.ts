/**
 * Membership Renewal Job
 *
 * Runs daily. Checks for memberships approaching renewal date.
 * Sends reminders at 30, 14, and 3 days before expiry.
 * Auto-renews if payment method on file; otherwise flags for manual renewal.
 */
import { listAllFamilies, updateFamily } from '../database/queries/index.js';
import { paymentService } from '../modules/payment/service.js';
import { getStripe } from '../modules/payment/stripe.js';
import { notificationService } from '../modules/notifications/service.js';

export interface RenewalResult {
  remindersSent: number;
  autoRenewed: number;
  failedRenewals: number;
  expiredMemberships: number;
}

const REMINDER_DAYS = [30, 14, 3] as const;
const GRACE_PERIOD_DAYS = 7;

/**
 * Process membership renewals and send reminders.
 */
export async function runMembershipRenewal(): Promise<RenewalResult> {
  const result: RenewalResult = {
    remindersSent: 0,
    autoRenewed: 0,
    failedRenewals: 0,
    expiredMemberships: 0,
  };

  const families = await listAllFamilies();
  const now = new Date();

  for (const family of families) {
    if (family.membershipStatus === 'cancelled') continue;
    if (!family.stripeCustomerId) continue;

    const renewalDate = calculateRenewalDate(new Date(family.createdAt));
    const reminderDay = isInReminderWindow(renewalDate, now);

    // Send reminders via email + push notification
    if (reminderDay !== null) {
      try {
        await notificationService.send({
          userId: family.conductorId ?? family.id,
          type: 'membership_renewal_reminder',
          channels: ['email', 'push'],
          variables: {
            familyName: family.name ?? 'Member',
            daysUntilRenewal: String(reminderDay),
            renewalDate: renewalDate.toISOString(),
            membershipStatus: family.membershipStatus ?? 'active',
          },
        });
      } catch (err) {
        console.warn(
          `[MembershipRenewal] Failed to send ${reminderDay}-day reminder for ${family.id}:`,
          err,
        );
      }
      result.remindersSent++;
      continue;
    }

    // Check if renewal is due today
    const daysUntilRenewal = Math.floor(
      (renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilRenewal <= 0 && daysUntilRenewal > -GRACE_PERIOD_DAYS) {
      // Attempt auto-renewal
      try {
        const stripe = getStripe();
        const paymentMethods = await stripe.paymentMethods.list({
          customer: family.stripeCustomerId,
          type: 'card',
          limit: 1,
        });

        const defaultPM = paymentMethods.data[0];
        if (!defaultPM) {
          // No payment method — move to grace period
          await updateFamily(family.id, { membershipStatus: 'grace_period' });
          result.failedRenewals++;
          continue;
        }

        await paymentService.renewMembership(family.id, defaultPM.id);
        result.autoRenewed++;
      } catch {
        await updateFamily(family.id, { membershipStatus: 'grace_period' });
        result.failedRenewals++;
      }
    } else if (daysUntilRenewal <= -GRACE_PERIOD_DAYS) {
      // Past grace period — suspend
      await updateFamily(family.id, { membershipStatus: 'suspended' });
      result.expiredMemberships++;
    }
  }

  return result;
}

/**
 * Calculate next renewal date from a given start date.
 */
export function calculateRenewalDate(memberSince: Date): Date {
  const renewal = new Date(memberSince);
  const now = new Date();

  while (renewal <= now) {
    renewal.setFullYear(renewal.getFullYear() + 1);
  }

  return renewal;
}

/**
 * Check if a date is within the reminder window.
 */
export function isInReminderWindow(renewalDate: Date, now: Date = new Date()): number | null {
  const daysUntilRenewal = Math.floor(
    (renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  for (const reminderDay of REMINDER_DAYS) {
    if (daysUntilRenewal === reminderDay) return reminderDay;
  }

  return null;
}
