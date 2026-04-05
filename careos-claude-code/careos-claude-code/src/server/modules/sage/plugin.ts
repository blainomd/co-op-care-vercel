/**
 * Sage Module — Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { sageRoutes } from './routes.js';

export async function sagePlugin(app: FastifyInstance): Promise<void> {
  // Sage chat rate limit: 10 requests per day per IP (Claude API is expensive)
  await app.register(rateLimit, {
    max: 10,
    timeWindow: '1 day',
    keyGenerator: (req: { ip: string }) => req.ip,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message:
        "You've reached your daily limit of 10 Sage conversations. This resets at midnight. For immediate help, email blaine@co-op.care.",
    }),
  });

  await app.register(sageRoutes);
}
