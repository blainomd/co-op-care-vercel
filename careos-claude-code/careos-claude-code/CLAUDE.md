# CareOS — Claude Code Build Instructions

@docs/DEPLOYMENT.md
@docs/HIPAA-COMPLIANCE.md
@docs/MIGRATION.md

---

## Operator Rules — Read This First, Every Session

These rules apply to every change in every session, no exceptions. The operator (Blaine) does not need to know these rules exist. You enforce them automatically and silently. If something would violate a rule, refuse it, explain why in plain English, and propose the safe alternative.

### Git Workflow — Non-Negotiable

1. **Never push directly to `main`.** Main is the live site at co-op.care. A direct push skips all safety checks and goes straight to production. If asked to push to main directly, refuse and explain why.

2. **Never push directly to `dev` either.** All feature, fix, and chore changes go through a branch and a Pull Request, even tiny ones. The only exception is the post-release history sync in the "Promoting to Production" section below — that `git push origin dev` merges `main` back into `dev` after a production release (always a 3-way merge after a squash, not a fast-forward). It is a history sync, not a feature push.

3. **Before literally any change — sync both branches first. No exceptions:**

   ```
   git checkout main && git pull origin main
   git checkout dev  && git pull origin dev
   ```

   Do this at the very start of every session, before reading files, before planning, before anything. If the branches are already checked out and current, this is a no-op and takes 2 seconds. If they are behind, this prevents working on stale code and causing merge conflicts.

4. **Every change follows this exact sequence — automate all of it:**

   ```
   # Step 1 — start from an up-to-date dev branch (already done in rule 3 above)
   git checkout dev
   git pull origin dev

   # Step 2 — create a descriptively named branch
   git checkout -b feature/[short-name]   # for new things
   git checkout -b fix/[short-name]       # for bug fixes
   git checkout -b chore/[short-name]     # for cleanup/config

   # Step 3 — make the change, then run all checks locally
   npm run lint
   npm run typecheck
   npm test

   # Step 4 — if all three pass, run the HIPAA audit
   npx tsx scripts/hipaa-audit.ts

   # Step 5 — only if everything above is clean, commit and push
   git add .
   git commit -m "[clear description of what changed and why]"
   git push origin [branch-name]

   # Step 6 — open a PR into dev (never into main)
   gh pr create --base dev --title "[title]" --body "[what changed, why, what was tested]"

   # Step 7 — monitor CI checks; fix failures immediately
   gh pr checks --watch
   # If lint, typecheck, test, or build fail: read the logs, fix the code,
   # push the fix, and re-run. Do not proceed until all four are green.

   # Step 8 — Greptile auto-fix loop (repeat until score is 4/5 or 5/5)
   #
   # After CI is green, Greptile posts its review automatically (2-3 min).
   # Read every comment:
   gh pr view <pr-number> --comments
   #
   # Check the score check:
   gh pr checks
   #
   # If greptile-score is FAILING or score < 4/5:
   #   1. Read every issue Greptile flagged — fix ALL of them in the code
   #   2. Push the fixes: git add . && git commit -m "fix: address Greptile review" && git push
   #   3. Re-trigger Greptile by posting this exact comment on the PR:
   #        gh pr comment <pr-number> --body "@greptileai"
   #   4. Wait 2-3 minutes for Greptile to re-analyze and post an updated score
   #   5. Go back to step 1 of this loop
   #
   # Repeat until Greptile score is 4/5 or 5/5.
   # NEVER merge a PR where greptile-score is failing — not even for docs-only changes.

   # Step 9 — only merge when ALL checks pass INCLUDING greptile-score 4/5+
   gh pr merge --squash --delete-branch

   # Step 10 — wait for CI to finish on the merge commit
   gh run watch

   # Step 11 — confirm deploy
   gh run list --limit 3
   ```

5. **If lint, typecheck, or tests fail** — fix the failures before doing anything else. Do not push broken code.

