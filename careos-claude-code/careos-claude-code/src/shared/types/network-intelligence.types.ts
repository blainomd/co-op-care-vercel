/**
 * Network Intelligence & Community Growth Engine
 *
 * "Clever behavioral economics matched with enzymatic community
 * involvement and real economic potential. We leverage everything
 * the community already has to do it all better."
 *    — co-op.care Synthesis Matrix, The Grand Unification
 *
 * PHILOSOPHY:
 * ──────────
 * An enzyme lowers activation energy. In chemistry, reactions that
 * would take millennia happen in milliseconds with the right catalyst.
 *
 * co-op.care's growth engine works the same way:
 *   - Finding a physician for Clinical Director = HIGH activation energy cold
 *   - Finding a physician through a 2nd-degree LinkedIn connection = NEAR ZERO
 *   - Recruiting a caregiver through job boards = $2,000 CAC, 77% turnover
 *   - Recruiting a caregiver through a neighbor who loves the co-op = $0 CAC, <15% turnover
 *
 * Happenstance.ai is the enzyme. It surfaces trust paths that already
 * exist in the community's collective network — making the invisible visible.
 *
 * THE WIN-WIN COMPOUNDING LOOP:
 * ─────────────────────────────
 * 1. Member joins co-op.care → connects Happenstance (Gmail, Calendar, LinkedIn, socials)
 * 2. Their network becomes searchable by the cooperative's growth agents
 * 3. Warm introductions surface: "Your neighbor Sarah knows a home care aide named Maria"
 * 4. Maria joins → connects her own Happenstance → adds 800+ contacts to the graph
 * 5. Maria's network reveals a path to a BCH discharge planner → partnership conversation
 * 6. Both parties win: Maria gets $25-28/hr W-2 + equity. Sarah gets 5 bonus hours.
 *    The family gets care. The cooperative grows. The graph deepens.
 *
 * This is the "allowance for magic to happen" — serendipitous connections
 * that emerge from the collective trust graph. You can't plan them.
 * You can only CREATE THE CONDITIONS for them to appear.
 *
 * PRIVACY:
 * ────────
 * Happenstance explicitly states: "We never share, sell, or use your data
 * to train AI models." Each member controls their own connected accounts.
 * The cooperative SEARCHES the collective graph — it doesn't OWN it.
 * Members can disconnect at any time. This aligns with co-op.care's
 * principle: "Communities should decide how AI is used, through
 * cooperative ownership and democratic governance."
 */

// ============================================================
// HAPPENSTANCE INTEGRATION
// ============================================================
// Happenstance.ai: AI-powered network search platform
// Free tier (unlimited searches), Pro $30/mo (unlimited results, CSV, email agent)
// CRITICAL: Has native MCP integration → plugs directly into Claude Agent SDK
// API: Search (find people) + Research (profile enrichment)
// Connected sources: Gmail, Google Calendar, Instagram, Twitter/X
// Team features: Slack bot (@happenstance), shared groups, centralized billing

export interface HappenstanceConfig {
  /** API endpoint */
  apiBase: 'https://api.happenstance.ai';
  /** MCP server for Claude Agent SDK integration */
  mcpEndpoint: 'happenstance-mcp';
  /** Pricing tier for the cooperative */
  tier: 'free' | 'pro' | 'team';
  /** Connected data sources per member */
  dataSources: HappenstanceDataSource[];
  /** Privacy commitment */
  dataPolicy: 'never_shared_or_sold_or_used_for_training';
}

export type HappenstanceDataSource =
  | 'gmail'
  | 'google_calendar'
  | 'instagram'
  | 'twitter'
  | 'linkedin'; // via profile enrichment

export interface HappenstanceSearch {
  /** Natural language query (the enzyme) */
  query: string;
  /** Which groups to search across */
  groups: string[];
  /** Example queries for co-op.care use cases */
  examples?: string[];
}

/**
 * How each co-op.care role uses Happenstance.
 * The key insight: it's not just for founders.
 * EVERY MEMBER becomes a recruiter, connector, and community builder.
 */
