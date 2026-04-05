# Jacob's 90-Day Backend Development Plan

**Date:** March 10, 2026
**Context:** co-op.care LCA filed today. Approach C = aggressive parallel execution. Pre-license revenue through CII/CRI assessments starting Month 2. No Aidbox production until license + patients (save $1,900/mo).

**Database:** PostgreSQL 16 + PostGIS (NOT PostgreSQL). Simpler, battle-tested, cheaper to host. Schema: `src/server/database/schema.sql`

**What changed since the handoff docs:** Blaine filed an LCA (not LLC). Every.io is off — Opolis is ecosystem partner. PostgreSQL replaced with PostgreSQL for now. The #1 business priority is getting assessment revenue flowing ASAP. Care Navigators (W-2, $25-28/hr) start in Month 1 doing assessments under Dr. Emdur's supervision.

**Read first:** `JACOB-BACKEND-HANDOFF.md` (v1, 7 endpoints) and `JACOB-BACKEND-HANDOFF-v2.md` (architecture update). Note: those docs contain some PostgreSQL references — this plan supersedes them for database choice.

---

## The 3-Sentence Summary

Month 1: Auth + assessments (the revenue engine). Month 2: Families + Time Bank (the community engine). Month 3: Notifications + outbox processor + the 7 community endpoints (the engagement engine). Everything uses PostgreSQL + PostGIS.

---

