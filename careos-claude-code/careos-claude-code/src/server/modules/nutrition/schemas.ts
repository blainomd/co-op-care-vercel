/**
 * Nutrition Module — Zod Validation Schemas
 */
import { z } from 'zod';

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');

const timeWindowSchema = z
  .string()
  .regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Time window must be HH:MM-HH:MM format');

// ── Meal Plan Schemas ─────────────────────────────────────

export const createMealPlanSchema = z.object({
  careRecipientId: z.string().min(1),
  careRecipientName: z.string().min(1).max(200),
  conditions: z.array(z.string().min(1)).default([]),
  dietaryRestrictions: z.array(z.string().min(1)).default([]),
  allergens: z.array(z.string().min(1)).default([]),
  caloricTarget: z.number().int().min(500).max(5000).optional(),
  proteinTarget: z.number().int().min(10).max(300).optional(),
  mealsPerDay: z.number().int().min(1).max(6),
  mealsPerWeek: z.number().int().min(1).max(42),
  deliveryDays: z.array(z.number().int().min(0).max(6)),
  lmnId: z.string().optional(),
  icd10Codes: z.array(z.string().min(1)).default([]),
  startDate: dateStringSchema,
  endDate: dateStringSchema.optional(),
});

export type CreateMealPlanInput = z.infer<typeof createMealPlanSchema>;

export const updateMealPlanSchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  dietaryRestrictions: z.array(z.string().min(1)).optional(),
  allergens: z.array(z.string().min(1)).optional(),
  caloricTarget: z.number().int().min(500).max(5000).optional(),
  proteinTarget: z.number().int().min(10).max(300).optional(),
  mealsPerDay: z.number().int().min(1).max(6).optional(),
  mealsPerWeek: z.number().int().min(1).max(42).optional(),
  deliveryDays: z.array(z.number().int().min(0).max(6)).optional(),
  endDate: dateStringSchema.optional(),
});

export type UpdateMealPlanInput = z.infer<typeof updateMealPlanSchema>;

// ── Meal Order Schemas ────────────────────────────────────

const mealItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).default(''),
  calories: z.number().int().min(0),
  protein: z.number().min(0),
  tags: z.array(z.string()).default([]),
  texture: z.enum(['regular', 'soft', 'minced', 'pureed', 'liquid']),
  allergenFree: z.array(z.string()).default([]),
});

export const createMealOrderSchema = z.object({
  mealPlanId: z.string().min(1),
  careRecipientId: z.string().min(1),
  meals: z.array(mealItemSchema).min(1),
  specialInstructions: z.string().max(2000).optional(),
  preparedBy: z.enum(['neighbor', 'cloud_kitchen', 'caregiver']),
  preparerId: z.string().min(1),
  preparerName: z.string().min(1).max(200),
  deliveryDate: dateStringSchema,
  deliveryWindow: timeWindowSchema,
  totalCalories: z.number().int().min(0),
  totalProtein: z.number().min(0),
  cost: z.number().min(0),
  timeBankHours: z.number().min(0).optional(),
});

export type CreateMealOrderInput = z.infer<typeof createMealOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(['scheduled', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled']),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const rateOrderSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export type RateOrderInput = z.infer<typeof rateOrderSchema>;

// ── Nutrition Assessment Schemas ──────────────────────────

export const createAssessmentSchema = z.object({
  careRecipientId: z.string().min(1),
  weightLoss: z.enum(['none', 'unsure', '1_3kg', 'over_3kg']),
  mobilityLevel: z.enum(['bed_bound', 'chair_bound', 'mobile_indoors', 'goes_out']),
  psychologicalStress: z.boolean(),
  neuropsychological: z.enum(['none', 'mild_dementia', 'depression', 'severe_dementia']),
  bmi: z.number().min(10).max(70).optional(),
  calfCircumference: z.number().min(10).max(60).optional(),
  sarcfStrength: z.number().int().min(0).max(2),
  sarcfAssistWalking: z.number().int().min(0).max(2),
  sarcfRiseFromChair: z.number().int().min(0).max(2),
  sarcfClimbStairs: z.number().int().min(0).max(2),
  sarcfFalls: z.number().int().min(0).max(2),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;

// ── Neighbor Kitchen Schemas ──────────────────────────────

export const createNeighborKitchenSchema = z.object({
  neighborName: z.string().min(1).max(200),
  cottageFoodCertified: z.boolean(),
  foodHandlerCertified: z.boolean(),
  certificationExpiry: dateStringSchema.optional(),
  cuisineTypes: z.array(z.string().min(1)).min(1),
  canPreparePureed: z.boolean(),
  canPrepareHighProtein: z.boolean(),
  canPrepareDiabeticFriendly: z.boolean(),
  maxMealsPerDay: z.number().int().min(1).max(100),
  deliveryRadius: z.number().min(0.1).max(50),
  availableDays: z.array(z.number().int().min(0).max(6)).min(1),
});

export type CreateNeighborKitchenInput = z.infer<typeof createNeighborKitchenSchema>;

export const updateNeighborKitchenSchema = z.object({
  cottageFoodCertified: z.boolean().optional(),
  foodHandlerCertified: z.boolean().optional(),
  certificationExpiry: dateStringSchema.optional(),
  cuisineTypes: z.array(z.string().min(1)).optional(),
  canPreparePureed: z.boolean().optional(),
  canPrepareHighProtein: z.boolean().optional(),
  canPrepareDiabeticFriendly: z.boolean().optional(),
  maxMealsPerDay: z.number().int().min(1).max(100).optional(),
  deliveryRadius: z.number().min(0.1).max(50).optional(),
  availableDays: z.array(z.number().int().min(0).max(6)).optional(),
  status: z.enum(['pending_approval', 'active', 'suspended', 'inactive']).optional(),
});

export type UpdateNeighborKitchenInput = z.infer<typeof updateNeighborKitchenSchema>;
