/**
 * CareOS Business Rules — Immutable Constants
 * These values are specified in the PRD and must not be changed.
 *
 * co-op.care = Community Care Utility
 * NOT a startup. NOT an agency. A worker-owned utility that replaces
 * 40-60% private equity extraction with $25-28/hr caregiver wages,
 * equity, benefits, and 36% family cost reduction through physician-led
 * clinical oversight and tax optimization.
 */

// ============================================================
// BRAND POSITIONING
// ============================================================

export const BRAND = {
  // ── Identity ──────────────────────────────────────────────
  /** The brand name as displayed to users */
  NAME: 'co-op.care' as const,
  /** Capitalized for titles and headings */
  NAME_TITLE: 'Co-op.care' as const,
  /** Legal entity name */
  LEGAL_NAME: 'co-op.care Limited Cooperative Association' as const,
  /** Platform product name */
  PLATFORM: 'CareOS' as const,
  /** Tagline */
  TAGLINE: 'Community Care, Cooperatively Owned' as const,
  /** Marketing URL */
  URL: 'https://co-op.care' as const,
  /** Support contact */
  SUPPORT_EMAIL: 'support@co-op.care' as const,
  /** Location */
  LOCATION: 'Boulder, CO' as const,

  // ── Positioning ───────────────────────────────────────────
  /** Core positioning — utility, not startup */
  MODEL: 'Community Care Utility' as const,
  /** Agentic evolution — CareOS is not a dashboard, it's a coordination utility */
  AGENTIC_MODEL: 'Multi-Agent Coordination Utility' as const,
  /** One-line pitch */
  PITCH:
    'Worker-owned companion care that replaces 40-60% private equity extraction with caregiver dignity and family savings',
  /** Industry benchmark: national average caregiver wage */
  INDUSTRY_AVG_WAGE_CENTS_PER_HOUR: 1677, // $16.77/hr (BLS)
  /** co-op.care target wage range */
  COOP_WAGE_RANGE_CENTS: { min: 2500, max: 2800 }, // $25-28/hr
  /** Industry benchmark: annual family cost */
  INDUSTRY_AVG_ANNUAL_FAMILY_COST_CENTS: 4500000, // $45,000+
  /** co-op.care family cost reduction through clinical oversight + tax optimization */
  FAMILY_COST_REDUCTION_PERCENT: 36,
  /** Industry benchmark: PE agency extraction rate */
  PE_EXTRACTION_PERCENT: { min: 40, max: 60 },
  /** Industry benchmark: national caregiver turnover */
  INDUSTRY_TURNOVER_PERCENT: 77,
  /** co-op.care projected turnover (structural advantage from ownership + benefits) */
  COOP_PROJECTED_TURNOVER_PERCENT: 15,
  /**
   * Agentic Return Ratio:
   * With AI agents automating scheduling, billing, compliance, and payroll,
   * co-op.care targets returning ~80% of family payment directly to the
   * caregiver as wages + equity. PE agencies return only 40-60%.
   * The 1:10 leverage ratio means 1 person + agents does the work of 10.
   */
  CAREGIVER_RETURN_RATIO_PERCENT: 80,
  /** Three pillars of the architecture */
  THREE_PILLARS: [
    'Colorado LCA — multi-stakeholder cooperative ownership',
    'Opolis Employment Commons — sovereign back-office infrastructure',
    'Agentic CareOS — physician-led clinical excellence via AI agents',
  ] as const,
  /** The thesis */
  THESIS: 'The neighborhood itself is a clinical asset. Human capital that fights private equity.',
  /** The paradigm shift */
  PARADIGM_SHIFT: {
    from: 'User pull — passive dashboard that families must check and initiate',
    to: 'Agentic push — system delivers outcomes proactively (drafts respite requests, flags risks, generates billing)',
  },
} as const;

