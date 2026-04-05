/**
 * Nutrition Service — Meal Plans, Orders, Assessments, Neighbor Kitchens,
 * HSA/FSA eligibility, and Medicaid MTM program matching.
 *
 * Covers clinical nutrition interventions for elderly care recipients:
 * malnutrition screening (MNA-SF), sarcopenia screening (SARC-F),
 * medically tailored meals, and cloud kitchen / neighbor kitchen matching.
 */
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type {
  CreateMealPlanInput,
  UpdateMealPlanInput,
  CreateMealOrderInput,
  UpdateOrderStatusInput,
  RateOrderInput,
  CreateAssessmentInput,
  CreateNeighborKitchenInput,
  UpdateNeighborKitchenInput,
} from './schemas.js';
import type {
  MealPlanRecord,
  MealOrderRecord,
  NutritionAssessmentRecord,
  NeighborKitchenRecord,
} from '../../database/queries/nutrition.js';

// ── ICD-10 Code Constants ────────────────────────────────

/** ICD-10 codes that qualify meals as medically tailored (HSA/FSA eligible) */
const HSA_QUALIFYING_ICD10: Record<string, string> = {
  E46: 'Unspecified protein-calorie malnutrition',
  'E44.0': 'Moderate protein-calorie malnutrition',
  'E44.1': 'Mild protein-calorie malnutrition',
  'M62.84': 'Sarcopenia',
  'R13.10': 'Dysphagia, unspecified',
  'R62.7': 'Adult failure to thrive',
  'R29.6': 'Repeated falls',
  'E11.9': 'Type 2 diabetes mellitus without complications',
  I10: 'Essential (primary) hypertension',
};

/** ICD-10 codes that strongly indicate medically tailored meal necessity */
const STRONG_MTM_ICD10 = new Set(['E46', 'E44.0', 'E44.1', 'M62.84', 'R13.10', 'R62.7']);

// ── Medicaid / Public Program Definitions ────────────────

interface EligibleProgram {
  program: string;
  description: string;
  eligibilityCriteria: string;
  applicationGuidance: string;
  coversMeals: boolean;
}

const MTM_PROGRAMS: EligibleProgram[] = [
  {
    program: 'SNAP (Supplemental Nutrition Assistance Program)',
    description: 'Federal nutrition assistance for low-income individuals and families.',
    eligibilityCriteria:
      'Income at or below 130% of federal poverty level; elderly/disabled may have higher limits.',
    applicationGuidance:
      'Apply at local Department of Human Services or online at benefits.gov. Elderly individuals 60+ may qualify under simplified reporting.',
    coversMeals: false,
  },
  {
    program: 'Older Americans Act — Home-Delivered Meals',
    description: 'Federally funded meals delivered to homebound seniors (Title III-C2).',
    eligibilityCriteria:
      'Age 60+, homebound or isolated, with nutritional risk. No income test required.',
    applicationGuidance:
      'Contact your local Area Agency on Aging (AAA). No cost to participant, though voluntary contributions accepted.',
    coversMeals: true,
  },
  {
    program: 'Older Americans Act — Congregate Meals',
    description: 'Community-based meal programs at senior centers (Title III-C1).',
    eligibilityCriteria:
      'Age 60+ and spouse. No income test. Nutritional risk is a priority factor.',
    applicationGuidance:
      'Contact your local Area Agency on Aging (AAA) or senior center for locations and schedule.',
    coversMeals: true,
  },
  {
    program: 'Medicaid HCBS Waiver — Medically Tailored Meals',
    description:
      'Home and Community Based Services waiver may cover medically tailored meals as a waiver service.',
    eligibilityCriteria:
      'Medicaid eligible, requires nursing facility level of care, state must include MTM in waiver services.',
    applicationGuidance:
      'Apply through your state Medicaid office. Requires physician documentation of medical necessity. Coverage varies by state.',
    coversMeals: true,
  },
  {
    program: 'Medicare Advantage — Supplemental Meal Benefits',
    description:
      'Some MA plans offer meal delivery as a supplemental benefit, especially post-discharge.',
    eligibilityCriteria:
      'Enrolled in a Medicare Advantage plan that includes meal benefits. Often limited to post-discharge (14-28 meals) or chronic condition management.',
    applicationGuidance:
      'Check your MA plan benefits summary or call member services. Benefits reset annually.',
    coversMeals: true,
  },
  {
    program: 'MLTSS (Managed Long-Term Services and Supports)',
    description:
      'Managed care programs for Medicaid LTSS beneficiaries — some include nutrition services.',
    eligibilityCriteria:
      'Medicaid eligible for long-term services, enrolled in state MLTSS program.',
    applicationGuidance:
      'Contact your MLTSS managed care organization (MCO) to determine if nutrition/meal services are covered.',
    coversMeals: true,
  },
];

