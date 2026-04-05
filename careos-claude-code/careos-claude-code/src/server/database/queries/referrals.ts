// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Referral Query Builders — Hospital/Social Worker Referral CRUD
 */
import { getPostgres } from '../postgres.js';

// ── Referral Records ────────────────────────────────────

export interface ReferralRecord {
  id: string;
  source: 'hospital' | 'social_worker' | 'physician' | 'self';
  sourceOrganization: string | null;
  sourceContactName: string | null;
  sourceContactEmail: string | null;
  patientFirstName: string;
  patientLastName: string;
  patientDateOfBirth: string;
  patientAge: number | null;
  patientConditions: string[];
  patientMedications: string[];
  patientMobilityLevel: string | null;
  patientState: string;
  caregiverFirstName: string | null;
  caregiverLastName: string | null;
  caregiverRelationship: string | null;
  caregiverEmail: string | null;
  caregiverPhone: string | null;
  dischargeDate: string | null;
  urgency: 'routine' | 'expedited' | 'urgent';
  notes: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'converted_to_family';
  estimatedCriScore: number;
  estimatedAcuity: 'low' | 'moderate' | 'high' | 'critical';
  recommendedTier: string;
  lmnDraftId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralInput {
  source: 'hospital' | 'social_worker' | 'physician' | 'self';
  sourceOrganization?: string;
  sourceContactName?: string;
  sourceContactEmail?: string;
  patientFirstName: string;
  patientLastName: string;
  patientDateOfBirth: string;
  patientAge?: number;
  patientConditions: string[];
  patientMedications?: string[];
  patientMobilityLevel?: string;
  patientState: string;
  caregiverFirstName?: string;
  caregiverLastName?: string;
  caregiverRelationship?: string;
  caregiverEmail?: string;
  caregiverPhone?: string;
  dischargeDate?: string;
  urgency: 'routine' | 'expedited' | 'urgent';
  notes?: string;
  estimatedCriScore: number;
  estimatedAcuity: 'low' | 'moderate' | 'high' | 'critical';
  recommendedTier: string;
}

export async function createReferral(input: CreateReferralInput): Promise<ReferralRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('referral', {
    source: input.source,
    sourceOrganization: input.sourceOrganization ?? null,
    sourceContactName: input.sourceContactName ?? null,
    sourceContactEmail: input.sourceContactEmail ?? null,
    patientFirstName: input.patientFirstName,
    patientLastName: input.patientLastName,
    patientDateOfBirth: input.patientDateOfBirth,
    patientAge: input.patientAge ?? null,
    patientConditions: input.patientConditions,
    patientMedications: input.patientMedications ?? [],
    patientMobilityLevel: input.patientMobilityLevel ?? null,
    patientState: input.patientState,
    caregiverFirstName: input.caregiverFirstName ?? null,
    caregiverLastName: input.caregiverLastName ?? null,
    caregiverRelationship: input.caregiverRelationship ?? null,
    caregiverEmail: input.caregiverEmail ?? null,
    caregiverPhone: input.caregiverPhone ?? null,
    dischargeDate: input.dischargeDate ?? null,
    urgency: input.urgency,
    notes: input.notes ?? null,
    status: 'pending',
    estimatedCriScore: input.estimatedCriScore,
    estimatedAcuity: input.estimatedAcuity,
    recommendedTier: input.recommendedTier,
    lmnDraftId: null,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as ReferralRecord;
}

export async function getReferralById(id: string): Promise<ReferralRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as ReferralRecord) ?? null;
}

export async function updateReferral(
  id: string,
  data: Partial<ReferralRecord>,
): Promise<ReferralRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, { ...data, updatedAt: new Date().toISOString() } as Record<
    string,
    unknown
  >);
  return record as unknown as ReferralRecord;
}

export async function listAllReferrals(): Promise<ReferralRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReferralRecord[]]>(
    'SELECT * FROM referral ORDER BY createdAt DESC',
  );
  return records[0] ?? [];
}

export async function listReferralsByStatus(status: string): Promise<ReferralRecord[]> {
  const db = getPostgres();
  const records = await db.query<[ReferralRecord[]]>(
    'SELECT * FROM referral WHERE status = $status ORDER BY createdAt DESC',
    { status },
  );
  return records[0] ?? [];
}
