/**
 * Omaha System Clinical Taxonomy
 * 42 Problems across 4 Domains
 * Public domain since 1975 — no licensing required
 * 
 * Reference: https://www.omahasystem.org/
 * Integrated with: NLM Metathesaurus, CINAHL, LOINC, SNOMED CT, HL7
 */

export type OmahaDomain = 'Environmental' | 'Psychosocial' | 'Physiological' | 'Health-Related Behaviors';

export type InterventionCategory = 
  | 'Teaching/Guidance/Counseling'
  | 'Treatments/Procedures'
  | 'Case Management'
  | 'Surveillance';

export interface OmahaProblem {
  code: number;
  name: string;
  domain: OmahaDomain;
  description: string;
  commonICD10: string[];
  lmnEligible: boolean;
  lmnServices?: string[];
}

export interface TimeBankOmahaMapping {
  taskType: string;
  omahaProblemCode: number;
  omahaProblemName: string;
  interventionCategory: InterventionCategory;
}

// ============================================================
// DOMAIN 1: ENVIRONMENTAL (Problems 01-04)
// ============================================================

// ============================================================
// DOMAIN 2: PSYCHOSOCIAL (Problems 05-16)
// ============================================================

// ============================================================
// DOMAIN 3: PHYSIOLOGICAL (Problems 17-34)
// ============================================================

// ============================================================
// DOMAIN 4: HEALTH-RELATED BEHAVIORS (Problems 35-42)
// ============================================================

