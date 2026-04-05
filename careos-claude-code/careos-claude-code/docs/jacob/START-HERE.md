# co-op.care — Jacob's Handoff Package
**Updated:** March 10, 2026 — PostgreSQL replaces PostgreSQL

**Entity:** co-op.care Limited Cooperative Association (LCA) · Filed March 10, 2026

---

## Read These (In Order)

| # | File | What It Is | Time |
|---|------|-----------|------|
| 1 | **JACOB-90-DAY-PLAN.md** | ⭐ Your 90-day sprint plan — week-by-week, PostgreSQL queries, 40 numbered tasks | 15 min |
| 2 | **JACOB-BACKEND-HANDOFF.md** | 7 community/marketing endpoint specs (TypeScript interfaces, PostgreSQL queries) | 10 min |
| 3 | **JACOB-BACKEND-HANDOFF-v2.md** | Full architecture update — CaptureTripleOutput, type files, outbox processor | 10 min |
| 4 | **schema.sql** | PostgreSQL 16 + PostGIS schema (15 tables, 4 relation tables, triggers) | Skim |

## Reference Only (Don't Need to Read Now)

| File | What It Is |
|------|-----------|
| **co-op-care-90-day-approach-c.md** | Business operational plan (licensing, hiring, revenue) |
| **co-op-care-complete-operating-blueprint.md** | Full strategic blueprint (39 citations, PHI/BLS sourced) |
| **co-op-care-bylaws-and-subchapter-t.md** | LCA bylaws + Subchapter T board resolution (DRAFT — Jason Wiener review pending) |
| **co-op-care-clinical-middleware-one-pager.md** | Clinical middleware positioning for TRU PACE / wearable OEM partners |
| **Care-Navigator-Job-Posting.md** | Founding Care Navigator role ($25-28/hr + equity) |
| **HEALTH-SAMURAI-ACP-SPEC.md** | FHIR spec for Pavel (Aidbox integration) — not Jacob's scope |
| **research/** | Citation references (PHI/BLS 2024), Snapdragon Wear Elite elder care analysis |
| **_strategy-docs/** | Business/strategy docs (partnership prep, outreach, etc.) — not technical |

## Database: PostgreSQL (NOT PostgreSQL)

As of March 10, we're using **PostgreSQL 16 + PostGIS** for the operational database. The PostgreSQL schema in the codebase is retained for reference but is not the build target.

- **Schema:** `schema.sql` (this folder) or `careos-claude-code/src/server/database/schema.sql`
- **15 tables:** user, family, care_recipient, timebank_account, timebank_transaction, timebank_task, assessment, kbs_rating, care_interaction, notification, message, respite_fund, worker_equity, outbox_event
- **4 relation tables:** helped, member_of, assigned_to, referred
- **PostGIS** for geospatial (GPS check-in, proximity matching)
- **UUID primary keys** everywhere

## The Project

```
careos-claude-code/          ← The actual codebase (open this in your editor)
├── src/client/              ← React 19 + Vite + Tailwind v4 (265 modules, builds in 1.3s)
├── src/server/              ← Fastify 5.2 + 12 modules (98 routes, all compile)
│   └── database/schema.sql  ← PostgreSQL schema (source of truth)
├── src/shared/              ← Shared types, constants, business rules
├── CLAUDE.md                ← Build instructions, tech stack, brand system
├── .env.example             ← All env vars (copy to .env, fill in secrets)
└── docs/                    ← All handoff docs + strategy docs
```

## Quick Start

```bash
cd careos-claude-code
cp .env.example .env           # fill in JWT keys + secrets
# PostgreSQL: Railway managed, Neon, or local Docker
npm run dev                    # terminal 1: Vite frontend (port 5173)
npm run dev:server             # terminal 2: Fastify API (port 3001)
```

## The Sprint Summary

| Week | Focus | Key Deliverable |
|------|-------|----------------|
| 1-2 | PostgreSQL + Redis + Fastify + Auth | Login/register, JWT, role guards |
| 3-4 | Assessment engine | CII/CRI submit + MD review (revenue engine) |
| 5-6 | Family module + Stripe | Family CRUD, care recipients, $100/yr membership |
| 7-8 | Time Bank core | Ledger, tasks, check-in/out, Omaha auto-coding |
| 9-10 | 7 community endpoints + notifications | Frontend pages go live with real data |
| 11-12 | CaptureTripleOutput + GPS + matching | Outbox processor, PostGIS verification |

## The Key Insight

The frontend works 100% without the backend — every API call falls back to demo data. As you implement each endpoint, the frontend automatically picks up real data. No frontend changes needed.

**Month 1 priority: Auth + Assessment engine. Each assessment = $150-300 cash.**
