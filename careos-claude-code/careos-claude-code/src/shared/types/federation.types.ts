/**
 * Federated Cooperative Model Types
 *
 * co-op.care operates as a federated system:
 *   Technologies LLC — IP, payer contracts, de-identified data, AI/MCP servers
 *   Local Cooperatives — Care delivery, PHI, caregiver employment, state licenses
 *
 * This separation:
 *   1. Keeps PHI within licensed local entities (HIPAA/state compliance)
 *   2. Allows IP and AI models to scale without per-state licensing
 *   3. Enables Aidbox Multibox Multi-Tenancy (one DB per cooperative)
 *   4. Mirrors Opolis's own federated LCA structure
 *
 * Patronage System:
 *   Member dividend = (member hours / total hours) × net distributable surplus
 *   IRS Subchapter T: 20% cash minimum, 80% retained equity
 *   Equity tracked by vintage year (year of first membership)
 *
 * Federation Growth:
 *   Boulder (2026) → Front Range (2027) → Colorado statewide (2028) →
 *   Multi-state (2029+)
 */

// ============================================================
// LCA vs LLC DECISION FRAMEWORK
// ============================================================
// The Colorado Limited Cooperative Association (LCA) is the
// critical filing decision. Unlike a traditional LLC:
//   - Allows multi-stakeholder model: Worker Members + Investor Members
//   - Patron members (workers + care recipients) constitutionally
//     guaranteed board majority
//   - Explicitly compatible with DAO governance (per Jason Wiener p.c.)
//   - Opolis validates the model (Colorado LCA + $WORK tokens)
//   - Yev Muchnik advocates LCA as "keystone" for Web3-native orgs
//
// Filing as standard LLC = loses cooperative tax treatment (Subchapter T),
// loses multi-stakeholder governance, loses Web3 compatibility story.

export type EntityFilingType = 'colorado_lca' | 'standard_llc' | 'ccorp';

export interface LCAAdvantage {
  feature: string;
  lcaBehavior: string;
  llcBehavior: string;
}

export const LCA_VS_LLC: readonly LCAAdvantage[] = [
  {
    feature: 'Multi-stakeholder membership',
    lcaBehavior: 'Worker Members + Investor Members in same entity',
    llcBehavior: 'Single class of members only',
  },
  {
    feature: 'Patron control guarantee',
    lcaBehavior: 'Patron members (workers + recipients) guaranteed board majority by statute',
    llcBehavior: 'No statutory protection — capital can outvote workers',
  },
  {
    feature: 'Tax treatment',
    lcaBehavior: 'IRS Subchapter T — patronage dividends deductible',
    llcBehavior: 'Standard pass-through — no patronage dividend deduction',
  },
  {
    feature: 'DAO compatibility',
    lcaBehavior: 'Explicitly compatible (Jason Wiener p.c. analysis + Opolis precedent)',
    llcBehavior: 'Legal gray area for on-chain governance',
  },
  {
    feature: 'Investor capital',
    lcaBehavior: 'Investor Members can contribute capital with limited returns (not control)',
    llcBehavior: 'Members can have different capital rights but no cooperative framework',
  },
  {
    feature: 'Web3 precedent',
    lcaBehavior: 'Opolis (Colorado LCA) + $WORK tokens — fully validated',
    llcBehavior: 'No cooperative Web3 precedent in Colorado',
  },
] as const;

export const LCA_KEY_CONTACTS = {
  /** Leading cooperative-DAO attorney in Colorado */
  LEGAL: {
    name: 'Jason Wiener p.c.',
    email: 'info@jrwiener.com',
    location: 'Boulder/Denver, CO',
    expertise: 'Helped draft CULCA statute, cooperative-DAO law, Opolis legal structure',
  },
  /** LCA structuring advocate — Senior Of Counsel at same firm */
  STRUCTURING: {
    name: 'Yev Muchnik',
    role: 'Senior Of Counsel at Jason Wiener, P.C.',
    expertise: 'LCA as "keystone" legal framework for Web3-native cooperative organizations',
    responsibilities: [
      'Architect LCA filing to harmonize decentralized governance with commercial structure',
      'Avoid "general partnership" liability traps of unincorporated DAOs',
      'Integrate Opolis-native employment standards into LCA bylaws',
      'Ensure robust liability shield for worker-owners',
    ],
  },
} as const;

