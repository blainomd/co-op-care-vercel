/**
 * PostgreSQL as Agentic Nervous System
 *
 * PostgreSQL is not passive storage — it's the coordination substrate
 * that activates, connects, and orchestrates all 7 AI agents.
 *
 * Three capabilities make PostgreSQL well-suited to agentic care:
 *
 *   1. LIVE QUERIES (LIVE SELECT) — Real-time agent triggers
 *      The database pushes state changes TO agents, eliminating polling
 *      and middleware event buses. CII score enters Yellow Zone →
 *      Triage Agent fires in <1 second, not on a cron schedule.
 *
 *   2. GRAPH TRAVERSAL (Record Links + -> operator) — Neighborhood model
 *      The care cooperative IS a graph: caregivers → helped → families →
 *      live_near → neighbors → have_skills. PostgreSQL's relation tables model the
 *      queries traverse the entire social fabric in a single statement.
 *      "Find Spanish-speaking neighbors within 2 miles who helped this
 *      family before" is one query, not 5 SQL JOINs.
 *
 *   3. DEFINE EVENT — Capture Once Route Many (CORM) pipeline
 *      A single care_interaction record creation triggers 3 parallel
 *      downstream effects: FHIR Observation → Aidbox, CMS Billing Event
 *      → Claims Queue, Opolis Payroll Instruction → Funding Account.
 *      No separate orchestration layer needed.
 *
 * Architecture:
 *   Traditional: App → Event Bus → Agents → Database → Event Bus → ...
 *   co-op.care:  App → PostgreSQL ←→ Agents (direct, bidirectional)
 *
 * Health System Integration:
 *   PostgreSQL's agentic capabilities enable co-op.care to integrate
 *   into health systems through proactive agent work, not passive APIs:
 *     - BCH discharge ADT → LIVE SELECT triggers Scheduling Agent
 *     - Wearable anomaly → LIVE SELECT triggers Sage + Triage Agents
 *     - CMS billing threshold → LIVE SELECT triggers Billing Agent
 *     - Physician review queue → LIVE SELECT triggers Compliance Agent
 *
 *   The health system doesn't need to "integrate" with co-op.care.
 *   co-op.care's agents REACH INTO health system data flows via
 *   PostgreSQL triggers and FHIR outbox sync.
 */

// ============================================================
// LIVE QUERIES — Real-Time Agent Triggers
// ============================================================
// Each LIVE SELECT subscription maps to exactly one AI agent.
// The database pushes changes TO agents via LISTEN/NOTIFY — no polling, no middleware.
// This is the "agentic push" paradigm in action.

/**
 * Agent subscription — which agent listens to which data changes.
 * Each subscription defines a LIVE SELECT query that pushes matching
 * records to the agent's processing queue in real-time.
 */
export interface AgentLiveSubscription {
  /** Which AI agent receives the events */
  agentId: AgentId;
  /** Human-readable description of what this subscription watches */
  description: string;
  /** PostgreSQL table(s) being watched */
  tables: string[];
  /** The LIVE SELECT condition (SQL WHERE clause) */
  condition: string;
  /** What triggers the agent to act */
  triggerDescription: string;
  /** Expected latency from data change to agent activation */
  expectedLatencyMs: number;
  /** Whether this subscription requires the agent to respond immediately */
  realtime: boolean;
}

export type AgentId =
  | 'scheduling_orchestrator'
  | 'sage_companion'
  | 'shift_coordinator'
  | 'billing_timebank'
  | 'compliance_monitor'
  | 'triage_agent'
  | 'business_of_one';

/**
 * All 7 agents and their live subscriptions.
 *
 * The key architectural insight: PostgreSQL's LISTEN/NOTIFY eliminates
 * the need for Redis pub/sub, Kafka, or any separate event bus.
 * The database IS the event bus.
 */
