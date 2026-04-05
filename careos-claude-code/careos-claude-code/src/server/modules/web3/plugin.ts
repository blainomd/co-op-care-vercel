/**
 * Web3 Plugin — Fastify plugin wrapper for blockchain integration
 */
import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { web3Routes } from './routes.js';
import { web3RateLimit } from '../../middleware/rate-limit.middleware.js';

export async function web3Plugin(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, web3RateLimit);
  await app.register(web3Routes);
}
