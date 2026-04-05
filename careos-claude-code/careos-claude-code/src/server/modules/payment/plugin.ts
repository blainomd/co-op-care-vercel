/**
 * Payment Plugin — Fastify plugin wrapper
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { paymentRoutes } from './routes.js';
import { billingRoutes } from './billing-routes.js';
import { stripeWebhookRoute } from './webhooks.js';
import { paymentRateLimit } from '../../middleware/rate-limit.middleware.js';

export async function paymentPlugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, paymentRateLimit);
  await app.register(paymentRoutes);
  await app.register(billingRoutes, { prefix: '/billing' });
  await app.register(stripeWebhookRoute, { prefix: '/webhooks' });
}
