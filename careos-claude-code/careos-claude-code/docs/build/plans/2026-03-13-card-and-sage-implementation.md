# Card + Sage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Collapse 117 routes into 4 and 118 feature files into 6 client components + 18 server files. Two surfaces: CareCard (QR + tiles) and Sage Voice Drawer (conversational AI for everything else).

**Architecture:** Card fills the screen (QR identity, balance, 3 role-aware tiles). Floating mic button opens half-screen Sage voice drawer. All business logic lives server-side behind 5 API endpoints. 12 Sage domain handlers absorb all feature functionality.

**Tech Stack:** React 19, TypeScript 5, Tailwind CSS 4, Fastify 5, Zustand, Web Speech API (interim STT/TTS), Gemini Flash 2.0 (intent routing).

**Design Doc:** `docs/plans/2026-03-13-card-and-sage-simplification-design.md` (919 lines, authoritative reference for all business rules, feature absorption map, and domain handler specs)

---

## Prerequisite Knowledge

### Existing Patterns
- **Auth:** Zustand store at `src/client/stores/authStore.ts` — HttpOnly cookies, demo mode auto-login with roles `['conductor', 'timebank_member', 'admin']`, `activeRole` drives tile selection
- **API client:** `src/client/services/api.ts` — `api.get/post()` with cookie auth, base URL `/api/v1`
- **Sage backend:** `src/server/modules/sage/` — `plugin.ts` (Fastify plugin + rate limit), `routes.ts` (POST /chat, POST /intent), `service.ts` (keyword classifier, 12 domains, response generator), `schemas.ts` (Zod: sageChatSchema, sageIntentSchema, SageResponse type), `gemini.service.ts` (stub for Gemini Flash)
- **QR pattern:** `src/client/features/billing/ComfortCardDigital.tsx` — 21×21 deterministic QR grid, tier-colored gradients, `coop://m/{memberId}` data encoding
- **Business rules:** `src/shared/constants/business-rules.ts` — UNTOUCHED. All scoring, tiers, matching, Omaha coding preserved
- **Types:** `src/shared/types/` — `user.types.ts` (User, UserRole), `assessment.types.ts`, `timebank.types.ts`, `care-tier.types.ts` — all UNTOUCHED

### File Locations
- Project root: `/Users/blaine/Desktop/careos-claude-code/careos-claude-code/`
- Node binary: `/Users/blaine/local/node/bin` (add to PATH for all commands)

---

## Task 1: Shared Types — Card + Sage Interfaces

**Files:**
- Create: `src/shared/types/card.types.ts`
- Create: `src/shared/types/sage-message.types.ts`

### Step 1: Create Card types

```typescript
// src/shared/types/card.types.ts
import type { CareTierLevel } from './care-tier.types';

export interface CardTile {
  label: string;
  value: string;
  sublabel?: string;
  color: 'sage' | 'copper' | 'gold' | 'blue' | 'red' | 'yellow' | 'gray';
  icon?: string;
  pulse?: boolean;
}

export interface CardTilesResponse {
  tiles: [CardTile, CardTile, CardTile];
  lastUpdated: string;
}

export interface CardIdentity {
  memberId: string;
  displayName: string;
  memberSince: string;
  tier: CareTierLevel;
  tierEmoji: string;
  balanceFormatted: string;
  balanceHours: number;
  qrData: string;
  activeRole: string;
  avatarUrl?: string;
}
```

### Step 2: Create Sage message types

```typescript
// src/shared/types/sage-message.types.ts

export type SageDomainName =
  | 'care' | 'schedule' | 'assess' | 'timebank' | 'billing'
  | 'onboard' | 'message' | 'emergency' | 'social' | 'govern'
  | 'clinical' | 'admin';

export interface IntentClassification {
  domain: SageDomainName;
  intent: string;
  confidence: number;
  entities: Record<string, string>;
  requiresRole?: string;
}

export interface SageMessageRequest {
  transcript: string;
  sessionId: string;
  role: string;
}

export interface SageInlineCard {
  type: 'schedule' | 'assessment' | 'balance' | 'task' | 'team' | 'lmn' | 'vote' | 'confirmation';
  data: Record<string, unknown>;
}

export interface SageAction {
  id: string;
  label: string;
  icon: string;
  actionType: string;
  payload?: string;
}

export interface SageFollowup {
  label: string;
  message: string;
}

export interface SageMessageResponse {
  text: string;
  cards?: SageInlineCard[];
  actions?: SageAction[];
  followups?: SageFollowup[];
  ttsUrl?: string;
}

export interface SageConversationMessage {
  id: string;
  role: 'user' | 'sage';
  text: string;
  cards?: SageInlineCard[];
  actions?: SageAction[];
  followups?: SageFollowup[];
  timestamp: string;
}
```

### Step 3: Commit

```bash
git add src/shared/types/card.types.ts src/shared/types/sage-message.types.ts
git commit -m "feat: add Card + Sage shared types for simplified two-surface architecture"
```

---

## Task 2: Server — Card Identity Endpoint

**Files:**
- Create: `src/server/modules/card/identity.ts`

### Step 1: Create card identity service

This endpoint returns member card data: name, tier, balance, QR data. In demo mode, returns hardcoded data matching the existing `DEMO_MEMBER` pattern from `ComfortCardDigital.tsx`.

