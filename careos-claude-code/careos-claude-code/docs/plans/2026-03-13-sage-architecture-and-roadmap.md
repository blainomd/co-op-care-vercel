# co-op.care — Complete Architecture, Features & Technology Roadmap

> **Date:** March 13, 2026
> **Author:** Sage (Claude) + Blaine Warkentine, MD
> **Status:** Living document — update as capabilities mature

---

## 1. What We Built (This Session)

### Features Delivered

| Feature | What It Does | User Benefit |
|---------|-------------|--------------|
| **Dynamic Tile Engine** | 3 tiles change after every Sage interaction based on conversation domain + onboarding phase | Always shows the most relevant next action — no hunting through menus |
| **Conversational Onboarding** | 8-phase flow: fresh → exploring → intent → roles → community → memory consent → onboarded → returning | New users never see a form — Sage learns who you are through natural conversation |
| **Suggested Next Question** | Input placeholder changes to the most likely next question after each response | Reduces cognitive load — tap Send instead of thinking about what to type |
| **State-Persisted Context** | Onboarding phase, community roles, memory consent stored in signupStore + localStorage | Survives page reloads — pick up where you left off |
| **Tile Swap Animation** | CSS keyframe animation when tiles change | Smooth, polished transitions — not jarring |
| **Content-Keyed Tiles** | React keys based on tile content, not index — triggers re-render animation on change | Tiles animate only when they actually change |
| **12 Domain Handlers** | Pattern-matching responses for: assessment, timebank, billing, referral, emotional support, scheduling, membership, tier, QR, streaks, governance, equity, coverage, LMN, respite fund, care logs, intake, worker intake, how-different | Every conversation topic has a thoughtful, Sage-voice response |
| **Comfort Card + QR** | Free card with unique member ID and QR code | Viral referral: scan QR → get your own card → share with someone you trust |
| **Memory Consent Model** | granted / session_only / pending — Sage asks, user chooses | Privacy-first: your data, your choice |

### Lessons Learned

1. **HMR cache invalidation**: Changing React hook dependency array sizes requires full server restart — HMR caches the old module
2. **useImperativeHandle stability**: Use a `contextRef` pattern (ref that tracks latest state, getter in imperative handle) to avoid dependency array changes
3. **Polling vs. events**: The 300ms setInterval polling from CardAndSage → SageChat ref is pragmatic for demo but should become event-driven (Zustand subscription or callback prop)
4. **Pattern matching has a ceiling**: Keyword-based `classify()` produces nonsensical responses when input doesn't match patterns. This is the #1 user experience problem to solve.
5. **Tiles must be state-aware, not click-reactive**: Tiles should reflect user facts (onboarding phase, community roles, assessment scores, Time Bank balance) — not just the last classified domain

---

## 2. What's Broken (Honest Assessment)

### Critical Issues

| Issue | Impact | Root Cause |
|-------|--------|------------|
| **Chat responses are keyword-matching** | Sage says wrong things when input doesn't match ~75 keywords | `classify()` falls through to `emotional_support` for unrecognized input |
| **Tiles reflect last click, not user state** | After tapping "Burnout Check", tiles show assessment-related options even if user hasn't taken assessment | `getDynamicTiles()` uses `lastDomain` from classify, not actual user profile |
| **No interactive elements in chat** | Users can only type text — no sliders, no forms, no assessments inline | Chat renders only `<p>` tags with bold parsing |
| **No learning/memory** | Each conversation starts from zero (beyond message persistence) | No user profile, no preference tracking, no embedding-based memory |
| **No agentic behavior** | Sage can't complete multi-step tasks | No tool-use, no function calling, no state machine for workflows |

### What These Issues Mean for Users

A caregiver opens co-op.care, taps "Burnout Check", gets a text description of what a check-in IS instead of actually doing one. Then the tiles change to show assessment results they don't have. The experience feels broken because **the interface promises interactivity but delivers monologue**.

---

## 3. The LMN Business Model

### The Opportunity

**Letters of Medical Necessity (LMN)** make companion care HSA/FSA eligible — saving families **28-36%** on out-of-pocket costs. Most families don't know this is possible.

### Value Proposition

