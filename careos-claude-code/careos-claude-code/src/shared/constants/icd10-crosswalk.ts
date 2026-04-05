/**
 * Default ICD-10 ↔ Omaha System Crosswalk Mappings
 * Stored in Aidbox as FHIR ConceptMap resources
 * This file provides the default mappings used at system init
 */

export interface ICD10OmahaMapping {
  icd10Code: string;
  icd10Display: string;
  omahaProblemCode: number;
  omahaProblemName: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Default mappings — most common ICD-10 codes encountered in
 * home care discharge referrals, mapped to Omaha System problems.
 * These seed the Aidbox ConceptMap. Clinicians can add/override.
 */
export const DEFAULT_ICD10_OMAHA_MAPPINGS: readonly ICD10OmahaMapping[] = [
  // Cardiovascular
  {
    icd10Code: 'I50.9',
    icd10Display: 'Heart failure, unspecified',
    omahaProblemCode: 27,
    omahaProblemName: 'Circulation',
    confidence: 'high',
  },
  {
    icd10Code: 'I10',
    icd10Display: 'Essential hypertension',
    omahaProblemCode: 27,
    omahaProblemName: 'Circulation',
    confidence: 'high',
  },
  {
    icd10Code: 'I25.10',
    icd10Display: 'Atherosclerotic heart disease',
    omahaProblemCode: 27,
    omahaProblemName: 'Circulation',
    confidence: 'high',
  },

  // Respiratory
  {
    icd10Code: 'J44.1',
    icd10Display: 'COPD with acute exacerbation',
    omahaProblemCode: 26,
    omahaProblemName: 'Respiration',
    confidence: 'high',
  },
  {
    icd10Code: 'J96.10',
    icd10Display: 'Chronic respiratory failure',
    omahaProblemCode: 26,
    omahaProblemName: 'Respiration',
    confidence: 'high',
  },
  {
    icd10Code: 'J18.9',
    icd10Display: 'Pneumonia, unspecified',
    omahaProblemCode: 34,
    omahaProblemName: 'Communicable/Infectious Condition',
    confidence: 'high',
  },

  // Cognitive/Neurological
  {
    icd10Code: 'F03.90',
    icd10Display: 'Unspecified dementia',
    omahaProblemCode: 21,
    omahaProblemName: 'Cognition',
    confidence: 'high',
  },
  {
    icd10Code: 'G30.9',
    icd10Display: "Alzheimer's disease, unspecified",
    omahaProblemCode: 21,
    omahaProblemName: 'Cognition',
    confidence: 'high',
  },

  // Mental Health
  {
    icd10Code: 'F32.9',
    icd10Display: 'Major depressive disorder',
    omahaProblemCode: 11,
    omahaProblemName: 'Mental Health',
    confidence: 'high',
  },
  {
    icd10Code: 'F41.1',
    icd10Display: 'Generalized anxiety disorder',
    omahaProblemCode: 11,
    omahaProblemName: 'Mental Health',
    confidence: 'high',
  },
  {
    icd10Code: 'Z73.0',
    icd10Display: 'Burnout',
    omahaProblemCode: 11,
    omahaProblemName: 'Mental Health',
    confidence: 'medium',
  },

  // Musculoskeletal / Falls
  {
    icd10Code: 'M62.81',
    icd10Display: 'Muscle weakness (generalized)',
    omahaProblemCode: 25,
    omahaProblemName: 'Neuro-Musculo-Skeletal Function',
    confidence: 'high',
  },
  {
    icd10Code: 'R26.2',
    icd10Display: 'Difficulty in walking',
    omahaProblemCode: 25,
    omahaProblemName: 'Neuro-Musculo-Skeletal Function',
    confidence: 'high',
  },
  {
    icd10Code: 'W19.XXXA',
    icd10Display: 'Unspecified fall, initial encounter',
    omahaProblemCode: 25,
    omahaProblemName: 'Neuro-Musculo-Skeletal Function',
    confidence: 'high',
  },
  {
    icd10Code: 'Z87.39',
    icd10Display: 'Personal history of falls',
    omahaProblemCode: 25,
    omahaProblemName: 'Neuro-Musculo-Skeletal Function',
    confidence: 'high',
  },
  {
    icd10Code: 'M54.5',
    icd10Display: 'Low back pain',
    omahaProblemCode: 22,
    omahaProblemName: 'Pain',
    confidence: 'high',
  },
  {
    icd10Code: 'G89.29',
    icd10Display: 'Other chronic pain',
    omahaProblemCode: 22,
    omahaProblemName: 'Pain',
    confidence: 'high',
  },

  // Nutrition / Diabetes
  {
    icd10Code: 'E11.9',
    icd10Display: 'Type 2 diabetes mellitus',
    omahaProblemCode: 35,
    omahaProblemName: 'Nutrition',
    confidence: 'high',
  },
  {
    icd10Code: 'E78.5',
    icd10Display: 'Hyperlipidemia, unspecified',
    omahaProblemCode: 35,
    omahaProblemName: 'Nutrition',
    confidence: 'medium',
  },
  {
    icd10Code: 'E86.0',
    icd10Display: 'Dehydration',
    omahaProblemCode: 28,
    omahaProblemName: 'Digestion-Hydration',
    confidence: 'high',
  },
  {
    icd10Code: 'R63.0',
    icd10Display: 'Anorexia',
    omahaProblemCode: 28,
    omahaProblemName: 'Digestion-Hydration',
    confidence: 'high',
  },

  // Sleep
  {
    icd10Code: 'G47.00',
    icd10Display: 'Insomnia, unspecified',
    omahaProblemCode: 36,
    omahaProblemName: 'Sleep and Rest Patterns',
    confidence: 'high',
  },

  // Social / Caregiver
  {
    icd10Code: 'Z60.2',
    icd10Display: 'Problems related to living alone',
    omahaProblemCode: 6,
    omahaProblemName: 'Social Contact',
    confidence: 'high',
  },
  {
    icd10Code: 'Z60.4',
    icd10Display: 'Social exclusion and rejection',
    omahaProblemCode: 6,
    omahaProblemName: 'Social Contact',
    confidence: 'high',
  },
  {
    icd10Code: 'Z63.6',
    icd10Display: 'Dependent relative needing care at home',
    omahaProblemCode: 13,
    omahaProblemName: 'Caretaking/Parenting',
    confidence: 'high',
  },
  {
    icd10Code: 'Z73.1',
    icd10Display: 'Type A behavior pattern',
    omahaProblemCode: 7,
    omahaProblemName: 'Role Change',
    confidence: 'medium',
  },
  {
    icd10Code: 'Z75.4',
    icd10Display: 'Unavailability of other helping agencies',
    omahaProblemCode: 5,
    omahaProblemName: 'Communication with Community Resources',
    confidence: 'high',
  },

  // Skin / Wound
  {
    icd10Code: 'L89.90',
    icd10Display: 'Pressure ulcer, unspecified',
    omahaProblemCode: 24,
    omahaProblemName: 'Skin',
    confidence: 'high',
  },

  // Urinary
  {
    icd10Code: 'N39.0',
    icd10Display: 'Urinary tract infection',
    omahaProblemCode: 30,
    omahaProblemName: 'Urinary Function',
    confidence: 'high',
  },

  // Medication
  {
    icd10Code: 'Z79.899',
    icd10Display: 'Long term drug therapy',
    omahaProblemCode: 41,
    omahaProblemName: 'Health Care Supervision',
    confidence: 'high',
  },
  {
    icd10Code: 'Z91.19',
    icd10Display: 'Noncompliance with medication regimen',
    omahaProblemCode: 42,
    omahaProblemName: 'Prescribed Medication Regimen',
    confidence: 'high',
  },

  // ADL
  {
    icd10Code: 'Z74.1',
    icd10Display: 'Need for assistance with personal care',
    omahaProblemCode: 38,
    omahaProblemName: 'Personal Care',
    confidence: 'high',
  },
  {
    icd10Code: 'R26.89',
    icd10Display: 'Other abnormalities of gait and mobility',
    omahaProblemCode: 38,
    omahaProblemName: 'Personal Care',
    confidence: 'medium',
  },

  // Grief
  {
    icd10Code: 'Z63.4',
    icd10Display: 'Disappearance and death of family member',
    omahaProblemCode: 10,
    omahaProblemName: 'Grief',
    confidence: 'high',
  },
  {
    icd10Code: 'F43.21',
    icd10Display: 'Adjustment disorder with depressed mood',
    omahaProblemCode: 10,
    omahaProblemName: 'Grief',
    confidence: 'medium',
  },

  // Housing
  {
    icd10Code: 'Z59.0',
    icd10Display: 'Homelessness',
    omahaProblemCode: 3,
    omahaProblemName: 'Residence',
    confidence: 'high',
  },
  {
    icd10Code: 'Z59.1',
    icd10Display: 'Inadequate housing',
    omahaProblemCode: 2,
    omahaProblemName: 'Sanitation',
    confidence: 'high',
  },
] as const;

export function getOmahaForICD10(icd10Code: string): ICD10OmahaMapping[] {
  return DEFAULT_ICD10_OMAHA_MAPPINGS.filter((m) => m.icd10Code === icd10Code);
}

export function getICD10ForOmaha(omahaProblemCode: number): ICD10OmahaMapping[] {
  return DEFAULT_ICD10_OMAHA_MAPPINGS.filter((m) => m.omahaProblemCode === omahaProblemCode);
}
