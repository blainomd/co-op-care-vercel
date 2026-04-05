/**
 * Caregiver Guide Types — Workflow definitions for the Connector
 *
 * The Caregiver Guide is NOT a harness — it's a WORKFLOW.
 * A sequence of harness invocations that the Connector orchestrates:
 *
 *   1. CareGoals harness → gather conditions, meds, routines, contacts → Living Profile
 *   2. Medication harness → cross-reference meds, flag interactions → med schedule
 *   3. ClinicalSwipe harness → verify recommended services → attested protocols
 *   4. LMN harness → identify HSA/FSA eligible needs → draft LMN for Josh
 *   5. Connector assembles outputs → THE CAREGIVER GUIDE
 *
 * Side effects that fire:
 *   → Living Profile created (Supabase)
 *   → Acuity score generated (subscription trigger)
 *   → LMN queued for physician review ($199 or included in $59/mo)
 *   → PIN G0019/G0023 codes captured
 *   → ComfortCard activated for eligible spending
 *   → CareGoals ACP baseline established (ACCESS ready)
 */

// ─── Guide Input (what the family provides) ─────────────────────────

export interface CareRecipientInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string; // "my mother", "my father", "my spouse"
}

export interface ConditionEntry {
  name: string;
  icd10?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  diagnosedDate?: string;
  notes?: string;
}

export interface MedicationEntry {
  name: string;
  dosage: string;
  frequency: string; // "twice daily", "every 8 hours"
  timeOfDay: string[]; // ["morning", "evening"]
  prescriber?: string;
  pharmacy?: string;
  refillDate?: string;
  notes?: string;
}

export interface RoutineEntry {
  timeOfDay: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'as-needed';
  activity: string;
  duration?: string;
  assistance: 'independent' | 'supervision' | 'hands-on' | 'total';
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isHealthcareProxy: boolean;
  notes?: string;
}

export interface DietaryInfo {
  restrictions: string[]; // "diabetic", "low sodium", "gluten free"
  allergies: string[];
  preferences: string[];
  fluidRestriction?: string;
  feedingAssistance: 'independent' | 'setup' | 'supervision' | 'full';
}

export interface GuideInput {
  careRecipient: CareRecipientInput;
  conditions: ConditionEntry[];
  medications: MedicationEntry[];
  routines: RoutineEntry[];
  emergencyContacts: EmergencyContact[];
  dietary: DietaryInfo;
  // CareGoals values (from Sage conversation)
  goodDay?: string; // "What makes a good day?"
  whatMatters?: string; // "What matters most right now?"
  comfortMeasures?: string; // "When things get hard, what helps?"
  // Conductor info
  conductorName?: string;
  conductorEmail?: string;
  conductorPhone?: string;
}

// ─── Guide Sections (Connector output) ──────────────────────────────

export interface DailyScheduleSection {
  timeBlocks: Array<{
    time: string; // "7:00 AM"
    activities: string[]; // ["Wake up", "Morning medications", "Breakfast"]
    medications: string[]; // ["Metformin 500mg", "Lisinopril 10mg"]
    assistanceLevel: string;
    notes?: string;
  }>;
}

export interface MedicationSection {
  schedule: Array<{
    name: string;
    dosage: string;
    times: string[];
    withFood: boolean;
    specialInstructions?: string;
  }>;
  interactions: Array<{
    drugA: string;
    drugB: string;
    severity: 'minor' | 'moderate' | 'major';
    description: string;
    recommendation: string;
  }>;
  refillTracker: Array<{
    medication: string;
    pharmacy: string;
    nextRefill: string;
    daysRemaining: number;
  }>;
}

export interface EmergencySection {
  contacts: EmergencyContact[];
  protocols: Array<{
    scenario: string; // "Fall", "Chest Pain", "Confusion"
    immediateAction: string;
    callOrder: string[]; // ["911", "Dr. Smith", "Daughter Jane"]
    doNot: string[]; // things to avoid
  }>;
  hospitalBag: string[]; // items to grab for ER visit
  advanceDirective?: {
    exists: boolean;
    location: string;
    healthcareProxy: string;
    keyWishes: string[]; // from CareGoals
  };
}

export interface DietSection {
  mealPlan: Array<{
    meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    guidelines: string[];
    restrictions: string[];
    examples: string[];
  }>;
  hydration: {
    target: string;
    restrictions?: string;
    reminders: string[];
  };
}

export interface CareTeamSection {
  members: Array<{
    name: string;
    role: string; // "Primary physician", "Home health aide"
    phone: string;
    schedule?: string; // "Mon/Wed/Fri 9-3"
    responsibilities: string[];
  }>;
}

// ─── Kinetic Care Loop Triggers ─────────────────────────────────────

export interface GuideTrigger {
  type:
    | 'lmn_eligible' // HSA/FSA-eligible need identified → draft LMN
    | 'clinicalswipe_review' // Service recommendation → physician verification
    | 'caregoals_acp' // End-of-life/proxy section → CareGoals ACP workflow
    | 'pin_code' // Care navigation → PIN G0019/G0023
    | 'cts_code' // Caregiver training → CTS 97550
    | 'comfortcard_activate' // HSA/FSA-eligible spend → ComfortCard
    | 'acuity_profile' // Assessment data → family acuity score
    | 'access_baseline'; // Outcome metrics → ACCESS Cohort 1
  sectionId: string;
  description: string;
  payload: Record<string, unknown>;
}

// ─── The Complete Guide ─────────────────────────────────────────────

export type GuideStatus = 'gathering' | 'organizing' | 'writing' | 'reviewing' | 'complete';

export interface CaregiverGuide {
  id: string;
  familyId: string;
  careRecipientId: string;
  status: GuideStatus;
  createdAt: string;
  updatedAt: string;
  // The 6 sections (maps to Perplexity's output categories)
  dailySchedule: DailyScheduleSection;
  medications: MedicationSection;
  emergency: EmergencySection;
  diet: DietSection;
  careTeam: CareTeamSection;
  // CareGoals values woven through
  personalValues: {
    goodDay: string;
    whatMatters: string;
    comfortMeasures: string;
  };
  // Kinetic Care Loop — triggers that fired during generation
  triggers: GuideTrigger[];
  // Metadata
  generatedBy: 'sage'; // always Sage (Claude)
  physicianReviewRequired: boolean;
  physicianReviewedAt?: string;
  physicianId?: string; // Josh's NPI
  // Output formats
  printableHtml?: string;
  pdfUrl?: string;
}

// ─── Workflow Steps (Connector orchestration) ───────────────────────

export type WorkflowStepId =
  | 'gather_profile' // CareGoals harness
  | 'check_medications' // Medication harness
  | 'verify_services' // ClinicalSwipe harness
  | 'draft_lmn' // LMN harness
  | 'assemble_guide' // Connector assembles
  | 'physician_review'; // Josh reviews triggers

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  harness: string; // which harness executes this step
  status: 'pending' | 'running' | 'complete' | 'skipped' | 'error';
  startedAt?: string;
  completedAt?: string;
  output?: Record<string, unknown>;
  triggersEmitted?: GuideTrigger[];
}

export interface GuideWorkflow {
  guideId: string;
  steps: WorkflowStep[];
  currentStep: WorkflowStepId;
  startedAt: string;
  completedAt?: string;
}
