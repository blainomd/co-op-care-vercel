# co-op.care — CLAUDE.md
## AI Operating System Context Layer
## Last Updated: March 2026

---

## IDENTITY

**Company:** co-op.care Technologies LLC
**Entity Type:** Worker-owned cooperative (Colorado LLC → future cooperative conversion)
**Domain:** co-op.care
**Location:** Boulder, Colorado
**Stage:** Pre-revenue. LLC/EIN/bank filing phase.

---

## THE CAPTIVE ENERGY THESIS

63 million family caregivers generate $600 billion in unpaid labor every year. That's the largest untapped energy source in healthcare. It's invisible, uncompensated, unstructured — and it dissipates. She burns out. The patient goes to a facility at $10K/month.

co-op.care is the infrastructure that captures that energy.

The family caregiver is already the power plant. She's generating 27 hours a week of physical care, emotional regulation, medication management, scheduling, advocacy, and overnight monitoring. The problem isn't generation. The problem is that none of it flows into a system that recognizes, structures, or compensates it. co-op.care doesn't create the energy — it builds the grid that prevents it from being wasted.

**The daughter is already the power plant. We're the grid.**

---

## MISSION

co-op.care builds the infrastructure that captures the captive energy of family caregiving — then fills the gaps with worker-owners, neighbors, and physician oversight so the circuit never breaks. Community care as an asset: more freedom, autonomy, dignity, and extreme cost reduction. Human capital that fights private equity.

**Brand rules:**
* Always "co-op.care" — never FCC, Family Care Cooperative, or other legacy names
* Regulatory/financial complexity stays internal; public-facing materials are simple, emotional, family/caregiver/community-only
* The Alpha Daughter is the primary persona: she's the caregiver being enabled, not a passive service buyer
* Messaging: "You're not failing. The system failed you. We're the infrastructure." / "The daughter is already the power plant. We're the grid."

---

## TEAM STRUCTURE (roles, not individuals)

| Role | Function |
|------|----------|
| Founder (MD MPH) | Fellowship-trained orthopedic surgeon, 20+ yrs healthcare technology, multiple exits, 5 patents. No active clinical license — handles clinical review and flagging. |
| Physician Clinical Director (DO) | 50-state licensed. Local hospitalist since 2008. Signs off on ALL clinical decisions. Letter of Medical Necessity (LMN) generation is primary operational role (~1–2 hrs/week). Also CMO of an AI physician oversight company. |
| Backend Architect | Technical co-working partner. Firebase/HIPAA setup. CII/CRI assessment deployment. CareOS PWA build. |
| FHIR Infrastructure Partner | Health Samurai/Aidbox. FHIR R4 platform. Likely free initially. Possible advisor equity. |

---

## CARE MODEL — Five Integrated Sources Under One Physician LMN

1. **Conductor** — Trained family caregiver + AI dashboard
2. **Time Bank** — Neighbors at $0 reciprocal exchange (1 hour = 1 credit)
3. **W-2 Personal Care Worker-Owners** — $25–28/hr + equity
4. **W-2 Skilled Care Worker-Owners** — RN/CNA/PT/OT/SLP + equity
5. **Community Wellness Referrals** — Yoga, tai chi, nutrition (HSA/FSA via LMN)

One LMN covers all five. Internal escalation. Zero handoffs. Bills every payer.

### The Energy Stack

| Layer | Function | co-op.care Implementation |
|-------|----------|---------------------------|
| Infrastructure | The family caregiver IS the power plant | 27 hrs/week of invisible labor. co-op.care is the grid. |
| Foundation | FHIR/Omaha makes the energy legible | Omaha System → FHIR R4 mapping. Structured clinical data from home care. Core IP. |
| Software | CareOS is the metering system | Voice → Omaha → FHIR pipeline. Measures, routes, and bills the energy flow. |
| Physical | W-2 worker-owner prevents circuit break | Cooperative equity = <15% turnover. Shows up when family reserves deplete. |
| Storage | Time Bank is the battery | Community energy circulates via reciprocal credits. $0 scalable. |
| Currency | The cooperative is gold | Worker labor generates equity. Human capital accrues value. |

### Caregiver Continuity Model

NOT "same person every visit." Families rate caregivers, build favorites lists, and choose based on availability and needs. Language in all materials: "your favorite caregivers" or "caregivers you know and trust" — never promise one person every time.

---

## REVENUE MODEL

### $59/Month Membership (includes LMN)

One price. Everything included. Multiple paths to tax savings.

The physician Letter of Medical Necessity (LMN) is included in the $59/mo membership — no separate fee.

**CRITICAL:** The daughter is the payer. Mom is the beneficiary. Mom (65+, Medicare) cannot contribute to an HSA. The daughter (45-60, employed) is the one with the HSA/FSA. All "pay with your HSA" messaging addresses the daughter.

