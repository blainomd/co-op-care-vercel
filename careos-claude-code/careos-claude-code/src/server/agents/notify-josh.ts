/**
 * Josh Notification Service — Alert physician on urgent LMNs
 *
 * When an urgent LMN hits the review queue, Josh needs to know NOW.
 * Uses the existing notification service to send email alerts.
 *
 * Notification channels (Phase 1: email, Phase 2: SMS/push):
 * - urgent: immediate email
 * - elevated: email within 1 hour (batched)
 * - standard: daily digest
 */
import { logger } from '../common/logger.js';
import { eventBus, type CareEvent } from './event-bus.js';

const JOSH_EMAIL = 'josh@co-op.care'; // TODO: from env
const REVIEW_URL = `${process.env.FRONTEND_URL || 'https://co-op.care'}/#/admin/review`;

/**
 * Send notification to Josh about a new LMN in queue.
 * Phase 1: Logs the notification. Phase 2: sends via email service.
 */
async function notifyJosh(event: CareEvent): Promise<void> {
  const { payload } = event;
  const priority = payload.priority as string;
  const name = payload.careRecipientName as string;
  const queueDepth = payload.queueDepth as number;

  if (priority === 'urgent') {
    logger.warn(
      {
        to: JOSH_EMAIL,
        subject: `URGENT LMN Review: ${name}`,
        priority,
        queueDepth,
        reviewUrl: REVIEW_URL,
      },
      '🚨 URGENT: New LMN needs immediate physician review',
    );

    // Phase 2: Wire to actual email service
    // await emailService.send({
    //   to: JOSH_EMAIL,
    //   subject: `URGENT: LMN Review Needed — ${name}`,
    //   body: `An urgent LMN for ${name} is waiting for your review.\n\n` +
    //     `Queue depth: ${queueDepth} pending\n` +
    //     `Review now: ${REVIEW_URL}`,
    // });
  } else if (priority === 'elevated') {
    logger.info(
      { to: JOSH_EMAIL, priority, name, queueDepth },
      'Elevated LMN queued — will notify Josh within 1 hour',
    );
  } else {
    logger.info({ priority, name, queueDepth }, 'Standard LMN queued — included in daily digest');
  }
}

/**
 * Initialize Josh notification listener.
 */
export function initJoshNotifications(): void {
  eventBus.on('lmn.review_assigned', notifyJosh);
  logger.info('Josh notification listener initialized');
}
