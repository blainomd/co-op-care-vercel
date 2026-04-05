---
description: SPARC phase-gated workflow. Blocks code generation until Spec > Pseudocode > Architecture > Refinement are complete. Auto-invoked for 3+ file changes, new features, billing logic, PHI model changes.
allowed-tools: Agent, TodoWrite, Bash(npx tsc --noEmit)
---

Execute SPARC workflow for: $ARGUMENTS

Phase Protocol — spawn ALL agents in ONE message for parallel initialization:

1. **Specification** — Problem statement (3 sentences), numbered acceptance criteria (testable), explicit out-of-scope, PHI touchpoints, authorization_level required. Signal: SPEC COMPLETE

2. **Architecture** — BLOCKED until SPEC COMPLETE. System boundaries, data flow, PHI movement, decision_ledger entry type, file structure, interface contracts. No implementation code. Signal: ARCH COMPLETE

3. **Pseudocode** — BLOCKED until ARCH COMPLETE. English only — no TypeScript. Step-by-step logic, error paths, PHI boundary crossings annotated, authorization checks annotated. Signal: PSEUDO COMPLETE

4. **Refinement** — BLOCKED until PSEUDO COMPLETE. Review for: edge cases, PHI leakage, authorization gaps, RLS implications, decision_ledger write before human contact. Signal: REFINEMENT COMPLETE

5. **Completion** — BLOCKED until REFINEMENT COMPLETE. Write code. Tests (London School TDD). Update DecisionType enums if new type. Confirm governance-constitution.ts import. Run: npx tsc --noEmit

PHI gate: if task touches member_id, diagnosis, billing, NPI, CCM/TCM/RPM/ACP → containsPhi = true → authorization_level escalates automatically.

Skip /sparc for: single file <20 lines, docs, config, test-only additions.
