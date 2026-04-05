# co-op.care CareOS — Clinical Taxonomy & Feature Deep Dive
# Omaha System ↔ ICD-10 Crosswalk + Master Synthesis Expansion

---

## PART 1: THE OMAHA SYSTEM ↔ ICD-10 CROSSWALK

### Why This Matters

co-op.care operates at the intersection of community care (documented in the Omaha System) and clinical billing (documented in ICD-10-CM). The crosswalk enables:

1. **LMN generation:** When the Medical Director writes a Letter of Medical Necessity, the system auto-maps Omaha System problems to ICD-10 codes that justify HSA/FSA eligibility under IRS Pub 502.
2. **BCH discharge integration:** Hospital discharge diagnoses arrive as ICD-10 codes. The system must translate them into Omaha System problems for community care planning.
3. **CMS reporting:** ACCESS Model, LEAD/CARA, and GUIDE programs require ICD-10-coded diagnoses. The Omaha System is the documentation standard for community nursing. The crosswalk bridges them.
4. **CII/CRI scoring:** The CRI maps clinical conditions (ICD-10) to caregiver burden dimensions (Omaha System psychosocial/behavioral domains).
5. **Predictive models:** Wearable anomaly detection generates Omaha System observations that must map to ICD-10 for clinical escalation and billing.

### The Omaha System: 42 Problems × 4 Domains

The Omaha System Problem Classification Scheme has 42 problems across 4 domains. Each problem has unique signs/symptoms and maps to specific ICD-10 codes relevant to co-op.care's home care population.

**Domain 1: Environmental (4 problems)**

