/**
 * Referral Rewards Fastify Plugin
 */
import type { FastifyInstance } from 'fastify';
import { referralRewardsRoutes } from './routes.js';

export async function referralRewardsPlugin(app: FastifyInstance) {
  await app.register(referralRewardsRoutes);
}
