# co-op.care — Blitzy Product Prompt

## WHY — Vision & Purpose

### What problem does this product solve?

**63 million American family caregivers are invisible, exhausted, and financially devastated.**

The average family caregiver provides 27 hours/week of unpaid care, spends $7,200/year out-of-pocket, and has no structured support system. When they search for help, they find private-equity-owned agencies charging $45,000+/year while paying caregivers $16.77/hour — a 40-60% extraction model that produces 77% annual caregiver turnover. Every time a caregiver churns, the family starts over with a stranger who knows nothing about their loved one.

The "Alpha Daughter" — a woman aged 35-60 managing her aging parent's care from her phone — is the primary user. She's coordinating medications, doctor appointments, meal prep, companionship, and transportation while holding down a job and raising her own kids. She doesn't need another app with 50 features. She needs one person she trusts, and a community that has her back.

co-op.care is a worker-owned home care cooperative in Boulder, Colorado that replaces the extraction model with cooperative ownership. Caregivers earn $25-28/hour with W-2 benefits and equity. Families save 36% through physician-led clinical oversight and HSA/FSA tax optimization. The neighborhood itself becomes a clinical asset.

### What does this product do at a high level?

CareOS is a mobile-first Progressive Web App (PWA) that serves as the operating system for co-op.care. It has exactly **two surfaces**:

1. **The Comfort Card** — A digital identity card with QR code, member info, and 3 dynamic context-aware tiles. Think of it as a care-focused Apple Wallet card. It's the thing you show at the door, share with a friend, or scan to verify identity.

2. **Sage** — A conversational AI companion that replaces 95+ feature modules with natural language. Instead of navigating dashboards, you talk to Sage: "How's Mom doing?" → Sage checks vitals, recent care logs, upcoming appointments. "I need someone to drive Mom to the doctor Thursday" → Sage creates a task, matches nearby verified neighbors, confirms the booking.

The homepage is a story-first editorial scroll — real Boulder neighbors sharing real experiences — that converts visitors into free Comfort Card holders through a 3-field signup (first name, phone/email, intent). No payment required. The card unlocks Sage, and Sage handles everything else through conversation.

### Who are the primary users?

| Persona | Role | Entry Point | Primary Need |
|---------|------|------------|-------------|
| **Alpha Daughter** (Conductor) | Coordinating care for aging parent | Organic search, friend referral | "Someone I trust to help with Mom" |
| **Senior** | Direct care recipient | Family member shared card, neighbor | "My neighborhood has my back" |
| **Neighbor** | Community caregiver, earns time credits | Referral link, community posting | "My time has real value here" |
| **Worker-Owner** | W-2 employed caregiver with equity | Application, worker referral | "Own my work, own my future" |

### How is this different from what exists today?

| Dimension | PE Agencies (Honor, Care.com) | co-op.care |
|-----------|-------------------------------|-----------|
| Ownership | Private equity investors | Worker-owners (caregivers) |
| Caregiver pay | $16.77/hr avg, no benefits | $25-28/hr + Cigna PPO + equity |
| Turnover | 77% annual | 15% projected (structural) |
| Family cost | $45,000+/year | 36% less via LMN tax optimization |
| Product surface | Dashboard with 50 tabs | Card + Sage (2 surfaces) |
| Care continuity | New stranger every few months | Same caregiver, compounding context |
| Community | Transactional marketplace | Cooperative time bank |
| Clinical | None or basic | Omaha System coding, CII assessment, physician oversight |

**The structural moat:** When turnover drops from 77% to 15%, the AI companion (Sage) accumulates months and years of patient-specific context — routines, medication reactions, emotional triggers, family communication patterns. A competitor with high turnover restarts from zero with every caregiver change. This compounding "Agentic Memory" is an insurmountable switching cost.

---

## WHAT — Core Requirements

### Behaviors: What specific things should users be able to do?

**Screen 1 — Homepage (Public, No Auth)**

