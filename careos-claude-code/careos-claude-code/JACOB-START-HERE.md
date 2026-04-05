# Jacob — Start Here (CohesionX Labs — cohesionxlabs.com)

## What Actually Exists (March 2026)

The app is a **client-side React SPA** with no backend required for demo mode. Sage is a pure-function keyword classifier running entirely in the browser. There is no server-side intent router, no voice drawer, no streaming endpoints.

### Architecture at a Glance

```
Client (React 19 + Vite 6 + HashRouter)
  ├── 5 Zustand stores (auth, signup, sage, ui, share)
  ├── SageEngine.ts — 25-domain keyword classifier (pure functions, client-side)
  ├── SageChat.tsx — Chat UI with inline components
  ├── CardAndSage.tsx — Main experience (Card + Tiles + Sage)
  └── Demo mode — works offline, no backend needed
```

## Routes (HashRouter)

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | AuthRedirect | Redirects based on auth state |
| `/join` | SignupFlow | Free Comfort Card signup |
| `/q/:memberId` | QRLanding | Viral QR referral landing |
| `/welcome` | WelcomeReveal | Post-signup reveal |
| `/card` | CardAndSage | Main app — Card + Tiles + Sage |
| `/my-card` | redirect → `/card` | Legacy redirect |
| `/qr/:code` | redirect → `/q/:code` | Legacy redirect |

All routes are lazy-loaded with Suspense + FeatureErrorBoundary.

## Zustand Stores (5)

| Store | Key State | Persistence |
|-------|-----------|-------------|
| `authStore` | user, isAuthenticated, activeRole | HttpOnly cookies |
| `signupStore` | cardHolder, referrals, onboardingPhase | localStorage (`coop_comfort_card`) |
| `sageStore` | messages, thinking, input, profile, context | localStorage (`coop_user_profile`) |
| `uiStore` | sidebarOpen, activeModal | Memory only |
| `shareStore` | shareModalOpen, dismissedBanners | localStorage (`careos_dismissed_banners`) |

## Sage Architecture

Sage is **entirely client-side**. No server endpoints, no streaming, no LLM calls.

### Files

```
src/client/features/sage/
  engine/
    SageEngine.ts     — 25-domain keyword classifier + response generator (pure functions)
  SageChat.tsx        — Chat UI, rich text rendering, inline components
  CardAndSage.tsx     — Main page: Card on top, tiles in middle, Sage chat below
  CareCard.tsx        — QR identity card for members
  NewUserCard.tsx     — Welcome card for new visitors
  DashboardTiles.tsx  — Role-aware tile grid (new/comfort/member variants)
  InlineMiniCII.tsx   — Inline caregiver burnout assessment
  InlineRolePicker.tsx — Community role selection
  InlineConsentPicker.tsx — Memory consent picker
```

### How Sage Works

1. User types message → `sageStore.sendMessage()`
2. Store calls `SageEngine.classify(msg)` → returns one of 25 domains
3. Store calls `SageEngine.getResponse(msg, opts)` → returns `SageResponse`
4. Response includes: `content`, optional `followups`, optional `component`, optional `actions`
5. Simulated thinking delay (800-1400ms) for natural feel

### 25 Domains

`emergency`, `crisis`, `assessment`, `billing`, `timebank`, `scheduling`, `family_intake`, `worker_intake`, `how_different`, `membership`, `tier`, `qr`, `streaks`, `governance`, `coverage`, `lmn`, `referral`, `respite_fund`, `equity`, `care_logs`, `intake`, `human_escalation`, `background_check`, `care_questions`, `emotional_support`, `default`

### Inline Components

Messages can embed interactive components:
- **`mini_cii`** — 6-question Caregiver Intensity Index (scores green/yellow/red zones)
- **`role_picker`** — Select community roles during onboarding
- **`consent_picker`** — Memory consent (granted/session_only)

### Onboarding Phases

