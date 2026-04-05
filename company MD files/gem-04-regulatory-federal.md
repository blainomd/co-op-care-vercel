# CO-OP.CARE — REGULATORY LANDSCAPE & FEDERAL PROGRAMS
## CMS Models, Billing Codes, Insurance Architecture, Compliance, and Funding Pipeline
### Last Updated: February 27, 2026 — Version 3.0

---

## CMS ACCESS MODEL (PRIMARY FEDERAL REVENUE)

### Overview
The Advancing Chronic Care with Effective, Scalable Solutions (ACCESS) Model is a 10-year voluntary alternative payment program from CMS. This is not one of several funding options — it IS the business model.

### Key Parameters
- **Application deadline:** April 1, 2026
- **First cohort:** July 5, 2026
- **Duration:** 10 years (through June 2036)
- **Payment:** Outcome-Aligned Payments (OAPs)
- **Threshold:** 50% Outcome Attainment Threshold (OAT)
- **Rolling applications** accepted through 2033

### Payment Tracks

| Track | Conditions | Annual OAP/Beneficiary | co-op.care Fit |
|---|---|---|---|
| eCKM | Hypertension, dyslipidemia, obesity, prediabetes | $360 | HIGH — CRI tracks all; lifestyle medicine via Time Bank |
| CKM | Diabetes, CKD (stages 3a/3b), ASCVD | $420 | HIGH — Complex chronic management is core service |
| MSK | Chronic musculoskeletal pain | $180 | HIGH — Joint Coach designed for post-surgical/MSK recovery |
| Behavioral Health | Depression, substance use disorders | Variable | MEDIUM — CII captures depression indicators |

**Revenue projection:** 500 beneficiaries × $360–420 = $180,000–$210,000/year (Year 1)
**National scale:** 67M Medicare beneficiaries × $360–420 = TAM dwarfs anything private sector offers

### The FFS Exclusion Rule — co-op.care's Structural Moat

**Critical strategic insight:** The ACCESS Model explicitly EXCLUDES Medicare Part B providers already billing Fee-For-Service. This is not accidental — CMS designed it for technology-enabled care organizations that don't have existing FFS billing practices.

**What this means:**
- Hospital systems (BCH, Kaiser, HCA) CANNOT participate in ACCESS through their existing Medicare billing structures
- Large physician groups already billing Part B face structural barriers
- co-op.care, as a NEW technology platform without FFS history, is architecturally positioned exactly where CMS wants innovation
- The rule creates a competitive moat against institutional healthcare competitors
- Only organizations that build technology-first, outcome-tracked care models fit the design intent

### Critical Prerequisites (Sequence Matters)
1. File the LLC → prerequisite for everything
2. Secure Clinical Director (Medicare-enrolled MD/DO) → mandatory bottleneck
3. Apply for Medicare Part B enrollment → requires LLC + Clinical Director
4. Submit ACCESS application → by April 1, 2026
5. Aidbox FHIR infrastructure must be operational for outcome reporting

### ACCESS Readiness Assessment

| Requirement | Status | Gap |
|---|---|---|
| Medicare Part B enrollment | NOT YET | Must enroll LLC or partner with enrolled provider |
| Physician Clinical Director | NEED TO DESIGNATE | Recruit MD/DO; could be DPC physician partner |
| FHIR-based API reporting | DESIGNED | Architecture ready via Aidbox; needs production |
| Technology-enabled care delivery | CORE PRODUCT | Platform purpose-built for this |
| Outcome tracking/reporting | DESIGNED (CRI/CII/Omaha) | Needs mapping to ACCESS-specific metrics |
| HRSN screening | BUILT INTO CRI | Factors 7, 13, 14 cover social needs |

---

## THE FOUR-STAGE FEDERAL INTEGRATION PATH

This is the long-game architecture from local cooperative to federally integrated healthcare delivery organization:

### Stage 1: ACCESS Model (Years 1–10)
10-year CMS alternative payment model. $360–420/beneficiary/year. Generates longitudinal outcome data. Proves cooperative care model superiority to CMS. Builds actuarial-grade risk profiles.

### Stage 2: LEAD ACO Model (Years 3–10+)
10-year ACO through 2036. Targets homebound/home-limited Medicare beneficiaries. Shared savings model. Requires ACCESS outcome data as foundation. Takes cooperative from care coordination into accountable care.

### Stage 3: CARA Program
Medicare chronic care management. Builds on LEAD ACO infrastructure. Expands eligible population and service scope.

### Stage 4: "Stay at Home" Insurance Product
Association captive insurance leveraging actuarial data from Stages 1–3.

**Activation threshold:** 200 members
**Revenue at 200 members:** $180K–$192K/year
**Architecture:**
- PACE Delegated Home Risk at $3,500 PMPM
- Association Captive capitalization at $500K for Comfort Care Protection Plan
- MGA (Managing General Agent) structure — offer insurance without becoming licensed insurer
- Reinsurance partnerships for risk transfer
**National scale:** 500 communities × self-insured school district network = $109M–$115M

### Self-Insured School District Market
- TAM: 2,000–2,500 self-insured school districts nationally
- Each district = embedded employer benefit channel
- Teacher families are disproportionately caregivers
- BVSD is proof of concept; every district in America is potential customer
- "Stay at Home" insurance activates at 200-member community threshold

---

## AMBULATORY SPECIALTY MODEL (ASM)

### Overview
Finalized October 31, 2025. **Mandatory** participation for ~8,600 physicians nationally beginning January 1, 2027. Targets heart failure and low back pain episodes.

### Boulder Impact
- 38 providers across 27 organizations in Boulder CBSA
- Most haven't heard of ASM yet — massive awareness/partnership opportunity