export const HAPPENSTANCE_USE_CASES = {
  /** Founding team — strategic relationship building */
  FOUNDER: {
    role: 'Founder / Operations',
    queries: [
      'Medicare-enrolled physician in Boulder who works with elderly patients',
      'BCH discharge planner or case manager in my 2nd-degree network',
      'BVSD HR director or employee wellness coordinator',
      'Home care agency owner considering selling or converting to cooperative',
      'Elevations Credit Union board member or community impact director',
      'Colorado DORA or CDPHE licensing specialist',
      'Impact investor interested in cooperative models or healthcare',
    ],
    value: 'Collapses 6-month cold outreach into warm introduction within days',
  },

  /** Caregiver worker-owners — peer recruitment + professional network */
  CAREGIVER: {
    role: 'Caregiver Worker-Owner',
    queries: [
      'CNA or home health aide looking for better pay in Boulder area',
      'Someone I know who is currently caregiving for an aging parent',
      'Nursing student or nursing program graduate in my network',
      'Bilingual caregiver who speaks Spanish in Boulder County',
      'Friend or contact who works at a care facility and might want better',
    ],
    value:
      'Each caregiver recruits from their OWN trusted network → $0 CAC, pre-vetted by social trust',
    viralIncentive: '5 Time Bank bonus hours for every referred member who completes first task',
  },

  /** Family Conductors — community building + care network expansion */
  CONDUCTOR: {
    role: 'Family Conductor (Alpha Daughter)',
    queries: [
      'Neighbor who might want to join a care exchange in my neighborhood',
      'Friend going through the same caregiving situation with aging parents',
      'Someone who could help with rides or meals near my parents house',
      'Other sandwich generation parents in my network dealing with eldercare',
      'Local business owner who might sponsor community care events',
    ],
    value:
      'Turns isolation into connection. The Alpha Daughter discovers she is not alone — her network is full of people in the same situation.',
    viralIncentive: '5 Time Bank bonus hours + "Community Builder" badge after 3 referrals',
  },

  /** Community partners — institutional relationship discovery */
  PARTNER: {
    role: 'Institutional Partner (BCH, BVSD, Elevations)',
    queries: [
      'Someone in my team who has used co-op.care or knows someone who has',
      'Former colleague now working in home care coordination',
      'Contact at CMS or Colorado Medicaid who would understand ACCESS Model',
    ],
    value:
      'Partners discover that co-op.care members are already embedded in their own organizations. The cooperative is not an outside vendor — it is the community they serve.',
  },
} as const;

// ============================================================
// THE ENZYMATIC GROWTH MODEL
// ============================================================
// From the Synthesis Matrix: The Catalyst → The Engine → The Output
//
// The Catalyst (Psychology):
//   Activation Energy + Proximity + Endowment Effect + Loss Aversion
//   + Self-Verification + Signaling + Goal Gradient + Viral Loop
//
// The Enzyme (Network Intelligence — NEW):
//   Happenstance surfaces the trust paths that lower activation energy.
//   You don't cold-email a doctor. You ask your network "who knows
//   a physician in Boulder?" and discover your college roommate's
//   spouse is a BCH hospitalist.
//
// The Engine (Product):
//   Discharge Concierge + Respite Fund + Time Bank + LMN Marketplace
//   + Annual Renewal + Wearable Integration + Predictive Model + Conductor Cert
//
// The Output (Macro):
//   $0 CAC + 28-36% Tax Savings + >90% Retention + <15% Turnover
//   + $364K Y1 Revenue + $1.25M PACE Margin + The Care UBI

export interface EnzymaticGrowthPhase {
  /** Phase name */
  name: string;
  /** What the enzyme (Happenstance + network tools) unlocks */
  enzymeAction: string;
  /** Behavioral psychology principle at work */
  psychologyPrinciple: string;
  /** Product feature activated */
  productFeature: string;
  /** Macro outcome */
  macroOutcome: string;
  /** Tools involved */
  tools: ToolId[];
}

export type ToolId =
  | 'happenstance'
  | 'postgresql'
  | 'aidbox'
  | 'opolis'
  | 'every_io'
  | 'twilio'
  | 'claude_agent_sdk'
  | 'langgraph'
  | 'gnosis_safe'
  | 'snapshot'
  | 'galaxy_watch'
  | 'health_connect'
  | 'stripe'
  | 'squarespace'
  | 'sendgrid'
  | 'langsmith'
  | 'cal_com';

/**
 * The Community Care Flywheel — now with enzymatic tooling.
 *
 * Five stages, each with specific tools that catalyze the transition:
 *   1. The People (Conductors) → 2. The Skills (Time Bank) →
 *   3. The Wellness (LMN/HSA) → 4. The Business (W-2 professionals) →
 *   5. The System (PACE/hospitals) → loops back to 1
 */