`fresh` → `exploring` → `profile_intent` → `profile_roles` → `profile_community` → `memory_consent` → `onboarded` → `returning`

## Demo Mode

The app works without any backend. `authStore.ts` provides a demo user:
- **Name:** Sarah Chen
- **Member ID:** COOP-2026-0847
- **Roles:** conductor, timebank_member, admin
- **Active role:** conductor
- **Tier:** Seedling, 44h balance

All API calls fall back to demo data when the server is unavailable.

## Quick Start

```bash
export PATH="/Users/blaine/local/node/bin:$PATH"
npm install
npm run dev          # Vite dev server on :5173
npm run build        # tsc --noEmit && vite build → dist/client/
```

## Build & Deploy

- **Build output:** `dist/client/` (static SPA)
- **PWA:** vite-plugin-pwa generates service worker + manifest
- **Code splitting:** 14 feature-based chunks (vendor-react, vendor-zustand, feat-sage, feat-onboarding, etc.)
- **Proxy:** Dev server proxies `/api` → `localhost:3001` and `/ws` → `ws://localhost:3001`

## Key Files to Know

| File | What it does |
|------|-------------|
| `src/client/App.tsx` | HashRouter, lazy routes, auth check on mount |
| `src/client/main.tsx` | React root, QueryClient setup |
| `src/client/features/sage/engine/SageEngine.ts` | All Sage intelligence (classify, respond, tiles) |
| `src/client/stores/sageStore.ts` | Sage state machine + message handling |
| `src/client/stores/signupStore.ts` | Comfort Card holder + referral tracking |
| `src/client/features/sage/CardAndSage.tsx` | Main screen layout |
| `src/client/features/sage/DashboardTiles.tsx` | Role-aware tile sections |
| `src/shared/constants/business-rules.ts` | All business rules and constants |
| `vite.config.ts` | Build config, PWA, code splitting |

## What Changed Recently

### March 18, 2026
- ✅ **FAQ page** — `/#/faq` — 30+ accordion questions across 8 sections (About, Clinical, Services, HSA/FSA, Partners, Tech, Caregivers, Boulder). Matches PartnersPage design pattern.
- ✅ **BCH partnership materials** — PDF leave-behind and email drafts built with TEAM model analysis, telehealth revenue ($526/mo), CAPC scorecard
- ✅ **Telehealth integration planned** — Doxy.me (Phase 1, free HIPAA tier) → Twilio Video (Phase 2, CareOS-native). Jacob: Twilio Video SDK integration is your ~10 week scope build.
- ✅ **CMS TEAM model** — Mandatory bundled payment model now active (Jan 2026). Covers LEJR, hip fracture, spinal fusion, CABG, major bowel. 30-day post-discharge episodes. co-op.care's post-discharge services directly reduce episode cost. This is the #1 sales argument for BCH.

### March 15, 2026
- ✅ **Voice input** — Web Speech API dictation in SageChat.tsx (mic button)
- ✅ **Card collapse** — Card shrinks to compact strip after conversation starts, auto-scrolls to chat
- ✅ **Living profile** — Empty-state prompts (`?` placeholders) visible before any data, fill as you chat
- ✅ **Memory sync** — Client syncs profile to server (debounced 3s) after every change
- ✅ **Identity verification** — `/#/verify` route with phone + DL camera capture
- ✅ **PostgreSQL** — All SurrealDB references replaced
- ✅ Claude API integration — Sage calls Claude Sonnet for non-safety-critical domains (falls back to local engine offline)

## Backend (exists but not required for demo)

Server files exist under `src/server/` (Fastify 5.2 + PostgreSQL + Redis) but the client runs fully standalone in demo mode. Backend modules include auth, timebank, assessments, billing, etc.

### New Modules (March 15, 2026) — Ready to Wire

These were built today and need backend wiring:

