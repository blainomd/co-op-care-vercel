# Homepage + Card Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current 7-section homepage with a 6-section editorial story scroll, redesign the Join Flow to 30-second card signup, and rebuild Card+Sage with QR Profile Memory Ring + Dynamic Tile Bank.

**Architecture:** Three screens (Homepage → Join → Card+Sage) with Zustand stores persisted to localStorage. All UI is client-side demo mode — no backend required. Sage onboarding drives progressive profile completion through 8 conversation phases.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS 4.x, Zustand, react-router-dom HashRouter, Vite 6.4

---

## Task 1: Story Cards Constants

**Files:**
- Create: `src/shared/constants/story-cards.ts`

**Step 1: Create the story cards data file**

```typescript
// src/shared/constants/story-cards.ts
/**
 * Story Carousel cards for Homepage — real caregiver archetypes.
 * Each card drives an emotional connection before any signup ask.
 */

export interface StoryCard {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoAlt: string;
  /** Unsplash photo ID or local path */
  photoSrc: string;
  /** Which CTA this story drives */
  cta: 'join' | 'learn';
}

export const STORY_CARDS: StoryCard[] = [
  {
    id: 'maria',
    name: 'Maria',
    role: 'Conductor — coordinating care for her father',
    quote: "I was drowning in spreadsheets and guilt. Now I have neighbors who actually show up.",
    photoAlt: 'Woman in her 40s smiling while sitting with elderly man',
    photoSrc: '/images/stories/maria.jpg',
    cta: 'join',
  },
  {
    id: 'james',
    name: 'James',
    role: 'Neighbor — retired teacher giving 6 hours/week',
    quote: "Retirement was lonely until I started driving Frank to his appointments. Now we're friends.",
    photoAlt: 'Older man laughing while helping another senior into a car',
    photoSrc: '/images/stories/james.jpg',
    cta: 'join',
  },
  {
    id: 'priya',
    name: 'Priya',
    role: 'Worker-Owner — full-time caregiver earning equity',
    quote: "At my last agency I was a number. Here I own a piece of what we're building.",
    photoAlt: 'Young woman in scrubs smiling while holding clipboard',
    photoSrc: '/images/stories/priya.jpg',
    cta: 'learn',
  },
  {
    id: 'tom',
    name: 'Tom',
    role: 'Neighbor — software engineer helping with tech support',
    quote: "Two hours a week setting up iPads. My daughter sees me helping and wants to join too.",
    photoAlt: 'Man helping elderly woman use a tablet',
    photoSrc: '/images/stories/tom.jpg',
    cta: 'join',
  },
];
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit src/shared/constants/story-cards.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/constants/story-cards.ts
git commit -m "feat: add story cards constants for homepage carousel"
```

---

## Task 2: Sage Onboarding Scripts Constants

**Files:**
- Create: `src/shared/constants/sage-onboarding-scripts.ts`

**Step 1: Create the onboarding scripts file**

```typescript
// src/shared/constants/sage-onboarding-scripts.ts
/**
 * Sage onboarding conversation scripts — one per OnboardingPhase.
 * Sage uses these as templates, personalizing with firstName.
 */
import type { OnboardingPhase } from '../../client/stores/signupStore';

export interface SageScript {
  phase: OnboardingPhase;
  greeting: string;
  /** Suggested follow-up buttons */
  followups: { label: string; message: string }[];
  /** Which phase to transition to after this completes */
  nextPhase: OnboardingPhase | null;
}

export const SAGE_SCRIPTS: Record<OnboardingPhase, SageScript> = {
  fresh: {
    phase: 'fresh',
    greeting: "Hi! I'm Sage, your care companion. I help families coordinate care for the people they love. What brings you here today?",
    followups: [
      { label: "I need help caring for someone", message: "I need help caring for a family member" },
      { label: "I want to help neighbors", message: "I want to give care in my community" },
      { label: "Just exploring", message: "I'm just looking around to learn more" },
    ],
    nextPhase: 'exploring',
  },
  exploring: {
    phase: 'exploring',
    greeting: "I'd love to understand what you need. Are you looking for help caring for someone, or are you interested in giving care in your community?",
    followups: [
      { label: "Finding care for a loved one", message: "I'm coordinating care for a family member" },
      { label: "Giving care as a neighbor", message: "I want to volunteer or work as a caregiver" },
      { label: "Both — I give and receive", message: "I both care for someone and want to help others" },
    ],
    nextPhase: 'profile_intent',
  },
  profile_intent: {
    phase: 'profile_intent',
    greeting: "Got it! A few quick questions so I can personalize your experience. What roles interest you?",
    followups: [
      { label: "Conductor — coordinate care", message: "I want to be a Conductor and coordinate care" },
      { label: "Neighbor — give care nearby", message: "I want to be a Neighbor and help people near me" },
      { label: "Both roles", message: "I'm interested in both coordinating and giving care" },
    ],
    nextPhase: 'profile_roles',
  },
  profile_roles: {
    phase: 'profile_roles',
    greeting: "Great choice! co-op.care is a cooperative — members own it together. Would you like to learn how community ownership works here?",
    followups: [
      { label: "Yes, tell me more", message: "Tell me about cooperative ownership" },
      { label: "Maybe later", message: "I'll learn about that later" },
    ],
    nextPhase: 'profile_community',
  },
  profile_community: {
    phase: 'profile_community',
    greeting: "One last thing — I can remember our conversations so I get smarter about helping you over time. Your data stays private and you can delete it anytime. Would you like me to remember you?",
    followups: [
      { label: "Yes, remember me", message: "Yes, you can remember our conversations" },
      { label: "Just this session", message: "Only remember things for this session" },
    ],
    nextPhase: 'memory_consent',
  },
  memory_consent: {
    phase: 'memory_consent',
    greeting: "You're all set! Your Comfort Card is your identity in the co-op. Share the QR code to invite neighbors and earn Time Bank hours. What would you like to do first?",
    followups: [
      { label: "Show me my card", message: "Show me my Comfort Card" },
      { label: "Find help nearby", message: "Are there neighbors near me who can help?" },
      { label: "How does Time Bank work?", message: "Explain how the Time Bank works" },
    ],
    nextPhase: 'onboarded',
  },
  onboarded: {
    phase: 'onboarded',
    greeting: "Welcome back, {firstName}! How can I help you today?",
    followups: [
      { label: "Check my Time Bank", message: "What's my Time Bank balance?" },
      { label: "Find help nearby", message: "Who's available to help near me?" },
      { label: "Share my card", message: "I want to invite someone to co-op.care" },
    ],
    nextPhase: null,
  },
  returning: {
    phase: 'returning',
    greeting: "Hey {firstName}, good to see you again! What can I help with?",
    followups: [
      { label: "Check my Time Bank", message: "What's my Time Bank balance?" },
      { label: "Find help nearby", message: "Who's available to help near me?" },
      { label: "Update my profile", message: "I want to update my information" },
    ],
    nextPhase: null,
  },
};
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit src/shared/constants/sage-onboarding-scripts.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/shared/constants/sage-onboarding-scripts.ts
git commit -m "feat: add Sage onboarding conversation scripts"
```

---

## Task 3: Extend signupStore with New Fields

**Files:**
- Modify: `src/client/stores/signupStore.ts`
- Create: `src/client/stores/__tests__/signupStore.test.ts`

**Step 1: Write failing tests for new store fields and computeProfileCompleteness**

