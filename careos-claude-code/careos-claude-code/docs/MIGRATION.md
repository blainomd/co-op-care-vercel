# CareOS — Database Change Governance Protocol

> **Who this is for:** The repo manager / product owner.
> **What it does:** Defines the safe, approved workflow for ALL database schema changes.
> **Rule #1:** No database change — in dev or prod — is pushed without human sign-off at every checkpoint below.

---

## Why This Document Exists

Databases hold patient data, financial ledgers, and care records. A single accidental `DROP COLUMN` or unreviewed schema change can:

- Permanently delete clinical or financial data
- Break running application code silently
- Violate HIPAA audit trail requirements
- Require expensive, stressful rollbacks under pressure

This document is the single source of truth for how every database change must be proposed, reviewed, tested, and deployed.

---

## The Golden Rules (Non-Negotiable)

| # | Rule |
|---|------|
| 1 | **Never run raw SQL in production without a written, reviewed migration file** |
| 2 | **Never use `DROP COLUMN`, `DROP TABLE`, or `DELETE FROM` in production without a 48-hour review window** |
| 3 | **Every schema change must be tested in dev first and pass all unit tests** |
| 4 | **Every destructive change requires explicit written approval from the repo owner** |
| 5 | **Always take a backup before applying any migration to production** |
| 6 | **Migrations are forward-only files — never edit a migration that has already been applied** |

---

## Types of Database Changes

### 🟢 Safe — Low Risk
These changes are safe to propose and apply after standard review:
- Adding a **new table**
- Adding a **new nullable column** to an existing table
- Adding a **new index**
- Changing a **default value** on a column

### 🟡 Caution — Medium Risk — Requires Testing
These must be tested in dev and reviewed before prod:
- Adding a **NOT NULL column** (requires a default or backfill)
- **Renaming a column** (breaks any code that references the old name)
- **Removing an index** (may degrade query performance)
- Changing a **column type** (e.g. `text` → `integer`)

### 🔴 Destructive — High Risk — Requires 48-Hour Approval
These changes permanently destroy data. **They must never be applied without:**
1. Full database backup confirmed
2. Explicit written approval from the repo owner
3. A tested rollback plan

- `DROP COLUMN`
- `DROP TABLE`
- `DELETE FROM` on production data
- `TRUNCATE`
- Removing a foreign key constraint

---

## The Safe Change Workflow

Every database change follows these steps in order. **Do not skip steps.**

```
Step 1: PROPOSE   → Write a migration file
Step 2: REVIEW    → Get approval (see checklist below)
Step 3: TEST      → Apply in dev, run tests
Step 4: BACKUP    → Take prod backup
Step 5: DEPLOY    → Apply in prod
Step 6: VERIFY    → Confirm app is healthy
Step 7: DOCUMENT  → Update this file if needed
```

### Step 1 — Write the Migration File

All schema changes must be written as a numbered migration file:

```
src/server/database/migrations/
  0001_initial_schema.sql    ← already applied
  0002_add_column_xyz.sql    ← new change goes here
  0003_rename_column_abc.sql ← next change
```

**File naming:** `NNNN_short_description.sql` where `NNNN` is the next sequential number.

**File format — every migration file must have:**

```sql
-- Migration: 0002_add_column_xyz
-- Author: [your name]
-- Date: YYYY-MM-DD
-- Description: [plain English — what does this change and why]
-- Risk level: 🟢 Safe / 🟡 Caution / 🔴 Destructive
-- Rollback: [the exact SQL to undo this change]

-- ── UP (apply) ────────────────────────────────────────
ALTER TABLE users ADD COLUMN preferred_language TEXT DEFAULT 'en';

-- ── DOWN (rollback) ───────────────────────────────────
-- ALTER TABLE users DROP COLUMN preferred_language;
```

> **Ask Claude:** "Write me a migration file to [describe the change]."
> Claude will draft the file including the rollback SQL. You then review it before anything is applied.

---

### Step 2 — Review Checklist