#### 1. Memory System (`src/server/modules/memory/`)
**Priority: HIGH — this is what makes Sage commercial-grade.**
- `schema.sql` — Run this against PostgreSQL to create `user_profiles`, `conversation_memory`, `conversation_sessions` tables
- `service.ts` — Profile CRUD + conversation memory + session tracking
- `routes.ts` — REST API: GET/PUT profile, GET/POST memory summary, session start/end
- `plugin.ts` — Register in `app.ts` with `app.register(memoryPlugin)`
- **Client already wired:** `src/client/services/memorySync.ts` syncs localStorage ↔ server. `sageStore.ts` calls `syncProfileToServer()` after every profile change and `saveSessionMemory()` after every Claude response.

#### 2. FHIR Import (`src/server/modules/fhir-import/`)
Pulls patient health records INTO Sage's profile (reverse of existing fhir-sync which pushes OUT).
- `service.ts` — Parses FHIR R4 Bundles → extracts Conditions, Medications, Allergies, Vitals, CarePlans
- `routes.ts` — POST /patient (import), POST /connect (SMART auth stub), GET /status/:userId
- `plugin.ts` — Register in `app.ts`

#### 3. Identity Verification (`src/client/features/verify/IdentityVerify.tsx`)
Client-side flow at `/#/verify`: phone entry → camera capture of driver's license → mock OCR → consent checkboxes. Currently uses mock data — needs Persona or Jumio server-side integration.

### Database: PostgreSQL (NOT SurrealDB)

**IMPORTANT:** All SurrealDB references have been replaced. The database is PostgreSQL, aligned with Health Samurai/Aidbox.
- Connection: `src/server/database/postgres.ts` (uses `pg` Pool)
- Config: `DATABASE_URL` env var (not SURREALDB_*)
- Docker: `docker-compose.yml` has `postgres:16-alpine` service
- Query files in `src/server/database/queries/` have `@ts-nocheck` — they need rewriting from SurrealDB API calls to `pool.query()` SQL

### Routes Update

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Homepage | Landing page |
| `/card` | CardAndSage | Main app — Card + Tiles + Sage (card collapses after chatting) |
| `/verify` | IdentityVerify | Phone + driver's license verification |
| `/q/:memberId` | QRLanding | Viral QR referral |
| `/visit/:memberId` | VisitSession | Care visit session |
| `/partners` | PartnersPage | Employer/healthcare partner page (BCH-facing) |
| `/faq` | FAQPage | 30+ questions, 8 sections, accordion UI |
| `/lmn` | LMNGenerator | Letter of Medical Necessity generator |
| `/assess` | VideoHomeAssessment | Video home safety assessment |
| `/sim` | SimulationDashboard | Simulation dashboard |

### Priority Routes for Jacob

1. **`/#/card`** — Main Sage experience. This is where 90% of user time happens.
2. **`/#/faq`** — New FAQ page, live on Vercel. Review for content accuracy.
3. **`/#/partners`** — BCH team is looking at this page. Must be polished.
4. **`/#/lmn`** — LMN generation flow. Josh reviews/signs these. Revenue generator.
5. **`/#/assess`** — Video home assessment. Families do this from their phone.

### Upcoming Build: Telehealth (Twilio Video SDK)

**Scope:** ~10 weeks | **Priority:** HIGH — this is the 9x revenue multiplier

**Phase 1 (this week):** Doxy.me free tier for Josh's LMN consults. No dev work needed.

**Phase 2 (Jacob's build):** Twilio Video embedded natively in CareOS.
- New route: `/#/telehealth` or embed in `/#/visit/:memberId`
- Twilio Video SDK (JS) — room creation, token generation, recording
- Server-side: `src/server/modules/telehealth/` — room management, recording storage, billing event trigger
- Sage ambient pipeline validates on recorded sessions (Phase 3)
- Must support incident-to billing (Josh's NPI, BCH facility)
- HIPAA BAA required with Twilio before production
