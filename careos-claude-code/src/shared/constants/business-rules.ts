/**
 * CareOS Business Rules — Immutable Constants
 * These values are specified in the PRD and must not be changed.
 */

// ============================================================
// CII (Caregiver Intensity Index)
// ============================================================

export const CII_DIMENSIONS = [
  'Physical Care Demands',
  'Cognitive Supervision',
  'Emotional Labor',
  'Financial Management',
  'Medical Coordination',
  'Transportation',
  'Household Management',
  'Social Isolation Impact',
  'Sleep Disruption',
  'Work Impact',
  'Physical Health Impact',
  'Financial Strain',
] as const;

export const CII_DIMENSION_COUNT = 12;
export const CII_MIN_PER_DIMENSION = 1;
export const CII_MAX_PER_DIMENSION = 10;
export const CII_MAX_SCORE = 120;

export const CII_ZONES = {
  GREEN: { label: 'Green', min: 0, max: 40, color: '#4CAF50' },
  YELLOW: { label: 'Yellow', min: 41, max: 79, color: '#FFC107' },
  RED: { label: 'Red', min: 80, max: 120, color: '#F44336' },
} as const;

export type CIIZone = 'GREEN' | 'YELLOW' | 'RED';

export function classifyCIIZone(score: number): CIIZone {
  if (score <= 40) return 'GREEN';
  if (score <= 79) return 'YELLOW';
  return 'RED';
}

// ============================================================
// MINI CII (Quick Check — 3 sliders, 30 seconds)
// ============================================================

export const MINI_CII_DIMENSIONS = [
  'Physical Care Demands',
  'Sleep Disruption',
  'Social Isolation Impact',
] as const;

export const MINI_CII_MAX_SCORE = 30;

export const MINI_CII_ZONES = {
  GREEN: { label: 'Green', min: 0, max: 11, color: '#4CAF50' },
  YELLOW: { label: 'Yellow', min: 12, max: 20, color: '#FFC107' },
  RED: { label: 'Red', min: 21, max: 30, color: '#F44336' },
} as const;

export function classifyMiniCIIZone(score: number): CIIZone {
  if (score <= 11) return 'GREEN';
  if (score <= 20) return 'YELLOW';
  return 'RED';
}

// ============================================================
// CRI (Care Readiness Index)
// ============================================================

export const CRI_FACTOR_COUNT = 14;
export const CRI_MIN_RAW = 14.4;
export const CRI_MAX_RAW = 72.0;

// ============================================================
// KBS (Knowledge-Behavior-Status Outcome Scale)
// ============================================================

export const KBS_MIN = 1;
export const KBS_MAX = 5;
export const KBS_REASSESSMENT_DAYS = [30, 60, 90] as const;
export const KBS_ONGOING_INTERVAL_DAYS = 90;

// ============================================================
// TIME BANK
// ============================================================

export const TIME_BANK = {
  MEMBERSHIP_FLOOR_HOURS: 40,
  MEMBERSHIP_ANNUAL_COST_CENTS: 10000, // $100
  CASH_RATE_CENTS_PER_HOUR: 1500, // $15/hr
  CASH_COORDINATION_SPLIT_CENTS: 1200, // $12
  CASH_RESPITE_SPLIT_CENTS: 300, // $3
  RESPITE_DEFAULT_MEMBER_RATIO: 0.9,
  RESPITE_DEFAULT_FUND_RATIO: 0.1,
  DEFICIT_MAX_HOURS: -20,
  DEFICIT_NUDGE_THRESHOLDS: [-5, -10, -15, -20] as const,
  EXPIRY_MONTHS: 12,
  EXPIRY_WARNING_DAYS: 30,
  GPS_VERIFICATION_MILES: 0.25,
  STREAK_MILESTONES_WEEKS: [4, 8, 12, 26, 52] as const,
  REFERRAL_BONUS_HOURS: 5, // each party
  TRAINING_BONUS_HOURS: 5, // per module
  BURNOUT_THRESHOLD_HOURS_PER_WEEK: 10,
  RESPITE_EMERGENCY_MAX_HOURS: 48,
  RESPITE_AUTO_APPROVE_THRESHOLD_HOURS: 100,
  CREDIT_ROUNDING_INCREMENT: 0.25,
} as const;