```typescript
// src/server/modules/card/identity.ts
import { logger } from '../../common/logger.js';
import type { CardIdentity } from '../../../shared/types/card.types.js';
import type { UserRole } from '../../../shared/constants/business-rules.js';

const TIER_EMOJI: Record<string, string> = {
  seedling: '🌱',
  rooted: '🌳',
  canopy: '🏔️',
};

export async function getCardIdentity(userId: string, activeRole: UserRole): Promise<CardIdentity> {
  // TODO: Jacob — Query PostgreSQL for real member data
  // SELECT * FROM member WHERE userId = $userId
  // JOIN timebank_balance, care_tier calculation

  logger.info({ userId, activeRole }, 'Card identity requested');

  // Demo data (matches ComfortCardDigital.tsx DEMO_MEMBER)
  return {
    memberId: 'COOP-2026-0847',
    displayName: 'Sarah Chen',
    memberSince: '2026',
    tier: 'seedling',
    tierEmoji: TIER_EMOJI['seedling'],
    balanceFormatted: '$285.00',
    balanceHours: 44,
    qrData: 'coop://m/COOP-2026-0847',
    activeRole,
    avatarUrl: undefined,
  };
}
```

### Step 2: Commit

```bash
git add src/server/modules/card/identity.ts
git commit -m "feat: add card identity endpoint (demo data, PostgreSQL TODO)"
```

---

## Task 3: Server — Card Tiles Endpoint

**Files:**
- Create: `src/server/modules/card/tiles.ts`

### Step 1: Create role-aware tile computation

This is the core intelligence — tiles change per role. All 7 role tile configs from the design doc.

```typescript
// src/server/modules/card/tiles.ts
import { logger } from '../../common/logger.js';
import type { CardTile, CardTilesResponse } from '../../../shared/types/card.types.js';
import type { UserRole } from '../../../shared/constants/business-rules.js';

type TileComputer = (userId: string) => Promise<[CardTile, CardTile, CardTile]>;

const ROLE_TILES: Record<string, TileComputer> = {
  conductor: async (_userId) => [
    { label: 'CII Zone', value: 'Green', sublabel: 'Score: 34/120', color: 'sage', icon: '🟢' },
    { label: 'Next Visit', value: 'Thu 2pm', sublabel: 'w/ Rosa', color: 'blue' },
    { label: 'Tier Progress', value: '12h of 40', sublabel: '→ Rooted', color: 'copper', icon: '⏱' },
  ],
  worker_owner: async (_userId) => [
    { label: 'Current Shift', value: 'Chen, 2pm', sublabel: 'Companion care', color: 'sage' },
    { label: 'Hours Today', value: '4.5h', sublabel: '18h this week', color: 'blue' },
    { label: 'Earnings', value: '$126', sublabel: '+$8 equity', color: 'copper' },
  ],
  timebank_member: async (_userId) => [
    { label: 'Nearby Tasks', value: '3', sublabel: 'within 1mi', color: 'sage' },
    { label: 'Balance', value: '44h', sublabel: 'Time Bank', color: 'blue' },
    { label: 'Streak', value: '8 weeks', sublabel: 'Steady Heart', color: 'gold', icon: '🔥' },
  ],
  medical_director: async (_userId) => [
    { label: 'LMNs Pending', value: '3', sublabel: 'Signature needed', color: 'red', pulse: true },
    { label: 'CRI Reviews', value: '2', sublabel: 'Pending', color: 'yellow' },
    { label: 'Clinical Alerts', value: '0', sublabel: 'All clear', color: 'sage' },
  ],
  admin: async (_userId) => [
    { label: 'Matches Today', value: '12', sublabel: 'Active', color: 'sage' },
    { label: 'Open Tasks', value: '5', sublabel: 'Unmatched', color: 'yellow' },
    { label: 'Quality', value: '94%', sublabel: '↑ 2%', color: 'blue' },
  ],
  employer_hr: async (_userId) => [
    { label: 'Enrolled', value: '47', sublabel: 'Employees', color: 'sage' },
    { label: 'ROI', value: '$12,400', sublabel: 'This month', color: 'gold' },
    { label: 'Utilization', value: '73%', sublabel: '↑ 5%', color: 'blue' },
  ],
  wellness_provider: async (_userId) => [
    { label: 'Bookings', value: '8', sublabel: 'Upcoming', color: 'sage' },
    { label: 'Reviews', value: '4.8★', sublabel: 'This month', color: 'gold' },
    { label: 'Availability', value: 'Open', sublabel: '3 slots today', color: 'sage' },
  ],
};

export async function getCardTiles(userId: string, activeRole: UserRole): Promise<CardTilesResponse> {
  const computer = ROLE_TILES[activeRole] ?? ROLE_TILES.conductor;

  // TODO: Jacob — Replace demo data with PostgreSQL queries per role
  const tiles = await computer(userId);

  logger.info({ userId, activeRole, tileCount: tiles.length }, 'Card tiles computed');

  return {
    tiles,
    lastUpdated: new Date().toISOString(),
  };
}
```

### Step 2: Commit

```bash
git add src/server/modules/card/tiles.ts
git commit -m "feat: add role-aware card tiles computation (7 roles, demo data)"
```

---

## Task 4: Server — Card Routes + Plugin

**Files:**
- Create: `src/server/modules/card/routes.ts`
- Create: `src/server/modules/card/plugin.ts`
- Modify: `src/server/app.ts` — register card plugin

### Step 1: Create card routes

```typescript
// src/server/modules/card/routes.ts
import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getCardIdentity } from './identity.js';
import { getCardTiles } from './tiles.js';

export async function cardRoutes(app: FastifyInstance): Promise<void> {
  app.get('/identity', {
    preHandler: [requireAuth],
  }, async (request) => {
    const { id: userId, activeRole } = (request as any).user;
    return getCardIdentity(userId, activeRole);
  });

  app.get('/tiles', {
    preHandler: [requireAuth],
  }, async (request) => {
    const { id: userId, activeRole } = (request as any).user;
    return getCardTiles(userId, activeRole);
  });
}
```