// ============================================================
// AGENTIC MEMORY — Context as Competitive Moat
// ============================================================
// PE agencies treat caregiving as commodity labor → 77% turnover.
// Every churned caregiver = total loss of patient-specific knowledge.
// co-op.care's structural advantage (ownership + Cigna PPO + equity)
// targets 15% turnover, which means Agentic Memory COMPOUNDS:
//   - Patient routines, preferences, emotional triggers
//   - Medication reactions and timing sensitivities
//   - Family communication patterns and decision-making styles
//   - Neighborhood resource knowledge (which pharmacy, which park)
//
// This is an insurmountable moat: a competitor with 77% turnover
// can never accumulate this context. Switching away from co-op.care
// means losing years of captured care intelligence.

export const AGENTIC_MEMORY = {
  /** What gets captured over time */
  KNOWLEDGE_CATEGORIES: [
    'Patient daily routines and preferences',
    'Medication reactions and timing sensitivities',
    'Emotional triggers and de-escalation strategies',
    'Family communication patterns and decision styles',
    'Neighborhood resources (pharmacy, park, clinic, neighbor network)',
    'Care technique effectiveness (what works for THIS patient)',
    'Omaha System coded observation history',
    'CII trend data and burnout predictors',
  ] as const,
  /** Why this is a moat */
  MOAT_MECHANISM:
    'Low turnover (15% vs 77%) means Agentic Memory compounds over months and years. Competitors with high turnover restart from zero with every caregiver change.',
  /** Switching cost for families */
  SWITCHING_COST:
    'Leaving co-op.care means losing the accumulated Agentic Memory that understands the patient. No competitor can replicate years of captured care context.',
  /** How memory is built */
  CAPTURE_MECHANISM:
    'NLP pipeline converts ambient voice notes into Omaha-coded structured data → patient knowledge base grows with every visit',
  /** Privacy constraint */
  PRIVACY:
    'All memory is PHI — stored in local cooperative Aidbox tenant, never shared cross-cooperative, never in Technologies LLC',
} as const;

// ============================================================
// CARE TIERS — Engagement-to-Equity Pipeline
// ============================================================
// Three tiers of community recognition based on Care Hours:
//   Seedling (0-39 hrs)  → New growth, learning the co-op
//   Rooted (40-119 hrs)  → Deep roots, voting + equity eligible
//   Canopy (120+ hrs)    → Sheltering the community, full governance

export const CARE_TIERS = {
  /** Rolling window for tier calculation */
  WINDOW_MONTHS: 12,
  /** Tier evaluation frequency */
  EVALUATION_CADENCE: 'quarterly' as const,
  /** Hours that grant advance notice before tier downgrade */
  MAINTENANCE_WARNING_HOURS: 5,
  /** Tiers */
  SEEDLING: { minHours: 0, maxHours: 39, multiplier: 1.0, expiryMonths: 12, referralBonus: 5 },
  ROOTED: { minHours: 40, maxHours: 119, multiplier: 1.25, expiryMonths: 18, referralBonus: 7 },
  CANOPY: { minHours: 120, maxHours: null, multiplier: 1.5, expiryMonths: null, referralBonus: 10 },
  /** Value equivalents for tier marketing */
  MARKET_RATE_PER_HOUR_CENTS: 3500, // $35/hr — matches pitch deck W-2 rate
} as const;

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
  'meals',
  'rides',
  'companionship',
  'phone_companionship',
  'tech_support',
  'yard_work',
  'housekeeping',
  'grocery_run',
  'errands',
  'pet_care',
  'admin_help',
  'teaching',
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const REMOTE_TASK_TYPES: TaskType[] = ['phone_companionship', 'tech_support', 'admin_help'];
export const IN_PERSON_TASK_TYPES: TaskType[] = [
  'meals',
  'rides',
  'companionship',
  'yard_work',
  'housekeeping',
  'grocery_run',
  'errands',
  'pet_care',
  'teaching',
];

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

export type PaymentSource = (typeof PAYMENT_SOURCES)[number];

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

export type UserRole = (typeof USER_ROLES)[number];

