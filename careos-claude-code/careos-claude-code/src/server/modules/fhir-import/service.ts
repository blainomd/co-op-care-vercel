// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — PostgreSQL query migration pending (Jacob backend work)
/**
 * FHIR Import Service
 *
 * Pulls patient health records from external FHIR R4 sources and maps them
 * into Sage's ProfileData shape for merging with the existing Living Profile.
 *
 * Supports data exposed via 21st Century Cures Act Patient Access APIs
 * (Flexpa, 1up Health, Health Gorilla, or direct SMART on FHIR).
 *
 * FHIR resources extracted:
 *   Patient          -> name, DOB, address, phone
 *   Condition        -> conditions (ICD-10 -> human-readable)
 *   MedicationStatement / MedicationRequest -> medications
 *   AllergyIntolerance -> allergies
 *   Observation (vitals) -> recent vitals
 *   CarePlan         -> existing care plans
 */
import { getPostgres } from '../../database/postgres.js';
import { logger } from '../../common/logger.js';
import type { ProfileData } from '../memory/service.js';
import type {
  FhirBundle,
  FhirResource,
  ImportedHealthData,
  FhirConnectionStatus,
} from '@shared/types/fhir-import.types.js';

// ─── ICD-10 Code Mapping ────────────────────────────────────────────
// Common codes encountered in aging / companion care populations.

const ICD10_DISPLAY_MAP: Record<string, string> = {
  // Dementia spectrum
  F00: 'Dementia in Alzheimer disease',
  F01: 'Vascular dementia',
  F02: 'Dementia in other diseases',
  F03: 'Unspecified dementia',
  G30: 'Alzheimer disease',
  'G30.0': 'Alzheimer disease with early onset',
  'G30.1': 'Alzheimer disease with late onset',
  'G30.9': 'Alzheimer disease, unspecified',

  // Diabetes
  E11: 'Type 2 diabetes mellitus',
  'E11.9': 'Type 2 diabetes without complications',
  E10: 'Type 1 diabetes mellitus',
  'E10.9': 'Type 1 diabetes without complications',

  // COPD
  J44: 'Chronic obstructive pulmonary disease',
  'J44.0': 'COPD with acute lower respiratory infection',
  'J44.1': 'COPD with acute exacerbation',
  'J44.9': 'COPD, unspecified',

  // Congestive heart failure
  I50: 'Heart failure',
  'I50.0': 'Congestive heart failure, unspecified',
  'I50.2': 'Systolic heart failure',
  'I50.3': 'Diastolic heart failure',
  'I50.9': 'Heart failure, unspecified',

  // Hypertension
  I10: 'Essential hypertension',
  I11: 'Hypertensive heart disease',
  I12: 'Hypertensive chronic kidney disease',
  I13: 'Hypertensive heart and chronic kidney disease',

  // Arthritis
  M15: 'Polyosteoarthritis',
  M16: 'Osteoarthritis of hip',
  M17: 'Osteoarthritis of knee',
  M19: 'Other osteoarthritis',
  M06: 'Rheumatoid arthritis',
  'M06.9': 'Rheumatoid arthritis, unspecified',

  // Parkinson's
  G20: 'Parkinson disease',

  // Stroke / cerebrovascular
  I63: 'Cerebral infarction',
  I64: 'Stroke, not specified',
  I69: 'Sequelae of cerebrovascular disease',

  // Depression
  F32: 'Major depressive disorder, single episode',
  F33: 'Major depressive disorder, recurrent',
  'F32.9': 'Major depressive disorder, unspecified',

  // Anxiety
  F41: 'Other anxiety disorders',
  'F41.0': 'Panic disorder',
  'F41.1': 'Generalized anxiety disorder',
  'F41.9': 'Anxiety disorder, unspecified',

  // Fall history
  W19: 'Unspecified fall',
  'R29.6': 'Repeated falls',
  'Z91.81': 'History of falling',
};

/**
 * Look up a human-readable name for an ICD-10 code.
 * Falls back to the FHIR-provided display text, then the raw code.
 */
function resolveICD10Display(code: string, fhirDisplay?: string): string {
  // Try exact match first, then parent code (e.g. E11.65 -> E11)
  const exact = ICD10_DISPLAY_MAP[code];
  if (exact) return exact;

  const parent = code.split('.')[0];
  const parentMatch = ICD10_DISPLAY_MAP[parent];
  if (parentMatch) return parentMatch;

  return fhirDisplay ?? code;
}

