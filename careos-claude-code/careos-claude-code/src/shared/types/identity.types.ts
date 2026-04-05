/**
 * Identity Verification Types
 *
 * Used by the driver's license verification flow to ensure
 * all co-op.care members are real people. Extracted data
 * pre-populates the Sage profile.
 *
 * Provider will be 'mock' during development — Jacob will
 * wire Persona or Jumio server-side later.
 */

export interface VerifiedIdentity {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  documentType: 'drivers_license' | 'state_id' | 'passport';
  documentState?: string;
  verifiedAt: string; // ISO timestamp
  provider: 'persona' | 'jumio' | 'manual' | 'mock';
  confidence: number; // 0-1
}

export interface IdentityVerificationResult {
  success: boolean;
  identity?: VerifiedIdentity;
  error?: string;
}