- View an editorial scroll of real community stories from Boulder neighbors
- See live social proof: neighbor count, hours given this week, families helped this month
- Try a mini Sage conversation (2 exchanges max) without signing up
- Tap "Get Your Free Card" or "I Want to Help" to enter the join flow
- Land on a personalized referral variant when arriving via QR code link (`/q/{memberId}`)

**Screen 2 — Join Flow (3 Fields → Card)**

- Enter first name, phone or email, and select intent ("I need care support" / "I want to give care")
- Receive an animated card reveal with confetti, showing their new member ID (format: `COOP-YYYY-XXXX`)
- See their unique QR code that encodes a referral URL
- Add card to Apple Wallet or Google Wallet (generates `.pkpass` / Google Pass)
- Get prompted to install PWA ("Add to Home Screen")

**Screen 3 — Card + Sage Dashboard (Card Required)**

- View their Comfort Card with QR identity code, member info, and care tier badge
- See a **Profile Memory Ring** around the QR code — 8 segments showing profile completeness (name, contact, intent, roles, mini CII, consent, background check, LMN)
- Interact with **3 dynamic context tiles** below the card, sorted by a priority algorithm based on: onboarding phase, time since last interaction, profile gaps, care tier, intent, and pending actions
- Tap tiles to trigger actions: Quick Check-In (Mini CII), Request Help, Browse Tasks, Get Verified (background check), Join LMN Program, See Nearby, Spread the Word, View Streak, etc.
- Chat with Sage below the tile bank — Sage handles all 12 operational domains through conversation:
  - `care`: Care plans, recipient status, vitals
  - `schedule`: Appointments, task scheduling
  - `assess`: CII, Mini CII, CRI assessments
  - `timebank`: Credit balance, task acceptance, streaks
  - `billing`: LMN enrollment, savings calculator, payments
  - `onboard`: Role selection, profile building, orientation
  - `message`: Secure messaging with care team
  - `emergency`: Emergency contacts, urgent protocols
  - `social`: Community events, gratitude, stories
  - `govern`: Voting, cooperative governance
  - `clinical`: Omaha-coded observations, FHIR data
  - `admin`: System administration (admin role only)
- Share their card via 7 channels: SMS, Email, WhatsApp, Facebook, X/Twitter, LinkedIn, Copy Link
- View nearby neighbors on a proximity map (Walking <0.5mi, Biking <1mi, Neighborhood <2mi, Community <5mi)

**Sage Conversational Onboarding**

- Sage guides new users through progressive profiling over multiple conversations (never a form):
  - `fresh` → Sage introduces itself warmly, asks one open question
  - `exploring` → User asks a question, Sage answers + asks what brought them here
  - `profile_intent` → Sage asks: seeking care, giving care, or both?
  - `profile_roles` → Sage asks which community roles interest them
  - `profile_community` → Sage explains the co-op model, asks about participation interest
  - `memory_consent` → Sage asks permission to remember the user across sessions
  - `onboarded` → Normal dynamic mode, tile bank active, full Sage capability
  - `returning` → Sage recognizes returning user, picks up where they left off

**Background Check Trust Flow**

- Sage introduces background check conversationally: "Verified neighbors get matched first"
- Two paths: Standard ($30 via Checkr) or Free with LMN tier ($59/month, includes background check + tax savings)
- Sage handles the entire flow through conversation, not forms
- Status tracked: `not_started` → `invited` → `pending` → `clear` / `consider` → `expired`

**LMN (Letter of Medical Necessity) Program**

- Sage introduces LMN as tax savings: "Did you know care expenses can be tax-deductible?"
- Inline savings calculator: enter annual care spend → see 28-36% savings
- Dr. Josh Emdur (Medical Director) signs LMN for HSA/FSA eligibility
- $59/month tier includes: LMN + free background check + priority matching
- Higher tier at $89/month adds: quarterly CRI assessment + care plan + clinical notes

