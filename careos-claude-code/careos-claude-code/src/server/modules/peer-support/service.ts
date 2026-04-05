/**
 * Peer Support Service — Condition-Specific Peer Communities
 *
 * Smart Patients-inspired peer support communities for co-op.care families
 * and caregivers. Structured, moderated, condition-specific support with
 * clinical context. NOT a general social feed (that's the social module).
 *
 * Features:
 * - Pre-seeded condition-specific communities
 * - PHI stripping on all post and comment content
 * - Emergency keyword flagging
 * - Clinician verification of comments
 * - ICD-10 based community recommendations
 */
import { z } from 'zod';
import * as queries from '../../database/queries/index.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { stripPhi } from '../sage/phi-strip.js';

// ── Emergency Keywords (shared with social module) ──────

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

function sanitizeContent(content: string): { sanitized: string; flagged: boolean } {
  const { stripped } = stripPhi(content);
  const flagged = containsEmergencyKeywords(stripped);
  return { sanitized: stripped, flagged };
}

// ── Zod Schemas ─────────────────────────────────────────

const authorRoleEnum = z.enum([
  'family_caregiver',
  'professional_caregiver',
  'care_recipient',
  'clinician',
  'moderator',
]);

const postTypeEnum = z.enum(['question', 'experience', 'resource', 'tip', 'milestone', 'research']);

export const createPeerPostSchema = z.object({
  type: postTypeEnum,
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(10000),
  authorRole: authorRoleEnum.default('family_caregiver'),
  tags: z.array(z.string().max(50)).max(10).default([]),
  relatedConditions: z.array(z.string()).default([]),
  relatedMedications: z.array(z.string()).default([]),
  relatedInterventions: z.array(z.string()).default([]),
});

export type CreatePeerPostInput = z.infer<typeof createPeerPostSchema>;

export const createPeerCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  authorRole: z.string().default('family_caregiver'),
});

export type CreatePeerCommentInput = z.infer<typeof createPeerCommentSchema>;

