# co-op.care: Web3 + AI Agent Architecture — From Future Vision to Today's Build

**Deep Architecture Document — March 9, 2026 (Updated)**
**Status: Technical roadmap with actionable build plan. Codebase alignment complete — see "Already Built" section.**

---

## The Big Picture: What We're Actually Building

co-op.care is a worker-owned companion care cooperative. Today it runs on PostgreSQL, Fastify, React, and a TimeBank with 25 features (double-entry ledger, GPS verification, cascade impact, Omaha auto-coding, deficit nudges, respite fund, streak milestones, referral bonuses).

The question: **How do smart contracts, DAO governance, and AI agents weave into this — and what do we build TODAY vs. later?**

The answer: **AI agents NOW. Smart contracts LATER. DAO governance GRADUALLY.**

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE FULL VISION (Year 3+)                     │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ScheduleAI│  │  SageAI  │  │BillingAI │  │ComplianceAI  │   │
│  │  Agent   │  │Companion │  │  Agent   │  │   Agent      │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │             │                │            │
│       └──────┬───────┴─────┬───────┴────────┬──────┘            │
│              │   A2A Protocol Layer         │                   │
│       ┌──────┴─────────────┴────────────────┴──────┐            │
│       │           MCP Server Layer                  │            │
│       │  (PostgreSQL, Twilio, Calendar, Aidbox,     │            │
│       │   Galaxy Watch, Opolis, CMS Claims)       │            │
│       └──────┬─────────────┬────────────────┬──────┘            │
│              │             │                │                   │
│       ┌──────┴──────┐ ┌───┴────┐  ┌────────┴────────┐         │
│       │  PostgreSQL  │ │ Aidbox │  │ Polygon/Base    │         │
│       │  (Primary)  │ │ FHIR   │  │ Smart Contracts │         │
│       └─────────────┘ └────────┘  │ • TimeBank Token│         │
│                                    │ • Respite Fund  │         │
│                                    │ • Gnosis Safe   │         │
│                                    │ • Governance    │         │
│                                    └─────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: What Exists Today (The TimeBank We Built)

### 25 Production Features

The CareOS TimeBank is already sophisticated:

| Category | Features |
|----------|----------|
| **Ledger** | Double-entry (earned/spent/bought/donated/expired/deficit), 0.25hr rounding, balance snapshots |
| **Credits** | Membership floor (40 hrs/yr), cash purchase ($15/hr), referral bonus (5 hrs), training bonus (5 hrs) |
| **Respite** | 10% auto-deduction (opt-out), emergency fund (48hr max, auto-approve ≥100 hrs), fund transactions |
| **Tasks** | Full lifecycle (open→matched→accepted→checked_in→completed), GPS verification (0.25mi Haversine) |
| **Matching** | Multi-factor scoring (proximity 3/10, skill 2/10, rating 2/10, availability 3/10, identity bonus) |
| **Recognition** | Gratitude flow (rating + notes), streak tracking (4/8/12/26/52 week milestones), cascade impact |
| **Safety** | Deficit enforcement (-20hr cap), graduated nudges (-5/-10/-15/-20), burnout warning (>10hr/wk) |
| **Clinical** | Omaha auto-coding (12 task types → problem codes), remote task exemption |
| **Expiry** | 12-month auto-expiry → Respite Fund, 30-day warning alerts |

### What's Missing

1. **No automation** — Every scheduling decision requires human coordination
2. **No smart contracts** — Ledger is in PostgreSQL (mutable, single point of trust)
3. **No governance tooling** — Board decisions happen over email/meetings
4. **No AI agents** — Sage companion exists but isn't wired to real data or scheduling
5. **No inter-system orchestration** — Each module is siloed

---

## Part 2: AI Agents — What We Build NOW

### Why Agents First, Blockchain Later

| Factor | AI Agents | Smart Contracts |
|--------|-----------|-----------------|
| **Time to value** | Weeks | Months |
| **User impact** | Eliminates scheduling coordinator role ($3,500-7,000/mo savings) | Adds transparency (nice-to-have at 50 members) |
| **Technical risk** | Low (proven frameworks, Claude API) | Medium (audit requirements, key management, wallet UX) |
| **Regulatory** | Colorado AI Act requires documentation anyway | No regulatory driver |
| **Cost** | $347-867/mo total | $2-10/mo gas + $20-45K development |
| **Member UX** | Invisible (works via SMS/push) | Visible burden (wallet setup) |

### The Seven AI Agents

#### Agent 1: Scheduling Orchestrator (LangGraph)

**What it replaces:** Human scheduling coordinator doing matching, notifications, rescheduling, cancellation coverage.

**Architecture:**
```
[Shift Request / Cancellation Event]
       │
       ▼
[LangGraph: Scheduling Orchestrator]
  ├── Node 1: Score caregivers (existing multi-factor algorithm)
  │     proximity(3/10) + skill(2/10) + rating(2/10) + availability(3/10)
  ├── Node 2: Rank top 3 candidates
  ├── Node 3: Offer shift to #1 (SMS via MCP → Twilio)
  ├── Node 4: Wait for response (timeout: 15 min)
  ├── Edge: Accepted → Node 6 (confirm + notify family)
  ├── Edge: Declined/Timeout → Loop to #2 candidate
  ├── Edge: All declined → Node 5 (escalate to human)
  └── Node 6: Confirm booking, update PostgreSQL, notify family
       │
       ▼
[MCP Servers: PostgreSQL, Twilio, Calendar, Push]
```

**Model:** Claude Sonnet 4.6 ($3/$15 per MTok) — needs reasoning for multi-factor scoring.
**Cost:** ~$50-80/mo at 200 shifts/week.
**Timeline:** Weeks 1-6.

#### Agent 2: Sage Care Companion (Claude Agent SDK)