**Four paths to tax savings:**

1. **HSA:** Daughter has HDHP, NOT on Medicare. $4,400/$8,750 limits (2026). Pre-tax. Effective cost ~$36-44/mo. NEW: DPCSA under $150/mo is explicitly HSA-compatible.
2. **Health Care FSA:** Employer-sponsored. $3,400/yr. Same eligible expenses. Use-it-or-lose-it.
3. **Dependent Care FSA:** $7,500/yr (2026, up from $5K). For care enabling daughter to WORK. Parent must live with her. Covers care services, NOT the $59 membership.
4. **Schedule A Medical Deduction:** Available to EVERYONE including Medicare. Expenses above 7.5% AGI. Universal fallback.

**Dual-payer model per family:**
* Daughter's HSA/FSA → membership + care services (pre-tax private dollars)
* Mom's Medicare → PIN/CHI + PACE + LEAD/ACO (federal dollars, $0 to family)

**Language rules:**
* ✅ "Pay with your HSA" — ❌ NEVER "HSA/FSA eligible" without specifying who
* ✅ "Use pre-tax dollars" — ❌ NEVER "tax deductible" or "tax free"
* ✅ "The physician letter unlocks your tax savings"

At signup, ask: (1) Do you have an HSA? (2) Does your employer offer an FSA? (3) Does your parent live with you? → Show effective monthly cost based on answers.

**What members get:**
* Physician-supervised care plan with LMN (included)
* Tax-savings path identified at signup
* Weekly burnout tracking (30-second Sunday check-in)
* CareCapture for all visitor types (neighbor Quick Check, Conductor daily, Clinical Sync)
* Passive PROMIS health monitoring from every visit
* Time Bank access (give and receive community hours)
* Caregiver favorites list and matching
* After-Visit Summaries delivered to phone
* Local resource guide for their area
* Monthly tax-ready statements for HSA/FSA submission

### The funnel (simplified):

```
Burnout assessment (free) → score + email + ZIP
    ↓
Tax savings calculator: "Do you have an HSA?" → effective cost shown
    ↓
"$59/month — often less with your HSA" → membership signup
    ↓
Physician LMN auto-generated → tax savings unlocked immediately
    ↓
Care services as needed → hourly billing (also HSA/FSA payable)
    ↓
Community density grows → federation triggers
```

No separate LMN purchase. No friction. One price, one step, everything unlocked.

### Assessment Wedge (all free — lead generation)

* **CII (Caregiver Impact Index)** — Free burnout assessment. 12 sliders across 3 dimensions. Score ≥70 = Red Zone → intervention cascade. Measures THE CAREGIVER.
* **CRI (Care Readiness Index)** — Free acuity assessment. 14 factors including cognition (weighted 1.3x), fall risk (weighted 1.1x). Maps to service tier. Measures THE SYSTEM'S VIEW.
* **PROMIS-29 (Patient-Reported Outcomes)** — NIH-standard, publicly available, zero licensing. 7 domains. T-score metric (mean=50, SD=10). Measures THE PATIENT'S VOICE. Monthly.
* **Omaha KBS (via AmbientScribe)** — Measures THE CAREGIVER'S CLINICAL OBSERVATIONS. Knowledge/Behavior/Status 1-5. Every visit.

### Four-Perspective Assessment Pipeline

| Assessment | Whose Voice | What It Captures | Frequency |
|------------|-------------|------------------|-----------|
| CII | The Daughter (caregiver) | Burnout, load, isolation, support gaps | At intake + quarterly |
| CRI | The System | Acuity, fall risk, cognition, service tier matching | At intake + as needed |
| PROMIS-29 | The Patient | Physical, mental, social self-report (T-scores) | Monthly (formal) |
| Omaha KBS | The Caregiver (W-2) | Clinical observations, behavior, status ratings | Every visit (via AmbientScribe) |

Four perspectives on the same patient, flowing through one FHIR-native pipeline. No home care company in the market has this.

### PASSIVE PROMIS INFERENCE (key innovation)

The AmbientScribe parser estimates PROMIS T-scores from conversational signals during every 10-minute Clinical Sync — NO questionnaire needed.

| PROMIS Domain | Signal Source | Example Signals |
|---------------|---------------|-----------------|
| Physical Function | AmbientScribe | "dizzy getting out," "needed shower chair," ADL performance |
| Anxiety | CII + AmbientScribe | Daughter's stress score + patient's expressed worry |
| Depression | AmbientScribe | "quieter than usual," withdrawal, grief references |
| Fatigue | AmbientScribe | "I'm tired," "didn't sleep well," energy level |
| Sleep Disturbance | AmbientScribe | "legs aching at night," sleep quality reports |
| Social Participation | CII + AmbientScribe | Isolation from both streams |
| Pain Interference | AmbientScribe | Pain reports, medication context, activity limits |

