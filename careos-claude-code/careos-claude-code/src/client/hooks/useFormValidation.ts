/**
 * useFormValidation — Hook for declarative form validation
 *
 * Provides:
 * - Per-field error state
 * - Touch tracking (only show errors after field is interacted with)
 * - Validate-on-blur behavior
 * - Form-level validation for submit
 *
 * Usage:
 *   const { errors, touched, validate, validateAll, fieldProps } = useFormValidation({
 *     email: (v) => validateEmail(v),
 *     phone: (v) => validatePhone(v),
 *   });
 *
 *   <input {...fieldProps('email', email)} />
 *   {errors.email && <p className="text-zone-red text-xs">{errors.email}</p>}
 *
 *   const handleSubmit = () => {
 *     if (!validateAll({ email, phone })) return;
 *     // proceed...
 *   };
 */
import { useState, useCallback } from 'react';
import type { ValidationResult } from '../lib/validators';

type ValidatorFn = (value: string) => ValidationResult;

export function useFormValidation<T extends Record<string, ValidatorFn>>(validators: T) {
  type Fields = keyof T & string;

  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<Fields, boolean>>>({});

  /** Validate a single field, updating error state */
  const validate = useCallback(
    (field: Fields, value: string): boolean => {
      const validator = validators[field];
      if (!validator) return true;
      const result = validator(value);
      setErrors((prev) => {
        const next = { ...prev };
        if (result.valid) {
          delete next[field];
        } else {
          next[field] = result.error;
        }
        return next;
      });
      return result.valid;
    },
    [validators],
  );

  /** Mark a field as touched (for showing errors only after interaction) */
  const touch = useCallback((field: Fields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /** Validate all fields at once — returns true if all pass */
  const validateAll = useCallback(
    (values: Record<Fields, string>): boolean => {
      let allValid = true;
      const newErrors: Partial<Record<Fields, string>> = {};
      const newTouched: Partial<Record<Fields, boolean>> = {};

      for (const field of Object.keys(validators) as Fields[]) {
        const validator = validators[field];
        if (!validator) continue;
        const result = validator(values[field] ?? '');
        newTouched[field] = true;
        if (!result.valid) {
          newErrors[field] = result.error;
          allValid = false;
        }
      }
      setErrors(newErrors);
      setTouched(newTouched);
      return allValid;
    },
    [validators],
  );

  /** Clear all errors and touched state */
  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Convenience: generate onBlur handler for a field.
   * Use with: <input onBlur={() => handleBlur('email', emailValue)} />
   */
  const handleBlur = useCallback(
    (field: Fields, value: string) => {
      touch(field);
      validate(field, value);
    },
    [touch, validate],
  );

  /** Whether a field has an error AND has been touched */
  const showError = useCallback(
    (field: Fields): boolean => {
      return !!(touched[field] && errors[field]);
    },
    [touched, errors],
  );

  return {
    errors,
    touched,
    validate,
    validateAll,
    touch,
    handleBlur,
    showError,
    reset,
  };
}
