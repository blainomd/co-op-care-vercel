# co-op.care — What This Is and Where It's Going

A briefing for anyone who needs to understand the whole picture.

**March 15, 2026**

## The Problem

63 million Americans are family caregivers. They provide $600 billion in unpaid labor every year. The typical family caregiver is a 49-year-old woman working full-time while providing 27 hours of weekly care for an aging parent. She has no infrastructure. No physician backing her. No way to make her caregiving visible to the healthcare system. No tax advantages for the money she spends. No community around her.

When she burns out — and the data says she will — her parent goes to a facility at $9,900/month. The healthcare system gets another avoidable admission. The family goes broke. The caregiver's own health declines. Everyone loses.

## What co-op.care Is

A worker-owned cooperative technology platform that builds the infrastructure around that family caregiver. Based in Boulder, Colorado. Pre-revenue. Founded by Blaine Warkentine, MD MPH (fellowship-trained orthopedic surgeon, 20+ years healthcare tech, multiple exits, 5 patents).

**The core idea: the daughter is already the power plant. We're the grid.**

She's already generating the energy — the care, the monitoring, the emotional labor. The problem isn't generation. It's that none of it flows into a system that recognizes, structures, or compensates it. co-op.care doesn't create the energy. It builds the grid that prevents it from being wasted.

## The Care Model

Five integrated care sources under one physician's Letter of Medical Necessity (LMN):

1. **The Conductor** — the trained family caregiver (the daughter) with an AI-powered dashboard
2. **The Time Bank** — neighbors exchanging hours at $0. One hour given = one hour earned.
3. **W-2 Personal Care Worker-Owners** — $25-28/hr + equity in the cooperative
4. **W-2 Skilled Care Worker-Owners** — RN, CNA, PT, OT, SLP + equity
5. **Community Wellness Referrals** — yoga, tai chi, nutrition, prescribed by the physician

One physician oversees all five. One LMN covers everything. Internal escalation between levels. Zero handoffs. The family never retells the story.

The physician is Josh Emdur, DO — a Boulder Community Health hospitalist since 2008, 50-state licensed, also CMO of Automate Clinic (AI physician oversight). His primary operational role is LMN generation and clinical sign-off, roughly 1-2 hours per week at current scale.

## The Revenue Model

### $59/Month Membership

Includes the physician LMN. No separate fee. The LMN establishes medical necessity, which unlocks tax-advantaged payment.

**The critical nuance: the daughter is the payer. Mom is the beneficiary.**

Mom (65+) is on Medicare. She cannot contribute to a Health Savings Account — the IRS prohibits this once you enroll in any part of Medicare. She likely has no employer FSA because she's retired.

The daughter (45-60, employed) is the one with the HSA through her employer's high-deductible health plan. She pays $59/month from HER pre-tax dollars for her mother's care.

### Four Paths to Tax Savings

1. **Daughter's HSA** — requires HDHP, cannot be on Medicare. $4,400 individual / $8,750 family limit (2026). The $59/mo membership + all care services are qualified medical expenses with the LMN. Effective cost: ~$36-44/month.
2. **Daughter's Health Care FSA** — employer-sponsored. $3,400/year limit. Same eligible expenses as HSA. Use-it-or-lose-it with $680 rollover.
3. **Dependent Care FSA** — $7,500/year (2026, increased from $5,000 for the first time in 40 years). Available if Mom lives with the daughter and is incapable of self-care. Covers care services that enable the daughter to work. Does NOT cover the $59 membership itself (different IRS test).
4. **Schedule A Medical Expense Deduction** — available to everyone, including Medicare beneficiaries. Unreimbursed medical expenses above 7.5% of AGI are deductible when itemizing. The universal fallback.

### The Dual-Payer Model

Every family generates two simultaneous revenue streams for co-op.care:

**Private dollars (from the daughter):** $59/mo membership + care services, paid with pre-tax HSA/FSA dollars.

**Federal dollars (from Medicare):** PIN/CHI billing codes (G0023, G0024, G0019, G0022) for care navigation, billed under the physician's NPI. PACE sub-capitation for dual-eligible beneficiaries. LEAD/ACO shared savings. The family pays $0 for these — they flow from CMS.

