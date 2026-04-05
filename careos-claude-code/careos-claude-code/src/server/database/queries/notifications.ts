// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Notification & Message Query Builders
 */
import { getPostgres } from '../postgres.js';
import type { NotificationType, NotificationChannel } from '@shared/types/notification.types';

// ── Notifications ─────────────────────────────────────

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data: Record<string, string> | null;
  read: boolean;
  sentAt: string;
  readAt: string | null;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationRecord> {
  const db = getPostgres();
  const [record] = await db.create('notification', {
    ...input,
    userId: input.userId,
    data: input.data ?? null,
    read: false,
    readAt: null,
  } as Record<string, unknown>);
  return record as unknown as NotificationRecord;
}

export async function getUnreadNotifications(
  userId: string,
  limit = 50,
): Promise<NotificationRecord[]> {
  const db = getPostgres();
  const result = await db.query<[NotificationRecord[]]>(
    `SELECT * FROM notification
     WHERE userId = type::thing("user", $userId) AND read = false
     ORDER BY sentAt DESC
     LIMIT $limit`,
    { userId, limit },
  );
  return result[0] ?? [];
}

export async function getAllNotifications(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<NotificationRecord[]> {
  const db = getPostgres();
  const result = await db.query<[NotificationRecord[]]>(
    `SELECT * FROM notification
     WHERE userId = type::thing("user", $userId)
     ORDER BY sentAt DESC
     LIMIT $limit START $offset`,
    { userId, limit, offset },
  );
  return result[0] ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = getPostgres();
  await db.query(`UPDATE type::thing("notification", $id) SET read = true, readAt = time::now()`, {
    id,
  });
}

export async function markAllRead(userId: string): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE notification SET read = true, readAt = time::now()
     WHERE userId = type::thing("user", $userId) AND read = false`,
    { userId },
  );
}

export async function countUnread(userId: string): Promise<number> {
  const db = getPostgres();
  const result = await db.query<[Array<{ count: number }>]>(
    `SELECT count() AS count FROM notification
     WHERE userId = type::thing("user", $userId) AND read = false
     GROUP ALL`,
    { userId },
  );
  return result[0]?.[0]?.count ?? 0;
}

// ── Secure Messages ───────────────────────────────────

export interface MessageRecord {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  body: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export async function createMessage(input: {
  threadId: string;
  senderId: string;
  recipientId: string;
  body: string;
}): Promise<MessageRecord> {
  const db = getPostgres();
  const [msg] = await db.create('message', {
    ...input,
    read: false,
    readAt: null,
  } as Record<string, unknown>);
  return msg as unknown as MessageRecord;
}

export async function getThread(
  threadId: string,
  limit = 100,
  offset = 0,
): Promise<MessageRecord[]> {
  const db = getPostgres();
  const result = await db.query<[MessageRecord[]]>(
    `SELECT * FROM message
     WHERE threadId = $threadId
     ORDER BY createdAt ASC
     LIMIT $limit START $offset`,
    { threadId, limit, offset },
  );
  return result[0] ?? [];
}

export async function listThreadsForUser(
  userId: string,
  limit = 50,
): Promise<Array<{ threadId: string; lastMessage: string; lastAt: string; unread: number }>> {
  const db = getPostgres();
  const result = await db.query<
    [Array<{ threadId: string; lastMessage: string; lastAt: string; unread: number }>]
  >(
    `SELECT threadId,
            array::last(body ORDER BY createdAt) AS lastMessage,
            math::max(createdAt) AS lastAt,
            count(read = false) AS unread
     FROM message
     WHERE senderId = type::thing("user", $userId)
        OR recipientId = type::thing("user", $userId)
     GROUP BY threadId
     ORDER BY lastAt DESC
     LIMIT $limit`,
    { userId, limit },
  );
  return result[0] ?? [];
}

export async function markThreadRead(threadId: string, userId: string): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE message SET read = true, readAt = time::now()
     WHERE threadId = $threadId
       AND recipientId = type::thing("user", $userId)
       AND read = false`,
    { threadId, userId },
  );
}