export const COMMUNITY_CARE_FLYWHEEL: readonly EnzymaticGrowthPhase[] = [
  {
    name: '1. The People — Conductors Empowered',
    enzymeAction:
      'Happenstance reveals other caregivers in each new member\'s network. "You know 12 people currently managing eldercare." Isolation transforms into community overnight.',
    psychologyPrinciple:
      'Propinquity + Activation Energy — discovering existing connections lowers the barrier to first action from "cold stranger" to "friend of a friend"',
    productFeature:
      'Comfort Card onboarding → CII-12 assessment → network scan → personalized "People You Know" care circle',
    macroOutcome:
      '$0 customer acquisition cost — each family brings their own network into the cooperative',
    tools: ['happenstance', 'postgresql', 'twilio', 'stripe'],
  },
  {
    name: '2. The Skills — Time Bank Liquidity',
    enzymeAction:
      'Happenstance + PostgreSQL graph: when a family needs respite, the system searches BOTH the Time Bank (existing members) AND the member\'s extended network for potential new helpers. "Your neighbor\'s friend Karen is a retired nurse — would you like to invite her?"',
    psychologyPrinciple:
      'Endowment Effect — the 40-hour membership floor creates wealth framing. Network search amplifies it: "You have 40 hours AND access to 147 potential helpers nearby."',
    productFeature:
      'Time Bank matching + Happenstance "Find a Helper" search embedded in task creation flow',
    macroOutcome:
      'Massive zero-cost labor liquidity — the neighborhood becomes a staffing pool no agency can replicate',
    tools: ['happenstance', 'postgresql', 'claude_agent_sdk', 'twilio'],
  },
  {
    name: '3. The Wellness — HSA/FSA Activation',
    enzymeAction:
      'Happenstance Research API enriches member profiles to identify employer benefits eligibility. "Your employer offers HSA with $3,650 contribution — you could save $1,277/year on care."',
    psychologyPrinciple:
      'Loss Aversion — "Without your LMN, you lose $6,200/year in tax savings." Network discovery amplifies: "3 people in your network at the same employer could also save."',
    productFeature:
      'LMN generation (Josh Emdur DO signs) + employer benefits discovery + group enrollment',
    macroOutcome: '28-36% family cost reduction + employer benefit revenue ($3-6/employee/month)',
    tools: ['happenstance', 'aidbox', 'every_io', 'stripe'],
  },
  {
    name: '4. The Business — W-2 Cooperative Professionals',
    enzymeAction:
      "Every caregiver who joins connects Happenstance. The cooperative's COLLECTIVE network grows exponentially. After 5 caregivers, the combined search graph covers 4,000+ contacts. Finding the next caregiver becomes trivially easy.",
    psychologyPrinciple:
      'Self-Verification + Signaling — caregivers recruit peers because their identity is "worker-OWNER at a cooperative that pays $25-28/hr." The Happenstance search makes the ask specific: "Your friend Maria is a CNA at Sunrise — here\'s what she\'d earn here."',
    productFeature:
      'Opolis S-Corp formation + W-2 enrollment + Cigna PPO benefits + equity vesting via streaming $WORK',
    macroOutcome:
      '<15% turnover (structural). 80% caregiver return ratio. The cooperative model IS the recruiting message.',
    tools: ['happenstance', 'opolis', 'every_io', 'postgresql', 'claude_agent_sdk'],
  },
  {
    name: '5. The System — Institutional Partnerships',
    enzymeAction:
      'Happenstance reveals warm paths to institutional decision-makers. Not "cold email Robert Vissers at BCH" but "your caregiver\'s neighbor is a BCH discharge planner — she can introduce you." The cooperative\'s graph includes EVERYONE\'s professional network.',
    psychologyPrinciple:
      'Goal Gradient + Cascade — as partnerships form, each new institution adds its network to the searchable graph. BCH employees join as families. Their networks reveal paths to BVSD, Elevations, TRU PACE.',
    productFeature:
      'BCH ADT integration + BVSD employer benefit + Elevations Care Card + CMS ACCESS enrollment',
    macroOutcome: '$364K Y1 revenue (BCH). $1.25M PACE margin. The system pays for the whole loop.',
    tools: ['happenstance', 'aidbox', 'postgresql', 'langgraph', 'gnosis_safe'],
  },
] as const;

