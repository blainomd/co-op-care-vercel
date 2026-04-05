/**
 * Family Routes — CRUD for Family + CareRecipient + Care Team
 * Allowed roles: conductor, admin
 */
import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';
import { familyService } from './service.js';
import {
  createFamilySchema,
  updateFamilySchema,
  createCareRecipientSchema,
  updateCareRecipientSchema,
  assignCareTeamSchema,
} from './schemas.js';

export async function familyRoutes(app: FastifyInstance): Promise<void> {
  // All routes require auth + conductor or admin role
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireRole('conductor', 'admin'));

  const isAdmin = (request: { activeRole?: string }) => request.activeRole === 'admin';

  // --- Family CRUD ---

  app.post('/', async (request, reply) => {
    const parsed = createFamilySchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid family data');

    const family = await familyService.createFamily(request.userId!, parsed.data);
    reply.status(201).send(family);
  });

  app.get('/', async (request) => {
    return familyService.listFamilies(request.userId!, isAdmin(request));
  });

  app.get('/:familyId', async (request) => {
    const { familyId } = request.params as { familyId: string };
    return familyService.getFamily(familyId, request.userId!, isAdmin(request));
  });

  app.put('/:familyId', async (request) => {
    const { familyId } = request.params as { familyId: string };
    const parsed = updateFamilySchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid update data');

    return familyService.updateFamily(familyId, request.userId!, isAdmin(request), parsed.data);
  });

  app.delete('/:familyId', async (request, reply) => {
    const { familyId } = request.params as { familyId: string };
    await familyService.deleteFamily(familyId, request.userId!, isAdmin(request));
    reply.status(204).send();
  });

  // --- Care Recipients ---

  app.post('/:familyId/care-recipients', async (request, reply) => {
    const { familyId } = request.params as { familyId: string };
    const parsed = createCareRecipientSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid care recipient data');

    const cr = await familyService.createCareRecipient(
      familyId,
      request.userId!,
      isAdmin(request),
      parsed.data,
    );
    reply.status(201).send(cr);
  });

  app.get('/:familyId/care-recipients', async (request) => {
    const { familyId } = request.params as { familyId: string };
    return familyService.listCareRecipients(familyId, request.userId!, isAdmin(request));
  });

  app.get('/:familyId/care-recipients/:careRecipientId', async (request) => {
    const { careRecipientId } = request.params as { careRecipientId: string };
    return familyService.getCareRecipient(careRecipientId, request.userId!, isAdmin(request));
  });

  app.put('/:familyId/care-recipients/:careRecipientId', async (request) => {
    const { careRecipientId } = request.params as { careRecipientId: string };
    const parsed = updateCareRecipientSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid update data');

    return familyService.updateCareRecipient(
      careRecipientId,
      request.userId!,
      isAdmin(request),
      parsed.data,
    );
  });

  // --- Care Team ---

  app.post('/:familyId/care-team', async (request, reply) => {
    const { familyId } = request.params as { familyId: string };
    const parsed = assignCareTeamSchema.safeParse(request.body);
    if (!parsed.success) throw new ValidationError('Invalid care team assignment');

    await familyService.assignCareTeam(familyId, request.userId!, isAdmin(request), parsed.data);
    reply.status(201).send({ message: 'Care team member assigned' });
  });

  app.get('/:familyId/care-team', async (request) => {
    const { familyId } = request.params as { familyId: string };
    return familyService.getCareTeam(familyId, request.userId!, isAdmin(request));
  });
}