export const OMAHA_PROBLEMS: readonly OmahaProblem[] = [
  // === ENVIRONMENTAL DOMAIN ===
  { code: 1, name: 'Income', domain: 'Environmental', description: 'Financial strain assessment', commonICD10: ['Z59.7', 'Z59.86'], lmnEligible: false },
  { code: 2, name: 'Sanitation', domain: 'Environmental', description: 'Home safety and cleanliness', commonICD10: ['Z59.1', 'Z59.89'], lmnEligible: false },
  { code: 3, name: 'Residence', domain: 'Environmental', description: 'Housing stability and safety', commonICD10: ['Z59.0', 'Z59.19'], lmnEligible: false },
  { code: 4, name: 'Neighborhood/Workplace Safety', domain: 'Environmental', description: 'Environmental risk factors', commonICD10: ['Z77.098', 'Z59.3'], lmnEligible: false },

  // === PSYCHOSOCIAL DOMAIN ===
  { code: 5, name: 'Communication with Community Resources', domain: 'Psychosocial', description: 'The Conductor core function — care coordination', commonICD10: ['Z75.4', 'Z75.3'], lmnEligible: true, lmnServices: ['care coordination'] },
  { code: 6, name: 'Social Contact', domain: 'Psychosocial', description: 'Social isolation impact', commonICD10: ['Z60.2', 'Z60.4'], lmnEligible: true, lmnServices: ['social prescribing', 'companionship programs'] },
  { code: 7, name: 'Role Change', domain: 'Psychosocial', description: 'The Conductor identity transformation', commonICD10: ['Z63.6', 'Z73.1'], lmnEligible: true, lmnServices: ['Conductor Certification', 'caregiver support'] },
  { code: 8, name: 'Interpersonal Relationship', domain: 'Psychosocial', description: 'Family dynamics and conflict', commonICD10: ['Z63.0', 'Z63.1'], lmnEligible: true, lmnServices: ['family counseling'] },
  { code: 9, name: 'Spirituality', domain: 'Psychosocial', description: 'Faith and meaning', commonICD10: ['Z65.8'], lmnEligible: false },
  { code: 10, name: 'Grief', domain: 'Psychosocial', description: 'Anticipatory and acute grief', commonICD10: ['Z63.4', 'F43.21'], lmnEligible: true, lmnServices: ['grief counseling'] },
  { code: 11, name: 'Mental Health', domain: 'Psychosocial', description: 'Caregiver depression and anxiety', commonICD10: ['F32.9', 'F41.1', 'Z73.0'], lmnEligible: true, lmnServices: ['therapy', 'CBT', 'support groups'] },
  { code: 12, name: 'Sexuality', domain: 'Psychosocial', description: 'Intimacy disruption', commonICD10: ['Z70.9'], lmnEligible: false },
  { code: 13, name: 'Caretaking/Parenting', domain: 'Psychosocial', description: 'The Conductor burden itself', commonICD10: ['Z63.6', 'Z73.1'], lmnEligible: true, lmnServices: ['respite care'] },
  { code: 14, name: 'Neglect', domain: 'Psychosocial', description: 'Self-neglect screening', commonICD10: ['T74.01XA'], lmnEligible: false },
  { code: 15, name: 'Abuse', domain: 'Psychosocial', description: 'Elder abuse screening', commonICD10: ['T74.11XA'], lmnEligible: false },
  { code: 16, name: 'Growth and Development', domain: 'Psychosocial', description: 'Cognitive decline trajectory', commonICD10: ['F03.90', 'G30.9'], lmnEligible: true, lmnServices: ['cognitive stimulation'] },

  // === PHYSIOLOGICAL DOMAIN ===
  { code: 17, name: 'Hearing', domain: 'Physiological', description: 'Isolation factor from hearing loss', commonICD10: ['H91.90'], lmnEligible: true, lmnServices: ['audiology'] },
  { code: 18, name: 'Vision', domain: 'Physiological', description: 'Fall risk factor', commonICD10: ['H54.7'], lmnEligible: true, lmnServices: ['optometry'] },
  { code: 19, name: 'Speech and Language', domain: 'Physiological', description: 'Post-stroke or dementia communication', commonICD10: ['R47.01'], lmnEligible: true, lmnServices: ['speech therapy'] },
  { code: 20, name: 'Oral Health', domain: 'Physiological', description: 'Malnutrition risk from dental issues', commonICD10: ['K08.109'], lmnEligible: false },
  { code: 21, name: 'Cognition', domain: 'Physiological', description: 'Core dementia domain', commonICD10: ['F03.90', 'G30.9'], lmnEligible: true, lmnServices: ['cognitive stimulation', 'memory programs'] },
  { code: 22, name: 'Pain', domain: 'Physiological', description: 'Chronic pain management', commonICD10: ['G89.29', 'M54.5'], lmnEligible: true, lmnServices: ['PT', 'aquatic therapy', 'yoga'] },
  { code: 23, name: 'Consciousness', domain: 'Physiological', description: 'Altered consciousness detection', commonICD10: ['R40.20'], lmnEligible: false },
  { code: 24, name: 'Skin', domain: 'Physiological', description: 'Wound care needs', commonICD10: ['L89.90'], lmnEligible: true, lmnServices: ['wound care'] },
  { code: 25, name: 'Neuro-Musculo-Skeletal Function', domain: 'Physiological', description: 'Mobility and fall risk', commonICD10: ['M62.81', 'R26.2', 'W19.XXXA', 'Z87.39'], lmnEligible: true, lmnServices: ['PT', 'OT', 'tai chi', 'fall prevention'] },
  { code: 26, name: 'Respiration', domain: 'Physiological', description: 'COPD, CHF respiratory impact', commonICD10: ['J44.1', 'J96.10'], lmnEligible: true, lmnServices: ['pulmonary rehab'] },
  { code: 27, name: 'Circulation', domain: 'Physiological', description: 'CHF, hypertension management', commonICD10: ['I50.9', 'I10'], lmnEligible: true, lmnServices: ['cardiac rehab', 'exercise programs'] },
  { code: 28, name: 'Digestion-Hydration', domain: 'Physiological', description: 'Nutrition and hydration', commonICD10: ['E86.0', 'R63.0'], lmnEligible: true, lmnServices: ['nutrition counseling'] },
  { code: 29, name: 'Bowel Function', domain: 'Physiological', description: 'Incontinence management', commonICD10: ['R15.9'], lmnEligible: false },
  { code: 30, name: 'Urinary Function', domain: 'Physiological', description: 'UTI risk (confusion trigger)', commonICD10: ['N39.0'], lmnEligible: true, lmnServices: ['urology'] },
  { code: 31, name: 'Reproductive Function', domain: 'Physiological', description: 'Reproductive health', commonICD10: [], lmnEligible: false },
  { code: 32, name: 'Pregnancy', domain: 'Physiological', description: 'Not primary for home care', commonICD10: [], lmnEligible: false },
  { code: 33, name: 'Postpartum', domain: 'Physiological', description: 'Not primary for home care', commonICD10: [], lmnEligible: false },
  { code: 34, name: 'Communicable/Infectious Condition', domain: 'Physiological', description: 'COVID, flu, pneumonia', commonICD10: ['J18.9'], lmnEligible: false },

  // === HEALTH-RELATED BEHAVIORS DOMAIN ===
  { code: 35, name: 'Nutrition', domain: 'Health-Related Behaviors', description: 'Wellness ecosystem core — dietary management', commonICD10: ['E11.9', 'E78.5'], lmnEligible: true, lmnServices: ['nutrition counseling', 'dietary programs'] },
  { code: 36, name: 'Sleep and Rest Patterns', domain: 'Health-Related Behaviors', description: 'Sleep disruption (CII dimension)', commonICD10: ['G47.00'], lmnEligible: true, lmnServices: ['sleep hygiene programs'] },
  { code: 37, name: 'Physical Activity', domain: 'Health-Related Behaviors', description: 'Wellness ecosystem core — exercise', commonICD10: ['Z72.3'], lmnEligible: true, lmnServices: ['fitness programs', 'aquatic therapy', 'tai chi', 'yoga'] },
  { code: 38, name: 'Personal Care', domain: 'Health-Related Behaviors', description: 'Activities of daily living', commonICD10: ['R26.89', 'Z74.1'], lmnEligible: true, lmnServices: ['personal care services'] },
  { code: 39, name: 'Substance Use', domain: 'Health-Related Behaviors', description: 'Alcohol/drug screening', commonICD10: ['F10.20'], lmnEligible: true, lmnServices: ['substance use programs'] },
  { code: 40, name: 'Family Planning', domain: 'Health-Related Behaviors', description: 'Not primary for home care', commonICD10: [], lmnEligible: false },
  { code: 41, name: 'Health Care Supervision', domain: 'Health-Related Behaviors', description: 'Medication management oversight', commonICD10: ['Z79.899'], lmnEligible: true, lmnServices: ['pharmacy consultation'] },
  { code: 42, name: 'Prescribed Medication Regimen', domain: 'Health-Related Behaviors', description: 'Medication adherence', commonICD10: ['Z91.19'], lmnEligible: true, lmnServices: ['adherence programs'] },
] as const;