**Viral Sharing Mechanics**

- 8 share categories with HIPAA-safe content: comfort_card, cii_result (zone only, never score), streak_milestone, gratitude, referral, time_bank_milestone, care_tier, community_story
- Every referral tracked via `?ref=COOP-XXXX` URL parameter
- Both parties earn tier-based bonus hours: Seedling 5hrs, Rooted 7hrs, Canopy 10hrs
- Referral chain visibility: "You've helped 6 families join the co-op"

### Workflows: What are the key processes?

**Workflow 1: Visitor → Card Holder (< 2 minutes)**
```
Homepage scroll → "Get Your Free Card" CTA →
Enter name + phone + intent (3 fields) →
Animated card reveal with confetti →
QR code generated (encodes referral URL) →
Prompt: Add to Wallet + Install PWA →
Redirect to Card + Sage dashboard
```

**Workflow 2: Card Holder → First Sage Conversation (immediate)**
```
Card dashboard loads →
Sage greeting based on intent (seeking/giving care) →
User responds naturally →
Sage asks one profiling question per exchange →
After 3-5 exchanges: profile_intent + profile_roles established →
Tiles update to reflect new context
```

**Workflow 3: Card Holder → Mini CII Quick Check (30 seconds)**
```
Tile "Quick Check-In" appears (high priority for seekers) →
Tap tile → Sage presents 3 sliders conversationally:
  "How physically demanding is caregiving right now?" (1-10)
  "How's your sleep been affected?" (1-10)
  "How isolated do you feel?" (1-10) →
Score calculated (max 30) → Zone assigned (Green/Yellow/Red) →
Sage responds with zone-appropriate support message →
Share trigger: "Know another caregiver who might need a check-in?"
```

**Workflow 4: Card Holder → Request Help (< 3 minutes)**
```
Tile "Request Help" or tell Sage "I need help with..." →
Sage asks: what kind of help? when? how long? →
Task created with Omaha System auto-coding →
Proximity matching: nearest verified neighbors scored →
Matched neighbor notified →
Neighbor accepts → GPS check-in at location →
Task completed → Time Bank credits transferred →
Gratitude prompt → Share trigger
```

**Workflow 5: Neighbor → Accept Task → Earn Credits**
```
Tile "Browse Tasks" or Sage shows nearby requests →
Task cards show: type, distance, estimated time, credits →
Accept task → Navigate to location →
GPS check-in (within 0.25 miles) →
Provide care → GPS check-out →
Credits deposited (with Respite Default: 90% to member, 10% to Respite Fund) →
Streak counter increments →
Tier progress updates → Share trigger
```

**Workflow 6: QR Referral Loop**
```
Card holder shares QR code (in-person or digital) →
Recipient scans → lands on /q/{memberId} →
Personalized landing: "{Name} thinks you'd love this community" →
"Get Your Free Card" CTA (pre-filled referrer) →
New card created → Both parties earn referral bonus hours →
New holder's card includes "Referred by {Name}" →
Viral coefficient target: K > 1.0
```

### Outcomes: What results define success?

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Homepage → Card creation | 15% conversion | Per visit |
| Card creation → Sage conversation | 80% | Same session |
| Sage conversation → Mini CII | 40% | Within 7 days |
| Card holder → Referral sent | 25% | Within 14 days |
| Referral → New card creation | 30% | Within 7 days of referral |
| Card holder → Background check | 15% | Within 30 days |
| Card holder → LMN enrollment | 8% | Within 60 days |
| Profile completeness (avg) | 62% | At 30 days |
| Day 7 return rate | 50% | Active session in 7 days |
| Day 30 return rate | 30% | Active session in 30 days |
| Viral coefficient (K-factor) | > 1.0 | Steady state |
| First Contentful Paint | < 1.5s | Every load |
| Bundle size (initial) | < 150KB gzipped | Build target |

---

