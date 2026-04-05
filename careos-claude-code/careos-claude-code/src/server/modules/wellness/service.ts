/**
 * Wellness Marketplace Service — Curated Products, Bundles, Recommendations
 *
 * Clinically-matched wellness products for elderly care recipients.
 * Products are scored by condition relevance, ease of use, and member ratings.
 * Connects to assessments (CRI, MNA-SF, SARC-F, CII) for personalized recommendations.
 */
import * as queries from '../../database/queries/index.js';
import { NotFoundError, ValidationError, ConflictError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type {
  WellnessProductRecord,
  CreateWellnessProductInput,
  WellnessBundleRecord,
  WellnessRecommendationRecord,
  RecommendedProduct,
  WellnessCategory,
} from '../../database/queries/wellness.js';

// ── ICD-10 → Intervention Mapping ───────────────────────

/** Maps ICD-10 codes to wellness intervention categories */
const ICD10_TO_INTERVENTION: Record<string, string[]> = {
  'R29.6': ['fall_prevention', 'mobility'],
  'M62.84': ['nutrition', 'fall_prevention', 'mobility'],
  E46: ['nutrition'],
  'E44.0': ['nutrition'],
  'E44.1': ['nutrition'],
  'R62.7': ['nutrition', 'fall_prevention'],
  'R13.10': ['nutrition'],
  'F03.90': ['cognitive', 'home_safety', 'fall_prevention'],
  'G30.9': ['cognitive', 'home_safety', 'fall_prevention'],
  'E11.9': ['nutrition', 'medication_management'],
  I10: ['nutrition', 'medication_management'],
  'I50.9': ['medication_management', 'telehealth'],
  'J44.1': ['medication_management', 'telehealth'],
  G20: ['mobility', 'fall_prevention', 'medication_management'],
  'Z73.0': ['mental_health', 'self_care'],
  'R26.89': ['mobility', 'fall_prevention'],
};

// ── Seed Data ────────────────────────────────────────────

interface SeedProduct extends CreateWellnessProductInput {
  /** internal key for idempotent seeding */
  _seedKey: string;
}

const SEED_PRODUCTS: SeedProduct[] = [
  // ── Fall Prevention ───────────────────────────────────
  {
    _seedKey: 'grab-bar-set',
    name: 'Bathroom Safety Grab Bar Set (3-Pack)',
    brand: 'SafeGrip',
    category: 'fall_prevention',
    description:
      'Stainless steel grab bars for bathroom installation. Includes toilet, shower, and tub bars with anti-slip grip surface. Supports up to 500 lbs.',
    conditions: ['R29.6', 'M62.84', 'R26.89', 'G20'],
    interventions: ['fall_prevention', 'mobility'],
    easeOfUse: 5 as const,
    setupComplexity: 'professional_install',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 40,
    priceMax: 80,
    pricingModel: 'one_time',
    hsaEligible: true,
    coopRating: 4.8,
    coopReview:
      'Essential for any bathroom used by an elderly person. Professional installation recommended — most handyman services can install in under an hour. The anti-slip grip surface is noticeably better than chrome alternatives.',
    tags: ['bathroom', 'essential', 'fall_prevention'],
    featured: true,
  },
  {
    _seedKey: 'non-slip-bath-mat',
    name: 'Non-Slip Bath Mat with Suction Cups',
    brand: 'AquaSafe',
    category: 'fall_prevention',
    description:
      'Extra-long bath mat with 200+ suction cups for maximum grip. Machine washable, antimicrobial, latex-free. Fits standard tubs and showers.',
    conditions: ['R29.6', 'R26.89'],
    interventions: ['fall_prevention'],
    easeOfUse: 5 as const,
    setupComplexity: 'none',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 15,
    priceMax: 30,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.5,
    coopReview:
      'Simple, effective, and inexpensive. Replace every 6-12 months as suction cups wear. Machine washable is a must — elderly skin is sensitive to mildew.',
    tags: ['bathroom', 'affordable', 'fall_prevention'],
  },
  {
    _seedKey: 'motion-sensor-night-lights',
    name: 'Motion-Sensor LED Night Light Set (6-Pack)',
    brand: 'LumiPath',
    category: 'fall_prevention',
    description:
      "Plug-in motion-sensor night lights with adjustable brightness. Warm amber light (won't disrupt sleep). Auto on/off with ambient light sensor.",
    conditions: ['R29.6', 'F03.90', 'G30.9'],
    interventions: ['fall_prevention', 'home_safety'],
    easeOfUse: 5 as const,
    setupComplexity: 'minimal',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 20,
    priceMax: 40,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.7,
    coopReview:
      "Place in hallways, bathroom, bedroom, and kitchen. The amber light is critical — blue/white light disrupts sleep and worsens sundowning. These are the best value we've tested.",
    tags: ['home_safety', 'affordable', 'fall_prevention', 'dementia_friendly'],
  },
  {
    _seedKey: 'medical-alert-system',
    name: 'Personal Emergency Response System (PERS)',
    brand: 'GuardianLink',
    category: 'medical_alert',
    description:
      'Wearable medical alert pendant with fall detection, GPS tracking, and 24/7 emergency response center. Waterproof. No smartphone required. Cellular connectivity included.',
    conditions: ['R29.6', 'M62.84', 'F03.90', 'G30.9', 'G20'],
    interventions: ['fall_prevention', 'emergency_response'],
    easeOfUse: 4 as const,
    setupComplexity: 'minimal',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 30,
    priceMax: 50,
    pricingModel: 'monthly',
    hsaEligible: true,
    coopRating: 4.6,
    coopReview:
      'The single most important safety device for elderly adults living alone or at fall risk. Automatic fall detection is essential for dementia patients who may not remember to press the button. HSA-eligible with an LMN.',
    tags: ['essential', 'fall_prevention', 'emergency', 'dementia_friendly'],
    featured: true,
  },

  // ── Sarcopenia / Nutrition ────────────────────────────
  {
    _seedKey: 'protein-shake',
    name: 'High-Protein Meal Replacement Shake (30-Day Supply)',
    brand: 'NourishPro',
    category: 'nutrition_supplement',
    description:
      'Complete meal replacement with 30g protein, 27 vitamins/minerals. Designed for elderly adults with sarcopenia risk. Easy-open packaging, no blender needed. Vanilla, chocolate, and strawberry.',
    conditions: ['M62.84', 'E46', 'E44.0', 'E44.1', 'R62.7'],
    interventions: ['nutrition'],
    easeOfUse: 5 as const,
    setupComplexity: 'none',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 30,
    priceMax: 60,
    pricingModel: 'monthly',
    hsaEligible: false,
    coopRating: 4.4,
    coopReview:
      'High protein content is critical for sarcopenia prevention (target 1.2-1.5g/kg/day). The easy-open packaging matters — arthritis makes standard containers difficult. Vanilla flavor has the best acceptance rate among elderly adults in our trials.',
    tags: ['nutrition', 'sarcopenia', 'protein'],
  },
  {
    _seedKey: 'resistance-bands',
    name: 'Seated Exercise Resistance Band Set for Seniors',
    brand: 'FlexFit Senior',
    category: 'exercise_program',
    description:
      'Color-coded resistance bands (extra-light to moderate) with large-print exercise guide. 12 chair-based exercises targeting sarcopenia. Includes door anchor and carrying bag.',
    conditions: ['M62.84', 'R29.6', 'R62.7'],
    interventions: ['mobility', 'fall_prevention', 'nutrition'],
    easeOfUse: 4 as const,
    setupComplexity: 'none',
    techRequired: 'none',
    cognitiveLoad: 'low',
    priceMin: 15,
    priceMax: 25,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.3,
    coopReview:
      'Combines well with protein supplementation for sarcopenia intervention. The large-print guide is essential. Start with the lightest band — progression matters more than intensity for elderly adults.',
    tags: ['exercise', 'sarcopenia', 'mobility', 'affordable'],
  },
  {
    _seedKey: 'digital-food-scale',
    name: 'Large-Display Digital Food Scale',
    brand: 'ClearView',
    category: 'nutrition_supplement',
    description:
      'Digital food scale with extra-large backlit display, tare function, and easy-clean surface. Measures in grams and ounces. Auto-off to save battery.',
    conditions: ['M62.84', 'E11.9', 'E46'],
    interventions: ['nutrition'],
    easeOfUse: 4 as const,
    setupComplexity: 'minimal',
    techRequired: 'none',
    cognitiveLoad: 'low',
    priceMin: 20,
    priceMax: 35,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.1,
    coopReview:
      'Helpful for protein tracking in sarcopenia management and carb counting for diabetic meal prep. The large display is non-negotiable for elderly users.',
    tags: ['nutrition', 'diabetes', 'tools'],
  },

  // ── Cognitive ─────────────────────────────────────────
  {
    _seedKey: 'large-print-puzzles',
    name: 'Large-Print Puzzle & Activity Book Set (4 Books)',
    brand: 'MindStay',
    category: 'cognitive_exercise',
    description:
      'Crosswords, word searches, Sudoku, and trivia — all in large print with high-contrast ink. Spiral-bound for flat lay. Designed by occupational therapists for mild-to-moderate cognitive decline.',
    conditions: ['F03.90', 'G30.9'],
    interventions: ['cognitive'],
    easeOfUse: 5 as const,
    setupComplexity: 'none',
    techRequired: 'none',
    cognitiveLoad: 'low',
    priceMin: 10,
    priceMax: 20,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.2,
    coopReview:
      'Low-tech cognitive stimulation that works. The spiral binding matters — standard book bindings are hard for arthritic hands. Good for shared activities between caregiver and care recipient.',
    tags: ['cognitive', 'affordable', 'no_tech', 'dementia_friendly'],
  },
  {
    _seedKey: 'cognitive-app',
    name: 'Digital Cognitive Exercise Subscription',
    brand: 'BrainFit',
    category: 'cognitive_exercise',
    description:
      'Clinically-validated brain training exercises adapted for older adults. Tracks progress over time. Available on tablet and smartphone with simplified interface.',
    conditions: ['F03.90', 'G30.9'],
    interventions: ['cognitive'],
    easeOfUse: 3 as const,
    setupComplexity: 'minimal',
    techRequired: 'smartphone',
    cognitiveLoad: 'moderate',
    priceMin: 10,
    priceMax: 15,
    pricingModel: 'monthly',
    hsaEligible: false,
    coopRating: 3.8,
    coopReview:
      'Effective for mild cognitive impairment but requires smartphone/tablet comfort. Not recommended for moderate-to-severe dementia. The caregiver should help with initial setup.',
    tags: ['cognitive', 'digital', 'subscription'],
    contraindications: ['severe_dementia'],
  },
  {
    _seedKey: 'reminder-clock',
    name: 'Day/Date Reminder Clock with Large Display',
    brand: 'ClearDay',
    category: 'cognitive_exercise',
    description:
      'Extra-large (8-inch) display showing day of week, date, time of day (morning/afternoon/evening), and custom reminders. No abbreviations. Auto-dimming for nighttime.',
    conditions: ['F03.90', 'G30.9'],
    interventions: ['cognitive', 'medication_management'],
    easeOfUse: 5 as const,
    setupComplexity: 'minimal',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 30,
    priceMax: 60,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.6,
    coopReview:
      'One of the most practical purchases for dementia care. Reduces "what day is it?" anxiety dramatically. The auto-dimming prevents the display from becoming a nighttime disturbance. Place in the most-used room.',
    tags: ['cognitive', 'dementia_friendly', 'essential', 'no_tech'],
    featured: true,
  },

  // ── Medication Management ─────────────────────────────
  {
    _seedKey: 'pill-organizer',
    name: 'Weekly Pill Organizer with AM/PM Compartments',
    brand: 'MedReady',
    category: 'medication_management',
    description:
      'Large-compartment weekly pill organizer with easy-open lids, braille labels, and color-coded days. BPA-free, dishwasher safe.',
    conditions: ['E11.9', 'I10', 'I50.9', 'G20'],
    interventions: ['medication_management'],
    easeOfUse: 5 as const,
    setupComplexity: 'none',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 8,
    priceMax: 15,
    pricingModel: 'one_time',
    hsaEligible: true,
    coopRating: 4.5,
    coopReview:
      'The most cost-effective medication management tool. Large compartments fit multiple pills. Color coding helps even with mild cognitive impairment. Replace annually — the lids loosen over time.',
    tags: ['medication', 'affordable', 'essential'],
  },
  {
    _seedKey: 'auto-pill-dispenser',
    name: 'Automatic Pill Dispenser with Alarms & Lock',
    brand: 'MedGuard',
    category: 'medication_management',
    description:
      'Locked automatic pill dispenser with audible/visual alarms at scheduled times. Holds 28 doses. Caregiver-controlled locking mechanism prevents double-dosing. Optional cellular alert to caregiver.',
    conditions: ['F03.90', 'G30.9', 'E11.9', 'G20'],
    interventions: ['medication_management'],
    easeOfUse: 3 as const,
    setupComplexity: 'moderate',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 50,
    priceMax: 90,
    pricingModel: 'monthly',
    hsaEligible: true,
    coopRating: 4.4,
    coopReview:
      'Essential for dementia patients or anyone managing 5+ medications. The locking mechanism prevents dangerous double-dosing. The cellular alert feature (add-on) gives caregivers peace of mind. Requires weekly refilling by caregiver.',
    tags: ['medication', 'dementia_friendly', 'safety'],
  },

  // ── Home Safety ───────────────────────────────────────
  {
    _seedKey: 'stove-shutoff',
    name: 'Automatic Stove Shut-Off Device',
    brand: 'StoveSafe',
    category: 'home_safety',
    description:
      'Motion-sensor stove monitor that automatically shuts off burners after a set time or when no motion is detected. Works with gas and electric stoves. Easy installation, no wiring required.',
    conditions: ['F03.90', 'G30.9'],
    interventions: ['home_safety'],
    easeOfUse: 4 as const,
    setupComplexity: 'professional_install',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 80,
    priceMax: 150,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.7,
    coopReview:
      'Kitchen fires are the #1 home fire cause for elderly adults. This device is non-negotiable for anyone with dementia who still cooks. Professional installation ensures proper calibration with your specific stove model.',
    tags: ['home_safety', 'dementia_friendly', 'essential', 'fire_prevention'],
    featured: true,
  },
  {
    _seedKey: 'door-window-alarms',
    name: 'Door & Window Alarm Sensor Set (4-Pack)',
    brand: 'WanderGuard Home',
    category: 'home_safety',
    description:
      'Wireless magnetic door/window sensors with adjustable volume alarm. Alerts when doors or windows are opened. Includes bypass button for caregivers. Battery-powered, no WiFi required.',
    conditions: ['F03.90', 'G30.9'],
    interventions: ['home_safety'],
    easeOfUse: 4 as const,
    setupComplexity: 'minimal',
    techRequired: 'none',
    cognitiveLoad: 'very_low',
    priceMin: 30,
    priceMax: 60,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.5,
    coopReview:
      'Critical for wandering prevention in dementia. Place on exterior doors and any door leading to stairs or dangerous areas. The bypass button lets caregivers move freely. Check batteries monthly.',
    tags: ['home_safety', 'dementia_friendly', 'wandering_prevention'],
  },

  // ── Caregiver Tools ───────────────────────────────────
  {
    _seedKey: 'care-journal',
    name: 'Daily Care Journal & Health Log',
    brand: 'CareTrack',
    category: 'caregiver_tool',
    description:
      'Structured daily care log with sections for medications, meals, mood, sleep, bowel movements, activities, and notes. 6-month supply. Includes emergency contact page and medication list.',
    conditions: [],
    interventions: ['care_coordination'],
    easeOfUse: 5 as const,
    setupComplexity: 'none',
    techRequired: 'none',
    cognitiveLoad: 'low',
    priceMin: 15,
    priceMax: 25,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.3,
    coopReview:
      'Invaluable for tracking patterns — especially medication side effects, sleep quality, and behavioral changes. When multiple caregivers are involved, the handoff notes section ensures continuity. Bring it to every doctor visit.',
    tags: ['caregiver', 'documentation', 'coordination'],
  },
  {
    _seedKey: 'indoor-camera',
    name: 'Indoor WiFi Camera with Two-Way Audio',
    brand: 'CareView',
    category: 'caregiver_tool',
    description:
      'HD indoor camera with two-way audio, motion alerts, night vision, and encrypted cloud storage. Privacy shutter for when not in use. HIPAA-aware design with encrypted streams.',
    conditions: ['F03.90', 'G30.9', 'R29.6'],
    interventions: ['monitoring', 'fall_prevention'],
    easeOfUse: 3 as const,
    setupComplexity: 'minimal',
    techRequired: 'wifi',
    cognitiveLoad: 'very_low',
    priceMin: 30,
    priceMax: 60,
    pricingModel: 'one_time',
    hsaEligible: false,
    coopRating: 4.0,
    coopReview:
      'Provides peace of mind for remote caregivers but requires a conversation about dignity and consent. The privacy shutter is important — close it during personal care. Two-way audio lets you check in without a phone call.',
    tags: ['monitoring', 'technology', 'remote_caregiving'],
  },
];

// ── Pre-seeded Bundles ──────────────────────────────────

interface SeedBundle {
  _seedKey: string;
  name: string;
  description: string;
  conditions: string[];
  productSeedKeys: Array<{ key: string; quantity: number; essential: boolean }>;
  totalPriceMin: number;
  totalPriceMax: number;
  hsaEligibleAmount: number;
  savings: number;
}

const SEED_BUNDLES: SeedBundle[] = [
  {
    _seedKey: 'fall-prevention-starter',
    name: 'Fall Prevention Starter Kit',
    description:
      'Essential fall prevention items for any home with an elderly adult. Includes bathroom safety, lighting, and emergency response.',
    conditions: ['R29.6', 'M62.84', 'R26.89'],
    productSeedKeys: [
      { key: 'grab-bar-set', quantity: 1, essential: true },
      { key: 'motion-sensor-night-lights', quantity: 1, essential: true },
      { key: 'non-slip-bath-mat', quantity: 1, essential: true },
      { key: 'medical-alert-system', quantity: 1, essential: true },
    ],
    totalPriceMin: 105,
    totalPriceMax: 200,
    hsaEligibleAmount: 80,
    savings: 20,
  },
  {
    _seedKey: 'dementia-home-safety',
    name: 'Dementia Home Safety Package',
    description:
      'Comprehensive home safety modifications for adults with dementia. Prevents wandering, kitchen fires, and nighttime falls.',
    conditions: ['F03.90', 'G30.9'],
    productSeedKeys: [
      { key: 'door-window-alarms', quantity: 1, essential: true },
      { key: 'stove-shutoff', quantity: 1, essential: true },
      { key: 'reminder-clock', quantity: 1, essential: true },
      { key: 'motion-sensor-night-lights', quantity: 1, essential: false },
    ],
    totalPriceMin: 160,
    totalPriceMax: 310,
    hsaEligibleAmount: 0,
    savings: 30,
  },
  {
    _seedKey: 'sarcopenia-recovery',
    name: 'Sarcopenia Recovery Bundle',
    description:
      'Nutritional and exercise support for elderly adults with muscle loss. Combines high-protein supplementation with safe resistance training.',
    conditions: ['M62.84', 'E46', 'R62.7'],
    productSeedKeys: [
      { key: 'protein-shake', quantity: 1, essential: true },
      { key: 'resistance-bands', quantity: 1, essential: true },
      { key: 'digital-food-scale', quantity: 1, essential: false },
    ],
    totalPriceMin: 65,
    totalPriceMax: 120,
    hsaEligibleAmount: 0,
    savings: 15,
  },
  {
    _seedKey: 'new-caregiver-essentials',
    name: 'New Caregiver Essentials',
    description:
      'Everything a new caregiver needs to get organized and keep their loved one safe from day one.',
    conditions: [],
    productSeedKeys: [
      { key: 'pill-organizer', quantity: 1, essential: true },
      { key: 'care-journal', quantity: 1, essential: true },
      { key: 'medical-alert-system', quantity: 1, essential: true },
      { key: 'motion-sensor-night-lights', quantity: 1, essential: false },
    ],
    totalPriceMin: 73,
    totalPriceMax: 130,
    hsaEligibleAmount: 45,
    savings: 15,
  },
];

// ── Seed Function ────────────────────────────────────────

async function seedDefaultProducts(): Promise<{ products: number; bundles: number }> {
  let productsCreated = 0;
  let bundlesCreated = 0;

  // Check if products already exist
  const existing = await queries.listWellnessProducts();
  if (existing.length > 0) {
    logger.info({ existingCount: existing.length }, 'Wellness products already seeded, skipping');
    return { products: 0, bundles: 0 };
  }

  // Seed products
  const seedKeyToId = new Map<string, string>();
  for (const seed of SEED_PRODUCTS) {
    const { _seedKey, ...productInput } = seed;
    const product = await queries.createWellnessProduct(productInput);
    seedKeyToId.set(_seedKey, product.id);
    productsCreated++;
  }

  // Seed bundles (resolving product IDs from seed keys)
  for (const seed of SEED_BUNDLES) {
    const products = seed.productSeedKeys
      .map((p) => {
        const productId = seedKeyToId.get(p.key);
        if (!productId) return null;
        return { productId, quantity: p.quantity, essential: p.essential };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    await queries.createWellnessBundle({
      name: seed.name,
      description: seed.description,
      conditions: seed.conditions,
      products,
      totalPriceMin: seed.totalPriceMin,
      totalPriceMax: seed.totalPriceMax,
      hsaEligibleAmount: seed.hsaEligibleAmount,
      savings: seed.savings,
    });
    bundlesCreated++;
  }

  logger.info({ productsCreated, bundlesCreated }, 'Wellness marketplace seeded');
  return { products: productsCreated, bundles: bundlesCreated };
}

// ── Products ─────────────────────────────────────────────

async function listProducts(filters?: {
  category?: string;
  intervention?: string;
  hsaEligible?: boolean;
  minEase?: number;
}): Promise<WellnessProductRecord[]> {
  return queries.listWellnessProducts(filters);
}

async function getProduct(id: string): Promise<WellnessProductRecord> {
  const product = await queries.getWellnessProductById(id);
  if (!product) throw new NotFoundError('Wellness Product');
  return product;
}

async function createProduct(input: CreateWellnessProductInput): Promise<WellnessProductRecord> {
  return queries.createWellnessProduct(input);
}

async function updateProduct(
  id: string,
  data: Partial<WellnessProductRecord>,
): Promise<WellnessProductRecord> {
  const product = await queries.getWellnessProductById(id);
  if (!product) throw new NotFoundError('Wellness Product');
  return queries.updateWellnessProduct(id, data);
}

// ── Reviews ──────────────────────────────────────────────

async function addReview(
  productId: string,
  userId: string,
  input: { rating: number; comment: string },
): Promise<queries.WellnessReviewRecord> {
  const product = await queries.getWellnessProductById(productId);
  if (!product) throw new NotFoundError('Wellness Product');

  if (input.rating < 1 || input.rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }

  // Check for existing review
  const existing = await queries.getExistingReview(productId, userId);
  if (existing) {
    throw new ConflictError('You have already reviewed this product');
  }

  const review = await queries.createWellnessReview({
    productId,
    userId,
    rating: input.rating,
    comment: input.comment,
  });

  // Update product averages
  const newCount = product.memberReviewCount + 1;
  const newAvg = (product.memberAvgRating * product.memberReviewCount + input.rating) / newCount;
  await queries.updateWellnessProduct(productId, {
    memberReviewCount: newCount,
    memberAvgRating: Math.round(newAvg * 100) / 100,
  });

  logger.info({ productId, userId, rating: input.rating }, 'Wellness product reviewed');
  return review;
}

// ── Bundles ──────────────────────────────────────────────

async function listBundles(): Promise<WellnessBundleRecord[]> {
  return queries.listWellnessBundles({ active: true });
}

async function getBundle(id: string): Promise<WellnessBundleRecord> {
  const bundle = await queries.getWellnessBundleById(id);
  if (!bundle) throw new NotFoundError('Wellness Bundle');
  return bundle;
}

// ── Recommendations ─────────────────────────────────────

async function listRecommendations(userId: string): Promise<WellnessRecommendationRecord[]> {
  return queries.listWellnessRecommendationsByUser(userId);
}

/**
 * Generate personalized wellness product recommendations for a care recipient.
 *
 * 1. Look up care recipient's conditions (from LMN diagnosis codes)
 * 2. Check assessment scores (nutrition for sarcopenia, CII for burnout)
 * 3. Match products by condition ICD-10 codes
 * 4. Filter out contraindicated products
 * 5. Score by relevance (condition match * ease of use * member rating)
 * 6. Group into priority tiers: essential, recommended, nice_to_have
 * 7. Return top 10 with personalized reasons
 */
async function generateRecommendations(
  userId: string,
  careRecipientId: string,
): Promise<WellnessRecommendationRecord> {
  // Collect conditions from various sources
  const conditions: string[] = [];
  const triggerDetails: string[] = [];

  // 1. Check nutrition assessment (MNA-SF + SARC-F)
  let nutritionAssessment: queries.NutritionAssessmentRecord | null = null;
  try {
    nutritionAssessment = await queries.getLatestNutritionAssessment(careRecipientId);
  } catch {
    // No assessment on file — that's okay
  }

  if (nutritionAssessment) {
    if (nutritionAssessment.riskLevel === 'malnourished') {
      conditions.push('E46', 'E44.0');
      triggerDetails.push(`MNA-SF: malnourished (score ${nutritionAssessment.totalScore}/14)`);
    } else if (nutritionAssessment.riskLevel === 'at_risk') {
      conditions.push('E44.1');
      triggerDetails.push(`MNA-SF: at risk (score ${nutritionAssessment.totalScore}/14)`);
    }
    if (nutritionAssessment.sarcfTotal >= 4) {
      conditions.push('M62.84');
      triggerDetails.push(`SARC-F: sarcopenia risk (score ${nutritionAssessment.sarcfTotal}/10)`);
    }
    if (nutritionAssessment.fallRiskElevated) {
      conditions.push('R29.6');
      triggerDetails.push('Fall risk elevated (nutrition + sarcopenia combined)');
    }
  }

  // 2. Check meal plans for additional ICD-10 codes
  try {
    const mealPlans = await queries.listMealPlansByCareRecipient(careRecipientId);
    const activePlan = mealPlans.find((p) => p.status === 'active');
    if (activePlan?.icd10Codes) {
      for (const code of activePlan.icd10Codes) {
        if (!conditions.includes(code)) {
          conditions.push(code);
        }
      }
      triggerDetails.push(`Active meal plan with ICD-10: ${activePlan.icd10Codes.join(', ')}`);
    }
  } catch {
    // No meal plans — continue
  }

  // If no conditions found, provide general recommendations
  if (conditions.length === 0) {
    conditions.push('R29.6'); // Default: fall prevention is always relevant for elderly
    triggerDetails.push('General elderly care — fall prevention baseline');
  }

  // 3. Find matching products
  const matchingProducts = await queries.listWellnessProductsByConditions(conditions);

  // 4. Derive interventions from conditions
  const interventions = new Set<string>();
  for (const code of conditions) {
    const mapped = ICD10_TO_INTERVENTION[code];
    if (mapped) {
      for (const intervention of mapped) {
        interventions.add(intervention);
      }
    }
  }

  // Also get products by intervention for broader matching
  const interventionProducts = await queries.listWellnessProductsByInterventions([
    ...interventions,
  ]);

  // Merge and deduplicate
  const allProducts = new Map<string, WellnessProductRecord>();
  for (const p of matchingProducts) {
    allProducts.set(p.id, p);
  }
  for (const p of interventionProducts) {
    allProducts.set(p.id, p);
  }

  // 5. Score and rank
  const scoredProducts: RecommendedProduct[] = [];

  for (const product of allProducts.values()) {
    // Check contraindications
    if (product.contraindications.length > 0) {
      const contraindicated = product.contraindications.some((c) =>
        conditions.some((cond) => cond.toLowerCase().includes(c.toLowerCase())),
      );
      if (contraindicated) continue;
    }

    // Score: condition match strength (0-40) + ease of use (0-25) + coop rating (0-20) + member rating (0-15)
    const conditionMatchCount = product.conditions.filter((c) => conditions.includes(c)).length;
    const conditionScore = Math.min(conditionMatchCount * 15, 40);
    const easeScore = product.easeOfUse * 5;
    const coopScore = product.coopRating * 4;
    const memberScore = product.memberReviewCount > 0 ? product.memberAvgRating * 3 : 10; // Default 10 for unreviewed

    const relevanceScore = Math.min(
      Math.round(conditionScore + easeScore + coopScore + memberScore),
      100,
    );

    // Determine priority tier
    let priority: 'essential' | 'recommended' | 'nice_to_have';
    if (conditionMatchCount >= 2 || product.featured) {
      priority = 'essential';
    } else if (conditionMatchCount >= 1) {
      priority = 'recommended';
    } else {
      priority = 'nice_to_have';
    }

    // Generate personalized reason
    const reason = generateProductReason(product, conditions, nutritionAssessment);

    scoredProducts.push({
      productId: product.id,
      relevanceScore,
      reason,
      priority,
    });
  }

  // Sort by relevance score, then by priority
  const priorityOrder = { essential: 0, recommended: 1, nice_to_have: 2 };
  scoredProducts.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.relevanceScore - a.relevanceScore;
  });

  // Take top 10
  const topProducts = scoredProducts.slice(0, 10);

  // Store recommendation
  const recommendation = await queries.createWellnessRecommendation({
    userId,
    careRecipientId,
    triggerType: triggerDetails.length > 1 ? 'assessment' : 'condition',
    triggerDetails: triggerDetails.join('; '),
    products: topProducts,
  });

  logger.info(
    { userId, careRecipientId, productCount: topProducts.length, conditions },
    'Wellness recommendations generated',
  );

  return recommendation;
}

/** Generate a human-readable reason for why a product is recommended */
function generateProductReason(
  product: WellnessProductRecord,
  conditions: string[],
  nutritionAssessment: queries.NutritionAssessmentRecord | null,
): string {
  const reasons: string[] = [];

  // Condition-specific reasons
  if (product.conditions.includes('M62.84') && conditions.includes('M62.84')) {
    const sarcfNote = nutritionAssessment
      ? ` (SARC-F score: ${nutritionAssessment.sarcfTotal}/10)`
      : '';
    reasons.push(`Addresses sarcopenia risk${sarcfNote}`);
  }
  if (product.conditions.includes('R29.6') && conditions.includes('R29.6')) {
    reasons.push('Reduces fall risk');
  }
  if (
    (product.conditions.includes('F03.90') || product.conditions.includes('G30.9')) &&
    (conditions.includes('F03.90') || conditions.includes('G30.9'))
  ) {
    reasons.push('Designed for dementia care');
  }
  if (product.conditions.includes('E46') && conditions.includes('E46')) {
    const mnaNote = nutritionAssessment
      ? ` (MNA-SF score: ${nutritionAssessment.totalScore}/14)`
      : '';
    reasons.push(`Supports nutrition recovery${mnaNote}`);
  }

  if (reasons.length === 0) {
    reasons.push(`Supports ${product.interventions.join(', ').replace(/_/g, ' ')}`);
  }

  if (product.hsaEligible) {
    reasons.push('HSA/FSA eligible with LMN');
  }

  return reasons.join('. ') + '.';
}

// ── Recommendation Tracking ─────────────────────────────

async function trackClick(
  recommendationId: string,
  productId: string,
): Promise<WellnessRecommendationRecord> {
  const rec = await queries.getWellnessRecommendationById(recommendationId);
  if (!rec) throw new NotFoundError('Wellness Recommendation');

  const clicked = [...rec.productsClicked];
  if (!clicked.includes(productId)) {
    clicked.push(productId);
  }

  return queries.updateWellnessRecommendation(recommendationId, {
    productsClicked: clicked,
    viewedAt: rec.viewedAt ?? new Date().toISOString(),
  });
}

async function dismissRecommendation(
  recommendationId: string,
): Promise<WellnessRecommendationRecord> {
  const rec = await queries.getWellnessRecommendationById(recommendationId);
  if (!rec) throw new NotFoundError('Wellness Recommendation');

  return queries.updateWellnessRecommendation(recommendationId, { dismissed: true });
}

// ── Export ────────────────────────────────────────────────

export const wellnessService = {
  // Seeding
  seedDefaultProducts,

  // Products
  listProducts,
  getProduct,
  createProduct,
  updateProduct,

  // Reviews
  addReview,

  // Bundles
  listBundles,
  getBundle,

  // Recommendations
  listRecommendations,
  generateRecommendations,
  trackClick,
  dismissRecommendation,
};

// Re-export types for routes
export type { WellnessCategory };