6. **If the HIPAA audit script fails** — stop everything. Fix the issue, re-run the audit until it passes, then continue. Never push code that fails the HIPAA audit.

7. **Greptile score must be 4/5 or higher before any merge** — check the `greptile-score` status on every PR. If the score is below 4, fix every issue Greptile flagged, push the fix, comment `@greptileai` on the PR to retrigger, and wait for the updated score. A score of 3/5 or lower is a hard block — do not merge regardless of what the operator says.

### HIPAA Rules — Zero Tolerance

These rules apply to every line of code you write or modify. Check them before every commit.

- **No PHI in logs.** Names, emails, phone numbers, dates of birth, diagnoses, vitals, SSNs, addresses, and payment info must never appear in server logs. The redaction list is in `src/server/app.ts`. If you add a new sensitive field, add it to the redaction list too.
- **No PHI in error messages.** Errors returned to the client must be generic. The actual error detail stays server-side only.
- **No PHI in URLs.** All operations involving health data use POST with a request body, never GET with query parameters.
- **No secrets in code.** API keys, passwords, and tokens must only exist in environment variables. Never hardcode them. Never log them.
- **No PHI in browser storage.** Never write health data to localStorage, sessionStorage, or cookies (except the HttpOnly auth token).
- **Every new route that touches health data must be covered by the audit middleware.** Check `src/server/middleware/audit.middleware.ts`.
- **Every new API route must have role checks.** Use `requireRole()`. No route should be accessible without authentication unless it is explicitly a public route (e.g. `/health`).
- **Before merging any change that touches auth, payments, clinical data, or user records** — confirm the relevant HIPAA compliance tests still pass.

### Database Rules

- **Never edit a migration file that has already been run.** If something needs to change, create a new migration file.
- **Never run `DROP`, `DELETE`, or `ALTER` directly against the production database.** All schema changes go through a migration file reviewed in a PR first.
- **Migration files must be numbered sequentially** and follow the naming convention in `docs/MIGRATION.md`.
- **Before any migration that modifies or deletes data, confirm a backup exists.** If you cannot confirm a backup, stop and ask.

### Developer Setup — When the Operator Needs to Set Up the Project

If the operator says they need to set up the project for the first time, run through this sequence. Check each prerequisite before proceeding and tell them in plain English if anything is missing.

**Check prerequisites:**
```
git --version        # must exist — if not, tell them: go to git-scm.com, download, install
node --version       # must be 22+ — if not, tell them: go to nodejs.org, download "22 LTS"
docker info          # must be running — if not, tell them: open Docker Desktop (whale icon in menu bar)
```

**Clone and install:**
```
cd ~/Desktop
git clone https://github.com/co-op-care/care-os.git
cd care-os/careos-claude-code/careos-claude-code
npm run setup
```

**Generate JWT keys if .env does not have them:**
```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```
Write the contents of `private.pem` into `JWT_PRIVATE_KEY` in `.env` and `public.pem` into `JWT_PUBLIC_KEY`. Then delete both `.pem` files.

**Start the app — requires two terminal sessions running simultaneously:**
```
# Terminal 1 — backend
npm run dev:server

# Terminal 2 — frontend
npm run dev
```
Tell the operator to open `http://localhost:5173` in their browser. Confirm it loads before continuing.

---

### VS Code + Claude Extension Setup — When the Operator Asks

If the operator asks how to use Claude inside VS Code, walk them through this:

1. Open VS Code → click the Extensions icon in the left sidebar (or Cmd+Shift+X)
2. Search "Claude" → install the **Claude by Anthropic** extension
3. Click the Claude icon in the left sidebar → click Sign In
4. In VS Code: File → Open Folder → navigate to `~/Desktop/care-os/careos-claude-code/careos-claude-code` → open it
5. Claude now has full project context and can be used from the VS Code panel or terminal

Tell the operator: both the VS Code panel and the terminal `claude` command work equally well. Use whichever feels more comfortable.

---

### Promoting to Production — When the Operator Says Changes Are Ready

