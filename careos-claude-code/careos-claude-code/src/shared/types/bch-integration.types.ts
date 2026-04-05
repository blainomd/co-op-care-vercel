/**
 * BCH (Boulder Community Health) Integration Types
 *
 * "Safe Graduation" Pilot — 72-hour post-discharge companion care
 *
 * Problem: BCH readmission rate 15.4%, each readmission costs ~$16,037.
 *          A blocked bed costs $2,500/day. Patients discharged to home without
 *          support are at highest risk in first 72 hours.
 *
 * Solution: co-op.care Conductor dispatched within 4 hours of discharge.
 *           72-hour care bridge: medication reconciliation, follow-up scheduling,
 *           fall prevention, nutrition, companionship. Galaxy Watch monitors vitals.
 *
 * Integration: HL7 v2 ADT (Admit-Discharge-Transfer) messages from BCH Epic →
 *              co-op.care webhook → automatic Conductor dispatch.
 *
 * Scale: 5-10 discharge patients/month initially.
 * Revenue: CHI (G0019) + PIN (G0023) + RPM (99454) = ~$300+/patient/month
 *          + avoided readmission value to BCH ($16,037 × reduction rate)
 *
 * Key contacts: Grant Besser (BCH Foundation)
 */

// ============================================================
// HL7 v2 ADT MESSAGE TYPES
// ============================================================

export type ADTEventType =
  | 'A01' // Admit
  | 'A02' // Transfer
  | 'A03' // Discharge
  | 'A04' // Register outpatient
  | 'A08' // Update patient info
  | 'A11' // Cancel admit
  | 'A13' // Cancel discharge
  | 'A28' // Add person info
  | 'A31'; // Update person info

export interface HL7v2ADTMessage {
  /** Message control ID */
  messageControlId: string;
  /** Event type (A03 = discharge is primary trigger) */
  eventType: ADTEventType;
  /** Patient identifier (MRN) */
  patientMRN: string;
  /** Patient name (for matching to co-op.care) */
  patientName: {
    family: string;
    given: string;
  };
  /** Date of birth (for identity verification) */
  dateOfBirth: string;
  /** Admitting diagnosis (ICD-10) */
  admitDiagnosis?: string;
  /** Discharge diagnosis (ICD-10) */
  dischargeDiagnosis?: string;
  /** Discharge disposition */
  dischargeDisposition: DischargeDisposition;
  /** Attending physician */
  attendingPhysician?: {
    npi: string;
    name: string;
  };
  /** Discharge date/time (ISO 8601) */
  dischargeDateTime: string;
  /** Facility */
  facility: string;
  /** Raw HL7 v2 message (for audit) */
  rawMessage: string;
  /** ISO 8601 timestamp of message receipt */
  receivedAt: string;
}

export type DischargeDisposition =
  | 'home' // Discharged to home (PRIMARY target)
  | 'home_health' // Home with home health services
  | 'snf' // Skilled nursing facility
  | 'rehab' // Rehabilitation facility
  | 'ltac' // Long-term acute care
  | 'hospice' // Hospice
  | 'ama' // Against medical advice
  | 'expired' // Deceased
  | 'other';

// ============================================================
// SAFE GRADUATION PILOT
// ============================================================

export type SafeGraduationStatus =
  | 'adt_received' // HL7 ADT A03 received
  | 'eligibility_check' // Checking patient eligibility
  | 'eligible' // Patient qualifies
  | 'not_eligible' // Patient doesn't qualify
  | 'conductor_assigned' // Conductor dispatched
  | 'first_visit' // First 4-hour visit within 24h of discharge
  | 'monitoring' // 72-hour monitoring period
  | 'graduated' // Successfully completed 72-hour bridge
  | 'readmitted' // Patient readmitted (failure case)
  | 'cancelled'; // Cancelled (patient declined, etc.)

