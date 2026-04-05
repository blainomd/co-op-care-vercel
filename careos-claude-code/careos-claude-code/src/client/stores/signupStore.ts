/**
 * Signup Store — Free Comfort Card holders
 *
 * Separate from authStore (which handles full authenticated members).
 * A "comfort card holder" has signed up for a free card but hasn't
 * created a password or paid for membership yet.
 *
 * Persists to localStorage so the card survives page reloads.
 * The QR code encodes a URL that drives the viral referral loop.
 */
import { create } from 'zustand';
import type { VerifiedIdentity } from '@shared/types/identity.types';
import type { OnboardingPhase } from '@shared/types/sage-message.types';

export type { OnboardingPhase };

export type MemoryConsent = 'granted' | 'session_only' | 'pending';

export type BgCheckStatus =
  | 'not_started'
  | 'invited'
  | 'pending'
  | 'clear'
  | 'consider'
  | 'expired';

export interface BgCheck {
  status: BgCheckStatus;
  checkrCandidateId?: string;
  checkrInvitationUrl?: string;
  invitedAt?: string;
  completedAt?: string;
  /** Whether the check was free via LMN upgrade */
  freeWithLmn?: boolean;
}

export interface ComfortCardHolder {
  firstName: string;
  phone?: string;
  email?: string;
  memberId: string;
  intent: 'seeking_care' | 'giving_care';
  referredBy?: string;
  qrUrl: string;
  createdAt: string;
  walletAdded: boolean;
  pwaInstalled: boolean;
  memoryConsent: MemoryConsent;
  onboardingPhase: OnboardingPhase;
  communityRoles: string[];
  bgCheck: BgCheck;
  verifiedIdentity?: VerifiedIdentity;
}

export interface Referral {
  fromMemberId: string;
  toMemberId: string;
  bonusHours: number;
  createdAt: string;
}

interface SignupState {
  cardHolder: ComfortCardHolder | null;
  referrals: Referral[];

  // Actions
  createCard: (input: CreateCardInput) => ComfortCardHolder;
  clearCard: () => void;
  setWalletAdded: () => void;
  setPwaInstalled: () => void;
  setMemoryConsent: (consent: MemoryConsent) => void;
  setOnboardingPhase: (phase: OnboardingPhase) => void;
  setCommunityRoles: (roles: string[]) => void;
  setBgCheck: (update: Partial<BgCheck>) => void;
  setVerifiedIdentity: (identity: VerifiedIdentity) => void;
  addReferral: (referral: Referral) => void;
  getReferrerName: (memberId: string) => string | null;
}

interface CreateCardInput {
  firstName: string;
  phone?: string;
  email?: string;
  intent: 'seeking_care' | 'giving_care';
  referredBy?: string;
}

// ─── Storage Key ────────────────────────────────────────────────────

const STORAGE_KEY = 'coop_comfort_card';
const REFERRALS_KEY = 'coop_referrals';

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

// ─── Member ID Generator ────────────────────────────────────────────

function generateMemberId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `COOP-${year}-${rand}`;
}

function generateQrUrl(memberId: string): string {
  // In production this would be https://co-op.care/#/q/{memberId}
  // For demo, use relative hash URL so it works locally
  return `${window.location.origin}${window.location.pathname}#/q/${memberId}`;
}

// ─── Store ──────────────────────────────────────────────────────────

export const useSignupStore = create<SignupState>((set, get) => ({
  cardHolder: loadFromStorage<ComfortCardHolder>(STORAGE_KEY),
  referrals: loadFromStorage<Referral[]>(REFERRALS_KEY) ?? [],

  createCard: (input: CreateCardInput) => {
    const memberId = generateMemberId();
    const card: ComfortCardHolder = {
      firstName: input.firstName,
      phone: input.phone,
      email: input.email,
      memberId,
      intent: input.intent,
      referredBy: input.referredBy,
      qrUrl: generateQrUrl(memberId),
      createdAt: new Date().toISOString(),
      walletAdded: false,
      pwaInstalled: false,
      memoryConsent: 'pending',
      onboardingPhase: 'fresh',
      communityRoles: [],
      bgCheck: { status: 'not_started' },
    };

    saveToStorage(STORAGE_KEY, card);
    set({ cardHolder: card });

    // If referred, create a referral record — both parties get 1 free hour
    if (input.referredBy) {
      const referral: Referral = {
        fromMemberId: input.referredBy,
        toMemberId: memberId,
        bonusHours: 1, // Both parties get 1 free Time Bank hour
        createdAt: new Date().toISOString(),
      };
      get().addReferral(referral);
    }

    return card;
  },

  clearCard: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ cardHolder: null });
  },

  setWalletAdded: () => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, walletAdded: true };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  setPwaInstalled: () => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, pwaInstalled: true };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  setMemoryConsent: (consent: MemoryConsent) => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, memoryConsent: consent };
    if (consent === 'granted') {
      saveToStorage(STORAGE_KEY, updated);
    }
    set({ cardHolder: updated });
  },

  setOnboardingPhase: (phase: OnboardingPhase) => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, onboardingPhase: phase };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  setCommunityRoles: (roles: string[]) => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, communityRoles: roles };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  setBgCheck: (update: Partial<BgCheck>) => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    const updated = { ...cardHolder, bgCheck: { ...cardHolder.bgCheck, ...update } };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  setVerifiedIdentity: (identity: VerifiedIdentity) => {
    const { cardHolder } = get();
    if (!cardHolder) return;
    // Auto-populate firstName and phone from verified data
    const updated = {
      ...cardHolder,
      verifiedIdentity: identity,
      firstName: identity.firstName,
      phone: identity.phone,
    };
    saveToStorage(STORAGE_KEY, updated);
    set({ cardHolder: updated });
  },

  addReferral: (referral: Referral) => {
    const updated = [...get().referrals, referral];
    saveToStorage(REFERRALS_KEY, updated);
    set({ referrals: updated });
  },

  getReferrerName: (memberId: string) => {
    // In demo mode, look up from localStorage.
    // In production, this would be an API call.
    const card = get().cardHolder;
    if (card?.memberId === memberId) return card.firstName;

    // Check if we have this referrer stored from a previous visit
    try {
      const raw = localStorage.getItem(`coop_referrer_${memberId}`);
      return raw ? JSON.parse(raw).firstName : null;
    } catch {
      return null;
    }
  },
}));