```typescript
// src/client/stores/__tests__/signupStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSignupStore } from '../signupStore';

// Reset store between tests
beforeEach(() => {
  localStorage.clear();
  useSignupStore.setState({
    cardHolder: null,
    referrals: [],
  });
});

describe('signupStore — card creation', () => {
  it('creates a card with all new default fields', () => {
    const card = useSignupStore.getState().createCard({
      firstName: 'Maria',
      intent: 'seeking_care',
    });

    expect(card.firstName).toBe('Maria');
    expect(card.intent).toBe('seeking_care');
    expect(card.memberId).toMatch(/^COOP-\d{4}-\d{4}$/);
    expect(card.walletAdded).toBe(false);
    expect(card.pwaInstalled).toBe(false);
    expect(card.memoryConsent).toBe('pending');
    expect(card.onboardingPhase).toBe('fresh');
    expect(card.communityRoles).toEqual([]);
    expect(card.bgCheck).toEqual({ status: 'not_started' });
    // New fields
    expect(card.miniCiiScore).toBeUndefined();
    expect(card.lmnEnrolled).toBe(false);
    expect(card.proximityTier).toBeUndefined();
    expect(card.zipCode).toBeUndefined();
  });
});

describe('signupStore — profile completeness', () => {
  it('returns 0 for no card', () => {
    const result = useSignupStore.getState().computeProfileCompleteness();
    expect(result).toEqual({ percentage: 0, filledSegments: 0, totalSegments: 8, segments: {} });
  });

  it('computes percentage from 8 ring segments', () => {
    useSignupStore.getState().createCard({
      firstName: 'Maria',
      phone: '303-555-1234',
      intent: 'seeking_care',
    });

    const result = useSignupStore.getState().computeProfileCompleteness();
    // Name = filled, Contact (phone) = filled, Intent = filled
    // Roles, Mini CII, Consent, Bg Check, LMN = not filled
    expect(result.filledSegments).toBe(3);
    expect(result.totalSegments).toBe(8);
    expect(result.percentage).toBeCloseTo(37.5);
    expect(result.segments.name).toBe(true);
    expect(result.segments.contact).toBe(true);
    expect(result.segments.intent).toBe(true);
    expect(result.segments.roles).toBe(false);
    expect(result.segments.miniCii).toBe(false);
    expect(result.segments.consent).toBe(false);
    expect(result.segments.bgCheck).toBe(false);
    expect(result.segments.lmn).toBe(false);
  });

  it('counts consent as filled when granted', () => {
    useSignupStore.getState().createCard({ firstName: 'Tom', intent: 'giving_care' });
    useSignupStore.getState().setMemoryConsent('granted');

    const result = useSignupStore.getState().computeProfileCompleteness();
    expect(result.segments.consent).toBe(true);
  });

  it('counts bgCheck as filled when status is clear', () => {
    useSignupStore.getState().createCard({ firstName: 'Tom', intent: 'giving_care' });
    useSignupStore.getState().setBgCheck({ status: 'clear' });

    const result = useSignupStore.getState().computeProfileCompleteness();
    expect(result.segments.bgCheck).toBe(true);
  });

  it('counts lmn as filled when enrolled', () => {
    useSignupStore.getState().createCard({ firstName: 'Tom', intent: 'seeking_care' });
    useSignupStore.getState().setLmnEnrolled(true);

    const result = useSignupStore.getState().computeProfileCompleteness();
    expect(result.segments.lmn).toBe(true);
  });
});

describe('signupStore — new setters', () => {
  beforeEach(() => {
    useSignupStore.getState().createCard({ firstName: 'Test', intent: 'seeking_care' });
  });

  it('setMiniCiiScore updates score', () => {
    useSignupStore.getState().setMiniCiiScore(18);
    expect(useSignupStore.getState().cardHolder?.miniCiiScore).toBe(18);
  });

  it('setLmnEnrolled updates enrollment', () => {
    useSignupStore.getState().setLmnEnrolled(true);
    expect(useSignupStore.getState().cardHolder?.lmnEnrolled).toBe(true);
  });

  it('setZipCode updates zip', () => {
    useSignupStore.getState().setZipCode('80302');
    expect(useSignupStore.getState().cardHolder?.zipCode).toBe('80302');
  });

  it('setProximityTier updates tier', () => {
    useSignupStore.getState().setProximityTier('walking');
    expect(useSignupStore.getState().cardHolder?.proximityTier).toBe('walking');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/client/stores/__tests__/signupStore.test.ts`
Expected: FAIL — `setMiniCiiScore`, `setLmnEnrolled`, `setZipCode`, `setProximityTier`, `computeProfileCompleteness` not defined

**Step 3: Add new fields and methods to signupStore**

Add to `ComfortCardHolder` interface (after `bgCheck` on line 53):

```typescript
  miniCiiScore?: number;
  lmnEnrolled: boolean;
  proximityTier?: 'walking' | 'biking' | 'neighborhood' | 'community';
  zipCode?: string;
```

Add to `SignupState` interface (after `addReferral`):

```typescript
  setMiniCiiScore: (score: number) => void;
  setLmnEnrolled: (enrolled: boolean) => void;
  setZipCode: (zip: string) => void;
  setProximityTier: (tier: 'walking' | 'biking' | 'neighborhood' | 'community') => void;
  computeProfileCompleteness: () => ProfileCompleteness;
```

Add new type before `SignupState`:

```typescript
export interface ProfileSegments {
  name: boolean;
  contact: boolean;
  intent: boolean;
  roles: boolean;
  miniCii: boolean;
  consent: boolean;
  bgCheck: boolean;
  lmn: boolean;
}

export interface ProfileCompleteness {
  percentage: number;
  filledSegments: number;
  totalSegments: number;
  segments: ProfileSegments;
}
```

In `createCard`, add defaults:

```typescript
      lmnEnrolled: false,
```

Add new methods to the store (after `getReferrerName`):

```typescript
  setMiniCiiScore: (score: number) => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, miniCiiScore: score };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  setLmnEnrolled: (enrolled: boolean) => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, lmnEnrolled: enrolled };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  setZipCode: (zip: string) => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, zipCode: zip };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  setProximityTier: (tier: 'walking' | 'biking' | 'neighborhood' | 'community') => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, proximityTier: tier };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  computeProfileCompleteness: () => {
    const { cardHolder } = get();
    if (!cardHolder) {
      return { percentage: 0, filledSegments: 0, totalSegments: 8, segments: {} as ProfileSegments };
    }

    const segments: ProfileSegments = {
      name: !!cardHolder.firstName,
      contact: !!(cardHolder.phone || cardHolder.email),
      intent: !!cardHolder.intent,
      roles: cardHolder.communityRoles.length > 0,
      miniCii: cardHolder.miniCiiScore !== undefined,
      consent: cardHolder.memoryConsent === 'granted',
      bgCheck: cardHolder.bgCheck.status === 'clear',
      lmn: cardHolder.lmnEnrolled,
    };

    const filled = Object.values(segments).filter(Boolean).length;
    return {
      percentage: (filled / 8) * 100,
      filledSegments: filled,
      totalSegments: 8,
      segments,
    };
  },
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/client/stores/__tests__/signupStore.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/client/stores/signupStore.ts src/client/stores/__tests__/signupStore.test.ts
git commit -m "feat: extend signupStore with profile completeness, miniCII, LMN, proximity"
```

---

## Task 4: useGeolocation Hook

**Files:**
- Create: `src/client/hooks/useGeolocation.ts`

**Step 1: Create the geolocation hook**

```typescript
// src/client/hooks/useGeolocation.ts
/**
 * useGeolocation — wraps navigator.geolocation with state.
 * Returns lat/lng/error/loading. Used by NearbyMap + proximity tiles.
 */
import { useState, useEffect } from 'react';

export interface GeoPosition {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(enabled = true): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      if (!navigator.geolocation) setError('Geolocation not supported');
      return;
    }

    setLoading(true);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { position, error, loading };
}
```

**Step 2: Commit**

```bash
git add src/client/hooks/useGeolocation.ts
git commit -m "feat: add useGeolocation hook for proximity features"
```

---

## Task 5: useProfileCompleteness Hook

**Files:**
- Create: `src/client/hooks/useProfileCompleteness.ts`

**Step 1: Create the hook**

```typescript
// src/client/hooks/useProfileCompleteness.ts
/**
 * useProfileCompleteness — reactive wrapper around store method.
 * Drives the QR Profile Memory Ring segments.
 */
import { useSignupStore } from '../stores/signupStore';

export function useProfileCompleteness() {
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const compute = useSignupStore((s) => s.computeProfileCompleteness);

  // Re-computes whenever cardHolder changes
  return compute();
}
```

**Step 2: Commit**

```bash
git add src/client/hooks/useProfileCompleteness.ts
git commit -m "feat: add useProfileCompleteness hook for QR ring"
```

---

