/**
 * co-op.care Billing Codes — Complete CMS Revenue Taxonomy
 *
 * Extends RPM codes (in loinc-codes.ts) with the full 10-layer revenue stack
 * from the Strategic Integration Blueprint:
 *
 *   Layer 1: Assessments (CII/CRI) — billable under PIN/CHI
 *   Layer 2: Placement Fee — one-time, private pay
 *   Layer 3: Home Care — $35/hr companion/personal care
 *   Layer 4: PIN (Principal Illness Navigation) — G0023/G0024
 *   Layer 5: CHI (Community Health Integration) — G0019/G0022
 *   Layer 6: CCM (Chronic Care Management) — 99490/99491
 *   Layer 7: RPM (Remote Patient Monitoring) — 99453-99470 (see loinc-codes.ts)
 *   Layer 8: ACCESS Model OAP — Outcome-Aligned Payments
 *   Layer 9: PACE Sub-Capitation — TRU PACE partnership
 *   Layer 10: Employer B2B & LEAD Shared Savings
 *
 * PIN/CHI codes are NEW to Medicare (2024) and stackable with CCM and RPM.
 * ACCESS Model eCKM track launches July 2026.
 *
 * Reference: CMS-1807-F (2024 MPFS Final Rule), CMS ACCESS Model RFA (2025)
 */

// ============================================================
// BILLING CODE CATEGORIES
// ============================================================

export const BILLING_CATEGORIES = [
  'pin', // Principal Illness Navigation
  'chi', // Community Health Integration
  'ccm', // Chronic Care Management
  'rpm', // Remote Patient Monitoring (codes in loinc-codes.ts)
  'access', // ACCESS Model Outcome-Aligned Payments
  'pace', // PACE Sub-Capitation
  'assessment', // CII/CRI billable assessments
  'home_care', // Companion/personal care hourly
  'placement', // One-time placement fee
  'employer', // B2B employer PEPM
] as const;

export type BillingCategory = (typeof BILLING_CATEGORIES)[number];

// ============================================================
// PIN — PRINCIPAL ILLNESS NAVIGATION (CMS-1807-F, effective Jan 2024)
// ============================================================
// Covers care navigation for patients with a single high-risk condition.
// Billed by the clinical team (MD/DO/NP/PA or auxiliary under their direction).
// co-op.care Clinical Director (Josh Emdur, DO) supervises; Conductors execute.

export interface CMSBillingCode {
  code: string;
  display: string;
  category: BillingCategory;
  /** Estimated 2026 national average reimbursement in cents */
  rate2026Cents: number;
  frequency: 'one-time' | 'monthly' | 'per-occurrence';
  /** Minimum minutes per calendar month to bill */
  minMinutes: number;
  /** Required: incident-to or direct supervision level */
  supervisionLevel: 'general' | 'direct' | 'incident-to' | 'none';
  /** Whether code can stack with others in same month */
  canStackWith: string[];
  /** Specific eligibility requirements */
  eligibility: string;
  /** Implementation notes for co-op.care */
  notes: string;
}

export const PIN_CODES: readonly CMSBillingCode[] = [
  {
    code: 'G0023',
    display: 'PIN — first 60 minutes per calendar month',
    category: 'pin',
    rate2026Cents: 10000, // ~$100
    frequency: 'monthly',
    minMinutes: 60,
    supervisionLevel: 'incident-to',
    canStackWith: ['G0024', 'G0019', 'G0022', '99490', '99491', '99453', '99454', '99457'],
    eligibility:
      'Patient with single high-risk condition (e.g., CHF, COPD, diabetes). Requires initiating visit within prior 12 months.',
    notes:
      'Conductor performs navigation; Clinical Director bills incident-to. Includes care plan development, resource navigation, health system interface.',
  },
  {
    code: 'G0024',
    display: 'PIN — each additional 30 minutes per calendar month',
    category: 'pin',
    rate2026Cents: 5000, // ~$50
    frequency: 'monthly',
    minMinutes: 30,
    supervisionLevel: 'incident-to',
    canStackWith: ['G0023', 'G0019', 'G0022', '99490', '99491'],
    eligibility: 'Add-on to G0023. Must have billed G0023 in same month.',
    notes: 'Each additional 30-minute increment beyond initial 60 minutes.',
  },
] as const;

// ============================================================
// CHI — COMMUNITY HEALTH INTEGRATION (CMS-1807-F, effective Jan 2024)
// ============================================================
// Covers SDOH-related services: food insecurity, housing, transportation,
// social isolation, caregiver burden. Maps perfectly to co-op.care's mission.
// Can be billed by CHWs, health educators, peer support — Conductor-eligible.

