/**
 * LMN Generator — Autonomous draft generation from structured assessment data
 *
 * This is the revenue engine's core logic. When a family's Living Profile
 * reaches sufficient clinical data (CII + CRI assessments, Omaha problems
 * from Sage conversations), this module auto-generates a draft LMN.
 *
 * Flow:
 *   1. Sage conversations build the Living Profile
 *   2. CII (caregiver burnout) + CRI (care recipient acuity) are scored
 *   3. This module generates a draft LMN from structured data
 *   4. Draft enters Josh's Review Queue (3-5 min review target)
 *   5. Josh signs → family gets LMN → HSA/FSA unlocked ($150-$300/LMN)
 *
 * Physician: Joshua Emdur, DO — 50-state medical licenses, co-founder/CMO
 */
import { logger } from '../../common/logger.js';

// ─── Interfaces ─────────────────────────────────────────────────────────

export interface CareRecipientProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  conditions: string[];
  medications: string[];
  mobilityLevel: 'independent' | 'assisted' | 'dependent' | 'wheelchair';
  riskFlags: string[];
  state: string;
}

export interface CaregiverProfile {
  id: string;
  name: string;
  relationship: string;
  email: string;
}

export interface CIIResult {
  physical: number;
  sleep: number;
  isolation: number;
  total: number;
  zone: 'green' | 'yellow' | 'red';
  completedAt: string;
}

export interface CRIResult {
  mobility: number;
  memory: number;
  dailyTasks: number;
  medications: number;
  social: number;
  total: number;
  zone: 'green' | 'yellow' | 'red';
  omahaFlags: string[];
  completedAt: string;
}

export interface OmahaProblem {
  /** Omaha System problem code (e.g., 'H27', 'B40') */
  code: string;
  /** Problem name */
  name: string;
  /** Domain: Physiological, Psychosocial, Health-related Behaviors, Environmental */
  domain: string;
  /** Knowledge-Behavior-Status rating (1-5, lower = more impaired) */
  kbs?: number;
  /** Source: 'cri' (from CRI assessment) or 'sage' (from conversation analysis) */
  source: 'cri' | 'sage';
}

export interface LMNDraftOutput {
  draftText: string;
  diagnosisCodes: string[];
  omahaProblems: OmahaProblem[];
  recommendedTier: string;
  recommendedHours: number;
  monthlyCost: number;
  estimatedHsaSavings: number;
  acuity: 'low' | 'moderate' | 'high' | 'critical';
  riskFlags: string[];
  reviewPriority: 'standard' | 'elevated' | 'urgent';
  irsCategories: string[];
}

// ─── Omaha → ICD-10 Mapping ────────────────────────────────────────────

/**
 * Maps Omaha System problem codes to relevant ICD-10 diagnosis codes.
 * These are the most common mappings for home care LMN documentation.
 * The physician reviews and adjusts based on the specific clinical picture.
 */
const OMAHA_TO_ICD10: Record<string, { codes: string[]; descriptions: string[] }> = {
  // Physiological domain
  H18: {
    codes: ['M62.81', 'R26.89', 'M79.3'],
    descriptions: [
      'Muscle weakness (generalized)',
      'Other abnormalities of gait and mobility',
      'Panniculitis, unspecified',
    ],
  },
  H27: {
    codes: ['R41.840', 'G31.84', 'F03.90'],
    descriptions: [
      'Attention and concentration deficit',
      'Mild cognitive impairment',
      'Unspecified dementia without behavioral disturbance',
    ],
  },
  // Health-related Behaviors domain
  B36: {
    codes: ['R26.89', 'Z74.1', 'Z74.09'],
    descriptions: [
      'Other abnormalities of gait and mobility',
      'Need for assistance with personal care',
      'Other reduced mobility',
    ],
  },
  B39: {
    codes: ['Z76.3', 'Z74.3', 'Z87.39'],
    descriptions: [
      'Healthy person accompanying sick person',
      'Need for continuous supervision',
      'Other personal history of nervous system and sense organs',
    ],
  },
  B40: {
    codes: ['Z79.899', 'T50.905A', 'Z91.120'],
    descriptions: [
      'Other long term (current) drug therapy',
      'Adverse effect of unspecified drugs',
      "Patient's intentional underdosing of medication regimen due to financial hardship",
    ],
  },
  // Psychosocial domain
  P06: {
    codes: ['Z60.2', 'Z63.79', 'Z73.6'],
    descriptions: [
      'Problems related to living alone',
      'Other stressful life events affecting family and household',
      'Limitation of activities due to disability',
    ],
  },
  // Environmental domain
  E03: {
    codes: ['Z59.19', 'Z59.89'],
    descriptions: [
      'Other inadequate housing',
      'Other problems related to housing and economic circumstances',
    ],
  },
};

