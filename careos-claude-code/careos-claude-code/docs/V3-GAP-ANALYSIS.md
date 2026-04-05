# co-op.care v3 — Complete Feature Gap Analysis & Build Instructions
# Based on audit of the uploaded codebase against the full spec

---

## WHAT'S BUILT AND WORKING (preserve all of this)

### App Shell (App.tsx — 165 lines) ✅
- Hash routing: #website, #master, #product, #enzyme, #ubi, #admin, #dashboard
- Global ShareButton (fixed bottom-left, copy link + email)
- GlobalFooter with cross-navigation, both founders, disclaimer
- Stakeholder nav bar (hidden on public site, dashboard, admin)
- AIChat component (Gemini-powered floating chat)
- Mobile responsive throughout

### Website (Website.tsx — 656 lines) ✅ Mostly Complete
- Hero with 4 clickable stats (63M, 27hrs, $7,200, 77%)
- Audio pitch button with SpeechSynthesis
- AI Prompt section (copyable ChatGPT/Claude prompt for caregivers)
- Conductor section with 4 cards
- CII Quick Check (3 sliders, zone scoring, CTA)
- Five Sources (expandable cards with detail + examples)
- Platform UX tabs (5 terminal previews including Time Bank economics)
- Flywheel (6 clickable phases with revenue/member data)
- Savings Calculator (3 sliders: pro hours, TB hours, earned vs bought)
- Service tiers (Companion/Standard/Comprehensive)
- FAQ (7 expandable questions)
- Dual-path email capture (join/start) with form fields
- Footer with both founders + disclaimer
- Conductor quote block exists ("orchestra" reference found)
- LMN moat callout exists

### ProductMap (ProductMap.tsx — 330 lines) ✅ Solid
- Phase filter tabs with narration
- SpeechSynthesis player (play/pause/speed)
- Accelerator cards (~20 with expandable detail)
- Phase-reactive summary stats
- Email capture
- Valuation references