**What it does:** Answers "How is Mom doing?" with data from Galaxy Watch vitals, caregiver notes, TimeBank activity, and CII scores. Already partially built — needs MCP server wiring.

**Architecture:**
```
Family asks: "How is Mom doing today?"
       │
       ▼
[Claude Agent SDK: Sage Companion]
  ├── MCP: Wearable Server → get_care_context(patientId)
  │     Returns: vitals, anomalies, risk score, device status
  ├── MCP: PostgreSQL → recent care logs, gratitude notes
  ├── MCP: Aidbox FHIR → medications, conditions
  └── Generates natural language summary
       │
       ▼
"Mom had a good day. Heart rate steady at 72 bpm,
 slept 7.2 hours last night. Sarah visited for 3 hours
 this morning — they did gardening and had lunch together.
 No anomalies flagged."
```

**Model:** Claude Haiku 4.5 ($1/$5 per MTok) — fast, cheap, conversational.
**Cost:** ~$10-15/mo at 2,000 conversations/month.
**Timeline:** Weeks 4-10.

#### Agent 3: Shift Coordinator (Claude Agent SDK)

**What it does:** Handles the communication loop — "Can you cover Tuesday's shift?", confirmation messages, reminder notifications, caregiver-to-caregiver coordination.

**Model:** Claude Haiku 4.5 ($1/$5 per MTok).
**Cost:** ~$5-8/mo.
**Timeline:** Built alongside Agent 2 (shared MCP infrastructure).

#### Agent 4: Billing & TimeBank Agent (LangGraph)

**What it automates (10-layer revenue stack awareness):**
- **RPM** (99453/99454/99445/99457/99458/99470): Device data day tracking, auto-flags 16+ days (99454), 2-15 day threshold (99445), cumulative staff time for 99457/99458/99470
- **PIN** (G0023/G0024): Tracks navigation services by Conductor — care coordination, follow-up scheduling, community resource connection. Billed incident-to Clinical Director
- **CHI** (G0019/G0022): Tracks community health integration services — SDOH screening, community resource referrals, health-related social needs. Billed incident-to Clinical Director
- **CCM** (99490/99491): Tracks 20+ min/month clinical staff time for patients with 2+ chronic conditions
- **ACCESS Model**: Outcome-Aligned Payment tracking — OAP revenue + 50% withhold against Outcome Attainment Threshold
- **PACE sub-capitation**: TRU PACE companion care hours and companion tier eligibility
- **LMN generation**: Auto-generates Letter of Medical Necessity for HSA/FSA eligibility (25-37% savings)
- TimeBank credit transfers (0.9/0.1 Respite Default split)
- Cash purchase processing ($15/hr → $12 coordination + $3 respite)
- Expiry warnings 30 days before credit expiration
- Auto-generates CMS-1500 claim forms → human review gate
- **Revenue maximization**: Surfaces full stacking potential (PIN+CHI+CCM+RPM = ~$481/patient/month)

**Critical CMS rulings:**
- AI communications do NOT count toward interactive communication requirements for 99457/99458/99470. These require live, interactive communication with patient/caregiver. The billing agent tracks and flags — a human still has the conversation.
- PIN/CHI require "incident-to" supervision by a physician (Josh Emdur, DO — Clinical Director). Conductors perform services; Clinical Director signs off.
- CMS-1807-F (effective Jan 2024) created PIN/CHI codes — these are NEW revenue for co-op.care that most companion care agencies don't capture.

**Model:** Claude Sonnet 4.6 ($3/$15 per MTok).
**Cost:** ~$15-25/mo.
**Timeline:** Weeks 8-14.

**Codebase integration:** `billing-codes.ts` provides the full taxonomy; `wearable-tools.ts` surfaces RPM eligibility and billing context in `getDeviceStatus()` and `getCareContext()` responses for Sage AI.

#### Agent 5: Compliance Monitor (LangGraph)

**What it automates:**
- Colorado AI Act impact assessments (annual + on system changes)
- Algorithmic discrimination scanning (weekly analysis of matching outcomes by demographics)
- Caregiver certification expiry tracking (60/30/7-day reminders)
- Burnout monitoring (>10 hrs/week threshold)
- Anomalous GPS pattern detection
- NIST AI RMF-aligned documentation generation

**Colorado AI Act deadline: June 30, 2026.** co-op.care must comply if any AI system makes or substantially factors into "consequential decisions" in healthcare. Small business exemption (<50 employees) may apply UNLESS co-op.care fine-tunes models on its own data.

**Model:** Claude Opus 4.6 ($5/$25 per MTok) — high-stakes reasoning for compliance.
**Cost:** ~$20-40/mo.
**Timeline:** Weeks 12-18.

#### Agent 6: Triage Agent (Claude Agent SDK)

**What it does:** Continuously monitors CII scores across all active care recipients. When a caregiver's CII enters the Yellow Zone (41-79), the Triage Agent proactively drafts a neighbor respite request in the Time Bank — preventing burnout before the caregiver reaches Red Zone crisis.

**Architecture:**
```
[CII Score Update Event]
       │
       ▼
[Claude Agent SDK: Triage Agent]
  ├── Monitor: Watch all CII scores (real-time + scheduled scans)
  ├── Trigger: CII enters Yellow Zone (score 41+)
  ├── Action 1: Draft respite request in Time Bank
  │     Match task type to highest-scoring CII dimension
  ├── Action 2: Notify caregiver: "We've pre-drafted a respite request"
  ├── Action 3: If CII ≥ 60 (high yellow), alert Conductor
  └── Human gate: Caregiver confirms or modifies the draft
       │
       ▼
[MCP Servers: PostgreSQL (CII scores), TimeBank, Push Notifications]
```

**Model:** Claude Haiku 4.5 ($1/$5 per MTok) — monitoring + drafting.
**Cost:** ~$5-10/mo.
**Timeline:** Weeks 8-12 (after Sage Companion infrastructure exists).