### Penalty Structure
| Year | Revenue at Risk |
|---|---|
| Year 1 (2027) | ±9% of total Part B revenue |
| Year 2 (2028) | ±9% |
| Year 3 (2029) | ±10% |
| Year 5 (2031) | ±12% |

### co-op.care's Joint Coach Solution
Pre-optimized patients protect specialist margins. Joint Coach documents 6 weeks of conservative management:
- HRSN screening
- CII/CRI clinical assessments
- Patient-reported outcomes
- PIN/CHI billing codes pay for the service
- Practices pay nothing upfront — CMS pays through billing codes

---

## PIN/CHI BILLING CODES

### Principal Illness Navigation (PIN)
- G0023: Initial 60 minutes/calendar month
- G0024: Each additional 30 minutes/calendar month

### Community Health Integration (CHI)
- G0019: Initial 60 minutes/calendar month
- G0022: Each additional 30 minutes/calendar month

### Revenue
- $85–120/patient/month
- Expanded in 2026 CMS Physician Fee Schedule
- Auxiliary personnel eligible: patient navigators, peer specialists, CHWs

### Compliance
- Strict incident-to billing supervision
- Meticulous EHR documentation mandatory
- CareOS → Omaha System → FHIR R4 pipeline is structurally critical
- Every code attested by Clinical Director before submission

---

## HOSPITAL READMISSION REDUCTION PROGRAM (HRRP)

- Penalties up to 3% of total Medicare revenue for excessive 30-day readmissions
- co-op.care's 24-hour discharge planning reduces #1 cause: lack of safe home transition
- CareOS documents post-discharge monitoring in FHIR R4
- PIN/CHI billing monetizes care coordination hospitals already perform

---

## MAHA ELEVATE MODEL

Make America Healthy Again: Enhancing Lifestyle and Evaluating Value-based Approaches Through Evidence.

- ~$100M in cooperative agreements for up to 30 organizations
- ~$3M each over 3 years
- NOFO expected any day
- First cohort: September 1, 2026
- Focus: Lifestyle medicine interventions Medicare doesn't currently cover

**co-op.care fit:** Time Bank community wellness activities = primary delivery mechanism for required nutrition/physical activity components. Walking groups, meal preparation, social connection — all neighbor-led through Time Bank credits.

---

## COLORADO REGULATORY FRAMEWORK

### Colorado SB 24-205 (AI Act)
- Stringent requirements on AI in "consequential decisions"
- CII/CRI qualify — influence care matching, dispatch, emergency respite
- Human-in-the-loop satisfies by design
- Compliance labor factored into 50% gross margin

### Colorado Employee Ownership Tax Credit
- 75% of cooperative formation costs
- Via RMEOC partnership

### Colorado HCBS Base Wage (2026)
- $17.00/hour effective January 2026
- co-op.care workers: $25–28/hour (significantly above floor)

---

## IRS TAX ADVANTAGE FRAMEWORK

### IRS Publication 502 — Medical Necessity
- Standard custodial care = NOT qualified medical expense
- Clinical Director + CareOS Omaha documentation = "clinical maintenance"
- Letter of Medical Necessity unlocks HSA/FSA payment
- 36% effective discount for families

### 2026 Pre-Tax Buckets
| Account | Limit | Eligibility |
|---|---|---|
| Family HSA | $8,750 (+$1K catch-up 55+) | HDHP required |
| Dependent Care FSA | $5,000 | Parent lives with employee 8+ hrs/day |
| Health Care FSA | ~$3,300 | Unlocked via LMN |

**Math:** $3,500/month → ~$2,240/month in take-home pay after tax advantage.

---

## NON-DILUTIVE FEDERAL FUNDING PIPELINE

| Program | Amount | Deadline | Status |
|---|---|---|---|
| OEDIT Early-Stage Capital | Up to $250,000 | Feb 26 (submitted) | Conditional award; 6 months for matching |
| CMS ACCESS Model | $360–420/beneficiary/year | April 1, 2026 | Cohesion Phase 1 preparing application |
| MAHA ELEVATE | ~$3M over 3 years | TBD (NOFO pending) | Time Bank satisfies requirements |
| HHS Caregiver AI Prize | $2M | Phase 1: July 31, 2026 | CII + CareOS + Time Bank ecosystem |
| OEDIT Advanced Industries | Variable | July 2026 cycle | Requires active operations |
| CO Employee Ownership Tax Credit | 75% formation costs | Ongoing | Via RMEOC |

**Total non-dilutive pipeline: $4.5M+**

---

## MEDICARE ENROLLMENT SEQUENCE

The exact order matters. Getting this wrong wastes months:

1. **File the LLC** → prerequisite for everything
2. **Secure Clinical Director (MD/DO)** → mandatory for ACCESS and PIN/CHI
3. **Apply for Medicare Part B enrollment** → requires LLC + Clinical Director
4. **Submit ACCESS application** → by April 1, 2026
5. **Establish incident-to billing with BCH** → requires Medicare enrollment
6. **Begin billing PIN/CHI codes** → requires CareOS documentation pipeline
7. **Receive ACCESS OAPs** → beginning July 2026 cohort

Skipping any step creates 6–12 month cascading delays.

---

## HIPAA / COMPLIANCE STACK

- Aidbox FHIR server handles clinical data storage and access control
- AccessPolicy engine with ABAC/ReBAC for granular access
- FHIR Basic Audit Log Patterns (BALP) for HIPAA compliance
- OpenTelemetry export for centralized monitoring
- CareOS pipeline must maintain compliance through all 5 stages
- Encrypted channels for FHIR R4 transmission to hospital systems
- EVV records require GPS + timestamp accuracy for Medicaid
