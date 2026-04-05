/**
 * Social Routes — Feed, Posts, Comments, Care Circles, Milestones
 *
 * Private social network for cooperative members.
 */
import type { FastifyInstance } from 'fastify';
import {
  socialService,
  createPostSchema,
  reactSchema,
  createCommentSchema,
  createCircleSchema,
  addCircleMemberSchema,
  feedQuerySchema,
} from './service.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export async function socialRoutes(app: FastifyInstance) {
  // All social routes require authentication
  app.addHook('preHandler', requireAuth);

  // ── Feed ────────────────────────────────────────────────

  // GET /api/v1/social/feed — Personalized feed
  app.get('/feed', async (request) => {
    const query = feedQuerySchema.parse(request.query);
    const posts = await socialService.getFeed(request.userId!, query);
    return { posts };
  });

  // ── Posts ───────────────────────────────────────────────

  // POST /api/v1/social/posts — Create a post
  app.post('/posts', async (request) => {
    const input = createPostSchema.parse(request.body);
    const post = await socialService.createPost(request.userId!, input);
    return { post };
  });

  // GET /api/v1/social/posts/:id — Get single post with comments
  app.get<{ Params: { id: string } }>('/posts/:id', async (request) => {
    const post = await socialService.getPost(request.params.id);
    return { post };
  });

  // DELETE /api/v1/social/posts/:id — Delete own post
  app.delete<{ Params: { id: string } }>('/posts/:id', async (request) => {
    await socialService.deletePost(request.params.id, request.userId!);
    return { success: true };
  });

  // POST /api/v1/social/posts/:id/react — Add reaction
  app.post<{ Params: { id: string } }>('/posts/:id/react', async (request) => {
    const input = reactSchema.parse(request.body);
    const post = await socialService.reactToPost(request.params.id, input);
    return { post };
  });

  // POST /api/v1/social/posts/:id/comments — Add comment
  app.post<{ Params: { id: string } }>('/posts/:id/comments', async (request) => {
    const input = createCommentSchema.parse(request.body);
    const comment = await socialService.addComment(request.params.id, request.userId!, input);
    return { comment };
  });

  // GET /api/v1/social/posts/:id/comments — List comments
  app.get<{ Params: { id: string } }>('/posts/:id/comments', async (request) => {
    const comments = await socialService.listComments(request.params.id);
    return { comments };
  });

  // ── Care Circles ──────────────────────────────────────

  // POST /api/v1/social/circles — Create a circle
  app.post('/circles', async (request) => {
    const input = createCircleSchema.parse(request.body);
    const circle = await socialService.createCircle(request.userId!, input);
    return { circle };
  });

  // GET /api/v1/social/circles — List my circles
  app.get('/circles', async (request) => {
    const circles = await socialService.listMyCircles(request.userId!);
    return { circles };
  });

  // GET /api/v1/social/circles/:id — Circle detail + recent posts
  app.get<{ Params: { id: string } }>('/circles/:id', async (request) => {
    const circle = await socialService.getCircleDetail(request.params.id, request.userId!);
    return { circle };
  });

  // POST /api/v1/social/circles/:id/members — Invite member
  app.post<{ Params: { id: string } }>('/circles/:id/members', async (request) => {
    const input = addCircleMemberSchema.parse(request.body);
    const circle = await socialService.addCircleMember(request.params.id, request.userId!, input);
    return { circle };
  });

  // DELETE /api/v1/social/circles/:id/members/:userId — Remove member
  app.delete<{ Params: { id: string; userId: string } }>(
    '/circles/:id/members/:userId',
    async (request) => {
      const circle = await socialService.removeCircleMember(
        request.params.id,
        request.userId!,
        request.params.userId,
      );
      return { circle };
    },
  );

  // ── Milestones ────────────────────────────────────────

  // GET /api/v1/social/milestones — My milestones
  app.get('/milestones', async (request) => {
    const milestones = await socialService.getMyMilestones(request.userId!);
    return { milestones };
  });

  // GET /api/v1/social/milestones/feed — Recent milestones across the coop
  app.get('/milestones/feed', async () => {
    const milestones = await socialService.getMilestoneFeed();
    return { milestones };
  });
}