// ============================================================
// COMPLETE TOOLING ECOSYSTEM
// ============================================================
// Every tool mapped to co-op.care's philosophy:
//   "AI should serve humanity — not replace it."
//   "Communities should decide at scale how AI is used."
//   "The moat is community embeddedness, not technology."

export interface ToolDefinition {
  /** Tool identifier */
  id: ToolId;
  /** Tool name */
  name: string;
  /** What it does for co-op.care */
  purpose: string;
  /** Which philosophical principle it serves */
  philosophicalAlignment: string;
  /** Monthly cost estimate */
  monthlyCostEstimate: string;
  /** Integration method */
  integrationMethod: 'mcp_server' | 'api' | 'sdk' | 'webhook' | 'manual' | 'embedded';
  /** Which agents use this tool */
  usedByAgents: string[];
  /** How it enables win-win */
  winWinMechanism: string;
}

export const TOOLING_ECOSYSTEM: readonly ToolDefinition[] = [
  // ── Network Intelligence Layer ────────────────────────────
  {
    id: 'happenstance',
    name: 'Happenstance.ai',
    purpose:
      "AI-powered network search — turns every member's personal network into a cooperative growth engine",
    philosophicalAlignment:
      'The enzyme. Lowers activation energy for every connection. Makes the invisible community visible. Enables the "allowance for magic" — serendipitous connections that emerge from the collective trust graph.',
    monthlyCostEstimate: '$0 (free tier) → $30/mo (Pro) → Team pricing at scale',
    integrationMethod: 'mcp_server',
    usedByAgents: ['Business-of-One Agent', 'Network Intelligence (future Agent 8)'],
    winWinMechanism:
      'Member finds a friend to join → friend gets $25-28/hr job + equity. Member gets 5 bonus hours. Cooperative grows. Graph deepens. More magic emerges.',
  },

  // ── Data & Agent Infrastructure ───────────────────────────
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    purpose:
      'Agentic nervous system — JSONB documents + relation tables for graph + PostGIS geospatial + LISTEN/NOTIFY + triggers, aligned with Aidbox FHIR server',
    philosophicalAlignment:
      'One system, one HIPAA audit, one backup. Shared substrate with Aidbox (Health Samurai runs on PostgreSQL natively). Democratic data — the cooperative owns its own database.',
    monthlyCostEstimate: '$20-50 (self-hosted on Fly.io or Railway)',
    integrationMethod: 'mcp_server',
    usedByAgents: ['All 7 agents — PostgreSQL is the shared substrate'],
    winWinMechanism:
      'Every care interaction captured once → routes to billing + FHIR + payroll simultaneously. Zero dropped revenue. Zero manual data entry. Caregiver focuses on care, not paperwork.',
  },
  {
    id: 'aidbox',
    name: 'Aidbox (Health Samurai)',
    purpose: 'FHIR R4 clinical data store — Multibox multi-tenancy for federated cooperatives',
    philosophicalAlignment:
      'FHIR R4 native from birth. No data hoarding. $1M federal penalties for blocking interoperability. Open standards = democratic data.',
    monthlyCostEstimate: '$0 initially (Pavel/friend), $200-500 at scale',
    integrationMethod: 'api',
    usedByAgents: ['Sage Companion', 'Billing Agent', 'Compliance Monitor'],
    winWinMechanism:
      'Patient data follows the patient, not the agency. When families leave (rarely), they take their records. When caregivers leave (rarely), the clinical context stays with the cooperative for continuity.',
  },

  // ── Employment & Benefits ─────────────────────────────────
  {
    id: 'opolis',
    name: 'Opolis Employment Commons',
    purpose:
      'Employer of Record — W-2 payroll, Cigna PPO benefits, $WORK streaming equity, DEO governance',
    philosophicalAlignment:
      'Employment sovereignty. Each caregiver is a Business of One — they own their entity, they own their career. Opolis is infrastructure, not an employer. Colorado LCA + Opolis = cooperative employment that no PE firm controls.',
    monthlyCostEstimate: '$117 onboarding (one-time) + 1% community fee per payroll',
    integrationMethod: 'api',
    usedByAgents: ['Business-of-One Agent', 'Billing Agent'],
    winWinMechanism:
      'Caregiver gets W-2 stability + Cigna PPO (20-50% savings vs exchange) + streaming equity. Co-op gets compliant employment infrastructure. Opolis grows its Commons. All three win.',
  },
  {
    id: 'every_io',
    name: 'Every.io',
    purpose:
      'All-in-one back office — banking, bookkeeping, payroll, taxes for the cooperative entity',
    philosophicalAlignment:
      'Cooperative financial transparency. Books open to members. Every dollar tracked. Democratic treasury management.',
    monthlyCostEstimate: 'TBD (Nick Harvalis sharing deck + pricing)',
    integrationMethod: 'api',
    usedByAgents: ['Business-of-One Agent', 'Compliance Monitor'],
    winWinMechanism:
      'Cooperative gets professional financial infrastructure without hiring a CFO. Every.io gets a growing cooperative client. Members get transparent, auditable finances.',
  },

  // ── AI Agent Frameworks ───────────────────────────────────
  {
    id: 'claude_agent_sdk',
    name: 'Claude Agent SDK (Anthropic)',
    purpose:
      'Agent framework for Sage Companion, Shift Coordinator, Triage Agent, Business-of-One Agent',
    philosophicalAlignment:
      'AI serves humanity. The agents handle scheduling, billing, compliance — the PAPERWORK — so caregivers can focus on the CARE. Democratic AI: the cooperative decides what agents do.',
    monthlyCostEstimate: '$108-185 total API costs across all 7 agents',
    integrationMethod: 'sdk',
    usedByAgents: ['Sage', 'Shift Coordinator', 'Triage', 'Business-of-One'],
    winWinMechanism:
      '1:10 leverage ratio. 7 agents + 1 operations person replaces 10-person PE agency back-office. The savings flow to caregivers as wages (80% return ratio), not to investors.',
  },
  {
    id: 'langgraph',
    name: 'LangGraph (LangChain)',
    purpose:
      'Stateful agent orchestration for Scheduling Orchestrator, Billing Agent, Compliance Monitor',
    philosophicalAlignment:
      'Complex multi-step reasoning with human-in-the-loop gates. Every consequential decision has a human checkpoint.',
    monthlyCostEstimate: 'Included in Claude API costs',
    integrationMethod: 'sdk',
    usedByAgents: ['Scheduling Orchestrator', 'Billing Agent', 'Compliance Monitor'],
    winWinMechanism:
      'Scheduling Agent replaces $5,000/mo coordinator. Family gets faster matching. Caregiver gets more predictable schedule. Cooperative saves $60K/year.',
  },

  // ── Communication ─────────────────────────────────────────
  {
    id: 'twilio',
    name: 'Twilio',
    purpose: 'SMS/voice for shift offers, confirmations, reminders, family notifications',
    philosophicalAlignment:
      'Meet people where they are. Caregivers and elderly families use SMS, not apps. No crypto wallet, no login, no download. A text message from a neighbor.',
    monthlyCostEstimate: '$50-150',
    integrationMethod: 'mcp_server',
    usedByAgents: ['Shift Coordinator', 'Scheduling Orchestrator', 'Triage Agent'],
    winWinMechanism:
      'Caregiver gets shift offer via text. Taps "Accept." Done. 15 seconds. No app download, no portal login. Family gets notified. Everyone wins.',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    purpose:
      'Transactional + marketing email — welcome sequences, LMN reminders, community updates',
    philosophicalAlignment:
      'Community communication. Updates feel like a neighbor writing, not a corporation marketing.',
    monthlyCostEstimate: '$15-50',
    integrationMethod: 'api',
    usedByAgents: ['Business-of-One Agent', 'Compliance Monitor'],
    winWinMechanism:
      'Families stay informed. Caregivers get certification reminders. Community grows through warm, human-sounding outreach.',
  },

  // ── Health & Wearable ─────────────────────────────────────
  {
    id: 'galaxy_watch',
    name: 'Samsung Galaxy Watch (via Health Data SDK)',
    purpose:
      'Primary wearable for continuous RPM data — heart rate, SpO2, sleep, activity, fall detection',
    philosophicalAlignment:
      "The neighborhood itself is a clinical asset. A Galaxy Watch on an elderly neighbor's wrist, monitored by a cooperative caregiver, is more effective than a hospital readmission.",
    monthlyCostEstimate: '$0 (hardware one-time cost to member)',
    integrationMethod: 'sdk',
    usedByAgents: ['Sage Companion', 'Billing Agent', 'Triage Agent'],
    winWinMechanism:
      'Patient gets continuous health monitoring. Family gets peace of mind. Co-op captures $139/mo RPM revenue per patient. Clinical Director fulfills incident-to oversight.',
  },
  {
    id: 'health_connect',
    name: 'Google Health Connect',
    purpose: 'Android standard API — bridges Galaxy Watch → co-op.care data pipeline',
    philosophicalAlignment:
      'Open standard. No vendor lock-in. Patient owns their data through an OS-level API, not a proprietary platform.',
    monthlyCostEstimate: '$0',
    integrationMethod: 'sdk',
    usedByAgents: ['Sage Companion'],
    winWinMechanism:
      'Patient controls permissions. Data flows only with consent. Open standard means any Android wearable works — not locked to one device.',
  },

  // ── Governance & Treasury ─────────────────────────────────
  {
    id: 'gnosis_safe',
    name: 'Gnosis Safe (3-of-5 multisig)',
    purpose: 'On-chain treasury management — any expenditure >$500 needs 3/5 board approvals',
    philosophicalAlignment:
      'Democratic treasury. Every dollar traceable on-chain. No single person controls the money. This IS cooperative governance in code.',
    monthlyCostEstimate: '$0 (gas only, negligible on Polygon)',
    integrationMethod: 'manual',
    usedByAgents: [],
    winWinMechanism:
      "Members trust the cooperative because they can verify every transaction. Board members can't misuse funds without 3/5 consensus. Transparency builds community confidence.",
  },
  {
    id: 'snapshot',
    name: 'Snapshot',
    purpose: 'Off-chain governance voting — annual budget, service expansion, pricing decisions',
    philosophicalAlignment:
      'One member, one vote. Democratic decision-making without gas costs. Multi-stakeholder spaces (caregivers, recipients, families) ensure no single class dominates.',
    monthlyCostEstimate: '$0',
    integrationMethod: 'manual',
    usedByAgents: [],
    winWinMechanism:
      'Caregivers vote on pay structure. Families vote on service priorities. Community decides collectively. This is what "communities should decide how AI is used" looks like in practice.',
  },

  // ── Payments & Commerce ───────────────────────────────────
  {
    id: 'stripe',
    name: 'Stripe',
    purpose:
      'Payment processing — membership fees, care plan subscriptions, Time Bank credit purchases',
    philosophicalAlignment:
      'Price transparency. $35/hr published. No hidden markups. Cooperative books open to members.',
    monthlyCostEstimate: '2.9% + $0.30 per transaction',
    integrationMethod: 'api',
    usedByAgents: ['Billing Agent'],
    winWinMechanism:
      'Families pay a transparent rate. 80% goes to caregiver. 10% to Respite Fund. 10% to cooperative operations. Every dollar accounted for.',
  },

  // ── Scheduling ────────────────────────────────────────────
  {
    id: 'cal_com',
    name: 'Cal.com (Open Source)',
    purpose:
      'Family consultation scheduling — initial assessments, care plan reviews, physician consultations',
    philosophicalAlignment:
      'Open source scheduling. No data lock-in. Self-hosted option for PHI-sensitive bookings.',
    monthlyCostEstimate: '$0 (self-hosted) or $12/mo (cloud)',
    integrationMethod: 'api',
    usedByAgents: ['Scheduling Orchestrator'],
    winWinMechanism:
      'Families book consultations without phone tag. Josh can review care plans on a predictable schedule. Open source means the cooperative owns its scheduling infrastructure.',
  },

  // ── Website & Marketing ───────────────────────────────────
  {
    id: 'squarespace',
    name: 'Squarespace',
    purpose: 'Public website — co-op.care landing, Comfort Card marketing, community stories',
    philosophicalAlignment:
      'Simple, beautiful, accessible. "Sound like a community organizer who understands healthcare finance, not a startup pitching an investor."',
    monthlyCostEstimate: '$16-33',
    integrationMethod: 'manual',
    usedByAgents: [],
    winWinMechanism:
      'The website tells human stories. "Maria delivered 86 hours of companionship this month." Not features. Not technology. People.',
  },

  // ── Observability ─────────────────────────────────────────
  {
    id: 'langsmith',
    name: 'LangSmith (LangChain)',
    purpose:
      'Agent observability — trace every AI decision, monitor accuracy, Colorado AI Act compliance',
    philosophicalAlignment:
      'Transparent AI. Every agent decision traceable. Required by Colorado AI Act (June 30, 2026). Democratic accountability: members can audit what the AI did and why.',
    monthlyCostEstimate: '$39-399 (depends on trace volume)',
    integrationMethod: 'sdk',
    usedByAgents: ['All agents (observability layer)'],
    winWinMechanism:
      'Regulators get compliance documentation. Members get AI transparency. Anthropic gets responsible AI deployment data. co-op.care gets regulatory safety.',
  },
] as const;

