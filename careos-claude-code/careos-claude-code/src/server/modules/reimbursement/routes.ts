/**
 * Reimbursement Routes — HSA/FSA Claims API endpoints
 */
import type { FastifyInstance } from 'fastify';
import { reimbursementService } from './service.js';
import {
  createClaimSchema,
  updateClaimSchema,
  resolveClaimSchema,
  autoGenerateSchema,
} from './schemas.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function reimbursementRoutes(app: FastifyInstance) {
  // All routes require auth
  app.addHook('preHandler', requireAuth);

  // ── Claims ──────────────────────────────────────────────

  // Create a claim (conductor, admin)
  app.post('/', async (request) => {
    const input = createClaimSchema.parse(request.body);
    const claim = await reimbursementService.createClaim(request.userId!, input);
    return { claim };
  });

  // List claims for a family (conductor, admin)
  app.get<{ Querystring: { familyId: string } }>('/', async (request) => {
    const { familyId } = request.query;
    const claims = await reimbursementService.listClaims(familyId);
    return { claims };
  });

  // Get claim detail (conductor, admin)
  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    const claim = await reimbursementService.getClaim(request.params.id);
    return { claim };
  });

  // Update claim (conductor, admin)
  app.patch<{ Params: { id: string } }>('/:id', async (request) => {
    const input = updateClaimSchema.parse(request.body);
    const claim = await reimbursementService.updateClaim(request.params.id, input);
    return { claim };
  });

  // Submit claim to HSA provider (conductor, admin)
  app.post<{ Params: { id: string } }>('/:id/submit', async (request) => {
    const claim = await reimbursementService.submitClaim(request.params.id);
    return { claim };
  });

  // Resolve claim — admin only
  app.post<{ Params: { id: string } }>(
    '/:id/resolve',
    { preHandler: requireRole('admin') },
    async (request) => {
      const input = resolveClaimSchema.parse(request.body);
      const claim = await reimbursementService.resolveClaim(request.params.id, input);
      return { claim };
    },
  );

  // ── Documents ───────────────────────────────────────────

  // Generate EOB document
  app.get<{ Params: { id: string } }>('/:id/eob', async (request) => {
    const content = await reimbursementService.generateEOB(request.params.id);
    return { document: { type: 'eob', content, generatedAt: new Date().toISOString() } };
  });

  // Generate receipt
  app.get<{ Params: { id: string } }>('/:id/receipt', async (request) => {
    const content = await reimbursementService.generateReceipt(request.params.id);
    return { document: { type: 'receipt', content, generatedAt: new Date().toISOString() } };
  });

  // ── Annual ──────────────────────────────────────────────

  // Get annual summary
  app.get<{ Params: { taxYear: string }; Querystring: { familyId: string } }>(
    '/summary/:taxYear',
    async (request) => {
      const taxYear = parseInt(request.params.taxYear, 10);
      const { familyId } = request.query;
      const summary = await reimbursementService.getAnnualSummary(familyId, taxYear);
      return { summary };
    },
  );

  // Generate annual tax statement
  app.get<{ Params: { taxYear: string }; Querystring: { familyId: string } }>(
    '/summary/:taxYear/statement',
    async (request) => {
      const taxYear = parseInt(request.params.taxYear, 10);
      const { familyId } = request.query;
      const content = await reimbursementService.generateAnnualStatement(familyId, taxYear);
      return {
        document: { type: 'annual_summary', content, generatedAt: new Date().toISOString() },
      };
    },
  );

  // ── Auto-Generate ──────────────────────────────────────

  // Auto-generate monthly claims — admin only
  app.post('/auto-generate', { preHandler: requireRole('admin') }, async (request) => {
    const input = autoGenerateSchema.parse(request.body ?? {});
    const claims = await reimbursementService.autoGenerateMonthly(input.month, input.year);
    return { claims, count: claims.length };
  });
}
