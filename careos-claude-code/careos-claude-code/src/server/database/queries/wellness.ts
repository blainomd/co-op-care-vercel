// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * Wellness Marketplace Query Builders — Products, Bundles, Recommendations, Reviews
 *
 * Curated wellness products matched to clinical conditions for elderly care recipients.
 * HSA-eligible products, partner discounts, and condition-specific bundles.
 */
import { getPostgres } from '../postgres.js';

// ── Types ────────────────────────────────────────────────

export type WellnessCategory =
  | 'medical_alert'
  | 'fall_prevention'
  | 'mobility_aid'
  | 'nutrition_supplement'
  | 'cognitive_exercise'
  | 'sleep_improvement'
  | 'medication_management'
  | 'home_safety'
  | 'telehealth_device'
  | 'comfort_item'
  | 'caregiver_tool'
  | 'exercise_program'
  | 'mental_health'
  | 'transportation'
  | 'legal_planning';

export interface PartnerDiscount {
  code: string;
  percentage: number;
  description: string;
}

export interface WellnessProductRecord {
  id: string;
  name: string;
  brand: string;
  category: WellnessCategory;
  description: string;

  // Clinical matching
  conditions: string[];
  interventions: string[];
  contraindications: string[];

  // Ease of use
  easeOfUse: 1 | 2 | 3 | 4 | 5;
  setupComplexity: 'none' | 'minimal' | 'moderate' | 'professional_install';
  techRequired: 'none' | 'smartphone' | 'wifi' | 'bluetooth';
  cognitiveLoad: 'very_low' | 'low' | 'moderate' | 'high';

  // Pricing
  priceMin: number;
  priceMax: number;
  pricingModel: 'one_time' | 'monthly' | 'annual' | 'per_use';
  hsaEligible: boolean;

  // Curation
  coopRating: number;
  coopReview: string;
  memberReviewCount: number;
  memberAvgRating: number;

  // Affiliate/partner
  affiliateUrl: string | null;
  partnerDiscount: PartnerDiscount | null;

  // Metadata
  imageUrl: string | null;
  tags: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWellnessProductInput {
  name: string;
  brand: string;
  category: WellnessCategory;
  description: string;
  conditions: string[];
  interventions: string[];
  contraindications?: string[];
  easeOfUse: 1 | 2 | 3 | 4 | 5;
  setupComplexity: 'none' | 'minimal' | 'moderate' | 'professional_install';
  techRequired: 'none' | 'smartphone' | 'wifi' | 'bluetooth';
  cognitiveLoad: 'very_low' | 'low' | 'moderate' | 'high';
  priceMin: number;
  priceMax: number;
  pricingModel: 'one_time' | 'monthly' | 'annual' | 'per_use';
  hsaEligible: boolean;
  coopRating: number;
  coopReview: string;
  affiliateUrl?: string;
  partnerDiscount?: PartnerDiscount;
  imageUrl?: string;
  tags?: string[];
  featured?: boolean;
}

export async function createWellnessProduct(
  input: CreateWellnessProductInput,
): Promise<WellnessProductRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('wellness_product', {
    name: input.name,
    brand: input.brand,
    category: input.category,
    description: input.description,
    conditions: input.conditions,
    interventions: input.interventions,
    contraindications: input.contraindications ?? [],
    easeOfUse: input.easeOfUse,
    setupComplexity: input.setupComplexity,
    techRequired: input.techRequired,
    cognitiveLoad: input.cognitiveLoad,
    priceMin: input.priceMin,
    priceMax: input.priceMax,
    pricingModel: input.pricingModel,
    hsaEligible: input.hsaEligible,
    coopRating: input.coopRating,
    coopReview: input.coopReview,
    memberReviewCount: 0,
    memberAvgRating: 0,
    affiliateUrl: input.affiliateUrl ?? null,
    partnerDiscount: input.partnerDiscount ?? null,
    imageUrl: input.imageUrl ?? null,
    tags: input.tags ?? [],
    featured: input.featured ?? false,
    active: true,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
  return record as unknown as WellnessProductRecord;
}

export async function getWellnessProductById(id: string): Promise<WellnessProductRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as WellnessProductRecord) ?? null;
}

