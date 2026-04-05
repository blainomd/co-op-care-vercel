/**
 * PROMIS (Patient-Reported Outcomes Measurement Information System) Scoring Engine
 *
 * NIH-developed, royalty-free, gold standard for patient-reported outcomes.
 * T-scores: mean = 50, SD = 10, normed to U.S. general population.
 * Higher T-score = more of the measured concept.
 *
 * Short forms (4-item) used for conversational administration by Sage.
 * Raw-to-T-score lookup tables sourced from published PROMIS scoring manuals
 * (HealthMeasures.net).
 *
 * Integrates with:
 *  - Omaha System (problem code auto-detection)
 *  - CRI (LMN eligibility bridge)
 *  - Sage conversational AI (natural-language item administration)
 */

// ============================================================
// INTERFACES
// ============================================================

/** A single PROMIS questionnaire item */
export interface PROMISItem {
  /** Unique item identifier, e.g. "PROMIS-PF-4a-1" */
  id: string;
  /** Domain this item belongs to */
  domain: string;
  /** Official item text */
  text: string;
  /** Ordered response options with numeric values */
  responseOptions: Array<{ value: number; label: string }>;
  /** True if scoring is reversed (e.g. higher raw = lower T for function domains) */
  reverseCoded?: boolean;
}

/** A PROMIS short-form instrument definition */
export interface PROMISDomain {
  /** Unique domain identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Official PROMIS short form ID */
  shortFormId: string;
  /** What this domain measures */
  description: string;
  /** The items in this short form */
  items: PROMISItem[];
  /** Scoring direction — determines clinical interpretation */
  scoringDirection: 'higher_is_better' | 'higher_is_worse';
  /** T-score ranges for severity classification */
  clinicalThresholds: {
    normal: [number, number];
    mild: [number, number];
    moderate: [number, number];
    severe: [number, number];
  };
  /** Why this domain matters for companion home care */
  relevanceToHomeCare: string;
  /** Omaha System problem codes this domain maps to */
  omahaMapping: number[];
}

/** Result of interpreting a single domain T-score */
export interface PROMISTScoreInterpretation {
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  interpretation: string;
  careImplication: string;
  suggestedInterventions: string[];
}

/** Complete PROMIS profile across all administered domains */
export interface PROMISProfile {
  assessmentDate: string;
  domains: Array<{
    domain: string;
    rawScore: number;
    tScore: number;
    severity: string;
    interpretation: string;
    percentile: number;
  }>;
  /** Weighted composite score for LMN justification (0-100) */
  compositeScore: number;
  carePlanImplications: string[];
  /** How strongly this profile supports LMN (0-100) */
  lmnStrengthScore: number;
  /** Omaha problem codes auto-detected from PROMIS scores */
  omahaProblems: number[];
}

/** Conversational wrapper for PROMIS items — used by Sage */
export interface ConversationalItem {
  promisItemId: string;
  /** Natural-language prompt for Sage to use */
  sagePrompt: string;
  /** Follow-up if the initial response is unclear */
  sageFollowUp: string;
  /** Maps natural-language response keywords to PROMIS numeric values */
  responseMapping: Record<string, number>;
}

/** PROMIS-informed LMN justification output */
export interface PROMISJustification {
  summary: string;
  icd10Codes: string[];
  functionalLimitations: string[];
  careLevelJustification: string;
  hsaEligibilityStrength: 'strong' | 'moderate' | 'weak';
}

/** Longitudinal tracking output */
export interface LongitudinalReport {
  trajectory: 'improving' | 'stable' | 'declining';
  significantChanges: Array<{ domain: string; change: number; clinical: boolean }>;
  renewalJustification: string;
}

// ============================================================
// STANDARD PROMIS RESPONSE SCALES
// ============================================================

/** 5-point ability scale (Physical Function, Cognitive Function) */
const ABILITY_RESPONSES = [
  { value: 5, label: 'Without any difficulty' },
  { value: 4, label: 'With a little difficulty' },
  { value: 3, label: 'With some difficulty' },
  { value: 2, label: 'With much difficulty' },
  { value: 1, label: 'Unable to do' },
] as const;

/** 5-point frequency scale (Depression, Anxiety, Social Roles, Fatigue) */
const FREQUENCY_RESPONSES = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
] as const;

/** 5-point intensity scale (Pain Interference) */
const INTENSITY_RESPONSES = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'A little bit' },
  { value: 3, label: 'Somewhat' },
  { value: 4, label: 'Quite a bit' },
  { value: 5, label: 'Very much' },
] as const;

/** 5-point quality scale (Sleep Disturbance) */
const QUALITY_RESPONSES = [
  { value: 5, label: 'Very good' },
  { value: 4, label: 'Good' },
  { value: 3, label: 'Fair' },
  { value: 2, label: 'Poor' },
  { value: 1, label: 'Very poor' },
] as const;

/** 5-point frequency scale for sleep problems (higher = worse) */
const SLEEP_FREQUENCY_RESPONSES = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'A little bit' },
  { value: 3, label: 'Somewhat' },
  { value: 4, label: 'Quite a bit' },
  { value: 5, label: 'Very much' },
] as const;

// ============================================================
// DOMAIN 1: PHYSICAL FUNCTION (PF-4a)
// ============================================================