/**
 * Common condition-specific ICD-10 codes that appear frequently in companion care LMNs.
 * These are matched by keyword against the care recipient's documented conditions.
 */
const CONDITION_ICD10_MAP: Array<{ keywords: string[]; code: string; description: string }> = [
  {
    keywords: ['dementia', 'alzheimer'],
    code: 'F03.90',
    description: 'Unspecified dementia without behavioral disturbance',
  },
  { keywords: ['alzheimer'], code: 'G30.9', description: "Alzheimer's disease, unspecified" },
  { keywords: ['parkinson'], code: 'G20', description: "Parkinson's disease" },
  {
    keywords: ['diabetes', 'diabetic'],
    code: 'E11.9',
    description: 'Type 2 diabetes mellitus without complications',
  },
  {
    keywords: ['hypertension', 'high blood pressure'],
    code: 'I10',
    description: 'Essential (primary) hypertension',
  },
  {
    keywords: ['atrial fibrillation', 'afib'],
    code: 'I48.91',
    description: 'Unspecified atrial fibrillation',
  },
  { keywords: ['heart failure', 'chf'], code: 'I50.9', description: 'Heart failure, unspecified' },
  {
    keywords: ['copd', 'chronic obstructive'],
    code: 'J44.1',
    description: 'Chronic obstructive pulmonary disease with acute exacerbation',
  },
  {
    keywords: ['osteoarthritis'],
    code: 'M19.90',
    description: 'Unspecified osteoarthritis, unspecified site',
  },
  {
    keywords: ['osteoporosis'],
    code: 'M81.0',
    description: 'Age-related osteoporosis without current pathological fracture',
  },
  {
    keywords: ['depression', 'depressive'],
    code: 'F32.1',
    description: 'Major depressive disorder, single episode, moderate',
  },
  { keywords: ['anxiety'], code: 'F41.1', description: 'Generalized anxiety disorder' },
  {
    keywords: ['chronic kidney', 'ckd', 'renal'],
    code: 'N18.9',
    description: 'Chronic kidney disease, unspecified',
  },
  {
    keywords: ['stroke', 'cva', 'cerebrovascular'],
    code: 'I63.9',
    description: 'Cerebral infarction, unspecified',
  },
  { keywords: ['fall', 'falls', 'fall risk'], code: 'R29.6', description: 'Repeated falls' },
  { keywords: ['chronic pain'], code: 'G89.4', description: 'Chronic pain syndrome' },
  {
    keywords: ['incontinence', 'bladder'],
    code: 'R32',
    description: 'Unspecified urinary incontinence',
  },
  {
    keywords: ['malnutrition', 'weight loss', 'failure to thrive'],
    code: 'R63.4',
    description: 'Abnormal weight loss',
  },
  { keywords: ['dysphagia', 'swallowing'], code: 'R13.10', description: 'Dysphagia, unspecified' },
  { keywords: ['insomnia', 'sleep'], code: 'G47.00', description: 'Insomnia, unspecified' },
];

// ─── IRS Publication 502 Categories ─────────────────────────────────────

/**
 * IRS Publication 502 qualifying categories for HSA/FSA eligibility.
 * These are referenced in the LMN to support reimbursement claims.
 */
const IRS_PUB_502_CATEGORIES = {
  nursingServices: {
    code: 'PUB502-NURSING',
    title: 'Nursing Services',
    description:
      'Wages and other amounts paid for nursing services. Services need not be performed by a nurse as long as the services are of a kind generally performed by a nurse (changing dressings, giving medications, bathing and grooming).',
    irsRef: 'IRS Publication 502, "Nursing Services"',
  },
  longTermCare: {
    code: 'PUB502-LTC',
    title: 'Long-Term Care Services',
    description:
      'Qualified long-term care services are necessary diagnostic, preventive, therapeutic, curing, treating, mitigating, rehabilitative services, and maintenance and personal care services required by a chronically ill individual.',
    irsRef: 'IRS Publication 502, "Long-Term Care"',
  },
  homeImprovement: {
    code: 'PUB502-HOME',
    title: 'Home Improvements for Medical Care',
    description:
      'Amounts paid for special equipment installed in a home or for improvements if their main purpose is medical care for you, your spouse, or your dependent.',
    irsRef: 'IRS Publication 502, "Capital Expenses"',
  },
  attendantCare: {
    code: 'PUB502-ATTENDANT',
    title: 'Attendant Care',
    description:
      'You can include in medical expenses wages and other amounts you pay for the services of an attendant who provides nursing-type services.',
    irsRef: 'IRS Publication 502, "Nursing Services"',
  },
} as const;

