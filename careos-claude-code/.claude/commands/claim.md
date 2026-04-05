---
description: Manage a billing claim through the full governance pipeline. Uses ClinicalSwipe claim_lock, claim_release, claim_status tools.
allowed-tools: Bash, Read, Grep
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

OIG requirement: every attestation must include review_metrics (review_duration_seconds >= 30, viewport_active_seconds >= 20, scroll_depth_pct >= 80). The claim_release tool enforces this.
