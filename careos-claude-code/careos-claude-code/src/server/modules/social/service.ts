/**
 * Social Service — Private cooperative social network
 *
 * Neighborhood-scale mutual aid feed for families, caregivers, and neighbors.
 * NOT public social media. Think: care circle updates, milestone celebrations,
 * asks/offers, gratitude posts.
 *
 * Features:
 * - Personalized feed (care circle posts first, then coop-wide)
 * - Care Circles (family teams, neighborhood groups, interest groups)
 * - Auto-generated milestones (hours thresholds, tier upgrades, etc.)
 * - PHI stripping on all post content
 * - Emergency keyword flagging for admin review
 */
import { z } from 'zod';
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { stripPhi } from '../sage/phi-strip.js';

// ── Emergency Keywords (from Sage service) ──────────────

const EMERGENCY_KEYWORDS = [
  'not breathing',
  'chest pain',
  'stroke',
  '911',
  'suicid',
  'overdose',
  'unconscious',
  'choking',
  'severe bleeding',
  'heart attack',
  'seizure',
  'anaphylaxis',
];

function containsEmergencyKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Zod Schemas ─────────────────────────────────────────

const postTypeEnum = z.enum([
  'care_moment',
  'milestone',
  'ask',
  'offer',
  'gratitude',
  'tip',
  'event',
]);

const visibilityEnum = z.enum(['coop', 'neighborhood', 'private']);

export const createPostSchema = z.object({
  type: postTypeEnum,
  content: z.string().min(1).max(5000),
  visibility: visibilityEnum.default('coop'),
  tags: z.array(z.string().max(50)).max(10).default([]),
  circleId: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const reactSchema = z.object({
  emoji: z.string().min(1).max(8),
});

export type ReactInput = z.infer<typeof reactSchema>;

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const createCircleSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['family', 'neighborhood', 'interest']),
  description: z.string().max(1000).optional(),
});

export type CreateCircleInput = z.infer<typeof createCircleSchema>;

export const addCircleMemberSchema = z.object({
  userId: z.string().min(1),
});

export type AddCircleMemberInput = z.infer<typeof addCircleMemberSchema>;

export const feedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type FeedQuery = z.infer<typeof feedQuerySchema>;

// ── Milestone Thresholds ────────────────────────────────

const HOUR_MILESTONES = [50, 100, 200, 500, 1000] as const;

// ── Service Functions ───────────────────────────────────

/**
 * Strip PHI from content and flag emergency keywords.
 * Returns sanitized content and whether the post should be flagged.
 */
function sanitizeContent(content: string): { sanitized: string; flagged: boolean } {
  const { stripped } = stripPhi(content);
  const flagged = containsEmergencyKeywords(stripped);
  return { sanitized: stripped, flagged };
}

/**
 * Get the community profile for the current user (for author metadata).
 */
async function getAuthorMeta(userId: string): Promise<{ name: string; tier: string }> {
  const profile = await queries.getCommunityProfileByUserId(userId);
  if (profile) {
    return { name: profile.displayName, tier: profile.tier };
  }
  // Fallback: look up user directly
  const user = await queries.getUserById(userId);
  if (!user) throw new NotFoundError('User');
  return { name: `${user.firstName} ${user.lastName?.charAt(0) ?? ''}.`, tier: 'newcomer' };
}

// ── Feed ────────────────────────────────────────────────

async function getFeed(userId: string, query: FeedQuery) {
  // Get user's circles for personalized feed
  const circles = await queries.listCareCirclesByUserId(userId);
  const circleIds = circles.map((c) => c.id);

  const posts = await queries.listFeedPosts(userId, circleIds, query.limit, query.offset);
  return posts;
}

// ── Posts ────────────────────────────────────────────────

async function createPost(userId: string, input: CreatePostInput) {
  const author = await getAuthorMeta(userId);
  const { sanitized, flagged } = sanitizeContent(input.content);

  // If circleId provided, verify membership
  if (input.circleId) {
    const circle = await queries.getCareCircleById(input.circleId);
    if (!circle) throw new NotFoundError('Care Circle');
    if (!circle.memberIds.includes(userId)) {
      throw new ForbiddenError('You are not a member of this circle');
    }
  }

  const post = await queries.createSocialPost({
    authorId: userId,
    authorName: author.name,
    authorTier: author.tier,
    type: input.type,
    content: sanitized,
    visibility: input.circleId ? 'private' : input.visibility,
    tags: input.tags,
    circleId: input.circleId,
    flagged,
  });

  if (flagged) {
    logger.warn(
      { postId: post.id, authorId: userId },
      'Social post flagged — contains emergency keywords',
    );
  }

  logger.info(
    { postId: post.id, type: input.type, visibility: post.visibility },
    'Social post created',
  );
  return post;
}

async function getPost(postId: string) {
  const post = await queries.getSocialPostById(postId);
  if (!post) throw new NotFoundError('Post');

  const comments = await queries.listCommentsByPostId(postId);
  return { ...post, comments };
}

