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
- co-op.care workers earn $25-28/hr + equity + health insurance → <15% turnover vs. 77%
- Same caregiver stays. Relationship continuity is the product.
- Time Bank replaces 30-50% of paid hours with community care at $0 or $15/hr
- LMN makes wellness HSA/FSA eligible — 28-36% tax savings no agency offers
- The Conductor dashboard gives real-time visibility no agency provides
- W-2 skilled providers handle escalation internally — zero handoffs

**vs. Care.com / Honor / Papa:**
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
- Workers must be able to log care interactions: tasks performed, duration, change-in-condition observations, photos (with consent)
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
- $25-28/hr + health insurance + equity accumulation (~$52K over 5 years)
- <15% annual turnover vs. 77% industry average
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
- React 18+ (TypeScript), Vite, PWA
- Tailwind CSS with centralized brand colors
- Web Speech API for narration features
- Recharts or Chart.js

**Backend:**
- Node.js (Express or Fastify)
- PostgreSQL (relational data)
- Redis (caching, real-time notifications)
- FHIR R4 / Aidbox (clinical data)

**Integrations:**
- Apple Health API, Stripe, Twilio, SendGrid, Google Maps API, DocuSign/HelloSign, Zoom API, HL7 FHIR

**Infrastructure:**
- Vercel (frontend), AWS/GCP (backend)
- HIPAA-compliant hosting (BAA)
- Docker, GitHub Actions

### What are the system requirements?

**Performance:** <2s page load, <30s match notification, <200ms API reads.
**Security:** HIPAA compliant, AES-256 at rest, TLS 1.3 in transit, RBAC, PHI audit logging, 2FA for clinical/admin roles, SOC 2 Type II target.
**Scalability:** Phase 1 (single server) → Phase 2 (horizontal scaling) → Phase 3 (microservices) → Federation (multi-tenant).
**Reliability:** 99.9% uptime SLA, 6-hour backups, graceful degradation.

### What are the key user flows?

**Flow 1: Conductor Daily Check**
See today's care timeline → review notes → check vitals → approve appointments → check Time Bank balance.

**Flow 2: Time Bank First Exchange**
Notification received → view details → accept → GPS check-in → complete task → GPS check-out → rate experience → credits added.

**Flow 3: Hospital Discharge Onboarding**
QR code scan → Pre-filled profile → rapid CII → membership payment → care team assembled → Conductor dashboard live.

**Flow 4: LMN Marketplace Booking**
Browse eligible programs → see HSA savings → book appointment → Comfort Card auto-charges HSA source.

**Flow 5: Employer CII Rollout**
HR uploads CSV → system sends invites → employees complete CII → HR sees aggregate dashboard → HR approves PEPM enrollment.

### What are the core interfaces?

1. **Conductor Dashboard (Mobile PWA)**: Single pane of glass for all care management.
2. **Time Bank Hub (Mobile PWA)**: Browse, accept, post, and track Time Bank exchanges.
3. **Worker-Owner Portal (Mobile + Desktop)**: Daily care delivery, documentation, equity tracking, governance.
4. **Medical Director Console (Desktop)**: Clinical oversight, LMN management, quality metrics.
5. **Admin/Coordinator Dashboard (Desktop)**: Operational management, Time Bank oversight, quality control.
6. **Employer Dashboard (Desktop)**: Workforce caregiver burden visibility and ROI tracking.
7. **Public Website + Communication Suite**: Convert visitors to founding families, serve investors/researchers/media.

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
- **Service level expectations:** Time Bank match <4 hours, Respite dispatch <4 hours, MD CRI review <24 hours, Care team assignment <48 hours.

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
- $25-28/hr worker-owner wage + equity (~$52K over 5 years)
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
- **Burnout detection:** Push (When >10 hrs/week)
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
- **SLA breach (match >4hr):** Push + SMS to coordinator (At 4hr mark)
- **Respite Fund low:** Email to admin (When <50 hours)
- **Background check expiring:** Email to member + admin (30 days before)
- **ZIP code below critical mass:** Weekly email to admin (Monday)

---

## ADDENDUM: CONCRETE USER STORIES

