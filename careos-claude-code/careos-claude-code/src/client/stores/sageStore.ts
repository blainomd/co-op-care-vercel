/**
 * Sage Store — Zustand state for the Sage chat experience
 *
 * Replaces the 300ms polling in CardAndSage.tsx with reactive subscriptions.
 * Moves sendMessage logic out of SageChat.tsx into a shared store so any
 * component (tiles, cards, buttons) can trigger Sage responses.
 *
 * All response generation delegates to SageEngine.ts pure functions.
 */
import { create } from 'zustand';
import type { OnboardingPhase } from './signupStore';
import {
  classify,
  uid,
  getResponse,
  getWelcomeMessage,
  getDynamicTiles,
  loadProfile,
  saveProfile,
  loadMessages,
  type Domain,
  type SageResponse,
  type UserProfile,
  type ProfileUpdates,
  type ConversationContext,
  type InlineComponent,
  type FollowupChip,
  type StoredMessage,
} from '@client/features/sage/engine/SageEngine';
import {
  initMemorySync,
  syncProfileToServer,
  saveSessionMemory,
} from '@client/services/memorySync';

// ─── Message Type ────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'sage';
  content: string;
  timestamp: Date;
  followups?: FollowupChip[];
  component?: InlineComponent;
  componentResult?: unknown;
}

// ─── Store Interface ─────────────────────────────────────────────────

// Who the conversation is currently "about"
export interface ActiveSubject {
  name: string;
  relationship?: string; // "mother", "sister", "neighbor"
  type: 'care_recipient' | 'network_member' | 'self';
}

interface SageState {
  messages: Message[];
  thinking: boolean;
  input: string;
  profile: UserProfile;
  context: ConversationContext;
  activeSubject: ActiveSubject | null;
  initialized: boolean;

