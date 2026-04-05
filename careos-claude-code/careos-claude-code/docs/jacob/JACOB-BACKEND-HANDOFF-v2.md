# CareOS Backend Handoff v2 — Full System Architecture Update

**Date:** March 9, 2026 (Updated March 10 — PostgreSQL replaces PostgreSQL)
**From:** Claude (AI pair programming with Blaine)
**For:** Jacob (backend implementation at Cohesion Labs)
**Project:** `/Users/blaine/Desktop/careos-claude-code/careos-claude-code/`

---

## What Changed Since v1

The v1 handoff covered 7 community/value API endpoints. Those are still valid and needed.

This v2 update adds **everything we've built since** — 8 new type files, major business rules expansion, the wearable MCP server, and the agentic architecture blueprint. This document tells you what exists, what's actionable NOW, and what to build in what order.

**Database change (March 10):** We're using **PostgreSQL 16 + PostGIS** instead of PostgreSQL for the operational database. Simpler, battle-tested, better tooling ecosystem. Schema: `src/server/database/schema.sql`. The PostgreSQL schema file (`schema.sql`) is retained for reference but is not the build target.

**Also see:** `docs/JACOB-90-DAY-PLAN.md` for the week-by-week sprint plan with PostgreSQL query examples.

---

## The 30-Second Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (React/Vite)                    │
│  95+ feature modules, viral sharing, Comfort Card landing    │
└──────────────────────┬──────────────────────────────────────┘
                       │ Fastify REST API
┌──────────────────────▼──────────────────────────────────────┐
│                     SERVER (Fastify)                          │
│  Routes → Services → Database Queries                        │
│  + MCP Servers (wearable, Twilio — coming)                  │
│  + AI Agents (Claude SDK / LangGraph — coming)               │
└────┬──────────┬──────────┬───────────────────────────────────┘
     │          │          │
┌────▼─────┐ ┌──▼───┐ ┌───▼────┐
│PostgreSQL│ │Aidbox│ │ Redis  │
│+ PostGIS │ │ FHIR │ │Pub/Sub │
│15 tables │ │R4    │ │Cache   │
│4 rel tbls│ │      │ │        │
└──────────┘ └──────┘ └────────┘
```

---

## New Files Jacob Should Know About

### Type Files (Shared — Client + Server)

All in `src/shared/types/`. These define the data contracts and strategic architecture.

| File | Lines | What It Defines | Jacob Action |
|------|-------|----------------|-------------|
| `opolis.types.ts` | ~350 | Opolis Employment Commons: Business-of-One model, Cigna PPO benefits, $WORK streaming equity, **CaptureTripleOutput** (single clock-in → FHIR + Billing + Payroll), digital currency payroll options | **READ THIS FIRST** — CaptureTripleOutput is the #1 build requirement |
| `federation.types.ts` | ~430 | Colorado LCA structure, 3 membership classes, patronage dividends (Subchapter T), vesting schedule, `calculatePatronageDividend()` + `calculateRedemptionValue()` functions | Reference for equity/dividend calculations |
| `postgres-agentic.types.ts` | ~500 | Agentic architecture blueprint: 17 real-time subscriptions for 7 agents, 8 relation patterns, 7 CORM pipeline events, 6 graph intelligence queries, 5 health system integration patterns | **Architecture reference** — concepts apply regardless of DB. Real-time subscriptions will use PostgreSQL LISTEN/NOTIFY or Redis pub-sub |
| `network-intelligence.types.ts` | ~500 | Happenstance.ai integration, complete tooling ecosystem (17 tools), network growth projections, viral onboarding flow | Reference for growth/network features |
| `nlp-pipeline.types.ts` | ~250 | 5-stage NLP: Ambient Capture → Entity Extraction → Omaha Mapping → Human Review → FHIR Generation | Future — not needed now |
| `bch-integration.types.ts` | ~200 | BCH Safe Graduation: HL7 v2 ADT messages, 72hr post-discharge window, eligibility criteria | Future — needs BCH IT coordination |
| `web3.types.ts` | ~400 | ERC-7818 tokens, Gnosis Safe, smart contracts, AI safety layer | Year 2 — not needed now |
| `billing-codes.ts` | ~600 | Complete 10-layer CMS revenue stack: PIN, CHI, CCM, RPM, ACCESS, PACE + `calculateMaxMonthlyRevenue()` | Reference for billing agent |

### Constants (Shared)

| File | What Changed | Jacob Action |
|------|-------------|-------------|
| `business-rules.ts` | Major additions: BRAND positioning, AGENTIC_MEMORY (context-as-moat), PLACEMENT_AGENCY_BRIDGE ($870 registration), COLORADO_FUNDING (75% tax credit), REVENUE_STACK_PHASES (6-layer phased rollout), enhanced PARTNERSHIPS (BCH, BVSD, Elevations, BCAAA) | **Reference** — these constants drive business logic |
| `loinc-codes.ts` | Galaxy Watch primary device, Samsung Health keys alongside Apple Health keys, 10 LOINC metrics, device profiles | Reference for wearable data |

### Wearable MCP Server (New Module)

```
src/server/modules/wearable-mcp/
  wearable-server.ts    — MCP server with 6 tools + 4 resources
  wearable-tools.ts     — Tool implementations (Aidbox FHIR queries, RPM billing)
  wearable-types.ts     — BillingEligibility, VitalReading, AnomalyAlert types