export interface SafeGraduationCase {
  /** Unique case ID */
  id: string;
  /** Source ADT message */
  adtMessageId: string;
  /** Patient (FHIR Patient resource ID in Aidbox) */
  patientId: string;
  /** BCH MRN (for cross-reference) */
  bchMRN: string;
  /** Current status */
  status: SafeGraduationStatus;
  /** Discharge date/time */
  dischargeDateTime: string;
  /** Discharge diagnosis (ICD-10) */
  dischargeDiagnosis: string;
  /** 72-hour window end (ISO 8601) */
  windowEndsAt: string;
  /** Assigned Conductor (worker-owner ID) */
  conductorId?: string;
  /** Galaxy Watch paired for monitoring? */
  wearableActive: boolean;
  /** Risk score at time of discharge (from wearable MCP) */
  dischargeRiskScore?: number;
  /** Visits completed */
  visits: SafeGraduationVisit[];
  /** Billing codes applied */
  billingCodes: string[];
  /** Outcome */
  outcome?: SafeGraduationOutcome;
  /** ISO 8601 timestamps */
  createdAt: string;
  updatedAt: string;
}

export interface SafeGraduationVisit {
  /** Visit number (1-3 typically in 72-hour window) */
  visitNumber: number;
  /** Conductor who performed the visit */
  conductorId: string;
  /** Visit date/time */
  visitDateTime: string;
  /** Duration in hours */
  durationHours: number;
  /** Activities performed */
  activities: SafeGraduationActivity[];
  /** Omaha problem codes documented */
  omahaCodes: string[];
  /** Vital readings from Galaxy Watch during visit */
  vitalReadings?: string[]; // FHIR Observation IDs
  /** Caregiver notes */
  notes: string;
  /** GPS verified */
  gpsVerified: boolean;
}

export type SafeGraduationActivity =
  | 'medication_reconciliation'
  | 'followup_scheduling'
  | 'fall_risk_assessment'
  | 'nutrition_assessment'
  | 'companionship'
  | 'mobility_assistance'
  | 'vital_signs_monitoring'
  | 'care_plan_review'
  | 'family_education'
  | 'transportation_arrangement';

export interface SafeGraduationOutcome {
  /** Whether patient was readmitted within 30 days */
  readmittedWithin30Days: boolean;
  /** Readmission date (if applicable) */
  readmissionDate?: string;
  /** Whether 72-hour bridge was completed */
  bridgeCompleted: boolean;
  /** Total hours of care provided */
  totalCareHours: number;
  /** Total revenue generated (all billing codes) in cents */
  totalRevenueCents: number;
  /** Estimated readmission cost avoided (if not readmitted) */
  estimatedSavingsCents?: number;
  /** Patient satisfaction score (1-5) */
  patientSatisfaction?: number;
}

// ============================================================
// ELIGIBILITY CRITERIA
// ============================================================

export const SAFE_GRADUATION_ELIGIBILITY = {
  /** Discharge dispositions that qualify */
  ELIGIBLE_DISPOSITIONS: ['home', 'home_health'] as const,
  /** Maximum hours after discharge to initiate */
  MAX_HOURS_POST_DISCHARGE: 4,
  /** 72-hour monitoring window */
  MONITORING_WINDOW_HOURS: 72,
  /** Target visits in 72-hour window */
  TARGET_VISITS: 3,
  /** Monthly pilot capacity */
  MONTHLY_CAPACITY: 10,
  /** Diagnoses with highest readmission risk (ICD-10 prefixes) */
  HIGH_RISK_DIAGNOSES: [
    'I50', // Heart failure
    'J44', // COPD
    'J18', // Pneumonia
    'N17', // Acute kidney failure
    'E11', // Type 2 diabetes
    'I63', // Cerebral infarction
    'S72', // Hip fracture
  ] as const,
  /** BCH readmission rate */
  BCH_READMISSION_RATE: 0.154, // 15.4%
  /** Average readmission cost in cents */
  READMISSION_COST_CENTS: 1603700, // $16,037
  /** Blocked bed cost per day in cents */
  BLOCKED_BED_DAILY_CENTS: 250000, // $2,500
} as const;