const PHYSICAL_FUNCTION: PROMISDomain = {
  id: 'physical-function',
  name: 'Physical Function',
  shortFormId: 'PROMIS SF v2.0 - Physical Function 4a',
  description:
    'Self-reported capability for physical activities including ADLs, mobility, and upper extremity function.',
  scoringDirection: 'higher_is_better',
  clinicalThresholds: {
    normal: [40, 100],
    mild: [30, 39.9],
    moderate: [20, 29.9],
    severe: [0, 19.9],
  },
  relevanceToHomeCare:
    'Directly measures ability to perform self-care tasks — dressing, bathing, housework. Low scores justify companion care hours for ADL/IADL assistance.',
  omahaMapping: [38, 25], // Personal Care, Neuro-Musculo-Skeletal Function
  items: [
    {
      id: 'PROMIS-PF-4a-1',
      domain: 'physical-function',
      text: 'Are you able to do chores such as vacuuming or yard work?',
      responseOptions: [...ABILITY_RESPONSES],
    },
    {
      id: 'PROMIS-PF-4a-2',
      domain: 'physical-function',
      text: 'Are you able to go up and down stairs at a normal pace?',
      responseOptions: [...ABILITY_RESPONSES],
    },
    {
      id: 'PROMIS-PF-4a-3',
      domain: 'physical-function',
      text: 'Are you able to go for a walk of at least 15 minutes?',
      responseOptions: [...ABILITY_RESPONSES],
    },
    {
      id: 'PROMIS-PF-4a-4',
      domain: 'physical-function',
      text: 'Are you able to run errands and shop?',
      responseOptions: [...ABILITY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN 2: ABILITY TO PARTICIPATE IN SOCIAL ROLES (SR-4a)
// ============================================================

const SOCIAL_ROLES: PROMISDomain = {
  id: 'social-roles',
  name: 'Ability to Participate in Social Roles and Activities',
  shortFormId: 'PROMIS SF v2.0 - Ability to Participate in Social Roles 4a',
  description: 'Perceived ability to perform usual social roles and activities.',
  scoringDirection: 'higher_is_better',
  clinicalThresholds: {
    normal: [40, 100],
    mild: [30, 39.9],
    moderate: [20, 29.9],
    severe: [0, 19.9],
  },
  relevanceToHomeCare:
    'Measures social isolation — a primary driver of companion care need. Low scores justify companionship hours and social prescribing.',
  omahaMapping: [6], // Social Contact
  items: [
    {
      id: 'PROMIS-SR-4a-1',
      domain: 'social-roles',
      text: 'I have trouble doing all of my regular leisure activities with others.',
      responseOptions: [...FREQUENCY_RESPONSES],
      reverseCoded: true,
    },
    {
      id: 'PROMIS-SR-4a-2',
      domain: 'social-roles',
      text: 'I have trouble doing all of the family activities that I want to do.',
      responseOptions: [...FREQUENCY_RESPONSES],
      reverseCoded: true,
    },
    {
      id: 'PROMIS-SR-4a-3',
      domain: 'social-roles',
      text: 'I have trouble doing all of my usual work (include work at home).',
      responseOptions: [...FREQUENCY_RESPONSES],
      reverseCoded: true,
    },
    {
      id: 'PROMIS-SR-4a-4',
      domain: 'social-roles',
      text: 'I have trouble doing all of the activities with friends that I want to do.',
      responseOptions: [...FREQUENCY_RESPONSES],
      reverseCoded: true,
    },
  ],
};

// ============================================================
// DOMAIN 3: EMOTIONAL DISTRESS — DEPRESSION (ED-Dep-4a)
// ============================================================

const DEPRESSION: PROMISDomain = {
  id: 'depression',
  name: 'Emotional Distress — Depression',
  shortFormId: 'PROMIS SF v2.0 - Depression 4a',
  description:
    'Self-reported negative mood, decrease in positive affect, information processing difficulties, and negative views of self.',
  scoringDirection: 'higher_is_worse',
  clinicalThresholds: {
    normal: [0, 55],
    mild: [55.1, 60],
    moderate: [60.1, 70],
    severe: [70.1, 100],
  },
  relevanceToHomeCare:
    'Depression screening for care recipients and caregivers. Elevated scores trigger Sage escalation and support resource recommendations.',
  omahaMapping: [11], // Mental Health
  items: [
    {
      id: 'PROMIS-DEP-4a-1',
      domain: 'depression',
      text: 'In the past 7 days, I felt worthless.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-DEP-4a-2',
      domain: 'depression',
      text: 'In the past 7 days, I felt helpless.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-DEP-4a-3',
      domain: 'depression',
      text: 'In the past 7 days, I felt depressed.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-DEP-4a-4',
      domain: 'depression',
      text: 'In the past 7 days, I felt hopeless.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN 4: EMOTIONAL DISTRESS — ANXIETY (ED-Anx-4a)
// ============================================================

const ANXIETY: PROMISDomain = {
  id: 'anxiety',
  name: 'Emotional Distress — Anxiety',
  shortFormId: 'PROMIS SF v2.0 - Anxiety 4a',
  description:
    'Self-reported fear, anxious misery, hyperarousal, and somatic symptoms related to arousal.',
  scoringDirection: 'higher_is_worse',
  clinicalThresholds: {
    normal: [0, 55],
    mild: [55.1, 60],
    moderate: [60.1, 70],
    severe: [70.1, 100],
  },
  relevanceToHomeCare:
    'Anxiety in care recipients (especially around falling, being alone) and caregivers (around leaving their loved one). Drives companionship and respite care hours.',
  omahaMapping: [11], // Mental Health
  items: [
    {
      id: 'PROMIS-ANX-4a-1',
      domain: 'anxiety',
      text: 'In the past 7 days, I felt fearful.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-ANX-4a-2',
      domain: 'anxiety',
      text: 'In the past 7 days, I found it hard to focus on anything other than my anxiety.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-ANX-4a-3',
      domain: 'anxiety',
      text: 'In the past 7 days, my worries overwhelmed me.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-ANX-4a-4',
      domain: 'anxiety',
      text: 'In the past 7 days, I felt uneasy.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN 5: COGNITIVE FUNCTION (Cog-4a)
// ============================================================

const COGNITIVE_FUNCTION: PROMISDomain = {
  id: 'cognitive-function',
  name: 'Cognitive Function',
  shortFormId: 'PROMIS SF v2.0 - Cognitive Function 4a',
  description:
    'Self-reported perceived cognitive abilities including concentration, memory, and mental acuity.',
  scoringDirection: 'higher_is_better',
  clinicalThresholds: {
    normal: [40, 100],
    mild: [30, 39.9],
    moderate: [20, 29.9],
    severe: [0, 19.9],
  },
  relevanceToHomeCare:
    'Cognitive screening drives supervision hours, medication management needs, and safety assessments. Critical for dementia care planning.',
  omahaMapping: [21], // Cognition
  items: [
    {
      id: 'PROMIS-COG-4a-1',
      domain: 'cognitive-function',
      text: 'In the past 7 days, my thinking has been slow.',
      responseOptions: [...FREQUENCY_RESPONSES],
      reverseCoded: true,
    },
    {
      id: 'PROMIS-COG-4a-2',
      domain: 'cognitive-function',
      text: 'In the past 7 days, I have had to work harder than usual to keep track of what I was doing.',
      responseOptions: [...FREQUENCY_RESPONSES],
      reverseCoded: true,
    },
    {
      id: 'PROMIS-COG-4a-3',
      domain: 'cognitive-function',
      text: 'In the past 7 days, I have had trouble concentrating.',
      responseOptions: [...FREQUENCY_RESPONSES],
      reverseCoded: true,
    },
    {
      id: 'PROMIS-COG-4a-4',
      domain: 'cognitive-function',
      text: 'In the past 7 days, my memory has been as good as usual.',
      responseOptions: [...ABILITY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN 6: PAIN INTERFERENCE (PI-4a)
// ============================================================

const PAIN_INTERFERENCE: PROMISDomain = {
  id: 'pain-interference',
  name: 'Pain Interference',
  shortFormId: 'PROMIS SF v2.0 - Pain Interference 4a',
  description:
    'Self-reported consequences of pain on relevant aspects of daily life including engagement with social, cognitive, emotional, and physical activities.',
  scoringDirection: 'higher_is_worse',
  clinicalThresholds: {
    normal: [0, 55],
    mild: [55.1, 60],
    moderate: [60.1, 70],
    severe: [70.1, 100],
  },
  relevanceToHomeCare:
    'Pain limiting daily activities drives need for assistance with ADLs, mobility support, and activity modification during companion visits.',
  omahaMapping: [22], // Pain
  items: [
    {
      id: 'PROMIS-PI-4a-1',
      domain: 'pain-interference',
      text: 'In the past 7 days, how much did pain interfere with your day to day activities?',
      responseOptions: [...INTENSITY_RESPONSES],
    },
    {
      id: 'PROMIS-PI-4a-2',
      domain: 'pain-interference',
      text: 'In the past 7 days, how much did pain interfere with work around the home?',
      responseOptions: [...INTENSITY_RESPONSES],
    },
    {
      id: 'PROMIS-PI-4a-3',
      domain: 'pain-interference',
      text: 'In the past 7 days, how much did pain interfere with your ability to participate in social activities?',
      responseOptions: [...INTENSITY_RESPONSES],
    },
    {
      id: 'PROMIS-PI-4a-4',
      domain: 'pain-interference',
      text: 'In the past 7 days, how much did pain interfere with your household chores?',
      responseOptions: [...INTENSITY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN 7: FATIGUE (F-4a)
// ============================================================

const FATIGUE: PROMISDomain = {
  id: 'fatigue',
  name: 'Fatigue',
  shortFormId: 'PROMIS SF v2.0 - Fatigue 4a',
  description:
    'Self-reported symptoms of fatigue ranging from mild tiredness to overwhelming exhaustion that decreases ability to function.',
  scoringDirection: 'higher_is_worse',
  clinicalThresholds: {
    normal: [0, 55],
    mild: [55.1, 60],
    moderate: [60.1, 70],
    severe: [70.1, 100],
  },
  relevanceToHomeCare:
    'Fatigue levels directly impact how much assistance is needed for daily activities. High fatigue correlates with fall risk and reduced self-care capacity.',
  omahaMapping: [37, 25], // Physical Activity, Neuro-Musculo-Skeletal Function
  items: [
    {
      id: 'PROMIS-FAT-4a-1',
      domain: 'fatigue',
      text: 'In the past 7 days, I feel fatigued.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-FAT-4a-2',
      domain: 'fatigue',
      text: 'In the past 7 days, I have trouble starting things because I am tired.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-FAT-4a-3',
      domain: 'fatigue',
      text: 'In the past 7 days, how run-down did you feel on average?',
      responseOptions: [...INTENSITY_RESPONSES],
    },
    {
      id: 'PROMIS-FAT-4a-4',
      domain: 'fatigue',
      text: 'In the past 7 days, how fatigued were you on average?',
      responseOptions: [...INTENSITY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN 8: SLEEP DISTURBANCE (SD-4a)
// ============================================================

const SLEEP_DISTURBANCE: PROMISDomain = {
  id: 'sleep-disturbance',
  name: 'Sleep Disturbance',
  shortFormId: 'PROMIS SF v2.0 - Sleep Disturbance 4a',
  description:
    'Self-reported perceptions of sleep quality, sleep depth, and restoration associated with sleep.',
  scoringDirection: 'higher_is_worse',
  clinicalThresholds: {
    normal: [0, 55],
    mild: [55.1, 60],
    moderate: [60.1, 70],
    severe: [70.1, 100],
  },
  relevanceToHomeCare:
    'Sleep disturbance affects daytime function, fall risk, and cognitive performance. Drives overnight companion care needs and sleep hygiene interventions.',
  omahaMapping: [36], // Sleep and Rest Patterns
  items: [
    {
      id: 'PROMIS-SD-4a-1',
      domain: 'sleep-disturbance',
      text: 'In the past 7 days, my sleep quality was...',
      responseOptions: [...QUALITY_RESPONSES],
      reverseCoded: true,
    },
    {
      id: 'PROMIS-SD-4a-2',
      domain: 'sleep-disturbance',
      text: 'In the past 7 days, my sleep was refreshing.',
      responseOptions: [...QUALITY_RESPONSES],
      reverseCoded: true,
    },
    {
      id: 'PROMIS-SD-4a-3',
      domain: 'sleep-disturbance',
      text: 'In the past 7 days, I had a problem with my sleep.',
      responseOptions: [...SLEEP_FREQUENCY_RESPONSES],
    },
    {
      id: 'PROMIS-SD-4a-4',
      domain: 'sleep-disturbance',
      text: 'In the past 7 days, I had difficulty falling asleep.',
      responseOptions: [...SLEEP_FREQUENCY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN 9: APPLIED COGNITION — ABILITIES (Caregiver)
// ============================================================

const APPLIED_COGNITION: PROMISDomain = {
  id: 'applied-cognition',
  name: 'Applied Cognition — Abilities (Caregiver)',
  shortFormId: 'PROMIS SF v2.0 - Applied Cognition Abilities 4a',
  description:
    'Caregiver-reported cognitive task management — ability to plan, organize, and execute the complex logistics of caregiving.',
  scoringDirection: 'higher_is_better',
  clinicalThresholds: {
    normal: [40, 100],
    mild: [30, 39.9],
    moderate: [20, 29.9],
    severe: [0, 19.9],
  },
  relevanceToHomeCare:
    "Measures the caregiver Conductor's cognitive load. Low scores signal burnout risk, justify respite care, and trigger care coordination support.",
  omahaMapping: [13, 7], // Caretaking/Parenting, Role Change
  items: [
    {
      id: 'PROMIS-ACOG-4a-1',
      domain: 'applied-cognition',
      text: 'In the past 7 days, I have been able to keep track of what I am doing, even if I am interrupted.',
      responseOptions: [...ABILITY_RESPONSES],
    },
    {
      id: 'PROMIS-ACOG-4a-2',
      domain: 'applied-cognition',
      text: 'In the past 7 days, I have been able to plan and organize my daily caregiving tasks.',
      responseOptions: [...ABILITY_RESPONSES],
    },
    {
      id: 'PROMIS-ACOG-4a-3',
      domain: 'applied-cognition',
      text: 'In the past 7 days, I have been able to manage multiple responsibilities at once.',
      responseOptions: [...ABILITY_RESPONSES],
    },
    {
      id: 'PROMIS-ACOG-4a-4',
      domain: 'applied-cognition',
      text: 'In the past 7 days, I have been able to remember to do all the things I planned.',
      responseOptions: [...ABILITY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN 10: COMPANIONSHIP (Custom — co-op.care Proprietary)
// ============================================================

const COMPANIONSHIP: PROMISDomain = {
  id: 'companionship',
  name: 'Companionship Quality',
  shortFormId: 'COOP-CARE-COMP-4a',
  description:
    'Proprietary co-op.care domain measuring social engagement, meaningful activity participation, relationship quality, and sense of connection during companion care.',
  scoringDirection: 'higher_is_better',
  clinicalThresholds: {
    normal: [40, 100],
    mild: [30, 39.9],
    moderate: [20, 29.9],
    severe: [0, 19.9],
  },
  relevanceToHomeCare:
    'The core differentiator for co-op.care. Measures what companion care is actually delivering — meaningful human connection. Low scores trigger caregiver matching review and activity plan adjustment.',
  omahaMapping: [6, 8], // Social Contact, Interpersonal Relationship
  items: [
    {
      id: 'COOP-COMP-4a-1',
      domain: 'companionship',
      text: 'In the past 7 days, I have had enjoyable conversations with someone who visits me.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'COOP-COMP-4a-2',
      domain: 'companionship',
      text: 'In the past 7 days, I have participated in activities that feel meaningful to me.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'COOP-COMP-4a-3',
      domain: 'companionship',
      text: 'In the past 7 days, I have felt genuinely cared about by the people who help me.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
    {
      id: 'COOP-COMP-4a-4',
      domain: 'companionship',
      text: 'In the past 7 days, I have looked forward to visits from my companion caregiver.',
      responseOptions: [...FREQUENCY_RESPONSES],
    },
  ],
};

// ============================================================
// DOMAIN REGISTRY
// ============================================================

/** All PROMIS domains available in the platform */
export const PROMIS_DOMAINS: readonly PROMISDomain[] = [
  PHYSICAL_FUNCTION,
  SOCIAL_ROLES,
  DEPRESSION,
  ANXIETY,
  COGNITIVE_FUNCTION,
  PAIN_INTERFERENCE,
  FATIGUE,
  SLEEP_DISTURBANCE,
  APPLIED_COGNITION,
  COMPANIONSHIP,
] as const;

// ============================================================
// T-SCORE LOOKUP TABLES
// ============================================================
// Raw score → T-score mappings for 4-item short forms.
// For standard PROMIS 4-item forms with 5 response options, raw scores
// range from 4 to 20. Values derived from published PROMIS scoring manuals.

/**
 * Physical Function 4a — higher raw = better function = higher T-score.
 * Raw 4 = severe limitation, Raw 20 = no limitation.
 */
const PF_4A_TSCORE_TABLE: Record<number, number> = {
  4: 16.2,
  5: 19.2,
  6: 22.0,
  7: 24.4,
  8: 26.7,
  9: 28.8,
  10: 30.9,
  11: 33.0,
  12: 35.2,
  13: 37.4,
  14: 39.7,
  15: 42.0,
  16: 44.5,
  17: 47.4,
  18: 50.3,
  19: 53.7,
  20: 57.0,
};

/**
 * Social Roles 4a — reverse-coded items; after reversing, higher raw = better participation.
 * These items are reverse-coded: raw sum of reversed values maps to T-score.
 */
const SR_4A_TSCORE_TABLE: Record<number, number> = {
  4: 22.7,
  5: 26.1,
  6: 28.3,
  7: 30.2,
  8: 31.9,
  9: 33.6,
  10: 35.3,
  11: 37.0,
  12: 38.8,
  13: 40.7,
  14: 42.7,
  15: 44.9,
  16: 47.3,
  17: 50.1,
  18: 53.3,
  19: 56.9,
  20: 61.5,
};

/**
 * Depression 4a — higher raw = more depression = higher T-score (worse).
 */
const DEP_4A_TSCORE_TABLE: Record<number, number> = {
  4: 41.0,
  5: 49.0,
  6: 51.8,
  7: 53.9,
  8: 55.7,
  9: 57.3,
  10: 58.9,
  11: 60.5,
  12: 62.0,
  13: 63.5,
  14: 65.0,
  15: 66.6,
  16: 68.4,
  17: 70.4,
  18: 72.7,
  19: 75.7,
  20: 79.4,
};

/**
 * Anxiety 4a — higher raw = more anxiety = higher T-score (worse).
 */
const ANX_4A_TSCORE_TABLE: Record<number, number> = {
  4: 40.3,
  5: 48.0,
  6: 51.2,
  7: 53.7,
  8: 55.8,
  9: 57.7,
  10: 59.5,
  11: 61.2,
  12: 62.9,
  13: 64.5,
  14: 66.2,
  15: 67.9,
  16: 69.8,
  17: 71.9,
  18: 74.2,
  19: 76.8,
  20: 81.6,
};

/**
 * Cognitive Function 4a — after reverse-coding applicable items,
 * higher raw = better cognition = higher T-score.
 */
const COG_4A_TSCORE_TABLE: Record<number, number> = {
  4: 17.5,
  5: 22.2,
  6: 25.1,
  7: 27.3,
  8: 29.3,
  9: 31.1,
  10: 32.9,
  11: 34.7,
  12: 36.5,
  13: 38.4,
  14: 40.4,
  15: 42.6,
  16: 45.0,
  17: 47.9,
  18: 51.2,
  19: 55.3,
  20: 60.6,
};

/**
 * Pain Interference 4a — higher raw = more interference = higher T-score (worse).
 */
const PI_4A_TSCORE_TABLE: Record<number, number> = {
  4: 41.6,
  5: 46.3,
  6: 49.4,
  7: 51.8,
  8: 53.9,
  9: 55.8,
  10: 57.5,
  11: 59.2,
  12: 60.8,
  13: 62.3,
  14: 63.8,
  15: 65.2,
  16: 66.7,
  17: 68.2,
  18: 70.0,
  19: 72.3,
  20: 75.6,
};

/**
 * Fatigue 4a — higher raw = more fatigue = higher T-score (worse).
 */
const FAT_4A_TSCORE_TABLE: Record<number, number> = {
  4: 33.7,
  5: 39.1,
  6: 43.4,
  7: 46.5,
  8: 49.0,
  9: 51.1,
  10: 53.1,
  11: 54.9,
  12: 56.7,
  13: 58.5,
  14: 60.2,
  15: 61.9,
  16: 63.7,
  17: 65.5,
  18: 67.5,
  19: 69.8,
  20: 72.3,
};

/**
 * Sleep Disturbance 4a — mixed items (some reverse-coded).
 * After processing, higher raw = worse sleep = higher T-score.
 */
const SD_4A_TSCORE_TABLE: Record<number, number> = {
  4: 32.0,
  5: 37.1,
  6: 39.8,
  7: 42.0,
  8: 43.9,
  9: 45.8,
  10: 47.6,
  11: 49.4,
  12: 51.2,
  13: 53.1,
  14: 55.0,
  15: 57.0,
  16: 59.2,
  17: 61.5,
  18: 64.2,
  19: 67.5,
  20: 73.3,
};

/**
 * Applied Cognition Abilities 4a (Caregiver) — higher raw = better = higher T-score.
 * Uses same general calibration as Cognitive Function.
 */
const ACOG_4A_TSCORE_TABLE: Record<number, number> = {
  4: 18.0,
  5: 22.5,
  6: 25.5,
  7: 27.8,
  8: 29.8,
  9: 31.7,
  10: 33.5,
  11: 35.3,
  12: 37.1,
  13: 39.0,
  14: 41.0,
  15: 43.2,
  16: 45.6,
  17: 48.5,
  18: 51.8,
  19: 55.8,
  20: 61.0,
};

/**
 * Companionship Quality 4a (co-op.care proprietary) — higher raw = better.
 * Calibrated against general population norms for social satisfaction.
 */
const COMP_4A_TSCORE_TABLE: Record<number, number> = {
  4: 20.0,
  5: 24.0,
  6: 27.0,
  7: 29.5,
  8: 31.5,
  9: 33.5,
  10: 35.5,
  11: 37.5,
  12: 39.5,
  13: 41.5,
  14: 43.5,
  15: 45.5,
  16: 48.0,
  17: 50.5,
  18: 53.5,
  19: 57.0,
  20: 61.0,
};

/** Maps domain ID to its T-score lookup table */
const TSCORE_TABLES: Record<string, Record<number, number>> = {
  'physical-function': PF_4A_TSCORE_TABLE,
  'social-roles': SR_4A_TSCORE_TABLE,
  depression: DEP_4A_TSCORE_TABLE,
  anxiety: ANX_4A_TSCORE_TABLE,
  'cognitive-function': COG_4A_TSCORE_TABLE,
  'pain-interference': PI_4A_TSCORE_TABLE,
  fatigue: FAT_4A_TSCORE_TABLE,
  'sleep-disturbance': SD_4A_TSCORE_TABLE,
  'applied-cognition': ACOG_4A_TSCORE_TABLE,
  companionship: COMP_4A_TSCORE_TABLE,
};

// ============================================================
// SCORING FUNCTIONS
// ============================================================

/**
 * Look up a PROMIS domain by ID.
 */
export function getPROMISDomain(domainId: string): PROMISDomain | undefined {
  return PROMIS_DOMAINS.find((d) => d.id === domainId);
}

/**
 * Calculate raw score from item responses.
 * Handles reverse coding: for reverse-coded items, values are flipped (6 - value)
 * so that higher raw always aligns with the domain's scoring direction.
 *
 * @param responses - Map of item ID to response value (1-5)
 * @param domain - The PROMIS domain definition
 * @returns Raw score (sum of item values, 4-20 for 4-item forms)
 */
export function calculateRawScore(responses: Map<string, number>, domain: PROMISDomain): number {
  let sum = 0;
  for (const item of domain.items) {
    const value = responses.get(item.id);
    if (value === undefined) {
      throw new Error(`Missing response for item ${item.id}`);
    }
    if (value < 1 || value > 5) {
      throw new Error(`Response value for ${item.id} must be 1-5, got ${value}`);
    }
    // Reverse-coded items: flip so higher = more of the concept
    sum += item.reverseCoded ? 6 - value : value;
  }
  return sum;
}

/**
 * Convert a raw score to a PROMIS T-score using the domain's lookup table.
 *
 * @param rawScore - Sum of item responses (4-20 for 4-item forms)
 * @param domain - The PROMIS domain definition
 * @returns T-score (mean=50, SD=10 in general population)
 */
export function rawToTScore(rawScore: number, domain: PROMISDomain): number {
  const table = TSCORE_TABLES[domain.id];
  if (!table) {
    throw new Error(`No T-score table found for domain ${domain.id}`);
  }

  const tScore = table[rawScore];
  if (tScore === undefined) {
    // Clamp to valid range and use nearest
    const validKeys = Object.keys(table)
      .map(Number)
      .sort((a, b) => a - b);
    const minKey = validKeys[0] ?? 4;
    const maxKey = validKeys[validKeys.length - 1] ?? 20;
    const clamped = Math.max(minKey, Math.min(maxKey, Math.round(rawScore)));
    return table[clamped] ?? 50;
  }

  return tScore;
}

/**
 * Convert T-score to approximate percentile using standard normal distribution.
 */
export function tScoreToPercentile(tScore: number): number {
  const z = (tScore - 50) / 10;
  // Approximate CDF using Abramowitz and Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327; // 1/sqrt(2*pi)
  const p =
    d *
    Math.exp((-z * z) / 2) *
    (t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.3302744)))));

  return Math.round((z >= 0 ? 1 - p : p) * 100);
}

/**
 * Classify severity based on T-score and domain thresholds.
 */
function classifySeverity(
  tScore: number,
  domain: PROMISDomain,
): 'normal' | 'mild' | 'moderate' | 'severe' {
  const { clinicalThresholds, scoringDirection } = domain;

  if (scoringDirection === 'higher_is_worse') {
    // Higher T-score = worse (depression, anxiety, pain, fatigue, sleep disturbance)
    if (tScore >= clinicalThresholds.severe[0]) return 'severe';
    if (tScore >= clinicalThresholds.moderate[0]) return 'moderate';
    if (tScore >= clinicalThresholds.mild[0]) return 'mild';
    return 'normal';
  } else {
    // Higher T-score = better (physical function, social roles, cognition, companionship)
    if (tScore <= clinicalThresholds.severe[1]) return 'severe';
    if (tScore <= clinicalThresholds.moderate[1]) return 'moderate';
    if (tScore <= clinicalThresholds.mild[1]) return 'mild';
    return 'normal';
  }
}

/**
 * Interpret a T-score for a given domain — produces clinical meaning
 * and care implications.
 *
 * @param tScore - The calculated T-score
 * @param domain - The PROMIS domain definition
 * @returns Clinical interpretation with care implications
 */
export function interpretTScore(tScore: number, domain: PROMISDomain): PROMISTScoreInterpretation {
  const severity = classifySeverity(tScore, domain);

  const interpretations: Record<
    string,
    Record<string, { text: string; care: string; interventions: string[] }>
  > = {
    'physical-function': {
      normal: {
        text: 'Physical function within normal limits.',
        care: 'Monitor and maintain current activity levels.',
        interventions: ['activity encouragement', 'fall prevention education'],
      },
      mild: {
        text: 'Mild physical limitation — some difficulty with chores and mobility.',
        care: 'Light assistance with IADLs, encourage activity.',
        interventions: [
          'companion-assisted walks',
          'light housekeeping assistance',
          'exercise encouragement',
        ],
      },
      moderate: {
        text: 'Moderate physical limitation — significant difficulty with daily activities.',
        care: 'Regular ADL/IADL assistance needed.',
        interventions: [
          'ADL assistance',
          'mobility support',
          'PT referral',
          'home safety assessment',
        ],
      },
      severe: {
        text: 'Severe physical limitation — unable to perform most daily activities independently.',
        care: 'Intensive daily assistance required for safety and basic needs.',
        interventions: [
          'daily ADL support',
          'PT/OT referral',
          'durable medical equipment',
          'fall prevention program',
        ],
      },
    },
    'social-roles': {
      normal: {
        text: 'Adequate social participation.',
        care: 'Maintain social connections and activities.',
        interventions: ['community activity referrals', 'social engagement monitoring'],
      },
      mild: {
        text: 'Mild limitation in social participation.',
        care: 'Encourage social activities and outings.',
        interventions: ['companion outings', 'phone check-ins', 'community group referrals'],
      },
      moderate: {
        text: 'Moderate social isolation — unable to maintain usual social activities.',
        care: 'Structured companionship visits and social prescribing.',
        interventions: [
          'regular companion visits',
          'social prescribing',
          'transportation assistance',
          'activity planning',
        ],
      },
      severe: {
        text: 'Severe social isolation — almost no social participation.',
        care: 'Intensive companionship program and mental health screening.',
        interventions: [
          'daily companion visits',
          'depression screening',
          'social prescribing',
          'family engagement plan',
        ],
      },
    },
    depression: {
      normal: {
        text: 'No significant depressive symptoms.',
        care: 'Routine wellness monitoring.',
        interventions: ['wellness check-ins'],
      },
      mild: {
        text: 'Mild depressive symptoms present.',
        care: 'Increased emotional support during visits.',
        interventions: ['active listening', 'activity scheduling', 'behavioral activation'],
      },
      moderate: {
        text: 'Moderate depression — affecting daily function and quality of life.',
        care: 'Mental health referral recommended, increased visit frequency.',
        interventions: [
          'mental health referral',
          'increased companion visits',
          'behavioral activation',
          'support group referral',
        ],
      },
      severe: {
        text: 'Severe depression — significant functional impact, safety concerns possible.',
        care: 'Urgent mental health referral. Assess safety. Increase supervision.',
        interventions: [
          'urgent mental health referral',
          'safety assessment',
          'daily check-ins',
          'family notification',
          'crisis resources',
        ],
      },
    },
    anxiety: {
      normal: {
        text: 'No significant anxiety symptoms.',
        care: 'Routine wellness monitoring.',
        interventions: ['wellness check-ins'],
      },
      mild: {
        text: 'Mild anxiety symptoms.',
        care: 'Reassurance and calm companionship.',
        interventions: ['calming activities', 'routine establishment', 'relaxation techniques'],
      },
      moderate: {
        text: 'Moderate anxiety — worries interfering with daily activities.',
        care: 'Structured support, possible mental health referral.',
        interventions: [
          'mental health referral',
          'anxiety management education',
          'companion consistency',
          'relaxation training',
        ],
      },
      severe: {
        text: 'Severe anxiety — overwhelming worry, possible panic symptoms.',
        care: 'Mental health referral needed. Consistent caregiver assignment critical.',
        interventions: [
          'urgent mental health referral',
          'consistent caregiver assignment',
          'anxiety management plan',
          'family support coordination',
        ],
      },
    },
    'cognitive-function': {
      normal: {
        text: 'Cognitive function within normal limits.',
        care: 'Monitor cognitive status over time.',
        interventions: ['cognitive stimulation activities', 'memory monitoring'],
      },
      mild: {
        text: 'Mild cognitive concerns — occasional forgetfulness, slower processing.',
        care: 'Memory aids and medication reminders.',
        interventions: [
          'medication reminders',
          'memory aids',
          'cognitive stimulation',
          'routine structure',
        ],
      },
      moderate: {
        text: 'Moderate cognitive impairment — difficulty with complex tasks and planning.',
        care: 'Supervision for safety, medication management, structured daily routine.',
        interventions: [
          'medication management',
          'safety supervision',
          'structured activities',
          'cognitive assessment referral',
        ],
      },
      severe: {
        text: 'Severe cognitive impairment — significant safety and self-care concerns.',
        care: 'Continuous or near-continuous supervision required.',
        interventions: [
          'continuous supervision',
          'full medication management',
          'wandering prevention',
          'neurology referral',
          'family care conference',
        ],
      },
    },
    'pain-interference': {
      normal: {
        text: 'Pain not significantly interfering with activities.',
        care: 'Monitor pain levels.',
        interventions: ['pain monitoring', 'activity encouragement'],
      },
      mild: {
        text: 'Mild pain interference — some activities affected.',
        care: 'Activity modification and comfort measures.',
        interventions: ['activity modification', 'positioning assistance', 'gentle exercise'],
      },
      moderate: {
        text: 'Moderate pain interference — daily activities significantly affected.',
        care: 'Pain management support, activity adaptation.',
        interventions: [
          'pain management referral',
          'activity adaptation',
          'mobility assistance',
          'comfort interventions',
        ],
      },
      severe: {
        text: 'Severe pain interference — most activities limited by pain.',
        care: 'Comprehensive pain management, extensive ADL assistance.',
        interventions: [
          'pain specialist referral',
          'daily ADL assistance',
          'positioning support',
          'palliative care consideration',
        ],
      },
    },
    fatigue: {
      normal: {
        text: 'Energy levels within normal limits.',
        care: 'Maintain activity and sleep hygiene.',
        interventions: ['activity encouragement', 'sleep hygiene education'],
      },
      mild: {
        text: 'Mild fatigue — some reduction in energy for daily activities.',
        care: 'Energy conservation strategies.',
        interventions: ['energy conservation education', 'activity pacing', 'nutrition review'],
      },
      moderate: {
        text: 'Moderate fatigue — significant impact on ability to complete daily tasks.',
        care: 'Assistance with energy-demanding tasks, medical workup.',
        interventions: [
          'task prioritization',
          'rest scheduling',
          'medical evaluation referral',
          'nutrition assessment',
        ],
      },
      severe: {
        text: 'Severe fatigue — exhaustion limits most daily activities.',
        care: 'Comprehensive assistance needed, investigate underlying causes.',
        interventions: [
          'medical evaluation',
          'daily assistance',
          'sleep study referral',
          'medication review',
          'anemia screening',
        ],
      },
    },
    'sleep-disturbance': {
      normal: {
        text: 'Sleep quality within normal limits.',
        care: 'Maintain sleep hygiene.',
        interventions: ['sleep hygiene reinforcement'],
      },
      mild: {
        text: 'Mild sleep disturbance — occasional difficulty with sleep.',
        care: 'Sleep hygiene education and routine support.',
        interventions: ['sleep hygiene education', 'bedtime routine', 'environment optimization'],
      },
      moderate: {
        text: 'Moderate sleep disturbance — frequent sleep difficulty affecting daytime function.',
        care: 'Sleep intervention needed, assess for overnight needs.',
        interventions: [
          'sleep assessment',
          'evening companion visit',
          'environment modification',
          'medical evaluation',
        ],
      },
      severe: {
        text: 'Severe sleep disturbance — persistent poor sleep with significant daytime impairment.',
        care: 'Medical sleep evaluation, consider overnight care.',
        interventions: [
          'sleep specialist referral',
          'overnight companion assessment',
          'medication review',
          'safety assessment for nighttime falls',
        ],
      },
    },
    'applied-cognition': {
      normal: {
        text: 'Caregiver managing cognitive demands well.',
        care: 'Continue monitoring caregiver wellness.',
        interventions: ['caregiver check-ins'],
      },
      mild: {
        text: 'Caregiver experiencing mild difficulty managing care logistics.',
        care: 'Care coordination support and organizational tools.',
        interventions: ['care coordination', 'organizational tools', 'task simplification'],
      },
      moderate: {
        text: 'Caregiver struggling significantly with care management tasks.',
        care: 'Respite care needed. Professional care coordination recommended.',
        interventions: [
          'respite care',
          'professional care coordination',
          'caregiver support group',
          'task delegation',
        ],
      },
      severe: {
        text: 'Caregiver overwhelmed — unable to manage care responsibilities effectively.',
        care: 'Urgent respite. Reassess care plan. Caregiver burnout intervention.',
        interventions: [
          'immediate respite care',
          'care plan restructuring',
          'caregiver burnout assessment',
          'family meeting',
          'professional care manager',
        ],
      },
    },
    companionship: {
      normal: {
        text: 'Experiencing meaningful social connection and companionship.',
        care: 'Current companion care is effective — maintain.',
        interventions: ['continue current approach', 'expand activity variety'],
      },
      mild: {
        text: 'Some companionship needs not fully met.',
        care: 'Review activity plans and caregiver matching.',
        interventions: ['activity plan review', 'interest assessment', 'caregiver matching review'],
      },
      moderate: {
        text: 'Significant companionship deficit — limited meaningful engagement.',
        care: 'Reassess caregiver match, increase visit quality focus.',
        interventions: [
          'caregiver reassignment consideration',
          'meaningful activity planning',
          'interest inventory',
          'visit structure revision',
        ],
      },
      severe: {
        text: 'Severe companionship deficit — minimal meaningful interaction.',
        care: 'Urgent caregiver matching review. Consider different companion. Increase visit hours.',
        interventions: [
          'caregiver reassignment',
          'comprehensive interest assessment',
          'increased visit frequency',
          'family engagement',
          'community connection plan',
        ],
      },
    },
  };

  const domainInterp = interpretations[domain.id];
  if (!domainInterp) {
    return {
      severity,
      interpretation: `T-score ${tScore} classified as ${severity}.`,
      careImplication: 'Review with care team.',
      suggestedInterventions: [],
    };
  }

  const entry = domainInterp[severity];
  if (!entry) {
    return {
      severity,
      interpretation: `T-score ${tScore} classified as ${severity}.`,
      careImplication: 'Review with care team.',
      suggestedInterventions: [],
    };
  }
  return {
    severity,
    interpretation: entry.text,
    careImplication: entry.care,
    suggestedInterventions: entry.interventions,
  };
}

/**
 * Generate a complete PROMIS profile across all administered domains.
 *
 * @param responses - Map of item ID to response value (1-5), across any number of domains
 * @returns Full PROMIS profile with T-scores, severity, and care implications
 */
export function generatePROMISProfile(responses: Map<string, number>): PROMISProfile {
  const domainResults: PROMISProfile['domains'] = [];
  const allOmahaProblems = new Set<number>();
  const allCarePlanImplications: string[] = [];

  for (const domain of PROMIS_DOMAINS) {
    // Check if any items from this domain have responses
    const domainResponses = new Map<string, number>();
    for (const item of domain.items) {
      const value = responses.get(item.id);
      if (value !== undefined) {
        domainResponses.set(item.id, value);
      }
    }

    // Skip domains with no responses
    if (domainResponses.size === 0) continue;

    // Require all items in a domain to be answered
    if (domainResponses.size !== domain.items.length) {
      throw new Error(
        `Domain ${domain.name} has ${domainResponses.size} of ${domain.items.length} items answered. All items are required.`,
      );
    }

    const rawScore = calculateRawScore(domainResponses, domain);
    const tScore = rawToTScore(rawScore, domain);
    const interpretation = interpretTScore(tScore, domain);
    const percentile = tScoreToPercentile(tScore);

    domainResults.push({
      domain: domain.name,
      rawScore,
      tScore,
      severity: interpretation.severity,
      interpretation: interpretation.interpretation,
      percentile,
    });

    // Collect Omaha mappings for domains with clinical findings
    if (interpretation.severity !== 'normal') {
      domain.omahaMapping.forEach((code) => allOmahaProblems.add(code));
      allCarePlanImplications.push(interpretation.careImplication);
    }
  }

  // Calculate composite score (weighted average of domain deviations from normal)
  const compositeScore = calculateCompositeScore(domainResults);
  const lmnStrengthScore = calculateLMNStrength(domainResults);

  return {
    assessmentDate: new Date().toISOString().split('T')[0] ?? '',
    domains: domainResults,
    compositeScore,
    carePlanImplications: allCarePlanImplications,
    lmnStrengthScore,
    omahaProblems: Array.from(allOmahaProblems).sort((a, b) => a - b),
  };
}

/**
 * Calculate a weighted composite score (0-100) representing overall functional burden.
 * Higher = greater care need.
 */
function calculateCompositeScore(domainResults: PROMISProfile['domains']): number {
  if (domainResults.length === 0) return 0;

  const severityWeights: Record<string, number> = {
    normal: 0,
    mild: 25,
    moderate: 60,
    severe: 100,
  };

  const totalWeight = domainResults.reduce((sum, d) => sum + (severityWeights[d.severity] ?? 0), 0);

  return Math.round(totalWeight / domainResults.length);
}

/**
 * Calculate how strongly the PROMIS profile supports an LMN (0-100).
 * Considers number of impaired domains, severity, and which specific
 * domains are affected.
 */
function calculateLMNStrength(domainResults: PROMISProfile['domains']): number {
  if (domainResults.length === 0) return 0;

  const highValueDomains = [
    'Physical Function',
    'Cognitive Function',
    'Emotional Distress — Depression',
    'Pain Interference',
  ];

  let score = 0;
  let impaired = 0;

  for (const result of domainResults) {
    const severityPoints: Record<string, number> = {
      normal: 0,
      mild: 10,
      moderate: 25,
      severe: 40,
    };
    const points = severityPoints[result.severity] ?? 0;
    const isHighValue = highValueDomains.includes(result.domain);

    score += isHighValue ? points * 1.5 : points;
    if (result.severity !== 'normal') impaired++;
  }

  // Bonus for multi-domain impairment (comorbidity strengthens LMN)
  if (impaired >= 3) score *= 1.2;
  if (impaired >= 5) score *= 1.3;

  return Math.min(100, Math.round(score));
}

// ============================================================
// CONVERSATIONAL ADMINISTRATION (Sage Bridge)
// ============================================================

/** Conversational item mappings for all domains */
const CONVERSATIONAL_ITEMS: ConversationalItem[] = [
  // Physical Function
  {
    promisItemId: 'PROMIS-PF-4a-1',
    sagePrompt:
      'How is [name] managing with household tasks lately — things like vacuuming, yard work, or tidying up?',
    sageFollowUp: 'Can they do it on their own, or do they need some help?',
    responseMapping: {
      'no problem': 5,
      easily: 5,
      'a little hard': 4,
      'some trouble': 3,
      'very hard': 2,
      cannot: 1,
      unable: 1,
    },
  },
  {
    promisItemId: 'PROMIS-PF-4a-2',
    sagePrompt: 'What about stairs — can [name] go up and down without much trouble?',
    sageFollowUp: 'Do they hold onto the railing, go slowly, or avoid stairs altogether?',
    responseMapping: {
      fine: 5,
      'no problem': 5,
      'holds railing': 4,
      slow: 3,
      'very difficult': 2,
      avoids: 1,
      cannot: 1,
    },
  },
  {
    promisItemId: 'PROMIS-PF-4a-3',
    sagePrompt: 'Is [name] able to take a 15-minute walk, say around the neighborhood or a store?',
    sageFollowUp: 'Do they get tired quickly, or can they keep going at a comfortable pace?',
    responseMapping: {
      easily: 5,
      yes: 5,
      'a bit slow': 4,
      'gets tired': 3,
      'very short': 2,
      'cannot walk': 1,
      no: 1,
    },
  },
  {
    promisItemId: 'PROMIS-PF-4a-4',
    sagePrompt: 'How about running errands and shopping — can [name] handle that independently?',
    sageFollowUp: 'Do they need someone to drive them, help carry things, or go with them?',
    responseMapping: {
      independently: 5,
      mostly: 4,
      'needs some help': 3,
      'needs a lot of help': 2,
      cannot: 1,
    },
  },

  // Social Roles
  {
    promisItemId: 'PROMIS-SR-4a-1',
    sagePrompt:
      'Has [name] been able to keep up with hobbies or activities they enjoy with other people?',
    sageFollowUp: 'Are there things they used to do socially that they have had to give up?',
    responseMapping: { always: 1, usually: 2, sometimes: 3, rarely: 4, never: 5 },
  },
  {
    promisItemId: 'PROMIS-SR-4a-2',
    sagePrompt:
      'What about family gatherings or activities — is [name] able to participate the way they would like?',
    sageFollowUp: 'Do they miss out on family events, or have to leave early?',
    responseMapping: {
      'always participates': 1,
      usually: 2,
      'sometimes misses': 3,
      'often misses': 4,
      'never participates': 5,
    },
  },
  {
    promisItemId: 'PROMIS-SR-4a-3',
    sagePrompt:
      'Is [name] managing their usual tasks at home — cooking, cleaning, keeping things organized?',
    sageFollowUp: 'Have they had to cut back on what they do around the house?',
    responseMapping: {
      'managing fine': 1,
      mostly: 2,
      'some difficulty': 3,
      'a lot of difficulty': 4,
      unable: 5,
    },
  },
  {
    promisItemId: 'PROMIS-SR-4a-4',
    sagePrompt: 'Has [name] been able to spend time with friends the way they would like?',
    sageFollowUp: 'Do they turn down invitations or avoid going out?',
    responseMapping: { yes: 1, mostly: 2, sometimes: 3, rarely: 4, 'not at all': 5 },
  },

  // Depression
  {
    promisItemId: 'PROMIS-DEP-4a-1',
    sagePrompt:
      "Sometimes people in [name]'s situation feel like they don't matter as much. Has [name] mentioned feeling that way recently?",
    sageFollowUp: 'How often would you say that comes up — is it occasional or more frequent?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5, 'all the time': 5 },
  },
  {
    promisItemId: 'PROMIS-DEP-4a-2',
    sagePrompt: 'Has [name] expressed feeling helpless or like things are out of their control?',
    sageFollowUp: 'Is this something new, or has it been going on for a while?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5 },
  },
  {
    promisItemId: 'PROMIS-DEP-4a-3',
    sagePrompt:
      "How has [name]'s mood been this past week? Have they seemed down or low in spirits?",
    sageFollowUp: 'Would you say their mood has been mostly okay, or has it been hard for them?',
    responseMapping: {
      'good mood': 1,
      'mostly okay': 2,
      'some low days': 3,
      'often down': 4,
      'very depressed': 5,
    },
  },
  {
    promisItemId: 'PROMIS-DEP-4a-4',
    sagePrompt: "Has [name] talked about feeling hopeless, like things won't get better?",
    sageFollowUp: 'Do they seem to have given up on things improving?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5 },
  },

  // Anxiety
  {
    promisItemId: 'PROMIS-ANX-4a-1',
    sagePrompt:
      'Has [name] seemed fearful or scared about things lately — like falling, being alone, or their health?',
    sageFollowUp: 'Is it a general worry, or is there something specific they are afraid of?',
    responseMapping: { 'not at all': 1, rarely: 2, sometimes: 3, often: 4, constantly: 5 },
  },
  {
    promisItemId: 'PROMIS-ANX-4a-2',
    sagePrompt:
      'Does [name] seem to get stuck worrying, where it is hard for them to think about anything else?',
    sageFollowUp: 'How often does that happen in a typical week?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5 },
  },
  {
    promisItemId: 'PROMIS-ANX-4a-3',
    sagePrompt: 'Has [name] felt overwhelmed by worry this past week?',
    sageFollowUp: 'Would you say the worries are manageable, or do they take over?',
    responseMapping: { 'not at all': 1, 'a little': 2, sometimes: 3, often: 4, completely: 5 },
  },
  {
    promisItemId: 'PROMIS-ANX-4a-4',
    sagePrompt: "Has [name] seemed uneasy or on edge? Like they can't quite relax?",
    sageFollowUp: 'Is this most of the time, or just in certain situations?',
    responseMapping: {
      'not at all': 1,
      occasionally: 2,
      sometimes: 3,
      often: 4,
      'all the time': 5,
    },
  },

  // Cognitive Function
  {
    promisItemId: 'PROMIS-COG-4a-1',
    sagePrompt:
      "Has [name]'s thinking seemed slower lately — like it takes longer to process things?",
    sageFollowUp: 'Is this noticeable to them, or more something you have observed?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5 },
  },
  {
    promisItemId: 'PROMIS-COG-4a-2',
    sagePrompt:
      'Does [name] have trouble keeping track of what they are doing, especially if they get interrupted?',
    sageFollowUp: 'For example, do they forget what they were doing if the phone rings?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5 },
  },
  {
    promisItemId: 'PROMIS-COG-4a-3',
    sagePrompt:
      'How about concentrating — can [name] focus on things like reading, TV shows, or conversations?',
    sageFollowUp: 'Do they lose the thread of conversations or forget what they were watching?',
    responseMapping: {
      'no trouble': 1,
      'a little': 2,
      'some difficulty': 3,
      'a lot of difficulty': 4,
      'cannot concentrate': 5,
    },
  },
  {
    promisItemId: 'PROMIS-COG-4a-4',
    sagePrompt:
      "How is [name]'s memory doing? Can they remember recent events and keep track of appointments?",
    sageFollowUp: 'Do they need reminders, or can they manage on their own?',
    responseMapping: { excellent: 5, good: 4, fair: 3, poor: 2, 'very poor': 1 },
  },

  // Pain Interference
  {
    promisItemId: 'PROMIS-PI-4a-1',
    sagePrompt: "Has pain been getting in the way of [name]'s daily routine this past week?",
    sageFollowUp: 'Does it stop them from doing things, or do they push through?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },
  {
    promisItemId: 'PROMIS-PI-4a-2',
    sagePrompt: 'Is pain making it hard for [name] to do things around the house?',
    sageFollowUp: 'Which activities are hardest for them because of pain?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },
  {
    promisItemId: 'PROMIS-PI-4a-3',
    sagePrompt: 'Has pain kept [name] from enjoying social activities or time with others?',
    sageFollowUp: 'Do they cancel plans or avoid going out because of pain?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },
  {
    promisItemId: 'PROMIS-PI-4a-4',
    sagePrompt: "Has pain interfered with [name]'s ability to do household chores this week?",
    sageFollowUp: 'Have they had to leave tasks unfinished because of pain?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },

  // Fatigue
  {
    promisItemId: 'PROMIS-FAT-4a-1',
    sagePrompt: "How are [name]'s energy levels? Do they seem more tired than usual?",
    sageFollowUp: 'Is the fatigue there all day, or does it come and go?',
    responseMapping: {
      'not tired': 1,
      'a little': 2,
      moderately: 3,
      'quite tired': 4,
      exhausted: 5,
    },
  },
  {
    promisItemId: 'PROMIS-FAT-4a-2',
    sagePrompt: 'Does [name] have trouble getting started on things because of tiredness?',
    sageFollowUp: "Are there things they want to do but just don't have the energy for?",
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5 },
  },
  {
    promisItemId: 'PROMIS-FAT-4a-3',
    sagePrompt: 'On average this past week, how run-down has [name] been feeling?',
    sageFollowUp: 'Would they say they felt pretty good, or more worn out?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },
  {
    promisItemId: 'PROMIS-FAT-4a-4',
    sagePrompt: 'Overall, how fatigued would you say [name] has been this past week?',
    sageFollowUp:
      'On a scale from not fatigued at all to completely exhausted, where would you put it?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },

  // Sleep Disturbance
  {
    promisItemId: 'PROMIS-SD-4a-1',
    sagePrompt:
      "How has [name]'s sleep been this past week? Would they say it has been good or not so good?",
    sageFollowUp: 'On their best nights, how would they rate their sleep?',
    responseMapping: { 'very good': 5, good: 4, fair: 3, poor: 2, 'very poor': 1 },
  },
  {
    promisItemId: 'PROMIS-SD-4a-2',
    sagePrompt: 'When [name] wakes up, do they feel rested, or still tired?',
    sageFollowUp: 'Does it feel like the sleep actually helped, or not?',
    responseMapping: {
      'very refreshed': 5,
      refreshed: 4,
      somewhat: 3,
      'not really': 2,
      'not at all': 1,
    },
  },
  {
    promisItemId: 'PROMIS-SD-4a-3',
    sagePrompt:
      'Has [name] been having problems with sleep — waking up at night, restless, that kind of thing?',
    sageFollowUp: 'How many nights this week would you say sleep was a problem?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },
  {
    promisItemId: 'PROMIS-SD-4a-4',
    sagePrompt: 'Does [name] have trouble falling asleep at night?',
    sageFollowUp: 'How long does it usually take them to fall asleep?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },

  // Applied Cognition (Caregiver)
  {
    promisItemId: 'PROMIS-ACOG-4a-1',
    sagePrompt:
      'As the caregiver, are you able to keep track of everything even when you get interrupted — appointments, medications, meals?',
    sageFollowUp: 'Do you find yourself losing track of things more than you used to?',
    responseMapping: { easily: 5, usually: 4, sometimes: 3, rarely: 2, 'not at all': 1 },
  },
  {
    promisItemId: 'PROMIS-ACOG-4a-2',
    sagePrompt: 'How are you doing with planning and organizing the daily caregiving tasks?',
    sageFollowUp: 'Does it feel manageable, or overwhelming?',
    responseMapping: {
      easily: 5,
      'pretty well': 4,
      'some difficulty': 3,
      'a lot of difficulty': 2,
      overwhelmed: 1,
    },
  },
  {
    promisItemId: 'PROMIS-ACOG-4a-3',
    sagePrompt:
      'Can you juggle multiple responsibilities at once — like coordinating care while managing your own life?',
    sageFollowUp: 'Do you feel like you are dropping balls, or keeping them all in the air?',
    responseMapping: { easily: 5, mostly: 4, sometimes: 3, struggling: 2, cannot: 1 },
  },
  {
    promisItemId: 'PROMIS-ACOG-4a-4',
    sagePrompt:
      'Are you remembering to do everything you planned — follow-up calls, refills, appointments?',
    sageFollowUp: 'Do you use lists or reminders, or can you keep it in your head?',
    responseMapping: {
      always: 5,
      usually: 4,
      'sometimes forget': 3,
      'often forget': 2,
      'rarely remember': 1,
    },
  },

  // Companionship (co-op.care proprietary)
  {
    promisItemId: 'COOP-COMP-4a-1',
    sagePrompt: 'Has [name] had enjoyable conversations with their companion caregiver this week?',
    sageFollowUp: 'Do they seem to look forward to chatting, or is it more just passing time?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5, 'every visit': 5 },
  },
  {
    promisItemId: 'COOP-COMP-4a-2',
    sagePrompt:
      'Has [name] been doing things that feel meaningful — not just sitting, but activities that matter to them?',
    sageFollowUp: 'What kinds of activities have they been enjoying?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, often: 4, always: 5 },
  },
  {
    promisItemId: 'COOP-COMP-4a-3',
    sagePrompt: 'Does [name] feel genuinely cared about by the people who help them?',
    sageFollowUp: 'Is it more of a professional relationship, or does it feel personal and warm?',
    responseMapping: {
      'not at all': 1,
      'a little': 2,
      somewhat: 3,
      'quite a bit': 4,
      'very much': 5,
    },
  },
  {
    promisItemId: 'COOP-COMP-4a-4',
    sagePrompt: 'Does [name] look forward to visits from their companion caregiver?',
    sageFollowUp: 'Do they get excited about visits, or are they indifferent?',
    responseMapping: { never: 1, rarely: 2, sometimes: 3, usually: 4, always: 5, 'very much': 5 },
  },
];

/**
 * Get conversational item wrappers for a specific domain.
 *
 * @param domainId - The PROMIS domain ID
 * @returns Array of conversational items for Sage to administer
 */
export function getConversationalItems(domainId: string): ConversationalItem[] {
  const domain = getPROMISDomain(domainId);
  if (!domain) return [];

  const itemIds = new Set(domain.items.map((i) => i.id));
  return CONVERSATIONAL_ITEMS.filter((ci) => itemIds.has(ci.promisItemId));
}

/**
 * Map a natural-language conversational response to a PROMIS numeric value.
 * Uses fuzzy keyword matching against the item's response mapping.
 *
 * @param response - The natural-language response from conversation
 * @param item - The conversational item definition
 * @returns Numeric PROMIS value (1-5), or 3 (midpoint) if no match found
 */
export function mapConversationalResponse(response: string, item: ConversationalItem): number {
  const normalized = response.toLowerCase().trim();

  // Try exact match first
  if (item.responseMapping[normalized] !== undefined) {
    return item.responseMapping[normalized];
  }

  // Try substring match — find the longest matching key
  let bestMatch = '';
  let bestValue = 3; // default to midpoint

  for (const [key, value] of Object.entries(item.responseMapping)) {
    if (normalized.includes(key) && key.length > bestMatch.length) {
      bestMatch = key;
      bestValue = value;
    }
  }

  return bestValue;
}

// ============================================================
// PROMIS-TO-LMN BRIDGE
// ============================================================

/** ICD-10 codes associated with PROMIS domain findings */
const DOMAIN_ICD10_MAP: Record<string, Record<string, string[]>> = {
  'physical-function': {
    mild: ['Z74.09'],
    moderate: ['R26.89', 'Z74.1'],
    severe: ['R26.89', 'Z74.1', 'M62.81'],
  },
  'social-roles': {
    mild: ['Z60.2'],
    moderate: ['Z60.2', 'Z60.4'],
    severe: ['Z60.2', 'Z60.4'],
  },
  depression: {
    mild: ['F32.0'],
    moderate: ['F32.1'],
    severe: ['F32.2'],
  },
  anxiety: {
    mild: ['F41.1'],
    moderate: ['F41.1'],
    severe: ['F41.1', 'F41.0'],
  },
  'cognitive-function': {
    mild: ['R41.840'],
    moderate: ['R41.840', 'F03.90'],
    severe: ['F03.90', 'G30.9'],
  },
  'pain-interference': {
    mild: ['G89.29'],
    moderate: ['G89.29', 'M54.5'],
    severe: ['G89.29', 'G89.4'],
  },
  fatigue: {
    mild: ['R53.1'],
    moderate: ['R53.1', 'R53.83'],
    severe: ['R53.83'],
  },
  'sleep-disturbance': {
    mild: ['G47.00'],
    moderate: ['G47.00', 'G47.09'],
    severe: ['G47.00', 'G47.09'],
  },
  'applied-cognition': {
    mild: ['Z73.0'],
    moderate: ['Z73.0', 'Z63.6'],
    severe: ['Z73.0', 'Z63.6'],
  },
  companionship: {
    mild: ['Z60.2'],
    moderate: ['Z60.2'],
    severe: ['Z60.2', 'Z60.4'],
  },
};

/**
 * Generate medical necessity justification language from PROMIS scores.
 * Output is suitable for inclusion in a Letter of Medical Necessity (LMN).
 *
 * @param profile - A completed PROMIS profile
 * @returns Structured LMN justification content
 */
export function generatePROMISJustification(profile: PROMISProfile): PROMISJustification {
  const icd10Set = new Set<string>();
  const limitations: string[] = [];
  const impairedDomains: Array<{ domain: string; severity: string; tScore: number }> = [];

  for (const result of profile.domains) {
    if (result.severity === 'normal') continue;

    impairedDomains.push({
      domain: result.domain,
      severity: result.severity,
      tScore: result.tScore,
    });

    // Find matching domain ID
    const domainDef = PROMIS_DOMAINS.find((d) => d.name === result.domain);
    if (domainDef) {
      const codes = DOMAIN_ICD10_MAP[domainDef.id]?.[result.severity];
      codes?.forEach((c) => icd10Set.add(c));
    }

    limitations.push(
      `${result.domain}: T-score ${result.tScore} (${result.severity}) — ${result.interpretation}`,
    );
  }

  // Build summary paragraph
  const summaryParts: string[] = [];
  summaryParts.push(
    `Standardized PROMIS assessment (NIH-validated) administered on ${profile.assessmentDate} ` +
      `across ${profile.domains.length} domains.`,
  );

  if (impairedDomains.length > 0) {
    const domainList = impairedDomains
      .map((d) => `${d.domain} (${d.severity}, T=${d.tScore})`)
      .join('; ');
    summaryParts.push(
      `Clinically significant findings in ${impairedDomains.length} domain(s): ${domainList}.`,
    );
    summaryParts.push(
      `Composite functional burden score: ${profile.compositeScore}/100. ` +
        `These findings support the medical necessity for home companion care services ` +
        `to maintain safety, functional independence, and quality of life.`,
    );
  } else {
    summaryParts.push('All domains within normal limits. Continued monitoring recommended.');
  }

  // HSA eligibility strength
  let hsaStrength: 'strong' | 'moderate' | 'weak' = 'weak';
  if (profile.lmnStrengthScore >= 60) hsaStrength = 'strong';
  else if (profile.lmnStrengthScore >= 30) hsaStrength = 'moderate';

  // Care level justification
  let careLevelJustification: string;
  if (profile.compositeScore >= 70) {
    careLevelJustification =
      'Intensive daily companion care (30-40 hrs/wk) indicated due to severe multi-domain functional impairment.';
  } else if (profile.compositeScore >= 50) {
    careLevelJustification =
      'Regular companion care (15-25 hrs/wk) indicated to address moderate functional limitations across multiple domains.';
  } else if (profile.compositeScore >= 25) {
    careLevelJustification =
      'Structured companion care (5-15 hrs/wk) indicated to support areas of mild-to-moderate limitation and prevent functional decline.';
  } else {
    careLevelJustification =
      'Wellness monitoring (2-5 hrs/wk) with periodic reassessment recommended.';
  }

  return {
    summary: summaryParts.join(' '),
    icd10Codes: Array.from(icd10Set).sort(),
    functionalLimitations: limitations,
    careLevelJustification,
    hsaEligibilityStrength: hsaStrength,
  };
}

/**
 * Analyze PROMIS profiles over time to generate a longitudinal trajectory report.
 * Used for care plan renewal justification — demonstrates ongoing need or improvement.
 *
 * A change of >= 5 T-score points is considered clinically meaningful (0.5 SD)
 * per PROMIS guidelines.
 *
 * @param profiles - Array of PROMIS profiles ordered chronologically (oldest first)
 * @returns Longitudinal report with trajectory and renewal justification
 */
export function generateLongitudinalReport(profiles: PROMISProfile[]): LongitudinalReport {
  if (profiles.length < 2) {
    return {
      trajectory: 'stable',
      significantChanges: [],
      renewalJustification:
        'Insufficient data for longitudinal analysis — baseline assessment only. Continued care recommended pending follow-up assessment.',
    };
  }

  const first = profiles[0]!;
  const last = profiles[profiles.length - 1]!;
  const CLINICALLY_MEANINGFUL_CHANGE = 5; // 0.5 SD in T-score units

  const significantChanges: LongitudinalReport['significantChanges'] = [];
  let improvingCount = 0;
  let decliningCount = 0;

  for (const lastDomain of last.domains) {
    const firstDomain = first.domains.find((d) => d.domain === lastDomain.domain);
    if (!firstDomain) continue;

    const change = lastDomain.tScore - firstDomain.tScore;
    const domainDef = PROMIS_DOMAINS.find((d) => d.name === lastDomain.domain);
    const isClinical = Math.abs(change) >= CLINICALLY_MEANINGFUL_CHANGE;

    // Determine if change is improvement or decline based on scoring direction
    if (isClinical && domainDef) {
      if (domainDef.scoringDirection === 'higher_is_better') {
        if (change > 0) improvingCount++;
        else decliningCount++;
      } else {
        if (change < 0) improvingCount++;
        else decliningCount++;
      }
    }

    significantChanges.push({
      domain: lastDomain.domain,
      change: Math.round(change * 10) / 10,
      clinical: isClinical,
    });
  }

  // Determine overall trajectory
  let trajectory: LongitudinalReport['trajectory'];
  if (improvingCount > decliningCount && improvingCount >= 2) {
    trajectory = 'improving';
  } else if (decliningCount > improvingCount && decliningCount >= 2) {
    trajectory = 'declining';
  } else {
    trajectory = 'stable';
  }

  // Generate renewal justification
  const clinicalChanges = significantChanges.filter((c) => c.clinical);
  let renewalJustification: string;

  if (trajectory === 'declining') {
    renewalJustification =
      `Longitudinal PROMIS assessment over ${profiles.length} time points shows functional decline ` +
      `in ${decliningCount} domain(s). Clinically meaningful deterioration (>=5 T-score points) ` +
      `observed in: ${clinicalChanges
        .filter((c) => c.change !== 0)
        .map((c) => c.domain)
        .join(', ')}. ` +
      `Continued and potentially increased companion care services are medically necessary to ` +
      `slow decline and maintain safety.`;
  } else if (trajectory === 'improving') {
    renewalJustification =
      `Longitudinal PROMIS assessment shows improvement in ${improvingCount} domain(s), ` +
      `supporting the effectiveness of current companion care. Continued services recommended ` +
      `to maintain gains and prevent regression.`;
  } else {
    renewalJustification =
      `PROMIS scores remain stable across ${profiles.length} assessments. Stability in the context ` +
      `of progressive conditions indicates effective care maintenance. Continued companion care ` +
      `recommended to preserve current functional status.`;
  }

  return {
    trajectory,
    significantChanges,
    renewalJustification,
  };
}
