/**
 * WebSocket Channel Subscriptions
 *
 * Channel types:
 * - user:{userId} — personal notifications, balance updates
 * - family:{familyId} — CII updates, care team changes, timeline events
 * - task-feed — new task postings (all timebank members)
 * - admin — system-wide events (admin role only)
 */
import type { WebSocket } from 'ws';
import { logger } from '../common/logger.js';

export type ChannelType = 'user' | 'family' | 'task-feed' | 'admin';

export interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  channels: Set<string>;
}

/** All connected clients keyed by userId */
const clients = new Map<string, ConnectedClient>();

/** Channel → set of userIds subscribed */
const channelSubscribers = new Map<string, Set<string>>();

export function addClient(ws: WebSocket, userId: string): ConnectedClient {
  const client: ConnectedClient = { ws, userId, channels: new Set() };
  clients.set(userId, client);

  // Auto-subscribe to personal channel
  subscribe(userId, `user:${userId}`);

  logger.debug({ userId }, 'WebSocket client connected');
  return client;
}

export function removeClient(userId: string): void {
  const client = clients.get(userId);
  if (!client) return;

  // Unsubscribe from all channels
  for (const channel of client.channels) {
    const subs = channelSubscribers.get(channel);
    if (subs) {
      subs.delete(userId);
      if (subs.size === 0) channelSubscribers.delete(channel);
    }
  }

  clients.delete(userId);
  logger.debug({ userId }, 'WebSocket client disconnected');
}

export function subscribe(userId: string, channel: string): boolean {
  const client = clients.get(userId);
  if (!client) return false;

  client.channels.add(channel);

  if (!channelSubscribers.has(channel)) {
    channelSubscribers.set(channel, new Set());
  }
  channelSubscribers.get(channel)!.add(userId);

  return true;
}

export function unsubscribe(userId: string, channel: string): boolean {
  const client = clients.get(userId);
  if (!client) return false;

  client.channels.delete(channel);

  const subs = channelSubscribers.get(channel);
  if (subs) {
    subs.delete(userId);
    if (subs.size === 0) channelSubscribers.delete(channel);
  }

  return true;
}

export function getClient(userId: string): ConnectedClient | undefined {
  return clients.get(userId);
}

export function getChannelSubscribers(channel: string): string[] {
  return Array.from(channelSubscribers.get(channel) ?? []);
}

export function getConnectedCount(): number {
  return clients.size;
}

export function isConnected(userId: string): boolean {
  const client = clients.get(userId);
  return client !== undefined && client.ws.readyState === 1; // WebSocket.OPEN
}