| Tier | LMN Access | Cost | Value |
|------|-----------|------|-------|
| **Comfort Card (free)** | LMN info + education via Sage | $0 | Awareness — "did you know your care could be tax-advantaged?" |
| **Member ($100/yr)** | LMN from Dr. Emdur included | $100/yr | Full LMN service — saves $1,500-2,500/yr in HSA/FSA on typical $6,000-8,000 annual care spend |
| **Time Bank participant** | LMN + priority renewal reminders | Hours contributed | LMN as reward for community participation |

### Why This Is Strategic

1. **LMN is the gateway drug**: Free Comfort Card holders learn about HSA savings → convert to paid members
2. **Dr. Emdur scales via Sage**: Sage collects care documentation, Omaha-codes visits, pre-fills LMN — Dr. Emdur reviews and signs (10 min vs. 45 min manual)
3. **Recurring value**: LMNs expire annually → built-in retention mechanism with 60/30/7 day reminders
4. **Institutional leverage**: Health systems (BCH) can offer LMN as a discharge benefit — "your home care is now HSA-eligible"

### Revenue Model

- 40 families × $100/yr membership = $4,000/yr (Phase 1)
- LMN conversion drives 60%+ of membership conversions
- At scale (500 families): $50,000/yr membership + $15-25/hr companion care revenue

---

## 4. Institutional Affiliations Architecture

### The Hub Model

co-op.care sits at the center of a network of institutions, each of which either **refers families**, **funds care**, or **provides regulatory coverage**.

```
                        ┌──────────────┐
                        │   Medicare   │
                        │  (CMS ACCESS)│
                        └──────┬───────┘
                               │
         ┌─────────────┐       │       ┌──────────────┐
         │   Medicaid   │───────┼───────│  PACE (TRU)  │
         │  HCBS Waiver │       │       │  341 enrollees│
         └──────┬──────┘       │       └──────┬───────┘
                │              │              │
    ┌───────────┴──────────────┴──────────────┴───────────┐
    │                    co-op.care                         │
    │              (Colorado LCA)                           │
    │   Sage AI · Time Bank · Comfort Card · LMN           │
    └───────────┬──────────────┬──────────────┬───────────┘
                │              │              │
         ┌──────┴──────┐ ┌────┴─────┐ ┌──────┴──────┐
         │    BCH      │ │   BVSD   │ │   City of   │
         │  Hospital   │ │  Schools │ │   Boulder   │
         │  15.4% readm│ │  1,717   │ │  Silver     │
         └─────────────┘ │  teachers│ │  Tsunami    │
                         └──────────┘ │  planning   │
                                      └─────────────┘
```

### Partnership Value by Institution

| Institution | What They Get | What We Get | Status |
|------------|--------------|------------|--------|
| **BCH (Boulder Community Health)** | Reduced readmissions (15.4% → target 10%), discharge-to-home pathway, community health worker coverage | Referral pipeline, clinical credibility, Grant Besser relationship | Conversation pending |
| **BVSD (Boulder Valley School District)** | Caregiver support for 1,717 teachers, reduced absenteeism, EAP alternative | Employer pilot (5-10 teacher families), institutional contract, school nurse referrals | Phase 2 |
| **TRU PACE** | Expanded companion care network for 341 enrollees, Time Bank integration | Medicaid-eligible family referrals, care coordination data | Phase 2-3 |
| **City of Boulder** | Silver tsunami preparedness, aging-in-place infrastructure, community resilience | Municipal partnership, public health alignment, possible grant funding | Phase 2 |
| **CMS ACCESS** | Demonstration site for community-based care model | Medicare reimbursement pathway, federal recognition | Jan 2027 (Cohort 2) |
| **Medicaid (HCBS Waiver)** | Companion care delivery for waiver-eligible families | Medicaid-funded care hours, expanded reach to low-income families | Phase 2 |

### Universal Basic Care

The long-term vision: **co-op.care as municipal care infrastructure**. Like water and electricity, every community needs a care network. The cooperative model makes this possible because:

1. **No extraction**: Surplus returns to members, not investors
2. **Local ownership**: Each community's co-op is owned by its workers and families
3. **Scalable via replication**: The model (LCA + Sage + Time Bank + Comfort Card) replicates to any geography
4. **Institutional funding**: Health systems, schools, municipalities, and employers can all fund access without building infrastructure

---

## 5. Global Architecture — Predictable, Repeatable

### The Replication Blueprint

Every aging human (and their family) needs the same things:
1. **Someone to talk to** (Sage — AI companion, 24/7)
2. **Someone to show up** (Care Navigator — worker-owner, same person every time)
3. **A way to pay** (Comfort Card — HSA/FSA eligible, LMN-backed)
4. **A community** (Time Bank — neighbors helping neighbors)
5. **Proof it's working** (CII/KBS assessments — clinical outcomes documentation)

### How It Scales

```
Boulder (co-op.care LCA #1)
  ├── Sage instance (shared AI, local knowledge)
  ├── 5-15 Care Navigators (W-2, worker-owners)
  ├── 40-200 families
  ├── Time Bank (local, GPS-verified)
  └── Comfort Card (local QR network)

Denver (co-op.care LCA #2)
  ├── Same Sage (shared), different local knowledge
  ├── Different Care Navigators (local hiring)
  ├── Different families
  ├── Separate Time Bank (inter-op with Boulder via federation)
  └── Separate Comfort Card network (cross-referral enabled)

[Any city] (co-op.care LCA #N)
  └── Same pattern, local ownership, federated data
```

### Federation Model

- **Shared**: Sage AI, Omaha System coding, LMN infrastructure, Comfort Card platform
- **Local**: Care Navigators, families, Time Bank balances, governance decisions
- **Federated**: Cross-community referrals, aggregate outcomes data, cooperative purchasing power

---

## 6. Technology Investment Roadmap

### Tier 1: Build Now ($0-500/mo) — Months 1-3

| Technology | Purpose | Cost | Impact |
|-----------|---------|------|--------|
| **Gemini Flash 2.0 API** | Replace keyword matching with real NLU | ~$50/mo at 10K conversations | Chat actually understands what people say |
| **React inline components** | Sliders, forms, role-chips render inside chat | $0 (code) | Interactive assessments, not just text descriptions |
| **Zustand user profile store** | Track user facts (roles, scores, preferences) | $0 (code) | Tiles reflect real state, not last click |
| **localStorage learning** | Remember assessment scores, preferences, conversation themes | $0 (code) | Sage gets smarter with each interaction |

### Tier 2: Build Next ($500-2,000/mo) — Months 3-6

| Technology | Purpose | Cost | Impact |
|-----------|---------|------|--------|
| **Vertex AI Embeddings** | Embed care knowledge base for RAG | ~$200/mo | Sage answers any care question, not just 75 patterns |
| **Pinecone or Weaviate** | Vector database for knowledge retrieval | ~$70-200/mo | Sub-200ms retrieval for care knowledge |
| **PostgreSQL** | Operational database (user profiles, Time Bank ledger) | ~$50/mo (Railway) | Persistent user state across devices |
| **Web Speech API + Deepgram** | Voice input/output for Sage | ~$100-300/mo | "Talk to Sage" — hands-free for caregivers |

### Tier 3: Scale ($2,000-10,000/mo) — Months 6-12

| Technology | Purpose | Cost | Impact |
|-----------|---------|------|--------|
| **Aidbox FHIR R4** | Clinical data store (assessments, care plans, LMNs) | ~$1,900/mo | HIPAA-compliant clinical records |
| **Railway HIPAA BAA** | HIPAA-compliant hosting | ~$1,000/mo | Handle PHI in production |
| **Claude/Gemini Pro** | Complex reasoning for care planning, multi-step workflows | ~$500-1,000/mo | Agentic Sage — books visits, generates LMNs, coordinates care |
| **Twilio + SendGrid** | SMS/email notifications | ~$200/mo | Appointment reminders, LMN renewals, streak nudges |
| **Stripe** | Payment processing for memberships + Comfort Card | ~$50/mo + 2.9% | Automated billing, HSA-compatible |

### Tier 4: Enterprise ($10,000+/mo) — Year 2+