### Twelve Revenue Streams

| # | Stream | Payer | When |
|---|--------|-------|------|
| 1 | Membership ($59/mo) | Daughter's HSA/FSA | Day 1 |
| 2 | Comfort Card (pre-funded care wallet) | Daughter's HSA/FSA | Phase 1 |
| 3 | PIN/CHI Care Navigation | Medicare | Phase 2 |
| 4 | Wellness Provider Network (10-15% platform fee) | Daughter's HSA/FSA | Phase 1 |
| 5 | Companion/Personal Care ($400-$12K/mo) | Daughter's HSA/FSA/DC-FSA | Phase 2 |
| 6 | Employer Caregiver Benefits ($59-100/employee/mo) | Employers (B2B) | Phase 2 |
| 7 | DPC Provider Data Feed ($25-75/patient/mo) | DPC practices (B2B) | Phase 2 |
| 8 | PACE Sub-Capitation ($800-1,500/enrollee/mo) | Medicare/Medicaid | Phase 3 |
| 9 | PROMIS/PROM Outcomes Data Licensing | Health plans, pharma, research | Phase 2 |
| 10 | LEAD Model & CARA Contracts | CMS Innovation Center | 2027 |
| 11 | ACO Partnership Shared Savings | ACOs | Phase 2-3 |
| 12 | Age-in-Place Insurance (MGA structure) | Families, employers | 2028-29 |

At 5,000 member families (0.008% of the 63M market): ~$30M annual revenue from twelve diversified streams. No single payer type exceeds 27%.

## The Technology — CareOS

### CareCapture (Unified Assessment)

Four modes for four types of visitors, all producing the same structured clinical output:

- **Quick Check** — a neighbor taps what they noticed in 2 minutes (tap cards, no training)
- **Conductor Check-In** — the daughter's 3-minute daily check-in with embedded burnout scoring
- **Clinical Sync** — a 10-minute ambient recording with a W-2 caregiver (AmbientScribe)
- **Physician Review** — flagged items only, for Josh

### AmbientScribe (10-Minute Clinical Sync)

Whisper transcription ($0.06) → Claude Omaha System parser ($0.02) → FHIR R4 to Aidbox. Total: ~$0.08 per visit.

The parser is the core intellectual property. It maps natural clinical conversation to the Omaha System (42 problems, Knowledge/Behavior/Status ratings, interventions). It's model-agnostic — the input layer (Whisper today, Ambience tomorrow) swaps without changing the Omaha mapping. "Build the parser, not the listener."

### Passive PROMIS Inference (Key Innovation)

The parser estimates PROMIS T-scores (Patient-Reported Outcome Measurement Information System) from conversational signals during every clinical sync — without a questionnaire. When estimated T-scores cross thresholds, a formal PROMIS-29 is triggered automatically.

This means: longitudinal, validated outcomes data from every visit with zero patient burden. No other home care company generates this. It's the data stream that PACE programs, ACOs, and the ACCESS Model evaluators want.

### Architecture Principles

- **"Floor Is Lava"** — AI capabilities evolve every 18 months. Every interface is a contract that swaps underlying models without changing the clinical mapping layer. Never hard-code to a single LLM.
- **Phase 2 = Financial ROI** — Every feature must connect to a revenue line. No features without revenue justification.
- **The Flywheel** — Better documentation → improved margins → better caregiver wages → lower turnover → more families → more data → better AI → repeat.

## Federation Architecture

co-op.care doesn't scale by hiring salespeople. It scales by community activation.

When enough families in a geographic area join, the full technology stack deploys for that community as its own cooperative instance. One codebase. Locally owned. Shared infrastructure.

| Tier | Members | What Deploys | Monthly Infra Cost |
|------|---------|-------------|-------------------|
| 0 Seed | 1-10 | Quick Check only | $0 |
| 1 Sprout | 10-25 | Full CareCapture + Conductor | ~$50 |
| 2 Root | 25-75 | CareOS + AmbientScribe + billing | ~$200-500 |
| 3 Canopy | 75-250 | Licensed operations + W-2 payroll | ~$1.5-3K |
| 4 Forest | 250+ | Multi-community federation | ~$5-15K |