export const AGENT_LIVE_SUBSCRIPTIONS: readonly AgentLiveSubscription[] = [
  // ── Agent 1: Scheduling Orchestrator ──────────────────────
  {
    agentId: 'scheduling_orchestrator',
    description: 'New shift requests and cancellations',
    tables: ['timebank_task'],
    condition: "status = 'open' OR status = 'cancelled'",
    triggerDescription: 'Task created or caregiver cancels → score + match + offer replacement',
    expectedLatencyMs: 500,
    realtime: true,
  },
  {
    agentId: 'scheduling_orchestrator',
    description: 'BCH discharge events (via outbox → FHIR ADT)',
    tables: ['outbox_event'],
    condition: "eventType = 'adt_discharge' AND status = 'pending'",
    triggerDescription:
      'Hospital discharge ADT A03 received → auto-create companion care task for post-discharge visit within 72 hours',
    expectedLatencyMs: 1000,
    realtime: true,
  },

  // ── Agent 2: Sage Care Companion ──────────────────────────
  {
    agentId: 'sage_companion',
    description: 'Care interaction completion (new visit data)',
    tables: ['care_interaction'],
    condition: 'endedAt != NONE',
    triggerDescription:
      'Caregiver completes visit → update patient context for next "How is Mom?" query',
    expectedLatencyMs: 2000,
    realtime: false,
  },
  {
    agentId: 'sage_companion',
    description: 'Wearable anomaly detected (Galaxy Watch → Aidbox → outbox)',
    tables: ['outbox_event'],
    condition: "eventType = 'wearable_anomaly' AND status = 'pending'",
    triggerDescription:
      'Heart rate spike, SpO2 drop, or fall detected → proactive family notification with context',
    expectedLatencyMs: 500,
    realtime: true,
  },

  // ── Agent 3: Shift Coordinator ────────────────────────────
  {
    agentId: 'shift_coordinator',
    description: 'Shift offer responses (accepted/declined)',
    tables: ['timebank_task'],
    condition: "status IN ['accepted', 'declined']",
    triggerDescription: 'Caregiver responds to shift offer → confirm or escalate to next candidate',
    expectedLatencyMs: 500,
    realtime: true,
  },
  {
    agentId: 'shift_coordinator',
    description: 'Upcoming shift reminders',
    tables: ['timebank_task'],
    condition: "status = 'accepted' AND scheduledFor < time::now() + 24h",
    triggerDescription:
      '24-hour reminder window entered → send confirmation SMS/push to caregiver and family',
    expectedLatencyMs: 5000,
    realtime: false,
  },

  // ── Agent 4: Billing & TimeBank Agent ─────────────────────
  {
    agentId: 'billing_timebank',
    description: 'Care interaction completion → billing eligibility check',
    tables: ['care_interaction'],
    condition: 'endedAt != NONE',
    triggerDescription:
      'Visit completed → evaluate PIN/CHI/CCM/RPM eligibility, draft CMS-1500 if applicable',
    expectedLatencyMs: 2000,
    realtime: false,
  },
  {
    agentId: 'billing_timebank',
    description: 'RPM data day accumulation (Galaxy Watch readings)',
    tables: ['outbox_event'],
    condition: "eventType = 'wearable_reading' AND status = 'pending'",
    triggerDescription:
      'New wearable reading → increment RPM data day counter, flag 16-day (99454) and 2-day (99445) thresholds',
    expectedLatencyMs: 5000,
    realtime: false,
  },
  {
    agentId: 'billing_timebank',
    description: 'TimeBank credit expiry approach',
    tables: ['timebank_transaction'],
    condition: 'createdAt < time::now() - 11m', // 11 months old = 30 day warning
    triggerDescription:
      'Credits approaching 12-month expiry → send warning, offer spend suggestions',
    expectedLatencyMs: 60000,
    realtime: false,
  },

  // ── Agent 5: Compliance Monitor ───────────────────────────
  {
    agentId: 'compliance_monitor',
    description: 'Background check status changes',
    tables: ['user'],
    condition: "backgroundCheckStatus IN ['expired', 'expiring_soon']",
    triggerDescription: 'Certification approaching expiry → 60/30/7-day reminder cascade',
    expectedLatencyMs: 30000,
    realtime: false,
  },
  {
    agentId: 'compliance_monitor',
    description: 'Burnout threshold monitoring',
    tables: ['timebank_account'],
    condition: 'lastActivityAt != NONE', // triggers weekly scan
    triggerDescription: 'Weekly scan: flag caregivers with >10 hours/week logged → burnout warning',
    expectedLatencyMs: 60000,
    realtime: false,
  },

  // ── Agent 6: Triage Agent ─────────────────────────────────
  {
    agentId: 'triage_agent',
    description: 'CII score enters Yellow or Red zone',
    tables: ['assessment'],
    condition: "type = 'cii' AND totalScore > 40",
    triggerDescription:
      'CII ≥ 41 (Yellow Zone) → auto-draft respite Time Bank request. CII ≥ 60 → alert Conductor. CII ≥ 80 (Red) → alert Clinical Director.',
    expectedLatencyMs: 1000,
    realtime: true,
  },
  {
    agentId: 'triage_agent',
    description: 'Change in condition flagged during care visit',
    tables: ['care_interaction'],
    condition: 'changeInCondition = true',
    triggerDescription:
      'Caregiver flags condition change → alert Conductor + Clinical Director if severity = critical',
    expectedLatencyMs: 500,
    realtime: true,
  },

  // ── Agent 7: Business-of-One Agent ────────────────────────
  {
    agentId: 'business_of_one',
    description: 'Worker equity accumulation events',
    tables: ['worker_equity'],
    condition: 'accumulatedEquity != vestedEquity', // new equity accrued
    triggerDescription:
      'Quarterly equity update → notify caregiver of S-Corp vesting milestone, update Every.io bookkeeping queue',
    expectedLatencyMs: 30000,
    realtime: false,
  },
  {
    agentId: 'business_of_one',
    description: 'Shift completion → payroll routing',
    tables: ['care_interaction'],
    condition: 'endedAt != NONE',
    triggerDescription:
      'Visit completed → generate Opolis payroll instruction for caregiver S-Corp Funding Account',
    expectedLatencyMs: 2000,
    realtime: false,
  },
] as const;

