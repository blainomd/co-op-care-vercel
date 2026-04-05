# Sage Frontend ↔ Backend Wiring Guide

**Date:** 2026-03-14
**Author:** Claude Code (for Blaine/Jacob)
**Status:** Frontend shipped, backend needs wiring

---

## The Gap

The Sage frontend (chat + CareCard + NudgeTiles) is fully functional but runs **entirely in localStorage**. The full Fastify backend with PostgreSQL, Aidbox FHIR, and Redis exists but is not connected. This doc specifies exactly what needs wiring.

### What Works Today (localStorage only)
- Sage chat with Claude Sonnet via Vercel serverless function (`api/sage.ts`)
- Living Profile: care recipient, network members, caregiver context
- CII/CRI assessments with scoring
- Care Seeds rewards
- Active subject tracking (who conversation is about)
- Instant client-side profile extraction from messages
- Card updates in real-time during conversation

### What's Missing
- **No server persistence** — profile lost on browser clear or new device
- **No user-scoped data** — localStorage keyed by UID but not synced to DB
- **No FHIR sync** — Omaha problems extracted but not sent to Aidbox
- **Vercel serverless** (`api/sage.ts`) duplicates backend sage module logic
- **No care recipient CRUD** through proper family routes

---

## Architecture: Current vs. Target

```
CURRENT (localStorage):
User types → SageEngine classifies → Claude API (Vercel) → sageStore (Zustand) → localStorage

TARGET (server-persisted):
User types → SageEngine classifies → /api/v1/sage/chat (Fastify) → Claude API → sageStore → PostgreSQL
                                                                                            ↓
                                                                              Aidbox FHIR (Omaha sync)
```

---

## Wiring Tasks (Priority Order)

### Task 1: Profile Persistence to PostgreSQL

**Files to modify:**
- `src/server/modules/sage/service.ts` — Add profile save/load methods
- `src/server/modules/sage/routes.ts` — Add `GET /profile` and `PUT /profile` endpoints
- `src/client/features/sage/engine/SageEngine.ts` — Replace `loadProfile()`/`saveProfile()` with API calls

**What exists:**
- `SageEngine.ts` exports `loadProfile()` and `saveProfile()` (lines 549-559) — these read/write `localStorage`
- PostgreSQL `user` table already has fields for profile data
- PostgreSQL `care_recipient` table matches the `CareRecipient` interface exactly

**What to build:**
```typescript
// New: src/server/modules/sage/profile-service.ts

export const profileService = {
  async loadProfile(userId: string): Promise<UserProfile> {
    // 1. Query PostgreSQL: SELECT * FROM user WHERE id = $userId
    // 2. Query linked care_recipients: SELECT * FROM care_recipient WHERE family IN (SELECT id FROM family WHERE conductor = $userId)
    // 3. Query network: already in user record or separate table
    // 4. Map to UserProfile shape
  },

  async saveProfile(userId: string, profile: UserProfile): Promise<void> {
    // 1. UPDATE user SET ... WHERE id = $userId
    // 2. UPSERT care_recipient (by name/relationship match)
    // 3. Save seeds ledger
    // 4. Trigger FHIR sync if Omaha problems changed
  },
};
```

**Client-side bridge:**
```typescript
// Replace in SageEngine.ts:
// FROM: localStorage.getItem('sage_profile')
// TO:   fetch('/api/v1/sage/profile', { credentials: 'include' }).then(r => r.json())

// With fallback: if not authenticated, continue using localStorage (public visitors)
```

**PostgreSQL schema mapping:**
| Frontend (UserProfile)     | PostgreSQL Table.Field              |
|---------------------------|-------------------------------------|
| `careRecipient.name`      | `care_recipient.first_name`        |
| `careRecipient.age`       | `care_recipient.date_of_birth`     |
| `careRecipient.conditions`| `care_recipient.diagnoses[].name`  |
| `careRecipient.riskFlags` | `care_recipient.omaha_problems[].code` |
| `careRecipient.medications`| `care_recipient.medications[].name`|
| `lastMiniCII`             | `assessment` (type='mini_cii')     |
| `lastCRI`                 | `assessment` (type='cri')          |
| `seeds`                   | `timebank_account.earned_balance`  |
| `network`                 | `user.care_network[]` (new field)  |
| `conversationCount`       | `user.sage_conversation_count`     |