// ============================================================
// MEMBERSHIP CLASSES (LCA Multi-Stakeholder)
// ============================================================
// Colorado LCA allows two membership classes:
//   Patron Members: caregivers (workers) + care recipients (consumers)
//   Investor Members: community supporters, families, impact investors

export type MembershipClass = 'patron_worker' | 'patron_consumer' | 'investor';

export interface MembershipClassConfig {
  class: MembershipClass;
  description: string;
  votingRights: string;
  capitalContribution: string;
  patronageDividendEligible: boolean;
  boardRepresentation: string;
}

export const MEMBERSHIP_CLASSES: readonly MembershipClassConfig[] = [
  {
    class: 'patron_worker',
    description: 'Caregiver worker-owners (Source 1, 2, 3)',
    votingRights: 'Full voting — 1 member, 1 vote on patron matters',
    capitalContribution: 'Minimal ($117 Opolis onboarding) — contribution is labor, not capital',
    patronageDividendEligible: true,
    boardRepresentation: '3 of 7 seats (43%) — elected by worker patrons only',
  },
  {
    class: 'patron_consumer',
    description: 'Care recipients and families receiving care services',
    votingRights: 'Full voting — 1 member, 1 vote on patron matters',
    capitalContribution: 'Membership fee',
    patronageDividendEligible: true,
    boardRepresentation: '2 of 7 seats (29%) — elected by consumer patrons only',
  },
  {
    class: 'investor',
    description: 'Community supporters, impact investors, family members not receiving care',
    votingRights: 'Limited voting — investor class matters only. Cannot outvote patrons on board.',
    capitalContribution: 'Equity investment with limited, capped returns',
    patronageDividendEligible: false,
    boardRepresentation: 'No dedicated seats — patron majority guaranteed by CULCA statute',
  },
] as const;

// ============================================================
// FEDERATION ENTITIES
// ============================================================

export type FederationEntityType = 'technologies_llc' | 'local_cooperative';

export interface FederationEntity {
  /** Unique entity ID */
  id: string;
  /** Entity type */
  type: FederationEntityType;
  /** Legal name */
  legalName: string;
  /** Display name */
  displayName: string;
  /** State of incorporation */
  state: string;
  /** Entity formation date (ISO 8601) */
  formedAt: string;
  /** Status */
  status: 'forming' | 'active' | 'suspended';
  /** Aidbox tenant ID (for Multibox Multi-Tenancy) */
  aidboxTenantId: string;
}

export interface TechnologiesLLC extends FederationEntity {
  type: 'technologies_llc';
  /** IP assets owned */
  ipAssets: string[];
  /** Payer contracts managed */
  payerContracts: string[];
  /** AI models and MCP servers hosted */
  aiServices: string[];
  /** Data governance: only de-identified data flows to Technologies LLC */
  dataGovernance: 'deidentified_only';
}

export interface LocalCooperative extends FederationEntity {
  type: 'local_cooperative';
  /** Service area (city/county) */
  serviceArea: string;
  /** State license type */
  licenseType: 'class_b' | 'class_a' | 'pending';
  /** CDPHE license number (Colorado) */
  cdpheLicenseNumber?: string;
  /** Medicare CMS-855B enrollment status */
  medicareEnrollment: 'not_applied' | 'pending' | 'enrolled';
  /** Number of active worker-owners */
  activeWorkerOwners: number;
  /** Number of active families served */
  activeFamilies: number;
  /** Opolis integration stage */
  opolisStage: 'manual' | 'coalition' | 'api';
  /** Whether this cooperative holds PHI */
  holdsPHI: true; // Always true for local cooperatives
}

