---
description: Run a governance constitution check on agent output or a proposed action. Validates against the authorization matrix before any output reaches a human.
allowed-tools: Read, Grep
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
