// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Nutrition Query Builders — Meal Plans, Orders, Assessments, Neighbor Kitchens
 */
import { getPostgres } from '../postgres.js';

// ── Meal Plan Records ─────────────────────────────────────

export interface MealPlanRecord {
  id: string;
  careRecipientId: string;
  careRecipientName: string;
  createdBy: string;
  conditions: string[];
  dietaryRestrictions: string[];
  allergens: string[];
  caloricTarget: number | null;
  proteinTarget: number | null;
  mealsPerDay: number;
  mealsPerWeek: number;
  deliveryDays: number[];
  lmnId: string | null;
  icd10Codes: string[];
  hsaEligible: boolean;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealPlanInput {
  careRecipientId: string;
  careRecipientName: string;
  createdBy: string;
  conditions: string[];
  dietaryRestrictions: string[];
  allergens: string[];
  caloricTarget?: number;
  proteinTarget?: number;
  mealsPerDay: number;
  mealsPerWeek: number;
  deliveryDays: number[];
  lmnId?: string;
  icd10Codes: string[];
  hsaEligible: boolean;
  startDate: string;
  endDate?: string;
}

export async function createMealPlan(input: CreateMealPlanInput): Promise<MealPlanRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('meal_plan', {
    careRecipientId: input.careRecipientId,
    careRecipientName: input.careRecipientName,
    createdBy: input.createdBy,
    conditions: input.conditions,
    dietaryRestrictions: input.dietaryRestrictions,
    allergens: input.allergens,
    caloricTarget: input.caloricTarget ?? null,
    proteinTarget: input.proteinTarget ?? null,
    mealsPerDay: input.mealsPerDay,
    mealsPerWeek: input.mealsPerWeek,
    deliveryDays: input.deliveryDays,
    lmnId: input.lmnId ?? null,
    icd10Codes: input.icd10Codes,
    hsaEligible: input.hsaEligible,
    status: 'draft',
    startDate: input.startDate,
    endDate: input.endDate ?? null,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as MealPlanRecord;
}

export async function getMealPlanById(id: string): Promise<MealPlanRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as MealPlanRecord) ?? null;
}

export async function updateMealPlan(
  id: string,
  data: Partial<MealPlanRecord>,
): Promise<MealPlanRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as MealPlanRecord;
}

export async function listMealPlansByCareRecipient(
  careRecipientId: string,
): Promise<MealPlanRecord[]> {
  const db = getPostgres();
  const records = await db.query<[MealPlanRecord[]]>(
    'SELECT * FROM meal_plan WHERE careRecipientId = $careRecipientId ORDER BY createdAt DESC',
    { careRecipientId },
  );
  return records[0] ?? [];
}

export async function listMealPlans(filters?: { status?: string }): Promise<MealPlanRecord[]> {
  const db = getPostgres();
  let query = 'SELECT * FROM meal_plan';
  const params: Record<string, unknown> = {};

  if (filters?.status) {
    query += ' WHERE status = $status';
    params.status = filters.status;
  }

  query += ' ORDER BY createdAt DESC';
  const records = await db.query<[MealPlanRecord[]]>(query, params);
  return records[0] ?? [];
}

// ── Meal Order Records ────────────────────────────────────

export interface MealItemRecord {
  name: string;
  description: string;
  calories: number;
  protein: number;
  tags: string[];
  texture: 'regular' | 'soft' | 'minced' | 'pureed' | 'liquid';
  allergenFree: string[];
}

export interface MealOrderRecord {
  id: string;
  mealPlanId: string;
  careRecipientId: string;
  meals: MealItemRecord[];
  specialInstructions: string | null;
  preparedBy: 'neighbor' | 'cloud_kitchen' | 'caregiver';
  preparerId: string;
  preparerName: string;
  deliveryDate: string;
  deliveryWindow: string;
  deliveryStatus: 'scheduled' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';
  deliveredAt: string | null;
  totalCalories: number;
  totalProtein: number;
  cost: number;
  hsaClaimable: boolean;
  timeBankHours: number | null;
  rating: number | null;
  ratingComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealOrderInput {
  mealPlanId: string;
  careRecipientId: string;
  meals: MealItemRecord[];
  specialInstructions?: string;
  preparedBy: 'neighbor' | 'cloud_kitchen' | 'caregiver';
  preparerId: string;
  preparerName: string;
  deliveryDate: string;
  deliveryWindow: string;
  totalCalories: number;
  totalProtein: number;
  cost: number;
  hsaClaimable: boolean;
  timeBankHours?: number;
}

export async function createMealOrder(input: CreateMealOrderInput): Promise<MealOrderRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('meal_order', {
    mealPlanId: input.mealPlanId,
    careRecipientId: input.careRecipientId,
    meals: input.meals,
    specialInstructions: input.specialInstructions ?? null,
    preparedBy: input.preparedBy,
    preparerId: input.preparerId,
    preparerName: input.preparerName,
    deliveryDate: input.deliveryDate,
    deliveryWindow: input.deliveryWindow,
    deliveryStatus: 'scheduled',
    deliveredAt: null,
    totalCalories: input.totalCalories,
    totalProtein: input.totalProtein,
    cost: input.cost,
    hsaClaimable: input.hsaClaimable,
    timeBankHours: input.timeBankHours ?? null,
    rating: null,
    ratingComment: null,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as MealOrderRecord;
}

export async function getMealOrderById(id: string): Promise<MealOrderRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as MealOrderRecord) ?? null;
}

