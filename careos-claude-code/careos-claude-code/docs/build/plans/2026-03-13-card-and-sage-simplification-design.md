# Card + Sage: The Radical Simplification of co-op.care

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Collapse 117 routes and 118 feature files into exactly two surfaces — the Care Card (glanceable identity + 3 smart tiles) and Sage (voice-first conversational AI that handles everything else). The user should never need to read their phone to get the value of co-op.care.

**Architecture:** Card + Voice Drawer (Approach B). The Card is always visible (QR identity, balance, 3 role-aware tiles). A persistent mic button opens a half-screen voice drawer where Sage handles all interactions conversationally. All business logic moves server-side behind 5 API endpoints. 95+ UI components are archived; their logic is preserved in 12 Sage domain handlers.

**Tech Stack:** React 19, TypeScript 5, Vite 6.4, Tailwind CSS 4, Fastify 5, PostgreSQL 3, Aidbox FHIR R4, Redis 7, Google Cloud STT/TTS, Gemini Flash 2.0 (intent routing + Omaha coding).

---

## Table of Contents

1. [The Two Surfaces](#1-the-two-surfaces)
2. [The Card — What You See](#2-the-card)
3. [Sage Voice Drawer — What You Talk To](#3-sage-voice-drawer)
4. [Feature Absorption Map — Where 95+ Modules Go](#4-feature-absorption-map)
5. [Backend Architecture — The Brain](#5-backend-architecture)
6. [Sage Intent Router — 12 Domains](#6-sage-intent-router)
7. [Proactive Sage — Push Intelligence](#7-proactive-sage)
8. [Role-Aware Behavior](#8-role-aware-behavior)
9. [Business Rules Preserved](#9-business-rules-preserved)
10. [Clinical Systems Preserved](#10-clinical-systems-preserved)
11. [Migration Strategy](#11-migration-strategy)
12. [New File Manifest](#12-new-file-manifest)
13. [Deleted / Archived Files](#13-deleted-archived)
14. [Routes — Before and After](#14-routes)
15. [Verification Criteria](#15-verification)

---

## 1. The Two Surfaces

The entire co-op.care experience is two things:

1. **The Care Card** — a visual surface you glance at. QR identity, balance, 3 smart tiles. Always visible. No interaction required beyond tapping the QR for check-in.

2. **Sage** — a voice-first AI companion you talk to. Handles assessments, scheduling, billing, care logging, onboarding, messages, emergency, governance, LMN review — everything. Speaks back through device speakers or AirPods.

There is no sidebar. No navigation. No page hierarchy. No settings screen. No back button. One screen, one mic button, one experience.

```
┌─────────────────────────────────────┐
│  co-op.care              🌱 $285    │
│                                     │
│           ┌──────────┐              │
│           │          │              │
│           │ QR CODE  │              │
│           │          │              │
│           └──────────┘              │
│        Sarah Chen · Since 2026      │
├─────────────────────────────────────┤
│ ┌───────────┐┌───────────┐┌───────┐│
│ │ 🟢 CII    ││ 📅 Next   ││ ⏱ 12h ││
│ │ Green     ││ Thu 2pm   ││ of 40 ││
│ │ Zone      ││ w/ Rosa   ││→Rooted││
│ └───────────┘└───────────┘└───────┘│
├─────────────────────────────────────┤
│                                     │
│           🔴 Talk to Sage           │
│                                     │
└─────────────────────────────────────┘
```

---

## 2. The Card

### Layout

The Card occupies the full screen when Sage is closed. It has three sections:

**Header:** co-op.care wordmark (left), tier emoji + balance (right)

**Identity:** Centered QR code (deterministic pattern encoding `coop://m/{memberId}`), member name, "Member since YYYY" below. Tier-colored gradient background (seedling=sage→teal, rooted=copper→gold, canopy=navy→forest).

**Smart Tiles:** 3 tiles in a row below the card. Content is server-computed by `GET /api/card/tiles` based on the user's active role. The client never decides what to show.

### Role-Aware Tiles

| Role | Tile 1 | Tile 2 | Tile 3 |
|------|--------|--------|--------|
| **conductor** | CII zone (Green/Yellow/Red + score) | Next upcoming (visit, appt, or assessment) | Tier progress (X of Y hours → next tier) |
| **worker_owner** | Current/next shift (client name, time) | Hours today / this week | Earnings this period + equity vested |
| **timebank_member** | Available tasks nearby (count) | Time Bank balance (hours) | Streak (weeks + milestone name) |
| **medical_director** | LMNs pending signature (count) | CRI reviews pending (count) | Clinical alerts (count, red if urgent) |
| **admin** | Active matches today (count) | Open tasks unmatched (count) | Quality score (% + trend arrow) |
| **employer_hr** | Enrolled employees (count) | ROI this month ($ saved) | Utilization rate (%) |
| **wellness_provider** | Upcoming bookings (count) | Reviews this month | Availability status |

### Tile Data Contract

```typescript
interface CardTile {
  label: string;         // "CII Zone"
  value: string;         // "Green"
  sublabel?: string;     // "Score: 34/120"
  color: 'sage' | 'copper' | 'gold' | 'blue' | 'red' | 'yellow' | 'gray';
  icon?: string;         // SVG path or emoji
  pulse?: boolean;       // true = needs attention (red dot)
}

// GET /api/card/tiles returns exactly 3
interface CardTilesResponse {
  tiles: [CardTile, CardTile, CardTile];
  lastUpdated: string;   // ISO timestamp
}
```

### Card Identity Data

```typescript
interface CardIdentity {
  memberId: string;
  displayName: string;
  memberSince: string;        // "2026"
  tier: 'seedling' | 'rooted' | 'canopy';
  tierEmoji: string;           // "🌱" | "🌳" | "🏔️"
  balanceFormatted: string;    // "$285.00"
  balanceHours: number;        // 22.5
  qrData: string;              // "coop://m/{memberId}"
  activeRole: string;
  avatarUrl?: string;
}

// GET /api/card/identity
```

### QR Code Behavior

The QR code serves triple duty (unchanged from ComfortCardDigital design):

1. **Visit check-in** — Worker scans family's QR → GPS-verified clock-in
2. **Referral invite** — Neighbor scans QR → lands on `/qr/{code}` → onboarding flow via Sage
3. **Care team connection** — Provider scans QR → sees member's care context (role-gated)

QR is rendered client-side using the deterministic pattern generator from ComfortCardDigital.tsx (21×21 grid). No external QR library needed.

### Card Refresh

Card data refreshes:
- On app open (initial fetch)
- Every 60 seconds (polling)
- Immediately after Sage completes an action that changes tile data
- On push notification receipt

Uses React Query with `staleTime: 30_000` and `refetchInterval: 60_000`.

---

## 3. Sage Voice Drawer

### Interaction Model

A floating mic button sits at the bottom center of the screen, always visible over the Card. Three states:

1. **Idle** — Mic button shows "Talk to Sage" label. Card fully visible.
2. **Listening** — Button pulses red. Half-screen drawer slides up from bottom. Waveform animation shows audio capture. Card compresses to ~40% height (QR + tiles still visible).
3. **Responding** — Sage's text response appears in the drawer as a card. TTS plays the response aloud. User can interrupt with new voice input.

### Drawer Layout

```
┌─────────────────────────────────┐
│      [Card compressed ~40%]      │
├─────────────────────────────────┤
│                                 │
│  🔵 Sage                        │
│  ┌────────────────────────────┐ │
│  │ "Rosa is confirmed for     │ │
│  │  Thursday at 2pm. She'll   │ │
│  │  help with meal prep and   │ │
│  │  a walk."                  │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌─ You ──────────────────────┐ │
│  │ "Is someone coming         │ │
│  │  Thursday?"                │ │
│  └────────────────────────────┘ │
│                                 │
│       🔴 ● Listening...         │
│          ⌨️  text fallback       │
└─────────────────────────────────┘
```

### Auto-Dismiss

The drawer auto-dismisses after 10 seconds of silence, sliding down to reveal the full Card. The conversation history persists in the drawer — reopening shows the last exchange.

### Text Fallback

A small keyboard icon next to the mic allows typing instead of speaking. For situations where voice isn't appropriate (meeting, bus, library). Same Sage backend — just text input instead of STT.

### Inline Response Cards

Sage can render structured data inline in the conversation stream. These are NOT navigable pages — they're read-only cards embedded in chat:

| Response Type | When | Renders |
|---------------|------|---------|
| Schedule card | "When's my next visit?" | Date, time, caregiver name, task type |
| Assessment result | After CII/CRI conversation | Zone color, score, comparison to last |
| Balance card | "What's my balance?" | 6-field breakdown (earned/spent/bought/donated/expired/deficit) |
| Task card | "Any tasks near me?" | Task title, distance, hours, accept button |
| Team card | "Who's on mom's team?" | Avatar, name, role, last visit date |
| LMN card | "Any LMNs to sign?" (MD) | Patient, acuity, CRI score, sign button |
| Vote card | "What's up for vote?" (worker) | Proposal title, current tally, vote buttons |
| Confirmation card | After any action | Checkmark + summary of what was done |

These reuse the visual patterns from existing components but rendered as chat bubbles, not pages.

### Voice Pipeline

```
[Mic tap] → Web Speech API (client-side interim) → Google Cloud STT (final)
  → POST /api/sage/message { transcript, sessionId, role }
  → Gemini Flash intent classification (12 domains)
  → Domain handler (business logic + DB operations)
  → Response { text, cards[], actions[], ttsUrl? }
  → Google Cloud TTS → audio playback
  → Card tiles refresh if actions modified data
```

Latency target: <2 seconds from end of speech to start of Sage response.

---

## 4. Feature Absorption Map

Every existing feature goes to exactly one of three places:

### A. Absorbed into Card Tiles (server-computed, no interaction)

These features become **numbers** the user glances at:

| Old Module | Old Route | Card Tile | Server Computation |
|------------|-----------|-----------|-------------------|
| ConductorDashboard | /conductor | CII zone tile | Latest CII score → zone color |
| CareSchedule | /conductor/schedule | "Next visit" tile | Nearest future event |
| TimeBankWallet | /conductor/wallet | Balance in Card header | SUM(available hours) |
| StreakDashboard | /timebank/streak | Streak count in tile (timebank_member) | Current consecutive weeks |
| CareTierDashboard | /timebank/tier | Tier badge + progress | Rolling 12-month hours |
| NotificationsPage | /notifications | Badge count on header | Unread count |
| VitalsDashboard | /conductor/vitals | Folded into CII zone | CII zone IS the vital sign |
| WorkerDashboard | /worker | Shift + earnings tiles | Current shift + period totals |
| AdminDashboard | /admin | Match + task + quality tiles | Today's operational metrics |
| EmployerDashboard | /employer | Enrollment + ROI tiles | Period calculations |

### B. Absorbed into Sage Conversations (voice in → voice out)

These features become **things you talk about**:

| Old Module | Old Route | Sage Trigger (voice) | Sage Domain | What Sage Does |
|------------|-----------|---------------------|-------------|----------------|
| CIIAssessment | /assessments/cii | "How am I doing?" / daily check-in | assess | Asks 12 slider questions verbally, scores, reports zone, stores in PostgreSQL + syncs to Aidbox |
| MiniCII | /assessments/mini-cii | "Quick check" / proactive nudge | assess | 3 questions (physical, sleep, isolation), 30-second score |
| CRIAssessment | /assessments/cri | "Start risk assessment" (MD) | clinical | 14 factors verbally, weighted scoring, acuity classification |
| KBSAssessment | /assessments/kbs/trend | "How's mom's progress?" | assess | Knowledge-Behavior-Status outcome tracking, trend |
| TaskFeed | /timebank | "Any tasks near me?" | timebank | Reads top 3 proximity-sorted tasks, user accepts by voice |
| RequestHelp | /timebank/new | "I need help Thursday" | timebank | Captures need, category, time, matches, confirms |
| TaskAccept | /timebank/task/:id | "Tell me about that meals task" | timebank | Reads task detail, "Want to accept?" |
| ReferralFlow | /timebank/referral | "Invite my neighbor" | social | Generates share link, texts it via native share API |
| CascadeImpact | /timebank/cascade | "What's my impact?" | social | Reads cascade stats verbally: "Your 3 referrals brought in 4 more people and 111 total hours" |
| ImpactScore | /timebank/impact | "What's my impact score?" | social | Reads score + breakdown |
| GratitudeFlow | /timebank/gratitude | After task completion (proactive) | social | "Rosa helped with meals yesterday. Want to send a thank you?" |
| DeficitNudge | /timebank/deficit | Proactive at -5/-10/-15/-20 | timebank | "You're 5 hours in deficit. Want to earn some hours this week?" |
| ExpiryAlerts | /timebank/expiring | Proactive when credits approach 12mo | timebank | "You have 5 hours expiring in 2 weeks. Use them or donate to Respite Fund?" |
| NudgeOverlay | /timebank/nudge | Proactive weekly | timebank | "You haven't logged a visit this week. Everything OK?" |
| GPSCheckin | /timebank/gps | "I'm at Mrs. Chen's" (worker) | care | GPS verify (Haversine ≤0.25mi), clock in, start shift timer |
| TaskHistory | /timebank/history | "Show my recent tasks" | timebank | Reads last 5 tasks with dates and hours |
| EquityDashboard | /timebank/equity | "What's my equity?" (worker) | govern | Reads vested %, total value, vesting schedule |
| CareTimeline | /conductor/timeline | "What happened today?" | care | Reads recent events chronologically |
| CareTeam | /conductor/team | "Who's on mom's team?" | care | Lists team members, roles, last visit |
| CareLog | /worker/care-log | "Log a visit" / after shift auto | care | Structured capture: category, notes, duration, mood, vitals, Omaha auto-code |
| AmbientScribe | /worker/voice | Automatic during shift (ambient) | care | Passive voice capture → Omaha problem extraction → encounter creation |
| ShiftClock | /worker/clock | "I'm starting my shift" / "I'm done" | care | GPS verify, clock in/out, break tracking, billable hours calc, equity earned |
| ShiftSwap | /worker/swaps | "I can't make Thursday's shift" | schedule | Find replacement, notify, confirm swap |
| Governance | /worker/governance | "What's up for vote?" (worker) | govern | Read proposals, vote by voice (for/against/abstain) |
| IncidentReport | /worker/incident | "I need to report something" | care | Structured incident capture, routes to admin + MD if clinical |
| BackgroundCheck | /worker/verification | Status query only (proactive) | admin | "Your background check is complete" |
| CarePlanBuilder | /conductor/care-plan | "What's mom's care plan?" | care | Reads current plan, suggests updates based on CII/CRI |
| MedicationTracker | /conductor/medications | "What meds is mom taking?" | care | Lists medications, reminds about refills |
| EmergencyContacts | /conductor/emergency | "She fell!" / "Call 911" | emergency | Immediate escalation protocol: 911 suggestion, care team alerts, MD notification |
| PredictiveAlert | /conductor/predictive | Proactive when risk factors change | clinical | "Mom's fall risk increased. Want to talk about prevention?" |
| DischargeConcierge | /conductor/discharge | "Mom's coming home from the hospital" | care | Post-discharge protocol: schedule visits, medication review, follow-up |
| WearableSetup | /conductor/wearable | "Set up mom's Apple Watch" | care | Guided setup, vitals integration |
| ConductorCertification | /conductor/certification | "How do I get certified?" | social | Training modules, progress, next steps |
| CoopMembership | /conductor/membership | "What's my membership status?" | timebank | Membership level, renewal date, equity eligibility |
| ACPDashboard | /conductor/acp | "Let's talk about mom's wishes" | care | Full advance care planning interview: directives, goals, preferences, family conversations |
| AdvanceDirectiveWizard | /conductor/acp/directives | Part of ACP conversation | care | Guided directive completion through dialogue |
| GoalsOfCareGuide | /conductor/acp/goals | "What matters most to mom?" | care | Goals of care exploration |
| CarePreferences | /conductor/acp/preferences | "What does mom prefer for daily care?" | care | Preference documentation |
| PreparednessActivities | /conductor/acp/preparedness | "What should I prepare for?" | care | Preparedness checklist through conversation |
| FamilyConversationLog | /conductor/acp/conversations | "Log a family conversation" | care | Record family discussion about care decisions |
| SocialPrescribing | /conductor/social-rx | "What community resources are available?" | social | Community resource recommendations |
| LMNList | /lmn | "Any LMNs?" (MD) / "What's my LMN status?" | clinical | List/review/sign LMNs by voice |
| LMNDetail | /lmn/:id | "Tell me about this LMN" (MD) | clinical | Read LMN details, approve/reject by voice |
| LMNMarketplace | /lmn/marketplace | "How do I get an LMN?" | clinical | Explain process, schedule with Dr. Emdur |
| LMNRenewal | /lmn/renewal | Proactive at 60/30/7 days before expiry | clinical | "Your LMN expires in 30 days. Want to schedule renewal?" |
| BillingDashboard | /billing | "What have I spent this year?" | billing | Reads YTD total, HSA eligible amount, this month, LMN status |
| ComfortCard | /billing/comfort-card | "What's my card balance?" | billing | Balance, auto-reload status, recent charges |
| TaxStatement | /billing/tax-statement | "Get my tax statement" | billing | HSA/FSA annual summary, generates PDF |
| TaxCalculator | /billing/tax-calculator | "How much do I save with HSA?" | billing | Calculates savings based on spending |
| ComfortCardReconciliation | /billing/reconciliation | "Reconcile my card" (admin) | billing | Admin reconciliation workflow |
| ThreadList | /messages | "Any messages?" | message | Reads recent messages aloud, newest first |
| ComposeMessage | /messages/new | "Send Rosa a message" | message | Dictate message, confirm, send |
| MessageView | /messages/:id | "Read that message from Rosa" | message | Reads full thread aloud |
| ProfilePage | /profile | "Change my address" / "Update my phone" | admin | Conversational profile updates |
| SettingsPage | /settings | "Switch to worker role" | admin | Role switching, preferences via voice |
| CoverageIntelligence | /coverage | "What does my insurance cover?" | billing | Coverage lookup, network status |
| OnboardingFlow | /onboarding | First app open (automatic) | onboard | Full voice-guided onboarding: mini-CII → account → full CII → membership → CRI schedule |
| IdentityOnboarding | /onboarding/identity | Part of onboarding conversation | onboard | Identity verification through dialogue |
| FamilyOnboarding | /onboarding/family | Part of onboarding conversation | onboard | Family tree setup through dialogue |
| WorkerOnboarding | /onboarding/worker | Part of onboarding conversation | onboard | Worker application through dialogue |
| AdminDashboard (detailed) | /admin | "Give me today's report" | admin | Reads operational metrics |
| ManualMatch | /admin/matching | "Match task #123 to Rosa" | admin | Manual matching override |
| MemberManagement | /admin/members | "How many active members?" | admin | Member stats, search by name |
| RespiteFund | /admin/respite | "What's the respite fund balance?" | admin | Fund balance, recent disbursements |
| RespiteDispatch | /admin/dispatch | "Emergency respite for the Chen family" | admin | Priority respite dispatch |
| PACEDashboard | /admin/pace | "PACE integration status" | admin | PACE enrollment metrics |
| AdminAnalytics | /admin/analytics | "What are our key metrics?" | admin | KPI report by voice |
| QualityMetrics | /admin/quality | "Quality score this month" | admin | Quality metrics readout |
| BCHPartnership | /admin/bch | "BCH readmission update" | admin | Partnership metrics |
| MatchingQuality | /admin/matching-quality | "How's matching performing?" | admin | Algorithm performance metrics |
| CommunityDirectory | /admin/directory | "Look up Sarah Chen" | admin | Member lookup |
| EmployerROI | /employer/roi | "ROI report for Elevations" | admin | Employer-specific ROI |
| EnrollmentView | /employer/enrollment | "Enrollment numbers" | admin | Current enrollment stats |
| WellnessDirectory | /wellness | "Any yoga classes available?" | social | Provider search, availability |
| WellnessBookings | /wellness/bookings | "Book a PT session" | schedule | Booking flow by voice |
| TimeBankCommunity | /community | "How's the community doing?" | social | Community stats, impact stories |
| ViralWaitlist | /waitlist | Part of referral flow | social | Waitlist signup through conversation |
| NeighborLanding | /neighbors | QR scan → Sage onboarding | onboard | Referred user starts with Sage |
| NeighborInviteLanding | /invite | QR scan → Sage onboarding | onboard | Invitation landing → Sage |
| CatalystDashboard | /timebank/catalyst | "What's my catalyst score?" | social | Founder challenge progress |
| EndowmentAnimation | /timebank/endowment | Part of catalyst conversation | social | Endowment impact explanation |

### C. Deleted — No Longer Needed

| Old Component | Why Deleted |
|--------------|-------------|
| Sidebar.tsx | No navigation |
| PageHeader.tsx | No page hierarchy |
| RoleSwitch.tsx | Sage knows your role |
| RoleGate.tsx | Server enforces role access |
| QuickActions.tsx | Sage IS the quick action |
| All 117 route lazy imports | 4 routes replace them |
| Tab bars, breadcrumbs, back buttons | One screen |
| Search/filter UIs | "Show me tasks about meals" |
| Form components (select, checkbox) | Voice input replaces forms |
| Modal/dialog components | Sage responses replace modals |

---

## 5. Backend Architecture

### API Surface (5 endpoints replace 50+)

```typescript
// Card data
GET  /api/card/identity       // QR data, name, tier, balance, member info
GET  /api/card/tiles          // 3 role-aware tiles (server-computed)

// Sage conversation
POST /api/sage/message        // { transcript, sessionId, role } → { text, cards, actions, ttsUrl }
WS   /api/sage/stream         // Real-time voice: STT chunks → Sage responses → TTS audio
POST /api/sage/action         // Sage-initiated side effects (schedule, log, assess, match)
```

### Server Module Structure

```
src/server/modules/
  card/
    tiles.ts              — Role-aware tile computation
    identity.ts           — Member card data
  sage/
    intent-router.ts      — Gemini Flash 12-domain classifier
    conversation.ts       — Session management, memory, context
    tts.ts                — Google Cloud Text-to-Speech
    stt.ts                — Google Cloud Speech-to-Text
    proactive.ts          — Push notification triggers + scheduled checks
    domains/
      care.ts             — Visit logging, Omaha coding, ACP, care plan, team, timeline
      schedule.ts         — Appointments, visits, shift management
      assess.ts           — CII, mini-CII, CRI, KBS (conversational versions)
      timebank.ts         — Balance, earn, spend, donate, tasks, matching, streaks
      billing.ts          — Comfort Card, HSA, LMN questions, tax, reconciliation
      onboard.ts          — Full onboarding flow via voice
      message.ts          — Read, reply, compose messages
      emergency.ts        — 911 escalation, care team alerts, MD notification
      social.ts           — Referrals, community, cascade, catalyst, gratitude
      govern.ts           — Voting, proposals, equity (worker-owners)
      clinical.ts         — LMN review/sign, CRI review, alerts (MD-gated)
      admin.ts            — Matching, quality, analytics, members, respite
```

### Intent Router

Every voice input is classified by Gemini Flash into one of 12 domains + an intent within that domain:

```typescript
interface IntentClassification {
  domain: 'care' | 'schedule' | 'assess' | 'timebank' | 'billing' |
          'onboard' | 'message' | 'emergency' | 'social' | 'govern' |
          'clinical' | 'admin';
  intent: string;        // e.g., "check_balance", "log_visit", "sign_lmn"
  confidence: number;    // 0-1
  entities: Record<string, string>;  // extracted: { date: "Thursday", person: "Rosa" }
  requiresRole?: string; // if intent is role-gated
}
```

### Conversation Session

```typescript
interface SageSession {
  sessionId: string;
  userId: string;
  activeRole: string;
  messages: SageMessage[];
  activeFlow?: string;          // Multi-turn flow in progress (e.g., "cii_assessment")
  flowState?: Record<string, any>; // Flow-specific state (e.g., CII scores so far)
  context: {
    careRecipientName?: string;
    lastCIIZone?: string;
    lastVisitDate?: string;
    upcomingEvent?: string;
  };
  createdAt: string;
  lastActiveAt: string;
}
```

Sessions persist in PostgreSQL. Sage remembers context within a session ("she" = the care recipient mentioned earlier). Sessions expire after 24 hours of inactivity.

---

## 6. Sage Intent Router — 12 Domains in Detail

### Domain: `care`
**Intents:** log_visit, view_timeline, view_team, build_care_plan, track_medications, acp_start, acp_directives, acp_goals, acp_preferences, acp_preparedness, acp_conversation_log, ambient_scribe, discharge_protocol, wearable_setup, incident_report
**Business rules preserved:**
- Omaha auto-coding from voice (13 keyword sets → 42 problems)
- Care log categories: 10 types with SVG icons and suggested Omaha problems
- Alert levels: normal, monitor, alert
- Mood rating: 1-5 scale
- Optional vitals: BP, HR, temp, SpO2, pain
- ACP: 5 modules (directives, goals, preferences, preparedness, conversations)
- GPS verification: Haversine ≤0.25 miles for check-in/out

### Domain: `schedule`
**Intents:** next_visit, request_visit, confirm_visit, cancel_visit, shift_swap, book_wellness
**Business rules preserved:**
- Matching weights: identity-matched 2×, <0.5mi 3×, 0.5-1mi 2×, 1-2mi 1×, >2mi remote only
- Worker availability checking
- Conflict detection

### Domain: `assess`
**Intents:** start_cii, start_mini_cii, start_cri, view_kbs_trend, view_assessment_history
**Business rules preserved:**
- CII: 12 dimensions scored 1-10, total /120. Zones: Green ≤40, Yellow 41-79, Red ≥80
- Mini CII: 3 dimensions (physical care, sleep disruption, social isolation), /30. Zones: Green ≤11, Yellow 12-20, Red ≥21
- CRI: 14 factors with fixed PRD weights, range 14.4-72.0. Acuity: low/moderate/high/critical. LMN eligible if ≥45
- KBS: Knowledge 1-5, Behavior 1-5, Status 1-5 per Omaha problem
- All stored in PostgreSQL + synced to Aidbox as QuestionnaireResponse

**Conversational CII flow (example):**
```
Sage: "Let's check in on how you're doing. On a scale of 1 to 10, how much
       physical strain are you feeling from caregiving right now?"
User: "About a 6"
Sage: "Got it. And how about your sleep — how disrupted has it been?"
User: "Maybe a 4, it's been better"
[...continues through 12 dimensions...]
Sage: "Your score is 52 out of 120 — that's Yellow Zone. It means you're
       carrying a real load. Last month you were at 45. Want to talk about
       respite options?"
```

### Domain: `timebank`
**Intents:** check_balance, view_tasks, accept_task, complete_task, buy_hours, donate_hours, view_streak, view_expiring, earn_hours
**Business rules preserved:**
- Double-entry ledger: earned, spent, bought, donated, expired, deficit
- $15/hr cash purchase: $12 coordination + $3 Respite Fund
- 40 hr/year membership floor
- -20 hr deficit max
- 12-month graduated expiry → auto-donate to Respite
- Behavioral nudges at -5/-10/-15/-20 deficit
- Streak milestones: 4w "Helping Hand" +2hrs, 8w "Steady Heart" +3hrs, 12w "Care Champion" +5hrs, 26w +10hrs, 52w "Annual Guardian" +20hrs
- Respite Default: 0.9 hrs to member + 0.1 hrs to Respite Fund (opt-out-able, genuinely easy)
- Task types map to Omaha problems (12 mappings, immutable)

### Domain: `billing`
**Intents:** check_balance, view_transactions, hsa_eligibility, lmn_status, tax_statement, card_settings, buy_credits, reconcile
**Business rules preserved:**
- Comfort Card: prepaid care account, HSA/FSA eligible with active LMN
- Auto-reload: threshold + amount settings
- HSA/FSA eligibility requires active LMN on file
- Tax statement: annual HSA/FSA summary generation
- IRS Publication 502 auto-tagging of eligible expenses

### Domain: `onboard`
**Intents:** start_onboarding, create_account, identity_verify, family_setup, worker_apply
**Business rules preserved:**
- 6-step flow: mini-CII → results → account → full CII → membership ($100) → CRI schedule → complete
- Target: <10 minutes
- Zone-aware messaging (Green/Yellow/Red different copy)
- 1 free Care Credit at completion
- Email, phone, password validation

### Domain: `message`
**Intents:** read_messages, read_thread, compose_message, reply_message
**Business rules preserved:**
- Thread-based messaging
- Read aloud newest first
- Dictate replies

### Domain: `emergency`
**Intents:** call_911, alert_team, fall_detected, breathing_emergency, unresponsive
**Business rules preserved (from Sage escalation rules):**
- Immediate (suggest 911): chest pain, breathing difficulty, stroke symptoms, unresponsiveness, severe bleeding, suicidal ideation
- Urgent (suggest calling doctor): new confusion >1hr, fall with inability to bear weight, medication error, fever >101.5°F
- Monitor (suggest Time Bank): increasing nighttime confusion, weight loss >5% in 1 month, CII >28 (high burnout), missed meds >2/week

### Domain: `social`
**Intents:** invite_neighbor, view_impact, view_cascade, catalyst_status, community_stats, gratitude_send, wellness_search
**Business rules preserved:**
- Referral bonus: both parties earn 5 hours
- Cascade visualization: multi-hop referral tree
- Viral coefficient tracking
- Catalyst personas and founder challenge

### Domain: `govern`
**Intents:** view_proposals, vote, view_equity, view_governance_stats
**Business rules preserved:**
- One worker-owner, one vote
- Simple majority + 50% participation requirement
- Proposal categories: policy, budget, membership, operations
- Equity tiers: 5-year vesting schedule
- Vote options: for, against, abstain

### Domain: `clinical`
**Intents:** review_lmn, sign_lmn, review_cri, view_alerts, approve_assessment
**Role gate:** medical_director only
**Business rules preserved:**
- LMN lifecycle: draft → pending_signature → active → expiring → expired → revoked
- LMN renewal alerts at 60/30/7 days
- CRI review workflow with MD approval
- Acuity classification determines priority
- Clinical alerts routing

### Domain: `admin`
**Intents:** daily_report, manual_match, member_lookup, respite_balance, respite_dispatch, quality_metrics, matching_quality, pace_status, bch_metrics, analytics
**Role gate:** admin only
**Business rules preserved:**
- Matching algorithm monitoring
- Quality metrics (KPIs)
- Respite Fund management
- PACE integration
- BCH partnership tracking
- Community directory search

---

## 7. Proactive Sage — Push Intelligence

Sage doesn't just answer — it initiates. These are server-scheduled push notifications that pre-load Sage's message in the drawer:

| Trigger | When | Sage Says | Domain |
|---------|------|-----------|--------|
| Morning check-in | 8am daily | "Good morning Sarah. Rosa is coming at 2 today. Your CII is green. Anything on your mind?" | care |
| Post-visit auto-log | After shift clock-out | "How did the visit with Rosa go? Want to log anything?" | care |
| CII zone change | Score crosses threshold | "Your burnout score moved to yellow zone. Want to talk about respite?" | assess |
| Credit expiry | 30 days before 12mo | "You have 5 hours expiring in 2 weeks. Use them or donate to Respite Fund?" | timebank |
| Weekly summary | Sunday 7pm | "This week: 3 visits, 8 hours, CII green. You're 28 hours from Rooted tier." | social |
| Inactivity check | No activity 7 days | "Haven't heard from you. Everything OK with mom?" | care |
| LMN expiry | 60/30/7 days | "Your LMN expires in 30 days. Want to schedule renewal?" | clinical |
| Deficit nudge | At -5/-10/-15/-20 | "You're 5 hours in deficit. Want to earn some hours this week?" | timebank |
| Streak at risk | 6 days since last task | "Your 12-week streak is at risk! Complete a task by Sunday." | timebank |
| Milestone reached | Streak hits 4/8/12/26/52 | "12 weeks! You're a Care Champion. You earned 5 bonus hours." | social |
| New task nearby | Task posted within 1mi | "New task: meal prep for Mrs. Chen, 0.3 miles away. Interested?" | timebank |
| Governance vote open | New proposal created | "New proposal: 'Expand wellness partnerships.' Voting closes Friday." | govern |
| Shift reminder | 1 hour before shift | "Reminder: you're at the Johnsons' at 2pm today." | schedule |
| Background check complete | Checkr webhook | "Your background check cleared. You're ready to accept tasks." | admin |

### Implementation

Proactive triggers run as cron jobs in the Fastify server:

```typescript
// src/server/modules/sage/proactive.ts
export const PROACTIVE_TRIGGERS = [
  { name: 'morning_checkin', cron: '0 8 * * *', handler: morningCheckin },
  { name: 'weekly_summary', cron: '0 19 * * 0', handler: weeklySummary },
  { name: 'expiry_check', cron: '0 9 * * 1', handler: expiryCheck },
  { name: 'streak_risk', cron: '0 10 * * 5', handler: streakRisk },
  // ...
];
```

Each handler queries PostgreSQL for qualifying users, generates personalized Sage messages, and sends push notifications via Web Push API + Twilio SMS fallback.

---

## 8. Role-Aware Behavior

Sage adapts its personality and capabilities based on the user's active role:

| Role | Sage Personality | Gated Capabilities |
|------|-----------------|-------------------|
| **conductor** | Warm, supportive, "you're doing great" | Care logging, ACP, emergency, family-centric |
| **worker_owner** | Professional, cooperative, "your shift" | Clock in/out, care log, incident, governance, equity |
| **timebank_member** | Encouraging, community-focused | Task feed, accept/complete, streaks, referrals |
| **medical_director** | Clinical, efficient, "review queue" | LMN sign, CRI review, clinical alerts |
| **admin** | Operational, data-driven | Matching, quality, respite, analytics |
| **employer_hr** | ROI-focused, enrollment metrics | Enrollment, ROI report, utilization |
| **wellness_provider** | Booking-focused, availability | Bookings, listings, reviews |

Role is set at login (single selection) and stored in the JWT. Multi-role users can switch by saying "Switch to worker role" → Sage confirms, re-fetches tiles.

---

## 9. Business Rules Preserved (Complete Reference)

Every business rule from `business-rules.ts` and the feature components is preserved in the backend domain handlers. This section is the authoritative reference:

### Care Tiers (from care-tiers.ts)
- **Seedling** (0-39 hrs/year): 1.0× multiplier, 12mo credit expiry, standard matching, 5hr referral bonus, 3 Sage sessions/mo
- **Rooted** (40-119 hrs/year): 1.25× multiplier, 18mo credit expiry, priority matching, 7hr referral bonus, 10 Sage sessions/mo, vote on proposals, eligible to purchase equity
- **Canopy** (120+ hrs/year): 1.5× multiplier, credits never expire, first access + preferred helpers, 10hr referral bonus, unlimited Sage, submit proposals, full patronage dividends, board eligible

### Time Bank Ledger (from timebank.types.ts)
- Entry types: earned, spent, bought, donated, expired, deficit, referral_bonus, streak_bonus, compassion_match, dispute_reversal
- Task statuses: open, claimed, in_progress, completed, verified, disputed, cancelled, expired

### Matching Algorithm (from business-rules.ts)
- Identity-matched: 2× weight
- <0.5mi: 3× weight
- 0.5-1mi: 2× weight
- 1-2mi: 1× weight
- >2mi: remote only
- Active site radius: configurable (default from constants)

### Omaha System Auto-Coding (IMMUTABLE — from CLAUDE.md)
| Task Type | Omaha Problem | Code | Intervention |
|-----------|--------------|------|-------------|
| meals | Digestion-Hydration | #28 | Treatments/Procedures |
| rides | Communication w/ Community Resources | #05 | Case Management |
| companionship | Social Contact | #06 | Surveillance |
| phone_companionship | Social Contact | #06 | Surveillance |
| tech_support | Communication w/ Community Resources | #05 | Teaching/Guidance |
| yard_work | Residence | #03 | Treatments/Procedures |
| housekeeping | Sanitation | #02 | Treatments/Procedures |
| grocery_run | Digestion-Hydration | #28 | Case Management |
| errands | Communication w/ Community Resources | #05 | Case Management |
| pet_care | Social Contact | #06 | Surveillance |
| admin_help | Communication w/ Community Resources | #05 | Case Management |
| teaching | Varies by subject | — | Teaching/Guidance/Counseling |

### AmbientScribe Keyword → Omaha Mapping (from AmbientScribe.tsx)
| Keywords | Omaha Problem |
|----------|--------------|
| meal, food, eat, cook, nutrition, lunch, dinner, breakfast | #28 Digestion-Hydration |
| walk, exercise, move, mobility, transfer, fall | #35 Neuro-musculo-skeletal |
| medicine, medication, pill, prescription, dose | #37 Medication Regimen |
| bath, shower, hygiene, groom, dress, toilet | #31 Personal Care |
| mood, depress, anxious, lonely, isolat, sad | #38 Mental Health |
| sleep, rest, insomnia, nap, fatigue, tired | #34 Sleep/Rest |
| pain, hurt, ache, sore, discomfort | #30 Pain |
| breath, oxygen, cough, respiratory | #29 Respiration |
| blood pressure, heart, pulse, cardiac | #33 Circulation |
| skin, wound, rash, bruise, sore | #12 Integument |
| confus, memory, forget, disoriented, wander | #36 Cognition |
| speak, talk, communicat, hear, vision, see | #32 Communication/Hearing |
| social, visit, friend, family, community, outing | #06 Social Contact |

### Assessment Scoring
- **CII**: 12 dimensions × 1-10 scale = /120. Green ≤40, Yellow 41-79, Red ≥80
- **Mini CII**: 3 dimensions × 1-10 scale = /30. Green ≤11, Yellow 12-20, Red ≥21
- **CRI**: 14 factors with PRD weights, range 14.4-72.0. Acuity: low (<30), moderate (30-44), high (45-59), critical (≥60). LMN eligible if ≥45

### CII Dimensions (12)
1. Physical strain, 2. Sleep disruption, 3. Social isolation, 4. Emotional weight, 5. Financial stress, 6. Time pressure, 7. Health impact, 8. Relationship strain, 9. Work-life balance, 10. Decision fatigue, 11. Future anxiety, 12. Loss of identity

### CRI Factors (14)
(Each with specific PRD weight — preserved in assessment engine)

### Revenue Stack (6 Phases)
1. CII/CRI assessments ($150-300 pre-license)
2. Comfort Card subscriptions
3. Time Bank credit purchases ($15/hr)
4. Membership ($100/year)
5. Employer partnerships
6. CMS ACCESS/ELEVATE (2027+)

### Pricing Tiers
- Peace of Mind: ~5 hrs/wk, ~$550/mo
- Regular: 10-15 hrs, $1,100-1,650
- Daily: 20-25 hrs, $2,200-2,750
- Intensive: 30-40 hrs, $3,300-4,400

### Key Numbers (IMMUTABLE)
- 63M US family caregivers
- 27 hrs/week unpaid care
- $7,200/year out-of-pocket
- 77% agency turnover
- $35/hr private pay rate
- $25-28/hr worker-owner wage + equity
- 40 hr/year membership floor
- -20 hr deficit max
- 12-month credit expiry
- 0.9/0.1 Respite Default split

---

## 10. Clinical Systems Preserved

### Omaha System (42 Problems, 4 Domains)
All 42 problems preserved in `omaha-system.ts` constants. Domains:
1. Environmental (4 problems: Income, Sanitation, Residence, Neighborhood/Workplace)
2. Psychosocial (12 problems: Communication, Social Contact, Role Change, Interpersonal, Spirituality, Grief, Mental Health, Sexuality, Caretaking, Neglect, Abuse, Growth/Development)
3. Physiological (18 problems: Hearing, Vision, Speech/Language, Oral Health, Cognition, Pain, Consciousness, Integument, Neuro-musculo-skeletal, Respiration, Circulation, Digestion-Hydration, Bowel, Urinary, Reproductive, Pregnancy, Postpartum, Communicable/Infectious)
4. Health-Related Behaviors (8 problems: Nutrition, Sleep/Rest, Physical Activity, Personal Care, Substance Use, Family Planning, Health Care Supervision, Medication Regimen)

### FHIR Sync Pipeline
Preserved: PostgreSQL (sync write) → Redis job queue → Aidbox FHIR R4 (async)
- Encounters from care logs
- QuestionnaireResponses from assessments
- Observations from vitals
- AuditEvents from all PHI access

### ICD-10 Crosswalk
Preserved: Omaha ↔ ICD-10 bidirectional mapping for LMN evidence and CMS submission.

### LOINC Codes
Preserved: Wearable vitals mapping to LOINC for FHIR Observations.

---

## 11. Migration Strategy

### Phase 1: Build Card + Sage Shell (this implementation)
- Create CardAndSage.tsx as the single page shell
- Create CareCard.tsx (QR + 3 tiles)
- Create SageVoiceDrawer.tsx (mic + conversation stream)
- Create SageMicButton.tsx (floating button)
- Create /api/card/tiles and /api/card/identity endpoints
- Enhance /api/sage/message with intent router + 12 domain handlers
- Wire STT/TTS pipeline
- Reduce App.tsx to 4 routes

### Phase 2: Archive old features
- Move all 118 feature files to `src/client/archive/`
- Remove Sidebar, PageHeader, RoleSwitch, RoleGate
- Remove all lazy route imports
- Keep shared constants, types, and server modules intact

### Phase 3: Backend domain handlers
- Implement each of the 12 domain handlers
- Port business logic from archived components to server-side handlers
- Each handler returns structured responses (text + optional cards + side effects)

### Phase 4: Proactive Sage
- Implement cron-based triggers
- Push notification integration (Web Push + Twilio)
- Scheduled messages

### What stays untouched:
- `src/shared/constants/*` — all business rules, Omaha system, care tiers
- `src/shared/types/*` — all TypeScript interfaces
- `src/server/database/*` — PostgreSQL, Aidbox, Redis connections
- `src/server/middleware/*` — auth, audit, rate limiting
- `src/server/modules/auth/*` — JWT, RBAC
- `src/server/modules/family/*` — family CRUD
- `src/server/modules/assessments/*` — scoring engines
- `src/server/modules/timebank/*` — ledger, matching
- `src/server/modules/fhir-sync/*` — FHIR pipeline
- `src/server/modules/notifications/*` — push/SMS/email
- `config/aidbox/*` — FHIR bundles

---

## 12. New File Manifest

| # | File | Purpose | ~LOC |
|---|------|---------|------|
| 1 | `src/client/CardAndSage.tsx` | Single page shell — Card + mic button + drawer | ~60 |
| 2 | `src/client/CareCard.tsx` | Card component: QR + identity + 3 tiles | ~150 |
| 3 | `src/client/SageVoiceDrawer.tsx` | Voice drawer: conversation stream + listening state | ~200 |
| 4 | `src/client/SageMicButton.tsx` | Floating mic button with pulse animation | ~40 |
| 5 | `src/client/SageResponseCard.tsx` | Inline response card renderer (schedule, balance, etc.) | ~120 |
| 6 | `src/client/QRCode.tsx` | Extracted QR pattern generator (from ComfortCardDigital) | ~80 |
| 7 | `src/server/modules/card/tiles.ts` | GET /api/card/tiles — role-aware computation | ~150 |
| 8 | `src/server/modules/card/identity.ts` | GET /api/card/identity — member data | ~50 |
| 9 | `src/server/modules/card/routes.ts` | Fastify plugin for card endpoints | ~30 |
| 10 | `src/server/modules/sage/intent-router.ts` | Gemini Flash 12-domain classifier | ~100 |
| 11 | `src/server/modules/sage/conversation.ts` | Session management, memory, flow state | ~120 |
| 12 | `src/server/modules/sage/tts.ts` | Google Cloud Text-to-Speech wrapper | ~60 |
| 13 | `src/server/modules/sage/stt.ts` | Google Cloud Speech-to-Text wrapper | ~60 |
| 14 | `src/server/modules/sage/proactive.ts` | Cron triggers + push notification dispatch | ~150 |
| 15 | `src/server/modules/sage/domains/care.ts` | Visit logging, Omaha, ACP, team, timeline | ~200 |
| 16 | `src/server/modules/sage/domains/schedule.ts` | Appointments, visits, shifts, swaps | ~120 |
| 17 | `src/server/modules/sage/domains/assess.ts` | CII, mini-CII, CRI, KBS conversational | ~180 |
| 18 | `src/server/modules/sage/domains/timebank.ts` | Balance, tasks, streaks, matching, earn/spend | ~200 |
| 19 | `src/server/modules/sage/domains/billing.ts` | Comfort Card, HSA, LMN, tax, reconciliation | ~120 |
| 20 | `src/server/modules/sage/domains/onboard.ts` | Full voice-guided onboarding flow | ~150 |
| 21 | `src/server/modules/sage/domains/message.ts` | Read, reply, compose messages | ~80 |
| 22 | `src/server/modules/sage/domains/emergency.ts` | 911 escalation, alerts, fall detection | ~100 |
| 23 | `src/server/modules/sage/domains/social.ts` | Referrals, cascade, catalyst, gratitude, community | ~120 |
| 24 | `src/server/modules/sage/domains/govern.ts` | Voting, proposals, equity (worker-owner) | ~100 |
| 25 | `src/server/modules/sage/domains/clinical.ts` | LMN review/sign, CRI review, alerts (MD) | ~100 |
| 26 | `src/server/modules/sage/domains/admin.ts` | Matching, quality, analytics, respite, members | ~120 |

**Total: 26 new files, ~2,660 LOC estimated**

---

## 13. Deleted / Archived Files

**Archived to `src/client/archive/`** (118 files across 18 feature directories):
- All of `src/client/features/conductor/` (19 files)
- All of `src/client/features/timebank/` (18 files)
- All of `src/client/features/public/` (15 files)
- All of `src/client/features/admin/` (12 files)
- All of `src/client/features/assessments/` (9 files)
- All of `src/client/features/billing/` (8 files)
- All of `src/client/features/worker/` (8 files)
- All of `src/client/features/acp/` (6 files)
- All of `src/client/features/onboarding/` (5 files)
- All of `src/client/features/lmn/` (4 files)
- All of `src/client/features/messaging/` (3 files)
- All of `src/client/features/employer/` (3 files)
- All of `src/client/features/wellness/` (2 files)
- All of `src/client/features/sage/` (2 files — replaced by new Sage)
- All of `src/client/features/coverage/` (1 file)
- All of `src/client/features/notifications/` (1 file)
- All of `src/client/features/profile/` (1 file)
- All of `src/client/features/settings/` (1 file)

**Deleted entirely:**
- `src/client/components/layout/Sidebar.tsx`
- `src/client/components/layout/RoleSwitch.tsx`
- `src/client/components/PageHeader.tsx`
- All lazy route imports in `App.tsx`

**Preserved (NOT touched):**
- `src/shared/*` — all constants, types, business rules
- `src/server/*` — all backend modules, middleware, database
- `src/client/components/Logo.tsx` — used in Card header
- `config/*` — all Aidbox/FHIR bundles

---

## 14. Routes — Before and After

### Before: 117 routes

```
/ /join /about /how-it-works /privacy /terms /hipaa /help /careers /press
/blog /our-story /comfort-card /comfort-card/value /community /age-at-home
/assessments/mini-cii /neighbors /invite /waitlist /onboarding
/onboarding/identity /federation /onboarding/family /onboarding/worker
/legacy /product-map /enzyme /care-ubi /synthesis /conductor /conductor/team
/conductor/schedule /conductor/vitals /conductor/timeline /conductor/wallet
/conductor/wearable /conductor/certification /conductor/discharge
/conductor/predictive /conductor/medications /conductor/care-plan
/conductor/emergency /conductor/membership /conductor/acp
/conductor/acp/directives /conductor/acp/goals /conductor/acp/preferences
/conductor/acp/preparedness /conductor/acp/conversations /conductor/social-rx
/lmn /lmn/:lmnId /lmn/marketplace /lmn/renewal /timebank /timebank/task/:id
/timebank/impact /timebank/new /timebank/equity /timebank/referral
/timebank/cascade /timebank/streak /timebank/expiring /timebank/catalyst
/timebank/endowment /timebank/gratitude /timebank/deficit /timebank/nudge
/timebank/gps /timebank/history /timebank/mine /timebank/buy
/timebank/community /timebank/tier /assessments /assessments/cii
/assessments/cri /assessments/cri/review /assessments/cri/:id /assessments/kbs
/assessments/kbs/trend /assessments/omaha /coverage /appointments /messages
/messages/new /messages/:threadId /notifications /billing /billing/my-card
/billing/tax-statement /billing/comfort-card /billing/tax-calculator
/billing/reconciliation /profile /settings /sage /worker /worker/clock
/worker/care-log /worker/voice /worker/swaps /worker/governance
/worker/verification /worker/incident /medical /medical/lmn /medical/lmn/:id
/medical/alerts /admin /admin/matching /admin/members /admin/respite
/admin/dispatch /admin/pace /admin/directory /admin/matching-quality
/admin/analytics /admin/quality /admin/bch /employer /employer/roi
/employer/enrollment /wellness /wellness/bookings /billing/get-started
/my-card
```

### After: 4 routes

```
/           → CardAndSage (the entire authenticated app)
/join       → CardAndSage (Sage handles onboarding via voice)
/my-card    → CareCard only (public QR share, no auth required)
/qr/:code  → QR scan handler (check-in / referral routing)
```

---

## 15. Verification Criteria

1. `tsc --noEmit` clean
2. `vite build` clean
3. App opens to Card with QR code, member identity, and 3 tiles
4. Tiles show role-appropriate content (test with conductor role)
5. Mic button visible, tappable, opens voice drawer
6. Voice input captured (Web Speech API fallback for dev)
7. Sage responds with text + TTS audio
8. Card tiles refresh after Sage action
9. Drawer auto-dismisses after 10s silence
10. Text fallback (keyboard) works in drawer
11. `/my-card` shows public QR card without auth
12. `/qr/:code` routes to Sage onboarding for new users
13. No Sidebar, no PageHeader, no navigation elements visible
14. All shared constants and server modules unchanged
15. Archived features accessible in `src/client/archive/` for reference
16. Mobile layout: Card fills screen, drawer covers bottom half
17. Desktop layout: Card centered (max-w-md), drawer same pattern