// ============================================================
// GRAPH SCHEMAS — Neighborhood Care Relationships
// ============================================================
// PostgreSQL's relation tables model the traversal (record links + -> operator)
// models the care cooperative's social fabric directly.
//
// The graph answers questions no relational database can answer
// efficiently:
//   "Who in this neighborhood has helped this family before,
//    speaks Spanish, has respite capacity, AND is available Tuesday?"
//
// In SQL: 5+ JOIN, 3 subqueries, performance nightmare at scale.
// In PostgreSQL: recursive CTE or JOIN-based query.

/**
 * Graph edge definition — relationship between two nodes.
 * Maps to PostgreSQL relation tables.
 */
export interface GraphEdge {
  /** PostgreSQL table name for this edge */
  table: string;
  /** Source node type */
  from: string;
  /** Target node type */
  to: string;
  /** What this relationship represents */
  semanticMeaning: string;
  /** Properties stored on the edge */
  properties: string[];
  /** Example graph traversal query using this edge */
  exampleTraversal: string;
}

/**
 * The care graph — all relationship types in the cooperative.
 *
 * Four existing edges (from schema) + four proposed agentic edges
 * that enable health system integration through graph intelligence.
 */
export const CARE_GRAPH_EDGES: readonly GraphEdge[] = [
  // ── Existing (in schema.sql) ──────────────────
  {
    table: 'helped',
    from: 'user',
    to: 'user',
    semanticMeaning: 'Time Bank cascade — who helped whom',
    properties: ['taskId', 'hours', 'createdAt'],
    exampleTraversal: 'SELECT ->helped->user AS helped_neighbors FROM user:sarah',
  },
  {
    table: 'member_of',
    from: 'user',
    to: 'family',
    semanticMeaning: 'Cooperative membership — who belongs to which family unit',
    properties: ['role', 'joinedAt'],
    exampleTraversal: 'SELECT <-member_of<-user AS members FROM family:johnson',
  },
  {
    table: 'assigned_to',
    from: 'user',
    to: 'family',
    semanticMeaning: 'Care team assignment — which caregivers serve which family',
    properties: ['role', 'assignedAt', 'active'],
    exampleTraversal: 'SELECT ->assigned_to->family AS families FROM user:caregiver1',
  },
  {
    table: 'referred',
    from: 'user',
    to: 'user',
    semanticMeaning: 'Viral referral loop — who brought whom into the cooperative',
    properties: ['bonusAwarded', 'createdAt'],
    exampleTraversal: 'SELECT ->referred->user->referred->user AS referral_chain FROM user:founder',
  },

  // ── Proposed Agentic Edges (for health system integration) ─
  {
    table: 'lives_near',
    from: 'user',
    to: 'user',
    semanticMeaning: 'Geographic proximity — neighbors within care radius (0.25 mi)',
    properties: ['distanceMiles', 'calculatedAt'],
    exampleTraversal:
      'SELECT ->lives_near[WHERE distanceMiles < 0.5]->user AS nearby_caregivers FROM user:patient1',
  },
  {
    table: 'discharged_to',
    from: 'care_recipient',
    to: 'family',
    semanticMeaning: 'Hospital discharge → home care transition (BCH integration)',
    properties: ['dischargeDate', 'admitDiagnoses', 'followUpRequired', 'sourceSystem'],
    exampleTraversal:
      'SELECT <-discharged_to<-care_recipient[WHERE dischargeDate > time::now() - 72h] AS recent_discharges FROM family:johnson',
  },
  {
    table: 'monitors',
    from: 'user',
    to: 'care_recipient',
    semanticMeaning: 'Wearable monitoring relationship (Galaxy Watch RPM)',
    properties: ['deviceId', 'startDate', 'rpmDataDays', 'lastReadingAt'],
    exampleTraversal:
      'SELECT ->monitors->care_recipient[WHERE rpmDataDays >= 16] AS rpm_eligible_patients FROM user:clinical_director',
  },
  {
    table: 'billed_for',
    from: 'care_interaction',
    to: 'care_recipient',
    semanticMeaning: 'Billing event linked to care delivery (CMS claims trail)',
    properties: ['billingLayers', 'cptCodes', 'claimStatus', 'revenueEstimateCents'],
    exampleTraversal:
      'SELECT <-billed_for<-care_interaction[WHERE claimStatus = "pending"] AS unbilled FROM care_recipient:patient1',
  },
] as const;

