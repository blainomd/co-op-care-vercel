# co-op.care — Homepage, Card & Onboarding Redesign

**Date:** 2026-03-13
**Status:** Design Document (Pending Approval)
**Author:** Claude + Blaine Warkentine
**Design Inspiration:** General Medicine (generalmedicine.co) — editorial, photography-forward, clean

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [The Three Screens](#2-the-three-screens)
3. [Screen 1: Homepage — The Story](#3-screen-1-homepage)
4. [Screen 2: Join Flow — The 30-Second Card](#4-screen-2-join-flow)
5. [Screen 3: Card + Sage — The Living Dashboard](#5-screen-3-card--sage)
6. [Viral Mechanics — Every Pixel Recruits](#6-viral-mechanics)
7. [Background Check — Trust as Currency](#7-background-check)
8. [LMN Program — Tax Savings Enrollment](#8-lmn-program)
9. [Dynamic Tile Bank — Next Best Action Engine](#9-dynamic-tile-bank)
10. [Proximity & Nearby — See Your Neighborhood](#10-proximity--nearby)
11. [Sage Onboarding Conversation Flow](#11-sage-onboarding-conversation-flow)
12. [QR Referral Landing — The Viral Loop Closer](#12-qr-referral-landing)
13. [Visual System & Component Library](#13-visual-system)
14. [Persona-Specific Flows](#14-persona-specific-flows)
15. [State Machine & Data Model](#15-state-machine)
16. [Metrics & Success Criteria](#16-metrics)
17. [Routes & Navigation](#17-routes)
18. [Accessibility & Performance](#18-accessibility--performance)

---

## 1. Design Philosophy

### The General Medicine Adaptation

General Medicine sells a feeling: *medicine that sees you as a person, not a chart number.* Their design achieves this through:

- **Full-bleed photography** that puts human faces before UI chrome
- **Horizontal card scrolls** that invite exploration without overwhelming
- **Personalized greetings** ("Hi Blaine") that make digital feel intimate
- **Dual CTAs** that respect where you are in your journey
- **AI as companion** ("Try General AI") positioned as helpful, not clinical

We adapt each pattern:

| GM Pattern | co-op.care Adaptation |
|---|---|
| Full-bleed clinician photos | Full-bleed Boulder caregiver + family photos |
| "Book a visit / Text us" | **"Get Your Free Card / Talk to Sage"** |
| Horizontally scrollable service cards | Horizontally scrollable **neighbor story cards** |
| "Hi Blaine" account header | **"Hi [Name]"** + QR code + dynamic tiles |
| "Try General AI" | **"Ask Sage anything"** — always visible, always warm |
| Specialist avatars | **Neighbor avatars** with proximity badges |
| Pricing transparency | **Time Bank balance** transparency |

### Three Unbreakable Rules

1. **Every screen must contain a path to invite a neighbor.** No dead ends. The share button, the QR code, or a "Know someone who'd love this?" prompt is always within thumb's reach.

2. **Value before registration.** Show the story, show Sage, show the card — before asking for a single field. The visitor should *want* to join before we ask them to.

3. **Sage drives, chrome follows.** The conversational AI is the primary navigation. Tiles, cards, and buttons are *shortcuts* to things Sage can do. If you can say it to Sage, there's a tile for it. If there's a tile for it, tapping it talks to Sage.

---

## 2. The Three Screens

The entire co-op.care experience lives on three screens. That's it.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   SCREEN 1: HOMEPAGE                                │
│   "You're not alone in this."                       │
│   ─ Hero photo + dual CTA                           │
│   ─ Story carousel (real Boulder families)           │
│   ─ Comfort Card strip (3 benefits)                  │
│   ─ Sage preview conversation                        │
│   ─ Social proof + neighbor count                    │
│   ─ Footer CTA                                       │
│                                                     │
│   Routes: /, /q/:memberId                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   SCREEN 2: JOIN FLOW                               │
│   30-second card issuance                            │
│   ─ Name + contact + intent (3 fields max)           │
│   ─ Card reveal animation                            │
│   ─ Wallet/PWA prompt                                │
│                                                     │
│   Routes: /join, /welcome                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   SCREEN 3: CARD + SAGE                             │
│   The living dashboard                               │
│   ─ "Hi [Name]" + avatar + tier                      │
│   ─ QR code with profile memory ring                 │
│   ─ Dynamic tile bank (next best actions)            │
│   ─ Sage chat (full conversation)                    │
│   ─ Inline cards (assessment, schedule, etc.)        │
│                                                     │
│   Routes: /card, /my-card                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Screen 1: Homepage

The homepage is a **scroll-down story**, not a feature list. Every section builds emotional momentum toward a single action: **Get Your Free Card.**

### Section A: Hero — "You're Not Alone"

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   [Full-bleed photo: Older woman and younger         │
│    neighbor laughing on a Boulder porch,             │
│    Flatirons visible in golden hour light]           │
│                                                     │
│                                                     │
│        You're not alone in this.                     │
│                                                     │
│   The first neighborhood care cooperative            │
│   in Boulder County. Your neighbors are              │
│   already here.                                      │
│                                                     │
│   ┌──────────────────┐  ┌─────────────────┐         │
│   │  Get Your Card   │  │  Talk to Sage   │         │
│   │  (Free, 30 sec)  │  │                 │         │
│   └──────────────────┘  └─────────────────┘         │
│                                                     │
│   [47 neighbors in Boulder County]                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Details:**
- Photo: Full-viewport height on mobile, 80vh on desktop
- Text: White Literata italic over dark photo overlay (40% black gradient from bottom)
- Neighbor count: Live counter from localStorage referral chain, animated on load
- "Get Your Card" button: Teal (#2BA5A0), pill shape, 48px height, prominent
- "Talk to Sage" button: White outline, pill shape, opens Sage preview overlay
- Scroll indicator: Subtle down-chevron animation at bottom

**Persona-specific hero rotation:**
If `?ref=` param detected → show referral-aware hero:
> "Your neighbor [Name] thinks you'd be perfect for this."

If returning visitor (localStorage check) → show returning hero:
> "Welcome back. Your neighborhood grew while you were away."

### Section B: Story Carousel — Real Neighbors

Horizontally scrollable cards. Each card is a real story from a Boulder caregiver or care recipient. GM-style: photo-forward, minimal text, swipeable.

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Stories from your neighborhood                                    │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ [Photo]  │  │ [Photo]  │  │ [Photo]  │  │ [Photo]  │  ───▶    │
│  │          │  │          │  │          │  │          │          │
│  │ "Mom was │  │ "I moved │  │ "After   │  │ "The     │          │
│  │  falling │  │  here    │  │  Dad's   │  │  streak  │          │
│  │  through │  │  alone.  │  │  stroke, │  │  keeps   │          │
│  │  the     │  │  Now I   │  │  I didn't│  │  me      │          │
│  │  cracks."│  │  have 12 │  │  know    │  │  going." │          │
│  │          │  │  people."│  │  who to  │  │          │          │
│  │ — Sarah, │  │          │  │  call."  │  │ — Tom,   │          │
│  │ Conductor│  │ — Elena, │  │          │  │ Neighbor │          │
│  │          │  │ Neighbor │  │ — David, │  │ 12-week  │          │
│  │ 📍 0.3mi│  │          │  │ Conductor│  │ streak   │          │
│  └──────────┘  │ 📍 0.8mi│  │          │  │          │          │
│                └──────────┘  │ 📍 1.2mi│  │ 📍 0.5mi│          │
│                              └──────────┘  └──────────┘          │
│                                                                    │
│  ← swipe for more stories →                                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Card width: 280px, height: 400px, 12px border radius
- Photo: Top 60% of card, object-fit cover
- Text: DM Sans 15px, Literata italic for quotes
- Proximity badge: Teal pill in bottom-left of each card showing distance
- Role badge: Subtle "Conductor" or "Neighbor" label
- Snap scroll: CSS scroll-snap-type for satisfying swipe
- Minimum 4 story cards; in demo mode these are seeded, in production from CMS
- Each card has a subtle "Their story →" link that opens a longer version
- **Viral hook:** After scrolling 3+ cards, a CTA card appears: "You could be the next story. Get your card."

**Story Card Categories (rotate based on time of day):**
- Morning: Caregiving stories ("Another day starts with coffee and care plans")
- Afternoon: Neighbor stories ("She just needed someone to drive her to the store")
- Evening: Gratitude stories ("Today someone told me I made their week")

### Section C: The Comfort Card Strip — 3 Benefits

Three horizontal cards explaining what you get. Inspired by GM's service cards.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Your Comfort Card gives you:                        │
│                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐         │
│  │    🏠     │ │    💬     │ │    🌿     │         │
│  │           │ │           │ │           │         │
│  │  Your QR  │ │  Sage AI  │ │  Care     │         │
│  │  identity │ │  companion│ │  credits  │         │
│  │           │ │           │ │           │         │
│  │  One scan │ │  Ask      │ │  1 free   │         │
│  │  connects │ │  anything │ │  hour to  │         │
│  │  you to   │ │  about    │ │  start    │         │
│  │  your     │ │  care,    │ │  your     │         │
│  │  whole    │ │  anytime. │ │  Time     │         │
│  │  care     │ │           │ │  Bank.    │         │
│  │  network. │ │           │ │           │         │
│  └───────────┘ └───────────┘ └───────────┘         │
│                                                     │
│  All free. No credit card. 30 seconds.               │
│                                                     │
│       ┌──────────────────────────┐                   │
│       │    Get Your Free Card    │                   │
│       └──────────────────────────┘                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Details:**
- Cards: White background, teal top border (3px), subtle shadow
- Icons: Large (48px), teal colored
- Text: DM Sans, 15px body
- The "1 free hour" card mentions the Default Care Credit (1 seed hour from `business-rules.ts`)
- Bottom CTA repeats the primary action

### Section D: Sage Preview — "Try Asking"

A mini-Sage experience right on the homepage. Not behind any gate. Inspired by GM's "Try General AI."

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Teal gradient background, subtle pattern]          │
│                                                     │
│  Meet Sage, your care companion.                     │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │                                         │        │
│  │  🌿 Hi! I'm Sage. Ask me anything      │        │
│  │     about caring for someone you love.  │        │
│  │                                         │        │
│  │  Try asking:                            │        │
│  │                                         │        │
│  │  ┌─────────────────────────────┐        │        │
│  │  │ "My mom keeps falling"      │        │        │
│  │  └─────────────────────────────┘        │        │
│  │  ┌─────────────────────────────┐        │        │
│  │  │ "I want to help neighbors"  │        │        │
│  │  └─────────────────────────────┘        │        │
│  │  ┌─────────────────────────────┐        │        │
│  │  │ "What does a Comfort Card do?"│       │        │
│  │  └─────────────────────────────┘        │        │
│  │                                         │        │
│  │  ┌─────────────────────────────────┐    │        │
│  │  │ Type your question...        🎤 │    │        │
│  │  └─────────────────────────────────┘    │        │
│  │                                         │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  Sage knows Boulder. Sage knows care. Sage knows you.│
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Details:**
- Background: Teal-to-white gradient
- Chat container: White card with rounded corners, shadow
- Suggestion pills: Tappable, DM Sans, teal outline
- Tapping a suggestion starts a REAL Sage conversation in an overlay
- After 2 exchanges, Sage naturally says: "Want me to remember this? Get your card — it takes 30 seconds."
- The preview Sage session persists: if they get a card, their conversation history transfers
- Input field: Full width, 48px height, microphone icon for voice-first hint

### Section E: Social Proof — The Growing Network

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Grid of circular avatar photos, 8-12 neighbors]    │
│                                                     │
│  47 neighbors and counting.                          │
│  24 care hours exchanged this week.                  │
│  3 families found help this month.                   │
│                                                     │
│  ┌───────────────────────────────────┐               │
│  │  "I signed up because my neighbor │               │
│  │   shared her card with me."       │               │
│  │   — Maria, Mapleton Hill          │               │
│  └───────────────────────────────────┘               │
│                                                     │
│  Know someone who needs this?                        │
│                                                     │
│  ┌───────────────────┐  ┌──────────────────┐        │
│  │  Share co-op.care  │  │ Get Your Card   │        │
│  └───────────────────┘  └──────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Details:**
- Avatar grid: Circular 48px photos, slightly overlapping (like Slack presence)
- Stats: Animated counters on scroll-into-view
- Testimonial: Literata italic, subtle background
- **Dual CTA:** Both "Share" (for visitors who want to spread without joining) AND "Get Your Card" (for ready visitors)
- Share button opens native share sheet with pre-filled message

### Section F: Footer CTA — Last Chance

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Full-bleed photo: Hands clasped, diverse ages]     │
│                                                     │
│  Care shouldn't be this hard.                        │
│  It doesn't have to be.                              │
│                                                     │
│       ┌──────────────────────────┐                   │
│       │    Get Your Free Card    │                   │
│       └──────────────────────────┘                   │
│                                                     │
│  co-op.care · Boulder, CO · Worker-owned             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 4. Screen 2: Join Flow

### The 30-Second Card

Three fields. One screen. A card that feels like it was made for you.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ← back                                             │
│                                                     │
│  Let's make your card.                               │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │  First name                              │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │  Phone or email                          │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  I'm here to...                                      │
│                                                     │
│  ┌─────────────────────┐ ┌─────────────────────┐    │
│  │   🏠 Find care     │ │   🤝 Give care      │    │
│  │   for my family     │ │   to neighbors      │    │
│  └─────────────────────┘ └─────────────────────┘    │
│                                                     │
│       ┌──────────────────────────┐                   │
│       │     Create My Card       │                   │
│       └──────────────────────────┘                   │
│                                                     │
│  Free forever. No credit card needed.                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Details:**
- Auto-focus first field on mount
- Intent chips: Large, tappable, teal border when selected
- If `?ref=COOP-2026-XXXX` in URL: show "Invited by [Name]" banner at top, `referredBy` auto-filled
- Submit: Creates card in `signupStore`, generates `COOP-YYYY-XXXX` member ID
- Validation: Name required. Phone OR email required (not both). Intent required.

### Card Reveal Animation

After submit, the card animates into existence:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   ✨                                 │
│                                                     │
│   ┌─────────────────────────────────────────┐       │
│   │                                         │       │
│   │   co-op.care                            │       │
│   │   ─────────────────────────             │       │
│   │                                         │       │
│   │   SARAH MARTINEZ                        │       │
│   │   COOP-2026-4821                        │       │
│   │   🌱 Seedling · 1 hr balance            │       │
│   │                                         │       │
│   │         ┌─────────┐                     │       │
│   │         │  [QR]   │                     │       │
│   │         │  code   │                     │       │
│   │         └─────────┘                     │       │
│   │                                         │       │
│   │   Member since March 2026               │       │
│   │                                         │       │
│   └─────────────────────────────────────────┘       │
│                                                     │
│   Your card is ready!                                │
│                                                     │
│   ┌──────────────────┐  ┌──────────────────┐        │
│   │  Add to Wallet   │  │  Share My Card   │        │
│   └──────────────────┘  └──────────────────┘        │
│                                                     │
│   ┌──────────────────────────────────────┐           │
│   │        Talk to Sage →                │           │
│   └──────────────────────────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Animation Sequence:**
1. Card slides up from bottom with spring physics (200ms)
2. Name and member ID type in letter-by-letter (400ms)
3. QR code renders with a subtle shimmer
4. Tier badge fades in
5. Confetti burst (tasteful, 3 seconds, teal + gold particles)

**Post-Reveal Actions:**
- **Add to Wallet:** Apple Wallet / Google Pay pass generation
- **Share My Card:** Opens share sheet with "I just joined co-op.care! Get your free card: [QR URL]"
- **Talk to Sage:** Primary CTA → navigates to Card + Sage screen

**Viral Hook at Card Reveal:**
Immediately after the card appears, before the user navigates away:
> "🎉 Your first hour of care is on us. Invite a neighbor and you'll both earn 5 more."

This leverages the Default Care Credit (1 seed hour) + Seedling referral bonus (5 hours both parties) from `business-rules.ts`.

---

## 5. Screen 3: Card + Sage — The Living Dashboard

This is where people spend their time. It's the "account page" equivalent of GM's "Hi Blaine" screen, but far richer.

### Layout (Mobile-First)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │  co-op.care           [⚙️] [🔔]        │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │                                         │        │
│  │      👤                                 │        │
│  │   Hi Sarah!                             │        │
│  │   🌱 Seedling · 1.0 hrs                │        │
│  │   COOP-2026-4821                        │        │
│  │                                         │        │
│  │   ╭─────────────╮                       │        │
│  │   │             │                       │        │
│  │   │   [QR CODE] │ ← Profile memory ring │        │
│  │   │             │                       │        │
│  │   ╰─────────────╯                       │        │
│  │                                         │        │
│  │   ┌─────┐ ┌─────┐ ┌─────┐              │        │
│  │   │Tile1│ │Tile2│ │Tile3│ ← Dynamic    │        │
│  │   └─────┘ └─────┘ └─────┘              │        │
│  │                                         │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │                                         │        │
│  │  TILE BANK (scrollable, 2 rows)          │        │
│  │                                         │        │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │        │
│  │  │Learn │ │Check │ │Share │ │See   │   │        │
│  │  │More  │ │In    │ │Card  │ │Nearby│   │        │
│  │  └──────┘ └──────┘ └──────┘ └──────┘   │        │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │        │
│  │  │Get   │ │Join  │ │Start │ │Your  │   │        │
│  │  │Bg    │ │LMN   │ │Mini  │ │Impact│   │        │
│  │  │Check │ │      │ │CII   │ │      │   │        │
│  │  └──────┘ └──────┘ └──────┘ └──────┘   │        │
│  │                                         │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │                                         │        │
│  │  SAGE CHAT                               │        │
│  │                                         │        │
│  │  🌿 Welcome back, Sarah! I see you     │        │
│  │     completed your profile yesterday.   │        │
│  │     Ready to take the quick check-in?   │        │
│  │                                         │        │
│  │  ┌──────────────┐ ┌───────────────┐     │        │
│  │  │ Yes, let's!  │ │ Not right now │     │        │
│  │  └──────────────┘ └───────────────┘     │        │
│  │                                         │        │
│  │  ┌───────────────────────────────┐      │        │
│  │  │ Type or speak...          🎤  │      │        │
│  │  └───────────────────────────────┘      │        │
│  │                                         │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### The QR Code Profile Memory Ring

The QR code is surrounded by a **profile memory ring** — a visual indicator of how well the system knows this person. Each segment represents a piece of profile data:

```
        ╭──── Name ✓ ────╮
       ╱                   ╲
   Intent ✓                 Contact ✓
      │        ┌─────┐        │
  Roles ?      │ QR  │    Mini CII ?
      │        │CODE │        │
   Bg Check ?  └─────┘     LMN ?
       ╲                   ╱
        ╰── Consent ? ────╯
```

**Ring Segments (8 total):**
1. **Name** — ✓ always filled (required at signup)
2. **Contact** — ✓ always filled (required at signup)
3. **Intent** — ✓ always filled (required at signup)
4. **Roles** — filled when `communityRoles.length > 0`
5. **Mini CII** — filled when assessment completed
6. **Memory Consent** — filled when `memoryConsent !== 'pending'`
7. **Background Check** — filled when `bgCheck.status !== 'not_started'`
8. **LMN Enrollment** — filled when LMN subscription active

**Visual:**
- Filled segments: Solid teal arc
- Empty segments: Dashed gray arc
- Segments pulse gently when a new one completes
- Tapping the ring opens a "Complete Your Profile" modal showing what's missing
- At 100% completion: ring turns gold, celebration animation

**Why this matters:** The ring gives users a *reason* to complete their profile without nagging. It's visible every time they look at their QR code. It becomes a personal progress tracker that also improves their matching quality.

### The Three Summary Tiles (On-Card)

Below the QR code, three tiles show at-a-glance status. These change based on role and context (using the `CardTile` type from `card.types.ts`):

**For a fresh "seeking_care" user:**
| Tile | Label | Value | Color |
|------|-------|-------|-------|
| 1 | Balance | 1.0 hrs | sage |
| 2 | Nearby | 12 neighbors | blue |
| 3 | Profile | 38% complete | copper |

**For an active "giving_care" user with streak:**
| Tile | Label | Value | Color |
|------|-------|-------|-------|
| 1 | Balance | 23.5 hrs | sage |
| 2 | Streak | 8 weeks 🔥 | gold |
| 3 | Impact | 4 families helped | copper |

**For a user with pending background check:**
| Tile | Label | Value | Color |
|------|-------|-------|-------|
| 1 | Balance | 6.0 hrs | sage |
| 2 | Bg Check | Pending ⏳ | yellow |
| 3 | Nearby | 8 neighbors | blue |

Tiles with `pulse: true` get a subtle breathing animation to draw attention.

---

## 6. Viral Mechanics — Every Pixel Recruits

### The Viral Funnel

```
[See QR / Link] → [Land on Homepage] → [Get Card (30 sec)] → [Share Own Card]
      ↑                                                             │
      └─────────────────────────────────────────────────────────────┘
```

Every card holder becomes a recruitment node. The system is designed so that sharing feels **natural and rewarding**, never spammy.

### Share Triggers (When and Where)

| Trigger Point | What Appears | Why It Works |
|---|---|---|
| Card reveal (first time) | "Invite a neighbor, both earn 5 hours" | Excitement + immediate incentive |
| After first Sage conversation | "Know someone who'd love Sage?" | They just experienced value |
| Mini CII completion | "Caregiving is easier together" (HIPAA-safe, zone only) | Emotional moment |
| Background check cleared | "✅ Verified neighbor — share your profile" | Pride + trust signal |
| Weekly streak milestone | "X weeks of care! Share your streak" | Achievement sharing |
| When balance > 10 hours | "You've banked time — invite someone who needs it" | Generosity trigger |
| Tile bank "Spread the Word" | Always visible, one tap | Always available |
| QR code screen | "Show your card to a neighbor" | Physical proximity |

### Share Content Templates (HIPAA-Safe)

Per `community-catalyst` skill — NEVER share CII scores, medical conditions, or care recipient names.

**Comfort Card Share:**
> "I joined co-op.care — a neighborhood care cooperative in Boulder. Get your free Comfort Card and join our community. [QR URL]"

**Referral Share (with bonus):**
> "I'm part of co-op.care and I think you'd be amazing here. Use my link and we both earn 5 hours of care credit. [QR URL with ?ref=]"

**Streak Share:**
> "8 weeks of caring for my neighbors through co-op.care. It's real, it's local, it's worker-owned. [QR URL]"

**Background Check Share:**
> "Just got verified as a trusted neighbor on co-op.care. Background checked, ready to help. [QR URL]"

### Referral Bonus Tiers (from `business-rules.ts`)

| Tier | Hours Balance | Referral Bonus (Both Parties) |
|------|-------------|------------------------------|
| 🌱 Seedling | 0-39 hrs | 5 hours |
| 🌳 Rooted | 40-119 hrs | 7 hours |
| 🌿 Canopy | 120+ hrs | 10 hours |

### Viral Amplification Features

**1. QR Card Physical Sharing:**
The QR code on the card encodes `https://co-op.care/#/q/{memberId}`. When someone scans it in person, they land on the QR Landing page (Section 12) which says "Your neighbor [Name] invited you."

**2. "Neighbors Near You" Counter:**
On the homepage and card screen, show a live count of how many members are within each proximity tier:
- Walking distance (0.5 mi): X neighbors
- Biking distance (1 mi): X neighbors
- Neighborhood (2 mi): X neighbors

This creates social proof AND FOMO — "there are already 12 people in my neighborhood."

**3. Referral Chain Visualization:**
On the card screen, show a mini tree:
```
You → Maria → Tom → (3 more)
```
"Your network has reached 6 families." This makes the viral effect *visible*.

**4. Weekly "Neighborhood Update" Notification:**
Push notification every Monday:
> "3 new neighbors joined your area this week. Your referral helped Maria find help for her mom."

This keeps people coming back AND reminds them their sharing had real impact.

---

## 7. Background Check — Trust as Currency

### Positioning

The background check is NOT a gate. It's a **value accelerator.** Per `business-rules.ts`:

```
BACKGROUND_CHECK: {
  CHECKR_PACKAGE: 'tasker_standard',
  COST_TO_RUN: 30,        // Our cost via Checkr
  STANDALONE_PRICE: 30,   // Pass-through, no markup
  LMN_MONTHLY_PRICE: 59,  // Monthly LMN tier
  FREE_WITH_LMN: true,    // Background check included
  PROFILE_BOOST: { submitted: 85, cleared: 95 }
}
```

### How It Appears in the Tile Bank

A tile labeled **"Get Verified"** appears in the tile bank after the user has:
1. Completed their profile intent + roles
2. Had at least one Sage conversation

Tapping the tile opens a Sage conversation:

```
🌿 Trust is everything in our community.

   A quick background check ($30 at cost — we make $0 on this)
   makes you visible to more families and unlocks better matches.

   Or upgrade to our LMN program for $59/month:
   ✅ Background check included FREE
   ✅ Save 28-36% on care costs via HSA/FSA
   ✅ Dr. Emdur signs your Letter of Medical Necessity

   ┌──────────────────────┐  ┌──────────────────────┐
   │  $30 Background Only  │  │  $59/mo LMN Program  │
   └──────────────────────┘  └──────────────────────┘

   ┌──────────────────────┐
   │  Tell me more first  │
   └──────────────────────┘
```

### Background Check Flow

```
[Tap "Get Verified" tile]
    → Sage explains value + pricing
    → User selects $30 standalone OR $59/mo LMN
    → Stripe Checkout session created
    → Checkr invitation sent (email/SMS)
    → Tile updates: "Bg Check: Invited ⏳"
    → User completes Checkr flow (external)
    → Webhook updates status
    → Tile updates: "✅ Verified"
    → Profile ring segment fills
    → Profile boost: matching score → 85% (submitted) → 95% (cleared)
    → Sage congratulates: "You're now visible to X more families nearby."
```

### Background Check States in Tile Bank

| Status | Tile Label | Tile Color | Action |
|--------|-----------|------------|--------|
| `not_started` | Get Verified | blue | Opens Sage explainer |
| `invited` | Check Pending ⏳ | yellow | Shows Checkr status |
| `pending` | Under Review | yellow | Shows estimated time |
| `clear` | ✅ Verified | sage | Shows badge + boost |
| `consider` | Review Needed | red | Contact support link |
| `expired` | Renew Check | copper | Restart flow |

---

## 8. LMN Program — Tax Savings Enrollment

### What is LMN?

Letter of Medical Necessity. Dr. Josh Emdur (Medical Director) signs an LMN that qualifies care expenses for HSA/FSA reimbursement, saving families 28-36% on care costs.

### LMN Tile in Tile Bank

Appears for all users with `intent === 'seeking_care'`, after they've created their card:

```
┌──────────────────────────────────┐
│  💰 Save 28-36%                  │
│                                  │
│  Join the LMN program to         │
│  use your HSA/FSA for care.      │
│                                  │
│  $59/month · Free bg check       │
│  Dr. Emdur signs your LMN       │
│                                  │
│  ┌────────────────────────┐      │
│  │    Learn More →        │      │
│  └────────────────────────┘      │
└──────────────────────────────────┘
```

### LMN Enrollment via Sage

Tapping "Learn More" starts a Sage conversation:

```
🌿 Great question! The LMN program is how families save serious
   money on home care.

   Here's how it works:

   1. Dr. Emdur reviews your care situation
   2. He signs a Letter of Medical Necessity
   3. You submit the LMN to your HSA/FSA provider
   4. Your care costs become tax-deductible

   For a family spending $2,000/month on care, that's
   $560-720/month in savings — every month.

   The program costs $59/month and includes:
   ✅ Annual LMN from Dr. Emdur
   ✅ FREE background check ($30 value)
   ✅ Priority matching with verified caregivers
   ✅ 60/30/7 day automatic renewal reminders

   ┌──────────────────────┐  ┌──────────────────────┐
   │  Sign up for $59/mo  │  │  Not right now       │
   └──────────────────────┘  └──────────────────────┘
```

### LMN Savings Calculator (Inline Sage Card)

When the user asks "how much would I save?", Sage renders an inline card:

```
┌─────────────────────────────────────────┐
│  💰 Your Estimated Savings              │
│                                         │
│  Monthly care spend: [$____]            │
│                                         │
│  ┌────────────────────┐                 │
│  │  HSA savings (28%) │  $560/mo        │
│  │  FSA savings (36%) │  $720/mo        │
│  │  Annual savings    │  $6,720-8,640   │
│  └────────────────────┘                 │
│                                         │
│  vs. $59/mo program cost = net savings  │
│  of $501-661/month                      │
│                                         │
│  ┌──────────────────────┐               │
│  │  Start saving →      │               │
│  └──────────────────────┘               │
└─────────────────────────────────────────┘
```

---

## 9. Dynamic Tile Bank — Next Best Action Engine

The tile bank is the **heart of intuitive navigation.** It sits between the card and the Sage chat, and shows contextual actions based on who you are and what you've done.

### Tile Bank Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  TILE BANK                                           │
│  ─────────────────────────                           │
│  Horizontally scrollable, 2 rows, wrap on desktop    │
│                                                     │
│  Row 1: Priority actions (pulsing if urgent)         │
│  Row 2: Discovery actions (explore, learn, grow)     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tile Types

Each tile maps to either a Sage conversation or a direct action:

| Tile ID | Label | Icon | When Visible | Taps To |
|---------|-------|------|-------------|---------|
| `complete_profile` | Complete Profile | 📋 | Profile < 100% | Sage: "Let's finish your profile" |
| `mini_cii` | Quick Check-In | 💚 | CII not done in 30 days | Sage: inline Mini CII |
| `bg_check` | Get Verified | 🛡️ | bgCheck === 'not_started' | Sage: bg check explainer |
| `join_lmn` | Save 28-36% | 💰 | intent === 'seeking_care' && no LMN | Sage: LMN explainer |
| `see_nearby` | See Nearby | 📍 | Always (if location granted) | Map overlay with neighbor pins |
| `share_card` | Spread the Word | 📤 | Always | Native share sheet |
| `browse_tasks` | Find Tasks | 🔍 | intent === 'giving_care' | Sage: nearby task list |
| `request_help` | Request Help | 🤝 | intent === 'seeking_care' | Sage: help request flow |
| `my_streak` | X-Week Streak | 🔥 | streak > 0 | Sage: streak details + share |
| `my_impact` | Your Impact | 🌊 | totalHoursGiven > 0 | Sage: cascade visualization |
| `learn_coop` | How It Works | 📖 | onboardingPhase !== 'onboarded' | Sage: co-op explainer |
| `earn_more` | Earn Credits | ⏰ | balance < 10 | Sage: ways to earn |
| `invite_bonus` | Invite + Earn 5hrs | 🎁 | Always | Share with referral link |
| `wallet_add` | Add to Wallet | 📱 | !walletAdded | Apple/Google Wallet flow |
| `install_app` | Install App | ⬇️ | !pwaInstalled && PWA available | PWA install prompt |
| `governance` | Your Co-op | 🏛️ | tier >= 'rooted' | Sage: governance info |
| `tax_statement` | Tax Records | 📊 | LMN active && year-end | Sage: tax document |

### Tile Prioritization Algorithm

Tiles are sorted by a **priority score** that considers:

```typescript
function tilePriority(tile: TileConfig, user: ComfortCardHolder): number {
  let score = tile.basePriority; // 0-100

  // Boost incomplete profile actions
  if (tile.completesProfile && profilePercent < 100) score += 30;

  // Boost revenue actions (bg check, LMN) gently
  if (tile.isRevenue) score += 10;

  // Boost viral actions
  if (tile.isViral) score += 15;

  // Boost time-sensitive actions
  if (tile.isTimeSensitive) score += 25;

  // Boost based on recency (new tiles get attention)
  if (tile.isNew) score += 20;

  // Reduce score for recently dismissed tiles
  if (tile.dismissedAt && daysSince(tile.dismissedAt) < 7) score -= 50;

  return score;
}
```

**Top 8 tiles shown (2 rows of 4).** Remaining tiles accessible via "See all actions →" link.

### Tile Design

```
┌──────────────────┐
│                  │
│      🛡️         │
│                  │
│  Get Verified    │
│  $30 at cost     │
│                  │
└──────────────────┘
```

- Size: 80px × 100px (mobile), 96px × 120px (desktop)
- Background: White with subtle teal left border for priority tiles
- Border radius: 12px
- Icon: 32px, centered
- Label: DM Sans 13px bold
- Sublabel: DM Sans 11px, gray
- Tap feedback: Scale to 0.95 + teal highlight (100ms)
- Pulsing tiles: Subtle breathing animation on the icon

---

## 10. Proximity & Nearby — See Your Neighborhood

### "See Nearby" Tile

When tapped, opens a **map overlay** showing approximate neighbor locations (privacy-preserving — fuzzy to neighborhood level, not exact addresses).

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Neighbors near you                    [✕ close]    │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │                                         │        │
│  │          [MAP OF BOULDER]               │        │
│  │                                         │        │
│  │     📍 You                              │        │
│  │        🟢 Sarah (0.3 mi)               │        │
│  │           🟢 Tom (0.5 mi)              │        │
│  │     🟡 Elena (0.8 mi)                  │        │
│  │              🟡 David (1.1 mi)         │        │
│  │                                         │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  Walking (< 0.5 mi):    4 neighbors                 │
│  Biking (< 1 mi):       8 neighbors                 │
│  Neighborhood (< 2 mi): 15 neighbors                │
│  Community (< 5 mi):    31 neighbors                │
│                                                     │
│  ┌──────────────────────────────────┐                │
│  │  Invite more neighbors →         │                │
│  └──────────────────────────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Privacy Rules:**
- Locations fuzzy to 0.1 mile radius (not exact)
- Only show first name + distance
- Verified neighbors (bg check cleared) shown as 🟢, others as 🟡
- No addresses, phone numbers, or photos on map
- Location permission requested only when tapping "See Nearby"

**Proximity Tiers (from `business-rules.ts` ACTIVE_SITE):**

| Tier | Radius | Matching Multiplier |
|------|--------|-------------------|
| Walking | 0.5 mi | 3× |
| Biking | 1.0 mi | 2× |
| Neighborhood | 2.0 mi | 1× |
| Community | 5.0 mi | Remote only |

**Viral Hook:** The map overlay always shows an "Invite more neighbors" button. If walking distance has < 3 neighbors, show:
> "Only 2 neighbors within walking distance. Know someone nearby? They'd make your care network stronger."

---

## 11. Sage Onboarding Conversation Flow

After card creation, Sage drives profile completion through **natural conversation**, not forms. Each conversation maps to an `OnboardingPhase` from `signupStore.ts`.

### Phase Progression

```
fresh → exploring → profile_intent → profile_roles →
profile_community → memory_consent → onboarded → returning
```

### Conversation Scripts

**Phase: fresh → exploring**
Triggered: First time opening Card + Sage screen.

```
🌿 Hi Sarah! Welcome to your neighborhood care cooperative.

   I'm Sage — I'm here to help you navigate everything from
   finding care to connecting with neighbors.

   What brought you here today?

   ┌────────────────────────────┐
   │ My parent needs help       │
   └────────────────────────────┘
   ┌────────────────────────────┐
   │ I want to help neighbors   │
   └────────────────────────────┘
   ┌────────────────────────────┐
   │ Someone shared their card  │
   └────────────────────────────┘
   ┌────────────────────────────┐
   │ Just exploring             │
   └────────────────────────────┘
```

**Phase: exploring → profile_intent**
After 2-3 exchanges, Sage asks about their care intent more specifically.

```
🌿 It sounds like you're juggling a lot with your mom's care.
   You're not alone — there are 12 people within a mile of you
   in the same boat.

   Can I ask — are you mostly looking for help for your family,
   or are you also interested in giving care to others?

   ┌────────────────────────────┐
   │ Mostly finding care        │  → sets intent: 'seeking_care'
   └────────────────────────────┘
   ┌────────────────────────────┐
   │ Mostly giving care         │  → sets intent: 'giving_care'
   └────────────────────────────┘
   ┌────────────────────────────┐
   │ Both!                      │  → sets intent based on context
   └────────────────────────────┘
```

**Phase: profile_intent → profile_roles**
Sage asks about community roles based on their intent.

For `seeking_care`:
```
🌿 Perfect. In our co-op, the person coordinating care is called
   a "Conductor" — you're the one making sure everything works.

   Would any of these describe you?

   [InlineRolePicker renders here]
   ☐ Conductor (coordinating a loved one's care)
   ☐ Family member (supporting the Conductor)
   ☐ Neighbor (available to help nearby families)
```

For `giving_care`:
```
🌿 Amazing. People like you are the backbone of this community.

   What kind of care are you most interested in giving?

   [InlineRolePicker renders here]
   ☐ Companionship (visits, conversation, outings)
   ☐ Meals & errands (groceries, cooking, driving)
   ☐ Tech support (phones, tablets, video calls)
   ☐ Yard work & light housekeeping
   ☐ All of the above — I'm flexible!
```

**Phase: profile_roles → profile_community**
Sage explains the co-op model.

```
🌿 One thing that makes co-op.care different: it's owned by the
   caregivers who work here. Not a corporation. Not investors.
   The people doing the care own the business.

   When neighbors exchange care through the Time Bank, everyone
   builds credits. Your first hour is already in your account.

   Would you like to see who's near you?

   ┌────────────────────────────┐
   │ Yes, show me! 📍           │  → Opens nearby map
   └────────────────────────────┘
   ┌────────────────────────────┐
   │ Tell me more about credits │  → Sage explains Time Bank
   └────────────────────────────┘
```

**Phase: profile_community → memory_consent**
This is the critical consent moment.

```
🌿 Sarah, I've learned a lot about you in our conversation.

   If you'd like, I can remember what you've told me so our
   future conversations pick up where we left off. I'll remember
   things like your care situation, preferences, and goals.

   [InlineConsentPicker renders here]

   ┌────────────────────────────┐
   │ ✅ Yes, remember me         │  → memoryConsent: 'granted'
   └────────────────────────────┘    → saves to localStorage
   ┌────────────────────────────┐
   │ 🔒 This session only       │  → memoryConsent: 'session_only'
   └────────────────────────────┘    → does NOT persist

   Your data stays on this device. We never share or sell it.
```

**Phase: memory_consent → onboarded**
Final onboarding message:

```
🌿 You're all set! Here's what you can do now:

   🏠 Take the quick check-in (2 minutes, helps us understand
      your care situation)
   📍 See neighbors near you
   📤 Invite someone who'd benefit
   🛡️ Get verified ($30 bg check makes you visible to more families)

   I'm always here. Just type or tap. 💚
```

### Returning Users (Phase: returning)

When a user returns with localStorage data:

```
🌿 Welcome back, Sarah! Last time we talked about
   finding companionship help for your mom.

   Since then, 3 new neighbors joined within a mile of you.

   What would you like to do today?

   ┌────────────────────────────┐
   │ Quick check-in 💚           │
   └────────────────────────────┘
   ┌────────────────────────────┐
   │ See who's nearby 📍         │
   └────────────────────────────┘
   ┌────────────────────────────┐
   │ Invite a neighbor 📤        │
   └────────────────────────────┘
```

---

## 12. QR Referral Landing — The Viral Loop Closer

When someone scans a QR code or clicks a referral link, they land on `/#/q/:memberId`.

### Referral Landing Page

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Photo: Warm Boulder neighborhood scene]            │
│                                                     │
│  Your neighbor Sarah                                 │
│  thinks you'd be a great fit.                        │
│                                                     │
│  co-op.care is a neighborhood care cooperative       │
│  where neighbors look after each other.              │
│                                                     │
│  When you join, you and Sarah both earn              │
│  5 hours of free care credit.                        │
│                                                     │
│  ┌──────────────────────────────────┐                │
│  │    Get Your Free Card            │                │
│  │    (30 seconds, no credit card)   │                │
│  └──────────────────────────────────┘                │
│                                                     │
│  Or talk to Sage first:                              │
│                                                     │
│  ┌──────────────────────────────────┐                │
│  │    "What is co-op.care?"         │                │
│  └──────────────────────────────────┘                │
│                                                     │
│  Already have a card? [Sign in]                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Personalization:**
- `getReferrerName(memberId)` fetches the referrer's first name
- If name found: "Your neighbor [Name] thinks you'd be a great fit."
- If name not found: "A neighbor invited you to co-op.care."
- `referredBy` pre-filled in join flow
- After signup, both parties get Seedling referral bonus (5 hours)

**Post-Referral Sage Message (to the referrer):**
```
🌿 Great news! Someone used your invite link and just
   joined co-op.care. You both earned 5 hours of care credit!

   Your referral network: You → 3 families reached
```

---

## 13. Visual System

### Typography

| Use | Font | Weight | Size (Mobile) | Size (Desktop) |
|-----|------|--------|--------------|----------------|
| Hero headline | Literata | 700 italic | 36px | 56px |
| Section headline | Literata | 600 | 28px | 40px |
| Card title | DM Sans | 600 | 18px | 20px |
| Body text | DM Sans | 400 | 15px | 16px |
| Tile label | DM Sans | 600 | 13px | 14px |
| Caption/meta | DM Sans | 400 | 12px | 13px |
| Sage message | DM Sans | 400 | 15px | 16px |
| Sage followup pills | DM Sans | 500 | 14px | 15px |

### Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| Teal (Primary) | #2BA5A0 | CTAs, active states, Sage accent, card tile "sage" |
| Navy (Secondary) | #1B3A5C | Headers, card backgrounds, tile "copper" |
| Gold | #C49B40 | Financial (LMN, savings), achievements, tile "gold" |
| Blue | #4A6FA5 | Institutional, nearby/proximity, tile "blue" |
| Red | #E85D5D | Alerts, Red CII zone, tile "red" |
| Yellow | #D4A72C | Warnings, pending states, Yellow CII zone, tile "yellow" |
| Gray | #6B7280 | Muted text, disabled, tile "gray" |
| White | #FFFFFF | Backgrounds, cards |
| Off-white | #F9FAFB | Page backgrounds |
| Dark overlay | rgba(0,0,0,0.4) | Photo overlays |

### Component Tokens

| Component | Background | Border | Border Radius | Shadow |
|-----------|-----------|--------|--------------|--------|
| Card (story) | white | none | 12px | 0 4px 12px rgba(0,0,0,0.08) |
| Card (comfort) | white | teal top 3px | 12px | 0 2px 8px rgba(0,0,0,0.06) |
| Tile | white | left teal 3px (priority) | 12px | 0 1px 4px rgba(0,0,0,0.05) |
| Button (primary) | teal | none | 999px (pill) | none |
| Button (secondary) | transparent | teal 2px | 999px (pill) | none |
| Sage bubble | #F0FAF9 | none | 16px | none |
| User bubble | #EBF0F5 | none | 16px | none |
| Input field | white | gray 1px | 12px | inset 0 1px 2px rgba(0,0,0,0.05) |
| Intent chip | white | teal 2px | 12px | none, teal bg when selected |

### Spacing Scale

4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96

### Animation Tokens

| Animation | Duration | Easing | Use |
|-----------|----------|--------|-----|
| Card reveal | 200ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Card slide-up |
| Tile tap | 100ms | ease-out | Scale 0.95 |
| Pulse | 2000ms | ease-in-out | Tile breathing |
| Counter | 600ms | ease-out | Number increment |
| Confetti | 3000ms | linear | Card creation celebration |
| Ring fill | 400ms | ease-out | Profile ring segment completion |
| Fade in | 200ms | ease-in | Section appearance on scroll |

### Photography Guidelines

- **Always:** Real people, real Boulder settings, golden hour light, Flatirons visible when possible
- **Never:** Stock photos, clinical settings, sad faces, hospital gowns
- **Diversity:** Age range 25-85, multiple ethnicities, mixed abilities
- **Emotion:** Warmth, laughter, connection, hands touching, shared meals
- **Settings:** Front porches, Boulder Creek path, Pearl Street, neighborhood sidewalks, kitchen tables

---

## 14. Persona-Specific Flows

### Alpha Daughter (Conductor, seeking_care)

**Entry:** Organic search "home care Boulder" or friend referral
**Hero message:** "You're not alone in this."
**Sage opener:** Asks about care situation (parent's needs)
**Priority tiles:** Quick Check-In, Request Help, Join LMN, See Nearby
**Key conversion:** CII assessment → LMN enrollment ($59/mo)
**Viral trigger:** "Know another caregiver? They need this too."

**Timeline:**
1. Day 0: Get card → Sage conversation → Mini CII
2. Day 1: See nearby neighbors → invite 1 friend
3. Day 3: Request first help task
4. Day 7: Consider LMN program
5. Day 14: Background check (to be matched with verified caregivers)

### Senior (Direct user, seeking_care)

**Entry:** Neighbor shared card, family member set up
**Hero message:** "Your neighborhood has your back."
**Sage opener:** Simpler language, larger text option, voice-first
**Priority tiles:** See Nearby, Request Help, Call Sage (voice)
**Key conversion:** First help request
**Viral trigger:** "Tell your friends at [senior center]"

### Neighbor (giving_care)

**Entry:** Referral link from friend, community board posting
**Hero message:** "Your time has real value here."
**Sage opener:** Asks what skills they'd like to share
**Priority tiles:** Browse Tasks, Get Verified, Earn Credits, Spread the Word
**Key conversion:** Accept first task → complete → earn credits
**Viral trigger:** "Verified neighbors get matched first. Invite your friends to join."

**The Neighbor is the viral engine.** Their referral earns hours for BOTH parties. Their background check makes them more valuable. Their streak makes them want to share. Every action a neighbor takes creates a sharing opportunity.

### Worker-Owner (W-2 employee)

**Entry:** Application through co-op, referred by existing worker
**Hero message:** "Own your work. Own your future."
**Sage opener:** Orientation, certification requirements
**Priority tiles:** Complete Orientation, Background Check, View Schedule
**Key conversion:** Complete background check + orientation → first shift
**Viral trigger:** "Refer a coworker — $500 hiring bonus" (future feature)

---

## 15. State Machine & Data Model

### Zustand Store: signupStore

The `signupStore` already has the right shape. Key additions needed:

```typescript
// Additions to ComfortCardHolder
interface ComfortCardHolder {
  // ... existing fields ...

  // NEW: Profile completeness tracking
  profileCompleteness: number;       // 0-100, computed from filled segments

  // NEW: Proximity data (from geolocation)
  lastLocation?: { lat: number; lng: number; timestamp: string };

  // NEW: Tile dismissals (for priority algorithm)
  tileDismissals: Record<string, string>; // tileId → ISO timestamp

  // NEW: LMN enrollment
  lmnStatus: 'none' | 'interested' | 'enrolled' | 'active';
  lmnEnrolledAt?: string;

  // NEW: Referral chain
  referralCount: number;
  referralChain: string[]; // memberIds of people referred

  // NEW: Streak tracking
  currentStreak: number;    // weeks
  longestStreak: number;
}
```

### Profile Completeness Calculation

```typescript
function computeProfileCompleteness(holder: ComfortCardHolder): number {
  const segments = [
    { key: 'name', filled: !!holder.firstName },
    { key: 'contact', filled: !!(holder.phone || holder.email) },
    { key: 'intent', filled: !!holder.intent },
    { key: 'roles', filled: holder.communityRoles.length > 0 },
    { key: 'miniCii', filled: false }, // Check from assessment store
    { key: 'consent', filled: holder.memoryConsent !== 'pending' },
    { key: 'bgCheck', filled: holder.bgCheck.status !== 'not_started' },
    { key: 'lmn', filled: holder.lmnStatus !== 'none' },
  ];

  const filled = segments.filter(s => s.filled).length;
  return Math.round((filled / segments.length) * 100);
}
```

### Navigation State

```typescript
// Route → Screen mapping
const ROUTES = {
  '/':            'homepage',      // Screen 1
  '/join':        'join',          // Screen 2
  '/welcome':     'card-reveal',   // Screen 2 (post-join)
  '/card':        'card-sage',     // Screen 3
  '/my-card':     'card-sage',     // Screen 3 (alias)
  '/q/:memberId': 'qr-landing',   // Referral landing → Screen 1 variant
};

// Auto-redirect logic
function getRedirect(auth: AuthState, signup: SignupState): string | null {
  if (auth.isAuthenticated) return '/card';
  if (signup.cardHolder) return '/card';
  return null; // Stay on current route
}
```

---

## 16. Metrics & Success Criteria

### Primary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Homepage → Card creation | 15% | Within first visit |
| Card creation → Sage conversation | 80% | Within first session |
| Sage conversation → Mini CII | 40% | Within 7 days |
| Card holder → Referral sent | 25% | Within 14 days |
| Referral → New card creation | 30% | Within 7 days of referral |
| Card holder → Background check | 15% | Within 30 days |
| Card holder → LMN enrollment | 8% | Within 60 days |
| Profile completeness (avg) | 62% | At 30 days |
| Day 7 return rate | 50% | Active session within 7 days |
| Day 30 return rate | 30% | Active session within 30 days |

### Viral Coefficient Target

**K-factor = (invites per user) × (conversion rate per invite)**

Target: K > 1.0 (self-sustaining growth)

Conservative estimate:
- Avg invites per user: 3 (card share, 2 referral links)
- Conversion rate per invite: 35%
- K = 3 × 0.35 = **1.05** — barely viral, but viral

To push K higher:
- More share triggers (Section 6)
- Better referral landing page conversion
- Proximity-based FOMO ("only 2 neighbors within walking distance")
- Referral chain visibility ("you've reached 6 families")

### Tracking Implementation

Every key action fires an analytics event:

```typescript
// Event taxonomy
type AnalyticsEvent =
  | { event: 'homepage_view'; source: 'organic' | 'referral' | 'returning' }
  | { event: 'card_created'; intent: string; hasReferrer: boolean }
  | { event: 'sage_conversation_started'; phase: OnboardingPhase }
  | { event: 'tile_tapped'; tileId: string; position: number }
  | { event: 'share_initiated'; category: string; channel: string }
  | { event: 'referral_converted'; referrerMemberId: string }
  | { event: 'bg_check_started'; withLmn: boolean }
  | { event: 'lmn_enrolled' }
  | { event: 'mini_cii_completed'; zone: 'green' | 'yellow' | 'red' }
  | { event: 'profile_segment_completed'; segment: string; completeness: number }
  | { event: 'nearby_opened'; neighborCount: number }
  | { event: 'pwa_installed' }
  | { event: 'wallet_added' };
```

---

## 17. Routes & Navigation

### Route Map

| Route | Screen | Auth Required | Component |
|-------|--------|--------------|-----------|
| `/` | Homepage | No | `Homepage.tsx` |
| `/join` | Join Flow | No | `JoinFlow.tsx` |
| `/join?ref=COOP-XXXX` | Join Flow (referred) | No | `JoinFlow.tsx` |
| `/welcome` | Card Reveal | No (card required) | `CardReveal.tsx` |
| `/card` | Card + Sage | No (card required) | `CardAndSage.tsx` |
| `/my-card` | Card + Sage (alias) | No (card required) | `CardAndSage.tsx` |
| `/q/:memberId` | QR Landing | No | `QRLanding.tsx` |

### Auto-Redirect Rules

```
Visitor with no card:
  /card → redirect to /
  /welcome → redirect to /
  /my-card → redirect to /

Visitor with card:
  / → stay (can browse homepage)
  /join → redirect to /card (already have card)

Authenticated member:
  All routes → /card (or authenticated dashboard when Phase 2 launches)
```

---

## 18. Accessibility & Performance

### Accessibility

- **WCAG 2.1 AA** compliance minimum
- All images: Meaningful `alt` text describing the scene
- All interactive elements: Minimum 44px tap target
- Color contrast: 4.5:1 minimum for body text, 3:1 for large text
- Keyboard navigation: Full tab order through all interactive elements
- Screen reader: ARIA labels on all tiles, cards, and dynamic content
- Motion: `prefers-reduced-motion` → disable confetti, pulse, counters
- Font sizing: Respects system font size preferences
- Voice input: Sage input field supports speech-to-text

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| Cumulative Layout Shift | < 0.1 |
| Bundle size (initial) | < 150KB gzipped |
| Hero image | < 200KB (WebP, lazy above-fold) |
| Story card images | Lazy loaded, < 50KB each |
| Tile bank | Client-rendered, no network dependency |
| Sage preview | Deferred load, not blocking initial paint |

### PWA Requirements

- Service worker: Cache homepage shell + story cards
- Offline: Show cached card + "Sage needs internet" message
- Install prompt: Triggered after 2nd visit or Sage conversation
- Push notifications: Permission requested after onboarding complete
- Manifest: Standalone display, teal theme color, co-op.care icons

---

## Appendix A: File Creation Plan

### New Files

| File | Purpose |
|------|---------|
| `src/client/features/homepage/Homepage.tsx` | Full homepage (replaces current) |
| `src/client/features/homepage/HeroSection.tsx` | Full-bleed hero with dual CTA |
| `src/client/features/homepage/StoryCarousel.tsx` | Horizontal story card scroller |
| `src/client/features/homepage/ComfortCardStrip.tsx` | 3 benefit cards |
| `src/client/features/homepage/SagePreview.tsx` | Mini Sage experience |
| `src/client/features/homepage/SocialProof.tsx` | Neighbor count + testimonials |
| `src/client/features/homepage/FooterCTA.tsx` | Final conversion section |
| `src/client/features/signup/JoinFlow.tsx` | 3-field card creation |
| `src/client/features/signup/CardReveal.tsx` | Animated card reveal |
| `src/client/features/sage/TileBank.tsx` | Dynamic tile grid |
| `src/client/features/sage/TilePriority.ts` | Tile sorting algorithm |
| `src/client/features/sage/ProfileRing.tsx` | QR code profile memory ring |
| `src/client/features/sage/NearbyMap.tsx` | Proximity map overlay |
| `src/client/features/sage/QRLanding.tsx` | Referral landing page |
| `src/client/features/sage/LMNCalculator.tsx` | Inline savings calculator |
| `src/client/features/sage/BgCheckFlow.tsx` | Background check Sage flow |
| `src/client/hooks/useGeolocation.ts` | Geolocation hook |
| `src/client/hooks/useProfileCompleteness.ts` | Profile % computation |
| `src/client/hooks/useTilePriority.ts` | Tile bank sorting hook |
| `src/client/hooks/useNearbyNeighbors.ts` | Proximity query hook |
| `src/client/hooks/useShareAction.ts` | Native share sheet hook |
| `src/shared/constants/story-cards.ts` | Seeded story card content |
| `src/shared/constants/sage-onboarding-scripts.ts` | Sage conversation prompts |

### Modified Files

| File | Changes |
|------|---------|
| `src/client/App.tsx` | Update routes for new components |
| `src/client/stores/signupStore.ts` | Add new fields (profile completeness, proximity, LMN, etc.) |
| `src/client/features/sage/SageChat.tsx` | Integrate tile bank, profile ring, onboarding scripts |
| `src/client/features/sage/CareCard.tsx` | Add profile ring, update tile display |
| `src/client/features/sage/CardAndSage.tsx` | New layout with tile bank between card and chat |
| `src/client/index.css` | Tailwind config for new design tokens |
| `src/shared/constants/business-rules.ts` | Add tile priority constants, story card data |

---

## Appendix B: Demo Mode Data

All demo mode data for story cards, neighbor counts, and proximity:

```typescript
// Demo story cards
const DEMO_STORIES = [
  {
    name: 'Sarah',
    role: 'Conductor',
    photo: '/demo/sarah.jpg',
    quote: 'Mom was falling through the cracks of the system.',
    distance: 0.3,
    tier: 'Walking',
  },
  {
    name: 'Elena',
    role: 'Neighbor',
    photo: '/demo/elena.jpg',
    quote: 'I moved here alone. Now I have 12 people I can call.',
    distance: 0.8,
    tier: 'Biking',
  },
  {
    name: 'David',
    role: 'Conductor',
    photo: '/demo/david.jpg',
    quote: "After Dad's stroke, I didn't know who to call.",
    distance: 1.2,
    tier: 'Neighborhood',
  },
  {
    name: 'Tom',
    role: 'Neighbor',
    photo: '/demo/tom.jpg',
    quote: 'The streak keeps me going. 12 weeks and counting.',
    distance: 0.5,
    tier: 'Walking',
  },
];

// Demo neighbor counts
const DEMO_NEARBY = {
  walking: 4,
  biking: 8,
  neighborhood: 15,
  community: 31,
  total: 47,
  hoursThisWeek: 24,
  familiesThisMonth: 3,
};
```

---

*This design document is the single source of truth for the homepage, card, and onboarding redesign. All implementation should reference this document. Changes require design review.*
