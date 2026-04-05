# co-op.care Gemini Gem Updates — March 12, 2026

Feed each section to its respective Gem as source material.

---

## CRITICAL CORRECTIONS (Apply to ALL Gems)

These corrections override anything in previous gem files:

### 1. Entity Type: LCA, NOT LLC
co-op.care is a **Limited Cooperative Association (LCA)**, filed March 10, 2026 in Colorado. NOT an LLC. LCA enables patron/investor member structure + Subchapter T cooperative taxation. Previous references to "co-op.care Technologies LLC" should be corrected to "co-op.care Limited Cooperative Association."

### 2. Founder Credibility (CORRECTED)
**ALWAYS use these framings:**
- "MD with deep clinical training (Medical College of Wisconsin)" — NOT "orthopedic surgeon by training"
- "20+ years in orthopedic technology and health system partnerships" — NOT "20+ years orthopedic surgery"
- "Left orthopedic residency (U of Maryland) in year 4, completed a DePuy/BrainLAB-sponsored fellowship" — NOT "residency + fellowship complete"
- "Multiple healthcare M&A exits including HCA Healthcare and Anytime Fitness" — NOT "three strategic exits"
- "~5 verifiable patents (assigned to BrainLAB)" — NOT "five patents" or "35+ patents"
- "MBA (University of Utah)" — include this
- "Grew BrainLAB orthopedic vertical to $250M" — this is the lead credential, always use it

**Blaine's actual superpower:** "clinical translator" — sits at the boundary between surgeons and technology companies, speaks both languages fluently. Deep clinical knowledge without practicing medicine.

### 3. CMS ACCESS Timeline Change
- **SKIP** April 1, 2026 Cohort 1
- **TARGET** January 2027 Cohort 2
- All references to "March 20 safe deadline" and "April 1 official deadline" are now obsolete for ACCESS

### 4. Approach C: W-2 from Day 1
- W-2 Care Navigators hired immediately — NO 1099 bridge period
- Pre-license revenue: CII/CRI assessments at $150-300 each under Dr. Emdur's medical direction
- CDPHE Class B license application runs in parallel with LCA formation

### 5. CareOS Build Status (Current)
- 95+ feature modules, 5,400+ lines production code
- Build verified: `tsc --noEmit` clean, `vite build` clean (272 modules)
- Backend developer (Jacob) has 18 endpoints across v1-v4 handoffs
- FHIR integration developer (Pavel) working on Aidbox setup

---

## 1. STRATEGY / OPS GEM

### Sage Conversational OS — THE Major Strategic Shift

**"Sage advice from co-op.care"** — this is the new product tagline and the entire product vision.

**What changed:** Sage evolved from a chatbot widget on the homepage into the **entire member interface**. Members open the app, click one button, and talk. Everything else — intake, assessments, scheduling, care logging, billing, Time Bank — is a conversation. No navigation, no buttons, no learning curve.

**Why this matters strategically:**
- Traditional UI pages become admin/clinical backstage. Members interact ONLY through Sage.
- Every voice conversation auto-generates Omaha-coded billable encounters — turning companion care visits into clinically-documented, LMN-eligible services
- Competitive moat: Most companion care companies document "companionship — 2 hours." co-op.care documents "Omaha #6 Social Contact (Surveillance), #28 Digestion-Hydration (Treatments/Procedures), #22 Pain (Surveillance) — 2 hours, ICD-10 Z60.2, R63.0, G89.29." Clinical-grade documentation from companion care visits — unprecedented.

**Positioning:** Community infrastructure for every family caregiver. Not a product you buy — infrastructure you use, like a library or a park.

**Business model evolution:** Sponsored by local health networks (BCH — reduces 15.4% readmission rate) and school systems (BVSD — 1,717 teachers burning out as caregivers). Sponsors pay, community uses it free. Omaha-coded encounters prove ROI.

### Voice Pipeline — Audio to Billable Encounter

```
Member speaks
    → Google Cloud Speech-to-Text (streaming, HIPAA BAA)
    → Raw transcript (stored encrypted, PHI-protected)
    → Gemini Flash — dual extraction:
        ├── Intent: what does the member WANT? (1 of 12 domains)
        └── Clinical: what Omaha problems are present?
    → Sage responds conversationally (text + optional TTS)
    → Background: Omaha-coded encounter → PostgreSQL → FHIR sync → Aidbox
    → Encounter feeds into:
        ├── LMN evidence package (HSA/FSA tax savings)
        ├── Billing justification (hours + services rendered)
        └── CMS encounter documentation (future ACCESS/ELEVATE)
```