### Step 2: Create card plugin

```typescript
// src/server/modules/card/plugin.ts
import type { FastifyInstance } from 'fastify';
import { cardRoutes } from './routes.js';

export async function cardPlugin(app: FastifyInstance): Promise<void> {
  await app.register(cardRoutes);
}
```

### Step 3: Register card plugin in app.ts

Find the line where sage plugin is registered. Add card plugin nearby:

```typescript
import { cardPlugin } from './modules/card/plugin.js';
// ...
app.register(cardPlugin, { prefix: '/api/v1/card' });
```

### Step 4: Commit

```bash
git add src/server/modules/card/routes.ts src/server/modules/card/plugin.ts src/server/app.ts
git commit -m "feat: register card API endpoints (GET /card/identity, GET /card/tiles)"
```

---

## Task 5: Server — Sage Intent Router

**Files:**
- Create: `src/server/modules/sage/intent-router.ts`

### Step 1: Create the 12-domain intent router

This wraps the existing keyword classifier with a Gemini Flash layer (stubbed for now). The key innovation: maps intents to domain + specific action.

```typescript
// src/server/modules/sage/intent-router.ts
import { logger } from '../../common/logger.js';
import { geminiService } from './gemini.service.js';
import type { SageDomainName, IntentClassification } from '../../../shared/types/sage-message.types.js';

/** Keyword → domain fallback (preserves existing KEYWORD_MAP from service.ts) */
const KEYWORD_DOMAIN_MAP: Array<[string[], SageDomainName]> = [
  [['not breathing', 'chest pain', 'stroke', '911', 'suicid', 'fell', 'unresponsive'], 'emergency'],
  [['how am i', 'check-in', 'burnout', 'stressed', 'overwhelmed', 'quick check'], 'assess'],
  [['log a visit', 'care log', 'care plan', 'medication', 'team', 'timeline', 'acp', 'wishes', 'directives', 'incident'], 'care'],
  [['schedule', 'appointment', 'thursday', 'come over', 'shift swap', 'book'], 'schedule'],
  [['time bank', 'hours', 'credits', 'balance', 'volunteer', 'task', 'streak', 'expiring', 'deficit'], 'timebank'],
  [['hsa', 'fsa', 'cost', 'pay', 'comfort card', 'insurance', 'lmn status', 'billing', 'tax', 'coverage'], 'billing'],
  [['get started', 'sign up', 'new here', 'help with', 'onboarding'], 'onboard'],
  [['message', 'send', 'read message', 'reply'], 'message'],
  [['invite', 'neighbor', 'referral', 'impact', 'cascade', 'community', 'catalyst', 'gratitude', 'wellness'], 'social'],
  [['vote', 'proposal', 'equity', 'governance', 'board'], 'govern'],
  [['lmn', 'sign lmn', 'cri review', 'clinical alert'], 'clinical'],
  [['admin', 'matching', 'members', 'respite', 'analytics', 'quality', 'pace', 'bch', 'roi', 'enrollment'], 'admin'],
];

function classifyByKeywords(message: string): IntentClassification {
  const lower = message.toLowerCase();
  for (const [keywords, domain] of KEYWORD_DOMAIN_MAP) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return { domain, intent: kw.replace(/\s+/g, '_'), confidence: 0.6, entities: {} };
      }
    }
  }
  // Default: emotional support lives in 'care' domain
  return { domain: 'care', intent: 'emotional_support', confidence: 0.3, entities: {} };
}

export async function classifyIntent(
  message: string,
  role: string,
  sessionContext?: Record<string, unknown>,
): Promise<IntentClassification> {
  // Phase 1: keyword fallback
  // Phase 2 (Jacob): Gemini Flash classification
  if (geminiService.isConfigured()) {
    // TODO: Jacob — Use Gemini Flash to classify into 12 domains + specific intent
    // const prompt = buildClassificationPrompt(message, role, sessionContext);
    // const result = await geminiService.chat({ systemPrompt: ..., userMessage: prompt });
    // return parseClassificationResult(result);
    logger.info({ role }, 'Intent router: Gemini available but using keyword fallback (Phase 1)');
  }

  const classification = classifyByKeywords(message);
  logger.info({ domain: classification.domain, intent: classification.intent, confidence: classification.confidence }, 'Intent classified');
  return classification;
}
```

### Step 2: Commit

```bash
git add src/server/modules/sage/intent-router.ts
git commit -m "feat: add 12-domain Sage intent router (keyword Phase 1, Gemini Phase 2)"
```

---

## Task 6: Server — Sage Domain Handlers (12 files)

**Files:**
- Create: `src/server/modules/sage/domains/care.ts`
- Create: `src/server/modules/sage/domains/schedule.ts`
- Create: `src/server/modules/sage/domains/assess.ts`
- Create: `src/server/modules/sage/domains/timebank.ts`
- Create: `src/server/modules/sage/domains/billing.ts`
- Create: `src/server/modules/sage/domains/onboard.ts`
- Create: `src/server/modules/sage/domains/message.ts`
- Create: `src/server/modules/sage/domains/emergency.ts`
- Create: `src/server/modules/sage/domains/social.ts`
- Create: `src/server/modules/sage/domains/govern.ts`
- Create: `src/server/modules/sage/domains/clinical.ts`
- Create: `src/server/modules/sage/domains/admin.ts`

Each handler receives intent + entities + user context and returns a `SageMessageResponse`.

### Step 1: Create domain handler interface and emergency handler (most critical — must work first)