| Technology | Purpose | Cost | Impact |
|-----------|---------|------|--------|
| **Epic HL7 FHIR integration** | BCH EHR interop | Custom | Hospital discharge → co-op.care referral in one click |
| **Predictive ML** | Hospitalization risk scoring from CII/wearable data | Custom | Prevent readmissions before they happen |
| **Multi-tenant federation** | co-op.care instances across cities | Custom | National cooperative care network |

---

## 7. Interactive Chat Architecture (What to Build Next)

### The Problem

Currently, Sage messages are rendered as text `<p>` tags with bold parsing. When a user taps "Burnout Check", they get a paragraph ABOUT the check-in instead of THE check-in.

### The Solution: Message Components

```typescript
// New message type that can contain interactive elements
interface Message {
  id: string;
  role: 'user' | 'sage';
  content: string;
  timestamp: Date;
  followups?: Array<{ label: string; message: string }>;
  // NEW — interactive components rendered inline
  component?: {
    type: 'mini_cii' | 'role_picker' | 'consent_picker' | 'care_log' | 'quick_poll';
    props: Record<string, unknown>;
    onComplete?: string; // message to send when component completes
  };
}
```

### Interactive Components to Build

| Component | Renders As | When Triggered | On Complete |
|-----------|-----------|---------------|-------------|
| **MiniCII** | 3 sliders (physical, sleep, isolation) + submit | "Let's do a burnout check-in" | Sends score to Sage, updates tiles to show results |
| **RolePicker** | 3 tappable chips (companion, meals, tech) | Onboarding profile_roles phase | Saves to signupStore.communityRoles |
| **ConsentPicker** | 3 options (remember, session-only, tell me more) | Onboarding memory_consent phase | Saves to signupStore.memoryConsent |
| **CareLog** | Quick form (what, when, how was recipient) | "Log a visit" | Saves to localStorage, Omaha-codes |
| **QuickPoll** | Yes/No/Maybe buttons | Any binary question from Sage | Sends answer as message |

### Rendering Architecture

```tsx
// Inside SageChat message rendering:
{msg.component && (
  <div className="mt-2">
    {msg.component.type === 'mini_cii' && (
      <MiniCIIInline onComplete={(score) => {
        // Save score to user profile
        // Send result to Sage
        sendMessage(`My check-in score is ${score}/30`);
      }} />
    )}
    {msg.component.type === 'role_picker' && (
      <RolePickerInline onComplete={(roles) => {
        setCommunityRoles(roles);
        sendMessage(`I'm interested in ${roles.join(' and ')}`);
      }} />
    )}
  </div>
)}
```

---

## 8. Learning System Architecture

### What "Learning" Means

Every interaction teaches Sage something about this user:
1. **Assessment scores** → wellness trajectory over time
2. **Questions asked** → care concerns and priorities
3. **Roles selected** → community participation preferences
4. **Time spent on topics** → engagement patterns
5. **Referrals made** → social network growth

### User Profile (localStorage now, PostgreSQL later)

```typescript
interface UserProfile {
  // Identity
  memberId: string;
  firstName: string;

  // Onboarding
  onboardingPhase: OnboardingPhase;
  communityRoles: string[];
  intent: 'seeking_care' | 'giving_care' | 'both';

  // Assessments
  lastMiniCII?: { score: number; date: string; zone: 'green' | 'yellow' | 'red' };
  ciiHistory: Array<{ score: number; date: string }>;

  // Engagement
  conversationCount: number;
  topDomains: Array<{ domain: Domain; count: number }>;
  lastVisit: string;
  streakWeeks: number;

  // Network
  referralCount: number;
  networkSize: number;