### 12 Conversational Domains

Every member interaction routes through Sage's intent classification:

1. **Intake/Onboarding** — "I need help with my mom" → Mini CII → account → care plan
2. **Assessment** — "How am I doing?" → CII/Mini CII conversationally (inline sliders)
3. **Scheduling** — "Can someone come Thursday?" → availability check → match → book
4. **Time Bank** — "How many hours do I have?" → balance, post tasks, accept tasks
5. **Care Logging** — "Mom had a good day today" → Omaha auto-code → encounter
6. **Billing/LMN** — "Can I use my HSA?" → explain savings, initiate LMN with Dr. Emdur
7. **Emotional Support** — "I feel so guilty" → warm validation, resource connection
8. **Care Questions** — "What's sundowning?" → evidence-based guidance
9. **Emergency/Crisis** — "She's not breathing" → immediate 911/988/741741 direction
10. **Community** — "I want to become a neighbor" → neighbor onboarding
11. **Account/Settings** — "Change my address" → account management conversationally
12. **Visit Documentation** — Navigator voice mode → real-time Omaha coding

### Care Tier System (NEW — Built March 12)

Starbucks Rewards-style progression based on rolling 12-month care hours:

| Tier | Hours/Year | Earning Multiplier | Credit Expiry |
|------|-----------|-------------------|---------------|
| Seedling | 0-39 | 1.0x | 12 months |
| Rooted | 40-119 | 1.25x | 18 months |
| Canopy | 120+ | 1.5x | Never expires |

Benefits escalate across 14 dimensions: matching priority, referral bonuses, Sage AI session limits, governance participation, equity eligibility, patronage dividends, board eligibility, and more.

NOT gamification (no points/badges/leaderboards) — this is community recognition of sustained care commitment.

### 5 Sage Implementation Phases

| Phase | Timeline | What |
|-------|----------|------|
| Phase 1: Smart Text | Weeks 1-3 | Replace keyword matching with Gemini Flash intent classification |
| Phase 2: Voice | Weeks 4-6 | Google Cloud STT streaming + TTS |
| Phase 3: Omaha Auto-Coder | Weeks 7-9 | Every conversation auto-codes, encounters generated |
| Phase 4: Full Conversational OS | Weeks 10-14 | Scheduling, Time Bank, billing through Sage |
| Phase 5: Sage Shell | Month 4+ | Traditional app pages fade to backstage. Sage IS the app. |

### Technology Choices

| Decision | Choice | Why |
|----------|--------|-----|
| Transcription | Google Cloud STT | HIPAA BAA, real-time streaming, medical vocabulary |
| Intent + coding | Gemini Flash | Fast, cheap (~$0.002/1K tokens), already in roadmap |
| PHI handling | Strip before LLM, store original encrypted | Colorado AI Act SB 24-205 compliance |
| Human review | Codes flagged for Navigator/MD review before billing | Required for billing accuracy |
| Fallback | Web Speech API | Free, no PHI leaves device, lower accuracy |

### Compliance

- **HIPAA:** All audio encrypted at rest and in transit. Google Cloud STT with BAA.
- **Colorado AI Act (SB 24-205):** Pipeline classified HIGH-RISK. Requires impact assessments, human-in-the-loop, bias monitoring.
- **Consent:** Recording consent required before voice capture. Opt-out preserves text-only mode.

---

## 2. OUTREACH GEM

### Updated Positioning for Outreach

**For BCH (Grant Besser conversation):**
Lead with: "Sage advice from co-op.care — every companion care visit produces Omaha-coded clinical documentation. Your 15.4% readmission rate drops because discharged patients get continuous, documented post-acute companion care. Every visit generates LMN-eligible encounters. Risk shields from Armilla + Beazley protect the program."

**For BVSD:**
Lead with: "1,717 teachers managing aging parent care. co-op.care is community infrastructure — sponsored by the school system, used free by families. Your teachers talk to Sage when they're overwhelmed at 2am. The co-op sends a Care Navigator the next morning."

**For employers generally:**
Lead with: "Your employees talk to Sage. The co-op handles everything else. HSA/FSA-eligible. $3-6/employee/month. No contracts."