```

This is a Model Context Protocol server that AI agents (Sage Companion, Billing Agent) will use to query wearable health data. Not a REST endpoint — it's an MCP server that Claude Agent SDK connects to.

### Viral Sharing System (New Module)

```
src/client/components/sharing/
  ShareButton.tsx       — Reusable trigger (inline/pill variants)
  ShareModal.tsx        — 7-channel: SMS, Email, WhatsApp, Facebook, X, LinkedIn, Copy Link
  InviteBanner.tsx      — Dismissible banner for page tops
  MilestoneToast.tsx    — Celebration toast with embedded share
src/client/hooks/useShare.ts    — Web Share API + fallback
src/client/stores/shareStore.ts — Modal state, dismissed banners (localStorage)
src/shared/constants/share-templates.ts — 8 categories, message templates, URLs
```

Client-only. No backend needed yet.

---

## What Jacob Should Build — Priority Order

**See `docs/JACOB-90-DAY-PLAN.md` for the detailed week-by-week sprint plan with PostgreSQL examples.**

### TIER 1: Ship Tomorrow (Original v1 Endpoints)

These are the same 7 endpoints from v1 — they make the existing frontend pages live.

| # | Endpoint | Complexity | Notes |
|---|----------|-----------|-------|
| 1 | `GET /api/v1/community/stats` | Low | Powers Comfort Card landing page. Simple aggregations. |
| 2 | `GET /api/v1/user/value` | Medium | Powers personal value page. Multi-table joins. |
| 3 | `GET /api/v1/timebank/community/impact` | Low | Aggregate version of per-user impact. |
| 4 | `GET /api/v1/timebank/community/my-impact` | Low | Wraps existing streak/impact services. |
| 5 | `GET /api/v1/timebank/community/spotlights` | Low | Top-N query. |
| 6 | `GET /api/v1/timebank/community/gratitude` | Low | SELECT with pagination. |
| 7 | `GET /api/v1/timebank/community/feed` | Medium | Recent activity log. REST polling for v1. |

**Full specs for all 7 are in the original v1 handoff** (`docs/JACOB-BACKEND-HANDOFF.md`). Replace the SQL sketches with standard PostgreSQL — all the same logic applies.

### TIER 2: CaptureTripleOutput (The #1 New Build)

This is the single most important new piece of infrastructure. When a caregiver clocks out of a visit, ONE event should produce THREE downstream records.

**What:** When `care_interaction.ended_at` is set (visit completed), automatically create:

1. **FHIR Observation** → `outbox_event` with `event_type: 'fhir_observation'`
   - Omaha-coded care data from the visit
   - Duration, vitals if recorded
   - Target: Aidbox sync processor picks this up

2. **CMS Billing Event** → `outbox_event` with `event_type: 'billing_assessment'`
   - Which billing layers apply (PIN/CHI/CCM/RPM)
   - CPT codes eligible
   - Minutes contributed toward monthly thresholds
   - Target: Billing agent (future) or manual review queue

3. **Opolis Payroll Instruction** → `outbox_event` with `event_type: 'payroll_instruction'`
   - Worker entity ID (S-Corp EIN)
   - Hours worked, hourly rate, gross pay
   - GPS verification flag
   - Target: Opolis Funding Account (future API integration)

**Implementation: Application-level with PostgreSQL transaction**

```typescript
async function completeInteraction(id: string, checkOutData: CheckOutData) {
  return await pool.transaction(async (client) => {
    // Update the interaction
    const { rows: [interaction] } = await client.query(
      `UPDATE care_interaction SET ended_at = $1, notes = $2
       WHERE id = $3 RETURNING *`,
      [new Date(), checkOutData.notes, id]
    );

    // Triple output — all in the same transaction for atomicity
    await Promise.all([
      client.query(
        `INSERT INTO outbox_event (event_type, resource_type, resource_id, payload)
         VALUES ('fhir_observation', 'Observation', $1, $2)`,
        [id, JSON.stringify(buildFhirPayload(interaction))]
      ),
      client.query(
        `INSERT INTO outbox_event (event_type, resource_type, resource_id, payload)
         VALUES ('billing_assessment', 'CareInteraction', $1, $2)`,
        [id, JSON.stringify(buildBillingPayload(interaction))]
      ),
      client.query(
        `INSERT INTO outbox_event (event_type, resource_type, resource_id, payload)
         VALUES ('payroll_instruction', 'PayrollInstruction', $1, $2)`,
        [id, JSON.stringify(buildPayrollPayload(interaction))]
      ),
    ]);

    return interaction;
  });
}
```

PostgreSQL transactions give us atomicity — either all 4 writes succeed or none do. Simpler and more reliable than database-level triggers.

**See `opolis.types.ts` → `CaptureTripleOutput` interface for the full data contract.**

### TIER 3: New Relation Tables (Deferred — Add Incrementally)

Four new relation tables to add to `schema.sql` when features need them:

```sql
-- Geographic proximity (for agent matching)
CREATE TABLE lives_near (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user       UUID NOT NULL REFERENCES "user"(id),
  to_user         UUID NOT NULL REFERENCES "user"(id),
  distance_miles  REAL NOT NULL,
  calculated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_user, to_user)
);