## Task 6: useTilePriority Hook

**Files:**
- Create: `src/client/hooks/useTilePriority.ts`

**Step 1: Create the tile priority scoring hook**

```typescript
// src/client/hooks/useTilePriority.ts
/**
 * useTilePriority — scores and sorts Dynamic Tile Bank tiles.
 *
 * Priority algorithm (from design doc):
 *   tilePriority = baseWeight
 *     + (isNewUser ? 20 : 0)
 *     + (profileGap ? 15 : 0)
 *     + (hasActiveTask ? 10 : 0)
 *     + (timeSinceLastInteraction > 7d ? 5 : 0)
 */
import { useMemo } from 'react';
import { useSignupStore } from '../stores/signupStore';
import { useProfileCompleteness } from './useProfileCompleteness';

export type TileType =
  | 'mini_cii' | 'time_bank' | 'share_card' | 'find_help'
  | 'bg_check' | 'lmn' | 'streak' | 'gratitude'
  | 'nearby' | 'care_plan' | 'schedule' | 'messages'
  | 'documents' | 'wellness' | 'governance' | 'referrals';

export interface TileConfig {
  type: TileType;
  label: string;
  icon: string;
  baseWeight: number;
  /** Whether this tile is visible given current state */
  visible: boolean;
  priority: number;
}

const BASE_TILES: Omit<TileConfig, 'visible' | 'priority'>[] = [
  { type: 'mini_cii', label: 'Quick Check-in', icon: '💚', baseWeight: 80 },
  { type: 'time_bank', label: 'Time Bank', icon: '⏰', baseWeight: 70 },
  { type: 'share_card', label: 'Share Card', icon: '📤', baseWeight: 65 },
  { type: 'find_help', label: 'Find Help', icon: '🔍', baseWeight: 60 },
  { type: 'bg_check', label: 'Background Check', icon: '✅', baseWeight: 55 },
  { type: 'lmn', label: 'LMN Program', icon: '📋', baseWeight: 50 },
  { type: 'streak', label: 'Care Streak', icon: '🔥', baseWeight: 45 },
  { type: 'gratitude', label: 'Gratitude', icon: '🙏', baseWeight: 40 },
  { type: 'nearby', label: 'Nearby', icon: '📍', baseWeight: 35 },
  { type: 'care_plan', label: 'Care Plan', icon: '📝', baseWeight: 30 },
  { type: 'schedule', label: 'Schedule', icon: '📅', baseWeight: 25 },
  { type: 'messages', label: 'Messages', icon: '💬', baseWeight: 20 },
  { type: 'documents', label: 'Documents', icon: '📄', baseWeight: 15 },
  { type: 'wellness', label: 'Wellness', icon: '🧘', baseWeight: 10 },
  { type: 'governance', label: 'Governance', icon: '🗳️', baseWeight: 8 },
  { type: 'referrals', label: 'Referrals', icon: '👥', baseWeight: 5 },
];

export function useTilePriority(): TileConfig[] {
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const profile = useProfileCompleteness();

  return useMemo(() => {
    if (!cardHolder) return [];

    const isNewUser = cardHolder.onboardingPhase === 'fresh' || cardHolder.onboardingPhase === 'exploring';
    const profileGap = profile.percentage < 75;
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(cardHolder.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const isInactive = daysSinceCreation > 7;

    return BASE_TILES.map((tile) => {
      let priority = tile.baseWeight;
      if (isNewUser) priority += 20;
      if (profileGap && ['mini_cii', 'bg_check', 'lmn'].includes(tile.type)) priority += 15;
      if (isInactive) priority += 5;

      // Visibility rules
      let visible = true;
      if (tile.type === 'bg_check' && cardHolder.bgCheck.status === 'clear') visible = false;
      if (tile.type === 'lmn' && cardHolder.lmnEnrolled) visible = false;
      if (tile.type === 'mini_cii' && cardHolder.miniCiiScore !== undefined) {
        // Still visible but lower priority — they can retake
        priority -= 30;
      }

      return { ...tile, visible, priority };
    })
      .filter((t) => t.visible)
      .sort((a, b) => b.priority - a.priority);
  }, [cardHolder, profile.percentage]);
}
```

**Step 2: Commit**

```bash
git add src/client/hooks/useTilePriority.ts
git commit -m "feat: add useTilePriority hook with scoring algorithm"
```

---

## Task 7: useShareAction Hook

**Files:**
- Create: `src/client/hooks/useShareAction.ts`

**Step 1: Create the share action hook**

```typescript
// src/client/hooks/useShareAction.ts
/**
 * useShareAction — wraps Web Share API with fallback to clipboard.
 * HIPAA-safe: never includes scores, only zones and aggregate stats.
 */
import { useCallback, useState } from 'react';

interface ShareData {
  title: string;
  text: string;
  url: string;
}

interface UseShareReturn {
  share: (data: ShareData) => Promise<void>;
  copied: boolean;
  supported: boolean;
}

export function useShareAction(): UseShareReturn {
  const [copied, setCopied] = useState(false);
  const supported = typeof navigator !== 'undefined' && !!navigator.share;

  const share = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // User cancelled or API failed — fall through to clipboard
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API also failed — nothing we can do
    }
  }, []);

  return { share, copied, supported };
}
```

**Step 2: Commit**

```bash
git add src/client/hooks/useShareAction.ts
git commit -m "feat: add useShareAction hook with Web Share API + clipboard fallback"
```

---

## Task 8: useNearbyNeighbors Hook

**Files:**
- Create: `src/client/hooks/useNearbyNeighbors.ts`

**Step 1: Create the nearby neighbors hook**

```typescript
// src/client/hooks/useNearbyNeighbors.ts
/**
 * useNearbyNeighbors — demo data for proximity features.
 * In production, this queries PostgreSQL geospatial index.
 * Privacy: shows first name + last initial only, approximate distance.
 */
import { useMemo } from 'react';
import type { GeoPosition } from './useGeolocation';

export interface NearbyNeighbor {
  id: string;
  displayName: string;
  distance: number; // miles
  tier: 'walking' | 'biking' | 'neighborhood' | 'community';
  skills: string[];
  availableHours: number;
}

/** Haversine distance in miles */
function haversine(a: GeoPosition, b: GeoPosition): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function tierFromDistance(miles: number): NearbyNeighbor['tier'] {
  if (miles <= 0.5) return 'walking';
  if (miles <= 1) return 'biking';
  if (miles <= 2) return 'neighborhood';
  return 'community';
}

// Demo neighbors around Boulder, CO (40.015, -105.270)
const DEMO_NEIGHBORS: { name: string; lat: number; lng: number; skills: string[]; hours: number }[] = [
  { name: 'Sarah M.', lat: 40.017, lng: -105.272, skills: ['meals', 'companionship'], hours: 4 },
  { name: 'James R.', lat: 40.012, lng: -105.268, skills: ['rides', 'errands'], hours: 6 },
  { name: 'Chen W.', lat: 40.020, lng: -105.265, skills: ['tech_support', 'admin_help'], hours: 3 },
  { name: 'Priya K.', lat: 40.008, lng: -105.280, skills: ['companionship', 'meals', 'housekeeping'], hours: 8 },
  { name: 'Tom B.', lat: 40.025, lng: -105.260, skills: ['yard_work', 'pet_care'], hours: 5 },
  { name: 'Lisa G.', lat: 40.005, lng: -105.290, skills: ['rides', 'grocery_run'], hours: 4 },
];

export function useNearbyNeighbors(position: GeoPosition | null): NearbyNeighbor[] {
  return useMemo(() => {
    if (!position) return [];

    return DEMO_NEIGHBORS.map((n, i) => {
      const dist = haversine(position, { lat: n.lat, lng: n.lng });
      return {
        id: `demo-neighbor-${i}`,
        displayName: n.name,
        distance: Math.round(dist * 10) / 10,
        tier: tierFromDistance(dist),
        skills: n.skills,
        availableHours: n.hours,
      };
    })
      .filter((n) => n.distance <= 5) // Community radius
      .sort((a, b) => a.distance - b.distance);
  }, [position]);
}
```

**Step 2: Commit**