```typescript
// src/server/modules/sage/domains/emergency.ts
import type { SageMessageResponse } from '../../../../shared/types/sage-message.types.js';

export async function handleEmergency(
  intent: string,
  _entities: Record<string, string>,
  _userId: string,
): Promise<SageMessageResponse> {
  // Emergency domain: immediate, no equivocation
  return {
    text:
      '**If someone is in immediate danger, please call 911 now.**\n\n' +
      'For a mental health crisis: call **988** (Suicide & Crisis Lifeline)\n' +
      'Crisis text: text **741741**\n\n' +
      "I'm here for support, but trained professionals can help right now.",
    actions: [
      { id: 'call-911', label: 'Call 911', icon: '🚨', actionType: 'navigate', payload: 'tel:911' },
      { id: 'call-988', label: 'Crisis Line', icon: '📞', actionType: 'navigate', payload: 'tel:988' },
    ],
  };
}
```

### Step 2: Create assess domain (preserves CII/CRI/KBS scoring rules)

```typescript
// src/server/modules/sage/domains/assess.ts
import type { SageMessageResponse } from '../../../../shared/types/sage-message.types.js';

export async function handleAssess(
  intent: string,
  _entities: Record<string, string>,
  _userId: string,
): Promise<SageMessageResponse> {
  switch (intent) {
    case 'quick_check':
    case 'start_mini_cii':
      return {
        text: "Let's do a quick 30-second check-in. Three questions — completely private, no judgment.\n\nOn a scale of 1 to 10, how much **physical strain** are you feeling from caregiving right now?",
        followups: [
          { label: 'What is this?', message: 'What does the burnout check-in measure?' },
          { label: 'Not now', message: "I don't want to do an assessment right now" },
        ],
      };

    case 'start_cii':
    case 'burnout':
    case 'stressed':
    case 'overwhelmed':
    case 'check-in':
    case 'how_am_i':
      return {
        text: "Let's check in on how you're doing. This covers 12 areas of your life as a caregiver — it takes about 3 minutes.\n\nOn a scale of 1 to 10, how much **physical strain** are you feeling from caregiving right now?",
        followups: [
          { label: 'Quick version', message: "Let's do the quick check instead" },
          { label: 'Not now', message: "I don't want to do an assessment right now" },
        ],
      };

    default:
      return {
        text: "I can help with assessments. Would you like a quick 30-second check-in, or the full 12-dimension burnout assessment?",
        followups: [
          { label: 'Quick check', message: "Let's do the quick check" },
          { label: 'Full assessment', message: 'Start the full burnout assessment' },
          { label: 'View history', message: 'Show my past assessments' },
        ],
      };
  }
}
```

### Step 3: Create care domain (visit logging, Omaha coding, ACP, timeline, team)

```typescript
// src/server/modules/sage/domains/care.ts
import type { SageMessageResponse } from '../../../../shared/types/sage-message.types.js';

export async function handleCare(
  intent: string,
  _entities: Record<string, string>,
  _userId: string,
): Promise<SageMessageResponse> {
  switch (intent) {
    case 'emotional_support':
      return {
        text: "I hear you. What you're feeling — the exhaustion, the guilt, the loneliness — that's not weakness. It's what happens when one person carries too much for too long.\n\n**You are not failing.** You are doing one of the hardest jobs in the world.",
        followups: [
          { label: 'I need a break', message: 'How can I get some respite?' },
          { label: 'Check my burnout', message: "Let's do the burnout check-in" },
          { label: 'Talk to someone', message: 'I want to talk to a real person' },
        ],
      };

    case 'log_a_visit':
    case 'care_log':
      return {
        text: "I'll help you log a visit. Just tell me what happened — who visited, what they helped with, and how it went. I'll auto-code it to the Omaha System.",
        followups: [
          { label: 'Voice note', message: 'I want to dictate a visit note' },
        ],
      };

    case 'care_plan':
    case 'medication':
      return {
        text: "Let me pull up the current care plan. What would you like to review or update?",
        followups: [
          { label: 'Medications', message: "What meds is mom taking?" },
          { label: 'Update plan', message: 'I want to update the care plan' },
        ],
      };

    case 'team':
    case 'timeline':
      return {
        text: "Here's your care team and recent activity. Would you like details on someone specific?",
        followups: [
          { label: 'Recent events', message: 'What happened today?' },
          { label: 'Team members', message: "Who's on mom's team?" },
        ],
      };

    case 'acp':
    case 'wishes':
    case 'directives':
      return {
        text: "Advance care planning is one of the most important conversations you can have. I can guide you through documenting your loved one's wishes — at your pace, no pressure.\n\nWhere would you like to start?",
        followups: [
          { label: 'Directives', message: "Let's talk about advance directives" },
          { label: 'Goals of care', message: 'What matters most to mom?' },
          { label: 'Not ready', message: "I'm not ready for this yet" },
        ],
      };

    default:
      return {
        text: "I can help with care coordination. What's on your mind?",
        followups: [
          { label: 'Log a visit', message: 'I want to log a care visit' },
          { label: 'Care plan', message: "Show me mom's care plan" },
          { label: 'Timeline', message: 'What happened recently?' },
        ],
      };
  }
}
```

### Step 4: Create remaining 9 domain handlers

Each follows the same pattern. Create all 9 in one step:

**`src/server/modules/sage/domains/schedule.ts`** — appointments, visits, shifts, wellness bookings
**`src/server/modules/sage/domains/timebank.ts`** — balance, tasks, streaks, matching, earn/spend, deficit nudges
**`src/server/modules/sage/domains/billing.ts`** — Comfort Card, HSA, LMN questions, tax, reconciliation
**`src/server/modules/sage/domains/onboard.ts`** — voice-guided onboarding (mini-CII → account → full CII → membership → CRI)
**`src/server/modules/sage/domains/message.ts`** — read, reply, compose messages
**`src/server/modules/sage/domains/social.ts`** — referrals, cascade, catalyst, gratitude, community stats
**`src/server/modules/sage/domains/govern.ts`** — voting, proposals, equity (worker-owner gated)
**`src/server/modules/sage/domains/clinical.ts`** — LMN review/sign, CRI review, alerts (MD gated)
**`src/server/modules/sage/domains/admin.ts`** — matching, quality, analytics, respite, members