export const ROLES_REQUIRING_2FA: UserRole[] = ['medical_director', 'admin'];
export const ROLES_WITH_PHI_ACCESS: UserRole[] = [
  'conductor',
  'worker_owner',
  'medical_director',
  'admin',
];

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
  /** CII/CRI assessments as standalone revenue */
  ASSESSMENT_FEE_RANGE_CENTS: { min: 15000, max: 30000 }, // $150-300 per assessment
} as const;

// ============================================================
// REVENUE STACK — Phased Rollout
// ============================================================
// Single clinical event → stacked revenue streams.
// Ordered by implementation phase.

export const REVENUE_STACK_PHASES = [
  {
    layer: 1,
    name: 'Assessments',
    mechanism: 'CII/CRI assessments ($150-300 each)',
    phase: 'Phase 1 (Week 3)',
    prerequisite: 'None — can sell assessments immediately',
  },
  {
    layer: 2,
    name: 'Placement Bridge',
    mechanism: '1099 matching fees during Class B licensing period',
    phase: 'Phase 2 (Weeks 3-12)',
    prerequisite: 'Placement Agency registration ($870)',
  },
  {
    layer: 3,
    name: 'Home Care',
    mechanism: '$35/hr blended rate (companion + personal care)',
    phase: 'Phase 3 (Months 4-5)',
    prerequisite: 'CDPHE Class B license + Opolis W-2 transition',
  },
  {
    layer: 4,
    name: 'PIN/CHI Billing',
    mechanism: 'Medicare PIN (G0023/G0024) + CHI (G0019/G0022) — $85-120/month/patient',
    phase: 'Phase 3 (Months 4-5)',
    prerequisite: 'CMS-855B Medicare enrollment + Clinical Director (Dr. Emdur)',
  },
  {
    layer: 5,
    name: 'CMS ACCESS',
    mechanism: 'Outcome-Aligned Payments (OAP) + 50% withhold vs outcomes',
    phase: 'Phase 5 (2027)',
    prerequisite: 'ACCESS Model eCKM application + demonstrated outcomes',
  },
  {
    layer: 6,
    name: 'PACE Sub-Capitation',
    mechanism: 'TRU PACE companion care subcontract',
    phase: 'Phase 5 (2027)',
    prerequisite: 'TRU PACE partnership + demonstrated care delivery capacity',
  },
] as const;

// ============================================================
// CLINICAL GOVERNANCE
// ============================================================

export const CLINICAL_GOVERNANCE = {
  /** Physician Clinical Director */
  CLINICAL_DIRECTOR: {
    name: 'Josh Emdur, DO',
    role: 'Physician Clinical Director',
    credentials: 'BCH hospitalist, all 50 state licenses',
    responsibilities: [
      'Sign LMNs for HSA/FSA eligibility',
      'Supervise PIN (G0023/G0024) billing (incident-to)',
      'Review CRI assessments within 24 hours',
      'Oversee NLP pipeline human review stage',
      'Colorado AI Act compliance oversight',
    ],
  },
  /** Medicare enrollment requirements */
  MEDICARE_ENROLLMENT: {
    form: 'CMS-855B',
    requiredFor: [
      'PIN (G0023/G0024)',
      'CHI (G0019/G0022)',
      'CCM (99490/99491)',
      'RPM (99453-99470)',
    ],
    estimatedTimeline: 'Weeks 4-12 (90-day processing)',
    prerequisite: 'CDPHE Class B license',
  },
  /** State licensing */
  STATE_LICENSE: {
    authority: 'CDPHE (Colorado Department of Public Health and Environment)',
    classB: 'Companion care + personal care (non-medical)',
    classA: 'Skilled nursing + medical care (future)',
    currentTarget: 'class_b' as const,
  },
} as const;

// ============================================================
// INSTITUTIONAL PARTNERSHIPS
// ============================================================

