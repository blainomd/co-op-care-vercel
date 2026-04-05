/**
 * Sentry Error Tracking — Client-side initialization
 * Install: npm install @sentry/react @sentry/replay
 * Set VITE_SENTRY_DSN in .env to enable
 */

let initialized = false;

export async function initSentry(): Promise<void> {
  const dsn = import.meta.env['VITE_SENTRY_DSN'] as string | undefined;
  if (!dsn || initialized) return;

  try {
    const Sentry = await (import('@sentry/react' as string) as Promise<Record<string, unknown>>);
    const init = Sentry['init'] as ((opts: Record<string, unknown>) => void) | undefined;
    if (typeof init === 'function') {
      init({
        dsn,
        environment: import.meta.env['MODE'],
        tracesSampleRate: import.meta.env['PROD'] ? 0.1 : 1.0,
      });
      initialized = true;
    }
  } catch {
    // Sentry not installed — silently skip
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) return;
  try {
    (import('@sentry/react' as string) as Promise<Record<string, unknown>>)
      .then((Sentry) => {
        const capture = Sentry['captureException'] as
          | ((e: unknown, ctx?: unknown) => void)
          | undefined;
        if (typeof capture === 'function') capture(error, { extra: context });
      })
      .catch(() => {});
  } catch {
    // noop
  }
}
