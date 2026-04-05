/**
 * LMN (Letter of Medical Necessity) Renewal Job
 *
 * Runs daily. LMNs typically expire every 90-365 days depending on insurer.
 * Sends reminders to Medical Director when LMNs approach expiry.
 * Triggers CRI re-assessment scheduling when LMN renewal requires it.
 */
import * as queries from '../database/queries/index.js';
import { notificationService } from '../modules/notifications/service.js';
import { logger } from '../common/logger.js';

export interface LMNRenewalResult {
  expiringCount: number;
  remindersSent: number;
  reassessmentsScheduled: number;
  expiredCount: number;
}

const LMN_REMINDER_DAYS = [60, 30, 14, 7] as const;

/**
 * Process LMN renewal reminders and schedule reassessments.
 */
export async function runLMNRenewal(): Promise<LMNRenewalResult> {
  const result: LMNRenewalResult = {
    expiringCount: 0,
    remindersSent: 0,
    reassessmentsScheduled: 0,
    expiredCount: 0,
  };

  const now = new Date();

  // 1. Find active LMNs approaching expiry (within 60 days)
  const expiringLMNs = await queries.listExpiringLMNs(60);
  result.expiringCount = expiringLMNs.length;

  for (const lmn of expiringLMNs) {
    if (!lmn.expiresAt) continue;

    const expiryDate = new Date(lmn.expiresAt);
    const tier = getLMNReminderTier(expiryDate, now);

    if (tier === null) continue;

    // Skip if already reminded at this tier
    const lastTier = lmn.lastReminderTier ?? 999;
    if (tier >= lastTier) continue;

    // Update LMN status to 'expiring' if within 30 days
    if (tier <= 30 && lmn.status === 'active') {
      await queries.updateLMN(lmn.id, { status: 'expiring', lastReminderTier: tier });
    } else {
      await queries.updateLMN(lmn.id, { lastReminderTier: tier });
    }

    // Notify the conductor who generated the LMN
    await notificationService
      .send({
        userId: lmn.generatedBy,
        type: 'lmn_expiry',
        variables: {
          careRecipientName: lmn.careRecipientName,
          daysRemaining: String(tier),
        },
      })
      .catch((err) => {
        logger.warn({ err, lmnId: lmn.id }, 'Failed to send LMN expiry notification');
      });

    result.remindersSent++;

    // Auto-schedule CRI reassessment for LMNs expiring within 30 days
    if (tier <= 30 && !lmn.renewalCriId) {
      // Queue outbox event for CRI reassessment
      await queries.createOutboxEvent({
        eventType: 'lmn.reassessment_needed',
        resourceType: 'QuestionnaireResponse',
        resourceId: lmn.id,
        payload: {
          careRecipientId: lmn.careRecipientId,
          careRecipientName: lmn.careRecipientName,
          lmnId: lmn.id,
          expiresAt: lmn.expiresAt,
        },
      });
      result.reassessmentsScheduled++;
    }
  }

  // 2. Expire any active/expiring LMNs past their expiration date
  const allActive = await queries.listActiveLMNs();
  for (const lmn of allActive) {
    if (!lmn.expiresAt) continue;
    if (new Date(lmn.expiresAt) <= now) {
      await queries.updateLMN(lmn.id, { status: 'expired' });
      result.expiredCount++;

      // Notify conductor
      await notificationService
        .send({
          userId: lmn.generatedBy,
          type: 'lmn_expiry',
          variables: {
            careRecipientName: lmn.careRecipientName,
            daysRemaining: '0',
          },
        })
        .catch((err) => {
          logger.warn({ err, lmnId: lmn.id }, 'Failed to send LMN expired notification');
        });
    }
  }

  logger.info(result, 'LMN renewal job completed');
  return result;
}

/**
 * Calculate LMN expiry date from issue date and duration.
 */
export function calculateLMNExpiry(issueDate: Date, durationDays: number = 365): Date {
  const expiry = new Date(issueDate);
  expiry.setDate(expiry.getDate() + durationDays);
  return expiry;
}

/**
 * Check which reminder tier an LMN falls into.
 * Returns the smallest (most urgent) tier that contains the LMN's expiry.
 * Tiers: 7, 14, 30, 60 — e.g., 3 days remaining → tier 7, 20 days → tier 30.
 */
export function getLMNReminderTier(expiryDate: Date, now: Date = new Date()): number | null {
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Check tiers from most urgent (7) to least (60), return the tightest fit
  let matchedTier: number | null = null;
  for (const reminderDay of LMN_REMINDER_DAYS) {
    if (daysUntilExpiry <= reminderDay) matchedTier = reminderDay;
  }

  return matchedTier;
}