export const CHI_CODES: readonly CMSBillingCode[] = [
  {
    code: 'G0019',
    display: 'CHI — first 60 minutes per calendar month',
    category: 'chi',
    rate2026Cents: 8500, // ~$85
    frequency: 'monthly',
    minMinutes: 60,
    supervisionLevel: 'general',
    canStackWith: ['G0022', 'G0023', 'G0024', '99490', '99491', '99453', '99454', '99457'],
    eligibility:
      'Patient with SDOH need identified via screening (e.g., PRAPARE, AHC-HRSN). Requires initiating visit within prior 12 months.',
    notes:
      'CHW or Conductor performs community resource navigation, SDOH intervention, caregiver support coordination. General supervision = MD available but not on-site.',
  },
  {
    code: 'G0022',
    display: 'CHI — each additional 30 minutes per calendar month',
    category: 'chi',
    rate2026Cents: 4300, // ~$43
    frequency: 'monthly',
    minMinutes: 30,
    supervisionLevel: 'general',
    canStackWith: ['G0019', 'G0023', 'G0024', '99490', '99491'],
    eligibility: 'Add-on to G0019. Must have billed G0019 in same month.',
    notes: 'Each additional 30-minute increment beyond initial 60 minutes.',
  },
] as const;

// ============================================================
// CCM — CHRONIC CARE MANAGEMENT (existing, updated 2026 rates)
// ============================================================
// Covers non-face-to-face care coordination for patients with 2+ chronic
// conditions expected to last 12+ months. Stackable with PIN, CHI, and RPM.

export const CCM_CODES: readonly CMSBillingCode[] = [
  {
    code: '99490',
    display: 'CCM — first 20 minutes per calendar month',
    category: 'ccm',
    rate2026Cents: 6400, // ~$64
    frequency: 'monthly',
    minMinutes: 20,
    supervisionLevel: 'general',
    canStackWith: ['99491', 'G0019', 'G0022', 'G0023', 'G0024', '99453', '99454', '99457'],
    eligibility:
      'Patient with 2+ chronic conditions expected to last 12+ months. Requires comprehensive care plan. Patient consent required.',
    notes:
      'Non-face-to-face clinical staff time. Documented in EHR. Includes medication management, care plan updates, coordination with specialists.',
  },
  {
    code: '99491',
    display: 'CCM — complex, first 60 minutes per calendar month',
    category: 'ccm',
    rate2026Cents: 13200, // ~$132
    frequency: 'monthly',
    minMinutes: 60,
    supervisionLevel: 'direct',
    canStackWith: ['G0019', 'G0022', 'G0023', 'G0024', '99453', '99454', '99457'],
    eligibility:
      'Patient with 2+ chronic conditions AND substantially complex medical needs. Requires physician/NP/PA time (not auxiliary personnel).',
    notes:
      'Higher reimbursement for complex patients. Clinical Director time. Cannot bill same month as 99490.',
  },
] as const;

// ============================================================
// ACCESS MODEL — Outcome-Aligned Payments (July 2026)
// ============================================================
// CMS ACCESS Model eCKM (enhanced Complex Kidney Management) track.
// Not CPT-code-billed — uses Outcome-Aligned Payment (OAP) methodology.
// 50% of fee withheld, returned based on Outcome Attainment Threshold (OAT).

export interface AccessModelConfig {
  /** Track identifier */
  track: string;
  /** Display name */
  display: string;
  /** Launch date */
  launchDate: string;
  /** Performance period in months */
  performancePeriodMonths: number;
  /** Percentage of fee withheld for outcome attainment */
  withholdPercentage: number;
  /** Outcome Attainment Threshold — minimum to receive withhold back */
  outcomAttainmentThreshold: number;
  /** Monthly estimated payment per beneficiary in cents */
  monthlyPerBeneficiaryCents: number;
  /** Key outcome measures */
  outcomeMeasures: string[];
  /** Notes for co-op.care implementation */
  notes: string;
}

export const ACCESS_MODEL_CONFIG: AccessModelConfig = {
  track: 'eCKM',
  display: 'ACCESS Model — Enhanced Complex Kidney Management',
  launchDate: '2026-07-01',
  performancePeriodMonths: 36,
  withholdPercentage: 50,
  outcomAttainmentThreshold: 0.7, // 70% threshold to receive withhold
  monthlyPerBeneficiaryCents: 15000, // ~$150/beneficiary/month estimated
  outcomeMeasures: [
    'Emergency department utilization reduction',
    'Hospitalization rate reduction',
    'Patient-reported outcome measures (PROMs)',
    'Care plan adherence',
    'SDOH screening completion',
    'Medication adherence',
  ],
  notes:
    'co-op.care applies as eCKM participant organization. Clinical Director provides medical oversight. Conductors deliver care navigation. Galaxy Watch provides RPM data for outcome tracking. July 2026 launch aligns with Medicare licensure timeline.',
} as const;

