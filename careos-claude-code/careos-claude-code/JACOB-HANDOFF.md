# Jacob Handoff -- co-op.care CareOS

**Last updated:** 2026-03-24
**From:** Blaine Warkentine
**Contact:** blaine@atlashealth.com
**Priority:** Secondary to SurgeonAccess. Slow burn. Build when SurgeonAccess tasks are clear.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│              Vercel (Frontend)                     │
│  ┌────────────────────────────────────────────┐   │
│  │  React 19 + Vite PWA                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │ Sage AI  │  │ CareCard │  │ Living   │ │   │
│  │  │ Chat     │  │ QR+Tiles │  │ Profile  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘ │   │
│  │  5 Zustand stores | HashRouter | Demo mode │   │
│  └────────────────────┬───────────────────────┘   │
└───────────────────────┼───────────────────────────┘
                        │ (currently demo mode -- no backend calls)
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
  ┌────────────┐ ┌────────────┐ ┌────────────┐
  │  Fastify 5 │ │  Aidbox    │ │   Redis    │
  │  PostgreSQL│ │  FHIR R4   │ │  Cache +   │
  │  port 3001 │ │  (Phase 2) │ │  Pub-Sub   │
  └────────────┘ └────────────┘ └────────────┘
```

**Current state:** Frontend runs in demo mode. No backend wired up yet. All Sage AI responses are generated client-side via keyword classification in `SageEngine.ts`.

---

## Setup

```bash
cd co-op.care
npm install
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3001 (when wired)
```

**Environment variables** (create `.env`):

```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:pass@localhost:5432/careos
REDIS_URL=redis://localhost:6379
AIDBOX_URL=https://your-instance.aidbox.app   # Phase 2
AIDBOX_CLIENT_ID=...                           # Phase 2
AIDBOX_CLIENT_SECRET=...                       # Phase 2
```

**Deployed at:** https://careos-claude-code.vercel.app

---

## Backend Architecture (Fastify Modules)

The backend is a modular monolith in `src/server/`. Each module is a Fastify plugin.

### Planned modules (build in this order):

1. **auth** -- Member registration, login, session management
2. **profiles** -- Living Profile CRUD, CareCard generation
3. **sage** -- Server-side Sage AI (replace client-side engine with Claude API calls)
4. **assessments** -- CII/CRI scoring, PROMIS-29
5. **lmn** -- LMN generation, review queue, Josh's approval workflow
6. **care** -- Care matching, scheduling, visit logging
7. **ambient** -- AmbientScribe audio processing, transcription
8. **fhir** -- Aidbox FHIR R4 integration (Phase 2)

---

## PostgreSQL Schema

### members

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT UNIQUE NOT NULL,       -- COOP-YYYY-XXXX format
  email TEXT,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'family',           -- family | conductor | caregiver | admin
  onboarding_phase TEXT DEFAULT 'fresh',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### profiles (Living Profile)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  data JSONB NOT NULL DEFAULT '{}',     -- Structured profile from Sage conversations
  cii_score FLOAT,                      -- Caregiver Impact Index (0-100)
  cii_zone TEXT,                        -- green | yellow | red
  cri_score FLOAT,                      -- Care Readiness Index (0-100)
  cri_level TEXT,                       -- low | moderate | high | critical
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### conversations (Sage AI)

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  messages JSONB NOT NULL DEFAULT '[]',
  domain TEXT,                          -- Current conversation domain (26 options)
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);
```

### lmn_drafts

```sql
CREATE TABLE lmn_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  profile_snapshot JSONB NOT NULL,      -- Frozen profile data at time of generation
  draft_text TEXT NOT NULL,             -- AI-generated LMN content
  status TEXT DEFAULT 'pending',        -- pending | reviewed | signed | rejected
  reviewer_notes TEXT,                  -- Josh's notes
  signed_by TEXT,                       -- Josh's NPI
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### care_sessions

```sql
CREATE TABLE care_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES members(id),
  caregiver_member_id UUID REFERENCES members(id),
  session_type TEXT,                    -- companion | standard | comprehensive
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',      -- scheduled | in_progress | completed | cancelled
  notes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Sage AI Domain System

Sage classifies user messages into 26 domains via keyword matching (currently client-side). Domains include:

- medical, medications, cognitive, mobility, nutrition, sleep, pain
- emotional, social, financial, legal, housing, transportation
- daily_living, safety, caregiver_stress, family_dynamics
- end_of_life, cultural, spiritual, technology, exercise
- substance, sexual_health, dental, vision_hearing, general

Each domain triggers domain-specific follow-up questions and profile data extraction.

**What to build:** Replace client-side `SageEngine.ts` with server-side Claude API calls. Keep the domain classification but use Claude for response generation. Store conversations in PostgreSQL.

---

## What to Build Next (Priority Order)

### Phase 1: Auth + Persistence (Weeks 1-3)
1. Member registration (email + phone)
2. Session management (JWT or Supabase-style tokens)
3. Profile persistence (save Living Profile to PostgreSQL)
4. Conversation persistence (save Sage conversations)

### Phase 2: LMN Workflow (Weeks 4-6)
5. LMN generation endpoint (Claude API + profile data -> draft LMN)
6. Review queue UI for Josh (list pending LMNs, approve/reject)
7. Electronic signature flow
8. LMN delivery (PDF generation, email to family)

### Phase 3: Care Operations (Weeks 7-10)
9. Caregiver profiles and availability
10. Care session scheduling
11. Visit logging and time tracking
12. Basic billing (hours x rate)

---

## What NOT to Touch

- **Sage's personality and tone.** Sage is warm, empathetic, never clinical. Don't change the conversational style.
- **CareCard design.** The QR + 3-tile layout is locked.
- **Legacy inline styles.** Only use Tailwind for new features. Don't refactor old styles.
- **Demo mode.** Keep it working -- it's the main way to show the product.
- **Onboarding flow.** The phase progression (fresh -> exploring -> ... -> returning) is intentional.

---

## Communication

- **Email:** blaine@atlashealth.com
- This is a slow-burn project. SurgeonAccess is the priority.
- Async updates preferred. End-of-week summary is fine.
- When in doubt about clinical features, ask -- Josh has final say on anything medical.