### Enzyme (Enzyme.tsx — 208 lines) ✅ Good
- 11 principles (including #11 Time Bank Liquidity with Vampire Port)
- 34 nudges with behavioral economics citations
- 8-step viral cascade
- SpeechSynthesis narration
- Email capture

### CareUBI (CareUBI.tsx — 251 lines) ✅ Good
- 6 thesis sections with NBER data
- Comparison table (Cash UBI vs Care UBI)
- 5 grant language blocks (MAHA, ACL, RSF, Legislature, Media)
- Communication map with sendTo lists
- Email capture

### Synthesis (Synthesis.tsx — 228 lines) ✅ Structure Good
- 4 throughlines (Zero-CAC, Tax Moat, Margin Engine, Viral Labor)
- 3 pillars × 8 nodes = 24 feature nodes
- Interactive: click throughline → highlights connected nodes, dims others
- Node click → mailto with node name
- 5-step flywheel at bottom

### New in v3 ✅
- Dashboard.tsx — Conductor Dashboard prototype (mock data, schedule, care team, CII status)
- Admin.tsx — Lead management portal (fetches from /api/leads)
- AIChat.tsx — Gemini-powered floating chat with co-op.care system prompt
- server.ts — Express + SQLite lead capture + API routes
- Google Sheets integration guide

---

## GAPS TO FILL (organized by priority)

### PRIORITY 1: SYNTHESIS DEEP EXPANSION

The Synthesis is the strategic brain of the entire suite but right now each node is a single sentence. Every node needs to become a rich, expandable card showing the full depth from our spec.

**Current state:** Each node shows name + one-line description. Click → mailto.

**Target state:** Each node shows name + one-line description. Click → EXPANDS to show:
1. **What it does** (2-3 sentences)
2. **How it works technically** (architecture/integration)
3. **Omaha System mapping** (which of the 42 problems it touches)
4. **ICD-10 crosswalk** (which diagnosis codes justify it clinically)
5. **Revenue/metric** (what it earns or measures)
6. **Connected nodes** (which other Synthesis nodes it feeds)

Here is the FULL content for every node. Add this as expandable detail when a node is clicked:

**psy-activation — Activation Energy**
```
WHAT: The first Time Bank task must require <15 minutes, zero travel, zero skill. "Call Mr. Torres for 15 minutes." The acceptance rate of this micro-task determines the health of the entire system.
HOW: Push notification with task card. One-tap accept. Phone number auto-revealed via Twilio. Timer starts on call connect. Auto-credit on call end.
OMAHA: #06 Social Contact — phone companionship directly addresses social isolation. KBS Behavior subscale improves with each completed call.
ICD-10: Z60.2 (Problems related to living alone), Z60.4 (Social exclusion)
METRIC: First-task acceptance rate (target >60%), time-to-first-task (<24 hours from signup)
FEEDS: psy-streak (first task starts the streak), prod-timebank (first credit earned)
```

**psy-endowment — Endowment Effect**
```
WHAT: The moment membership confirms, the Time Bank balance animates from 0 to 40 hours. The psychological frame: "You HAVE 40 hours of community care" — not "you CAN REQUEST up to 40 hours." Wealth framing, not allowance framing.
HOW: Stripe webhook → PostgreSQL balance update → WebSocket push → frontend counter animation.
OMAHA: #13 Caretaking/Parenting — the 40-hour floor reduces caregiver anxiety at the structural level.
ICD-10: Z63.6 (Dependent relative needing care at home), Z73.0 (Burnout)
METRIC: First-spend latency (how fast do new members use hour #1?), hoarding rate (do they spend or save?)
FEEDS: psy-activation (the floor enables the first micro-task), mac-ubi (the 40-hour floor IS the Care UBI)
```

**psy-proximity — Propinquity Effect**
```
WHAT: Time Bank matching weights proximity above all other factors. <0.5 mi = 3× score boost. 0.5-1.0 mi = 2×. 1-2 mi = 1×. Beyond 2 mi = remote tasks only. The closer the neighbor, the more likely they say yes, the more likely they become a friend, the more likely they keep helping.
HOW: PostgreSQL geospatial query: geo::distance(user.location, task.location). Real-time recalculation. Results sorted by proximity-weighted match score.
OMAHA: #04 Neighborhood Safety, #03 Residence — proximity matching builds neighborhood-level social infrastructure.
ICD-10: Z59.89 (Problems related to housing and economic circumstances)
METRIC: Average match distance, completion rate by distance bracket, repeat-pair rate (same helper↔family)
FEEDS: psy-trust (proximity builds familiarity), mac-viral (neighbors recruit neighbors)
```

**psy-loss — Loss Aversion**
```
WHAT: Two loss mechanisms. (1) Credit expiry: earned credits expire after 12 months. 30-day warning: "4.5 hours expire. Use them or donate to Respite." (2) LMN expiry: "Your LMN expires in 30 days. Without renewal, you lose $6,200/year in HSA tax savings." The LMN loss is the retention moat — nobody voluntarily gives up 28-36% tax savings.
HOW: PostgreSQL scheduled jobs checking expiry dates. Tiered notifications (60/30/7 days). Auto-donation to Respite Fund on expiry.
OMAHA: #35 Nutrition, #37 Physical Activity, #25 NMS — every LMN-eligible service has an Omaha problem justification that expires with the LMN.
ICD-10: All ICD-10 codes on the LMN become inactive on expiry. Renewal re-activates them.
METRIC: Spend velocity increase in final 30 days, LMN renewal rate (target >90%), churn rate of lapsed LMN members
FEEDS: prod-renewal (the renewal workflow), mac-retention (the financial moat), mac-tax (the 28-36% savings)
```

**psy-identity — Self-Verification Theory**
```
WHAT: During Time Bank onboarding, members complete "I enjoy..." (NOT "I'm willing to..."). Retired teacher → tutoring. Car enthusiast → driving. Gardener → yard work. The algorithm matches identity to task. People who help in alignment with their identity help more, longer, and with higher satisfaction.
HOW: Skills array in PostgreSQL. Matching query weights taskType ∈ user.skills by 2×. Post-task satisfaction tracked per skill type — algorithm learns.
OMAHA: #07 Role Change — the Conductor's identity transforms progressively through skill-aligned tasks and Conductor Certification.
ICD-10: Z56.9 (Unspecified work-related problem) — caregiver role strain is a diagnosable condition.
METRIC: Satisfaction by skill alignment, repeat acceptance by skill type, identity persistence over time
FEEDS: prod-cert (Conductor Certification formalizes the identity shift), psy-streak (aligned tasks sustain streaks)
```

**psy-trust — Signaling Theory**
```
WHAT: Every Time Bank profile shows: ✓ Background Checked (with date), star rating (1-5 with count), "Member since [date]", neighborhood name. For worker-owners: W-2 Employee-Owner badge + equity tier. Trust signals reduce the perceived risk of letting a stranger help your mother.
HOW: Checkr/Sterling API for background checks. Status in PostgreSQL. Badge auto-rendered. Rating = rolling 90-day weighted average.
OMAHA: #06 Social Contact (trust enables interaction), #15 Abuse prevention (background checks are a safeguard)
ICD-10: T74.01XA (Adult neglect prevention), T76.01XA (Suspected abuse — screening trigger)
METRIC: Task acceptance with/without visible badge (A/B test), trust score × match success correlation
FEEDS: prod-timebank (trust enables the first exchange), psy-activation (trust reduces activation energy)
```

**psy-streak — Goal Gradient Effect**
```
WHAT: "You've helped someone 4 weeks in a row! 🔥" Streaks are weekly — any task in a 7-day window counts. Milestones at 4, 8, 12, 26, 52 weeks unlock community champion recognition. The coffee card effect: people accelerate effort as they approach the next milestone.
HOW: PostgreSQL currentStreak + longestStreak. Cron job Monday 6 AM: did user complete a task in prior 7 days? Yes → increment. No → reset. Push notification on milestones.
OMAHA: All intervention categories — streaks measure sustained helping behavior across all Omaha problem areas.
ICD-10: Not directly mapped — streaks are a behavioral metric, not a clinical one.
METRIC: Week-over-week retention (streakers vs non-streakers), average streak length, streak × referral correlation
FEEDS: psy-cascade (long-streak members are most likely to refer), mac-turnover (streak culture retains the community)
```

**psy-cascade — Viral Loop**
```
WHAT: After the 3rd completed task: "Know someone who'd be great at this? Invite a neighbor → you both get 5 bonus hours." The referral is a graph edge: RELATE user:lisa → referred → user:karen. The cascade visualization shows the chain: your help → their help → downstream impact across households.
HOW: Referral tracking as PostgreSQL graph. Bonus hours on referee's first COMPLETED task (not signup). Cascade viz: SELECT →helped→*→helped→* FROM user:lisa — multi-hop graph traversal.
OMAHA: #05 Communication with community resources — the referral network IS the community resource infrastructure.
ICD-10: Not directly mapped — virality is a distribution metric.
METRIC: Referral rate after 3rd task, referral conversion, cascade depth (average chain length), viral coefficient (referrals per member)
FEEDS: mac-viral ($0 CAC), mac-ubi (each new member expands the Care UBI pool), prod-timebank (more members = better matching = lower match time)
```

**prod-discharge — Discharge Concierge**
```
WHAT: BCH discharge → co-op.care care team assembled within 24-48 hours. Zero-CAC acquisition at the point of maximum family vulnerability and motivation.
HOW: BCH Epic sends ADT via HL7 v2 or FHIR R4 Encounter. Aidbox receives, extracts ICD-10 codes, maps to Omaha problems via crosswalk engine, triggers onboarding workflow in PostgreSQL.
OMAHA: ICD-10 → Omaha crosswalk auto-generates care plan. I50.9 → #27 Circulation. E11.9 → #35 Nutrition. Z87.39 → #25 NMS (fall history). F03.90 → #21 Cognition.
ICD-10: All discharge diagnosis codes. The crosswalk handles the translation.
METRIC: Time from discharge to care team assembly (target <48hr), 30-day readmission rate (target <10% vs BCH baseline 15.4%), conversion rate (discharge → founding family)
FEEDS: mac-bch ($364K Y1 revenue), psy-activation (discharge family's first Time Bank task), all prod- nodes (discharge is entry to entire ecosystem)
```

**prod-respite — Respite Emergency Fund**
```
WHAT: Any family in crisis gets 48 hours of care immediately, regardless of balance. Funded by: $3 from every $15/hr purchase, 0.1 hrs auto-donated per earned hour (Respite Default nudge), expired credits.
HOW: PostgreSQL singleton table. Auto-approve if balance >100 hours. Coordinator approval if <100. Dispatch: nearest worker-owner + Time Bank neighbor.
OMAHA: Crisis triggers map to multiple problems simultaneously: #13 Caretaking (caregiver hospitalized), #25 NMS (fall), #27 Circulation (cardiac), #21 Cognition (acute confusion).
ICD-10: Emergency diagnosis codes from ER/hospital admission. W19.XXXA (fall), I50.9 (heart failure), R41.0 (disorientation).
METRIC: Response time (<4 hours), fund balance, disbursement frequency, crisis → membership conversion rate
FEEDS: mac-ubi (the safety net that makes Care UBI real), psy-endowment (crisis families get immediate hours), psy-cascade (crisis stories are the most powerful recruitment)
```

**prod-timebank — Time Bank Core**
```
WHAT: Double-entry ledger of earned, spent, bought, donated, expired hours. The engine behind the Care UBI. Every transaction is Omaha-coded for clinical outcome measurement.
HOW: PostgreSQL timebank_account + timebank_tx + timebank_task. State machine: Posted → Matched → Accepted → In Progress (GPS check-in) → Completed (GPS check-out) → Rated → Credits transferred. Match latency SLA: <4 hours.
OMAHA: Every task type auto-maps to an Omaha intervention. Meals → #28 Digestion-hydration. Rides → #05 Communication. Companionship → #06 Social Contact. This makes community care clinically documentable.
ICD-10: Not directly — Time Bank transactions are coded at the Omaha level, which bridges to ICD-10 via the crosswalk when needed for PACE or CMS reporting.
METRIC: Match latency, hours earned/spent/bought per week (velocity), active members per ZIP code, hours-to-match ratio
FEEDS: All psy- nodes (Time Bank IS the behavioral engine), mac-ubi (Time Bank IS the Care UBI), mac-turnover (Time Bank displaces paid hours, reducing cost)
```

**prod-lmn — LMN Marketplace**
```
WHAT: Physician-governed marketplace making community wellness HSA/FSA eligible. The tax moat. Dr. Emdur writes one LMN covering all qualifying services for a family.
HOW: Aidbox stores LMN as FHIR DocumentReference with ICD-10 codes, qualifying conditions, approved services, e-signature, expiration. Marketplace UI filters by member's LMN conditions.
OMAHA: #25 NMS → tai chi (fall prevention). #35 Nutrition → RD counseling. #27 Circulation → cardiac rehab. #37 Physical Activity → fitness programs. #21 Cognition → cognitive stimulation. Each Omaha problem maps to qualifying wellness services.
ICD-10: Z87.39 (falls) → tai chi. E11.9 (diabetes) → nutrition. I50.9 (CHF) → cardiac rehab. F03.90 (dementia) → cognitive programs. The crosswalk drives the Marketplace filtering.
METRIC: LMN activation rate, annual HSA savings per family, marketplace booking volume, provider referral revenue (8-12%)
FEEDS: mac-tax (28-36% savings), mac-retention (LMN is the moat), prod-renewal (annual renewal cycle)
```

**prod-renewal — Annual LMN Renewal**
```
WHAT: Automated 12-month renewal cycle. Notifications at 60/30/7 days. Auto-schedules telehealth with Dr. Emdur via Zoom. CRI reassessment updates Omaha KBS ratings. Renewed LMN re-activates HSA eligibility.
HOW: Aidbox LMN expirationDate. PostgreSQL scheduled jobs. Zoom API for telehealth scheduling. CRI reassessment during telehealth.
OMAHA: KBS reassessment across all LMN-qualifying problems. Knowledge/Behavior/Status scores at 0/6/12 months create longitudinal outcome data.
ICD-10: All LMN ICD-10 codes reviewed and updated during renewal. New diagnoses added, resolved ones removed.
METRIC: Renewal rate (target >90%), lapse-to-churn correlation, KBS improvement between renewals
FEEDS: mac-retention (renewal IS retention), psy-loss (fear of losing tax savings drives renewal), mac-val (longitudinal KBS data feeds actuarial models)
```

**prod-wearable — Wearable Integration**
```
WHAT: Apple Watch → continuous passive monitoring. Resting HR, HRV, sleep, steps, SpO2. Personal baselines. Anomaly detection at >2 standard deviations from 30-day rolling average.
HOW: Apple HealthKit API → CareOS API → Aidbox as FHIR Observations (LOINC-coded). PostgreSQL for operational dashboard. Anomaly detection triggers alerts.
OMAHA: HR/HRV → #27 Circulation. SpO2 → #26 Respiration. Sleep → #36 Sleep/Rest. Steps → #37 Physical Activity + #25 NMS.
ICD-10: Anomalies generate clinical alerts mapped to ICD-10: elevated HR → I49.9 (cardiac arrhythmia workup). Low SpO2 → J96.10 (respiratory failure). Sleep decline → G47.00 (insomnia).
LOINC: HR = 8867-4, HRV = 80404-7, Sleep = 93832-4, Steps = 55423-8, SpO2 = 2708-6.
METRIC: Anomalies detected, true positive rate, time from anomaly to intervention, hospitalizations predicted
FEEDS: prod-predictive (wearable data IS the predictive model's primary input), mac-pace (wearable data enables PACE margin)
```

**prod-predictive — Predictive Hospitalization**
```
WHAT: ML model predicting hospitalization 72-96 hours in advance. Features: wearable trends + worker care notes (NLP) + Time Bank neighbor observations + CRI scores + medication adherence.
HOW: Feature engineering from Aidbox (clinical) + PostgreSQL (operational). Model: XGBoost or time-series transformer. Daily risk score 0-100. Score >70 → Medical Director notification + additional worker visit + Conductor alert.
OMAHA: UTI prediction: #30 Urinary + #36 Sleep + #21 Cognition + #27 Circulation. Fall prediction: #25 NMS + #37 Physical Activity + #42 Medication. Each prediction maps to Omaha problems for structured intervention.
ICD-10: Predicted diagnoses trigger pre-emptive documentation. "At risk for UTI" → N39.0. "At risk for fall" → Z91.81. Pre-emptive ICD-10 coding enables early intervention billing.
METRIC: Prediction accuracy (sensitivity/specificity), hospitalizations avoided, PACE savings per avoided event ($16,037)
FEEDS: mac-pace (avoided hospitalizations = pure margin), mac-val (predictive model is the IP), prod-wearable (wearable data is primary input)
```

**prod-cert — Conductor Certification**
```
WHAT: Modules: Safe Transfers (2hr/$150), Bathing (2hr/$150), Medication Management (3hr/$200), Dementia Communication (4hr/$250), Fall Prevention (2hr/$150), Emergency Response (2hr/$150), Comprehensive (full day/$750). All HSA/FSA eligible via LMN. 5 Time Bank bonus hours per module completed.
HOW: LMS integration or custom module tracker. Video + in-person hybrid. Competency assessment. Certificate generation. PostgreSQL tracks modules. Aidbox stores as FHIR Procedure.
OMAHA: Each module → Omaha Intervention Scheme "Teaching/Guidance/Counseling." Safe Transfers → #25 NMS. Medication → #42 Prescribed Medication. Dementia → #21 Cognition. KBS Knowledge subscale improves measurably after each module.
ICD-10: Training justification maps to caregiver burden: Z63.6 (dependent relative), Z73.0 (burnout), Z56.3 (stressful work schedule).
METRIC: Module completion rate, KBS Knowledge improvement pre/post, Conductor confidence score, CII reduction correlated to certification level
FEEDS: psy-identity (certification formalizes identity shift), psy-endowment (5 bonus hours per module), mac-bch (certification revenue stream)
```

**mac-bch through mac-turnover:** These are OUTPUTS — they don't need deep expansion because they're metrics/financials that the product and psychology nodes generate. The Synthesis already displays them correctly as the "output" pillar. But each should show its source formula when clicked:

```
mac-bch: $364K = BCH retainer ($30K) + private pay ($210K) + memberships ($4K) + CII/CRI ($45K) + Conductor Cert ($75K)
mac-viral: $0 CAC = BCH discharge + BVSD employer + faith community + wellness referral + Time Bank word-of-mouth
mac-tax: 28-36% = IRS Pub 502 HSA/FSA deduction rate on LMN-eligible services. Family spending $20K → saves $6-7.2K.
mac-retention: >90% LMN renewal rate. Leaving = losing tax advantage. No competitor has physician-governed LMN.
mac-pace: $1.25M = 40 enrollees × $2,600/mo × 12 - (40 × $1,800/mo × 12) = $800 spread × 40 × 12
mac-val: $75-150M+ = proprietary Omaha+wearable dataset + actuarial data + federation licenses + >90% retention
mac-ubi: 40 hrs/yr × membership base = community care floor. No government funding. Self-sustaining via reciprocity + $15/hr.
mac-turnover: $25-28/hr + equity ($52K/5yr) + health insurance + democratic governance = <15% vs 77% industry
```

---

### PRIORITY 2: DASHBOARD EXPANSION

The Dashboard is the most important page for actual users but currently has only mock data and is missing critical sections.

**Missing from Dashboard (add these):**

1. **Wearable Vitals Section** — Mock data showing: Resting HR 68 bpm (normal), Sleep 6.2 hrs (↓ flagged), HRV 24ms (stable), Steps 2,340 (↓ from 3,100 avg). Show as small cards with trend arrows. Use sparkline charts (Recharts). Anomaly highlighting in red.

2. **Care Timeline** — Chronological feed of all care interactions. "Maria G. checked in at 9:00 AM. Notes: 'Good appetite at lunch.' — 12:45 PM. Janet R. delivered meals — 11:30 AM. Time Bank credit: +1.5 hrs." Each entry shows who, what, when, notes. This is THE core view the Conductor uses.

3. **Comfort Card Summary** — Monthly breakdown: HSA: $420 (professional care) + $60 (tai chi) + $120 (nutrition). Employer: $5 (PEPM). Time Bank: $0 (Janet's meals). Private Pay: $308. Total: $913. Tax savings: $180. Show as a mini table with payment source colors matching brand.

4. **LMN Status Widget** — "Active · Expires Dec 2026 · 12 services eligible · Annual HSA savings: $6,211 · Tap to view." If expiring soon, show amber/red warning.

5. **Messaging** — Simple message list: "Maria G.: 'Mom had a good day today' — 2:45 PM" with reply button. Doesn't need real backend yet — mock data with send action → mailto.

6. **Time Bank Detail** — Beyond just balance, show: Membership floor remaining, earned this month, bought this month, deficit available, current streak, impact score. Show the "WHEN CREDITS RUN OUT" options.

---

### PRIORITY 3: SYNTHESIS → PAGE NAVIGATION

When a Synthesis node is clicked, instead of (or in addition to) opening mailto, it should be able to NAVIGATE to the relevant section of the corresponding page:

```
psy-* nodes → Navigate to #enzyme (Enzyme Thesis)
prod-* nodes → Navigate to #product (Product Strategy Map)
mac-* nodes → Navigate to #ubi (Care UBI Thesis)
```

Add a small "Explore →" button on each expanded node card that does:
`window.location.hash = targetPage`

This makes the Synthesis the HUB that routes stakeholders to the right deep-dive.

---

### PRIORITY 4: OMAHA SYSTEM REFERENCE PAGE

Add a new page accessible from the Synthesis: `#omaha` — an interactive reference showing the complete 42-problem taxonomy with ICD-10 crosswalk.

Features:
- 4 domain tabs (Environmental, Psychosocial, Physiological, Health-Related Behaviors)
- Each problem as an expandable card showing: definition, co-op.care relevance, ICD-10 codes, LMN eligibility, Omaha KBS rating scale explanation
- Search/filter by: domain, LMN eligible, care source (Time Bank / professional / wellness)
- Visual crosswalk: click an Omaha problem → see ICD-10 codes → see qualifying wellness services → see HSA savings estimate

This page serves: Medical Director (clinical reference), grant applications (clinical rigor documentation), CU Boulder (research collaboration), and internal product team (what to build next).

---

### PRIORITY 5: AIChat Enhancement

The AIChat component uses Gemini but the system prompt is too generic. Update the system instruction to include:

```
You are the co-op.care AI Navigator built on the Omaha System clinical taxonomy. When a family caregiver describes their situation:

1. Map their concerns to Omaha System problems (42 problems across 4 domains: Environmental, Psychosocial, Physiological, Health-Related Behaviors)
2. Suggest which of the 5 Sources of Care could help (Conductor training, Time Bank neighbors, W-2 professionals, skilled providers, community wellness)
3. Explain which services might be HSA/FSA eligible under a Letter of Medical Necessity
4. If they're in or near Boulder, CO — invite them to join as a founding family at co-op.care
5. If they're elsewhere — explain the Care UBI model and invite them to the Federation waitlist

Key facts:
- 63M US family caregivers, average 27 hrs/week unpaid care
- co-op.care provides 40 hours/year of community care through the Time Bank as a Care UBI floor
- Time Bank: earn hours by helping, buy at $15/hr, or use membership-included hours
- LMN makes yoga, tai chi, nutrition, fitness HSA/FSA eligible (28-36% tax savings)
- Worker-owners earn $25-28/hr + equity + health insurance (<15% turnover)
- Medical Director: Josh Emdur, DO (BCH hospitalist, 50-state licensed)
- Founder: Blaine Warkentine, MD (blaine@co-op.care, 484-684-5287)

Be warm, specific, and actionable. Always end with a clear next step.
```

---

### PRIORITY 6: ADMIN ENHANCEMENTS

Add to Admin.tsx:
- CII scores column (if member completed quick-check during signup)
- "Source" column (which page they came from: website, discharge, employer, referral)
- "Convert to Member" button (creates full account, triggers onboarding flow)
- Basic analytics: signups per week, CII distribution of leads, conversion rate
- Export to CSV button

---

## CONFIG CLEANUP (same as before — Gemini keeps reverting)

Every time you re-upload to Gemini, these get reverted. Apply them:

1. **package.json:** Remove @google/genai, @tailwindcss/vite, lucide-react, express, dotenv, better-sqlite3, motion, autoprefixer, tailwindcss, tsx, @types/express. Keep only react, react-dom, vite, @vitejs/plugin-react, typescript, @types/node.

2. **vite.config.ts:** Remove tailwind plugin, Gemini API key define, path alias, HMR override.

3. **src/index.css:** Remove `@import "tailwindcss"`.

4. **index.html:** Add SEO meta tags, OG tags, favicon, font preconnect.

NOTE: The AIChat component imports @google/genai. If you want to keep the AI chat, keep that ONE dependency. But the rest must go.

---

## SUMMARY TABLE

| Feature | Status | Priority | Lines Needed |
|---------|--------|----------|-------------|
| Synthesis node expansion (24 nodes × rich content) | Missing | P1 | ~400 lines added to Synthesis.tsx |
| Dashboard: wearable vitals | Missing | P2 | ~60 lines |
| Dashboard: care timeline | Missing | P2 | ~80 lines |
| Dashboard: Comfort Card summary | Missing | P2 | ~50 lines |
| Dashboard: LMN status widget | Missing | P2 | ~30 lines |
| Dashboard: messaging mock | Missing | P2 | ~60 lines |
| Dashboard: Time Bank detail | Missing | P2 | ~40 lines |
| Synthesis → page navigation | Missing | P3 | ~30 lines |
| Omaha System reference page | Missing | P4 | ~300 lines (new file) |
| AIChat enhanced system prompt | Partial | P5 | ~20 lines changed |
| Admin: CII column + analytics | Missing | P6 | ~80 lines |
| CII visual progress bar on Website | Missing | Low | ~10 lines |
| Config cleanup | Needs re-apply | Every build | config files |

**Total estimated new code: ~1,160 lines across 4-5 files**
**Current codebase: ~1,800 lines across 8 files**
**Post-enhancement: ~2,960 lines — a 64% increase in feature depth**