## HOW — Planning & Implementation

### Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend** | React + TypeScript | 19.x | Strict mode, no `any` in business logic |
| **Build** | Vite + vite-plugin-pwa | 6.4.x | Service worker, offline fallback |
| **CSS** | Tailwind CSS | 4.x | Brand tokens: teal #2BA5A0, navy #1B3A5C, gold #C49B40 |
| **Fonts** | Literata (headings) + DM Sans (body) | — | Google Fonts, preloaded |
| **State** | Zustand | Latest | `signupStore` (localStorage) + `authStore` |
| **Routing** | React Router (HashRouter) | 7.x | Hash-based for PWA compatibility |
| **Charts** | Recharts | 2.x | For CII zone visualization |
| **QR** | qrcode.react | Latest | QR code generation |
| **PWA** | vite-plugin-pwa | Latest | Manifest, service worker, install prompt |
| **Backend** | Fastify (modular monolith) | 5.x | TypeBox schema validation |
| **Runtime** | Node.js LTS | 22.x | — |
| **Operational DB** | PostgreSQL | 3.0+ | Graph edges, geospatial, live queries |
| **Clinical DB** | Aidbox (FHIR R4) | Latest | PHI storage, clinical observations |
| **Cache** | Redis | 7.x | Pub-sub, job queue, session cache |
| **SMS** | Twilio | Latest | Notifications, verification |
| **Email** | SendGrid | Latest | Transactional email |
| **Payments** | Stripe | Latest | $100/year membership, $59/$89 LMN tiers |
| **Background Check** | Checkr | Latest | $30/check, integrated via API |
| **AI** | Google Gemini | Latest | Sage conversational engine, embeddings |
| **Testing** | Vitest (unit) + Playwright (E2E) | Latest | — |
| **Hosting** | Vercel (frontend) + Fly.io (backend) | — | — |

### System Requirements

**Frontend Architecture:**
- Single-page application with 3 primary screens (Homepage, Join Flow, Card+Sage)
- HashRouter for PWA deep-link compatibility
- Zustand stores with localStorage persistence for offline-first behavior
- Service worker caches homepage shell + card data for offline access
- All state survives page reload — card holder data persists in localStorage
- Mobile-first responsive design (375px primary breakpoint)
- `prefers-reduced-motion` support for all animations

**Backend Architecture:**
- Fastify modular monolith with plugin pattern per domain
- JWT RS256 authentication (15-min access / 7-day refresh)
- 7-role RBAC: conductor, worker_owner, timebank_member, medical_director, admin, employer_hr, wellness_provider
- Dual-database write pattern: PostgreSQL (sync) → Aidbox via Redis queue (async)
- All FHIR resource access logged as AuditEvent
- HIPAA-safe error handling: never expose PHI in error messages or logs
- Rate limiting on all public endpoints

**Data Architecture:**
- PostgreSQL for operational data: families, tasks, time bank ledger, matching, notifications
- Aidbox FHIR R4 for clinical data: Encounters, Observations, QuestionnaireResponses, AuditEvents
- Redis for: session cache, pub-sub (WebSocket fan-out), background job queue
- Graph relationships in PostgreSQL: `helped`, `member_of`, `assigned_to`, `cascaded_to`, `refers_to`
- Double-entry time bank ledger (earned, spent, bought, donated, expired, deficit)

**PWA Requirements:**
- Service worker caches homepage shell + story cards
- Offline mode: show cached card + "Sage needs internet" message
- Install prompt triggers after 2nd visit or first Sage conversation
- Push notification permission requested after onboarding complete
- Standalone display mode, teal theme color

### User Flows — Primary