// ── MNA-SF Scoring ───────────────────────────────────────

function scoreMnaSf(input: CreateAssessmentInput): {
  totalScore: number;
  riskLevel: 'normal' | 'at_risk' | 'malnourished';
} {
  let score = 0;

  // Weight loss in last 3 months (0-3 points)
  switch (input.weightLoss) {
    case 'over_3kg':
      score += 0;
      break;
    case 'unsure':
      score += 1;
      break;
    case '1_3kg':
      score += 2;
      break;
    case 'none':
      score += 3;
      break;
  }

  // Mobility (0-2 points)
  switch (input.mobilityLevel) {
    case 'bed_bound':
      score += 0;
      break;
    case 'chair_bound':
      score += 1;
      break;
    case 'mobile_indoors': // fall through
    case 'goes_out':
      score += 2;
      break;
  }

  // Psychological stress or acute disease (0-2 points)
  score += input.psychologicalStress ? 0 : 2;

  // Neuropsychological problems (0-2 points)
  switch (input.neuropsychological) {
    case 'severe_dementia':
      score += 0;
      break;
    case 'mild_dementia': // fall through
    case 'depression':
      score += 1;
      break;
    case 'none':
      score += 2;
      break;
  }

  // BMI or calf circumference (0-3 points)
  if (input.bmi !== undefined) {
    if (input.bmi < 19) score += 0;
    else if (input.bmi < 21) score += 1;
    else if (input.bmi < 23) score += 2;
    else score += 3;
  } else if (input.calfCircumference !== undefined) {
    // Calf circumference as BMI alternative (MNA-SF)
    score += input.calfCircumference >= 31 ? 3 : 0;
  }

  // Total MNA-SF score: 0-14
  let riskLevel: 'normal' | 'at_risk' | 'malnourished';
  if (score <= 7) {
    riskLevel = 'malnourished';
  } else if (score <= 11) {
    riskLevel = 'at_risk';
  } else {
    riskLevel = 'normal';
  }

  return { totalScore: score, riskLevel };
}

// ── SARC-F Scoring ───────────────────────────────────────

function scoreSarcf(input: CreateAssessmentInput): {
  sarcfTotal: number;
  fallRiskElevated: boolean;
} {
  const sarcfTotal =
    input.sarcfStrength +
    input.sarcfAssistWalking +
    input.sarcfRiseFromChair +
    input.sarcfClimbStairs +
    input.sarcfFalls;

  // SARC-F >= 4 = sarcopenia risk; combined with malnutrition = elevated fall risk
  const fallRiskElevated = sarcfTotal >= 4;

  return { sarcfTotal, fallRiskElevated };
}

// ── HSA Eligibility Check ────────────────────────────────

function determineHsaEligibility(icd10Codes: string[], lmnId?: string): boolean {
  if (!lmnId) return false;
  // Must have at least one qualifying ICD-10 code AND an active LMN
  return icd10Codes.some((code) => code in HSA_QUALIFYING_ICD10);
}

// ── Neighbor Kitchen Matching ────────────────────────────

interface KitchenMatchCriteria {
  dietaryRestrictions: string[];
  requiredTexture?: string;
  deliveryDay: number; // 0=Sun
  allergens: string[];
}