## Database Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Primary DB** | PostgreSQL 16 + PostGIS | Mature, widely supported, excellent tooling |
| **ORM / Query** | Drizzle ORM or Kysely (Jacob's preference) — or raw `pg` with parameterized queries | Type-safe SQL |
| **Migrations** | Drizzle Kit, or raw SQL migration files | Schema versioning |
| **Cache/Pub-Sub** | Redis 7 | Session store, job queues, real-time |
| **Clinical DB** | Aidbox FHIR R4 (deferred to Month 4-5) | Not needed until PHI handling |

**Schema file:** `src/server/database/schema.sql` — 15 tables, 4 relation tables (replacing relation tables), PostGIS for geospatial, `updated_at` triggers, UUID primary keys.

**Key PostgreSQL patterns replacing PostgreSQL:**

| PostgreSQL Concept | PostgreSQL Equivalent |
|---|---|
| `record<user>` | `UUID REFERENCES "user"(id)` |
| `geometry<point>` | `GEOGRAPHY(POINT, 4326)` + PostGIS |
| `geo::distance()` | `ST_Distance(geog1, geog2)` — returns meters |
| Graph edges (`helped`, `member_of`, etc.) | Regular relation tables with foreign keys |
| `DEFINE EVENT` | Application-level triggers or PostgreSQL `TRIGGER` |
| `LIVE SELECT` | PostgreSQL `LISTEN/NOTIFY` or Redis pub-sub |
| `type::thing("user", $id)` | `SELECT * FROM "user" WHERE id = $1` |
| `math::sum()` / `GROUP ALL` | Standard `SUM()` / `GROUP BY` |
| SQL `time::now()` | `now()` |

---

## Month 1: Auth + Assessment Engine (Weeks 1-4)

This is the revenue-critical path. Care Navigators need accounts and the ability to submit CII/CRI assessments that Dr. Emdur reviews. Each assessment = $150-300 cash.

### Week 1-2: Foundation + Auth Module

| # | Task | Table(s) | Notes |
|---|------|----------|-------|
| 1 | **PostgreSQL connection** | — | `src/server/database/postgres.ts` — connection pool via `pg` or Drizzle. Run `schema.sql` for init |
| 2 | **Redis connection** | — | `src/server/database/redis.ts` — basic client, session store |
| 3 | **Fastify app factory** | — | `src/server/app.ts` — plugin registration, CORS, rate limiting |
| 4 | **Error handler middleware** | — | HIPAA-safe: no PHI in error responses, ever |
| 5 | **Auth plugin** | `user` | JWT RS256, 15-min access / 7-day refresh tokens |
| 6 | **Role guards** | `user.roles` | 7 roles. Multi-role per user. `conductor`, `worker_owner`, `timebank_member`, `medical_director`, `admin`, `employer_hr`, `wellness_provider` |
| 7 | **2FA** | `user.two_factor_enabled/secret` | Mandatory for `medical_director` and `admin` roles only |

**Auth endpoints:**

```
POST /api/v1/auth/register     — email, password, firstName, lastName, phone
POST /api/v1/auth/login        — email, password → access + refresh tokens
POST /api/v1/auth/refresh      — refresh token → new access token
POST /api/v1/auth/logout       — invalidate refresh token
POST /api/v1/auth/2fa/setup    — generate TOTP secret
POST /api/v1/auth/2fa/verify   — verify TOTP code
GET  /api/v1/auth/me           — current user profile
```

**Key detail:** The `user` table uses `roles TEXT[]` (PostgreSQL array). Active role determines which dashboard the frontend shows. A Care Navigator gets `roles: '{worker_owner}'` and might later get `timebank_member` added. Check roles with `$1 = ANY(roles)`.

### Week 3-4: Assessment Engine

This is the money maker. CII assessments (12 sliders, total /120) and CRI assessments (14 factors, 14.4-72.0 range) are what Care Navigators bill $150-300 for.

| # | Task | Table(s) | Notes |
|---|------|----------|-------|
| 8 | **Assessment CRUD** | `assessment` | Create, read, list by family/recipient |
| 9 | **CII scoring** | `assessment.scores[]` | 12 dimensions, each 1-10. Total = sum. Zones: Green ≤40, Yellow 41-79, Red ≥80 |
| 10 | **Mini CII scoring** | same table, `type='mini_cii'` | 3 sliders (physical, sleep, isolation). /30. Green ≤11, Yellow 12-20, Red ≥21 |
| 11 | **CRI scoring** | same table, `type='cri'` | 14 factors. Range 14.4-72.0. Requires `review_status='pending'` → MD reviews |
| 12 | **MD review workflow** | `assessment.review_status/reviewed_by/reviewed_at` | Dr. Emdur approves CRI assessments. Status: `pending` → `approved` / `needs_revision` |
| 13 | **Assessment history** | — | List all assessments for a care recipient, sorted by date, with zone trend |

**Assessment endpoints:**

```
POST   /api/v1/assessments                — create assessment (CII, Mini CII, or CRI)
GET    /api/v1/assessments/:id            — get single assessment with scores
GET    /api/v1/assessments/family/:id     — list all assessments for a family
GET    /api/v1/assessments/recipient/:id  — list all for a care recipient
PATCH  /api/v1/assessments/:id/review     — MD review (approve/needs_revision) — medical_director only
GET    /api/v1/assessments/pending-review — list assessments awaiting MD review — medical_director only
```

**Example queries (PostgreSQL):**

```sql
-- Create CII assessment
INSERT INTO assessment (family_id, care_recipient_id, assessor_id, type, scores, total_score, zone)
VALUES ($1, $2, $3, 'cii', $4, $5, $6)
RETURNING *;

-- List pending CRI reviews for Dr. Emdur
SELECT a.*, cr.first_name, cr.last_name, f.name AS family_name
FROM assessment a
JOIN care_recipient cr ON a.care_recipient_id = cr.id
JOIN family f ON a.family_id = f.id
WHERE a.type = 'cri' AND a.review_status = 'pending'
ORDER BY a.created_at;

-- Assessment trend for a care recipient
SELECT type, total_score, zone, completed_at
FROM assessment
WHERE care_recipient_id = $1
ORDER BY completed_at DESC
LIMIT 20;
```

**CII zone calculation (immutable — from `business-rules.ts`):**

```typescript
function getCIIZone(totalScore: number): 'green' | 'yellow' | 'red' {
  if (totalScore <= 40) return 'green';
  if (totalScore <= 79) return 'yellow';
  return 'red';
}

function getMiniCIIZone(totalScore: number): 'green' | 'yellow' | 'red' {
  if (totalScore <= 11) return 'green';
  if (totalScore <= 20) return 'yellow';
  return 'red';
}
```

**CRI range:** min 14.4, max 72.0. No zones — it's a continuous risk score that Dr. Emdur interprets.

**Why this is Week 3-4 and not later:** By the time Care Navigators are hired (end of Month 1), the assessment API must be live. This is the revenue engine.

### Month 1 Deliverable

A working API where:
1. A Care Navigator can log in
2. Submit a CII or CRI assessment for a care recipient
3. Dr. Emdur can log in, see pending CRI assessments, approve them
4. Assessment history is queryable by family or recipient

**Do NOT build yet:** Aidbox sync, FHIR resource creation, outbox events for assessments. That's Month 3. Store everything in PostgreSQL only for now.

---

## Month 2: Families + Time Bank (Weeks 5-8)

With auth and assessments live, the next priority is family management (so assessments attach to real families) and the Time Bank (community engagement before the license arrives).

### Week 5-6: Family Module

| # | Task | Table(s) | Notes |
|---|------|----------|-------|
| 14 | **Family CRUD** | `family` | Create family, update, get by conductor |
| 15 | **Care recipient CRUD** | `care_recipient` | Attach to family. Omaha problems, mobility, cognitive status |
| 16 | **Care team relations** | `member_of`, `assigned_to` | Conductor creates family → members join → workers assigned |
| 17 | **Stripe membership** | `family.stripe_customer_id/stripe_subscription_id` | $100/year membership. Use Stripe Checkout. Webhook for payment confirmation |

**Family endpoints:**

```
POST   /api/v1/families                    — create family (conductor only)
GET    /api/v1/families/:id                — get family with care team
GET    /api/v1/families/mine               — get families where current user is conductor or member
POST   /api/v1/families/:id/members        — add member to family (creates member_of row)
DELETE /api/v1/families/:id/members/:uid   — remove member
POST   /api/v1/families/:id/recipients     — add care recipient
GET    /api/v1/families/:id/recipients     — list care recipients
PATCH  /api/v1/families/:id/recipients/:rid — update care recipient
POST   /api/v1/families/:id/checkout       — Stripe checkout session for $100/yr membership
POST   /api/v1/webhooks/stripe             — Stripe webhook handler
```

**Example queries (PostgreSQL):**

```sql
-- Get family with care team members
SELECT f.*,
  json_agg(DISTINCT jsonb_build_object(
    'userId', m.user_id, 'role', m.role, 'joinedAt', m.joined_at,
    'firstName', u.first_name, 'lastName', u.last_name
  )) AS members
FROM family f
LEFT JOIN member_of m ON m.family_id = f.id
LEFT JOIN "user" u ON u.id = m.user_id
WHERE f.id = $1
GROUP BY f.id;

-- Families where user is conductor or member
SELECT DISTINCT f.*
FROM family f
LEFT JOIN member_of m ON m.family_id = f.id
WHERE f.conductor_id = $1 OR m.user_id = $1;
```

### Week 7-8: Time Bank Engine (Core)

The Time Bank is the most complex module in the system. For Month 2, build the **core ledger** and **task lifecycle**. Defer matching algorithm and GPS verification to Month 3.

| # | Task | Table(s) | Notes |
|---|------|----------|-------|
| 18 | **Account management** | `timebank_account` | Auto-create when user joins. 6-field balance (earned, membership, bought, donated, expired, deficit) |
| 19 | **Double-entry ledger** | `timebank_transaction` | Every transaction creates TWO entries (debit + credit). `balance_after` for audit trail |
| 20 | **Task lifecycle** | `timebank_task` | open → matched → in_progress → completed → rated |
| 21 | **Task creation + listing** | — | Requester creates task with type, location, estimated hours |
| 22 | **Task acceptance** | `timebank_task.matched_user_id` | Worker accepts open task. Status → matched |
| 23 | **Check-in/check-out** | `timebank_task.check_in_*/check_out_*` | Record timestamps + locations. Actual hours calculated |
| 24 | **Omaha auto-coding** | `timebank_task.omaha_problem_code` | Every task type maps to an Omaha problem — see the immutable map below |
| 25 | **Respite Default split** | `respite_fund` | 0.9 hrs to member + 0.1 hrs to Respite Fund. Opt-out must be genuinely easy |
| 26 | **Helped relation** | `helped` table | When task completes, insert into `helped` with from_user, to_user, hours |

**Time Bank endpoints:**

```
GET    /api/v1/timebank/balance            — current user's 6-field balance
GET    /api/v1/timebank/transactions       — ledger history with pagination
POST   /api/v1/timebank/tasks              — create task request
GET    /api/v1/timebank/tasks              — list available tasks (with filters)
GET    /api/v1/timebank/tasks/:id          — get task details
POST   /api/v1/timebank/tasks/:id/accept   — accept a task
POST   /api/v1/timebank/tasks/:id/checkin  — GPS check-in
POST   /api/v1/timebank/tasks/:id/checkout — GPS check-out + auto-calculate hours + ledger entries
POST   /api/v1/timebank/tasks/:id/rate     — rating + gratitude note
POST   /api/v1/timebank/buy               — buy hours with cash ($15/hr: $12 coordination + $3 Respite)
```

**Example queries (PostgreSQL + PostGIS):**

```sql
-- GPS check-in verification (must be within 0.25 miles = 402.336 meters)
SELECT ST_Distance(
  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
  location
) AS distance_meters
FROM timebank_task WHERE id = $3;
-- If distance_meters <= 402.336, GPS is verified

-- Find nearby open tasks (within 2 miles = 3218.69 meters)
SELECT t.*, ST_Distance(t.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_m
FROM timebank_task t
WHERE t.status = 'open'
  AND ST_DWithin(t.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 3218.69)
ORDER BY distance_m;

-- Cascade visualization (who helped whom)
SELECT h.*, u1.first_name AS helper_name, u2.first_name AS helped_name
FROM helped h
JOIN "user" u1 ON h.from_user = u1.id
JOIN "user" u2 ON h.to_user = u2.id
WHERE h.from_user = $1 OR h.to_user = $1
ORDER BY h.created_at DESC;

-- Community hours this month
SELECT SUM(hours) AS total
FROM timebank_transaction
WHERE type = 'earned'
  AND created_at >= date_trunc('month', now());
```

**Omaha auto-coding map (copy this exactly — it's immutable):**

```typescript
const OMAHA_TASK_MAP: Record<string, { problemCode: number; problemName: string; interventionCategory: string }> = {
  meals:               { problemCode: 28, problemName: 'Digestion-Hydration', interventionCategory: 'Treatments/Procedures' },
  rides:               { problemCode: 5,  problemName: 'Communication w/ Community Resources', interventionCategory: 'Case Management' },
  companionship:       { problemCode: 6,  problemName: 'Social Contact', interventionCategory: 'Surveillance' },
  phone_companionship: { problemCode: 6,  problemName: 'Social Contact', interventionCategory: 'Surveillance' },
  tech_support:        { problemCode: 5,  problemName: 'Communication w/ Community Resources', interventionCategory: 'Teaching/Guidance' },
  yard_work:           { problemCode: 3,  problemName: 'Residence', interventionCategory: 'Treatments/Procedures' },
  housekeeping:        { problemCode: 2,  problemName: 'Sanitation', interventionCategory: 'Treatments/Procedures' },
  grocery_run:         { problemCode: 28, problemName: 'Digestion-Hydration', interventionCategory: 'Case Management' },
  errands:             { problemCode: 5,  problemName: 'Communication w/ Community Resources', interventionCategory: 'Case Management' },
  pet_care:            { problemCode: 6,  problemName: 'Social Contact', interventionCategory: 'Surveillance' },
  admin_help:          { problemCode: 5,  problemName: 'Communication w/ Community Resources', interventionCategory: 'Case Management' },
};
```

### Month 2 Deliverable

A working API where:
1. A Conductor can create a family, add care recipients, pay $100/yr via Stripe
2. Time Bank members can request tasks, accept them, check in/out, earn credits
3. The ledger is accurate with double-entry accounting
4. Omaha coding happens automatically on every task

---

## Month 3: Engagement + Sync Foundation (Weeks 9-12)

With the revenue engine (assessments) and community engine (Time Bank) live, Month 3 adds the engagement layer and prepares for clinical data sync.

### Week 9-10: The 7 Community Endpoints + Notifications

These are the original v1 endpoints from `JACOB-BACKEND-HANDOFF.md`. They power the 3 frontend pages that are already built (ComfortCardLanding, ComfortCardValue, TimeBankCommunity).

| # | Endpoint | Complexity |
|---|----------|-----------|
| 27 | `GET /api/v1/community/stats` | Low — aggregations from user, timebank_transaction, timebank_task |
| 28 | `GET /api/v1/user/value` | Medium — multi-table joins (assessments + timebank + family) |
| 29 | `GET /api/v1/timebank/community/impact` | Low — aggregate impact stats |
| 30 | `GET /api/v1/timebank/community/my-impact` | Low — per-user impact |
| 31 | `GET /api/v1/timebank/community/spotlights` | Low — top-N query |
| 32 | `GET /api/v1/timebank/community/gratitude` | Low — SELECT with pagination |
| 33 | `GET /api/v1/timebank/community/feed` | Medium — recent activity log |

**Full specs for all 7 are in `JACOB-BACKEND-HANDOFF.md`.** Replace the SQL sketches with standard PostgreSQL — all the same logic applies.

**Example conversions:**

```sql
-- Active neighbors (replaces SQL time::now() - 90d)
SELECT COUNT(*) FROM timebank_account
WHERE last_activity_at > now() - INTERVAL '90 days';

-- Hours this month (replaces time::floor)
SELECT COALESCE(SUM(hours), 0) FROM timebank_transaction
WHERE type = 'earned' AND created_at >= date_trunc('month', now());

-- Distinct families supported
SELECT COUNT(DISTINCT requester_id) FROM timebank_task
WHERE status = 'completed';

-- Average response time
SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) AS avg_minutes
FROM timebank_task
WHERE status IN ('matched', 'completed');

-- Gratitude wall with privacy (first name + last initial)
SELECT t.id,
  u1.first_name || ' ' || LEFT(u1.last_name, 1) || '.' AS from_name,
  u2.first_name || ' ' || LEFT(u2.last_name, 1) || '.' AS to_name,
  t.task_type, t.gratitude_note AS message, t.created_at
FROM timebank_task t
JOIN "user" u1 ON t.requester_id = u1.id
JOIN "user" u2 ON t.matched_user_id = u2.id
WHERE t.gratitude_note IS NOT NULL AND t.status = 'completed'
ORDER BY t.created_at DESC
LIMIT $1 OFFSET $2;
```

| # | Task | Notes |
|---|------|-------|
| 34 | **Notification engine** | `notification` table. In-app only for now. Push/SMS/email = Month 4+ |
| 35 | **Streak tracking** | Calculate from `timebank_transaction` — consecutive weeks with earned hours. Store in `timebank_account.current_streak/longest_streak` |

### Week 11-12: Outbox Processor + GPS + Matching

| # | Task | Notes |
|---|------|-------|
| 36 | **Outbox processor** | `outbox_event` table. Poll pending events every 30 seconds, process by `event_type`. Initially just mark as processed (no Aidbox yet) |
| 37 | **CaptureTripleOutput** | When `care_interaction.ended_at` is set → create 3 outbox events: `fhir_observation`, `billing_assessment`, `payroll_instruction` |
| 38 | **GPS verification** | PostGIS `ST_Distance()` on check-in/check-out. Must be ≤ 402.336 meters (0.25 miles) |
| 39 | **Skill/proximity matching** | Identity-matched 2×, <0.5mi 3×, 0.5-1mi 2×, 1-2mi 1×, >2mi remote only. Use `ST_DWithin()` |
| 40 | **Deficit enforcement** | -20 hr max. Behavioral nudges at -5/-10/-15/-20. Block task creation below -20 |

**CaptureTripleOutput (application-level — simpler to debug with PostgreSQL):**

```typescript
async function completeInteraction(id: string, checkOutData: CheckOutData) {
  return await db.transaction(async (tx) => {
    // Update the interaction
    const interaction = await tx.query(
      `UPDATE care_interaction SET ended_at = $1, notes = $2
       WHERE id = $3 RETURNING *`,
      [new Date(), checkOutData.notes, id]
    );

    // Triple output — all in the same transaction
    await Promise.all([
      tx.query(
        `INSERT INTO outbox_event (event_type, resource_type, resource_id, payload)
         VALUES ('fhir_observation', 'Observation', $1, $2)`,
        [id, JSON.stringify(buildFhirPayload(interaction))]
      ),
      tx.query(
        `INSERT INTO outbox_event (event_type, resource_type, resource_id, payload)
         VALUES ('billing_assessment', 'CareInteraction', $1, $2)`,
        [id, JSON.stringify(buildBillingPayload(interaction))]
      ),
      tx.query(
        `INSERT INTO outbox_event (event_type, resource_type, resource_id, payload)
         VALUES ('payroll_instruction', 'PayrollInstruction', $1, $2)`,
        [id, JSON.stringify(buildPayrollPayload(interaction))]
      ),
    ]);

    return interaction;
  });
}
```

**Why application-level over PostgreSQL triggers:** With PostgreSQL, we'd use `AFTER UPDATE` triggers, but application-level gives better control flow, testability, and the transaction wraps everything atomically anyway.

### Month 3 Deliverable

A working API where:
1. The 3 existing frontend pages (ComfortCard Landing, Value, Community) are fully live with real data
2. Notifications are stored and retrievable
3. Care interactions create triple outbox events (ready for Aidbox when it goes live)
4. GPS-verified check-in/check-out via PostGIS
5. Smart matching suggests the best available helper

---

## What's Explicitly Deferred (Do NOT Build in 90 Days)

| Item | Why | When |
|------|-----|------|
| Aidbox FHIR sync | No production Aidbox until license + patients ($1,900/mo saved) | Month 4-5 |
| Wearable MCP server | AI agent infrastructure, not REST API | Month 4+ |
| BCH integration / HL7 | Needs BCH IT coordination | Month 5+ |
| Billing engine | Reference only — billing agent handles this later | Month 6+ |
| Real-time subscriptions | Use REST polling for now. LISTEN/NOTIFY or WebSockets later | Month 4+ |
| 4 new relation tables | Add incrementally: `lives_near`, `discharged_to`, `monitors`, `billed_for` | As features need them |
| NLP pipeline | Future ambient capture | Year 2 |
| Web3 / tokenized patronage | Learn from Opolis first | Month 9-12 |
| Opolis API integration | After LCA bylaws finalized | Month 3-4 |
| KBS outcome tracking | Phase 2 | Month 4+ |
| LMN generation | Phase 2 | Month 5+ |

---

## PostgreSQL Quick Reference

**15 tables:** user, family, care_recipient, timebank_account, timebank_transaction, timebank_task, assessment, kbs_rating, care_interaction, notification, message, respite_fund, worker_equity, outbox_event

**4 relation tables (replacing relation tables):** helped, member_of, assigned_to, referred

**Schema file:** `src/server/database/schema.sql`

**PostGIS cheat sheet:**

```sql
-- Create a point from lat/lon
ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography

-- Distance between two points (returns meters)
ST_Distance(geog1, geog2)

-- Is point within radius? (meters)
ST_DWithin(geog1, geog2, radius_meters)

-- 0.25 miles = 402.336 meters
-- 0.5  miles = 804.672 meters
-- 1    mile  = 1609.34 meters
-- 2    miles = 3218.69 meters
```

**Useful PostgreSQL patterns:**

```sql
-- Array contains (for role checking)
WHERE 'conductor' = ANY(roles)

-- JSONB (for vitals_recorded, notification data)
WHERE data->>'alertType' = 'high_risk'

-- Pagination
LIMIT $1 OFFSET $2

-- Upsert
INSERT INTO ... ON CONFLICT (user_id) DO UPDATE SET ...

-- Transaction
BEGIN; ... COMMIT;  (or use pg client's transaction wrapper)
```

---

## Deployment

**Target:** Railway Pro ($20/mo) for Phase 1.
- PostgreSQL (Railway managed, or Neon/Supabase free tier to start)
- Redis container
- Fastify API container
- No Aidbox until Month 4-5

**HIPAA BAA:** Railway offers BAA at $1,000/mo minimum (annual commitment) — activate when handling PHI post-license.

**PostgreSQL hosting options for Phase 1:**

| Provider | Free Tier | Notes |
|----------|----------|-------|
| Railway managed | $5/mo (usage-based) | Simplest — same platform |
| Neon | 0.5 GB free | Serverless, branching, generous free tier |
| Supabase | 500 MB free | Includes PostGIS, auth (but we have our own), realtime |
| Render | 1 GB free (90-day limit) | Good for prototyping |

---

## Sprint Summary

| Week | Focus | Key Deliverable |
|------|-------|----------------|
| 1-2 | PostgreSQL + Redis + Fastify + Auth | Login/register works, JWT flows, role guards |
| 3-4 | Assessment engine | CII/CRI submit + MD review workflow |
| 5-6 | Family module + Stripe | Family CRUD, care recipients, $100/yr membership |
| 7-8 | Time Bank core | Ledger, tasks, check-in/out, Omaha auto-coding |
| 9-10 | 7 community endpoints + notifications | Frontend pages go live with real data |
| 11-12 | CaptureTripleOutput + GPS + matching | Outbox processor, PostGIS verification, smart matching |

---

## Questions for Jacob

1. **ORM preference:** Drizzle ORM, Kysely, Prisma, or raw `pg` with parameterized queries? Drizzle and Kysely are type-safe without code generation. Prisma adds a generation step but has a larger ecosystem.
2. **Migration tooling:** Drizzle Kit (if using Drizzle), or standalone migration files (e.g., `001_init.sql`, `002_add_spotlight.sql`)?
3. **Auth:** Roll JWT RS256 from scratch or use `@fastify/jwt`? We need RS256 specifically (asymmetric) for future microservice token verification.
4. **Stripe:** Stripe Checkout (redirect) or Stripe Elements (embedded)?
5. **PostgreSQL hosting:** Railway managed DB, Neon, or Supabase for Phase 1?
6. **Testing:** Vitest for unit tests is in the project config. Write tests alongside each module, or in a dedicated sprint?

---

*co-op.care Limited Cooperative Association · LCA filed March 10, 2026 · Confidential*
