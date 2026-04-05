/**
 * Redis 7 Client — Cache, Sessions, Pub/Sub, Job Queue
 * NOT used for clinical data sync (that uses Transactional Outbox).
 */
import Redis from 'ioredis';
import { config } from '../config/settings.js';
import { logger } from '../common/logger.js';

let redisClient: Redis | null = null;
let redisSub: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    throw new Error('Redis not initialized — call connectRedis() first');
  }
  return redisClient;
}

export function getRedisSubscriber(): Redis {
  if (!redisSub) {
    throw new Error('Redis subscriber not initialized — call connectRedis() first');
  }
  return redisSub;
}

export async function connectRedis(): Promise<Redis> {
  if (redisClient) return redisClient;

  redisClient = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    lazyConnect: true,
  });

  // Separate connection for pub/sub (Redis requires dedicated connections for subscriptions)
  redisSub = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redisClient.on('error', (err) => {
    logger.error({ error: err.message }, 'Redis connection error');
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected');
  });

  await redisClient.connect();
  await redisSub.connect();

  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisSub) {
    redisSub.disconnect();
    redisSub = null;
  }
  if (redisClient) {
    redisClient.disconnect();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}

/**
 * Cache helpers — NEVER cache PHI. Only use for:
 * - Session tokens
 * - Rate limit counters
 * - Non-PHI API response caching (e.g., wellness provider listings)
 * - Job queue metadata
 */
export const cache = {
  async get(key: string): Promise<string | null> {
    return getRedis().get(key);
  },

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await getRedis().setex(key, ttlSeconds, value);
  },

  async del(key: string): Promise<void> {
    await getRedis().del(key);
  },

  async incr(key: string): Promise<number> {
    return getRedis().incr(key);
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await getRedis().expire(key, ttlSeconds);
  },
};
