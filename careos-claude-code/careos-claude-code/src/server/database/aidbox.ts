/**
 * Aidbox FHIR R4 REST Client
 * Clinical database: FHIR resources (Patient, Encounter, Observation, etc.)
 * Uses OAuth 2.0 client credentials for server-to-server auth.
 */
import { config } from '../config/settings.js';
import { logger } from '../common/logger.js';
import { ExternalServiceError } from '../common/errors.js';

interface AidboxTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (accessToken && now < tokenExpiresAt - 30_000) {
    return accessToken;
  }

  const response = await fetch(`${config.aidbox.url}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.aidbox.clientId,
      client_secret: config.aidbox.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new ExternalServiceError('aidbox_auth');
  }

  const data = (await response.json()) as AidboxTokenResponse;
  accessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;
  return accessToken;
}

async function aidboxFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const url = `${config.aidbox.url}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  return response;
}

/**
 * Aidbox FHIR Client — CRUD operations for FHIR R4 resources
 */
export const aidboxClient = {
  async read<T>(resourceType: string, id: string): Promise<T> {
    const response = await aidboxFetch(`/fhir/${resourceType}/${id}`);
    if (!response.ok) {
      throw new ExternalServiceError(`aidbox_read_${resourceType}`);
    }
    return response.json() as Promise<T>;
  },

  async search<T>(resourceType: string, params: Record<string, string> = {}): Promise<T> {
    const qs = new URLSearchParams(params).toString();
    const path = qs ? `/fhir/${resourceType}?${qs}` : `/fhir/${resourceType}`;
    const response = await aidboxFetch(path);
    if (!response.ok) {
      throw new ExternalServiceError(`aidbox_search_${resourceType}`);
    }
    return response.json() as Promise<T>;
  },

  async create<T>(resourceType: string, resource: Record<string, unknown>): Promise<T> {
    const response = await aidboxFetch(`/fhir/${resourceType}`, {
      method: 'POST',
      body: JSON.stringify(resource),
    });
    if (!response.ok) {
      const body = await response.text();
      logger.error({ resourceType, status: response.status, body }, 'Aidbox create failed');
      throw new ExternalServiceError(`aidbox_create_${resourceType}`);
    }
    return response.json() as Promise<T>;
  },

  async update<T>(resourceType: string, id: string, resource: Record<string, unknown>): Promise<T> {
    const response = await aidboxFetch(`/fhir/${resourceType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...resource, id }),
    });
    if (!response.ok) {
      throw new ExternalServiceError(`aidbox_update_${resourceType}`);
    }
    return response.json() as Promise<T>;
  },

  async delete(resourceType: string, id: string): Promise<void> {
    const response = await aidboxFetch(`/fhir/${resourceType}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 404) {
      throw new ExternalServiceError(`aidbox_delete_${resourceType}`);
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${config.aidbox.url}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};

export async function initAidbox(): Promise<void> {
  const healthy = await aidboxClient.healthCheck();
  if (healthy) {
    logger.info({ url: config.aidbox.url }, 'Aidbox FHIR R4 connected');
  } else {
    logger.warn({ url: config.aidbox.url }, 'Aidbox not reachable — clinical sync will retry');
  }
}
