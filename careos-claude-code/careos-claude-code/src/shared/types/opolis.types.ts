/**
 * Opolis Employment Commons Integration Types
 *
 * Opolis = Employer of Record (EoR) for co-op.care worker-owners.
 * Colorado LCA, handles payroll/benefits/compliance so co-op.care focuses on care.
 *
 * "Business of One" Model:
 *   Each caregiver-owner incorporates as S-Corp or C-Corp entity.
 *   Opolis serves as EoR for each entity — handles UI, WC, tax remittance.
 *   Two bank accounts per caregiver:
 *     Funding Account — holds gross revenue from families via co-op.care
 *     Paycheck Account — receives W-2 wages after deductions
 *
 * Three-stage integration:
 *   Stage 1: Caregiver onboarding → Opolis payroll (manual)
 *   Stage 2: Coalition Member → $WORK rewards + shared governance
 *   Stage 3: API integration → "Capture Once, Route Many" pipeline
 *
 * Data flow (Stage 3):
 *   CareOS clock-in → task completion → hours captured →
 *   Opolis API → payroll processing → W-2 + benefits →
 *   Comfort Card reconciliation → caregiver payment
 *
 * Costs:
 *   $97 one-time lifetime access fee
 *   $20 one-time for one share of Opolis common stock (LCA membership)
 *   1% community fee on total payroll + benefits volume
 *
 * Benefits: Cigna PPO, dental, vision, 401(k), workers' comp
 *
 * Web3:
 *   $WORK token lives on Ethereum Mainnet, bridged to Polygon for low gas
 *   Magic wallets or MetaMask for caregiver $WORK claims
 *   Quadratic voting at 1,000+ members via Snapshot
 *   co-op.care operates as a DEO (Decentralized Employment Organization)
 */

// ============================================================
// OPOLIS INTEGRATION STAGES
// ============================================================

export type OpolisIntegrationStage = 'manual' | 'coalition' | 'api';

// ============================================================
// "BUSINESS OF ONE" — CAREGIVER ENTITY SETUP
// ============================================================
// Each caregiver-owner must incorporate as their own business
// entity. Opolis assists with formation. This moves caregivers
// from "gig worker" to professionalized business owner.

export type CaregiverEntityType = 'scorp' | 'ccorp';

export interface CaregiverOpolisEntity {
  /** co-op.care worker-owner ID */
  workerId: string;
  /** Entity type (S-Corp or C-Corp) */
  entityType: CaregiverEntityType;
  /** Legal entity name (e.g., "Jane Smith Care LLC") */
  entityName: string;
  /** EIN (Employer Identification Number) */
  ein: string;
  /** State of incorporation */
  stateOfIncorporation: string;
  /** Opolis membership status */
  opolisMembershipStatus: 'pending' | 'active' | 'suspended';
  /** Opolis member ID */
  opolisMemberId?: string;
  /** Funding Account — holds gross revenue from families */
  fundingAccount: OpolisBankAccount;
  /** Paycheck Account — receives W-2 wages after deductions */
  paycheckAccount: OpolisBankAccount;
  /** Benefits enrollment status */
  benefitsEnrolled: boolean;
  /** $WORK wallet type */
  walletType: 'magic' | 'metamask' | 'walletconnect' | 'none';
  /** $WORK wallet address (if set up) */
  walletAddress?: string;
  /** One-time access fee paid */
  accessFeePaid: boolean;
  /** Common stock share purchased */
  commonSharePurchased: boolean;
  /** ISO 8601 timestamps */
  entityFormedAt?: string;
  opolisEnrolledAt?: string;
}

export interface OpolisBankAccount {
  /** Account type */
  type: 'funding' | 'paycheck';
  /** Bank name */
  bankName: string;
  /** Account status */
  status: 'pending_setup' | 'active' | 'closed';
  /** Last 4 digits of account number (for display) */
  last4?: string;
}