// Matching weights
export const MATCHING_WEIGHTS = {
  IDENTITY_MATCH_MULTIPLIER: 2,
  PROXIMITY_TIERS: [
    { maxMiles: 0.5, multiplier: 3, label: 'Very Close' },
    { maxMiles: 1.0, multiplier: 2, label: 'Close' },
    { maxMiles: 2.0, multiplier: 1, label: 'Nearby' },
    { maxMiles: Infinity, multiplier: 0, label: 'Remote Only' },
  ],
} as const;

// Task types
export const TASK_TYPES = [
  'meals', 'rides', 'companionship', 'phone_companionship',
  'tech_support', 'yard_work', 'housekeeping', 'grocery_run',
  'errands', 'pet_care', 'admin_help', 'teaching',
] as const;

export type TaskType = typeof TASK_TYPES[number];

export const REMOTE_TASK_TYPES: TaskType[] = ['phone_companionship', 'tech_support', 'admin_help'];
export const IN_PERSON_TASK_TYPES: TaskType[] = ['meals', 'rides', 'companionship', 'yard_work', 'housekeeping', 'grocery_run', 'errands', 'pet_care', 'teaching'];

// ============================================================
// COMFORT CARD PAYMENT SOURCES
// ============================================================

export const PAYMENT_SOURCES = [
  'hsa_fsa',
  'employer_pepm',
  'ltci_reimbursement',
  'pace_subcap',
  'timebank_credit',
  'private_pay',
] as const;

export type PaymentSource = typeof PAYMENT_SOURCES[number];

// ============================================================
// ROLES
// ============================================================

export const USER_ROLES = [
  'conductor',
  'worker_owner',
  'timebank_member',
  'medical_director',
  'admin',
  'employer_hr',
  'wellness_provider',
] as const;

export type UserRole = typeof USER_ROLES[number];

export const ROLES_REQUIRING_2FA: UserRole[] = ['medical_director', 'admin'];
export const ROLES_WITH_PHI_ACCESS: UserRole[] = ['conductor', 'worker_owner', 'medical_director', 'admin'];

// ============================================================
// CONDUCTOR CERTIFICATION MODULES
// ============================================================

export const CERTIFICATION_MODULES = [
  { id: 'safe_transfers', name: 'Safe Transfers', hours: 2, priceCents: 15000 },
  { id: 'bathing', name: 'Bathing Technique', hours: 2, priceCents: 15000 },
  { id: 'medication', name: 'Medication Management', hours: 3, priceCents: 20000 },
  { id: 'dementia', name: 'Dementia Communication', hours: 4, priceCents: 25000 },
  { id: 'fall_prevention', name: 'Fall Prevention', hours: 2, priceCents: 15000 },
  { id: 'emergency', name: 'Emergency Response', hours: 2, priceCents: 15000 },
  { id: 'comprehensive', name: 'Comprehensive', hours: 8, priceCents: 75000 },
] as const;

// ============================================================
// FINANCIAL PROJECTIONS (Reference Only)
// ============================================================

export const FINANCIALS = {
  EMPLOYER_PEPM_CENTS: 450, // $4.50/employee/month
  BVSD_TEACHERS: 1717,
  TRU_PACE_ENROLLEES: 341,
  PACE_MONTHLY_RECEIVED_CENTS: 260000, // $2,600/mo
  PACE_MONTHLY_DELIVERY_CENTS: 180000, // $1,800/mo
  BCH_READMISSION_RATE: 0.154,
  BCH_READMISSION_COST_CENTS: 1603700, // $16,037
  PRIVATE_PAY_RATE_CENTS_PER_HOUR: 3500, // $35/hr
  WORKER_OWNER_WAGE_MIN_CENTS: 2500, // $25/hr
  WORKER_OWNER_WAGE_MAX_CENTS: 2800, // $28/hr
  WORKER_EQUITY_5YR_CENTS: 5200000, // ~$52K
} as const;

// ============================================================
// SLA TARGETS
// ============================================================

export const SLA = {
  TIME_BANK_MATCH_HOURS: 4,
  RESPITE_DISPATCH_HOURS: 4,
  MD_CRI_REVIEW_HOURS: 24,
  CARE_TEAM_ASSEMBLY_HOURS: 48,
  ONBOARDING_MINUTES: 10,
  MINI_CII_SECONDS: 30,
  API_READ_P95_MS: 200,
  API_WRITE_P95_MS: 500,
  PAGE_LOAD_SECONDS: 2,
  WEBSOCKET_LATENCY_MS: 100,
  MATCH_NOTIFICATION_SECONDS: 30,
} as const;