#### Agent 7: Business-of-One Agent (Claude Agent SDK)

**What it does:** Each caregiver's S-Corp/C-Corp entity gets a personal AI agent that handles administrative work — the "second job" that burns out professionalized caregivers. Instead of the caregiver spending personal time on payroll accounting and benefits management, the agent handles it automatically.

**Architecture:**
```
[Caregiver completes shift → CareOS clock-out]
       │
       ▼
[Claude Agent SDK: Business-of-One Agent]
  ├── Auto-route: Payroll instruction → Opolis Funding Account
  ├── Auto-track: Year-to-date earnings, tax withholdings, benefits usage
  ├── Auto-generate: Quarterly estimated tax summary
  ├── Auto-alert: Benefits enrollment deadlines, certification renewals
  ├── Auto-compile: Annual business expense summary for S-Corp filing
  └── On-demand: "How much have I earned this month?" via SMS/chat
       │
       ▼
[MCP Servers: Opolis API, PostgreSQL, Push Notifications]
```

**Model:** Claude Haiku 4.5 ($1/$5 per MTok) — administrative queries + routing.
**Cost:** ~$3-5/mo (per 5 caregivers — low volume, simple queries).
**Timeline:** Weeks 14-18 (after Opolis API integration).

### Agentic Memory: Context as Competitive Moat

The deepest structural advantage of the agent architecture is **Agentic Memory** — the accumulated knowledge of each patient's routines, preferences, medication reactions, and care patterns built over months and years of caregiver visits.

PE-backed agencies with 77% turnover restart from zero with every caregiver change. co-op.care's projected 15% turnover (driven by $25-28/hr wages, Cigna PPO, equity ownership) means this memory compounds. After 12 months, co-op.care knows "Mom likes honey in her tea, reacts badly to ibuprofen, sleeps better after garden walks, and prefers Sarah on Tuesdays." No competitor can replicate this.

**The switching cost is the memory itself.** A family that leaves co-op.care loses the Agentic Memory that actually understands their loved one. This is captured in the `AGENTIC_MEMORY` constant in `business-rules.ts`.

### PostgreSQL: The Agentic Nervous System

The deepest technical insight in the co-op.care architecture: **PostgreSQL is not passive storage — it's the coordination substrate that activates, connects, and orchestrates all 7 AI agents.**

Three capabilities make PostgreSQL uniquely suited to agentic care:

| Capability | What It Replaces | co-op.care Use |
|------------|-----------------|----------------|
| **LIVE SELECT** (Live Queries) | Redis pub/sub, Kafka, polling crons | 17 real-time subscriptions push data changes TO agents — CII Yellow Zone → Triage Agent fires in <1 second |
| **Graph Traversal** (Record Links + `->` operator) | Multi-table SQL JOINs, separate Neo4j | 8 relationship types model the entire cooperative social fabric: `user->helped->user->assigned_to->family->care_recipient` |
| **DEFINE EVENT** (Embedded Events) | Temporal, Airflow, message queues | 7 CORM pipeline events — single clock-in → FHIR + CMS billing + Opolis payroll simultaneously |

**Architecture comparison:**
```
Traditional:  App → Event Bus → Agents → Database → Event Bus → ...
co-op.care:   App → PostgreSQL ←→ Agents (direct, bidirectional)
```

**Health system integration through agentic work (not passive APIs):**
- **BCH discharge** (HL7 ADT A03) → LIVE SELECT triggers Scheduling Agent → companion visit auto-scheduled within 72 hours
- **Galaxy Watch anomaly** → LIVE SELECT triggers Sage + Triage → proactive family notification with clinical context
- **CMS billing threshold** → LIVE SELECT triggers Billing Agent → auto-flags RPM 99454 at 16 data days
- **CII Yellow Zone** → LIVE SELECT triggers Triage Agent → auto-drafts respite Time Bank request

**Why PostgreSQL specifically:** Multi-model (document + graph + relational + time-series + geospatial) in one engine. Traditional approach requires PostgreSQL + Redis + Neo4j + Temporal + event bus = 5 systems, 5 failure modes, 5 HIPAA audits. PostgreSQL = 1 system, 1 audit, 1 backup, 1 connection string. SQL is SQL-adjacent enough for Jacob (backend dev) to work in immediately.

**The existing schema already has the relation tables:** `helped` (Time Bank cascade), `member_of` (cooperative membership), `assigned_to` (care team), `referred` (viral loop). Four proposed agentic edges: `lives_near` (geographic proximity), `discharged_to` (BCH integration), `monitors` (wearable RPM), `billed_for` (CMS claims trail).

Full agent subscription map, graph query library, CORM event definitions, and health system integration patterns codified in `postgres-agentic.types.ts`.

### Agent Cost Summary

| Agent | Model | Monthly API Cost |
|-------|-------|-----------------|
| Scheduling Orchestrator | Sonnet 4.6 | $50-80 |
| Sage Companion | Haiku 4.5 | $10-15 |
| Shift Coordinator | Haiku 4.5 | $5-8 |
| Billing & TimeBank | Sonnet 4.6 | $15-25 |
| Compliance Monitor | Opus 4.6 | $20-40 |
| Triage Agent | Haiku 4.5 | $5-10 |
| Business-of-One Agent | Haiku 4.5 | $3-5 |
| **Total API** | | **$108-185/mo** |
| Infrastructure (hosting, Twilio, SendGrid, LangSmith) | | $250-700/mo |
| **Grand Total** | | **$358-885/mo** |

**vs. Human equivalent:** 1-2 scheduling coordinators in Boulder = $3,500-7,000/mo. ROI is clear.
**The 1:10 leverage:** 7 AI agents + 1 operations person replaces the 10-person back-office of a traditional agency. This enables the 80% caregiver return ratio (vs. 40-60% at PE agencies).

### Cost Optimization

