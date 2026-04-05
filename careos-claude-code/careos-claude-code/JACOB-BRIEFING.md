# CareOS Backend Briefing — Jacob Pielke (CohesionX Labs)

**Date:** 2026-03-18 (updated)
**Audience:** Backend architecture partner (Firebase/HIPAA, CII/CRI deployment)
**Repo:** `/Users/blaine/Desktop/careos-claude-code`

> **TL;DR for Jacob:** BCH wants to work with us. CMS TEAM model (mandatory bundled payments) makes our post-discharge services a financial necessity for hospitals. Your #1 build priority is Twilio Video telehealth integration (~10 weeks). This unlocks $526/mo per member vs. $59 today. See "What's New" section below.

### Team

| Role | Person | Contact | Responsibilities |
|------|--------|---------|-----------------|
| **CEO** | Blaine Warkentine, MD MPH | blaine@co-op.care | Strategy, partnerships, product architecture, BCH relationship |
| **Medical Director** | Josh Emdur, DO | joshemdur@gmail.com | Clinical oversight, LMN review/signing, care plan approval, incident-to billing (BCH NPI) |
| **Developer** | Jacob Pielke (CohesionX Labs) | cohesionxlabs.com | Backend architecture, frontend wiring, Twilio Video, HIPAA infrastructure |

---

## 1. What Was Built

CareOS is a modular Fastify 5 monolith serving the co-op.care platform — a cooperative home care operating system. The backend has **30 registered module plugins** plus a WebSocket layer, backed by PostgreSQL (operational/graph), Aidbox (FHIR R4 clinical), and Redis (cache/rate-limit/pub-sub).

### Module Inventory

| # | Module | Route Prefix | Auth? | Rate Limited? | Description |
|---|--------|-------------|-------|--------------|-------------|
| 1 | **auth** | `/api/v1/auth` | No (login/register) | Yes (10/min) | JWT RS256 auth, 2FA, refresh token rotation |
| 2 | **family** | `/api/v1/families` | Yes | Global only | Family CRUD, care recipient management |
| 3 | **assessments** | `/api/v1/assessments` | Yes | Yes (30/min) | CII, Mini-CII, CRI scoring + KBS outcome ratings |
| 4 | **timebank** | `/api/v1/timebank` | Yes | Yes (20/min) | Time Bank ledger, task matching, geo check-in/out |
| 5 | **fhir-sync** | `/api/v1/fhir-sync` | Yes | Global only | Transactional outbox PostgreSQL -> Aidbox, reverse webhook |
| 6 | **notifications** | `/api/v1/notifications` | Yes | Global only | Multi-channel dispatch (push, SMS, email, in-app, WebSocket) |
| 7 | **payment** | `/api/v1/payment` | Yes | Yes (20/min) | Stripe billing, Comfort Card, IRS 502 reports, webhooks |
| 8 | **worker** | `/api/v1/worker` | Yes | Global only | Worker-owner profiles, equity (Subchapter T), background checks |
| 9 | **lmn** | `/api/v1/lmn` | Yes | Global only | Letter of Medical Necessity generation + auto-trigger |
| 10 | **admin** | `/api/v1/admin` | Yes (admin role) | **NO** | Admin dashboard, user management, system config |
| 11 | **employer** | `/api/v1/employer` | Yes | Global only | Employer HR portal, benefit integration |
| 12 | **acp** | `/api/v1/acp` | Yes | Global only | Advance Care Planning documents |
| 13 | **coverage** | `/api/v1/coverage` | Yes | Global only | Insurance/coverage verification |
| 14 | **settings** | `/api/v1/settings` | Yes | Global only | User preferences and notification settings |
| 15 | **sage** | `/api/v1/sage` | No (public) | Yes (30/min) | Claude-powered AI assistant, narrative engine, action engine |
| 16 | **contact** | `/api/v1/contact` | No (public) | Yes (5/min) | Lead capture, schedule-a-call form |
| 17 | **referrals** | `/api/v1/referrals` | Yes | Global only | Care referral tracking |
| 18 | **community** | `/api/v1/community` | Yes | Global only | Community features |
| 19 | **reimbursement** | `/api/v1/reimbursement` | Yes | Global only | HSA/FSA reimbursement workflows |
| 20 | **social** | `/api/v1/social` | Yes | Global only | Social features |
| 21 | **matching** | `/api/v1/matching` | Yes | Global only | Caregiver-family matching algorithm |
| 22 | **waitlist** | `/api/v1/waitlist` | Yes | Global only | Waitlist management |
| 23 | **analytics** | `/api/v1/analytics` | Yes | Global only | Reporting and analytics |
| 24 | **web3** | `/api/v1/web3` | Yes | Global only | CareHour token, co-op governance, credential registry |
| 25 | **nutrition** | `/api/v1/nutrition` | Yes | Global only | Nutrition tracking |
| 26 | **referral-rewards** | `/api/v1/referral-rewards` | Yes | Global only | Referral bonus/viral loop system |
| 27 | **peer-support** | `/api/v1/peer-support` | Yes | Global only | Peer support features |
| 28 | **wellness** | `/api/v1/wellness` | Yes | Global only | Wellness provider integration |
| 29 | **email** | (internal only) | N/A | N/A | SendGrid email dispatch service |
| 30 | **wearable-mcp** | (internal only) | N/A | N/A | Wearable device MCP integration |
| -- | **WebSocket** | `/ws` | Via token | N/A | Real-time notifications broadcast |

