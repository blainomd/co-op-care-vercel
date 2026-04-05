/**
 * Time Bank Matching Service
 * Multi-factor scoring: skill + proximity + rating + availability
 *
 * Proximity tiers: <0.5mi=3×, 0.5-1mi=2×, 1-2mi=1×, >2mi=Remote only
 * Identity match: 2× multiplier
 */
import type { GeoPoint } from '@shared/types/user.types';
import type { TaskType } from '@shared/constants/business-rules';
import { MATCHING_WEIGHTS, REMOTE_TASK_TYPES } from '@shared/constants/business-rules';
import type { MatchScore } from '@shared/types/timebank.types';
import { haversineDistance } from './gps-verifier.js';
import { findAvailableUsers } from '../../database/queries/index.js';
import type { CandidateUserRecord } from '../../database/queries/index.js';

interface CandidateUser {
  id: string;
  location?: GeoPoint;
  skills?: string[];
  averageRating?: number;
  completedTasks?: number;
  isAvailable?: boolean;
}

/**
 * Map query builder CandidateUserRecord to service CandidateUser
 */
function mapCandidate(record: CandidateUserRecord): CandidateUser {
  return {
    id: record.id,
    location: record.location
      ? { latitude: record.location.coordinates[1], longitude: record.location.coordinates[0] }
      : undefined,
    skills: record.skills,
    averageRating: record.rating ?? undefined,
    completedTasks: record.ratingCount,
    isAvailable: true, // query only returns available users
  };
}

/**
 * Calculate proximity score based on distance tiers
 */
export function proximityScore(distanceMiles: number): number {
  for (const tier of MATCHING_WEIGHTS.PROXIMITY_TIERS) {
    if (distanceMiles <= tier.maxMiles) {
      return tier.multiplier;
    }
  }
  return 0;
}

/**
 * Calculate skill match score (0-1)
 * Checks if user has completed tasks of this type before
 */
function skillScore(candidate: CandidateUser, taskType: TaskType): number {
  if (!candidate.skills) return 0.5; // neutral if no skill data
  return candidate.skills.includes(taskType) ? 1.0 : 0.3;
}

/**
 * Calculate rating score (0-1)
 */
function ratingScore(candidate: CandidateUser): number {
  if (!candidate.averageRating || !candidate.completedTasks) return 0.5;
  // Normalize 1-5 rating to 0-1, weight by experience
  const normalized = (candidate.averageRating - 1) / 4;
  const experienceWeight = Math.min(candidate.completedTasks / 10, 1); // cap at 10 tasks
  return normalized * 0.7 + experienceWeight * 0.3;
}

/**
 * Calculate availability score (0 or 1)
 */
function availabilityScore(candidate: CandidateUser): number {
  return candidate.isAvailable ? 1.0 : 0.0;
}

/**
 * Compute a composite match score for a candidate
 */
export function computeMatchScore(
  candidate: CandidateUser,
  taskLocation: GeoPoint,
  taskType: TaskType,
  requesterId: string,
): MatchScore {
  const isRemote = REMOTE_TASK_TYPES.includes(taskType);
  const isIdentityMatch = candidate.id === requesterId;

  // Distance calculation
  let distanceMiles = Infinity;
  let proxScore = 0;

  if (candidate.location) {
    distanceMiles = haversineDistance(candidate.location, taskLocation);
    proxScore = proximityScore(distanceMiles);
  }

  // Remote tasks ignore proximity
  if (isRemote) {
    proxScore = 1.0;
    distanceMiles = 0;
  }

  const skill = skillScore(candidate, taskType);
  const rating = ratingScore(candidate);
  const availability = availabilityScore(candidate);

  // Composite score: weighted sum
  let totalScore = (proxScore * 3 + skill * 2 + rating * 2 + availability * 3) / 10;

  // Identity match doubles the score
  if (isIdentityMatch) {
    totalScore *= MATCHING_WEIGHTS.IDENTITY_MATCH_MULTIPLIER;
  }

  return {
    userId: candidate.id,
    totalScore: Math.round(totalScore * 100) / 100,
    proximityScore: proxScore,
    skillScore: skill,
    ratingScore: rating,
    availabilityScore: availability,
    identityMatch: isIdentityMatch,
    distanceMiles: Math.round(distanceMiles * 1000) / 1000,
  };
}

export const matchingService = {
  /**
   * Find and rank matches for a task
   * Returns candidates sorted by total score descending
   */
  async findMatches(
    taskLocation: GeoPoint,
    taskType: TaskType,
    requesterId: string,
    limit: number = 20,
  ): Promise<MatchScore[]> {
    // Query available users via query builder
    const records = await findAvailableUsers(requesterId, limit * 3);
    const candidates = records.map(mapCandidate);

    const scored = candidates
      .map((c: CandidateUser) => computeMatchScore(c, taskLocation, taskType, requesterId))
      .filter((m: MatchScore) => m.availabilityScore > 0 && m.proximityScore > 0)
      .sort((a: MatchScore, b: MatchScore) => b.totalScore - a.totalScore);

    return scored.slice(0, limit);
  },
};