- **Prompt caching:** Cache hits cost 10% of standard input. System prompts and matching algorithm descriptions cached.
- **Batch API:** 50% discount for non-urgent operations (nudges, weekly compliance scans, report generation).
- **Model routing:** Haiku for simple tasks, Sonnet for reasoning, Opus only for compliance.

### Agent-to-Agent Communication: MCP + A2A

The industry has converged on two protocols:

- **MCP (Model Context Protocol)** — How agents connect to tools/data (vertical). 97M+ monthly SDK downloads. Now under Linux Foundation's Agentic AI Foundation.
- **A2A (Agent-to-Agent Protocol)** — How agents discover and talk to each other (horizontal). Released by Google April 2025, 150+ backers.

**Real-world coordination example:**
1. Caregiver calls in sick → enters Scheduling Agent
2. Scheduling Agent scores replacements, selects top candidate
3. Scheduling Agent → (A2A) → Communication Agent: "Notify caregiver X about Tuesday shift"
4. Communication Agent sends SMS, waits for response
5. Communication Agent → (A2A) → Scheduling Agent: "Caregiver X accepted"
6. Scheduling Agent → (A2A) → Billing Agent: "Update billing for shift reassignment"
7. Billing Agent adjusts TimeBank credits (0.9/0.1 split for new caregiver)
8. Scheduling Agent → (A2A) → Communication Agent: "Notify family of caregiver change"

All of this happens in under 5 minutes with zero human coordination.

---

## Part 3: Smart Contracts — What We Build in Year 2

### Why Wait?

At 50 members, PostgreSQL with audit logs provides the same trust guarantees as a blockchain. The blockchain advantages (tamper-proof balances, automatic expiry, transparent Respite Fund, portable credits across cities) only matter at scale.

**Build smart contracts when:**
- co-op.care expands beyond Boulder (credits need to be portable)
- Member count exceeds 200 (trust in the coordinator diminishes)
- A tokenized patronage dividend system becomes legally viable

### The Key Discovery: ERC-7818 (Expirable ERC-20)

Proposed November 2024, this Ethereum standard is purpose-built for co-op.care's time credits:

- Tokens assigned to **epochs** (time windows). Set epoch = 30 days, validity = 12 epochs → 12-month auto-expiry.
- **Lazy expiration** — no cron jobs. Expired tokens return 0 balance automatically.
- **FIFO enforcement** — oldest credits spent first, built into the contract.
- **Post-expiration behavior** configurable: burn, freeze, or **reallocate to community pool** (= Respite Fund).
- Fully ERC-20 compatible. Standard wallets see a normal token.

**For co-op.care:** 1 token = 0.25 hours. 12-epoch validity. FIFO spending. Expired tokens auto-transfer to Respite Fund contract.

### Smart Contract Architecture

| Contract | Purpose | Complexity |
|----------|---------|------------|
| **CareHour.sol** | ERC-20 + ERC-7818 time credit token. 1 token = 0.25 hours. 12-month expiry. | Medium |
| **RespiteFund.sol** | Receives 10% of every task completion. Auto-approve ≤100 hrs. Governance vote for >100 hrs. Emergency multi-sig override. | Medium |
| **TaskAttestation.sol** | Accepts signed attestations from server (GPS-verified task completions). Triggers CareHour minting (90/10 split). | Low |
| **Governance.sol** | OpenZeppelin Governor for Respite Fund proposals >100 hrs. Annual budget votes. Service area decisions. | Medium |

### Gas Cost Reality

| Chain | Cost per ERC-20 Transfer | 200 tx/week | Annual |
|-------|--------------------------|-------------|--------|
| Ethereum Mainnet (avg) | ~$0.38 | $76/week | $3,952 |
| **Polygon PoS** | ~$0.002-0.05 | $0.40-10/week | **$21-520** |
| **Base** | ~$0.01 | $2/week | **$104** |
| Arbitrum | ~$0.05-0.30 | $10-60/week | $520-3,120 |

**Verdict:** Polygon or Base. Gas costs are negligible — $2-10/month even without batching.

### Hybrid Architecture: Off-Chain Ledger + On-Chain Settlement

The pragmatic approach that the entire DeFi industry has converged on:

1. **Off-chain (PostgreSQL):** GPS verification, time calculations, dispute resolution, task management — all high-frequency operations stay in the database.
2. **On-chain settlement:** Daily or weekly batch of all completed tasks posted as a Merkle root. Individual token mints for each caregiver.
3. **On-chain balances:** The ERC-7818 token contract reflects net balances. Credits minted on task completion; debits burn tokens when credits are redeemed.
4. **Merkle proof verification:** Any member can verify that on-chain balance matches off-chain transaction history.

### GPS Verification: Off-Chain Oracle

Zero-knowledge proofs of location exist in research but are not production-ready (694ms-2min per verification). The practical approach:

1. Caregiver's phone records GPS at check-in/check-out (existing system)
2. Server validates: coordinates within 0.25 miles, timestamps reasonable
3. Signed attestation hash posted on-chain: `hash(caregiver_id, family_id, check_in, check_out, verified=true)`
4. Smart contract accepts attestation, mints time credits

This is the standard Chainlink oracle pattern. Your server acts as the oracle. If you later want decentralization, require attestations from multiple sources (caregiver GPS + family confirmation + server = 2-of-3).

### Real-World Precedent: Grassroots Economics / Sarafu Network

The most relevant deployed system: 30,000+ users, 300,000+ transactions in Kenya. Community currencies for basic needs exchange. Runs on Bloxberg (Ethereum-based PoA). USSD-based (works on basic feature phones). RCT data shows $30 CIC transfers associated with $93.51 increase in wallet balance and 22% average income increase. Partners: Kenya Red Cross, UNICEF, WFP.