Before any migration is applied anywhere, answer these questions:

```
[ ] Does this change add, modify, or remove columns/tables?
[ ] If REMOVING: Is there a backup? Is 48-hour rule satisfied?
[ ] Does the application code already handle this change?
    (e.g. if you add a required column, is the app sending that value?)
[ ] Has the rollback SQL been written in the migration file?
[ ] Has a dev environment been stood up to test this?
[ ] For prod: has the backup been taken and confirmed?
```

**Sign-off required for 🔴 Destructive changes:**
> "I, [name], approve migration `NNNN_description.sql` for production on [date]. Backup confirmed at [backup ID/location]."

---

### Step 3 — Test in Dev

```bash
# Start local PostgreSQL
docker compose up -d careos-db

# Apply the migration to dev
psql postgresql://careos:careos_dev@localhost:5432/careos \
  -f src/server/database/migrations/NNNN_your_migration.sql

# Run all unit tests — they must all pass
npm test

# Start the server and manually test the affected feature
npm run dev:server
```

**If any test fails: STOP. Do not proceed to prod. Fix the issue first.**

---

### Step 4 — Back Up Production Database

**Before every production migration — no exceptions:**

```bash
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backups/backup-$(date +%Y%m%d-%H%M).sql

# Confirm the backup file is non-zero
ls -lh backups/backup-*.sql
```

Store backups in a secure location. Keep at least the last 3 backups.

---

### Step 5 — Apply to Production

```bash
# Apply the migration
psql $DATABASE_URL -f src/server/database/migrations/NNNN_your_migration.sql

# If using Railway, run via their CLI:
railway run psql $DATABASE_URL -f src/server/database/migrations/NNNN_your_migration.sql
```

---

### Step 6 — Verify Application Health

Immediately after applying a production migration:

```bash
# Check the health endpoint
curl https://your-app.railway.app/health

# Check logs for errors
railway logs --tail 100
```

If the health endpoint returns an error or logs show database errors, **immediately run the rollback** (the DOWN section of the migration file).

---

### Step 7 — Rollback (If Needed)

The rollback SQL is in every migration file's `-- DOWN` section:

```bash
# Example rollback for migration 0002
psql $DATABASE_URL << 'SQL'
  ALTER TABLE users DROP COLUMN preferred_language;
SQL
```

---

## How to Ask Claude for Database Changes

When you want to change the database, describe what you need **in plain English**. Claude will:
1. Determine the risk level
2. Draft the migration file with rollback SQL
3. Walk you through this checklist
4. Refuse to apply 🔴 destructive changes without explicit approval

**Example requests:**

> "I want to add a `preferred_language` column to the users table."
> → Claude drafts `0002_add_preferred_language.sql` (🟢 Safe)

> "I want to rename the `phone` column to `phone_number` in users."
> → Claude drafts the migration, flags 🟡 Caution (needs code update too), and shows you which files to update

> "I want to delete all rows in the timebank_transactions table that are older than 2 years."
> → Claude drafts the SQL, flags 🔴 Destructive, requires backup confirmation and written approval before proceeding

> "I want to remove the `avatar_url` column — nobody uses it."
> → Claude flags 🔴 Destructive (`DROP COLUMN`), asks: "Confirmed backup taken? Confirmed 48-hour review window?" before writing anything

---

## Schema Change Log

Track every migration that has been applied here.

| # | File | Applied (Dev) | Applied (Prod) | Applied By | Notes |
|---|------|:---:|:---:|---|---|
| 0001 | `initial_schema.sql` | ✅ | ✅ | system | Initial PostgreSQL schema |
| 0002 | `phase2_new_tables` | ✅ | ⏳ | Claude + Srushthi | 30+ new Phase 2 tables added via IF NOT EXISTS to postgres.schema.sql — Railway redeploy pending |

> Update this table every time a migration is applied to production.

---

## Current Schema Quick Reference

All tables live in `src/server/database/postgres.schema.sql`.

