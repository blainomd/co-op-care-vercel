/**
 * NLP Pipeline Types — 5-Stage Ambient Voice → FHIR Generation
 *
 * Transforms unstructured caregiver observations into structured clinical
 * documentation using Omaha System taxonomy and FHIR resources.
 *
 * Pipeline stages:
 *   Stage 1: Ambient Capture → raw text/audio from caregiver
 *   Stage 2: Entity Extraction → GPT-4o-mini RAG with Omaha ontology
 *   Stage 3: Omaha System Mapping → problem codes, intervention categories
 *   Stage 4: Human Review → Conductor/Clinical Director approval
 *   Stage 5: FHIR Generation → Observations, CarePlans in Aidbox
 *
 * Privacy: All processing uses de-identified text. PHI stripped before
 * any LLM call. Final FHIR resources stored in Aidbox (HIPAA-compliant).
 *
 * Colorado AI Act (SB 24-205): This pipeline is classified as HIGH-RISK
 * because it influences care decisions. Requires impact assessments,
 * human-in-the-loop, and bias monitoring. See compliance section below.
 */

// ============================================================
// PIPELINE STAGES
// ============================================================

export type NLPPipelineStage =
  | 'ambient_capture'
  | 'entity_extraction'
  | 'omaha_mapping'
  | 'human_review'
  | 'fhir_generation';

export type NLPPipelineStatus =
  | 'pending'
  | 'processing'
  | 'awaiting_review'
  | 'approved'
  | 'rejected'
  | 'generated'
  | 'error';

// ============================================================
// STAGE 1: AMBIENT CAPTURE
// ============================================================

export type CaptureModality = 'voice' | 'text' | 'structured_form';

export interface AmbientCapture {
  /** Unique capture ID */
  id: string;
  /** Worker-owner who captured */
  workerId: string;
  /** Care recipient */
  patientId: string;
  /** Associated task ID (from TimeBank) */
  taskId: string;
  /** Input modality */
  modality: CaptureModality;
  /** Raw text (transcribed if voice) */
  rawText: string;
  /** Audio file reference (if voice capture) */
  audioRef?: string;
  /** Duration of audio in seconds (if voice) */
  audioDurationSeconds?: number;
  /** ISO 8601 timestamp */
  capturedAt: string;
  /** Whether PHI has been stripped for LLM processing */
  phiStripped: boolean;
  /** De-identified text (PHI replaced with [REDACTED]) */
  deidentifiedText: string;
}

// ============================================================
// STAGE 2: ENTITY EXTRACTION (GPT-4o-mini RAG)
// ============================================================

export interface ExtractedEntity {
  /** Entity type */
  type: EntityType;
  /** Extracted value */
  value: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Character offset in source text */
  startOffset: number;
  endOffset: number;
  /** Normalized value (if applicable) */
  normalizedValue?: string;
  /** Unit (for measurements) */
  unit?: string;
}

export type EntityType =
  | 'symptom'
  | 'behavior'
  | 'vital_sign'
  | 'medication'
  | 'mood'
  | 'activity'
  | 'nutrition'
  | 'sleep'
  | 'social'
  | 'pain'
  | 'functional_status'
  | 'safety_concern'
  | 'environmental';

export interface EntityExtractionResult {
  /** Source capture ID */
  captureId: string;
  /** Extracted entities */
  entities: ExtractedEntity[];
  /** Model used for extraction */
  model: string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Overall extraction confidence */
  overallConfidence: number;
  /** ISO 8601 timestamp */
  processedAt: string;
}

// ============================================================
// STAGE 3: OMAHA SYSTEM MAPPING
// ============================================================

export interface OmahaMapping {
  /** Source entity */
  entity: ExtractedEntity;
  /** Mapped Omaha System problem code */
  problemCode: string;
  /** Problem domain (Environmental, Psychosocial, Physiological, Health-Related Behaviors) */
  problemDomain: string;
  /** Problem display name */
  problemDisplay: string;
  /** Intervention category */
  interventionCategory: OmahaInterventionCategory;
  /** Intervention target */
  interventionTarget: string;
  /** KBS (Knowledge-Behavior-Status) ratings */
  suggestedKBS: {
    knowledge: number; // 1-5
    behavior: number; // 1-5
    status: number; // 1-5
  };
  /** Mapping confidence */
  confidence: number;
}

export type OmahaInterventionCategory =
  | 'Teaching, Guidance, and Counseling'
  | 'Treatments and Procedures'
  | 'Case Management'
  | 'Surveillance';