**What co-op.care learns:** Community currencies on blockchain work at scale. The USSD-first/SMS-first access pattern is critical — caregivers should never need to interact with a crypto wallet directly.

---

## Part 4: DAO Governance — What We Layer In Gradually

### The Opolis Model: Progressive Decentralization

Opolis (Boulder-based, Colorado LCA) is the closest analog. They run traditional board governance day-to-day and gradually introduce DAO tooling as they scale. They plan quadratic voting at 1,000 members, not at 50.

**co-op.care should follow this exact playbook.**

### Opolis Employment Commons Integration (Codified)

Each co-op.care caregiver operates as a **"Business of One"** — incorporating as an S-Corp or C-Corp with their own EIN. Opolis serves as the Employer of Record (EoR), handling W-2 payroll, benefits administration, and employment taxes. The financial model:

| Item | Cost | Frequency |
|------|------|-----------|
| Opolis Lifetime Access | $97 | **One-time** |
| Common Stock Share | $20 | **One-time** |
| Community Fee | 1% of payroll | Per paycheck |
| **Total onboarding cost** | **$117** | **Per caregiver, once** |

Each caregiver gets two bank accounts: a **Funding Account** (receives gross revenue from co-op.care) and a **Paycheck Account** (receives W-2 net wages after deductions). The CareOS→Opolis data pipeline uses **Fernet encryption** for HIPAA compliance.

**DEO (Decentralized Employment Organization):** At scale, co-op.care registers as a self-governing DEO within the Opolis Commons — setting its own internal parameters (minimum hourly rate, weekly hour caps, respite fund %) while adhering to Commons-wide rules (1% community fee, EoR compliance). Governance via $WORK token (ERC-20 on Ethereum Mainnet, bridged to Polygon for low gas). Non-crypto-native caregivers use **Magic wallets** (email-based, no seed phrases). Full details codified in `opolis.types.ts`.

### Phase 1: Launch (0-50 members) — Minimum Viable Governance

| Tool | Purpose | Cost | Setup |
|------|---------|------|-------|
| **Gnosis Safe (3-of-5 multisig)** | Treasury management. Any expenditure >$500 needs 3/5 board approvals on-chain. | Free (gas only) | 1 hour |
| **Snapshot** | Major decisions only (annual budget, service area expansion, pricing). 3-5 votes/year. | Free | 2-3 hours |
| **Internal app voting** | Routine operations (new caregiver admission, scheduling). No blockchain needed. | Free | Already built |

**What this gives you:** Transparent, auditable, tamper-proof treasury. Democratic input on strategy. Zero crypto-wallet requirements for caregivers (only 5 board members need wallets). A credibility story for investors.

### Phase 2: Growth (50-200 members)

- Snapshot for quarterly member polls (benefits priorities, satisfaction surveys)
- Separate Snapshot spaces per stakeholder class (caregivers, care recipients, families)
- Consider DAOhaus if on-chain governance records are needed

### Phase 3: Scale (200+ members)

- Quadratic voting for multi-option allocation decisions
- Delegation (members delegate votes to trusted representatives)
- Full on-chain governance (Aragon OSx or Tally) if governance becomes a bottleneck
- AI-augmented governance (proposal summarization, impact analysis)

### Multi-Stakeholder Board Structure

co-op.care has three stakeholder classes, following the Quebec solidarity cooperative model:

| Class | Board Seats | Voting Power | Elected By |
|-------|-------------|-------------|------------|
| Caregivers (workers) | 3 | 43% | Caregiver members only |
| Care recipients (consumers) | 2 | 29% | Active care recipient members |
| Family/supporters | 1 | 14% | Family and community supporters |
| At-large/independent | 1 | 14% | Appointed by other 6 for expertise |
| **Total** | **7** | **100%** | Workers + consumers = 72% (satisfies LCA patron majority) |

### Legal Foundation: Colorado LCA

Colorado Limited Cooperative Association (CULCA) is the clear legal structure:
- Two membership classes: patron (caregivers + care recipients) and investor (outside capital)
- Patron members protected: majority of board elected exclusively by patrons
- Explicitly compatible with DAO governance tools (per Jason Wiener p.c. analysis)
- Colorado is the "Delaware of cooperative law"
- Opolis validates the model (Colorado LCA + $WORK tokens + progressive decentralization)

**Key contact:** Jason Wiener p.c. (Boulder/Denver) — info@jrwiener.com — the leading cooperative-DAO attorney in Colorado.

### What NOT to Do

- **Do NOT issue governance tokens with financial value** — securities risk (Howey Test), unnecessary complexity
- **Do NOT put routine care decisions on-chain** — emergency respite requests need answers in hours, not 3-7 day voting periods
- **Do NOT require caregivers to manage crypto wallets** — the UX barrier kills adoption
- **Do NOT build custom smart contract governance** — use OpenZeppelin Governor, don't reinvent

---

## Part 5: The Complete Build Sequence

### Phase 1: AI Agents (Months 1-4) — ~$350-870/mo operating cost

| Week | What | Framework | Agent |
|------|------|-----------|-------|
| 1-2 | MCP servers: PostgreSQL, Twilio, Calendar, Push | MCP SDK | Infrastructure |
| 3-4 | Scheduling Orchestrator MVP (match + offer + confirm) | LangGraph | Scheduling |
| 4-6 | Human-in-the-loop validation (30 days, manual override) | LangGraph | Scheduling |
| 4-8 | Sage Companion wired to real data (Galaxy Watch + care logs) | Claude Agent SDK | Sage |
| 6-10 | Shift Coordinator (coverage requests, confirmations, reminders) | Claude Agent SDK | Communication |
| 8-14 | Billing Agent (RPM tracking, CPT eligibility, CMS claims) | LangGraph | Billing |
| 12-18 | Compliance Monitor (CO AI Act, discrimination scanning, certs) | LangGraph | Compliance |
| 16-18 | A2A orchestration (sick call → scheduling → comms → billing chain) | A2A Protocol | All |

