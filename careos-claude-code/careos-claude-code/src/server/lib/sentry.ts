/**
 * Sentry Error Tracking — Server-side initialization
 * Install: npm install @sentry/node
 * Set SENTRY_DSN env var to enable
 */

let initialized = false;

export async function initServerSentry(): Promise<void> {
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn || initialized) return;

  try {
    const Sentry = await (import('@sentry/node' as string) as Promise<Record<string, unknown>>);
    const init = Sentry['init'] as ((opts: Record<string, unknown>) => void) | undefined;
    if (typeof init === 'function') {
      init({
        dsn,
        environment: process.env['NODE_ENV'] ?? 'development',
        tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.1 : 1.0,
      });
      initialized = true;
    }
  } catch {
    // Sentry not installed — silently skip
  }
}
