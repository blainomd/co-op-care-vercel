/**
 * Web3 Routes — Blockchain reputation, LMN verification, and governance
 *
 * Public endpoints:
 *   GET /verify-lmn/:hash — verify an LMN document hash on-chain
 *
 * Authenticated endpoints:
 *   GET /profile/:userId — on-chain reputation profile
 *   GET /governance/proposals — list active governance proposals
 *   POST /governance/proposals — create a proposal (members only)
 *   POST /governance/proposals/:id/vote — cast a vote (members only)
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { web3Service } from './service.js';

export async function web3Routes(app: FastifyInstance): Promise<void> {
  // ─── Public: LMN Verification ─────────────────────────────

  /**
   * GET /verify-lmn/:hash — Verify an LMN document hash on-chain
   * Public endpoint — anyone can verify an LMN's authenticity.
   */
  app.get<{ Params: { hash: string } }>('/verify-lmn/:hash', async (request) => {
    const { hash } = request.params;
    if (!hash || hash.length < 8) {
      throw new ValidationError('Invalid document hash');
    }

    const result = await web3Service.verifyLMN(hash);
    return {
      web3Enabled: web3Service.isEnabled(),
      ...result,
    };
  });

  // ─── Authenticated: Profile & Governance ──────────────────

  // All remaining routes require auth
  app.register(async (authedApp) => {
    authedApp.addHook('preHandler', requireAuth);

    /**
     * GET /profile/:userId — Get on-chain reputation profile
     * Returns prestige hours, spendable hours, and capability badges.
     */
    authedApp.get<{ Params: { userId: string } }>('/profile/:userId', async (request) => {
      const { userId } = request.params;
      const profile = await web3Service.getOnChainProfile(userId);
      return {
        web3Enabled: web3Service.isEnabled(),
        userId,
        ...profile,
      };
    });

    /**
     * GET /governance/proposals — List active governance proposals
     */
    authedApp.get('/governance/proposals', async () => {
      const proposals = await web3Service.listProposals();
      return {
        web3Enabled: web3Service.isEnabled(),
        proposals,
      };
    });

    /**
     * POST /governance/proposals — Create a new governance proposal
     * Requires conductor, worker_owner, timebank_member, or admin role.
     */
    authedApp.post('/governance/proposals', async (request, reply) => {
      await requireRole('conductor', 'worker_owner', 'timebank_member', 'admin')(request, reply);

      const body = request.body as { description?: string; isBylawChange?: boolean };
      if (!body.description || body.description.trim().length < 10) {
        throw new ValidationError('Proposal description must be at least 10 characters');
      }

      const result = await web3Service.createProposal(
        body.description.trim(),
        body.isBylawChange ?? false,
      );

      reply.status(201).send({
        web3Enabled: web3Service.isEnabled(),
        ...result,
      });
    });

    /**
     * POST /governance/proposals/:id/vote — Cast a vote on a proposal
     * Requires conductor, worker_owner, timebank_member, or admin role.
     */
    authedApp.post<{ Params: { id: string } }>(
      '/governance/proposals/:id/vote',
      async (request, reply) => {
        await requireRole('conductor', 'worker_owner', 'timebank_member', 'admin')(request, reply);

        const proposalId = parseInt(request.params.id, 10);
        if (isNaN(proposalId) || proposalId < 0) {
          throw new ValidationError('Invalid proposal ID');
        }

        const body = request.body as { support?: boolean };
        if (typeof body.support !== 'boolean') {
          throw new ValidationError('Must provide support: true or false');
        }

        const result = await web3Service.castVote(proposalId, body.support);
        return {
          web3Enabled: web3Service.isEnabled(),
          proposalId,
          support: body.support,
          ...result,
        };
      },
    );
  });
}