**Architecture:**
1. Every visit → AmbientScribe parser estimates PROMIS T-scores passively from conversation
2. When estimated T-score crosses threshold (≥55 negative domain or ≤45 positive domain) → triggers formal PROMIS-29 questionnaire
3. Formal PROMIS-29 validates/calibrates the passive estimates
4. Over time, the passive estimates improve as the parser learns the patient's baseline

This means: Longitudinal PROMIS-equivalent outcomes data from EVERY visit with zero patient burden. Formal survey only when something looks concerning. This is the data stream PACE and ACCESS evaluators want — and no one else generates it passively from ambient clinical conversation.

### PROMIS-29 → Omaha System Mapping

| PROMIS Domain | T-Score | Omaha Problem | KBS Status |
|---------------|---------|---------------|------------|
| Physical Function | Higher = better | #22 Neuro-musculo-skeletal | T≥55→5, T50-55→4, T40-50→3, T30-40→2, T<30→1 |
| Anxiety | Higher = worse | #11 Mental health | T<45→5, T45-50→4, T50-55→3, T55-65→2, T≥65→1 |
| Depression | Higher = worse | #11 Mental health | Same as anxiety |
| Fatigue | Higher = worse | #36 Sleep and rest | Same as anxiety |
| Sleep Disturbance | Higher = worse | #36 Sleep and rest | Same as anxiety |
| Social Participation | Higher = better | #06 Social contact | Same as physical function |
| Pain Interference | Higher = worse | #32 Pain | Same as anxiety |

### Service Tiers (on top of $59/mo membership)

* **Companion Care:** $400–$1,200/mo (4–12 hrs/week)
* **Standard Care:** $1,200–$3,200/mo (12–24 hrs/week)
* **Comprehensive Care:** $3,200–$6,000/mo (24–40 hrs/week)
* **24/7 Care:** $8,000–$12,000/mo