Each handler exports `async function handle[Domain](intent, entities, userId): Promise<SageMessageResponse>` with switch on intent returning appropriate text + followups + actions. Preserve all business rules from the design doc Section 6.

### Step 5: Create domain index

```typescript
// src/server/modules/sage/domains/index.ts
import type { SageDomainName, SageMessageResponse } from '../../../../shared/types/sage-message.types.js';
import { handleCare } from './care.js';
import { handleSchedule } from './schedule.js';
import { handleAssess } from './assess.js';
import { handleTimebank } from './timebank.js';
import { handleBilling } from './billing.js';
import { handleOnboard } from './onboard.js';
import { handleMessage } from './message.js';
import { handleEmergency } from './emergency.js';
import { handleSocial } from './social.js';
import { handleGovern } from './govern.js';
import { handleClinical } from './clinical.js';
import { handleAdmin } from './admin.js';

type DomainHandler = (intent: string, entities: Record<string, string>, userId: string) => Promise<SageMessageResponse>;

const DOMAIN_HANDLERS: Record<SageDomainName, DomainHandler> = {
  care: handleCare,
  schedule: handleSchedule,
  assess: handleAssess,
  timebank: handleTimebank,
  billing: handleBilling,
  onboard: handleOnboard,
  message: handleMessage,
  emergency: handleEmergency,
  social: handleSocial,
  govern: handleGovern,
  clinical: handleClinical,
  admin: handleAdmin,
};

export function getDomainHandler(domain: SageDomainName): DomainHandler {
  return DOMAIN_HANDLERS[domain] ?? handleCare;
}
```

### Step 6: Commit

```bash
git add src/server/modules/sage/domains/
git commit -m "feat: add 12 Sage domain handlers (all business rules preserved)"
```

---

## Task 7: Server — Update Sage Routes for Card+Sage Architecture

**Files:**
- Modify: `src/server/modules/sage/routes.ts`
- Modify: `src/server/modules/sage/schemas.ts`

### Step 1: Add new Sage message schema

Add to `schemas.ts`:

```typescript
export const sageMessageSchema = z.object({
  transcript: z.string().min(1).max(5000),
  sessionId: z.string().min(1),
  role: z.string().min(1),
});

export type SageMessageInput = z.infer<typeof sageMessageSchema>;

export const sageActionSchema = z.object({
  actionId: z.string().min(1),
  sessionId: z.string().min(1),
  payload: z.record(z.unknown()).optional(),
});

export type SageActionInput = z.infer<typeof sageActionSchema>;
```

### Step 2: Add POST /message route to routes.ts

Add the new route alongside existing `/chat` and `/intent`:

```typescript
// POST /message — Main Sage conversation endpoint (Card+Sage architecture)
app.post('/message', {
  preHandler: [requireAuth],
}, async (request) => {
  const parsed = sageMessageSchema.safeParse(request.body);
  if (!parsed.success) throw new ValidationError('Invalid message');

  const { transcript, sessionId, role } = parsed.data;
  const userId = (request as any).user?.id ?? 'demo:user:001';

  // 1. Classify intent
  const classification = await classifyIntent(transcript, role);

  // 2. Route to domain handler
  const handler = getDomainHandler(classification.domain);
  const response = await handler(classification.intent, classification.entities, userId);

  logger.info({ domain: classification.domain, intent: classification.intent, sessionId }, 'Sage message processed');

  return response;
});
```

Add imports at top of routes.ts:
```typescript
import { sageMessageSchema, sageActionSchema } from './schemas.js';
import { classifyIntent } from './intent-router.js';
import { getDomainHandler } from './domains/index.js';
```

### Step 3: Commit

```bash
git add src/server/modules/sage/routes.ts src/server/modules/sage/schemas.ts
git commit -m "feat: add POST /sage/message route with intent router + domain dispatch"
```

---

## Task 8: Client — QRCode Component (extracted from ComfortCardDigital)

**Files:**
- Create: `src/client/QRCode.tsx`

### Step 1: Extract QR pattern generator

Extract the `QRCodeVisual` function from `ComfortCardDigital.tsx` into a standalone component. Same 21×21 deterministic pattern, same SVG rendering.

```typescript
// src/client/QRCode.tsx
/**
 * QR Code Visual — Deterministic pattern generator
 * Extracted from ComfortCardDigital.tsx for Card+Sage architecture.
 * In production: replace with `qrcode` npm package for scannable QR.
 */

interface QRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export function QRCode({ data, size = 160, className }: QRCodeProps) {
  const cells = 21;
  const cellSize = size / cells;

  // Generate deterministic pattern from data string
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }

  const pattern: boolean[][] = [];
  for (let row = 0; row < cells; row++) {
    pattern[row] = [];
    for (let col = 0; col < cells; col++) {
      // Finder patterns (corners) — always filled
      const inTopLeft = row < 7 && col < 7;
      const inTopRight = row < 7 && col >= cells - 7;
      const inBottomLeft = row >= cells - 7 && col < 7;
      if (inTopLeft || inTopRight || inBottomLeft) {
        const r = inTopLeft ? row : inTopRight ? row : row - (cells - 7);
        const c = inTopLeft ? col : inTopRight ? col - (cells - 7) : col;
        pattern[row][col] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      } else {
        // Data modules — deterministic from hash
        const seed = (hash + row * 31 + col * 17) & 0xffff;
        pattern[row][col] = seed % 3 !== 0;
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="QR code for co-op.care member identification"
    >
      <rect width={size} height={size} fill="white" rx={4} />
      {pattern.map((row, ri) =>
        row.map((cell, ci) =>
          cell ? (
            <rect
              key={`${ri}-${ci}`}
              x={ci * cellSize}
              y={ri * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1B3A5C"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
```