```bash
git add src/client/hooks/useNearbyNeighbors.ts
git commit -m "feat: add useNearbyNeighbors hook with demo data + Haversine"
```

---

## Task 9: Homepage HeroSection

**Files:**
- Create: `src/client/features/homepage/HeroSection.tsx` (replace existing)

**Step 1: Create the new hero section**

```tsx
// src/client/features/homepage/HeroSection.tsx
/**
 * Hero Section — full-viewport, photography-forward.
 * "A community that cares. Literally."
 * Single CTA: Get Your Free Card
 */
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-copper-dark px-6">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-copper-dark/80 via-copper-dark/60 to-copper-dark/90" />

      <div className="relative z-10 max-w-lg text-center">
        <h1 className="font-heading text-4xl font-bold italic leading-tight text-white sm:text-5xl">
          A community that cares.
          <br />
          <span className="text-sage">Literally.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-md font-body text-lg text-white/80">
          Your free Comfort Card connects you to neighbors who help — and a cooperative you own.
        </p>

        <button
          type="button"
          onClick={() => navigate('/join')}
          className="mt-8 rounded-xl bg-sage px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-sage-dark active:scale-[0.98]"
        >
          Get Your Free Card
        </button>

        <p className="mt-3 font-body text-sm text-white/50">
          30 seconds. No credit card. No commitment.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="h-6 w-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/homepage/HeroSection.tsx
git commit -m "feat: redesign HeroSection with editorial photography style"
```

---

## Task 10: Homepage StoryCarousel

**Files:**
- Create: `src/client/features/homepage/StoryCarousel.tsx`

**Step 1: Create the story carousel component**

```tsx
// src/client/features/homepage/StoryCarousel.tsx
/**
 * StoryCarousel — horizontally scrollable caregiver stories.
 * Mobile: snap-scroll, one card at a time.
 * Desktop: shows 2-3 cards.
 */
import { useNavigate } from 'react-router-dom';
import { STORY_CARDS } from '../../../shared/constants/story-cards';

export function StoryCarousel() {
  const navigate = useNavigate();

  return (
    <section className="bg-warm-white px-6 py-16">
      <h2 className="text-center font-heading text-2xl font-semibold text-copper-dark">
        Real neighbors. Real care.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center font-body text-text-muted">
        Every member has a story. Here are a few.
      </p>

      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide sm:justify-center">
        {STORY_CARDS.map((card) => (
          <article
            key={card.id}
            className="min-w-[280px] max-w-[320px] flex-shrink-0 snap-center rounded-2xl bg-white p-6 shadow-md"
          >
            {/* Photo placeholder — in production, use real photos */}
            <div className="mb-4 h-48 rounded-xl bg-sage/10" aria-label={card.photoAlt} />

            <p className="font-body text-base italic text-copper-dark">"{card.quote}"</p>

            <div className="mt-4">
              <p className="font-heading text-sm font-semibold text-copper-dark">{card.name}</p>
              <p className="font-body text-xs text-text-muted">{card.role}</p>
            </div>

            {card.cta === 'join' && (
              <button
                type="button"
                onClick={() => navigate('/join')}
                className="mt-4 w-full rounded-lg bg-sage/10 px-4 py-2 text-sm font-semibold text-sage transition-colors hover:bg-sage/20"
              >
                Join the community
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/homepage/StoryCarousel.tsx
git commit -m "feat: add StoryCarousel with horizontal scroll caregiver stories"
```

---

## Task 11: Homepage ComfortCardStrip

**Files:**
- Create: `src/client/features/homepage/ComfortCardStrip.tsx` (replace existing `ComfortCardShowcase.tsx`)

**Step 1: Create the card strip component**

```tsx
// src/client/features/homepage/ComfortCardStrip.tsx
/**
 * ComfortCardStrip — animated card preview showing front/back.
 * The card tilts on scroll (subtle parallax).
 */
import { useNavigate } from 'react-router-dom';

export function ComfortCardStrip() {
  const navigate = useNavigate();

  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="font-heading text-2xl font-semibold text-copper-dark">
          Your Comfort Card
        </h2>
        <p className="mt-2 font-body text-text-muted">
          A free digital card with a QR code that connects you to your care community.
          Share it to invite neighbors. Scan it to get help.
        </p>

        {/* Card preview — simplified for demo */}
        <div className="mx-auto mt-8 aspect-[1.586/1] w-72 rounded-2xl bg-gradient-to-br from-sage to-copper-dark p-6 shadow-xl">
          <div className="flex h-full flex-col justify-between text-left text-white">
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-widest opacity-70">
                co-op.care
              </p>
              <p className="mt-1 font-heading text-xl font-semibold">Your Name</p>
              <p className="font-body text-sm opacity-80">COOP-2026-XXXX</p>
            </div>
            <div className="flex items-end justify-between">
              <p className="font-body text-xs opacity-60">Member since 2026</p>
              {/* QR placeholder */}
              <div className="h-12 w-12 rounded-lg bg-white/20" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/join')}
          className="mt-6 rounded-xl bg-sage px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-sage-dark active:scale-[0.98]"
        >
          Get Yours Free
        </button>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/homepage/ComfortCardStrip.tsx
git commit -m "feat: add ComfortCardStrip with animated card preview"
```

---

## Task 12: Homepage SagePreview

**Files:**
- Modify: `src/client/features/homepage/SagePreview.tsx` (replace existing)

**Step 1: Rewrite the Sage preview section**

```tsx
// src/client/features/homepage/SagePreview.tsx
/**
 * SagePreview — chat bubble teaser showing Sage's personality.
 * Three demo messages that auto-type, then CTA.
 */
import { useNavigate } from 'react-router-dom';

const DEMO_MESSAGES = [
  { from: 'user', text: "My mom needs someone to drive her to appointments" },
  { from: 'sage', text: "I can help with that! There are 3 neighbors within a mile who offer rides. Want me to check their availability?" },
  { from: 'user', text: "Yes please!" },
];

export function SagePreview() {
  const navigate = useNavigate();

  return (
    <section className="bg-warm-white px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="font-heading text-2xl font-semibold text-copper-dark">
          Meet Sage
        </h2>
        <p className="mt-2 font-body text-text-muted">
          Your AI care companion. Ask anything about caregiving — Sage coordinates the rest.
        </p>

        {/* Chat preview */}
        <div className="mx-auto mt-8 max-w-sm space-y-3 rounded-2xl bg-white p-4 shadow-md">
          {DEMO_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.from === 'user'
                    ? 'bg-sage text-white rounded-br-md'
                    : 'bg-gray-100 text-copper-dark rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('/join')}
          className="mt-6 rounded-xl bg-sage/10 px-6 py-3 text-base font-semibold text-sage transition-colors hover:bg-sage/20"
        >
          Try Sage — it's free
        </button>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/homepage/SagePreview.tsx
git commit -m "feat: redesign SagePreview with chat bubble teaser"
```

---

## Task 13: Homepage SocialProof

**Files:**
- Create: `src/client/features/homepage/SocialProof.tsx`

**Step 1: Create the social proof section**

```tsx
// src/client/features/homepage/SocialProof.tsx
/**
 * SocialProof — trust signals + community stats.
 * Shows real numbers (from business-rules.ts constants).
 */

export function SocialProof() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="font-heading text-2xl font-semibold text-copper-dark">
          Why families trust co-op.care
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="rounded-xl bg-sage/5 p-4">
            <p className="font-heading text-3xl font-bold text-sage">63M</p>
            <p className="mt-1 font-body text-xs text-text-muted">US family caregivers</p>
          </div>
          <div className="rounded-xl bg-sage/5 p-4">
            <p className="font-heading text-3xl font-bold text-sage">27 hrs</p>
            <p className="mt-1 font-body text-xs text-text-muted">Unpaid care per week</p>
          </div>
          <div className="rounded-xl bg-sage/5 p-4">
            <p className="font-heading text-3xl font-bold text-sage">$7,200</p>
            <p className="mt-1 font-body text-xs text-text-muted">Out-of-pocket per year</p>
          </div>
          <div className="rounded-xl bg-sage/5 p-4">
            <p className="font-heading text-3xl font-bold text-sage">77%</p>
            <p className="mt-1 font-body text-xs text-text-muted">Agency caregiver turnover</p>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-md font-body text-sm text-text-muted">
          co-op.care is different: worker-owned, community-powered, and designed by caregivers for caregivers.
        </p>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/homepage/SocialProof.tsx
git commit -m "feat: add SocialProof section with caregiver crisis stats"
```