### Story 1: "Lisa at 2 AM" (The Origin Story)
Lisa (42, marketing manager, Denver) gets a call at 2 AM. Mom fell in Boulder. BCH admits her. Discharge is Thursday. Lisa can't move to Boulder — she has two kids and a job. She Googles "home care Boulder" and finds co-op.care.
**Thursday 11 AM:** Lisa scans QR code at Mom's bedside. Completes Mini CII (scores 24/30 — Red). Pays $100 membership. Gets 40 Time Bank hours instantly.
**Thursday 3 PM:** Care team assembled: Maria G. (W-2 caregiver) starts Monday. Janet R. (Time Bank neighbor) brings dinner tonight and tomorrow.
**Friday:** Lisa completes full CII (87/120 — Red Zone). Dr. Emdur does telehealth CRI assessment. Generates LMN covering tai chi, nutrition counseling, and aquatic therapy. Lisa books all three in the LMN Marketplace. All are now HSA-eligible.
**Monday:** Maria arrives at 9 AM. Lisa watches from Denver via the Conductor Dashboard. Maria's notes at 12:45 PM: "Good appetite at lunch. Walked to mailbox with rollator. Mentioned knee pain — noted in log." Lisa's Apple Watch data for Mom shows sleep was 6.2 hours (down from 7.1 average — flagged).
**Tuesday:** Lisa earns her first Time Bank hour: a 45-minute phone companionship call with Mr. Torres, another member's father. She does this from her couch after the kids go to bed. She starts doing it every Tuesday and Thursday.
**Month 3:** Lisa's CII has dropped from 87 to 62 (Yellow). She's sleeping better. She completed the Conductor Certification (Safe Transfers module). When she visits Mom, she helps with transfers herself. Maria notices the difference.
**Month 6:** Lisa refers her friend Karen (whose father-in-law is in Longmont). Karen signs up. Both get 10 bonus hours. The cascade continues.