  // Actions
  initialize: (opts: {
    isNewUser: boolean;
    isComfortCard: boolean;
    isMember: boolean;
    isReferred: boolean;
    referrerName?: string | null;
    firstName?: string;
    userId?: string;
    initialPhase: OnboardingPhase;
  }) => void;
  sendMessage: (text: string) => void;
  setInput: (text: string) => void;
  setComponentResult: (messageId: string, result: unknown) => void;
  advancePhase: (phase: OnboardingPhase) => void;
  setActiveSubject: (subject: ActiveSubject | null) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function storedToMessage(stored: StoredMessage): Message {
  return {
    id: stored.id,
    role: stored.role,
    content: stored.content,
    timestamp: new Date(stored.timestamp),
  };
}

// ─── Instant Client-Side Profile Extraction ─────────────────────────
// Parses obvious profile data from user messages BEFORE Claude responds.
// Card updates in <100ms instead of waiting 2-3s for API.

function extractInstantProfile(text: string): ProfileUpdates | null {
  const lower = text.toLowerCase();
  const updates: ProfileUpdates = {};
  let found = false;

  // Relationship + name patterns: "my mom Alice", "caring for my father Bob"
  const relPatterns: Array<[RegExp, string]> = [
    [/(?:my|our)\s+(mom|mother|mama|ma)\s+(\w+)/i, 'mother'],
    [/(?:my|our)\s+(dad|father|papa|pa)\s+(\w+)/i, 'father'],
    [/(?:my|our)\s+(wife|spouse)\s+(\w+)/i, 'wife'],
    [/(?:my|our)\s+(husband|spouse)\s+(\w+)/i, 'husband'],
    [/(?:my|our)\s+(grandmother|grandma|nana|nanna)\s+(\w+)/i, 'grandmother'],
    [/(?:my|our)\s+(grandfather|grandpa|papa)\s+(\w+)/i, 'grandfather'],
    [/(?:my|our)\s+(sister|brother|aunt|uncle)\s+(\w+)/i, '$1'],
  ];

  for (const [regex, rel] of relPatterns) {
    const match = text.match(regex);
    if (match) {
      const relationship = rel === '$1' ? match[1]!.toLowerCase() : rel;
      const name = match[2]!;
      if (name.length > 1 && name[0] === name[0]!.toUpperCase()) {
        updates.careRecipient = { ...updates.careRecipient, name, relationship };
        found = true;
      }
    }
  }

  // Simpler: "caring for my mom/dad/wife" without name
  if (!updates.careRecipient?.relationship) {
    const simpleRel = lower.match(
      /(?:caring for|care for|taking care of|looking after|helping)\s+(?:my|our)\s+(mom|mother|dad|father|wife|husband|grandmother|grandma|grandfather|grandpa|sister|brother|aunt|uncle|parent|spouse)/,
    );
    if (simpleRel) {
      const relMap: Record<string, string> = {
        mom: 'mother',
        mother: 'mother',
        dad: 'father',
        father: 'father',
        wife: 'wife',
        husband: 'husband',
        grandmother: 'grandmother',
        grandma: 'grandmother',
        grandfather: 'grandfather',
        grandpa: 'grandfather',
        parent: 'parent',
        spouse: 'spouse',
      };
      updates.careRecipient = {
        ...updates.careRecipient,
        relationship: relMap[simpleRel[1]!] || simpleRel[1],
      };
      found = true;
    }
  }

  // Age: "she's 82", "he is 74 years old", "my mom is 85"
  const ageMatch = text.match(
    /(?:she(?:'s| is)|he(?:'s| is)|they(?:'re| are)|(?:mom|dad|mother|father|wife|husband|grandma|grandmother|grandpa|grandfather)\s+is)\s+(\d{2,3})\s*(?:years?\s*old)?/i,
  );
  if (ageMatch) {
    const age = parseInt(ageMatch[1]!, 10);
    if (age >= 18 && age <= 120) {
      updates.careRecipient = { ...updates.careRecipient, age };
      found = true;
    }
  }

  // Conditions: common medical conditions mentioned
  const conditionMap: Record<string, string> = {
    dementia: 'dementia',
    alzheimer: "Alzheimer's",
    "alzheimer's": "Alzheimer's",
    parkinson: "Parkinson's",
    "parkinson's": "Parkinson's",
    diabetes: 'diabetes',
    cancer: 'cancer',
    copd: 'COPD',
    'heart failure': 'heart failure',
    chf: 'CHF',
    stroke: 'stroke',
    arthritis: 'arthritis',
    osteoporosis: 'osteoporosis',
    depression: 'depression',
    anxiety: 'anxiety',
    ms: 'MS',
    'multiple sclerosis': 'multiple sclerosis',
    als: 'ALS',
    blind: 'vision loss',
    deaf: 'hearing loss',
    wheelchair: 'mobility impairment',
    fall: 'fall risk',
    falls: 'fall risk',
    memory: 'memory issues',
  };
  const foundConditions: string[] = [];
  for (const [keyword, label] of Object.entries(conditionMap)) {
    if (lower.includes(keyword)) {
      foundConditions.push(label);
      found = true;
    }
  }
  if (foundConditions.length > 0) {
    updates.careRecipient = { ...updates.careRecipient, conditions: foundConditions };
  }

  // Living situation: "lives alone", "lives with us", "in a facility"
  if (lower.includes('lives alone') || lower.includes('living alone')) {
    updates.careRecipient = { ...updates.careRecipient, livingSituation: 'alone' };
    found = true;
  } else if (lower.includes('lives with') || lower.includes('living with')) {
    updates.careRecipient = { ...updates.careRecipient, livingSituation: 'with_family' };
    found = true;
  } else if (
    lower.includes('nursing home') ||
    lower.includes('assisted living') ||
    lower.includes('facility')
  ) {
    updates.careRecipient = { ...updates.careRecipient, livingSituation: 'facility' };
    found = true;
  }

  // Location: "in Boulder", "in Denver", "lives in [City]"
  const locationMatch = text.match(
    /(?:lives?\s+in|based\s+in|from|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:,\s*[A-Z]{2})?)/,
  );
  if (
    locationMatch &&
    !['My', 'The', 'This', 'That', 'A'].includes(locationMatch[1]!.split(' ')[0]!)
  ) {
    updates.careRecipient = { ...updates.careRecipient, location: locationMatch[1] };
    found = true;
  }

  // Employment: "I work full time", "I'm retired"
  if (lower.includes('retired') || lower.includes("i'm retired")) {
    updates.caregiverContext = { employment: 'retired' };
    found = true;
  } else if (lower.includes('full time') || lower.includes('full-time')) {
    updates.caregiverContext = { employment: 'full_time' };
    found = true;
  } else if (lower.includes('part time') || lower.includes('part-time')) {
    updates.caregiverContext = { employment: 'part_time' };
    found = true;
  }

  // Network members: "my sister Lisa helps", "my neighbor John"
  const networkMatch = text.match(
    /(?:my)\s+(sister|brother|neighbor|friend|daughter|son|aunt|uncle|niece|nephew)\s+([A-Z][a-z]+)/,
  );
  if (networkMatch) {
    updates.networkMembers = [
      {
        name: networkMatch[2],
        relationship: networkMatch[1]!.toLowerCase(),
      },
    ];
    found = true;
  }

  return found ? updates : null;
}

// Quick merge for optimistic updates (simpler than the full mergeProfileUpdates)
function mergeProfileQuick(base: UserProfile, updates: ProfileUpdates): UserProfile {
  const merged = { ...base };

  if (updates.careRecipient) {
    const existing = merged.careRecipient ?? {};
    merged.careRecipient = {
      ...existing,
      ...Object.fromEntries(
        Object.entries(updates.careRecipient).filter(
          ([, v]) => v !== undefined && v !== null && v !== '',
        ),
      ),
      conditions: [
        ...new Set([...(existing.conditions ?? []), ...(updates.careRecipient.conditions ?? [])]),
      ],
      medications: [
        ...new Set([...(existing.medications ?? []), ...(updates.careRecipient.medications ?? [])]),
      ],
      riskFlags: [
        ...new Set([...(existing.riskFlags ?? []), ...(updates.careRecipient.riskFlags ?? [])]),
      ],
    };
  }

  if (updates.caregiverContext) {
    merged.caregiverContext = {
      ...(merged.caregiverContext ?? {}),
      ...updates.caregiverContext,
    };
  }

  if (updates.networkMembers?.length) {
    const existing = merged.network ?? [];
    for (const member of updates.networkMembers) {
      if (!existing.some((m) => m.name?.toLowerCase() === member.name?.toLowerCase())) {
        existing.push(member);
      }
    }
    merged.network = existing;
  }

  return merged;
}

// ─── Active Subject Detection ───────────────────────────────────────
// Detects WHO the user is talking about from their message.
// Returns null if no clear subject is detected (keeps previous subject).

function detectActiveSubject(text: string, profile: UserProfile): ActiveSubject | null {
  const lower = text.toLowerCase();

  // Check for self-references first
  const selfPhrases = [
    'how am i',
    'my stress',
    'my wellness',
    'about me',
    "i'm feeling",
    'i feel',
    'i need',
    'my burnout',
  ];
  for (const phrase of selfPhrases) {
    if (lower.includes(phrase)) {
      return { name: 'Me', type: 'self' };
    }
  }

  // Check for care recipient by name (if we know them)
  if (profile.careRecipient?.name) {
    const crName = profile.careRecipient.name.toLowerCase();
    if (lower.includes(crName)) {
      return {
        name: profile.careRecipient.name,
        relationship: profile.careRecipient.relationship,
        type: 'care_recipient',
      };
    }
  }

  // Check for known network members by name
  if (profile.network) {
    for (const member of profile.network) {
      if (member.name && lower.includes(member.name.toLowerCase())) {
        return {
          name: member.name,
          relationship: member.relationship,
          type: 'network_member',
        };
      }
    }
  }

  // Check for relationship references ("my mom", "my dad")
  const relMap: Record<string, string> = {
    'my mom': 'mother',
    'my mother': 'mother',
    'my mama': 'mother',
    'my dad': 'father',
    'my father': 'father',
    'my papa': 'father',
    'my wife': 'wife',
    'my husband': 'husband',
    'my spouse': 'spouse',
    'my grandma': 'grandmother',
    'my grandmother': 'grandmother',
    'my grandpa': 'grandfather',
    'my grandfather': 'grandfather',
    'my sister': 'sister',
    'my brother': 'brother',
    'my daughter': 'daughter',
    'my son': 'son',
  };
  for (const [phrase, rel] of Object.entries(relMap)) {
    if (lower.includes(phrase)) {
      // If we know their care recipient has this relationship, use their name
      if (profile.careRecipient?.relationship === rel && profile.careRecipient.name) {
        return { name: profile.careRecipient.name, relationship: rel, type: 'care_recipient' };
      }
      // Check network members
      const networkMatch = profile.network?.find((m) => m.relationship === rel);
      if (networkMatch?.name) {
        return { name: networkMatch.name, relationship: rel, type: 'network_member' };
      }
      // Unknown person with this relationship
      return {
        name: rel.charAt(0).toUpperCase() + rel.slice(1),
        relationship: rel,
        type: 'care_recipient',
      };
    }
  }

  return null;
}

// ─── Store ───────────────────────────────────────────────────────────

export const useSageStore = create<SageState>((set, get) => ({
  messages: [],
  thinking: false,
  input: '',
  profile: loadProfile(),
  context: {
    lastDomain: null,
    onboardingPhase: 'fresh',
    suggestedQuestion: null,
    dynamicTiles: [],
  },
  activeSubject: null,
  initialized: false,

  initialize: (opts) => {
    if (get().initialized) return;

    const profile = loadProfile();
    const initialPhase = opts.initialPhase;

    // Load saved messages or generate welcome
    let messages: Message[];
    if (opts.isNewUser) {
      const welcome = getWelcomeMessage({ isNewVisitor: true });
      messages = [
        {
          id: uid(),
          role: 'sage',
          content: welcome.content,
          timestamp: new Date(),
          followups: welcome.followups,
        },
      ];
    } else if (opts.userId) {
      const saved = loadMessages(opts.userId);
      if (saved.length > 0) {
        messages = saved.map(storedToMessage);
      } else {
        const welcome = getWelcomeMessage({
          isComfortCard: opts.isComfortCard,
          isMember: opts.isMember,
          isReferred: opts.isReferred,
          referrerName: opts.referrerName,
          firstName: opts.firstName,
        });
        messages = [
          {
            id: uid(),
            role: 'sage',
            content: welcome.content,
            timestamp: new Date(),
            followups: welcome.followups,
          },
        ];
      }
    } else {
      const welcome = getWelcomeMessage({ isNewVisitor: true });
      messages = [
        {
          id: uid(),
          role: 'sage',
          content: welcome.content,
          timestamp: new Date(),
          followups: welcome.followups,
        },
      ];
    }

    const dynamicTiles = getDynamicTiles(initialPhase, null, opts.isReferred, profile);

    set({
      messages,
      profile,
      context: {
        lastDomain: null,
        onboardingPhase: initialPhase,
        suggestedQuestion: null,
        dynamicTiles,
      },
      initialized: true,
    });

    // ── Server-side memory sync — hydrate profile from PostgreSQL ──
    if (opts.userId) {
      initMemorySync(opts.userId)
        .then((serverProfile) => {
          if (serverProfile && serverProfile.conversationCount > 0) {
            // Server had richer data — update the store
            const currentProfile = get().profile;
            if ((serverProfile.conversationCount ?? 0) > (currentProfile.conversationCount ?? 0)) {
              saveProfile(serverProfile);
              set({ profile: serverProfile });
            }
          }
        })
        .catch(() => {
          // Server unavailable — localStorage is fine
        });
    }
  },

  sendMessage: (text: string) => {
    if (!text.trim()) return;

    // ── Rate limiting: 10 questions per user per day ──
    const DAILY_LIMIT = 10;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const rateLimitKey = 'coop_sage_daily_count';
    const stored = localStorage.getItem(rateLimitKey);
    const rateData: { date: string; count: number } = stored
      ? JSON.parse(stored)
      : { date: today, count: 0 };

    // Reset counter if new day
    if (rateData.date !== today) {
      rateData.date = today;
      rateData.count = 0;
    }

    if (rateData.count >= DAILY_LIMIT) {
      const limitMsg: Message = {
        id: uid(),
        role: 'sage',
        content: `You've reached your daily limit of ${DAILY_LIMIT} conversations with Sage. This resets at midnight.\n\nFor immediate help, email **blaine@co-op.care** or call us directly. Members get unlimited access.`,
        timestamp: new Date(),
      };
      set((state) => ({ messages: [...state.messages, limitMsg] }));
      return;
    }

    // Increment counter
    rateData.count += 1;
    localStorage.setItem(rateLimitKey, JSON.stringify(rateData));

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    // ── Optimistic profile extraction — update card INSTANTLY ──
    const instantUpdates = extractInstantProfile(text);

    // ── Detect who the user is talking about ──
    const detectedSubject = detectActiveSubject(text, loadProfile());

    if (instantUpdates) {
      const quickProfile = mergeProfileQuick(loadProfile(), instantUpdates);
      saveProfile(quickProfile);
      syncProfileToServer(quickProfile);
      set((state) => ({
        messages: [...state.messages, userMsg],
        input: '',
        thinking: true,
        profile: quickProfile,
        activeSubject: detectedSubject ?? state.activeSubject,
      }));
    } else {
      set((state) => ({
        messages: [...state.messages, userMsg],
        input: '',
        thinking: true,
        activeSubject: detectedSubject ?? state.activeSubject,
      }));
    }

    const domain = classify(text);
    const currentProfile = loadProfile();
    const currentPhase = get().context.onboardingPhase;

    // ── Safety-critical & component-trigger domains stay LOCAL ──
    // These respond instantly, work offline, never hallucinate.
    const LOCAL_ONLY: Domain[] = ['emergency', 'crisis', 'assessment', 'family_intake'];
    const useLocalEngine = LOCAL_ONLY.includes(domain);

    // ── Merge profile updates from Claude ──
    const mergeProfileUpdates = (base: UserProfile, updates?: ProfileUpdates): UserProfile => {
      if (!updates) return base;

      const merged = { ...base };

      // Merge care recipient (additive — never overwrite with empty)
      if (updates.careRecipient) {
        const existing = merged.careRecipient ?? {};
        merged.careRecipient = {
          ...existing,
          ...Object.fromEntries(
            Object.entries(updates.careRecipient).filter(
              ([, v]) => v !== undefined && v !== null && v !== '',
            ),
          ),
          // Array fields: merge, don't replace
          conditions: [
            ...new Set([
              ...(existing.conditions ?? []),
              ...(updates.careRecipient.conditions ?? []),
            ]),
          ],
          medications: [
            ...new Set([
              ...(existing.medications ?? []),
              ...(updates.careRecipient.medications ?? []),
            ]),
          ],
          riskFlags: [
            ...new Set([...(existing.riskFlags ?? []), ...(updates.careRecipient.riskFlags ?? [])]),
          ],
        };
      }

      // Merge caregiver context
      if (updates.caregiverContext) {
        merged.caregiverContext = {
          ...(merged.caregiverContext ?? {}),
          ...Object.fromEntries(
            Object.entries(updates.caregiverContext).filter(
              ([, v]) => v !== undefined && v !== null,
            ),
          ),
        };
      }

      // Merge network members (additive by name)
      if (updates.networkMembers && updates.networkMembers.length > 0) {
        const existing = merged.network ?? [];
        for (const newMember of updates.networkMembers) {
          const idx = existing.findIndex(
            (m) => m.name?.toLowerCase() === newMember.name?.toLowerCase(),
          );
          if (idx >= 0) {
            existing[idx] = { ...existing[idx], ...newMember };
          } else {
            existing.push(newMember);
          }
        }
        merged.network = existing;
      }

      // Award seeds
      if (updates.seedsEarned && updates.seedsEarned > 0) {
        const ledger = merged.seeds ?? { total: 0, history: [] };
        ledger.total += updates.seedsEarned;
        ledger.history.push({
          action: updates.seedReason ?? 'Sage conversation',
          seeds: updates.seedsEarned,
          date: new Date().toISOString(),
        });
        // Keep history trimmed to last 50 entries
        if (ledger.history.length > 50) {
          ledger.history = ledger.history.slice(-50);
        }
        merged.seeds = ledger;
      }

      return merged;
    };

    // Shared finalize logic for both local and Claude paths
    const finalize = (response: SageResponse, profileUpdates?: ProfileUpdates) => {
      const sageMsg: Message = {
        id: uid(),
        role: 'sage',
        content: response.content,
        timestamp: new Date(),
        followups: response.followups,
        component: response.component,
      };

      let nextPhase = currentPhase;
      if (currentPhase === 'fresh') {
        nextPhase = 'exploring';
      } else if (
        currentPhase === 'exploring' &&
        (domain === 'family_intake' || domain === 'worker_intake')
      ) {
        nextPhase = 'profile_intent';
      }

      // Merge Claude's profile extractions + increment conversation stats
      const baseUpdate: UserProfile = {
        ...currentProfile,
        conversationCount: currentProfile.conversationCount + 1,
        topDomains: {
          ...currentProfile.topDomains,
          [domain]: (currentProfile.topDomains[domain] ?? 0) + 1,
        },
        lastVisit: new Date().toISOString(),
      };
      const updatedProfile = mergeProfileUpdates(baseUpdate, profileUpdates);
      saveProfile(updatedProfile);
      syncProfileToServer(updatedProfile);

      // Save session memory for cross-session recall
      const allMessages = [...get().messages].map((m) => ({ role: m.role, content: m.content }));
      saveSessionMemory(allMessages, updatedProfile).catch(() => {});

      const suggestedQuestion = response.followups?.[0]?.message ?? null;
      const dynamicTiles = getDynamicTiles(nextPhase, domain, undefined, updatedProfile);

      set({
        messages: [...get().messages, sageMsg],
        thinking: false,
        profile: updatedProfile,
        context: {
          lastDomain: domain,
          onboardingPhase: nextPhase,
          suggestedQuestion,
          dynamicTiles,
        },
      });
    };

    if (useLocalEngine) {
      // ── Local engine — instant, no network ──
      setTimeout(
        () => {
          const response: SageResponse = getResponse(text, {
            phase: currentPhase,
            isMember: currentPhase === 'onboarded' || currentPhase === 'returning',
            profile: currentProfile,
          });
          finalize(response);
        },
        300 + Math.random() * 200,
      );
      return;
    }

    // ── Claude Sonnet API ──
    // Build conversation history for context
    const history = get()
      .messages.slice(-10)
      .map((m) => ({
        role: m.role as 'user' | 'sage',
        content: m.content,
      }));

    const currentSubject = get().activeSubject;
    const profilePayload = {
      ciiScore: currentProfile.lastMiniCII?.total,
      ciiZone: currentProfile.lastMiniCII?.zone,
      criScore: currentProfile.lastCRI?.total,
      criZone: currentProfile.lastCRI?.zone,
      omahaFlags: currentProfile.lastCRI?.omahaFlags,
      conversationCount: currentProfile.conversationCount,
      topDomains: currentProfile.topDomains,
      // Send full living profile so Claude can build on it
      careRecipient: currentProfile.careRecipient,
      caregiverContext: currentProfile.caregiverContext,
      network: currentProfile.network,
      seedsTotal: currentProfile.seeds?.total,
      // Who we're currently talking about
      activeSubject: currentSubject
        ? {
            name: currentSubject.name,
            relationship: currentSubject.relationship,
            type: currentSubject.type,
          }
        : undefined,
    };

    fetch('/api/v1/sage/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history, profile: profilePayload }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json();
      })
      .then(
        (data: {
          content?: string;
          followups?: FollowupChip[];
          profileUpdates?: ProfileUpdates;
          fallback?: boolean;
        }) => {
          if (data.fallback || !data.content) throw new Error('Fallback requested');
          finalize(
            {
              content: data.content,
              followups: data.followups,
            },
            data.profileUpdates,
          );
        },
      )
      .catch(() => {
        // Graceful degradation to local keyword engine
        const response: SageResponse = getResponse(text, {
          phase: currentPhase,
          isMember: currentPhase === 'onboarded' || currentPhase === 'returning',
          profile: currentProfile,
        });
        finalize(response);
      });
  },

  setInput: (text: string) => {
    set({ input: text });
  },

  setComponentResult: (messageId: string, result: unknown) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, componentResult: result } : m,
      ),
    }));
  },

  advancePhase: (phase: OnboardingPhase) => {
    set((state) => ({
      context: {
        ...state.context,
        onboardingPhase: phase,
        dynamicTiles: getDynamicTiles(phase, state.context.lastDomain, undefined, state.profile),
      },
    }));
  },

  setActiveSubject: (subject: ActiveSubject | null) => {
    set({ activeSubject: subject });
  },
}));