// ─── Care Tier Determination ────────────────────────────────────────────

interface CareTier {
  name: string;
  hoursPerWeek: number;
  monthlyRate: number;
  hourlyRate: number;
}

const CARE_TIERS: CareTier[] = [
  { name: 'Peace of Mind', hoursPerWeek: 5, monthlyRate: 550, hourlyRate: 27 },
  { name: 'Regular Companion', hoursPerWeek: 12, monthlyRate: 1320, hourlyRate: 27 },
  { name: 'Daily Companion', hoursPerWeek: 20, monthlyRate: 2200, hourlyRate: 27 },
  { name: 'Intensive Companion', hoursPerWeek: 35, monthlyRate: 3850, hourlyRate: 27 },
  { name: 'Full-Day Support', hoursPerWeek: 40, monthlyRate: 4400, hourlyRate: 27 },
];

function determineTier(
  criScore: number,
  ciiZone: 'green' | 'yellow' | 'red',
  omahaCount: number,
): CareTier {
  // Critical acuity + red zone caregiver = intensive
  if (criScore >= 40 || (criScore >= 33 && ciiZone === 'red')) {
    return omahaCount >= 6 ? CARE_TIERS[4]! : CARE_TIERS[3]!;
  }
  // High acuity
  if (criScore >= 33 || (criScore >= 25 && ciiZone === 'red')) {
    return CARE_TIERS[2]!;
  }
  // Moderate
  if (criScore >= 19 || ciiZone === 'yellow') {
    return CARE_TIERS[1]!;
  }
  // Low — still qualifies if Omaha problems exist
  return CARE_TIERS[0]!;
}

// ─── Acuity Determination ───────────────────────────────────────────────

function determineAcuity(criScore: number): 'low' | 'moderate' | 'high' | 'critical' {
  if (criScore >= 40) return 'critical';
  if (criScore >= 33) return 'high';
  if (criScore >= 19) return 'moderate';
  return 'low';
}

// ─── ICD-10 Code Extraction ─────────────────────────────────────────────

function extractICD10Codes(conditions: string[], omahaProblems: OmahaProblem[]): string[] {
  const codes = new Set<string>();

  // Extract from conditions — look for parenthesized ICD-10 codes first
  for (const condition of conditions) {
    const match = condition.match(/\(([A-Z]\d{2}(?:\.\d{1,4})?)\)/);
    if (match) {
      codes.add(match[1]!);
    } else {
      // Keyword match
      const lower = condition.toLowerCase();
      for (const mapping of CONDITION_ICD10_MAP) {
        if (mapping.keywords.some((kw) => lower.includes(kw))) {
          codes.add(mapping.code);
        }
      }
    }
  }

  // Add codes from Omaha problem mapping
  for (const problem of omahaProblems) {
    const mapping = OMAHA_TO_ICD10[problem.code];
    if (mapping) {
      // Add the primary code (first in the list)
      codes.add(mapping.codes[0]!);
    }
  }

  // Always include caregiver burnout code when generating LMN
  codes.add('Z63.6'); // Problems in relationship — spouse or partner (caregiver stress)

  return Array.from(codes);
}

// ─── Risk Flag Generation ───────────────────────────────────────────────

function generateRiskFlags(
  profile: CareRecipientProfile,
  ciiResult: CIIResult,
  criResult: CRIResult,
  omahaProblems: OmahaProblem[],
): string[] {
  const flags: string[] = [];

  if (ciiResult.zone === 'red') {
    flags.push(
      'CAREGIVER_BURNOUT_CRITICAL: CII score ' +
        ciiResult.total +
        '/30 — caregiver in crisis, care network collapse risk',
    );
  }

  if (criResult.total >= 40) {
    flags.push(
      'ACUITY_CRITICAL: CRI score ' +
        criResult.total +
        '/50 — may require escalation beyond companion care',
    );
  }

  if (profile.age >= 85) {
    flags.push(
      'AGE_ELEVATED_RISK: Patient age ' +
        profile.age +
        ' — elevated fall, cognitive decline, and hospitalization risk',
    );
  }

  if (criResult.mobility >= 8) {
    flags.push(
      'FALL_RISK_HIGH: Mobility score ' +
        criResult.mobility +
        '/10 — immediate fall prevention measures recommended',
    );
  }

  if (criResult.memory >= 8) {
    flags.push(
      'COGNITIVE_DECLINE_SEVERE: Memory score ' +
        criResult.memory +
        '/10 — supervision required for safety',
    );
  }

  if (criResult.medications >= 8) {
    flags.push(
      'MEDICATION_RISK: Medication management score ' +
        criResult.medications +
        '/10 — polypharmacy or non-adherence risk',
    );
  }

  if (profile.medications.length >= 8) {
    flags.push(
      'POLYPHARMACY: ' +
        profile.medications.length +
        ' active medications — increased interaction and adverse event risk',
    );
  }

  if (omahaProblems.some((p) => p.kbs !== undefined && p.kbs <= 1)) {
    flags.push(
      'KBS_CRITICAL: One or more Omaha problem areas have Knowledge-Behavior-Status rating <= 1',
    );
  }

  const mobilityMap: Record<string, string> = {
    wheelchair: 'WHEELCHAIR_DEPENDENT: Transfer assistance required, elevated injury risk',
    dependent: 'MOBILITY_DEPENDENT: Full mobility assistance required',
  };
  const mobilityFlag = mobilityMap[profile.mobilityLevel];
  if (mobilityFlag) {
    flags.push(mobilityFlag);
  }

  return flags;
}

