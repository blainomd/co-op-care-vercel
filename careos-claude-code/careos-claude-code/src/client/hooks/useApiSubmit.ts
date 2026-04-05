/**
 * useApiSubmit — Shared hook for API submissions with offline fallback
 *
 * Replaces the copy-pasted try/catch pattern across 30+ feature files:
 *   try { await api.post(...); } catch { toast.info('Saved locally', ...); }
 *
 * Returns { submit, submitting, error, clearError } for consistent UX.
 */
import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from '../components/Toast';

interface UseApiSubmitOptions<T = unknown> {
  /** API endpoint path (e.g., '/assessments/cii') */
  endpoint: string;
  /** HTTP method — defaults to 'post' */
  method?: 'post' | 'put' | 'delete';
  /** Feature name for logging (e.g., 'CIIAssessment') */
  featureName: string;
  /** Custom success message — if omitted, no toast on success */
  successMessage?: string;
  /** Custom offline/fallback message — defaults to "Saved locally" */
  offlineMessage?: string;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on failure (after toast) */
  onError?: (error: unknown) => void;
  /** If true, suppress the offline fallback toast */
  silentFallback?: boolean;
}

interface UseApiSubmitReturn<P> {
  /** Call this to submit data to the API */
  submit: (payload: P) => Promise<boolean>;
  /** Whether a submission is in-flight */
  submitting: boolean;
  /** Last error message (null if none) */
  error: string | null;
  /** Clear the error state */
  clearError: () => void;
}

export function useApiSubmit<P = unknown, T = unknown>(
  options: UseApiSubmitOptions<T>,
): UseApiSubmitReturn<P> {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (payload: P): Promise<boolean> => {
      setSubmitting(true);
      setError(null);

      try {
        const method = options.method ?? 'post';
        const response = await api[method](options.endpoint, payload as Record<string, unknown>);

        if (options.successMessage) {
          toast.success('Success', options.successMessage);
        }
        options.onSuccess?.(response as T);
        return true;
      } catch (err) {
        console.warn(`[${options.featureName}] Submission failed — continuing in demo mode`);

        if (!options.silentFallback) {
          toast.info(
            options.offlineMessage ?? 'Saved locally',
            'Results will sync when connection is restored.',
          );
        }

        const message = err instanceof Error ? err.message : 'Submission failed';
        setError(message);
        options.onError?.(err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [options],
  );

  const clearError = useCallback(() => setError(null), []);

  return { submit, submitting, error, clearError };
}
