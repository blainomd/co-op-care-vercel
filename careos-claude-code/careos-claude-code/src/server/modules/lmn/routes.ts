/**
 * LMN Routes — Letter of Medical Necessity API endpoints
 *
 * Ownership enforcement:
 *   - medical_director / admin: full access to all LMNs
 *   - conductor: scoped to LMNs for care recipients in their families
 */
import type { FastifyInstance } from 'fastify';
import { lmnService } from './service.js';
import {
  generateLMNSchema,
  signLMNSchema,
  renewLMNSchema,
  publicLMNRequestSchema,
} from './schemas.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ForbiddenError } from '../../common/errors.js';
import {
  getCareRecipientById,
  getFamiliesForUser,
  getLMNById,
} from '../../database/queries/index.js';
import { logger } from '../../common/logger.js';
import { createLMNCheckoutSession } from '../payment/stripe.js';

const PRIVILEGED_ROLES = ['medical_director', 'admin'];

async function assertLMNAccess(userId: string, roles: string[], lmnId: string): Promise<void> {
  if (roles.some((r) => PRIVILEGED_ROLES.includes(r))) return;
  const lmn = await getLMNById(lmnId);
  if (!lmn) return; // NotFoundError raised by service
  const cr = await getCareRecipientById(lmn.careRecipientId);
  if (!cr) throw new ForbiddenError('Access denied');
  const userFamilies = await getFamiliesForUser(userId);
  if (!userFamilies.includes(cr.familyId)) throw new ForbiddenError('Access denied');
}

/**
 * Public LMN routes — no auth required (direct-to-consumer $199 flow)
 */
export async function lmnPublicRoutes(app: FastifyInstance) {
  // ── Public LMN Request (no auth) ─────────────────────
  app.post('/public-request', async (request, reply) => {
    const input = publicLMNRequestSchema.parse(request.body);

    // Stripe payment intent ID should be passed after client-side checkout
    const stripePaymentIntentId = (request.body as Record<string, unknown>)
      .stripePaymentIntentId as string;
    if (!stripePaymentIntentId) {
      return reply.status(400).send({ error: 'Payment required. Complete Stripe checkout first.' });
    }

    const lmn = await lmnService.createPublicRequest(input, stripePaymentIntentId);
    logger.info({ lmnId: lmn.id }, 'Public LMN request received');

    return {
      success: true,
      lmnId: lmn.id,
      message:
        'Your Letter of Medical Necessity request has been received. A physician will review and sign within 24-48 hours. You will receive the signed letter via email.',
      estimatedDelivery: '24-48 hours',
    };
  });

  // ── Create Stripe Checkout Session (no auth) ──────────
  app.post('/checkout', async (request, reply) => {
    const body = request.body as { email: string; patientName: string };
    if (!body.email || !body.patientName) {
      return reply.status(400).send({ error: 'Email and patient name required' });
    }

    try {
      const session = await createLMNCheckoutSession(
        body.email,
        body.patientName,
        `${request.protocol}://${request.hostname}/get-lmn?success=true&session_id={CHECKOUT_SESSION_ID}`,
        `${request.protocol}://${request.hostname}/get-lmn?canceled=true`,
      );

      return { checkoutUrl: session.url, sessionId: session.id };
    } catch (err) {
      logger.error({ err }, 'Failed to create LMN checkout session');
      return reply.status(500).send({ error: 'Payment system error. Please try again.' });
    }
  });

  // ── LMN Pricing Info (no auth) ────────────────────────
  app.get('/pricing', async () => {
    return {
      price: 199,
      currency: 'usd',
      description: 'Letter of Medical Necessity — Physician Review & Signature',
      includes: [
        'Licensed physician review of your care needs',
        'Signed Letter of Medical Necessity',
        'HSA/FSA eligibility documentation',
        'Valid for 12 months',
        'Delivered via email within 24-48 hours',
      ],
      savings: {
        description: 'Average HSA/FSA tax savings: 28-36% on qualifying expenses',
        example: '$5,000 in care expenses saves $1,400-$1,800 in taxes',
      },
    };
  });
}

export async function lmnRoutes(app: FastifyInstance) {
  // All routes require auth + conductor/medical_director/admin
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('conductor', 'medical_director', 'admin'));

  // ── List LMNs ─────────────────────────────────────────
  // medical_director/admin: all LMNs; conductor: scoped to their families
  app.get('/', async (request) => {
    const roles = request.userRoles ?? [];
    const isPrivileged = roles.some((r) => PRIVILEGED_ROLES.includes(r));
    const lmns = isPrivileged
      ? await lmnService.listLMNs()
      : await lmnService.listLMNsForUser(request.userId!);
    return { lmns };
  });

  // ── List LMNs pending MD signature ─────────────────────
  app.get('/pending-signature', async () => {
    const lmns = await lmnService.listPendingSignature();
    return { lmns };
  });

  // ── Generate new LMN ──────────────────────────────────
  app.post('/generate', async (request) => {
    const input = generateLMNSchema.parse(request.body);
    const lmn = await lmnService.generate(request.userId!, input);
    return { lmn };
  });

  // ── Get LMN by ID ─────────────────────────────────────
  app.get<{ Params: { lmnId: string } }>('/:lmnId', async (request) => {
    await assertLMNAccess(request.userId!, request.userRoles ?? [], request.params.lmnId);
    const lmn = await lmnService.getLMN(request.params.lmnId);
    return { lmn };
  });

  // ── Get LMN preview (rendered text) ────────────────────
  app.get<{ Params: { lmnId: string } }>('/:lmnId/preview', async (request) => {
    await assertLMNAccess(request.userId!, request.userRoles ?? [], request.params.lmnId);
    const preview = await lmnService.getLMNPreview(request.params.lmnId);
    return { preview };
  });

  // ── Send for signature ────────────────────────────────
  app.post<{ Params: { lmnId: string } }>('/:lmnId/sign', async (request) => {
    await assertLMNAccess(request.userId!, request.userRoles ?? [], request.params.lmnId);
    const input = signLMNSchema.parse(request.body);
    const lmn = await lmnService.sendForSignature(request.params.lmnId, request.userId!, input);
    return { lmn };
  });

  // ── Complete signature (webhook callback) ──────────────
  app.post<{ Params: { lmnId: string } }>('/:lmnId/signature-complete', async (request) => {
    await assertLMNAccess(request.userId!, request.userRoles ?? [], request.params.lmnId);
    const lmn = await lmnService.completeSignature(request.params.lmnId);
    return { lmn };
  });

  // ── Revoke LMN ────────────────────────────────────────
  app.post<{ Params: { lmnId: string } }>('/:lmnId/revoke', async (request) => {
    await assertLMNAccess(request.userId!, request.userRoles ?? [], request.params.lmnId);
    const lmn = await lmnService.revoke(request.params.lmnId, request.userId!);
    return { lmn };
  });

  // ── Renew LMN ─────────────────────────────────────────
  app.post<{ Params: { lmnId: string } }>('/:lmnId/renew', async (request) => {
    await assertLMNAccess(request.userId!, request.userRoles ?? [], request.params.lmnId);
    const input = renewLMNSchema.parse(request.body);
    const lmn = await lmnService.renew(request.params.lmnId, request.userId!, input);
    return { lmn };
  });
}