// ============================================================
// VIRAL NETWORK EFFECTS — The Math of Magic
// ============================================================
// Each member who connects Happenstance adds:
//   ~700 Gmail contacts + ~2,200 Calendar attendees + social followers
//   = ~3,000+ searchable connections per member
//
// At 5 founding caregivers: 15,000+ searchable connections
// At 20 families: 60,000+ searchable connections
// At 50 members: 150,000+ searchable connections
//
// Boulder County population: 330,000
// At 50 members, the cooperative's network covers ~45% of the county.
// Finding a warm introduction to ANYONE in Boulder becomes probable.
//
// This is the "allowance for magic" quantified.

export interface NetworkGrowthProjection {
  /** Number of connected members */
  memberCount: number;
  /** Estimated unique contacts in collective graph */
  estimatedContacts: number;
  /** Coverage of Boulder County population (330,000) */
  boulderCoveragePercent: number;
  /** What becomes possible at this network size */
  capabilityUnlocked: string;
}

export const NETWORK_GROWTH_PROJECTIONS: readonly NetworkGrowthProjection[] = [
  {
    memberCount: 1,
    estimatedContacts: 3000,
    boulderCoveragePercent: 1,
    capabilityUnlocked:
      'Founder can search own network for physician, BCH contacts, early families',
  },
  {
    memberCount: 5,
    estimatedContacts: 12000,
    boulderCoveragePercent: 4,
    capabilityUnlocked:
      'Founding caregiver cohort — collective network reveals paths to 2-3 institutional partners',
  },
  {
    memberCount: 20,
    estimatedContacts: 45000,
    boulderCoveragePercent: 14,
    capabilityUnlocked:
      'Community density: any new family request likely has a 2nd-degree connection in the graph. Cold outreach becomes unnecessary.',
  },
  {
    memberCount: 50,
    estimatedContacts: 100000,
    boulderCoveragePercent: 30,
    capabilityUnlocked:
      'Network saturation: finding a warm path to any professional, institution, or potential member in Boulder is near-certain. The cooperative IS the community graph.',
  },
  {
    memberCount: 150,
    estimatedContacts: 250000,
    boulderCoveragePercent: 76,
    capabilityUnlocked:
      "Full community coverage. The cooperative's network IS Boulder County. Every neighbor is a potential member, every institution a potential partner, every connection a potential pathway.",
  },
] as const;