// ============================================================
// AGENTIC GRAPH QUERIES — Complex Intelligence
// ============================================================
// These are the queries that make PostgreSQL an agent BRAIN,
// not just agent STORAGE. Each query answers a question that
// requires traversing multiple relationships simultaneously.

export interface AgenticGraphQuery {
  /** What question this query answers */
  question: string;
  /** Which agent uses this query */
  agentId: AgentId;
  /** Pseudocode SQL (illustrative — actual may vary) */
  sql: string;
  /** Why this matters for health system integration */
  healthSystemRelevance: string;
}

export const AGENTIC_GRAPH_QUERIES: readonly AgenticGraphQuery[] = [
  {
    question:
      'Find available Spanish-speaking caregivers within 2 miles who have helped this family before',
    agentId: 'scheduling_orchestrator',
    sql: `
      SELECT id, firstName, lastName, rating, location
      FROM user
      WHERE 'spanish' IN skills
        AND geo::distance(location, $familyLocation) < 3218.69  -- 2 miles in meters
        AND id IN (SELECT in FROM assigned_to WHERE out = $familyId AND active = true)
      ORDER BY rating DESC
      LIMIT 5
    `,
    healthSystemRelevance:
      'Post-discharge care continuity: same caregiver who knows the patient returns for home transition, reducing 30-day readmission risk',
  },
  {
    question:
      'Map the cascade impact: how many families has this caregiver indirectly helped through the referral chain?',
    agentId: 'sage_companion',
    sql: `
      SELECT
        ->referred->user->assigned_to->family AS direct_referral_families,
        ->referred->user->referred->user->assigned_to->family AS second_degree_families,
        ->helped->user AS neighbors_helped
      FROM user:$caregiverId
    `,
    healthSystemRelevance:
      'Demonstrates community impact for ACCESS Model outcome reporting and PACE partnership value metrics',
  },
  {
    question:
      'Which patients discharged from BCH in the last 72 hours have NO scheduled follow-up visit?',
    agentId: 'scheduling_orchestrator',
    sql: `
      SELECT id, firstName, lastName, ->member_of->family AS family
      FROM care_recipient
      WHERE id IN (
        SELECT in FROM discharged_to WHERE dischargeDate > time::now() - 72h
      )
      AND id NOT IN (
        SELECT careRecipientId FROM timebank_task
        WHERE status IN ['open', 'accepted', 'matched']
          AND scheduledFor > time::now()
      )
    `,
    healthSystemRelevance:
      'Core BCH Safe Graduation metric: 0 patients fall through the post-discharge gap. PostgreSQL detects the gap; Scheduling Agent fills it.',
  },
  {
    question:
      'Which caregivers are approaching burnout (>10 hrs/week) AND their patients have rising CII scores?',
    agentId: 'triage_agent',
    sql: `
      SELECT
        user.id, user.firstName,
        math::sum(care_interaction.actualHours) AS weekly_hours,
        assessment.totalScore AS latest_cii
      FROM care_interaction
      WHERE workerId = user.id
        AND startedAt > time::now() - 7d
      GROUP BY user.id
      HAVING weekly_hours > 10
      FETCH user, (
        SELECT totalScore FROM assessment
        WHERE assessorId = user.id AND type = 'cii'
        ORDER BY completedAt DESC LIMIT 1
      ) AS latest_cii
    `,
    healthSystemRelevance:
      'Dual-signal early warning: caregiver strain + patient burden escalating simultaneously. Prevents cascading failures before crisis.',
  },
  {
    question: 'Calculate RPM billing eligibility across all monitored patients this month',
    agentId: 'billing_timebank',
    sql: `
      SELECT
        care_recipient.id,
        care_recipient.firstName,
        count(outbox_event) AS data_days_this_month,
        math::sum(care_interaction.actualHours) AS staff_minutes
      FROM care_recipient
      WHERE wearableDeviceId != NONE
        AND id IN (SELECT out FROM monitors WHERE in = $clinicalDirectorId)
      FETCH (
        SELECT count() FROM outbox_event
        WHERE eventType = 'wearable_reading'
          AND resourceId = care_recipient.fhirPatientId
          AND createdAt > time::now() - 30d
      ) AS data_days,
      (
        SELECT math::sum(actualHours) * 60 FROM care_interaction
        WHERE careRecipientId = care_recipient.id
          AND startedAt > time::now() - 30d
      ) AS staff_minutes
    `,
    healthSystemRelevance:
      'Auto-surfaces full RPM revenue stack: 99453 (setup), 99454 (16+ days), 99445 (2-15 days), 99457/99458 (staff time). Billing Agent flags when thresholds are met.',
  },
  {
    question:
      'Show the complete neighborhood care network for a family — all connections within 2 degrees',
    agentId: 'sage_companion',
    sql: `
      SELECT
        <-assigned_to<-user AS care_team,
        <-assigned_to<-user->helped->user AS neighbors_who_helped_our_caregivers,
        <-assigned_to<-user->lives_near->user[WHERE 'companion_care' IN skills] AS nearby_available,
        <-member_of<-user AS family_members
      FROM family:$familyId
    `,
    healthSystemRelevance:
      'Visualizes the "neighborhood as clinical asset" thesis. Sage can tell families: "Your care network includes 12 neighbors, 3 trained caregivers, and a respite capacity of 40 hours this month."',
  },
] as const;

