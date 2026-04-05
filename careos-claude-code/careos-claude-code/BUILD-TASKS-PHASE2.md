# CareOS — Build Tasks Phase 2

Use these as Claude Code session tasks. Each is scoped to ~1 session.
Phase 1 (Sessions 1-10) delivered: scaffold, backend modules (auth, families,
assessments, timebank, FHIR sync, notifications — all with stubs + 241 tests),
frontend (shell, dashboard, CII, time bank, onboarding, messaging),
FHIR init bundles, background jobs, and E2E tests.

Phase 1.5 wires the stubs to real infrastructure so Phase 1 can deploy.
Phase 2 adds features for the 40-family pilot.

---

## Phase 1.5 — Make It Real

### Session 11: Docker Compose + Local Dev Stack

**Goal:** One `docker compose up` gives you PostgreSQL, Aidbox, Redis, and the API.

- [ ] `docker-compose.yml` — services: `api` (Node 22), `postgresql` (3.0), `aidbox` (latest), `aidbox-db` (Postgres for Aidbox), `redis` (7)
- [ ] `Dockerfile` — multi-stage build (build → prod), non-root user, HIPAA-safe (no PHI in image layers)
- [ ] `.env.example` — all env vars with safe defaults for local dev
- [ ] `scripts/wait-for-it.sh` — health-check script for service readiness
- [ ] `docker-compose.yml` healthchecks for PostgreSQL (`/health`), Aidbox (`/health`), Redis (`PING`)
- [ ] Wire `scripts/init-aidbox.ts` into compose via `aidbox-init` service (runs after Aidbox is healthy)
- [ ] Verify: `docker compose up` → all services healthy → API serves `localhost:3000`

**Files:** `docker-compose.yml`, `Dockerfile`, `.env.example`, `scripts/wait-for-it.sh`

---

### Session 12: PostgreSQL Schema + Connection Layer

**Goal:** Define the operational schema and build a typed connection pool.

- [ ] `src/server/db/connection.ts` — PostgreSQL client singleton, connection pool, reconnect logic
- [ ] `src/server/db/schema.surql` — full PostgreSQL schema:
  - Tables: `user`, `family`, `care_recipient`, `membership`, `assessment`, `cii_score`, `cri_score`, `kbs_score`
  - Tables: `task`, `task_match`, `time_credit`, `ledger_entry`, `notification`, `message`, `thread`
  - Tables: `lmn`, `care_plan`, `worker_profile`, `shift`, `audit_log`
  - Graph edges: `member_of`, `caregiver_for`, `assigned_to`, `refers_to`
  - Indexes: geospatial on `task.location`, composite on `time_credit(userId, expiresAt)`, full-text on `task.description`
  - Events: `ON CREATE task` → auto-match trigger, `ON UPDATE cii_score` → zone-change notification
- [ ] `scripts/init-postgresql.ts` — run schema on fresh DB, idempotent
- [ ] `src/server/db/queries/` — typed query builders for each module (families, assessments, timebank, auth)
- [ ] `src/server/db/seed.ts` — dev seed data (5 families, 10 users, 20 tasks, sample scores)
- [ ] Unit tests for query builders with PostgreSQL test container

**Files:** `src/server/db/connection.ts`, `src/server/db/schema.surql`, `scripts/init-postgresql.ts`, `src/server/db/seed.ts`, `src/server/db/queries/*.ts`

---

### Session 13: Wire Backend Services to PostgreSQL

**Goal:** Replace every stub service function with real PostgreSQL queries.

- [ ] `src/server/modules/auth/service.ts` — real user CRUD, password hashing (argon2), session management
- [ ] `src/server/modules/families/service.ts` — real family + care recipient CRUD, relationship graph queries
- [ ] `src/server/modules/assessments/service.ts` — real CII/CRI score storage, zone history, trend queries
- [ ] `src/server/modules/timebank/service.ts` — real ledger with double-entry, balance queries, matching with geo
- [ ] `src/server/modules/notifications/service.ts` — real notification persistence + read/unread tracking
- [ ] `src/server/modules/fhir-sync/service.ts` — real PostgreSQL → Aidbox sync via transactional outbox
- [ ] Update all existing unit tests to work with real DB (use test containers or in-memory PostgreSQL)
- [ ] All 241+ tests still pass

**Files:** All `service.ts` files in `src/server/modules/*/`

---

### Session 14: Stripe Integration

**Goal:** Real payment processing for membership and Time Bank cash purchases.

