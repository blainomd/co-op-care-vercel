/**
 * Fall Risk Assessment and Reimbursement Engine
 *
 * Fall risk is the gateway event for co-op.care's entire revenue cascade.
 * This module implements:
 *
 *   1. CDC STEADI (Stay Independent) 12-question screening
 *   2. Timed Up and Go (TUG) clinical test scoring
 *   3. Fall Risk Composite Score (STEADI + TUG + PROMIS + environment + medications)
 *   4. Reimbursement Cascade Calculator — the full 10-layer revenue opportunity
 *   5. CARA Act (Caregiver Advise, Record, Enable) state compliance map
 *   6. Conversational fall risk items for Sage AI
 *   7. Fall Risk → LMN bridge (medical necessity language generation)
 *   8. Outcome tracking for fall prevention (30/60/90-day follow-ups)
 *   9. Fall risk medication database with fuzzy matching
 *  10. Full Reimbursement Narrative Generator — the crown jewel
 *
 * Revenue flow:
 *   Family identifies fall risk → STEADI screening → ICD-10 codes →
 *   LMN (Josh Emdur signs) → HSA/FSA eligible → PIN/CHI billing →
 *   RPM monitoring (Galaxy Watch) → CARA Act compliance →
 *   ACCESS Model outcome-aligned payments
 *
 * Reference: CDC STEADI Toolkit (2023), CMS-1807-F (2024 MPFS Final Rule),
 * CARA Act (enacted 40+ states), IRS Pub 502
 */

import {
  HOME_CARE_RATES,
  LMN_CONFIG,
  ACCESS_MODEL_CONFIG,
  PACE_CONFIG,
} from '@shared/constants/billing-codes';
import { DEFAULT_ICD10_OMAHA_MAPPINGS, getOmahaForICD10 } from '@shared/constants/icd10-crosswalk';

// ============================================================
// STEADI SCREENING — CDC Stay Independent Questionnaire
// ============================================================

/** A single STEADI screening question */
export interface STEADIQuestion {
  /** Unique question identifier */
  id: string;
  /** Question text (patient-facing) */
  text: string;
  /** Category for clinical interpretation */
  category: 'history' | 'functional' | 'environmental' | 'medication';
}

/**
 * CDC STEADI Stay Independent Questionnaire — 12 yes/no questions.
 * Score >= 4 = high fall risk. Validated screening tool.
 * Source: https://www.cdc.gov/steadi/pdf/STEADI-Brochure-StayIndependent-508.pdf
 */
export const STEADI_QUESTIONS: readonly STEADIQuestion[] = [
  {
    id: 'steadi_1',
    text: 'I have fallen in the past year',
    category: 'history',
  },
  {
    id: 'steadi_2',
    text: 'I use or have been advised to use a cane or walker to get around safely',
    category: 'functional',
  },
  {
    id: 'steadi_3',
    text: 'Sometimes I feel unsteady when I am walking',
    category: 'functional',
  },
  {
    id: 'steadi_4',
    text: 'I steady myself by holding onto furniture when walking at home',
    category: 'functional',
  },
  {
    id: 'steadi_5',
    text: 'I am worried about falling',
    category: 'history',
  },
  {
    id: 'steadi_6',
    text: 'I need to push with my hands to stand up from a chair',
    category: 'functional',
  },
  {
    id: 'steadi_7',
    text: 'I have some trouble stepping up onto a curb',
    category: 'functional',
  },
  {
    id: 'steadi_8',
    text: 'I often have to rush to the toilet',
    category: 'functional',
  },
  {
    id: 'steadi_9',
    text: 'I have lost some feeling in my feet',
    category: 'medication',
  },
  {
    id: 'steadi_10',
    text: 'I take medicine that sometimes makes me feel light-headed or more tired than usual',
    category: 'medication',
  },
  {
    id: 'steadi_11',
    text: 'I take medicine to help me sleep or improve my mood',
    category: 'medication',
  },
  {
    id: 'steadi_12',
    text: 'I often feel sad or depressed',
    category: 'history',
  },
] as const;

/** STEADI risk thresholds */
export const STEADI_THRESHOLDS = {
  LOW_MAX: 1, // 0-1 = low risk
  MODERATE_MAX: 3, // 2-3 = moderate risk
  HIGH_MIN: 4, // 4+ = high risk (CDC cutoff)
} as const;

/** STEADI risk level classification */
export type STEADIRisk = 'low' | 'moderate' | 'high';

/**
 * Classify STEADI risk from total yes-count.
 * CDC protocol: score >= 4 = high fall risk requiring further assessment.
 */
export function classifySTEADIRisk(score: number): STEADIRisk {
  if (score >= STEADI_THRESHOLDS.HIGH_MIN) return 'high';
  if (score > STEADI_THRESHOLDS.LOW_MAX) return 'moderate';
  return 'low';
}

/**
 * Score the STEADI questionnaire from a map of question responses.
 * Each "yes" response counts as 1 point. Score range: 0-12.
 */
export function scoreSTEADI(responses: Record<string, boolean>): {
  score: number;
  risk: STEADIRisk;
  categoryBreakdown: Record<string, number>;
} {
  let score = 0;
  const categoryBreakdown: Record<string, number> = {
    history: 0,
    functional: 0,
    environmental: 0,
    medication: 0,
  };

  for (const question of STEADI_QUESTIONS) {
    if (responses[question.id]) {
      score += 1;
      categoryBreakdown[question.category] = (categoryBreakdown[question.category] ?? 0) + 1;
    }
  }

  return {
    score,
    risk: classifySTEADIRisk(score),
    categoryBreakdown,
  };
}

// ============================================================
// TIMED UP AND GO (TUG) — Clinical Test
// ============================================================

/** Observed gait abnormalities during TUG */
export type GaitIssue =
  | 'shuffling'
  | 'wide_base'
  | 'asymmetric_stride'
  | 'decreased_arm_swing'
  | 'trunk_sway'
  | 'hesitation_turning'
  | 'unsteady_sit_to_stand'
  | 'reached_for_support';

/** Result of a Timed Up and Go clinical test */
export interface TUGResult {
  /** Time in seconds to complete the TUG */
  timeSeconds: number;
  /** Classified risk level: <12s low, 12-20s moderate, >20s high */
  riskLevel: 'low' | 'moderate' | 'high';
  /** Assistive device used during the test, if any */
  assistiveDevice?: string;
  /** Gait abnormalities observed during the test */
  observedGaitIssues: GaitIssue[];
}

/** TUG time thresholds (in seconds) per CDC STEADI protocol */
export const TUG_THRESHOLDS = {
  LOW_MAX: 12, // <12s = low risk
  MODERATE_MAX: 20, // 12-20s = moderate risk
  HIGH_MIN: 20, // >20s = high risk
} as const;

/**
 * Score a Timed Up and Go test.
 * CDC STEADI: <12 sec = low, 12-20 sec = moderate, >20 sec = high.
 */
export function scoreTUG(
  timeSeconds: number,
  assistiveDevice?: string,
  observedGaitIssues: GaitIssue[] = [],
): TUGResult {
  let riskLevel: 'low' | 'moderate' | 'high';
  if (timeSeconds > TUG_THRESHOLDS.MODERATE_MAX) {
    riskLevel = 'high';
  } else if (timeSeconds >= TUG_THRESHOLDS.LOW_MAX) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  return {
    timeSeconds,
    riskLevel,
    assistiveDevice,
    observedGaitIssues,
  };
}

// ============================================================
// FALL RISK MEDICATIONS DATABASE
// ============================================================

/** A class of medications known to increase fall risk */
export interface FallRiskMedicationClass {
  /** Drug class name */
  class: string;
  /** Common generic names */
  examples: string[];
  /** Mechanism by which this class increases fall risk */
  mechanism: string;
  /** Risk level: moderate or high */
  riskLevel: 'moderate' | 'high';
}

/**
 * Medications that increase fall risk in older adults.
 * Based on AGS Beers Criteria and CDC STEADI medication review guidelines.
 */
export const FALL_RISK_MEDICATIONS: readonly FallRiskMedicationClass[] = [
  {
    class: 'Benzodiazepines',
    examples: ['diazepam', 'lorazepam', 'alprazolam', 'clonazepam', 'temazepam'],
    mechanism: 'Sedation, impaired balance and coordination, prolonged reaction time',
    riskLevel: 'high',
  },
  {
    class: 'Opioids',
    examples: ['oxycodone', 'hydrocodone', 'morphine', 'tramadol', 'codeine', 'fentanyl'],
    mechanism: 'Sedation, dizziness, impaired cognition and psychomotor function',
    riskLevel: 'high',
  },
  {
    class: 'Antihypertensives',
    examples: ['lisinopril', 'amlodipine', 'metoprolol', 'losartan', 'atenolol', 'hydralazine'],
    mechanism: 'Orthostatic hypotension, dizziness upon standing',
    riskLevel: 'moderate',
  },
  {
    class: 'Antidepressants (SSRIs)',
    examples: ['sertraline', 'fluoxetine', 'citalopram', 'escitalopram', 'paroxetine'],
    mechanism: 'Hyponatremia, dizziness, impaired gait, increased sway',
    riskLevel: 'moderate',
  },
  {
    class: 'Antidepressants (TCAs)',
    examples: ['amitriptyline', 'nortriptyline', 'doxepin', 'imipramine'],
    mechanism: 'Orthostatic hypotension, sedation, anticholinergic effects',
    riskLevel: 'high',
  },
  {
    class: 'Antipsychotics',
    examples: ['quetiapine', 'risperidone', 'olanzapine', 'haloperidol', 'aripiprazole'],
    mechanism: 'Sedation, orthostatic hypotension, extrapyramidal symptoms',
    riskLevel: 'high',
  },
  {
    class: 'Antihistamines (first-generation)',
    examples: ['diphenhydramine', 'hydroxyzine', 'chlorpheniramine', 'promethazine'],
    mechanism: 'Sedation, anticholinergic effects, impaired cognition',
    riskLevel: 'moderate',
  },
  {
    class: 'Diuretics',
    examples: ['furosemide', 'hydrochlorothiazide', 'bumetanide', 'spironolactone'],
    mechanism: 'Dehydration, electrolyte imbalance, orthostatic hypotension',
    riskLevel: 'moderate',
  },
  {
    class: 'Hypnotics (Z-drugs)',
    examples: ['zolpidem', 'eszopiclone', 'zaleplon'],
    mechanism: 'Residual sedation, impaired cognition, nocturnal falls',
    riskLevel: 'high',
  },
  {
    class: 'Muscle Relaxants',
    examples: ['cyclobenzaprine', 'methocarbamol', 'tizanidine', 'baclofen', 'carisoprodol'],
    mechanism: 'Sedation, muscle weakness, impaired coordination',
    riskLevel: 'high',
  },
  {
    class: 'Anticonvulsants',
    examples: [
      'gabapentin',
      'pregabalin',
      'topiramate',
      'carbamazepine',
      'phenytoin',
      'valproic acid',
    ],
    mechanism: 'Dizziness, ataxia, drowsiness, impaired coordination',
    riskLevel: 'moderate',
  },
  {
    class: 'Alpha-blockers',
    examples: ['tamsulosin', 'doxazosin', 'prazosin', 'terazosin'],
    mechanism: 'Orthostatic hypotension, first-dose syncope risk',
    riskLevel: 'moderate',
  },
  {
    class: 'Nitrates',
    examples: ['nitroglycerin', 'isosorbide mononitrate', 'isosorbide dinitrate'],
    mechanism: 'Orthostatic hypotension, lightheadedness',
    riskLevel: 'moderate',
  },
] as const;

