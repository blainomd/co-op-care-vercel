/**
 * Family Service — CRUD for Family + CareRecipient, care team assignment
 */
import * as queries from '../../database/queries/index.js';
import { logger } from '../../common/logger.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';
import type {
  CreateFamilyInput,
  UpdateFamilyInput,
  CreateCareRecipientInput,
  UpdateCareRecipientInput,
  AssignCareTeamInput,
} from './schemas.js';

export const familyService = {
  /**
   * Create a new family for the current conductor
   */
  async createFamily(conductorId: string, input: CreateFamilyInput) {
    // Query builder handles both CREATE and member_of edge
    const family = await queries.createFamily({
      name: input.name,
      conductorId,
    });

    logger.info({ familyId: family.id }, 'Family created');
    return family;
  },

  /**
   * Get a family by ID (with ownership check)
   */
  async getFamily(familyId: string, userId: string, isAdmin: boolean) {
    const family = await queries.getFamilyById(familyId);
    if (!family) {
      throw new NotFoundError('Family');
    }

    // Row-level isolation: conductor sees only own family, admin sees all
    if (!isAdmin && family.conductorId !== userId) {
      throw new ForbiddenError('Access denied to this family');
    }

    return family;
  },

  /**
   * List families for a user
   */
  async listFamilies(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      return queries.listAllFamilies();
    }
    return queries.listFamiliesByConductor(userId);
  },

  /**
   * Update a family
   */
  async updateFamily(familyId: string, userId: string, isAdmin: boolean, input: UpdateFamilyInput) {
    // Verify ownership
    await this.getFamily(familyId, userId, isAdmin);

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.membershipStatus !== undefined) data.membershipStatus = input.membershipStatus;

    const updated = await queries.updateFamily(familyId, data);
    return updated!;
  },

  /**
   * Delete a family
   */
  async deleteFamily(familyId: string, userId: string, isAdmin: boolean): Promise<void> {
    await this.getFamily(familyId, userId, isAdmin);
    await queries.deleteFamily(familyId);
    logger.info({ familyId }, 'Family deleted');
  },

  // --- Care Recipients ---

  async createCareRecipient(
    familyId: string,
    userId: string,
    isAdmin: boolean,
    input: CreateCareRecipientInput,
  ) {
    // Verify family ownership
    await this.getFamily(familyId, userId, isAdmin);

    const cr = await queries.createCareRecipient({
      familyId,
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth,
      mobilityLevel: input.mobilityLevel,
      cognitiveStatus: input.cognitiveStatus,
      primaryDiagnoses: input.primaryDiagnoses,
    });

    logger.info({ careRecipientId: cr.id, familyId }, 'Care recipient created');
    return cr;
  },

  async getCareRecipient(careRecipientId: string, userId: string, isAdmin: boolean) {
    const cr = await queries.getCareRecipientById(careRecipientId);
    if (!cr) throw new NotFoundError('Care recipient');

    // Verify family ownership
    await this.getFamily(cr.familyId, userId, isAdmin);
    return cr;
  },

  async listCareRecipients(familyId: string, userId: string, isAdmin: boolean) {
    await this.getFamily(familyId, userId, isAdmin);
    return queries.listCareRecipientsByFamily(familyId);
  },

  async updateCareRecipient(
    careRecipientId: string,
    userId: string,
    isAdmin: boolean,
    input: UpdateCareRecipientInput,
  ) {
    const existing = await this.getCareRecipient(careRecipientId, userId, isAdmin);

    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        data[key] = value;
      }
    }

    const updated = await queries.updateCareRecipient(existing.id, data);
    return updated!;
  },

  // --- Care Team Assignment ---

  async assignCareTeam(
    familyId: string,
    userId: string,
    isAdmin: boolean,
    input: AssignCareTeamInput,
  ): Promise<void> {
    await this.getFamily(familyId, userId, isAdmin);
    await queries.assignToCareTeam(input.userId, familyId, input.role);
    logger.info(
      { workerId: input.userId, familyId, role: input.role },
      'Care team member assigned',
    );
  },

  async getCareTeam(
    familyId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<Array<{ userId: string; role: string; assignedAt: string }>> {
    await this.getFamily(familyId, userId, isAdmin);

    const members = await queries.getCareTeam(familyId);
    return members.map((m) => ({
      userId: m.userId,
      role: m.role,
      assignedAt: m.assignedAt,
    }));
  },
};