- [ ] `src/server/modules/payment/stripe.ts` — Stripe client wrapper, typed helpers
- [ ] `src/server/modules/payment/service.ts` — create customer, charge $100 membership, $15/hr credit purchase, $59/mo Comfort Card subscription
- [ ] `src/server/modules/payment/routes.ts` — `POST /api/v1/payment/membership`, `POST /api/v1/payment/credits`, `POST /api/v1/payment/comfort-card`
- [ ] `src/server/modules/payment/webhooks.ts` — Stripe webhook handler (payment_intent.succeeded, subscription.created, charge.refunded)
- [ ] `src/server/modules/payment/schemas.ts` — Zod validation for all payment endpoints
- [ ] Wire membership renewal job to real Stripe charges
- [ ] HSA/FSA eligibility flag on transactions (IRS Pub 502)
- [ ] Tests with Stripe test mode fixtures

**Files:** `src/server/modules/payment/*.ts`

---

### Session 15: Real-Time WebSocket + Notification Delivery

**Goal:** Live updates via PostgreSQL native WebSocket.

- [ ] `src/server/ws/handler.ts` — WebSocket upgrade handler, JWT auth on connection
- [ ] `src/server/ws/channels.ts` — channel subscriptions (user:{id}, family:{id}, task-feed, admin)
- [ ] `src/server/ws/broadcast.ts` — broadcast helpers (new task, score update, message received, notification)
- [ ] Wire PostgreSQL LIVE SELECT to WebSocket channels (task created → task-feed channel, CII update → family channel)
- [ ] `src/client/hooks/useWebSocket.ts` — React hook with reconnect, exponential backoff
- [ ] `src/client/hooks/useRealtimeNotifications.ts` — notification toast + badge count
- [ ] Update ConductorDashboard, TaskFeed, ThreadList to use real-time data
- [ ] Email notification fallback via Resend/SendGrid for offline users
- [ ] Tests for WebSocket auth, channel subscription, broadcast

**Files:** `src/server/ws/*.ts`, `src/client/hooks/useWebSocket.ts`, `src/client/hooks/useRealtimeNotifications.ts`

---

### Session 16: CI/CD + Deployment + HIPAA Checklist

**Goal:** GitHub Actions pipeline, deploy to staging, HIPAA compliance.

- [ ] `.github/workflows/ci.yml` — lint, typecheck, test, build on every PR
- [ ] `.github/workflows/deploy.yml` — build Docker image, push to registry, deploy to staging
- [ ] `scripts/hipaa-audit.ts` — automated checks: no PHI in logs, no PHI in localStorage, JWT expiry < 15min, audit log coverage
- [ ] Environment configs: `.env.staging`, `.env.production` (templates, no secrets)
- [ ] CORS + CSP + security headers configuration
- [ ] Rate limiting on auth endpoints (10 req/min), API endpoints (100 req/min)
- [ ] PHI audit logging — every read/write of clinical data → Aidbox AuditEvent
- [ ] Service Worker: PHI cache bypass rules (never cache assessment data, messages)
- [ ] `docs/HIPAA-COMPLIANCE.md` — checklist with evidence pointers
- [ ] All 241+ tests pass in CI

**Files:** `.github/workflows/*.yml`, `scripts/hipaa-audit.ts`, `docs/HIPAA-COMPLIANCE.md`

---

## Phase 2 — Feature Expansion (After 40-Family Pilot)

### Session 17: CRI Assessment Engine + MD Review

**Goal:** Full 14-factor Clinical Risk Index with Medical Director approval workflow.

- [ ] `src/server/modules/assessments/cri-engine.ts` — CRI scoring engine (14 factors, weighted, decimal)
- [ ] `src/server/modules/assessments/cri-review.ts` — MD review queue, approve/reject/request-revision
- [ ] `src/client/features/assessments/CRIAssessment.tsx` — 14-factor input form with clinical context tooltips
- [ ] `src/client/features/assessments/CRIReviewQueue.tsx` — MD review dashboard (pending, reviewed, flagged)
- [ ] `src/client/features/assessments/CRIDetail.tsx` — side-by-side CII vs CRI with trend charts
- [ ] CRI triggers LMN generation when acuity ≥ threshold
- [ ] CRI → FHIR QuestionnaireResponse sync to Aidbox
- [ ] Wire CRI scheduling from onboarding flow (currently placeholder)
- [ ] Tests: scoring edge cases, MD review state machine, FHIR sync

**Files:** `src/server/modules/assessments/cri-*.ts`, `src/client/features/assessments/CRI*.tsx`

---

### Session 18: KBS Outcome Tracking

**Goal:** Knowledge-Behavior-Status reassessments at 30/60/90 days + ongoing.

