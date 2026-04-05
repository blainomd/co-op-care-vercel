# co-op.care Product Bible

> **Last Updated:** March 13, 2026
> **Author:** Blaine Warkentine, MD, MBA — Founder
> **Status:** Pre-launch, Boulder CO
> **Legal Entity:** co-op.care Limited Cooperative Association (LCA), filed March 10, 2026

This document is the single source of truth for the co-op.care platform — every feature, every number, every design decision, every integration, every revenue stream, and every interaction pattern. It is written for engineers, investors, partners, and future team members who need to understand the entire product from first principles.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The Thesis](#2-the-thesis)
3. [Product Architecture — Two Surfaces](#3-product-architecture--two-surfaces)
4. [Sage — The Conversational Operating System](#4-sage--the-conversational-operating-system)
5. [The Comfort Card — Identity, Payments, and Trust](#5-the-comfort-card--identity-payments-and-trust)
6. [Onboarding — From Stranger to Member in 10 Minutes](#6-onboarding--from-stranger-to-member-in-10-minutes)
7. [The Assessment Engine](#7-the-assessment-engine)
8. [The Time Bank — Care as Currency](#8-the-time-bank--care-as-currency)
9. [Care Tiers — Seedling, Rooted, Canopy](#9-care-tiers--seedling-rooted-canopy)
10. [The Matching Algorithm](#10-the-matching-algorithm)
11. [The Omaha System — Clinical Backbone](#11-the-omaha-system--clinical-backbone)
12. [FHIR R4 Clinical Infrastructure](#12-fhir-r4-clinical-infrastructure)
13. [The Revenue Model — 10-Layer Stack](#13-the-revenue-model--10-layer-stack)
14. [Background Checks and Trust](#14-background-checks-and-trust)
15. [Viral Loops and Community Growth](#15-viral-loops-and-community-growth)
16. [The Cooperative Model](#16-the-cooperative-model)
17. [Security, HIPAA, and Privacy](#17-security-hipaa-and-privacy)
18. [Technical Architecture](#18-technical-architecture)
19. [Deployment and Infrastructure](#19-deployment-and-infrastructure)
20. [AI Strategy — Agentic Memory as Moat](#20-ai-strategy--agentic-memory-as-moat)
21. [UX Philosophy — Radical Simplification](#21-ux-philosophy--radical-simplification)
22. [Partner Value Propositions](#22-partner-value-propositions)
23. [Regulatory Strategy](#23-regulatory-strategy)
24. [The Career Path — From Neighbor to Owner](#24-the-career-path--from-neighbor-to-owner)
25. [Immutable Numbers](#25-immutable-numbers)
26. [Anti-Patterns](#26-anti-patterns)
27. [90-Day Roadmap](#27-90-day-roadmap)
28. [Phase 2 and Beyond](#28-phase-2-and-beyond)

---

## 1. The Problem

63 million Americans are family caregivers. They provide an average of 27 hours per week of unpaid care and spend $7,200 per year out-of-pocket. The home care industry charges families $45,000+ per year while paying caregivers $16.77/hr — the gap is extracted by private equity firms at rates of 40-60%. Industry turnover is 77%.

The result: families can't afford care, caregivers can't afford to stay, and the people who need care the most — aging adults who want to stay home — end up in institutions. Boulder Community Health's readmission rate is 15.4%, costing $16,037 per readmission. The system is broken at every joint.

**The Alpha Daughter.** Our primary user is a woman aged 35-60 managing care for an aging parent from her phone. She is exhausted (CII score often Yellow or Red zone), financially stressed, and isolated. She doesn't want an app with 95 screens. She wants someone to talk to at 2am when her father won't sleep, and someone she trusts to sit with him on Saturday so she can breathe.

---

## 2. The Thesis

**When caregivers earn $25-28/hr, receive W-2 benefits, and own equity in the cooperative, they don't leave.** 77% industry turnover drops to a projected 15%. In companion care, retention IS the product — the same caregiver, the same trust, the same relationship, month after month. No PE extraction. No agency intermediaries. Community care, cooperatively owned.

The co-op.care Limited Cooperative Association (Colorado LCA) enables a dual-class membership:

- **Patron Members** — families and community members who use the service
- **Worker-Owner Members** — Care Navigators who deliver the service and own the cooperative

Every hour of care strengthens the community you own. This is the structural thesis: align incentives through ownership, and the quality problem solves itself.

---

## 3. Product Architecture — Two Surfaces

The entire co-op.care platform collapses into exactly two surfaces:

### Surface 1: The Comfort Card
A QR-coded identity card — digital and physical — that represents your membership, your care network, and your payment method. You share it like a business card. Scanning someone's QR connects you into each other's care network. The card shows:
- Your name (first name only for privacy)
- Your member ID (format: `COOP-2026-XXXX`)
- Your care tier (Seedling / Rooted / Canopy)
- Your Time Bank balance
- Three context-aware tiles that change based on your last interaction

### Surface 2: Sage
An AI conversational companion available 24/7. Not a chatbot — a knowledgeable friend who's been through this. Sage handles everything: assessments, scheduling, Time Bank management, emotional support, billing questions, co-op governance, referrals, emergency escalation. The user never needs to navigate a menu, find a screen, or read a manual.

**The radical simplification:** The original CareOS design had 117 routes across 95+ feature modules. We collapsed it to 4 routes:

| Route | Surface | Purpose |
|-------|---------|---------|
| `/` | Card + Sage | The entire app for authenticated users |
| `/join` | Sage onboarding | New user conversational signup |
| `/q/:memberId` | Card scan landing | QR code viral entry point |
| `/welcome` | Public Sage | Pre-auth information and exploration |

Everything else is a conversation with Sage.

---

## 4. Sage — The Conversational Operating System

### 4.1 Identity and Voice

- **Name:** Sage ("Sage advice from co-op.care")
- **Role:** AI companion for family caregivers, available 24/7
- **Tone:** Warm, validating, knowledgeable but never preachy
- **Boundaries:** Not a therapist, not a medical advisor — a knowledgeable friend who's been through this

**Voice examples:**
- "That sounds really hard. You're not failing — you're doing this."
- "Here's what other caregivers have found helpful with sundowning..."
- "Your burnout score suggests you might benefit from some respite. Want me to help you request Time Bank hours?"

**Anti-voice:**
- Never: "You should seek professional help" (too clinical)
- Never: "Studies show that caregiver burden..." (too academic)
- Never: "I'm sorry, I can't help with that" (too robotic)

### 4.2 Domain Router — 24 Domains

Every user message is classified into one of 24 domains via keyword matching (client-side, Phase 1) transitioning to Gemini embedding + vector search (Phase 2):

| # | Domain | Trigger Keywords | Response Type |
|---|--------|-----------------|---------------|
| 1 | intake | "get started", "sign up", "new here", "join" | Welcome + orientation |
| 2 | family_intake | "family caregiver", "care for my parent" | Mini CII inline component |
| 3 | worker_intake | "become a", "want to help", "work at" | Worker value prop ($25-28/hr + equity) |
| 4 | how_different | "different from", "how does it work" | PE extraction vs co-op comparison |
| 5 | assessment | "burnout", "check-in", "stressed", "overwhelmed" | Mini CII inline slider component |
| 6 | scheduling | "schedule", "appointment", "come over" | Personality-fit matching info |
| 7 | timebank | "time bank", "hours", "credits", "balance" | Circle of care explanation |
| 8 | billing | "hsa", "fsa", "cost", "comfort card", "insurance" | HSA/FSA eligibility + 28-36% savings |
| 9 | emotional_support | "guilty", "tired", "alone", "can't do this", "grief" | Empathetic response (3 variants) |
| 10 | care_questions | "sundowning", "dementia", "medication", "fall" | Evidence-based caregiving guidance |
| 11 | emergency | "not breathing", "chest pain", "stroke", "911", "suicid" | Immediate 911 + 988 suicide line |
| 12 | community | "neighbor", "address" | Community connection |
| 13 | account | "password", "settings" | Account management |
| 14 | membership | "membership", "care team", "my member" | Co-op membership details |
| 15 | tier | "tier", "level up", "seedling", "rooted", "canopy" | Tier progression explanation |
| 16 | qr | "qr code" | QR identity/sharing explanation |
| 17 | streaks | "streak", "milestone", "consistency" | Consistency celebration |
| 18 | governance | "governance", "vote", "board meeting", "ownership" | LCA democratic governance |
| 19 | coverage | "medicaid", "medicare", "coverage", "benefits check" | Coverage navigator |
| 20 | lmn | "letter of medical", "lmn status", "doctor sign" | LMN process with Dr. Emdur |
| 21 | referral | "refer", "invite", "share my", "tell a friend" | QR sharing viral loop |
| 22 | respite_fund | "respite", "community fund", "opt out" | Respite Default explanation |
| 23 | equity | "equity", "dividend", "patronage", "my shares" | Worker-owner equity ($52K/5yr) |
| 24 | care_logs | "log a visit", "care log", "my shifts" | Omaha auto-coded visit logging |

**Default domain:** emotional_support (when no keywords match, assume they need someone to talk to).

### 4.3 Inline Interactive Components

Sage embeds interactive components directly inside chat messages. These are not separate screens — they render inline and survive re-renders:

| Component | Purpose | Fields |
|-----------|---------|--------|
| `InlineMiniCII` | 30-second burnout check | 3 sliders (physical/sleep/isolation), scored /30, zone classification |
| `InlineRolePicker` | Community role selection | 6 role chips (multi-select): companion, meals, tech, yard, errands, admin |
| `InlineConsentPicker` | Memory consent | 3 options: "Yes, remember me" / "Just this session" / "What do you store?" |

Each component returns a `ComponentResult` that Sage uses to advance the conversation:

```
MiniCII completes → Sage interprets zone → suggests next steps
RolePicker completes → Sage confirms roles → advances to community education
ConsentPicker completes → Sage stores preference → issues Comfort Card
```

### 4.4 Dynamic Tile Engine

The three tiles below the Comfort Card are state-aware — they change based on:
1. **Onboarding phase** (fresh, exploring, profile_intent, etc.)
2. **Last conversation domain** (assessment, timebank, billing, etc.)
3. **User profile state** (CII zone, days since check-in, referral count)

**Phase-based tiles:**

| Phase | Tile 1 | Tile 2 | Tile 3 |
|-------|--------|--------|--------|
| fresh (new) | "I Need Care" | "I Want to Help" | "How It Works" |
| fresh (referred) | "Who Invited Me?" | "Get My Card" | "How It Works" |
| exploring (care) | "Quick Burnout Check" | "From $550/mo" | "Meet Your Caregiver" |
| exploring (worker) | "Earn $25-28/hr" | "Own The Co-op" | "Find Tasks" |
| profile_intent | "Find Care" | "Give Care" | "Both — I'm a Neighbor" |
| profile_roles | "Companion Visits" | "Meals & Errands" | "Tech & Admin" |
| profile_community | "Own the Infrastructure" | "Time Bank" | "Invite a Neighbor" |
| memory_consent | "Yes, Remember Me" | "Just This Session" | "Tell Me More" |
| returning | "Pick Up Where I Left Off" | "Quick Check-in" | "What's New?" |

**Domain-reactive tiles (post-onboarding):**

| Last Domain | Tile 1 | Tile 2 | Tile 3 |
|-------------|--------|--------|--------|
| assessment | "My Full Results" | "Talk to Someone" | "Schedule Respite" |
| timebank | "Tasks Near Me" | "My Streak" | "Earn More Hours" |
| billing | "HSA/FSA Savings" | "Get My LMN" | "My Membership" |
| referral/qr | "Share to Social" | "Add to Wallet" | "Invite Locally" |
| emotional_support | "Quick Burnout Check" | "Respite Fund" | "You're Not Alone" |
| scheduling | "Next Visit" | "Change Caregiver" | "Add to Calendar" |
| membership | "Tier Progress" | "Co-op Governance" | "Patronage Equity" |
| governance | "Next Board Vote" | "My Voting Rights" | "Community Fund" |
| streaks | "Keep It Going" | "Share Milestone" | "What I've Earned" |
| equity | "My Ownership" | "Dividend History" | "How Co-ops Work" |

**Urgent override:** If CII zone is Red, tiles always show: "Talk to Someone" / "Respite Fund" / "Schedule Care"

**Stale check-in override:** If 14+ days since last check-in: "Quick Check-in" / "What's New?" / "My Network"

### 4.5 Welcome Modes

Sage personalizes the first message based on how the user arrived:

| Mode | Trigger | First Message | Initial Tiles |
|------|---------|---------------|---------------|
| new_visitor | No localStorage data | "63M Americans are family caregivers..." | care/help/learn |
| returning | Has localStorage profile | "Welcome back, [name]. I remember..." | continue/check-in/new |
| member | Authenticated user | Full dashboard tiles | role-based |
| comfort_card | Has ComfortCardHolder | "Your QR is your key..." | card-specific |
| comfort_card_referred | Has referrer data | "[Name] connected you..." | referrer network |

### 4.6 Suggested Next Question

After every Sage response, the most likely next question is computed and displayed as the input placeholder. This reduces friction — the user can just tap send.

### 4.7 Escalation Rules

Sage detects emergencies and escalates appropriately:

**Immediate (911):**
- Chest pain, difficulty breathing, stroke symptoms
- Unresponsiveness, severe bleeding
- Suicidal ideation (caregiver OR care recipient)

**Urgent (call doctor):**
- New confusion lasting >1 hour
- Fall with inability to bear weight
- Medication error (wrong dose, wrong med)
- Fever >101.5F in elderly

**Monitor (suggest Time Bank or professional care):**
- Increasing nighttime confusion
- Weight loss >5% in 1 month
- CII score >28 on Mini CII (high burnout)
- Missed medications >2 in a week

### 4.8 AI Evolution Roadmap

**Phase 1 (Current): Pattern Matching**
- ~50 keyword patterns per domain
- Response variants via `pick()` pseudo-random helper
- Works offline, zero latency, zero cost

**Phase 2: Gemini RAG**
- User query → Gemini embedding → Vector search knowledge base → Top-K context → Gemini Flash → Sage response
- Handles any phrasing, uses evidence-based content
- Sage personality maintained through system prompt

**Phase 3: Agentic Sage**
- Sage executes multi-step workflows (book a visit, file an LMN, submit a Respite Fund request)
- Tool calling for real-time data (check balance, find tasks, verify GPS)
- Proactive outreach (burnout trend detection, streak encouragement, LMN renewal reminders)

---

## 5. The Comfort Card — Identity, Payments, and Trust

### 5.1 What the Card Is

The Comfort Card is a QR-coded membership card — both digital (in the app, Apple Wallet, Google Pay) and physical (mailed to members). It is:

- **Identity:** Your member ID and care network credential
- **Payment:** HSA/FSA-eligible spending via pre-loaded balance
- **Trust signal:** Background-check-verified status shown visually
- **Viral vector:** Sharing your QR connects someone into your care network

### 5.2 Card Data

```typescript
interface CardIdentity {
  memberId: string;        // COOP-2026-XXXX
  displayName: string;     // First name only (privacy)
  memberSince: string;     // YYYY-MM
  tier: 'seedling' | 'rooted' | 'canopy';
  tierEmoji: string;       // Seedling, Rooted, Canopy
  balanceFormatted: string; // "44.0 hrs"
  balanceHours: number;
  qrData: string;          // coop://m/COOP-2026-XXXX
  activeRole: string;
}
```

### 5.3 QR Code Mechanics

- QR encodes a URL: `https://co-op.care/#/q/{memberId}`
- Scanning opens the co-op.care app/PWA at the referral landing page
- The referrer's first name is displayed: "[Name] connected you to co-op.care"
- The new user gets their own Comfort Card immediately
- Both parties receive referral bonus hours (Seedling: 5 hrs, Rooted: 7 hrs, Canopy: 10 hrs)
- First name only — no last name, no phone, no email exposed via QR

### 5.4 Tile System

Three context tiles appear below the card. Each tile is tappable — tapping sends a message to Sage:

```typescript
interface CardTile {
  label: string;      // "Wellness", "Balance", "Next Visit"
  value: string;      // "Yellow", "44.0 hrs", "Thu 2pm"
  sublabel: string;   // "CII 52/120 - Check in?", "Seedling - 1.0x earning"
  color: 'sage' | 'copper' | 'gold' | 'blue' | 'red' | 'yellow' | 'gray';
  pulse?: boolean;    // Animated attention indicator
}
```

Tiles are role-aware by default (conductor sees Wellness/Balance/Next Visit, worker sees Shift/Hours/Impact) but dynamically override based on conversation context.

### 5.5 Physical Card

Mailed to members after onboarding. Includes:
- QR code (same as digital)
- Member name and ID
- Emergency contact number
- "If found, please return to..." text
- HSA/FSA spending barcode (Phase 2)

---

## 6. Onboarding — From Stranger to Member in 10 Minutes

### 6.1 The Flow

Onboarding is a conversation with Sage, not a form. Target: under 10 minutes from first touch to Comfort Card.

**Phase 1: Welcome + Intent** (`fresh` → `exploring`)
> Sage: "Welcome to co-op.care. I'm Sage — think of me as your care companion, not a chatbot. Are you looking for care for someone you love, or do you want to give care as part of our community?"
> Tiles: [I need care] [I want to help] [Tell me more first]

**Phase 2: Context** (`exploring` → `profile_intent`)
> If care-seeking: Sage runs inline Mini CII (30-second burnout check)
> If care-giving: Sage presents $25-28/hr + equity + W-2 benefits

**Phase 3: Community Roles** (`profile_intent` → `profile_roles`)
> Sage: "What sounds interesting to you?"
> Component: InlineRolePicker (6 chips: companion, meals, tech, yard, errands, admin)

**Phase 4: Co-op Education** (`profile_roles` → `profile_community`)
> Sage: "Every member earns Time Bank hours — 1 hour given = 1 hour earned. As you participate, you move from Seedling to Rooted to Canopy, earning governance rights and patronage dividends. You literally own the infrastructure of caring."
> Tiles: [Get my free card] [How does ownership work?] [What does it cost?]

**Phase 5: Memory Consent** (`profile_community` → `memory_consent`)
> Sage: "I can remember our conversation so I'm more helpful next time. Your data stays on your device — I never share it. Is that okay?"
> Component: InlineConsentPicker (3 options)

**Phase 6: Card + Background Check** (`memory_consent` → `onboarded`)
> Sage issues Comfort Card with QR code
> Sage introduces background check: trust is everything
> Tiles: [Run my check ($30)] [Go LMN — check free + tax savings] [What's LMN?]

### 6.2 Memory Consent Model

Three consent levels:

| Level | Behavior | Storage |
|-------|----------|---------|
| `granted` | Full persistence across sessions | localStorage |
| `session_only` | Works this visit, cleared on tab close | sessionStorage |
| `pending` | Not yet asked | Nothing stored |

No dark patterns. The opt-out ("Just this session") is equally prominent as opt-in. Sage explains exactly what is stored if asked.

### 6.3 Gamified Profile Completeness

Profile completion drives engagement without gamification (no points, no badges, no leaderboards — only streaks and impact):

| Step | Completion | Trigger |
|------|-----------|---------|
| Name + Intent | 20% | First Sage interaction |
| Community Roles | 35% | Role picker completed |
| Photo + Bio | 50% | Profile customization |
| Skills Selected | 65% | Matching prerequisites |
| Memory Consent | 75% | Privacy choice made |
| Background Check Submitted | 85% | Checkr invitation accepted |
| Background Check Cleared | 95% | Checkr webhook `report.completed` |
| First Task Completed | 100% | Time Bank exchange |

### 6.4 Onboarding Store

```typescript
interface ComfortCardHolder {
  firstName: string;
  phone?: string;
  email?: string;
  memberId: string;           // COOP-2026-XXXX
  intent: 'seeking_care' | 'giving_care';
  referredBy?: string;        // Referrer's memberId
  qrUrl: string;
  createdAt: string;
  walletAdded: boolean;
  pwaInstalled: boolean;
  memoryConsent: MemoryConsent;
  onboardingPhase: OnboardingPhase;
  communityRoles: string[];
}
```

---

## 7. The Assessment Engine

### 7.1 CII — Caregiver Intensity Index

The CII is the clinical backbone of co-op.care. It quantifies caregiver burnout across 12 dimensions, each scored 1-10 via warm, conversational sliders (not clinical-feeling forms).

**12 Dimensions:**
1. Physical Care Demands
2. Cognitive Supervision
3. Emotional Labor
4. Financial Management
5. Medical Coordination
6. Transportation
7. Household Management
8. Social Isolation Impact
9. Sleep Disruption
10. Work Impact
11. Physical Health Impact
12. Financial Strain

**Scoring:** Total /120

**Zone Classification:**

| Zone | Score Range | Color | Meaning |
|------|-----------|-------|---------|
| Green | 0-40 | #4CAF50 | Manageable — preventive support |
| Yellow | 41-79 | #FFC107 | Strained — active intervention needed |
| Red | 80-120 | #F44336 | Crisis — immediate respite + professional care |

### 7.2 Mini CII — 30-Second Quick Check

Three sliders, completable in 30 seconds, embedded inline in Sage chat:

| Dimension | Range | Maps To |
|-----------|-------|---------|
| Physical Care Demands | 1-10 | CII Dimension 1 |
| Sleep Disruption | 1-10 | CII Dimension 9 |
| Social Isolation Impact | 1-10 | CII Dimension 8 |

**Scoring:** Total /30

| Zone | Score Range | Action |
|------|-----------|--------|
| Green | 0-11 | "You're managing well. Let's keep it that way." |
| Yellow | 12-20 | "You're carrying a lot. Let's find you some support." |
| Red | 21-30 | "You need a break, and you deserve one. Let me help." |

### 7.3 CRI — Care Readiness Index

Administered by Medical Director (Dr. Josh Emdur, DO). 14 factors assessing the care recipient's needs.

- **Range:** 14.4 (minimal needs) to 72.0 (intensive needs)
- **Workflow:** Assessment submitted → MD review within 24 hours → Approved/Needs Revision
- **Output:** Determines care plan intensity, LMN eligibility, and CMS billing codes

### 7.4 KBS — Knowledge-Behavior-Status Outcomes

Omaha System outcome measurement, tracked at 30/60/90 day intervals:

| Subscale | Range | Meaning |
|----------|-------|---------|
| Knowledge (K) | 1-5 | Understanding of condition and self-care |
| Behavior (B) | 1-5 | Adherence to care plan |
| Status (S) | 1-5 | Clinical condition trajectory |

Each KBS rating maps to a specific Omaha problem code and generates a FHIR Observation.

### 7.5 Assessment Revenue

Pre-license revenue: CII and CRI assessments billed at $150-300 each, supervised by Dr. Emdur. This generates revenue from Day 1 while the CDPHE Class B license is pending (4-6 month wait).

### 7.6 FHIR Mapping

Every assessment syncs to Aidbox as a FHIR QuestionnaireResponse:
- CII → Custom Questionnaire (12 items, scored)
- Mini CII → Custom Questionnaire (3 items, scored)
- CRI → Custom Questionnaire (14 factors)
- KBS → FHIR Observation (per Omaha problem, per subscale)

---

## 8. The Time Bank — Care as Currency

### 8.1 Core Concept

1 hour given = 1 hour earned. The Time Bank is a double-entry credit ledger where community members exchange care services. Every exchange is clinically coded via the Omaha System, creating a healthcare record from community kindness.

### 8.2 Ledger Structure

Six balance types per account:

| Type | Description |
|------|-------------|
| `earned` | Hours earned by providing care |
| `membership` | 40 hours included in $100/year membership |
| `bought` | Hours purchased at $15/hr cash rate |
| `donated` | Hours donated to/from Respite Fund |
| `expired` | Hours lost to 12-month graduated expiry |
| `deficit` | Negative balance (max -20 hours) |

### 8.3 Cash Rate Breakdown

$15/hour purchased:
- $12 → Coordination fee (covers platform operations)
- $3 → Respite Fund contribution (community safety net)

### 8.4 Respite Default

Every Time Bank transaction splits: 0.9 hours to member + 0.1 hours to Respite Fund. This is opt-out-able, and the opt-out must be **genuinely easy** — no dark patterns, no guilt, no buried settings. It's a single toggle in Sage: "Hey, want to keep all your hours this time?"

### 8.5 Deficit Rules

- Maximum deficit: -20 hours
- Behavioral nudges at: -5, -10, -15, -20 hours
- At -20: account frozen until balance restored
- Nudges are empathetic, not punitive: "Your community is here for you. Let's find a way to contribute that fits your schedule."

### 8.6 Expiry

- Credits expire on a 12-month graduated rolling basis
- 30-day warning before expiry
- Expired credits auto-donate to Respite Fund
- Canopy tier: credits never expire (reward for sustained contribution)

### 8.7 Streaks

Consistency tracking (not gamification):

| Milestone | Weeks | Recognition |
|-----------|-------|-------------|
| First | 4 | "Helping Hand" |
| Second | 8 | "Reliable Neighbor" |
| Third | 12 | "Community Pillar" |
| Fourth | 26 | "Six-Month Sustainer" |
| Fifth | 52 | "Year-Round Champion" |

### 8.8 Task Types

12 task types, each auto-coded to Omaha System:

| Task | Omaha Problem | Code | Intervention |
|------|--------------|------|-------------|
| Meals | Digestion-Hydration | #28 | Treatments/Procedures |
| Rides | Communication w/ Community Resources | #05 | Case Management |
| Companionship | Social Contact | #06 | Surveillance |
| Phone Companionship | Social Contact | #06 | Surveillance |
| Tech Support | Communication w/ Community Resources | #05 | Teaching/Guidance |
| Yard Work | Residence | #03 | Treatments/Procedures |
| Housekeeping | Sanitation | #02 | Treatments/Procedures |
| Grocery Run | Digestion-Hydration | #28 | Case Management |
| Errands | Communication w/ Community Resources | #05 | Case Management |
| Pet Care | Social Contact | #06 | Surveillance |
| Admin Help | Communication w/ Community Resources | #05 | Case Management |
| Teaching | Varies by subject | — | Teaching/Guidance/Counseling |

### 8.9 GPS Verification

Check-in and check-out require GPS within 0.25 miles (402.336 meters) of the care recipient's location. Haversine formula for distance calculation, PostGIS `ST_Distance` for database queries.

### 8.10 Cascade Visualization

Graph queries show the ripple effect: "Sarah helped Maria, who helped Tom, who helped David." This demonstrates that individual acts create cascading community impact. Stored as `helped` edges in the database.

---

## 9. Care Tiers — Seedling, Rooted, Canopy

Rolling 12-month window, evaluated quarterly:

| Tier | Hours Required | Earning Multiplier | Credit Expiry | Referral Bonus | Governance |
|------|---------------|-------------------|---------------|----------------|------------|
| Seedling | 0-39 | 1.0x | 12 months | 5 hours | No voting |
| Rooted | 40-119 | 1.25x | 18 months | 7 hours | Advisory vote |
| Canopy | 120+ | 1.5x | Never | 10 hours | Full voting + board eligibility |

The tier system rewards sustained participation without gamification. Moving from Seedling to Rooted happens naturally when you use your 40-hour membership floor. Canopy requires genuine community investment.

---

## 10. The Matching Algorithm

### 10.1 No Marketplace

Families never browse and hire caregivers. Matching is algorithmic — Sage finds the right fit and proposes it. The family says yes or asks for adjustment. This prevents the commodification of caregivers.

### 10.2 Matching Weights

**Identity Match:** 2x multiplier when caregiver shares cultural/linguistic identity with care recipient

**Proximity Tiers:**

| Distance | Multiplier | Label |
|----------|-----------|-------|
| 0-0.5 miles | 3x | Walking Distance |
| 0.5-1.0 miles | 2x | Biking Distance |
| 1.0-2.0 miles | 1x | Neighborhood |
| >2.0 miles | 0x (remote only) | Remote Only |

**Additional Factors:**
- Skill match (certified modules vs. task requirements)
- Availability alignment
- Past relationship (same caregiver preference weighted heavily)
- CRI acuity level

### 10.3 Active Site Metaphor

The matching algorithm works like an enzyme active site in biochemistry — proximity creates the conditions for catalysis. The 2-mile default radius is the "active site" where community care can happen. SLA: 2 hours within active site, 4 hours community-wide.

---

## 11. The Omaha System — Clinical Backbone

### 11.1 What It Is

The Omaha System is a standardized clinical taxonomy developed in 1975 (public domain). It provides:
- **42 problems** across 4 domains
- **4 intervention categories** (Teaching/Guidance/Counseling, Treatments/Procedures, Case Management, Surveillance)
- **KBS outcome measurement** (Knowledge 1-5, Behavior 1-5, Status 1-5)

### 11.2 Why It Matters

Every Time Bank task auto-codes to an Omaha problem. This means:
1. Community kindness (driving someone to the store) becomes a clinical record (Case Management for Communication w/ Community Resources, Problem #05)
2. Clinical records enable LMN generation (Letter of Medical Necessity for HSA/FSA eligibility)
3. LMN eligibility enables 28-36% tax savings for families
4. Tax savings justify the $100/year membership fee many times over

The Omaha System turns neighbor-helping-neighbor into a documented healthcare intervention without anyone needing to know clinical terminology.

### 11.3 The 4 Domains

| Domain | Problems | Focus |
|--------|----------|-------|
| Environmental | 4 (codes 01-04) | Income, Sanitation, Residence, Safety |
| Psychosocial | 12 (codes 05-16) | Social contact, mental health, relationships, grief |
| Physiological | 18 (codes 17-34) | Hearing, vision, cognition, pain, circulation, etc. |
| Health-Related Behaviors | 8 (codes 35-42) | Nutrition, sleep, physical activity, medication adherence |

### 11.4 LMN-Eligible Problems

Of 42 problems, 24 are LMN-eligible — meaning documented interventions for these problems can support a Letter of Medical Necessity for HSA/FSA reimbursement. The eligible problems span across companionship (Social Contact #06), care coordination (#05), nutrition (#28, #35), physical activity (#37), cognition (#21), pain (#22), and more.

### 11.5 ICD-10 Crosswalk

Each Omaha problem maps to one or more ICD-10 codes for insurance billing:
- Social Contact (#06) → Z60.2 (Problems related to living alone)
- Digestion-Hydration (#28) → R63.0 (Anorexia), R63.4 (Abnormal weight loss)
- Neuro-Musculo-Skeletal (#25) → M62.81 (Muscle weakness)
- Cognition (#21) → R41.3 (Cognitive decline), G31.84 (Mild cognitive impairment)

The full crosswalk is implemented in `src/shared/constants/icd10-crosswalk.ts`.

---

## 12. FHIR R4 Clinical Infrastructure

### 12.1 Aidbox (Health Samurai)

Aidbox is our FHIR R4 clinical data store. It runs alongside PostgreSQL in a dual-database architecture:

- **PostgreSQL 16 + PostGIS** — Operational data (users, families, Time Bank, tasks, matching, billing)
- **Aidbox FHIR R4** — Clinical data (Patients, Encounters, Observations, QuestionnaireResponses, AuditEvents)

### 12.2 Why Dual Database

PostgreSQL handles the fast, transactional operations that drive the app (matching, ledger, GPS). Aidbox provides the clinical interoperability layer that health systems, CMS, and Epic require. You don't query FHIR for a GPS check-in — you query PostGIS. You don't store clinical assessments in a SQL table — you store FHIR QuestionnaireResponses.

### 12.3 Sync Architecture

**Transactional Outbox Pattern:**
1. PostgreSQL write completes (e.g., assessment saved)
2. Outbox event created in `outbox_event` table (status: `pending`)
3. Redis-backed worker picks up pending events
4. Worker transforms to FHIR resource and POSTs to Aidbox
5. On success: status → `processed`, `fhir_*_id` backfilled
6. On failure: exponential backoff retry, max retries before `failed`

### 12.4 CaptureTripleOutput

One caregiver clock-out generates three synchronized records:

| Record | Destination | Purpose |
|--------|-------------|---------|
| FHIR Observation | Aidbox | Clinical documentation (Omaha-coded, KBS-rated) |
| Billing Assessment | PostgreSQL | CMS billing code generation (G0023, G0024, etc.) |
| Payroll Instruction | PostgreSQL | Worker compensation calculation |

### 12.5 Aidbox Init Bundle

Pre-loaded FHIR resources at deployment:
- `omaha-codesystem.json` — 42 problems as CodeSystem
- `cii-questionnaire.json` — CII assessment as Questionnaire
- `cri-questionnaire.json` — CRI assessment as Questionnaire
- `omaha-to-icd10-conceptmap.json` — Forward crosswalk
- `icd10-to-omaha-conceptmap.json` — Reverse crosswalk

### 12.6 FHIR Resource Types Used

| Resource | Purpose |
|----------|---------|
| Patient | Care recipient clinical identity |
| Encounter | Care visit / interaction |
| Observation | Vitals, KBS ratings, wearable data |
| QuestionnaireResponse | CII, Mini CII, CRI assessments |
| AuditEvent | All PHI access logged |
| CarePlan | Active care plan per family |
| Condition | Active diagnoses (ICD-10 coded) |
| Practitioner | Dr. Emdur, Care Navigators |

---

## 13. The Revenue Model — 10-Layer Stack

co-op.care has 10 distinct revenue layers, activated sequentially as the platform matures:

### Layer 1: Private Pay ($35/hr blended rate)
Families pay directly for companion care. HSA/FSA eligible with LMN. Pricing tiers:
- Peace of Mind: 5 hrs/wk (~$550/mo)
- Regular: 10-15 hrs/wk ($1,100-1,650/mo)
- Daily: 20-25 hrs/wk ($2,200-2,750/mo)
- Intensive: 30-40 hrs/wk ($3,300-4,400/mo)

### Layer 2: Membership ($100/year)
Includes 40 Time Bank hours + Comfort Card + QR viral network.

### Layer 3: Assessments ($150-300 each)
CII and CRI assessments supervised by Dr. Emdur. Revenue from Day 1, pre-license.

### Layer 4: CMS ACCESS Model (2027)
Outcome-aligned payments from CMS. 50% performance withhold — you get it back by keeping people healthy and home.

### Layer 5: CHI — Community Health Integration
Medicare G0023 billing ($85-120/month/patient). Certified community health workers providing social support.

### Layer 6: PIN — Principal Illness Navigation
Medicare G0024 billing. Navigating complex chronic conditions.

### Layer 7: LEAD — Behavioral Health
Medicare add-on for behavioral health navigation.

### Layer 8: Hospital Retainers
BCH Safe Graduation program: 72-hour post-discharge companion care. 10 patients/month capacity. ~$300+/patient/month (CHI + PIN + RPM combined).

### Layer 9: Employer Benefits
BVSD pilot: CII burnout assessment as employee benefit. PEPM $4.50/employee/month. 1,717 teachers = $7,726.50/month revenue.

### Layer 10: Cooperative Insurance (Phase 3)
Self-funded health insurance for worker-owners via cooperative structure.

### Revenue Sequencing

| Phase | Timeline | Revenue Sources |
|-------|----------|----------------|
| Phase 1 | Weeks 1-12 | Assessments ($150-300), Placement bridge ($870 registration) |
| Phase 2 | Months 4-6 | Private pay ($35/hr), Membership ($100/yr) |
| Phase 3 | Months 6-12 | CHI/PIN Medicare billing, Employer PEPM |
| Phase 4 | Year 2 | BCH hospital retainers, PACE sub-cap |
| Phase 5 | 2027+ | CMS ACCESS, ELEVATE, self-funded insurance |

---

## 14. Background Checks and Trust

### 14.1 Why Early

Trust is the product. co-op.care pushes background checks early in the onboarding process — not as a gate, but as a signal. When someone's Comfort Card shows a verified badge, every interaction starts from a place of trust.

### 14.2 Pricing Model

| Option | Cost | What You Get |
|--------|------|-------------|
| Standard | $30 | Background check at cost (no markup, no profit) |
| LMN Upgrade | $59/month | Background check FREE + Letter of Medical Necessity + 28-36% HSA/FSA tax savings on all care |

The LMN upgrade is the conversion trigger: "Your background check is $30, or it's free when you upgrade to LMN for $59/month — which also saves your family 28-36% on every hour of care through HSA/FSA." Most families save $150-300/month with the LMN — the background check pays for itself on day one.

### 14.3 Checkr Integration

co-op.care never touches sensitive PII. The entire background check is handled through Checkr's hosted flow:

**Step 1: Create Candidate**
```
POST /v1/candidates
Body: { email, first_name, last_name }
```
Only name and email — no SSN, no DOB, no address.

**Step 2: Create Invitation**
```
POST /v1/invitations
Body: { candidate_id, package: "tasker_standard", work_locations: [{ state: "CO" }] }
```
Returns `invitation_url` → `https://apply.checkr.com/invite/...`

**Step 3: Worker Completes on Checkr**
Worker enters their SSN, DOB, and address on Checkr's FCRA-compliant hosted page. co-op.care never sees this data.

**Step 4: Webhook**
```
POST /webhooks/checkr
Event: report.completed
Result: "clear" | "consider"
```

**Invitation Details:**
- Valid for 30 days (per `BACKGROUND_CHECK.INVITATION_EXPIRY_DAYS`)
- Auto-reminder emails every 24 hours
- If expired, status moves to `expired` and new invitation can be generated

### 14.4 Implementation — Codebase

The background check is wired across three files:

**Constants** (`src/shared/constants/business-rules.ts` → `BACKGROUND_CHECK`):
- `CHECKR_PACKAGE: 'tasker_standard'` — basic criminal + sex offender registry
- `STANDALONE_PRICE: 30` / `LMN_MONTHLY_PRICE: 59`
- `FREE_WITH_LMN: true`
- `INVITATION_EXPIRY_DAYS: 30`
- `PROFILE_BOOST: { submitted: 85, cleared: 95 }` — profile completeness percentages
- `COPY` object with all trust messaging strings

**State** (`src/client/stores/signupStore.ts` → `BgCheck` interface):
```typescript
interface BgCheck {
  status: 'not_started' | 'invited' | 'pending' | 'clear' | 'consider' | 'expired';
  checkrCandidateId?: string;
  checkrInvitationUrl?: string;
  invitedAt?: string;
  completedAt?: string;
  freeWithLmn?: boolean;
}
```
Every `ComfortCardHolder` has a `bgCheck` field initialized to `{ status: 'not_started' }`. The `setBgCheck()` action updates it incrementally.

**Sage Domain** (`src/client/features/sage/SageChat.tsx`):
- Domain: `background_check` — classified by keywords: "background check", "bg check", "checkr", "trust check", "verified", "get verified", "trust score"
- Response presents the dual-offer with $30 standalone vs FREE with LMN upgrade
- Default `suggestedNext` nudges toward the LMN upgrade path (higher conversion)
- Followup chips: "$30 at cost" / "FREE with LMN" / "Why is this needed?"

### 14.5 Dynamic Tiles After Background Check

When Sage enters the `background_check` domain, the card tiles swap to:
- Tile 1: **"Get Verified"** — "$30 at cost" → triggers standalone check flow
- Tile 2: **"FREE with LMN Upgrade"** — "$59/mo saves 28-36%" → triggers LMN conversion
- Tile 3: **"Why Trust?"** — "Protects every family" → explains the trust model

### 14.6 Profile Completeness Impact

Background check status affects the gamified profile completeness meter:
- `not_started` → no boost
- `invited` or `pending` → 85% completeness (submitted)
- `clear` → 95% completeness (verified badge on card)
- `consider` → manual review by admin, no badge until resolved

---

## 15. Viral Loops and Community Growth

### 15.1 The QR Loop

The primary viral mechanism is the QR code on every Comfort Card:

1. Sarah gets her Comfort Card with QR code
2. Sarah shares QR with her neighbor Maria at the grocery store
3. Maria scans → lands on co-op.care → sees "Sarah connected you"
4. Maria gets her own Comfort Card in <2 minutes
5. Both Sarah and Maria receive referral bonus hours
6. Maria shares her QR with her coworker Tom
7. Cascade visualization shows: Sarah → Maria → Tom

### 15.2 Referral Bonuses

| Referrer's Tier | Bonus Per Party |
|----------------|----------------|
| Seedling | 5 hours |
| Rooted | 7 hours |
| Canopy | 10 hours |

Both referrer AND referred receive the bonus. This creates a flywheel: more hours → higher tier → bigger referral bonus → more referrals → more hours.

### 15.3 Bio-Catalytic Engine

**Default Care Credit:** Every new member starts with 1 seed hour (loss aversion hook). "You already have 1 Care Credit. Use it or grow it."

**Catalyst Personas (4 types):**

| Persona | Message | CII Level | Likely Tasks |
|---------|---------|-----------|-------------|
| Alpha Daughter | "Get your Saturday back" | HIGH | Companionship, meals, rides |
| Senior | "Your wisdom is worth hours" | LOW | Teaching, phone companionship, admin |
| Neighbor | "Your skills become care currency" | MEDIUM | Yard work, grocery, errands, pet care |
| Worker-Owner | "Own your work, build your practice" | HIGH | Companionship, meals, housekeeping, tech |

**5-in-30 Catalyst Challenge:** Bank 5 hours within 30 days of joining.
- Tier 1: 1 hour → Founder Status badge
- Tier 2: 3 hours → Care Card discount at local partners
- Tier 3: 5 hours → Founding Family recognition + 2 bonus hours

**Social Proof:** Community count displayed after 10 members. Top 5 catalysts shown (opt-in only, `spotlight_opt_out` flag in database).

### 15.4 Scarcity Frame

"Today there are 7 caregivers for every person who needs care. By 2035, that drops to 4:1. You're not just joining a co-op — you're building the infrastructure your community will need."

---

## 16. The Cooperative Model

### 16.1 Legal Structure

**Colorado Limited Cooperative Association (LCA)** — filed March 10, 2026.

Why LCA (not LLC):
- Enables patron/investor dual-class membership
- Subchapter T cooperative taxation (pass-through patronage dividends)
- Democratic governance (one member, one vote at Canopy tier)
- Compatible with DAO governance tools (Snapshot voting, Gnosis Safe treasury)

### 16.2 Membership Classes

| Class | Members | Rights |
|-------|---------|--------|
| Patron Members | Families, community members | Service access, Time Bank, QR network |
| Worker-Owner Members | Care Navigators | All patron rights + voting + equity + board eligibility |
| Investor Members (Phase 3) | Impact investors | Financial returns, no governance control |

### 16.3 Worker-Owner Economics

- **Wage:** $25-28/hr (vs. $16.77 industry average)
- **Benefits:** W-2 with Cigna PPO (via Opolis or Justworks)
- **Equity:** ~$52,000 over 5 years via patronage dividends
- **Equity rate:** $2.00/hour worked → accumulated equity
- **Vesting:** Quarterly accrual, fully vested at Year 5
- **Governance:** Full voting rights at Canopy tier, board eligibility

### 16.4 Patronage Dividends (Subchapter T)

Worker-owners receive patronage dividends based on hours worked — this is tax-advantaged income under IRS Subchapter T. The cooperative retains a percentage for reserves and distributes the rest proportionally.

### 16.5 Governance Progression

| Tier | Governance Rights |
|------|------------------|
| Seedling | Read community updates, attend meetings |
| Rooted | Advisory vote on community matters |
| Canopy | Full binding vote + board eligibility |

### 16.6 DAO Tools (Phase 2)

- **Snapshot** — Gasless off-chain voting
- **Gnosis Safe** — Multi-sig treasury management
- **Token model** — Exploring tokenized patronage (legal question pending with Jason Wiener: SEC implications of tokenized Subchapter T patronage under LCA)

---

## 17. Security, HIPAA, and Privacy

### 17.1 HIPAA Compliance

co-op.care handles PHI (Protected Health Information) and must comply with HIPAA:

- **No PHI in logs** — error messages, console output, and client-side storage never contain patient data
- **No PHI in errors** — error handler middleware strips PHI before returning to client
- **No PHI in service worker cache** — PWA service worker explicitly excludes PHI routes
- **AuditEvent logging** — every FHIR resource access generates an AuditEvent in Aidbox
- **BAA required** — Business Associate Agreements with all PHI-handling vendors (Railway at $1,000/mo, Aidbox, Checkr)

### 17.2 Authentication

- **JWT RS256** — 15-minute access tokens, 7-day refresh tokens
- **HttpOnly cookies** — tokens never accessible to JavaScript
- **7 roles:** conductor, worker_owner, timebank_member, medical_director, admin, employer_hr, wellness_provider
- **Multi-role per user** — a person can be both a conductor (family caregiver) and a timebank_member
- **2FA mandatory** for medical_director and admin roles

### 17.3 What We Never Store

- SSNs (Checkr handles background check PII)
- Full credit card numbers (Stripe handles payments)
- Bank account numbers (payroll provider handles direct deposit)
- Passwords in plaintext (bcrypt hashed via pgcrypto)

### 17.4 PHI Access Roles

Only 4 roles can access PHI:
- `conductor` (their own family's data only)
- `worker_owner` (assigned families only)
- `medical_director` (all patients under supervision)
- `admin` (system administration)

### 17.5 Audit Trail

Every PHI access is logged:
- Who accessed it (user ID + role)
- What was accessed (resource type + ID)
- When (timestamp)
- Why (action context: "CII assessment review", "care plan update")
- Stored as FHIR AuditEvent in Aidbox (immutable)

### 17.6 Data Residency

- **Phase 1:** Railway US region (no HIPAA BAA yet — no PHI in Phase 1)
- **Phase 2:** Railway HIPAA BAA ($1,000/month minimum, annual commitment) when PHI handling begins at Month 6+
- **Aidbox:** Health Samurai cloud (HIPAA-compliant, BAA available)
- **Redis:** Ephemeral cache only — no PHI cached

---

## 18. Technical Architecture

### 18.1 Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React + TypeScript | 19.x + 5.x | UI framework |
| Build | Vite + vite-plugin-pwa | 6.4.x | Build tool + PWA |
| CSS (new) | Tailwind CSS | 4.x | Styling |
| CSS (legacy) | Inline styles | — | Legacy components (DO NOT change) |
| Backend | Fastify | 5.x | API server (modular monolith) |
| Runtime | Node.js LTS | 22.x | Server runtime |
| Operational DB | PostgreSQL 16 + PostGIS | 16.x | Users, Time Bank, tasks, matching |
| Clinical DB | Aidbox FHIR R4 | Latest | Clinical records, interoperability |
| Cache/Pub-Sub | Redis | 7.x | Job queue, real-time, caching |
| State | Zustand | Latest | Client-side state management |
| Charts | Recharts | 2.x | Data visualization |
| Testing | Vitest + Playwright | Latest | Unit + E2E |

### 18.2 Monorepo Structure

```
src/
  client/                  # React frontend
    features/
      sage/                # SageChat, CareCard, CardAndSage, SageHero
    components/            # Shared UI (Logo, etc.)
    stores/                # Zustand stores (auth, signup)
    legacy/                # Inline-styled legacy components
  server/                  # Fastify backend
    database/
      schema.sql           # PostgreSQL schema (15 core + 4 relation tables)
      aidbox.ts            # Aidbox FHIR client
      redis.ts             # Redis connection
    modules/               # 18 Fastify plugin modules
      auth/                # JWT RS256, RBAC, 2FA
      assessments/         # CII, Mini CII, CRI, KBS
      timebank/            # Ledger, matching, GPS, streaks
      family/              # Family + CareRecipient CRUD
      lmn/                 # Letter of Medical Necessity
      payment/             # Stripe integration
      notifications/       # Push, SMS, email, in-app
      fhir-sync/           # PostgreSQL → Aidbox outbox
      sage/                # Server-side Sage domain routing
      coverage/            # Insurance coverage checking
      acp/                 # Advance Care Planning
      worker/              # Worker-owner management
      employer/            # Employer dashboard
      admin/               # Admin operations
      settings/            # User preferences
      contact/             # Contact management
      wearable-mcp/        # Apple Health integration
      email/               # SendGrid transactional email
    middleware/
      auth.middleware.ts    # JWT verification + role extraction
      audit.middleware.ts   # PHI access logging
      rate-limit.middleware.ts
      error-handler.middleware.ts  # HIPAA-safe errors
    jobs/                  # Background workers
      timebank-expiry.job.ts
      membership-renewal.job.ts
      lmn-renewal.job.ts
      kbs-reassessment.job.ts
  shared/                  # Shared between client/server
    constants/             # 12 constant files (immutable business rules)
    types/                 # 20 TypeScript type files
```

### 18.3 Database Schema (PostgreSQL)

**Extensions:** pgcrypto (UUID generation), PostGIS (geography/distance)

**Core Tables (10):**

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `user` | Authentication + profile | roles[], location (GEOGRAPHY), background_check_status, skills[] |
| `family` | Household unit | conductor_id, membership_status, stripe_customer_id |
| `care_recipient` | Person being cared for | family_id, mobility_level, cognitive_status, active_omaha_problems[], fhir_patient_id |
| `timebank_account` | Credit ledger head | 6 balance fields, current_streak, longest_streak |
| `timebank_transaction` | Double-entry ledger | type (7 values), hours, balance_after, task_id |
| `timebank_task` | Individual care exchange | task_type, location (GEOGRAPHY), status, omaha_problem_code, GPS check-in/out |
| `assessment` | CII/Mini CII/CRI | scores[], total_score, zone, review_status, fhir_questionnaire_response_id |
| `kbs_rating` | Knowledge-Behavior-Status | omaha_problem_code, K/B/S (1-5), assessment_day (0/30/60/90) |
| `care_interaction` | Visit log / encounter | worker_id, notes, vitals_recorded (JSONB), omaha_problems[], fhir_encounter_id |
| `notification` | Push/SMS/email/in-app | type, channel, title, body, data (JSONB) |

**Relation Tables (4 — Graph Edges):**

| Table | Edge | Purpose |
|-------|------|---------|
| `helped` | user → user | Time Bank cascade tracking |
| `member_of` | user → family | Cooperative membership |
| `assigned_to` | user → family | Care team assignment |
| `referred` | user → user | Viral loop tracking, bonus_awarded flag |

**Additional Tables (4):**

| Table | Purpose |
|-------|---------|
| `message` | Secure messaging (thread-based) |
| `respite_fund` | Singleton emergency fund (balance_hours, balance_dollars) |
| `worker_equity` | Subchapter T patronage ($2/hr equity accrual) |
| `outbox_event` | PostgreSQL → Aidbox CDC (transactional outbox pattern) |

**Key Indexes:**
- GIN index on `user.roles[]` for role-based queries
- GIST index on `timebank_task.location` for geospatial matching
- Partial index on `assessment` where `review_status = 'pending'` for MD review queue
- Partial index on `outbox_event` where `status = 'pending'` for sync worker

### 18.4 Fastify Plugin Pattern

Each module is a Fastify plugin registered on the app:

```typescript
// Each module exports a plugin
export default async function assessmentPlugin(fastify: FastifyInstance) {
  // Register routes
  fastify.post('/assessments/cii', { schema: ciiSchema }, ciiHandler);
  fastify.post('/assessments/mini-cii', { schema: miniCiiSchema }, miniCiiHandler);
  // ...
}
```

Request/response validation via TypeBox (JSON Schema compatible). All queries parameterized to prevent SQL injection.

---

## 19. Deployment and Infrastructure

### 19.1 Railway

**Chosen over AWS** for near-zero DevOps overhead. $20/month Pro plan for Phase 1.

| Service | Railway Config |
|---------|---------------|
| Fastify API | Node.js service, port 3000 |
| PostgreSQL 16 | Managed database, PostGIS extension |
| Redis 7 | Managed Redis instance |
| Aidbox | External service (Health Samurai cloud) |

### 19.2 HIPAA Timeline

- **Phase 1 (now):** No PHI — demo mode, assessment tools, community features. Standard Railway plan.
- **Phase 2 (Month 6+):** PHI handling begins. Activate Railway HIPAA BAA ($1,000/month minimum, annual commitment).

### 19.3 PWA Configuration

- `vite-plugin-pwa` for service worker generation
- Manifest with co-op.care branding (teal/navy theme)
- Offline fallback page
- No PHI cached in service worker
- Apple Wallet / Google Pay integration for Comfort Card

### 19.4 CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. TypeScript check (`tsc --noEmit`)
2. Lint (ESLint + Prettier)
3. Unit tests (Vitest)
4. Build (`vite build`)
5. E2E tests (Playwright)
6. Deploy to Railway (on main branch merge)

---

## 20. AI Strategy — Agentic Memory as Moat

### 20.1 The Insight

When industry turnover is 77%, every caregiver departure destroys accumulated knowledge about the patient — their routines, preferences, medication sensitivities, emotional triggers, de-escalation strategies. The next caregiver starts from zero.

co-op.care's 15% projected turnover means institutional knowledge compounds. After 6 months, a family's care record includes hundreds of Omaha-coded observations, CII trend data, KBS outcome measurements, caregiver notes, and interaction patterns. This data becomes unswitchable — you can't replicate 6 months of relationship context by switching to a different agency.

### 20.2 What Sage Remembers

**Per-User Profile (localStorage):**
```typescript
interface UserProfile {
  lastMiniCII?: { physical, sleep, isolation, total, zone, date };
  conversationCount: number;
  topDomains: Record<string, number>;  // domain → interaction count
  referralCount: number;
  lastVisit: string;  // ISO timestamp
}
```

**Per-Session Context:**
```typescript
interface ConversationContext {
  lastDomain: Domain | null;
  onboardingPhase: OnboardingPhase;
  suggestedQuestion: string | null;
  dynamicTiles: TileWithAction[];
}
```

### 20.3 Knowledge Categories (Future — Agentic Memory)

When Sage evolves to Phase 3 (agentic), it captures:
- Patient daily routines and preferences
- Medication reactions and timing sensitivities
- Emotional triggers and de-escalation strategies
- Family communication patterns
- Neighborhood resources and local context
- Care technique effectiveness (what works for this specific person)
- Omaha-coded observation history
- CII trend data and burnout predictors

### 20.4 Evolution Path

| Phase | Intelligence | Cost | Latency |
|-------|-------------|------|---------|
| Phase 1 | Keyword pattern matching | $0 | 0ms |
| Phase 2 | Gemini embedding → RAG → Gemini Flash | ~$0.01/query | ~500ms |
| Phase 3 | Agentic tool calling + proactive outreach | ~$0.05/interaction | ~1-2s |

Phase 1 works offline. Phase 2 requires internet. Phase 3 requires the full backend.

---

## 21. UX Philosophy — Radical Simplification

### 21.1 The Problem With Traditional Apps

Healthcare apps are designed by technologists who think in screens, workflows, and feature matrices. The Alpha Daughter at 2am doesn't want to navigate to Settings > Care Team > Schedule > New Visit. She wants to say "I need someone to sit with Dad on Saturday."

### 21.2 The Solution: Conversation IS the Interface

Everything the user needs is accessible through a single text input (or voice input, Phase 2). Sage understands context, remembers history, and proactively surfaces what's most relevant.

**Before:** 117 routes, 95+ feature modules, navigation menus, settings screens
**After:** 4 routes, 2 surfaces (Card + Sage), zero navigation

### 21.3 Design Principles

1. **Mobile-first** — designed for a phone held in one hand while the other holds a loved one
2. **Warm, not clinical** — sliders, not forms; conversations, not workflows
3. **Progressive disclosure** — start simple, reveal complexity only when needed
4. **No reading required** — tiles are visual, Sage speaks in plain language
5. **Context-aware** — tiles change based on what you just talked about
6. **Offline-capable** — Phase 1 Sage works without internet
7. **Accessible** — high contrast, large touch targets, screen reader compatible

### 21.4 Brand System

- **Fonts:** Literata (serif, headings) + DM Sans (sans-serif, body)
- **Primary:** Teal #2BA5A0 (sage token)
- **Secondary:** Navy #1B3A5C (copper token)
- **Financial:** Gold #C49B40
- **Institutional:** Blue #4A6FA5
- **Federal:** Purple #7A5CB8
- **Logo:** Interlocking hands forming house shape with heart center

---

## 22. Partner Value Propositions

### 22.1 Boulder Community Health (BCH)

**Their problem:** 15.4% readmission rate, $16,037 per readmission, CMS penalties for excess readmissions.

**Our solution:** Safe Graduation — 72-hour post-discharge companion care. A trusted person in the home during the critical window when patients are most likely to be readmitted.

**Revenue model:** CHI (G0023) + PIN (G0024) + RPM billing, ~$300+/patient/month. 10 patients/month initial capacity.

**Contact:** Grant Besser, BCH Foundation VP. 30-minute listening conversation (not a pitch). Lead with Armilla/Beazley risk shields (AI liability insurance).

### 22.2 BVSD (Boulder Valley School District)

**Their problem:** 1,717 teachers experiencing caregiver burnout. Teacher retention declining. Absenteeism costs rising.

**Our solution:** CII burnout assessment as employee benefit. Teachers access Sage for 30-second burnout checks, care coordination, and Time Bank services.

**Revenue model:** PEPM $4.50/employee/month = $7,726.50/month revenue. Funded through employee benefits budget.

### 22.3 Elevations Credit Union

**Their interest:** Malcolm Baldrige winner 2x. Local Change Foundation with $440,600 in grants for 2026. Community banking relationship.

**Our alignment:** Cooperative values (credit union = financial cooperative, co-op.care = care cooperative). Local first. Community investment.

### 22.4 BCAAA (Boulder County Area Agency on Aging)

**Their mission:** Support aging adults and family caregivers in Boulder County.

**Our integration:** CII burnout assessment as referral engine. When a caregiver scores Yellow or Red, BCAAA can refer them to co-op.care for Time Bank services and respite.

**Target demographic:** Sandwich Generation (35-55 years), exact overlap with Alpha Daughter persona.

### 22.5 TRU PACE

**Their model:** 341 enrollees, $2,600/month capitated payment per enrollee, all-inclusive care.

**Our role:** Companion care sub-contractor. We deliver companion visits at $1,800/month cost, they pay us from the $2,600 cap.

**Target:** 20 enrollees in Year 1.

---

## 23. Regulatory Strategy

### 23.1 State Licensing

**CDPHE Class B License (NOW):**
- Companion care and personal care (non-medical)
- Application processing: 4-6 months
- Required for: paid companion care, personal care services

**CDPHE Class A License (Phase 3, Year 2+):**
- Skilled home care (nursing, therapy)
- Required for: medical home care, skilled services

### 23.2 Medicare Enrollment

**CMS-855B Application:**
- Required for: CHI (G0023), PIN (G0024), CCM, RPM billing
- Processing time: ~90 days
- Medical Director (Dr. Emdur) required for supervision

### 23.3 CMS Programs

| Program | Timeline | Revenue Type |
|---------|----------|-------------|
| CHI (Community Health Integration) | Month 6 | G0023 monthly billing |
| PIN (Principal Illness Navigation) | Month 6 | G0024 monthly billing |
| CCM (Chronic Care Management) | Month 6 | Monthly per-patient |
| RPM (Remote Patient Monitoring) | Month 6 | Per-device monthly |
| ACCESS Model | Jan 2027 (Cohort 2) | Outcome-aligned, 50% withhold |
| ELEVATE | TBD | Community-based wellness |

### 23.4 Placement Agency Bridge

While waiting for Class B license (4-6 months), co-op.care operates as a registered placement agency:
- CDPHE Placement Agency registration (faster than Class B)
- 1099 matching model: families matched with independent caregivers
- $870 one-time registration fee per family
- Revenue bridge until license arrives
- At license: caregivers transition to W-2 via batch Opolis onboarding

### 23.5 Colorado Employee Ownership Tax Credit

75% tax credit (increased from 50% in 2026) covering legal, accounting, and technical assistance costs for cooperative formation. Apply immediately.

### 23.6 Skill Advance Colorado Grant

Up to $200,000 for training new full-time Colorado employees. Funds Conductor certification training for Care Navigators.

---

## 24. The Career Path — From Neighbor to Owner

### 24.1 The Progression

```
Neighbor (Time Bank member, 0 hours)
    → Seedling (1-39 hours, 1.0x earning)
        → Rooted (40-119 hours, 1.25x earning, advisory vote)
            → Canopy (120+ hours, 1.5x earning, full vote, board eligible)
                → Care Navigator (W-2, $25-28/hr, benefits)
                    → Worker-Owner (equity accrual, patronage dividends)
                        → Board Member (cooperative governance)
```

### 24.2 Certification Modules

| Module | Hours | Cost | Skills |
|--------|-------|------|--------|
| Safe Transfers | 2 | $150 | Lifting, mobility assistance |
| Bathing | 2 | $150 | Personal hygiene care |
| Medication | 3 | $200 | Medication management, scheduling |
| Dementia | 4 | $250 | Cognitive support, sundowning |
| Fall Prevention | 2 | $150 | Environmental safety, exercises |
| Emergency | 2 | $150 | CPR, first aid, when to call 911 |
| Comprehensive | 8 | $750 | All of the above + advanced |

Completing certification modules earns 5 Training Bonus hours in the Time Bank.

### 24.3 Worker-Owner Economics

| Year | Wage | Equity Accrual | Cumulative Equity |
|------|------|----------------|-------------------|
| 1 | $25-28/hr | $2/hr worked | ~$4,000 |
| 2 | $25-28/hr | $2/hr worked | ~$12,000 |
| 3 | $25-28/hr | $2/hr worked | ~$24,000 |
| 4 | $25-28/hr | $2/hr worked | ~$38,000 |
| 5 | $25-28/hr | $2/hr worked | ~$52,000 |

Plus: W-2 benefits (Cigna PPO), patronage dividends (Subchapter T), governance rights, board eligibility.

**Compare to industry:** $16.77/hr, 1099 (no benefits), zero equity, zero governance, 77% turnover.

---

## 25. Immutable Numbers

These numbers are constants in the codebase and must not be changed without founder approval:

| Metric | Value | Source |
|--------|-------|--------|
| US family caregivers | 63M | AARP/NAC 2020 |
| Weekly unpaid care | 27 hours | AARP/NAC 2020 |
| Out-of-pocket per caregiver | $7,200/year | AARP |
| Agency turnover | 77% | PHI 2023 |
| BVSD teachers | 1,717 | BVSD (NOT 6,000) |
| TRU PACE enrollees | 341 | TRU PACE |
| BCH readmission rate | 15.4% | BCH data |
| Average readmission cost | $16,037 | BCH data |
| Private pay rate | $35/hr | Market rate |
| Worker-owner wage | $25-28/hr + equity (~$52K/5yr) | co-op.care |
| Time Bank cash rate | $15/hr ($12 coord + $3 Respite) | co-op.care |
| Time Bank floor | 40 hrs/year (in $100 membership) | co-op.care |
| HSA/FSA savings via LMN | 28-36% | IRS Pub 502 |
| CII dimensions | 12, scored 1-10, total /120 | co-op.care |
| CRI range | min 14.4, max 72.0 | co-op.care |
| KBS subscales | K 1-5, B 1-5, S 1-5 | Omaha System |
| Omaha System problems | 42 across 4 domains | Public domain |
| Employer PEPM | $4.50/employee/month | co-op.care |
| PACE monthly cap | $2,600/enrollee | TRU PACE |
| Assessment fee range | $150-300 | co-op.care |
| GPS verification radius | 0.25 miles | co-op.care |
| Deficit maximum | -20 hours | co-op.care |
| Background check (at cost) | $30 | Checkr |
| LMN upgrade | $59/month | co-op.care |

---

## 26. Anti-Patterns

Things we explicitly do NOT build:

1. **NO marketplace** where families browse/hire caregivers — matching is algorithmic
2. **NO separate apps** per user type — ONE app with role-based views
3. **NO real-time video calling** — Zoom API integration only
4. **NO insurance claims engine** — Age at Home is 2028+
5. **NO drag-and-drop scheduling** — coordinator assigns, worker confirms
6. **NO long Time Bank onboarding gate** — first interaction within 24 hours
7. **NO clinical-feeling CII** — warm, conversational, slider-based
8. **NO gamification** (points/levels/badges/leaderboards) — streaks + impact scores only
9. **NO dark patterns for Respite Default** — opt-out must be genuinely easy
10. **NO storage of SSNs/full card numbers/bank accounts** — Stripe and Checkr handle PII

---

## 27. 90-Day Roadmap

### Phase 1: Foundation (Weeks 1-3)
- Josh Emdur agreement signed
- LMN template created
- PIN/CHI billing protocols established
- CDPHE Placement Agency registration
- Employee Ownership Tax Credit application
- Skill Advance Colorado grant application
- Assessment revenue begins ($150-300/CII)

### Phase 1B: Bridge Revenue (Weeks 3-12)
- 1099 placement matching begins ($870 registration/family)
- First families matched with independent caregivers
- CII assessments generating clinical data

### Phase 2: License + Medicare (Months 2-4)
- CDPHE Class B license application submitted
- CMS-855B Medicare enrollment submitted
- Opolis Stage 1 (benefits infrastructure)
- Galaxy Watch pilot (wearable vitals)
- NLP prototype (Sage Phase 2)
- BCAAA partnership formalized

### Phase 3: Launch (Months 4-6)
- Class B license received → W-2 transition
- BCH pilot: 5-10 patients/month
- BVSD CII pilot: 1,717 teachers
- PIN/CHI/CCM Medicare claims begin
- 5 founding Care Navigators hired
- 15-20 families served
- CMS ACCESS Model application (targeting Jan 2027 Cohort 2)

### Key People

| Person | Role | Priority |
|--------|------|----------|
| Josh Emdur, DO | Medical Director | All 50 state licenses, BCH hospitalist, CMO of Automate Clinic |
| Jacob | Backend developer | PostgreSQL→PostgreSQL migration, Fastify endpoints |
| Pavel | Health Samurai / Aidbox | FHIR R4 integration |
| Jason Wiener | Cooperative attorney | LCA bylaws, Subchapter T, tokenized patronage SEC |
| Grant Besser | BCH Foundation VP | 30-min listening conversation, Armilla/Beazley risk shields |

---

## 28. Phase 2 and Beyond

### Phase 2 (After 40 families served)
- CRI Assessment Engine with MD review workflow
- KBS Outcome Tracking (30/60/90 day)
- Full Omaha ↔ ICD-10 Crosswalk Engine (5-step pipeline)
- Worker-Owner Portal (equity dashboard, scheduling, payroll)
- LMN generation + DocuSign + HSA/FSA Marketplace
- Comfort Card reconciliation (physical card ↔ digital balance)
- Wearable Integration (Apple Health, Galaxy Watch)
- Employer Dashboard (BVSD, corporate benefits)
- Admin Dashboard (operations, analytics, compliance)

### Phase 3 (Year 2+)
- BCH Epic HL7 FHIR integration
- Predictive hospitalization ML (CII trends → risk scores)
- PACE data exchange
- Federation multi-tenancy (replicate co-op.care model to other cities)
- Class A license (skilled nursing, therapy)
- DAO governance tools (Snapshot, Gnosis Safe)
- Self-funded cooperative insurance
- CMS ELEVATE participation

### The Long-Term Vision

co-op.care is not a home care agency. It is cooperative infrastructure for community caring. The technology (Sage, Comfort Card, Time Bank) creates a network where every act of kindness is documented, valued, and reciprocated. The cooperative structure ensures that value flows to the people who create it — caregivers and families — not to private equity extraction.

The Omaha System turns neighbor-helping-neighbor into clinical documentation. Clinical documentation enables HSA/FSA savings, Medicare billing, and health system partnerships. Revenue from these sources funds higher wages, equity, and benefits for worker-owners. Higher wages and ownership reduce turnover. Lower turnover means deeper care relationships. Deeper relationships mean better outcomes. Better outcomes mean lower readmissions. Lower readmissions mean more health system revenue. The flywheel spins.

Every hour of care strengthens the community you own.

---

*"Sage advice from co-op.care"*

---

**Document:** `docs/PRODUCT-BIBLE.md`
**Repository:** `/Users/blaine/Desktop/careos-claude-code/`
**Entity:** co-op.care Limited Cooperative Association
**Founded:** March 10, 2026, Boulder, Colorado
