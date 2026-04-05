# co-op.care — The Clinical Middleware for Ambient AI Wearables

**One-Pager for TRU PACE, Health System Partners, and Wearable OEMs**
**March 2026 · co-op.care Limited Cooperative Association · Boulder, CO**

---

## The Problem

Ambient AI wearables generate raw sensor data — heart rate variability, gait patterns, sleep architecture, fall events, blood oxygen trends. But raw data is clinically meaningless without three things:

1. **Clinical interpretation** — What does this reading mean for THIS person?
2. **Governed response** — Who acts on it, and within what authority?
3. **Continuity of care** — Who knows this person well enough to distinguish signal from noise?

Hardware companies build sensors. Health systems build EMRs. Nobody builds the governed interpretation layer between them. **That's co-op.care.**

---

## The 4-Layer Safety Architecture

| Layer | Function | Who | Technology |
|-------|----------|-----|-----------|
| **1. Raw Signal** | Device captures vitals, movement, location, cognitive markers | Wearable (Snapdragon, Galaxy Watch, Apple Watch) | On-device NPU, 50+ sensors |
| **2. Clinical Interpretation** | CareOS maps signals through Omaha System framework (42 problems, 4 domains) | CareOS AI engine | FHIR R4 observations, CII/CRI scoring, Omaha auto-coding |
| **3. Medical Review** | Flagged patterns reviewed by physician; care plans attested, LMNs signed | Medical Director (Josh Emdur, DO — all 50 state licenses) | Physician dashboard, regulatory attestation |
| **4. Human Action** | Cooperative caregiver acts — same person, same relationship, same trust | W-2 Care Navigator (worker-owner) | GPS-verified check-in, Time Bank coordination |

**The key insight:** The device captures. CareOS interprets. The physician reviews. The cooperative caregiver acts. Four layers, zero gaps, full accountability.

---

## Why Cooperative Ownership Is the Middleware

| Competitor Model | Failure Mode |
|-----------------|--------------|
| Agency + wearable vendor | 77% caregiver turnover — no continuity for signal interpretation |
| Health system + remote monitoring | Alert fatigue — no human who knows the patient to triage |
| Direct-to-consumer wearable | Data without action — raw alerts go to family members with no clinical training |
| PE-backed home care + tech bolt-on | Cost-cutting eliminates the caregiver relationship that makes data meaningful |

**co-op.care's structural advantage:** When caregivers earn $25-28/hr with W-2 benefits and own equity in the cooperative, they stay. Target turnover: <15%. The same caregiver sees the same elder week after week. They know that Mrs. Chen's resting heart rate runs high, that Mr. Kowalski's gait slows before a UTI, that Dorothy's sleep disruption correlates with medication timing. **Continuity is clinical intelligence that no algorithm can replace.**

---

## What co-op.care Provides to Partners

### To Wearable OEMs (Qualcomm, Samsung, Apple)
- Governed clinical interpretation of raw sensor data via Omaha System framework
- HIPAA-compliant processing (on-device NPU advantage preserved — PHI never leaves the wrist for basic classification)
- FHIR R4 interoperability — observations flow directly into health system EHRs
- Real-world clinical validation data for FDA/CMS regulatory pathways

### To Health Systems (TRU PACE, BCH, ACOs)
- RPM billing layer (CPT 99457/99458) — requires 16+ data transmission days/month
- CMS ACCESS/ELEVATE outcome reporting from continuous monitoring
- Reduced readmissions — $16,037 average readmission cost avoidable with early detection
- Floor-level fall detection with E911 vertical location (critical for multi-story senior housing)

### To PACE Programs (TRU PACE — 341 Enrollees)
- Cognitive monitoring that feeds CII/CRI risk scores — early decline detection before crisis
- Satellite connectivity (Skylo NB-NTN) for rural enrollees — no missed RPM transmission days
- Cooperative caregiver workforce that stays — PACE depends on relationship continuity even more than traditional home care
- Physician-attested care plans that satisfy PACE interdisciplinary team requirements

---

## The Revenue Stack (Per Wearable-Connected Member)

| Revenue Layer | Source | Monthly |
|--------------|--------|---------|
| RPM monitoring (99457/99458) | Medicare/payer | $50-120 |
| Companion care hours | Family private-pay / HSA | $550-2,750 |
| CII/CRI assessments | Direct / payer | $150-300 (periodic) |
| Wearable data licensing | OEM partnership | TBD |
| Outcome-based bonuses | CMS ACCESS/ELEVATE | Variable |

---

## Insurance & Liability

- **Beazley Virtual Care** (Lloyd's of London): Professional + tech + cyber liability in one modular policy
- **Armilla AI**: Performance warranty — reimburses if AI model fails clinical KPIs (up to $25M coverage, Lloyd's underwritten)
- **Automate Clinic Reality.check**: Physician-supervised AI red-teaming creates validated "gold standards"
- **Result:** Personal liability shifts to AI coverage layer within validated parameters

---

## Why Now

1. **Snapdragon Wear Elite** ships 2026 — on-device NPU, cognitive monitoring, satellite connectivity, multi-day battery. First wearable platform purpose-built for continuous elder care.
2. **CMS ACCESS Model** Cohort 2 (Jan 2027) — pays for health improvements, not just visits. Requires outcome data co-op.care generates natively.
3. **PE consolidation** has degraded care quality to the point where health systems and PACE programs are actively seeking cooperative alternatives.
4. **Colorado regulatory environment** — SB24-205 (75% cooperative conversion tax credit), OEDIT employee ownership support, CDPHE innovative care models.

---

## The Ask

co-op.care is seeking partnerships with wearable OEMs and health systems who need a governed clinical interpretation layer between ambient sensor data and human care action. We are not a hardware company. We are not a health system. We are the cooperative middleware that makes both work for the people who need it most.

**Contact:** Blaine Warkentine, MD · blaine@co-op.care · Boulder, CO
**Medical Director:** Josh Emdur, DO · All 50 state licenses · CMO, Automate Clinic