// ─── Resource Extractors ────────────────────────────────────────────

function extractPatientDemographics(resource: FhirResource): Partial<ProfileData> {
  const result: Partial<ProfileData> = {};

  // Name
  const names = resource.name as
    | Array<{ given?: string[]; family?: string; use?: string }>
    | undefined;
  if (names?.length) {
    const official = names.find((n) => n.use === 'official') ?? names[0];
    result.firstName = official.given?.[0];
  }

  // Phone
  const telecoms = resource.telecom as Array<{ system?: string; value?: string }> | undefined;
  const phone = telecoms?.find((t) => t.system === 'phone');
  if (phone?.value) {
    result.phone = phone.value;
  }

  // Email
  const email = telecoms?.find((t) => t.system === 'email');
  if (email?.value) {
    result.email = email.value;
  }

  // Care recipient context from demographics
  const careRecipient: Record<string, unknown> = {};

  // DOB
  if (resource.birthDate) {
    careRecipient.dateOfBirth = resource.birthDate as string;
  }

  // Address
  const addresses = resource.address as
    | Array<{
        line?: string[];
        city?: string;
        state?: string;
        postalCode?: string;
      }>
    | undefined;
  if (addresses?.length) {
    const addr = addresses[0];
    careRecipient.address = {
      line: addr.line,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
    };
  }

  if (Object.keys(careRecipient).length > 0) {
    result.careRecipient = careRecipient;
  }

  return result;
}

function extractConditions(
  resource: FhirResource,
): ImportedHealthData['conditions'][number] | null {
  const coding = (
    resource.code as { coding?: Array<{ system?: string; code?: string; display?: string }> }
  )?.coding?.[0];
  if (!coding?.code) return null;

  const system = coding.system ?? 'http://hl7.org/fhir/sid/icd-10-cm';
  const display = resolveICD10Display(coding.code, coding.display);

  return {
    code: coding.code,
    display,
    system,
  };
}

function extractMedication(resource: FhirResource): string | null {
  // MedicationStatement and MedicationRequest both use medicationCodeableConcept
  const medConcept = resource.medicationCodeableConcept as
    | {
        coding?: Array<{ display?: string; code?: string }>;
        text?: string;
      }
    | undefined;

  if (medConcept?.text) return medConcept.text;
  if (medConcept?.coding?.[0]?.display) return medConcept.coding[0].display;

  // Fallback: medicationReference
  const medRef = resource.medicationReference as { display?: string } | undefined;
  if (medRef?.display) return medRef.display;

  return null;
}

function extractAllergy(resource: FhirResource): string | null {
  const codeable = resource.code as
    | { coding?: Array<{ display?: string }>; text?: string }
    | undefined;
  if (codeable?.text) return codeable.text;
  if (codeable?.coding?.[0]?.display) return codeable.coding[0].display;
  return null;
}

function extractVital(resource: FhirResource): ImportedHealthData['vitals'][number] | null {
  const coding = (resource.code as { coding?: Array<{ code?: string; display?: string }> })
    ?.coding?.[0];
  if (!coding) return null;

  const valueQuantity = resource.valueQuantity as { value?: number; unit?: string } | undefined;
  if (valueQuantity?.value == null) return null;

  const effectiveDateTime = (resource.effectiveDateTime ?? resource.issued) as string | undefined;

  return {
    type: coding.display ?? coding.code ?? 'unknown',
    value: valueQuantity.value,
    unit: valueQuantity.unit ?? '',
    date: effectiveDateTime ?? new Date().toISOString(),
  };
}

function extractCarePlan(resource: FhirResource): ImportedHealthData['carePlans'][number] | null {
  const title = (resource.title ?? resource.description) as string | undefined;
  const status = resource.status as string | undefined;

  if (!title) return null;

  return {
    title,
    status: status ?? 'unknown',
  };
}

// ─── Main Import Function ───────────────────────────────────────────