// ============================================================
// DEFINE EVENT — Capture Once Route Many (CORM) Pipeline
// ============================================================
// PostgreSQL triggers create automatic side-effects when
// records change. This is the CORM pipeline's foundation:
//
//   Caregiver clocks in → care_interaction record created →
//   PostgreSQL trigger fires → 3 parallel downstream records:
//     1. outbox_event (FHIR Observation → Aidbox)
//     2. outbox_event (CMS Billing Event → Claims Queue)
//     3. outbox_event (Opolis Payroll Instruction → Funding Account)
//
// No separate orchestration layer. No message queue. No cron job.
// The database IS the orchestrator.

/**
 * PostgreSQL trigger definition — automatic side-effect on data change.
 * Maps to CREATE TRIGGER in PostgreSQL.
 */
export interface DatabaseTriggerEvent {
  /** Trigger name in PostgreSQL */
  name: string;
  /** Table this event watches */
  table: string;
  /** Trigger condition (WHEN clause) */
  when: string;
  /** What happens (THEN clause — simplified) */
  thenDescription: string;
  /** Downstream effects */
  produces: DatabaseTriggerOutput[];
  /** Which agent(s) consume the output */
  consumedBy: AgentId[];
}

export interface DatabaseTriggerOutput {
  /** Output type */
  type: 'outbox_fhir' | 'outbox_billing' | 'outbox_payroll' | 'notification' | 'agent_trigger';
  /** Target system */
  target: string;
  /** Data produced */
  description: string;
}

/**
 * All CORM events — the pipeline that turns a single caregiver
 * action into multi-system orchestration.
 */