/** Result of matching a patient's medication against fall risk database */
export interface FallRiskMedicationMatch {
  /** The medication name from the patient's list */
  patientMedication: string;
  /** The matched drug class */
  matchedClass: string;
  /** The specific example that matched */
  matchedExample: string;
  /** Mechanism of fall risk */
  mechanism: string;
  /** Risk level */
  riskLevel: 'moderate' | 'high';
}

/**
 * Identify fall-risk medications from a patient's medication list.
 * Uses case-insensitive substring matching to handle brand names and variations.
 */
export function identifyFallRiskMedications(medicationList: string[]): FallRiskMedicationMatch[] {
  const matches: FallRiskMedicationMatch[] = [];

  for (const med of medicationList) {
    const normalizedMed = med.toLowerCase().trim();

    for (const drugClass of FALL_RISK_MEDICATIONS) {
      for (const example of drugClass.examples) {
        if (
          normalizedMed.includes(example) ||
          example.includes(normalizedMed) ||
          levenshteinDistance(normalizedMed.split(' ')[0] ?? normalizedMed, example) <= 2
        ) {
          matches.push({
            patientMedication: med,
            matchedClass: drugClass.class,
            matchedExample: example,
            mechanism: drugClass.mechanism,
            riskLevel: drugClass.riskLevel,
          });
          break; // Only match each patient med to one example per class
        }
      }
    }
  }

  return matches;
}

/**
 * Simple Levenshtein distance for fuzzy medication matching.
 * Handles typos and minor spelling variations.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  const row0 = matrix[0]!;
  for (let j = 0; j <= a.length; j++) {
    row0[j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    const currentRow = matrix[i]!;
    const prevRow = matrix[i - 1]!;
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        currentRow[j] = prevRow[j - 1]!;
      } else {
        currentRow[j] = Math.min(
          (prevRow[j - 1] ?? 0) + 1, // substitution
          (currentRow[j - 1] ?? 0) + 1, // insertion
          (prevRow[j] ?? 0) + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
}

// ============================================================
// FALL RISK COMPOSITE ASSESSMENT
// ============================================================

/** Composite fall risk level */
export type CompositeRisk = 'low' | 'moderate' | 'high' | 'very_high';

/** A billing opportunity identified from the fall risk assessment */
export interface BillingOpportunity {
  /** CPT/HCPCS code */
  code: string;
  /** Human-readable code description */
  display: string;
  /** Revenue category */
  category: string;
  /** Estimated monthly revenue in cents */
  monthlyRevenueCents: number;
  /** Whether eligibility criteria are met */
  eligibilityMet: boolean;
  /** Specific requirements for this code */
  requirements: string[];
  /** Implementation notes */
  notes: string;
}

/**
 * Complete Fall Risk Assessment — combines STEADI, TUG, PROMIS,
 * environmental factors, and medications into a unified clinical picture.
 */
export interface FallRiskAssessment {
  /** Unique assessment identifier */
  id: string;
  /** Care recipient ID */
  careRecipientId: string;
  /** ISO timestamp of assessment */
  assessedAt: string;
  /** Who performed the assessment (Conductor ID or name) */
  assessedBy: string;

  // --- STEADI screening ---
  /** Total STEADI score (0-12, count of "yes" responses) */
  steadiScore: number;
  /** STEADI risk classification */
  steadiRisk: STEADIRisk;
  /** Individual question responses */
  steadiResponses: Record<string, boolean>;

  // --- TUG clinical test (optional — requires in-person) ---
  /** TUG result, if performed */
  tugResult?: TUGResult;

  // --- PROMIS integration ---
  /** PROMIS Physical Function T-score, if available from separate PROMIS assessment */
  promisPhysicalFunction?: number;

  // --- Environmental factors (from Video Home Assessment or Sage conversation) ---
  /** Identified environmental fall risks */
  environmentalRisks: string[];

  // --- Medication factors ---
  /** Medications identified as increasing fall risk */
  fallRiskMedications: FallRiskMedicationMatch[];
  /** Whether patient takes 5+ medications (polypharmacy threshold) */
  polypharmacy: boolean;

  // --- Composite scoring ---
  /** Composite fall risk score (0-100) */
  compositeScore: number;
  /** Composite risk classification */
  compositeRisk: CompositeRisk;

  // --- Generated clinical outputs ---
  /** ICD-10 codes supported by the assessment findings */
  icd10Codes: string[];
  /** Omaha System problem codes mapped from findings */
  omahaProblemCodes: number[];
  /** Medical necessity justification text for LMN */
  lmnJustification: string;
  /** Recommended fall prevention care plan elements */
  carePlanRecommendations: string[];
  /** Identified billing opportunities across the revenue stack */
  billingOpportunities: BillingOpportunity[];
}

// ============================================================
// ICD-10 CODES — Fall Risk Specific
// ============================================================

/**
 * ICD-10 codes relevant to fall risk. Each code maps to specific
 * STEADI findings that support its use.
 */
export const FALL_RISK_ICD10_CODES = {
  /** R29.6 — Repeated falls. Requires: STEADI >= 4 OR fall history. */
  REPEATED_FALLS: {
    code: 'R29.6',
    display: 'Repeated falls',
    triggerCondition: 'STEADI score >= 4 or history of 2+ falls in past year',
  },
  /** Z87.39 — Personal history of falling. Requires: Any fall in past year. */
  HISTORY_OF_FALLS: {
    code: 'Z87.39',
    display: 'Personal history of falling',
    triggerCondition: 'Positive response to STEADI question 1 (fallen in past year)',
  },
  /** W19.XXXA — Unspecified fall, initial encounter. Requires: Recent fall event. */
  UNSPECIFIED_FALL: {
    code: 'W19.XXXA',
    display: 'Unspecified fall, initial encounter',
    triggerCondition: 'Active fall event (not history)',
  },
  /** R26.2 — Difficulty in walking. Requires: Gait abnormality on TUG or STEADI functional. */
  DIFFICULTY_WALKING: {
    code: 'R26.2',
    display: 'Difficulty in walking',
    triggerCondition: 'TUG >= 12 sec or positive STEADI functional items (2-8)',
  },
  /** R26.89 — Other abnormalities of gait and mobility. */
  GAIT_ABNORMALITY: {
    code: 'R26.89',
    display: 'Other abnormalities of gait and mobility',
    triggerCondition: 'Observed gait issues during TUG or functional assessment',
  },
  /** R26.81 — Unsteadiness on feet. */
  UNSTEADINESS: {
    code: 'R26.81',
    display: 'Unsteadiness on feet',
    triggerCondition: 'Positive STEADI questions 3, 4, or 6',
  },
  /** M62.81 — Muscle weakness (generalized). */
  MUSCLE_WEAKNESS: {
    code: 'M62.81',
    display: 'Muscle weakness (generalized)',
    triggerCondition: 'Positive STEADI questions 6 or 7, or PROMIS PF T-score < 40',
  },
  /** Z91.81 — History of falling. */
  FALL_HISTORY_Z: {
    code: 'Z91.81',
    display: 'History of falling',
    triggerCondition: 'Documented fall in medical history',
  },
} as const;

// ============================================================
// COMPOSITE SCORE CALCULATION
// ============================================================

/** Weights for composite score components (sum to 1.0) */
const COMPOSITE_WEIGHTS = {
  steadi: 0.35, // STEADI screening — primary screener
  tug: 0.2, // TUG clinical test — objective measure
  promis: 0.1, // PROMIS Physical Function — validated outcome
  environmental: 0.15, // Environmental hazards — modifiable risk
  medication: 0.15, // Medication risk — modifiable risk
  polypharmacy: 0.05, // Polypharmacy flag — additional risk factor
} as const;

/** Composite risk thresholds (0-100 scale) */
const COMPOSITE_THRESHOLDS = {
  low: 0, // 0-24
  moderate: 25, // 25-49
  high: 50, // 50-74
  very_high: 75, // 75-100
} as const;

/**
 * Classify composite risk from a 0-100 score.
 */
export function classifyCompositeRisk(score: number): CompositeRisk {
  if (score >= COMPOSITE_THRESHOLDS.very_high) return 'very_high';
  if (score >= COMPOSITE_THRESHOLDS.high) return 'high';
  if (score >= COMPOSITE_THRESHOLDS.moderate) return 'moderate';
  return 'low';
}

/**
 * Calculate the composite fall risk score (0-100).
 *
 * Components:
 *   - STEADI (35%): 0-12 score normalized to 0-100
 *   - TUG (20%): Time normalized (0s=0, 30s+=100)
 *   - PROMIS PF (10%): T-score inverted (lower T = higher risk)
 *   - Environmental (15%): Count of identified risks normalized
 *   - Medication (15%): Count of high-risk meds normalized
 *   - Polypharmacy (5%): Binary 0 or 100
 */
