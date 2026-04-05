/**
 * WebSocket Broadcast Helpers
 *
 * Sends typed messages to channels. Uses Redis Pub/Sub for
 * multi-instance support (future horizontal scaling).
 */
import type { WebSocket } from 'ws';
import { getClient, getChannelSubscribers } from './channels.js';
import { getRedis } from '../database/redis.js';
import { logger } from '../common/logger.js';
import type { NotificationType } from '@shared/types/notification.types';

export interface WsMessage {
  type: string;
  channel?: string;
  data: unknown;
  timestamp: string;
}

function sendToSocket(ws: WebSocket, message: WsMessage): boolean {
  if (ws.readyState !== 1) return false; // WebSocket.OPEN
  try {
    ws.send(JSON.stringify(message));
    return true;
  } catch {
    return false;
  }
}

/**
 * Send a message to a specific user
 */
export function sendToUser(userId: string, type: string, data: unknown): boolean {
  const client = getClient(userId);
  if (!client) return false;

  return sendToSocket(client.ws, {
    type,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast a message to all subscribers of a channel
 */
export function broadcastToChannel(channel: string, type: string, data: unknown): number {
  const subscribers = getChannelSubscribers(channel);
  let delivered = 0;

  const message: WsMessage = {
    type,
    channel,
    data,
    timestamp: new Date().toISOString(),
  };

  for (const userId of subscribers) {
    const client = getClient(userId);
    if (client && sendToSocket(client.ws, message)) {
      delivered++;
    }
  }

  return delivered;
}

/**
 * Broadcast a notification to a user via WebSocket.
 * Called from the notification service after storing in-app.
 */
export function broadcastNotification(
  userId: string,
  notificationType: NotificationType,
  title: string,
  body: string,
  data?: Record<string, string>,
): boolean {
  return sendToUser(userId, 'notification', {
    notificationType,
    title,
    body,
    data,
  });
}

/**
 * Broadcast a new task to the task-feed channel
 */
export function broadcastNewTask(task: unknown): number {
  return broadcastToChannel('task-feed', 'new_task', task);
}

/**
 * Broadcast a timeline event to a family channel
 */
export function broadcastTimelineEvent(familyId: string, event: unknown): number {
  return broadcastToChannel(`family:${familyId}`, 'timeline_event', event);
}

/**
 * Broadcast a CII score update to a family channel
 */
export function broadcastCiiUpdate(familyId: string, scores: unknown): number {
  return broadcastToChannel(`family:${familyId}`, 'cii_update', scores);
}

/**
 * Broadcast a balance update to a user
 */
export function broadcastBalanceUpdate(userId: string, balance: unknown): boolean {
  return sendToUser(userId, 'balance_update', balance);
}

/**
 * Broadcast a message to a specific thread's participants
 */
export function broadcastMessage(recipientUserId: string, message: unknown): boolean {
  return sendToUser(recipientUserId, 'new_message', message);
}

/**
 * Publish a message to Redis for cross-instance broadcast.
 * Other server instances subscribe and relay to their local clients.
 */
export async function publishToRedis(channel: string, type: string, data: unknown): Promise<void> {
  try {
    const redis = getRedis();
    await redis.publish(
      'ws:broadcast',
      JSON.stringify({ channel, type, data, timestamp: new Date().toISOString() }),
    );
  } catch (err) {
    logger.warn({ err, channel, type }, 'Redis publish failed — local broadcast only');
  }
}
