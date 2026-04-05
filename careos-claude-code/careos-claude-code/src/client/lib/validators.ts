/**
 * Shared Validation Utilities
 *
 * Reusable validation functions for forms across CareOS.
 * All validators return { valid: boolean; error?: string } for consistent handling.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ── Email ──────────────────────────────────────────────────
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateEmail(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, error: 'Email is required' };
  if (!EMAIL_RE.test(value)) return { valid: false, error: 'Please enter a valid email address' };
  return { valid: true };
}

// ── Phone ──────────────────────────────────────────────────
// Accepts: (303) 555-1234, 303-555-1234, 3035551234, +1 303 555 1234
const PHONE_RE = /^[+]?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

export function validatePhone(value: string): ValidationResult {
  if (!value.trim()) return { valid: true }; // Phone is typically optional
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    return { valid: false, error: 'Phone number must be 10 digits' };
  }
  if (!PHONE_RE.test(value.trim())) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }
  return { valid: true };
}

/** Format phone for display: (303) 555-1234 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  const d = digits.startsWith('1') ? digits.slice(1) : digits;
  if (d.length !== 10) return value;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// ── ZIP Code ───────────────────────────────────────────────
const ZIP_RE = /^[0-9]{5}(-[0-9]{4})?$/;

export function validateZipCode(value: string): ValidationResult {
  if (!value.trim()) return { valid: false, error: 'ZIP code is required' };
  if (!ZIP_RE.test(value.trim())) {
    return { valid: false, error: 'Please enter a valid 5-digit ZIP code' };
  }
  return { valid: true };
}

// ── Password ───────────────────────────────────────────────
export interface PasswordValidation extends ValidationResult {
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
  };
}

export function validatePassword(value: string): PasswordValidation {
  const checks = {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
  };
  const valid = Object.values(checks).every(Boolean);
  return {
    valid,
    checks,
    error: valid
      ? undefined
      : 'Password must be at least 8 characters with uppercase, lowercase, and a number',
  };
}

// ── Required Field ─────────────────────────────────────────
export function validateRequired(value: string, fieldName = 'This field'): ValidationResult {
  if (!value.trim()) return { valid: false, error: `${fieldName} is required` };
  return { valid: true };
}

// ── Min/Max Length ──────────────────────────────────────────
export function validateLength(
  value: string,
  { min, max, fieldName = 'This field' }: { min?: number; max?: number; fieldName?: string },
): ValidationResult {
  if (min && value.length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  if (max && value.length > max) {
    return { valid: false, error: `${fieldName} must be no more than ${max} characters` };
  }
  return { valid: true };
}

// ── Date ───────────────────────────────────────────────────
export function validateFutureDate(value: string, fieldName = 'Date'): ValidationResult {
  if (!value) return { valid: false, error: `${fieldName} is required` };
  const date = new Date(value);
  if (isNaN(date.getTime())) return { valid: false, error: `Please enter a valid date` };
  if (date < new Date()) return { valid: false, error: `${fieldName} must be in the future` };
  return { valid: true };
}

// ── Hours / Numeric ────────────────────────────────────────
export function validatePositiveNumber(
  value: number | string,
  fieldName = 'Value',
): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: `${fieldName} must be a positive number` };
  }
  return { valid: true };
}

// ── Composite Form Validation ──────────────────────────────
export type FieldValidators = Record<string, () => ValidationResult>;

/**
 * Run all field validators and return combined results.
 * Returns { valid: true } only if ALL fields pass.
 */
export function validateForm(validators: FieldValidators): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  for (const [field, validate] of Object.entries(validators)) {
    const result = validate();
    if (!result.valid && result.error) {
      errors[field] = result.error;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