// ============================================================
// OPOLIS ONBOARDING CHECKLIST
// ============================================================
// Step-by-step checklist for onboarding a caregiver to Opolis.
// co-op.care handles steps 1-3 internal, then hands off to Opolis.

export type OnboardingStepStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export interface OpolisOnboardingChecklist {
  /** Worker-owner ID */
  workerId: string;
  /** Overall progress (0-100) */
  progressPercent: number;
  /** Individual steps */
  steps: OpolisOnboardingStep[];
  /** Estimated days to complete remaining steps */
  estimatedDaysRemaining: number;
}

export interface OpolisOnboardingStep {
  /** Step number (1-8) */
  step: number;
  /** Step name */
  name: string;
  /** Description */
  description: string;
  /** Status */
  status: OnboardingStepStatus;
  /** Who handles this step */
  handler: 'caregiver' | 'coop_care' | 'opolis' | 'legal';
  /** Prerequisites (step numbers that must be completed first) */
  prerequisites: number[];
  /** Estimated time to complete */
  estimatedDays: number;
}

export const OPOLIS_ONBOARDING_STEPS: readonly OpolisOnboardingStep[] = [
  {
    step: 1,
    name: 'Entity Formation',
    description:
      'Incorporate as S-Corp or C-Corp. Opolis assists with formation to ensure correct structure for payroll.',
    status: 'not_started',
    handler: 'legal',
    prerequisites: [],
    estimatedDays: 7,
  },
  {
    step: 2,
    name: 'EIN Application',
    description: 'Obtain Employer Identification Number from IRS for the new entity.',
    status: 'not_started',
    handler: 'caregiver',
    prerequisites: [1],
    estimatedDays: 3,
  },
  {
    step: 3,
    name: 'Opolis Membership',
    description:
      'Pay $97 one-time lifetime access fee + $20 for one share of Opolis common stock (LCA membership).',
    status: 'not_started',
    handler: 'caregiver',
    prerequisites: [1, 2],
    estimatedDays: 1,
  },
  {
    step: 4,
    name: 'Funding Account Setup',
    description:
      'Establish Funding Account — holds gross revenue from family payments via co-op.care.',
    status: 'not_started',
    handler: 'opolis',
    prerequisites: [3],
    estimatedDays: 5,
  },
  {
    step: 5,
    name: 'Paycheck Account Setup',
    description:
      'Establish Paycheck Account — receives W-2 wages after tax withholdings and benefit deductions.',
    status: 'not_started',
    handler: 'opolis',
    prerequisites: [3],
    estimatedDays: 5,
  },
  {
    step: 6,
    name: 'Benefits Enrollment',
    description:
      'Select benefits package: Cigna PPO health, dental, vision, 401(k), workers comp, life, disability.',
    status: 'not_started',
    handler: 'caregiver',
    prerequisites: [4, 5],
    estimatedDays: 3,
  },
  {
    step: 7,
    name: 'Identity Verification',
    description: 'Complete I-9 and identity verification through Opolis platform.',
    status: 'not_started',
    handler: 'caregiver',
    prerequisites: [3],
    estimatedDays: 1,
  },
  {
    step: 8,
    name: '$WORK Wallet Setup',
    description:
      'Set up Magic wallet or MetaMask for $WORK token claims. Optional but recommended for Coalition Member rewards.',
    status: 'not_started',
    handler: 'caregiver',
    prerequisites: [3],
    estimatedDays: 1,
  },
] as const;

// ============================================================
// OPOLIS CONFIG (corrected)
// ============================================================

export interface OpolisConfig {
  /** Current integration stage */
  stage: OpolisIntegrationStage;
  /** One-time lifetime access fee in cents */
  lifetimeAccessFeeCents: number;
  /** One-time common stock share purchase in cents */
  commonShareCents: number;
  /** Community fee as percentage of total payroll + benefits volume */
  communityFeePercent: number;
  /** Benefits package */
  benefits: OpolisBenefits;
  /** $WORK token rewards (Coalition Member stage) */
  workTokenRewards: OpolisWorkRewards;
  /** Encryption suite for data pipeline */
  encryptionSuite: 'fernet';
  /** DEO governance config */
  deoConfig: DEOConfig;
}