async function deletePost(postId: string, userId: string) {
  const post = await queries.getSocialPostById(postId);
  if (!post) throw new NotFoundError('Post');
  if (post.authorId !== userId) {
    throw new ForbiddenError('You can only delete your own posts');
  }

  await queries.deleteSocialPost(postId);
  logger.info({ postId, userId }, 'Social post deleted');
}

async function reactToPost(postId: string, input: ReactInput) {
  const post = await queries.getSocialPostById(postId);
  if (!post) throw new NotFoundError('Post');

  const reactions = { ...post.reactions };
  reactions[input.emoji] = (reactions[input.emoji] ?? 0) + 1;

  const updated = await queries.updateSocialPostReactions(postId, reactions);
  return updated;
}

// ── Comments ────────────────────────────────────────────

async function addComment(postId: string, userId: string, input: CreateCommentInput) {
  const post = await queries.getSocialPostById(postId);
  if (!post) throw new NotFoundError('Post');

  const author = await getAuthorMeta(userId);
  const { sanitized, flagged } = sanitizeContent(input.content);

  if (flagged) {
    logger.warn(
      { postId, authorId: userId },
      'Social comment flagged — contains emergency keywords',
    );
  }

  const comment = await queries.createSocialComment({
    postId,
    authorId: userId,
    authorName: author.name,
    content: sanitized,
  });

  await queries.incrementPostCommentCount(postId);

  logger.info({ commentId: comment.id, postId }, 'Social comment created');
  return comment;
}

async function listComments(postId: string) {
  const post = await queries.getSocialPostById(postId);
  if (!post) throw new NotFoundError('Post');

  return queries.listCommentsByPostId(postId);
}

// ── Care Circles ────────────────────────────────────────

async function createCircle(userId: string, input: CreateCircleInput) {
  const circle = await queries.createCareCircle({
    name: input.name,
    type: input.type,
    createdBy: userId,
    description: input.description,
    memberIds: [userId],
  });

  logger.info({ circleId: circle.id, type: input.type, name: input.name }, 'Care circle created');
  return circle;
}

async function listMyCircles(userId: string) {
  return queries.listCareCirclesByUserId(userId);
}

async function getCircleDetail(circleId: string, userId: string) {
  const circle = await queries.getCareCircleById(circleId);
  if (!circle) throw new NotFoundError('Care Circle');
  if (!circle.memberIds.includes(userId)) {
    throw new ForbiddenError('You are not a member of this circle');
  }

  const recentPosts = await queries.listPostsByCircle(circleId, 30);
  return { ...circle, recentPosts };
}

async function addCircleMember(circleId: string, userId: string, input: AddCircleMemberInput) {
  const circle = await queries.getCareCircleById(circleId);
  if (!circle) throw new NotFoundError('Care Circle');
  if (!circle.memberIds.includes(userId)) {
    throw new ForbiddenError('You are not a member of this circle');
  }

  // Verify the invited user exists
  const invitee = await queries.getUserById(input.userId);
  if (!invitee) throw new NotFoundError('User');

  if (circle.memberIds.includes(input.userId)) {
    throw new ValidationError('User is already a member of this circle');
  }

  const updated = await queries.addCareCircleMember(circleId, input.userId);
  logger.info(
    { circleId, addedUserId: input.userId, addedBy: userId },
    'Member added to care circle',
  );
  return updated;
}

async function removeCircleMember(circleId: string, requesterId: string, targetUserId: string) {
  const circle = await queries.getCareCircleById(circleId);
  if (!circle) throw new NotFoundError('Care Circle');

  // Only the circle creator or the member themselves can remove
  if (requesterId !== circle.createdBy && requesterId !== targetUserId) {
    throw new ForbiddenError('Only the circle creator or the member themselves can remove members');
  }

  if (!circle.memberIds.includes(targetUserId)) {
    throw new NotFoundError('Member in this circle');
  }

  const updated = await queries.removeCareCircleMember(circleId, targetUserId);
  logger.info(
    { circleId, removedUserId: targetUserId, removedBy: requesterId },
    'Member removed from care circle',
  );
  return updated;
}

// ── Milestones ──────────────────────────────────────────

async function getMyMilestones(userId: string) {
  return queries.listMilestonesByUserId(userId);
}

async function getMilestoneFeed() {
  return queries.listRecentMilestones(30);
}

/**
 * Check and auto-generate milestones for a user.
 * Called after timebank transactions, tier upgrades, etc.
 */