### Key Contacts Update
- **Jason Wiener** — Colorado cooperative attorney, handling LCA bylaws + Subchapter T + tokenized patronage SEC question
- **Opolis / Joshua Lapidus** — Boulder peer cooperative, DAO governance playbook (coffee meeting planned)
- **Dinner group leads** — 3 PTs, 1 SLP, "Jen" just quit (potential first Care Navigator), Sammi part-time, Kris has FT job

---

## 3. COPYWRITING GEM

### New Core Tagline
**"Sage advice from co-op.care"**

An app where you just click to listen. The rest is just a conversation away. A community infrastructure for every family caregiver, every family. Sponsored by your local health network and school system.

### Updated Website Direction
The website is becoming Sage-first. The hero section IS a chatbot. No traditional landing page with CTAs. Members meet Sage immediately — she can run a burnout assessment inline, answer questions about care, and guide them through onboarding. All conversationally.

### Updated Messaging Hierarchy

**For families (Alpha Daughter):** "Open the app. Talk to Sage. She'll take it from there. Assessment, care plan, scheduling, billing — all through conversation. Your HSA covers it. Your caregiver owns the business."

**For caregivers:** "Talk to families. Sage handles the paperwork. Every visit auto-generates clinically-coded documentation. No charting. No forms. Just care."

**For sponsors (health networks, school systems):** "You fund community infrastructure. Families use it free. Every interaction generates Omaha-coded encounter data proving ROI. Your readmission rate drops. Your teachers show up rested."

---

## 4. GRANT WRITING GEM

### CMS ACCESS Timeline Change
- **SKIP** April 1, 2026 Cohort 1
- **TARGET** January 2027 Cohort 2
- All March 18/March 20 deadlines are now obsolete for ACCESS
- Focus energy on building operational track record first (Class B license, first families, assessment revenue)

### Grant Narrative Should Now Include
- Sage Conversational OS as the intervention technology
- Omaha auto-coding pipeline as the outcome measurement mechanism
- "Every conversation produces clinically-coded encounter documentation" — this is the ACCESS differentiator
- Voice pipeline enables documentation from natural conversation, not forms
- Colorado AI Act compliance (HIGH-RISK classification, human-in-the-loop)
- LCA entity structure (Subchapter T cooperative taxation)

### Colorado Employee Ownership Tax Credit
- Apply immediately for $40K tax credit
- LCA formation (March 10) is the trigger event
- 75% tax credit for cooperative conversions also relevant for Legacy Exit pipeline

---

## 5. SOCIAL MEDIA GEM

### New Content Pillar: Sage
Add a 5th content pillar:

5. **The technology:** "Sage advice from co-op.care." One button. One conversation. No app to learn, no forms to fill out, no navigation to figure out. Just talk. Sage handles the rest.

### What TO post (additions)
- "What if caring for your aging parent started with one conversation?"
- "No app to learn. No forms. No navigation. Just talk to Sage."
- "Every companion care visit generates clinical documentation. Automatically."
- "Community infrastructure, not a product. Sponsored by your local health network."
- The Seedling → Rooted → Canopy progression as community recognition

### What NOT to post (additions)
- No Gemini/Google AI details (keep it magical, not technical)
- No Omaha System coding details (internal clinical framework)
- No voice pipeline architecture
- No Care Tier exact thresholds or multipliers

---

## SUMMARY OF ALL CHANGES SINCE MARCH 5

| Change | Details |
|--------|---------|
| Entity type | LLC → LCA (filed March 10, 2026) |
| Founder credibility | Corrected: MD with clinical training, NOT orthopedic surgeon |
| CMS ACCESS | Skipped April 1 Cohort 1, targeting Jan 2027 Cohort 2 |
| Approach | Approach C: W-2 from Day 1, no 1099 bridge |
| Product vision | Sage = the entire app, not a chatbot widget |
| Tagline | "Sage advice from co-op.care" |
| Business model | Sponsored by health networks + school systems |
| Voice pipeline | Google Cloud STT → Gemini Flash → Omaha auto-coding |
| Care Tiers | Seedling → Rooted → Canopy (rolling 12-month hours) |
| CareOS build | 95+ modules, 5,400+ lines, build clean |
| Backend handoffs | v1-v4, 18 endpoints total for Jacob |
| LCA attorney | Jason Wiener (cooperative law, Subchapter T, SEC questions) |
| Payroll | Deferred to Month 2-3 (Gusto+Mercury or Justworks) |
| Deployment | Railway chosen (HIPAA BAA at $1,000/mo when needed) |