### Phase 2: DAO Governance Foundation (Months 4-8) — Near-zero cost

| Month | What | Tool |
|-------|------|------|
| 4 | Gnosis Safe treasury (3-of-5 multisig on Polygon) | Safe |
| 5 | Snapshot space for annual budget vote | Snapshot |
| 6 | Multi-stakeholder Snapshot spaces (caregiver, recipient, family) | Snapshot |
| 8 | First formal governance vote (service area expansion) | Snapshot |

### Phase 3: Smart Contracts (Months 12-18) — $20-45K development

| Month | What | Contract |
|-------|------|----------|
| 12 | CareHour.sol — ERC-20 + ERC-7818 expirable time credit token | Token |
| 13 | TaskAttestation.sol — server oracle → token minting (90/10 split) | Oracle |
| 14 | RespiteFund.sol — auto-collection, auto-approve ≤100hrs, governance >100hrs | Treasury |
| 15 | Audit + testnet deployment | Security |
| 16 | Mainnet deployment (Polygon or Base) | Production |
| 18 | Tokenized patronage dividends (smart contract auto-calculation) | Dividends |

### Phase 4: Full Integration (Months 18-24)

| Month | What |
|-------|------|
| 18 | AI agents trigger smart contract transactions via signed attestations |
| 20 | Cross-city credit portability (multiple co-op.care instances, one token) |
| 22 | Quadratic voting for budget allocation (if 200+ members) |
| 24 | Cooperative-to-cooperative credit exchange (federation protocol) |

---

## Part 6: What I Can Build Today

Here is what's actionable in the CareOS codebase RIGHT NOW:

### Already Built (March 2026 Sessions)

**Wearable MCP Server (complete):**
- ✅ `loinc-codes.ts` — Multi-device wearable support (Galaxy Watch primary), 10 LOINC metrics, Samsung Health keys, RPM CPT codes, device profiles
- ✅ `wearable-server.ts` — MCP server with 6 tools + 4 resources
- ✅ `wearable-types.ts` — Full type definitions including `BillingEligibility` (RPM + PIN + CHI + CCM)
- ✅ `wearable-tools.ts` — Tool implementations with Aidbox FHIR queries, billing framework awareness, full revenue stack surfacing in `getDeviceStatus()` and `getCareContext()`

**CMS Revenue Taxonomy (complete):**
- ✅ `billing-codes.ts` — Complete 10-layer revenue stack: PIN (G0023/G0024), CHI (G0019/G0022), CCM (99490/99491), RPM (99453-99470), ACCESS Model, PACE sub-capitation, assessment billing, home care rates, employer B2B, LMN config. Includes `calculateMaxMonthlyRevenue()` showing PIN+CHI+CCM+RPM = ~$481/patient/month.

**Strategic Integration Types (complete):**
- ✅ `opolis.types.ts` — Full Opolis Employment Commons integration: "Business of One" model (each caregiver incorporates as S-Corp/C-Corp), $97 one-time lifetime access + $20 common stock share + 1% community fee, Funding/Paycheck dual-account banking, 8-step onboarding checklist, DEO self-governance config, $WORK streaming equity (real-time vesting → balance sheet asset), Cigna PPO access (20-50% savings vs exchange), Fernet encryption pipeline, Magic wallets, Coalition referral engine, quadratic voting at 1,000+ members, **CaptureTripleOutput** spec (single clock-in → FHIR Observation + CMS Billing Event + Opolis Payroll Instruction simultaneously)
- ✅ `nlp-pipeline.types.ts` — 5-stage NLP pipeline (Ambient Capture → Entity Extraction via GPT-4o-mini RAG → Omaha Mapping → Human Review → FHIR Generation), Colorado AI Act compliance types (`AIActImpactAssessment`)
- ✅ `federation.types.ts` — Technologies LLC vs Local Cooperative entities, Aidbox Multibox Multi-Tenancy, patronage dividends (IRS Subchapter T, 20% cash / 80% retained), member equity + vesting schedule, board governance (7 seats), `calculatePatronageDividend()` and `calculateRedemptionValue()` functions. **LCA Decision Framework:** LCA vs LLC comparison (6 dimensions), multi-stakeholder membership classes (patron_worker, patron_consumer, investor), Jason Wiener p.c. + Yev Muchnik contacts, CULCA statute compatibility with DAO governance
- ✅ `bch-integration.types.ts` — BCH Safe Graduation pilot (HL7 v2 ADT messages from Epic, 72-hour post-discharge window, A03 discharge trigger, eligibility criteria, high-risk ICD-10 prefixes, visit tracking, outcome measurement)
- ✅ `web3.types.ts` — CareHour token (ERC-7818, 1 token = 0.25 hrs, 12-month expiry, FIFO), TaskAttestation, RespiteFund, Governance contracts, Gnosis Safe config, Snapshot voting, Opolis $WORK bridge, hybrid off-chain/on-chain architecture, progressive decentralization roadmap (6 phases: centralized → federated), tokenized patronage dividends. **Web3+AI Safety Layer:** ClinicalOversightContract (smart contract safety gates, confidence floors, risk-score ceilings), AIAuditEntry (immutable on-chain audit trail, +68% auditability), MutualRiskPool (DAO-governed insurance for AI malpractice), ParametricInsurancePolicy (auto-trigger payouts on AI accuracy drops <92%), DisputeResolutionConfig (Kleros-style decentralized arbitration), ZKPVerificationConfig (4 zero-knowledge circuits: care protocol compliance, location proximity, model integrity, billing justification — all `status: research`)