### Step 2: Commit

```bash
git add src/client/QRCode.tsx
git commit -m "feat: extract QR code component from ComfortCardDigital"
```

---

## Task 9: Client — CareCard Component

**Files:**
- Create: `src/client/CareCard.tsx`

### Step 1: Build the main card surface

The card fills the screen: header (wordmark + balance), QR identity center, 3 smart tiles bottom. Uses React Query for data fetching with demo fallbacks.

```typescript
// src/client/CareCard.tsx
import { useState, useEffect } from 'react';
import { QRCode } from './QRCode';
import { useAuthStore } from './stores/authStore';
import { api } from './services/api';
import type { CardIdentity, CardTilesResponse, CardTile } from '@shared/types/card.types';

const TIER_GRADIENTS: Record<string, string> = {
  seedling: 'from-sage/20 to-teal/10',
  rooted: 'from-copper/20 to-gold/10',
  canopy: 'from-navy/20 to-sage-dark/10',
};

const TILE_COLORS: Record<string, string> = {
  sage: 'bg-sage/10 text-sage-dark',
  copper: 'bg-copper/10 text-copper',
  gold: 'bg-gold/10 text-gold-dark',
  blue: 'bg-blue/10 text-blue',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-zone-yellow/10 text-zone-yellow',
  gray: 'bg-gray-100 text-gray-600',
};

// Demo fallbacks (no server needed)
const DEMO_IDENTITY: CardIdentity = {
  memberId: 'COOP-2026-0847',
  displayName: 'Sarah Chen',
  memberSince: '2026',
  tier: 'seedling',
  tierEmoji: '🌱',
  balanceFormatted: '$285',
  balanceHours: 44,
  qrData: 'coop://m/COOP-2026-0847',
  activeRole: 'conductor',
};

const DEMO_TILES: [CardTile, CardTile, CardTile] = [
  { label: 'CII Zone', value: 'Green', sublabel: 'Score: 34/120', color: 'sage', icon: '🟢' },
  { label: 'Next Visit', value: 'Thu 2pm', sublabel: 'w/ Rosa', color: 'blue' },
  { label: 'Tier Progress', value: '12h of 40', sublabel: '→ Rooted', color: 'copper', icon: '⏱' },
];

export function CareCard() {
  const activeRole = useAuthStore((s) => s.activeRole);
  const [identity, setIdentity] = useState<CardIdentity>(DEMO_IDENTITY);
  const [tiles, setTiles] = useState<[CardTile, CardTile, CardTile]>(DEMO_TILES);

  useEffect(() => {
    // Try to fetch from server, fall back to demo data
    api.get<CardIdentity>('/card/identity').then(setIdentity).catch(() => {});
    api.get<CardTilesResponse>('/card/tiles').then((r) => setTiles(r.tiles)).catch(() => {});
  }, [activeRole]);

  // Refresh tiles every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      api.get<CardTilesResponse>('/card/tiles').then((r) => setTiles(r.tiles)).catch(() => {});
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const gradient = TIER_GRADIENTS[identity.tier] ?? TIER_GRADIENTS.seedling;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center w-full py-4">
        <span className="font-serif text-lg font-semibold text-navy">co-op.care</span>
        <span className="text-sm font-medium text-sage-dark">
          {identity.tierEmoji} {identity.balanceFormatted}
        </span>
      </div>

      {/* Identity Card */}
      <div className={`w-full rounded-2xl bg-gradient-to-br ${gradient} p-6 flex flex-col items-center shadow-sm`}>
        <QRCode data={identity.qrData} size={140} className="rounded-lg shadow-inner" />
        <p className="mt-3 text-base font-semibold text-navy">{identity.displayName}</p>
        <p className="text-xs text-sage-dark/70">Member since {identity.memberSince}</p>
      </div>

      {/* Smart Tiles */}
      <div className="grid grid-cols-3 gap-3 w-full mt-4">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={`rounded-xl p-3 text-center ${TILE_COLORS[tile.color] ?? TILE_COLORS.gray} relative`}
          >
            {tile.pulse && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            {tile.icon && <span className="text-sm">{tile.icon}</span>}
            <p className="text-xs font-medium opacity-70 mt-0.5">{tile.label}</p>
            <p className="text-lg font-bold leading-tight">{tile.value}</p>
            {tile.sublabel && <p className="text-[10px] opacity-60">{tile.sublabel}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/client/CareCard.tsx
git commit -m "feat: add CareCard component (QR identity + 3 role-aware tiles)"
```

---

## Task 10: Client — SageMicButton Component

**Files:**
- Create: `src/client/SageMicButton.tsx`

### Step 1: Build floating mic button with pulse animation