// ============================================================
// AIDBOX MULTIBOX MULTI-TENANCY
// ============================================================
// Each local cooperative gets its own Aidbox database instance.
// PHI never crosses cooperative boundaries.
// Technologies LLC accesses only de-identified aggregate data.

export interface AidboxTenantConfig {
  /** Tenant ID (matches cooperative ID) */
  tenantId: string;
  /** Cooperative this tenant belongs to */
  cooperativeId: string;
  /** Database name in PostgreSQL */
  databaseName: string;
  /** Whether tenant is active */
  active: boolean;
  /** Data isolation level */
  isolationLevel: 'database' | 'schema';
  /** FHIR resource types enabled */
  enabledResourceTypes: string[];
  /** Cross-tenant data sharing rules */
  crossTenantSharing: {
    /** De-identified aggregate metrics can flow to Technologies LLC */
    aggregateMetrics: boolean;
    /** Individual PHI never crosses tenants */
    phi: false;
    /** Care plan templates can be shared */
    careTemplates: boolean;
  };
}

// ============================================================
// PATRONAGE & EQUITY SYSTEM
// ============================================================
// IRS Subchapter T cooperative patronage:
//   - Patronage dividends based on hours worked (not capital invested)
//   - 20% minimum cash, 80% retained as equity
//   - Equity tracked by vintage (year of first membership)
//   - Equity redeemed at departure (subject to redemption schedule)

export interface PatronageDividend {
  /** Fiscal year */
  fiscalYear: number;
  /** Worker-owner ID */
  workerId: string;
  /** Total hours worked by this member in the fiscal year */
  memberHours: number;
  /** Total hours worked by ALL members in the fiscal year */
  totalCoopHours: number;
  /** Member's share of hours (memberHours / totalCoopHours) */
  shareOfHours: number;
  /** Net distributable surplus for the fiscal year in cents */
  netSurplusCents: number;
  /** Member's patronage dividend in cents */
  patronageDividendCents: number;
  /** Cash portion (minimum 20%) in cents */
  cashPortionCents: number;
  /** Retained equity portion (up to 80%) in cents */
  retainedEquityCents: number;
  /** Whether dividend has been distributed */
  distributed: boolean;
  /** Distribution date (ISO 8601) */
  distributedAt?: string;
}

export interface MemberEquity {
  /** Worker-owner ID */
  workerId: string;
  /** Vintage year (year of first membership) */
  vintageYear: number;
  /** Total retained equity across all years in cents */
  totalRetainedEquityCents: number;
  /** Equity by year */
  equityByYear: Record<number, number>; // year → cents
  /** Total cash dividends received in cents */
  totalCashDividendsCents: number;
  /** Current redemption value in cents (may differ from retained if schedule applies) */
  currentRedemptionValueCents: number;
  /** Years until full vesting */
  yearsUntilFullVesting: number;
}

export type VestingSchedule = {
  /** Years of membership */
  years: number;
  /** Percentage of retained equity that can be redeemed */
  redemptionPercent: number;
}[];

// ============================================================
// GOVERNANCE
// ============================================================

export interface CooperativeBoard {
  /** Board composition */
  seats: BoardSeat[];
  /** Total seats */
  totalSeats: number;
  /** Quorum requirement (percentage of seats) */
  quorumPercent: number;
  /** Term length in years */
  termYears: number;
  /** Maximum consecutive terms */
  maxConsecutiveTerms: number;
}

export interface BoardSeat {
  /** Seat category */
  category: BoardCategory;
  /** Number of seats in this category */
  count: number;
  /** Elected by */
  electedBy: string;
}

export type BoardCategory =
  | 'caregiver'
  | 'care_recipient'
  | 'family_member'
  | 'independent'
  | 'community';