**Network Intelligence & Community Growth (complete):**
- ✅ `network-intelligence.types.ts` — Happenstance.ai integration (MCP-enabled network search, $0 free tier), enzymatic growth model (the Community Care Flywheel with tooling at each stage), complete tooling ecosystem (17 tools mapped to philosophy: Happenstance, PostgreSQL, Aidbox, Opolis, Every.io, Claude Agent SDK, LangGraph, Twilio, SendGrid, Galaxy Watch, Health Connect, Gnosis Safe, Snapshot, Stripe, Cal.com, Squarespace, LangSmith), network growth projections (5 members = 12K contacts, 50 members = 30% Boulder coverage, 150 members = 76% coverage), viral onboarding flow (5 steps with Happenstance-enhanced personalized referrals), Happenstance use cases by role (Founder, Caregiver, Conductor, Partner)

**PostgreSQL Agentic Architecture (complete):**
- ✅ `postgres-agentic.types.ts` — PostgreSQL as the nervous system for all 7 AI agents. 17 LIVE SELECT subscriptions (real-time agent triggers for scheduling, wearables, billing, compliance, triage, business-of-one), 8 relation table definitions (4 existing + 4 proposed agentic edges: lives_near, discharged_to, monitors, billed_for), 6 complex graph intelligence queries (neighborhood traversal, cascade impact, discharge gap detection, burnout+CII correlation, RPM billing eligibility, full care network mapping), 7 CORM pipeline events (care_interaction_complete → triple output, CII alert, wearable reading, hospital discharge, credit expiry, condition change, referral bonus), 5 health system integration patterns (BCH, Galaxy Watch RPM, BCAAA, CMS ACCESS, TRU PACE)

**Business Rules (enhanced):**
- ✅ `business-rules.ts` — BRAND positioning (Community Care Utility + Multi-Agent Coordination Utility, 80% caregiver return ratio, paradigm shift from user-pull to agentic-push), **AGENTIC_MEMORY** (context-as-moat, 8 knowledge categories, switching cost mechanism), REVENUE_STACK_PHASES (6-layer phased rollout with timing), PLACEMENT_AGENCY_BRIDGE ($870 registration, 1099→W-2 transition), COLORADO_FUNDING (75% Employee Ownership Tax Credit + $200K Skill Advance grant), CLINICAL_GOVERNANCE (Josh Emdur DO as Clinical Director, Medicare enrollment, CDPHE licensing), PARTNERSHIPS (BCH, BVSD, Elevations + banking, TRU PACE, Every.io, **BCAAA** CII referral engine), ROADMAP_90_DAY (Phase 1 + 1B + 2 + 3 through July 2026 ACCESS Model launch)

**Viral Sharing System (complete — 7 new files + 10 integrations):**
- ✅ `share-templates.ts` — 8 share categories (referral, gratitude, streak milestone, onboarding invite, community impact, assessment tool, comfort card, general invite), 7 social channels (SMS, Email, WhatsApp, Facebook, X/Twitter, LinkedIn, Copy Link), HIPAA-safe message templates (NO PHI — only aggregate stats, streak counts, task types)
- ✅ `shareStore.ts` — Zustand store for modal state, dismissed banners (localStorage persistence), share event tracking
- ✅ `useShare.ts` — Web Share API (mobile-native) with fallback to ShareModal on desktop, social URL builders for all 7 channels, clipboard copy, referral code attribution (`?ref=USER_CODE`)
- ✅ `ShareButton.tsx` — Reusable trigger component (`inline` text link or `pill` rounded CTA variant), wired to useShare hook
- ✅ `ShareModal.tsx` — 7-channel grid modal (lazy-loaded via `React.lazy()` — not in main bundle, code-split to 6.59 kB chunk), message preview, URL preview, copy-with-feedback
- ✅ `InviteBanner.tsx` — Dismissible banner for page tops (3 color variants: sage/copper/gold), dismissal persisted in localStorage
- ✅ `MilestoneToast.tsx` — Celebration toast with embedded share CTA, auto-dismiss after 8 seconds, in-memory event queue
- ✅ **10 integration points:** AppShell (lazy ShareModal + MilestoneToastContainer), NavBar (invite button), GratitudeFlow (share on confirmation), OnboardingFlow (invite on completion with 5-hour bonus), StreakDashboard (milestone shares), ReferralFlow (expanded from 2 to 7 channels), ComfortCardLanding (hero + savings calculator CTAs), TimeBankCommunity (community impact share), CIIAssessment (promotes tool, never reveals score), CoopMembership (referral buttons replaced with ShareButton)
- **Viral growth thesis:** Every share URL includes `?ref=USER_CODE` for attribution. Each share targets public marketing pages, never authenticated content. Combined with Happenstance.ai network search, every member becomes a growth engine — their personal contacts (avg 2,400 per person) become co-op.care's addressable market.

