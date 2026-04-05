# CareOS: Definitive Product Requirements Document (PRD)

**WHY - VISION & PURPOSE**

**What problem are you solving and for whom?**\
We are solving the catastrophic burnout and financial ruin faced by America's 63 million unpaid family caregivers. The current system forces families to choose between quitting their jobs to provide care or paying exorbitant fees to traditional home care agencies that suffer from 77% annual caregiver turnover. The primary target is the "Conductor"—the family member (usually a daughter or spouse) who orchestrates care, manages medications, and coordinates appointments while balancing their own career and family.

**What does your application do?**\
CareOS is a worker-owned home care cooperative platform that integrates five sources of care into a single, seamless dashboard:

1. The Conductor (trained and empowered family caregiver)
2. Time Bank Neighbors (community members trading hours)
3. W-2 Professional Caregivers (worker-owners with equity)
4. Skilled Providers (RNs, PTs, OTs)
5. Community Wellness (HSA/FSA eligible programs)\
   The platform manages scheduling, clinical data tracking, Time Bank ledgers, and automated tax-advantaged financial reconciliation.

**Who will use it?**

- **The Conductor:** Family caregivers managing the care logistics.
- **Time Bank Neighbors:** Community members earning and spending hours for non-medical tasks (meals, rides, companionship).
- **W-2 Professional Caregivers:** CNAs and experienced caregivers who own the cooperative, earning $25-28/hr + equity.
- **Wellness Providers:** Local businesses (yoga studios, nutritionists) offering HSA-eligible services.
- **Employers/HR:** Sponsoring PEPM benefits to reduce employee absenteeism.
- **Community Leaders:** Faith leaders and local government building care infrastructure.

**Why will they use it instead of alternatives?**

- **Zero Handoffs:** As needs escalate from companionship to skilled nursing, the family stays on the same platform.
- **The LMN Moat:** Our Medical Director issues a Letter of Medical Necessity (LMN) that makes community wellness programs HSA/FSA eligible, saving families 28-36% in taxes. Leaving the co-op means losing this tax advantage.
- **Worker Ownership:** Caregivers have &lt;15% turnover because they own the agency, ensuring relationship continuity for the patient.
- **The Comfort Card:** A $59/month subscription that is completely FREE if the user contributes just 1 hour to the Time Bank per month.

---

**WHAT - CORE REQUIREMENTS**

**What must your application do?**