// ─── Review Priority ────────────────────────────────────────────────────

function determineReviewPriority(
  ciiZone: 'green' | 'yellow' | 'red',
  acuity: string,
  riskFlags: string[],
): 'standard' | 'elevated' | 'urgent' {
  if (ciiZone === 'red' || acuity === 'critical' || riskFlags.length >= 4) return 'urgent';
  if (ciiZone === 'yellow' || acuity === 'high' || riskFlags.length >= 2) return 'elevated';
  return 'standard';
}

// ─── HSA Savings Estimate ───────────────────────────────────────────────

/**
 * Estimate HSA/FSA savings based on monthly cost and typical tax bracket.
 * Uses 36% as the upper estimate (32% federal + ~4% state for CO).
 * Conservative estimate uses 28% (24% federal bracket).
 */
function estimateHsaSavings(monthlyCost: number): number {
  // Use midpoint of 28-36% range = 32% effective savings
  return Math.round(monthlyCost * 0.36);
}

// ─── IRS Category Determination ─────────────────────────────────────────

function determineIrsCategories(acuity: string, omahaProblems: OmahaProblem[]): string[] {
  const categories: string[] = [];

  // Nursing services — always applicable for personal care
  categories.push(IRS_PUB_502_CATEGORIES.nursingServices.irsRef);

  // Attendant care — applicable when nursing-type services needed
  if (omahaProblems.some((p) => p.code === 'B36' || p.code === 'B40')) {
    categories.push(IRS_PUB_502_CATEGORIES.attendantCare.irsRef);
  }

  // Long-term care — applicable for chronic conditions
  if (acuity === 'high' || acuity === 'critical') {
    categories.push(IRS_PUB_502_CATEGORIES.longTermCare.irsRef);
  }

  // Home improvements — applicable when residence safety is flagged
  if (omahaProblems.some((p) => p.code === 'E03')) {
    categories.push(IRS_PUB_502_CATEGORIES.homeImprovement.irsRef);
  }

  return categories;
}

// ─── LMN Template ───────────────────────────────────────────────────────

/**
 * Professional LMN template. Produces a letter that a physician would sign.
 * All placeholders are filled from structured assessment data.
 */