export const CORM_EVENTS: readonly DatabaseTriggerEvent[] = [
  // ── Clock-In / Clock-Out → Triple Output ──────────────────
  {
    name: 'care_interaction_complete',
    table: 'care_interaction',
    when: '$after.endedAt != NONE AND $before.endedAt = NONE',
    thenDescription:
      'Visit completed → create 3 outbox events for FHIR, Billing, and Payroll simultaneously',
    produces: [
      {
        type: 'outbox_fhir',
        target: 'Aidbox',
        description: 'FHIR Observation with Omaha-coded care data, duration, vitals if recorded',
      },
      {
        type: 'outbox_billing',
        target: 'Claims Queue',
        description: 'PIN/CHI/CCM/RPM eligibility assessment + draft CMS-1500 line items',
      },
      {
        type: 'outbox_payroll',
        target: 'Opolis Funding Account',
        description:
          'Payroll instruction: worker entity ID, hours, rate, gross pay, GPS-verified flag',
      },
    ],
    consumedBy: ['billing_timebank', 'business_of_one'],
  },

  // ── Assessment Completion → Triage + FHIR ─────────────────
  {
    name: 'assessment_cii_alert',
    table: 'assessment',
    when: "$after.type = 'cii' AND $after.totalScore > 40",
    thenDescription:
      'CII enters Yellow/Red → notify Triage Agent + sync to Aidbox QuestionnaireResponse',
    produces: [
      {
        type: 'agent_trigger',
        target: 'Triage Agent',
        description: 'CII score + dimension breakdown + caregiver ID → auto-draft respite request',
      },
      {
        type: 'outbox_fhir',
        target: 'Aidbox',
        description: 'FHIR QuestionnaireResponse (CII assessment) for clinical record',
      },
      {
        type: 'notification',
        target: 'Conductor',
        description: 'Push notification to family Conductor: "Your caregiver load has increased"',
      },
    ],
    consumedBy: ['triage_agent', 'sage_companion'],
  },

  // ── Wearable Data → RPM Tracking + Anomaly Alert ──────────
  {
    name: 'wearable_reading_received',
    table: 'outbox_event',
    when: "$after.eventType = 'wearable_reading' AND $after.status = 'pending'",
    thenDescription: 'Galaxy Watch reading received → increment RPM data day + check for anomalies',
    produces: [
      {
        type: 'outbox_billing',
        target: 'RPM Tracker',
        description: 'Increment data day counter. Flag 2-day (99445), 16-day (99454) thresholds.',
      },
      {
        type: 'agent_trigger',
        target: 'Sage Companion',
        description: 'Update patient context with latest vitals for "How is Mom?" queries',
      },
    ],
    consumedBy: ['billing_timebank', 'sage_companion'],
  },

  // ── Hospital Discharge → Auto-Schedule Home Visit ─────────
  {
    name: 'discharge_received',
    table: 'outbox_event',
    when: "$after.eventType = 'adt_discharge' AND $after.status = 'pending'",
    thenDescription: 'BCH A03 discharge → auto-create companion care task within 72-hour window',
    produces: [
      {
        type: 'agent_trigger',
        target: 'Scheduling Orchestrator',
        description:
          'Create time-sensitive task: companion visit within 72h of discharge, match to assigned caregiver or nearest available',
      },
      {
        type: 'notification',
        target: 'Family Conductor',
        description:
          'Notify family: "Your loved one is being discharged. We are scheduling a companion visit."',
      },
      {
        type: 'outbox_fhir',
        target: 'Aidbox',
        description: 'FHIR Encounter (referral) linking hospital discharge to companion care plan',
      },
    ],
    consumedBy: ['scheduling_orchestrator', 'sage_companion'],
  },

  // ── TimeBank Credit Expiry → Respite Fund ─────────────────
  {
    name: 'credit_expiry_warning',
    table: 'timebank_transaction',
    when: '$after.createdAt < time::now() - 11m AND $after.type = "earned"',
    thenDescription:
      'Credit approaching 12-month expiry → warn member, auto-transfer to Respite Fund at expiry',
    produces: [
      {
        type: 'notification',
        target: 'Member',
        description:
          '30-day warning: "You have X hours expiring. Use them, donate them, or they flow to the Respite Fund."',
      },
      {
        type: 'agent_trigger',
        target: 'Billing & TimeBank Agent',
        description: 'Suggest spend opportunities based on member preferences and available tasks',
      },
    ],
    consumedBy: ['billing_timebank'],
  },

  // ── Change in Condition → Clinical Escalation ─────────────
  {
    name: 'condition_change_alert',
    table: 'care_interaction',
    when: '$after.changeInCondition = true',
    thenDescription: 'Caregiver flags condition change → escalation cascade based on severity',
    produces: [
      {
        type: 'agent_trigger',
        target: 'Triage Agent',
        description:
          'Evaluate severity: routine → Conductor notification; critical → Clinical Director + family alert',
      },
      {
        type: 'outbox_fhir',
        target: 'Aidbox',
        description: 'FHIR Flag resource (clinical alert) linked to patient record',
      },
      {
        type: 'notification',
        target: 'Clinical Director',
        description: 'If severity = critical: immediate push to Josh Emdur DO for clinical review',
      },
    ],
    consumedBy: ['triage_agent', 'compliance_monitor'],
  },

  // ── Referral Bonus → Viral Loop ───────────────────────────
  {
    name: 'referral_completed',
    table: 'referred',
    when: '$event = CREATE',
    thenDescription: 'New member referred → award 5hr bonus to referrer + track viral chain',
    produces: [
      {
        type: 'agent_trigger',
        target: 'Billing & TimeBank Agent',
        description: 'Credit 5 hours to referrer TimeBank account (referral_bonus type)',
      },
      {
        type: 'notification',
        target: 'Referrer',
        description: '"Your neighbor just joined! You earned 5 bonus hours."',
      },
    ],
    consumedBy: ['billing_timebank'],
  },
] as const;