// ============================================================
// MEMBER ONBOARDING: NETWORK ACTIVATION FLOW
// ============================================================
// When a new member joins, the enzymatic activation sequence:
//
// 1. Welcome → Comfort Card signup (Stripe)
// 2. CII-12 assessment (understand their care burden)
// 3. Time Bank profile (skills, availability, neighborhood)
// 4. Happenstance connect (Gmail + Calendar + social)
//   → System immediately shows: "You know 12 people who are caregiving"
//   → "3 neighbors within 1 mile are already members"
//   → "Would you like to invite Sarah? She's caring for her mother too."
// 5. First micro-task offer (<15 min, zero travel, zero skill)
//   → "Call Mr. Torres for 15 minutes" (from Time Bank)
// 6. After 3rd completed task: referral prompt
//   → Happenstance surfaces specific people to invite
//   → Not "share with friends" but "Maria in your contacts is a CNA — invite her?"
//
// The activation energy for EVERY STEP is lowered because
// Happenstance makes it personal, not generic.

export interface OnboardingNetworkStep {
  /** Step number */
  step: number;
  /** Action */
  action: string;
  /** How Happenstance enhances it */
  networkEnhancement: string;
  /** Behavioral psychology at work */
  psychology: string;
}

export const NETWORK_ONBOARDING_FLOW: readonly OnboardingNetworkStep[] = [
  {
    step: 1,
    action: 'Comfort Card signup + CII-12 assessment',
    networkEnhancement:
      'After assessment, Happenstance reveals: "You know X people in similar situations." Isolation → community in 30 seconds.',
    psychology: 'Activation Energy — the first step is DISCOVERING you are not alone',
  },
  {
    step: 2,
    action: 'Connect Happenstance (Gmail, Calendar, social)',
    networkEnhancement:
      'One-click OAuth. System immediately shows personalized "People You Know" dashboard. Not generic — YOUR neighbors, YOUR friends, YOUR colleagues.',
    psychology:
      'Propinquity — the closer the connection, the more likely the action. Happenstance sorts by relationship strength, not alphabetical.',
  },
  {
    step: 3,
    action: 'Time Bank profile + first micro-task',
    networkEnhancement:
      'Task matching uses both PostgreSQL (proximity, skills) AND Happenstance (existing relationship strength). "Help your actual neighbor" beats "help a stranger nearby."',
    psychology:
      'Endowment Effect — "You HAVE 40 hours of community care." + "You KNOW 8 people who could help." Wealth framing amplified by network visibility.',
  },
  {
    step: 4,
    action: 'After 3rd completed task: personalized referral',
    networkEnhancement:
      'Not "Share with friends" (generic, low conversion). Instead: "Maria Chen in your contacts is a CNA at Sunrise Senior Living. She could earn $25-28/hr as a worker-owner here. Send her a personal invite?"',
    psychology:
      'Cascade Effect — specific, personalized referrals convert 5-10x vs generic share buttons. The Happenstance search makes every referral a warm introduction.',
  },
  {
    step: 5,
    action: 'Community Builder milestone (3+ referrals)',
    networkEnhancement:
      'Member sees their cascade impact: "You invited Maria → Maria invited 2 friends → those friends have helped 4 families → your network has generated 47 hours of care." The PostgreSQL graph (helped→referred→assigned_to) visualized.',
    psychology:
      'Goal Gradient + Self-Verification — the member\'s identity shifts from "person managing care alone" to "community builder who created a care network"',
  },
] as const;

