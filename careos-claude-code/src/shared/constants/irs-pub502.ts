/**
 * IRS Publication 502 — Medical and Dental Expenses
 * Categories that qualify for HSA/FSA reimbursement
 * Used by the LMN → Comfort Card pipeline
 */

export interface IRSPub502Category {
  code: string;
  name: string;
  description: string;
  omahaProblems: number[]; // Omaha problem codes that map here
}

export const IRS_PUB_502_CATEGORIES: readonly IRSPub502Category[] = [
  { code: 'THERAPEUTIC_EXERCISE', name: 'Therapeutic Exercise', description: 'Exercise prescribed by physician for specific medical condition', omahaProblems: [22, 25, 27, 37] },
  { code: 'NUTRITION_COUNSELING', name: 'Nutrition Counseling', description: 'Dietary counseling for diagnosed condition (diabetes, CHF, etc.)', omahaProblems: [28, 35] },
  { code: 'MENTAL_HEALTH', name: 'Mental Health Services', description: 'Therapy, counseling, psychiatric services', omahaProblems: [10, 11] },
  { code: 'PHYSICAL_THERAPY', name: 'Physical Therapy', description: 'PT for diagnosed musculoskeletal or neurological condition', omahaProblems: [22, 25] },
  { code: 'OCCUPATIONAL_THERAPY', name: 'Occupational Therapy', description: 'OT for functional impairment', omahaProblems: [25, 38] },
  { code: 'SPEECH_THERAPY', name: 'Speech Therapy', description: 'Speech-language pathology for diagnosed condition', omahaProblems: [19] },
  { code: 'COGNITIVE_THERAPY', name: 'Cognitive Therapy/Stimulation', description: 'Cognitive programs for dementia or brain injury', omahaProblems: [16, 21] },
  { code: 'FALL_PREVENTION', name: 'Fall Prevention Program', description: 'Balance and fall prevention (tai chi, etc.) with physician referral', omahaProblems: [25] },
  { code: 'CARDIAC_REHAB', name: 'Cardiac Rehabilitation', description: 'Exercise and education for cardiovascular disease', omahaProblems: [27] },
  { code: 'PULMONARY_REHAB', name: 'Pulmonary Rehabilitation', description: 'Breathing exercise and education for lung disease', omahaProblems: [26] },
  { code: 'AQUATIC_THERAPY', name: 'Aquatic Therapy', description: 'Water-based therapy for pain, mobility, or cardiovascular conditions', omahaProblems: [22, 25, 27] },
  { code: 'PERSONAL_CARE', name: 'Home Health Aide/Personal Care', description: 'Personal care assistance for diagnosed medical condition', omahaProblems: [38] },
  { code: 'MEDICATION_MANAGEMENT', name: 'Medication Management', description: 'Pharmacy consultation and medication review', omahaProblems: [41, 42] },
  { code: 'CAREGIVER_TRAINING', name: 'Caregiver Training', description: 'Training for family caregivers under physician direction', omahaProblems: [7, 13] },
  { code: 'SLEEP_PROGRAM', name: 'Sleep Hygiene Program', description: 'Sleep intervention for diagnosed sleep disorder', omahaProblems: [36] },
  { code: 'SUBSTANCE_USE', name: 'Substance Use Treatment', description: 'Addiction treatment and recovery programs', omahaProblems: [39] },
  { code: 'SOCIAL_PRESCRIBING', name: 'Social Prescribing', description: 'Community-based social activities prescribed for isolation', omahaProblems: [6] },
  { code: 'RESPITE_CARE', name: 'Respite Care', description: 'Temporary care to relieve primary caregiver', omahaProblems: [13] },
] as const;

export function getPub502ForOmahaProblem(omahaCode: number): IRSPub502Category[] {
  return IRS_PUB_502_CATEGORIES.filter(c => c.omahaProblems.includes(omahaCode));
}
