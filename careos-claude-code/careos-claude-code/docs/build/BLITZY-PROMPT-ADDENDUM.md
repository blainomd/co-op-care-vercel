# co-op.care CareOS — ADDENDUM
# Paste this AFTER the main Blitzy prompt. It provides the structured data models,
# concrete user stories, notification architecture, and anti-patterns that Blitzy's
# documentation says dramatically improve output quality.

---

## DATA MODELS

### Core Entities & Relationships

```
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
  ├── balanceEarned (decimal, hours)  — hours earned through reciprocity
  ├── balanceMembership (decimal, hours)  — hours from annual membership floor
  ├── balanceBought (decimal, hours)  — hours purchased at $15/hr
  ├── balanceDeficit (decimal, hours, max -20)
  ├── lifetimeEarned (decimal)
  ├── lifetimeSpent (decimal)
  ├── lifetimeGiven (decimal)  — hours of help provided to others
  ├── lifetimeDonatedToRespite (decimal)
  ├── impactScore (integer)  — calculated from lifetime activity + cascade multiplier
  ├── currentStreak (integer, weeks)
  ├── longestStreak (integer, weeks)
  └── lastActivityDate (date)

TimeBankTransaction
  ├── id (UUID)
  ├── account → TimeBankAccount (FK)
  ├── type (enum: earned, spent, bought, donated_to_respite, membership_credit, expired, respite_received, referral_bonus, training_bonus)
  ├── hours (decimal)
  ├── relatedTaskId → TimeBankTask (FK, nullable)
  ├── dollarAmount (decimal, nullable)  — for bought transactions
  ├── note (text, nullable)
  ├── createdAt (timestamp)
  └── expiresAt (timestamp, nullable)  — 12 months from earned date

TimeBankTask
  ├── id (UUID)
  ├── requestedBy → User (FK)  — the Conductor or family member
  ├── requestedFor → CareRecipient (FK)
  ├── assignedTo → User (FK, nullable)
  ├── taskType (enum: meals, rides, companionship, errands, yard_work, housekeeping, phone_companionship, tech_support, admin_help, pet_care, grocery_run, teaching)
  ├── isRemote (boolean)
  ├── description (text)
  ├── address (address object, nullable)  — null for remote tasks
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
  ├── matchScore (decimal)  — algorithm confidence
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
  ├── vitalsRecorded (JSON — BP, HR, temp, SpO2, pain scale — all nullable)
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
  ├── expirationDate (date)  — 12 months from issued
  ├── renewalReminderSentAt (timestamp[], nullable)  — 60/30/7 day reminders
  ├── signatureUrl (url, nullable)
  └── irsCategory (string)  — IRS Pub 502 category code

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
  ├── qualifyingConditions (string[])  — what diagnoses make this HSA-eligible
  ├── irsPub502Category (string)
  ├── pricePerSession (decimal)
  ├── schedule (JSON — recurring schedule)
  ├── maxParticipants (integer, nullable)
  └── isActive (boolean)

ComfortCard
  ├── id (UUID)
  ├── family → Family (FK)
  ├── transactions → ComfortCardTransaction[] (has_many)
  ├── monthlyStatements → MonthlyStatement[] (has_many)
  └── annualHsaTotal (decimal)  — running total for tax year

ComfortCardTransaction
  ├── id (UUID)
  ├── comfortCard → ComfortCard (FK)
  ├── date (date)
  ├── description (string)
  ├── amount (decimal)
  ├── paymentSource (enum: hsa_fsa, employer_pepm, ltci_reimbursement, pace_subcap, timebank_credit, private_pay)
  ├── isHsaEligible (boolean)
  ├── irsPub502Category (string, nullable)
  ├── relatedInteractionId (UUID, nullable)  — links to CareInteraction or WellnessBooking
  └── createdAt (timestamp)

WorkerEquity
  ├── id (UUID)
  ├── worker → User (FK)
  ├── hoursWorkedThisQuarter (decimal)
  ├── equityRatePerHour (decimal)  — set by cooperative board
  ├── accumulatedEquity (decimal)
  ├── vestedEquity (decimal)  — 0 until 1-year probation passes
  ├── vestingDate (date, nullable)
  ├── patronageDividends → PatronageDividend[] (has_many)
  └── lastCalculatedAt (timestamp)

RespiteEmergencyFund
  ├── id (singleton)
  ├── balanceHours (decimal)
  ├── balanceDollars (decimal)  — from $15/hr surplus
  ├── lifetimeDisbursedHours (decimal)
  ├── autoApprovalThreshold (decimal, default: 100 hours)  — auto-approve if balance above this
  └── transactions → RespiteFundTransaction[] (has_many)

Notification
  ├── id (UUID)
  ├── userId → User (FK)
  ├── type (enum — see Notification Architecture below)
  ├── title (string)
  ├── body (text)
  ├── data (JSON — contextual payload)
  ├── channel (enum: push, sms, email, in_app)
  ├── status (enum: pending, sent, delivered, read, failed)
  ├── scheduledFor (timestamp, nullable)
  ├── sentAt (timestamp, nullable)
  └── readAt (timestamp, nullable)
```

