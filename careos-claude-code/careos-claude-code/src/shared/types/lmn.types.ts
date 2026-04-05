/**
 * LMN (Letter of Medical Necessity) Types
 *
 * LMN documents medical necessity for home care services,
 * enabling HSA/FSA reimbursement. Generated from CRI data,
 * signed by MD, valid for up to 365 days.
 */

export type LMNStatus =
  | 'draft'
  | 'pending_signature'
  | 'active'
  | 'expiring'
  | 'expired'
  | 'revoked';

export interface LMN {
  id: string;
  careRecipientId: string;
  careRecipientName: string;
  generatedBy: string; // conductor who initiated
  signingPhysicianId?: string;
  signingPhysicianName?: string;

  // Source data
  criAssessmentId: string;
  criScore: number;
  acuity: string; // 'high' | 'critical'
  diagnosisCodes: string[]; // ICD-10 codes
  omahaProblems: number[]; // active Omaha problem codes
  carePlanSummary: string;

  // Document
  status: LMNStatus;
  issuedAt?: string;
  expiresAt?: string;
  durationDays: number; // typically 365
  documentUrl?: string; // signed PDF location

  // Signing
  signatureRequestId?: string; // e-sign provider reference
  signedAt?: string;
  signatureMethod?: 'docusign' | 'hellosign' | 'manual';

  // Renewal tracking
  lastReminderTier?: number; // 60, 30, 14, 7
  renewalCriId?: string; // CRI scheduled for renewal

  // FHIR
  fhirDocumentReferenceId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface LMNGenerateInput {
  careRecipientId: string;
  criAssessmentId: string;
  diagnosisCodes?: string[];
  carePlanSummary?: string;
}

export interface LMNSignInput {
  signatureMethod: 'docusign' | 'hellosign' | 'manual';
}

export interface LMNListItem {
  id: string;
  careRecipientName: string;
  status: LMNStatus;
  acuity: string;
  issuedAt?: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
  signingPhysicianName?: string;
}