export const PARTNERSHIPS = {
  /** Boulder Community Health — Safe Graduation pilot */
  BCH: {
    name: 'Boulder Community Health',
    pilot: 'Safe Graduation — 72-hour post-discharge companion care',
    monthlyCapacity: 10,
    keyContacts: ['Grant Besser (BCH Foundation)'],
    integration: 'HL7 v2 ADT messages → CareOS webhook',
    revenue: 'CHI (G0019) + PIN (G0023) + RPM (99454) = ~$300+/patient/month',
  },
  /** BVSD — CII as employee benefit */
  BVSD: {
    name: 'Boulder Valley School District',
    model: 'CII as employee benefit — PEPM ($4.50/employee/month)',
    employees: 1717,
    keyContacts: ['David Janak (Benefits Director)', 'Patricia Valderrama'],
    monthlyRevenueCents: 772650, // $7,726.50/month at full enrollment
  },
  /** Elevations Credit Union — grant funding + community banking */
  ELEVATIONS: {
    name: 'Elevations Credit Union',
    /** Two-time Malcolm Baldrige National Quality Award winner */
    distinction:
      'Two-time Malcolm Baldrige National Quality Award winner — commitment to "Audacious Excellence"',
    program: 'Local Change Foundation — Community Collaboration Grants',
    /** Local Change Foundation has distributed $4M+ in community resources */
    foundationImpactCents: 400000000, // $4M+ distributed
    grantAmount2026Cents: 44060000, // $440,600
    purpose:
      'Fund initial CII assessments, cooperative infrastructure buildout, and community care programming',
    /** Strategic approach */
    strategy:
      'First stop for Community Collaboration grant — fund CII burnout assessments as community health tool',
    /** Banking relationship beyond grants */
    banking: {
      escrowAccount: 'Escrow account for co-op.care formation capital',
      operatingAccount: 'Operating account for day-to-day cooperative finances',
      note: 'Elevations as primary banking partner — mission-aligned credit union, not extractive commercial bank',
    },
  },
  /** Boulder County Area Agency on Aging — CII referral engine */
  BCAAA: {
    name: 'Boulder County Area Agency on Aging (BCAAA)',
    program: 'Caregiver Initiative — support groups + one-on-one caregiver help',
    /** CII assessment as referral engine */
    integration:
      'Offer CII burnout assessment (Layer 1) through BCAAA Caregiver Initiative → direct referral pipeline to co-op.care',
    /** Target demographic */
    targetDemographic: 'Sandwich Generation (35-55 yr olds caring for aging parents + children)',
    /** Partnership value */
    value:
      'Primary local referral engine — BCAAA already has the audience, co-op.care provides the tool + follow-through',
  },
  /** TRU PACE — sub-capitation */
  TRU_PACE: {
    name: 'TRU PACE',
    model: 'PACE sub-capitation for community companion care',
    enrollees: 341,
    monthlyCapCents: 260000, // $2,600/enrollee/month
    targetYear1: 20,
  },
  /** Every.io — back-office platform */
  EVERY_IO: {
    name: 'Every.io',
    model: 'Back-office platform (banking, bookkeeping, payroll, taxes)',
    contact: 'Nick Harvalis (nharvalis@every.io)',
    prerequisite: 'Incorporate LLC or C-Corp first',
  },
} as const;

// ============================================================
// PLACEMENT AGENCY BRIDGE STRATEGY
// ============================================================
// Class B licensure takes 4-6 months. Registering immediately as
// a Placement Agency ($870) lets co-op.care legally match families
// with 1099 caregivers and collect a matching fee while the W-2
// infrastructure (Opolis EoR) is being built out.
// Once Class B license is in hand, 1099 caregivers "flip" to
// W-2 worker-owners in the Opolis Employment Commons.