// ============================================================
// HEALTH SYSTEM INTEGRATION PATTERNS
// ============================================================
// PostgreSQL enables co-op.care to integrate into health systems
// through AGENTIC WORK, not passive API connections.
//
// Traditional integration: Health system → API → App → Display
// Agentic integration: Health system → Event → PostgreSQL → Agent → Action
//
// The difference: agentic integration DOES something. It doesn't
// wait for a human to check a dashboard. The agent acts.

export interface HealthSystemIntegration {
  /** Health system partner */
  partner: string;
  /** Integration method */
  method: string;
  /** PostgreSQL's role in the integration */
  postgresRole: string;
  /** Which agent(s) drive this integration */
  agents: AgentId[];
  /** What happens automatically (no human required) */
  automaticActions: string[];
  /** What requires human approval */
  humanGate: string;
}

export const HEALTH_SYSTEM_INTEGRATIONS: readonly HealthSystemIntegration[] = [
  {
    partner: 'Boulder Community Health (BCH)',
    method: 'HL7 v2 ADT messages via webhook → outbox_event table',
    postgresRole:
      'Receives discharge events, triggers LISTEN/NOTIFY → Scheduling Agent creates post-discharge companion visit',
    agents: ['scheduling_orchestrator', 'sage_companion'],
    automaticActions: [
      'Parse ADT A03 discharge message → extract patient, diagnoses, discharge date',
      'Match to existing care_recipient via MRN/DOB lookup',
      'Create timebank_task with 72-hour scheduling window',
      'Score and rank available caregivers (prefer prior relationship)',
      'Send shift offer SMS to top candidate',
      'Notify family Conductor of discharge and scheduled visit',
    ],
    humanGate: 'Caregiver must accept the shift offer. Family can modify timing.',
  },
  {
    partner: 'Galaxy Watch / Samsung Health (RPM)',
    method: 'Health Connect → Health Data SDK → Aidbox FHIR Observation → outbox sync',
    postgresRole:
      'Tracks RPM data days per patient, triggers billing thresholds, detects anomalies for Sage/Triage',
    agents: ['billing_timebank', 'sage_companion', 'triage_agent'],
    automaticActions: [
      'Receive wearable reading via Aidbox → outbox_event',
      'Increment data day counter (distinct calendar dates with ≥1 reading)',
      'Flag 2-day threshold (CPT 99445 eligible)',
      'Flag 16-day threshold (CPT 99454 eligible)',
      'Detect anomalies (heart rate >120 or <50, SpO2 <92, fall detected)',
      'Update patient context for Sage Companion queries',
    ],
    humanGate:
      'Clinical Director reviews anomaly alerts before family notification. CMS-1500 claims require human review before submission.',
  },
  {
    partner: 'BCAAA (Boulder County Area Agency on Aging)',
    method: 'CII assessment referral pipeline → assessment table',
    postgresRole:
      'Stores CII assessments, triggers Triage Agent on Yellow/Red scores, tracks referral-to-service conversion',
    agents: ['triage_agent', 'sage_companion'],
    automaticActions: [
      'Receive CII assessment (from BCAAA referral or self-assessment)',
      'Classify zone (Green/Yellow/Red)',
      'Yellow Zone → auto-draft respite Time Bank request',
      'Track Sandwich Generation demographics for grant reporting',
      'Aggregate anonymized CII data for community impact metrics',
    ],
    humanGate:
      'Caregiver must confirm auto-drafted respite request. Red Zone alerts require Clinical Director review.',
  },
  {
    partner: 'CMS ACCESS Model (2027)',
    method: 'Outcome-Aligned Payment tracking → billing engine',
    postgresRole:
      'Tracks OAP metrics, calculates withhold against Outcome Attainment Threshold, surfaces real-time performance',
    agents: ['billing_timebank', 'compliance_monitor'],
    automaticActions: [
      'Track 30-day readmission rates for attributed patients',
      'Calculate emergency department utilization trends',
      'Monitor patient satisfaction scores (surveys → outbox → CMS)',
      'Compute OAP revenue vs 50% withhold position',
      'Generate quarterly ACCESS Model compliance reports',
    ],
    humanGate:
      'ACCESS Model enrollment requires physician attestation. Withhold reconciliation requires board review.',
  },
  {
    partner: 'TRU PACE (Companion Care Sub-Capitation)',
    method: 'Companion care hours tracking + tier eligibility → billing engine',
    postgresRole:
      'Tracks PACE-enrolled patient hours, validates companion tier eligibility, manages sub-capitation revenue',
    agents: ['billing_timebank', 'scheduling_orchestrator'],
    automaticActions: [
      'Track companion care hours per PACE-enrolled patient',
      'Validate tier eligibility against care plan requirements',
      'Estimate sub-capitation revenue based on enrolled population',
      'Schedule companion visits aligned with PACE care plan',
    ],
    humanGate:
      'PACE enrollment requires clinical assessment. Sub-capitation rates negotiated at partnership level.',
  },
] as const;

