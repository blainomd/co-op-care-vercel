/**
 * Memory Sync — Client-side profile persistence manager
 *
 * Bridges localStorage (instant) with server-side PostgreSQL (durable).
 * Handles the full lifecycle:
 *
 *   1. On page load → try to hydrate from server (if signed in)
 *   2. On profile change → save to localStorage instantly, debounce sync to server
 *   3. On sign-in → merge server profile with any local data (server wins for conflicts)
 *   4. On session end → compress conversation into memory summary, sync to server
 *
 * Design: localStorage is the fast cache, server is the source of truth.
 * The user NEVER waits for a network call to see their profile.
 */
import type { UserProfile } from '@client/features/sage/engine/SageEngine';
import { loadProfile, saveProfile } from '@client/features/sage/engine/SageEngine';

const API_BASE = '/api/memory';
const SYNC_DEBOUNCE_MS = 3000; // Wait 3s after last change before syncing

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let currentUserId: string | null = null;

// ─── Server Communication ───────────────────────────────────────────

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/profile/${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return serverToLocal(data);
  } catch {
    // Server unavailable — use localStorage only
    return null;
  }
}

async function pushProfile(userId: string, profile: UserProfile): Promise<void> {
  try {
    await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localToServer(userId, profile)),
    });
  } catch {
    // Will retry on next debounce cycle
    console.warn('[MemorySync] Failed to push profile — will retry');
  }
}