### Key Relationships
```
Family ──has_one──> TimeBankAccount
Family ──has_one──> ComfortCard
Family ──has_one──> CareRecipient
Family ──has_many──> Assessment
Family ──has_many──> CareInteraction
Family ──has_one──> LMN (active)

User ──can_be──> Conductor (role)
User ──can_be──> Worker-Owner (role)
User ──can_be──> Time Bank Member (role)
User ──can_be──> Medical Director (role)

TimeBankTask ──belongs_to──> Family (requested for)
TimeBankTask ──assigned_to──> User (Time Bank member)
TimeBankTask ──generates──> TimeBankTransaction (on completion)

CareInteraction ──belongs_to──> Family + Worker + CareRecipient
CareInteraction ──generates──> ComfortCardTransaction

LMN ──unlocks──> WellnessService[] (HSA eligibility)
LMN ──requires──> Medical Director signature
```

---

## NOTIFICATION ARCHITECTURE

Every notification has: trigger condition, recipient, channel(s), timing, and content template.

### Conductor Notifications
| Trigger | Channel | Timing | Content |
|---------|---------|--------|---------|
| Caregiver clock-in | Push | Instant | "{WorkerName} has arrived for {CareRecipientName}'s care session" |
| Caregiver clock-out | Push | Instant | "{WorkerName} has completed today's session. Tap to see notes." |
| Change-in-condition flagged | Push + SMS | Instant | "⚠️ {WorkerName} flagged a change for {CareRecipientName}: {brief}. Tap to review." |
| Wearable anomaly detected | Push | Within 5 min | "📊 {CareRecipientName}'s {metric} is outside normal range: {value}. Last 24hr trend attached." |
| Time Bank match available | Push | Instant | "A neighbor can help! {TaskType} — tap to confirm." |
| Time Bank task completed | Push | Instant | "✓ {NeighborName} completed {TaskType}. +{hours} hours to your balance." |
| LMN expiring in 60 days | Email + in-app | Scheduled | "Your Letter of Medical Necessity expires on {date}. Schedule a renewal with Dr. Emdur." |
| LMN expiring in 7 days | Push + SMS + email | Scheduled | "⚠️ LMN expires in 7 days. Without it, {annualSavings} in HSA tax savings stops." |
| CII zone transition | Push + email | After assessment | "Your Caregiver Intensity score moved from {oldZone} to {newZone}. Here's what that means." |
| Appointment reminder | Push | 24hr + 2hr before | "{CareRecipientName} has {appointmentType} tomorrow at {time}. {transport note}" |
| Monthly Comfort Card statement | Email | 1st of month | "Your co-op.care care summary for {month}: ${total} total, ${hsaSavings} HSA savings." |