export function calculateCompositeScore(params: {
  steadiScore: number;
  tugTimeSeconds?: number;
  promisPhysicalFunctionTScore?: number;
  environmentalRiskCount: number;
  fallRiskMedCount: number;
  polypharmacy: boolean;
}): number {
  // Normalize STEADI: 0-12 → 0-100
  const steadiNormalized = Math.min((params.steadiScore / 12) * 100, 100);

  // Normalize TUG: 0-30+ seconds → 0-100 (absent = use STEADI only, reweight)
  let tugNormalized = 0;
  let tugWeight: number = COMPOSITE_WEIGHTS.tug;
  if (params.tugTimeSeconds !== undefined) {
    tugNormalized = Math.min((params.tugTimeSeconds / 30) * 100, 100);
  } else {
    // Redistribute TUG weight to STEADI if TUG not performed
    tugWeight = 0;
  }

  // Normalize PROMIS PF: T-score 20-60 → inverted 0-100 (lower T = higher risk)
  let promisNormalized = 0;
  let promisWeight: number = COMPOSITE_WEIGHTS.promis;
  if (params.promisPhysicalFunctionTScore !== undefined) {
    const tScore = params.promisPhysicalFunctionTScore;
    // T-score 60+ = 0 risk, T-score 20 = 100 risk
    promisNormalized = Math.max(0, Math.min(100, ((60 - tScore) / 40) * 100));
  } else {
    promisWeight = 0;
  }

  // Normalize environmental risks: 0-8+ → 0-100
  const envNormalized = Math.min((params.environmentalRiskCount / 8) * 100, 100);

  // Normalize medication risk: 0-5+ → 0-100
  const medNormalized = Math.min((params.fallRiskMedCount / 5) * 100, 100);

  // Polypharmacy: binary
  const polyNormalized = params.polypharmacy ? 100 : 0;

  // Calculate total weight (may be reduced if TUG or PROMIS absent)
  const totalWeight =
    COMPOSITE_WEIGHTS.steadi +
    tugWeight +
    promisWeight +
    COMPOSITE_WEIGHTS.environmental +
    COMPOSITE_WEIGHTS.medication +
    COMPOSITE_WEIGHTS.polypharmacy;

  // Weighted sum, re-normalized to account for missing components
  const rawComposite =
    (COMPOSITE_WEIGHTS.steadi * steadiNormalized +
      tugWeight * tugNormalized +
      promisWeight * promisNormalized +
      COMPOSITE_WEIGHTS.environmental * envNormalized +
      COMPOSITE_WEIGHTS.medication * medNormalized +
      COMPOSITE_WEIGHTS.polypharmacy * polyNormalized) /
    totalWeight;

  return Math.round(rawComposite * 10) / 10; // 1 decimal
}

// ============================================================
// ICD-10 CODE GENERATION FROM ASSESSMENT
// ============================================================

/**
 * Determine which ICD-10 codes are clinically supported by the assessment findings.
 * Each code requires specific clinical evidence from the STEADI, TUG, or other components.
 */
export function generateICD10Codes(params: {
  steadiScore: number;
  steadiResponses: Record<string, boolean>;
  tugResult?: TUGResult;
  promisPhysicalFunction?: number;
  recentFallEvent?: boolean;
}): string[] {
  const codes: string[] = [];

  // R29.6 — Repeated falls
  if (params.steadiScore >= STEADI_THRESHOLDS.HIGH_MIN) {
    codes.push(FALL_RISK_ICD10_CODES.REPEATED_FALLS.code);
  }

  // Z87.39 — Personal history of falling
  if (params.steadiResponses['steadi_1']) {
    codes.push(FALL_RISK_ICD10_CODES.HISTORY_OF_FALLS.code);
  }

  // W19.XXXA — Unspecified fall (only for active/recent fall event)
  if (params.recentFallEvent) {
    codes.push(FALL_RISK_ICD10_CODES.UNSPECIFIED_FALL.code);
  }

  // R26.2 — Difficulty in walking
  const functionalItems = ['steadi_3', 'steadi_4', 'steadi_6', 'steadi_7'];
  const hasFunctionalDeficit = functionalItems.some((id) => params.steadiResponses[id]);
  if (
    hasFunctionalDeficit ||
    (params.tugResult && params.tugResult.timeSeconds >= TUG_THRESHOLDS.LOW_MAX)
  ) {
    codes.push(FALL_RISK_ICD10_CODES.DIFFICULTY_WALKING.code);
  }

  // R26.89 — Gait abnormality
  if (params.tugResult && params.tugResult.observedGaitIssues.length > 0) {
    codes.push(FALL_RISK_ICD10_CODES.GAIT_ABNORMALITY.code);
  }

  // R26.81 — Unsteadiness on feet
  if (
    params.steadiResponses['steadi_3'] ||
    params.steadiResponses['steadi_4'] ||
    params.steadiResponses['steadi_6']
  ) {
    codes.push(FALL_RISK_ICD10_CODES.UNSTEADINESS.code);
  }

  // M62.81 — Muscle weakness
  if (
    params.steadiResponses['steadi_6'] ||
    params.steadiResponses['steadi_7'] ||
    (params.promisPhysicalFunction !== undefined && params.promisPhysicalFunction < 40)
  ) {
    codes.push(FALL_RISK_ICD10_CODES.MUSCLE_WEAKNESS.code);
  }

  return codes;
}

/**
 * Map generated ICD-10 codes to Omaha System problem codes
 * using the existing crosswalk.
 */
export function mapToOmahaProblems(icd10Codes: string[]): number[] {
  const omahaCodes = new Set<number>();
  for (const code of icd10Codes) {
    const mappings = getOmahaForICD10(code);
    for (const mapping of mappings) {
      omahaCodes.add(mapping.omahaProblemCode);
    }
  }
  return Array.from(omahaCodes);
}

// ============================================================
// ENVIRONMENTAL RISK FACTORS
// ============================================================

/**
 * Common environmental fall risk factors identified during
 * Video Home Assessment or Sage conversation.
 */
export const ENVIRONMENTAL_RISK_FACTORS = [
  'Loose rugs or carpets',
  'Poor lighting in hallways or stairs',
  'No grab bars in bathroom',
  'Cluttered walkways',
  'Uneven or slippery flooring',
  'Steps without handrails',
  'High bed or furniture',
  'Cords across walkways',
  'Wet bathroom floors',
  'Pets that get underfoot',
  'Lack of night lights',
  'Steep or uneven outdoor walkways',
] as const;

// ============================================================
// CARE PLAN RECOMMENDATIONS
// ============================================================

/**
 * Generate fall prevention care plan recommendations based on
 * assessment findings. Recommendations are specific and actionable.
 */
export function generateCarePlanRecommendations(params: {
  steadiScore: number;
  steadiResponses: Record<string, boolean>;
  tugResult?: TUGResult;
  environmentalRisks: string[];
  fallRiskMedications: FallRiskMedicationMatch[];
  polypharmacy: boolean;
}): string[] {
  const recommendations: string[] = [];

  // Universal recommendations for any elevated risk
  if (params.steadiScore >= 2) {
    recommendations.push('Schedule comprehensive fall risk assessment with primary care provider');
    recommendations.push('Install nightlights in hallways, bathroom, and bedroom');
  }

  // High STEADI — aggressive prevention
  if (params.steadiScore >= STEADI_THRESHOLDS.HIGH_MIN) {
    recommendations.push('Initiate fall prevention companion care program (minimum 10 hours/week)');
    recommendations.push(
      'Set up Galaxy Watch RPM for continuous fall detection and activity monitoring',
    );
    recommendations.push('Refer for physical therapy evaluation (balance and strength training)');
    recommendations.push(
      'Generate LMN for HSA/FSA eligibility — fall prevention care is medically necessary',
    );
  }

  // Fall history
  if (params.steadiResponses['steadi_1']) {
    recommendations.push('Document fall history — date, location, circumstances, injuries');
    recommendations.push('Implement fall log for ongoing tracking by companion caregiver');
  }

  // Assistive device
  if (params.steadiResponses['steadi_2']) {
    recommendations.push('Verify proper fit and condition of assistive device (cane/walker)');
    recommendations.push('Ensure companion caregiver is trained in safe ambulation assistance');
  }

  // Unsteadiness / furniture holding
  if (params.steadiResponses['steadi_3'] || params.steadiResponses['steadi_4']) {
    recommendations.push('Install grab bars in bathroom (toilet and shower/tub)');
    recommendations.push('Add handrails to all stairways (both sides)');
  }

  // Chair transfer difficulty
  if (params.steadiResponses['steadi_6']) {
    recommendations.push('Consider raised toilet seat and chair risers');
    recommendations.push('Initiate lower extremity strengthening program');
  }

  // Curb trouble
  if (params.steadiResponses['steadi_7']) {
    recommendations.push('Assess outdoor walking paths for hazards');
    recommendations.push('Companion caregiver to assist with outdoor ambulation');
  }

  // Urgency / rushing to toilet
  if (params.steadiResponses['steadi_8']) {
    recommendations.push('Install bedside commode or urinal for nighttime');
    recommendations.push('Clear path to bathroom of all obstacles');
    recommendations.push('Evaluate for urinary urgency/incontinence with primary care');
  }

  // Neuropathy
  if (params.steadiResponses['steadi_9']) {
    recommendations.push('Foot examination — evaluate for peripheral neuropathy');
    recommendations.push('Proper footwear — non-slip, supportive, low-heel');
  }

  // Medication-related
  if (params.steadiResponses['steadi_10'] || params.steadiResponses['steadi_11']) {
    recommendations.push(
      'Request medication review with pharmacist — focus on fall-risk medications',
    );
  }

  // Depression
  if (params.steadiResponses['steadi_12']) {
    recommendations.push(
      'Screen for depression (PHQ-9) — depression independently increases fall risk',
    );
    recommendations.push('Social engagement plan — companion care addresses isolation');
  }

  // Environmental modifications
  if (params.environmentalRisks.length > 0) {
    recommendations.push(
      `Address ${params.environmentalRisks.length} environmental hazard(s): ${params.environmentalRisks.join('; ')}`,
    );
  }

  // Medication-specific
  if (params.fallRiskMedications.length > 0) {
    const highRiskMeds = params.fallRiskMedications.filter((m) => m.riskLevel === 'high');
    if (highRiskMeds.length > 0) {
      recommendations.push(
        `PRIORITY: ${highRiskMeds.length} high-risk fall medication(s) identified — request prescriber review: ${highRiskMeds.map((m) => m.patientMedication).join(', ')}`,
      );
    }
  }

  // Polypharmacy
  if (params.polypharmacy) {
    recommendations.push(
      'Polypharmacy identified (5+ medications) — request comprehensive medication reconciliation',
    );
  }

  // TUG-specific
  if (params.tugResult) {
    if (params.tugResult.riskLevel === 'high') {
      recommendations.push(
        `TUG time ${params.tugResult.timeSeconds}s (high risk) — supervised ambulation required, consider physical therapy referral`,
      );
    }
    if (params.tugResult.observedGaitIssues.length > 0) {
      recommendations.push(
        `Gait abnormalities observed during TUG: ${params.tugResult.observedGaitIssues.join(', ')} — address in PT plan`,
      );
    }
  }

  return recommendations;
}

// ============================================================
// BILLING OPPORTUNITY IDENTIFICATION
// ============================================================

/**
 * Identify all billing opportunities generated by a fall risk assessment.
 * This is the revenue engine — each fall risk finding opens billing pathways.
 */
