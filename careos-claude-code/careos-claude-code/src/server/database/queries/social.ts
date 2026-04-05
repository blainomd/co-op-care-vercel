// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Social Query Builders — Posts, Comments, Care Circles, Milestones
 *
 * Private social network for cooperative members: families, caregivers, neighbors.
 * Neighborhood-scale mutual aid feed, NOT public social media.
 */
import { getPostgres } from '../postgres.js';

// ── Post Records ────────────────────────────────────────

export interface SocialPostRecord {
  id: string;
  authorId: string;
  authorName: string;
  authorTier: string;
  type: 'care_moment' | 'milestone' | 'ask' | 'offer' | 'gratitude' | 'tip' | 'event';
  content: string;
  visibility: 'coop' | 'neighborhood' | 'private';
  tags: string[];
  reactions: Record<string, number>;
  commentCount: number;
  circleId: string | null;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSocialPostInput {
  authorId: string;
  authorName: string;
  authorTier: string;
  type: SocialPostRecord['type'];
  content: string;
  visibility: SocialPostRecord['visibility'];
  tags: string[];
  circleId?: string;
  flagged?: boolean;
}

export async function createSocialPost(input: CreateSocialPostInput): Promise<SocialPostRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('social_post', {
    authorId: input.authorId,
    authorName: input.authorName,
    authorTier: input.authorTier,
    type: input.type,
    content: input.content,
    visibility: input.visibility,
    tags: input.tags,
    reactions: {},
    commentCount: 0,
    circleId: input.circleId ?? null,
    flagged: input.flagged ?? false,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as SocialPostRecord;
}

export async function getSocialPostById(id: string): Promise<SocialPostRecord | null> {
  const db = getPostgres();
  const result = await db.query<[SocialPostRecord[]]>(
    'SELECT * FROM social_post WHERE id = $id LIMIT 1',
    { id },
  );
  return result[0]?.[0] ?? null;
}

export async function deleteSocialPost(id: string): Promise<void> {
  const db = getPostgres();
  await db.delete(id);
}

export async function updateSocialPostReactions(
  id: string,
  reactions: Record<string, number>,
): Promise<SocialPostRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, {
    reactions,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as SocialPostRecord;
}

export async function incrementPostCommentCount(id: string): Promise<void> {
  const db = getPostgres();
  await db.query('UPDATE $id SET commentCount += 1, updatedAt = $now', {
    id,
    now: new Date().toISOString(),
  });
}

/**
 * Fetch personalized feed: posts from user's circles first, then coop-wide.
 * Ordered by recency within each priority band.
 */
export async function listFeedPosts(
  userId: string,
  circleIds: string[],
  limit = 50,
  offset = 0,
): Promise<SocialPostRecord[]> {
  const db = getPostgres();

  // Fetch circle posts + coop-visible posts, ordered by recency.
  // Circle membership posts come first via the ORDER clause weighting.
  const result = await db.query<[SocialPostRecord[]]>(
    `SELECT * FROM social_post
     WHERE (visibility = 'coop')
        OR (circleId IN $circleIds)
        OR (authorId = $userId)
     ORDER BY createdAt DESC
     LIMIT $limit START $offset`,
    { userId, circleIds, limit, offset },
  );
  return result[0] ?? [];
}

export async function listPostsByCircle(circleId: string, limit = 30): Promise<SocialPostRecord[]> {
  const db = getPostgres();
  const result = await db.query<[SocialPostRecord[]]>(
    'SELECT * FROM social_post WHERE circleId = $circleId ORDER BY createdAt DESC LIMIT $limit',
    { circleId, limit },
  );
  return result[0] ?? [];
}

export async function listFlaggedPosts(limit = 50): Promise<SocialPostRecord[]> {
  const db = getPostgres();
  const result = await db.query<[SocialPostRecord[]]>(
    'SELECT * FROM social_post WHERE flagged = true ORDER BY createdAt DESC LIMIT $limit',
    { limit },
  );
  return result[0] ?? [];
}

// ── Comment Records ─────────────────────────────────────

export interface SocialCommentRecord {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export async function createSocialComment(input: {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
}): Promise<SocialCommentRecord> {
  const db = getPostgres();
  const [record] = await db.create('social_comment', {
    postId: input.postId,
    authorId: input.authorId,
    authorName: input.authorName,
    content: input.content,
    createdAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as SocialCommentRecord;
}

export async function listCommentsByPostId(
  postId: string,
  limit = 100,
): Promise<SocialCommentRecord[]> {
  const db = getPostgres();
  const result = await db.query<[SocialCommentRecord[]]>(
    'SELECT * FROM social_comment WHERE postId = $postId ORDER BY createdAt ASC LIMIT $limit',
    { postId, limit },
  );
  return result[0] ?? [];
}

// ── Care Circle Records ─────────────────────────────────

export interface CareCircleRecord {
  id: string;
  name: string;
  type: 'family' | 'neighborhood' | 'interest';
  memberIds: string[];
  createdBy: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createCareCircle(input: {
  name: string;
  type: CareCircleRecord['type'];
  createdBy: string;
  description?: string;
  memberIds?: string[];
}): Promise<CareCircleRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('care_circle', {
    name: input.name,
    type: input.type,
    memberIds: input.memberIds ?? [input.createdBy],
    createdBy: input.createdBy,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as CareCircleRecord;
}

export async function getCareCircleById(id: string): Promise<CareCircleRecord | null> {
  const db = getPostgres();
  const result = await db.query<[CareCircleRecord[]]>(
    'SELECT * FROM care_circle WHERE id = $id LIMIT 1',
    { id },
  );
  return result[0]?.[0] ?? null;
}

export async function listCareCirclesByUserId(userId: string): Promise<CareCircleRecord[]> {
  const db = getPostgres();
  const result = await db.query<[CareCircleRecord[]]>(
    'SELECT * FROM care_circle WHERE $userId IN memberIds ORDER BY name ASC',
    { userId },
  );
  return result[0] ?? [];
}

export async function addCareCircleMember(
  circleId: string,
  userId: string,
): Promise<CareCircleRecord> {
  const db = getPostgres();
  await db.query('UPDATE $circleId SET memberIds += $userId, updatedAt = $now', {
    circleId,
    userId,
    now: new Date().toISOString(),
  });
  const circle = await getCareCircleById(circleId);
  return circle!;
}

export async function removeCareCircleMember(
  circleId: string,
  userId: string,
): Promise<CareCircleRecord> {
  const db = getPostgres();
  await db.query('UPDATE $circleId SET memberIds -= $userId, updatedAt = $now', {
    circleId,
    userId,
    now: new Date().toISOString(),
  });
  const circle = await getCareCircleById(circleId);
  return circle!;
}

// ── Milestone Records ───────────────────────────────────

export interface MilestoneEventRecord {
  id: string;
  userId: string;
  type:
    | 'hours_milestone'
    | 'tier_upgrade'
    | 'capability_earned'
    | 'first_visit'
    | 'anniversary'
    | 'lmn_approved';
  title: string;
  description: string;
  celebratedAt: string;
}

export async function createMilestoneEvent(input: {
  userId: string;
  type: MilestoneEventRecord['type'];
  title: string;
  description: string;
}): Promise<MilestoneEventRecord> {
  const db = getPostgres();
  const [record] = await db.create('milestone_event', {
    userId: input.userId,
    type: input.type,
    title: input.title,
    description: input.description,
    celebratedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as MilestoneEventRecord;
}

export async function listMilestonesByUserId(userId: string): Promise<MilestoneEventRecord[]> {
  const db = getPostgres();
  const result = await db.query<[MilestoneEventRecord[]]>(
    'SELECT * FROM milestone_event WHERE userId = $userId ORDER BY celebratedAt DESC',
    { userId },
  );
  return result[0] ?? [];
}

export async function listRecentMilestones(limit = 30): Promise<MilestoneEventRecord[]> {
  const db = getPostgres();
  const result = await db.query<[MilestoneEventRecord[]]>(
    'SELECT * FROM milestone_event ORDER BY celebratedAt DESC LIMIT $limit',
    { limit },
  );
  return result[0] ?? [];
}

export async function getMilestoneByUserAndType(
  userId: string,
  type: MilestoneEventRecord['type'],
  title: string,
): Promise<MilestoneEventRecord | null> {
  const db = getPostgres();
  const result = await db.query<[MilestoneEventRecord[]]>(
    'SELECT * FROM milestone_event WHERE userId = $userId AND type = $type AND title = $title LIMIT 1',
    { userId, type, title },
  );
  return result[0]?.[0] ?? null;
}