### Time Bank Member Notifications
| Trigger | Channel | Timing | Content |
|---------|---------|--------|---------|
| Task match (skill + proximity) | Push | Instant | "🙋 A neighbor {distance} away needs help: {taskType} on {date} at {time}. {hours} credits." |
| Task accepted confirmation | Push | Instant | "Confirmed! You're helping {familyName} with {taskType} on {date}." |
| Post-task gratitude prompt | Push | 5 min after checkout | "How did it feel helping {familyName} today? Rate your experience." |
| Streak notification | Push | Weekly (Monday 9am) | "🔥 {streakWeeks} weeks in a row! You've earned {totalHours} hours this month." |
| Deficit nudge | Push + in-app | When balance hits -5 | "Your Time Bank balance is {balance}. Here are 3 tasks near you that match your skills." |
| Burnout detection | Push | When >10 hrs/week | "You've given {hours} hours this week — incredible! But take care of yourself too. Here are things others can do for YOU." |
| Refer-a-neighbor prompt | Push | After 3rd completed task | "You're making a real difference. Know someone who'd be great at this? Invite them → you both get 5 bonus hours." |
| Credit expiry warning | Push + email | 30 days before expiry | "{hours} hours expire on {date}. Use them or donate to the Respite Emergency Fund." |
| Impact chain update | In-app | Weekly | "Your help last week created a chain: you → {family1} → {family2}. {totalHouseholds} households touched." |

### Worker-Owner Notifications
| Trigger | Channel | Timing | Content |
|---------|---------|--------|---------|
| New assignment | Push + SMS | When scheduled | "New assignment: {CareRecipientName} on {date}, {startTime}-{endTime}. Tap for care plan." |
| Schedule change | Push + SMS | Instant | "Schedule update: {details}. Please confirm." |
| Equity milestone | In-app + email | Quarterly | "Your cooperative equity is now ${amount}. This quarter: +${increase}." |
| Governance vote open | Push + email | When vote opens | "🗳 New cooperative vote: {topic}. Voting closes {date}. Your voice matters." |
| Shift swap request | Push | Instant | "{WorkerName} would like to swap {date} with your {date}. Approve?" |
| Change-in-condition escalation | Push | When MD reviews | "Dr. Emdur reviewed your flag for {CareRecipientName}: {response}." |

### System / Admin Notifications
| Trigger | Channel | Timing | Content |
|---------|---------|--------|---------|
| SLA breach (match >4hr) | Push + SMS to coordinator | At 4hr mark | "⚠️ Unmatched Time Bank request: {taskType} for {familyName}. {hours} hours since posted." |
| Respite Fund low | Email to admin | When <50 hours | "Respite Emergency Fund balance: {hours} hours. Below safety threshold." |
| Background check expiring | Email to member + admin | 30 days before | "Background check expires {date} for {memberName}. Renewal required for continued Time Bank access." |
| ZIP code below critical mass | Weekly email to admin | Monday | "ZIP {code}: {members} active members, {matchTime} avg match time. Below Km threshold." |

---

## CONCRETE USER STORIES

### Story 1: "Lisa at 2 AM" (The Origin Story)
Lisa (42, marketing manager, Denver) gets a call at 2 AM. Mom fell in Boulder. BCH admits her. Discharge is Thursday. Lisa can't move to Boulder — she has two kids and a job. She Googles "home care Boulder" and finds co-op.care.

**Thursday 11 AM:** Lisa scans QR code at Mom's bedside. Completes Mini CII (scores 24/30 — Red). Pays $100 membership. Gets 40 Time Bank hours instantly.

**Thursday 3 PM:** Care team assembled: Maria G. (W-2 caregiver, 3 years experience, $27/hr) starts Monday. Janet R. (Time Bank neighbor, 0.3 miles from Mom) brings dinner tonight and tomorrow.

**Friday:** Lisa completes full CII (87/120 — Red Zone). Dr. Emdur does telehealth CRI assessment. Generates LMN covering tai chi, nutrition counseling, and aquatic therapy. Lisa books all three in the LMN Marketplace. All are now HSA-eligible.

**Monday:** Maria arrives at 9 AM. Lisa watches from Denver via the Conductor Dashboard. Maria's notes at 12:45 PM: "Good appetite at lunch. Walked to mailbox with rollator. Mentioned knee pain — noted in log." Lisa's Apple Watch data for Mom shows sleep was 6.2 hours (down from 7.1 average — flagged).