| # | Omaha Problem | co-op.care Relevance | ICD-10 Mapping | LMN Eligible? |
|---|--------------|---------------------|---------------|---------------|
| 01 | Income | Financial strain assessment in CII. SDOH Z-code documentation. Bridges to Medicaid/PACE eligibility. | Z59.7 (Insufficient social insurance/welfare support), Z59.86 (Financial insecurity) | No — but triggers care coordination |
| 02 | Sanitation | Home safety assessment during worker visits. Triggers Home Safety Mods accelerator (#14). | Z59.1 (Inadequate housing), Z59.89 (Other problems related to housing) | No — but triggers intervention |
| 03 | Residence | Housing stability affects care plan design. Relevant to "aging drifters" and multi-generational households. | Z59.0 (Homelessness), Z59.19 (Other inadequate housing) | No |
| 04 | Neighborhood/Workplace Safety | Environmental risk factors for falls, isolation. Informs Time Bank proximity matching. | Z77.098 (Contact with other hazardous substances), Z59.3 (Problems related to living in residential institution) | No |

**Domain 2: Psychosocial (12 problems)**

| # | Omaha Problem | co-op.care Relevance | ICD-10 Mapping | LMN Eligible? |
|---|--------------|---------------------|---------------|---------------|
| 05 | Communication with community resources | THE CONDUCTOR'S CORE FUNCTION. Measures how well the family navigates the care ecosystem. CII dimension: Medical Coordination. | Z75.4 (Unavailability of other helping agencies), Z75.3 (Unavailability of healthcare facilities) | Yes — care coordination services |
| 06 | Social contact | CII dimension: Social Isolation Impact. Time Bank's primary intervention target — companions, meals, phone calls reduce isolation. | Z60.2 (Problems related to living alone), Z60.4 (Social exclusion and rejection), Z63.79 (Other stressful life events affecting family) | Yes — social prescribing (tai chi, groups, companionship) |
| 07 | Role change | THE CONDUCTOR'S IDENTITY TRANSFORMATION. Daughter → Caregiver → Conductor. Measures burden of role transition. CII dimensions: Emotional Labor, Work Impact. | Z63.6 (Dependent relative needing care at home), Z73.1 (Accentuation of personality traits — Type A), Z56.9 (Unspecified work problem) | Yes — Conductor Certification training |
| 08 | Interpersonal relationship | Family dynamics around caregiving. Sibling conflict about care responsibilities. Conductor as mediator. | Z63.0 (Problems in relationship with spouse/partner), Z63.1 (Problems in relationship with in-laws), Z63.8 (Other specified problems related to primary support group) | Yes — family counseling, support groups |
| 09 | Spirituality | Faith community hubs as Time Bank nodes. Spiritual wellbeing affects caregiver resilience. | Z65.8 (Other specified problems related to psychosocial circumstances) | Possibly — chaplain/pastoral services |
| 10 | Grief | Anticipatory grief in dementia caregiving. Ambiguous loss. Critical for Conductor mental health. | Z63.4 (Disappearance/death of family member), F43.21 (Adjustment disorder with depressed mood) | Yes — grief counseling, bereavement support |
| 11 | Mental health | Caregiver depression (40-70% prevalence). Anxiety. Burnout. CII dimensions: Emotional Labor, Sleep Disruption. | F32.9 (Major depressive disorder), F41.1 (Generalized anxiety), F43.10 (Post-traumatic stress disorder), Z73.0 (Burnout) | Yes — therapy, CBT, mindfulness programs |
| 12 | Sexuality | Relevant for couples where one partner becomes caregiver. Intimacy disruption. | Z70.9 (Sex counseling, unspecified) | Limited |
| 13 | Caretaking/parenting | THE CONDUCTOR BURDEN ITSELF. This IS what co-op.care exists to address. Sandwich generation: caring for children + aging parents. | Z63.6 (Dependent relative needing care at home), Z73.1 (Type A personality — overwork), Z56.3 (Stressful work schedule) | Yes — respite care, caregiver training, Time Bank |
| 14 | Neglect | Self-neglect of the aging adult OR the caregiver. Worker-owners trained to detect and report. Mandatory reporting triggers. | T74.01XA (Adult neglect, confirmed, initial encounter), R46.89 (Other symptoms involving appearance/behavior) | Clinical escalation — not LMN |
| 15 | Abuse | Elder abuse screening during every visit. Worker training includes recognition. Mandatory reporting pathway. | T74.11XA (Adult physical abuse, confirmed), T74.21XA (Adult sexual abuse, confirmed), T76.01XA (Adult neglect, suspected) | Clinical escalation — not LMN |
| 16 | Growth and development | Cognitive decline trajectory in dementia. Developmental regression. Informs PACE eligibility and care intensity. | F03.90 (Unspecified dementia without behavioral disturbance), G30.9 (Alzheimer's disease), R41.81 (Age-related cognitive decline) | Yes — cognitive stimulation programs |

**Domain 3: Physiological (18 problems)**

| # | Omaha Problem | co-op.care Relevance | ICD-10 Mapping | LMN Eligible? |
|---|--------------|---------------------|---------------|---------------|
| 17 | Hearing | Affects communication with care team. Isolation factor. Wearable can't compensate. | H91.90 (Unspecified hearing loss), Z97.4 (Artificial larynx presence) | Yes — audiology services |
| 18 | Vision | Fall risk factor. Affects medication management. Environmental modification trigger. | H54.7 (Unspecified visual loss), H52.4 (Presbyopia) | Yes — optometry, low-vision aids |
| 19 | Speech and language | Post-stroke aphasia. Dementia-related communication decline. SLP intervention trigger. | R47.01 (Aphasia), R47.1 (Dysarthria), R48.8 (Other symbolic dysfunctions) | Yes — speech therapy (W-2 skilled provider) |
| 20 | Oral health | Malnutrition risk factor. Affects dignity and social engagement. | K08.109 (Complete loss of teeth), K05.10 (Chronic gingivitis) | Limited — dental referral |
| 21 | Cognition | CORE DEMENTIA DOMAIN. CRI factor. Drives PACE eligibility, Time Bank task complexity limits, Conductor training needs. Wearable: sleep disruption correlates with cognitive decline. | F03.90 (Unspecified dementia), G30.9 (Alzheimer's), G31.84 (Mild cognitive impairment), R41.3 (Other amnesia) | Yes — cognitive stimulation, dementia communication training |
| 22 | Pain | Chronic pain management. Affects mobility, sleep, mood. Wearable: elevated resting HR may indicate pain. Worker-owner assessment at every visit. | G89.29 (Other chronic pain), M54.5 (Low back pain), M25.50 (Joint pain) | Yes — PT, aquatic therapy, yoga, acupuncture |
| 23 | Consciousness | Altered consciousness detection via wearable (sudden HR/HRV change) + worker observation. Emergency escalation trigger. | R40.20 (Unspecified coma), R41.0 (Disorientation) | Emergency — not LMN |
| 24 | Skin | Wound care (W-2 skilled RN), pressure injury prevention, skin tear documentation. Photo capture in worker app. | L89.90 (Pressure ulcer, unspecified), L97.909 (Non-pressure chronic ulcer), L30.9 (Dermatitis) | Yes — wound care, dermatology |
| 25 | Neuro-musculo-skeletal function | MOBILITY AND FALL RISK. Core domain for Blaine's orthopedic background. PT/OT intervention trigger. Home Safety Mods. Conductor training: safe transfers. Wearable: step count decline = mobility decline. | M62.81 (Muscle weakness), R26.2 (Difficulty in walking), W19.XXXA (Unspecified fall), M79.3 (Panniculitis), Z87.39 (History of falls) | Yes — PT, OT, tai chi, aquatic therapy, fitness programs |
| 26 | Respiration | COPD, CHF-related dyspnea. Wearable: SpO2 monitoring. Acute desaturation = emergency escalation. | J44.1 (COPD with acute exacerbation), J96.10 (Chronic respiratory failure), R06.00 (Dyspnea) | Yes — pulmonary rehab, respiratory therapy |
| 27 | Circulation | CHF, hypertension, peripheral vascular. Wearable: resting HR trend, HRV. PACE sub-cap population. Readmission risk #1. | I50.9 (Heart failure, unspecified), I10 (Essential hypertension), I73.9 (Peripheral vascular disease) | Yes — cardiac rehab, nutrition, exercise |
| 28 | Digestion-hydration | Dehydration risk (elderly). Malnutrition screening. Time Bank: meal delivery. Wellness: nutrition counseling. | E86.0 (Dehydration), R63.0 (Anorexia), E46 (Unspecified protein-calorie malnutrition) | Yes — nutrition counseling (RD), meal programs |
| 29 | Bowel function | Incontinence management. Affects dignity, social participation. Worker-owner personal care domain. | R15.9 (Fecal incontinence), K59.00 (Constipation) | Limited — nursing assessment |
| 30 | Urinary function | UTI risk — #1 cause of acute confusion in elderly. Wearable: sudden HR elevation + worker observes confusion = UTI workup. Predictive hospitalization trigger. | N39.0 (UTI), R32 (Unspecified urinary incontinence), N40.0 (BPH) | Yes — urology, pelvic floor PT |
| 31 | Reproductive function | Not primary for home care population | Z87.39 (Personal history) | Not applicable |
| 32 | Pregnancy | Not applicable | — | — |
| 33 | Postpartum | Not applicable | — | — |
| 34 | Communicable/infectious condition | COVID, flu, pneumonia risk. Infection control during Time Bank visits. Worker-owner PPE protocols. | J18.9 (Pneumonia), U07.1 (COVID-19), B34.9 (Viral infection) | Clinical management |

**Domain 4: Health-Related Behaviors (8 problems)**

| # | Omaha Problem | co-op.care Relevance | ICD-10 Mapping | LMN Eligible? |
|---|--------------|---------------------|---------------|---------------|
| 35 | Nutrition | WELLNESS ECOSYSTEM CORE. RD nutrition counseling via LMN Marketplace. Diabetes management. CHF sodium restriction. Time Bank: meal prep/delivery. | E11.9 (Type 2 diabetes), E78.5 (Hyperlipidemia), Z71.3 (Dietary counseling) | Yes — nutrition counseling, medical nutrition therapy |
| 36 | Sleep and rest patterns | CII dimension: Sleep Disruption. Wearable: sleep duration + quality tracking. Caregiver sleep deprivation = burnout predictor. | G47.00 (Insomnia), G47.30 (Sleep apnea) | Yes — sleep hygiene programs, CBT-I |
| 37 | Physical activity | WELLNESS ECOSYSTEM CORE. Tai chi, yoga, aquatic therapy, senior fitness — all LMN eligible. Wearable: step count. Decline triggers intervention. | Z72.3 (Lack of physical exercise), M62.81 (Muscle weakness) | Yes — all fitness/movement programs |
| 38 | Personal care | ADLs — bathing, dressing, grooming, toileting. CDPHE Class A licensed services. W-2 worker-owner core domain. CRI factor. | R26.89 (Other abnormalities of gait/mobility), Z74.1 (Need for assistance with personal care), Z74.09 (Other reduced mobility) | Yes — personal care services (professional) |
| 39 | Substance use | Alcohol/drug use screening. Affects medication management, fall risk, caregiver burden. | F10.20 (Alcohol dependence), F19.20 (Other substance dependence) | Yes — substance abuse counseling referral |
| 40 | Family planning | Not primary for population | — | — |
| 41 | Health care supervision | MEDICATION MANAGEMENT. Medication reconciliation at every visit. Polypharmacy risk. Conductor training module. | Z79.899 (Long-term drug therapy), T50.905A (Adverse effect of unspecified drugs) | Yes — pharmacy consultation, medication management |
| 42 | Prescribed medication regimen | Medication adherence monitoring. Worker-owner: medication reminders. Wearable: timing-based reminders. Comfort Card: pharmacy transactions. | Z91.19 (Noncompliance with medical treatment), Z79.4 (Long-term use of insulin) | Yes — adherence programs, pharmacy services |

### The Crosswalk Engine in CareOS

When a BCH discharge sends ICD-10 codes, the system auto-generates:

```
INPUT:  ICD-10 codes from discharge (e.g., I50.9, E11.9, Z87.39, F03.90)
                    ↓
STEP 1: Map to Omaha System problems
        I50.9  → #27 Circulation
        E11.9  → #35 Nutrition
        Z87.39 → #25 Neuro-musculo-skeletal (fall history)
        F03.90 → #21 Cognition (dementia)
                    ↓
STEP 2: Generate care plan using Omaha Intervention Scheme
        #27 Circulation → Surveillance (vitals monitoring), Teaching (CHF self-management)
        #35 Nutrition   → Case Management (RD referral), Teaching (sodium restriction)
        #25 NMS         → Treatments (PT, Home Safety Mods), Teaching (fall prevention)
        #21 Cognition   → Surveillance (cognitive screening), Teaching (dementia communication)
                    ↓
STEP 3: Auto-populate LMN template
        Diagnosis: I50.9, E11.9, Z87.39, F03.90
        Qualifying activities: Tai chi (fall prevention → Z87.39 + #25)
                              Nutrition counseling (diabetes → E11.9 + #35)
                              Aquatic therapy (CHF cardiac rehab → I50.9 + #27)
                              Cognitive stimulation group (dementia → F03.90 + #21)
        IRS Pub 502 categories: Medical care, therapy, prescribed exercise
                    ↓
STEP 4: Populate Comfort Card tax categories
        Each wellness booking tagged with ICD-10 → Omaha → IRS Pub 502 mapping
        HSA auto-selected as payment source for qualifying services
                    ↓
STEP 5: KBS outcome tracking
        Each Omaha problem gets baseline KBS rating (Knowledge 1-5, Behavior 1-5, Status 1-5)
        Reassessed at 30/60/90 days
        Improvement in KBS scores = clinical evidence for LMN renewal + PACE reporting
```

---

## PART 2: MASTER SYNTHESIS — DEEP DIVE INTO EVERY FEATURE NODE

The Synthesis has 3 pillars × 8 nodes = 24 features organized into 4 throughlines. Here's the deep engineering spec for each.

---

### PILLAR 1: THE CATALYST (Psychology → from Enzyme Thesis)

**NODE: psy-activation — Activation Energy**
- Enzyme principle: lowering the energy barrier to first prosocial action
- Implementation: The first Time Bank task a new member is offered must require <15 minutes, zero travel, and zero skill. Phone companionship. "Call Mr. Torres for 15 minutes." The acceptance rate of this micro-task determines the health of the entire system. Target: >60% first-offer acceptance.
- Technical: Push notification with task card. One-tap accept. Phone number auto-revealed. Timer starts on call connect (Twilio verify). Auto-credit on call end.
- Measurement: First-task acceptance rate, time-to-first-task (target: <24 hours from signup), drop-off rate between signup and first task.
- Omaha crosswalk: Maps to #06 Social Contact — phone companionship directly addresses social isolation.

**NODE: psy-endowment — Endowment Effect**
- Enzyme principle: the 40-hour floor makes members feel wealthy, not needy
- Implementation: The moment Stripe confirms $100 membership payment, the Time Bank balance animation plays: "40 hours credited." This isn't a coupon. It's wealth. The psychological frame matters: "You have 40 hours of community care" not "You can request up to 40 hours."
- Technical: Stripe webhook → PostgreSQL balance update → WebSocket push → frontend animation (counter incrementing from 0 to 40). Sound effect optional.
- Measurement: First-spend latency (how quickly do new members use their first hour?), balance anxiety (do members hoard or spend?).
- Anti-pattern: Do NOT frame as "free trial" or "credits remaining." Frame as "your community care balance."

**NODE: psy-proximity — Propinquity Effect**
- Enzyme principle: proximity increases likelihood of saying yes
- Implementation: Time Bank matching algorithm weights proximity above all other factors. Distance < 0.5 mi gets 3x score boost. Distance 0.5-1.0 mi gets 2x. Distance 1-2 mi gets 1x. Beyond 2 mi, only remote tasks offered.
- Technical: PostgreSQL geospatial query: `geo::distance(user.location, task.location)`. Results sorted by proximity-weighted match score. Real-time recalculation as task location updates.
- Measurement: Average distance between matched pairs, completion rate by distance bracket, relationship formation rate (repeat matches between same pair).
- Omaha crosswalk: Maps to #04 Neighborhood Safety and #03 Residence — proximity matching builds neighborhood-level social infrastructure.

**NODE: psy-loss — Loss Aversion**
- Enzyme principle: people are 2x more motivated to avoid a loss than to achieve an equivalent gain
- Implementation: Two loss aversion mechanisms. (1) Credit expiry: earned credits expire after 12 months. 30-day warning: "4.5 hours expire on [date]. Use them or donate to the Respite Fund." The fear of losing credits drives spending velocity. (2) LMN expiry: "Your Letter of Medical Necessity expires in 30 days. Without renewal, you lose $6,200/year in HSA tax savings." The LMN loss is the retention moat.
- Technical: Scheduled jobs in PostgreSQL checking expiry dates. Tiered notification sequence (60/30/7 days). Auto-donation to Respite Fund on expiry (with opt-in confirmation at 30 days).
- Measurement: Spend velocity increase in final 30 days before expiry, LMN renewal rate (target: >90%), churn rate of members who let LMN lapse.

**NODE: psy-identity — Self-Verification Theory**
- Enzyme principle: people are most likely to help when the task aligns with who they already are
- Implementation: During Time Bank onboarding, members complete an "I enjoy…" profile (NOT "I'm willing to…"). Options: cooking, driving, phone calls, teaching, tech help, yard work, errands, companionship, organizing, languages (specify). The matching algorithm prioritizes identity alignment: retired teacher → tutoring tasks. Car enthusiast → driving tasks. Gardener → yard work.
- Technical: Skills array in PostgreSQL user model. Matching query weights `taskType IN user.skills` by 2x over non-skill matches. Post-task satisfaction rating tracked per skill type — algorithm learns which skills each user most enjoys.
- Measurement: Satisfaction rating by skill alignment (matched vs. mismatched), repeat task acceptance rate by skill type, identity persistence (do users keep the same skills profile or evolve?).
- Omaha crosswalk: Maps to #07 Role Change — the Conductor's identity transforms from "overwhelmed daughter" to "trained care coordinator" through progressive skill alignment.

**NODE: psy-trust — Signaling Theory**
- Enzyme principle: visible trust signals reduce perceived risk of interacting with strangers
- Implementation: Every Time Bank profile shows: (1) green "✓ Background Checked" badge with verification date, (2) aggregate star rating (1-5) with review count, (3) "Member since [date]", (4) neighborhood name. For worker-owners: (5) "W-2 Employee-Owner" badge, (6) cooperative equity tier.
- Technical: Background check API (Checkr or Sterling) integrated into onboarding. Status stored in PostgreSQL user model. Badge auto-rendered on all profile views. Rating calculated as rolling 90-day weighted average.
- Measurement: Task acceptance rate with/without background check badge visible (A/B test), trust score correlation with match success rate, time-to-first-accept for new members with high vs. low visible trust signals.

**NODE: psy-streak — Goal Gradient Effect**
- Enzyme principle: people accelerate effort as they approach a goal (the "coffee card" effect)
- Implementation: Streak tracking: "You've helped someone 4 weeks in a row! 🔥" Streaks are weekly (any task in a 7-day window counts). Streak milestones at 4, 8, 12, 26, 52 weeks unlock recognition: community champion badge, newsletter mention, faith community hub bulletin board.
- Technical: PostgreSQL `currentStreak` and `longestStreak` fields on TimeBank account. Cron job every Monday at 6 AM: check if user completed a task in the prior 7 days. If yes: increment. If no: reset to 0. Push notification on milestone weeks.
- Measurement: Week-over-week retention rate for members with active streaks vs. broken streaks, average streak length, correlation between streak length and referral rate.

**NODE: psy-cascade — Viral Loop**
- Enzyme principle: one enzyme molecule triggers a cascade of millions of reactions
- Implementation: After the 3rd completed Time Bank task, auto-trigger: "You're making a real impact. Know someone who'd be great at this? Invite a neighbor → you both get 5 bonus hours." The referral mechanic is a relation table: `INSERT INTO referred (referrer_id, referred_id) VALUES (lisa_id, karen_id)`. The cascade visualization shows the chain: "Your help enabled Janet to help the Torres family, who helped the Johnson family."
- Technical: Referral tracking as PostgreSQL graph relationship. Bonus hours auto-credited on referee's first completed task (not on signup — ensures quality). Cascade visualization: `SELECT →helped→*→helped→* FROM user:lisa` — multi-hop graph traversal rendered as a visual chain.
- Measurement: Referral rate (% of members who refer after 3rd task), referral conversion rate (% of referred users who complete onboarding), cascade depth (average chain length), viral coefficient (referrals per member).

---

### PILLAR 2: THE ENGINE (Product → from Strategy Map)

**NODE: prod-discharge — Discharge Concierge**
- What it does: When a patient is discharged from BCH with a caregiver at home, co-op.care receives the alert and assembles a care team within 24-48 hours. This is the zero-CAC acquisition channel.
- Integration: BCH runs Epic. ADT (Admit-Discharge-Transfer) messages via HL7 v2 or FHIR R4 Encounter resources. Aidbox receives the FHIR Encounter, extracts ICD-10 diagnosis codes, maps to Omaha System problems, and triggers the onboarding workflow in PostgreSQL.
- Omaha crosswalk: Discharge diagnoses (ICD-10) → Omaha problems → auto-generated care plan → LMN template pre-populated → Conductor dashboard activated.
- Revenue: BCH pays $2,500/month retainer for discharge referral pathway. Reduces 15.4% readmission rate. Each avoided readmission saves BCH $16,037.
- Key metric: Time from discharge to care team assembly. Target: <48 hours. Gold standard: <24 hours.

**NODE: prod-respite — Respite Emergency Fund**
- What it does: Any family in crisis gets 48 hours of care immediately, regardless of Time Bank balance. Funded by: (1) $3 from every $15/hr Time Bank purchase, (2) 0.1 hours auto-donated per earned hour (Respite Default nudge), (3) expired credits auto-donated.
- Technical: PostgreSQL singleton table `respite_fund`. Auto-approval if balance >100 hours. Coordinator manual approval if <100 hours. Dispatch: nearest available worker-owner + Time Bank neighbor for meals/companionship.
- Omaha crosswalk: Crisis triggers map to multiple Omaha problems simultaneously: #13 Caretaking (caregiver hospitalized), #25 NMS (fall), #27 Circulation (cardiac event), #21 Cognition (acute confusion). The Respite dispatch creates an Aidbox Encounter with all relevant Omaha problems flagged.
- SLA: <4 hours from crisis trigger to first community response. <24 hours to full care team assembly.

**NODE: prod-timebank — Time Bank Core**
- What it does: The double-entry ledger tracking earned, spent, bought, donated, and expired hours. The engine behind the Care UBI.
- Architecture: PostgreSQL `timebank_account` + `timebank_tx` + `timebank_task` tables. Every transaction is a double entry: one side debits, the other credits. Balance calculations are aggregations, not stored values — ensures audit integrity.
- State machine: Posted → Matched → Accepted → In Progress (GPS check-in) → Completed (GPS check-out) → Rated → Credits transferred.
- Omaha crosswalk: Every Time Bank task maps to an Omaha intervention category. Meals = #28 Digestion-hydration (Treatments/Procedures). Rides = #05 Communication with community resources (Case Management). Companionship = #06 Social contact (Surveillance). The Omaha coding happens automatically based on task type, enabling clinical outcome measurement of community care.

**NODE: prod-lmn — LMN Marketplace**
- What it does: The physician-governed marketplace that makes community wellness HSA/FSA eligible. The tax moat.
- Technical: Aidbox stores LMN as FHIR DocumentReference with: ICD-10 diagnoses, qualifying conditions, approved service categories, physician electronic signature (DocuSign), expiration date (12 months). The Marketplace UI shows wellness providers filtered by: member's LMN-qualifying conditions, proximity, rating, schedule, price. Each listing shows "HSA Eligible ✓" badge with estimated tax savings.
- Omaha crosswalk: LMN qualifying activities map Omaha → ICD-10 → IRS Pub 502. Example: #25 NMS (fall prevention) → Z87.39 (history of falls) → tai chi qualified as "therapeutic exercise" under IRS Pub 502.
- Revenue: Annual LMN renewal $300-500 (telehealth with Dr. Emdur). Wellness providers pay 8-12% referral fee on bookings. Both HSA eligible.

**NODE: prod-renewal — Annual LMN Renewal**
- What it does: Automated 12-month renewal cycle that prevents LMN lapse (and loss of HSA tax advantage). This IS the retention engine — nobody leaves because leaving = losing 28-36% tax savings on the entire wellness ecosystem.
- Technical: Aidbox LMN has `expirationDate`. PostgreSQL scheduled job sends notifications at 60/30/7 days. Auto-schedules telehealth with Dr. Emdur via Zoom API. CRI reassessment during telehealth updates the Omaha KBS ratings and generates renewed LMN.
- Loss aversion hook: "Your LMN expires in 7 days. If it lapses, you lose HSA eligibility on $20,706 of annual care — that's $6,211 in tax savings. Tap to schedule your 20-minute renewal."

**NODE: prod-wearable — Wearable Integration**
- What it does: Continuous passive monitoring via Apple Watch. Resting heart rate, HRV, sleep duration, sleep stages, step count, SpO2. Establishes personal baselines and detects anomalies.
- Technical: Apple HealthKit API → CareOS API → Aidbox as FHIR Observations (LOINC-coded). PostgreSQL stores operational metrics for dashboard display. Anomaly detection: >2 standard deviations from personal 30-day rolling baseline.
- Omaha crosswalk: Wearable data maps directly to Omaha Physiological domain. HR/HRV → #27 Circulation. SpO2 → #26 Respiration. Sleep → #36 Sleep/Rest. Steps → #37 Physical Activity + #25 NMS. Each anomaly generates an Omaha problem-specific alert.
- LOINC codes: HR = 8867-4, HRV = 80404-7, Sleep duration = 93832-4, Steps = 55423-8, SpO2 = 2708-6.

**NODE: prod-predictive — Predictive Hospitalization**
- What it does: ML model that predicts hospitalization risk 72-96 hours in advance by combining: wearable trends, worker-owner care notes (NLP), Time Bank neighbor observations, CRI scores, medication adherence data, and historical patterns.
- Technical: Feature engineering from Aidbox clinical data + PostgreSQL operational data. Model: gradient boosted trees (XGBoost) or transformer on time-series. Training data: 3+ months of member activity. Output: daily risk score 0-100. Score >70 triggers intervention: Medical Director notification, additional worker visit, Conductor alert.
- Omaha crosswalk: The model's features map directly to Omaha problems. UTI prediction (#30 Urinary) uses: sleep disruption (#36), confusion indicators (#21 Cognition), HR elevation (#27 Circulation). Fall prediction (#25 NMS) uses: step count decline (#37 Physical Activity), gait changes, medication changes (#42 Prescribed Medication). Each prediction maps to an Omaha problem for structured intervention.
- PACE value: TRU PACE pays co-op.care $2,600/month per enrollee. Delivery cost: $1,800. Spread: $800. But an avoided hospitalization saves TRU PACE $16,037. The predictive model is the margin engine — each prevented hospitalization increases the spread dramatically.

**NODE: prod-cert — Conductor Certification**
- What it does: Weekend training program that transforms the family caregiver from overwhelmed bystander to trained participant. Modules: Safe Transfers (2hr/$150), Bathing Technique (2hr/$150), Medication Management (3hr/$200), Dementia Communication (4hr/$250), Fall Prevention (2hr/$150), Emergency Response (2hr/$150), Comprehensive Certification (full day/$750). All HSA/FSA eligible under the LMN.
- Technical: LMS (Learning Management System) integration or custom module tracker. Video + in-person hybrid. Competency assessment at end of each module. Certificate generation. PostgreSQL tracks completed modules per Conductor. Aidbox stores as FHIR Procedure (educational intervention).
- Omaha crosswalk: Each module maps to Omaha Intervention Scheme "Teaching/Guidance/Counseling" category. Safe Transfers → #25 NMS. Medication Management → #42 Prescribed Medication. Dementia Communication → #21 Cognition. The KBS Knowledge subscale improves measurably after each module — this is the clinical outcome data.
- Time Bank bonus: 5 hours credited per module completed. This is the enzyme Induced Fit mechanism — the Conductor's identity shifts from "consumer of care" to "trained participant in care."

---

### PILLAR 3: THE OUTPUT (Macro → from Care UBI & Financials)

**NODE: mac-bch — $364K Y1 Revenue**
- What it produces: Year 1 revenue from BCH discharge referral pathway ($2,500/mo retainer), first 40 founding families (private pay $35/hr + memberships), initial CII/CRI assessments ($150-300 each), and early Conductor Certification enrollments.
- Omaha documentation: Every dollar earned has an Omaha-coded clinical justification. Private pay → personal care services → #38 Personal Care. CII → assessment → multiple Omaha problems identified. This documentation is what enables the PACE and Medicare transitions in later years.

**NODE: mac-viral — $0 Acquisition Cost**
- What it produces: Zero consumer marketing spend. All acquisition through institutional channels (BCH discharge, BVSD employer, faith community hubs, wellness provider referrals, Time Bank word-of-mouth). The cascade visualization is the marketing — members who see their impact chain share it.
- Omaha documentation: Referral patterns documented as #05 Communication with Community Resources. Faith community hub activity documented as #09 Spirituality and #06 Social Contact. This data proves the community engagement model for grant reporting.

**NODE: mac-tax — 28-36% Tax Savings (The LMN Moat)**
- What it produces: For a family spending $20K/year on care + wellness, the LMN saves $6,000-7,200/year in taxes. No new legislation required — IRS Publication 502 already permits it. The physician governance (Dr. Emdur's LMN) is the unlock.
- Omaha documentation: Every LMN-eligible service has an Omaha problem → ICD-10 → IRS Pub 502 chain. The crosswalk engine (Part 1 above) is what makes this possible at scale. Without the crosswalk, each LMN requires manual physician review of every service. With it, the system auto-suggests qualifying services based on the member's clinical profile.

**NODE: mac-retention — Infinite Retention**
- What it produces: Once the LMN is active and the family is saving $6K+/year in taxes, switching to a traditional agency means losing the tax advantage on everything. No agency has physician-governed LMN services. The moat is structural, not relational.
- Omaha documentation: Retention measured via LMN renewal rate (target >90%), Omaha KBS improvement scores (clinical outcomes that justify renewal), and Comfort Card transaction continuity (families spending consistently month over month).

**NODE: mac-pace — $1.25M PACE Margin**
- What it produces: TRU PACE (only PACE in Boulder County, 341 enrollees) sub-capitation at $2,600/month per enrollee, delivery cost $1,800, $800 spread per enrollee. 40 enrollees by Year 3 = $1.25M revenue at 30.8% gross margin. The predictive hospitalization model increases margin by preventing costly events.
- Omaha documentation: PACE enrollees are the most clinically complex — they qualify for both Medicare and Medicaid and would otherwise be in a nursing home. Full Omaha System documentation is required: all 42 problems assessed at intake, KBS ratings at baseline and quarterly, intervention categories for every service delivered. This is the most Omaha-intensive population in the cooperative.

**NODE: mac-val — $100M+ Valuation**
- What it produces: Enterprise value driven by: (1) proprietary clinical dataset (3+ years of Omaha-coded community care outcomes linked to wearable biometrics — nobody else has this), (2) actuarial data for Age at Home insurance underwriting, (3) federation license revenue (50 communities × license fee), (4) proven LMN tax moat with >90% retention.
- Omaha documentation: The data asset IS Omaha-coded data. The crosswalk engine, the KBS outcome tracking, the predictive models built on Omaha + wearable + FHIR data — this is the IP. The fact that it's standardized (Omaha is in UMLS, SNOMED-CT, LOINC) means it's interoperable. The fact that it's longitudinal (years of KBS ratings per problem per member) means it's actuarially valuable.

**NODE: mac-ubi — The Care UBI**
- What it produces: 40 hours/year of community care for every member regardless of ability to volunteer or pay. The community funds its own safety net. The NBER data shows cash UBI reduces earned income by $4,100/year. Care UBI doesn't — because care hours can only flow into community care, not substitute for employment.
- Omaha documentation: The Time Bank hours are Omaha-documented interventions. When Janet delivers meals, that's #28 Digestion-hydration, Treatments/Procedures category. When Lisa makes a phone call, that's #06 Social Contact, Surveillance category. Every Care UBI hour has clinical documentation that enables outcome measurement. This is what makes co-op.care's Care UBI fundamentally different from cash UBI — it generates health data, not just economic data.

**NODE: mac-turnover — <15% Turnover**
- What it produces: Worker-owners earn $25-28/hr + health insurance + equity (~$52K over 5 years via Subchapter T patronage dividends) + democratic governance. The 77% industry turnover rate exists because traditional agencies extract value from workers. co-op.care returns it. The Conductor gets the same caregiver month after month — relationship continuity IS the care quality differentiator.
- Omaha documentation: Worker-owner retention is measurable via: care plan continuity (same worker on same family for months/years), Omaha KBS improvement rates (better outcomes with relationship-based care), and Conductor satisfaction ratings (correlation between worker tenure and family satisfaction).

---

## PART 3: WHAT GEMINI v3 ADDED (PRESERVE AND ENHANCE)

The latest build includes new features not in the original spec:

**Admin.tsx** — Lead management portal. Fetches from SQLite via `/api/leads`. Shows all form submissions. ENHANCE: Add CII score column if member completed quick-check. Add "Convert to Member" button that creates PostgreSQL user record.

**Dashboard.tsx** — Conductor Dashboard prototype with mock data. Shows upcoming care visits, care team, Time Bank balance. ENHANCE: This is the most important page. Connect to real PostgreSQL data. Add wearable vitals section. Add Omaha KBS trend charts. Add Comfort Card summary.

**AIChat.tsx (components/)** — AI chat component for guided caregiving advice. ENHANCE: Connect to the Omaha System. When user describes a caregiving challenge, the AI maps it to Omaha problems, suggests interventions from the Intervention Scheme, and recommends co-op.care services.

**server.ts** — Express server with SQLite lead capture + API routes. ENHANCE: Add PostgreSQL connection for operational data. Add Aidbox proxy for clinical data. Keep SQLite as lead capture backup.

**Google Sheets Setup** — Webhook integration for lead → spreadsheet flow. PRESERVE as-is. Good operational infrastructure for Phase 1 when volume is low.

---

## CRITICAL IMPLEMENTATION NOTE

The Omaha System ↔ ICD-10 crosswalk is not a static lookup table. It's a clinical reasoning engine that considers:

1. **Directionality:** ICD-10 → Omaha (discharge intake) is different from Omaha → ICD-10 (LMN generation, billing)
2. **Context:** The same ICD-10 code maps to different Omaha problems depending on whether the client is the aging adult (#25 NMS for the patient) or the caregiver (#13 Caretaking for the Conductor)
3. **Multi-mapping:** One ICD-10 code can map to multiple Omaha problems (I50.9 Heart Failure → #27 Circulation AND #35 Nutrition AND #37 Physical Activity AND #42 Prescribed Medication)
4. **Temporal:** Omaha KBS ratings change over time. The crosswalk must support longitudinal tracking — what was the Omaha → ICD-10 → LMN mapping at intake, at 30 days, at 90 days?

Build this as a configurable rules engine in the API server, not as hardcoded mappings. The Medical Director must be able to add/modify crosswalk rules as clinical guidelines evolve.

Store the crosswalk rules in Aidbox as a custom FHIR ConceptMap resource:
```
ConceptMap: omaha-to-icd10
  source: https://co-op.care/fhir/CodeSystem/omaha-system
  target: http://hl7.org/fhir/sid/icd-10-cm
  group[]:
    element[]:
      code: "27"  (Circulation)
      target[]:
        code: "I50.9"  (Heart failure)
        equivalence: "wider"
        code: "I10"    (Hypertension)
        equivalence: "wider"
        code: "I73.9"  (PVD)
        equivalence: "wider"
```

This makes the crosswalk FHIR-queryable, version-controlled, and auditable — exactly what CMS reporting and PACE documentation require.