Additional non-module components:
- **5 background jobs** (scheduler): LMN auto-trigger, LMN renewal, KBS reassessment, TimeBank expiry, membership renewal
- **Transactional outbox** for PostgreSQL -> Aidbox FHIR sync
- **Audit middleware** on all requests

---

## 1.5 What's New (March 18, 2026)

### Business Context
- **BCH partnership is ON.** Met with 5 people from Boulder Community Health. They want to work with us. Follow-up email and PDF sent.
- **CMS TEAM model is live** (Jan 1, 2026). Mandatory bundled payments for 741 hospitals covering LEJR, hip fracture, spinal fusion, CABG, major bowel. 30-day post-discharge episodes. Hospitals that don't reduce post-discharge costs owe CMS money. **This makes co-op.care a financial necessity, not a nice-to-have.**
- **Josh Emdur, DO** is Medical Director. BCH hospitalist since 2008, 50-state licensed. He signs LMNs, reviews care plans, and bills incident-to BCH NPI.

### Technical Updates
- ✅ **FAQ page live** — `/#/faq` with 30+ questions across 8 sections. Deployed to Vercel.
- ✅ **Partners page updated** — BCH team is actively looking at `/#/partners`. Must stay polished.
- ✅ **Telehealth Phase 1** — Doxy.me (free HIPAA tier) deploying this week for Josh's LMN consults. No dev work.
- ✅ **CAPC 2024 Scorecard** — Colorado: 3.5 stars. A for hospital palliative but only 3.0 prescribers/100K in community. Validates our thesis.

### Jacob's Priority Queue (updated)

| Priority | Task | Scope | Revenue Impact |
|----------|------|-------|----------------|
| **P0** | Twilio Video telehealth integration | ~10 weeks | 9x revenue multiplier ($59 → $526/mo) |
| **P1** | Memory module wiring (server registration) | ~2 days | Makes Sage commercial-grade |
| **P1** | FHIR import module wiring | ~3 days | Pull patient records into Sage profiles |
| **P2** | Identity verification (Persona/Jumio) | ~1 week | Required for HIPAA compliance |
| **P2** | LMN → payment flow wiring | ~1 week | HSA/FSA reimbursement revenue |
| **P3** | Stripe webhook idempotency | ~1 day | Prevents duplicate charges |
| **P3** | JWT key validation on startup | ~2 hours | Security blocker |

### Telehealth Build Spec (P0)

**What:** Embed Twilio Video SDK natively in CareOS so Josh can do video visits from within the platform.

**Why:** Without telehealth, membership = $59 PMPM. With telehealth + E/M + PIN + CHI + CCM code stacking = ~$526 PMPM. That's a 9x revenue multiplier.

