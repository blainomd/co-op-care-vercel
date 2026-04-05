/**
 * API Fallback Layer — wraps fetch calls with localStorage fallback
 *
 * When the backend is unavailable (static Vercel deploy), operations
 * gracefully degrade to localStorage. When the backend is available,
 * it's the source of truth.
 */

let backendAvailable: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const res = await fetch('/api/v1/health', { method: 'GET', signal: AbortSignal.timeout(3000) });
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  // Re-check after 60s
  setTimeout(() => {
    backendAvailable = null;
  }, 60_000);
  return backendAvailable;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  fallbackKey?: string,
): Promise<T | null> {
  const available = await checkBackend();

  if (available) {
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) return res.json();
    } catch {
      // Fall through to localStorage
    }
  }

  // Fallback: save to localStorage
  if (fallbackKey) {
    const existing = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
    existing.push({ ...(body as object), _savedAt: new Date().toISOString() });
    localStorage.setItem(fallbackKey, JSON.stringify(existing));
  }

  return null;
}

export async function apiGet<T>(
  path: string,
  fallbackKey?: string,
  fallbackDefault?: T,
): Promise<T> {
  const available = await checkBackend();

  if (available) {
    try {
      const res = await fetch(path, { credentials: 'include' });
      if (res.ok) return res.json();
    } catch {
      // Fall through
    }
  }

  // Fallback: read from localStorage
  if (fallbackKey) {
    const stored = localStorage.getItem(fallbackKey);
    if (stored) return JSON.parse(stored);
  }

  return fallbackDefault as T;
}

export function isBackendAvailable(): boolean {
  return backendAvailable === true;
}