---

### Task 2: Replace Vercel Serverless with Fastify Sage Route

**Current:** `api/sage.ts` (Vercel serverless) calls Claude directly
**Target:** `src/server/modules/sage/routes.ts` POST `/chat` calls Claude

**Files to modify:**
- `src/server/modules/sage/service.ts` — Replace keyword engine with Claude API call (like `api/sage.ts` does now)
- `src/server/modules/sage/routes.ts` — Already has `POST /chat` endpoint
- `src/client/stores/sageStore.ts` — Change `fetch('/api/sage')` to `fetch('/api/v1/sage/chat')`

**What to move:**
1. Copy `buildSystemPrompt()` from `api/sage.ts` into `sage/service.ts`
2. Copy `buildProfileContext()` from `api/sage.ts` into `sage/service.ts`
3. Add `ANTHROPIC_API_KEY` to server config (`src/server/config/settings.ts`)
4. Replace `sageService.chat()` body with Claude API call
5. Add PHI stripping (already built: `src/server/modules/sage/phi-strip.ts`)
6. Persist conversation to PostgreSQL for session continuity

**Key: Keep `api/sage.ts` as fallback** for the Vercel deployment until Fastify server is hosted.

---

### Task 3: Conversation History Persistence

**Files to modify:**
- `src/server/modules/sage/service.ts` — Add conversation CRUD
- New PostgreSQL table: `sage_conversation`

**Schema:**
```sql
DEFINE TABLE sage_conversation SCHEMAFULL;
DEFINE FIELD user ON sage_conversation TYPE record(user);
DEFINE FIELD messages ON sage_conversation TYPE array;
DEFINE FIELD messages.*.id ON sage_conversation TYPE string;
DEFINE FIELD messages.*.role ON sage_conversation TYPE string ASSERT $value IN ['user', 'sage'];
DEFINE FIELD messages.*.content ON sage_conversation TYPE string;
DEFINE FIELD messages.*.timestamp ON sage_conversation TYPE datetime;
DEFINE FIELD active_subject ON sage_conversation TYPE option<object>;
DEFINE FIELD created_at ON sage_conversation TYPE datetime DEFAULT time::now();
DEFINE FIELD updated_at ON sage_conversation TYPE datetime DEFAULT time::now();
DEFINE INDEX idx_user ON sage_conversation FIELDS user;
```

**Client-side:**
- `SageEngine.ts` already has `loadMessages(userId)` and `saveMessages(userId, messages)` that use localStorage
- Replace with API calls: `GET /api/v1/sage/conversations` and `POST /api/v1/sage/conversations`

---

### Task 4: FHIR Sync for Omaha Problems

**What exists:**
- `src/server/modules/fhir-sync/` — Full transactional outbox pattern
- `api/sage.ts` already extracts `omahaProblems` from Claude responses
- Client-side `classifyOmahaProblems()` in SageEngine.ts

**What to wire:**
1. When Claude returns `omahaProblems`, save to `care_recipient.omaha_problems[]` in PostgreSQL
2. Trigger FHIR sync: Create `Observation` resources in Aidbox for each Omaha problem
3. This creates the clinical documentation trail for LMN generation

**This is the money connection:** Omaha problems from Sage conversations → FHIR Observations → LMN auto-generation → HSA/FSA eligibility → revenue.

---

### Task 5: Active Subject → Care Recipient CRUD

**What exists:**
- `src/server/modules/family/routes.ts` — Full CRUD for care recipients
- Frontend `activeSubject` state in sageStore
- Frontend `CareRecipient` interface in SageEngine.ts

**What to wire:**
1. When Sage extracts a care recipient profile, check if one exists in `care_recipient` table (by name + family)
2. If not, create one via `POST /api/v1/families/:familyId/care-recipients`
3. If yes, update via `PUT /api/v1/families/:familyId/care-recipients/:id`
4. The `activeSubject` in sageStore maps to a `care_recipient` record