export function identifyBillingOpportunities(params: {
  compositeRisk: CompositeRisk;
  icd10Codes: string[];
  hasMedicare: boolean;
  hasHSA: boolean;
  hasFSA: boolean;
  recentHospitalization: boolean;
  chronicConditionCount: number;
  careHoursPerWeek: number;
}): BillingOpportunity[] {
  const opportunities: BillingOpportunity[] = [];

  // --- PIN (G0023 + G0024) — Fall risk as principal illness navigation ---
  const pinEligible =
    params.hasMedicare &&
    params.icd10Codes.length > 0 &&
    (params.compositeRisk === 'high' || params.compositeRisk === 'very_high');

  opportunities.push({
    code: 'G0023',
    display: 'PIN — Principal Illness Navigation (first 60 min)',
    category: 'pin',
    monthlyRevenueCents: 10000,
    eligibilityMet: pinEligible,
    requirements: [
      'Medicare beneficiary',
      'Single high-risk condition (fall risk with ICD-10 documentation)',
      'Initiating visit within prior 12 months',
      'Incident-to supervision by Clinical Director',
    ],
    notes:
      'Fall risk navigation: care plan development, home safety coordination, PT referral management, RPM setup',
  });

  opportunities.push({
    code: 'G0024',
    display: 'PIN — additional 30 minutes',
    category: 'pin',
    monthlyRevenueCents: 5000,
    eligibilityMet: pinEligible,
    requirements: ['G0023 billed in same month', '90+ total PIN minutes'],
    notes: 'Additional time for complex fall prevention coordination',
  });

  // --- CHI (G0019 + G0022) — Fall risk as SDOH/community health need ---
  const chiEligible = params.hasMedicare && params.icd10Codes.length > 0;

  opportunities.push({
    code: 'G0019',
    display: 'CHI — Community Health Integration (first 60 min)',
    category: 'chi',
    monthlyRevenueCents: 8500,
    eligibilityMet: chiEligible,
    requirements: [
      'Medicare beneficiary',
      'SDOH need identified (fall risk = safety need)',
      'Initiating visit within prior 12 months',
      'General supervision',
    ],
    notes:
      'Fall risk as SDOH: home safety assessment, community resource navigation, caregiver support coordination',
  });

  opportunities.push({
    code: 'G0022',
    display: 'CHI — additional 30 minutes',
    category: 'chi',
    monthlyRevenueCents: 4300,
    eligibilityMet: chiEligible,
    requirements: ['G0019 billed in same month', '90+ total CHI minutes'],
    notes:
      'Additional time for environmental modification coordination, community resource connection',
  });

  // --- CCM (99490/99491) — If 2+ chronic conditions ---
  const ccmEligible = params.hasMedicare && params.chronicConditionCount >= 2;

  opportunities.push({
    code: '99490',
    display: 'CCM — Chronic Care Management (first 20 min)',
    category: 'ccm',
    monthlyRevenueCents: 6400,
    eligibilityMet: ccmEligible,
    requirements: [
      'Medicare beneficiary',
      '2+ chronic conditions expected to last 12+ months',
      'Comprehensive care plan documented',
      'Patient consent obtained',
    ],
    notes:
      'Fall risk as chronic condition plus existing chronic diagnoses. Care coordination includes medication management, specialist coordination.',
  });

  // --- RPM (99457/99458) — Galaxy Watch fall monitoring ---
  const rpmEligible = params.hasMedicare;

  opportunities.push({
    code: '99457',
    display: 'RPM — device management (first 20 min)',
    category: 'rpm',
    monthlyRevenueCents: 5200,
    eligibilityMet: rpmEligible,
    requirements: [
      'Medicare beneficiary',
      'Galaxy Watch providing 16+ days/month of data',
      '20+ minutes clinical staff management time',
      'Device setup (99453) billed in first month',
    ],
    notes:
      'Galaxy Watch monitors: step count, gait speed, fall detection, heart rate variability, sleep patterns — all relevant to fall risk',
  });

  opportunities.push({
    code: '99458',
    display: 'RPM — additional 20 minutes management',
    category: 'rpm',
    monthlyRevenueCents: 4000,
    eligibilityMet: rpmEligible,
    requirements: ['99457 billed in same month', '40+ total RPM management minutes'],
    notes:
      'Additional RPM time for complex fall risk monitoring, trend analysis, care plan adjustments',
  });

  // --- Companion Care — Direct hourly service ---
  const companionMonthly =
    params.careHoursPerWeek * 4.33 * HOME_CARE_RATES.COMPANION_RATE_CENTS_PER_HOUR;

  opportunities.push({
    code: 'COMPANION',
    display: `Companion Care — ${params.careHoursPerWeek} hrs/week @ $${HOME_CARE_RATES.COMPANION_RATE_CENTS_PER_HOUR / 100}/hr`,
    category: 'home_care',
    monthlyRevenueCents: Math.round(companionMonthly),
    eligibilityMet: true, // Always eligible — private pay
    requirements: ['Class B license', 'Caregiver-client match', 'Care plan in place'],
    notes:
      'Fall prevention companion care: supervised ambulation, exercise reminders, medication reminders, meal prep, home safety monitoring',
  });

  // --- LMN / HSA-FSA savings ---
  if (params.hasHSA || params.hasFSA) {
    const avgTaxSavingsPercent =
      (LMN_CONFIG.TAX_SAVINGS_MIN_PERCENT + LMN_CONFIG.TAX_SAVINGS_MAX_PERCENT) / 2;
    const monthlySavingsCents = Math.round(companionMonthly * (avgTaxSavingsPercent / 100));

    opportunities.push({
      code: 'LMN-HSA',
      display: `HSA/FSA Tax Savings — ${avgTaxSavingsPercent}% of care costs`,
      category: 'assessment',
      monthlyRevenueCents: monthlySavingsCents,
      eligibilityMet: true,
      requirements: [
        'LMN signed by Josh Emdur, DO',
        'ICD-10 codes documented',
        'Care plan prescribed',
        'IRS Pub 502 compliance',
      ],
      notes:
        'LMN transforms companion care from custodial to medical expense. Family saves 25-37% via pre-tax dollars.',
    });
  }

  return opportunities;
}

// ============================================================
// REIMBURSEMENT CASCADE
// ============================================================

/** Complete reimbursement picture from a fall risk assessment */
export interface ReimbursementCascade {
  // --- Immediate (from assessment) ---
  /** One-time LMN generation value in cents */
  lmnRevenueCents: number;
  /** Monthly HSA/FSA tax savings for the family in cents */
  hsaMonthlySavingsCents: number;

  // --- Monthly recurring ---
  /** PIN revenue (G0023 + G0024) in cents/month */
  pinRevenueCents: number;
  /** CHI revenue (G0019 + G0022) in cents/month */
  chiRevenueCents: number;
  /** CCM revenue (99490 or 99491) in cents/month */
  ccmRevenueCents: number;
  /** RPM revenue (99457/99458) in cents/month */
  rpmRevenueCents: number;
  /** Companion care revenue in cents/month */
  companionCareRevenueCents: number;

  // --- Totals ---
  /** Total monthly revenue across all layers in cents */
  totalMonthlyRevenueCents: number;
  /** Total annual projected revenue in cents */
  totalAnnualRevenueCents: number;
  /** Total annual family savings (HSA/FSA) in cents */
  familyAnnualSavingsCents: number;

  // --- Outcome-based (future) ---
  /** ACCESS Model potential monthly payment in cents */
  accessModelPotentialCents: number;
  /** PACE sub-capitation potential monthly payment in cents */
  pacePotentialCents: number;

  // --- The story ---
  /** Human-readable narrative explaining the full reimbursement cascade */
  reimbursementNarrative: string;
}

/**
 * Calculate the complete reimbursement cascade from a fall risk assessment.
 *
 * This is the core revenue function — takes a clinical assessment and
 * projects the ENTIRE revenue opportunity across all 10 layers of the
 * co-op.care revenue stack.
 */
export function calculateReimbursementCascade(
  assessment: FallRiskAssessment,
  careHoursPerWeek: number,
  hourlyRateCents: number,
  options: {
    hasMedicare?: boolean;
    hasHSA?: boolean;
    hasFSA?: boolean;
    chronicConditionCount?: number;
  } = {},
): ReimbursementCascade {
  const hasMedicare = options.hasMedicare ?? false;
  const hasHSA = options.hasHSA ?? false;
  const hasFSA = options.hasFSA ?? false;
  const chronicConditionCount = options.chronicConditionCount ?? 0;

  const isHighRisk =
    assessment.compositeRisk === 'high' || assessment.compositeRisk === 'very_high';

  // Monthly companion care
  const monthlyHours = careHoursPerWeek * 4.33;
  const companionCareRevenueCents = Math.round(monthlyHours * hourlyRateCents);

  // LMN one-time value (estimated revenue from the LMN generation itself)
  const lmnRevenueCents = isHighRisk ? 20000 : 15000; // $150-200

  // HSA/FSA savings
  const avgTaxRate =
    (LMN_CONFIG.TAX_SAVINGS_MIN_PERCENT + LMN_CONFIG.TAX_SAVINGS_MAX_PERCENT) / 2 / 100;
  const hsaMonthlySavingsCents =
    hasHSA || hasFSA ? Math.round(companionCareRevenueCents * avgTaxRate) : 0;

  // PIN revenue (Medicare only, high risk)
  let pinRevenueCents = 0;
  if (hasMedicare && isHighRisk) {
    pinRevenueCents = 10000; // G0023 base
    if (careHoursPerWeek >= 10) {
      pinRevenueCents += 5000; // G0024 add-on for higher-intensity care
    }
  }

  // CHI revenue (Medicare only)
  let chiRevenueCents = 0;
  if (hasMedicare && assessment.icd10Codes.length > 0) {
    chiRevenueCents = 8500; // G0019 base
    if (assessment.environmentalRisks.length >= 3) {
      chiRevenueCents += 4300; // G0022 add-on for environmental work
    }
  }

  // CCM revenue (Medicare + 2+ chronic conditions)
  let ccmRevenueCents = 0;
  if (hasMedicare && chronicConditionCount >= 2) {
    ccmRevenueCents = 6400; // 99490
  }

  // RPM revenue (Medicare + Galaxy Watch)
  let rpmRevenueCents = 0;
  if (hasMedicare) {
    rpmRevenueCents = 5200; // 99457 base
    if (isHighRisk) {
      rpmRevenueCents += 4000; // 99458 add-on for high-risk monitoring
    }
  }

  // ACCESS Model potential (future — July 2026)
  const accessModelPotentialCents = hasMedicare
    ? ACCESS_MODEL_CONFIG.monthlyPerBeneficiaryCents
    : 0;

  // PACE potential (future — TRU PACE partnership)
  const pacePotentialCents = PACE_CONFIG.MONTHLY_MARGIN_CENTS;

  // Totals
  const totalMonthlyRevenueCents =
    pinRevenueCents +
    chiRevenueCents +
    ccmRevenueCents +
    rpmRevenueCents +
    companionCareRevenueCents;

  const totalAnnualRevenueCents = totalMonthlyRevenueCents * 12 + lmnRevenueCents;
  const familyAnnualSavingsCents = hsaMonthlySavingsCents * 12;

  // Build narrative
  const reimbursementNarrative = buildReimbursementNarrative({
    assessment,
    careHoursPerWeek,
    hourlyRateCents,
    companionCareRevenueCents,
    pinRevenueCents,
    chiRevenueCents,
    ccmRevenueCents,
    rpmRevenueCents,
    hsaMonthlySavingsCents,
    totalMonthlyRevenueCents,
    totalAnnualRevenueCents,
    familyAnnualSavingsCents,
    hasMedicare,
    hasHSA: hasHSA || hasFSA,
  });

  return {
    lmnRevenueCents,
    hsaMonthlySavingsCents,
    pinRevenueCents,
    chiRevenueCents,
    ccmRevenueCents,
    rpmRevenueCents,
    companionCareRevenueCents,
    totalMonthlyRevenueCents,
    totalAnnualRevenueCents,
    familyAnnualSavingsCents,
    accessModelPotentialCents,
    pacePotentialCents,
    reimbursementNarrative,
  };
}