export interface OpolisBenefits {
  /** Health insurance provider */
  healthInsurance: string;
  /** Health insurance network type */
  networkType: 'ppo';
  /** Estimated savings vs Colorado state exchange (ACA marketplace) */
  estimatedSavingsVsExchangePercent: { min: number; max: number };
  /** Dental coverage included */
  dental: boolean;
  /** Vision coverage included */
  vision: boolean;
  /** 401(k) retirement plan */
  retirement401k: boolean;
  /** Workers' compensation */
  workersComp: boolean;
  /** Life insurance */
  lifeInsurance: boolean;
  /** Disability coverage */
  disability: boolean;
  /** Primary retention lever note */
  retentionNote: string;
}

export interface OpolisWorkRewards {
  /** Whether $WORK token rewards are active */
  enabled: boolean;
  /** Reward triggers */
  triggers: OpolisRewardTrigger[];
  /** Notes on $WORK token utility */
  notes: string;
  /**
   * Streaming Equity Model:
   * As a Coalition Member, $WORK rewards vest continuously in real-time
   * — not locked or cliff-vested. This creates a "streaming equity" asset
   * on the cooperative's balance sheet that grows with every hour of care.
   */
  vestingModel: 'streaming_realtime';
  /** Whether $WORK accrues as a balance sheet asset for the cooperative */
  balanceSheetAsset: boolean;
}

export interface OpolisRewardTrigger {
  /** Event that triggers the reward */
  event: string;
  /** Description of the trigger */
  description: string;
  /** Estimated $WORK reward amount (tokens, not USD) */
  estimatedTokens: number;
}

// ============================================================
// OPOLIS PAYROLL INTEGRATION
// ============================================================

// ============================================================
// DIGITAL CURRENCY PAYROLL
// ============================================================
// Opolis supports payroll in fiat AND digital currencies.
// Caregivers can elect to receive a portion in USDC, ETH, or BTC.
// This is optional — most caregivers will use standard USD direct deposit.

export type PayrollCurrency = 'usd' | 'usdc' | 'eth' | 'btc';

export interface PayrollCurrencyElection {
  /** Primary payroll currency (almost always USD) */
  primaryCurrency: 'usd';
  /** Optional digital currency allocation */
  digitalCurrencyAllocation?: {
    currency: Exclude<PayrollCurrency, 'usd'>;
    /** Percentage of net pay to receive in this currency */
    percentOfNetPay: number;
    /** Wallet address for digital currency deposits */
    walletAddress: string;
  };
}

// ============================================================
// OPOLIS PAYROLL INTEGRATION
// ============================================================

export interface OpolisPayrollSubmission {
  /** co-op.care worker-owner ID */
  workerId: string;
  /** Pay period start (ISO 8601) */
  periodStart: string;
  /** Pay period end (ISO 8601) */
  periodEnd: string;
  /** Total hours worked */
  totalHours: number;
  /** Hourly rate in cents */
  hourlyRateCents: number;
  /** Gross pay in cents */
  grossPayCents: number;
  /** Task IDs included in this pay period */
  taskIds: string[];
  /** GPS-verified hours (subset of totalHours) */
  gpsVerifiedHours: number;
  /** Omaha problem codes logged during this period */
  omahaProblemCodes: string[];
}