  // Preferences (learned)
  preferredTone: 'warm' | 'direct' | 'clinical';
  topConcerns: string[];
}
```

### How Tiles Use Profile

```typescript
function getStatefulTiles(profile: UserProfile): TileWithAction[] {
  // If last CII was Red zone → always show "Talk to someone" tile
  if (profile.lastMiniCII?.zone === 'red') {
    return [
      tile('Talk to', 'Someone', 'You scored high — we\'re here', 'red', '...'),
      tile('Respite', 'Fund', 'Free hours available', 'sage', '...'),
      tile('Schedule', 'Care', 'Same-day matching', 'blue', '...'),
    ];
  }

  // If streak is about to hit milestone → show encouragement
  if (profile.streakWeeks === 7 || profile.streakWeeks === 11) {
    return [
      tile('Almost', `${profile.streakWeeks + 1} weeks!`, 'Keep going', 'gold', '...'),
      // ...
    ];
  }

  // If no assessment in 30 days → nudge
  if (daysSince(profile.lastMiniCII?.date) > 30) {
    return [
      tile('Quick', 'Check-in', 'It\'s been a while', 'yellow', '...'),
      // ...
    ];
  }

  // Default: domain-reactive (current behavior)
  return getDynamicTiles(profile.onboardingPhase, lastDomain);
}
```

---

## 9. Community & Friendship Focus

### Reframing the Experience

The app is not a "care management platform." It's **the place where your caring community lives**.

| Current Framing | Community Framing |
|----------------|-------------------|
| "Time Bank balance: 44 hrs" | "You've helped 3 neighbors this month" |
| "Tier: Seedling" | "Growing your roots — 28 more hours to Rooted" |
| "QR code" | "Your connection to caring" |
| "Assessment: CII 52/120" | "Check-in: How are you really doing?" |
| "Referral bonus: 5 hrs" | "Sarah joined because of you — your network grew" |

### The Hub Vision

```
You open co-op.care. Your card shows:
  - Your name and QR (identity)
  - "3 neighbors in your network" (community)
  - "Maria visits Thursday 2pm" (care)

Below, Sage says:
  "Good morning. Sarah (who you invited last week)
   just helped the Martinez family with groceries.
   Your network is growing. How are YOU doing today?"

Tiles show:
  [Quick check-in] [Invite a neighbor] [Your impact this month]
```

### Making It About Friendship

1. **Network visualization**: Show concentric circles of care — you at center, immediate network, extended community
2. **Impact stories**: "Your 1 hour of companionship let Mrs. Chen's daughter sleep through the night for the first time in weeks"
3. **Milestone celebrations**: "You've been helping for 12 straight weeks. That's rare and remarkable."
4. **Mutual aid framing**: Not "service delivery" — "neighbors caring for each other"

---

## 10. What We Can Build Now vs. What Needs Investment

### Buildable Today (No New Technology)

- [x] Dynamic tiles (done)
- [x] Conversational onboarding (done)
- [x] Suggested question (done)
- [ ] **Interactive MiniCII component** (React, inline in chat)
- [ ] **Role picker component** (React, inline in chat)
- [ ] **State-aware tiles** (use signupStore profile, not just lastDomain)
- [ ] **User profile accumulation** (localStorage, update after each interaction)
- [ ] **Community-focused copy** (rewrite Sage responses for friendship/network framing)

### Needs Technology Investment

| Capability | Blocker | Investment | Timeline |
|-----------|---------|------------|----------|
| **Real NLU** | Pattern matching can't understand paraphrasing | Gemini Flash API ($50/mo) | Month 1-2 |
| **Knowledge base** | Sage only knows what's hardcoded in `getResponse()` | Embeddings + vector DB ($200-300/mo) | Month 3-4 |
| **Voice** | Text-only excludes users who can't type easily | Web Speech API + Deepgram ($100-300/mo) | Month 2-3 |
| **Persistence across devices** | localStorage only works on one device | PostgreSQL ($50/mo) | Month 3 |
| **Agentic workflows** | Sage can't book visits, generate LMNs, or coordinate care | LLM with function calling ($500-1,000/mo) | Month 6+ |
| **Clinical compliance** | No PHI handling in current stack | Aidbox + Railway HIPAA BAA ($3,000/mo) | Month 6+ |

---

## 11. Immediate Next Steps (This Build Session)

1. **Fix tile engine** — tiles should use user profile state (onboarding phase, roles, assessment scores), not just `lastDomain`
2. **Build MiniCII inline component** — 3 sliders that render inside a Sage message
3. **Build RolePicker inline component** — tappable chips for onboarding
4. **Wire components into chat rendering** — new `component` field on Message type
5. **Update Sage responses** — community/friendship focus, not clinical/transactional
6. **Verify build** — tsc + vite build clean
