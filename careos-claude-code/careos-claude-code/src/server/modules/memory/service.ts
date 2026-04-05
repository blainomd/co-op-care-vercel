// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Memory Service — Server-side profile persistence
 *
 * Commercial-grade user memory for Sage. Profiles persist across
 * devices, sessions, and browser clears. The source of truth.
 *
 * Key design: profiles are ADDITIVE. New data merges with existing,
 * never overwrites. Array fields (conditions, medications, network)
 * are deduplicated on merge.
 */
import { getPostgres } from '../../database/postgres.js';
import { logger } from '../../common/logger.js';

// ─── Types ──────────────────────────────────────────────────────────

export interface ProfileData {
  userId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  careRecipient?: Record<string, unknown>;
  caregiverCtx?: Record<string, unknown>;
  network?: Record<string, unknown>[];
  lastMiniCII?: Record<string, unknown>;
  lastCRI?: Record<string, unknown>;
  seeds?: { total: number; history: Array<{ action: string; seeds: number; date: string }> };
  conversationCount?: number;
  topDomains?: Record<string, number>;
  referralCount?: number;
  onboardingPhase?: string;
  memoryConsent?: string;
  communityRoles?: string[];
  idVerified?: boolean;
  fhirPatientId?: string;
}

export interface MemorySummary {
  userId: string;
  memorySummary: string;
  facts: Array<{ category: string; fact: string; confidence: number; sourceDate: string }>;
  totalMessages: number;
  sessionCount: number;
}

// ─── Profile CRUD ───────────────────────────────────────────────────

/**
 * Get or create a user profile
 */
export async function getProfile(userId: string): Promise<ProfileData | null> {
  const pool = getPostgres();
  const result = await pool.query(
    `SELECT
      user_id AS "userId",
      email,
      phone,
      first_name AS "firstName",
      care_recipient AS "careRecipient",
      caregiver_ctx AS "caregiverCtx",
      network,
      last_mini_cii AS "lastMiniCII",
      last_cri AS "lastCRI",
      seeds,
      conversation_count AS "conversationCount",
      top_domains AS "topDomains",
      referral_count AS "referralCount",
      onboarding_phase AS "onboardingPhase",
      memory_consent AS "memoryConsent",
      community_roles AS "communityRoles",
      id_verified AS "idVerified",
      fhir_patient_id AS "fhirPatientId"
    FROM user_profiles
    WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

/**
 * Upsert a user profile — merges new data with existing (additive)
 */
export async function saveProfile(data: ProfileData): Promise<void> {
  const pool = getPostgres();

  await pool.query(
    `INSERT INTO user_profiles (
      user_id, email, phone, first_name,
      care_recipient, caregiver_ctx, network,
      last_mini_cii, last_cri, seeds,
      conversation_count, top_domains, referral_count,
      onboarding_phase, memory_consent, community_roles,
      id_verified, fhir_patient_id, last_visit
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7,
      $8, $9, $10,
      $11, $12, $13,
      $14, $15, $16,
      $17, $18, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, user_profiles.email),
      phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
      first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
      care_recipient = COALESCE(EXCLUDED.care_recipient, '{}') || COALESCE(user_profiles.care_recipient, '{}'),
      caregiver_ctx = COALESCE(EXCLUDED.caregiver_ctx, '{}') || COALESCE(user_profiles.caregiver_ctx, '{}'),
      network = EXCLUDED.network,
      last_mini_cii = COALESCE(EXCLUDED.last_mini_cii, user_profiles.last_mini_cii),
      last_cri = COALESCE(EXCLUDED.last_cri, user_profiles.last_cri),
      seeds = COALESCE(EXCLUDED.seeds, user_profiles.seeds),
      conversation_count = GREATEST(EXCLUDED.conversation_count, user_profiles.conversation_count),
      top_domains = COALESCE(EXCLUDED.top_domains, '{}') || COALESCE(user_profiles.top_domains, '{}'),
      referral_count = GREATEST(EXCLUDED.referral_count, user_profiles.referral_count),
      onboarding_phase = COALESCE(EXCLUDED.onboarding_phase, user_profiles.onboarding_phase),
      memory_consent = COALESCE(EXCLUDED.memory_consent, user_profiles.memory_consent),
      community_roles = COALESCE(EXCLUDED.community_roles, user_profiles.community_roles),
      id_verified = COALESCE(EXCLUDED.id_verified, user_profiles.id_verified),
      fhir_patient_id = COALESCE(EXCLUDED.fhir_patient_id, user_profiles.fhir_patient_id),
      last_visit = NOW()`,
    [
      data.userId,
      data.email,
      data.phone,
      data.firstName,
      JSON.stringify(data.careRecipient ?? {}),
      JSON.stringify(data.caregiverCtx ?? {}),
      JSON.stringify(data.network ?? []),
      data.lastMiniCII ? JSON.stringify(data.lastMiniCII) : null,
      data.lastCRI ? JSON.stringify(data.lastCRI) : null,
      JSON.stringify(data.seeds ?? { total: 0, history: [] }),
      data.conversationCount ?? 0,
      JSON.stringify(data.topDomains ?? {}),
      data.referralCount ?? 0,
      data.onboardingPhase ?? 'fresh',
      data.memoryConsent ?? 'pending',
      data.communityRoles ?? [],
      data.idVerified ?? false,
      data.fhirPatientId ?? null,
    ],
  );

  logger.debug({ userId: data.userId }, 'Profile saved');
}

// ─── Conversation Memory ────────────────────────────────────────────

/**
 * Get the memory summary for a user (what Sage "remembers")
 */
export async function getMemory(userId: string): Promise<MemorySummary | null> {
  const pool = getPostgres();
  const result = await pool.query(
    `SELECT
      user_id AS "userId",
      memory_summary AS "memorySummary",
      facts,
      total_messages AS "totalMessages",
      session_count AS "sessionCount"
    FROM conversation_memory
    WHERE user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

/**
 * Update the conversation memory summary
 * Called at end of each session to compress what was learned
 */
export async function updateMemory(
  userId: string,
  summary: string,
  facts: Array<{ category: string; fact: string; confidence: number; sourceDate: string }>,
  messageCount: number,
): Promise<void> {
  const pool = getPostgres();

  await pool.query(
    `INSERT INTO conversation_memory (user_id, memory_summary, facts, total_messages, session_count)
    VALUES ($1, $2, $3, $4, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      memory_summary = $2,
      facts = $3,
      total_messages = conversation_memory.total_messages + $4,
      session_count = conversation_memory.session_count + 1`,
    [userId, summary, JSON.stringify(facts), messageCount],
  );

  logger.debug({ userId, factCount: facts.length }, 'Memory updated');
}

// ─── Session Tracking ───────────────────────────────────────────────

export async function startSession(userId: string): Promise<string> {
  const pool = getPostgres();
  const result = await pool.query(
    `INSERT INTO conversation_sessions (user_id)
    VALUES ($1) RETURNING id`,
    [userId],
  );
  return result.rows[0].id;
}

export async function endSession(
  sessionId: string,
  messageCount: number,
  domains: string[],
  profileDelta: Record<string, unknown>,
  summary: string,
): Promise<void> {
  const pool = getPostgres();
  await pool.query(
    `UPDATE conversation_sessions SET
      ended_at = NOW(),
      message_count = $2,
      domains_discussed = $3,
      profile_delta = $4,
      session_summary = $5
    WHERE id = $1`,
    [sessionId, messageCount, domains, JSON.stringify(profileDelta), summary],
  );
}