---

## Task 14: Homepage FooterCTA

**Files:**
- Create: `src/client/features/homepage/FooterCTA.tsx`

**Step 1: Create the footer CTA component**

```tsx
// src/client/features/homepage/FooterCTA.tsx
/**
 * FooterCTA — final call to action + footer links.
 */
import { useNavigate } from 'react-router-dom';

export function FooterCTA() {
  const navigate = useNavigate();

  return (
    <section className="bg-copper-dark px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-white">
        Get your free card.
        <br />
        Takes 30 seconds.
      </h2>
      <button
        type="button"
        onClick={() => navigate('/join')}
        className="mt-6 rounded-xl bg-sage px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-sage-dark active:scale-[0.98]"
      >
        Get Your Free Comfort Card
      </button>
      <div className="mt-8 flex justify-center gap-6 text-sm text-white/50">
        <span>About</span>
        <span>Privacy</span>
        <span>Contact</span>
      </div>
      <p className="mt-4 text-xs text-white/30">
        &copy; 2026 co-op.care Limited Cooperative Association &middot; Boulder, CO
      </p>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/homepage/FooterCTA.tsx
git commit -m "feat: add FooterCTA component"
```

---

## Task 15: Recompose Homepage

**Files:**
- Modify: `src/client/features/homepage/Homepage.tsx`

**Step 1: Replace Homepage with new 6-section composition**

```tsx
// src/client/features/homepage/Homepage.tsx
/**
 * Homepage — 6-section editorial story scroll.
 *
 * 1. Hero — "A community that cares. Literally."
 * 2. StoryCarousel — Caregiver stories (horizontal scroll)
 * 3. ComfortCardStrip — Animated card preview
 * 4. SagePreview — Chat teaser
 * 5. SocialProof — Trust signals + stats
 * 6. FooterCTA — Final call to action
 */
import { HeroSection } from './HeroSection';
import { StoryCarousel } from './StoryCarousel';
import { ComfortCardStrip } from './ComfortCardStrip';
import { SagePreview } from './SagePreview';
import { SocialProof } from './SocialProof';
import { FooterCTA } from './FooterCTA';

export function Homepage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <StoryCarousel />
      <ComfortCardStrip />
      <SagePreview />
      <SocialProof />
      <FooterCTA />
    </div>
  );
}

export default Homepage;
```

**Step 2: Verify the app builds**

Run: `npx vite build --mode development 2>&1 | head -20`
Expected: Build succeeds (or only warnings about unused old components)

**Step 3: Commit**

```bash
git add src/client/features/homepage/Homepage.tsx
git commit -m "feat: recompose Homepage with 6 editorial sections"
```

---

## Task 16: JoinFlow — 30-Second Card Signup

**Files:**
- Modify: `src/client/features/signup/SignupFlow.tsx` (or create `JoinFlow.tsx` if it doesn't exist)

**Step 1: Create the 30-second join flow**

```tsx
// src/client/features/signup/JoinFlow.tsx
/**
 * JoinFlow — 3-field card signup (firstName, phone, intent).
 * Reads ?ref= from URL for viral attribution.
 * On submit: creates card → navigates to /welcome.
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignupStore } from '../../stores/signupStore';

export function JoinFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referredBy = searchParams.get('ref') || undefined;
  const createCard = useSignupStore((s) => s.createCard);
  const getReferrerName = useSignupStore((s) => s.getReferrerName);

  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [intent, setIntent] = useState<'seeking_care' | 'giving_care'>('seeking_care');

  const referrerName = referredBy ? getReferrerName(referredBy) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    createCard({
      firstName: firstName.trim(),
      phone: phone.trim() || undefined,
      intent,
      referredBy,
    });

    navigate('/welcome');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-6">
      <div className="w-full max-w-sm">
        {referrerName && (
          <p className="mb-4 text-center font-body text-sm text-sage">
            {referrerName} invited you to co-op.care!
          </p>
        )}

        <h1 className="text-center font-heading text-2xl font-semibold text-copper-dark">
          Get your free Comfort Card
        </h1>
        <p className="mt-1 text-center font-body text-sm text-text-muted">
          30 seconds. No credit card.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="firstName" className="block font-body text-sm font-semibold text-copper-dark">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              required
              autoFocus
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-body text-base focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
              placeholder="Your first name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block font-body text-sm font-semibold text-copper-dark">
              Phone <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 font-body text-base focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
              placeholder="303-555-1234"
            />
          </div>

          <fieldset>
            <legend className="block font-body text-sm font-semibold text-copper-dark">
              I'm here to...
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIntent('seeking_care')}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  intent === 'seeking_care'
                    ? 'bg-sage text-white shadow-md'
                    : 'bg-gray-100 text-copper-dark hover:bg-gray-200'
                }`}
              >
                Find care
              </button>
              <button
                type="button"
                onClick={() => setIntent('giving_care')}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  intent === 'giving_care'
                    ? 'bg-sage text-white shadow-md'
                    : 'bg-gray-100 text-copper-dark hover:bg-gray-200'
                }`}
              >
                Give care
              </button>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={!firstName.trim()}
            className="mt-2 w-full rounded-xl bg-sage px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-sage-dark active:scale-[0.98] disabled:opacity-50"
          >
            Get My Free Card
          </button>
        </form>

        <p className="mt-4 text-center font-body text-xs text-text-muted">
          Free forever. Upgrade anytime for $100/year membership.
        </p>
      </div>
    </div>
  );
}

export default JoinFlow;
```

**Step 2: Commit**

```bash
git add src/client/features/signup/JoinFlow.tsx
git commit -m "feat: add JoinFlow 30-second card signup with referral attribution"
```

---

## Task 17: CardReveal — Post-Signup Magic Moment

**Files:**
- Create: `src/client/features/signup/CardReveal.tsx`

**Step 1: Create the card reveal component**

```tsx
// src/client/features/signup/CardReveal.tsx
/**
 * CardReveal — Shown at /welcome after signup.
 * Displays the generated card with animation, then CTAs:
 * 1. Add to Wallet  2. Share Card  3. Talk to Sage
 */
import { useNavigate } from 'react-router-dom';
import { useSignupStore } from '../../stores/signupStore';
import { useShareAction } from '../../hooks/useShareAction';

export function CardReveal() {
  const navigate = useNavigate();
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const setWalletAdded = useSignupStore((s) => s.setWalletAdded);
  const { share, copied } = useShareAction();

  if (!cardHolder) {
    navigate('/join');
    return null;
  }

  const handleShare = () => {
    share({
      title: 'co-op.care — Community Care',
      text: `${cardHolder.firstName} invited you to co-op.care! Get your free Comfort Card.`,
      url: cardHolder.qrUrl,
    });
  };

  const handleWallet = () => {
    // In production: generate Apple/Google Wallet pass
    setWalletAdded();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6">
      <p className="font-body text-sm text-sage">Welcome to co-op.care!</p>
      <h1 className="mt-2 font-heading text-2xl font-semibold text-copper-dark">
        Your Comfort Card
      </h1>

      {/* Card */}
      <div className="mx-auto mt-6 aspect-[1.586/1] w-72 rounded-2xl bg-gradient-to-br from-sage to-copper-dark p-6 shadow-xl transition-transform hover:scale-[1.02]">
        <div className="flex h-full flex-col justify-between text-left text-white">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-widest opacity-70">
              co-op.care
            </p>
            <p className="mt-1 font-heading text-xl font-semibold">{cardHolder.firstName}</p>
            <p className="font-body text-sm opacity-80">{cardHolder.memberId}</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="font-body text-xs opacity-60">
              {cardHolder.intent === 'seeking_care' ? 'Care Seeker' : 'Care Giver'}
            </p>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-xs">
              QR
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={handleWallet}
          className="w-full rounded-xl bg-copper-dark px-6 py-3 text-base font-semibold text-white transition-all hover:bg-copper-dark/90"
        >
          {cardHolder.walletAdded ? '✓ Added to Wallet' : 'Add to Apple/Google Wallet'}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="w-full rounded-xl bg-sage/10 px-6 py-3 text-base font-semibold text-sage transition-colors hover:bg-sage/20"
        >
          {copied ? '✓ Link Copied!' : 'Share Your Card'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/card')}
          className="w-full rounded-xl border border-gray-200 px-6 py-3 text-base font-semibold text-copper-dark transition-colors hover:bg-gray-50"
        >
          Talk to Sage →
        </button>
      </div>
    </div>
  );
}

export default CardReveal;
```

