/**
 * Web Push Channel — Push notifications via Web Push API (VAPID)
 *
 * Stores push subscriptions in PostgreSQL.
 * Uses web-push library for delivery.
 */
import { config } from '../../../config/settings.js';
import { logger } from '../../../common/logger.js';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, string>;
  tag?: string;
}

/**
 * Send a push notification
 * In production, uses the web-push library. Here we define the interface
 * and log in dev mode.
 */
export async function sendPush(
  subscription: PushSubscription,
  payload: PushPayload,
): Promise<{ success: boolean; error?: string }> {
  // Validate VAPID keys are configured
  if (!config.vapid.publicKey || !config.vapid.privateKey) {
    logger.debug({ payload: payload.title }, 'Push skipped — VAPID keys not configured');
    return { success: false, error: 'VAPID keys not configured' };
  }

  try {
    // Dynamic import to avoid requiring web-push in test environments
    const webpush = await import('web-push');

    webpush.setVapidDetails(config.vapid.mailto, config.vapid.publicKey, config.vapid.privateKey);

    await webpush.sendNotification(subscription, JSON.stringify(payload));

    logger.debug(
      { endpoint: subscription.endpoint, title: payload.title },
      'Push notification sent',
    );
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Push delivery failed';
    logger.error({ error: message, endpoint: subscription.endpoint }, 'Push notification failed');
    return { success: false, error: message };
  }
}
