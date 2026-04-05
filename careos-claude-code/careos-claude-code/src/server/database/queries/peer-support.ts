// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Peer Support Query Builders — Communities, Posts, Comments, Memberships
 *
 * Condition-specific peer support communities for families and caregivers.
 * Structured, moderated communities with clinical context.
 */
import { getPostgres } from '../postgres.js';

// ── Peer Community Records ───────────────────────────────

export interface ExternalResource {
  name: string;
  url: string;
  description: string;
}

export interface PartnerOrg {
  name: string;
  url?: string;
  role: string;
}

export interface PeerCommunityRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  conditions: string[];
  memberCount: number;
  postCount: number;
  moderatorIds: string[];
  guidelines: string;
  smartPatientsUrl: string | null;
  externalResources: ExternalResource[];
  partnerOrgs: PartnerOrg[];
  createdAt: string;
}

export interface CreatePeerCommunityInput {
  name: string;
  slug: string;
  description: string;
  conditions: string[];
  moderatorIds?: string[];
  guidelines?: string;
  smartPatientsUrl?: string;
  externalResources?: ExternalResource[];
  partnerOrgs?: PartnerOrg[];
}

export async function createPeerCommunity(
  input: CreatePeerCommunityInput,
): Promise<PeerCommunityRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('peer_community', {
    name: input.name,
    slug: input.slug,
    description: input.description,
    conditions: input.conditions,
    memberCount: 0,
    postCount: 0,
    moderatorIds: input.moderatorIds ?? [],
    guidelines:
      input.guidelines ??
      'Be respectful. No medical advice — share experiences, not prescriptions. Protect privacy.',
    smartPatientsUrl: input.smartPatientsUrl ?? null,
    externalResources: input.externalResources ?? [],
    partnerOrgs: input.partnerOrgs ?? [],
    createdAt: now,
  } as Record<string, unknown>);
  return record as unknown as PeerCommunityRecord;
}

export async function getPeerCommunityBySlug(slug: string): Promise<PeerCommunityRecord | null> {
  const db = getPostgres();
  const records = await db.query<[PeerCommunityRecord[]]>(
    'SELECT * FROM peer_community WHERE slug = $slug LIMIT 1',
    { slug },
  );
  return records[0]?.[0] ?? null;
}

export async function getPeerCommunityById(id: string): Promise<PeerCommunityRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as PeerCommunityRecord) ?? null;
}

export async function listPeerCommunities(): Promise<PeerCommunityRecord[]> {
  const db = getPostgres();
  const records = await db.query<[PeerCommunityRecord[]]>(
    'SELECT * FROM peer_community ORDER BY memberCount DESC',
  );
  return records[0] ?? [];
}

export async function updatePeerCommunity(
  id: string,
  data: Partial<PeerCommunityRecord>,
): Promise<PeerCommunityRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, data as Record<string, unknown>);
  return record as unknown as PeerCommunityRecord;
}

export async function incrementCommunityMemberCount(id: string, delta: number): Promise<void> {
  const db = getPostgres();
  await db.query('UPDATE $id SET memberCount += $delta', { id, delta });
}

export async function incrementCommunityPostCount(id: string): Promise<void> {
  const db = getPostgres();
  await db.query('UPDATE $id SET postCount += 1', { id });
}

export async function listPeerCommunitiesByConditions(
  conditions: string[],
): Promise<PeerCommunityRecord[]> {
  const db = getPostgres();
  const records = await db.query<[PeerCommunityRecord[]]>(
    'SELECT * FROM peer_community WHERE conditions CONTAINSANY $conditions ORDER BY memberCount DESC',
    { conditions },
  );
  return records[0] ?? [];
}

// ── Peer Post Records ────────────────────────────────────

export interface PeerPostRecord {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorRole:
    | 'family_caregiver'
    | 'professional_caregiver'
    | 'care_recipient'
    | 'clinician'
    | 'moderator';
  type: 'question' | 'experience' | 'resource' | 'tip' | 'milestone' | 'research';
  title: string;
  content: string;
  tags: string[];
  relatedConditions: string[];
  relatedMedications: string[];
  relatedInterventions: string[];
  upvotes: number;
  commentCount: number;
  bookmarkCount: number;
  pinned: boolean;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePeerPostInput {
  communityId: string;
  authorId: string;
  authorName: string;
  authorRole: PeerPostRecord['authorRole'];
  type: PeerPostRecord['type'];
  title: string;
  content: string;
  tags?: string[];
  relatedConditions?: string[];
  relatedMedications?: string[];
  relatedInterventions?: string[];
  pinned?: boolean;
  flagged?: boolean;
}

export async function createPeerPost(input: CreatePeerPostInput): Promise<PeerPostRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('peer_post', {
    communityId: input.communityId,
    authorId: input.authorId,
    authorName: input.authorName,
    authorRole: input.authorRole,
    type: input.type,
    title: input.title,
    content: input.content,
    tags: input.tags ?? [],
    relatedConditions: input.relatedConditions ?? [],
    relatedMedications: input.relatedMedications ?? [],
    relatedInterventions: input.relatedInterventions ?? [],
    upvotes: 0,
    commentCount: 0,
    bookmarkCount: 0,
    pinned: input.pinned ?? false,
    flagged: input.flagged ?? false,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as PeerPostRecord;
}

export async function getPeerPostById(id: string): Promise<PeerPostRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as PeerPostRecord) ?? null;
}

