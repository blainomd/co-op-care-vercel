/**
 * Wellness Marketplace Routes — Products, Bundles, Recommendations, Reviews
 *
 * Public routes: list products, list bundles
 * Auth routes: reviews, recommendations, tracking
 * Admin routes: create/update products
 */
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { wellnessService } from './service.js';
import type { CreateWellnessProductInput } from '../../database/queries/wellness.js';
import type { WellnessProductRecord } from '../../database/queries/wellness.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { ValidationError } from '../../common/errors.js';

// ── Zod Schemas ─────────────────────────────────────────

const productQuerySchema = z.object({
  category: z.string().optional(),
  intervention: z.string().optional(),
  hsaEligible: z.coerce.boolean().optional(),
  minEase: z.coerce.number().int().min(1).max(5).optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().min(1).max(100),
  category: z.string().min(1),
  description: z.string().min(1).max(2000),
  conditions: z.array(z.string()).default([]),
  interventions: z.array(z.string()).default([]),
  contraindications: z.array(z.string()).default([]),
  easeOfUse: z.number().int().min(1).max(5) as z.ZodType<1 | 2 | 3 | 4 | 5>,
  setupComplexity: z.enum(['none', 'minimal', 'moderate', 'professional_install']),
  techRequired: z.enum(['none', 'smartphone', 'wifi', 'bluetooth']),
  cognitiveLoad: z.enum(['very_low', 'low', 'moderate', 'high']),
  priceMin: z.number().min(0),
  priceMax: z.number().min(0),
  pricingModel: z.enum(['one_time', 'monthly', 'annual', 'per_use']),
  hsaEligible: z.boolean(),
  coopRating: z.number().min(0).max(5),
  coopReview: z.string().min(1).max(2000),
  affiliateUrl: z.string().url().optional(),
  partnerDiscount: z
    .object({
      code: z.string(),
      percentage: z.number().min(0).max(100),
      description: z.string(),
    })
    .optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(2000).optional(),
  conditions: z.array(z.string()).optional(),
  interventions: z.array(z.string()).optional(),
  contraindications: z.array(z.string()).optional(),
  easeOfUse: z.number().int().min(1).max(5).optional(),
  setupComplexity: z.enum(['none', 'minimal', 'moderate', 'professional_install']).optional(),
  techRequired: z.enum(['none', 'smartphone', 'wifi', 'bluetooth']).optional(),
  cognitiveLoad: z.enum(['very_low', 'low', 'moderate', 'high']).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  pricingModel: z.enum(['one_time', 'monthly', 'annual', 'per_use']).optional(),
  hsaEligible: z.boolean().optional(),
  coopRating: z.number().min(0).max(5).optional(),
  coopReview: z.string().min(1).max(2000).optional(),
  affiliateUrl: z.string().url().nullable().optional(),
  partnerDiscount: z
    .object({
      code: z.string(),
      percentage: z.number().min(0).max(100),
      description: z.string(),
    })
    .nullable()
    .optional(),
  imageUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(2000),
});

const generateRecommendationsSchema = z.object({
  careRecipientId: z.string().min(1),
});

export async function wellnessRoutes(app: FastifyInstance) {
  // ── PUBLIC ROUTES (no auth required) ──────────────────

  // GET /api/v1/wellness/products — List/search products
  app.get('/products', async (request) => {
    const query = productQuerySchema.parse(request.query);
    const products = await wellnessService.listProducts(query);
    return { products };
  });

  // GET /api/v1/wellness/products/:id — Product detail
  app.get<{ Params: { id: string } }>('/products/:id', async (request) => {
    const product = await wellnessService.getProduct(request.params.id);
    return { product };
  });

  // GET /api/v1/wellness/bundles — List curated bundles
  app.get('/bundles', async () => {
    const bundles = await wellnessService.listBundles();
    return { bundles };
  });

  // GET /api/v1/wellness/bundles/:id — Bundle detail
  app.get<{ Params: { id: string } }>('/bundles/:id', async (request) => {
    const bundle = await wellnessService.getBundle(request.params.id);
    return { bundle };
  });

  // ── AUTHENTICATED ROUTES ──────────────────────────────

  // POST /api/v1/wellness/products/:id/review — Member review
  app.post<{ Params: { id: string } }>(
    '/products/:id/review',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const input = reviewSchema.parse(request.body);
      const review = await wellnessService.addReview(request.params.id, request.userId!, input);
      reply.code(201);
      return { review };
    },
  );

  // GET /api/v1/wellness/recommendations — My personalized recommendations
  app.get(
    '/recommendations',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const recommendations = await wellnessService.listRecommendations(request.userId!);
      return { recommendations };
    },
  );

  // POST /api/v1/wellness/recommendations/generate — Generate recommendations for a care recipient
  app.post(
    '/recommendations/generate',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const input = generateRecommendationsSchema.parse(request.body);
      const recommendation = await wellnessService.generateRecommendations(
        request.userId!,
        input.careRecipientId,
      );
      reply.code(201);
      return { recommendation };
    },
  );

  // POST /api/v1/wellness/recommendations/:id/click — Track product click
  app.post<{ Params: { id: string } }>(
    '/recommendations/:id/click',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const body = request.body as { productId?: string };
      if (!body.productId) throw new ValidationError('productId is required');
      const recommendation = await wellnessService.trackClick(request.params.id, body.productId);
      return { recommendation };
    },
  );

  // POST /api/v1/wellness/recommendations/:id/dismiss — Dismiss recommendation
  app.post<{ Params: { id: string } }>(
    '/recommendations/:id/dismiss',
    {
      preHandler: [requireAuth],
    },
    async (request) => {
      const recommendation = await wellnessService.dismissRecommendation(request.params.id);
      return { recommendation };
    },
  );

  // ── ADMIN ROUTES ──────────────────────────────────────

  // POST /api/v1/wellness/products — Admin: add product
  app.post(
    '/products',
    {
      preHandler: [requireAuth, requireRole('admin')],
    },
    async (request, reply) => {
      const input = createProductSchema.parse(
        request.body,
      ) as unknown as CreateWellnessProductInput;
      const product = await wellnessService.createProduct(input);
      reply.code(201);
      return { product };
    },
  );

  // PATCH /api/v1/wellness/products/:id — Admin: update product
  app.patch<{ Params: { id: string } }>(
    '/products/:id',
    {
      preHandler: [requireAuth, requireRole('admin')],
    },
    async (request) => {
      const input = updateProductSchema.parse(
        request.body,
      ) as unknown as Partial<WellnessProductRecord>;
      const product = await wellnessService.updateProduct(request.params.id, input);
      return { product };
    },
  );
}