```typescript
// src/client/SageMicButton.tsx

interface SageMicButtonProps {
  isListening: boolean;
  onTap: () => void;
}

export function SageMicButton({ isListening, onTap }: SageMicButtonProps) {
  return (
    <button
      onClick={onTap}
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        w-16 h-16 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        ${isListening
          ? 'bg-red-500 scale-110 shadow-red-500/30 shadow-xl animate-pulse'
          : 'bg-sage hover:bg-sage-dark shadow-sage/30'
        }
      `}
      aria-label={isListening ? 'Listening... tap to stop' : 'Talk to Sage'}
    >
      {isListening ? (
        // Waveform icon (listening)
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ) : (
        // Microphone icon (idle)
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
        </svg>
      )}
    </button>
  );
}
```

### Step 2: Commit

```bash
git add src/client/SageMicButton.tsx
git commit -m "feat: add SageMicButton with pulse animation"
```

---

## Task 11: Client — SageVoiceDrawer Component

**Files:**
- Create: `src/client/SageVoiceDrawer.tsx`

### Step 1: Build the half-screen voice drawer

This is the core Sage UI. Slides up from bottom, shows conversation stream, handles STT via Web Speech API (interim), sends transcript to `POST /api/v1/sage/message`.

```typescript
// src/client/SageVoiceDrawer.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from './stores/authStore';
import { api } from './services/api';
import type { SageConversationMessage, SageMessageResponse } from '@shared/types/sage-message.types';

interface SageVoiceDrawerProps {
  isOpen: boolean;
  isListening: boolean;
  onClose: () => void;
  onListeningChange: (listening: boolean) => void;
  onCardRefresh: () => void;
}