// ============================================================
// PACE SUB-CAPITATION
// ============================================================

export const PACE_CONFIG = {
  /** TRU PACE partnership — Boulder County */
  PARTNER: 'TRU PACE',
  /** Monthly capitation received per enrollee in cents */
  MONTHLY_RECEIVED_CENTS: 260000, // $2,600/mo
  /** Estimated monthly delivery cost per enrollee in cents */
  MONTHLY_DELIVERY_CENTS: 180000, // $1,800/mo
  /** Estimated monthly margin per enrollee in cents */
  MONTHLY_MARGIN_CENTS: 80000, // $800/mo
  /** Current TRU PACE enrollment in Boulder County */
  CURRENT_ENROLLEES: 341,
  /** Target co-op.care sub-cap enrollees Year 1 */
  TARGET_ENROLLEES_Y1: 20,
  /** Eligibility: 55+ nursing-home-eligible but living in community */
  ELIGIBILITY: 'Age 55+, nursing-home-eligible (Medicaid), living in community',
} as const;

// ============================================================
// ASSESSMENT BILLING (CII/CRI under PIN/CHI)
// ============================================================

export const ASSESSMENT_BILLING = {
  /** CII assessment — billable under CHI (G0019) as SDOH screening */
  CII: {
    display: 'Caregiver Intensity Index Assessment',
    billedUnder: 'G0019',
    estimatedMinutes: 15,
    estimatedRevenueCents: 15000, // $150 (portion of G0019 monthly)
    notes:
      'CII completion counts toward G0019 monthly minutes. Documents caregiver burden as SDOH factor.',
  },
  /** CRI assessment — billable under PIN (G0023) as care navigation */
  CRI: {
    display: 'Care Readiness Index Assessment',
    billedUnder: 'G0023',
    estimatedMinutes: 30,
    estimatedRevenueCents: 30000, // $300 (portion of G0023 monthly)
    notes:
      'CRI completion counts toward G0023 monthly minutes. Documents care readiness for discharge planning.',
  },
} as const;

// ============================================================
// HOME CARE RATES
// ============================================================

export const HOME_CARE_RATES = {
  /** Companion care (Class B license) — co-op.care's primary service */
  COMPANION_RATE_CENTS_PER_HOUR: 3500, // $35/hr
  /** Personal care (Class B expanded) */
  PERSONAL_CARE_RATE_CENTS_PER_HOUR: 3800, // $38/hr
  /** Skilled care (Class A license — future) */
  SKILLED_CARE_RATE_CENTS_PER_HOUR: 4500, // $45/hr
  /** Worker-owner wage range */
  WORKER_WAGE_MIN_CENTS_PER_HOUR: 2500, // $25/hr
  WORKER_WAGE_MAX_CENTS_PER_HOUR: 2800, // $28/hr
  /** Placement fee (one-time per client) */
  PLACEMENT_FEE_CENTS: 50000, // $500
  /** Estimated contribution margin on hourly care */
  CONTRIBUTION_MARGIN_PERCENT: 23,
} as const;

// ============================================================
// EMPLOYER B2B
// ============================================================

export const EMPLOYER_B2B = {
  /** Per-employee-per-month rate for CII as benefit */
  PEPM_CENTS: 450, // $4.50/employee/month
  /** BVSD (Boulder Valley School District) target */
  BVSD_TEACHERS: 1717,
  /** Primary contacts */
  BVSD_CONTACTS: ['David Janak (Benefits Director)', 'Patricia Valderrama'] as const,
  /** Monthly revenue per 1,000 employees */
  REVENUE_PER_1000_EMPLOYEES_CENTS: 450000, // $4,500/mo
} as const;

// ============================================================
// REVENUE STACKING — Maximum Monthly Revenue Per Patient
// ============================================================

/**
 * Calculate maximum monthly revenue per patient across all stackable codes.
 *
 * Full engagement (complex patient, 16+ RPM days, 60+ min each service):
 *   PIN G0023: ~$100 + G0024: ~$50 = $150
 *   CHI G0019: ~$85  + G0022: ~$43 = $128
 *   CCM 99490: ~$64                 = $64
 *   RPM 99454 + 99457 + 99458       = $139
 *   ─────────────────────────────────────────
 *   Total: ~$481/patient/month (plus home care hours)
 *
 * Minimum engagement (2-15 RPM days, 10 min management):
 *   CHI G0019: ~$85                 = $85
 *   RPM 99445 + 99470               = $76
 *   ─────────────────────────────────────────
 *   Total: ~$161/patient/month
 */
