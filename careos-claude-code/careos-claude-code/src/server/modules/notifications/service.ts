/**
 * Notification Service — Multi-channel dispatch orchestrator
 *
 * Routes notifications to the appropriate channels based on type.
 * Uses templates for consistent content across channels.
 * Stores all notifications in PostgreSQL for audit trail.
 */
import { getUserById, updateUser } from '../../database/queries/index.js';
import { logger } from '../../common/logger.js';
import type {
  NotificationType,
  NotificationChannel,
  Notification,
} from '@shared/types/notification.types';
import { renderTemplate, getDefaultChannels } from './templates.js';
import { sendPush, type PushSubscription } from './channels/push.js';
import { sendSms } from './channels/sms.js';
import { sendEmail } from './channels/email.js';
import {
  storeInApp,
  getUnread,
  getAll,
  markRead,
  markAllRead,
  getUnreadCount,
} from './channels/in-app.js';
import { broadcastNotification } from '../../ws/broadcast.js';

export interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  variables: Record<string, string>;
  channels?: NotificationChannel[];
}

export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
}

export interface UserContactInfo {
  email?: string;
  phone?: string;
  pushSubscription?: PushSubscription;
}

/**
 * Get user contact info via query builder
 */
async function getUserContactInfo(userId: string): Promise<UserContactInfo> {
  const user = (await getUserById(userId)) as Record<string, unknown> | null;
  if (!user) return {};
  return {
    email: user.email as string | undefined,
    phone: (user.phone as string | null) ?? undefined,
    pushSubscription: user.pushSubscription as PushSubscription | undefined,
  };
}

/**
 * Delay helper for retry backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const notificationService = {
  /**
   * Send a notification across one or more channels
   */
  async send(input: SendNotificationInput): Promise<DeliveryResult[]> {
    const channels = input.channels ?? getDefaultChannels(input.type);
    const contact = await getUserContactInfo(input.userId);
    const results: DeliveryResult[] = [];

    for (const channel of channels) {
      const rendered = renderTemplate(input.type, channel, input.variables);

      try {
        switch (channel) {
          case 'push': {
            if (!contact.pushSubscription) {
              results.push({ channel, success: false, error: 'No push subscription' });
              break;
            }
            const pushResult = await sendPush(contact.pushSubscription, {
              title: rendered.title,
              body: rendered.body,
              data: input.variables,
              tag: input.type,
            });
            results.push({ channel, success: pushResult.success, error: pushResult.error });
            break;
          }

          case 'sms': {
            if (!contact.phone) {
              results.push({ channel, success: false, error: 'No phone number' });
              break;
            }
            const smsResult = await sendSms({
              to: contact.phone,
              body: rendered.body,
            });
            results.push({ channel, success: smsResult.success, error: smsResult.error });
            break;
          }

          case 'email': {
            if (!contact.email) {
              results.push({ channel, success: false, error: 'No email address' });
              break;
            }
            const emailResult = await sendEmail({
              to: contact.email,
              subject: rendered.title,
              body: rendered.body,
            });
            results.push({ channel, success: emailResult.success, error: emailResult.error });
            break;
          }

          case 'in_app': {
            const inAppResult = await storeInApp({
              userId: input.userId,
              type: input.type,
              title: rendered.title,
              body: rendered.body,
              data: input.variables,
            });
            results.push({ channel, success: inAppResult.success, error: inAppResult.error });
            break;
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Delivery failed';
        results.push({ channel, success: false, error: message });
        logger.error({ channel, type: input.type, error: message }, 'Notification delivery error');
      }
    }

    // Broadcast via WebSocket for real-time delivery
    const rendered = renderTemplate(input.type, 'in_app', input.variables);
    broadcastNotification(input.userId, input.type, rendered.title, rendered.body, input.variables);

    logger.info(
      {
        userId: input.userId,
        type: input.type,
        channels,
        successes: results.filter((r) => r.success).length,
        failures: results.filter((r) => !r.success).length,
      },
      'Notification dispatched',
    );

    return results;
  },

  /**
   * Get unread notifications for a user
   */
  async getUnread(userId: string, limit?: number): Promise<Notification[]> {
    return getUnread(userId, limit);
  },

  /**
   * Get all notifications for a user
   */
  async getAll(userId: string, limit?: number, offset?: number): Promise<Notification[]> {
    return getAll(userId, limit, offset);
  },

  /**
   * Mark a notification as read
   */
  async markRead(notificationId: string, userId: string): Promise<void> {
    return markRead(notificationId, userId);
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(userId: string): Promise<void> {
    return markAllRead(userId);
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return getUnreadCount(userId);
  },

  /**
   * Register a push subscription for a user
   */
  async registerPushSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    await updateUser(userId, { pushSubscription: subscription } as Record<string, unknown>);
    logger.info({ userId }, 'Push subscription registered');
  },

  /**
   * Remove push subscription
   */
  async removePushSubscription(userId: string): Promise<void> {
    await updateUser(userId, { pushSubscription: null } as Record<string, unknown>);
  },

  /**
   * Send a notification with retry (fire-and-forget pattern).
   * Retries up to 3 times with exponential backoff (100ms, 200ms, 400ms).
   * Logs the final failure as error, not warn.
   */
  async sendWithRetry(input: SendNotificationInput): Promise<void> {
    const maxRetries = 3;
    const baseDelay = 100; // ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const results = await this.send(input);
        const allFailed = results.length > 0 && results.every((r) => !r.success);

        if (!allFailed) {
          return; // At least one channel succeeded
        }

        // All channels failed — treat as a retryable failure
        if (attempt < maxRetries) {
          const backoff = baseDelay * Math.pow(2, attempt - 1);
          logger.warn(
            { userId: input.userId, type: input.type, attempt, backoffMs: backoff },
            'All notification channels failed — retrying',
          );
          await delay(backoff);
        } else {
          logger.error(
            {
              userId: input.userId,
              type: input.type,
              attempts: maxRetries,
              failures: results.map((r) => ({ channel: r.channel, error: r.error })),
            },
            'Notification delivery failed after all retries',
          );
        }
      } catch (error) {
        if (attempt < maxRetries) {
          const backoff = baseDelay * Math.pow(2, attempt - 1);
          logger.warn(
            {
              userId: input.userId,
              type: input.type,
              attempt,
              error: error instanceof Error ? error.message : 'Unknown',
            },
            'Notification send threw — retrying',
          );
          await delay(backoff);
        } else {
          logger.error(
            {
              userId: input.userId,
              type: input.type,
              attempts: maxRetries,
              error: error instanceof Error ? error.message : 'Unknown',
            },
            'Notification delivery failed after all retries',
          );
        }
      }
    }
  },
};