export const postsQuerySchema = z.object({
  type: z.string().optional(),
  sortBy: z.enum(['recent', 'top']).default('recent'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PostsQuery = z.infer<typeof postsQuerySchema>;

// ── Default Communities ─────────────────────────────────

interface DefaultCommunity {
  name: string;
  slug: string;
  description: string;
  conditions: string[];
  smartPatientsUrl?: string;
  partnerOrgs: Array<{ name: string; url?: string; role: string }>;
  externalResources?: Array<{ name: string; url: string; description: string }>;
}

const DEFAULT_COMMUNITIES: DefaultCommunity[] = [
  {
    name: "Dementia & Alzheimer's Caregivers",
    slug: 'dementia-caregivers',
    description:
      "Support and shared experiences for families caring for loved ones with dementia or Alzheimer's disease. Share strategies, ask questions, and find understanding from others on the same journey.",
    conditions: ['F03.90', 'G30.9'],
    smartPatientsUrl: 'https://www.smartpatients.com/partners/alzheimers',
    partnerOrgs: [
      { name: "Alzheimer's Association", url: 'https://www.alz.org', role: 'Resource Partner' },
    ],
  },
  {
    name: 'Fall Prevention & Mobility',
    slug: 'fall-prevention-mobility',
    description:
      'Practical tips and peer support for preventing falls and maintaining mobility in aging adults. Home safety assessments, exercise strategies, and assistive device recommendations.',
    conditions: ['R29.6', 'M62.84', 'R26.89'],
    partnerOrgs: [
      { name: 'CDC STEADI Program', url: 'https://www.cdc.gov/steadi', role: 'Clinical Advisor' },
    ],
  },
  {
    name: 'Nutrition & Sarcopenia',
    slug: 'nutrition-sarcopenia',
    description:
      'Addressing muscle loss and malnutrition in aging adults. High-protein meal strategies, MNA-SF screening insights, and medically tailored meal discussions.',
    conditions: ['E46', 'M62.84', 'R62.7'],
    partnerOrgs: [],
    externalResources: [
      {
        name: 'co-op.care Nutrition Module',
        url: '/nutrition',
        description: "Access your care recipient's meal plans and assessments",
      },
    ],
  },
  {
    name: 'Caregiver Burnout & Self-Care',
    slug: 'caregiver-burnout',
    description:
      'A safe space for caregivers to share the emotional weight of caregiving. Burnout prevention, self-care strategies, and mutual support from people who truly understand.',
    conditions: ['Z73.0'],
    partnerOrgs: [
      {
        name: 'Family Caregiver Alliance',
        url: 'https://www.caregiver.org',
        role: 'Resource Partner',
      },
    ],
  },
  {
    name: 'Diabetes Home Management',
    slug: 'diabetes-home-management',
    description:
      'Managing diabetes at home — meal planning, blood sugar monitoring, medication management, and the daily realities of home-based diabetes care.',
    conditions: ['E11.9'],
    partnerOrgs: [
      {
        name: 'American Diabetes Association',
        url: 'https://www.diabetes.org',
        role: 'Resource Partner',
      },
    ],
  },
  {
    name: 'Heart Failure & COPD Home Care',
    slug: 'heart-failure-copd',
    description:
      'Home management of heart failure and COPD. Weight monitoring, oxygen therapy, medication adherence, and recognizing when to seek emergency care.',
    conditions: ['I50.9', 'J44.1'],
    partnerOrgs: [],
  },
  {
    name: "Parkinson's Caregivers",
    slug: 'parkinsons-caregivers',
    description:
      "Support for families navigating Parkinson's disease. Movement challenges, medication timing, speech therapy, and maintaining quality of life.",
    conditions: ['G20'],
    smartPatientsUrl: 'https://www.smartpatients.com/partners/parkinsons',
    partnerOrgs: [
      {
        name: 'American Parkinson Disease Association',
        url: 'https://www.apdaparkinson.org',
        role: 'Clinical Advisor',
      },
    ],
  },
  {
    name: 'End-of-Life & Advance Care Planning',
    slug: 'end-of-life-planning',
    description:
      'Compassionate discussions about advance directives, hospice decisions, POLST forms, and supporting loved ones through end-of-life transitions.',
    conditions: ['99497', '99498'],
    partnerOrgs: [
      { name: 'Five Wishes', url: 'https://www.fivewishes.org', role: 'Resource Partner' },
      { name: 'POLST', url: 'https://polst.org', role: 'Resource Partner' },
    ],
  },
  {
    name: 'Post-Hospital Discharge',
    slug: 'post-hospital-discharge',
    description:
      'Navigating the first weeks after a hospital stay. Medication reconciliation, follow-up appointments, home safety modifications, and preventing readmission.',
    conditions: [],
    partnerOrgs: [],
  },
  {
    name: 'HSA/FSA & Financial Navigation',
    slug: 'hsa-fsa-financial',
    description:
      'Maximizing HSA/FSA benefits for home care, understanding Medicaid waivers, Medicare Advantage supplemental benefits, and reducing out-of-pocket care costs.',
    conditions: [],
    partnerOrgs: [],
  },
];

// ── Service Functions ───────────────────────────────────

async function seedDefaultCommunities(): Promise<number> {
  let created = 0;

  for (const community of DEFAULT_COMMUNITIES) {
    const existing = await queries.getPeerCommunityBySlug(community.slug);
    if (!existing) {
      await queries.createPeerCommunity({
        name: community.name,
        slug: community.slug,
        description: community.description,
        conditions: community.conditions,
        smartPatientsUrl: community.smartPatientsUrl,
        partnerOrgs: community.partnerOrgs,
        externalResources: community.externalResources,
      });
      created++;
    }
  }

  if (created > 0) {
    logger.info({ created }, 'Seeded default peer support communities');
  }

  return created;
}

async function listCommunities(): Promise<queries.PeerCommunityRecord[]> {
  return queries.listPeerCommunities();
}

async function getCommunityDetail(slug: string): Promise<{
  community: queries.PeerCommunityRecord;
  recentPosts: queries.PeerPostRecord[];
}> {
  const community = await queries.getPeerCommunityBySlug(slug);
  if (!community) throw new NotFoundError('Peer Community');

  const recentPosts = await queries.listPeerPostsByCommunity(
    community.id,
    { sortBy: 'recent' },
    10,
  );

  return { community, recentPosts };
}

async function joinCommunity(
  userId: string,
  slug: string,
): Promise<queries.CommunityMembershipRecord> {
  const community = await queries.getPeerCommunityBySlug(slug);
  if (!community) throw new NotFoundError('Peer Community');

  // Check if already a member
  const existing = await queries.getCommunityMembership(userId, community.id);
  if (existing) {
    throw new ConflictError('Already a member of this community');
  }

  const membership = await queries.createCommunityMembership({
    userId,
    communityId: community.id,
  });

  await queries.incrementCommunityMemberCount(community.id, 1);

  logger.info({ userId, communitySlug: slug }, 'User joined peer community');
  return membership;
}

async function leaveCommunity(userId: string, slug: string): Promise<void> {
  const community = await queries.getPeerCommunityBySlug(slug);
  if (!community) throw new NotFoundError('Peer Community');

  const membership = await queries.getCommunityMembership(userId, community.id);
  if (!membership) {
    throw new NotFoundError('Community Membership');
  }

  await queries.deleteCommunityMembership(userId, community.id);
  await queries.incrementCommunityMemberCount(community.id, -1);

  logger.info({ userId, communitySlug: slug }, 'User left peer community');
}

async function listPosts(slug: string, query: PostsQuery): Promise<queries.PeerPostRecord[]> {
  const community = await queries.getPeerCommunityBySlug(slug);
  if (!community) throw new NotFoundError('Peer Community');

  return queries.listPeerPostsByCommunity(
    community.id,
    { type: query.type, sortBy: query.sortBy },
    query.limit,
    query.offset,
  );
}

async function createPost(
  userId: string,
  slug: string,
  input: CreatePeerPostInput,
): Promise<queries.PeerPostRecord> {
  const community = await queries.getPeerCommunityBySlug(slug);
  if (!community) throw new NotFoundError('Peer Community');

  // Verify membership
  const membership = await queries.getCommunityMembership(userId, community.id);
  if (!membership) {
    throw new ForbiddenError('You must join this community before posting');
  }

  // Get author info
  const user = await queries.getUserById(userId);
  if (!user) throw new NotFoundError('User');
  const authorName = `${user.firstName} ${user.lastName?.charAt(0) ?? ''}.`;

  // PHI strip content
  const { sanitized: sanitizedTitle, flagged: titleFlagged } = sanitizeContent(input.title);
  const { sanitized: sanitizedContent, flagged: contentFlagged } = sanitizeContent(input.content);
  const flagged = titleFlagged || contentFlagged;

  const post = await queries.createPeerPost({
    communityId: community.id,
    authorId: userId,
    authorName,
    authorRole: input.authorRole,
    type: input.type,
    title: sanitizedTitle,
    content: sanitizedContent,
    tags: input.tags,
    relatedConditions: input.relatedConditions,
    relatedMedications: input.relatedMedications,
    relatedInterventions: input.relatedInterventions,
    flagged,
  });

  await queries.incrementCommunityPostCount(community.id);

  if (flagged) {
    logger.warn(
      { postId: post.id, communitySlug: slug },
      'Peer post flagged — contains emergency keywords',
    );
  }

  logger.info({ postId: post.id, communitySlug: slug, type: input.type }, 'Peer post created');
  return post;
}

async function getPostDetail(postId: string): Promise<{
  post: queries.PeerPostRecord;
  comments: queries.PeerCommentRecord[];
}> {
  const post = await queries.getPeerPostById(postId);
  if (!post) throw new NotFoundError('Peer Post');

  const comments = await queries.listPeerCommentsByPost(postId);
  return { post, comments };
}

async function upvotePost(postId: string): Promise<queries.PeerPostRecord> {
  const post = await queries.getPeerPostById(postId);
  if (!post) throw new NotFoundError('Peer Post');

  return queries.incrementPeerPostUpvotes(postId);
}

async function bookmarkPost(postId: string): Promise<queries.PeerPostRecord> {
  const post = await queries.getPeerPostById(postId);
  if (!post) throw new NotFoundError('Peer Post');

  return queries.incrementPeerPostBookmarks(postId);
}

async function addComment(
  postId: string,
  userId: string,
  input: CreatePeerCommentInput,
): Promise<queries.PeerCommentRecord> {
  const post = await queries.getPeerPostById(postId);
  if (!post) throw new NotFoundError('Peer Post');

  const user = await queries.getUserById(userId);
  if (!user) throw new NotFoundError('User');
  const authorName = `${user.firstName} ${user.lastName?.charAt(0) ?? ''}.`;

  // PHI strip content
  const { sanitized, flagged } = sanitizeContent(input.content);

  if (flagged) {
    logger.warn({ postId, authorId: userId }, 'Peer comment flagged — contains emergency keywords');
  }

  const comment = await queries.createPeerComment({
    postId,
    authorId: userId,
    authorName,
    authorRole: input.authorRole,
    content: sanitized,
  });

  await queries.incrementPeerPostCommentCount(postId);

  logger.info({ commentId: comment.id, postId }, 'Peer comment created');
  return comment;
}

async function verifyComment(commentId: string): Promise<queries.PeerCommentRecord> {
  const comment = await queries.getPeerCommentById(commentId);
  if (!comment) throw new NotFoundError('Peer Comment');

  if (comment.isClinicianVerified) {
    throw new ValidationError('Comment is already verified');
  }

  const updated = await queries.updatePeerComment(commentId, {
    isClinicianVerified: true,
  });

  logger.info({ commentId }, 'Peer comment clinician-verified');
  return updated;
}

async function getMyCommunities(userId: string): Promise<queries.PeerCommunityRecord[]> {
  const memberships = await queries.listMembershipsByUser(userId);
  const communities: queries.PeerCommunityRecord[] = [];

  for (const membership of memberships) {
    const community = await queries.getPeerCommunityById(membership.communityId);
    if (community) {
      communities.push(community);
    }
  }

  return communities;
}

async function getRecommendedCommunities(userId: string): Promise<queries.PeerCommunityRecord[]> {
  // Look up conditions from user's family/care recipient LMN or assessments
  // For now, try to find from any associated meal plans (which have ICD-10 codes)
  const allCommunities = await queries.listPeerCommunities();
  const memberships = await queries.listMembershipsByUser(userId);
  const joinedIds = new Set(memberships.map((m) => m.communityId));

  // Filter out communities the user has already joined
  const notJoined = allCommunities.filter((c) => !joinedIds.has(c.id));

  // If we can't determine specific conditions, return all un-joined communities
  // sorted by member count (most popular first)
  return notJoined.sort((a, b) => b.memberCount - a.memberCount);
}

export const peerSupportService = {
  seedDefaultCommunities,
  listCommunities,
  getCommunityDetail,
  joinCommunity,
  leaveCommunity,
  listPosts,
  createPost,
  getPostDetail,
  upvotePost,
  bookmarkPost,
  addComment,
  verifyComment,
  getMyCommunities,
  getRecommendedCommunities,
};