export function calculateMaxMonthlyRevenue(params: {
  pinMinutes: number;
  chiMinutes: number;
  ccmMinutes: number;
  rpmDataDays: number;
  rpmManagementMinutes: number;
  isComplexCCM: boolean;
  isFirstRPMMonth: boolean;
}): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let total = 0;

  // PIN
  if (params.pinMinutes >= 60) {
    breakdown['G0023'] = 10000;
    total += 10000;
    const additionalPIN = Math.floor((params.pinMinutes - 60) / 30);
    if (additionalPIN > 0) {
      breakdown['G0024'] = additionalPIN * 5000;
      total += additionalPIN * 5000;
    }
  }

  // CHI
  if (params.chiMinutes >= 60) {
    breakdown['G0019'] = 8500;
    total += 8500;
    const additionalCHI = Math.floor((params.chiMinutes - 60) / 30);
    if (additionalCHI > 0) {
      breakdown['G0022'] = additionalCHI * 4300;
      total += additionalCHI * 4300;
    }
  }

  // CCM (99490 or 99491, not both)
  if (params.isComplexCCM && params.ccmMinutes >= 60) {
    breakdown['99491'] = 13200;
    total += 13200;
  } else if (params.ccmMinutes >= 20) {
    breakdown['99490'] = 6400;
    total += 6400;
  }

  // RPM (delegates to existing calculateMonthlyRPMRevenue logic)
  if (params.isFirstRPMMonth && params.rpmDataDays >= 2) {
    breakdown['99453'] = 2200;
    total += 2200;
  }
  if (params.rpmDataDays >= 16) {
    breakdown['99454'] = 4700;
    total += 4700;
    if (params.rpmManagementMinutes >= 20) {
      breakdown['99457'] = 5200;
      total += 5200;
      const additionalRPM = Math.floor((params.rpmManagementMinutes - 20) / 20);
      if (additionalRPM > 0) {
        breakdown['99458'] = additionalRPM * 4000;
        total += additionalRPM * 4000;
      }
    }
  } else if (params.rpmDataDays >= 2) {
    breakdown['99445'] = 5000;
    total += 5000;
    if (params.rpmManagementMinutes >= 10) {
      breakdown['99470'] = 2600;
      total += 2600;
    }
  }

  return { total, breakdown };
}

// ============================================================
// LMN — LETTER OF MEDICAL NECESSITY (HSA/FSA eligibility)
// ============================================================
// Clinical Director's LMN transforms custodial care into HSA/FSA-eligible
// medical expense. 25-37% savings for families. IRS Pub 502 compliance.

export const LMN_CONFIG = {
  /** HSA/FSA tax savings range */
  TAX_SAVINGS_MIN_PERCENT: 25,
  TAX_SAVINGS_MAX_PERCENT: 37,
  /** LMN valid duration before renewal */
  VALIDITY_MONTHS: 12,
  /** Required elements for IRS Pub 502 compliance */
  REQUIRED_ELEMENTS: [
    'Patient diagnosis (ICD-10)',
    'Medical necessity statement',
    'Prescribed care plan',
    'Duration of care needed',
    'Physician signature and NPI',
    'Date of examination',
  ] as const,
  /** Clinical Director signs all LMNs */
  SIGNING_AUTHORITY: 'Josh Emdur, DO — Physician Clinical Director',
  NOTES:
    'LMN makes companion care HSA/FSA-eligible under IRS Pub 502. Transforms $35/hr companion care from "custodial" to "medical." Family saves 25-37% via pre-tax dollars.',
} as const;

// ============================================================
// ALL BILLING CODES — Unified lookup
// ============================================================

export const ALL_CMS_BILLING_CODES: readonly CMSBillingCode[] = [
  ...PIN_CODES,
  ...CHI_CODES,
  ...CCM_CODES,
] as const;

export function getBillingCode(code: string): CMSBillingCode | undefined {
  return ALL_CMS_BILLING_CODES.find((c) => c.code === code);
}

export function getBillingCodesByCategory(category: BillingCategory): CMSBillingCode[] {
  return ALL_CMS_BILLING_CODES.filter((c) => c.category === category);
}

export function getStackableWith(code: string): string[] {
  const billingCode = getBillingCode(code);
  return billingCode?.canStackWith ?? [];
}