export const PLACEMENT_AGENCY_BRIDGE = {
  /** CDPHE Placement Agency registration fee */
  REGISTRATION_FEE_CENTS: 87000, // $870 one-time
  /** Legal basis: matches families with independent 1099 caregivers */
  LEGAL_MODEL: '1099_placement' as const,
  /** Revenue model during bridge period */
  REVENUE_MODEL: 'matching_fee' as const,
  /** Timeline for bridge period */
  BRIDGE_PERIOD: {
    /** Day 1 — register as Placement Agency */
    startTrigger: 'Placement Agency registration filed with CDPHE',
    /** 4-6 months — Class B license arrives */
    endTrigger: 'Class B Home Care license granted by CDPHE',
    /** Estimated duration in months */
    estimatedMonths: { min: 4, max: 6 },
  },
  /** Transition plan: flip 1099 caregivers to W-2 */
  TRANSITION: {
    /** Each 1099 caregiver forms S-Corp/C-Corp entity */
    entityFormation: 'S-Corp or C-Corp per caregiver',
    /** Opolis onboarding begins at Class B license receipt */
    opolisOnboarding: 'Batch onboarding — all active caregivers within 30 days of license',
    /** Comfort Card and benefits kick in at W-2 transition */
    benefitsActivation: 'Cigna PPO enrollment available upon Opolis W-2 status',
  },
} as const;

// ============================================================
// COLORADO GRANT FUNDING & TAX CREDITS
// ============================================================
// Colorado is the most aggressive state for employee ownership
// incentives. These programs directly fund co-op.care's formation.

export const COLORADO_FUNDING = {
  /** Employee Ownership Tax Credit (2026 — increased from 50% to 75%) */
  EMPLOYEE_OWNERSHIP_TAX_CREDIT: {
    name: 'Colorado Employee Ownership Expansion Tax Credit',
    /** Credit rate for eligible expenses (legal, accounting, technical assistance) */
    creditPercent: 75, // Up from 50% — 2026 increase
    /** Prior year credit rate for context */
    priorCreditPercent: 50,
    /** Eligible expenses */
    eligibleExpenses: [
      'Legal fees for LCA formation (e.g., Jason Wiener p.c.)',
      'Accounting setup for cooperative structure',
      'Technical assistance for cooperative governance',
      'Conversion costs from traditional entity to cooperative',
    ],
    /** Practical impact */
    note: 'State reimburses 75% of Yev Muchnik / Jason Wiener LCA structuring fees',
    /** Time-sensitivity */
    timeSensitive: true,
    yearEffective: 2026,
  },
  /** Skill Advance Colorado — workforce training grant */
  SKILL_ADVANCE_COLORADO: {
    name: 'Skill Advance Colorado Grant',
    /** Maximum grant amount in cents */
    maxGrantCents: 20000000, // $200,000
    /** Purpose: hire + train new full-time employees in Colorado */
    purpose:
      'Fund Conductor Training certification modules and professionalize family caregivers into W-2 worker-owners',
    /** Eligible activities for co-op.care */
    eligibleActivities: [
      'Conductor certification training (7 modules)',
      'Safe Transfers, Bathing, Medication Management',
      'Dementia Communication, Fall Prevention, Emergency Response',
      'Comprehensive training program',
    ],
    /** Requirement: new full-time employees in Colorado */
    requirement: 'New full-time Colorado employees',
    /** co-op.care alignment */
    coopCareAlignment:
      'Source 3 (family caregivers) → trained W-2 Conductors via certification modules',
  },
} as const;

// ============================================================
// 90-DAY ROADMAP PHASES
// ============================================================