**Flow 1: New Visitor (Organic)**
```
[Homepage] Editorial scroll with community stories
    ↓ Taps "Get Your Free Card"
[Join Flow] 3 fields: name, phone/email, intent
    ↓ Submits
[Card Reveal] Animated card with confetti + QR code
    ↓ Prompt: Wallet + PWA install
[Card + Sage] Dashboard with tiles + Sage greeting
    ↓ Sage asks first profiling question
[Onboarding] Progressive profiling through conversation (3-5 exchanges)
    ↓ Profile established
[Active Use] Dynamic tiles, full Sage access, share triggers
```

**Flow 2: Referred Visitor (QR Scan)**
```
[QR Landing] "/q/{memberId}" — "{Name} thinks you'd love this community"
    ↓ Taps "Get Your Free Card" (referrer pre-filled)
[Join Flow] 3 fields (referrer badge shown)
    ↓ Submits
[Card Reveal] Card shows "Referred by {Name}" + both earn bonus hours
    ↓ Same as organic from here
[Card + Sage] ...
```

**Flow 3: Returning Card Holder**
```
[Any Route] Auto-detected via localStorage
    ↓ Redirect to /card if card exists
[Card + Sage] Sage: "Welcome back, {Name}! You were looking at..."
    ↓ Tiles refresh with updated priorities
[Active Use] Continue from last onboarding phase
```

### Core Interfaces

**ComfortCardHolder (Zustand state)**
```typescript
interface ComfortCardHolder {
  firstName: string;
  phone?: string;
  email?: string;
  memberId: string;                    // COOP-YYYY-XXXX
  intent: 'seeking_care' | 'giving_care';
  referredBy?: string;
  qrUrl: string;                       // Encodes referral URL
  createdAt: string;
  walletAdded: boolean;
  pwaInstalled: boolean;
  memoryConsent: 'granted' | 'session_only' | 'pending';
  onboardingPhase: OnboardingPhase;    // 8 phases
  communityRoles: string[];
  bgCheck: BgCheck;                    // Checkr integration status
  profileCompleteness: number;         // 0-100, computed from 8 segments
  lastLocation?: { lat: number; lng: number; timestamp: string };
  tileDismissals: Record<string, string>;
  lmnStatus: 'none' | 'interested' | 'enrolled' | 'active';
  referralCount: number;
  referralChain: string[];
  currentStreak: number;
  longestStreak: number;
}
```

**CardTile (Dynamic context tiles)**
```typescript
interface CardTile {
  label: string;
  value: string;
  sublabel?: string;
  color: 'sage' | 'copper' | 'gold' | 'blue' | 'red' | 'yellow' | 'gray';
  icon?: string;
  pulse?: boolean;          // Breathing animation for attention
}
```

**Sage Message Types**
```typescript
interface SageMessageResponse {
  text: string;
  ssml?: string;            // Voice output
  cards?: SageInlineCard[];  // Embedded UI cards
  actions?: SageAction[];    // Quick action buttons
  followups?: SageFollowup[]; // Suggested next messages
  domain: SageDomainName;   // Which of 12 domains handled this
  confidence: number;
}
```

**Tile Priority Algorithm**
```typescript
// 16+ tile types, scored 0-100, top 3 shown
// Factors: onboarding phase weight, time decay, profile gaps,
// care tier multiplier, intent match, pending actions, dismissal penalty
interface TilePriority {
  tileId: string;
  baseScore: number;        // Phase-specific base
  timeDecay: number;        // Hours since relevant action
  profileGapBonus: number;  // Boost for incomplete segments
  tierMultiplier: number;   // Seedling 1.0, Rooted 1.25, Canopy 1.5
  intentMatch: number;      // 1.5x if tile matches user intent
  pendingAction: number;    // High boost for actionable items
  dismissalPenalty: number; // Suppressed for 48hrs after dismiss
  finalScore: number;       // Computed priority
}
```

**Route Map**
```
/                  → Homepage (public, editorial scroll)
/join              → Join Flow (3-field card creation)
/join?ref=COOP-XXX → Join Flow with referrer pre-filled
/welcome           → Card Reveal (animated, post-signup)
/card              → Card + Sage dashboard (card required)
/my-card           → Alias for /card
/q/:memberId       → QR Landing (referral entry point)
```