export const LMN_TEMPLATE = `LETTER OF MEDICAL NECESSITY

Date: {{letterDate}}
Document ID: {{documentId}}

PATIENT INFORMATION
  Name: {{patientName}}
  Date of Birth: {{patientDOB}}
  Age: {{patientAge}}
  State of Residence: {{patientState}}

ISSUING PHYSICIAN
  Name: Joshua Emdur, DO
  Title: Chief Medical Officer, co-op.care
  NPI: {{physicianNPI}}
  Medical License: Active in all 50 states and the District of Columbia

TO WHOM IT MAY CONCERN:

I, Joshua Emdur, DO, am writing to certify that {{patientName}}, age {{patientAge}}, requires medically necessary in-home companion and personal care services. This determination is based on a comprehensive multi-domain clinical assessment conducted through the co-op.care Care Assessment System, which utilizes the validated Omaha System classification framework for home health documentation.

CLINICAL ASSESSMENT SUMMARY

  Caregiver Impact Index (CII): {{ciiScore}}/30 — {{ciiZoneLabel}}
    The primary caregiver, {{caregiverName}} ({{caregiverRelationship}}), demonstrates {{ciiClinicalDescription}}. {{ciiClinicalImplication}}

  Care Readiness Index (CRI): {{criScore}}/50 — {{acuityLabel}} Acuity
    Subscale scores:
      Mobility:    {{criMobility}}/10
      Memory:      {{criMemory}}/10
      Daily Tasks: {{criDailyTasks}}/10
      Medications: {{criMedications}}/10
      Social:      {{criSocial}}/10

    The CRI assessment indicates {{criClinicalDescription}}.

DIAGNOSES (ICD-10-CM)
{{diagnosisList}}

IDENTIFIED PROBLEMS — OMAHA SYSTEM CLASSIFICATION
{{omahaList}}

FUNCTIONAL LIMITATIONS AND CARE NEEDS
{{functionalLimitations}}

RECOMMENDED SERVICES
  Service Tier: {{recommendedTier}}
  Hours per Week: {{recommendedHours}}
  Estimated Monthly Cost: \${{monthlyCost}}

  Specific services recommended:
{{servicesList}}

MEDICAL NECESSITY DETERMINATION

Based on the clinical assessment (CRI score: {{criScore}}/50, acuity: {{acuityLabel}}), the documented diagnoses, and the identified functional limitations, I certify that the above-described in-home companion and personal care services are medically necessary for {{patientName}}.

Without these services, the patient is at increased and documented risk for:
  - Hospitalization or emergency department utilization due to unmonitored chronic conditions
  - Accelerated functional and cognitive decline secondary to inadequate daily support
  - Caregiver burnout and collapse of the informal care network (CII: {{ciiScore}}/30)
  - Adverse health events including falls, medication errors, malnutrition, and social isolation
  - Premature institutional placement that could be prevented with adequate home support

HSA/FSA ELIGIBILITY DETERMINATION

These services qualify as medical care expenses under the following IRS Publication 502 categories:
{{irsCategories}}

Per IRS guidelines, expenses for medical care include "amounts paid for the diagnosis, cure, mitigation, treatment, or prevention of disease, or for the purpose of affecting any structure or function of the body" (IRC Section 213(d)). Qualified long-term care services for a chronically ill individual, including maintenance or personal care services, are deductible medical expenses eligible for HSA and FSA distribution.

The patient meets the definition of a "chronically ill individual" under IRC Section 7702B(c)(2) as they are unable to perform at least two Activities of Daily Living without substantial assistance for a period of at least 90 days, OR require substantial supervision due to cognitive impairment.

Estimated pre-tax savings: \${{hsaSavings}}/month (based on applicable federal and state tax rates)

PHYSICIAN CERTIFICATION

I, Joshua Emdur, DO, certify that:
  1. I have reviewed the clinical assessment data for {{patientName}}
  2. The information provided in this letter is accurate and complete
  3. The recommended in-home care services are medically necessary
  4. This determination is based on accepted standards of medical practice
  5. I hold active medical licenses in the patient's state of residence ({{patientState}})

This Letter of Medical Necessity is valid for 365 days from the date of issuance.
A reassessment will be required prior to expiration to maintain HSA/FSA eligibility.

Respectfully,

Joshua Emdur, DO
Chief Medical Officer, co-op.care
Board Certified — Internal Medicine

Date Signed: ____________________
Electronic Signature: ____________________`;

// ─── Template Population ────────────────────────────────────────────────

function getCIIZoneLabel(zone: 'green' | 'yellow' | 'red'): string {
  return { green: 'Manageable', yellow: 'Strained', red: 'Crisis' }[zone];
}

function getCIIClinicalDescription(ciiResult: CIIResult): string {
  if (ciiResult.zone === 'red') {
    return 'significant caregiver burden with physical exhaustion, sleep disruption, and social isolation';
  }
  if (ciiResult.zone === 'yellow') {
    return 'moderate caregiver strain with emerging signs of fatigue and reduced social engagement';
  }
  return 'currently manageable caregiver burden with adequate coping resources';
}

function getCIIClinicalImplication(ciiResult: CIIResult): string {
  if (ciiResult.zone === 'red') {
    return 'Without professional companion care support, the informal care network is at imminent risk of collapse, which would likely result in emergency placement or hospitalization.';
  }
  if (ciiResult.zone === 'yellow') {
    return 'Structured companion care will prevent further caregiver deterioration and maintain the viability of the home care arrangement.';
  }
  return 'Companion care services will sustain the current care arrangement and prevent caregiver burnout escalation.';
}

function getCRIClinicalDescription(criResult: CRIResult): string {
  const acuity = determineAcuity(criResult.total);
  if (acuity === 'critical') {
    return 'critical functional impairment across multiple domains requiring intensive daily in-home support to maintain safety and prevent hospitalization';
  }
  if (acuity === 'high') {
    return 'significant functional limitations requiring structured, regular in-home assistance with activities of daily living and instrumental activities of daily living';
  }
  if (acuity === 'moderate') {
    return 'moderate functional limitations in select domains, with ongoing companion support recommended to prevent decline and maintain independence';
  }
  return 'mild functional limitations with proactive companion support indicated to maintain current functional status';
}

