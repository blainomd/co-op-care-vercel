/**
 * Matching Service — Caregiver-Family Matching Engine
 *
 * Connects families with the right caregivers using weighted scoring:
 * capability match (30%), availability (25%), trust score (20%),
 * experience/hours (15%), proximity (10%), plus continuity bonus (+15).
 */
import { z } from 'zod';
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';

// ── Zod Schemas ─────────────────────────────────────────

export const matchRequestSchema = z.object({
  familyId: z.string().min(1),
  careRecipientId: z.string().min(1),
  needs: z.array(z.string().min(1)).min(1),
  schedule: z.object({
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    hoursPerWeek: z.number().positive(),
  }),
  preferences: z
    .object({
      genderPreference: z.enum(['male', 'female', 'no_preference']).optional(),
      languagePreference: z.array(z.string()).optional(),
      maxDistanceMiles: z.number().positive().optional(),
      experienceMinYears: z.number().min(0).optional(),
    })
    .optional()
    .default({}),
  urgency: z.enum(['routine', 'expedited', 'urgent']),
});

export type MatchRequestInput = z.infer<typeof matchRequestSchema>;

// ── Match Result Shape ──────────────────────────────────

export interface MatchResult {
  caregiverId: string;
  caregiverName: string;
  matchScore: number;
  matchFactors: {
    capabilityMatch: number;
    availabilityMatch: number;
    proximityScore: number;
    experienceScore: number;
    trustScore: number;
    continuityBonus: number;
  };
  communityTier: string;
  verifiedCapabilities: string[];
  totalHoursGiven: number;
  availableSlots: string[];
}

// ── Scoring Weights ─────────────────────────────────────

const WEIGHTS = {
  capability: 0.3,
  availability: 0.25,
  trust: 0.2,
  experience: 0.15,
  proximity: 0.1,
} as const;

const CONTINUITY_BONUS = 15;
const MAX_RESULTS = 5;

// ── Scoring Functions ───────────────────────────────────

function scoreCapabilityMatch(caregiverCapabilities: string[], needs: string[]): number {
  if (needs.length === 0) return 100;
  const matched = needs.filter((need) =>
    caregiverCapabilities.some((cap) => cap.toLowerCase() === need.toLowerCase()),
  );
  return Math.round((matched.length / needs.length) * 100);
}

function scoreAvailability(
  caregiverSlots: queries.CaregiverAvailabilityRecord[],
  schedule: MatchRequestInput['schedule'],
): { score: number; matchingSlots: string[] } {
  const matchingSlots: string[] = [];

  for (const day of schedule.daysOfWeek) {
    const daySlots = caregiverSlots.filter((s) => s.dayOfWeek === day);
    for (const slot of daySlots) {
      if (slot.startTime <= schedule.startTime && slot.endTime >= schedule.endTime) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        matchingSlots.push(`${dayNames[day]} ${slot.startTime}-${slot.endTime}`);
      }
    }
  }

  const score =
    schedule.daysOfWeek.length > 0
      ? Math.round((matchingSlots.length / schedule.daysOfWeek.length) * 100)
      : 0;

  return { score: Math.min(score, 100), matchingSlots };
}

function scoreExperience(totalHoursGiven: number): number {
  // Scale: 0 hrs = 0, 50 hrs = 50, 200+ hrs = 100
  return Math.min(Math.round((totalHoursGiven / 200) * 100), 100);
}

function scoreTrust(trustScore: number): number {
  // trustScore is 0-5 from reviews, normalize to 0-100
  return Math.round((trustScore / 5) * 100);
}

function scoreProximity(_maxDistanceMiles?: number): number {
  // Without geospatial data, default to 80 (assume reasonable distance)
  // Real implementation would use caregiver zip vs family zip
  return 80;
}

// ── Service ─────────────────────────────────────────────

async function submitMatchRequest(input: MatchRequestInput): Promise<{
  matchRequest: queries.MatchRequestRecord;
  matches: MatchResult[];
}> {
  // Create the match request record
  const matchRequest = await queries.createMatchRequest(input);

  // Find and score matches
  const matches = await findMatches(matchRequest);

  // Store match history
  for (const match of matches) {
    await queries.createMatchHistory({
      matchRequestId: matchRequest.id,
      familyId: input.familyId,
      caregiverId: match.caregiverId,
      matchScore: match.matchScore,
      matchFactors: match.matchFactors,
      outcome: 'presented',
    });
  }

  logger.info(
    { matchRequestId: matchRequest.id, matchCount: matches.length, familyId: input.familyId },
    'Match request submitted, results generated',
  );

  return { matchRequest, matches };
}