export async function listPeerPostsByCommunity(
  communityId: string,
  filters?: { type?: string; sortBy?: 'recent' | 'top' },
  limit: number = 50,
  offset: number = 0,
): Promise<PeerPostRecord[]> {
  const db = getPostgres();
  let query = 'SELECT * FROM peer_post WHERE communityId = $communityId';
  const params: Record<string, unknown> = { communityId, limit, offset };

  if (filters?.type) {
    query += ' AND type = $type';
    params.type = filters.type;
  }

  if (filters?.sortBy === 'top') {
    query += ' ORDER BY upvotes DESC, createdAt DESC';
  } else {
    query += ' ORDER BY pinned DESC, createdAt DESC';
  }

  query += ' LIMIT $limit START $offset';
  const records = await db.query<[PeerPostRecord[]]>(query, params);
  return records[0] ?? [];
}

export async function updatePeerPost(
  id: string,
  data: Partial<PeerPostRecord>,
): Promise<PeerPostRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as PeerPostRecord;
}

export async function incrementPeerPostUpvotes(id: string): Promise<PeerPostRecord> {
  const db = getPostgres();
  const records = await db.query<[PeerPostRecord[]]>('UPDATE $id SET upvotes += 1 RETURN AFTER', {
    id,
  });
  return records[0]![0]!;
}

export async function incrementPeerPostBookmarks(id: string): Promise<PeerPostRecord> {
  const db = getPostgres();
  const records = await db.query<[PeerPostRecord[]]>(
    'UPDATE $id SET bookmarkCount += 1 RETURN AFTER',
    { id },
  );
  return records[0]![0]!;
}

export async function incrementPeerPostCommentCount(id: string): Promise<void> {
  const db = getPostgres();
  await db.query('UPDATE $id SET commentCount += 1', { id });
}

// ── Peer Comment Records ─────────────────────────────────

export interface PeerCommentRecord {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  upvotes: number;
  isClinicianVerified: boolean;
  createdAt: string;
}

export interface CreatePeerCommentInput {
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
}

export async function createPeerComment(input: CreatePeerCommentInput): Promise<PeerCommentRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('peer_comment', {
    postId: input.postId,
    authorId: input.authorId,
    authorName: input.authorName,
    authorRole: input.authorRole,
    content: input.content,
    upvotes: 0,
    isClinicianVerified: false,
    createdAt: now,
  } as Record<string, unknown>);
  return record as unknown as PeerCommentRecord;
}

export async function getPeerCommentById(id: string): Promise<PeerCommentRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as PeerCommentRecord) ?? null;
}

export async function listPeerCommentsByPost(postId: string): Promise<PeerCommentRecord[]> {
  const db = getPostgres();
  const records = await db.query<[PeerCommentRecord[]]>(
    'SELECT * FROM peer_comment WHERE postId = $postId ORDER BY createdAt ASC',
    { postId },
  );
  return records[0] ?? [];
}

export async function updatePeerComment(
  id: string,
  data: Partial<PeerCommentRecord>,
): Promise<PeerCommentRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, data as Record<string, unknown>);
  return record as unknown as PeerCommentRecord;
}

// ── Community Membership Records ─────────────────────────

export interface CommunityMembershipRecord {
  id: string;
  userId: string;
  communityId: string;
  role: 'member' | 'moderator' | 'expert';
  joinedAt: string;
  notificationsEnabled: boolean;
}

export interface CreateCommunityMembershipInput {
  userId: string;
  communityId: string;
  role?: CommunityMembershipRecord['role'];
  notificationsEnabled?: boolean;
}

export async function createCommunityMembership(
  input: CreateCommunityMembershipInput,
): Promise<CommunityMembershipRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('community_membership', {
    userId: input.userId,
    communityId: input.communityId,
    role: input.role ?? 'member',
    joinedAt: now,
    notificationsEnabled: input.notificationsEnabled ?? true,
  } as Record<string, unknown>);
  return record as unknown as CommunityMembershipRecord;
}

export async function getCommunityMembership(
  userId: string,
  communityId: string,
): Promise<CommunityMembershipRecord | null> {
  const db = getPostgres();
  const records = await db.query<[CommunityMembershipRecord[]]>(
    'SELECT * FROM community_membership WHERE userId = $userId AND communityId = $communityId LIMIT 1',
    { userId, communityId },
  );
  return records[0]?.[0] ?? null;
}

export async function listMembershipsByUser(userId: string): Promise<CommunityMembershipRecord[]> {
  const db = getPostgres();
  const records = await db.query<[CommunityMembershipRecord[]]>(
    'SELECT * FROM community_membership WHERE userId = $userId ORDER BY joinedAt DESC',
    { userId },
  );
  return records[0] ?? [];
}

export async function deleteCommunityMembership(
  userId: string,
  communityId: string,
): Promise<void> {
  const db = getPostgres();
  await db.query(
    'DELETE FROM community_membership WHERE userId = $userId AND communityId = $communityId',
    { userId, communityId },
  );
}