**Step 2: Commit**

```bash
git add src/client/features/signup/CardReveal.tsx
git commit -m "feat: add CardReveal post-signup magic moment with share + wallet"
```

---

## Task 18: ProfileRing — QR Profile Memory Ring

**Files:**
- Create: `src/client/features/sage/ProfileRing.tsx`

**Step 1: Create the profile ring component**

```tsx
// src/client/features/sage/ProfileRing.tsx
/**
 * ProfileRing — 8-segment SVG ring around QR code.
 * Segments fill as profile completes.
 * Segments: Name, Contact, Intent, Roles, Mini CII, Consent, Bg Check, LMN
 */
import { useProfileCompleteness } from '../../hooks/useProfileCompleteness';

const SEGMENT_LABELS = ['Name', 'Contact', 'Intent', 'Roles', 'Check-in', 'Memory', 'Bg Check', 'LMN'];
const SEGMENT_KEYS = ['name', 'contact', 'intent', 'roles', 'miniCii', 'consent', 'bgCheck', 'lmn'] as const;

interface ProfileRingProps {
  size?: number;
  children?: React.ReactNode;
}

export function ProfileRing({ size = 200, children }: ProfileRingProps) {
  const { segments } = useProfileCompleteness();
  const center = size / 2;
  const radius = size / 2 - 12;
  const strokeWidth = 8;
  const gap = 4; // degrees between segments
  const segmentArc = (360 - gap * 8) / 8;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {SEGMENT_KEYS.map((key, i) => {
          const startAngle = i * (segmentArc + gap) - 90;
          const endAngle = startAngle + segmentArc;
          const filled = segments[key];

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);

          const largeArc = segmentArc > 180 ? 1 : 0;

          return (
            <path
              key={key}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={filled ? '#2BA5A0' : '#E5E7EB'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              aria-label={`${SEGMENT_LABELS[i]}: ${filled ? 'complete' : 'incomplete'}`}
            />
          );
        })}
      </svg>

      {/* Center content (QR code or avatar) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/sage/ProfileRing.tsx
git commit -m "feat: add ProfileRing SVG component with 8 completeness segments"
```

---

## Task 19: TileBank — Dynamic Tile Grid

**Files:**
- Create: `src/client/features/sage/TileBank.tsx`

**Step 1: Create the tile bank component**

```tsx
// src/client/features/sage/TileBank.tsx
/**
 * TileBank — Dynamic tile grid below the card.
 * 2 rows of 4 tiles, horizontally scrollable on mobile.
 * Tiles sorted by useTilePriority scoring algorithm.
 */
import { useTilePriority, type TileConfig } from '../../hooks/useTilePriority';

interface TileBankProps {
  onTilePress?: (tile: TileConfig) => void;
}

export function TileBank({ onTilePress }: TileBankProps) {
  const tiles = useTilePriority();

  if (tiles.length === 0) return null;

  return (
    <div className="mt-4 px-4">
      <div className="grid grid-cols-4 gap-2">
        {tiles.slice(0, 8).map((tile) => (
          <button
            key={tile.type}
            type="button"
            onClick={() => onTilePress?.(tile)}
            className="flex flex-col items-center justify-center rounded-xl bg-white p-3 shadow-sm transition-all hover:shadow-md active:scale-[0.97]"
            aria-label={tile.label}
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              {tile.icon}
            </span>
            <span className="mt-1 text-center font-body text-[10px] font-semibold text-copper-dark leading-tight">
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/sage/TileBank.tsx
git commit -m "feat: add TileBank dynamic tile grid with priority scoring"
```

---

## Task 20: NearbyMap Component

**Files:**
- Create: `src/client/features/sage/NearbyMap.tsx`

**Step 1: Create the nearby map component**

```tsx
// src/client/features/sage/NearbyMap.tsx
/**
 * NearbyMap — List view of nearby neighbors (no map API needed for demo).
 * Shows name, distance, skills, proximity tier.
 * Privacy: first name + last initial only, approximate distance.
 */
import { useGeolocation } from '../../hooks/useGeolocation';
import { useNearbyNeighbors, type NearbyNeighbor } from '../../hooks/useNearbyNeighbors';

const TIER_COLORS: Record<NearbyNeighbor['tier'], string> = {
  walking: 'bg-green-100 text-green-700',
  biking: 'bg-blue-100 text-blue-700',
  neighborhood: 'bg-yellow-100 text-yellow-700',
  community: 'bg-gray-100 text-gray-600',
};

const TIER_LABELS: Record<NearbyNeighbor['tier'], string> = {
  walking: 'Walking distance',
  biking: 'Biking distance',
  neighborhood: 'In your neighborhood',
  community: 'In your community',
};

export function NearbyMap() {
  const { position, error, loading } = useGeolocation();
  const neighbors = useNearbyNeighbors(position);

  if (loading) {
    return (
      <div className="p-4 text-center font-body text-sm text-text-muted">
        Finding neighbors near you...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center font-body text-sm text-text-muted">
        Enable location to see neighbors nearby.
      </div>
    );
  }

  if (neighbors.length === 0) {
    return (
      <div className="p-4 text-center font-body text-sm text-text-muted">
        No neighbors found nearby yet. Share your card to grow the community!
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="font-heading text-sm font-semibold text-copper-dark">Neighbors Nearby</h3>
      {neighbors.slice(0, 5).map((n) => (
        <div key={n.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/10 text-sm font-semibold text-sage">
            {n.displayName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-body text-sm font-semibold text-copper-dark">{n.displayName}</p>
            <p className="font-body text-xs text-text-muted">
              {n.skills.slice(0, 2).join(', ')} · {n.availableHours} hrs/wk
            </p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_COLORS[n.tier]}`}>
            {n.distance} mi
          </span>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/sage/NearbyMap.tsx
git commit -m "feat: add NearbyMap neighbor list with proximity tiers"
```

---

## Task 21: LMNCalculator — Inline Savings Calculator

**Files:**
- Create: `src/client/features/sage/LMNCalculator.tsx`

**Step 1: Create the LMN calculator component**

```tsx
// src/client/features/sage/LMNCalculator.tsx
/**
 * LMNCalculator — shows HSA/FSA savings from LMN enrollment.
 * Inline tile that expands to show projected savings.
 * Dr. Josh Emdur signs the Letter of Medical Necessity.
 */
import { useState } from 'react';