async function findMatches(matchRequest: queries.MatchRequestRecord): Promise<MatchResult[]> {
  // Get all active caregivers with their community profiles
  let caregivers: queries.CaregiverSearchResult[];
  try {
    caregivers = await queries.listActiveCaregivers();
  } catch {
    logger.warn('Failed to query caregivers from DB, returning empty matches');
    return [];
  }

  const scoredMatches: MatchResult[] = [];

  for (const caregiver of caregivers) {
    // Get availability for this caregiver
    let availability: queries.CaregiverAvailabilityRecord[] = [];
    try {
      availability = await queries.listCaregiverAvailability(caregiver.userId);
    } catch {
      // Continue without availability data
    }

    // Score each factor
    const capabilityMatch = scoreCapabilityMatch(caregiver.capabilities ?? [], matchRequest.needs);
    const { score: availabilityMatch, matchingSlots } = scoreAvailability(
      availability,
      matchRequest.schedule,
    );
    const experienceScore = scoreExperience(caregiver.totalHoursGiven);
    const trustScoreVal = scoreTrust(caregiver.trustScore);
    const proximityScore = scoreProximity(matchRequest.preferences?.maxDistanceMiles);

    // Check continuity bonus
    let continuityBonus = 0;
    try {
      const hasServed = await queries.hasCaregiverServedFamily(
        caregiver.userId,
        matchRequest.familyId,
      );
      if (hasServed) {
        continuityBonus = CONTINUITY_BONUS;
      }
    } catch {
      // Continue without continuity check
    }

    // Calculate weighted total
    const baseScore =
      capabilityMatch * WEIGHTS.capability +
      availabilityMatch * WEIGHTS.availability +
      trustScoreVal * WEIGHTS.trust +
      experienceScore * WEIGHTS.experience +
      proximityScore * WEIGHTS.proximity;

    const matchScore = Math.min(Math.round(baseScore + continuityBonus), 100);

    scoredMatches.push({
      caregiverId: caregiver.userId,
      caregiverName: caregiver.displayName,
      matchScore,
      matchFactors: {
        capabilityMatch,
        availabilityMatch,
        proximityScore,
        experienceScore,
        trustScore: trustScoreVal,
        continuityBonus,
      },
      communityTier: caregiver.tier,
      verifiedCapabilities: caregiver.capabilities ?? [],
      totalHoursGiven: caregiver.totalHoursGiven,
      availableSlots: matchingSlots,
    });
  }

  // Sort by score descending, return top N
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
  return scoredMatches.slice(0, MAX_RESULTS);
}

async function listMyMatchRequests(familyId: string): Promise<queries.MatchRequestRecord[]> {
  return queries.listMatchRequestsByFamilyId(familyId);
}

async function acceptMatch(
  matchRequestId: string,
  caregiverId: string,
  userId: string,
): Promise<queries.MatchRequestRecord> {
  const matchRequest = await queries.getMatchRequestById(matchRequestId);
  if (!matchRequest) throw new NotFoundError('Match request');

  if (matchRequest.familyId !== userId) {
    throw new ValidationError('Only the requesting family can accept a match');
  }

  if (matchRequest.status !== 'open') {
    throw new ValidationError(`Match request is already ${matchRequest.status}`);
  }

  // Update match request
  const updated = await queries.updateMatchRequest(matchRequestId, {
    status: 'matched',
    acceptedCaregiverId: caregiverId,
  });

  // Update match history outcome
  const history = await queries.listMatchHistoryByRequestId(matchRequestId);
  for (const entry of history) {
    const outcome = entry.caregiverId === caregiverId ? 'accepted' : 'declined';
    await queries.createMatchHistory({
      matchRequestId,
      familyId: matchRequest.familyId,
      caregiverId: entry.caregiverId,
      matchScore: entry.matchScore,
      matchFactors: entry.matchFactors,
      outcome,
    });
  }

  logger.info({ matchRequestId, caregiverId }, 'Match accepted');
  return updated;
}

async function declineMatch(
  matchRequestId: string,
  userId: string,
): Promise<{
  matchRequest: queries.MatchRequestRecord;
  alternateMatches: MatchResult[];
}> {
  const matchRequest = await queries.getMatchRequestById(matchRequestId);
  if (!matchRequest) throw new NotFoundError('Match request');

  if (matchRequest.familyId !== userId) {
    throw new ValidationError('Only the requesting family can decline a match');
  }

  if (matchRequest.status !== 'open') {
    throw new ValidationError(`Match request is already ${matchRequest.status}`);
  }

  // Re-run matching to find alternates
  const alternateMatches = await findMatches(matchRequest);

  logger.info({ matchRequestId }, 'Match declined, alternatives generated');
  return { matchRequest, alternateMatches };
}

async function getCaregiverAvailability(
  caregiverId: string,
): Promise<queries.CaregiverAvailabilityRecord[]> {
  const availability = await queries.listCaregiverAvailability(caregiverId);
  return availability;
}

export const matchingService = {
  submitMatchRequest,
  listMyMatchRequests,
  acceptMatch,
  declineMatch,
  getCaregiverAvailability,
};