export async function listWellnessProducts(filters?: {
  category?: string;
  intervention?: string;
  hsaEligible?: boolean;
  minEase?: number;
  active?: boolean;
}): Promise<WellnessProductRecord[]> {
  const db = getPostgres();
  let query = 'SELECT * FROM wellness_product WHERE active = true';
  const params: Record<string, unknown> = {};

  if (filters?.category) {
    query += ' AND category = $category';
    params.category = filters.category;
  }
  if (filters?.intervention) {
    query += ' AND interventions CONTAINS $intervention';
    params.intervention = filters.intervention;
  }
  if (filters?.hsaEligible !== undefined) {
    query += ' AND hsaEligible = $hsaEligible';
    params.hsaEligible = filters.hsaEligible;
  }
  if (filters?.minEase) {
    query += ' AND easeOfUse >= $minEase';
    params.minEase = filters.minEase;
  }
  if (filters?.active !== undefined) {
    query += ' AND active = $active';
    params.active = filters.active;
  }

  query += ' ORDER BY featured DESC, coopRating DESC, memberAvgRating DESC';
  const records = await db.query<[WellnessProductRecord[]]>(query, params);
  return records[0] ?? [];
}

export async function listWellnessProductsByConditions(
  conditions: string[],
): Promise<WellnessProductRecord[]> {
  const db = getPostgres();
  const records = await db.query<[WellnessProductRecord[]]>(
    'SELECT * FROM wellness_product WHERE active = true AND conditions CONTAINSANY $conditions ORDER BY coopRating DESC',
    { conditions },
  );
  return records[0] ?? [];
}

export async function listWellnessProductsByInterventions(
  interventions: string[],
): Promise<WellnessProductRecord[]> {
  const db = getPostgres();
  const records = await db.query<[WellnessProductRecord[]]>(
    'SELECT * FROM wellness_product WHERE active = true AND interventions CONTAINSANY $interventions ORDER BY coopRating DESC',
    { interventions },
  );
  return records[0] ?? [];
}

export async function updateWellnessProduct(
  id: string,
  data: Partial<WellnessProductRecord>,
): Promise<WellnessProductRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>);
  return record as unknown as WellnessProductRecord;
}

// ── Wellness Bundles ─────────────────────────────────────

export interface WellnessBundleRecord {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  products: Array<{ productId: string; quantity: number; essential: boolean }>;
  totalPriceMin: number;
  totalPriceMax: number;
  hsaEligibleAmount: number;
  savings: number;
  active: boolean;
  createdAt: string;
}

export interface CreateWellnessBundleInput {
  name: string;
  description: string;
  conditions: string[];
  products: Array<{ productId: string; quantity: number; essential: boolean }>;
  totalPriceMin: number;
  totalPriceMax: number;
  hsaEligibleAmount: number;
  savings: number;
}

export async function createWellnessBundle(
  input: CreateWellnessBundleInput,
): Promise<WellnessBundleRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('wellness_bundle', {
    name: input.name,
    description: input.description,
    conditions: input.conditions,
    products: input.products,
    totalPriceMin: input.totalPriceMin,
    totalPriceMax: input.totalPriceMax,
    hsaEligibleAmount: input.hsaEligibleAmount,
    savings: input.savings,
    active: true,
    createdAt: now,
  } as Record<string, unknown>);
  return record as unknown as WellnessBundleRecord;
}

export async function getWellnessBundleById(id: string): Promise<WellnessBundleRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as WellnessBundleRecord) ?? null;
}

export async function listWellnessBundles(filters?: {
  active?: boolean;
}): Promise<WellnessBundleRecord[]> {
  const db = getPostgres();
  let query = 'SELECT * FROM wellness_bundle';
  const params: Record<string, unknown> = {};

  if (filters?.active !== undefined) {
    query += ' WHERE active = $active';
    params.active = filters.active;
  }

  query += ' ORDER BY createdAt DESC';
  const records = await db.query<[WellnessBundleRecord[]]>(query, params);
  return records[0] ?? [];
}

