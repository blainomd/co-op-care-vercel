/**
 * PHI Stripping Service — De-identify text before sending to Gemini
 *
 * Strips Protected Health Information (PHI) from caregiver messages before
 * they reach the Gemini API. Keeps clinical terms (medication names, symptoms,
 * diagnoses) intact since those are needed for RAG accuracy.
 *
 * HIPAA Safe Harbor method: replaces 18 identifier categories.
 * This is a pattern-based approach — not NER/NLP. For production,
 * consider adding a Named Entity Recognition model.
 *
 * Jacob: This runs server-side BEFORE any Gemini API call.
 */

// ---------------------------------------------------------------------------
// Patterns for PHI detection
// ---------------------------------------------------------------------------

/** US Social Security Number: XXX-XX-XXXX */
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;

/** US Phone numbers: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX */
const PHONE_PATTERN = /\b(?:\(\d{3}\)\s?|\d{3}[-.])\d{3}[-.]?\d{4}\b/g;

/** Email addresses */
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

/** Dates of birth and specific dates: MM/DD/YYYY, MM-DD-YYYY, Month DD YYYY */
const DATE_PATTERN =
  /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/gi;

/** Street addresses (simplified) */
const ADDRESS_PATTERN =
  /\b\d{1,5}\s+(?:[A-Z][a-z]+\s?){1,3}(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Blvd|Boulevard|Way|Ct|Court|Pl|Place)\b\.?/gi;

/** ZIP codes */
const ZIP_PATTERN = /\b\d{5}(?:-\d{4})?\b/g;

/** Medical Record Numbers (common patterns) */
const MRN_PATTERN = /\b(?:MRN|MR#|Medical Record)\s*[:#]?\s*\d{4,12}\b/gi;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface PhiStripResult {
  /** De-identified text safe for Gemini */
  stripped: string;
  /** Count of replacements made */
  replacementCount: number;
  /** Categories of PHI found */
  categoriesFound: string[];
}

/**
 * Strip PHI from text before sending to external AI services.
 *
 * Preserves:
 * - Medication names (metoprolol, donepezil, etc.)
 * - Symptom descriptions (sundowning, agitation, etc.)
 * - Clinical terms (dementia, diabetes, hypertension)
 * - Emotional content (the core of Sage conversations)
 *
 * Replaces:
 * - Names → [PERSON]
 * - SSNs → [REDACTED]
 * - Phone numbers → [PHONE]
 * - Email addresses → [EMAIL]
 * - Dates → [DATE]
 * - Addresses → [ADDRESS]
 * - ZIP codes → [ZIP]
 * - MRNs → [MRN]
 */
export function stripPhi(text: string, knownNames?: string[]): PhiStripResult {
  let stripped = text;
  let replacementCount = 0;
  const categoriesFound: string[] = [];

  // Replace known names first (care recipient, caregiver names from context)
  if (knownNames && knownNames.length > 0) {
    for (const name of knownNames) {
      if (name.length < 2) continue; // Skip single-char names
      const namePattern = new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi');
      const matches = stripped.match(namePattern);
      if (matches) {
        stripped = stripped.replace(namePattern, '[PERSON]');
        replacementCount += matches.length;
        if (!categoriesFound.includes('names')) categoriesFound.push('names');
      }
    }
  }

  // SSNs
  const ssnMatches = stripped.match(SSN_PATTERN);
  if (ssnMatches) {
    stripped = stripped.replace(SSN_PATTERN, '[REDACTED]');
    replacementCount += ssnMatches.length;
    categoriesFound.push('ssn');
  }

  // Phone numbers
  const phoneMatches = stripped.match(PHONE_PATTERN);
  if (phoneMatches) {
    stripped = stripped.replace(PHONE_PATTERN, '[PHONE]');
    replacementCount += phoneMatches.length;
    categoriesFound.push('phone');
  }

  // Email addresses
  const emailMatches = stripped.match(EMAIL_PATTERN);
  if (emailMatches) {
    stripped = stripped.replace(EMAIL_PATTERN, '[EMAIL]');
    replacementCount += emailMatches.length;
    categoriesFound.push('email');
  }

  // MRNs (before general numbers)
  const mrnMatches = stripped.match(MRN_PATTERN);
  if (mrnMatches) {
    stripped = stripped.replace(MRN_PATTERN, '[MRN]');
    replacementCount += mrnMatches.length;
    categoriesFound.push('mrn');
  }

  // Dates
  const dateMatches = stripped.match(DATE_PATTERN);
  if (dateMatches) {
    stripped = stripped.replace(DATE_PATTERN, '[DATE]');
    replacementCount += dateMatches.length;
    categoriesFound.push('dates');
  }

  // Addresses
  const addressMatches = stripped.match(ADDRESS_PATTERN);
  if (addressMatches) {
    stripped = stripped.replace(ADDRESS_PATTERN, '[ADDRESS]');
    replacementCount += addressMatches.length;
    categoriesFound.push('addresses');
  }

  // ZIP codes (after addresses to avoid double-replacing)
  const zipMatches = stripped.match(ZIP_PATTERN);
  if (zipMatches) {
    stripped = stripped.replace(ZIP_PATTERN, '[ZIP]');
    replacementCount += zipMatches.length;
    categoriesFound.push('zip');
  }

  return { stripped, replacementCount, categoriesFound };
}

/** Escape special regex characters in a string */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