---

## BUSINESS REQUIREMENTS

### Access & Authentication

**Public (no auth required):**
- Homepage (`/`)
- Join Flow (`/join`)
- QR Landing (`/q/:memberId`)

**Card Required (localStorage, no password):**
- Card Reveal (`/welcome`)
- Card + Sage Dashboard (`/card`)
- All Sage conversations
- All tile interactions
- Share actions
- Mini CII assessment

**Authenticated (JWT, future Phase 2):**
- Full CII assessment
- Time Bank task creation/acceptance
- Background check submission
- LMN enrollment/payment
- Care plan management
- Worker scheduling

**Role-Based Access (7 roles):**
- `conductor` — Care coordinator (Alpha Daughter), manages care recipient
- `worker_owner` — W-2 employed caregiver with cooperative equity
- `timebank_member` — Community neighbor exchanging time credits
- `medical_director` — Dr. Emdur, signs LMNs, reviews CRI assessments
- `admin` — System administration, analytics, quality metrics
- `employer_hr` — Employer partner managing employee benefit enrollment
- `wellness_provider` — Wellness service provider in directory

### Business Rules

**Care Tiers (12-month rolling window, quarterly evaluation):**
- Seedling (0-39 hrs): 1.0x multiplier, 12-month credit expiry, 5hr referral bonus
- Rooted (40-119 hrs): 1.25x multiplier, 18-month expiry, 7hr referral bonus, voting rights
- Canopy (120+ hrs): 1.5x multiplier, no expiry, 10hr referral bonus, full governance

**Time Bank:**
- Double-entry credit ledger: earned, spent, bought, donated, expired, deficit
- $15/hr cash purchase ($12 coordination + $3 Respite Fund)
- 40 hr/year membership floor (included in $100/year membership)
- -20 hr maximum deficit, behavioral nudges at -5/-10/-15/-20
- Respite Default: 0.9 hrs to member + 0.1 hrs to Respite Fund (opt-out must be genuinely easy)
- 12-month graduated expiry → auto-donate to Respite Fund
- Streak tracking: 4/8/12/26/52 week milestones
- Default 1 hour seeded at registration (all new members)

**Matching Algorithm:**
- Identity-matched: 2x preference (same caregiver for continuity)
- Proximity scoring: <0.5mi 3x, 0.5-1mi 2x, 1-2mi 1x, >2mi remote only
- GPS verification: check-in/check-out within 0.25 miles (Haversine formula)
- Background check required for in-person care tasks

**CII Assessment:**
- Full CII: 12 dimensions, scored 1-10 each, total max 120
- Zones: Green ≤40, Yellow 41-79, Red ≥80
- Mini CII: 3 dimensions (physical demands, sleep, isolation), max 30
- Mini zones: Green ≤11, Yellow 12-20, Red ≥21
- Assessment results are PHI — zone can be shared, score NEVER shared

**LMN Program:**
- $59/month: LMN + free background check + priority matching
- $89/month: Above + quarterly CRI assessment + care plan + clinical notes
- Dr. Josh Emdur signs all LMNs
- HSA/FSA savings: 28-36% of care expenses
- IRS Publication 502 categories for medical deduction qualification

**HIPAA Compliance:**
- No PHI in logs, error messages, client-side storage, or share content
- Share content: zone labels only ("managing well"), NEVER scores
- Assessment data stored in Aidbox FHIR R4, never in localStorage
- All FHIR access logged as AuditEvent
- Aggregate stats OK for sharing (hours given, streak length, tier name)

**Viral Mechanics:**
- Referral tracking via `?ref=COOP-XXXX` URL parameter
- Attribution window: 30 days
- Both parties earn tier-based referral bonus hours
- 8 share categories, all HIPAA-safe
- Target viral coefficient K > 1.0 (3 invites × 35% conversion = 1.05)

