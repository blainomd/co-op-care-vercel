#!/bin/bash
# deploy-commands.sh
# Run from project root: bash deploy-commands.sh
# Creates all SolvingHealth slash commands in .claude/commands/

mkdir -p .claude/commands

# ============================================================
# /sparc — SPARC phase enforcement
# ============================================================
cat > .claude/commands/sparc.md << 'EOF'
---
description: SPARC phase-gated workflow. Blocks code generation until Spec → Pseudocode → Architecture → Refinement are complete. Auto-invoked for 3+ file changes, new features, billing logic, PHI model changes.
allowed-tools: Task, TodoWrite, Bash(npx claude-flow*)
---

Execute SPARC workflow for: $ARGUMENTS

Spawn ALL agents in ONE message (parallel initialization):

```
Task("Specification", "Produce: problem statement (3 sentences), numbered acceptance criteria (testable), explicit out-of-scope, PHI touchpoints, authorization_level required. Write to memory 'sparc' key 'spec'. Signal: SPEC COMPLETE", "specification")

Task("Architecture", "BLOCKED until SPEC COMPLETE in memory 'sparc/spec'. Then: system boundaries, data flow, PHI movement, decision_ledger entry type, file structure, interface contracts. No implementation code. Write to 'sparc/arch'. Signal: ARCH COMPLETE", "system-architect")

Task("Pseudocode", "BLOCKED until ARCH COMPLETE in memory 'sparc/arch'. English only — no TypeScript. Step-by-step logic, error paths, PHI boundary crossings annotated, authorization checks annotated. Write to 'sparc/pseudo'. Signal: PSEUDO COMPLETE", "researcher")

Task("Refinement", "BLOCKED until PSEUDO COMPLETE in memory 'sparc/pseudo'. Review for: edge cases, PHI leakage, authorization gaps, RLS implications, decision_ledger write before human contact. Write diff to 'sparc/refinement'. Signal: REFINEMENT COMPLETE", "security-auditor")

Task("Completion", "BLOCKED until REFINEMENT COMPLETE in memory 'sparc/refinement'. Write code. Tests (London School TDD). Update DecisionType enums if new type. Confirm governance-constitution.ts import. Run: npx tsc --noEmit", "coder")
```

TodoWrite all phases simultaneously.

PHI gate: if task touches member_id, diagnosis, billing, NPI, CCM/TCM/RPM/ACP → containsPhi = true → authorization_level escalates automatically.

Skip /sparc for: single file <20 lines, docs, config, test-only additions.
EOF

# ============================================================
# /ledger — decision ledger status check
# ============================================================
cat > .claude/commands/ledger.md << 'EOF'
---
description: Check decision ledger status for a member or claim. Shows authorization chain, attestation state, WORM anchor, and any pending items.
allowed-tools: Bash(npx supabase*), Read
---

Check decision ledger: $ARGUMENTS

Query options:
- `/ledger member:[uuid]` — all ledger entries for this member
- `/ledger claim:[uuid]` — ledger entry for this specific claim
- `/ledger pending` — all entries with outcome = 'pending'
- `/ledger today` — today's entries with WORM anchor status

For each result show:
1. decision_type and authorization_level
2. Whether conductor_authorized_at is set (if conductor_required)
3. Whether attestation_id is set and attesting_npi = '1649218389' (if josh_required)
4. Whether submitted_to_cms_at is set (final state)
5. WORM anchor: is today's chain anchored to R2?

Flag any entry where authorization_level = 'josh_required' but attestation_id is NULL and created_at is >24 hours ago — these are stale and need follow-up with Josh.

Flag any billing_claim_queue entry where status = 'ready_for_submission' but submitted_to_cms_at is NULL and attestation_id is set — these are ready for Job 4 to pick up.
EOF

# ============================================================
# /claim — full claim workflow
# ============================================================
cat > .claude/commands/claim.md << 'EOF'
---
description: Manage a billing claim through the full governance pipeline: lock → review → attest → submit. Uses ClinicalSwipe claim_lock, claim_release, claim_status tools.
allowed-tools: mcp__clinicalswipe__claim_lock, mcp__clinicalswipe__claim_release, mcp__clinicalswipe__claim_status, Bash(npx supabase*)
---