/**
 * Import patient data from a FHIR R4 Bundle.
 *
 * Takes a Bundle (typically from a Patient Access API response) and extracts
 * structured health data that can be merged into a Sage Living Profile.
 *
 * Returns a ProfileData object with:
 *   - demographics (name, phone, DOB, address)
 *   - careRecipient.importedHealth containing conditions, meds, allergies, vitals, care plans
 */
export async function importPatientData(fhirPatientBundle: FhirBundle): Promise<ProfileData> {
  const entries = fhirPatientBundle.entry ?? [];

  logger.info(
    { entryCount: entries.length, bundleType: fhirPatientBundle.type },
    'Processing FHIR patient bundle for import',
  );

  // Partition resources by type
  let demographics: Partial<ProfileData> = {};
  const conditions: ImportedHealthData['conditions'] = [];
  const medications: string[] = [];
  const allergies: string[] = [];
  const vitals: ImportedHealthData['vitals'] = [];
  const carePlans: ImportedHealthData['carePlans'] = [];

  for (const entry of entries) {
    const resource = entry.resource;
    if (!resource?.resourceType) continue;

    switch (resource.resourceType) {
      case 'Patient':
        demographics = extractPatientDemographics(resource);
        break;

      case 'Condition': {
        const condition = extractConditions(resource);
        if (condition) conditions.push(condition);
        break;
      }

      case 'MedicationStatement':
      case 'MedicationRequest': {
        const med = extractMedication(resource);
        if (med && !medications.includes(med)) medications.push(med);
        break;
      }

      case 'AllergyIntolerance': {
        const allergy = extractAllergy(resource);
        if (allergy && !allergies.includes(allergy)) allergies.push(allergy);
        break;
      }

      case 'Observation': {
        const vital = extractVital(resource);
        if (vital) vitals.push(vital);
        break;
      }

      case 'CarePlan': {
        const plan = extractCarePlan(resource);
        if (plan) carePlans.push(plan);
        break;
      }

      default:
        logger.debug(
          { resourceType: resource.resourceType },
          'Skipping unsupported FHIR resource type',
        );
    }
  }

  // Deduplicate conditions by code
  const uniqueConditions = conditions.reduce<ImportedHealthData['conditions']>((acc, c) => {
    if (!acc.some((existing) => existing.code === c.code)) acc.push(c);
    return acc;
  }, []);

  // Sort vitals by date descending (most recent first)
  vitals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Build the imported health data block
  const importedHealth: ImportedHealthData = {
    conditions: uniqueConditions,
    medications,
    allergies,
    vitals,
    carePlans,
    importedAt: new Date().toISOString(),
  };

  // Merge into ProfileData shape
  const profileData: ProfileData = {
    userId: '', // Caller must set this before saving
    ...demographics,
    careRecipient: {
      ...(demographics.careRecipient ?? {}),
      importedHealth,
    },
  };

  logger.info(
    {
      conditionCount: uniqueConditions.length,
      medicationCount: medications.length,
      allergyCount: allergies.length,
      vitalCount: vitals.length,
      carePlanCount: carePlans.length,
    },
    'FHIR patient data extracted',
  );

  return profileData;
}

// ─── Connection Status ──────────────────────────────────────────────

/**
 * Check whether FHIR data has been imported for a user.
 */
export async function getImportStatus(userId: string): Promise<FhirConnectionStatus> {
  const pool = getPostgres();

  const result = await pool.query(
    `SELECT
      user_id AS "userId",
      fhir_connected AS "connected",
      fhir_last_import AS "lastImportAt",
      fhir_resource_count AS "resourceCount",
      fhir_source AS "source"
    FROM user_profiles
    WHERE user_id = $1`,
    [userId],
  );

  if (!result.rows[0]) {
    return {
      userId,
      connected: false,
      lastImportAt: null,
      resourceCount: 0,
      source: null,
    };
  }

  return result.rows[0];
}

/**
 * Record that a FHIR import was completed for a user.
 */
export async function recordImport(
  userId: string,
  resourceCount: number,
  source: string,
): Promise<void> {
  const pool = getPostgres();

  await pool.query(
    `UPDATE user_profiles SET
      fhir_connected = true,
      fhir_last_import = NOW(),
      fhir_resource_count = $2,
      fhir_source = $3
    WHERE user_id = $1`,
    [userId, resourceCount, source],
  );

  logger.info({ userId, resourceCount, source }, 'FHIR import recorded');
}