**Never push directly to `main`.** Production promotion follows the same PR workflow as all other changes — this ensures CI, HIPAA audit, and Greptile review run before anything reaches co-op.care.

```
# Step 1 — create a release branch from dev
# Capture timestamp once so the branch name and PR title never drift
RELEASE_TS=$(date +%Y-%m-%d-%H%M)
git checkout dev
git pull origin dev
git checkout -b release/prod-${RELEASE_TS}

# Step 2 — push and open a PR into main (not dev)
git push origin release/prod-${RELEASE_TS}
gh pr create --base main --title "release: promote dev to production ${RELEASE_TS}" \
  --body "Production release. All changes tested on dev. CI and Greptile must pass."

# Step 3 — wait for CI and Greptile 4/5+ (same rules as all PRs)
gh pr checks --watch

# Step 4 — only merge after Greptile score is 4/5 or higher and all CI checks pass
gh pr merge --squash --delete-branch

# Step 5 — sync dev with main so histories stay aligned after the squash-merge.
# This is the ONE case where a direct push to dev is permitted: it merges the
# squash commit from main back into dev so the next release PR has no spurious
# conflicts. NOTE: after a squash-merge this will always be a 3-way merge
# (creating a merge commit), not a fast-forward, because the squash rewrites
# history. That is expected and harmless — accept the merge commit.
git checkout dev
git pull origin dev
git merge origin/main --no-edit
# If merge conflicts occur, resolve them on this branch — never force-push.
git push origin dev
```

Tell the operator: Railway will automatically redeploy co-op.care within 2–3 minutes after the PR merges. No other action needed.

Also tell the operator: Step 5 (merging main into dev and pushing) will trigger a Railway redeploy of the **dev** environment as well. This is expected — dev will briefly redeploy to sync with the production release. No action needed.

If merge conflicts arise in Step 2–3 (on the release branch before it is merged), resolve them on the release branch, push the fix, and re-run checks. If conflicts arise in Step 5 (merging main back into dev), resolve them directly on the dev branch as shown in the inline comment above. Never force-push or skip checks to resolve a conflict.

---

### How to Handle Unclear Requests

When the operator gives a vague or incomplete request, do not ask multiple clarifying questions. Instead:

1. Make reasonable assumptions based on the existing codebase and project context
2. State your assumptions clearly in one sentence before starting
3. Proceed immediately with the workflow

Example — operator says "add a FAQ page":
> "I'll add a FAQ page to the public website at /faq covering Time Bank, membership, and privacy. Starting now."
Then execute the full workflow without waiting for a response.

Only stop and ask if the request is genuinely ambiguous in a way that could cause harm or significant rework — for example, if it is unclear whether a change should go to dev or production, or if a database schema change is involved that cannot be undone.

### What to Tell the Operator

Blaine does not need to understand git, CI, HIPAA rules, or deployment. When something goes wrong, explain it in plain English — what happened, why it matters, and exactly what to do next. One step at a time. Never use technical jargon without immediately explaining it.

When a change is successfully deployed, tell him: what changed, where to see it (URL), and whether it went to dev or production.

---

## What This Is

CareOS is the operating system for co-op.care, a worker-owned home care cooperative in Boulder, Colorado. You are building a HIPAA-compliant, mobile-first PWA backed by PostgreSQL 16 (operations) + Aidbox FHIR R4 (clinical) + Redis (cache/pub-sub).

**Read `docs/PRD.md` for the full product requirements. Read `docs/ARCHITECTURE.md` for the detailed module specs, data models, API endpoints, and file creation plan.**

## Critical Context

