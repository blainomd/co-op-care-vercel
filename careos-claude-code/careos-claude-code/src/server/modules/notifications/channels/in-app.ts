/**
 * In-App Channel — Store notifications in PostgreSQL
 *
 * Used for all notification types. Queryable by user for notification center.
 */
import {
  createNotification,
  getUnreadNotifications,
  getAllNotifications,
  markNotificationRead,
  markAllRead as markAllReadQuery,
  countUnread,
} from '../../../database/queries/index.js';
import { logger } from '../../../common/logger.js';
import type { Notification, NotificationType } from '@shared/types/notification.types';

export interface InAppPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Store an in-app notification in PostgreSQL
 */
export async function storeInApp(
  payload: InAppPayload,
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    const notification = await createNotification({
      userId: payload.userId,
      type: payload.type,
      channel: 'in_app',
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });

    logger.debug({ userId: payload.userId, type: payload.type }, 'In-app notification stored');
    return { success: true, notificationId: notification.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'In-app storage failed';
    logger.error({ error: message }, 'In-app notification storage error');
    return { success: false, error: message };
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnread(userId: string, limit: number = 50): Promise<Notification[]> {
  const records = await getUnreadNotifications(userId, limit);
  return records as unknown as Notification[];
}

/**
 * Get all notifications for a user (paginated)
 */
export async function getAll(
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<Notification[]> {
  const records = await getAllNotifications(userId, limit, offset);
  return records as unknown as Notification[];
}

/**
 * Mark a notification as read
 */
export async function markRead(notificationId: string, _userId: string): Promise<void> {
  await markNotificationRead(notificationId);
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllRead(userId: string): Promise<void> {
  await markAllReadQuery(userId);
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return countUnread(userId);
}
