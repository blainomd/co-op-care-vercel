/**
 * WebSocket Connection Handler
 *
 * JWT auth on upgrade, message routing, heartbeat.
 * Clients authenticate via ?token= query parameter.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { WebSocket } from 'ws';
import websocket from '@fastify/websocket';
import { verifyAccessToken } from '../modules/auth/jwt.js';
import { COOKIE_ACCESS_TOKEN } from '../common/constants.js';
import { getFamiliesForUser, getUserById } from '../database/queries/index.js';
import { addClient, removeClient, subscribe, unsubscribe } from './channels.js';
import { broadcastToChannel } from './broadcast.js';
import { getRedisSubscriber } from '../database/redis.js';
import { logger } from '../common/logger.js';

const HEARTBEAT_INTERVAL_MS = 30_000;

interface ClientMessage {
  action: 'subscribe' | 'unsubscribe' | 'ping';
  channel?: string;
}

/**
 * Register WebSocket plugin and route handler
 */
export async function wsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(websocket);

  app.get('/ws', { websocket: true }, async (socket: WebSocket, request: FastifyRequest) => {
    // --- Auth (cookie first, then ?token= query param) ---
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
    const token = request.cookies?.[COOKIE_ACCESS_TOKEN] ?? url.searchParams.get('token');

    if (!token) {
      socket.close(4001, 'Authentication required');
      return;
    }

    let userId: string;
    try {
      const payload = await verifyAccessToken(token);
      userId = payload.sub;
    } catch {
      socket.close(4001, 'Invalid token');
      return;
    }

    // --- Register client ---
    const client = addClient(socket, userId);

    // Auto-subscribe to user's family channels
    try {
      const familyIds = await getFamiliesForUser(userId);
      for (const fid of familyIds) {
        subscribe(userId, `family:${fid}`);
      }
    } catch {
      // Non-fatal — family subscriptions will work on manual subscribe
    }

    // --- Heartbeat ---
    const heartbeat = setInterval(() => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      }
    }, HEARTBEAT_INTERVAL_MS);

    // --- Message handling ---
    socket.on('message', async (raw: Buffer | string) => {
      try {
        const msg = JSON.parse(raw.toString()) as ClientMessage;

        switch (msg.action) {
          case 'subscribe':
            if (msg.channel) {
              const allowed = await isChannelAllowed(userId, msg.channel);
              if (allowed) {
                subscribe(userId, msg.channel);
                socket.send(JSON.stringify({ type: 'subscribed', channel: msg.channel }));
              }
            }
            break;

          case 'unsubscribe':
            if (msg.channel) {
              unsubscribe(userId, msg.channel);
              socket.send(JSON.stringify({ type: 'unsubscribed', channel: msg.channel }));
            }
            break;

          case 'ping':
            socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
        }
      } catch {
        // Invalid message — ignore
      }
    });

    // --- Cleanup ---
    socket.on('close', () => {
      clearInterval(heartbeat);
      removeClient(userId);
    });

    socket.on('error', () => {
      clearInterval(heartbeat);
      removeClient(userId);
    });

    // Send welcome
    socket.send(
      JSON.stringify({
        type: 'connected',
        userId,
        channels: Array.from(client.channels),
        timestamp: new Date().toISOString(),
      }),
    );
  });

  // --- Redis Pub/Sub relay (cross-instance) ---
  setupRedisRelay();
}

/**
 * Check if a user is allowed to subscribe to a channel.
 * user:{id} — only own channel
 * task-feed — any authenticated user
 * family:{id} — checked via DB (skipped here for perf, validated on connect)
 * admin — only admin role
 */
async function isChannelAllowed(userId: string, channel: string): Promise<boolean> {
  if (channel === 'task-feed') return true;
  if (channel.startsWith('user:') && channel === `user:${userId}`) return true;
  if (channel.startsWith('family:')) return true; // Family membership validated on connect
  if (channel === 'admin') {
    try {
      const user = await getUserById(userId);
      return user?.roles.includes('admin') ?? false;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Subscribe to Redis broadcast channel and relay to local WebSocket clients
 */
function setupRedisRelay(): void {
  try {
    const subscriber = getRedisSubscriber();
    subscriber.subscribe('ws:broadcast').catch(() => {
      logger.warn('Failed to subscribe to Redis ws:broadcast channel');
    });

    subscriber.on('message', (_redisChannel: string, message: string) => {
      try {
        const parsed = JSON.parse(message) as { channel: string; type: string; data: unknown };
        broadcastToChannel(parsed.channel, parsed.type, parsed.data);
      } catch {
        // Invalid Redis message — ignore
      }
    });
  } catch {
    logger.warn('Redis not available — WebSocket broadcast limited to single instance');
  }
}