// ============================================================
// SUMMARY: THE COMPLETE STACK
// ============================================================

export const TOOLING_SUMMARY = {
  /** The thesis */
  thesis:
    'Every tool in the stack serves one purpose: lower the activation energy for human connection. Happenstance is the enzyme. PostgreSQL is the nervous system. Claude agents are the coordination layer. Opolis is the employment infrastructure. Together they enable the 80% caregiver return ratio and the Community Care Flywheel.',

  /** Tool count by category */
  categories: {
    networkIntelligence: ['happenstance'] as const,
    dataAndAgents: ['postgresql', 'aidbox', 'claude_agent_sdk', 'langgraph', 'langsmith'] as const,
    employment: ['opolis', 'every_io'] as const,
    communication: ['twilio', 'sendgrid'] as const,
    health: ['galaxy_watch', 'health_connect'] as const,
    governance: ['gnosis_safe', 'snapshot'] as const,
    commerce: ['stripe'] as const,
    scheduling: ['cal_com'] as const,
    web: ['squarespace'] as const,
  },

  /** Total monthly infrastructure cost (Phase 1) */
  totalMonthlyCost: {
    min: '$450',
    max: '$1,200',
    note: 'vs. 2 human coordinators at $7,000-14,000/month. The tools pay for themselves 10x over.',
  },

  /** The philosophical anchor */
  philosophy: {
    enzymatic:
      "Happenstance is the enzyme — it lowers activation energy for every connection in the cooperative. Finding a caregiver, a physician, a partner, a friend who understands. All of it becomes easier when you can search your community's collective trust graph.",
    magic:
      'The "allowance for magic" is not mystical — it\'s mathematical. At 50 connected members, the cooperative\'s network covers 30% of Boulder County. The probability that any two people in the community share a connection approaches certainty. Serendipity becomes inevitable when you create the conditions for it.',
    winWin:
      'Every interaction in the cooperative creates value for both parties. Caregiver helps family → earns hours + equity + rating + network effect. Family receives care → their loved one stays home + they save 28-36% + their network joins the cooperative. The graph deepens. More connections. More trust. More magic. This is what compounding community looks like.',
  },
} as const;