function generateFunctionalLimitations(
  profile: CareRecipientProfile,
  criResult: CRIResult,
  _omahaProblems: OmahaProblem[],
): string {
  const limitations: string[] = [];

  if (criResult.mobility >= 7) {
    limitations.push(
      `  - Mobility impairment (CRI mobility: ${criResult.mobility}/10): ${profile.mobilityLevel === 'wheelchair' ? 'Wheelchair-dependent, requires transfer assistance' : profile.mobilityLevel === 'dependent' ? 'Unable to ambulate safely without physical assistance' : 'Requires assistive device and supervision for safe ambulation'}. Fall risk is elevated.`,
    );
  }

  if (criResult.memory >= 7) {
    limitations.push(
      `  - Cognitive impairment (CRI memory: ${criResult.memory}/10): Demonstrates significant memory deficits affecting safety judgment, medication self-management, and ability to respond to emergencies. Requires regular supervision.`,
    );
  }

  if (criResult.dailyTasks >= 7) {
    limitations.push(
      `  - ADL limitations (CRI daily tasks: ${criResult.dailyTasks}/10): Unable to independently perform at least two Activities of Daily Living including bathing, dressing, toileting, and/or grooming without substantial human assistance.`,
    );
  }

  if (criResult.medications >= 7) {
    limitations.push(
      `  - Medication management deficit (CRI medications: ${criResult.medications}/10): Unable to reliably self-administer prescribed medications. ${profile.medications.length} active medications require monitoring for adherence and adverse effects.`,
    );
  }

  if (criResult.social >= 7) {
    limitations.push(
      `  - Social isolation (CRI social: ${criResult.social}/10): Significant withdrawal from social engagement, contributing to depressive symptoms and accelerated cognitive decline. Companionship intervention is indicated.`,
    );
  }

  // Add condition-specific limitations
  const condLower = profile.conditions.map((c) => c.toLowerCase()).join(' ');
  if (condLower.includes('dementia') || condLower.includes('alzheimer')) {
    limitations.push(
      '  - Progressive neurocognitive disorder requiring ongoing supervision for safety, redirection, and behavioral management.',
    );
  }
  if (condLower.includes('parkinson')) {
    limitations.push(
      '  - Movement disorder with freezing episodes, postural instability, and medication timing sensitivity requiring trained companion support.',
    );
  }

  if (limitations.length === 0) {
    limitations.push(
      `  - Functional limitations across assessed domains (CRI total: ${criResult.total}/50) indicate need for structured companion support to maintain current independence level and prevent functional decline.`,
    );
  }

  return limitations.join('\n');
}

function generateServicesList(
  tier: CareTier,
  omahaProblems: OmahaProblem[],
  profile: CareRecipientProfile,
): string {
  const services: string[] = [];

  // Core companion services (always included)
  services.push('    - Companionship and social engagement during scheduled visits');
  services.push('    - Ongoing observation and documentation of health status changes');
  services.push('    - Care coordination with primary care team and family caregivers');

  // Omaha-driven services
  if (omahaProblems.some((p) => p.code === 'H18')) {
    services.push('    - Mobility assistance, fall prevention, and safe ambulation support');
  }
  if (omahaProblems.some((p) => p.code === 'H27')) {
    services.push('    - Cognitive stimulation activities and safety supervision');
    services.push('    - Orientation support and behavioral redirection as needed');
  }
  if (omahaProblems.some((p) => p.code === 'B40')) {
    services.push('    - Medication reminders and adherence monitoring');
  }
  if (omahaProblems.some((p) => p.code === 'B36')) {
    services.push('    - Personal care assistance (bathing, dressing, grooming, toileting)');
  }
  if (omahaProblems.some((p) => p.code === 'P06')) {
    services.push('    - Social engagement facilitation and isolation prevention');
  }
  if (omahaProblems.some((p) => p.code === 'E03')) {
    services.push('    - Home safety assessment and hazard mitigation');
  }
  if (omahaProblems.some((p) => p.code === 'B39')) {
    services.push('    - Health care appointment coordination and transportation assistance');
  }

  // Tier-specific additions
  if (tier.hoursPerWeek >= 20) {
    services.push('    - Meal preparation and nutritional monitoring');
    services.push('    - Light housekeeping to maintain safe living environment');
  }
  if (tier.hoursPerWeek >= 35) {
    services.push('    - Respite care for primary family caregiver (burnout prevention)');
    services.push('    - Overnight monitoring as clinically indicated');
  }

  // Condition-specific
  const condLower = profile.conditions.map((c) => c.toLowerCase()).join(' ');
  if (condLower.includes('diabetes')) {
    services.push('    - Blood glucose monitoring reminders and dietary support');
  }

  services.push('    - Regular care plan review and KBS outcome tracking via Omaha System');

  return services.join('\n');
}