Each community owns its data (own Aidbox FHIR store), its governance (own cooperative structure), and its caregiver pool. The shared platform (co-op.care Technologies LCA, filed March 10, 2026) provides the technology, physician network, credentialing, and brand.

## Regulatory Strategy

- **Colorado Class B home care agency license** — 4-6 month timeline
- **CMS ACCESS Model** — outcome-aligned payment program, application due April 1, 2026
- **LEAD Model** — CMS's newest 10-year ACO model launching January 2027. Explicitly targets homebound patients and smaller providers. RFA opens March 2026.
- **CARA** — episode-based risk arrangements with falls prevention program
- **Colorado Regulatory Sandbox** — no healthcare sandbox exists in Colorado yet. co-op.care aims to be a founding participant. IAALS at University of Denver is the key contact (they designed Utah's model).
- **SB24-205** — Colorado AI governance. CII/CRI assessments are high-risk and require human-in-the-loop clinical oversight (Josh).
- **DPCSA** — Direct Primary Care Service Arrangements under $150/month are explicitly HSA-compatible under the One Big Beautiful Bill Act (2026). co-op.care's $59/mo fits. Sandbox opportunity.
- **MGA Insurance Structure** — Managing General Agent with a licensed fronting carrier for the age-in-place insurance product (2028-29). Avoids $1-5M direct insurer licensure capital requirement.

## The Website (co-op.care)

A daughter lands here at 11pm because she just spent three hours caring for her mother and she's crying. She finds:

1. **"You're not failing. The system failed you."** — dark, warm, just words.
2. **A 5-tap burnout assessment** — not clinical. Human. "How heavy does it feel right now?"
3. **A community tracker** — her ZIP code shows how many families near her have joined. Starts at zero. Honest. "Be the first family here."
4. **Five story cards** — the power plant, the neighbor, worker-owners, one doctor, the Time Bank.
5. **A join flow with immediate value** — weekly burnout tracking, local resource guide, founding member status.

No jargon anywhere on the page. No FHIR, Omaha, PROMIS, parser, federation. Just the truth about what this does for real people.

## Current Pipeline (March 2026)

- **Boulder Community Health pilot** — Monday 3/16, 1:30pm. 90-day pilot, 5-10 discharge patients, zero cost to BCH. Key contact: Grant Besser (VP Community Health, wrote the CHNA that identified healthy aging as the #1 community priority at 47%).
- **CMS ACCESS Model application** — due April 1
- **Limelight/ACCESS Mode accelerator** — deadline Monday noon
- **10 unsent outreach emails** — waiting for the website to be live before sending (InnovAge, CommonSpirit, Boulder JCC, CU Boulder, Lafayette Senior Center, Naropa, City of Boulder, Braverman Law, Aging Life Care Association)

## Competitive Landscape

- **Ambience Healthcare** ($1B valuation, $373M funding) — hospital AI scribe. None serve home care. Phase 3 integration target, not competitor.
- **Honor/Home Instead** — traditional home care. No clinical data pipeline. No cooperative ownership.
- **Papa** — companion care marketplace. No physician oversight.
- **Homethrive** — caregiver navigation. No care delivery.
- **InnovAge** — institutional PACE. Partner target, not competitor.

**co-op.care's white space:** worker-owned cooperative + physician oversight + AI clinical documentation + community density activation + federation architecture. Nobody combines all five.

## Key Decisions Made

- **$59/mo membership includes LMN** — no separate fee, no conversion friction
- **Community counters start at zero** — honest founding energy over fake social proof
- **"Build the parser, not the listener"** — parser is the core IP, input layer is swappable
- **Ambience = Phase 3 only.** Whisper+Claude at $0.08/visit for Phase 1-2.
- **Caregiver continuity via favorites/ratings**, not "same person every visit"
- **Fix the house before knocking on doors** — deploy website before sending outreach
- **MGA insurance structure** eliminates capital barrier
- **Hospital OS platforms are complements**, not competitors
- **Every feature must map to a revenue line**

## The One Sentence

The daughter is already the power plant. We're the grid. $59 a month, paid with her HSA, gets her a physician, a community, tax savings on every dollar she spends on care, and the first system that ever treated her 27 hours a week of invisible labor as something worth measuring, structuring, and sustaining.