export function LMNCalculator() {
  const [monthlySpend, setMonthlySpend] = useState(550); // Peace of Mind tier default
  const taxBracket = 0.32; // Approximate combined federal + state for Boulder
  const annualSpend = monthlySpend * 12;
  const annualSavings = Math.round(annualSpend * taxBracket);
  const monthlySavings = Math.round(annualSavings / 12);
  const lmnCost = 59; // per month
  const netSavings = monthlySavings - lmnCost;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md">
      <h3 className="font-heading text-sm font-semibold text-copper-dark">
        LMN Savings Calculator
      </h3>
      <p className="mt-1 font-body text-xs text-text-muted">
        Dr. Emdur signs your Letter of Medical Necessity so care costs become HSA/FSA eligible.
      </p>

      <div className="mt-4">
        <label htmlFor="monthlySpend" className="block font-body text-xs font-semibold text-copper-dark">
          Monthly care spend: ${monthlySpend}
        </label>
        <input
          id="monthlySpend"
          type="range"
          min={200}
          max={4400}
          step={50}
          value={monthlySpend}
          onChange={(e) => setMonthlySpend(Number(e.target.value))}
          className="mt-2 w-full accent-sage"
        />
        <div className="flex justify-between font-body text-[10px] text-text-muted">
          <span>$200/mo</span>
          <span>$4,400/mo</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-sage/5 p-2">
          <p className="font-heading text-lg font-bold text-sage">${annualSavings}</p>
          <p className="font-body text-[10px] text-text-muted">Annual tax savings</p>
        </div>
        <div className="rounded-lg bg-sage/5 p-2">
          <p className="font-heading text-lg font-bold text-copper-dark">${lmnCost}/mo</p>
          <p className="font-body text-[10px] text-text-muted">LMN program</p>
        </div>
        <div className="rounded-lg bg-sage/5 p-2">
          <p className={`font-heading text-lg font-bold ${netSavings > 0 ? 'text-sage' : 'text-red-500'}`}>
            {netSavings > 0 ? '+' : ''}${netSavings}/mo
          </p>
          <p className="font-body text-[10px] text-text-muted">Net monthly</p>
        </div>
      </div>

      {netSavings > 0 && (
        <p className="mt-3 text-center font-body text-xs text-sage">
          You'd save ${netSavings * 12}/year after the LMN program cost.
        </p>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/sage/LMNCalculator.tsx
git commit -m "feat: add LMNCalculator inline HSA/FSA savings estimator"
```

---

## Task 22: BgCheckFlow — Background Check Tile

**Files:**
- Create: `src/client/features/sage/BgCheckFlow.tsx`

**Step 1: Create the background check flow component**

```tsx
// src/client/features/sage/BgCheckFlow.tsx
/**
 * BgCheckFlow — Tile that shows bg check status and drives Checkr flow.
 * States: not_started → invited → pending → clear/consider
 * $30 standalone or free with LMN ($59/mo).
 */
import { useSignupStore } from '../../stores/signupStore';

export function BgCheckFlow() {
  const bgCheck = useSignupStore((s) => s.cardHolder?.bgCheck);
  const setBgCheck = useSignupStore((s) => s.setBgCheck);
  const lmnEnrolled = useSignupStore((s) => s.cardHolder?.lmnEnrolled);

  if (!bgCheck) return null;

  const handleStart = () => {
    // In production: create Checkr candidate, get invitation URL
    setBgCheck({
      status: 'invited',
      checkrInvitationUrl: 'https://checkr.com/demo-invitation',
      invitedAt: new Date().toISOString(),
      freeWithLmn: lmnEnrolled,
    });
  };

  const handleSimulateComplete = () => {
    // Demo only: simulate completion
    setBgCheck({
      status: 'clear',
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md">
      <h3 className="font-heading text-sm font-semibold text-copper-dark">
        Background Check
      </h3>

      {bgCheck.status === 'not_started' && (
        <>
          <p className="mt-1 font-body text-xs text-text-muted">
            Required to give care. {lmnEnrolled ? 'Free with your LMN membership!' : '$30 via Checkr.'}
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="mt-3 w-full rounded-xl bg-sage px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-sage-dark"
          >
            Start Background Check
          </button>
        </>
      )}

      {bgCheck.status === 'invited' && (
        <>
          <p className="mt-1 font-body text-xs text-text-muted">
            Check your email for the Checkr invitation link.
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={bgCheck.checkrInvitationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl bg-sage/10 px-4 py-2 text-center text-sm font-semibold text-sage transition-colors hover:bg-sage/20"
            >
              Open Checkr
            </a>
            <button
              type="button"
              onClick={handleSimulateComplete}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-copper-dark"
            >
              (Demo: Complete)
            </button>
          </div>
        </>
      )}

      {bgCheck.status === 'pending' && (
        <p className="mt-1 font-body text-xs text-text-muted">
          Your background check is being processed. This usually takes 2-5 business days.
        </p>
      )}

      {bgCheck.status === 'clear' && (
        <div className="mt-1 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage text-xs text-white">✓</span>
          <p className="font-body text-sm font-semibold text-sage">Verified — you're cleared to give care!</p>
        </div>
      )}

      {bgCheck.status === 'consider' && (
        <p className="mt-1 font-body text-xs text-text-muted">
          Your check needs review. We'll contact you within 48 hours.
        </p>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/client/features/sage/BgCheckFlow.tsx
git commit -m "feat: add BgCheckFlow component with Checkr integration states"
```

---

## Task 23: Update QRLanding for Viral Referral

**Files:**
- Modify: `src/client/features/signup/QRLanding.tsx`

**Step 1: Update QRLanding with personalized referral messaging**

```tsx
// src/client/features/signup/QRLanding.tsx
/**
 * QRLanding — /q/:memberId — personalized viral referral page.
 * Shows referrer name (if found) + dual CTA.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useSignupStore } from '../../stores/signupStore';

export function QRLanding() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const getReferrerName = useSignupStore((s) => s.getReferrerName);

  const referrerName = memberId ? getReferrerName(memberId) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6 text-center">
      {referrerName ? (
        <>
          <p className="font-body text-sm text-sage">Invited by</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-copper-dark">
            {referrerName}
          </h1>
          <p className="mt-2 font-body text-base text-text-muted">
            wants you to join their care community on co-op.care.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-heading text-3xl font-semibold text-copper-dark">
            You've been invited!
          </h1>
          <p className="mt-2 font-body text-base text-text-muted">
            Someone in your community shared their Comfort Card with you.
          </p>
        </>
      )}

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate(`/join?ref=${memberId}`)}
          className="w-full rounded-xl bg-sage px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-sage-dark active:scale-[0.98]"
        >
          Get Your Free Card
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full rounded-xl border border-gray-200 px-6 py-3 text-base font-semibold text-copper-dark transition-colors hover:bg-gray-50"
        >
          Learn More First
        </button>
      </div>

      <p className="mt-6 font-body text-xs text-text-muted">
        {referrerName
          ? `When you join, both you and ${referrerName} earn 5 Time Bank hours!`
          : 'Join and earn 5 free Time Bank hours!'}
      </p>
    </div>
  );
}

export default QRLanding;
```

**Step 2: Commit**

```bash
git add src/client/features/signup/QRLanding.tsx
git commit -m "feat: redesign QRLanding with personalized viral referral"
```

---

## Task 24: Update CardAndSage with TileBank + ProfileRing

**Files:**
- Modify: `src/client/features/sage/CardAndSage.tsx`

**Step 1: Integrate ProfileRing and TileBank into CardAndSage**

```tsx
// src/client/features/sage/CardAndSage.tsx
/**
 * CardAndSage — The main app surface.
 * Layout: Card with ProfileRing on top, TileBank below, Sage drawer at bottom.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupStore } from '../../stores/signupStore';
import { ProfileRing } from './ProfileRing';
import { TileBank } from './TileBank';
import { SageChat } from './SageChat';
import type { TileConfig } from '../../hooks/useTilePriority';

export function CardAndSage() {
  const navigate = useNavigate();
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const [sageOpen, setSageOpen] = useState(false);
  const [sagePrefill, setSagePrefill] = useState('');

  if (!cardHolder) {
    navigate('/');
    return null;
  }

  const handleTilePress = (tile: TileConfig) => {
    // Most tiles open Sage with a contextual prefill
    const prefillMap: Partial<Record<TileConfig['type'], string>> = {
      mini_cii: "I'd like to do a quick check-in",
      time_bank: "What's my Time Bank balance?",
      share_card: "I want to share my card with someone",
      find_help: "I need help finding care near me",
      bg_check: "Tell me about the background check",
      lmn: "How does the LMN program save me money?",
      streak: "How's my care streak going?",
      nearby: "Who's available to help near me?",
    };

    const prefill = prefillMap[tile.type];
    if (prefill) {
      setSagePrefill(prefill);
      setSageOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-copper-dark to-copper-dark/90 px-6 pb-8 pt-12 text-center text-white">
        <ProfileRing size={160}>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
            QR
          </div>
        </ProfileRing>

        <h1 className="mt-4 font-heading text-xl font-semibold">{cardHolder.firstName}</h1>
        <p className="font-body text-sm text-white/70">{cardHolder.memberId}</p>
      </div>

      {/* Tile Bank */}
      <TileBank onTilePress={handleTilePress} />

      {/* Sage FAB */}
      <button
        type="button"
        onClick={() => { setSagePrefill(''); setSageOpen(true); }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-2xl text-white shadow-lg transition-all hover:bg-sage-dark active:scale-[0.95]"
        aria-label="Talk to Sage"
      >
        💬
      </button>

      {/* Sage Drawer */}
      {sageOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-warm-white">
          <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-copper-dark">Sage</h2>
            <button
              type="button"
              onClick={() => setSageOpen(false)}
              className="text-2xl text-text-muted"
              aria-label="Close Sage"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <SageChat prefillMessage={sagePrefill} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CardAndSage;
```

**Step 2: Commit**

```bash
git add src/client/features/sage/CardAndSage.tsx
git commit -m "feat: integrate ProfileRing + TileBank into CardAndSage layout"
```

---

## Task 25: Update SageChat with Onboarding Scripts

**Files:**
- Modify: `src/client/features/sage/SageChat.tsx`

**Step 1: Add onboarding phase awareness to SageChat**

Add a `prefillMessage` prop and use `SAGE_SCRIPTS` for initial greeting based on `onboardingPhase`. The exact implementation depends on the current SageChat structure, but the key additions are:

1. Accept `prefillMessage?: string` prop
2. On mount, check `cardHolder.onboardingPhase` and display the appropriate `SAGE_SCRIPTS` greeting
3. Show followup buttons from the script
4. When a followup is clicked, advance the phase via `setOnboardingPhase`

This is a modification task — read the current SageChat.tsx first, then apply the pattern. The key import to add:

```typescript
import { SAGE_SCRIPTS } from '../../../shared/constants/sage-onboarding-scripts';
import { useSignupStore } from '../../stores/signupStore';
```

**Step 2: Commit**

```bash
git add src/client/features/sage/SageChat.tsx
git commit -m "feat: integrate Sage onboarding scripts into SageChat"
```

---

## Task 26: Update App.tsx Routes

**Files:**
- Modify: `src/client/App.tsx`

**Step 1: Update routes to use new components**

Replace `/welcome` route to use `CardReveal` instead of `WelcomeReveal`:

```tsx
const CardReveal = lazy(() => import('./features/signup/CardReveal'));
const JoinFlow = lazy(() => import('./features/signup/JoinFlow'));
```

Update the routes:
```tsx
<Route path="/join" element={<Lazy feature="Join"><JoinFlow /></Lazy>} />
<Route path="/welcome" element={<Lazy feature="Welcome"><CardReveal /></Lazy>} />
```

**Step 2: Verify the app builds**

Run: `npx vite build --mode development 2>&1 | head -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/client/App.tsx
git commit -m "feat: update routes for JoinFlow + CardReveal"
```

---

## Task 27: Add business-rules.ts Constants

**Files:**
- Modify: `src/shared/constants/business-rules.ts`

**Step 1: Add new constants for proximity tiers and referral bonuses**

Add to the existing file:

```typescript
// Proximity matching tiers
export const PROXIMITY_TIERS = {
  walking: { maxMiles: 0.5, multiplier: 3, label: 'Walking distance' },
  biking: { maxMiles: 1.0, multiplier: 2, label: 'Biking distance' },
  neighborhood: { maxMiles: 2.0, multiplier: 1, label: 'In your neighborhood' },
  community: { maxMiles: 5.0, multiplier: 0.5, label: 'In your community' },
} as const;

// Referral bonus hours by tier
export const REFERRAL_BONUSES = {
  seedling: 5,
  rooted: 7,
  canopy: 10,
} as const;

// LMN Program
export const LMN_MONTHLY_COST = 59;
export const BG_CHECK_COST = 30;
export const BG_CHECK_FREE_WITH_LMN = true;

// Profile completeness segments
export const PROFILE_SEGMENTS = ['name', 'contact', 'intent', 'roles', 'miniCii', 'consent', 'bgCheck', 'lmn'] as const;
```

**Step 2: Commit**

```bash
git add src/shared/constants/business-rules.ts
git commit -m "feat: add proximity tiers, referral bonuses, LMN constants"
```

---

## Task 28: Clean Up Old Homepage Components

**Files:**
- Delete or archive: `src/client/features/homepage/ProblemSection.tsx`
- Delete or archive: `src/client/features/homepage/DifferenceCards.tsx`
- Delete or archive: `src/client/features/homepage/ComfortCardShowcase.tsx`
- Delete or archive: `src/client/features/homepage/ViralQRSection.tsx`
- Delete or archive: `src/client/features/homepage/CommunityOwnership.tsx`

**Step 1: Remove old components that are no longer imported**

Check that `Homepage.tsx` no longer imports these, then delete them:

```bash
rm src/client/features/homepage/ProblemSection.tsx
rm src/client/features/homepage/DifferenceCards.tsx
rm src/client/features/homepage/ComfortCardShowcase.tsx
rm src/client/features/homepage/ViralQRSection.tsx
rm src/client/features/homepage/CommunityOwnership.tsx
```

**Step 2: Verify the app builds**

Run: `npx vite build --mode development 2>&1 | head -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add -A src/client/features/homepage/
git commit -m "chore: remove old homepage sections replaced by redesign"
```

---

## Task 29: Add Tailwind Scrollbar-Hide Utility

**Files:**
- Modify: `src/client/index.css`

**Step 1: Add scrollbar-hide utility class**

Add to the CSS file:

```css
/* Hide scrollbar for horizontal-scroll components */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

**Step 2: Commit**

```bash
git add src/client/index.css
git commit -m "feat: add scrollbar-hide CSS utility for carousel components"
```

---

## Task 30: Full Build Verification

**Step 1: Run TypeScript type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 3: Run production build**

Run: `npx vite build`
Expected: Build succeeds, bundle < 150KB gzipped

**Step 4: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: fix any remaining type/build issues from homepage redesign"
```

---

## Summary

| Task | Component | Files | Type |
|------|-----------|-------|------|
| 1 | Story Cards Constants | `story-cards.ts` | Create |
| 2 | Sage Onboarding Scripts | `sage-onboarding-scripts.ts` | Create |
| 3 | signupStore Extensions | `signupStore.ts` + test | Modify |
| 4 | useGeolocation | `useGeolocation.ts` | Create |
| 5 | useProfileCompleteness | `useProfileCompleteness.ts` | Create |
| 6 | useTilePriority | `useTilePriority.ts` | Create |
| 7 | useShareAction | `useShareAction.ts` | Create |
| 8 | useNearbyNeighbors | `useNearbyNeighbors.ts` | Create |
| 9 | HeroSection | `HeroSection.tsx` | Replace |
| 10 | StoryCarousel | `StoryCarousel.tsx` | Create |
| 11 | ComfortCardStrip | `ComfortCardStrip.tsx` | Create |
| 12 | SagePreview | `SagePreview.tsx` | Replace |
| 13 | SocialProof | `SocialProof.tsx` | Create |
| 14 | FooterCTA | `FooterCTA.tsx` | Create |
| 15 | Homepage Compositor | `Homepage.tsx` | Replace |
| 16 | JoinFlow | `JoinFlow.tsx` | Create |
| 17 | CardReveal | `CardReveal.tsx` | Create |
| 18 | ProfileRing | `ProfileRing.tsx` | Create |
| 19 | TileBank | `TileBank.tsx` | Create |
| 20 | NearbyMap | `NearbyMap.tsx` | Create |
| 21 | LMNCalculator | `LMNCalculator.tsx` | Create |
| 22 | BgCheckFlow | `BgCheckFlow.tsx` | Create |
| 23 | QRLanding | `QRLanding.tsx` | Replace |
| 24 | CardAndSage | `CardAndSage.tsx` | Replace |
| 25 | SageChat | `SageChat.tsx` | Modify |
| 26 | App Routes | `App.tsx` | Modify |
| 27 | Business Rules | `business-rules.ts` | Modify |
| 28 | Cleanup | Remove 5 old files | Delete |
| 29 | CSS Utility | `index.css` | Modify |
| 30 | Build Verification | — | Verify |
