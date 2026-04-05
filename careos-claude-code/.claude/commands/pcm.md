---
description: Scan for Principal Care Management (99424/99426) eligible members. Identifies single-condition orthopedic and chronic disease patients not yet enrolled in CCM or PCM. SurgeonValue bridge pathway.
allowed-tools: Bash, Read, Grep
---

PCM eligibility scan: $ARGUMENTS

Query members with:
- Single primary ICD-10 diagnosis (not 2+ required for CCM)
- Condition present >= 3 months
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
