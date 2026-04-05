# CareOS Agentic Architecture Design

**Date:** 2026-03-19
**Author:** Blaine Warkentine + Claude
**Status:** Approved — building Phase 1

## Problem

CareOS is a toolbox where humans click every button. A family must:
talk to Sage → manually start CII → manually start CRI → wait for LMN → wait for Josh → wait for billing.

## Solution

Event-driven agent mesh. Family talks to Sage → everything else happens automatically.

## Architecture

### Event Bus

PostgreSQL `outbox_events` table + in-process EventEmitter. No new infrastructure.
Events are typed strings: `profile.updated`, `assessment.completed`, `lmn.draft_created`, etc.

### Agents

Each agent subscribes to events and emits new events:

| Agent | Listens To | Emits | Human Checkpoint |
|-------|-----------|-------|-----------------|
| Sage (Sensory) | user messages | profile.updated, intent.detected, omaha.problem.found | None |
| Profile Builder | profile.updated | profile.assessment_ready | None |
| Assessor | profile.assessment_ready | assessment.completed | None (conversational) |
| LMN Engine | assessment.completed | lmn.draft_created | None |
| Review Router | lmn.draft_created | lmn.review_assigned | Josh signs |
| Billing | lmn.signed | billing.invoice_created, billing.paid | None |
| Care Matcher | billing.subscription_created | match.proposed, match.confirmed | Family confirms |
| Outcome Tracker | visit.logged | outcome.trajectory_update | None |
| Synthesis | all events (nightly) | synthesis.insights | None |

### Care Journey State Machine

```
discovered → profiling → assessing → lmn_eligible → lmn_review → lmn_signed → active_lmn → care_matched → active_care → renewal
```

### Phase 1 (Ship Now)
1. Event bus + agent registry
2. Care journey state machine
3. Profile Builder agent
4. Assessor agent (conversational CII/CRI via Sage)
5. LMN Trigger agent
6. Review Router agent
7. Billing agent

### Phase 2 (Week 4+)
8. Care Matcher agent
9. Outcome Tracker agent
10. Synthesis agent (nightly learning)
11. Cortexanote hardware integration