/**
 * Build the human-readable reimbursement narrative.
 * This is used in family consultations, LMN justifications, and pitch materials.
 */
function buildReimbursementNarrative(params: {
  assessment: FallRiskAssessment;
  careHoursPerWeek: number;
  hourlyRateCents: number;
  companionCareRevenueCents: number;
  pinRevenueCents: number;
  chiRevenueCents: number;
  ccmRevenueCents: number;
  rpmRevenueCents: number;
  hsaMonthlySavingsCents: number;
  totalMonthlyRevenueCents: number;
  totalAnnualRevenueCents: number;
  familyAnnualSavingsCents: number;
  hasMedicare: boolean;
  hasHSA: boolean;
}): string {
  const {
    assessment,
    careHoursPerWeek,
    hourlyRateCents,
    companionCareRevenueCents,
    pinRevenueCents,
    chiRevenueCents,
    ccmRevenueCents,
    rpmRevenueCents,
    hsaMonthlySavingsCents,
    totalMonthlyRevenueCents,
    totalAnnualRevenueCents,
    familyAnnualSavingsCents,
    hasMedicare,
    hasHSA,
  } = params;

  const toDollars = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const lines: string[] = [];

  lines.push('FALL RISK ASSESSMENT — REIMBURSEMENT CASCADE');
  lines.push('='.repeat(50));
  lines.push('');

  // Clinical summary
  lines.push(`STEADI Score: ${assessment.steadiScore}/12 (${assessment.steadiRisk} risk)`);
  if (assessment.tugResult) {
    lines.push(
      `TUG Time: ${assessment.tugResult.timeSeconds}s (${assessment.tugResult.riskLevel} risk)`,
    );
  }
  lines.push(
    `Composite Score: ${assessment.compositeScore}/100 (${assessment.compositeRisk} risk)`,
  );
  lines.push(`ICD-10 Codes: ${assessment.icd10Codes.join(', ') || 'None'}`);
  lines.push('');

  // Companion care
  lines.push('COMPANION CARE');
  lines.push(
    `  ${careHoursPerWeek} hours/week @ ${toDollars(hourlyRateCents)}/hr = ${toDollars(companionCareRevenueCents)}/month`,
  );
  lines.push('');

  // Medicare billing
  if (hasMedicare) {
    lines.push('MEDICARE BILLING (stackable codes)');
    if (pinRevenueCents > 0) {
      lines.push(`  PIN Navigation: ${toDollars(pinRevenueCents)}/month`);
    }
    if (chiRevenueCents > 0) {
      lines.push(`  CHI Integration: ${toDollars(chiRevenueCents)}/month`);
    }
    if (ccmRevenueCents > 0) {
      lines.push(`  CCM Management: ${toDollars(ccmRevenueCents)}/month`);
    }
    if (rpmRevenueCents > 0) {
      lines.push(`  RPM Monitoring: ${toDollars(rpmRevenueCents)}/month`);
    }
    lines.push('');
  }

  // HSA/FSA savings
  if (hasHSA && hsaMonthlySavingsCents > 0) {
    lines.push('HSA/FSA TAX SAVINGS');
    lines.push(`  Monthly savings: ${toDollars(hsaMonthlySavingsCents)}`);
    lines.push(`  Annual savings: ${toDollars(familyAnnualSavingsCents)}`);
    lines.push(`  (LMN signed by ${LMN_CONFIG.SIGNING_AUTHORITY})`);
    lines.push('');
  }

  // Totals
  lines.push('REVENUE SUMMARY');
  lines.push(`  Monthly total: ${toDollars(totalMonthlyRevenueCents)}`);
  lines.push(`  Annual projected: ${toDollars(totalAnnualRevenueCents)}`);
  if (familyAnnualSavingsCents > 0) {
    lines.push(`  Family annual tax savings: ${toDollars(familyAnnualSavingsCents)}`);
  }

  return lines.join('\n');
}

// ============================================================
// CARA ACT COMPLIANCE
// ============================================================

/** CARA Act compliance status for a given state */
export interface CARACompliance {
  /** Two-letter state abbreviation */
  state: string;
  /** Whether the CARE Act (or equivalent) has been enacted */
  caraEnacted: boolean;
  /** Year enacted (null if not enacted) */
  yearEnacted: number | null;
  /** Whether the caregiver must be identified in the medical record */
  caregiverIdentified: boolean;
  /** Whether advance discharge notification to caregiver is required */
  dischargeNotificationRequired: boolean;
  /** Whether caregiver education on medical tasks is required */
  educationRequired: boolean;
  /** How co-op.care fits into CARA compliance for this state */
  coopCareRole: string;
  /** How hospitals can refer to co-op.care under CARA */
  referralPathway: string;
}

/**
 * CARA Act (Caregiver Advise, Record, Enable) state compliance map.
 *
 * As of 2025, 43 states + DC + territories have enacted CARE Act legislation.
 * The CARE Act requires hospitals to:
 *   1. Record the family caregiver in the medical record
 *   2. Notify the caregiver when discharge is planned
 *   3. Provide education/instruction on medical tasks the caregiver will perform
 *
 * co-op.care's opportunity: We ARE the caregiver organization that hospitals
 * can refer to for CARA compliance. When a hospital must identify and educate
 * a caregiver, co-op.care provides the trained companion caregiver.
 */