export interface OpolisPayrollResponse {
  /** Opolis payroll ID */
  payrollId: string;
  /** Processing status */
  status: 'submitted' | 'processing' | 'completed' | 'error';
  /** Net pay after taxes and deductions in cents */
  netPayCents: number;
  /** Tax withholdings in cents */
  taxWithholdingCents: number;
  /** Benefits deductions in cents */
  benefitsDeductionCents: number;
  /** $WORK tokens earned (if Coalition Member) */
  workTokensEarned: number;
  /** Expected pay date (ISO 8601) */
  expectedPayDate: string;
  /** Error message if status is 'error' */
  errorMessage?: string;
}

// ============================================================
// CAPTURE ONCE, ROUTE MANY — Pipeline
// ============================================================
// The #1 build requirement for Jacob (Cohesion Health):
// A single "Care Event" in CareOS simultaneously generates:
//   1. FHIR Observation → Aidbox (for the doctor / Clinical Director)
//   2. CMS Billing Event → PIN/CHI/CCM/RPM time tracking (for CMS claims)
//   3. Opolis Payroll Instruction → wage calculation (for caregiver W-2)
//
// Full route targets (6 downstream systems):
//   1. TimeBank ledger (hours credit/debit — 0.9/0.1 split)
//   2. Opolis payroll (Payroll Instruction — gross wage calculation)
//   3. Comfort Card (HSA/FSA reconciliation — LMN-backed)
//   4. CMS billing (Billing Event — PIN/CHI/CCM/RPM time accumulation)
//   5. Aidbox FHIR (FHIR Observation — clinical documentation for Clinical Director)
//   6. Analytics (cascade impact, community metrics)
//
// Data sovereignty: All routing uses Fernet encryption.
// The pipeline MUST NOT require the caregiver to enter data twice.

export type CaptureRouteTarget =
  | 'timebank_ledger'
  | 'opolis_payroll'
  | 'comfort_card'
  | 'cms_billing'
  | 'aidbox_fhir'
  | 'analytics';

/**
 * Triple-output specification for "Capture Once, Route Many"
 * This is the contract for what a single CareOS clock-in produces.
 */
export interface CaptureTripleOutput {
  /** FHIR Observation for Aidbox — clinical documentation */
  fhirObservation: {
    resourceType: 'Observation';
    /** Omaha System problem code */
    code: string;
    /** Task duration, GPS verification, caregiver notes */
    components: string[];
    /** Patient reference */
    subject: string;
    /** Caregiver reference */
    performer: string;
  };
  /** CMS Billing Event — time accumulation for claims */
  cmsBillingEvent: {
    /** Which billing layers this event contributes to */
    applicableLayers: ('pin' | 'chi' | 'ccm' | 'rpm')[];
    /** Minutes to accumulate toward monthly thresholds */
    minutesContributed: number;
    /** Whether this is an RPM data day (for 99454) */
    isRpmDataDay: boolean;
    /** Incident-to supervision required */
    requiresIncidentTo: boolean;
  };
  /** Opolis Payroll Instruction — wage calculation */
  opolisPayrollInstruction: {
    /** Worker-owner entity ID */
    workerEntityId: string;
    /** Hours for this shift */
    hours: number;
    /** Hourly rate in cents */
    hourlyRateCents: number;
    /** Gross pay for this shift in cents */
    grossPayCents: number;
    /** GPS-verified */
    gpsVerified: boolean;
  };
}

export interface CaptureEvent {
  /** Unique event ID */
  id: string;
  /** Worker-owner who performed the task */
  workerId: string;
  /** Care recipient */
  patientId: string;
  /** Task type from business rules */
  taskType: string;
  /** Clock-in timestamp (ISO 8601) */
  clockIn: string;
  /** Clock-out timestamp (ISO 8601) */
  clockOut: string;
  /** Duration in hours */
  hours: number;
  /** GPS coordinates at clock-in */
  gpsClockIn: { lat: number; lng: number } | null;
  /** GPS coordinates at clock-out */
  gpsClockOut: { lat: number; lng: number } | null;
  /** Whether GPS verification passed (within 0.25 mi) */
  gpsVerified: boolean;
  /** Omaha System problem codes (auto-coded from task type) */
  omahaCodes: string[];
  /** Caregiver notes (plain text, no PHI in notes) */
  notes: string;
  /** Which routing targets have been processed */
  routedTo: Record<CaptureRouteTarget, boolean>;
  /** ISO 8601 timestamp of event creation */
  createdAt: string;
}