export async function listWellnessBundlesByConditions(
  conditions: string[],
): Promise<WellnessBundleRecord[]> {
  const db = getPostgres();
  const records = await db.query<[WellnessBundleRecord[]]>(
    'SELECT * FROM wellness_bundle WHERE active = true AND conditions CONTAINSANY $conditions ORDER BY createdAt DESC',
    { conditions },
  );
  return records[0] ?? [];
}

// ── Wellness Recommendations ─────────────────────────────

export interface RecommendedProduct {
  productId: string;
  relevanceScore: number;
  reason: string;
  priority: 'essential' | 'recommended' | 'nice_to_have';
}

export interface WellnessRecommendationRecord {
  id: string;
  userId: string;
  careRecipientId: string;
  triggerType: 'assessment' | 'sage_conversation' | 'condition' | 'manual';
  triggerDetails: string;
  products: RecommendedProduct[];
  viewedAt: string | null;
  productsClicked: string[];
  productsPurchased: string[];
  dismissed: boolean;
  createdAt: string;
}

export interface CreateWellnessRecommendationInput {
  userId: string;
  careRecipientId: string;
  triggerType: WellnessRecommendationRecord['triggerType'];
  triggerDetails: string;
  products: RecommendedProduct[];
}

export async function createWellnessRecommendation(
  input: CreateWellnessRecommendationInput,
): Promise<WellnessRecommendationRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('wellness_recommendation', {
    userId: input.userId,
    careRecipientId: input.careRecipientId,
    triggerType: input.triggerType,
    triggerDetails: input.triggerDetails,
    products: input.products,
    viewedAt: null,
    productsClicked: [],
    productsPurchased: [],
    dismissed: false,
    createdAt: now,
  } as Record<string, unknown>);
  return record as unknown as WellnessRecommendationRecord;
}

export async function getWellnessRecommendationById(
  id: string,
): Promise<WellnessRecommendationRecord | null> {
  const db = getPostgres();
  const [record] = await db.select<Record<string, unknown>>(id);
  return (record as unknown as WellnessRecommendationRecord) ?? null;
}

export async function listWellnessRecommendationsByUser(
  userId: string,
): Promise<WellnessRecommendationRecord[]> {
  const db = getPostgres();
  const records = await db.query<[WellnessRecommendationRecord[]]>(
    'SELECT * FROM wellness_recommendation WHERE userId = $userId AND dismissed = false ORDER BY createdAt DESC',
    { userId },
  );
  return records[0] ?? [];
}

export async function updateWellnessRecommendation(
  id: string,
  data: Partial<WellnessRecommendationRecord>,
): Promise<WellnessRecommendationRecord> {
  const db = getPostgres();
  const [record] = await db.merge(id, data as Record<string, unknown>);
  return record as unknown as WellnessRecommendationRecord;
}

// ── Member Reviews ───────────────────────────────────────

export interface WellnessReviewRecord {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  createdAt: string;
}

export interface CreateWellnessReviewInput {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
}

export async function createWellnessReview(
  input: CreateWellnessReviewInput,
): Promise<WellnessReviewRecord> {
  const db = getPostgres();
  const now = new Date().toISOString();
  const [record] = await db.create('wellness_review', {
    productId: input.productId,
    userId: input.userId,
    rating: input.rating,
    comment: input.comment,
    helpfulCount: 0,
    createdAt: now,
  } as Record<string, unknown>);
  return record as unknown as WellnessReviewRecord;
}

export async function listWellnessReviewsByProduct(
  productId: string,
): Promise<WellnessReviewRecord[]> {
  const db = getPostgres();
  const records = await db.query<[WellnessReviewRecord[]]>(
    'SELECT * FROM wellness_review WHERE productId = $productId ORDER BY createdAt DESC',
    { productId },
  );
  return records[0] ?? [];
}

export async function getExistingReview(
  productId: string,
  userId: string,
): Promise<WellnessReviewRecord | null> {
  const db = getPostgres();
  const records = await db.query<[WellnessReviewRecord[]]>(
    'SELECT * FROM wellness_review WHERE productId = $productId AND userId = $userId LIMIT 1',
    { productId, userId },
  );
  return records[0]?.[0] ?? null;
}