**Clinical Governance Model:**
- **Clinical Director:** Josh Emdur, DO — BCH hospitalist, licensed in all 50 states, provides clinical oversight for AI agent decisions
- **Role in architecture:** Every AI agent decision with clinical implications (triage alerts, medication reminders, discharge follow-ups, RPM anomaly responses) routes through Clinical Director review queue before action
- **Regulatory coverage:** Josh's medical license enables: Medicare/Medicaid enrollment, CDPHE licensing compliance, CMS ACCESS Model physician supervision requirements, RPM physician oversight (99457/99458 supervision)
- **AI Safety Layer:** `ClinicalOversightContract` in web3.types.ts defines smart contract safety gates — confidence floors, risk-score ceilings, mandatory human-in-the-loop for high-risk decisions
- **CDPHE Class B → Class A pathway:** Start with companion care (Class B, no medical license needed), expand to personal care + medical home care (Class A, requires Josh's supervision)

**CareOS Platform (95+ modules):**
- ✅ Full feature set across TimeBank, ACP, assessments, onboarding, billing, conductor, notifications, sharing/viral loops

### Building Next
- 🔨 Wire Sage AI to MCP wearable server (real health data in conversations)
- 🔨 MCP servers for PostgreSQL, Twilio, Calendar (agent infrastructure)
- 🔨 LangGraph scheduling orchestrator skeleton
- 🔨 NLP pipeline implementation (ambient voice → Omaha coding)

### Needs External Setup First
- Gnosis Safe on Polygon (1 hour, needs board member wallet addresses)
- Snapshot space (2-3 hours, needs ENS name or custom space)
- Smart contracts (Month 12+, needs audit budget)
- BCH HL7 v2 ADT webhook endpoint (needs BCH IT coordination)

---

## Part 7: The Story — Why This Order Matters

**Today:** co-op.care is a companion care cooperative with a sophisticated TimeBank, wearable health monitoring (Galaxy Watch → MCP → Sage AI), and zero automation. Every scheduling decision, every family check-in, every billing calculation requires human effort.

**Month 4:** AI agents handle scheduling, communication, billing, and compliance autonomously. The Scheduling Agent replaces a $5,000/mo coordinator. Sage gives families real-time health context. The Billing Agent captures RPM revenue that would otherwise be missed. The Compliance Agent keeps co-op.care ahead of the Colorado AI Act deadline.

**Month 8:** DAO governance adds transparent treasury management and democratic decision-making. Members can verify every expenditure on-chain. Major decisions go through Snapshot voting with stakeholder-class weighting.

**Month 18:** Smart contracts make the TimeBank trustless. Credits are tamper-proof, expiry is automatic, the Respite Fund is transparent. Patronage dividends are calculated and distributed by smart contract. When co-op.care replicates to Denver, credits work across both cities instantly.

**Month 24:** The full stack — AI agents orchestrating care operations, smart contracts managing the economic layer, DAO governance ensuring democratic control. A worker-owned, AI-augmented, blockchain-transparent cooperative care system.

**The key insight:** Each layer builds on the previous one. AI agents need data (MCP servers). Smart contracts need operations (AI agents generating transactions). DAO governance needs scale (smart contracts enabling federation). You can't skip ahead.

---

## Honest Assessment

| Decision | Confidence | Risk |
|----------|-----------|------|
| AI agents first | HIGH | Proven frameworks (LangGraph, Claude SDK), clear ROI |
| Gnosis Safe for treasury | HIGH | 1-hour setup, near-zero cost, immediate trust signal |
| Colorado LCA structure | HIGH | Opolis validates, Jason Wiener is local, statute is clear |
| ERC-7818 for time credits | MEDIUM | Standard is new (Nov 2024), may evolve. Mitigated by building database-first |
| Polygon/Base for chain | MEDIUM | Both viable. Base has Coinbase ecosystem; Polygon has broader DeFi/healthcare adoption |
| Full on-chain governance | LOW priority | Over-engineered at 50 members. Revisit at 200+ |
| Cross-city federation | SPECULATIVE | Requires multiple co-op.care instances. Year 3+ at earliest |

---

## References

### Smart Contracts & Time Banking
- [EIP-7818: Expirable ERC-20](https://eips.ethereum.org/EIPS/eip-7818)
- [BIT: Blockchain Integrated Timebanking (IEEE 2020)](https://ieeexplore.ieee.org/document/9239045/)
- [Mobile Time-Banking on Blockchain for Elderly Care (PMC 2022)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8923103/)
- [Grassroots Economics / Sarafu Network](https://www.grassrootseconomics.org/sarafu-network)
- [Grassroots Economics 2025 Study Results](https://grassecon.substack.com/p/2025-sarafu-network-study-results)

### DAO Governance
- [DAOhaus (Moloch v3)](https://daohaus.club/)
- [Snapshot DAO Tool Report 2025](https://daotimes.com/snapshot-dao-tool-report-for-2025/)
- [Opolis DAO Coop White Paper](https://opolis.co/wp-content/uploads/2024/02/Opolis_-_DAO_Coop_White_Paper.pdf)
- [Opolis Bylaws](https://opolis.co/bylaws/)
- [Jason Wiener p.c. — Cooperative-DAO Law](https://jrwiener.com/)
- [a16z — How to Pick a DAO Legal Entity](https://a16zcrypto.com/posts/article/dao-legal-entity-how-to-pick/)
- [DAO for Collaborative Housing (Frontiers 2025)](https://www.frontiersin.org/journals/blockchain/articles/10.3389/fbloc.2025.1523951/full)

### AI Agents
- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Building Agents with Claude Agent SDK (Anthropic)](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [LangGraph vs CrewAI vs AutoGen (DataCamp)](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)
- [AI for Scheduling in Home Care (AxisCare)](https://axiscare.com/blog/using-ai-for-scheduling-in-home-care/)
- [Amazon Connect Health Launch (TechCrunch, Mar 2026)](https://techcrunch.com/2026/03/05/aws-amazon-connect-health-ai-agent-platform-health-care-providers/)

### Protocols
- [MCP: A Year of Growth (Pento 2025)](https://www.pento.ai/blog/a-year-of-mcp-2025-review)
- [A2A Protocol (Google)](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)

### RPM Billing
- [2026 RPM CPT Code Updates (Tellihealth)](https://tellihealth.com/resources/2026-rpm-cpt-code-updates)
- [CMS: AI Does NOT Count for Interactive Communication](https://blog.prevounce.com/2026-remote-patient-monitoring-cpt-codes-whats-new-and-what-to-know)

### Colorado AI Act
- [SB24-205 Compliance Guide (ALM)](https://almcorp.com/blog/colorado-ai-act-sb-205-compliance-guide/)
- [Colorado AI Act Overview (LogicGate)](https://www.logicgate.com/blog/colorado-ai-act-everything-you-need-to-know/)

### Costs
- [Claude API Pricing (Official)](https://platform.claude.com/docs/en/about-claude/pricing)
- [Polygon vs Ethereum Gas Statistics](https://coinlaw.io/polygon-vs-ethereum-statistics/)