// ============================================================
// DEO — DECENTRALIZED EMPLOYMENT ORGANIZATION
// ============================================================
// co-op.care operates as a DEO within the Opolis Commons.
// DEOs are self-governing employment organizations that can
// set their own parameters while remaining within the broader
// Opolis employment infrastructure.

export interface DEOConfig {
  /** DEO name */
  name: string;
  /** Whether co-op.care has self-governance rules registered */
  selfGovernanceRegistered: boolean;
  /** Internal governance parameters that co-op.care controls */
  internalParameters: {
    /** Minimum caregiver hourly rate (cents) */
    minHourlyRateCents: number;
    /** Maximum weekly hours before burnout warning */
    maxWeeklyHours: number;
    /** Respite Fund deduction percentage */
    respiteFundPercent: number;
    /** Whether members can opt-out of $WORK staking */
    workStakingOptOut: boolean;
  };
  /** Opolis Commons parameters that co-op.care must follow */
  commonsParameters: {
    /** 1% community fee (non-negotiable) */
    communityFeePercent: number;
    /** Minimum benefits enrollment period */
    minBenefitsPeriodMonths: number;
    /** Required compliance with EoR employment law */
    eorCompliance: true;
  };
}

// ============================================================
// $WORK TOKEN CHAIN DETAILS
// ============================================================
// $WORK is an ERC-20 on Ethereum Mainnet, bridged to Polygon
// for lower gas. Caregivers use Magic wallets (non-custodial,
// email-based) or MetaMask to claim and stake rewards.

export interface WorkTokenChainConfig {
  /** Primary chain (Ethereum Mainnet) */
  primaryChain: 'ethereum';
  primaryChainId: 1;
  /** Bridge chain (Polygon PoS for low gas) */
  bridgeChain: 'polygon-pos';
  bridgeChainId: 137;
  /** Token contract on Ethereum Mainnet */
  mainnetContract: string;
  /** Token contract on Polygon (bridged) */
  polygonContract: string;
  /** Supported wallet types for caregivers */
  supportedWallets: ('magic' | 'metamask' | 'walletconnect')[];
  /** Recommended wallet for non-crypto-native caregivers */
  recommendedWallet: 'magic';
  /** Governance: quadratic voting threshold */
  quadraticVotingMemberThreshold: number;
  /** Governance platform */
  governancePlatform: 'snapshot';
}

export const WORK_TOKEN_CHAIN: WorkTokenChainConfig = {
  primaryChain: 'ethereum',
  primaryChainId: 1,
  bridgeChain: 'polygon-pos',
  bridgeChainId: 137,
  mainnetContract: '', // Set when integrated
  polygonContract: '', // Set when integrated
  supportedWallets: ['magic', 'metamask', 'walletconnect'],
  recommendedWallet: 'magic',
  quadraticVotingMemberThreshold: 1000,
  governancePlatform: 'snapshot',
};

// ============================================================
// OPOLIS CONSTANTS (corrected — one-time fees, not monthly)
// ============================================================