**Architecture:**
```
New module: src/server/modules/telehealth/
  ├── plugin.ts       — Register with Fastify
  ├── routes.ts       — POST /rooms, GET /token, POST /end, GET /recordings
  ├── service.ts      — Twilio Video SDK (room mgmt, token gen, recording)
  └── schema.ts       — TypeBox validation schemas

Client integration:
  ├── src/client/features/telehealth/TelehealthRoom.tsx — Video UI
  ├── Route: /#/telehealth/:sessionId or embed in /#/visit/:memberId
  └── Sage triggers: "schedule video visit", "start telehealth"

Database:
  ├── telehealth_session table (id, family_id, provider_id, room_sid, status, started_at, ended_at, recording_url)
  └── Links to: care_interaction (for Omaha coding), assessment (for CII/CRI triggers)
```

**Requirements:**
- HIPAA BAA with Twilio (Blaine will initiate)
- Room recordings stored encrypted (S3 or Twilio's recording storage)
- Billing event emitted on session end → triggers E/M code generation
- Josh's NPI and BCH facility code in session metadata (incident-to billing)
- Sage ambient pipeline (Phase 3): transcribe → Omaha code → FHIR observation

**Timeline:** 10 weeks
- Weeks 1-2: Twilio account setup, SDK integration, basic room creation
- Weeks 3-4: Token generation, client UI, recording
- Weeks 5-6: Billing integration (E/M code trigger on session end)
- Weeks 7-8: Sage integration (ambient transcription from recordings)
- Weeks 9-10: Testing, HIPAA compliance review, production deploy

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Fastify 5 Monolith                  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Middleware│  │ 30 Module│  │ Background Jobs  │  │
│  │ (auth,   │  │ Plugins  │  │ (setInterval,    │  │
│  │  audit,  │  │ (routes, │  │  prod only)      │  │
│  │  rate-   │  │  service, │  │                  │  │
│  │  limit,  │  │  schemas) │  │                  │  │
│  │  errors) │  │          │  │                  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ WebSocket│  │ Swagger  │  │ Static Serving   │  │
│  │ (real-   │  │ (dev     │  │ (prod SPA        │  │
│  │  time)   │  │  only)   │  │  fallback)       │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────┬───────────┬──────────┬───────────────┘
              │           │          │
    ┌─────────▼──┐  ┌─────▼────┐  ┌─▼──────────┐
    │ PostgreSQL  │  │ Aidbox   │  │ Redis      │
    │ v2.1.4     │  │ (FHIR R4)│  │ 7-alpine   │
    │            │  │          │  │            │
    │ Operational│  │ Clinical │  │ Rate-limit │
    │ + Graph    │  │ data     │  │ + Cache    │
    │ + Geo      │  │ + HIPAA  │  │ + Pub/Sub  │
    └────────────┘  │          │  └────────────┘
                    │ Postgres │
                    │ 16       │
                    └──────────┘
```

### Key Patterns

- **Plugin architecture**: Each module is a Fastify plugin registered with a route prefix in `src/server/app.ts`
- **Module structure**: `plugin.ts` (registration) -> `routes.ts` (HTTP handlers) -> `service.ts` (business logic) -> `schemas.ts` (Zod/TypeBox validation)
- **Auth flow**: JWT RS256 with HttpOnly cookies + Bearer header fallback. Access tokens (15 min) + refresh tokens (7 days) with rotation. 2FA enforced for `medical_director` and `admin` roles.
- **RBAC**: 7 roles defined in `src/server/config/roles.ts` with endpoint-level permissions
- **FHIR sync**: Transactional outbox pattern. PostgreSQL -> outbox_event table -> poller -> Aidbox. Reverse: Aidbox subscription webhooks -> PostgreSQL.
- **Logging**: Pino with PHI field redaction (email, phone, SSN, DOB, names, auth headers)

### Roles

| Role | PHI Access | 2FA Required |
|------|-----------|-------------|
| `conductor` (family lead) | Yes | No |
| `worker_owner` | Yes | No |
| `timebank_member` | No | No |
| `medical_director` | Yes | **Yes** |
| `admin` | Yes | **Yes** |
| `employer_hr` | No | No |
| `wellness_provider` | No | No |

---

## 3. Environment Setup

### Prerequisites

- Node.js >= 22.0.0
- Docker + Docker Compose
- npm

### Quick Start

```bash
# 1. Clone and install
cd /Users/blaine/Desktop/careos-claude-code
npm install

# 2. Set up environment
cp .env.example .env

# 3. Generate JWT RS256 keys
openssl genrsa -out jwt-private.pem 4096
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
# Paste PEM contents into .env JWT_PRIVATE_KEY and JWT_PUBLIC_KEY

# 4. Generate VAPID keys (web push)
npx web-push generate-vapid-keys
# Paste into .env VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VITE_VAPID_PUBLIC_KEY

# 5. Start infrastructure (PostgreSQL, Redis, Aidbox + Postgres)
npm run docker:infra
# This runs: docker compose up -d
# PostgreSQL on :8000, Redis on :6379, Aidbox on :8888, Postgres on :5433

# 6. Run frontend + backend
npm run dev           # Vite frontend on :5173
npm run dev:server    # Fastify backend on :3001 (tsx watch mode)

# 7. (Optional) Seed dev data
npm run db:seed

# 8. (Optional) Initialize Aidbox FHIR resources
npm run db:init-aidbox

# Full stack in Docker (builds API image too):
npm run docker:full
```

### Key Environment Variables

See `/Users/blaine/Desktop/careos-claude-code/.env.example` for the full list. Critical ones:

| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` | **Yes** | RS256 PEM keys. Server will crash on first auth request without these. |
| `POSTGRES_*` | Yes (defaults work for local) | postgresql://localhost:5432/careos |
| `AIDBOX_*` | Yes (defaults work for local) | http://localhost:8888 |
| `REDIS_URL` | Yes (defaults work for local) | redis://localhost:6379 |
| `STRIPE_SECRET_KEY` | For payment features | sk_test_ for dev |
| `STRIPE_WEBHOOK_SECRET` | For webhook verification | whsec_ |
| `ANTHROPIC_API_KEY` | For Sage AI | Claude Sonnet powers Sage responses |
| `SENDGRID_API_KEY` | For email notifications | |
| `TWILIO_ACCOUNT_SID` / `AUTH_TOKEN` | For SMS notifications | |
| `WEB3_ENABLED` | Optional | Enables blockchain features (CareHour token) |

---

## 4. Database Schema

### PostgreSQL (Operational)

Schema file: `src/server/database/schema.sql`

Auto-applied at startup via `initPostgresSchema()` in `src/server/database/postgres.ts`.

**Tables:**

| Table | Purpose |
|-------|---------|
| `user` | All users (SCHEMAFULL). Email unique index. Geo location, skills, ratings. |
| `family` | Family units. Linked to conductor (user). Stripe customer/subscription IDs. |
| `care_recipient` | Care recipients within families. FHIR patient ID link. Wearable device ID. |
| `timebank_account` | Balance ledger per user (earned, membership, bought, donated, expired, deficit). |
| `timebank_transaction` | Immutable transaction log. Links to tasks. |
| `timebank_task` | Task board: geo-located, status-tracked, check-in/out with location verification. |
| `assessment` | CII/Mini-CII/CRI scores. Links to FHIR QuestionnaireResponse. Review workflow. |
| `kbs_rating` | Knowledge-Behavior-Status outcome ratings (Omaha System). Day 0/30/60/90. |
| `care_interaction` | Worker visit logs. Vitals, condition changes, Omaha problem codes. |
| `notification` | All notifications (in-app channel). Read/unread tracking. |
| `message` | Secure messaging. Thread-based. |
| `respite_fund` | Singleton: emergency respite fund balances. |
| `worker_equity` | Subchapter T equity accumulation per worker. |
| `outbox_event` | Transactional outbox for PostgreSQL -> Aidbox FHIR sync. |

**Relation Tables:**

| Edge | From -> To | Purpose |
|------|-----------|---------|
| `helped` | user -> user | Time Bank cascade chain (who helped whom) |
| `member_of` | user -> family | Cooperative membership |
| `assigned_to` | user -> family | Care team assignment |
| `referred` | user -> user | Referral/viral loop tracking |

**Query layer:** `src/server/database/queries/` — centralized query functions.

### Aidbox (FHIR R4 Clinical)

- Aidbox runs on Postgres 16
- FHIR R4 resources: Patient, Encounter, Observation, QuestionnaireResponse
- Init script: `scripts/init-aidbox.ts`
- Config bundles: `config/` directory

### Redis

- Rate limiting (via `@fastify/rate-limit`)
- Session/cache (general purpose)
- Connection: `src/server/database/redis.ts`

---

## 5. Critical Hardening Tasks

Prioritized by risk. Items marked **[BLOCKER]** must be fixed before any production deployment with real user data.

### P0 — Security Blockers

#### 5.1 **[BLOCKER]** JWT Key Validation on Startup
**File:** `src/server/modules/auth/jwt.ts`
**Problem:** JWT keys are loaded lazily on first request. If `JWT_PRIVATE_KEY` or `JWT_PUBLIC_KEY` is missing/malformed, the server starts successfully but crashes on first auth attempt. In production with HIPAA data, this is unacceptable.
**Fix:** Add a startup validation step in `src/server/server.ts` that imports the keys and verifies they parse correctly before `app.listen()`. Fail fast.

```typescript
// In server.ts, before app.listen():
async function validateJWTKeys(): Promise<void> {
  if (!config.jwt.privateKey) throw new Error('JWT_PRIVATE_KEY is required');
  if (!config.jwt.publicKey) throw new Error('JWT_PUBLIC_KEY is required');
  await importPKCS8(config.jwt.privateKey, 'RS256');
  await importSPKI(config.jwt.publicKey, 'RS256');
}
```

#### 5.2 **[BLOCKER]** FHIR Webhook Signature Validation Missing
**File:** `src/server/modules/fhir-sync/webhook.ts`
**Problem:** The Aidbox webhook handler processes incoming payloads without any signature verification or shared-secret validation. Any external actor who discovers the endpoint can inject fake clinical events into the system.
**Fix:** Implement HMAC signature verification or at minimum IP allowlisting for the Aidbox webhook route.

#### 5.3 **[BLOCKER]** Admin Endpoints Have No Rate Limiting
**File:** `src/server/modules/admin/plugin.ts`
**Problem:** Admin plugin registers routes with zero rate-limit override. The global 100/min limit is too generous for admin operations (user deletion, system config changes).
**Fix:** Add a strict rate limit (e.g., 30/min) to admin plugin.

#### 5.4 **[BLOCKER]** 2FA Not Enforced on Sensitive Operations
**File:** `src/server/middleware/auth.middleware.ts`
**Problem:** `require2FA` middleware exists but is not registered as a hook in the admin or medical_director-gated routes. The roles config says `requires2FA: true` for admin and medical_director, but the middleware must be explicitly added to route hooks. Check each module's `routes.ts` to verify `require2FA` is actually wired up.
**Fix:** Audit every module that admin/medical_director can access. Add `preHandler: [requireAuth, requireRole('admin'), require2FA]` pattern.

### P1 — Input Validation Gaps

#### 5.5 Contact Module — Weak Validation
**File:** `src/server/modules/contact/routes.ts`
**Problem:** Uses `scheduleCallSchema.safeParse(request.body)` but the error only says "Invalid contact data" — no field-level errors returned. More critically, verify that `scheduleCallSchema` in `src/server/modules/contact/schemas.ts` validates email format, phone format, and sanitizes free-text fields (name, message) against injection.
**Fix:** Return Zod field errors. Add `.max()` constraints on all string fields. Sanitize HTML/script content in free text.

#### 5.6 Sage Output Validation
**File:** `src/server/modules/sage/service.ts`
**Problem:** LLM responses from Claude are passed through to clients. Verify that `src/server/modules/sage/phi-strip.ts` actually runs on all outputs and that responses are bounded in length.
**Fix:** Ensure PHI stripping runs on every Sage response path. Add max response length enforcement. Validate that action-engine outputs don't contain executable content.

#### 5.7 Database Query Timeouts
**File:** `src/server/database/postgres.ts`
**Problem:** No query timeouts configured. A malformed query or large dataset could hang the connection pool indefinitely.
**Fix:** Add query timeouts to the PostgreSQL client. Wrap queries with `Promise.race` or use PostgreSQL's built-in timeout if available.

### P2 — Reliability

#### 5.8 Notification Retry Mechanism
**File:** `src/server/modules/notifications/service.ts`
**Problem:** Notification dispatch is fire-and-forget. If push/SMS/email delivery fails, the failure is logged but never retried. For clinical notifications (condition changes, abnormal observations), this is a patient safety gap.
**Fix:** Implement a retry queue. Options: (a) Redis-backed retry with exponential backoff, (b) outbox pattern similar to FHIR sync, (c) dedicated job in scheduler. At minimum, store failed deliveries in PostgreSQL and add a retry sweep to the job scheduler.

#### 5.9 Stripe Webhook — Idempotency
**File:** `src/server/modules/payment/webhooks.ts`
**Problem:** Webhook handler doesn't check for duplicate event processing. Stripe can deliver the same event multiple times.
**Fix:** Store processed event IDs (e.g., in Redis with TTL) and skip duplicates.

### P3 — Deployment Hardening

#### 5.10 Docker — Remove tsx Runtime
**File:** `Dockerfile`
**Problem:** Production image runs TypeScript via `tsx` (line 49: `RUN npm install --no-save tsx`, line 61: `CMD ["npx", "tsx", "src/server/server.ts"]`). This means the production container includes the TypeScript compiler and source code, increasing image size and attack surface.
**Fix:** Add a build step that compiles TypeScript to JavaScript (`tsc`), then run `node dist/server/server.js` in production. This also eliminates the `tsx` runtime overhead.

#### 5.11 Redis Password Not Enforced
**File:** `src/server/config/settings.ts`
**Problem:** Redis URL defaults to `redis://localhost:6379` with no auth. The `REDIS_PASSWORD` env var is documented in `.env.example` but never read in config.
**Fix:** Add `REDIS_PASSWORD` to config and construct the Redis URL with auth in production.

#### 5.12 PostgreSQL Default Credentials
**File:** `src/server/config/settings.ts`
**Problem:** `POSTGRES_USER` and `POSTGRES_PASSWORD` default to `root`/`root`. Fine for dev, but config should enforce non-default credentials in production.
**Fix:** Add a startup check: if `NODE_ENV === 'production'` and credentials are still `root`/`root`, refuse to start.

---

## 6. Testing Status

### What Has Tests

| File | Covers |
|------|--------|
| `src/server/modules/auth/auth.test.ts` | Auth routes (register, login, refresh) |
| `src/server/modules/auth/jwt.test.ts` | JWT sign/verify, key loading |
| `src/server/modules/assessments/assessments.test.ts` | CII/CRI assessment submission |
| `src/server/modules/timebank/timebank.test.ts` | TimeBank task CRUD, balance ops |
| `src/server/modules/timebank/nudge-equity.test.ts` | Equity nudge calculations |
| `src/server/modules/fhir-sync/fhir-sync.test.ts` | Outbox processing, sync handlers |
| `src/server/modules/notifications/notifications.test.ts` | Notification dispatch |
| `src/server/modules/worker/worker.test.ts` | Worker profile operations |
| `src/server/modules/lmn/lmn.test.ts` | LMN generation/renewal |
| `src/server/modules/admin/admin.test.ts` | Admin routes |
| `src/server/modules/employer/employer.test.ts` | Employer portal |
| `src/server/modules/payment/billing.test.ts` | Billing operations |
| `src/server/database/queries/queries.test.ts` | Database query layer |
| `src/server/jobs/jobs.test.ts` | Background job scheduler |

### What Has No Tests

- **contact** module
- **sage** module (AI responses, PHI stripping, action engine)
- **community**, **social**, **matching**, **waitlist** modules
- **referrals**, **referral-rewards**, **peer-support** modules
- **coverage**, **acp**, **reimbursement** modules
- **analytics**, **web3**, **nutrition**, **wellness** modules
- **settings** module
- **WebSocket** handler
- **Middleware** (auth, rate-limit, audit, error-handler) — no dedicated tests
- **E2E tests** — Playwright is configured but unclear if test files exist

### Running Tests

```bash
npm test              # vitest run (single pass)
npm run test:watch    # vitest (watch mode)
npm run test:coverage # vitest with coverage
npm run test:e2e      # playwright
```

---

## 7. Deployment

### Current Setup — Vercel (Frontend)

Config: `vercel.json`
- Builds with Vite, outputs to `dist/client`
- SPA rewrites: all non-`/api/` routes -> `index.html`
- API routes rewrite to `/api/$1` (likely needs a serverless function or separate backend)

### Docker Compose — Local Dev

Config: `docker-compose.yml`

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgresql` | `postgres:16-alpine` | 5432 | Operational DB |
| `redis` | `redis:7-alpine` | 6379 | Cache/rate-limit |
| `aidbox-db` | `postgres:16-alpine` | 5433 | Aidbox backing store |
| `aidbox` | `healthsamurai/aidboxone:latest` | 8888 | FHIR R4 server |
| `aidbox-init` | `node:22-alpine` | - | One-shot: runs `init-aidbox.ts` |
| `api` (full profile only) | Built from Dockerfile | 3001 | CareOS API |

```bash
# Infra only (you run API locally via npm run dev:server):
docker compose up -d

# Full stack including API container:
docker compose --profile full up -d
```

### Production Docker

An archived production compose exists at `_archive/docker-compose.production.yml`. Mentions Caddy for TLS termination.

---

## 8. File Map — Where Things Live

```
src/server/
├── app.ts                          # Fastify app factory, plugin registration
├── server.ts                       # Entry point, DB connect, graceful shutdown
├── config/
│   ├── settings.ts                 # All env vars (centralized)
│   └── roles.ts                    # RBAC role definitions
├── middleware/
│   ├── auth.middleware.ts          # requireAuth, requireRole, require2FA
│   ├── rate-limit.middleware.ts    # Per-module rate limit configs
│   ├── audit.middleware.ts         # Request audit logging hook
│   └── error-handler.middleware.ts # Global error handler
├── common/
│   ├── constants.ts                # Shared constants (cookie names, etc.)
│   ├── errors.ts                   # Custom error classes
│   ├── logger.ts                   # Pino logger with PHI redaction
│   └── validators.ts              # Shared validation utilities
├── database/
│   ├── postgres.ts               # PostgreSQL connection + schema init
│   ├── schema.sql     # Full schema (tables, indexes, edges)
│   ├── schema.sql                 # (Legacy or supplementary SQL)
│   ├── aidbox.ts                  # Aidbox FHIR client init
│   ├── redis.ts                   # Redis connection
│   ├── queries/                   # Centralized query functions
│   └── migrations/                # Schema migrations
├── modules/
│   ├── auth/                      # JWT RS256, register, login, 2FA, refresh
│   ├── family/                    # Family CRUD, care recipients
│   ├── assessments/               # CII, Mini-CII, CRI, KBS ratings
│   ├── timebank/                  # Time Bank ledger, tasks, matching
│   ├── fhir-sync/                 # Outbox, poller, webhooks, sync handlers
│   ├── notifications/             # Multi-channel dispatch (push/SMS/email/in-app)
│   ├── payment/                   # Stripe, billing, webhooks, IRS 502, statements
│   ├── worker/                    # Worker profiles, equity, background checks
│   ├── lmn/                       # Letter of Medical Necessity, auto-trigger
│   ├── admin/                     # Admin dashboard routes
│   ├── employer/                  # Employer HR portal
│   ├── acp/                       # Advance Care Planning
│   ├── coverage/                  # Insurance coverage verification
│   ├── settings/                  # User preferences
│   ├── sage/                      # AI assistant (Claude), narrative/action engines
│   ├── contact/                   # Public lead capture
│   ├── referrals/                 # Care referral tracking
│   ├── community/                 # Community features
│   ├── reimbursement/             # HSA/FSA reimbursement
│   ├── social/                    # Social features
│   ├── matching/                  # Caregiver-family matching
│   ├── waitlist/                  # Waitlist management
│   ├── analytics/                 # Reporting
│   ├── web3/                      # CareHour token, co-op governance
│   ├── nutrition/                 # Nutrition tracking
│   ├── referral-rewards/          # Viral referral rewards
│   ├── peer-support/              # Peer support
│   ├── wellness/                  # Wellness providers
│   ├── email/                     # SendGrid dispatch (internal service)
│   └── wearable-mcp/             # Wearable device integration
├── jobs/
│   ├── scheduler.ts               # setInterval-based job runner (prod only)
│   ├── lmn-renewal.ts            # LMN expiry scan
│   ├── kbs-reassessment.ts       # KBS 30/60/90-day reassessment triggers
│   ├── timebank-expiry.ts        # Time Bank credit expiration
│   ├── membership-renewal.ts     # Membership auto-renewal
│   └── jobs.test.ts
└── ws/
    ├── handler.ts                 # WebSocket plugin registration
    ├── channels.ts                # Channel management
    └── broadcast.ts               # Notification broadcast to connected clients
```

---

## 9. Your Priority Focus Areas

Based on your Firebase/HIPAA and CII/CRI deployment focus:

### Firebase Migration Path
The current auth uses custom JWT RS256 with `jose` library (`src/server/modules/auth/jwt.ts`). If migrating to Firebase Auth:
- Replace `signAccessToken` / `verifyAccessToken` with Firebase Admin SDK token verification
- The RBAC system in `src/server/config/roles.ts` maps cleanly to Firebase custom claims
- `require2FA` middleware can integrate with Firebase's multi-factor auth
- Session management currently uses HttpOnly cookies — Firebase supports this via session cookies

### CII/CRI Deployment
The assessment module (`src/server/modules/assessments/`) handles:
- CII (Caregiver Impact Index) scoring
- Mini-CII (shortened version)
- CRI (Care Recipient Impact) scoring
- KBS (Knowledge-Behavior-Status) outcome ratings on Omaha System problem codes
- All assessments sync to Aidbox as FHIR QuestionnaireResponse resources via the outbox
- KBS reassessment is triggered on a 30/60/90-day schedule by `src/server/jobs/kbs-reassessment.ts`

### HIPAA Compliance Points
- PHI redaction in logs: `src/server/app.ts` lines 64-76
- Role-based PHI access: `phiAccess` flag per role in `src/server/config/roles.ts`
- Audit hook on all requests: `src/server/middleware/audit.middleware.ts`
- FHIR data stays in Aidbox (HIPAA-eligible); operational data in PostgreSQL
- Existing compliance doc: `docs/HIPAA-COMPLIANCE.md`

---

## 10. Open Questions for Jacob

1. **Firebase Auth vs. custom JWT** — Are we migrating auth to Firebase or keeping the custom RS256 implementation? The custom impl is functional but Firebase gives us managed 2FA, passwordless, and identity providers out of the box.

2. **Aidbox vs. Firebase + FHIR** — Aidbox is running but requires Postgres. Is the plan to keep Aidbox for FHIR compliance or move clinical data to a Firebase-backed FHIR store?

3. **PostgreSQL in production** — PostgreSQL v2 is used for everything operational. Are you comfortable running it in production, or should we evaluate migrating operational data to Firestore/Postgres?

4. **Deployment target** — Current setup is Vercel (frontend) + unclear backend hosting. Are we deploying the Fastify backend to Cloud Run, a VM, or somewhere else?

5. **HIPAA BAA coverage** — Which services have BAAs in place? (Aidbox, PostgreSQL hosting, Redis hosting, Stripe, SendGrid, Twilio all need BAAs for production HIPAA compliance.)
