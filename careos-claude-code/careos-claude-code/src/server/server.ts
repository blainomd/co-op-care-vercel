/**
 * CareOS Server Entry Point
 * Starts Fastify, connects databases, handles graceful shutdown.
 */
import { config, validateConfig } from './config/settings.js';
import { logger } from './common/logger.js';
import { buildApp } from './app.js';
import { connectPostgres, closePostgres, initPostgresSchema } from './database/postgres.js';
import { initAidbox } from './database/aidbox.js';
import { connectRedis, closeRedis } from './database/redis.js';
import { startScheduler, stopScheduler } from './jobs/scheduler.js';

async function start(): Promise<void> {
  // Validate configuration before anything else — fail fast on bad config
  validateConfig();

  const app = await buildApp();

  // Listen FIRST so Railway's healthcheck (/health) passes immediately.
  // DB connections happen after — failures are logged but do not crash the server.
  await app.listen({ port: config.port, host: '0.0.0.0' });
  logger.info({ port: config.port, env: config.env }, 'CareOS server started');

  // Connect databases in parallel (non-blocking — server stays up in degraded mode)
  let pgPool;
  try {
    const results = await Promise.all([connectPostgres(), connectRedis(), initAidbox()]);
    pgPool = results[0];
  } catch (err) {
    logger.error({ err }, 'Database connection error — server running in degraded mode');
  }

  // Initialize PostgreSQL schema (idempotent IF NOT EXISTS — safe to run on every start)
  if (pgPool) {
    try {
      await initPostgresSchema(pgPool);
    } catch (err) {
      logger.error({ err }, 'PostgreSQL schema init failed — server running in degraded mode');
    }
  }

  // Start background job scheduler (production only)
  startScheduler();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    stopScheduler();
    await app.close();
    await closePostgres();
    await closeRedis();
    logger.info('All connections closed — exiting');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start CareOS server');
  process.exit(1);
});