function populateTemplate(
  profile: CareRecipientProfile,
  caregiver: CaregiverProfile,
  ciiResult: CIIResult,
  criResult: CRIResult,
  omahaProblems: OmahaProblem[],
  diagnosisCodes: string[],
  tier: CareTier,
  acuity: string,
  hsaSavings: number,
  irsCategories: string[],
  documentId: string,
): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build diagnosis list
  const diagnosisList = diagnosisCodes
    .map((code) => {
      // Try to find description from condition mappings
      const mapping = CONDITION_ICD10_MAP.find((m) => m.code === code);
      const desc = mapping ? mapping.description : code;
      return `  ${code} — ${desc}`;
    })
    .join('\n');

  // Build Omaha problems list
  const omahaList = omahaProblems
    .map((p) => {
      const kbsStr = p.kbs !== undefined ? ` (KBS: ${p.kbs}/5)` : '';
      return `  ${p.code}: ${p.name} — ${p.domain}${kbsStr}`;
    })
    .join('\n');

  // Build IRS categories list
  const irsList = irsCategories.map((c) => `  - ${c}`).join('\n');

  const replacements: Record<string, string> = {
    '{{letterDate}}': today,
    '{{documentId}}': documentId,
    '{{patientName}}': profile.name,
    '{{patientDOB}}': profile.dateOfBirth,
    '{{patientAge}}': String(profile.age),
    '{{patientState}}': profile.state,
    '{{physicianNPI}}': '[NPI on file — co-op.care Medical Director]',
    '{{ciiScore}}': String(ciiResult.total),
    '{{ciiZoneLabel}}': getCIIZoneLabel(ciiResult.zone),
    '{{caregiverName}}': caregiver.name,
    '{{caregiverRelationship}}': caregiver.relationship,
    '{{ciiClinicalDescription}}': getCIIClinicalDescription(ciiResult),
    '{{ciiClinicalImplication}}': getCIIClinicalImplication(ciiResult),
    '{{criScore}}': String(criResult.total),
    '{{acuityLabel}}': acuity.charAt(0).toUpperCase() + acuity.slice(1),
    '{{criMobility}}': String(criResult.mobility),
    '{{criMemory}}': String(criResult.memory),
    '{{criDailyTasks}}': String(criResult.dailyTasks),
    '{{criMedications}}': String(criResult.medications),
    '{{criSocial}}': String(criResult.social),
    '{{criClinicalDescription}}': getCRIClinicalDescription(criResult),
    '{{diagnosisList}}': diagnosisList,
    '{{omahaList}}': omahaList,
    '{{functionalLimitations}}': generateFunctionalLimitations(profile, criResult, omahaProblems),
    '{{recommendedTier}}': tier.name,
    '{{recommendedHours}}': String(tier.hoursPerWeek),
    '{{monthlyCost}}': tier.monthlyRate.toLocaleString(),
    '{{servicesList}}': generateServicesList(tier, omahaProblems, profile),
    '{{hsaSavings}}': hsaSavings.toLocaleString(),
    '{{irsCategories}}': irsList,
  };

  let text = LMN_TEMPLATE;
  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.split(placeholder).join(value);
  }
  return text;
}

// ─── Main Generator Function ────────────────────────────────────────────

/**
 * Generate a complete LMN draft from structured assessment data.
 *
 * This function is the core of the autonomous LMN pipeline. It takes:
 *   - Care recipient profile (from Living Profile)
 *   - CII assessment result (caregiver burnout)
 *   - CRI assessment result (care recipient acuity)
 *   - Omaha problems (from CRI flags + Sage conversation analysis)
 *
 * And produces a complete draft LMN with:
 *   - Professional letter text ready for physician review
 *   - Extracted ICD-10 codes
 *   - Care tier recommendation with pricing
 *   - HSA/FSA savings estimate
 *   - Risk flags for priority routing
 *   - Review priority (standard/elevated/urgent)
 *
 * The draft enters Josh's Review Queue. Target review time: 3-5 minutes.
 */