export const ROADMAP_90_DAY = {
  PHASE_1: {
    name: 'Physician Recruitment & Preparation',
    weeks: '1-3',
    milestones: [
      'Josh Emdur, DO agreement finalized',
      'Clinical Director role scope defined',
      'LMN template created',
      'PIN/CHI billing protocols established',
    ],
  },
  PHASE_1B: {
    name: 'Placement Agency Bridge (Revenue Immediately)',
    weeks: '1-2',
    milestones: [
      'Register as CDPHE Placement Agency ($870)',
      'Begin matching families with 1099 caregivers',
      'Collect matching fees — revenue from day 1',
      'Apply for Employee Ownership Tax Credit (75% of LCA formation costs)',
      'Apply for Skill Advance Colorado grant ($200K for Conductor training)',
    ],
  },
  PHASE_2: {
    name: 'Medicare & State Licensure',
    weeks: '4-12',
    milestones: [
      'CDPHE Class B license application submitted',
      'CMS-855B Medicare enrollment initiated',
      'Opolis EoR onboarding (Stage 1) — flip 1099 caregivers to W-2',
      'Galaxy Watch pilot with 3-5 families',
      'NLP pipeline prototype (Stages 1-3)',
      'BCAAA partnership — CII assessment referral engine',
    ],
  },
  PHASE_3: {
    name: 'ACCESS Model & Pilot Launch',
    target: 'July 2026',
    milestones: [
      'ACCESS Model eCKM application submitted',
      'BCH Safe Graduation pilot begins (5-10 patients/month)',
      'BVSD CII benefit pilot begins',
      'First PIN/CHI/CCM claims submitted',
      'Founding caregiver cohort (5 worker-owners)',
      'Serving 15-20 families',
    ],
  },
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

// ============================================================
// BIO-CATALYTIC ENGINE — Behavioral Activation Energy (BAE) Reduction
// ============================================================
// Biological metaphor → product feature mapping:
//   Activation Energy (Ea)  → Friction in finding/trusting neighbors
//   Enzyme Catalyst          → co-op.care Platform / Trust Architecture
//   Active Site              → CareOS Mobile App / Matching Engine
//   Induced Fit              → Personalizing the "ask" by user persona
//   Co-factor                → Institutional partnerships (BCH, BVSD) as trust catalysts
//   Product Yield            → Care Credits (exchangeable value)

/** Default Care Credit — loss aversion activation on registration */
export const DEFAULT_CARE_CREDIT = {
  /** Hours pre-loaded on registration to create endowment effect */
  SEED_HOURS: 1,
  /** Loss aversion framing — shift from "Should I join?" to "I have value to protect" */
  FRAMING: 'You already have 1 Care Credit. Use it or grow it.',
  /** Separate from the 40-hour membership floor — this is the immediate hook */
  RELATIONSHIP_TO_FLOOR:
    'DEFAULT_CARE_CREDIT activates loss aversion at registration; MEMBERSHIP_FLOOR_HOURS (40) activates after $100 membership payment',
} as const;

/** Persona-based "Induced Fit" — the enzyme changes shape to cradle the substrate */
export const CATALYST_PERSONAS = [
  {
    id: 'alpha_daughter' as const,
    label: 'Alpha Daughter',
    catalystName: 'Respite Catalyst',
    coreMessage: 'Get your Saturday back.',
    timeBankFrame: 'Bank hours now so care is there when you need a break.',
    ciiRelevance: 'HIGH' as const,
    defaultTasks: ['companionship', 'meals', 'rides'] as const,
  },
  {
    id: 'senior' as const,
    label: 'Senior',
    catalystName: 'Legacy Catalyst',
    coreMessage: 'Your wisdom is worth hours.',
    timeBankFrame: 'Offer mentorship or a skill in exchange for help around the house.',
    ciiRelevance: 'LOW' as const,
    defaultTasks: ['teaching', 'phone_companionship', 'admin_help'] as const,
  },
  {
    id: 'neighbor' as const,
    label: 'Neighbor',
    catalystName: 'Community Catalyst',
    coreMessage: 'Your skills become care currency.',
    timeBankFrame: 'Turn idle hours into the most valuable currency: human care.',
    ciiRelevance: 'MEDIUM' as const,
    defaultTasks: ['yard_work', 'grocery_run', 'errands', 'pet_care'] as const,
  },
  {
    id: 'worker_owner' as const,
    label: 'Worker-Owner',
    catalystName: 'Professional Catalyst',
    coreMessage: 'Own your work, build your practice.',
    timeBankFrame: 'W-2 wages + equity + benefits = the career you deserve.',
    ciiRelevance: 'HIGH' as const,
    defaultTasks: ['companionship', 'meals', 'housekeeping', 'tech_support'] as const,
  },
] as const;

export type CatalystPersonaId = (typeof CATALYST_PERSONAS)[number]['id'];

/** Founder Micro-Incentives — temporal discounting countermeasures */
export const FOUNDER_INCENTIVES = {
  /** Challenge: bank 5 hours within first 30 days for immediate rewards */
  CHALLENGE: {
    hoursRequired: 5,
    withinDays: 30,
    label: '5-in-30 Catalyst Challenge',
  },
  /** Tiers of incentive (earned sequentially) */
  TIERS: [
    {
      id: 'first_hour' as const,
      hoursRequired: 1,
      reward: 'Founder Status badge on profile',
      icon: 'seedling',
    },
    {
      id: 'third_hour' as const,
      hoursRequired: 3,
      reward: 'Care Card discount at local partners',
      icon: 'leaf',
    },
    {
      id: 'fifth_hour' as const,
      hoursRequired: 5,
      reward: 'Founding Family recognition + 2 bonus hours',
      icon: 'rooted',
    },
  ] as const,
  /** Scarcity framing — caregiver support ratio declining */
  SCARCITY_FRAME: {
    currentRatio: '7:1',
    projectedRatio2035: '4:1',
    message:
      'The caregiver-to-senior ratio is collapsing. Banking an hour today is an intergenerational hedge.',
  },
  /** Social proof display thresholds */
  SOCIAL_PROOF: {
    showCommunityCountAfterNMembers: 10,
    showTopCatalystsCount: 5,
    catalystLabel: 'Top Catalyst',
  },
} as const;

/** Active Site — proximity matching configuration */
export const ACTIVE_SITE = {
  /** Default matching radius in miles (enzyme active site = 2-mile radius) */
  DEFAULT_RADIUS_MILES: 2,
  /** Geofencing tiers for "substrate orientation" */
  TIERS: [
    { maxMiles: 0.5, label: 'Walking Distance', priority: 1 },
    { maxMiles: 1.0, label: 'Biking Distance', priority: 2 },
    { maxMiles: 2.0, label: 'Neighborhood', priority: 3 },
    { maxMiles: 5.0, label: 'Community', priority: 4 },
  ] as const,
  /** Match SLA — requests within active site radius should match faster */
  ACTIVE_SITE_SLA_HOURS: 2,
  /** Community-wide SLA (outside active site) */
  COMMUNITY_SLA_HOURS: 4,
} as const;

// ─── Background Check ────────────────────────────────────────────────────
export const BACKGROUND_CHECK = {
  /** Checkr package — basic criminal + sex offender registry */
  CHECKR_PACKAGE: 'tasker_standard',
  /** co-op.care cost to run one check via Checkr */
  COST_TO_RUN: 30,
  /** What we charge at cost (no markup) */
  STANDALONE_PRICE: 30,
  /** Monthly LMN upgrade tier that includes a free background check */
  LMN_MONTHLY_PRICE: 59,
  /** HSA/FSA savings range with LMN */
  LMN_SAVINGS_PERCENT: { min: 28, max: 36 },
  /** Background check is free when member upgrades to LMN tier */
  FREE_WITH_LMN: true,
  /** Checkr invitation link expires after N days */
  INVITATION_EXPIRY_DAYS: 30,
  /** Check result statuses */
  STATUSES: ['not_started', 'invited', 'pending', 'clear', 'consider', 'expired'] as const,
  /** Profile completeness boost: submitted = 85%, cleared = 95% */
  PROFILE_BOOST: { submitted: 85, cleared: 95 },
  /** Trust messaging */
  COPY: {
    headline: 'Trust is everything',
    subline: 'A quick background check protects every family in the community.',
    standalone: '$30 at cost — no markup, no profit',
    lmn_bundle: 'FREE with the $59/mo LMN upgrade (saves 28-36% on care via HSA/FSA)',
    privacy: 'Checkr handles everything — co-op.care never sees your SSN or personal data',
  },
} as const;