### Story 2: "Janet the Neighbor" (Time Bank Viral Loop)
Janet (68, retired teacher, lives 0.3 miles from Mom's house) joined co-op.care through her church. She doesn't have a loved one in care. She just wants to help.
**Week 1:** Janet sees a notification: "A neighbor 0.3 miles from you needs meal delivery Mon/Wed/Fri." She accepts. Delivers soup and salad Monday. GPS logs her arrival at 11:15 AM, departure at 11:45 AM. +0.5 hours credited instantly. She gets a thank-you note from Lisa.
**Week 4:** Janet has earned 6 hours. Her streak badge says "4 weeks!" She hasn't spent any credits yet. She sees her Impact Score: 12. "Your meals allowed Lisa to keep working full-time instead of driving to Boulder 3x/week."
**Month 3:** Janet's husband needs knee surgery. She uses 8 hours of Time Bank credits: David M. mows the lawn while she's at the hospital. Rosa L. brings meals. A retired nurse checks on the surgical wound. Janet didn't have to ask her kids for help. The system she built for others caught HER.
**Month 6:** Janet teaches a "Cooking for Neighbors" workshop at the church. Earns 3 credits. Six people sign up for the Time Bank at the workshop. The cascade amplifies.

### Story 3: "BVSD HR Dashboard" (Employer Conversion)
Patricia Valderrama (Benefits Manager, BVSD) receives an email: "42% of your teachers are likely family caregivers. Here's the data."
**Week 1:** Patricia logs into the Employer Dashboard. Sees: 843 teachers completed the CII (49% of 1,717). 278 are active caregivers (33%). 21 are in Red Zone. 84 in Yellow. 173 in Green. Estimated productivity loss: $1.1M/year.
**Week 2:** Patricia sees the ROI calculator: At $4.50/employee/month PEPM ($93K/year), co-op.care projects: 15 teachers stabilized from Red to Yellow, 40 teachers using Time Bank instead of sick days, 8 teachers retained who would have reduced hours. Projected savings: $287K/year. ROI: 3.1x.
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
- Auto-approved if fund balance >100 hours
- Coordinator approval if fund balance <100 hours
- Crisis = hospital discharge, fall, sudden health decline, caregiver hospitalization
- After 48 hours, family transitions to standard Time Bank + professional care

---

## ADDENDUM: ANTI-PATTERNS — WHAT NOT TO BUILD

1. **Do NOT build a marketplace where families browse and hire individual caregivers.** co-op.care is not Care.com. The cooperative assigns care teams based on clinical needs, family preferences, and geographic proximity. The Conductor picks favorites and rates workers, but she doesn't "shop" for them. The matching is algorithmic + coordinator-curated, not marketplace-driven.
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

**Test 1: Full Conductor Onboarding (must complete in <10 minutes)**
Visit homepage → complete Mini CII → create account → complete full CII → pay $100 → Time Bank balance shows 40 hours → Dashboard loads.

**Test 2: Time Bank Round Trip**
Conductor posts task → matched to neighbor → neighbor accepts → GPS check-in → GPS check-out → hours calculated (0.9 to member, 0.1 to Respite) → gratitude prompt → cascade updates.

**Test 3: LMN → HSA Booking**
Conductor has active LMN → opens LMN Marketplace → sees HSA Eligible badge → books session → Comfort Card charged to HSA source → Annual HSA total increments.

**Test 4: Change-in-Condition Escalation**
Worker logs care → flags "change in condition" (severity: monitor) → Conductor receives instant push → Medical Director receives in-queue notification → MD reviews within 24 hours → Conductor sees MD response.

**Test 5: Wearable Anomaly Detection**
Apple Watch reports resting HR 95 bpm (normal: 68) → system detects anomaly → Conductor receives push → Dashboard shows HR trend chart → One-tap button: "Escalate to Dr. Emdur".

**Test 6: Employer CII Rollout**
HR uploads CSV → system sends invites → employees complete CII → Employer dashboard shows aggregate data → Productivity calculator auto-populates → HR clicks "Activate PEPM".

**Test 7: Respite Emergency Fund Crisis**
Conductor triggers emergency → system dispatches up to 48 hours → auto-approved if fund >100 hours (manual if <100) → Time Bank neighbor matched for immediate companionship → W-2 caregiver assigned for next morning.

## ADDENDUM: DATABASE & FHIR INFRASTRUCTURE

### DATABASE ARCHITECTURE DECISION: PostgreSQL + Aidbox Dual-Layer

CareOS requires two types of data simultaneously:

1. **Operational data** — Time Bank credits, task matching, user profiles, notifications, Comfort Card transactions, cooperative governance, employer dashboards. This is multi-model data: relational, graph, time-series, and real-time.
2. **Clinical data** — FHIR R4 resources (Patient, CarePlan, Observation, Condition, Procedure, QuestionnaireResponse, Encounter, Practitioner, Organization). This must be HIPAA-compliant, interoperable with hospital systems, and queryable using standard FHIR APIs.

**The architecture: PostgreSQL handles operational data. Aidbox handles clinical data. They communicate via event-driven sync.**

### LAYER 1: PostgreSQL — OPERATIONAL DATABASE

**Why PostgreSQL (Not PostgreSQL Alone)**
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

**Why Aidbox (Not Building FHIR From Scratch)**
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
                   Event Sync Layer
                   (Aidbox Subscriptions +
                    PostgreSQL Live Queries)

  * Assessment scores stored in both:
    - PostgreSQL: operational scoring, zone classification, trend queries
    - Aidbox: FHIR QuestionnaireResponse for clinical interoperability
```

**Sync Rules**
- **AIDBOX → POSTGRESQL:** New Encounter created → Generate Comfort Card transaction; Vitals Observation anomaly → Create notification in PostgreSQL.
- **POSTGRESQL → AIDBOX:** CII assessment completed → Create QuestionnaireResponse in Aidbox; Worker logs care interaction → Create Encounter + Observations in Aidbox.

## ADDENDUM: CLINICAL TAXONOMY & FEATURE DEEP DIVE

### PART 1: THE OMAHA SYSTEM ↔ ICD-10 CROSSWALK

**Why This Matters**
co-op.care operates at the intersection of community care (documented in the Omaha System) and clinical billing (documented in ICD-10-CM). The crosswalk enables:
1. **LMN generation:** Auto-maps Omaha System problems to ICD-10 codes that justify HSA/FSA eligibility under IRS Pub 502.
2. **BCH discharge integration:** Translates ICD-10 codes into Omaha System problems for community care planning.
3. **CMS reporting:** Bridges the Omaha System (community nursing standard) with ICD-10 (ACCESS, LEAD, GUIDE requirements).
4. **CII/CRI scoring:** Maps clinical conditions to caregiver burden dimensions.
5. **Predictive models:** Wearable anomaly detection generates Omaha System observations that map to ICD-10 for clinical escalation.

**The Omaha System: 42 Problems × 4 Domains**
- **Domain 1: Environmental** (e.g., Income, Sanitation, Residence, Neighborhood Safety)
- **Domain 2: Psychosocial** (e.g., Communication with community resources, Social contact, Role change, Caretaking/parenting)
- **Domain 3: Physiological** (e.g., Cognition, Pain, Neuro-musculo-skeletal function, Circulation, Digestion-hydration)
- **Domain 4: Health-Related Behaviors** (e.g., Nutrition, Sleep and rest patterns, Physical activity, Personal care)

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
- **Activation Energy:** First Time Bank task requires <15 mins, zero travel (e.g., phone companionship).
- **Endowment Effect:** $100 membership instantly credits 40 hours. Framed as "wealth," not a coupon.
- **Propinquity Effect:** Matching algorithm weights proximity (<0.5 mi gets 3x boost).
- **Loss Aversion:** 12-month credit expiry and LMN expiry warnings drive engagement and retention.
- **Self-Verification Theory:** "I enjoy..." profiles align tasks with member identity.
- **Signaling Theory:** Visible trust signals (Background Checked badge, ratings) reduce perceived risk.
- **Goal Gradient Effect:** Weekly streaks unlock recognition milestones.
- **Viral Loop:** 3rd completed task triggers "Refer a neighbor" prompt (5 bonus hours each).

**PILLAR 2: THE ENGINE (Product)**
- **Discharge Concierge:** BCH discharge triggers care team assembly within 24-48 hours.
- **Respite Emergency Fund:** 48 hours of immediate care for families in crisis, funded by Time Bank surplus.
- **Time Bank Core:** Double-entry ledger with GPS-verified check-in/out and automated matching.
- **LMN Marketplace:** Physician-governed marketplace making community wellness HSA/FSA eligible.
- **Annual LMN Renewal:** Automated 12-month renewal cycle (retention engine).
- **Wearable Integration:** Apple Health API tracks vitals and detects anomalies (>2 standard deviations).
- **Predictive Hospitalization:** ML model predicts risk 72-96 hours in advance using wearables + care notes.
- **Conductor Certification:** HSA-eligible training modules (e.g., Safe Transfers) that earn Time Bank hours.

**PILLAR 3: THE OUTPUT (Macro)**
- **$364K Y1 Revenue:** Driven by BCH retainer, private pay, memberships, and assessments.
- **$0 Acquisition Cost:** Institutional channels (BCH, BVSD) and viral loops replace consumer marketing.
- **28-36% Tax Savings:** The LMN moat saves families $6K+/year.
- **Infinite Retention:** Leaving means losing the tax advantage on the entire wellness ecosystem.
- **$1.25M PACE Margin:** Predictive models prevent hospitalizations, increasing the PACE sub-capitation spread.
- **$100M+ Valuation:** Driven by proprietary clinical datasets, actuarial data, and federation licensing.
- **The Care UBI:** 40 hours/year of community care generates health data, not just economic data.
- **<15% Turnover:** Worker-owners earn $25-28/hr + equity + benefits, ensuring relationship continuity.

### PART 3: WHAT GEMINI v3 ADDED (PRESERVE AND ENHANCE)
- **Admin.tsx:** Lead management portal. ENHANCE: Add CII score column, "Convert to Member" button.
- **Dashboard.tsx:** Conductor Dashboard prototype. ENHANCE: Connect to PostgreSQL, add wearable vitals, Omaha KBS trends, Comfort Card summary.
- **AIChat.tsx:** AI caregiving advice. ENHANCE: Connect to Omaha System to map challenges to interventions.
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

## FINAL INSTRUCTION

Build Phase 1 first. Get it deployed. Get 40 families using it. Then build Phase 2 with real user feedback. The data from Phase 1 usage (especially Time Bank velocity and CII trends) will inform every Phase 2 decision. Do not over-architect for Phase 3 concerns — build for today's 40 families, not tomorrow's federation.

The existing React communication suite (Website, ProductMap, Enzyme, CareUBI, Synthesis) should be integrated as the public-facing layer immediately. The CareOS platform features build behind a login wall alongside it.