-- Hospital discharge → home care transition
CREATE TABLE discharged_to (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID NOT NULL REFERENCES care_recipient(id),
  family_id         UUID NOT NULL REFERENCES family(id),
  discharge_date    TIMESTAMPTZ NOT NULL,
  admit_diagnoses   TEXT[] NOT NULL DEFAULT '{}',
  follow_up_required BOOLEAN NOT NULL DEFAULT true,
  source_system     TEXT NOT NULL DEFAULT 'manual',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wearable monitoring relationship
CREATE TABLE monitors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES "user"(id),
  care_recipient_id UUID NOT NULL REFERENCES care_recipient(id),
  device_id        TEXT NOT NULL,
  start_date       TIMESTAMPTZ NOT NULL,
  rpm_data_days    INTEGER NOT NULL DEFAULT 0,
  last_reading_at  TIMESTAMPTZ
);

-- Billing trail
CREATE TABLE billed_for (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_interaction_id   UUID NOT NULL REFERENCES care_interaction(id),
  care_recipient_id     UUID NOT NULL REFERENCES care_recipient(id),
  billing_layers        TEXT[] NOT NULL DEFAULT '{}',
  cpt_codes             TEXT[] NOT NULL DEFAULT '{}',
  claim_status          TEXT NOT NULL DEFAULT 'pending',
  revenue_estimate_cents INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Add incrementally:** `discharged_to` when BCH integration starts, `monitors` when Galaxy Watch pipeline is ready, `billed_for` when billing engine is built.

### TIER 4: Outbox Processor (PostgreSQL → Aidbox Sync)

The `outbox_event` table already exists. Nothing reads from it yet. Build a processor:

```typescript
// src/server/services/outbox-processor.ts
async function processOutboxEvents() {
  const { rows: pending } = await pool.query(
    `SELECT * FROM outbox_event WHERE status = 'pending' ORDER BY created_at LIMIT 50`
  );

  for (const event of pending) {
    try {
      switch (event.event_type) {
        case 'fhir_observation':
          await aidbox.createObservation(event.payload);
          break;
        case 'billing_assessment':
          // Queue for billing review (manual initially)
          break;
        case 'payroll_instruction':
          // Queue for Opolis API (manual initially)
          break;
      }
      await pool.query(
        `UPDATE outbox_event SET status = 'processed', processed_at = now() WHERE id = $1`,
        [event.id]
      );
    } catch (error) {
      await pool.query(
        `UPDATE outbox_event SET retry_count = retry_count + 1, last_error = $1 WHERE id = $2`,
        [error.message, event.id]
      );
    }
  }
}

// Run every 30 seconds via setInterval or cron
```

### TIER 5: Real-Time Subscriptions (Agent Infrastructure — Future)

When we're ready for AI agents, each agent needs real-time event notifications. With PostgreSQL, we have two options:

**Option A: PostgreSQL LISTEN/NOTIFY**
```sql
-- Create a trigger that notifies on assessment creation
CREATE OR REPLACE FUNCTION notify_assessment_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('assessment_created', json_build_object(
    'id', NEW.id, 'type', NEW.type, 'total_score', NEW.total_score, 'zone', NEW.zone
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assessment_notify AFTER INSERT ON assessment
  FOR EACH ROW EXECUTE FUNCTION notify_assessment_created();
```

**Option B: Redis pub-sub (recommended for multi-service)**
```typescript
// After creating an assessment, publish to Redis
await redis.publish('assessment:created', JSON.stringify({ id, type, totalScore, zone }));

// Agent subscribes
redis.subscribe('assessment:created', (message) => {
  const data = JSON.parse(message);
  if (data.type === 'cii' && data.totalScore > 40) {
    triageAgent.handleCIIAlert(data);
  }
});
```

**Not needed now** — but the data model supports it. When agents are ready, either approach plugs in without schema changes.

---

## Files Jacob Should Read (Priority Order)

1. **`docs/JACOB-90-DAY-PLAN.md`** — week-by-week sprint plan with PostgreSQL examples
2. **This document** (you're reading it)
3. **`docs/JACOB-BACKEND-HANDOFF.md`** (v1 — the 7 endpoint specs, still valid)
4. **`src/server/database/schema.sql`** — PostgreSQL schema (15 tables, 4 relation tables)
5. **`src/shared/types/opolis.types.ts`** — CaptureTripleOutput is the #1 new build
6. **`src/shared/constants/business-rules.ts`** — all business constants (CII zones, pricing, partnerships, revenue phases)

## Files Jacob Can Ignore (For Now)

- `src/server/database/schema.sql` — retained for reference, not the build target
- `src/shared/types/postgres-agentic.types.ts` — concepts apply but specific PostgreSQL features don't
- `web3.types.ts` — Year 2 smart contracts
- `nlp-pipeline.types.ts` — Future NLP pipeline
- `bch-integration.types.ts` — Needs BCH IT coordination first
- `network-intelligence.types.ts` — Happenstance integration (growth tooling, not backend)
- `billing-codes.ts` — Reference only (billing agent will use this, not manual endpoints)
- Everything in `src/server/modules/wearable-mcp/` — MCP server for AI agents, not REST API

---

## PostgreSQL Quick Reference

**15 tables:** user, family, care_recipient, timebank_account, timebank_transaction, timebank_task, assessment, kbs_rating, care_interaction, notification, message, respite_fund, worker_equity, outbox_event

**4 relation tables:** helped (user→user), member_of (user→family), assigned_to (user→family), referred (user→user)

**Key query patterns:**

```sql
-- Find by ID
SELECT * FROM "user" WHERE id = $1;

-- Geospatial distance (PostGIS — returns meters)
SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS dist
FROM "user"
WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3);

-- Relation traversal (replaces relation tables)
SELECT u.* FROM helped h
JOIN "user" u ON h.to_user = u.id
WHERE h.from_user = $1;

-- Aggregation
SELECT COALESCE(SUM(hours), 0) AS total
FROM timebank_transaction WHERE type = $1;

-- Array contains (role checking)
SELECT * FROM "user" WHERE $1 = ANY(roles);

-- JSONB query
SELECT * FROM notification WHERE data->>'alertType' = 'high_risk';
```

---

## Questions for Jacob (Updated)

1. **Original v1 questions** (from `JACOB-BACKEND-HANDOFF.md`) — still open
2. **ORM preference:** Drizzle ORM, Kysely, Prisma, or raw `pg`?
3. **CaptureTripleOutput:** The application-level approach with PostgreSQL transactions is recommended. Any concerns?
4. **Outbox processor:** Simple `setInterval` loop or proper job queue (BullMQ/Redis)?
5. **New relation tables:** Add all 4 now (for schema completeness) or add incrementally as features need them?
6. **PostgreSQL hosting:** Railway managed, Neon, or Supabase for Phase 1?

---

## What's Coming Next (So Jacob Can Plan)

| What | When | Jacob Impact |
|------|------|-------------|
| Sage AI wired to MCP wearable server | Next sprint | Needs wearable data queries from PostgreSQL |
| PostgreSQL LISTEN/NOTIFY or Redis pub-sub for agents | Next sprint | Event-driven architecture layer |
| LangGraph scheduling orchestrator | Sprint 3 | Needs shift offer/response tracking endpoints |
| BCH ADT webhook endpoint | When BCH IT is ready | Needs HL7 v2 parser → outbox_event creator |
| Opolis API integration | After LCA bylaws finalized | Needs payroll instruction endpoints |