export function SageVoiceDrawer({ isOpen, isListening, onClose, onListeningChange, onCardRefresh }: SageVoiceDrawerProps) {
  const activeRole = useAuthStore((s) => s.activeRole);
  const [messages, setMessages] = useState<SageConversationMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(`sage-${Date.now()}`);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Auto-dismiss after 10s of silence
  useEffect(() => {
    if (isOpen && !isListening && !isProcessing) {
      silenceTimerRef.current = setTimeout(onClose, 10_000);
    }
    return () => clearTimeout(silenceTimerRef.current);
  }, [isOpen, isListening, isProcessing, onClose]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: SageConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await api.post<SageMessageResponse>('/sage/message', {
        transcript: text.trim(),
        sessionId: sessionIdRef.current,
        role: activeRole ?? 'conductor',
      });

      const sageMsg: SageConversationMessage = {
        id: `sage-${Date.now()}`,
        role: 'sage',
        text: response.text,
        cards: response.cards,
        actions: response.actions,
        followups: response.followups,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, sageMsg]);

      // TTS: speak the response (Web Speech API interim)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.text.replace(/\*\*/g, '').replace(/\n/g, '. '));
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
      }

      // Refresh card tiles if Sage might have changed data
      onCardRefresh();
    } catch {
      const errorMsg: SageConversationMessage = {
        id: `sage-err-${Date.now()}`,
        role: 'sage',
        text: "I'm having trouble connecting right now. Want to try again?",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, [activeRole, onCardRefresh]);

  // Web Speech API for STT (interim — Phase 2: Google Cloud STT)
  useEffect(() => {
    if (!isListening) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onListeningChange(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
      onListeningChange(false);
    };

    recognition.onerror = () => onListeningChange(false);
    recognition.onend = () => onListeningChange(false);

    recognition.start();
    return () => { try { recognition.stop(); } catch {} };
  }, [isListening, onListeningChange, sendMessage]);

  // Handle text input submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(textInput);
    setTextInput('');
  };

  // Handle followup chip click
  const handleFollowup = (message: string) => {
    sendMessage(message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 transition-transform duration-300"
      style={{ height: '60vh', transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sage animate-pulse" />
          <span className="text-sm font-semibold text-navy">Sage</span>
        </div>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
      </div>

      {/* Conversation stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-24" style={{ height: 'calc(100% - 120px)' }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p className="text-lg mb-1">🌿</p>
            <p>Hi, I'm Sage. How can I help?</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-sage text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              {msg.text}
            </div>

            {/* Followup chips */}
            {msg.followups && msg.followups.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.followups.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => handleFollowup(f.message)}
                    className="text-xs px-3 py-1.5 rounded-full border border-sage/30 text-sage hover:bg-sage/10 transition-colors"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {msg.actions.map((a) => (
                  <button
                    key={a.id}
                    className="text-xs px-3 py-2 rounded-lg bg-sage text-white hover:bg-sage-dark transition-colors"
                    onClick={() => {
                      if (a.actionType === 'navigate' && a.payload) {
                        window.location.href = a.payload;
                      }
                    }}
                  >
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="text-left mb-3">
            <div className="inline-block bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-sage rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Text input fallback */}
      <form onSubmit={handleTextSubmit} className="absolute bottom-0 inset-x-0 p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 focus:border-sage focus:ring-1 focus:ring-sage/30 outline-none"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="px-4 py-2.5 rounded-full bg-sage text-white text-sm font-medium disabled:opacity-40 hover:bg-sage-dark transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/client/SageVoiceDrawer.tsx
git commit -m "feat: add SageVoiceDrawer with STT, TTS, conversation stream, followup chips"
```

---

## Task 12: Client — CardAndSage Page Shell

**Files:**
- Create: `src/client/CardAndSage.tsx`

### Step 1: Build the single page shell

This orchestrates CareCard + SageMicButton + SageVoiceDrawer.

```typescript
// src/client/CardAndSage.tsx
import { useState, useCallback, useEffect } from 'react';
import { CareCard } from './CareCard';
import { SageMicButton } from './SageMicButton';
import { SageVoiceDrawer } from './SageVoiceDrawer';
import { useAuthStore } from './stores/authStore';

export function CardAndSage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cardRefreshKey, setCardRefreshKey] = useState(0);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const handleMicTap = useCallback(() => {
    if (drawerOpen && isListening) {
      // Stop listening
      setIsListening(false);
    } else {
      // Open drawer and start listening
      setDrawerOpen(true);
      setIsListening(true);
    }
  }, [drawerOpen, isListening]);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
    setIsListening(false);
  }, []);

  const handleCardRefresh = useCallback(() => {
    setCardRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      {/* Demo mode banner */}
      {!import.meta.env.PROD && (
        <div className="bg-zone-yellow/20 border-b border-zone-yellow/30 px-4 py-1.5 text-center text-xs text-zone-yellow">
          Demo Mode — data shown is illustrative only
        </div>
      )}

      {/* Card — fills available space, compresses when drawer opens */}
      <div className={`flex-1 flex items-start justify-center pt-4 transition-all duration-300 ${
        drawerOpen ? 'pb-[62vh]' : 'pb-24'
      }`}>
        <CareCard key={cardRefreshKey} />
      </div>

      {/* Sage Voice Drawer */}
      <SageVoiceDrawer
        isOpen={drawerOpen}
        isListening={isListening}
        onClose={handleClose}
        onListeningChange={setIsListening}
        onCardRefresh={handleCardRefresh}
      />

      {/* Floating Mic Button */}
      <SageMicButton isListening={isListening} onTap={handleMicTap} />
    </div>
  );
}
```

### Step 2: Commit

```bash
git add src/client/CardAndSage.tsx
git commit -m "feat: add CardAndSage page shell (Card + mic + voice drawer)"
```

---

## Task 13: Rewrite App.tsx — 117 Routes → 4

**Files:**
- Modify: `src/client/App.tsx`

### Step 1: Replace entire App.tsx content

The new App.tsx is dramatically simpler. 4 routes, no lazy imports, no AppShell/Sidebar/RoleGate.

```typescript
// src/client/App.tsx
import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Legacy components (inline styles — DO NOT apply Tailwind)
import { Website, ProductMap, Enzyme, CareUBI, Synthesis } from './legacy';

// The two surfaces
import { CardAndSage } from './CardAndSage';
import { CareCard } from './CareCard';
import { NotFound } from './components/NotFound';
import { useAuthStore } from './stores/authStore';

export function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <HashRouter>
      <Routes>
        {/* ═══ THE APP: Card + Sage ═══ */}
        <Route path="/" element={<CardAndSage />} />
        <Route path="/join" element={<CardAndSage />} />

        {/* Public QR card (no auth required) */}
        <Route path="/my-card" element={
          <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
            <CareCard />
          </div>
        } />

        {/* QR scan handler — routes to Sage onboarding */}
        <Route path="/qr/:code" element={<CardAndSage />} />

        {/* Legacy routes (preserved for bookmarks) */}
        <Route path="/legacy" element={<Website />} />
        <Route path="/product-map" element={<ProductMap />} />
        <Route path="/enzyme" element={<Enzyme />} />
        <Route path="/care-ubi" element={<CareUBI />} />
        <Route path="/synthesis" element={<Synthesis />} />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
```

### Step 2: Commit

```bash
git add src/client/App.tsx
git commit -m "feat: collapse 117 routes to 4 — Card + Sage is the entire app"
```

---

## Task 14: Archive Old Feature Files

**Files:**
- Move: all files from `src/client/features/` → `src/client/archive/`
- Delete: No longer needed layout components (Sidebar, etc.)

### Step 1: Move feature directories to archive

```bash
mkdir -p src/client/archive
mv src/client/features/* src/client/archive/
```

### Step 2: Remove no-longer-imported layout components

The following are no longer imported by App.tsx:
- `AppShell.tsx` — imports Sidebar, NavBar, MobileNav (none needed)

Don't delete AppShell/Sidebar/NavBar/MobileNav yet — they may be imported by archived components. Just leave them in place. The key is that App.tsx no longer imports them.

### Step 3: Verify build compiles

```bash
export PATH="/Users/blaine/local/node/bin:$PATH"
cd /Users/blaine/Desktop/careos-claude-code/careos-claude-code
npx tsc --noEmit
npx vite build
```

Expected: TypeScript and Vite build clean. If errors exist, they'll be from dangling imports in archived files — fix by ensuring archive files don't get imported.

### Step 4: Commit

```bash
git add -A
git commit -m "feat: archive 118 feature files — Card + Sage is the entire UI"
```

---

## Task 15: Build Verification + Visual Check

### Step 1: TypeScript check

```bash
export PATH="/Users/blaine/local/node/bin:$PATH"
cd /Users/blaine/Desktop/careos-claude-code/careos-claude-code
npx tsc --noEmit
```

Expected: 0 errors

### Step 2: Vite build

```bash
npx vite build
```

Expected: Build succeeds, bundle is significantly smaller (only 6 client components vs 118)

### Step 3: Dev server + visual verification

```bash
npx vite --port 5173
```

Verify in browser:
- Card fills screen with QR code, member identity, 3 tiles
- Mic button visible at bottom center (teal circle)
- Tapping mic opens voice drawer (slides up from bottom)
- Text input works in drawer
- Sending a message gets a Sage response
- Followup chips appear and are tappable
- Drawer auto-dismisses after 10s of silence
- `/my-card` shows public card without auth gate
- No sidebar, no navigation, no page hierarchy visible
- Mobile layout: card centered, drawer covers 60% of screen

### Step 4: Final commit if any fixes needed

```bash
git add -A
git commit -m "fix: resolve build issues from Card + Sage migration"
```

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| Client routes | 117 | 4 (+5 legacy) |
| Feature files | 118 | 6 new components |
| Lazy imports | 99 | 0 |
| Server endpoints | 50+ | 5 |
| Sage domains | 12 (switch statement) | 12 (individual handler files) |
| Navigation elements | Sidebar + NavBar + MobileNav + PageHeader | None — mic button only |
| User interaction model | Read → navigate → fill form → submit | Glance at card → talk to Sage |

All business rules, clinical systems, Omaha coding, assessment scoring, and domain knowledge are preserved in the server-side domain handlers and shared constants (untouched).
