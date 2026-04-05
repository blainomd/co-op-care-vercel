/**
 * Peer Support Routes — Communities, Posts, Comments, Recommendations
 *
 * Public routes: list communities
 * Auth routes: everything else (join, post, comment, verify, recommend)
 */
import type { FastifyInstance } from 'fastify';
import {
  peerSupportService,
  createPeerPostSchema,
  createPeerCommentSchema,
  postsQuerySchema,
} from './service.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function peerSupportRoutes(app: FastifyInstance) {
  // ── PUBLIC ROUTES (no auth required) ──────────────────

  // GET /api/v1/peer-support/communities — List all communities
  app.get('/communities', async () => {
    const communities = await peerSupportService.listCommunities();
    return { communities };
  });

  // ── AUTHENTICATED ROUTES ──────────────────────────────

  // GET /api/v1/peer-support/communities/:slug — Community detail + recent posts
  app.get<{ Params: { slug: string } }>(
    '/communities/:slug',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const result = await peerSupportService.getCommunityDetail(request.params.slug);
      return result;
    },
  );

  // POST /api/v1/peer-support/communities/:slug/join — Join a community
  app.post<{ Params: { slug: string } }>(
    '/communities/:slug/join',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const membership = await peerSupportService.joinCommunity(
        request.userId!,
        request.params.slug,
      );
      reply.code(201);
      return { membership };
    },
  );

  // DELETE /api/v1/peer-support/communities/:slug/leave — Leave a community
  app.delete<{ Params: { slug: string } }>(
    '/communities/:slug/leave',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      await peerSupportService.leaveCommunity(request.userId!, request.params.slug);
      return { success: true };
    },
  );

  // GET /api/v1/peer-support/communities/:slug/posts — Paginated posts
  app.get<{ Params: { slug: string } }>(
    '/communities/:slug/posts',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const query = postsQuerySchema.parse(request.query);
      const posts = await peerSupportService.listPosts(request.params.slug, query);
      return { posts };
    },
  );

  // POST /api/v1/peer-support/communities/:slug/posts — Create post
  app.post<{ Params: { slug: string } }>(
    '/communities/:slug/posts',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const input = createPeerPostSchema.parse(request.body);
      const post = await peerSupportService.createPost(request.userId!, request.params.slug, input);
      reply.code(201);
      return { post };
    },
  );

  // GET /api/v1/peer-support/posts/:id — Post detail with comments
  app.get<{ Params: { id: string } }>(
    '/posts/:id',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const result = await peerSupportService.getPostDetail(request.params.id);
      return result;
    },
  );

  // POST /api/v1/peer-support/posts/:id/upvote — Upvote a post
  app.post<{ Params: { id: string } }>(
    '/posts/:id/upvote',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const post = await peerSupportService.upvotePost(request.params.id);
      return { post };
    },
  );

  // POST /api/v1/peer-support/posts/:id/bookmark — Bookmark a post
  app.post<{ Params: { id: string } }>(
    '/posts/:id/bookmark',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const post = await peerSupportService.bookmarkPost(request.params.id);
      return { post };
    },
  );

  // POST /api/v1/peer-support/posts/:id/comments — Add comment
  app.post<{ Params: { id: string } }>(
    '/posts/:id/comments',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const input = createPeerCommentSchema.parse(request.body);
      const comment = await peerSupportService.addComment(
        request.params.id,
        request.userId!,
        input,
      );
      return { comment };
    },
  );

  // POST /api/v1/peer-support/comments/:id/verify — Medical director verifies comment
  app.post<{ Params: { id: string } }>(
    '/comments/:id/verify',
    {
      preHandler: [requireAuth, requireRole('medical_director')],
    },
    async (request) => {
      const comment = await peerSupportService.verifyComment(request.params.id);
      return { comment };
    },
  );

  // GET /api/v1/peer-support/my-communities — Communities I've joined
  app.get(
    '/my-communities',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const communities = await peerSupportService.getMyCommunities(request.userId!);
      return { communities };
    },
  );

  // GET /api/v1/peer-support/recommended — Recommended communities based on conditions
  app.get(
    '/recommended',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const communities = await peerSupportService.getRecommendedCommunities(request.userId!);
      return { communities };
    },
  );
}