- [ ] `src/server/modules/assessments/kbs-engine.ts` — KBS scoring (K 1-5, B 1-5, S 1-3 per Omaha problem)
- [ ] `src/server/modules/assessments/kbs-trend.ts` — trend analysis, improvement/decline detection
- [ ] `src/client/features/assessments/KBSAssessment.tsx` — per-problem KBS entry with Omaha problem selector
- [ ] `src/client/features/assessments/KBSTrend.tsx` — sparkline trend charts per problem, overall trajectory
- [ ] Wire kbs-reassessment background job to real DB queries
- [ ] Escalation: auto-notify MD when KBS declines 2+ points in any dimension
- [ ] KBS → FHIR Observation sync (LOINC-coded)
- [ ] Tests: trend detection, escalation triggers, FHIR mapping

**Files:** `src/server/modules/assessments/kbs-*.ts`, `src/client/features/assessments/KBS*.tsx`

---

### Session 19: Worker-Owner Portal

**Goal:** Daily view for caregivers — schedule, care logging, GPS, messaging.

- [ ] `src/client/features/worker/WorkerDashboard.tsx` — today's schedule, upcoming shifts, active tasks
- [ ] `src/client/features/worker/CareLog.tsx` — structured care interaction logging with Omaha auto-coding
- [ ] `src/client/features/worker/AmbientScribe.tsx` — voice-to-text (Web Speech API) → Omaha problem extraction
- [ ] `src/client/features/worker/ShiftClock.tsx` — GPS check-in/out, break tracking, shift summary
- [ ] `src/client/features/worker/ShiftSwap.tsx` — request/offer shift swaps with team
- [ ] `src/server/modules/worker/service.ts` — shift management, care log storage, voice transcription queue
- [ ] `src/server/modules/worker/routes.ts` — worker-specific API endpoints
- [ ] Wire AppShell `/worker/*` routes to real components
- [ ] Tests: GPS verification, shift state machine, Omaha auto-coding accuracy

**Files:** `src/client/features/worker/*.tsx`, `src/server/modules/worker/*.ts`

---

### Session 20: LMN Generation + e-Signing

**Goal:** Auto-generate Letters of Medical Necessity, route for MD signature.

- [ ] `src/server/modules/lmn/service.ts` — LMN template engine (populate from CRI + Omaha + care plan)
- [ ] `src/server/modules/lmn/templates.ts` — LMN document templates (PDF generation via @react-pdf/renderer)
- [ ] `src/server/modules/lmn/signing.ts` — DocuSign/HelloSign integration for e-signature
- [ ] `src/server/modules/lmn/routes.ts` — `POST /api/v1/lmn/generate`, `POST /api/v1/lmn/sign`, `GET /api/v1/lmn/:id`
- [ ] `src/client/features/lmn/LMNList.tsx` — LMN lifecycle view (draft, pending-signature, active, expiring, expired)
- [ ] `src/client/features/lmn/LMNDetail.tsx` — LMN preview, sign button, renewal action
- [ ] Wire lmn-renewal background job to real DB + notification
- [ ] LMN → FHIR DocumentReference sync to Aidbox
- [ ] Tests: template rendering, signing workflow, expiry calculations

**Files:** `src/server/modules/lmn/*.ts`, `src/client/features/lmn/*.tsx`

---

### Session 21: Admin Dashboard

**Goal:** Coordinator view — Michaelis-Menten capacity, manual matching, operations.

- [ ] `src/client/features/admin/AdminDashboard.tsx` — capacity metrics, task queue depth, matching efficiency
- [ ] `src/client/features/admin/MichaelisVisualization.tsx` — Michaelis-Menten enzyme kinetics applied to matching (Vmax, Km, saturation curve)
- [ ] `src/client/features/admin/ManualMatch.tsx` — override matching algorithm, assign tasks manually
- [ ] `src/client/features/admin/MemberManagement.tsx` — member list, status, background check tracking
- [ ] `src/client/features/admin/RespiteFund.tsx` — emergency fund balance, disbursement history
- [ ] `src/server/modules/admin/service.ts` — aggregate queries, capacity metrics, matching overrides
- [ ] `src/server/modules/admin/routes.ts` — admin-only endpoints (role-gated)
- [ ] Wire AppShell `/admin/*` routes to real components
- [ ] Tests: role authorization, capacity calculations, matching overrides

**Files:** `src/client/features/admin/*.tsx`, `src/server/modules/admin/*.ts`

---

### Session 22: Employer Dashboard

**Goal:** Aggregate anonymized view for employer sponsors.