export function generateLMNDraft(
  profile: CareRecipientProfile,
  caregiver: CaregiverProfile,
  ciiResult: CIIResult,
  criResult: CRIResult,
  omahaProblems: OmahaProblem[],
): LMNDraftOutput {
  // 1. Determine acuity from CRI score
  const acuity = determineAcuity(criResult.total);

  // 2. Extract ICD-10 codes from conditions + Omaha mapping
  const diagnosisCodes = extractICD10Codes(profile.conditions, omahaProblems);

  // 3. Determine recommended care tier
  const tier = determineTier(criResult.total, ciiResult.zone, omahaProblems.length);

  // 4. Calculate HSA savings estimate
  const hsaSavings = estimateHsaSavings(tier.monthlyRate);

  // 5. Generate risk flags for review queue
  const riskFlags = generateRiskFlags(profile, ciiResult, criResult, omahaProblems);

  // 6. Determine review priority (Josh sees urgent first)
  const reviewPriority = determineReviewPriority(ciiResult.zone, acuity, riskFlags);

  // 7. Determine IRS 502 qualifying categories
  const irsCategories = determineIrsCategories(acuity, omahaProblems);

  // 8. Generate document ID
  const documentId = `LMN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  // 9. Populate the template with all structured data
  const draftText = populateTemplate(
    profile,
    caregiver,
    ciiResult,
    criResult,
    omahaProblems,
    diagnosisCodes,
    tier,
    acuity,
    hsaSavings,
    irsCategories,
    documentId,
  );

  logger.info(
    {
      documentId,
      patientAge: profile.age,
      criScore: criResult.total,
      ciiZone: ciiResult.zone,
      acuity,
      tier: tier.name,
      omahaCount: omahaProblems.length,
      diagnosisCount: diagnosisCodes.length,
      riskFlagCount: riskFlags.length,
      reviewPriority,
    },
    'LMN draft generated autonomously',
  );

  return {
    draftText,
    diagnosisCodes,
    omahaProblems,
    recommendedTier: tier.name,
    recommendedHours: tier.hoursPerWeek,
    monthlyCost: tier.monthlyRate,
    estimatedHsaSavings: hsaSavings,
    acuity,
    riskFlags,
    reviewPriority,
    irsCategories,
  };
}

// ─── Eligibility Check ─────────────────────────────────────────────────

/**
 * Check whether a family's assessment data meets the threshold for LMN generation.
 * An LMN should only be generated when there is sufficient clinical justification.
 */
export function checkLMNEligibility(
  criResult: CRIResult,
  ciiResult: CIIResult,
  omahaProblems: OmahaProblem[],
): { eligible: boolean; reason: string } {
  // Must have at least moderate CRI acuity (score >= 19)
  if (criResult.total < 19 && ciiResult.zone === 'green' && omahaProblems.length < 3) {
    return {
      eligible: false,
      reason:
        'CRI score below moderate threshold and caregiver is not strained. Companion care may be beneficial but does not currently meet medical necessity criteria for HSA/FSA eligibility.',
    };
  }

  // Must have at least 2 Omaha problems identified
  if (omahaProblems.length < 2) {
    return {
      eligible: false,
      reason:
        'Insufficient clinical documentation. At least 2 Omaha System problems must be identified through assessment or Sage conversation analysis.',
    };
  }

  // Yellow/red caregiver zone + any Omaha problems qualifies
  if (ciiResult.zone !== 'green' && omahaProblems.length >= 2) {
    return {
      eligible: true,
      reason:
        'Caregiver burnout (' +
        getCIIZoneLabel(ciiResult.zone) +
        ') combined with documented care needs meets medical necessity threshold.',
    };
  }

  // Moderate+ CRI qualifies
  if (criResult.total >= 19) {
    return {
      eligible: true,
      reason:
        'CRI score of ' +
        criResult.total +
        '/50 (' +
        determineAcuity(criResult.total) +
        ' acuity) meets medical necessity threshold for in-home companion care.',
    };
  }

  // Edge case: many Omaha problems even with lower scores
  if (omahaProblems.length >= 4) {
    return {
      eligible: true,
      reason:
        omahaProblems.length +
        ' Omaha System problems identified across multiple domains, indicating sufficient clinical complexity for medical necessity determination.',
    };
  }

  return {
    eligible: false,
    reason:
      'Current assessment data does not meet medical necessity threshold. Continue Sage conversations to build clinical documentation.',
  };
}

// ─── Exports ────────────────────────────────────────────────────────────

export {
  OMAHA_TO_ICD10,
  IRS_PUB_502_CATEGORIES,
  CARE_TIERS,
  CONDITION_ICD10_MAP,
  determineTier,
  determineAcuity,
  extractICD10Codes,
  generateRiskFlags,
  estimateHsaSavings,
};
