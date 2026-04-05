/**
 * Nutrition Routes — Meal Plans, Orders, Assessments, Neighbor Kitchens, Eligibility
 */
import type { FastifyInstance } from 'fastify';
import { nutritionService } from './service.js';
import {
  createMealPlanSchema,
  updateMealPlanSchema,
  createMealOrderSchema,
  updateOrderStatusSchema,
  rateOrderSchema,
  createAssessmentSchema,
  createNeighborKitchenSchema,
  updateNeighborKitchenSchema,
} from './schemas.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export async function nutritionRoutes(app: FastifyInstance) {
  // All nutrition routes require authentication
  app.addHook('preHandler', requireAuth);

  // ══════════════════════════════════════════════════════════
  // Meal Plans
  // ══════════════════════════════════════════════════════════

  // POST /api/v1/nutrition/plans — Create meal plan
  app.post('/plans', async (request) => {
    const input = createMealPlanSchema.parse(request.body);
    const plan = await nutritionService.createMealPlan(request.userId!, input);
    return { plan };
  });

  // GET /api/v1/nutrition/plans — List meal plans
  app.get<{ Querystring: { status?: string } }>('/plans', async (request) => {
    const plans = await nutritionService.listMealPlans({
      status: request.query.status,
    });
    return { plans };
  });

  // GET /api/v1/nutrition/plans/:id — Get meal plan detail
  app.get<{ Params: { id: string } }>('/plans/:id', async (request) => {
    const plan = await nutritionService.getMealPlan(request.params.id);
    return { plan };
  });

  // PATCH /api/v1/nutrition/plans/:id — Update meal plan
  app.patch<{ Params: { id: string } }>('/plans/:id', async (request) => {
    const input = updateMealPlanSchema.parse(request.body);
    const plan = await nutritionService.updateMealPlan(request.params.id, input);
    return { plan };
  });

  // ══════════════════════════════════════════════════════════
  // Meal Orders
  // ══════════════════════════════════════════════════════════

  // POST /api/v1/nutrition/orders — Create meal order
  app.post('/orders', async (request) => {
    const input = createMealOrderSchema.parse(request.body);
    const order = await nutritionService.createMealOrder(request.userId!, input);
    return { order };
  });

  // GET /api/v1/nutrition/orders — List meal orders
  app.get<{ Querystring: { status?: string; deliveryDate?: string } }>(
    '/orders',
    async (request) => {
      const orders = await nutritionService.listMealOrders({
        status: request.query.status,
        deliveryDate: request.query.deliveryDate,
      });
      return { orders };
    },
  );

  // PATCH /api/v1/nutrition/orders/:id/status — Update delivery status
  app.patch<{ Params: { id: string } }>('/orders/:id/status', async (request) => {
    const input = updateOrderStatusSchema.parse(request.body);
    const order = await nutritionService.updateOrderStatus(request.params.id, input);
    return { order };
  });

  // POST /api/v1/nutrition/orders/:id/rate — Rate a delivered meal
  app.post<{ Params: { id: string } }>('/orders/:id/rate', async (request) => {
    const input = rateOrderSchema.parse(request.body);
    const order = await nutritionService.rateOrder(request.params.id, request.userId!, input);
    return { order };
  });

  // ══════════════════════════════════════════════════════════
  // Nutrition Assessment (MNA-SF + SARC-F)
  // ══════════════════════════════════════════════════════════

  // POST /api/v1/nutrition/assess — Run nutrition/sarcopenia screening
  app.post('/assess', async (request) => {
    const input = createAssessmentSchema.parse(request.body);
    const assessment = await nutritionService.runAssessment(request.userId!, input);
    return { assessment };
  });

  // GET /api/v1/nutrition/assess/:careRecipientId — Get latest assessment
  app.get<{ Params: { careRecipientId: string } }>('/assess/:careRecipientId', async (request) => {
    const assessment = await nutritionService.getLatestAssessment(request.params.careRecipientId);
    return { assessment };
  });

  // ══════════════════════════════════════════════════════════
  // Neighbor Kitchens
  // ══════════════════════════════════════════════════════════

  // POST /api/v1/nutrition/kitchens — Register as a neighbor kitchen
  app.post('/kitchens', async (request) => {
    const input = createNeighborKitchenSchema.parse(request.body);
    const kitchen = await nutritionService.registerKitchen(request.userId!, input);
    return { kitchen };
  });

  // GET /api/v1/nutrition/kitchens — List kitchens
  app.get<{ Querystring: { status?: string } }>('/kitchens', async (request) => {
    const kitchens = await nutritionService.listKitchens({
      status: request.query.status,
    });
    return { kitchens };
  });

  // GET /api/v1/nutrition/kitchens/:id — Kitchen detail
  app.get<{ Params: { id: string } }>('/kitchens/:id', async (request) => {
    const kitchen = await nutritionService.getKitchen(request.params.id);
    return { kitchen };
  });

  // PATCH /api/v1/nutrition/kitchens/:id — Update kitchen profile
  app.patch<{ Params: { id: string } }>('/kitchens/:id', async (request) => {
    const input = updateNeighborKitchenSchema.parse(request.body);
    const kitchen = await nutritionService.updateKitchen(request.params.id, input);
    return { kitchen };
  });

  // POST /api/v1/nutrition/kitchens/:id/approve — Admin approves kitchen
  app.post<{ Params: { id: string } }>(
    '/kitchens/:id/approve',
    { preHandler: requireRole('admin') },
    async (request) => {
      const kitchen = await nutritionService.approveKitchen(request.params.id);
      return { kitchen };
    },
  );

  // ══════════════════════════════════════════════════════════
  // Medicaid / Insurance Eligibility
  // ══════════════════════════════════════════════════════════

  // GET /api/v1/nutrition/eligibility/:careRecipientId — Check MTM eligibility
  app.get<{ Params: { careRecipientId: string } }>(
    '/eligibility/:careRecipientId',
    async (request) => {
      const eligibility = await nutritionService.checkMtmEligibility(
        request.params.careRecipientId,
      );
      return { eligibility };
    },
  );
}
