/**
 * Analytics — Thin wrapper around Plausible custom events
 *
 * Plausible is loaded via script tag in index.html.
 * This wrapper provides type safety and a no-op fallback.
 */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export function track(event: string, props?: Record<string, string | number>) {
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Silently ignore analytics errors
  }
}
