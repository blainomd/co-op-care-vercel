/**
 * API Client — Cookie-based HTTP client
 *
 * Uses HttpOnly cookies for auth (set by server on login/register).
 * credentials: 'include' ensures cookies are sent with every request.
 * No tokens are stored in memory — HIPAA-compliant by design.
 */

const API_BASE = '/api/v1';

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
}

let refreshPromise: Promise<void> | null = null;

/**
 * Attempt to refresh the access token via cookie
 */
async function refreshAccessToken(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }
}

/**
 * Core fetch wrapper with cookie auth and error handling
 */
async function apiFetch<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 — attempt cookie-based token refresh once
  if (response.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    try {
      await refreshPromise;
      return apiFetch<T>(path, options, false);
    } catch {
      // Session expired — force logout and redirect to login
      try {
        const { useAuthStore } = await import('../stores/authStore');
        useAuthStore.getState().logout();
      } catch {
        // If store import fails, clear state manually
      }
      throw {
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please sign in again.',
      } as ApiError;
    }
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      statusCode: response.status,
      code: 'UNKNOWN',
      message: response.statusText,
    }))) as ApiError;
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * API client methods
 */
export const api = {
  get<T>(path: string): Promise<T> {
    return apiFetch<T>(path);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: 'DELETE' });
  },
};