export interface OmahaMappingResult {
  /** Source capture ID */
  captureId: string;
  /** All mappings */
  mappings: OmahaMapping[];
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** ISO 8601 timestamp */
  processedAt: string;
}

// ============================================================
// STAGE 4: HUMAN REVIEW
// ============================================================

export interface HumanReview {
  /** Source capture ID */
  captureId: string;
  /** Reviewer (Conductor or Clinical Director) */
  reviewerId: string;
  /** Reviewer role */
  reviewerRole: 'conductor' | 'medical_director';
  /** Approval status */
  status: 'approved' | 'rejected' | 'modified';
  /** Modified mappings (if reviewer adjusted) */
  modifiedMappings?: OmahaMapping[];
  /** Reviewer notes */
  notes: string;
  /** Time spent reviewing in seconds */
  reviewDurationSeconds: number;
  /** ISO 8601 timestamp */
  reviewedAt: string;
}

// ============================================================
// STAGE 5: FHIR GENERATION
// ============================================================

export interface FHIRGenerationResult {
  /** Source capture ID */
  captureId: string;
  /** Generated FHIR resources */
  resources: GeneratedFHIRResource[];
  /** Aidbox transaction ID */
  aidboxTransactionId: string;
  /** ISO 8601 timestamp */
  generatedAt: string;
}

export interface GeneratedFHIRResource {
  /** FHIR resource type */
  resourceType: 'Observation' | 'CarePlan' | 'Condition' | 'ClinicalImpression';
  /** Aidbox resource ID */
  resourceId: string;
  /** FHIR reference URL */
  reference: string;
  /** Source Omaha mapping */
  sourceMappingIndex: number;
}

// ============================================================
// FULL PIPELINE RUN
// ============================================================

export interface NLPPipelineRun {
  /** Unique pipeline run ID */
  id: string;
  /** Source capture */
  capture: AmbientCapture;
  /** Current stage */
  currentStage: NLPPipelineStage;
  /** Current status */
  status: NLPPipelineStatus;
  /** Stage results (populated as pipeline progresses) */
  extraction?: EntityExtractionResult;
  mapping?: OmahaMappingResult;
  review?: HumanReview;
  generation?: FHIRGenerationResult;
  /** Total pipeline duration in milliseconds */
  totalDurationMs?: number;
  /** Error details (if status is 'error') */
  error?: { stage: NLPPipelineStage; message: string; code: string };
  /** ISO 8601 timestamps */
  startedAt: string;
  completedAt?: string;
}

// ============================================================
// COLORADO AI ACT COMPLIANCE (SB 24-205, effective June 30, 2026)
// ============================================================
// This NLP pipeline is classified as HIGH-RISK because it:
//   1. Influences care decisions (Omaha coding → care plans)
//   2. Processes health-related data
//   3. Operates in a consequential domain (healthcare)
//
// Required compliance measures:

export interface AIActImpactAssessment {
  /** Assessment ID */
  id: string;
  /** Pipeline component being assessed */
  component: string;
  /** Risk classification */
  riskLevel: 'high' | 'medium' | 'low';
  /** Description of potential harms */
  potentialHarms: string[];
  /** Mitigation measures */
  mitigations: string[];
  /** Human-in-the-loop requirements */
  humanInTheLoop: {
    required: boolean;
    stage: NLPPipelineStage;
    reviewerRole: string;
  };
  /** Bias monitoring metrics */
  biasMetrics: {
    /** Demographic parity across patient populations */
    demographicParity: boolean;
    /** Equal accuracy across language/dialect groups */
    languageEquity: boolean;
    /** Monitoring interval in days */
    monitoringIntervalDays: number;
  };
  /** Assessment date (ISO 8601) */
  assessedAt: string;
  /** Next review date */
  nextReviewAt: string;
}

export const NLP_PIPELINE_CONSTANTS = {
  /** LLM model for entity extraction */
  EXTRACTION_MODEL: 'gpt-4o-mini',
  /** Minimum confidence threshold for auto-mapping */
  AUTO_MAP_CONFIDENCE_THRESHOLD: 0.85,
  /** Below this threshold, requires human review */
  HUMAN_REVIEW_CONFIDENCE_THRESHOLD: 0.6,
  /** Maximum audio duration for voice capture (seconds) */
  MAX_AUDIO_DURATION_SECONDS: 300, // 5 minutes
  /** PHI detection patterns to strip before LLM */
  PHI_PATTERNS: ['SSN', 'DOB', 'MRN', 'phone', 'email', 'address', 'full_name'] as const,
  /** Colorado AI Act impact assessment interval */
  AI_ACT_ASSESSMENT_INTERVAL_DAYS: 90,
} as const;
