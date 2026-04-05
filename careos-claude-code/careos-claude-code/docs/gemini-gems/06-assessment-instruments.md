# co-op.care — Assessment Instruments Data Reference

---

## CARE INDEPENDENCE INDEX (CII) — 12 DIMENSIONS

The CII measures a member's current independence level. Each dimension is scored on a standardized scale. The assessment serves three purposes: clinical care planning, acuity-based resource allocation, and Alpha Daughter conversion (web self-assessment as funnel entry).

**The 12 Dimensions:**
1. Mobility — ability to move within and outside the home (transfers, ambulation, stairs, transportation)
2. Personal Hygiene — bathing, grooming, oral care, toileting
3. Nutrition — meal preparation, feeding, hydration, dietary management
4. Medication Management — self-administration, adherence, complexity of regimen
5. Cognitive Function — orientation, memory, judgment, decision-making capacity
6. Emotional Wellbeing — mood stability, anxiety, depression indicators, social engagement
7. Communication — ability to express needs, comprehend instructions, use phone/technology
8. Home Safety — fall risk, environmental hazards, emergency response capability
9. Financial Management — bill paying, budgeting, protection from exploitation
10. Social Connection — frequency of meaningful contact, isolation risk, community participation
11. Health Monitoring — ability to track symptoms, recognize changes, seek appropriate care
12. Sleep & Rest — sleep quality, pain management, restorative patterns

**Scoring:** Each dimension scored 1–5 where 1 = fully dependent, 5 = fully independent. Composite CII score is the sum (range 12–60). Thresholds determine care tier recommendations.

**Care Tier Mapping:**
- CII 48–60: Wellness/Prevention tier — community navigation, periodic check-ins, family caregiver training
- CII 36–47: Companion/Light Support tier — regular companion visits, light ADL assistance, active community referrals
- CII 24–35: Personal Care tier — daily ADL support, medication management, structured care plan
- CII 12–23: Skilled/Complex tier — skilled nursing visits, complex care coordination, Medical Director oversight, palliative pathway assessment

---

## CARE RISK INDEX (CRI) — 14 WEIGHTED FACTORS

The CRI predicts care escalation likelihood, hospitalization risk, and resource utilization intensity. Used for proactive care planning, PACE sub-capitation risk adjustment, and Medical Director clinical oversight prioritization.

**The 14 Factors (with relative weight indicators):**
1. Fall History (high weight) — number and severity of falls in past 12 months
2. Hospitalization History (high weight) — admissions in past 6 and 12 months
3. Polypharmacy (high weight) — number of medications, complexity, interaction risk
4. Cognitive Decline Trajectory (high weight) — rate of change in cognitive scores over time
5. Caregiver Burnout Risk (medium weight) — primary caregiver stress indicators, support network depth
6. Social Isolation Score (medium weight) — frequency of contact, community engagement, loneliness indicators
7. Chronic Condition Count (medium weight) — number of active chronic diagnoses
8. Nutritional Risk (medium weight) — weight changes, meal preparation ability, hydration status
9. Pain Severity (medium weight) — chronic pain level and management effectiveness
10. Depression/Anxiety Indicators (medium weight) — screening scores, behavioral observations
11. Home Environment Risk (low weight) — structural hazards, accessibility limitations
12. Financial Stress (low weight) — ability to afford care, medication cost burden
13. Transportation Access (low weight) — ability to reach appointments, community resources
14. Technology Literacy (low weight) — ability to use health monitoring tools, communication technology

**Scoring:** Weighted composite score normalized to 0–100 scale. Higher score = higher risk.

**Risk Tiers:**
- CRI 0–25: Low risk — standard care plan, quarterly Medical Director review
- CRI 26–50: Moderate risk — enhanced monitoring, monthly Medical Director review, proactive escalation planning
- CRI 51–75: High risk — intensive care coordination, bi-weekly Medical Director review, PACE enrollment prioritization
- CRI 76–100: Critical risk — daily oversight protocols, immediate skilled care deployment, hospitalization prevention protocols

---

## ASSESSMENT WORKFLOW IN CareOS

1. **Initial Assessment** — Full CII + CRI completed at member onboarding by trained cooperative caregiver, reviewed by Medical Director
2. **Web Self-Assessment** — Abbreviated CII (Alpha Daughter completes for parent) serves as conversion funnel entry point and pre-intake screening
3. **Reassessment Cadence** — CII quarterly minimum; CRI monthly for moderate+ risk; both triggered by any care event (fall, hospitalization, significant change)
4. **Omaha System Integration** — CII dimensions map to Omaha System problem domains; CRI factors map to surveillance intervention targets
5. **FHIR R4 Storage** — All assessment scores stored as FHIR Observation resources in Aidbox, enabling interoperability and longitudinal tracking