- [ ] `src/client/features/employer/EmployerDashboard.tsx` — aggregate CII improvement, engagement metrics
- [ ] `src/client/features/employer/ROIReport.tsx` — quarterly ROI: absenteeism reduction, productivity proxy, PEPM vs outcomes
- [ ] `src/client/features/employer/EnrollmentView.tsx` — employee enrollment status, utilization rates
- [ ] `src/server/modules/employer/service.ts` — anonymized aggregation (k-anonymity, minimum group size 5), PEPM calculations
- [ ] `src/server/modules/employer/routes.ts` — employer-only endpoints (org-scoped)
- [ ] Wire AppShell `/employer/*` routes to real components
- [ ] Tests: anonymization (no PII leakage), aggregation accuracy, role authorization

**Files:** `src/client/features/employer/*.tsx`, `src/server/modules/employer/*.ts`

---

### Session 23: Comfort Card Reconciliation + Tax Statements

**Goal:** Full financial reconciliation for HSA/FSA-eligible companion care.

- [ ] `src/server/modules/payment/reconciliation.ts` — multi-source categorization (membership, Time Bank purchase, Comfort Card, HSA reimbursement)
- [ ] `src/server/modules/payment/irs502.ts` — IRS Pub 502 eligibility engine (companion care = eligible if LMN on file)
- [ ] `src/server/modules/payment/statements.ts` — monthly statement generation, annual HSA/FSA totals
- [ ] `src/client/features/billing/BillingDashboard.tsx` — transaction history, category breakdown
- [ ] `src/client/features/billing/TaxStatement.tsx` — downloadable annual statement (PDF) with IRS 502 categorization
- [ ] `src/client/features/billing/ComfortCard.tsx` — card balance, auto-reload settings, usage by category
- [ ] Tests: categorization accuracy, 502 eligibility edge cases, statement totals

**Files:** `src/server/modules/payment/reconciliation.ts`, `src/server/modules/payment/irs502.ts`, `src/server/modules/payment/statements.ts`, `src/client/features/billing/*.tsx`

---

### Session 24: Time Bank Behavioral Nudges + Equity Tracking

**Goal:** Engagement nudges and worker-owner equity mechanics.

- [ ] `src/server/modules/timebank/nudges.ts` — deficit nudges (-5/-10/-15 hrs), streak notifications, refer-a-neighbor (after 3rd task), credit expiry warnings, burnout detection (>10 hrs/week)
- [ ] `src/server/modules/timebank/equity.ts` — Subchapter T calculations, patronage dividend tracking, vesting schedule
- [ ] `src/client/features/timebank/NudgeOverlay.tsx` — contextual nudge cards (non-blocking, dismissible)
- [ ] `src/client/features/timebank/EquityDashboard.tsx` — worker-owner equity position, dividend history, vesting progress
- [ ] `src/client/features/timebank/ReferralFlow.tsx` — refer-a-neighbor with tracking code, bonus credit on signup
- [ ] Wire behavioral nudge triggers into background jobs
- [ ] Tests: nudge trigger conditions, equity calculations, referral tracking

**Files:** `src/server/modules/timebank/nudges.ts`, `src/server/modules/timebank/equity.ts`, `src/client/features/timebank/Nudge*.tsx`, `src/client/features/timebank/Equity*.tsx`, `src/client/features/timebank/ReferralFlow.tsx`

---

## Session Dependency Graph

```
Phase 1 (Sessions 1-10) ✅ COMPLETE
    │
    ▼
Phase 1.5 — Make It Real
    │
    ├── 11: Docker Compose
    │     │
    │     ▼
    ├── 12: PostgreSQL Schema ──────┐
    │     │                        │
    │     ▼                        ▼
    ├── 13: Wire Services ◄── 14: Stripe
    │     │
    │     ▼
    ├── 15: WebSocket + Realtime
    │     │
    │     ▼
    └── 16: CI/CD + Deploy
              │
              ▼
Phase 2 — Feature Expansion
    │
    ├── 17: CRI Engine + MD Review
    │     │
    │     ▼
    ├── 18: KBS Outcome Tracking
    │
    ├── 19: Worker-Owner Portal
    │
    ├── 20: LMN Generation ◄── 17 (CRI triggers LMN)
    │
    ├── 21: Admin Dashboard
    │
    ├── 22: Employer Dashboard
    │
    ├── 23: Comfort Card ◄── 14 (Stripe)
    │
    └── 24: Behavioral Nudges + Equity
```

Sessions 17-24 can be parallelized after Session 16, except where noted.

---

## Metrics at Phase 2 Completion

| Metric | Phase 1 | Phase 2 Target |
|--------|---------|----------------|
| Tests | 241 | 500+ |
| Modules | 124 | 250+ |
| API endpoints | 0 (stubs) | 40+ (real) |
| DB tables | 0 | 20+ |
| FHIR resources | 5 bundles | 5 + live sync |
| Frontend features | 6 | 15+ |
| Portals | 1 (Conductor) | 5 (Conductor, Worker, MD, Admin, Employer) |