**Tuesday:** Lisa earns her first Time Bank hour: a 45-minute phone companionship call with Mr. Torres, another member's father. She does this from her couch after the kids go to bed. She starts doing it every Tuesday and Thursday.

**Month 3:** Lisa's CII has dropped from 87 to 62 (Yellow). She's sleeping better. She completed the Conductor Certification (Safe Transfers module). When she visits Mom, she helps with transfers herself. Maria notices the difference.

**Month 6:** Lisa refers her friend Karen (whose father-in-law is in Longmont). Karen signs up. Both get 10 bonus hours. The cascade continues.

### Story 2: "Janet the Neighbor" (Time Bank Viral Loop)
Janet (68, retired teacher, lives 0.3 miles from Mom's house) joined co-op.care through her church (First Congregational, a faith community hub). She doesn't have a loved one in care. She just wants to help.

**Week 1:** Janet sees a notification: "A neighbor 0.3 miles from you needs meal delivery Mon/Wed/Fri." She accepts. Delivers soup and salad Monday. GPS logs her arrival at 11:15 AM, departure at 11:45 AM. +0.5 hours credited instantly. She gets a thank-you note from Lisa (1-tap gratitude prompt). Janet feels warm.

**Week 4:** Janet has earned 6 hours. Her streak badge says "4 weeks!" She hasn't spent any credits yet. She sees her Impact Score: 12. "Your meals allowed Lisa to keep working full-time instead of driving to Boulder 3x/week."

**Month 3:** Janet's husband needs knee surgery. She uses 8 hours of Time Bank credits: David M. mows the lawn while she's at the hospital. Rosa L. brings meals. A retired nurse checks on the surgical wound. Janet didn't have to ask her kids for help. The system she built for others caught HER.

**Month 6:** Janet teaches a "Cooking for Neighbors" workshop at the church. Earns 3 credits. Six people sign up for the Time Bank at the workshop. The cascade amplifies.

### Story 3: "BVSD HR Dashboard" (Employer Conversion)
Patricia Valderrama (Benefits Manager, BVSD) receives an email: "42% of your teachers are likely family caregivers. Here's the data."

**Week 1:** Patricia logs into the Employer Dashboard. Sees: 843 teachers completed the CII (49% of 1,717). 278 are active caregivers (33%). 21 are in Red Zone. 84 in Yellow. 173 in Green. Estimated productivity loss: $1.1M/year.

**Week 2:** Patricia sees the ROI calculator: At $4.50/employee/month PEPM ($93K/year), co-op.care projects: 15 teachers stabilized from Red to Yellow, 40 teachers using Time Bank instead of sick days, 8 teachers retained who would have reduced hours. Projected savings: $287K/year. ROI: 3.1x.

**Week 3:** BVSD signs. 1,717 employees enrolled. co-op.care sends CII invitations. Within 30 days, 60% complete the assessment.

---

## TIME BANK STATE MACHINE

```
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


DEFICIT RULES:
  - Member can go up to -20 hours
  - At -5: gentle nudge with skill-matched tasks nearby
  - At -10: stronger nudge with "94% of members who receive help give back within 2 weeks"
  - At -15: coordinator outreach (phone call)
  - At -20: no more tasks can be requested until balance improves
  - Deficit can be resolved by: earning (volunteering), buying ($15/hr), or membership renewal (40 hrs credited)

RESPITE EMERGENCY FUND:
  - Any family in crisis can receive up to 48 hours regardless of balance
  - Auto-approved if fund balance >100 hours
  - Coordinator approval if fund balance <100 hours
  - Crisis = hospital discharge, fall, sudden health decline, caregiver hospitalization
  - After 48 hours, family transitions to standard Time Bank + professional care
```

---

## ANTI-PATTERNS — WHAT NOT TO BUILD

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

## TEST SCENARIOS

### Critical Path Tests

**Test 1: Full Conductor Onboarding (must complete in <10 minutes)**
1. Visit homepage → click "Get Started"
2. Complete Mini CII (3 sliders) → see zone + score
3. Create account → verify email
4. Complete full CII (12 dimensions) → score matches expected zone
5. Pay $100 → Stripe confirms → membership active
6. Time Bank balance shows 40 hours
7. Dashboard loads with empty care timeline + "Build your team" prompt

**Test 2: Time Bank Round Trip**
1. Conductor posts task: "Ride to JCC, Tuesday 9:30am"
2. System matches to nearest qualified neighbor within 4 hours
3. Neighbor receives push notification → accepts
4. Both parties see confirmation
5. Neighbor arrives → GPS check-in (within 0.25 miles of address)
6. Task completes → GPS check-out
7. Hours calculated: check-out minus check-in, rounded to 0.25
8. Conductor's Time Bank balance decremented
9. Neighbor's Time Bank balance incremented (0.9 hrs to member, 0.1 to Respite)
10. Both receive gratitude prompt → rate interaction
11. Cascade visualization updates for both parties

**Test 3: LMN → HSA Booking**
1. Conductor has active LMN listing tai chi for fall prevention
2. Conductor opens LMN Marketplace → sees JCC tai chi ($15/class)
3. "HSA Eligible" badge visible → estimated savings shown
4. Conductor books session → Comfort Card charged to HSA source
5. Transaction appears in Comfort Card with IRS Pub 502 category
6. Annual HSA total increments
7. Optional: Time Bank ride auto-suggested for transportation

**Test 4: Change-in-Condition Escalation**
1. Worker Maria logs care interaction
2. Maria flags "change in condition" → selects severity "monitor"
3. Detail: "Decreased appetite, mentioned stomach pain"
4. Conductor receives instant push notification
5. Medical Director receives in-queue notification
6. Medical Director reviews within 24 hours → adds note
7. Conductor sees MD response in care timeline
8. If severity = "urgent": Conductor + MD both get SMS, not just push

**Test 5: Wearable Anomaly Detection**
1. CareRecipient's Apple Watch reports resting HR 95 bpm (normal baseline: 68)
2. System detects anomaly (>2 standard deviations)
3. Conductor receives push: "Mom's heart rate is elevated: 95 bpm (normal: 68). Tap for details."
4. Dashboard shows HR trend chart with anomaly highlighted
5. One-tap button: "Escalate to Dr. Emdur"
6. If sleep <4 hours for 2 consecutive nights: separate anomaly alert

**Test 6: Employer CII Rollout**
1. HR uploads CSV with 1,717 employee emails
2. System sends CII invitation emails (batch, rate-limited)
3. Each employee completes CII → results stored (anonymized to employer)
4. Employer dashboard shows: total invited, completed, % in each zone
5. Productivity calculator auto-populates: 278 caregivers × $5,600 = $1.56M estimated loss
6. HR clicks "Activate PEPM" → enrollment confirmed

**Test 7: Respite Emergency Fund Crisis**
1. Family's parent falls at 10 PM, admitted to ER
2. Conductor triggers emergency: shake phone or tap SOS button
3. System dispatches from Respite Fund: up to 48 hours
4. If fund balance >100 hours: auto-approved
5. If fund balance <100 hours: coordinator notified → manual approval within 1 hour
6. Time Bank neighbor matched for immediate companionship (within 2 hours)
7. W-2 caregiver assigned for next morning
8. After 48 hours: transition to standard Time Bank + professional care plan

---

## PHASED DEPENDENCY MAP

```
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
  ├── Predictive Hospitalization ML ← depends on Wearable + CareInteraction data (needs 3+ months of data)
  ├── PACE Data Exchange ← depends on full clinical data pipeline
  ├── Federation Multi-Tenancy ← depends on entire platform being stable
  ├── Physical/Virtual Comfort Card ← depends on Comfort Card reconciliation
  └── Advanced Analytics ← depends on 6+ months of operational data
```

---

## FINAL INSTRUCTION

Build Phase 1 first. Get it deployed. Get 40 families using it. Then build Phase 2 with real user feedback. The data from Phase 1 usage (especially Time Bank velocity and CII trends) will inform every Phase 2 decision. Do not over-architect for Phase 3 concerns — build for today's 40 families, not tomorrow's federation.

The existing React communication suite (Website, ProductMap, Enzyme, CareUBI, Synthesis) should be integrated as the public-facing layer immediately. The CareOS platform features build behind a login wall alongside it.
