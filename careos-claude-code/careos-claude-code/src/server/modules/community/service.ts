/**
 * Community Service — Profiles, Capability Badges, Reviews, Leaderboard
 *
 * The Time Bank prestige system. Tracks community member contributions,
 * capability verification, trust scores, and tier progression.
 */
import { z } from 'zod';
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';

// ── Zod Schemas ─────────────────────────────────────────

export const createReviewSchema = z.object({
  revieweeId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  taskId: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ── Tier Calculation ────────────────────────────────────

type CommunityTier = 'newcomer' | 'helper' | 'trusted' | 'guardian' | 'elder';

function calculateTier(totalHoursGiven: number): CommunityTier {
  if (totalHoursGiven >= 500) return 'elder';
  if (totalHoursGiven >= 200) return 'guardian';
  if (totalHoursGiven >= 50) return 'trusted';
  if (totalHoursGiven >= 10) return 'helper';
  return 'newcomer';
}

// ── Public Profile Shape ────────────────────────────────

export interface CommunityProfile {
  userId: string;
  displayName: string;
  totalHoursGiven: number;
  totalHoursReceived: number;
  capabilities: Array<{
    id: string;
    name: string;
    verified: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
    hoursInCategory: number;
  }>;
  trustScore: number;
  reviewCount: number;
  memberSince: string;
  tier: CommunityTier;
}

// ── Service ─────────────────────────────────────────────

async function getProfile(userId: string): Promise<CommunityProfile> {
  let profile = await queries.getCommunityProfileByUserId(userId);

  // Auto-create profile if it doesn't exist
  if (!profile) {
    const user = await queries.getUserById(userId);
    if (!user) throw new NotFoundError('User');

    profile = await queries.createCommunityProfile({
      userId,
      displayName: `${user.firstName} ${user.lastName?.charAt(0) ?? ''}.`,
    });
  }

  // Get capabilities
  const capabilities = await queries.listCapabilitiesByUserId(userId);

  // Get trust score
  const { avg, count } = await queries.getAverageRating(userId);

  // Ensure tier is current
  const currentTier = calculateTier(profile.totalHoursGiven);
  if (currentTier !== profile.tier) {
    profile = await queries.updateCommunityProfile(profile.id, { tier: currentTier });
  }

  return {
    userId: profile.userId,
    displayName: profile.displayName,
    totalHoursGiven: profile.totalHoursGiven,
    totalHoursReceived: profile.totalHoursReceived,
    capabilities: capabilities.map((c) => ({
      id: c.id,
      name: c.name,
      verified: c.verified,
      verifiedAt: c.verifiedAt ?? undefined,
      verifiedBy: c.verifiedBy ?? undefined,
      hoursInCategory: c.hoursInCategory,
    })),
    trustScore: Math.round(avg * 10) / 10,
    reviewCount: count,
    memberSince: profile.memberSince,
    tier: currentTier,
  };
}

async function getLeaderboard() {
  const profiles = await queries.listLeaderboard(20);
  return profiles.map((p) => ({
    userId: p.userId,
    displayName: p.displayName,
    totalHoursGiven: p.totalHoursGiven,
    tier: p.tier,
    trustScore: p.trustScore,
    memberSince: p.memberSince,
  }));
}

async function verifyCapability(capabilityId: string, verifiedBy: string) {
  const capability = await queries.getCapabilityById(capabilityId);
  if (!capability) throw new NotFoundError('Capability');

  if (capability.verified) {
    throw new ValidationError('Capability is already verified');
  }

  const updated = await queries.verifyCapability(capabilityId, verifiedBy);
  logger.info({ capabilityId, verifiedBy, name: capability.name }, 'Capability verified');
  return updated;
}

async function createReview(reviewerId: string, input: CreateReviewInput) {
  if (reviewerId === input.revieweeId) {
    throw new ValidationError('Cannot review yourself');
  }

  // Verify reviewee exists
  const revieweeProfile = await queries.getCommunityProfileByUserId(input.revieweeId);
  if (!revieweeProfile) {
    // Check if the user exists at all
    const user = await queries.getUserById(input.revieweeId);
    if (!user) throw new NotFoundError('User');
  }

  const review = await queries.createReview({
    reviewerId,
    revieweeId: input.revieweeId,
    rating: input.rating,
    comment: input.comment,
    taskId: input.taskId,
  });

  // Update trust score on the profile
  const { avg, count } = await queries.getAverageRating(input.revieweeId);
  const profile = await queries.getCommunityProfileByUserId(input.revieweeId);
  if (profile) {
    await queries.updateCommunityProfile(profile.id, {
      trustScore: Math.round(avg * 10) / 10,
      reviewCount: count,
    });
  }

  logger.info(
    { reviewId: review.id, revieweeId: input.revieweeId, rating: input.rating },
    'Community review created',
  );
  return review;
}

export const communityService = {
  getProfile,
  getLeaderboard,
  verifyCapability,
  createReview,
};
