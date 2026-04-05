// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Memory API Routes — Profile persistence endpoints
 *
 * GET  /api/memory/profile/:userId  — Load profile
 * PUT  /api/memory/profile          — Save/update profile
 * GET  /api/memory/summary/:userId  — Load conversation memory
 * POST /api/memory/summary          — Update conversation memory
 * POST /api/memory/session/start    — Start a conversation session
 * POST /api/memory/session/end      — End a conversation session
 */
import type { FastifyInstance } from 'fastify';
import {
  getProfile,
  saveProfile,
  getMemory,
  updateMemory,
  startSession,
  endSession,
} from './service.js';
export async function memoryRoutes(app: FastifyInstance) {
  // ─── Load Profile ─────────────────────────────────────────────────
  app.get('/api/memory/profile/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const profile = await getProfile(userId);
    if (!profile) {
      return reply.code(404).send({ error: 'Profile not found' });
    }
    return profile;
  });

  // ─── Save Profile ─────────────────────────────────────────────────
  app.put('/api/memory/profile', async (req, reply) => {
    const data = req.body as Record<string, unknown>;
    if (!data?.userId) {
      return reply.code(400).send({ error: 'userId is required' });
    }
    await saveProfile(data);
    return { success: true };
  });

  // ─── Load Memory Summary ──────────────────────────────────────────
  app.get('/api/memory/summary/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    const memory = await getMemory(userId);
    if (!memory) {
      return reply.code(404).send({ error: 'No memory found' });
    }
    return memory;
  });

  // ─── Update Memory Summary ────────────────────────────────────────
  app.post('/api/memory/summary', async (req, reply) => {
    const { userId, summary, facts, messageCount } = req.body as Record<string, unknown>;
    if (!userId || !summary) {
      return reply.code(400).send({ error: 'userId and summary required' });
    }
    await updateMemory(userId, summary, facts ?? [], messageCount ?? 0);
    return { success: true };
  });

  // ─── Start Session ────────────────────────────────────────────────
  app.post('/api/memory/session/start', async (req, reply) => {
    const { userId } = req.body as { userId: string };
    if (!userId) {
      return reply.code(400).send({ error: 'userId is required' });
    }
    const sessionId = await startSession(userId);
    return { sessionId };
  });

  // ─── End Session ──────────────────────────────────────────────────
  app.post('/api/memory/session/end', async (req, reply) => {
    const { sessionId, messageCount, domains, profileDelta, summary } = req.body as Record<
      string,
      unknown
    >;
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }
    await endSession(
      sessionId,
      messageCount ?? 0,
      domains ?? [],
      profileDelta ?? {},
      summary ?? '',
    );
    return { success: true };
  });
}