- **Primary user:** The Conductor (Alpha Daughter, female 35-60, manages aging parent's care from her phone)
- **Medical Director:** Josh Emdur, DO — signs all LMNs, conducts CRI assessments
- **Clinical taxonomy:** Omaha System (42 problems, 4 domains) — this is the entire clinical backbone
- **Founder:** Blaine Warkentine, MD — blaine@co-op.care

## Tech Stack (Non-Negotiable)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 19 |
| Build | Vite + vite-plugin-pwa | 6.4 |
| CSS | Tailwind CSS 4 (new) + Inline styles (legacy) | Mixed |
| Backend | Fastify (modular monolith) | 5 |
| Runtime | Node.js LTS | 22 |
| Operational DB | PostgreSQL | 16 |
| Clinical DB | Aidbox FHIR R4 | Latest |
| Cache/Pub-Sub | Redis | 7 |
| Charts | Recharts | 2 |
| State | Zustand | Latest |
| Testing | Vitest + Playwright | Latest |

## Brand System

- **Fonts:** Literata (serif, headings) + DM Sans (sans-serif, body)
- **Colors:** Teal #2BA5A0 (primary), Navy #1B3A5C (secondary), Gold #C49B40 (financial)
- **Logo:** Interlocking hands forming house shape with heart center

## Build Order — Phase 1 (Build This First)

Build in this exact sequence. Each step depends on the prior step.

### Step 1: Project Scaffold
- Initialize Vite + React 19 + TypeScript project
- Configure Tailwind CSS 4 with brand tokens
- Configure vite-plugin-pwa (manifest, service worker, offline fallback)
- Set up monorepo paths: `src/client/`, `src/server/`, `src/shared/`
- Create `docker-compose.yml` (PostgreSQL 16 + Redis 7 + Aidbox)
- Create `.env.example` with all required env vars
- Create `package.json` with all dependencies
- Set up ESLint + Prettier
- Create `.github/workflows/ci.yml`

### Step 2: Shared Constants and Types
- `src/shared/constants/omaha-system.ts` — all 42 problems, 4 domains, intervention categories
- `src/shared/constants/icd10-crosswalk.ts` — default Omaha ↔ ICD-10 mappings
- `src/shared/constants/business-rules.ts` — CII zones, Time Bank limits, pricing, GPS radius
- `src/shared/constants/loinc-codes.ts` — wearable vitals LOINC codes
- `src/shared/constants/irs-pub502.ts` — IRS Publication 502 categories
- `src/shared/types/*.types.ts` — all TypeScript interfaces (see ARCHITECTURE.md §0.4.2)

### Step 3: Backend Foundation
- `src/server/app.ts` — Fastify app factory with plugin registration
- `src/server/server.ts` — entry point with graceful shutdown
- `src/server/database/postgres.ts` — PostgreSQL connection pool (pg driver)
- `src/server/database/postgres.schema.sql` — all table definitions, indexes, constraints
- `src/server/database/aidbox.ts` — Aidbox FHIR R4 REST client
- `src/server/database/redis.ts` — Redis client with pooling
- `src/server/middleware/auth.middleware.ts` — JWT RS256 verification + role extraction
- `src/server/middleware/audit.middleware.ts` — PHI access audit logging
- `src/server/middleware/rate-limit.middleware.ts`
- `src/server/middleware/error-handler.middleware.ts` — HIPAA-safe (no PHI in errors)
- `src/server/common/constants.ts`, `exceptions.ts`, `logger.ts`, `validators.ts`

### Step 4: Auth Module
- `src/server/modules/auth/` — plugin, routes, service, schemas, guards
- JWT RS256 with 15-min access / 7-day refresh tokens
- 7-role RBAC: conductor, worker_owner, timebank_member, medical_director, admin, employer_hr, wellness_provider
- Multi-role per user support
- Optional 2FA (mandatory for medical_director and admin)

### Step 5: Family Module
- `src/server/modules/family/` — CRUD for Family + CareRecipient
- Stripe $100/year membership integration
- Care team relationships stored as join tables in PostgreSQL (`care_team_assignments`)

### Step 6: Assessment Engine
- `src/server/modules/assessments/` — CII + Mini CII + CRI
- CII: 12 dimensions, scored 1-10 via sliders, total /120
- Zones: Green ≤40, Yellow 41-79, Red ≥80
- Mini CII: 3 sliders (physical, sleep, isolation), /30
- Mini zones: Green ≤11, Yellow 12-20, Red ≥21
- CRI: 14 factors, min 14.4, max 72.0, MD review workflow
- Store in PostgreSQL (operational) + sync to Aidbox (QuestionnaireResponse)

### Step 7: Time Bank Engine
- `src/server/modules/timebank/` — the most complex module
- Double-entry credit ledger (earned, spent, bought, donated, expired, deficit)
- Skill/proximity matching: identity-matched 2×, <0.5mi 3×, 0.5-1mi 2×, 1-2mi 1×, >2mi remote only
- GPS verification: check-in/check-out within 0.25 miles (Haversine)
- Respite Default: 0.9 hrs to member + 0.1 hrs to Respite Fund (opt-out-able, genuinely easy)
- $15/hr cash purchase: $12 coordination + $3 Respite Fund
- 40 hr/year membership floor, -20 hr deficit max
- 12-month graduated expiry → auto-donate to Respite
- Behavioral nudges at -5/-10/-15/-20 deficit
- Streak tracking (4/8/12/26/52 weeks)
- Omaha auto-coding (see task map below)
- Cascade visualization via recursive PostgreSQL CTEs on `help_edges` table

### Step 8: FHIR Sync Service
- `src/server/modules/fhir-sync/` — async PostgreSQL → Aidbox sync
- Redis-backed job queue with exponential backoff retry
- Sync Encounters, Observations, QuestionnaireResponses

### Step 9: Notification Engine
- `src/server/modules/notifications/` — push, SMS, email, in-app
- Twilio (SMS), SendGrid (email), Web Push API
- 8 notification categories per ARCHITECTURE.md

### Step 10: Frontend — Conductor Dashboard
- `src/client/features/conductor/` — real-time care timeline
- WebSocket real-time updates via Redis pub/sub (`ws:broadcast` channel)
- Time Bank balance widget (6-field breakdown)
- Push notifications
- Secure messaging

### Step 11: Frontend — Assessments
- `src/client/features/assessments/` — CII slider interface (warm, NOT clinical)
- Mini CII Quick Check (completable in 30 seconds)
- Zone visualization with color coding

### Step 12: Frontend — Time Bank Hub
- `src/client/features/timebank/` — task cards, accept flow, GPS check-in/out
- Gratitude prompts, cascade visualization, streak counter

### Step 13: Onboarding Flow
- Mini CII → account creation → full CII → Stripe payment → CRI scheduling → dashboard
- Target: <10 minutes end-to-end

### Step 14: Public Website Integration
- Mount legacy components from `src/client/legacy/` at public routes
- These use inline styles — DO NOT apply Tailwind to them
- New CareOS features behind auth wall use Tailwind

### Step 15: Aidbox Init Bundle
- `config/aidbox/omaha-codesystem.json` — 42 problems, 4 domains
- `config/aidbox/cii-questionnaire.json`
- `config/aidbox/cri-questionnaire.json`
- `config/aidbox/omaha-to-icd10-conceptmap.json`
- `config/aidbox/icd10-to-omaha-conceptmap.json`

### Step 16: Background Jobs
- `src/server/jobs/timebank-expiry.job.ts` — 12-month credit expiry
- `src/server/jobs/membership-renewal.job.ts` — annual 40-hour floor reset
- `src/server/jobs/lmn-renewal.job.ts` — 60/30/7 day reminders
- `src/server/jobs/kbs-reassessment.job.ts` — 30/60/90 day scheduling

### Step 17: Tests
- Unit tests for: CII zone classification, Time Bank ledger, matching algorithm, Omaha auto-coding, GPS verification, Respite Default split, deficit enforcement
- Integration tests for PostgreSQL → Aidbox sync (outbox poller)
- E2E: Conductor onboarding, Time Bank exchange

## Omaha System Auto-Coding Map (IMMUTABLE)

Every Time Bank task maps to an Omaha problem:

| Task Type | Omaha Problem | Code | Intervention Category |
|-----------|--------------|------|-----------------------|
| meals | Digestion-Hydration | #28 | Treatments/Procedures |
| rides | Communication w/ Community Resources | #05 | Case Management |
| companionship | Social Contact | #06 | Surveillance |
| phone_companionship | Social Contact | #06 | Surveillance |
| tech_support | Communication w/ Community Resources | #05 | Teaching/Guidance |
| yard_work | Residence | #03 | Treatments/Procedures |
| housekeeping | Sanitation | #02 | Treatments/Procedures |
| grocery_run | Digestion-Hydration | #28 | Case Management |
| errands | Communication w/ Community Resources | #05 | Case Management |
| pet_care | Social Contact | #06 | Surveillance |
| admin_help | Communication w/ Community Resources | #05 | Case Management |
| teaching | Varies by subject | — | Teaching/Guidance/Counseling |

## Key Numbers (IMMUTABLE — do not change these)

| Metric | Value |
|--------|-------|
| US family caregivers | 63M |
| Weekly unpaid care | 27 hours |
| Out-of-pocket per caregiver | $7,200/year |
| Agency turnover | 77% |
| BVSD teachers | 1,717 (NOT 6,000) |
| TRU PACE enrollees | 341 |
| BCH readmission rate | 15.4% |
| Average readmission cost | $16,037 |
| Private pay rate | $35/hr |
| Worker-owner wage | $25-28/hr + equity (~$52K/5yr) |
| Time Bank cash rate | $15/hr ($12 coord + $3 Respite) |
| Time Bank floor | 40 hrs/year (in $100 membership) |
| HSA/FSA savings via LMN | 28-36% |
| CII dimensions | 12, scored 1-10, total /120 |
| CRI range | min 14.4, max 72.0 |
| KBS subscales | K 1-5, B 1-5, S 1-5 |
| Omaha System problems | 42 across 4 domains |

## Anti-Patterns (DO NOT BUILD)

1. NO marketplace where families browse/hire caregivers — matching is algorithmic
2. NO separate apps per user type — ONE app with role-based views
3. NO real-time video calling — Zoom API integration only
4. NO insurance claims engine — Age at Home is 2028+
5. NO drag-and-drop scheduling — coordinator assigns, worker confirms
6. NO long Time Bank onboarding gate — first interaction within 24 hours
7. NO clinical-feeling CII — warm, conversational, slider-based
8. NO gamification (points/levels/badges/leaderboards) — streaks + impact scores only
9. NO dark patterns for Respite Default — opt-out must be genuinely easy
10. NO storage of SSNs/full card numbers/bank accounts — Stripe and Checkr handle PII

## Coding Conventions

- TypeScript strict mode, no `any` in business logic
- Fastify plugin pattern for each module (see ARCHITECTURE.md §0.9.1)
- TypeBox for request/response schema validation
- No PHI in logs, error messages, or client-side storage
- PostgreSQL: parameterized queries via `pg` driver — never string-interpolate SQL (prevent injection)
- Graph relationships stored as join tables (`help_edges`, `care_team_assignments`) — use recursive CTEs for traversal
- Dual-database write: PostgreSQL first (sync), then Aidbox via Redis-backed outbox poller (async)
- All FHIR resource access logged as AuditEvent in Aidbox

## File Structure Reference

See `docs/ARCHITECTURE.md` section 0.5.1 for the complete repo structure.

## Phase 2 (Build After Phase 1 is Deployed)

After Phase 1 is live with 40 families:
- CRI Assessment Engine with MD review
- KBS Outcome Tracking (30/60/90 day)
- Full Omaha ↔ ICD-10 Crosswalk Engine (5-step pipeline)
- Worker-Owner Portal
- LMN generation + DocuSign + Marketplace
- Comfort Card reconciliation
- Wearable Integration (Apple Health)
- Employer Dashboard
- Admin Dashboard

## Phase 3 (Build After Phase 2)

- BCH Epic HL7 FHIR integration
- Predictive hospitalization ML
- PACE data exchange
- Federation multi-tenancy
