/**
 * co-op.care Wearable MCP Server — Type Definitions
 *
 * Request/response types for all 6 MCP tools that bridge Galaxy Watch / Apple Watch
 * health data into Sage AI conversations.
 *
 * These types map to FHIR Observation resources in Aidbox and use LOINC codes
 * from src/shared/constants/loinc-codes.ts for metric identification.
 */

import type { DevicePlatform } from '../../../shared/constants/loinc-codes.js';

// ─── Common Types ──────────────────────────────────────────────────────────────

/** FHIR Observation-based vital reading with baseline comparison */
export interface VitalReading {
  /** LOINC code (e.g., "8867-4" for heart rate) */
  code: string;
  /** Human-readable metric name */
  display: string;
  /** Numeric value of the reading */
  value: number;
  /** Unit of measurement */
  unit: string;
  /** ISO 8601 timestamp of the reading */
  timestamp: string;
  /** FHIR Observation resource ID in Aidbox */
  observationId: string;
  /** 30-day personal baseline for comparison */
  baseline: {
    mean: number;
    standardDeviation: number;
    sampleCount: number;
    /** How many SDs this reading deviates from baseline */
    deviationSigma: number;
  };
  /** Source device platform */
  source: DevicePlatform;
}

/** Severity levels for anomalies and risk factors */
export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

// ─── get_vitals ────────────────────────────────────────────────────────────────

export interface VitalsRequest {
  /** FHIR Patient resource ID */
  patientId: string;
  /** LOINC code or "all" for all metrics. Default: "all" */
  metric?: string;
  /** Time range for readings. Default: "latest" */
  range?: 'latest' | '24h' | '7d' | '30d';
}

export interface VitalsResponse {
  patientId: string;
  range: string;
  readings: VitalReading[];
  /** ISO 8601 timestamp of when this data was fetched */
  fetchedAt: string;
  /** Device info */
  device: {
    platform: DevicePlatform;
    model: string;
    lastSyncAt: string;
  };
}

// ─── get_anomalies ─────────────────────────────────────────────────────────────

export interface AnomalyRequest {
  /** FHIR Patient resource ID */
  patientId: string;
  /** Lookback window. Default: "48h" */
  window?: '24h' | '48h' | '7d';
  /** Minimum severity score (0-10) to include. Default: 3 */
  minSeverity?: number;
}

export interface Anomaly {
  /** Unique anomaly identifier */
  id: string;
  /** The vital reading that triggered the anomaly */
  reading: VitalReading;
  /** Severity score 0-10 */
  severity: number;
  /** Severity classification */
  level: SeverityLevel;
  /** Human-readable description of the anomaly */
  description: string;
  /** How many SDs from baseline */
  deviationSigma: number;
  /** Direction of deviation */
  direction: 'above' | 'below';
  /** Whether this anomaly has been acknowledged by a caregiver/family member */
  acknowledged: boolean;
  /** ISO 8601 timestamp when the anomaly was first detected */
  detectedAt: string;
  /** Related Omaha System problem code */
  omahaProblemCode: string;
}

export interface AnomalyResponse {
  patientId: string;
  window: string;
  anomalies: Anomaly[];
  /** Total count of anomalies (may exceed returned list if filtered by severity) */
  totalCount: number;
  /** Summary for Sage AI to use in conversation */
  summary: string;
}

// ─── get_trends ────────────────────────────────────────────────────────────────

export interface TrendRequest {
  /** FHIR Patient resource ID */
  patientId: string;
  /** LOINC code for the metric to analyze */
  metric: string;
  /** Number of days to analyze. Default: 30 */
  days?: number;
}

export type TrendDirection = 'improving' | 'declining' | 'stable';

export interface TrendResponse {
  patientId: string;
  metric: {
    code: string;
    display: string;
    unit: string;
  };
  days: number;
  /** Overall trend direction */
  direction: TrendDirection;
  /** Rate of change per day */
  rateOfChange: number;
  /** Whether the trend is clinically significant */
  clinicallySignificant: boolean;
  /** Statistical details */
  statistics: {
    startValue: number;
    endValue: number;
    minValue: number;
    maxValue: number;
    mean: number;
    standardDeviation: number;
    dataPoints: number;
    /** Linear regression R-squared (0-1, higher = stronger trend) */
    rSquared: number;
  };
  /** Human-readable interpretation for Sage AI */
  interpretation: string;
}

// ─── get_risk_score ────────────────────────────────────────────────────────────

export interface RiskScoreRequest {
  /** FHIR Patient resource ID */
  patientId: string;
}

export interface RiskFactor {
  /** LOINC code of the contributing metric */
  code: string;
  /** Metric display name */
  display: string;
  /** Current value */
  value: number;
  /** Unit */
  unit: string;
  /** Weight in the composite score (from loinc-codes.ts riskScoreWeight) */
  weight: number;
  /** Individual risk contribution (0-1) */
  contribution: number;
  /** Trend direction for this factor */
  trend: TrendDirection;
  /** Human-readable note */
  note: string;
}

