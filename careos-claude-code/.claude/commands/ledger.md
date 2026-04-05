---
description: Check decision ledger status for a member or claim. Shows authorization chain, attestation state, WORM anchor, and any pending items.
allowed-tools: Bash, Read, Grep
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