async function checkAndGenerateMilestones(userId: string, totalHoursGiven: number, tier: string) {
  const generated: queries.MilestoneEventRecord[] = [];

  // Check hours milestones
  for (const threshold of HOUR_MILESTONES) {
    if (totalHoursGiven >= threshold) {
      const existing = await queries.getMilestoneByUserAndType(
        userId,
        'hours_milestone',
        `${threshold} Hours`,
      );
      if (!existing) {
        const milestone = await queries.createMilestoneEvent({
          userId,
          type: 'hours_milestone',
          title: `${threshold} Hours`,
          description: `Reached ${threshold} hours of care given to the community!`,
        });
        generated.push(milestone);

        // Auto-create a milestone post
        const author = await getAuthorMeta(userId);
        await queries.createSocialPost({
          authorId: userId,
          authorName: author.name,
          authorTier: author.tier,
          type: 'milestone',
          content: `${author.name} has reached ${threshold} hours of care given to the community!`,
          visibility: 'coop',
          tags: ['milestone', 'hours'],
        });
      }
    }
  }

  // Check tier upgrade milestone
  if (tier !== 'newcomer') {
    const existing = await queries.getMilestoneByUserAndType(
      userId,
      'tier_upgrade',
      `Tier: ${tier}`,
    );
    if (!existing) {
      const milestone = await queries.createMilestoneEvent({
        userId,
        type: 'tier_upgrade',
        title: `Tier: ${tier}`,
        description: `Achieved ${tier} tier status in the cooperative!`,
      });
      generated.push(milestone);

      const author = await getAuthorMeta(userId);
      await queries.createSocialPost({
        authorId: userId,
        authorName: author.name,
        authorTier: author.tier,
        type: 'milestone',
        content: `${author.name} has reached ${tier} status in the cooperative!`,
        visibility: 'coop',
        tags: ['milestone', 'tier-upgrade'],
      });
    }
  }

  if (generated.length > 0) {
    logger.info({ userId, count: generated.length }, 'Auto-generated milestones');
  }

  return generated;
}

/**
 * Record a first care visit milestone.
 */
async function recordFirstVisit(userId: string) {
  const existing = await queries.getMilestoneByUserAndType(userId, 'first_visit', 'First Visit');
  if (existing) return existing;

  const milestone = await queries.createMilestoneEvent({
    userId,
    type: 'first_visit',
    title: 'First Visit',
    description: 'Completed their first care visit!',
  });

  const author = await getAuthorMeta(userId);
  await queries.createSocialPost({
    authorId: userId,
    authorName: author.name,
    authorTier: author.tier,
    type: 'milestone',
    content: `${author.name} completed their first care visit!`,
    visibility: 'coop',
    tags: ['milestone', 'first-visit'],
  });

  logger.info({ userId }, 'First visit milestone recorded');
  return milestone;
}

/**
 * Record a 1-year anniversary milestone.
 */
async function recordAnniversary(userId: string, years: number) {
  const title = `${years}-Year Anniversary`;
  const existing = await queries.getMilestoneByUserAndType(userId, 'anniversary', title);
  if (existing) return existing;

  const milestone = await queries.createMilestoneEvent({
    userId,
    type: 'anniversary',
    title,
    description: `Celebrating ${years} year${years > 1 ? 's' : ''} as a cooperative member!`,
  });

  const author = await getAuthorMeta(userId);
  await queries.createSocialPost({
    authorId: userId,
    authorName: author.name,
    authorTier: author.tier,
    type: 'milestone',
    content: `${author.name} is celebrating ${years} year${years > 1 ? 's' : ''} as a cooperative member!`,
    visibility: 'coop',
    tags: ['milestone', 'anniversary'],
  });

  logger.info({ userId, years }, 'Anniversary milestone recorded');
  return milestone;
}

/**
 * Record an LMN approval milestone.
 */
async function recordLmnApproved(userId: string, _familyName: string) {
  const title = 'LMN Approved';
  const existing = await queries.getMilestoneByUserAndType(userId, 'lmn_approved', title);
  if (existing) return existing;

  const milestone = await queries.createMilestoneEvent({
    userId,
    type: 'lmn_approved',
    title,
    description: 'Letter of Medical Necessity approved — HSA/FSA benefits activated!',
  });

  const author = await getAuthorMeta(userId);
  await queries.createSocialPost({
    authorId: userId,
    authorName: author.name,
    authorTier: author.tier,
    type: 'milestone',
    content: `${author.name}'s family received LMN approval — care benefits activated!`,
    visibility: 'coop',
    tags: ['milestone', 'lmn'],
  });

  logger.info({ userId }, 'LMN approval milestone recorded');
  return milestone;
}

// ── Export ───────────────────────────────────────────────

export const socialService = {
  // Feed
  getFeed,
  // Posts
  createPost,
  getPost,
  deletePost,
  reactToPost,
  // Comments
  addComment,
  listComments,
  // Circles
  createCircle,
  listMyCircles,
  getCircleDetail,
  addCircleMember,
  removeCircleMember,
  // Milestones
  getMyMilestones,
  getMilestoneFeed,
  checkAndGenerateMilestones,
  recordFirstVisit,
  recordAnniversary,
  recordLmnApproved,
};