export const CARA_ACT_STATES: Record<string, CARACompliance> = {
  AL: {
    state: 'AL',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  AK: {
    state: 'AK',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  AZ: {
    state: 'AZ',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  AR: {
    state: 'AR',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  CA: {
    state: 'CA',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  CO: {
    state: 'CO',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole:
      'PRIMARY MARKET — Designated caregiver organization for BCH and Boulder-area hospitals',
    referralPathway:
      'BCH discharge planners refer to co-op.care as CARA-compliant caregiver provider in Boulder County',
  },
  CT: {
    state: 'CT',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  DE: {
    state: 'DE',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  DC: {
    state: 'DC',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  FL: {
    state: 'FL',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  GA: {
    state: 'GA',
    caraEnacted: true,
    yearEnacted: 2017,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  HI: {
    state: 'HI',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  ID: {
    state: 'ID',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  IL: {
    state: 'IL',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  IN: {
    state: 'IN',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  IA: {
    state: 'IA',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  KS: {
    state: 'KS',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  KY: {
    state: 'KY',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  LA: {
    state: 'LA',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  ME: {
    state: 'ME',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  MD: {
    state: 'MD',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  MA: {
    state: 'MA',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  MI: {
    state: 'MI',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  MN: {
    state: 'MN',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  MS: {
    state: 'MS',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  MO: {
    state: 'MO',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  MT: {
    state: 'MT',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  NE: {
    state: 'NE',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  NV: {
    state: 'NV',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  NH: {
    state: 'NH',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  NJ: {
    state: 'NJ',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  NM: {
    state: 'NM',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  NY: {
    state: 'NY',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  NC: {
    state: 'NC',
    caraEnacted: true,
    yearEnacted: 2017,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  ND: {
    state: 'ND',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  OH: {
    state: 'OH',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  OK: {
    state: 'OK',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  OR: {
    state: 'OR',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  PA: {
    state: 'PA',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  RI: {
    state: 'RI',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  SC: {
    state: 'SC',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  SD: {
    state: 'SD',
    caraEnacted: false,
    yearEnacted: null,
    caregiverIdentified: false,
    dischargeNotificationRequired: false,
    educationRequired: false,
    coopCareRole: 'Voluntary caregiver identification — no state mandate',
    referralPathway: 'Direct marketing to families and health systems (no CARA mandate)',
  },
  TN: {
    state: 'TN',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  TX: {
    state: 'TX',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  UT: {
    state: 'UT',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  VT: {
    state: 'VT',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  VA: {
    state: 'VA',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  WA: {
    state: 'WA',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  WV: {
    state: 'WV',
    caraEnacted: true,
    yearEnacted: 2015,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  WI: {
    state: 'WI',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
  WY: {
    state: 'WY',
    caraEnacted: true,
    yearEnacted: 2016,
    caregiverIdentified: true,
    dischargeNotificationRequired: true,
    educationRequired: true,
    coopCareRole: 'Designated caregiver organization for post-discharge companion care',
    referralPathway:
      'Hospital discharge planner refers to co-op.care as CARA-compliant caregiver provider',
  },
};

/**
 * Get CARA Act compliance for a specific state.
 * Returns compliance details including co-op.care's role and referral pathway.
 */
export function getCARACompliance(state: string): CARACompliance | undefined {
  return CARA_ACT_STATES[state.toUpperCase()];
}

/**
 * Check whether a state has enacted the CARE Act.
 */
export function isCARAEnacted(state: string): boolean {
  return CARA_ACT_STATES[state.toUpperCase()]?.caraEnacted ?? false;
}

// ============================================================
// CONVERSATIONAL FALL RISK ITEMS (for Sage AI)
// ============================================================

/**
 * Conversational wrapper for STEADI questions.
 * Sage uses natural language to administer the screening without
 * it feeling like a clinical questionnaire.
 */
export interface ConversationalFallRiskItem {
  /** Maps to the STEADI question */
  steadiQuestionId: string;
  /** Natural-language prompt for Sage */
  sagePrompt: string;
  /** Follow-up if initial response is ambiguous */
  sageFollowUp: string;
  /** Keywords that map to yes/no (true/false) */
  responseMapping: Record<string, boolean>;
}

/**
 * All 12 STEADI questions converted to natural Sage conversation.
 * Designed for family caregivers answering about their loved one.
 */
export const CONVERSATIONAL_FALL_RISK: readonly ConversationalFallRiskItem[] = [
  {
    steadiQuestionId: 'steadi_1',
    sagePrompt:
      'Has your loved one had any falls in the past year — even minor ones like tripping or stumbling?',
    sageFollowUp:
      "Even a near-miss counts. Many families don't think of stumbles as falls, but they're important warning signs.",
    responseMapping: {
      yes: true,
      fell: true,
      tripped: true,
      stumbled: true,
      slipped: true,
      no: false,
      never: false,
      'not that I know of': false,
    },
  },
  {
    steadiQuestionId: 'steadi_2',
    sagePrompt:
      'Does your loved one use a cane, walker, or any other device to get around? Or has anyone suggested they should?',
    sageFollowUp:
      'This includes any assistive device — even holding onto a shopping cart for stability counts.',
    responseMapping: {
      yes: true,
      cane: true,
      walker: true,
      rollator: true,
      wheelchair: true,
      no: false,
      nothing: false,
      'walks fine': false,
    },
  },
  {
    steadiQuestionId: 'steadi_3',
    sagePrompt:
      'Have you noticed your loved one seeming unsteady when walking? Maybe wobbling a bit or looking unsure on their feet?',
    sageFollowUp:
      'Think about different situations — walking on uneven ground, turning corners, or getting up from sitting.',
    responseMapping: {
      yes: true,
      unsteady: true,
      wobbly: true,
      shaky: true,
      sometimes: true,
      no: false,
      steady: false,
      fine: false,
    },
  },
  {
    steadiQuestionId: 'steadi_4',
    sagePrompt:
      'When your loved one walks around the house, do they tend to hold onto furniture or the walls for support?',
    sageFollowUp:
      'This is a common adaptation people make without realizing it. Watch for hands on countertops, table edges, or doorframes.',
    responseMapping: {
      yes: true,
      'holds on': true,
      grabs: true,
      leans: true,
      no: false,
      'walks freely': false,
    },
  },
  {
    steadiQuestionId: 'steadi_5',
    sagePrompt:
      'Has your loved one expressed any worry about falling? Or have you noticed them avoiding certain activities because of that concern?',
    sageFollowUp:
      'Fear of falling is itself a risk factor — it often leads to reduced activity, which weakens muscles and actually increases fall risk.',
    responseMapping: {
      yes: true,
      worried: true,
      afraid: true,
      scared: true,
      avoids: true,
      no: false,
      'not worried': false,
      confident: false,
    },
  },
  {
    steadiQuestionId: 'steadi_6',
    sagePrompt:
      'When your loved one gets up from a chair, do they need to push with their hands or the armrests to stand up?',
    sageFollowUp:
      'Try watching next time — can they stand up without using their hands at all? Needing to push up can indicate leg weakness.',
    responseMapping: {
      yes: true,
      pushes: true,
      struggles: true,
      'needs help': true,
      no: false,
      'stands easily': false,
      'no problem': false,
    },
  },
  {
    steadiQuestionId: 'steadi_7',
    sagePrompt:
      'Does your loved one have any difficulty stepping up onto a curb or over a threshold?',
    sageFollowUp:
      "This can show up as hesitation, needing to hold someone's arm, or avoiding curbs altogether.",
    responseMapping: {
      yes: true,
      trouble: true,
      difficult: true,
      hesitates: true,
      no: false,
      'no trouble': false,
      easy: false,
    },
  },
  {
    steadiQuestionId: 'steadi_8',
    sagePrompt:
      'Does your loved one often have to rush to the bathroom? Urgency that might cause them to hurry?',
    sageFollowUp:
      'Rushing to the toilet — especially at night — is one of the most common fall scenarios for older adults.',
    responseMapping: {
      yes: true,
      rushes: true,
      urgency: true,
      hurries: true,
      frequently: true,
      no: false,
      'not really': false,
    },
  },
  {
    steadiQuestionId: 'steadi_9',
    sagePrompt:
      'Has your loved one mentioned numbness, tingling, or loss of feeling in their feet?',
    sageFollowUp:
      'Reduced sensation in the feet — common with diabetes or peripheral neuropathy — makes it harder to sense the ground and maintain balance.',
    responseMapping: {
      yes: true,
      numbness: true,
      tingling: true,
      numb: true,
      "can't feel": true,
      no: false,
      'normal feeling': false,
    },
  },
  {
    steadiQuestionId: 'steadi_10',
    sagePrompt:
      "Do any of your loved one's medications make them feel light-headed, dizzy, or more tired than usual?",
    sageFollowUp:
      'Many common medications — blood pressure pills, pain medications, sleep aids — can cause dizziness or drowsiness that increases fall risk.',
    responseMapping: {
      yes: true,
      dizzy: true,
      lightheaded: true,
      drowsy: true,
      tired: true,
      no: false,
      'no side effects': false,
    },
  },
  {
    steadiQuestionId: 'steadi_11',
    sagePrompt:
      'Does your loved one take any medication to help with sleep or mood — like sleeping pills or antidepressants?',
    sageFollowUp:
      'These medications are important, but they can affect balance and reaction time, especially in older adults.',
    responseMapping: {
      yes: true,
      'sleeping pills': true,
      antidepressant: true,
      'sleep aid': true,
      no: false,
      'nothing for sleep': false,
    },
  },
  {
    steadiQuestionId: 'steadi_12',
    sagePrompt:
      'Has your loved one seemed sad, withdrawn, or less interested in things they used to enjoy?',
    sageFollowUp:
      "Depression is both a risk factor for falls and a common consequence of reduced mobility. It's important to address both together.",
    responseMapping: {
      yes: true,
      sad: true,
      depressed: true,
      withdrawn: true,
      'no interest': true,
      no: false,
      happy: false,
      'doing well': false,
    },
  },
] as const;

// ============================================================
// LMN (LETTER OF MEDICAL NECESSITY) BRIDGE
// ============================================================

/** Output of the fall risk LMN justification generator */
export interface FallRiskLMNJustification {
  /** Clinical diagnosis statement */
  diagnosis: string;
  /** Medical necessity statement for in-home care */
  medicalNecessity: string;
  /** ICD-10 codes with individual clinical rationale */
  icd10Justification: string;
  /** Specific fall prevention care plan narrative */
  carePlanNarrative: string;
  /** IRS Pub 502 reference for HSA/FSA eligibility */
  hsaEligibilityStatement: string;
  /** Financial projections */
  estimatedSavings: {
    /** Monthly companion care cost in cents */
    monthlyCostCents: number;
    /** Annual companion care cost in cents */
    annualCostCents: number;
    /** Annual tax savings via HSA/FSA in cents */
    taxSavingsCents: number;
  };
}

/**
 * Generate the medical necessity justification for fall risk companion care.
 *
 * This bridges the clinical assessment to the LMN that Josh Emdur signs,
 * making companion care HSA/FSA-eligible under IRS Pub 502.
 */
export function generateFallRiskLMNJustification(
  assessment: FallRiskAssessment,
  careHoursPerWeek: number,
  hourlyRateCents: number = HOME_CARE_RATES.COMPANION_RATE_CENTS_PER_HOUR,
): FallRiskLMNJustification {
  const monthlyCostCents = Math.round(careHoursPerWeek * 4.33 * hourlyRateCents);
  const annualCostCents = monthlyCostCents * 12;
  const avgTaxRate =
    (LMN_CONFIG.TAX_SAVINGS_MIN_PERCENT + LMN_CONFIG.TAX_SAVINGS_MAX_PERCENT) / 2 / 100;
  const taxSavingsCents = Math.round(annualCostCents * avgTaxRate);

  // Build diagnosis statement
  const diagnosis =
    `Patient presents with elevated fall risk as assessed by the CDC STEADI ` +
    `Stay Independent Questionnaire (score: ${assessment.steadiScore}/12, ` +
    `classification: ${assessment.steadiRisk} risk). ` +
    `Composite fall risk score: ${assessment.compositeScore}/100 ` +
    `(${assessment.compositeRisk}). ` +
    (assessment.tugResult
      ? `Timed Up and Go test: ${assessment.tugResult.timeSeconds} seconds ` +
        `(${assessment.tugResult.riskLevel} risk). `
      : '') +
    (assessment.promisPhysicalFunction
      ? `PROMIS Physical Function T-score: ${assessment.promisPhysicalFunction} ` +
        `(${assessment.promisPhysicalFunction < 40 ? 'below normal' : 'within range'}). `
      : '') +
    (assessment.fallRiskMedications.length > 0
      ? `${assessment.fallRiskMedications.length} fall-risk medication(s) identified. `
      : '') +
    (assessment.polypharmacy ? 'Polypharmacy (5+ medications) present. ' : '') +
    (assessment.environmentalRisks.length > 0
      ? `${assessment.environmentalRisks.length} environmental fall hazard(s) identified in the home. `
      : '');

  // Build medical necessity statement
  const medicalNecessity =
    `In-home companion care is medically necessary to prevent falls and ` +
    `fall-related injuries in this patient. The CDC estimates that one in ` +
    `four Americans aged 65+ falls each year, and falls are the leading ` +
    `cause of injury death in this population. This patient's STEADI score ` +
    `of ${assessment.steadiScore}/12 places them at ${assessment.steadiRisk} risk. ` +
    `Prescribed companion care will provide: supervised ambulation, exercise ` +
    `and strength training reminders, medication management assistance, home ` +
    `safety monitoring, and immediate assistance in the event of a fall or ` +
    `near-fall. Without this intervention, the patient is at elevated risk ` +
    `for fall-related emergency department visits, hospitalizations, and ` +
    `loss of functional independence. Care is prescribed for ` +
    `${careHoursPerWeek} hours per week.`;

  // Build ICD-10 justification
  const icd10Lines = assessment.icd10Codes.map((code) => {
    const mapping = DEFAULT_ICD10_OMAHA_MAPPINGS.find((m) => m.icd10Code === code);
    const fallCode = Object.values(FALL_RISK_ICD10_CODES).find((c) => c.code === code);
    return `  ${code} — ${mapping?.icd10Display ?? fallCode?.display ?? code}: ${fallCode?.triggerCondition ?? 'Clinical finding documented in assessment'}`;
  });
  const icd10Justification = 'Supporting ICD-10 diagnoses:\n' + icd10Lines.join('\n');

  // Build care plan narrative
  const carePlanNarrative =
    `FALL PREVENTION CARE PLAN\n` +
    `Frequency: ${careHoursPerWeek} hours/week companion care\n` +
    `Duration: Ongoing, reassess every 90 days\n\n` +
    `Interventions:\n` +
    assessment.carePlanRecommendations.map((r, i) => `  ${i + 1}. ${r}`).join('\n') +
    `\n\nMonitoring: Galaxy Watch RPM for continuous fall detection, ` +
    `gait speed tracking, and activity monitoring. STEADI re-screening ` +
    `at 30, 60, and 90 days to track improvement.`;

  // HSA/FSA eligibility statement
  const hsaEligibilityStatement =
    `Per IRS Publication 502 (Medical and Dental Expenses), expenses for ` +
    `medical care that are primarily for the prevention or alleviation of ` +
    `a physical defect or illness are deductible and HSA/FSA-eligible. ` +
    `This companion care is prescribed by ${LMN_CONFIG.SIGNING_AUTHORITY} ` +
    `as medically necessary fall prevention for documented fall risk ` +
    `(ICD-10: ${assessment.icd10Codes.join(', ')}). The care is not ` +
    `custodial in nature — it is a prescribed medical intervention to ` +
    `prevent falls, fall-related injuries, and associated hospitalizations. ` +
    `Estimated annual cost: $${(annualCostCents / 100).toLocaleString()}. ` +
    `Estimated annual tax savings at ${Math.round(avgTaxRate * 100)}% ` +
    `marginal rate: $${(taxSavingsCents / 100).toLocaleString()}.`;

  return {
    diagnosis,
    medicalNecessity,
    icd10Justification,
    carePlanNarrative,
    hsaEligibilityStatement,
    estimatedSavings: {
      monthlyCostCents,
      annualCostCents,
      taxSavingsCents,
    },
  };
}

// ============================================================
// OUTCOME TRACKING — Fall Prevention
// ============================================================

/** Trajectory classification for fall prevention outcomes */
export type OutcomeTrajectory = 'improving' | 'stable' | 'declining';

/** A single follow-up assessment data point */
export interface FallPreventionFollowUp {
  /** ISO date of follow-up */
  date: string;
  /** STEADI score at follow-up */
  steadiScore: number;
  /** TUG time at follow-up (if performed) */
  tugTimeSeconds?: number;
  /** Number of falls since baseline */
  fallsSinceBaseline: number;
  /** Number of near-misses since baseline */
  nearMissesSinceBaseline: number;
  /** PROMIS Physical Function T-score (if available) */
  promisPhysicalFunction?: number;
  /** Active interventions at this follow-up */
  interventionsActive: string[];
}

/** Complete fall prevention outcome tracking record */
export interface FallPreventionOutcome {
  /** Baseline assessment ID */
  assessmentId: string;
  /** Baseline date */
  baselineDate: string;
  /** Baseline composite score */
  baselineScore: number;

  /** 30/60/90-day follow-up assessments */
  followUps: FallPreventionFollowUp[];

  // --- Calculated outcome measures ---
  /** Percentage reduction in fall risk score from baseline */
  fallReduction: number;
  /** Absolute score improvement from baseline */
  scoreImprovement: number;
  /** Overall trajectory classification */
  trajectory: OutcomeTrajectory;

  // --- Value-based care metrics (for ACCESS Model) ---
  /** Estimated avoided ER visits based on risk reduction */
  avoidedERVisits: number;
  /** Estimated avoided hospitalizations based on risk reduction */
  avoidedHospitalizations: number;
  /** Estimated savings to the health system in cents */
  estimatedSavingsToSystemCents: number;
}

/** Average costs used for system savings calculations */
const SYSTEM_COST_ESTIMATES = {
  /** Average cost of a fall-related ER visit in cents */
  ER_VISIT_CENTS: 350000, // $3,500
  /** Average cost of a fall-related hospitalization in cents */
  HOSPITALIZATION_CENTS: 3500000, // $35,000
  /** Annual ER visit probability for high-risk faller */
  HIGH_RISK_ER_PROBABILITY: 0.35,
  /** Annual hospitalization probability for high-risk faller */
  HIGH_RISK_HOSPITALIZATION_PROBABILITY: 0.1,
} as const;

/**
 * Track fall prevention outcomes over time.
 *
 * Compares baseline assessment to follow-up assessments and calculates:
 *   - Score improvement trajectory
 *   - Fall/near-miss reduction
 *   - Estimated system savings (for ACCESS Model outcome reporting)
 */
export function trackFallPreventionOutcomes(
  baselineAssessment: FallRiskAssessment,
  followUps: FallPreventionFollowUp[],
): FallPreventionOutcome {
  const sortedFollowUps = [...followUps].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Calculate score improvement from most recent follow-up
  const latestFollowUp =
    sortedFollowUps.length > 0 ? sortedFollowUps[sortedFollowUps.length - 1] : null;

  const latestScore = latestFollowUp?.steadiScore ?? baselineAssessment.steadiScore;
  const scoreImprovement = baselineAssessment.steadiScore - latestScore;
  const fallReduction =
    baselineAssessment.steadiScore > 0
      ? (scoreImprovement / baselineAssessment.steadiScore) * 100
      : 0;

  // Determine trajectory
  let trajectory: OutcomeTrajectory = 'stable';
  if (sortedFollowUps.length >= 2) {
    const recentScores = sortedFollowUps.slice(-2).map((f) => f.steadiScore);
    const recent = recentScores[1] ?? 0;
    const previous = recentScores[0] ?? 0;
    if (recent < previous) {
      trajectory = 'improving';
    } else if (recent > previous) {
      trajectory = 'declining';
    }
  } else if (scoreImprovement > 0) {
    trajectory = 'improving';
  } else if (scoreImprovement < 0) {
    trajectory = 'declining';
  }

  // Estimate avoided events based on risk reduction
  const riskReductionFactor = Math.max(0, fallReduction / 100);
  const avoidedERVisits =
    Math.round(SYSTEM_COST_ESTIMATES.HIGH_RISK_ER_PROBABILITY * riskReductionFactor * 10) / 10;
  const avoidedHospitalizations =
    Math.round(
      SYSTEM_COST_ESTIMATES.HIGH_RISK_HOSPITALIZATION_PROBABILITY * riskReductionFactor * 10,
    ) / 10;

  // Estimated system savings
  const estimatedSavingsToSystemCents = Math.round(
    avoidedERVisits * SYSTEM_COST_ESTIMATES.ER_VISIT_CENTS +
      avoidedHospitalizations * SYSTEM_COST_ESTIMATES.HOSPITALIZATION_CENTS,
  );

  return {
    assessmentId: baselineAssessment.id,
    baselineDate: baselineAssessment.assessedAt,
    baselineScore: baselineAssessment.compositeScore,
    followUps: sortedFollowUps,
    fallReduction: Math.round(fallReduction * 10) / 10,
    scoreImprovement,
    trajectory,
    avoidedERVisits,
    avoidedHospitalizations,
    estimatedSavingsToSystemCents,
  };
}

// ============================================================
// FULL ASSESSMENT FUNCTION
// ============================================================

/**
 * Perform a complete fall risk assessment.
 *
 * This is the primary entry point — takes raw inputs and produces
 * the full FallRiskAssessment with all generated outputs:
 *   - Composite score
 *   - ICD-10 codes
 *   - Omaha problem codes
 *   - LMN justification
 *   - Care plan recommendations
 *   - Billing opportunities
 */
export function performFallRiskAssessment(params: {
  id: string;
  careRecipientId: string;
  assessedBy: string;
  steadiResponses: Record<string, boolean>;
  tugTimeSeconds?: number;
  tugAssistiveDevice?: string;
  tugGaitIssues?: GaitIssue[];
  promisPhysicalFunction?: number;
  environmentalRisks?: string[];
  medications?: string[];
  recentFallEvent?: boolean;
  hasMedicare?: boolean;
  hasHSA?: boolean;
  hasFSA?: boolean;
  chronicConditionCount?: number;
  careHoursPerWeek?: number;
}): FallRiskAssessment {
  // Score STEADI
  const steadiResult = scoreSTEADI(params.steadiResponses);

  // Score TUG if provided
  const tugResult =
    params.tugTimeSeconds !== undefined
      ? scoreTUG(params.tugTimeSeconds, params.tugAssistiveDevice, params.tugGaitIssues ?? [])
      : undefined;

  // Identify fall risk medications
  const fallRiskMedications = params.medications
    ? identifyFallRiskMedications(params.medications)
    : [];
  const polypharmacy = (params.medications?.length ?? 0) >= 5;

  // Environmental risks
  const environmentalRisks = params.environmentalRisks ?? [];

  // Calculate composite score
  const compositeScore = calculateCompositeScore({
    steadiScore: steadiResult.score,
    tugTimeSeconds: params.tugTimeSeconds,
    promisPhysicalFunctionTScore: params.promisPhysicalFunction,
    environmentalRiskCount: environmentalRisks.length,
    fallRiskMedCount: fallRiskMedications.length,
    polypharmacy,
  });
  const compositeRisk = classifyCompositeRisk(compositeScore);

  // Generate ICD-10 codes
  const icd10Codes = generateICD10Codes({
    steadiScore: steadiResult.score,
    steadiResponses: params.steadiResponses,
    tugResult,
    promisPhysicalFunction: params.promisPhysicalFunction,
    recentFallEvent: params.recentFallEvent,
  });

  // Map to Omaha problems
  const omahaProblemCodes = mapToOmahaProblems(icd10Codes);

  // Generate care plan recommendations
  const carePlanRecommendations = generateCarePlanRecommendations({
    steadiScore: steadiResult.score,
    steadiResponses: params.steadiResponses,
    tugResult,
    environmentalRisks,
    fallRiskMedications,
    polypharmacy,
  });

  // Identify billing opportunities
  const billingOpportunities = identifyBillingOpportunities({
    compositeRisk,
    icd10Codes,
    hasMedicare: params.hasMedicare ?? false,
    hasHSA: params.hasHSA ?? false,
    hasFSA: params.hasFSA ?? false,
    recentHospitalization: params.recentFallEvent ?? false,
    chronicConditionCount: params.chronicConditionCount ?? 0,
    careHoursPerWeek: params.careHoursPerWeek ?? 10,
  });

  // Generate LMN justification
  const lmnData = generateFallRiskLMNJustification(
    {
      // Build a partial assessment for LMN generation
      id: params.id,
      careRecipientId: params.careRecipientId,
      assessedAt: new Date().toISOString(),
      assessedBy: params.assessedBy,
      steadiScore: steadiResult.score,
      steadiRisk: steadiResult.risk,
      steadiResponses: params.steadiResponses,
      tugResult,
      promisPhysicalFunction: params.promisPhysicalFunction,
      environmentalRisks,
      fallRiskMedications,
      polypharmacy,
      compositeScore,
      compositeRisk,
      icd10Codes,
      omahaProblemCodes,
      lmnJustification: '', // Will be set below
      carePlanRecommendations,
      billingOpportunities,
    },
    params.careHoursPerWeek ?? 10,
  );

  return {
    id: params.id,
    careRecipientId: params.careRecipientId,
    assessedAt: new Date().toISOString(),
    assessedBy: params.assessedBy,
    steadiScore: steadiResult.score,
    steadiRisk: steadiResult.risk,
    steadiResponses: params.steadiResponses,
    tugResult,
    promisPhysicalFunction: params.promisPhysicalFunction,
    environmentalRisks,
    fallRiskMedications,
    polypharmacy,
    compositeScore,
    compositeRisk,
    icd10Codes,
    omahaProblemCodes,
    lmnJustification: lmnData.medicalNecessity,
    carePlanRecommendations,
    billingOpportunities,
  };
}

// ============================================================
// FULL REIMBURSEMENT NARRATIVE GENERATOR — The Crown Jewel
// ============================================================

/** Output of the complete reimbursement story generator */
export interface ReimbursementStory {
  /** Family-facing headline with estimated savings */
  headline: string;
  /** Full human-readable narrative explaining the complete cascade */
  narrative: string;
  /** Detailed financial breakdown */
  breakdown: ReimbursementCascade;
  /** Ordered next steps for the family */
  nextSteps: string[];
  /** How quickly the family will see their first savings */
  timelineToFirstSavings: string;
}

/**
 * Generate the complete reimbursement story for a specific patient.
 *
 * This is the crown jewel — it takes a fall risk assessment and the
 * patient's insurance/financial situation and produces a complete,
 * human-readable narrative of how co-op.care can help them save money
 * while getting better care.
 *
 * Used in: Sage family consultations, Conductor presentations,
 * health system partnership demos, investor pitch materials.
 */
export function generateReimbursementStory(params: {
  fallRiskAssessment: FallRiskAssessment;
  careHoursPerWeek: number;
  state: string;
  hasMedicare: boolean;
  hasHSA: boolean;
  hasFSA: boolean;
  recentHospitalization?: boolean;
  chronicConditions?: string[];
}): ReimbursementStory {
  const {
    fallRiskAssessment,
    careHoursPerWeek,
    state,
    hasMedicare,
    hasHSA,
    hasFSA,
    recentHospitalization,
    chronicConditions,
  } = params;

  // Calculate the full cascade
  const breakdown = calculateReimbursementCascade(
    fallRiskAssessment,
    careHoursPerWeek,
    HOME_CARE_RATES.COMPANION_RATE_CENTS_PER_HOUR,
    {
      hasMedicare,
      hasHSA,
      hasFSA,
      chronicConditionCount: chronicConditions?.length ?? 0,
    },
  );

  const toDollars = (cents: number) => `$${Math.round(cents / 100).toLocaleString()}`;

  // Build headline
  const totalAnnualSavings =
    breakdown.familyAnnualSavingsCents +
    (hasMedicare
      ? (breakdown.pinRevenueCents +
          breakdown.chiRevenueCents +
          breakdown.ccmRevenueCents +
          breakdown.rpmRevenueCents) *
        12
      : 0);

  const headline =
    totalAnnualSavings > 0
      ? `Your loved one qualifies for up to ${toDollars(breakdown.totalAnnualRevenueCents)} in annual care coverage, with ${toDollars(breakdown.familyAnnualSavingsCents)} in direct tax savings for your family`
      : `Your loved one qualifies for medically-necessary fall prevention care at ${toDollars(HOME_CARE_RATES.COMPANION_RATE_CENTS_PER_HOUR)}/hour`;

  // Build narrative
  const narrativeLines: string[] = [];

  narrativeLines.push('HOW CO-OP.CARE HELPS YOUR FAMILY');
  narrativeLines.push('='.repeat(40));
  narrativeLines.push('');

  // The clinical picture
  narrativeLines.push(
    `Based on our assessment, your loved one has a ${fallRiskAssessment.compositeRisk} ` +
      `fall risk (score: ${fallRiskAssessment.compositeScore}/100). ` +
      `The CDC STEADI screening identified ${fallRiskAssessment.steadiScore} of 12 ` +
      `risk factors.`,
  );
  narrativeLines.push('');

  // Why this matters
  narrativeLines.push(
    'Falls are the leading cause of injury in adults over 65. One in three ' +
      'older adults who fall will be hospitalized, with an average cost of ' +
      '$35,000. But falls are preventable — and that preventability is what ' +
      'makes fall prevention care medically necessary and reimbursable.',
  );
  narrativeLines.push('');

  // The care plan
  narrativeLines.push('YOUR FALL PREVENTION CARE PLAN');
  narrativeLines.push('-'.repeat(30));
  narrativeLines.push(
    `We recommend ${careHoursPerWeek} hours per week of companion care ` +
      `focused on fall prevention. Your dedicated caregiver — a worker-owner ` +
      `of the co-op who knows your loved one personally — will provide:`,
  );
  const keyInterventions = [
    'Supervised ambulation and exercise support',
    'Medication reminders and management',
    'Home safety monitoring and hazard removal',
    'Fall detection via Galaxy Watch (worn 24/7)',
    'Social engagement to combat isolation and depression',
    'Meal preparation and nutrition support',
  ];
  for (const intervention of keyInterventions) {
    narrativeLines.push(`  - ${intervention}`);
  }
  narrativeLines.push('');

  // The money — this is what families care about most
  narrativeLines.push('HOW IT GETS PAID FOR');
  narrativeLines.push('-'.repeat(30));
  narrativeLines.push('');

  // Layer 1: Companion care cost
  const monthlyCare = breakdown.companionCareRevenueCents;
  narrativeLines.push(
    `1. COMPANION CARE: ${careHoursPerWeek} hrs/week x ` +
      `${toDollars(HOME_CARE_RATES.COMPANION_RATE_CENTS_PER_HOUR)}/hr = ` +
      `${toDollars(monthlyCare)}/month`,
  );

  // Layer 2: HSA/FSA
  if (hasHSA || hasFSA) {
    narrativeLines.push('');
    narrativeLines.push(
      `2. HSA/FSA TAX SAVINGS: Because your loved one's fall risk is ` +
        `medically documented (ICD-10: ${fallRiskAssessment.icd10Codes.join(', ')}), ` +
        `Dr. Josh Emdur can sign a Letter of Medical Necessity. This makes ` +
        `the ENTIRE cost of companion care payable from your ${hasHSA ? 'HSA' : 'FSA'} ` +
        `with pre-tax dollars — saving you ${toDollars(breakdown.hsaMonthlySavingsCents)}/month ` +
        `(${toDollars(breakdown.familyAnnualSavingsCents)}/year).`,
    );
  }

  // Layer 3: Medicare billing
  if (hasMedicare) {
    narrativeLines.push('');
    narrativeLines.push('3. MEDICARE-COVERED NAVIGATION SERVICES:');

    if (breakdown.pinRevenueCents > 0) {
      narrativeLines.push(
        `   - Care Navigation (PIN): ${toDollars(breakdown.pinRevenueCents)}/month — ` +
          'coordinating your fall prevention plan, PT referrals, specialist communication',
      );
    }
    if (breakdown.chiRevenueCents > 0) {
      narrativeLines.push(
        `   - Community Integration (CHI): ${toDollars(breakdown.chiRevenueCents)}/month — ` +
          'home safety modifications, community resources, social support',
      );
    }
    if (breakdown.ccmRevenueCents > 0) {
      narrativeLines.push(
        `   - Chronic Care Management (CCM): ${toDollars(breakdown.ccmRevenueCents)}/month — ` +
          `managing ${chronicConditions?.join(', ') ?? 'chronic conditions'} alongside fall risk`,
      );
    }
    if (breakdown.rpmRevenueCents > 0) {
      narrativeLines.push(
        `   - Remote Monitoring (RPM): ${toDollars(breakdown.rpmRevenueCents)}/month — ` +
          'Galaxy Watch continuous fall detection and activity tracking',
      );
    }

    const totalMedicare =
      breakdown.pinRevenueCents +
      breakdown.chiRevenueCents +
      breakdown.ccmRevenueCents +
      breakdown.rpmRevenueCents;
    narrativeLines.push(
      `   TOTAL MEDICARE: ${toDollars(totalMedicare)}/month (${toDollars(totalMedicare * 12)}/year)`,
    );
  }

  // CARA Act
  const cara = getCARACompliance(state);
  if (cara?.caraEnacted && recentHospitalization) {
    narrativeLines.push('');
    narrativeLines.push(
      `4. CARE ACT COMPLIANCE: ${state} has enacted the CARE Act, which ` +
        `requires hospitals to identify a family caregiver, notify them of ` +
        `discharge, and provide care education. Because your loved one was ` +
        `recently hospitalized, the hospital is REQUIRED to coordinate with ` +
        `a caregiver organization. co-op.care is that organization.`,
    );
  }

  // Summary
  narrativeLines.push('');
  narrativeLines.push('MONTHLY SUMMARY');
  narrativeLines.push('-'.repeat(30));
  narrativeLines.push(`  Care cost:        ${toDollars(monthlyCare)}/month`);
  if (hasHSA || hasFSA) {
    narrativeLines.push(`  Tax savings:     -${toDollars(breakdown.hsaMonthlySavingsCents)}/month`);
    narrativeLines.push(
      `  Net cost:         ${toDollars(monthlyCare - breakdown.hsaMonthlySavingsCents)}/month`,
    );
  }
  narrativeLines.push(`  Annual total:     ${toDollars(breakdown.totalAnnualRevenueCents)}`);

  const narrative = narrativeLines.join('\n');

  // Next steps
  const nextSteps: string[] = [
    'Schedule your free Sage conversation — our AI care guide will walk you through the full assessment in about 15 minutes',
    "We will complete the formal fall risk screening and generate your loved one's personalized care plan",
  ];

  if (hasHSA || hasFSA) {
    nextSteps.push(
      'Dr. Emdur will review the assessment and sign the Letter of Medical Necessity for HSA/FSA eligibility',
    );
  }

  nextSteps.push(
    'We match your loved one with a dedicated companion caregiver — a worker-owner of the cooperative',
  );
  nextSteps.push(
    'Care begins within 48-72 hours of matching, with Galaxy Watch RPM setup on day one',
  );
  nextSteps.push('First follow-up assessment at 30 days to track improvement');

  if (recentHospitalization && cara?.caraEnacted) {
    nextSteps.unshift(
      `PRIORITY: Your loved one's recent hospitalization triggers CARE Act requirements in ${state} — contact the hospital discharge planner to designate co-op.care as the caregiver organization`,
    );
  }

  // Timeline
  let timelineToFirstSavings: string;
  if (hasHSA || hasFSA) {
    timelineToFirstSavings =
      'HSA/FSA savings begin immediately once the LMN is signed (typically within 3-5 business days of assessment). ' +
      'Medicare navigation billing begins in the first full calendar month of care.';
  } else if (hasMedicare) {
    timelineToFirstSavings =
      'Medicare navigation billing begins in the first full calendar month of care. ' +
      'RPM billing begins once 16 days of Galaxy Watch data are collected (typically month 1).';
  } else {
    timelineToFirstSavings =
      'Care begins within 48-72 hours of caregiver matching. ' +
      'Consider opening an HSA to unlock 25-37% tax savings on all care costs.';
  }

  return {
    headline,
    narrative,
    breakdown,
    nextSteps,
    timelineToFirstSavings,
  };
}