Claim workflow: $ARGUMENTS

Usage:
- `/claim status [claim_id]` — current pipeline state
- `/claim status [member_id]` — all pending claims for member
- `/claim lock [claim_id]` — lock for review (prevents concurrent attestation conflicts)
- `/claim release [claim_id] attested [attestation_id]` — release after attestation
- `/claim release [claim_id] rejected [reason]` — release with rejection
- `/claim drain` — show all claims ready_for_submission (Job 4 candidates)

Always call claim_status before lock. If already locked and not expired, do not override — show who holds the lock and when it expires.

For `/claim drain`: list claims where status = 'ready_for_submission' AND decision_ledger_id IS NOT NULL AND attestation_id IS NOT NULL. These are safe for Stedi submission.

NEVER submit to Stedi directly from this command. Job 4 handles submission on the next cron cycle (within 15 minutes).
EOF

# ============================================================
# /governance — governance constitution test
# ============================================================
cat > .claude/commands/governance.md << 'EOF'
---
description: Run a governance constitution check on agent output or a proposed action. Validates against the authorization matrix before any output reaches a human.
allowed-tools: Read
---

Governance check: $ARGUMENTS

Read packages/careos/src/agents/governance-constitution.ts.

Evaluate the proposed action or output against:

1. AUTHORIZATION LEVEL — which tier applies?
   - autonomous: surfacing info, drafting (not sending), flagging thresholds
   - conductor_required: sending comms, logging billing activity, scheduling
   - josh_required: any billable judgment, LMN finalization, CMS output
   - prohibited: CMS without attestation_id, claims without Josh NPI, RLS changes

2. PHI BOUNDARY — does this output contain or reference PHI?
   - If yes: is it written to decision_ledger before surfacing?
   - Is containsPhi = true on the ledger entry?

3. PROHIBITED PATTERN CHECK:
   - Does output imply or state a diagnosis?
   - Does output surface a problem without a next action?
   - Does output auto-send rather than draft-for-review?
   - Does output attempt to bypass attestation?

4. CONDUCTOR IDENTITY — is the framing appropriate?
   - One clear next action (not five options)?
   - No clinical jargon?
   - Supportive, not clinical/evaluative?

Return: PASS / WARN / FAIL with specific findings.
FAIL = do not proceed. Revise output before surfacing to any human.
EOF

# ============================================================
# /pcm — PCM eligibility scan
# ============================================================
cat > .claude/commands/pcm.md << 'EOF'
---
description: Scan for Principal Care Management (99424/99426) eligible members. Identifies single-condition orthopedic and chronic disease patients not yet enrolled in CCM or PCM. SurgeonValue bridge pathway.
allowed-tools: Bash(npx supabase*), Read
---

PCM eligibility scan: $ARGUMENTS

Query members with:
- Single primary ICD-10 diagnosis (not 2+ required for CCM)
- Condition present ≥3 months
- Not enrolled in CCM
- Not enrolled in PCM
- ICD-10 prefix matches PCM-eligible list:
  M16/M17 (hip/knee OA), M47/M48 (spinal stenosis), M75 (rotator cuff),
  M54 (chronic back), I50 (heart failure), E11 (T2DM), J44 (COPD),
  N18 (CKD), F32/F33 (depression), G30/G31 (Alzheimer's/dementia)

For each eligible member:
1. Primary diagnosis code and condition name
2. Months since onset
3. Is this a SurgeonValue crossover? (M-codes = yes)
4. Estimated monthly revenue: $135/member blended (99424 + 99426)
5. Write alert to decision_ledger: decision_type = 'clinical_referral', authorization_level = 'josh_required'

Summary output:
- Total eligible members
- SurgeonValue crossover count
- Monthly revenue opportunity
- Action: Josh to review and confirm enrollment for each

Do NOT enroll members directly. Josh must review each case. The alert in decision_ledger is the handoff.
EOF

echo "✓ All commands deployed:"
echo "  /sparc    — SPARC phase enforcement"
echo "  /ledger   — Decision ledger status"
echo "  /claim    — Claim pipeline workflow"
echo "  /governance — Governance constitution check"
echo "  /pcm      — PCM eligibility scan"