export const OPOLIS_CONSTANTS = {
  /** One-time lifetime access fee in cents */
  LIFETIME_ACCESS_FEE_CENTS: 9700, // $97 one-time
  /** One-time common stock share in cents (LCA membership) */
  COMMON_SHARE_CENTS: 2000, // $20 one-time
  /** Community fee on total payroll + benefits volume */
  COMMUNITY_FEE_PERCENT: 1.0,
  /** Total one-time onboarding cost per caregiver in cents */
  TOTAL_ONBOARDING_COST_CENTS: 11700, // $117 ($97 + $20)
  /** Health insurance provider — Cigna PPO via Opolis group plan */
  HEALTH_INSURANCE_PROVIDER: 'Cigna PPO',
  /** Network type */
  HEALTH_INSURANCE_NETWORK: 'PPO' as const,
  /** Estimated savings vs Colorado state exchange (Connect for Health Colorado) */
  CIGNA_SAVINGS_VS_EXCHANGE_PERCENT: { min: 20, max: 50 },
  /** Cigna PPO = primary caregiver retention tool */
  CIGNA_RETENTION_NOTE:
    'Cigna PPO access at group rates is the #1 retention lever for caregivers vs. gig/agency alternatives',
  /** Minimum workers for group benefits */
  MIN_WORKERS_FOR_BENEFITS: 2,
  /** Required entity type for each caregiver */
  CAREGIVER_ENTITY_TYPE: 'S-Corp or C-Corp',
  /** Encryption suite for data pipeline compatibility */
  ENCRYPTION_SUITE: 'Fernet',
  /** Integration stage descriptions */
  STAGE_DESCRIPTIONS: {
    manual: 'Manual onboarding — CSV payroll upload, caregiver entity formation',
    coalition: 'Coalition Member — $WORK rewards + governance participation + referral engine',
    api: 'Full API — Capture Once, Route Many pipeline + Fernet-encrypted data bridge',
  },
  /** Web3 integration notes */
  WEB3_BRIDGE: {
    /** Opolis is a Colorado LCA — same legal structure as co-op.care */
    legalStructure: 'Colorado Limited Cooperative Association (LCA)',
    /** $WORK token is Opolis ecosystem governance token */
    workToken: '$WORK — ERC-20 on Ethereum Mainnet, bridged to Polygon for low gas',
    /** CareHour token is co-op.care's own token (see web3.types.ts) */
    careHourToken: 'CARE — ERC-7818 expirable time credit (co-op.care internal)',
    /** Caregiver wallet UX */
    walletStrategy:
      'Magic wallets (email-based, non-custodial) for non-crypto-native caregivers; MetaMask for power users',
    /** Stage 2+ enables $WORK reward events from payroll milestones */
    workRewardIntegration:
      'Coalition Member stage: earn $WORK on payroll milestones, governance votes, caregiver referrals',
    /** $WORK streaming equity — vests continuously in real-time */
    streamingEquity:
      '$WORK rewards vest continuously (not cliff-vested). Creates streaming equity asset on cooperative balance sheet that grows with every hour of care delivered.',
    /** 1% fee clarification — NO markup on wages */
    communityFeeModel:
      'Opolis does NOT charge a markup on wages. 1% community fee on total payroll + benefits volume only. For $28/hr caregiver = $0.28/hr — far lower than 40-60% traditional agency extraction.',
    /** Stage 3 API enables: clock-in → Opolis payroll + on-chain attestation simultaneously */
    stage3Pipeline:
      'Capture Once, Route Many: CareOS clock-in → Fernet-encrypted → Opolis payroll + TaskAttestation.sol → CareHour minting',
    /** DEO self-governance */
    deoGovernance:
      'co-op.care operates as a DEO within Opolis Commons — self-governing parameters for wage floors, benefits, respite fund',
    /** Quadratic voting threshold */
    quadraticVotingAt:
      '1,000 Employment Commons members → Snapshot quadratic voting replaces simple majority',
  },
  /** Coalition referral engine */
  COALITION_REFERRAL: {
    /** $WORK reward per caregiver referral */
    rewardDescription: '$WORK tokens earned per caregiver successfully onboarded to Opolis',
    /** co-op.care Technologies LLC builds the referral portal */
    portalOwner: 'co-op.care Technologies LLC',
    /** Referral rewards build a long-term asset for the cooperative */
    notes:
      'Coalition Member referral engine generates $WORK rewards for every caregiver onboarded, building long-term cooperative governance weight',
  },
} as const;