export interface RiskScoreResponse {
  patientId: string;
  /** Composite risk score 0-100 */
  score: number;
  /** Risk level classification */
  level: SeverityLevel;
  /** 72-96 hour hospitalization probability estimate */
  hospitalizationProbability: number;
  /** Contributing factors sorted by contribution (highest first) */
  factors: RiskFactor[];
  /** ISO 8601 timestamp of calculation */
  calculatedAt: string;
  /** Human-readable summary for Sage AI */
  summary: string;
  /** Recommended actions based on risk level */
  recommendations: string[];
}

// ─── get_device_status ─────────────────────────────────────────────────────────

export interface DeviceStatusRequest {
  /** FHIR Patient resource ID */
  patientId: string;
}

export interface DataGap {
  /** ISO 8601 start of gap */
  startAt: string;
  /** ISO 8601 end of gap (or null if ongoing) */
  endAt: string | null;
  /** Duration in hours */
  durationHours: number;
  /** Which metrics were missing during the gap */
  missingMetrics: string[];
}

/**
 * CMS billing eligibility summary from wearable data.
 *
 * The 10-layer revenue stack means a single patient can generate
 * PIN + CHI + CCM + RPM = ~$481/month. The wearable primarily
 * gates RPM eligibility (16+ data days), but Sage AI needs
 * visibility into all 4 CMS layers for care coordination.
 */
export interface BillingEligibility {
  rpm: {
    eligible: boolean;
    dataDaysThisMonth: number;
    requiredDays: number;
    codes: string[];
    note: string;
  };
  pin: {
    codes: string[];
    note: string;
  };
  chi: {
    codes: string[];
    note: string;
  };
  ccm: {
    codes: string[];
    note: string;
  };
  /** Maximum monthly revenue if all layers active (in cents) */
  maxMonthlyRevenueCents: number;
}

export interface DeviceStatusResponse {
  patientId: string;
  device: {
    platform: DevicePlatform;
    model: string;
    firmwareVersion: string;
    /** Battery percentage (0-100) */
    batteryLevel: number;
    /** Whether the device is currently being worn */
    isWorn: boolean;
  };
  sync: {
    /** ISO 8601 timestamp of last successful sync */
    lastSyncAt: string;
    /** Hours since last sync */
    hoursSinceSync: number;
    /** Whether sync is overdue (>6 hours) */
    syncOverdue: boolean;
  };
  /** Data gaps in the last 7 days */
  dataGaps: DataGap[];
  /** Wear compliance percentage (hours worn / hours in period) for last 7 days */
  wearCompliance: number;
  /** RPM data transmission days this month (for CPT 99454 eligibility) */
  rpmDataDays: number;
  /** Full CMS billing eligibility (RPM + PIN + CHI + CCM) */
  billingEligibility: BillingEligibility;
  /** Issues that may need caregiver attention */
  issues: string[];
}

// ─── get_care_context ──────────────────────────────────────────────────────────

export interface CareContextRequest {
  /** FHIR Patient resource ID */
  patientId: string;
  /** Include wearable vitals. Default: true */
  includeVitals?: boolean;
  /** Include recent care logs. Default: true */
  includeCareLogs?: boolean;
  /** Include medication list. Default: true */
  includeMedications?: boolean;
  /** Include risk score. Default: true */
  includeRiskScore?: boolean;
}

export interface CareLog {
  /** Care log entry ID */
  id: string;
  /** Caregiver who created the log */
  caregiverId: string;
  /** Caregiver display name */
  caregiverName: string;
  /** TimeBank task type (meals, companionship, etc.) */
  taskType: string;
  /** Duration in hours */
  hours: number;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Caregiver's notes about the visit */
  notes: string;
  /** Omaha System problem code */
  omahaProblemCode: string;
  /** Omaha intervention category */
  interventionCategory: string;
  /** Gratitude note from care recipient/family (if any) */
  gratitudeNote?: string;
}

export interface Medication {
  /** FHIR MedicationStatement resource ID */
  id: string;
  /** Medication name */
  name: string;
  /** Dosage */
  dosage: string;
  /** Frequency (e.g., "twice daily") */
  frequency: string;
  /** Whether currently active */
  active: boolean;
  /** Prescriber name */
  prescriber?: string;
}

export interface CareContextResponse {
  patientId: string;
  /** Care recipient display name */
  patientName: string;
  /** Current CII (Care Integration Index) score */
  ciiScore?: {
    total: number;
    zone: 'green' | 'yellow' | 'orange' | 'red';
    knowledgeScore: number;
    behaviorScore: number;
    statusScore: number;
    lastAssessedAt: string;
  };
  /** Latest vitals (if includeVitals) */
  vitals?: VitalsResponse;
  /** Active anomalies (always included if vitals are included) */
  anomalies?: AnomalyResponse;
  /** Risk score (if includeRiskScore) */
  riskScore?: RiskScoreResponse;
  /** Recent care logs (if includeCareLogs) — last 7 days */
  careLogs?: CareLog[];
  /** Current medications (if includeMedications) */
  medications?: Medication[];
  /** Device status (always included) */
  deviceStatus?: DeviceStatusResponse;
  /** Comprehensive summary for Sage AI to use as conversation context */
  summary: string;
  /** ISO 8601 timestamp of context assembly */
  assembledAt: string;
}
