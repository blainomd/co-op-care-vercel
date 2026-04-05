# CareOS Agent Index

> This file is the map. Read this first, then navigate to specific docs.
> Do NOT attempt to load the entire codebase into context.

## Architecture Boundaries

| Domain | Entry Point | Documentation |
|--------|------------|---------------|
| Supabase Schema | `careos-claude-code/src/db/` | RLS policies, decision_ledger, attestation tables |
| Agent System | `careos-claude-code/src/server/agents/` | governance-constitution.ts is the root. All agents import it. |
| API Routes | `careos-claude-code/src/server/` | Fastify routes, middleware, auth |
| Frontend | `careos-claude-code/src/` | React components, pages |
| Scheduler | `packages/careos-scheduler/` | 5 Railway cron jobs (TCM, CCM+PCM, RPM, billing drain, care gaps) |

## Critical Files (Do Not Modify Without Understanding)

```
careos-claude-code/src/server/agents/governance-constitution.ts
  — The constitutional document. Injected into every Claude API call.
  — Contains: authorization matrix, 3 principals, immutable record requirement.
  — If you modify this, you are modifying the compliance layer.

careos-claude-code/src/server/agents/careos-agent.ts
  — Single entry point for all Claude API calls.
  — Writes to decision_ledger BEFORE returning to any caller.
  — Ledger write failure = hard error. No response without a record.
```

## Test Suite

- **682 tests passing** as of Phase 1 completion (March 2026)
- Run: `npm run test:all`
- Tests MUST pass before any commit
- Critical test categories:
  - RLS policy enforcement (attestation immutability)
  - Decision ledger chain integrity
  - Billing code validation (2026 PFS rates)
  - PHI boundary (no PHI in logs or error messages)

## Key Constraints

1. Josh Emdur DO (NPI 1649218389) is the ONLY valid attesting NPI
2. decision_ledger is append-only. No UPDATE. No DELETE.
3. Every agent output → ledger → THEN human contact
4. RLS policies are inviolable — agents cannot alter them
5. Railway env vars are inviolable — agents cannot alter them
6. .env files are never read, committed, or logged

## Current State (April 4, 2026)

- Phase 1: COMPLETE (682 tests passing)
- Phase 2: BLOCKED (force-push incident, new changes paused)
- Governance constitution: DEPLOYED (in agents/ directory)
- Settings.json: DEPLOYED (with hooks)
- Slash commands: DEPLOYED (/sparc, /ledger, /claim, /governance, /pcm)

## When Unblocked

Priority order for Phase 2:
1. Verify 682 tests still pass on current branch
2. Deploy ClinicalSwipe billing engine (claim_lock/release/status)
3. Deploy VBC pre-visit intake tool
4. Deploy election addendum tools (Oct 1 deadline)
5. Deploy SSVI analytics module
6. Deploy conversational attention residual memory
7. Integrate WorkOS MCP Auth (session-scoped OAuth)

## Related Repositories

| Repo | Purpose | URL |
|------|---------|-----|
| solvinghealth | Platform hub, AI gateway, architecture | blainomd/solvinghealth |
| clinicalswipe | ClinicalSwipe MCP server (15 tools) | blainomd/clinicalswipe |
| co-op-care-vercel | co-op.care landing + 17 product pages | blainomd/co-op-care-vercel |
| comfortcard | ComfortCard.org + role-based views | blainomd/comfortcard |
| caregoals-com | CareGoals + Sage AI conversations | blainomd/caregoals-com |
| surgeonvalue-site | SurgeonValue landing page | blainomd/surgeonvalue-site |