### Implementation Priorities

**Phase 1 — MVP (Build This First)**

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P0 | Homepage editorial scroll | First impression, conversion driver |
| P0 | 3-field join flow + card reveal | Core conversion funnel |
| P0 | Card + Sage dashboard with tiles | Primary product surface |
| P0 | Sage conversational onboarding (8 phases) | Progressive profiling without forms |
| P0 | Profile Memory Ring | Visual completeness incentive |
| P0 | Dynamic Tile Bank (16 tile types) | Context-aware engagement |
| P0 | QR code generation + referral tracking | Viral loop foundation |
| P1 | Mini CII Quick Check (30-second assessment) | Engagement + clinical value |
| P1 | Share mechanics (7 channels, 8 categories) | Viral growth engine |
| P1 | Apple/Google Wallet integration | Card permanence |
| P1 | PWA install prompt + offline card | Native feel |
| P1 | Nearby neighbors map | Community visibility |
| P2 | Background check flow (Checkr) | Trust verification |
| P2 | LMN enrollment + savings calculator | Revenue model |
| P2 | Streak tracking + tier progression | Retention mechanics |
| P2 | Full CII assessment | Clinical depth |

**Phase 2 — Growth (After 40 Families)**
- Time Bank task creation/acceptance with GPS verification
- Worker-Owner portal with scheduling
- Full Omaha System auto-coding
- CRI Assessment with MD review workflow
- Care plan builder
- Employer dashboard
- Admin analytics

**Phase 3 — Scale (After Revenue)**
- Health system FHIR integration (BCH Epic)
- Predictive hospitalization ML model
- PACE data exchange
- Federation multi-tenancy
- CMS ACCESS/ELEVATE compliance

### File Structure (New Files for Phase 1)

```
src/client/features/homepage/
  Homepage.tsx              — Full homepage with editorial scroll
  HeroSection.tsx           — Full-bleed hero with dual CTA
  StoryCarousel.tsx          — Horizontal story card scroller
  ComfortCardStrip.tsx       — 3 benefit cards section
  SagePreview.tsx            — Mini Sage preview (2 exchanges)
  SocialProof.tsx            — Neighbor count + testimonials
  FooterCTA.tsx              — Final conversion section

src/client/features/signup/
  JoinFlow.tsx               — 3-field card creation
  CardReveal.tsx             — Animated card reveal with confetti

src/client/features/sage/
  TileBank.tsx               — Dynamic tile grid (top 3 from 16+)
  TilePriority.ts            — Tile scoring algorithm
  ProfileRing.tsx            — QR code profile memory ring (8 segments)
  NearbyMap.tsx              — Proximity map overlay
  QRLanding.tsx              — Referral landing page
  LMNCalculator.tsx          — Inline savings calculator
  BgCheckFlow.tsx            — Background check Sage flow

src/client/hooks/
  useGeolocation.ts          — Geolocation permissions + tracking
  useProfileCompleteness.ts  — Profile % computation (8 segments)
  useTilePriority.ts         — Tile bank sorting hook
  useNearbyNeighbors.ts      — Proximity query hook
  useShareAction.ts          — Native share sheet hook
  useInstallPrompt.ts        — PWA install prompt (exists)

src/shared/constants/
  story-cards.ts             — Seeded story card content
  sage-onboarding-scripts.ts — Sage conversation prompts per phase
```

### Performance & Accessibility

- WCAG 2.1 AA compliance
- 44px minimum tap targets
- 4.5:1 color contrast minimum
- Full keyboard navigation
- Screen reader ARIA labels on all tiles, cards, dynamic content
- `prefers-reduced-motion` disables confetti, pulse, counters
- System font size preferences respected
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.0s
- Cumulative Layout Shift < 0.1
- Bundle size < 150KB gzipped
- Story card images lazy loaded, < 50KB each
- Tile bank client-rendered, no network dependency
