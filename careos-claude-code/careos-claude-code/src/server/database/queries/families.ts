// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Family + Care Recipient Query Builders — PostgreSQL CRUD + relation tables
 */
import { getPostgres } from '../postgres.js';
import type { MembershipStatus } from '@shared/types/user.types';

// ── Family Records ─────────────────────────────────────

export interface FamilyRecord {
  id: string;
  name: string;
  conductorId: string;
  membershipStatus: MembershipStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyInput {
  name: string;
  conductorId: string;
}

export async function createFamily(input: CreateFamilyInput): Promise<FamilyRecord> {
  const db = getPostgres();
  const [rawFamily] = await db.create('family', {
    ...input,
    membershipStatus: 'pending',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  } as Record<string, unknown>);
  const family = rawFamily as unknown as FamilyRecord;

  // Create conductor → family graph edge
  await db.query(
    `RELATE type::thing("user", $conductorId)->member_of->type::thing("family", $familyId) SET role = 'conductor'`,
    { conductorId: input.conductorId, familyId: String(family.id).split(':')[1] },
  );

  return family;
}

export async function getFamilyById(id: string): Promise<FamilyRecord | null> {
  const db = getPostgres();
  const result = await db.query<[FamilyRecord[]]>(
    'SELECT * FROM type::thing("family", $id) LIMIT 1',
    { id },
  );
  return result[0]?.[0] ?? null;
}

export async function listFamiliesByConductor(conductorId: string): Promise<FamilyRecord[]> {
  const db = getPostgres();
  const result = await db.query<[FamilyRecord[]]>(
    'SELECT * FROM family WHERE conductorId = type::thing("user", $conductorId) ORDER BY name ASC',
    { conductorId },
  );
  return result[0] ?? [];
}

export async function listAllFamilies(): Promise<FamilyRecord[]> {
  const db = getPostgres();
  const result = await db.query<[FamilyRecord[]]>('SELECT * FROM family ORDER BY name ASC');
  return result[0] ?? [];
}

export async function updateFamily(
  id: string,
  data: Partial<
    Pick<FamilyRecord, 'name' | 'membershipStatus' | 'stripeCustomerId' | 'stripeSubscriptionId'>
  >,
): Promise<FamilyRecord | null> {
  const db = getPostgres();
  const result = await db.query<[FamilyRecord[]]>(
    `UPDATE type::thing("family", $id) MERGE $data RETURN AFTER`,
    { id, data: { ...data, updatedAt: new Date().toISOString() } },
  );
  return result[0]?.[0] ?? null;
}

export async function deleteFamily(id: string): Promise<void> {
  const db = getPostgres();
  // Delete graph edges first
  await db.query(`DELETE member_of WHERE out = type::thing("family", $id)`, { id });
  await db.query(`DELETE assigned_to WHERE out = type::thing("family", $id)`, { id });
  await db.query('DELETE type::thing("family", $id)', { id });
}

// ── Care Recipient Records ─────────────────────────────

export interface CareRecipientRecord {
  id: string;
  familyId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mobilityLevel: string;
  cognitiveStatus: string | null;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  primaryDiagnoses: string[];
  activeOmahaProblems: number[];
  fhirPatientId: string | null;
  wearableDeviceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareRecipientInput {
  familyId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mobilityLevel?: string;
  cognitiveStatus?: string;
  primaryDiagnoses?: string[];
}

export async function createCareRecipient(
  input: CreateCareRecipientInput,
): Promise<CareRecipientRecord> {
  const db = getPostgres();
  const [cr] = await db.create('care_recipient', {
    ...input,
    mobilityLevel: input.mobilityLevel ?? 'independent',
    cognitiveStatus: input.cognitiveStatus ?? null,
    location: null,
    primaryDiagnoses: input.primaryDiagnoses ?? [],
    activeOmahaProblems: [],
    fhirPatientId: null,
    wearableDeviceId: null,
  } as Record<string, unknown>);
  return cr as unknown as CareRecipientRecord;
}

export async function getCareRecipientById(id: string): Promise<CareRecipientRecord | null> {
  const db = getPostgres();
  const result = await db.query<[CareRecipientRecord[]]>(
    'SELECT * FROM type::thing("care_recipient", $id) LIMIT 1',
    { id },
  );
  return result[0]?.[0] ?? null;
}

export async function listCareRecipientsByFamily(familyId: string): Promise<CareRecipientRecord[]> {
  const db = getPostgres();
  const result = await db.query<[CareRecipientRecord[]]>(
    'SELECT * FROM care_recipient WHERE familyId = type::thing("family", $familyId) ORDER BY lastName ASC',
    { familyId },
  );
  return result[0] ?? [];
}

export async function updateCareRecipient(
  id: string,
  data: Partial<Omit<CareRecipientRecord, 'id' | 'familyId' | 'createdAt'>>,
): Promise<CareRecipientRecord | null> {
  const db = getPostgres();
  const result = await db.query<[CareRecipientRecord[]]>(
    `UPDATE type::thing("care_recipient", $id) MERGE $data RETURN AFTER`,
    { id, data: { ...data, updatedAt: new Date().toISOString() } },
  );
  return result[0]?.[0] ?? null;
}

// ── Care Team (Graph Edges) ────────────────────────────

export interface CareTeamMember {
  userId: string;
  role: string;
  assignedAt: string;
  active: boolean;
}

export async function assignToCareTeam(
  userId: string,
  familyId: string,
  role: string,
): Promise<void> {
  const db = getPostgres();
  await db.query(
    `RELATE type::thing("user", $userId)->assigned_to->type::thing("family", $familyId) SET role = $role, active = true`,
    { userId, familyId, role },
  );
}

export async function removeCareTeamMember(userId: string, familyId: string): Promise<void> {
  const db = getPostgres();
  await db.query(
    `UPDATE assigned_to SET active = false WHERE in = type::thing("user", $userId) AND out = type::thing("family", $familyId)`,
    { userId, familyId },
  );
}

export async function getCareTeam(familyId: string): Promise<CareTeamMember[]> {
  const db = getPostgres();
  const result = await db.query<[CareTeamMember[]]>(
    `SELECT in AS userId, role, assignedAt, active
     FROM assigned_to
     WHERE out = type::thing("family", $familyId) AND active = true`,
    { familyId },
  );
  return result[0] ?? [];
}

export async function getFamiliesForUser(userId: string): Promise<string[]> {
  const db = getPostgres();
  const result = await db.query<[Array<{ out: string }>]>(
    `SELECT out FROM member_of WHERE in = type::thing("user", $userId)
     UNION
     SELECT out FROM assigned_to WHERE in = type::thing("user", $userId) AND active = true`,
    { userId },
  );
  return (result[0] ?? []).map((r) => String(r.out));
}