// ============================================================
// TIME BANK → OMAHA AUTO-CODING MAP
// ============================================================

export const TIME_BANK_OMAHA_MAP: readonly TimeBankOmahaMapping[] = [
  { taskType: 'meals', omahaProblemCode: 28, omahaProblemName: 'Digestion-Hydration', interventionCategory: 'Treatments/Procedures' },
  { taskType: 'rides', omahaProblemCode: 5, omahaProblemName: 'Communication with Community Resources', interventionCategory: 'Case Management' },
  { taskType: 'companionship', omahaProblemCode: 6, omahaProblemName: 'Social Contact', interventionCategory: 'Surveillance' },
  { taskType: 'phone_companionship', omahaProblemCode: 6, omahaProblemName: 'Social Contact', interventionCategory: 'Surveillance' },
  { taskType: 'tech_support', omahaProblemCode: 5, omahaProblemName: 'Communication with Community Resources', interventionCategory: 'Teaching/Guidance/Counseling' },
  { taskType: 'yard_work', omahaProblemCode: 3, omahaProblemName: 'Residence', interventionCategory: 'Treatments/Procedures' },
  { taskType: 'housekeeping', omahaProblemCode: 2, omahaProblemName: 'Sanitation', interventionCategory: 'Treatments/Procedures' },
  { taskType: 'grocery_run', omahaProblemCode: 28, omahaProblemName: 'Digestion-Hydration', interventionCategory: 'Case Management' },
  { taskType: 'errands', omahaProblemCode: 5, omahaProblemName: 'Communication with Community Resources', interventionCategory: 'Case Management' },
  { taskType: 'pet_care', omahaProblemCode: 6, omahaProblemName: 'Social Contact', interventionCategory: 'Surveillance' },
  { taskType: 'admin_help', omahaProblemCode: 5, omahaProblemName: 'Communication with Community Resources', interventionCategory: 'Case Management' },
] as const;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getOmahaProblem(code: number): OmahaProblem | undefined {
  return OMAHA_PROBLEMS.find(p => p.code === code);
}

export function getOmahaProblemsForDomain(domain: OmahaDomain): OmahaProblem[] {
  return OMAHA_PROBLEMS.filter(p => p.domain === domain);
}

export function getLMNEligibleProblems(): OmahaProblem[] {
  return OMAHA_PROBLEMS.filter(p => p.lmnEligible);
}

export function getOmahaCodeForTask(taskType: string): TimeBankOmahaMapping | undefined {
  return TIME_BANK_OMAHA_MAP.find(m => m.taskType === taskType);
}

export function getOmahaProblemsForICD10(icd10Code: string): OmahaProblem[] {
  return OMAHA_PROBLEMS.filter(p => p.commonICD10.includes(icd10Code));
}