All service tiers payable with pre-tax HSA/FSA dollars (the daughter's account) via the LMN included in membership.

### Revenue Streams

1. **Membership:** $59/mo × members (recurring, HSA/FSA eligible, includes LMN)
2. **Care Services:** Hourly rates for W-2 caregiver visits
3. **PIN/CHI Billing:** G0023, G0024, G0140, G0146, G0019, G0022 under physician NPI
4. **Employer Contracts:** B2B benefit packages
5. **PACE Sub-capitation:** Phase 3 (HCC risk adjustment revenue)

### Billing Codes

* **PIN (Principal Illness Navigation):** G0023, G0024, G0140, G0146
* **CHI (Community Health Integration):** G0019, G0022
* Incident-to billing under physician's NPI

---

## TECHNOLOGY STACK

| Component | Technology | Status |
|-----------|-----------|--------|
| FHIR Infrastructure | Aidbox (Health Samurai) | Planned |
| Clinical Taxonomy | Omaha System (42 problems, 75 targets, KBS 1-5) | Core IP — CII-to-FHIR mapping |
| Hospital Integration | PointClickCare / Collective Medical ADT | Planned |
| Biometric Data | HealthMCP (Nori) — Apple Watch, Oura, Garmin, WHOOP | Planned |
| Backend | Firebase (HIPAA config) + Vite + React + Tailwind v4 | Live at co-op.care (CareOS PWA) |
| Assessments | CII + CRI (React/JSX) | Built |
| Website | ComfortCare v10 (React/JSX, 75KB) | Built but NOT deployed |
| Ambient Scribe | Ambience API (Phase 2-3) / Claude+Whisper (Phase 1) | AmbientScribe component built in PWA |
| NLP Pipeline | CareOS — voice-to-Omaha-to-FHIR | Architecture designed |
| Credentialing | Mocingbird (potential) | Researching |

### CareOS PWA Components (live at www.co-op.care)

```
ConductorDashboard    CareTimeline      TimeBankWallet
CIIAssessment         MiniCII           TaskAccept
ImpactScore           OnboardingFlow    WorkerDashboard
CareLog               OmahaSystem       AmbientScribe
ShiftClock            CRIAssessment     CRIDetail
KBSAssessment         KBSTrend          GPSCheckin
```

### CareOS Pipeline (5 stages)

1. **Capture** — Caregiver dictates narrative note (or 10-minute Clinical Sync via AmbientScribe)
2. **NLP Parse** — AI extracts entities → structured JSON
3. **Omaha Map** — Maps to 42 Problem Classifications, KBS ratings (1-5)
4. **FHIR Convert** — Packages into Epic-interoperable FHIR R4 Observations
5. **Bill + Verify** — Maps to PIN/CHI codes + GPS/timestamp EVV

### Ambient Scribe Architecture: The "10-Minute Burst" Model

The AmbientScribe component in CareOS uses a bounded 10-minute "Clinical Sync" window — NOT continuous recording. This is both a technical and cultural decision:

**Why 10 minutes:** 85% of actionable clinical data (symptoms, medication changes, social determinants) surfaces in the initial assessment conversation. Recording beyond this for routine care (bathing, meals) creates data noise and inference cost bloat.

**Why bounded, not continuous:** In a worker-owned cooperative, surveillance is a governance issue, not just a privacy issue. Worker-owners will resist continuous monitoring. Framing the AI as a "Clinical Sync tool" — a professional documentation window they control — protects caregiver autonomy and cooperative trust.

**The Alpha Daughter UX:** Cutting audio at minute 10 means the After-Visit Summary can be delivered to the daughter's phone while the caregiver is still in the home. Immediate feedback loop of trust.

### Strategic Design Principles (from Ambience CEO / a16z):

1. **"Last Mile" Problem:** General AI models improve but healthcare has a massive gap between model output and clinical action. CareOS IS the last mile — the community/home layer where AI meets patient reality. Build here.
2. **"Floor Is Lava":** AI capabilities evolve every 18 months. The parser MUST be model-agnostic. Design every interface as a contract that can swap underlying models without changing the Omaha mapping layer. Never hard-code to a single LLM. Product clock speed must exceed traditional healthcare software.
3. **EHR Abstraction Layer:** CareOS is to home care what Ambience is to hospital EHRs — an abstraction layer that sits on top of messy reality and produces structured, AI-optimized clinical data. We don't replace anything. We make home care data legible to hospital systems.
4. **Phase 2 = Financial ROI:** Every feature must connect to a revenue line. AmbientScribe → PIN/CHI billing. CareCapture → LMN generation. Passive PROMIS → ACCESS/PACE outcomes reporting. No features without revenue justification.
5. **The Flywheel:** Better documentation → improved margins → better caregivers → more families → more data → better AI → better documentation. This is the growth engine. Code for the flywheel, not for features.

### Agentic Care Team (Phase 2-3 architecture target):

* **Pre-visit Intelligence:** Before caregiver arrives, CareOS synthesizes patient history (last observations, PROMIS trends, med changes, CII trajectory) into a 30-second briefing. Caregiver knows what to watch for before knocking.
* **Continuous Engagement:** Post-visit automated follow-ups through the Conductor: medication adherence, meals, sleep, mood. Closes the loop between visits.
* **Virtual Care Team Orchestration:** Physician, W-2 caregiver, Conductor, Time Bank neighbors = coordinated team. CareOS is the orchestration layer that routes the right information to the right person in the right format.

### Integration stack (Phase 2-3):

| Layer | Vendor | Role |
|-------|--------|------|
| Input (Voice) | Ambience API (or Whisper/Claude in Phase 1) | Captures 10-min sync; speaker diarization (Daughter, Parent, Caregiver) |
| Synthesis (AI) | Ambience AutoCDI (or Claude in Phase 1) | Extracts ICD-10s, HCC risks, Omaha-compatible observations |
| Store (Backend) | Aidbox (FHIR R4) | Permanent longitudinal Omaha System Problem Rating Scale |
| UI (PWA) | CareOS AmbientScribe component | "Start/Stop Sync" and "Accept Suggestions" flow |

**Phase 1 cost note:** Ambience pricing is $3-5K/provider/year. At current volume (zero patients), use Claude/Whisper for basic transcription-to-Omaha mapping at near-zero cost. Ambience becomes the right investment when PACE sub-capitation HCC risk adjustment revenue justifies it.

### Data mapping logic for developers:

* Ambience "Social Determinants" → FHIR Condition with Omaha Environmental Domain codes (01 Income, 02 Sanitation, 03 Residence)
* Ambience "Physical Findings" → FHIR Observation with Omaha Physiological Domain codes
* Ambience AutoCDI HCC flags → CareOS Assistant Task for physician review and PACE risk adjustment

---

## REGULATORY & COMPLIANCE

| Item | Status | Notes |
|------|--------|-------|
| Colorado Class B Home Care License | 4–6 months out | CDPHE application. ~$600 fee. |
| CMS-855B Medicare Enrollment | Needs filing | 60–90 day clock. |
| Colorado SB 24-205 (AI Act) | Compliant by design | CII/CRI are high-risk. Human-in-the-loop via physician required. |
| HIPAA | Triggers at Phase 1 clinical data | Firebase HIPAA config is prerequisite. |
| Colorado Regulatory Sandbox | Pursuing | No healthcare sandbox exists in CO yet. IAALS at DU is key contact. |

---

## COMPETITIVE LANDSCAPE

### Direct Competitors (home care platforms)

* **Honor** — Technology platform for home care agencies. PE-backed. $25/hr caregivers.
* **Papa** — Companion care marketplace. Gig workers. No clinical integration.
* **Homethrive** — Employer benefit for family caregivers. Companionship+ pulled from 2026.

### Why co-op.care Wins

* Worker-owned = <15% turnover (industry: 65-80%)
* Five care sources under one LMN = no handoffs
* CII-to-FHIR mapping = hospital-grade data from home care (the Coca-Cola on top of AI refrigeration)
* HSA/FSA eligibility via physician LMN = massive cost unlock for families
* Time Bank = $0 scalable community layer (the battery)
* Cooperative equity = human capital that accrues value (the gold)

### NOT competitors (different category)

* Primary care platforms (One Medical, Forward, etc.)
* Hospital OS platforms (e.g., Eos AI) — these are complements, not competitors

---

## PITCH-READY LINES

* "63 million family caregivers generate $600 billion in unpaid labor every year. That's the largest untapped energy source in healthcare. co-op.care is the infrastructure that captures it."
* "The daughter is already the power plant. We're the grid."
* "Every other home care startup built Coca-Cola's bottle. We built Coca-Cola — structured clinical architecture on top of commoditized AI."
* "The Time Bank is a battery. The cooperative is gold. The physician LMN is the meter that makes invisible labor billable."
* "You're not failing. The system failed you. We're the infrastructure."

---

## WEBSITE REQUIREMENTS

The public-facing website at co-op.care must serve TWO audiences simultaneously:

### For Families (the Alpha Daughter)

* Simple, emotional, zero jargon
* Lead with: "Are you caring for a parent? You're not alone."
* CII assessment as free entry point (burnout score)
* Service tiers with clear pricing
* "Your favorite caregivers" language
* Email capture for waitlist

### For Institutional Partners (hospitals, employers, payers)

* Discharge coordination / blocked bed ROI
* FHIR-native data, Omaha System, PIN/CHI billing
* Cooperative turnover advantage (<15% vs 65-80%)
* Zero-upfront-cost pilot structure
* Community Health Needs Assessment alignment

### Design Principles

* Warm, human, editorial quality — NOT clinical/cold/corporate
* Complexity stays in drawers/expandable sections
* Mobile-first (families browse on phones)
* Minimum 75KB total, renders fast
* co-op.care branding: teal + warm cream/gold palette
* Typography: distinctive serif for headlines, clean sans for body

---

## COMMUNICATION RULES

### For Public/Family-Facing Materials

* Simple, emotional, community-only
* No regulatory jargon, no acronyms, no complexity
* Lead with the daughter, the mother, the neighbor
* "Your favorite caregivers" not "continuity of care"

### For Partners/Investors

* Lead with data: $9,900/mo facility costs, 63M caregivers, 65-80% turnover
* Revenue model clarity: assessments free → $59/mo membership (includes LMN + HSA unlock) → care services recurring
* The Captive Energy Thesis as the organizing narrative
* Regulatory moat: SB24-205 compliance, ACCESS model, sandbox strategy

### For Clinical/Technical Audiences

* FHIR R4, Omaha System, PIN/CHI codes
* Aidbox infrastructure, CareOS NLP pipeline
* SB24-205 human-in-the-loop architecture

---

## NATIONWIDE FEDERATION VISION

### The Journey: Daughter → Member → Care in 48 Hours

| Step | Time | What Happens |
|------|------|--------------|
| 01. Finds Us | 2 min | Googling "help caring for aging parent" at 11pm. Sage maps her to 6 Omaha problems through conversation. |
| 02. Burnout Surfaces | 5 min | CII score: 78/100. Red Zone. "You're not failing — the system failed you." First time someone quantified it. |
| 03. One-Click Membership | 30 sec | $59/month. COOP-XXXX card. Seedling Member. HSA/FSA eligibility, Time Bank, caregiver matching, physician oversight. |
| 04. One-Click LMN | 24 hrs | Sage auto-populates LMN from Omaha data. Member reviews in plain language. One tap → physician signature → HSA/FSA unlocks. $35/hr care → $23/hr pre-tax. |
| 05. Care Begins | 48 hrs | Local co-op matches caregivers. She browses profiles, builds favorites. First visit: QR scan → 10-min Clinical Sync → Omaha → FHIR. Energy is flowing. |

### Federation Structure

co-op.care is NOT one company growing into every city. It's a federation of locally-owned cooperatives sharing a common technology platform.

**Shared (Technologies LLC):** CareOS platform, Sage AI, AmbientScribe, Omaha parser, FHIR pipeline, membership network (COOP-XXXX cards work nationwide), physician LMN network (50-state licensed), clinical protocols, credentialing infrastructure, brand, compliance.

**Local (Each Cooperative Instance):** W-2 caregiver worker-owners (equity in LOCAL co-op), Time Bank neighbors, family relationships, state licensure, community wellness partners, hospital discharge partnerships.

### Revenue Flows

* **Membership ($59/mo, includes LMN)** → Technologies LLC
* **Platform fee (% or flat per-member)** → Technologies LLC
* **Care service revenue** → Local co-op → worker-owner wages + equity
* **PIN/CHI billing** → Split between Technologies LLC (physician NPI) and local co-op

### Expansion Map

* **Phase 1:** Boulder (NOW – Q2 2026) — Prove the model
* **Phase 2:** Colorado Front Range (Q3-Q4 2026) — Denver, Fort Collins, Colorado Springs
* **Phase 3:** Cooperative-friendly states (2027) — Portland, Austin, Asheville, Minneapolis
* **Phase 4:** Nationwide (2028+) — Burlington, Boise, Ann Arbor, Pittsburgh, Santa Fe

### Why Federation Beats Franchise

**Franchise:** corporate extracts value, workers are employees of a distant entity, turnover 65-80%.
**Federation:** workers own their local co-op, equity accrues locally, turnover <15%. Technology earns revenue by making local cooperatives successful, not by extracting from them.

### Scale Economics

| Scale | Members | Membership Rev ($59/mo incl LMN) | PIN/CHI Billing | Platform Fees | Technologies LLC Total |
|-------|---------|-----------------------------------|-----------------|---------------|----------------------|
| 100 co-ops × 50 | 5,000 | $3.5M/yr | $1.5M/yr | $2.4M/yr | ~$7.4M/yr |
| 1,000 co-ops × 100 | 100,000 | $70.8M/yr | $30M/yr | $24M/yr | ~$125M/yr |

At 100,000 members = 0.16% of the 63 million family caregivers in America. The grid is barely warming up.

### Build Principle

Build for one, deploy to all. Every component — Sage, membership card, LMN flow, QR check-in, AmbientScribe — scales through federation without modification. The membership card that works in Boulder works in Burlington. The Omaha parser that runs in one co-op runs in a thousand.

---

## KEY LEARNINGS (Do Not Repeat These Mistakes)

1. "Project Sanitas" is a partner company's sales methodology — not a co-developed clinical safety framework. Don't claim "5-Layer Safety Model."
2. 99.2% accuracy claims need citation — don't use without source.
3. Competitive landscape targets wrong category — should reference Honor, Papa, Homethrive, not primary care models.
4. MGA structure eliminates insurance capital barrier — direct CO insurer licensure requires $1-5M. Not feasible now. MGA with fronting carrier is the 2027 path.
5. Hospital OS platforms are complements, not competitors — they solve hospital-side; we solve community/home-side.
6. Phase sequencing matters — human relationships before data layer. HIPAA triggers at clinical data integration.
7. Caregiver continuity via favorites/ratings is more honest than promising "same person every visit."

---

## PHASE SEQUENCING

**Phase 1: 1099 Bridge (NOW)**
Placement agency model for data collection while pursuing Class B licensure.

**Phase 2: Class B Licensed Operations (4-6 months)**
W-2 worker-owners. Full cooperative model. PIN/CHI billing.

**Phase 3: ACCESS Model + Insurance (2027)**
Federal revenue. MGA insurance product. Federation architecture.

Core principle: Human relationships before data layer. The Captive Energy Thesis is what we're building TODAY. Everything else requires the energy to be flowing first.

---

## SKILL OPTIMIZATION — AUTO-RESEARCH METHODOLOGY

Based on Andrej Karpathy's autonomous prompt optimization. Use this to push any CareOS skill from 80% to 97%+ accuracy without human intervention.

### Three Requirements

1. **Objective numerical metric** — binary pass/fail eval rate
2. **Automated measurement** — no human in the loop during optimization
3. **A lever** — the markdown skill file being optimized

### How to Run

1. Isolate the skill (e.g., Omaha mapping section of this file)
2. Build an eval set (50-100 test cases with ground-truth answers)
3. Run the skill against eval set 3-5 times per case (distribution, not single shot)
4. Score binary pass/fail → calculate pass rate
5. Analyze failures → suggest SKILL.md edits → apply → re-run
6. Repeat 50 iterations (~$10-20 per skill)
7. Stop when pass rate > 97% or max iterations reached

### Priority Skills to Optimize

| Skill | Lever | Binary Metric | Eval Set Needed |
|-------|-------|---------------|-----------------|
| Omaha Parser | Omaha mapping instructions | Correct Problem + Intervention + KBS? | 50 annotated transcripts (Josh) |
| Passive PROMIS | T-score inference prompt | Within ±5 of formal PROMIS-29? | Matched sync/survey pairs |
| HCC Extraction | ICD-10/HCC extraction prompt | Catches the billable code? | 50 syncs with known HCC codes |
| LMN Generation | LMN auto-generation prompt | Would Josh sign without edits? | 25 reviewed LMNs |
| Quick Check → Omaha | Neighbor observation mapping | Correct Omaha Problem + Status? | 100 common observations |
| /write (SEO) | GTM content instructions | Answers intent + CTA + no jargon? | 20 target keywords |

### Design Rules

* **Binary over scaled.** "Correct Omaha code? Yes/No" > "Rate accuracy 1-10"
* **Distribution over single.** Run each case 3-5x. Optimize for consistency.
* **One lever per loop.** Don't optimize the entire CLAUDE.md at once.
* **$10 per skill.** Every CareOS workflow optimized to 97%+ for under $100 total.

### The "Floor Is Lava" Connection

When you swap models (Claude → GPT-5 → whatever), re-run the optimization loop against the eval set with the new model. The SKILL.md adapts to whatever intelligence is underneath. Model-agnostic by design, optimized by automation.

---

## GTM ENGINEERING — GROWTH AUTOMATION COMMANDS

You are also a growth engine. When the founder types a slash command, execute the full workflow autonomously. Ask no questions. Deliver the output.

### TOOLING

* **GStack (Garry Tan, open source):** Structured AI coding workflows with persistent headless browser engine (100-200ms per browser action vs seconds). Use for: /publish (CMS pushes), /track (GSC data pulls), /optimize (live page updates), competitor scraping, community density monitoring. Install in Claude Code environment.
* **Open Jarvis (Stanford, Phase 2):** Local-first AI agents on consumer hardware. 88.7% of tasks on local hardware. For CareOS PWA: offline-capable family check-ins, neighbor Quick Checks, HIPAA-safe local processing. Watch for production readiness.

### THE CONDUCTOR MODEL

Don't run one task at a time. The founder opens multiple Claude Code terminal windows:
* Window 1: SEO content pipeline (researching + writing + publishing)
* Window 2: Email nurture sequence for this week's assessment completions
* Window 3: Community activation campaign for target ZIP codes
* Window 4: Weekly scorecard + optimization

Each runs independently. Founder checks outputs, adds polish, approves. The middle work is automated.

### API MANAGEMENT

When any new API key is provided, automatically add it to /growth/.env for future use.

```
KEYWORDS_EVERYWHERE_API_KEY=     # Keyword research ($10/100K credits)
GOOGLE_SEARCH_CONSOLE=            # Organic performance (free)
MAILCHIMP_API_KEY=                # Email automation (free tier)
CMS_API_KEY=                      # Article publishing
FIREBASE_KEY=                     # Community density tracking
```

### /research [topic]

1. Find high-intent keywords related to [topic] for caregiver/aging audience
2. Use Keywords Everywhere API, Google autocomplete, People Also Ask, and competitor analysis
3. Filter: caregiver/aging/home care intent, question-based, comparison-based
4. Scrape top 3 Google results for each target keyword to understand what ranks
5. Output: ranked keyword list with search intent, monthly volume, difficulty, and content angle
6. Save to /growth/keywords/[date]-[topic].md

### /write [keyword]

1. Analyze top 5 ranking results for [keyword] — word count, headers, questions answered
2. Write 1,200-1,800 word article that:
   * Leads with the Alpha Daughter's emotional reality
   * Answers the search intent directly
   * Embeds the burnout assessment as CTA ("What's my burnout score?" → co-op.care)
   * Uses NO jargon (no FHIR, Omaha, PROMIS, PIN/CHI — ever in public content)
   * Tone: warm, honest, like a friend who finally gets it
3. Generate meta title (< 60 chars), meta description (< 155 chars)
4. Save to /growth/content/[keyword-slug].md

### /publish [file]

1. Read markdown file
2. Convert to site-ready HTML or CMS format
3. Push to CMS or deploy as static page
4. Submit URL to Google Search Console for indexing

### /linkedin

Generate 4 posts for this week. Rotate content pillars:
1. **The Care Crisis** — 63M caregivers, $600B unpaid labor, facility costs
2. **Cooperative Economics** — $28/hr vs $13/hr, worker ownership, PE extraction
3. **The Alpha Daughter** — personal stories, burnout validation, "you're not failing"
4. **Technology Without Jargon** — what CareOS does in human terms (NEVER say FHIR, Omaha, parser)

Rules:
* Max 3 hashtags (#CooperativeCare #HomeCareCrisis #WorkerOwnership)
* No emojis in first 3 lines
* No engagement bait ("Comment YES if...")
* Final line: question or link to burnout assessment
* 1-2 sentence paragraphs, liberal line breaks
* Save to /growth/content/linkedin/[date]-[pillar].md

### /activate [zip]

Generate community activation campaign for target ZIP:
1. Facebook post for local caregiver support groups
2. Nextdoor post about the Time Bank concept
3. Local SEO article: "Home Care Options in [City] [Year]"
4. Partnership email for senior centers in the area
5. Employer benefit pitch for largest employers in ZIP

Each piece drives to co-op.care with ZIP pre-filled in URL. Save to /growth/campaigns/[zip]-activation/

### /nurture [segment]

Generate email sequences segmented by burnout score:

**Low (0-39) — Prevention: 4 emails over 2 weeks**
* E1 (Day 0): "Your score is [X]. Here's what it means — and how to stay ahead."
* E2 (Day 5): Time Bank intro + community invite
* E3 (Day 10): Caregiver wellness tips + employer benefit awareness
* E4 (Day 14): Community density update for their ZIP

**Medium (40-64) — At Risk: 6 emails over 3 weeks**
* E1 (Day 0): "Your score is [X]. You're carrying more than most people see."
* E2 (Day 3): "You're not the only one in [City] feeling this."
* E3 (Day 7): "One question, every Sunday. That's all we ask." (weekly check-in intro)
* E4 (Day 10): "What a neighbor noticed that changed everything." (Time Bank story)
* E5 (Day 14): "Your HSA can pay for this. Here's how." ($59/mo membership explainer)
* E6 (Day 21): "[City] is [X] families away from full care."

**High (65-100) — Crisis: 8 emails over 4 weeks**
* E1 (Day 0): "This is unsustainable. Here are resources right now." (local guide)
* E2 (Day 2): "You're not alone anymore." (validation + community)
* E3 (Day 5): "Respite care exists. Here's how to access it."
* E4 (Day 8): "$59/month. Physician oversight. HSA eligible. Everything included."
* E5 (Day 12): Time Bank urgent match for their area
* E6 (Day 16): Care plan consultation offer
* E7 (Day 21): Weekly check-in enrollment
* E8 (Day 28): Founding member invitation + community milestone

Each email: one CTA only. Mobile-optimized. Warm tone. Never clinical. Save to /growth/email/[segment]-sequence.md

### /track

1. Pull Google Search Console data (impressions, clicks, CTR, position)
2. Identify pages ranking positions 5-20 ("striking distance")
3. Suggest specific content updates to push from page 2 to page 1
4. Save report to /growth/reports/[date]-performance.md

### /optimize [url]

1. Pull Search Console data for specific URL
2. Find queries driving impressions but low CTR
3. Rewrite title, meta, headers to target those queries
4. Add FAQ sections from People Also Ask
5. Update live page

### /scorecard

1. Pull all data: Search Console, email captures, community counts by ZIP
2. Calculate: impressions, clicks, new signups, community growth, assessment completions, email open/click rates
3. Compare to prior week. Flag anything declining >10%.
4. Output: scorecard with top wins, biggest gaps, and 3 priority actions
5. Suggest 3 content topics based on rising keywords
6. Save to /growth/reports/weekly-scorecard-[date].md

### Content Rules for All Public Writing

1. The reader is the Alpha Daughter at 11pm. Write for her.
2. First sentence earns the second sentence. No throat-clearing.
3. Every article must include one path to the burnout assessment on co-op.care.
4. No stock phrases ("in today's world", "it's no secret", "navigating the journey")
5. Specific > general. "27 hours a week" > "a significant amount of time"
6. If the content doesn't make you feel something, rewrite it.

### Revenue Connection (every workflow must map to revenue)

| Workflow | → Revenue Line |
|----------|---------------|
| SEO article | → burnout assessment → email capture → $59/mo membership signup |
| LinkedIn post | → co-op.care visit → assessment → Community join → density trigger |
| Email nurture | → membership explainer → HSA/FSA unlock → $59/mo recurring + care services |
| /activate | → ZIP density → tier threshold → Federation deployment → ops revenue |
| Employer outreach | → benefit pilot → enrollment → B2B contract |

No content without a revenue path. No feature without a funnel.

### Target Keywords (seed list — expand with /research)

* **Tier 1 (assessment entry):** "caregiver burnout test", "am I burning out as a caregiver", "caregiver stress assessment"
* **Tier 2 (cost/service):** "home care vs nursing home cost", "HSA for home care", "affordable home care Boulder"
* **Tier 3 (community):** "caregiver support group near me", "time bank for caregivers"
* **Tier 4 (professional):** "caregiver employee benefit", "W2 caregiver jobs with equity"

### Directory Structure

```
/growth/
├── .env              ← API keys
├── keywords/         ← Research outputs
├── content/
│   ├── seo/          ← SEO articles
│   └── linkedin/     ← Weekly posts
├── published/        ← Live content tracking
├── campaigns/        ← Community activation by ZIP
├── email/            ← Nurture sequences by segment
├── reports/          ← Performance dashboards
└── scorecard/        ← Weekly scorecards
```