// ============================================================
// POSTGRESQL AGENTIC CAPABILITIES SUMMARY
// ============================================================

export const POSTGRES_AGENTIC_SUMMARY = {
  /** The core thesis */
  thesis:
    'PostgreSQL is not passive storage — it is the nervous system that activates, connects, and orchestrates all 7 AI agents. The database pushes state changes to agents, traverses the neighborhood graph, and fires the Capture Once Route Many pipeline.',

  /** Three pillars of agentic capability */
  pillars: [
    {
      capability: 'Notifications (LISTEN/NOTIFY)',
      whatItReplaces: 'Kafka event bus, polling cron jobs',
      coopCareUse:
        '17 real-time subscriptions across 7 agents — database pushes changes TO agents via LISTEN/NOTIFY',
      healthSystemValue:
        'Hospital discharge → companion visit scheduled in <5 minutes, not next business day',
    },
    {
      capability: 'Graph Traversal (Relation Tables + Recursive CTEs)',
      whatItReplaces: 'Separate graph database (Neo4j)',
      coopCareUse:
        '8 relationship types model the full care cooperative social fabric in one database',
      healthSystemValue:
        '"The neighborhood itself is a clinical asset" — graph queries surface the community care network that no health system has visibility into',
    },
    {
      capability: 'Triggers + NOTIFY (Embedded Events)',
      whatItReplaces: 'Separate orchestration layer (Temporal, Airflow)',
      coopCareUse:
        '7 CORM pipeline events turn single caregiver actions into multi-system orchestration',
      healthSystemValue:
        'Single clock-in → FHIR record + CMS billing + Opolis payroll simultaneously. Zero dropped billing, zero manual data entry.',
    },
  ] as const,

  /** Why PostgreSQL (aligned with Aidbox/Health Samurai) */
  whyPostgres: [
    'JSONB for documents, relation tables for graph, native time-series, PostGIS for geospatial — mature ecosystem with Aidbox alignment',
    'LISTEN/NOTIFY provides lightweight event notification without middleware',
    'PostgreSQL triggers enable Capture Once Route Many without an orchestration framework',
    'PostGIS geospatial for care radius matching — the core scheduling primitive',
    'Relation tables + recursive CTEs on the same data that stores documents — no ETL to a separate graph DB',
    'Standard SQL — no proprietary query language that Jacob (backend dev) can work in it immediately',
    'Single database to back up, secure, and HIPAA-audit — shared with Aidbox FHIR server — not 3 separate systems',
  ] as const,

  /** Cost comparison */
  vsAlternative: {
    traditional:
      'Multiple databases + Redis pub/sub + Neo4j + Temporal + event bus = 5 systems, 5 failure modes, 5 HIPAA audits',
    coopCare:
      'PostgreSQL = 1 system with document + graph + events + geospatial + live queries. One HIPAA audit. One backup. One connection string.',
  },
} as const;