> **Note:** `postgres.schema.sql` uses `IF NOT EXISTS` throughout all `CREATE TABLE` statements, making direct additions safe for new tables. The no-modify rule applies to existing table structure (columns, constraints, indexes on existing tables) — adding entirely new tables via `IF NOT EXISTS` is safe.

### Phase 1 Tables

| Table | Primary Key | Key Relations |
|-------|-------------|---------------|
| `users` | `id UUID` | — |
| `families` | `id UUID` | `conductor_id → users` |
| `care_recipients` | `id UUID` | `family_id → families` |
| `family_memberships` | `id UUID` | `user_id → users`, `family_id → families` |
| `care_team_assignments` | `id UUID` | `user_id → users`, `family_id → families` |
| `timebank_accounts` | `id UUID` | `user_id → users` (UNIQUE) |
| `timebank_tasks` | `id UUID` | `requester_id → users` |
| `timebank_transactions` | `id UUID` | `account_id → timebank_accounts` |
| `help_edges` | `id UUID` | `helper_id → users`, `helped_id → users` |
| `assessments` | `id UUID` | `family_id → families`, `assessor_id → users` |
| `kbs_ratings` | `id UUID` | `care_recipient_id → care_recipients` |
| `notifications` | `id UUID` | `user_id → users` |
| `messages` | `id UUID` | `sender_id → users`, `recipient_id → users` |
| `outbox_events` | `id UUID` | — |
| `respite_fund` | `id UUID` | Singleton — max 1 row |
| `worker_equity` | `id UUID` | `worker_id → users` (UNIQUE) |
| `shifts` | `id UUID` | `worker_id → users` |
| `care_logs` | `id UUID` | `shift_id → shifts` |
| `shift_swaps` | `id UUID` | `requester_id → users`, `shift_id → shifts` |
| `lmns` | `id UUID` | `care_recipient_id → care_recipients` |

### Phase 2 Tables (added 2026-03-20)

| Table | Module |
|-------|--------|
| `acp_directives` | acp |
| `acp_goals` | acp |
| `acp_preferences` | acp |
| `acp_conversations` | acp |
| `acp_checklists` | acp |
| `social_posts` | social |
| `social_comments` | social |
| `care_circles` | social |
| `milestone_events` | social |
| `waitlist_entries` | waitlist |
| `wellness_products` | wellness |
| `wellness_bundles` | wellness |
| `wellness_recommendations` | wellness |
| `wellness_reviews` | wellness |
| `peer_communities` | peer-support |
| `peer_posts` | peer-support |
| `peer_comments` | peer-support |
| `community_memberships` | community |
| `referral_codes` | referral-rewards |
| `referral_events` | referral-rewards |
| `clinical_referrals` | referrals |
| `reimbursement_claims` | reimbursement |
| `community_profiles` | community |
| `capabilities` | matching |
| `community_reviews` | community |
| `match_requests` | matching |
| `match_history` | matching |
| `caregiver_availability` | matching |
| `meal_plans` | nutrition |
| `meal_orders` | nutrition |
| `nutrition_assessments` | nutrition |
| `neighbor_kitchens` | nutrition |
| `care_journey` | sage |
| `lmn_review_queue` | lmn |
| `user_profiles` | settings |
| `conversation_sessions` | memory |
| `conversation_memory` | memory |

---

## Migrations Folder Structure

```
src/server/database/
  postgres.schema.sql          ← Full baseline schema (applied once at DB creation)
  postgres.ts                  ← PostgreSQL connection pool
  migrations/
    0001_initial_schema.sql    ← Baseline (matches postgres.schema.sql Phase 1 tables)
    0002_phase2_new_tables.sql ← 30+ Phase 2 tables (IF NOT EXISTS — safe to apply)
    0003_...sql                ← Future changes go here
```

> **Never modify existing table definitions in `postgres.schema.sql` after the database is created.**
> New tables may be added using `IF NOT EXISTS` — this is safe and does not require a migration file for dev.
> All changes to existing table structure (columns, constraints, indexes) go through numbered migration files.