**Multiple care recipients:** The PostgreSQL schema already supports this (care_recipient belongs to family, family has many care_recipients). The frontend currently has `profile.careRecipient` (singular) — this should become `profile.careRecipients[]` (array) to support families caring for multiple people.

---

### Task 6: Network Members → Care Team

**What exists:**
- `src/server/modules/family/routes.ts` — `POST /:familyId/care-team` to assign members
- Frontend extracts network members during conversation

**What to wire:**
1. `NetworkMember` from Sage → `POST /api/v1/families/:familyId/care-team`
2. Each network member gets a `user` record (or pending invite)
3. When they scan a QR code, they link to the family

---

## Environment Variables Needed

For the hosted Fastify server (NOT Vercel):
```env
# Already defined in .env.example:
POSTGRES_URL=postgresql://postgres:5432/careos
POSTGRES_SCHEMA=careos
POSTGRES_DATABASE=production
REDIS_URL=redis://your-redis-host:6379
AIDBOX_URL=https://your-aidbox-host
ANTHROPIC_API_KEY=sk-ant-...

# Hosting options:
# - PostgreSQL Cloud (e.g., Neon, Supabase) or self-hosted on Railway/Fly.io
# - Redis: Upstash (free tier) or Railway
# - Aidbox: aidbox.app cloud or self-hosted
# - Server: Railway, Fly.io, or Render
```

---

## Deployment Strategy

### Phase 1: Keep Vercel + add persistence (quickest win)
- Add **Vercel KV** (built-in Redis) for profile persistence
- Modify `api/sage.ts` to save/load profiles from Vercel KV
- No infrastructure changes needed
- Limitation: only profiles, not full FHIR sync

### Phase 2: Host Fastify server alongside Vercel
- Deploy Fastify to Railway/Fly.io with PostgreSQL + Redis
- Point Vercel frontend to Fastify API
- Keep Vercel for static hosting + CDN
- Full backend features available

### Phase 3: Full production
- Aidbox FHIR integration live
- LMN auto-generation pipeline connected
- WebSocket real-time updates
- Background jobs running (LMN triggers, KBS reassessment)

---

## Quick Reference: Key Files

| Purpose | File |
|---------|------|
| Client profile read/write | `src/client/features/sage/engine/SageEngine.ts` (lines 549-559) |
| Client conversation state | `src/client/stores/sageStore.ts` |
| Client chat UI | `src/client/features/sage/SageChat.tsx` |
| Client card UI | `src/client/features/sage/CareCard.tsx` |
| Vercel Claude API | `api/sage.ts` |
| Server sage routes | `src/server/modules/sage/routes.ts` |
| Server sage service | `src/server/modules/sage/service.ts` |
| Server family/care-recipient | `src/server/modules/family/routes.ts` |
| PostgreSQL schema | `src/server/database/schema.sql` |
| PostgreSQL client | `src/server/database/postgres.ts` |
| Aidbox FHIR client | `src/server/database/aidbox.ts` |
| PHI stripping | `src/server/modules/sage/phi-strip.ts` |
| Auth middleware | `src/server/middleware/auth.middleware.ts` |

---

## What Blaine Built This Session (March 14, 2026)

1. **Committed `api/sage.ts`** — Vercel serverless function with full Claude Sonnet integration, Omaha System prompt, cooperative knowledge base, profile extraction
2. **Profile reactivity** — CareCard and NudgeTiles now subscribe to sageStore (Zustand) instead of one-shot localStorage reads
3. **Instant profile extraction** — Client-side regex parses names, relationships, ages, conditions, locations from user messages BEFORE Claude responds
4. **Active subject tracking** — Detects WHO the conversation is about, shows context pill in chat header, sends to Claude
5. **Care circle visualization** — Network members appear as tappable pills on the card, with gentle nudge for small networks
6. **Listening fix** — Added 20+ keywords to classifier so Sage recognizes its own followup-chip phrases
7. **Claude prompt improvements** — #1 rule: listen and respond to what was actually said. Care circle discovery prompts. Profile extraction rules strengthened.
8. **Card pulse animation** — Visual ring glow when profile data changes during conversation
