/**
 * Sage Routes — Conversational AI endpoints
 * POST /chat — Public (Tier 0, homepage)
 * POST /intent — Authenticated (Tier 2, Gemini Flash)
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { sageService } from './service.js';
import { sageChatSchema, sageIntentSchema } from './schemas.js';

export async function sageRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /chat — Public Sage conversation (no auth)
   * Used by SageHero on homepage. Keyword-based Phase 1.
   */
  app.post('/chat', async (request) => {
    const parsed = sageChatSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid message');

    return sageService.chat(parsed.data);
  });

  /**
   * POST /intent — Authenticated intent classification (Gemini Flash)
   * Phase 2: Returns domain, confidence, Omaha codes, and response.
   * Jacob: Wire Gemini Flash API in service.ts.
   */
  app.post(
    '/intent',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const parsed = sageIntentSchema.safeParse(request.body);
      if (!parsed.success) throw new ValidationError('Invalid intent request');

      return sageService.classifyIntent(parsed.data);
    },
  );
}
