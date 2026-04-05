/**
 * Action Plugin — Token-based action pages (the entire mobile strategy)
 */
import type { FastifyInstance } from 'fastify';
import { actionRoutes } from './routes.js';

export async function actionPlugin(app: FastifyInstance): Promise<void> {
  await app.register(actionRoutes);
}