export async function updateMealOrder(
  id: string,
  data: Partial<MealOrderRecord>,
): Promise<MealOrderRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as MealOrderRecord;
}

export async function listMealOrdersByPlan(mealPlanId: string): Promise<MealOrderRecord[]> {
  const db = getPostgres();
  const records = await db.query<[MealOrderRecord[]]>(
    'SELECT * FROM meal_order WHERE mealPlanId = $mealPlanId ORDER BY deliveryDate DESC',
    { mealPlanId },
  );
  return records[0] ?? [];
}

export async function listMealOrdersByCareRecipient(
  careRecipientId: string,
): Promise<MealOrderRecord[]> {
  const db = getPostgres();
  const records = await db.query<[MealOrderRecord[]]>(
    'SELECT * FROM meal_order WHERE careRecipientId = $careRecipientId ORDER BY deliveryDate DESC',
    { careRecipientId },
  );
  return records[0] ?? [];
}

export async function listMealOrdersByPreparer(preparerId: string): Promise<MealOrderRecord[]> {
  const db = getPostgres();
  const records = await db.query<[MealOrderRecord[]]>(
    'SELECT * FROM meal_order WHERE preparerId = $preparerId ORDER BY deliveryDate DESC',
    { preparerId },
  );
  return records[0] ?? [];
}

export async function listMealOrders(filters?: {
  status?: string;
  deliveryDate?: string;
}): Promise<MealOrderRecord[]> {
  const db = getPostgres();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters?.status) {
    conditions.push('deliveryStatus = $status');
    params.status = filters.status;
  }
  if (filters?.deliveryDate) {
    conditions.push('deliveryDate = $deliveryDate');
    params.deliveryDate = filters.deliveryDate;
  }

  let query = 'SELECT * FROM meal_order';
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY deliveryDate DESC';

  const records = await db.query<[MealOrderRecord[]]>(query, params);
  return records[0] ?? [];
}

// ── Nutrition Assessment Records ──────────────────────────

export interface NutritionAssessmentRecord {
  id: string;
  careRecipientId: string;
  assessedBy: string;
  weightLoss: 'none' | 'unsure' | '1_3kg' | 'over_3kg';
  mobilityLevel: 'bed_bound' | 'chair_bound' | 'mobile_indoors' | 'goes_out';
  psychologicalStress: boolean;
  neuropsychological: 'none' | 'mild_dementia' | 'depression' | 'severe_dementia';
  bmi: number | null;
  calfCircumference: number | null;
  totalScore: number;
  riskLevel: 'normal' | 'at_risk' | 'malnourished';
  sarcfStrength: number;
  sarcfAssistWalking: number;
  sarcfRiseFromChair: number;
  sarcfClimbStairs: number;
  sarcfFalls: number;
  sarcfTotal: number;
  fallRiskElevated: boolean;
  completedAt: string;
  createdAt: string;
}

export interface CreateNutritionAssessmentInput {
  careRecipientId: string;
  assessedBy: string;
  weightLoss: 'none' | 'unsure' | '1_3kg' | 'over_3kg';
  mobilityLevel: 'bed_bound' | 'chair_bound' | 'mobile_indoors' | 'goes_out';
  psychologicalStress: boolean;
  neuropsychological: 'none' | 'mild_dementia' | 'depression' | 'severe_dementia';
  bmi?: number;
  calfCircumference?: number;
  totalScore: number;
  riskLevel: 'normal' | 'at_risk' | 'malnourished';
  sarcfStrength: number;
  sarcfAssistWalking: number;
  sarcfRiseFromChair: number;
  sarcfClimbStairs: number;
  sarcfFalls: number;
  sarcfTotal: number;
  fallRiskElevated: boolean;
}

export async function createNutritionAssessment(
  input: CreateNutritionAssessmentInput,
): Promise<NutritionAssessmentRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('nutrition_assessment', {
    careRecipientId: input.careRecipientId,
    assessedBy: input.assessedBy,
    weightLoss: input.weightLoss,
    mobilityLevel: input.mobilityLevel,
    psychologicalStress: input.psychologicalStress,
    neuropsychological: input.neuropsychological,
    bmi: input.bmi ?? null,
    calfCircumference: input.calfCircumference ?? null,
    totalScore: input.totalScore,
    riskLevel: input.riskLevel,
    sarcfStrength: input.sarcfStrength,
    sarcfAssistWalking: input.sarcfAssistWalking,
    sarcfRiseFromChair: input.sarcfRiseFromChair,
    sarcfClimbStairs: input.sarcfClimbStairs,
    sarcfFalls: input.sarcfFalls,
    sarcfTotal: input.sarcfTotal,
    fallRiskElevated: input.fallRiskElevated,
    completedAt: now,
    createdAt: now,
  } as Record<string, unknown>);
  return record as unknown as NutritionAssessmentRecord;
}