- System must provide a unified Conductor Dashboard showing real-time care timelines, wearable vitals, and caregiver notes.
- System must administer the Caregiver Intensity Index (CII) assessment (12 dimensions) to quantify caregiver burden.
- System must manage a double-entry Time Bank ledger with a half-life decay mechanism (points drop off over time if inactive to encourage liquidity).
- **System must implement the Omaha System ↔ ICD-10 Crosswalk Engine to auto-generate LMNs from hospital discharge codes.**
- **System must track clinical outcomes using the Omaha System's KBS (Knowledge, Behavior, Status) 1-5 rating scale at intake, 30, 60, and 90 days.**
- **System must auto-code Time Bank tasks to Omaha System problems (e.g., "Meals Delivered" maps to #35 Nutrition).**
- System must process Comfort Card subscriptions ($59/mo, waived with 1 hr/mo Time Bank contribution).
- System must automatically deduct a "Respite Default" (0.1 hours donated to the Respite Emergency Fund for every 1 hour earned in the Time Bank).
- System must split $15/hr Time Bank cash purchases into $12 for coordination/platform and $3 for the Respite Emergency Fund.

**What actions need to happen?**

- **Hospital Discharge to LMN:** ICD-10 codes from discharge are ingested, mapped to Omaha problems, and output as a physician-signed LMN for HSA eligibility.
- **Time Bank Matching:** Neighbors request tasks; the system matches based on proximity and skills; hours are exchanged upon GPS-verified completion.
- **Conductor Certification:** Family caregivers complete training modules (e.g., Safe Transfers) to earn Time Bank bonus hours.
- **KBS Outcome Tracking:** Professionals and Conductors log observations that update the KBS scores for specific Omaha problems.

**What should the outcomes be?**

- Families save $6,000+ annually through HSA/FSA tax advantages.
- Caregiver burden (CII score) decreases from the Red Zone to the Green Zone.
- Time Bank liquidity remains high due to the half-life decay and Respite Default mechanisms.
- Hospital readmissions drop due to predictive anomaly detection via wearables and continuous KBS tracking.

---

**HOW - PLANNING & IMPLEMENTATION**

**What are the required stack components?**

- **Frontend:** React 18+, Vite, Tailwind CSS, TypeScript, Framer Motion.
- **Backend:** Node.js, Express/Fastify.
- **Operational Database:** PostgreSQL (graph database for Time Bank ledgers, matching, and user relationships).
- **Clinical Database:** Aidbox (FHIR-compliant store for QuestionnaireResponses, Observations, ConceptMaps, and CodeSystems).
- **Integrations:** Stripe (Comfort Card/payments), Apple Health API (wearables), Google OAuth.

**What are the system requirements?**

- **Security:** HIPAA compliance required for Aidbox clinical data. JWTs stored in Secure, HttpOnly cookies.
- **Reliability:** Persistent Event Sync Layer (Transactional Outbox) to guarantee at-least-once delivery between PostgreSQL and Aidbox. No fire-and-forget Redis Pub/Sub for clinical data.
- **Scalability:** Must support multi-tenant Federation architecture in Phase 3 (deploying the co-op model to other cities).

**What are the key user flows?**

1. **The Comfort Card Onboarding:** User lands on site → Selects Comfort Card ($59/mo) → Agrees to 1 hr/mo Time Bank pledge to waive fee → Completes mini-CII assessment → Enters dashboard.
2. **The LMN Generation Pipeline:** User uploads hospital discharge (ICD-10) → Crosswalk Engine maps to Omaha System → Generates Care Plan → Medical Director signs LMN → User accesses HSA-eligible Wellness Marketplace.
3. **Time Bank Loop:** User completes 1 hr task → Earns 0.9 hrs (0.1 hr auto-diverted to Respite Default) → Balance subject to half-life decay → User spends hours on respite care or wellness transport.
4. **KBS Assessment Flow:** 30-day trigger → Conductor prompted on dashboard → Rates Knowledge, Behavior, Status (1-5) on active Omaha problems → Data syncs to FHIR Observation.

**What are the core interfaces?**

- **Public Website:** Pitch, AI Co-Pilot prompt, Flywheel strategy (hidden behind toggle), Role selection (Conductor, Neighbor, Pro, Wellness, Employer, Leader).
- **Conductor Dashboard:** The central hub. Shows Care Timeline, Clinical Data (CII, KBS trends), Conductor Training progress, and Time Bank wallet.
- **LMN Marketplace:** E-commerce style interface for booking HSA-eligible community wellness programs.
- **Admin/Michaelis-Menten Dashboard:** Tracks Time Bank liquidity, match latency, and Respite Emergency Fund balances.

---

**BUSINESS REQUIREMENTS**

**What are your access and authentication needs?**

- **Roles:** Conductor (Family), Time Bank Member, W-2 Professional, Wellness Provider, Employer HR, Medical Director, System Admin.
- **Auth:** Google OAuth for quick onboarding, transitioning to secure JWTs for HIPAA-compliant dashboard access.

**What business rules must be followed?**

- **Omaha Taxonomy:** ALL care interactions (professional and volunteer) MUST map to the 42 Omaha System problems.
- **Time Bank Half-Life:** Time Bank hours do not have a hard expiration date, but decay over time if the user is inactive, preventing hoarding.
- **Respite Emergency Fund:** Funded by the 0.1 hr Respite Default and the $3 split from $15/hr purchases. Provides 48 hours of free crisis care.
- **LMN Rules:** LMNs must be renewed annually based on KBS outcome data proving efficacy.
- **Data Sync:** Aidbox is the source of truth for clinical data (FHIR); PostgreSQL is the source of truth for operational/graph data. They must sync via a transactional outbox.

**What are your implementation priorities?**

- **Phase 1 (High):** User Auth, Conductor Dashboard, Time Bank Core (ledger + half-life + matching), Comfort Card Stripe Integration, Mini/Full CII Assessment, **Omaha ↔ ICD-10 Crosswalk Engine**.
- **Phase 2 (Medium):** KBS Outcome Tracking, LMN Generation, Wellness Marketplace, Conductor Certification modules.
- **Phase 3 (Low/Future):** Wearable Apple Health integration, Predictive Hospitalization ML, PACE Data Exchange, Federation Multi-Tenancy.

---

**TECHNICAL ARCHITECTURE & FILE CREATION PLAN**

**Data Flow Architecture:**

- **Crosswalk Pipeline:** Client uploads ICD-10 → Fastify Omaha Module → Maps to Omaha Problem → Generates Care Plan → Triggers LMN Module → Syncs to Aidbox as `ConceptMap` and `CarePlan` FHIR resources.
- **KBS Sync Path:** Conductor submits KBS 1-5 rating → Fastify Assessment Module → Writes to PostgreSQL → Syncs to Aidbox as a FHIR `Observation` linked to a `Condition` (Omaha Problem).

**Key Validation Rules and Constraints:**

| Entity | Rule | Constraint |
| --- | --- | --- |
| KBS Assessment | Score bounds | Knowledge (1-5), Behavior (1-5), Status (1-5) |
| TimeBankTask | Auto-coding | Must contain a mapped omahaProblemId |
| CrosswalkMap | ICD-10 to Omaha | 1-to-many or 1-to-1 mapping enforcement |

**FHIR Resource Mapping (Aidbox):**

| CareOS Entity | FHIR R4 Resource | Sync Direction | Notes |
| --- | --- | --- | --- |
| KBS Score | Observation | PostgreSQL → Aidbox | Linked to Omaha Condition. Value sets 1-5. |
| Crosswalk | ConceptMap | Manual/Static | Maps ICD-10 to Omaha System codes. |

**Core Endpoint Groups:**

| Group | Base Path | Methods | Auth Required | Roles |
| --- | --- | --- | --- | --- |
| Omaha/KBS | /api/v1/omaha/* | GET, POST | Yes | conductor, medical_director, admin |

**Core Modules:**\
**Module M: Omaha Crosswalk & KBS Engine**

- **Purpose:** Map ICD-10 codes to Omaha problems, auto-code Time Bank tasks, and track KBS (Knowledge, Behavior, Status) outcomes over time.
- **Location:** `src/server/modules/omaha/`
- **Key interfaces:** `CrosswalkService.mapIcd10()`, `KBSService.recordOutcome()`, `AutoCodingService.mapTaskToProblem()`
- **Dependencies:** Aidbox (FHIR ConceptMap and Observation sync), Time Bank module, LMN module.

**File Creation Plan (Server Module Files):**

| Path | Files | Priority |
| --- | --- | --- |
| src/server/modules/omaha/ | routes.ts, service.ts, schemas.ts, crosswalk.ts, kbs.ts | High (Phase 1) |

# co-op.care — CareOS Platform

# Master Blitzy Build Specification & Architecture Addendum

---

## WHY — VISION & PURPOSE

### What problem are you solving and for whom?

63 million Americans are unpaid family caregivers — mostly daughters, averaging 49 years old, providing 27 hours/week of unpaid care on top of their jobs. They spend $7,200/year out-of-pocket. They lose $5,600/year in productivity. 29% are sandwich generation (caring for both children and aging parents). 16% quit their jobs entirely.

The existing care system fails them in three ways:

1. **Fragmentation.** The daughter must independently find, vet, coordinate, and manage a patchwork of agencies, volunteers, wellness programs, and medical providers. There is no single platform, no shared medical record, no unified communication layer. She is the integration layer — and she's exhausted.
2. **Extraction.** Private equity owns 70%+ of home care agencies. They charge families $35-45/hour, pay workers $14-18/hour, pocket the spread, and tolerate 77% annual turnover. The worker has no equity, no health insurance, no reason to stay. The family gets a new stranger every few months.
3. **Tax invisibility.** Community wellness programs (yoga, tai chi, nutrition counseling, fitness, cognitive stimulation) are clinically proven to delay institutionalization and reduce hospitalizations — but families pay for them with after-tax dollars because no physician has documented their medical necessity. This is a 28-36% hidden tax on prevention.

**co-op.care solves all three.** We are a worker-owned home care cooperative (Class A licensed, CDPHE Colorado) that combines five sources of care into one platform governed by one Medical Director, accessible through one dashboard, and payable through one unified payment instrument (the Comfort Card). The family caregiver — we call her "the Conductor" — is the primary customer. The platform is built around her, not around the aging adult as the end user.

### What does your application do?

CareOS is the operating system for co-op.care. It is the platform through which:

- **The Conductor** (family caregiver) manages all care — professional, community, wellness, Time Bank, and clinical — from a single dashboard on her phone. She sees real-time caregiver notes, wearable vitals, upcoming appointments, Time Bank credits, LMN-eligible wellness programs, and the Comfort Card payment summary.
- **W-2 Worker-Owners** (professional caregivers) log care, document changes in condition, communicate with the Conductor and the Medical Director, track their cooperative equity, vote on governance, and receive assignments matched to families they already serve.
- **Time Bank Members** (neighbors) find tasks matched to their skills and proximity, log hours (GPS-verified), earn/spend/buy credits, see their impact chain, receive gratitude prompts, and participate in the community feed.
- **The Medical Director** (Josh Emdur, DO) reviews clinical data, writes Letters of Medical Necessity (LMN), conducts telehealth assessments, oversees CII/CRI scoring, and manages the clinical quality framework.
- **Community Wellness Providers** (yoga studios, nutritionists, fitness centers, cognitive programs) list their services in the LMN Marketplace, accept Comfort Card payments, and see referral analytics.
- **Employer HR Administrators** (BVSD, City of Boulder, CU) view aggregate CII results for their workforce, see productivity impact data, manage PEPM enrollment, and access the ROI dashboard.
- **Institutional Partners** (BCH, TRU PACE, Optum) receive structured clinical data, readmission risk scores, and intervention recommendations through secure APIs.

### Who will use it?

**Primary persona: The Conductor (Alpha Daughter)**

- Female, 35-60, employed, lives 0-60 miles from aging parent
- Currently doing 20-40 hours/week of unpaid care coordination
- Tech-comfortable but not technical (uses iPhone, texts, basic apps)
- Emotional state: overwhelmed, guilty, isolated, financially stressed
- Decision-maker for care spending ($20K-80K/year)
- She finds us through: hospital discharge (BCH), employer benefit (BVSD), wellness provider (JCC), faith community, or word-of-mouth

**Secondary personas:**

- Worker-Owner (W-2 caregiver): female, 25-55, CNA/HHA, values stability + equity + respect
- Time Bank Member (neighbor): any age, any gender, lives within 2 miles, wants to help but doesn't know how
- Medical Director: physician overseeing clinical governance, LMN generation, quality metrics
- Employer HR: benefits administrator managing caregiver support programs
- Wellness Provider: local business accepting LMN-eligible referrals

### Why will they use it instead of alternatives?

**vs. Traditional agencies (Visiting Angels, Home Instead, BrightSpring):**

- co-op.care workers earn $25-28/hr + equity + health insurance → &lt;15% turnover vs. 77%
- Same caregiver stays. Relationship continuity is the product.
- Time Bank replaces 30-50% of paid hours with community care at $0 or $15/hr
- LMN makes wellness HSA/FSA eligible — 28-36% tax savings no agency offers
- The Conductor dashboard gives real-time visibility no agency provides
- W-2 skilled providers handle escalation internally — zero handoffs

**vs. [Care.com](http://Care.com) / Honor / Papa:**

- Worker-owned — no extraction. Surplus returns to workers and members.
- Time Bank is unique. No competitor has a reciprocal care economy.
- LMN tax bridge is unique. No competitor has physician-governed wellness tax optimization.
- Five sources of care (not just one) with internal escalation.

**vs. Doing it alone:**

- The Conductor is already doing it alone. co-op.care doesn't replace her — it gives her the team, the tools, the training, and the tax savings.

---

## WHAT — CORE REQUIREMENTS

### What must your application do?

**Conductor Dashboard (Mobile-First Web App)**

- System must display a real-time care timeline showing all caregiver interactions, notes, vitals, and appointments in chronological order
- System must aggregate wearable data (Apple Health API) and display trends with anomaly flagging
- System must show upcoming appointments across all care sources with one-tap rescheduling
- System must display Time Bank credit balance (earned, spent, bought, membership floor, deficit limit)
- System must show the Comfort Card monthly summary
- System must send push notifications for: change-in-condition alerts, upcoming appointments, Time Bank match requests, caregiver check-in/check-out, LMN renewal reminders
- Users must be able to message any member of the care team
- Users must be able to view and rate every care interaction (1-5 stars + optional note)
- Users must be able to complete the CII assessment (12 dimensions, 2 minutes) and view results with zone classification (Green/Yellow/Red)
- Users must be able to complete the CRI assessment (14 factors, clinical acuity scoring) with Medical Director review workflow
- Users must be able to browse and book LMN-eligible wellness programs from the Marketplace
- Users must be able to manage care team preferences

**Time Bank Engine**

- System must maintain a double-entry ledger of Time Bank credits
- System must match Time Bank requests to available neighbors using: skill alignment, proximity (within 2 miles priority), rating history, availability, identity-task fit
- System must support remote task types with phone-verified completion
- System must support in-person task types with GPS-verified check-in/check-out
- System must enforce: 40-hour/year membership floor, 20-hour deficit limit, $15/hr cash purchase, 12-month graduated expiry, 48-hour Respite Emergency Fund access
- System must calculate and display the Impact Score (lifetime hours given + cascade multiplier)
- System must trigger behavioral nudges at key moments
- System must display the cascade visualization
- System must support two-way ratings with low-rating resolution workflow

**Worker-Owner Portal**

- System must display daily assignment schedule with family preferences and care plan notes
- Workers must be able to log care interactions using the **Ambient Scribe**: voice-to-text recording that auto-extracts clinical concepts and maps them to Omaha System problems
- Workers must be able to clock in/out with GPS verification
- System must track cooperative equity accumulation
- Workers must be able to view pay stubs, equity balance, benefits enrollment, and governance voting
- System must support shift swapping with coordinator approval
- Workers must be able to communicate with the Conductor and the Medical Director

**CII/CRI Assessment Engine**

- System must administer the Caregiver Intensity Index (12 dimensions, each scored 1-10, total /120)
- System must classify CII scores: Green (≤40), Yellow (41-79), Red (≥80)
- System must administer the Care Readiness Index (14 factors, clinical acuity scoring)
- System must generate a combined CII/CRI report with recommendations
- System must support employer aggregate view (anonymized CII distribution)
- System must track longitudinal CII/CRI trends per family with alerting on zone transitions

**LMN Marketplace**

- System must list community wellness providers
- System must generate a Letter of Medical Necessity template based on the member's clinical profile
- System must track LMN status: draft, signed by Medical Director, active, renewal due, expired
- System must calculate HSA/FSA savings per service and display running annual total
- System must support Annual LMN Renewal workflow
- System must log all LMN-eligible transactions for Comfort Card reconciliation

**Comfort Card (Unified Payment)**

- System must consolidate all payment sources into one monthly statement
- System must categorize each transaction by payment source and tax treatment
- System must calculate annual HSA/FSA eligible total and estimated tax savings
- System must generate exportable statements for tax filing

**Admin & Coordinator Dashboard**

- System must display operational metrics
- System must display the Michaelis-Menten dashboard: requests per ZIP code, active members per ZIP code, match time per ZIP code
- System must support manual Time Bank matching for unmatched requests
- System must support background check status tracking and renewal reminders
- System must manage the Respite Emergency Fund

**Employer Dashboard**

- System must display aggregate CII results (anonymized) for an employer's workforce
- System must calculate productivity impact
- System must show PEPM enrollment and utilization metrics
- System must generate quarterly ROI reports

### What actions need to happen?

**Conductor Onboarding Flow:**

 1. Land on co-op.care website → click "Get Started"
 2. Complete Mini CII Quick Check (3 sliders, 30 seconds) → see zone + CTA
 3. Create account (name, email, phone, ZIP code, relationship to care recipient)
 4. Complete full CII assessment (12 dimensions, 2 minutes)
 5. System generates care recommendation based on CII zone
 6. Pay $100 annual membership (Stripe) → auto-enrolled in Time Bank with 40 hours
 7. Schedule CRI assessment with Medical Director (telehealth, 20 minutes)
 8. Medical Director generates initial LMN
 9. Conductor invited to browse LMN Marketplace and build care team
10. First Time Bank match offered within 24 hours

**Hospital Discharge Flow (BCH Integration):**

1. BCH discharge planner identifies patient with caregiver at home
2. QR code scan → co-op.care onboarding with pre-filled clinical context
3. CII/CRI completed at bedside or within 24 hours
4. Care team assembled
5. Conductor dashboard goes live with discharge care plan
6. 30-day readmission prevention protocol activated

**Time Bank Exchange Flow:**

1. Member posts request
2. System matches to 3 nearest qualified neighbors → sends push notification
3. Neighbor accepts → both parties see confirmation
4. Neighbor arrives → GPS check-in logged
5. Task completed → GPS check-out logged → hours credited instantly
6. Both parties receive gratitude prompt → 1-tap rating + optional note
7. If earned hours: balance updates with animation
8. If bought hours: $15 charged to payment method, credited to coordination fund

**LMN Generation Flow:**

1. Conductor requests LMN or Medical Director initiates based on CRI
2. System pre-populates LMN template
3. Medical Director reviews, edits, signs electronically
4. LMN active → all listed wellness services become HSA/FSA eligible
5. Conductor browses Marketplace → books services → pays via Comfort Card
6. At 11 months: system sends renewal reminder

### What should the outcomes be?

**For the Conductor:**

- Reduced CII score over 6 months (target: 15-point improvement)
- 30-50% reduction in out-of-pocket care costs through Time Bank + HSA savings
- Single dashboard replacing 5-10 separate coordination tools
- Confidence that care team is stable

**For Worker-Owners:**

- $25-28/hr + health insurance + equity accumulation (\~$52K over 5 years)
- &lt;15% annual turnover vs. 77% industry average
- Democratic governance

**For the Business:**

- Year 1: 40 families, $364K revenue, -$615K net (pre-revenue investment)
- Year 2: 120 members, $2.4M revenue, -$567K net
- Year 3: 250 members, $6.4M revenue, +$741K net (11.5% margin — breakeven)
- Year 4: 400 members, $11.2M revenue, +$2.3M net (20.7% margin)
- Year 5: 600 members, $18.3M revenue, +$5.5M net (30% margin)

---

## HOW — PLANNING & IMPLEMENTATION

### What are the required stack components?

**Frontend:**

- React 18+ (TypeScript), Vite, PWA (with strict PHI cache-bypassing rules)
- TanStack Query (React Query) for server state, Zustand for client state
- Tailwind CSS with centralized brand colors
- Web Speech API for narration features
- Recharts or Chart.js

**Backend:**

- Node.js (Express preferred for middleware compatibility)
- PostgreSQL (relational data)
- Redis (caching, real-time notifications via persistent streams)
- FHIR R4 / Aidbox (clinical data)

**Integrations:**

- Google Gemini API (`@google/genai`) for Ambient AI features
- Apple Health API, Stripe, Twilio, SendGrid, Google Maps API, DocuSign/HelloSign, Zoom API, HL7 FHIR

**Infrastructure:**

- Vercel (frontend), AWS/GCP (backend)
- HIPAA-compliant hosting (BAA)
- Docker, GitHub Actions

### What are the system requirements?

**Performance:** &lt;2s page load, &lt;30s match notification, &lt;200ms API reads.\
**Security:** HIPAA compliant, AES-256 at rest, TLS 1.3 in transit, RBAC, PHI audit logging, 2FA for clinical/admin roles, SOC 2 Type II target. JWTs MUST be stored in Secure, HttpOnly cookies (never localStorage to prevent XSS). PWA Service Workers MUST bypass caching for any API responses containing PHI.\
**Scalability:** Phase 1 (single server) → Phase 2 (horizontal scaling) → Phase 3 (microservices) → Federation (multi-tenant).\
**Reliability:** 99.9% uptime SLA, 6-hour backups, graceful degradation.

### What are the key user flows?

**Flow 1: Conductor Daily Check**\
See today's care timeline → review notes → check vitals → approve appointments → check Time Bank balance.

**Flow 2: Time Bank First Exchange**\
Notification received → view details → accept → GPS check-in → complete task → GPS check-out → rate experience → credits added.

**Flow 3: Hospital Discharge Onboarding**\
QR code scan → Pre-filled profile → rapid CII → membership payment → care team assembled → Conductor dashboard live.

**Flow 4: LMN Marketplace Booking**\
Browse eligible programs → see HSA savings → book appointment → Comfort Card auto-charges HSA source.

**Flow 5: Employer CII Rollout**\
HR uploads CSV → system sends invites → employees complete CII → HR sees aggregate dashboard → HR approves PEPM enrollment.

### What are the core interfaces?

1. **Conductor Dashboard (Mobile PWA)**: Single pane of glass for all care management.
2. **Time Bank Hub (Mobile PWA)**: Browse, accept, post, and track Time Bank exchanges.
3. **Worker-Owner Portal (Mobile + Desktop)**: Daily care delivery, Ambient Scribe documentation, equity tracking, governance.
4. **Medical Director Console (Desktop)**: Clinical oversight, LMN management, quality metrics.
5. **Admin/Coordinator Dashboard (Desktop)**: Operational management, Time Bank oversight, quality control.
6. **Employer Dashboard (Desktop)**: Workforce caregiver burden visibility and ROI tracking.
7. **Public Website + Ambient Guide**: Convert visitors to founding families, serve investors/researchers/media. The **Ambient Guide** (an AI conversational interface) is the primary way users interact with the website, proactively guiding them through the cooperative model, Time Bank, LMN tax savings, and Product Strategy Map.

---

## BUSINESS REQUIREMENTS

### What are your access and authentication needs?

- **Conductor**: Email + password, optional 2FA. Access to own family data only.
- **Worker-Owner**: Email + password + 2FA. Access to assigned families only.
- **Time Bank Member**: Email + password. Access to own profile + available tasks.
- **Medical Director**: Email + password + 2FA (mandatory). Access to all clinical data.
- **Admin/Coordinator**: Email + password + 2FA (mandatory). Access to all operational data.
- **Employer HR**: Email + password + SSO. Access to aggregate workforce data only.
- **Wellness Provider**: Email + password. Access to own listing + booking data.

**Authentication:** JWT tokens, OAuth 2.0 for SSO, Background check verification gate for Time Bank.

### What business rules must be followed?

- **Data validation:** CII/CRI scoring bounds, Time Bank deficit limits (-20), $15/hr purchases, 40-hour annual floor, GPS verification bounds (0.25 miles).
- **Process requirements:** LMN physician signature, annual LMN renewal, 24-hour MD review for change-in-condition, Respite Emergency Fund approval workflows, Subchapter T equity calculations.
- **Compliance:** HIPAA, CDPHE Class A, IRS Publication 502, Subchapter T, Colorado SB 24-205.
- **Service level expectations:** Time Bank match &lt;4 hours, Respite dispatch &lt;4 hours, MD CRI review &lt;24 hours, Care team assignment &lt;48 hours.

### What are your implementation priorities?

**HIGH PRIORITY (Phase 1 — Build First)**

- Conductor Dashboard, CII Assessment Engine, Time Bank Core, Worker-Owner Care Logging, Membership + Payment, Public Website integration, Secure messaging.

**MEDIUM PRIORITY (Phase 2 — Build Second)**

- LMN Marketplace, CRI Assessment Engine, Medical Director Console, Employer Dashboard, Comfort Card, Wearable Integration, Admin/Coordinator Dashboard, Background check integration, Time Bank behavioral nudges, Worker-Owner equity tracking.

**LOWER PRIORITY (Phase 3 — Build Third)**

- Hospital integration, Predictive hospitalization model, PACE data exchange, Federation multi-tenancy, Comfort Card physical/virtual card issuance, Age at Home Insurance underwriting engine, Advanced analytics.

---

## EXISTING CODEBASE & CONSTRAINTS

The communication suite is already built as a React/TypeScript application:

- `src/theme.ts` — centralized brand colors, fonts, mobile hook
- `src/App.tsx` — hash-based router with persistent navigation bar
- `src/Website.tsx` — public-facing site
- `src/ProductMap.tsx` — investor-facing product strategy map
- `src/Enzyme.tsx` — behavioral design framework
- `src/CareUBI.tsx` — policy/research thesis
- `src/Synthesis.tsx` — cross-cutting throughlines

**KEY NUMBERS (DO NOT CHANGE)**

- 63M US family caregivers (AARP 2025)
- 27 hours/week average unpaid care
- $7,200/year out-of-pocket per caregiver
- 77% annual agency turnover (Home Care Pulse 2024)
- 1,717 BVSD teachers (NOT 6,000)
- 341 TRU PACE enrollees (only PACE in Boulder County)
- 15.4% BCH readmission rate
- $16,037 average readmission cost
- $35/hr private pay rate
- $25-28/hr worker-owner wage + equity (\~$52K over 5 years)
- $15/hr Time Bank cash purchase
- 40 hrs/year Time Bank floor (included in $100 membership)
- $100/year community membership
- 28-36% HSA/FSA tax savings via LMN
- CII: 12 dimensions, scored 1-10 each, total /120
- CRI: min raw 14.4, max raw 72.0

**PEOPLE**

- **Blaine Warkentine, MD** — Founder/CEO. Orthopedic surgeon, 20+ years, 3 strategic exits, 5 patents. blaine@co-op.care · 484-684-5287
- **Josh Emdur, DO** — Medical Director. BCH Hospitalist since 2008. 50-state licensed. Writes all LMNs.

**LEGAL**

- Worker-Owned Home Care Cooperative, LLC — filed March 3, 2026, Colorado
- CDPHE Class A license application pending
- Insurance: $25M through Beazley/Lloyd's
- Age at Home is NOT a licensed insurance product today
- $100 founding family deposit is NOT an insurance premium

---

## ADDENDUM: DATA MODELS

### Core Entities & Relationships

```text
Family
  ├── id (UUID)
  ├── name (string)
  ├── membershipStatus (enum: pending, active, grace_period, suspended, cancelled)
  ├── membershipStartDate (date)
  ├── membershipRenewalDate (date)
  ├── primaryConductor → User (FK)
  ├── careRecipient → CareRecipient (FK)
  ├── careTeam → CareTeamAssignment[] (has_many)
  ├── timeBankAccount → TimeBankAccount (has_one)
  ├── comfortCard → ComfortCard (has_one)
  ├── activeLMN → LMN (FK, nullable)
  └── assessments → Assessment[] (has_many)

User
  ├── id (UUID)
  ├── email (string, unique)
  ├── phone (string)
  ├── firstName (string)
  ├── lastName (string)
  ├── role (enum: conductor, worker_owner, timebank_member, medical_director, admin, employer_hr, wellness_provider)
  ├── zipCode (string)
  ├── location (point — lat/lng)
  ├── backgroundCheckStatus (enum: not_started, pending, passed, failed, expired)
  ├── backgroundCheckDate (date, nullable)
  ├── isActive (boolean)
  ├── createdAt (timestamp)
  └── profilePhoto (url, nullable)

CareRecipient
  ├── id (UUID)
  ├── firstName (string)
  ├── lastName (string)
  ├── dateOfBirth (date)
  ├── address (address object)
  ├── location (point — lat/lng)
  ├── primaryDiagnoses (string[])
  ├── mobilityLevel (enum: independent, assisted, wheelchair, bedbound)
  ├── cognitiveStatus (enum: intact, mild_impairment, moderate_impairment, severe_impairment)
  ├── allergies (string[])
  ├── medications (Medication[])
  ├── emergencyContact (contact object)
  ├── wearableConnected (boolean)
  └── wearableDeviceId (string, nullable)

Assessment
  ├── id (UUID)
  ├── family → Family (FK)
  ├── type (enum: cii, cri, cii_quick)
  ├── assessorId → User (FK)  — self for CII, Medical Director for CRI
  ├── scores (JSON — dimension-keyed scores)
  ├── totalScore (decimal)
  ├── zone (enum: green, yellow, red)  — CII only
  ├── recommendations (text)
  ├── reviewedByMD (boolean)  — CRI only
  ├── reviewDate (timestamp, nullable)
  ├── completedAt (timestamp)
  └── previousAssessmentId → Assessment (FK, nullable)  — for trend tracking

TimeBankAccount
  ├── id (UUID)
  ├── family → Family (FK)
  ├── balanceEarned (decimal, hours)
  ├── balanceMembership (decimal, hours)
  ├── balanceBought (decimal, hours)
  ├── balanceDeficit (decimal, hours, max -20)
  ├── lifetimeEarned (decimal)
  ├── lifetimeSpent (decimal)
  ├── lifetimeGiven (decimal)
  ├── lifetimeDonatedToRespite (decimal)
  ├── impactScore (integer)
  ├── currentStreak (integer, weeks)
  ├── longestStreak (integer, weeks)
  └── lastActivityDate (date)

TimeBankTransaction
  ├── id (UUID)
  ├── account → TimeBankAccount (FK)
  ├── type (enum: earned, spent, bought, donated_to_respite, membership_credit, expired, respite_received, referral_bonus, training_bonus)
  ├── hours (decimal)
  ├── relatedTaskId → TimeBankTask (FK, nullable)
  ├── dollarAmount (decimal, nullable)
  ├── note (text, nullable)
  ├── createdAt (timestamp)
  └── expiresAt (timestamp, nullable)

TimeBankTask
  ├── id (UUID)
  ├── requestedBy → User (FK)
  ├── requestedFor → CareRecipient (FK)
  ├── assignedTo → User (FK, nullable)
  ├── taskType (enum: meals, rides, companionship, errands, yard_work, housekeeping, phone_companionship, tech_support, admin_help, pet_care, grocery_run, teaching)
  ├── isRemote (boolean)
  ├── description (text)
  ├── address (address object, nullable)
  ├── scheduledDate (date)
  ├── scheduledTime (time)
  ├── estimatedHours (decimal)
  ├── actualHours (decimal, nullable)
  ├── status (enum: posted, matched, accepted, in_progress, completed, cancelled, expired)
  ├── checkInTime (timestamp, nullable)
  ├── checkInLocation (point, nullable)
  ├── checkOutTime (timestamp, nullable)
  ├── checkOutLocation (point, nullable)
  ├── ratingByRequester (1-5, nullable)
  ├── ratingByProvider (1-5, nullable)
  ├── requesterNote (text, nullable)
  ├── providerNote (text, nullable)
  ├── matchedAt (timestamp, nullable)
  ├── matchScore (decimal)
  └── createdAt (timestamp)

CareInteraction
  ├── id (UUID)
  ├── family → Family (FK)
  ├── worker → User (FK)
  ├── careRecipient → CareRecipient (FK)
  ├── interactionType (enum: personal_care, skilled_nursing, companionship, medication, transport, assessment, telehealth)
  ├── startTime (timestamp)
  ├── endTime (timestamp)
  ├── tasks (JSON — structured checklist of tasks performed)
  ├── notes (text)
  ├── changeInCondition (boolean)
  ├── changeInConditionDetail (text, nullable)
  ├── changeInConditionSeverity (enum: routine, monitor, urgent, emergency — nullable)
  ├── changeReviewedByMD (boolean)
  ├── vitalsRecorded (JSON)
  ├── photos (url[], consent required)
  ├── ratingByConductor (1-5, nullable)
  ├── conductorNote (text, nullable)
  ├── clockInLocation (point)
  └── clockOutLocation (point)

LMN (Letter of Medical Necessity)
  ├── id (UUID)
  ├── family → Family (FK)
  ├── careRecipient → CareRecipient (FK)
  ├── issuedBy → User (FK)  — Medical Director
  ├── diagnoses (string[])  — ICD-10 codes
  ├── qualifyingConditions (string[])
  ├── approvedServices → WellnessService[] (many-to-many)
  ├── status (enum: draft, pending_signature, active, renewal_due, expired)
  ├── issuedDate (date)
  ├── expirationDate (date)
  ├── renewalReminderSentAt (timestamp[], nullable)
  ├── signatureUrl (url, nullable)
  └── irsCategory (string)

WellnessProvider
  ├── id (UUID)
  ├── name (string)
  ├── businessType (enum: yoga_studio, fitness_center, nutritionist, cognitive_program, aquatic, tai_chi, meditation, social_program, other)
  ├── address (address object)
  ├── location (point)
  ├── contactEmail (string)
  ├── contactPhone (string)
  ├── services → WellnessService[] (has_many)
  ├── rating (decimal)
  ├── totalBookings (integer)
  └── isActive (boolean)

WellnessService
  ├── id (UUID)
  ├── provider → WellnessProvider (FK)
  ├── name (string)
  ├── description (text)
  ├── qualifyingConditions (string[])
  ├── irsPub502Category (string)
  ├── pricePerSession (decimal)
  ├── schedule (JSON)
  ├── maxParticipants (integer, nullable)
  └── isActive (boolean)

ComfortCard
  ├── id (UUID)
  ├── family → Family (FK)
  ├── transactions → ComfortCardTransaction[] (has_many)
  ├── monthlyStatements → MonthlyStatement[] (has_many)
  └── annualHsaTotal (decimal)

ComfortCardTransaction
  ├── id (UUID)
  ├── comfortCard → ComfortCard (FK)
  ├── date (date)
  ├── description (string)
  ├── amount (decimal)
  ├── paymentSource (enum: hsa_fsa, employer_pepm, ltci_reimbursement, pace_subcap, timebank_credit, private_pay)
  ├── isHsaEligible (boolean)
  ├── irsPub502Category (string, nullable)
  ├── relatedInteractionId (UUID, nullable)
  └── createdAt (timestamp)

WorkerEquity
  ├── id (UUID)
  ├── worker → User (FK)
  ├── hoursWorkedThisQuarter (decimal)
  ├── equityRatePerHour (decimal)
  ├── accumulatedEquity (decimal)
  ├── vestedEquity (decimal)
  ├── vestingDate (date, nullable)
  ├── patronageDividends → PatronageDividend[] (has_many)
  └── lastCalculatedAt (timestamp)

RespiteEmergencyFund
  ├── id (singleton)
  ├── balanceHours (decimal)
  ├── balanceDollars (decimal)
  ├── lifetimeDisbursedHours (decimal)
  ├── autoApprovalThreshold (decimal, default: 100 hours)
  └── transactions → RespiteFundTransaction[] (has_many)

Notification
  ├── id (UUID)
  ├── userId → User (FK)
  ├── type (enum)
  ├── title (string)
  ├── body (text)
  ├── data (JSON)
  ├── channel (enum: push, sms, email, in_app)
  ├── status (enum: pending, sent, delivered, read, failed)
  ├── scheduledFor (timestamp, nullable)
  ├── sentAt (timestamp, nullable)
  └── readAt (timestamp, nullable)
```

---

## ADDENDUM: NOTIFICATION ARCHITECTURE

### Conductor Notifications

- **Caregiver clock-in/out:** Push (Instant)
- **Change-in-condition flagged:** Push + SMS (Instant)
- **Wearable anomaly detected:** Push (Within 5 min)
- **Time Bank match available/completed:** Push (Instant)
- **LMN expiring:** Email + in-app (Scheduled 60/30/7 days)
- **CII zone transition:** Push + email (After assessment)
- **Appointment reminder:** Push (24hr + 2hr before)
- **Monthly Comfort Card statement:** Email (1st of month)

### Time Bank Member Notifications

- **Task match (skill + proximity):** Push (Instant)
- **Task accepted confirmation:** Push (Instant)
- **Post-task gratitude prompt:** Push (5 min after checkout)
- **Streak notification:** Push (Weekly)
- **Deficit nudge:** Push + in-app (When balance hits -5)
- **Burnout detection:** Push (When &gt;10 hrs/week)
- **Refer-a-neighbor prompt:** Push (After 3rd completed task)
- **Credit expiry warning:** Push + email (30 days before expiry)
- **Impact chain update:** In-app (Weekly)

### Worker-Owner Notifications

- **New assignment / Schedule change:** Push + SMS (Instant)
- **Equity milestone:** In-app + email (Quarterly)
- **Governance vote open:** Push + email (When vote opens)
- **Shift swap request:** Push (Instant)
- **Change-in-condition escalation:** Push (When MD reviews)

### System / Admin Notifications

- **SLA breach (match &gt;4hr):** Push + SMS to coordinator (At 4hr mark)
- **Respite Fund low:** Email to admin (When &lt;50 hours)
- **Background check expiring:** Email to member + admin (30 days before)
- **ZIP code below critical mass:** Weekly email to admin (Monday)

---

## ADDENDUM: CONCRETE USER STORIES

### Story 1: "Lisa at 2 AM" (The Origin Story)

Lisa (42, marketing manager, Denver) gets a call at 2 AM. Mom fell in Boulder. BCH admits her. Discharge is Thursday. Lisa can't move to Boulder — she has two kids and a job. She Googles "home care Boulder" and finds co-op.care.\
**Thursday 11 AM:** Lisa scans QR code at Mom's bedside. Completes Mini CII (scores 24/30 — Red). Pays $100 membership. Gets 40 Time Bank hours instantly.\
**Thursday 3 PM:** Care team assembled: Maria G. (W-2 caregiver) starts Monday. Janet R. (Time Bank neighbor) brings dinner tonight and tomorrow.\
**Friday:** Lisa completes full CII (87/120 — Red Zone). Dr. Emdur does telehealth CRI assessment. Generates LMN covering tai chi, nutrition counseling, and aquatic therapy. Lisa books all three in the LMN Marketplace. All are now HSA-eligible.\
**Monday:** Maria arrives at 9 AM. Lisa watches from Denver via the Conductor Dashboard. Maria's notes at 12:45 PM: "Good appetite at lunch. Walked to mailbox with rollator. Mentioned knee pain — noted in log." Lisa's Apple Watch data for Mom shows sleep was 6.2 hours (down from 7.1 average — flagged).\
**Tuesday:** Lisa earns her first Time Bank hour: a 45-minute phone companionship call with Mr. Torres, another member's father. She does this from her couch after the kids go to bed. She starts doing it every Tuesday and Thursday.\
**Month 3:** Lisa's CII has dropped from 87 to 62 (Yellow). She's sleeping better. She completed the Conductor Certification (Safe Transfers module). When she visits Mom, she helps with transfers herself. Maria notices the difference.\
**Month 6:** Lisa refers her friend Karen (whose father-in-law is in Longmont). Karen signs up. Both get 10 bonus hours. The cascade continues.

### Story 2: "Janet the Neighbor" (Time Bank Viral Loop)

Janet (68, retired teacher, lives 0.3 miles from Mom's house) joined co-op.care through her church. She doesn't have a loved one in care. She just wants to help.\
**Week 1:** Janet sees a notification: "A neighbor 0.3 miles from you needs meal delivery Mon/Wed/Fri." She accepts. Delivers soup and salad Monday. GPS logs her arrival at 11:15 AM, departure at 11:45 AM. +0.5 hours credited instantly. She gets a thank-you note from Lisa.\
**Week 4:** Janet has earned 6 hours. Her streak badge says "4 weeks!" She hasn't spent any credits yet. She sees her Impact Score: 12. "Your meals allowed Lisa to keep working full-time instead of driving to Boulder 3x/week."\
**Month 3:** Janet's husband needs knee surgery. She uses 8 hours of Time Bank credits: David M. mows the lawn while she's at the hospital. Rosa L. brings meals. A retired nurse checks on the surgical wound. Janet didn't have to ask her kids for help. The system she built for others caught HER.\
**Month 6:** Janet teaches a "Cooking for Neighbors" workshop at the church. Earns 3 credits. Six people sign up for the Time Bank at the workshop. The cascade amplifies.

### Story 3: "BVSD HR Dashboard" (Employer Conversion)

Patricia Valderrama (Benefits Manager, BVSD) receives an email: "42% of your teachers are likely family caregivers. Here's the data."\
**Week 1:** Patricia logs into the Employer Dashboard. Sees: 843 teachers completed the CII (49% of 1,717). 278 are active caregivers (33%). 21 are in Red Zone. 84 in Yellow. 173 in Green. Estimated productivity loss: $1.1M/year.\
**Week 2:** Patricia sees the ROI calculator: At $4.50/employee/month PEPM ($93K/year), co-op.care projects: 15 teachers stabilized from Red to Yellow, 40 teachers using Time Bank instead of sick days, 8 teachers retained who would have reduced hours. Projected savings: $287K/year. ROI: 3.1x.\
**Week 3:** BVSD signs. 1,717 employees enrolled. co-op.care sends CII invitations. Within 30 days, 60% complete the assessment.

---

## ADDENDUM: TIME BANK STATE MACHINE

```text
CREDIT LIFECYCLE:

  [Membership Paid] ──→ 40 hrs credited (type: membership_credit)
                         │
                         ├─→ AVAILABLE ──→ SPENT (used on a task)
                         │                   └─→ credited to provider's account
                         │
                         ├─→ EXPIRED (after 12 months)
                         │     └─→ auto-donated to Respite Fund
                         │         (user prompted 30 days before: "use or donate")
                         │
                         └─→ DONATED (voluntarily to Respite Fund)

  [Task Completed] ──→ hours earned (type: earned)
                        │
                        ├─→ 0.9 hrs to member (default)
                        └─→ 0.1 hrs to Respite Fund (default, opt-out-able)
                             (The Respite Default — Choice Architecture nudge)

  [Cash Purchase] ──→ $15/hr charged via Stripe
                       │
                       ├─→ hours credited (type: bought)
                       ├─→ $12 to coordination fund (background checks, GPS, platform)
                       └─→ $3 to Respite Emergency Fund

  [Referral] ──→ 10 bonus hours (type: referral_bonus)
                  ├─→ 5 to referrer
                  └─→ 5 to new member

  [Training] ──→ 5 bonus hours (type: training_bonus)
                  └─→ credited on Conductor Certification module completion
```

**DEFICIT RULES:**

- Member can go up to -20 hours
- At -5: gentle nudge with skill-matched tasks nearby
- At -10: stronger nudge with "94% of members who receive help give back within 2 weeks"
- At -15: coordinator outreach (phone call)
- At -20: no more tasks can be requested until balance improves
- Deficit can be resolved by: earning (volunteering), buying ($15/hr), or membership renewal (40 hrs credited)

**RESPITE EMERGENCY FUND:**

- Any family in crisis can receive up to 48 hours regardless of balance
- Auto-approved if fund balance &gt;100 hours
- Coordinator approval if fund balance &lt;100 hours
- Crisis = hospital discharge, fall, sudden health decline, caregiver hospitalization
- After 48 hours, family transitions to standard Time Bank + professional care

---

## ADDENDUM: ANTI-PATTERNS — WHAT NOT TO BUILD

 1. **Do NOT build a marketplace where families browse and hire individual caregivers.** co-op.care is not [Care.com](http://Care.com). The cooperative assigns care teams based on clinical needs, family preferences, and geographic proximity. The Conductor picks favorites and rates workers, but she doesn't "shop" for them. The matching is algorithmic + coordinator-curated, not marketplace-driven.
 2. **Do NOT build separate apps for each user type.** CareOS is ONE app with role-based views. The Conductor, Worker, Time Bank member, and Medical Director all log into the same app and see different dashboards based on their role. Some users have multiple roles (a Conductor can also be a Time Bank member).
 3. **Do NOT build real-time video calling.** Telehealth uses Zoom API integration, not a custom video solution. Don't reinvent this. Just schedule and launch Zoom links.
 4. **Do NOT build an insurance claims engine.** Age at Home Care Insurance is a 2028+ product. The current platform tracks data that will FEED future underwriting, but the insurance product itself is not being built now. The Comfort Card is a reporting/reconciliation tool, not a claims processor.
 5. **Do NOT build complex scheduling with drag-and-drop calendar.** Worker scheduling is simple: coordinator assigns shifts, workers confirm or request swaps. The Conductor sees the schedule as a timeline. Nobody needs a Gantt chart.
 6. **Do NOT gate Time Bank behind a long onboarding flow.** The first Time Bank interaction must be possible within 24 hours of signup. Background check can proceed in parallel for in-person tasks. Remote tasks (phone calls) are available immediately with identity verification only.
 7. **Do NOT make the CII assessment feel medical.** It should feel like a "how are you doing?" conversation, not a clinical intake form. Warm language, slider interactions, conversational progress. The CRI (administered by Medical Director) is the clinical assessment. The CII is for the Conductor.
 8. **Do NOT build gamification with points, levels, and badges everywhere.** The Time Bank uses streaks and impact scores because these map to enzyme principles (catalytic cycle, cascade amplification). But it should NOT feel like Duolingo. The tone is warm community recognition, not gamified competition. No leaderboards. No XP. No achievements.
 9. **Do NOT use dark patterns for the Respite Default.** The auto-donation of 0.1 hrs per earned hour is a choice architecture nudge — but the opt-out must be genuinely easy (one tap, clearly labeled). This is libertarian paternalism, not manipulation. If people feel tricked, the whole trust infrastructure collapses.
10. **Do NOT store or transmit Social Security numbers, full credit card numbers, or bank account numbers.** Stripe handles all payment processing. Background check API handles identity verification. CareOS never sees or stores raw financial identity data.

---

## ADDENDUM: TEST SCENARIOS

**Test 1: Full Conductor Onboarding (must complete in &lt;10 minutes)**\
Visit homepage → complete Mini CII → create account → complete full CII → pay $100 → Time Bank balance shows 40 hours → Dashboard loads.

**Test 2: Time Bank Round Trip**\
Conductor posts task → matched to neighbor → neighbor accepts → GPS check-in → GPS check-out → hours calculated (0.9 to member, 0.1 to Respite) → gratitude prompt → cascade updates.

**Test 3: LMN → HSA Booking**\
Conductor has active LMN → opens LMN Marketplace → sees HSA Eligible badge → books session → Comfort Card charged to HSA source → Annual HSA total increments.

**Test 4: Change-in-Condition Escalation**\
Worker logs care → flags "change in condition" (severity: monitor) → Conductor receives instant push → Medical Director receives in-queue notification → MD reviews within 24 hours → Conductor sees MD response.

**Test 5: Wearable Anomaly Detection**\
Apple Watch reports resting HR 95 bpm (normal: 68) → system detects anomaly → Conductor receives push → Dashboard shows HR trend chart → One-tap button: "Escalate to Dr. Emdur".

**Test 6: Employer CII Rollout**\
HR uploads CSV → system sends invites → employees complete CII → Employer dashboard shows aggregate data → Productivity calculator auto-populates → HR clicks "Activate PEPM".

**Test 7: Respite Emergency Fund Crisis**\
Conductor triggers emergency → system dispatches up to 48 hours → auto-approved if fund &gt;100 hours (manual if &lt;100) → Time Bank neighbor matched for immediate companionship → W-2 caregiver assigned for next morning.

## ADDENDUM: DATABASE & FHIR INFRASTRUCTURE

### DATABASE ARCHITECTURE DECISION: PostgreSQL + Aidbox Dual-Layer

CareOS requires two types of data simultaneously:

1. **Operational data** — Time Bank credits, task matching, user profiles, notifications, Comfort Card transactions, cooperative governance, employer dashboards. This is multi-model data: relational, graph, time-series, and real-time.
2. **Clinical data** — FHIR R4 resources (Patient, CarePlan, Observation, Condition, Procedure, QuestionnaireResponse, Encounter, Practitioner, Organization). This must be HIPAA-compliant, interoperable with hospital systems, and queryable using standard FHIR APIs.

**The architecture: PostgreSQL handles operational data. Aidbox handles clinical data. They communicate via event-driven sync.**

### LAYER 1: PostgreSQL — OPERATIONAL DATABASE

**Why PostgreSQL (Not PostgreSQL Alone)**\
co-op.care's operational data is inherently multi-model:

- **Graph:** Time Bank cascade chains, care team relationships
- **Document:** User profiles with variable schemas, assessment scores
- **Relational:** Membership status, financial transactions
- **Time-series:** Wearable vitals, CII score trends
- **Real-time:** Dashboard live updates, Time Bank task matching
- **Geospatial:** Time Bank proximity matching, GPS verification

**PostgreSQL Configuration**

- Version: PostgreSQL 16+
- Deployment: PostgreSQL (e.g., Neon, Supabase) (managed) for production
- Storage: RocksDB (single-node) → TiKV (distributed cluster)
- Authentication: Built-in namespace/database/scope-level auth with JWT
- Real-time: Native WebSocket connections for live queries

### LAYER 2: HEALTH SAMURAI AIDBOX — FHIR CLINICAL DATA

**Why Aidbox (Not Building FHIR From Scratch)**\
CareOS must:

- Store clinical data in FHIR R4 format
- Generate and manage Letters of Medical Necessity as FHIR DocumentReference resources
- Store CII/CRI assessments as FHIR QuestionnaireResponse resources
- Exchange clinical data with hospital systems via HL7 FHIR REST APIs
- Maintain HIPAA-compliant audit trails

**Aidbox Configuration**

- Platform: Health Samurai Aidbox
- FHIR Version: R4 (with R5/R6 migration path)
- Storage: PostgreSQL with JSONB (Aidbox managed)
- Deployment: Aidbox Cloud (managed)
- Auth: OAuth 2.0 + SMART-on-FHIR
- Terminology: ICD-10, SNOMED CT, LOINC, Omaha System

### LAYER 3: SYNC ARCHITECTURE — PostgreSQL ↔ Aidbox

```text
                    ┌──────────────────────┐
                    │   CareOS Frontend    │
                    │   (React/TypeScript)  │
                    └────────┬─────────────┘
                             │
                    ┌────────▼─────────────┐
                    │   CareOS API Server   │
                    │   (Node.js/Fastify)   │
                    └───┬──────────┬────────┘
                        │          │
           ┌────────────▼──┐  ┌───▼────────────┐
           │   PostgreSQL   │  │  Aidbox FHIR   │
           │  (Operational) │  │  (Clinical)    │
           │               │  │                │
           │ Users         │  │ Patient        │
           │ Families      │  │ CarePlan       │
           │ Time Bank     │  │ Observation    │
           │ Comfort Card  │  │ Encounter      │
           │ Notifications │  │ Questionnaire  │
           │ Equity        │  │ DocumentRef    │
           │ Assessments*  │  │ AuditEvent     │
           └───────┬───────┘  └───────┬────────┘
                   │                  │
                   └──────┬───────────┘
                          │
                   Persistent Event Sync Layer
                   (Transactional Outbox / Message Broker
                    to guarantee at-least-once delivery
                    and prevent split-brain)

  * Assessment scores stored in both:
    - PostgreSQL: operational scoring, zone classification, trend queries
    - Aidbox: FHIR QuestionnaireResponse for clinical interoperability
```

**Sync Rules**

- **AIDBOX → POSTGRESQL:** New Encounter created → Generate Comfort Card transaction; Vitals Observation anomaly → Create notification in PostgreSQL.
- **POSTGRESQL → AIDBOX:** CII assessment completed → Create QuestionnaireResponse in Aidbox; Worker logs care interaction → Create Encounter + Observations in Aidbox.
- **PERSISTENCE:** Sync events MUST be persistent and require acknowledgment (ACK). Do not use fire-and-forget Redis Pub/Sub for clinical data sync.

## ADDENDUM: CLINICAL TAXONOMY & FEATURE DEEP DIVE

### PART 1: THE OMAHA SYSTEM ↔ ICD-10 CROSSWALK

**Why This Matters**\
co-op.care operates at the intersection of community care (documented in the Omaha System) and clinical billing (documented in ICD-10-CM). The crosswalk enables:

1. **LMN generation:** Auto-maps Omaha System problems to ICD-10 codes that justify HSA/FSA eligibility under IRS Pub 502.
2. **BCH discharge integration:** Translates ICD-10 codes into Omaha System problems for community care planning.
3. **CMS reporting:** Bridges the Omaha System (community nursing standard) with ICD-10 (ACCESS, LEAD, GUIDE requirements).
4. **CII/CRI scoring:** Maps clinical conditions to caregiver burden dimensions.
5. **Predictive models:** Wearable anomaly detection generates Omaha System observations that map to ICD-10 for clinical escalation.

**The Omaha System: 42 Problems × 4 Domains**

**Domain 1: Environmental (4 problems)**

- **01 Income:** Financial strain assessment in CII. ICD-10: Z59.7, Z59.86.
- **02 Sanitation:** Home safety assessment. ICD-10: Z59.1, Z59.89.
- **03 Residence:** Housing stability. ICD-10: Z59.0, Z59.19.
- **04 Neighborhood/Workplace Safety:** Environmental risk factors. ICD-10: Z77.098, Z59.3.

**Domain 2: Psychosocial (12 problems)**

- **05 Communication with community resources:** THE CONDUCTOR'S CORE FUNCTION. ICD-10: Z75.4, Z75.3. LMN Eligible: Yes (care coordination).
- **06 Social contact:** CII dimension: Social Isolation Impact. ICD-10: Z60.2, Z60.4. LMN Eligible: Yes (social prescribing).
- **07 Role change:** THE CONDUCTOR'S IDENTITY TRANSFORMATION. ICD-10: Z63.6, Z73.1. LMN Eligible: Yes (Conductor Certification).
- **08 Interpersonal relationship:** Family dynamics. ICD-10: Z63.0, Z63.1. LMN Eligible: Yes (family counseling).
- **09 Spirituality:** Faith community hubs. ICD-10: Z65.8. LMN Eligible: Possibly.
- **10 Grief:** Anticipatory grief. ICD-10: Z63.4, F43.21. LMN Eligible: Yes (grief counseling).
- **11 Mental health:** Caregiver depression/anxiety. ICD-10: F32.9, F41.1, Z73.0. LMN Eligible: Yes (therapy, CBT).
- **12 Sexuality:** Intimacy disruption. ICD-10: Z70.9.
- **13 Caretaking/parenting:** THE CONDUCTOR BURDEN ITSELF. ICD-10: Z63.6, Z73.1. LMN Eligible: Yes (respite care).
- **14 Neglect:** Self-neglect. ICD-10: T74.01XA. (Clinical escalation).
- **15 Abuse:** Elder abuse screening. ICD-10: T74.11XA. (Clinical escalation).
- **16 Growth and development:** Cognitive decline trajectory. ICD-10: F03.90, G30.9. LMN Eligible: Yes (cognitive stimulation).

**Domain 3: Physiological (18 problems)**

- **17 Hearing:** Isolation factor. ICD-10: H91.90. LMN Eligible: Yes (audiology).
- **18 Vision:** Fall risk factor. ICD-10: H54.7. LMN Eligible: Yes (optometry).
- **19 Speech and language:** Post-stroke/dementia. ICD-10: R47.01. LMN Eligible: Yes (speech therapy).
- **20 Oral health:** Malnutrition risk. ICD-10: K08.109.
- **21 Cognition:** CORE DEMENTIA DOMAIN. ICD-10: F03.90, G30.9. LMN Eligible: Yes (cognitive stimulation).
- **22 Pain:** Chronic pain management. ICD-10: G89.29, M54.5. LMN Eligible: Yes (PT, aquatic therapy, yoga).
- **23 Consciousness:** Altered consciousness detection. ICD-10: R40.20. (Emergency).
- **24 Skin:** Wound care. ICD-10: L89.90. LMN Eligible: Yes (wound care).
- **25 Neuro-musculo-skeletal function:** MOBILITY AND FALL RISK. ICD-10: M62.81, R26.2, W19.XXXA. LMN Eligible: Yes (PT, OT, tai chi).
- **26 Respiration:** COPD, CHF. ICD-10: J44.1, J96.10. LMN Eligible: Yes (pulmonary rehab).
- **27 Circulation:** CHF, hypertension. ICD-10: I50.9, I10. LMN Eligible: Yes (cardiac rehab).
- **28 Digestion-hydration:** Dehydration/malnutrition. ICD-10: E86.0, R63.0. LMN Eligible: Yes (nutrition counseling).
- **29 Bowel function:** Incontinence. ICD-10: R15.9.
- **30 Urinary function:** UTI risk (confusion trigger). ICD-10: N39.0. LMN Eligible: Yes (urology).
- **31-33 Reproductive/Pregnancy/Postpartum:** Not primary for home care.
- **34 Communicable/infectious condition:** COVID, flu, pneumonia. ICD-10: J18.9.

**Domain 4: Health-Related Behaviors (8 problems)**

- **35 Nutrition:** WELLNESS ECOSYSTEM CORE. ICD-10: E11.9, E78.5. LMN Eligible: Yes (nutrition counseling).
- **36 Sleep and rest patterns:** CII dimension: Sleep Disruption. ICD-10: G47.00. LMN Eligible: Yes (sleep hygiene).
- **37 Physical activity:** WELLNESS ECOSYSTEM CORE. ICD-10: Z72.3. LMN Eligible: Yes (fitness programs).
- **38 Personal care:** ADLs. ICD-10: R26.89, Z74.1. LMN Eligible: Yes (personal care services).
- **39 Substance use:** Alcohol/drug screening. ICD-10: F10.20. LMN Eligible: Yes.
- **40 Family planning:** Not primary.
- **41 Health care supervision:** MEDICATION MANAGEMENT. ICD-10: Z79.899. LMN Eligible: Yes (pharmacy consultation).
- **42 Prescribed medication regimen:** Medication adherence. ICD-10: Z91.19. LMN Eligible: Yes (adherence programs).

**The Crosswalk Engine in CareOS**

```text
INPUT:  ICD-10 codes from discharge (e.g., I50.9, E11.9, Z87.39, F03.90)
                    ↓
STEP 1: Map to Omaha System problems (e.g., I50.9 → #27 Circulation)
                    ↓
STEP 2: Generate care plan using Omaha Intervention Scheme
                    ↓
STEP 3: Auto-populate LMN template (Diagnosis + Qualifying activities)
                    ↓
STEP 4: Populate Comfort Card tax categories (HSA auto-selected)
                    ↓
STEP 5: KBS outcome tracking (Knowledge, Behavior, Status ratings)
```

### PART 2: MASTER SYNTHESIS — DEEP DIVE INTO EVERY FEATURE NODE

**PILLAR 1: THE CATALYST (Psychology)**

- **Activation Energy:** First Time Bank task requires &lt;15 mins, zero travel (e.g., phone companionship). Target: &gt;60% first-offer acceptance.
- **Endowment Effect:** $100 membership instantly credits 40 hours. Framed as "wealth," not a coupon.
- **Propinquity Effect:** Matching algorithm weights proximity (&lt;0.5 mi gets 3x boost).
- **Loss Aversion:** 12-month credit expiry and LMN expiry warnings drive engagement and retention. "Without renewal, you lose $6,200/year in HSA tax savings."
- **Self-Verification Theory:** "I enjoy..." profiles align tasks with member identity.
- **Signaling Theory:** Visible trust signals (Background Checked badge, ratings) reduce perceived risk.
- **Goal Gradient Effect:** Weekly streaks unlock recognition milestones.
- **Viral Loop:** 3rd completed task triggers "Refer a neighbor" prompt (5 bonus hours each).

**PILLAR 2: THE ENGINE (Product)**

- **Discharge Concierge:** BCH discharge triggers care team assembly within 24-48 hours. Zero-CAC acquisition channel.
- **Respite Emergency Fund:** 48 hours of immediate care for families in crisis, funded by Time Bank surplus ($3 from every $15/hr purchase + 0.1 hr Respite Default).
- **Time Bank Core:** Double-entry ledger with GPS-verified check-in/out and automated matching.
- **LMN Marketplace:** Physician-governed marketplace making community wellness HSA/FSA eligible.
- **Annual LMN Renewal:** Automated 12-month renewal cycle (retention engine).
- **Wearable Integration:** Apple Health API tracks vitals and detects anomalies (&gt;2 standard deviations).
- **Predictive Hospitalization:** ML model predicts risk 72-96 hours in advance using wearables + care notes.
- **Conductor Certification:** HSA-eligible training modules (e.g., Safe Transfers) that earn Time Bank hours.
- **Ambient Scribe (Omaha-Integrated):** Voice-to-text care logging for worker-owners powered by the Gemini API (`gemini-2.5-flash-native-audio-preview` or Web Audio + `gemini-3.1-flash`). The AI listens to the worker's spoken summary ("Mom was confused today and didn't eat much lunch"), automatically extracts the clinical concepts, and maps them to Omaha System problems (#21 Cognition, #28 Digestion-hydration). It generates structured FHIR Observations and a polished narrative note, reducing documentation time from 15 minutes to 30 seconds while ensuring perfect clinical coding.
- **Michaelis-Menten Dashboard:** Admin view tracking Time Bank liquidity. Flags ZIP codes where match latency exceeds 4 hours (below critical mass) or where the ratio of requests to active members is unbalanced.
- **Comfort Card Reconciliation:** Automated monthly statement generation that categorizes every transaction by payment source (HSA, PEPM, Time Bank, private pay) and IRS Pub 502 eligibility.

**PILLAR 3: THE OUTPUT (Macro)**

- **$364K Y1 Revenue:** Driven by BCH retainer, private pay, memberships, and assessments.
- **$0 Acquisition Cost:** Institutional channels (BCH, BVSD) and viral loops replace consumer marketing.
- **28-36% Tax Savings:** The LMN moat saves families $6K+/year.
- **Infinite Retention:** Leaving means losing the tax advantage on the entire wellness ecosystem.
- **$1.25M PACE Margin:** Predictive models prevent hospitalizations, increasing the PACE sub-capitation spread.
- **$100M+ Valuation:** Driven by proprietary clinical datasets, actuarial data, and federation licensing.
- **The Care UBI:** 40 hours/year of community care generates health data, not just economic data.
- **&lt;15% Turnover:** Worker-owners earn $25-28/hr + equity + benefits, ensuring relationship continuity.

### PART 3: WHAT GEMINI v3 ADDED (PRESERVE AND ENHANCE)

- **Admin.tsx:** Lead management portal. ENHANCE: Add CII score column, "Convert to Member" button.
- **Dashboard.tsx:** Conductor Dashboard prototype. ENHANCE: Connect to PostgreSQL, add wearable vitals, Omaha KBS trends, Comfort Card summary.
- **AIChat.tsx:** The Ambient Guide powered by `gemini-3.1-flash`. ENHANCE: This is now the primary way users interact with the public website. It auto-opens, holds the full context of the cooperative (Time Bank, LMN, 5 Sources), and proactively guides users to different pages. It also connects to the Omaha System to map caregiving challenges to clinical interventions.
- **server.ts:** Express server. ENHANCE: Add PostgreSQL connection and Aidbox proxy.
- **Google Sheets Setup:** Webhook integration for leads. PRESERVE as-is.

### CRITICAL IMPLEMENTATION NOTE

The Omaha System ↔ ICD-10 crosswalk is a configurable rules engine, not a static table. It must handle directionality, context, multi-mapping, and temporal changes. Store rules in Aidbox as a custom FHIR ConceptMap resource.

---

## ADDENDUM: PHASED DEPENDENCY MAP

```text
PHASE 1 (Build First — no dependencies)
  ├── User Auth + Role-Based Access
  ├── Family + CareRecipient CRUD
  ├── CII Assessment Engine
  ├── Time Bank Core (ledger + task CRUD + matching)
  ├── Secure Messaging
  ├── Conductor Dashboard (timeline view)
  ├── Membership + Stripe Payment
  └── Public Website (existing React components)

PHASE 2 (Build Second — depends on Phase 1)
  ├── CRI Assessment Engine ← depends on User Auth (MD role)
  ├── Worker Portal ← depends on CareInteraction model
  ├── LMN Generation + Signing ← depends on CRI + Medical Director
  ├── LMN Marketplace ← depends on LMN + WellnessProvider
  ├── Comfort Card ← depends on all payment sources existing
  ├── Wearable Integration ← depends on CareRecipient model
  ├── Employer Dashboard ← depends on CII aggregate queries
  ├── Background Check API ← depends on User model
  ├── Time Bank Behavioral Nudges ← depends on Time Bank Core + Notification system
  └── Worker Equity Tracking ← depends on CareInteraction logging

PHASE 3 (Build Third — depends on Phase 2)
  ├── Hospital HL7 Integration ← depends on CareRecipient + Assessment
  ├── Predictive Hospitalization ML ← depends on Wearable + CareInteraction data
  ├── PACE Data Exchange ← depends on full clinical data pipeline
  ├── Federation Multi-Tenancy ← depends on entire platform being stable
  ├── Physical/Virtual Comfort Card ← depends on Comfort Card reconciliation
  └── Advanced Analytics ← depends on 6+ months of operational data
```

---

## ADDENDUM: ARCHITECTURAL CORRECTIONS & ENHANCEMENTS (v4)

Based on a comprehensive review of the platform architecture, the following critical gaps and enhancements must be integrated into the build:

### 1. Clinical Taxonomy & The Omaha System

The Omaha System is the entire clinical foundation—the 42-problem taxonomy that makes every care interaction (professional, Time Bank, AND wellness) clinically documentable.

- **Omaha ↔ ICD-10 Crosswalk Engine:** A 5-step pipeline that auto-generates LMNs from hospital discharge codes, mapping ICD-10 to Omaha System problems. This is critical for HSA eligibility and reporting.
- **KBS Outcome Rating System:** Every Omaha problem must be rated on Knowledge, Behavior, and Status (1-5 scale) at admission, interim, and discharge. This justifies LMN renewals and proves efficacy to PACE/Medicare.
- **Omaha Coding for Time Bank Tasks:** Time Bank tasks must map to Omaha interventions (e.g., "Meals Delivered" = Omaha #35 Nutrition, Intervention: 01 Health Teaching). This makes neighbor-to-neighbor care clinically relevant.

### 2. Clinical Data & FHIR Resources

- **LOINC Codes for Wearables:** Apple Health data must be mapped to specific LOINC codes (e.g., 8867-4 for Heart Rate) and stored as FHIR `Observation` resources.
- **Missing FHIR Resources:** The Aidbox implementation must include `Observation` (for KBS ratings and vitals), `ConceptMap` (for the Omaha ↔ ICD-10 crosswalk), `CodeSystem` (for the Omaha taxonomy), `CareTeam`, and `Procedure` (for Conductor Certifications).
- **Aidbox Init Bundle:** A startup bundle is required to load the `CodeSystem`, `ConceptMap`, and `Questionnaire` resources into Aidbox on deployment.

### 3. Operational Data & PostgreSQL

- **Missing PostgreSQL Tables:** The schema must include `omaha_assessment`, `conductor_cert`, `referral`, `helped` (relation table for Time Bank cascade), and `member_of` (relation table for cooperative governance).
- **WebSocket Channels:** Ensure real-time WebSocket channels are configured for the Employer Dashboard to receive live, anonymized CII aggregations.

### 4. Behavioral Economics & Business Logic

- **Time Bank Respite Default:** A behavioral nudge where 0.1 hours of every 1 hour earned is auto-donated to the Respite Emergency Fund (opt-outable). This funds the safety net.
- **Time Bank $15/hr Revenue Split:** When a user buys Time Bank hours for $15/hr, the revenue splits: $12 to the coordination fund (background checks, platform costs) and $3 to the Respite Emergency Fund.
- **11th Enzyme Principle (The Liquidity Nudge):** Specific UI interventions to maintain Time Bank liquidity (e.g., prompting users with high balances to spend, or users in deficit to earn).
- **Conductor Certification Pricing:** Modules cost $0 but require Time Bank participation, or cost a nominal fee, yielding HSA-eligible training and Time Bank bonus hours.

### 5. Infrastructure & Testing

- **API Routes:** Dedicated Express routes for the Omaha crosswalk (`/api/omaha/crosswalk`) and KBS scoring (`/api/omaha/kbs`).
- **E2E Tests:** Cypress/Playwright tests specifically validating the Omaha Crosswalk Pipeline (ICD-10 in → LMN out).
- **Docker Compose:** A complete `docker-compose.yml` must be provided to spin up the Node.js API, PostgreSQL, and Aidbox locally for development.
- **Seed Data:** Seed scripts must use the concrete user stories (Lisa, Janet, Patricia) to populate realistic, interconnected data for demonstrations.

---

## FINAL INSTRUCTION

Build Phase 1 first. Get it deployed. Get 40 families using it. Then build Phase 2 with real user feedback. The data from Phase 1 usage (especially Time Bank velocity and CII trends) will inform every Phase 2 decision. Do not over-architect for Phase 3 concerns — build for today's 40 families, not tomorrow's federation.

The existing React communication suite (Website, ProductMap, Enzyme, CareUBI, Synthesis) should be integrated as the public-facing layer immediately. The CareOS platform features build behind a login wall alongside it.