async function pushMemorySummary(
  userId: string,
  summary: string,
  facts: Array<{ category: string; fact: string; confidence: number; sourceDate: string }>,
  messageCount: number,
): Promise<void> {
  try {
    await fetch(`${API_BASE}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, summary, facts, messageCount }),
    });
  } catch {
    console.warn('[MemorySync] Failed to push memory summary');
  }
}

// ─── Data Transformers ──────────────────────────────────────────────

/** Convert server profile format → client UserProfile */
function serverToLocal(server: Record<string, unknown>): UserProfile {
  return {
    careRecipient: server.careRecipient as UserProfile['careRecipient'],
    caregiverContext: server.caregiverCtx as UserProfile['caregiverContext'],
    network: server.network as UserProfile['network'],
    lastMiniCII: server.lastMiniCII as UserProfile['lastMiniCII'],
    lastCRI: server.lastCRI as UserProfile['lastCRI'],
    seeds: server.seeds as UserProfile['seeds'],
    conversationCount: (server.conversationCount as number) ?? 0,
    topDomains: (server.topDomains as Record<string, number>) ?? {},
    referralCount: (server.referralCount as number) ?? 0,
    lastVisit: new Date().toISOString(),
  };
}

/** Convert client UserProfile → server format */
function localToServer(userId: string, profile: UserProfile): Record<string, unknown> {
  return {
    userId,
    careRecipient: profile.careRecipient ?? {},
    caregiverCtx: profile.caregiverContext ?? {},
    network: profile.network ?? [],
    lastMiniCII: profile.lastMiniCII ?? null,
    lastCRI: profile.lastCRI ?? null,
    seeds: profile.seeds ?? { total: 0, history: [] },
    conversationCount: profile.conversationCount ?? 0,
    topDomains: profile.topDomains ?? {},
    referralCount: profile.referralCount ?? 0,
  };
}

// ─── Merge Logic ────────────────────────────────────────────────────

/**
 * Merge server profile with local profile.
 * Server wins for scalar fields; arrays are unioned.
 */
function mergeProfiles(server: UserProfile, local: UserProfile): UserProfile {
  const merged: UserProfile = {
    ...local,
    ...server,
    // Array fields: union
    careRecipient: {
      ...(local.careRecipient ?? {}),
      ...(server.careRecipient ?? {}),
      conditions: [
        ...new Set([
          ...(local.careRecipient?.conditions ?? []),
          ...(server.careRecipient?.conditions ?? []),
        ]),
      ],
      medications: [
        ...new Set([
          ...(local.careRecipient?.medications ?? []),
          ...(server.careRecipient?.medications ?? []),
        ]),
      ],
      riskFlags: [
        ...new Set([
          ...(local.careRecipient?.riskFlags ?? []),
          ...(server.careRecipient?.riskFlags ?? []),
        ]),
      ],
    },
    // Network: merge by name
    network: mergeNetworkMembers(local.network ?? [], server.network ?? []),
    // Counts: take the higher value
    conversationCount: Math.max(local.conversationCount ?? 0, server.conversationCount ?? 0),
    referralCount: Math.max(local.referralCount ?? 0, server.referralCount ?? 0),
    // Seeds: take whichever has more
    seeds: (server.seeds?.total ?? 0) >= (local.seeds?.total ?? 0) ? server.seeds : local.seeds,
  };

  return merged;
}

function mergeNetworkMembers(
  a: NonNullable<UserProfile['network']>,
  b: NonNullable<UserProfile['network']>,
): NonNullable<UserProfile['network']> {
  const byName = new Map<string, (typeof a)[0]>();
  for (const m of a) {
    if (m.name) byName.set(m.name.toLowerCase(), m);
  }
  for (const m of b) {
    if (m.name) {
      const existing = byName.get(m.name.toLowerCase());
      byName.set(m.name.toLowerCase(), existing ? { ...existing, ...m } : m);
    }
  }
  return Array.from(byName.values());
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Initialize memory sync for a user.
 * Call on sign-in or when userId becomes available.
 */
export async function initMemorySync(userId: string): Promise<UserProfile> {
  currentUserId = userId;

  // Load from both sources
  const [serverProfile, localProfile] = await Promise.all([
    fetchProfile(userId),
    Promise.resolve(loadProfile()),
  ]);

  if (serverProfile) {
    // Merge server + local, save the result everywhere
    const merged = mergeProfiles(serverProfile, localProfile);
    saveProfile(merged);
    // Push merged back to server (in case local had new data)
    pushProfile(userId, merged);
    return merged;
  }

  // No server profile — push local to server for first time
  if (localProfile.conversationCount > 0 || localProfile.careRecipient?.name) {
    pushProfile(userId, localProfile);
  }
  return localProfile;
}

/**
 * Sync profile to server (debounced).
 * Call after any profile change — it will batch and deduplicate.
 */
export function syncProfileToServer(profile?: UserProfile): void {
  if (!currentUserId) return;

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const p = profile ?? loadProfile();
    pushProfile(currentUserId!, p);
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Build and push a memory summary at end of session.
 * This is what makes Sage "remember" across sessions.
 */
export function buildMemorySummary(
  messages: Array<{ role: string; content: string }>,
  profile: UserProfile,
): string {
  const parts: string[] = [];

  // Who they are
  if (profile.careRecipient?.name) {
    parts.push(
      `Caring for ${profile.careRecipient.name}` +
        (profile.careRecipient.relationship ? ` (${profile.careRecipient.relationship})` : '') +
        (profile.careRecipient.age ? `, age ${profile.careRecipient.age}` : ''),
    );
  }

  // Conditions
  if (profile.careRecipient?.conditions?.length) {
    parts.push(`Conditions: ${profile.careRecipient.conditions.join(', ')}`);
  }

  // Living situation
  if (profile.careRecipient?.livingSituation) {
    parts.push(`Lives: ${profile.careRecipient.livingSituation}`);
  }

  // Caregiver context
  if (profile.caregiverContext?.employment) {
    parts.push(`Caregiver employment: ${profile.caregiverContext.employment}`);
  }

  // Network
  if (profile.network?.length) {
    const helpers = profile.network
      .filter((m) => m.name)
      .map((m) => `${m.name} (${m.relationship ?? 'helper'})`)
      .join(', ');
    if (helpers) parts.push(`Care circle: ${helpers}`);
  }

  // Assessment scores
  if (profile.lastMiniCII) {
    parts.push(`Caregiver wellness: ${profile.lastMiniCII.total}/30 (${profile.lastMiniCII.zone})`);
  }

  // Key topics from this session
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .slice(-10);

  if (userMessages.length > 0) {
    parts.push(`Recent topics: ${userMessages.slice(-3).join(' | ')}`);
  }

  return parts.join('. ') + '.';
}

/**
 * Save session memory to server
 */
export async function saveSessionMemory(
  messages: Array<{ role: string; content: string }>,
  profile: UserProfile,
): Promise<void> {
  if (!currentUserId) return;

  const summary = buildMemorySummary(messages, profile);

  // Extract structured facts
  const facts: Array<{ category: string; fact: string; confidence: number; sourceDate: string }> =
    [];
  const now = new Date().toISOString();

  if (profile.careRecipient?.name) {
    facts.push({
      category: 'care_recipient',
      fact: `Name: ${profile.careRecipient.name}`,
      confidence: 1,
      sourceDate: now,
    });
  }
  if (profile.careRecipient?.relationship) {
    facts.push({
      category: 'care_recipient',
      fact: `Relationship: ${profile.careRecipient.relationship}`,
      confidence: 1,
      sourceDate: now,
    });
  }
  if (profile.careRecipient?.conditions?.length) {
    for (const c of profile.careRecipient.conditions) {
      facts.push({
        category: 'medical',
        fact: `Condition: ${c}`,
        confidence: 0.9,
        sourceDate: now,
      });
    }
  }
  if (profile.caregiverContext?.employment) {
    facts.push({
      category: 'caregiver',
      fact: `Employment: ${profile.caregiverContext.employment}`,
      confidence: 0.9,
      sourceDate: now,
    });
  }

  await pushMemorySummary(currentUserId, summary, facts, messages.length);
}

/**
 * Get the current memory summary to inject into Sage's context.
 * This is what makes Sage start "warm" instead of cold.
 */
export async function getMemoryContext(userId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/summary/${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.memorySummary ?? null;
  } catch {
    return null;
  }
}