export async function getLatestNutritionAssessment(
  careRecipientId: string,
): Promise<NutritionAssessmentRecord | null> {
  const db = getPostgres();
  const records = await db.query<[NutritionAssessmentRecord[]]>(
    'SELECT * FROM nutrition_assessment WHERE careRecipientId = $careRecipientId ORDER BY completedAt DESC LIMIT 1',
    { careRecipientId },
  );
  return records[0]?.[0] ?? null;
}

export async function listNutritionAssessments(
  careRecipientId: string,
): Promise<NutritionAssessmentRecord[]> {
  const db = getPostgres();
  const records = await db.query<[NutritionAssessmentRecord[]]>(
    'SELECT * FROM nutrition_assessment WHERE careRecipientId = $careRecipientId ORDER BY completedAt DESC',
    { careRecipientId },
  );
  return records[0] ?? [];
}

// ── Neighbor Kitchen Records ──────────────────────────────

export interface NeighborKitchenRecord {
  id: string;
  neighborId: string;
  neighborName: string;
  cottageFoodCertified: boolean;
  foodHandlerCertified: boolean;
  certificationExpiry: string | null;
  cuisineTypes: string[];
  canPreparePureed: boolean;
  canPrepareHighProtein: boolean;
  canPrepareDiabeticFriendly: boolean;
  maxMealsPerDay: number;
  deliveryRadius: number;
  availableDays: number[];
  totalMealsDelivered: number;
  averageRating: number;
  reviewCount: number;
  status: 'pending_approval' | 'active' | 'suspended' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateNeighborKitchenInput {
  neighborId: string;
  neighborName: string;
  cottageFoodCertified: boolean;
  foodHandlerCertified: boolean;
  certificationExpiry?: string;
  cuisineTypes: string[];
  canPreparePureed: boolean;
  canPrepareHighProtein: boolean;
  canPrepareDiabeticFriendly: boolean;
  maxMealsPerDay: number;
  deliveryRadius: number;
  availableDays: number[];
}

export async function createNeighborKitchen(
  input: CreateNeighborKitchenInput,
): Promise<NeighborKitchenRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('neighbor_kitchen', {
    neighborId: input.neighborId,
    neighborName: input.neighborName,
    cottageFoodCertified: input.cottageFoodCertified,
    foodHandlerCertified: input.foodHandlerCertified,
    certificationExpiry: input.certificationExpiry ?? null,
    cuisineTypes: input.cuisineTypes,
    canPreparePureed: input.canPreparePureed,
    canPrepareHighProtein: input.canPrepareHighProtein,
    canPrepareDiabeticFriendly: input.canPrepareDiabeticFriendly,
    maxMealsPerDay: input.maxMealsPerDay,
    deliveryRadius: input.deliveryRadius,
    availableDays: input.availableDays,
    totalMealsDelivered: 0,
    averageRating: 0,
    reviewCount: 0,
    status: 'pending_approval',
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as NeighborKitchenRecord;
}

export async function getNeighborKitchenById(id: string): Promise<NeighborKitchenRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as NeighborKitchenRecord) ?? null;
}

export async function updateNeighborKitchen(
  id: string,
  data: Partial<NeighborKitchenRecord>,
): Promise<NeighborKitchenRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as NeighborKitchenRecord;
}

export async function listNeighborKitchens(filters?: {
  status?: string;
}): Promise<NeighborKitchenRecord[]> {
  const db = getPostgres();
  let query = 'SELECT * FROM neighbor_kitchen';
  const params: Record<string, unknown> = {};

  if (filters?.status) {
    query += ' WHERE status = $status';
    params.status = filters.status;
  }

  query += ' ORDER BY averageRating DESC';
  const records = await db.query<[NeighborKitchenRecord[]]>(query, params);
  return records[0] ?? [];
}

export async function listActiveNeighborKitchens(): Promise<NeighborKitchenRecord[]> {
  const db = getPostgres();
  const records = await db.query<[NeighborKitchenRecord[]]>(
    "SELECT * FROM neighbor_kitchen WHERE status = 'active' ORDER BY averageRating DESC",
  );
  return records[0] ?? [];
}

export async function getNeighborKitchenByNeighborId(
  neighborId: string,
): Promise<NeighborKitchenRecord | null> {
  const db = getPostgres();
  const records = await db.query<[NeighborKitchenRecord[]]>(
    'SELECT * FROM neighbor_kitchen WHERE neighborId = $neighborId LIMIT 1',
    { neighborId },
  );
  return records[0]?.[0] ?? null;
}