function matchKitchens(
  kitchens: NeighborKitchenRecord[],
  criteria: KitchenMatchCriteria,
): NeighborKitchenRecord[] {
  return kitchens
    .filter((kitchen) => {
      // Must be available on the delivery day
      if (!kitchen.availableDays.includes(criteria.deliveryDay)) return false;

      // Must be able to prepare required texture
      if (criteria.requiredTexture === 'pureed' && !kitchen.canPreparePureed) return false;

      // Check dietary capability
      if (criteria.dietaryRestrictions.includes('high_protein') && !kitchen.canPrepareHighProtein) {
        return false;
      }
      if (
        criteria.dietaryRestrictions.includes('diabetic_friendly') &&
        !kitchen.canPrepareDiabeticFriendly
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by rating (highest first), then by total meals delivered (experience)
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      return b.totalMealsDelivered - a.totalMealsDelivered;
    });
}

// ── Meal Plans ───────────────────────────────────────────

async function createMealPlan(userId: string, input: CreateMealPlanInput): Promise<MealPlanRecord> {
  const hsaEligible = determineHsaEligibility(input.icd10Codes, input.lmnId);

  const record = await queries.createMealPlan({
    careRecipientId: input.careRecipientId,
    careRecipientName: input.careRecipientName,
    createdBy: userId,
    conditions: input.conditions,
    dietaryRestrictions: input.dietaryRestrictions,
    allergens: input.allergens,
    caloricTarget: input.caloricTarget,
    proteinTarget: input.proteinTarget,
    mealsPerDay: input.mealsPerDay,
    mealsPerWeek: input.mealsPerWeek,
    deliveryDays: input.deliveryDays,
    lmnId: input.lmnId,
    icd10Codes: input.icd10Codes,
    hsaEligible,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  logger.info(
    { planId: record.id, careRecipientId: input.careRecipientId, hsaEligible },
    'Meal plan created',
  );

  return record;
}

async function listMealPlans(filters?: { status?: string }): Promise<MealPlanRecord[]> {
  return queries.listMealPlans(filters);
}

async function getMealPlan(id: string): Promise<MealPlanRecord> {
  const record = await queries.getMealPlanById(id);
  if (!record) throw new NotFoundError('Meal Plan');
  return record;
}

async function updateMealPlan(id: string, input: UpdateMealPlanInput): Promise<MealPlanRecord> {
  const plan = await queries.getMealPlanById(id);
  if (!plan) throw new NotFoundError('Meal Plan');

  if (plan.status === 'completed') {
    throw new ValidationError('Cannot modify a completed meal plan');
  }

  const updateData: Partial<MealPlanRecord> = {};
  if (input.status !== undefined) updateData.status = input.status;
  if (input.dietaryRestrictions !== undefined)
    updateData.dietaryRestrictions = input.dietaryRestrictions;
  if (input.allergens !== undefined) updateData.allergens = input.allergens;
  if (input.caloricTarget !== undefined) updateData.caloricTarget = input.caloricTarget;
  if (input.proteinTarget !== undefined) updateData.proteinTarget = input.proteinTarget;
  if (input.mealsPerDay !== undefined) updateData.mealsPerDay = input.mealsPerDay;
  if (input.mealsPerWeek !== undefined) updateData.mealsPerWeek = input.mealsPerWeek;
  if (input.deliveryDays !== undefined) updateData.deliveryDays = input.deliveryDays;
  if (input.endDate !== undefined) updateData.endDate = input.endDate;

  const updated = await queries.updateMealPlan(id, updateData);
  logger.info({ planId: id }, 'Meal plan updated');
  return updated;
}

// ── Meal Orders ──────────────────────────────────────────

async function createMealOrder(
  userId: string,
  input: CreateMealOrderInput,
): Promise<MealOrderRecord> {
  // Verify the meal plan exists and is active
  const plan = await queries.getMealPlanById(input.mealPlanId);
  if (!plan) throw new NotFoundError('Meal Plan');
  if (plan.status !== 'active' && plan.status !== 'draft') {
    throw new ValidationError('Meal plan must be active or draft to create orders');
  }

  const record = await queries.createMealOrder({
    mealPlanId: input.mealPlanId,
    careRecipientId: input.careRecipientId,
    meals: input.meals,
    specialInstructions: input.specialInstructions,
    preparedBy: input.preparedBy,
    preparerId: input.preparerId,
    preparerName: input.preparerName,
    deliveryDate: input.deliveryDate,
    deliveryWindow: input.deliveryWindow,
    totalCalories: input.totalCalories,
    totalProtein: input.totalProtein,
    cost: input.cost,
    hsaClaimable: plan.hsaEligible,
    timeBankHours: input.timeBankHours,
  });

  logger.info(
    { orderId: record.id, mealPlanId: input.mealPlanId, preparedBy: input.preparedBy },
    'Meal order created',
  );

  return record;
}

async function listMealOrders(filters?: {
  status?: string;
  deliveryDate?: string;
}): Promise<MealOrderRecord[]> {
  return queries.listMealOrders(filters);
}

async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput,
): Promise<MealOrderRecord> {
  const order = await queries.getMealOrderById(orderId);
  if (!order) throw new NotFoundError('Meal Order');

  if (order.deliveryStatus === 'cancelled') {
    throw new ValidationError('Cannot update a cancelled order');
  }
  if (order.deliveryStatus === 'delivered' && input.status !== 'cancelled') {
    throw new ValidationError('Order is already delivered');
  }

  const updateData: Partial<MealOrderRecord> = {
    deliveryStatus: input.status,
  };

  if (input.status === 'delivered') {
    updateData.deliveredAt = new Date().toISOString();

    // Increment the preparer's meal count
    if (order.preparedBy === 'neighbor') {
      const kitchen = await queries.getNeighborKitchenByNeighborId(order.preparerId);
      if (kitchen) {
        await queries.updateNeighborKitchen(kitchen.id, {
          totalMealsDelivered: kitchen.totalMealsDelivered + 1,
        });
      }
    }
  }

  const updated = await queries.updateMealOrder(orderId, updateData);
  logger.info({ orderId, status: input.status }, 'Meal order status updated');
  return updated;
}

async function rateOrder(
  orderId: string,
  userId: string,
  input: RateOrderInput,
): Promise<MealOrderRecord> {
  const order = await queries.getMealOrderById(orderId);
  if (!order) throw new NotFoundError('Meal Order');

  if (order.deliveryStatus !== 'delivered') {
    throw new ValidationError('Can only rate delivered orders');
  }
  if (order.rating !== null) {
    throw new ValidationError('Order has already been rated');
  }

  const updated = await queries.updateMealOrder(orderId, {
    rating: input.rating,
    ratingComment: input.comment ?? null,
  });

  // Update neighbor kitchen average rating
  if (order.preparedBy === 'neighbor') {
    const kitchen = await queries.getNeighborKitchenByNeighborId(order.preparerId);
    if (kitchen && kitchen.reviewCount >= 0) {
      const newReviewCount = kitchen.reviewCount + 1;
      const newAvgRating =
        (kitchen.averageRating * kitchen.reviewCount + input.rating) / newReviewCount;
      await queries.updateNeighborKitchen(kitchen.id, {
        averageRating: Math.round(newAvgRating * 100) / 100,
        reviewCount: newReviewCount,
      });
    }
  }

  logger.info({ orderId, rating: input.rating }, 'Meal order rated');
  return updated;
}

// ── Nutrition Assessment ─────────────────────────────────

async function runAssessment(
  userId: string,
  input: CreateAssessmentInput,
): Promise<NutritionAssessmentRecord> {
  const { totalScore, riskLevel } = scoreMnaSf(input);
  const { sarcfTotal, fallRiskElevated } = scoreSarcf(input);

  // If malnutrition + sarcopenia risk, fall risk is elevated
  const combinedFallRisk = fallRiskElevated || (riskLevel === 'malnourished' && sarcfTotal >= 4);

  const record = await queries.createNutritionAssessment({
    careRecipientId: input.careRecipientId,
    assessedBy: userId,
    weightLoss: input.weightLoss,
    mobilityLevel: input.mobilityLevel,
    psychologicalStress: input.psychologicalStress,
    neuropsychological: input.neuropsychological,
    bmi: input.bmi,
    calfCircumference: input.calfCircumference,
    totalScore,
    riskLevel,
    sarcfStrength: input.sarcfStrength,
    sarcfAssistWalking: input.sarcfAssistWalking,
    sarcfRiseFromChair: input.sarcfRiseFromChair,
    sarcfClimbStairs: input.sarcfClimbStairs,
    sarcfFalls: input.sarcfFalls,
    sarcfTotal,
    fallRiskElevated: combinedFallRisk,
  });

  logger.info(
    { assessmentId: record.id, careRecipientId: input.careRecipientId, riskLevel, sarcfTotal },
    'Nutrition assessment completed',
  );

  return record;
}

async function getLatestAssessment(careRecipientId: string): Promise<NutritionAssessmentRecord> {
  const record = await queries.getLatestNutritionAssessment(careRecipientId);
  if (!record) throw new NotFoundError('Nutrition Assessment');
  return record;
}

// ── Neighbor Kitchens ────────────────────────────────────

async function registerKitchen(
  userId: string,
  input: CreateNeighborKitchenInput,
): Promise<NeighborKitchenRecord> {
  // Check if user already has a kitchen
  const existing = await queries.getNeighborKitchenByNeighborId(userId);
  if (existing) {
    throw new ValidationError('User already has a registered kitchen');
  }

  const record = await queries.createNeighborKitchen({
    neighborId: userId,
    neighborName: input.neighborName,
    cottageFoodCertified: input.cottageFoodCertified,
    foodHandlerCertified: input.foodHandlerCertified,
    certificationExpiry: input.certificationExpiry,
    cuisineTypes: input.cuisineTypes,
    canPreparePureed: input.canPreparePureed,
    canPrepareHighProtein: input.canPrepareHighProtein,
    canPrepareDiabeticFriendly: input.canPrepareDiabeticFriendly,
    maxMealsPerDay: input.maxMealsPerDay,
    deliveryRadius: input.deliveryRadius,
    availableDays: input.availableDays,
  });

  logger.info({ kitchenId: record.id, neighborId: userId }, 'Neighbor kitchen registered');

  return record;
}

async function listKitchens(filters?: { status?: string }): Promise<NeighborKitchenRecord[]> {
  return queries.listNeighborKitchens(filters);
}

async function getKitchen(id: string): Promise<NeighborKitchenRecord> {
  const record = await queries.getNeighborKitchenById(id);
  if (!record) throw new NotFoundError('Neighbor Kitchen');
  return record;
}

async function updateKitchen(
  id: string,
  input: UpdateNeighborKitchenInput,
): Promise<NeighborKitchenRecord> {
  const kitchen = await queries.getNeighborKitchenById(id);
  if (!kitchen) throw new NotFoundError('Neighbor Kitchen');

  const updated = await queries.updateNeighborKitchen(id, input);
  logger.info({ kitchenId: id }, 'Neighbor kitchen updated');
  return updated;
}

async function approveKitchen(id: string): Promise<NeighborKitchenRecord> {
  const kitchen = await queries.getNeighborKitchenById(id);
  if (!kitchen) throw new NotFoundError('Neighbor Kitchen');

  if (kitchen.status !== 'pending_approval') {
    throw new ValidationError(`Cannot approve kitchen in status: ${kitchen.status}`);
  }

  const updated = await queries.updateNeighborKitchen(id, { status: 'active' });
  logger.info({ kitchenId: id }, 'Neighbor kitchen approved');
  return updated;
}

async function findMatchingKitchens(
  criteria: KitchenMatchCriteria,
): Promise<NeighborKitchenRecord[]> {
  const activeKitchens = await queries.listActiveNeighborKitchens();
  return matchKitchens(activeKitchens, criteria);
}

// ── Medicaid / Insurance Eligibility ─────────────────────

interface MtmEligibilityResult {
  careRecipientId: string;
  hsaFsaEligible: boolean;
  hsaQualifyingCodes: Array<{ code: string; description: string }>;
  eligiblePrograms: EligibleProgram[];
  assessmentSummary: {
    riskLevel: string;
    sarcfTotal: number;
    fallRiskElevated: boolean;
  } | null;
  recommendations: string[];
}

async function checkMtmEligibility(careRecipientId: string): Promise<MtmEligibilityResult> {
  // Get latest nutrition assessment if available
  const assessment = await queries.getLatestNutritionAssessment(careRecipientId);

  // Get active meal plans for ICD-10 codes
  const mealPlans = await queries.listMealPlansByCareRecipient(careRecipientId);
  const activePlan = mealPlans.find((p) => p.status === 'active');

  const icd10Codes = activePlan?.icd10Codes ?? [];
  const hasLmn = !!activePlan?.lmnId;

  // Determine HSA/FSA eligibility
  const hsaFsaEligible = hasLmn && icd10Codes.some((code) => code in HSA_QUALIFYING_ICD10);
  const hsaQualifyingCodes = icd10Codes
    .filter((code) => code in HSA_QUALIFYING_ICD10)
    .map((code) => ({ code, description: HSA_QUALIFYING_ICD10[code]! }));

  // Determine which public programs may apply
  const eligiblePrograms: EligibleProgram[] = [];

  // Everyone potentially qualifies for OAA if 60+
  eligiblePrograms.push(...MTM_PROGRAMS.filter((p) => p.program.includes('Older Americans Act')));

  // SNAP is broadly available
  eligiblePrograms.push(...MTM_PROGRAMS.filter((p) => p.program.includes('SNAP')));

  // If strong MTM indicators, add Medicaid HCBS and MA
  const hasStrongMtmIndication = icd10Codes.some((code) => STRONG_MTM_ICD10.has(code));
  if (hasStrongMtmIndication) {
    eligiblePrograms.push(
      ...MTM_PROGRAMS.filter(
        (p) => p.program.includes('Medicaid HCBS') || p.program.includes('Medicare Advantage'),
      ),
    );
  }

  // If complex care needs, add MLTSS
  if (assessment && (assessment.riskLevel === 'malnourished' || assessment.fallRiskElevated)) {
    eligiblePrograms.push(...MTM_PROGRAMS.filter((p) => p.program.includes('MLTSS')));
  }

  // Build recommendations
  const recommendations: string[] = [];

  if (assessment) {
    if (assessment.riskLevel === 'malnourished') {
      recommendations.push(
        'HIGH PRIORITY: Care recipient is malnourished. Initiate medically tailored meal plan with high-protein emphasis.',
      );
    } else if (assessment.riskLevel === 'at_risk') {
      recommendations.push(
        'MODERATE: Care recipient is at risk of malnutrition. Consider preventive nutrition intervention.',
      );
    }

    if (assessment.sarcfTotal >= 4) {
      recommendations.push(
        'SARCOPENIA RISK: SARC-F score indicates sarcopenia risk. Recommend high-protein meals (1.2-1.5g/kg/day) and fall prevention assessment.',
      );
    }

    if (assessment.fallRiskElevated) {
      recommendations.push(
        'ELEVATED FALL RISK: Combined malnutrition and sarcopenia indicators. Coordinate with care team for fall prevention.',
      );
    }
  } else {
    recommendations.push(
      'No nutrition assessment on file. Recommend completing MNA-SF + SARC-F screening.',
    );
  }

  if (!hasLmn && hasStrongMtmIndication) {
    recommendations.push(
      'Qualifying ICD-10 codes present but no Letter of Medical Necessity on file. Obtain LMN for HSA/FSA eligibility.',
    );
  }

  if (hsaFsaEligible) {
    recommendations.push(
      'Meals qualify as medically tailored under IRS Pub 502. Ensure EOB documentation for reimbursement.',
    );
  }

  return {
    careRecipientId,
    hsaFsaEligible,
    hsaQualifyingCodes,
    eligiblePrograms,
    assessmentSummary: assessment
      ? {
          riskLevel: assessment.riskLevel,
          sarcfTotal: assessment.sarcfTotal,
          fallRiskElevated: assessment.fallRiskElevated,
        }
      : null,
    recommendations,
  };
}

// ── Export ────────────────────────────────────────────────

export const nutritionService = {
  // Meal Plans
  createMealPlan,
  listMealPlans,
  getMealPlan,
  updateMealPlan,

  // Meal Orders
  createMealOrder,
  listMealOrders,
  updateOrderStatus,
  rateOrder,

  // Assessment
  runAssessment,
  getLatestAssessment,

  // Neighbor Kitchens
  registerKitchen,
  listKitchens,
  getKitchen,
  updateKitchen,
  approveKitchen,
  findMatchingKitchens,

  // Eligibility
  checkMtmEligibility,
};