// ============================================================
// FEDERATION CONSTANTS
// ============================================================

export const FEDERATION_CONSTANTS = {
  /** Patronage: minimum cash distribution percentage */
  PATRONAGE_CASH_MINIMUM_PERCENT: 20,
  /** Patronage: maximum retained equity percentage */
  PATRONAGE_RETAINED_MAXIMUM_PERCENT: 80,
  /** Equity vesting schedule */
  VESTING_SCHEDULE: [
    { years: 1, redemptionPercent: 20 },
    { years: 2, redemptionPercent: 40 },
    { years: 3, redemptionPercent: 60 },
    { years: 4, redemptionPercent: 80 },
    { years: 5, redemptionPercent: 100 },
  ] as const,
  /** Board composition (7 seats) */
  BOARD_COMPOSITION: {
    CAREGIVER_SEATS: 3,
    CARE_RECIPIENT_SEATS: 2,
    FAMILY_MEMBER_SEATS: 1,
    INDEPENDENT_SEATS: 1,
    TOTAL_SEATS: 7,
    QUORUM_PERCENT: 57, // 4 of 7
    TERM_YEARS: 3,
    MAX_CONSECUTIVE_TERMS: 2,
  },
  /** Federation growth targets */
  GROWTH_TARGETS: {
    BOULDER_LAUNCH: '2026-Q3',
    FRONT_RANGE_EXPANSION: '2027-Q2',
    COLORADO_STATEWIDE: '2028-Q1',
    MULTI_STATE: '2029',
  },
  /** Technologies LLC retains these IP assets */
  TECHNOLOGIES_IP: [
    'CareOS platform (Sage AI, MCP servers, CareOS web app)',
    'CII/CRI assessment instruments',
    'NLP Pipeline models and training data (de-identified)',
    'Matching algorithm',
    'Billing automation engine',
    'Brand and trademarks (co-op.care)',
  ] as const,
  /** Local cooperatives retain these */
  LOCAL_COOP_RESPONSIBILITIES: [
    'Care delivery and caregiver management',
    'PHI storage and HIPAA compliance',
    'State licensing (CDPHE Class B/A)',
    'Medicare enrollment (CMS-855B)',
    'Worker-owner employment (via Opolis EoR)',
    'Local community relationships',
  ] as const,
} as const;

// ============================================================
// PATRONAGE CALCULATION
// ============================================================

/**
 * Calculate patronage dividend for a single member.
 *
 * Formula: member_dividend = (member_hours / total_hours) × net_surplus
 * Cash: max(20%, cash_election%) × dividend
 * Retained: remainder → equity by vintage
 */
export function calculatePatronageDividend(
  memberHours: number,
  totalCoopHours: number,
  netSurplusCents: number,
  cashElectionPercent: number = 20,
): { dividendCents: number; cashCents: number; retainedCents: number } {
  if (totalCoopHours === 0) {
    return { dividendCents: 0, cashCents: 0, retainedCents: 0 };
  }

  const shareOfHours = memberHours / totalCoopHours;
  const dividendCents = Math.round(shareOfHours * netSurplusCents);
  const effectiveCashPercent = Math.max(20, cashElectionPercent); // 20% minimum
  const cashCents = Math.round(dividendCents * (effectiveCashPercent / 100));
  const retainedCents = dividendCents - cashCents;

  return { dividendCents, cashCents, retainedCents };
}

/**
 * Calculate redemption value based on vesting schedule.
 */
export function calculateRedemptionValue(
  retainedEquityCents: number,
  yearsOfMembership: number,
): number {
  const schedule = FEDERATION_CONSTANTS.VESTING_SCHEDULE;
  let redemptionPercent = 0;

  for (const tier of schedule) {
    if (yearsOfMembership >= tier.years) {
      redemptionPercent = tier.redemptionPercent;
    }
  }

  return Math.round(retainedEquityCents * (redemptionPercent / 100));
}
