/**
 * FHIR Import Types
 *
 * Types for importing patient health records from external FHIR R4 sources
 * (payer/provider Patient Access APIs per 21st Century Cures Act).
 */

// ─── FHIR R4 Bundle / Resource ──────────────────────────────────────

export interface FhirBundle {
  resourceType: 'Bundle';
  type: string;
  entry?: Array<{
    resource: FhirResource;
  }>;
}

export interface FhirResource {
  resourceType: string;
  [key: string]: unknown;
}

// ─── Extracted health data ──────────────────────────────────────────

export interface ImportedHealthData {
  conditions: Array<{ code: string; display: string; system: string }>;
  medications: string[];
  allergies: string[];
  vitals: Array<{ type: string; value: number; unit: string; date: string }>;
  carePlans: Array<{ title: string; status: string }>;
  importedAt: string;
}

// ─── SMART on FHIR connection ───────────────────────────────────────

export interface FhirConnectionStatus {
  userId: string;
  connected: boolean;
  lastImportAt: string | null;
  resourceCount: number;
  source: string | null;
}

export interface SmartAuthRequest {
  userId: string;
  provider: 'flexpa' | '1up' | 'health_gorilla' | 'custom';
  fhirBaseUrl?: string;
}
