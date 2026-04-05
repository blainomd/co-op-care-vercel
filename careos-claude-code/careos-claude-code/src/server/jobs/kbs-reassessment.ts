/**
 * KBS (Knowledge-Behavior-Status) Reassessment Job
 *
 * Runs daily. The KBS Outcome Scale requires periodic reassessment:
 * - Initial reassessments at 30, 60, 90 days
 * - Ongoing reassessments every 90 days (KBS_ONGOING_INTERVAL_DAYS)
 *
 * Schedules reassessments and notifies assigned worker-owners.
 */
import { KBS_REASSESSMENT_DAYS, KBS_ONGOING_INTERVAL_DAYS } from '@shared/constants/business-rules';
import * as queries from '../database/queries/index.js';
import { notificationService } from '../modules/notifications/service.js';
import { logger } from '../common/logger.js';

export interface KBSReassessmentResult {
  dueCount: number;
  scheduledCount: number;
  remindersSent: number;
  overdueCount: number;
}

/**
 * Process KBS reassessment scheduling.
 */
export async function runKBSReassessment(): Promise<KBSReassessmentResult> {
  const result: KBSReassessmentResult = {
    dueCount: 0,
    scheduledCount: 0,
    remindersSent: 0,
    overdueCount: 0,
  };

  const recipients = await queries.getCareRecipientsWithKBS();

  for (const recipient of recipients) {
    for (const problemCode of recipient.problemCodes) {
      const history = await queries.getKBSHistory(recipient.careRecipientId, problemCode);
      if (history.length === 0) continue;

      // Sort oldest first for milestone calculation
      const sorted = [...history].sort(
        (a, b) => new Date(a.ratedAt).getTime() - new Date(b.ratedAt).getTime(),
      );
      const initial = sorted[0]!;
      const latest = sorted[sorted.length - 1]!;
      const completedReassessments = sorted.length - 1; // exclude initial

      const nextDue = getNextReassessmentDate(
        new Date(initial.ratedAt),
        new Date(latest.ratedAt),
        completedReassessments,
      );

      const now = new Date();
      if (nextDue <= now) {
        result.dueCount++;

        if (isReassessmentOverdue(nextDue)) {
          result.overdueCount++;
          // Escalate overdue to MD
          const medicalDirectors = await queries.listUsersByRole('medical_director');
          for (const md of medicalDirectors) {
            await notificationService
              .send({
                userId: md.id,
                type: 'assessment_due',
                variables: {
                  assessmentType: `KBS (Problem #${problemCode})`,
                  careRecipientName: recipient.careRecipientId,
                },
              })
              .catch((err) => {
                logger.warn({ err, mdId: md.id }, 'Failed to notify MD of overdue KBS');
              });
          }
        } else {
          result.scheduledCount++;
          // Notify the rater that reassessment is due
          await notificationService
            .send({
              userId: latest.ratedBy,
              type: 'assessment_due',
              variables: {
                assessmentType: `KBS (Problem #${problemCode})`,
                careRecipientName: recipient.careRecipientId,
              },
            })
            .catch((err) => {
              logger.warn({ err }, 'Failed to notify rater of due KBS');
            });
          result.remindersSent++;
        }
      }
    }
  }

  logger.info(result, 'KBS reassessment job completed');
  return result;
}

/**
 * Calculate the next KBS reassessment date for a care recipient.
 */
export function getNextReassessmentDate(
  initialAssessmentDate: Date,
  lastAssessmentDate: Date,
  completedReassessments: number,
): Date {
  const milestones = KBS_REASSESSMENT_DAYS;

  // Initial phase: reassess at 30, 60, 90 days from initial assessment
  if (completedReassessments < milestones.length) {
    const nextMilestone = milestones[completedReassessments]!;
    const nextDate = new Date(initialAssessmentDate);
    nextDate.setDate(nextDate.getDate() + nextMilestone);
    return nextDate;
  }

  // Ongoing phase: every 90 days from last assessment
  const nextDate = new Date(lastAssessmentDate);
  nextDate.setDate(nextDate.getDate() + KBS_ONGOING_INTERVAL_DAYS);
  return nextDate;
}

/**
 * Check if a KBS reassessment is overdue.
 */
export function isReassessmentOverdue(dueDate: Date, graceDays: number = 7): boolean {
  const now = new Date();
  const graceEnd = new Date(dueDate);
  graceEnd.setDate(graceEnd.getDate() + graceDays);
  return now > graceEnd;
}
