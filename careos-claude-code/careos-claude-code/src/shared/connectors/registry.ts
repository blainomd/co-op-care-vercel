/**
 * Connector Registry — All 6 Connectors defined in one place
 *
 * Three brands. Not ten.
 *   - co-op.care: everything the family touches
 *   - SurgeonValue: everything the surgeon touches
 *   - SolvingHealth: the invisible engine
 *
 * CareGoals, MapOfYou, ComfortCard, ClinicalSwipe — these are
 * Connector configs inside co-op.care or SolvingHealth. Not brands.
 *
 * To add a new Connector:
 *   1. Add a ConnectorConfig to this file
 *   2. Deploy
 *   That's it. The engine renders the card, mounts the route, registers triggers.
 */
import type { ConnectorConfig, WorkflowTemplate } from '../types/connector.types.js';

// ─── Connector Definitions ──────────────────────────────────────────

export const CONNECTORS: ConnectorConfig[] = [
  // ── 1. Physician-Backed Research (SolvingHealth engine) ────────────
  {
    id: 'clinical-research',
    name: 'Physician-Backed Research',
    brand: 'SolvingHealth',
    domainPrompt: `You are a clinical research agent within the co-op.care ecosystem.
Given a care recipient's conditions and medications, research evidence-based
care protocols, flag medication interactions, and identify dietary requirements.

Your output must be structured for physician review — never present unverified
clinical recommendations directly to families. Flag uncertainty explicitly.

Output format:
- condition_protocols: array of {condition, evidence_level, recommendations}
- interaction_alerts: array of {drugs, severity, recommendation}
- dietary_requirements: array of {condition, restrictions, rationale}
- physician_review_notes: string (what the physician should verify)`,
    guardrails: [
      'Never recommend specific dosage changes — flag for physician',
      'Never present drug interactions without severity rating',
      'Always cite evidence level (A/B/C) for protocols',
      'Never override existing physician orders',
    ],
    tools: [
      { id: 'fhir-meds', name: 'FHIR Medication Sync', requiresAuth: true },
      { id: 'drug-interaction-db', name: 'Drug Interaction Database', requiresAuth: false },
      { id: 'evidence-db', name: 'Clinical Evidence Database', requiresAuth: false },
    ],
    triggers: [
      {
        event: 'clinicalswipe.review_needed',
        when: 'interaction_found',
        description: 'Routes drug interaction to ClinicalSwipe physician review queue',
      },
      {
        event: 'billing.cts_97550',
        when: 'caregiver_education_generated',
        description: 'Caregiver training content generated — CTS 97550 billable',
      },
    ],
    pricing: {
      perUse: 12,
      includedInSubscription: true,
      billingCodes: ['97550'],
    },
    landing: {
      title: 'Physician-Backed Research',
      description:
        'Sage researches medication interactions, condition-specific care protocols, and dietary requirements — then a licensed physician reviews the output before you see it.',
      tag: 'Physician verified',
      tagColor: '#7c956b',
      icon: 'research',
    },
    requiresPhysicianReview: true,
    guideOrder: 1,
  },

  // ── 2. Care Plan Structuring (co-op.care) ─────────────────────────
  {
    id: 'care-plan',
    name: 'Care Plan Structuring',
    brand: 'co-op.care',
    domainPrompt: `You are a care plan structuring agent within the co-op.care ecosystem.
Given a care recipient's conditions, routines, and values (from CareGoals),
organize complex care needs into clear, time-based daily routines.

The output must be followable by ANY substitute caregiver — someone who has
never met this person should be able to step in and provide safe, dignified care.

Output format:
- morning_routine: array of {time, activity, assistance_level, notes}
- midday_routine: same format
- afternoon_routine: same format
- evening_routine: same format
- night_routine: same format
- personal_values: {good_day, what_matters, comfort_measures}
- caregiver_tips: array of practical, person-specific guidance`,
    guardrails: [
      'Always include personal values from CareGoals — this is a person, not a patient',
      'Never schedule conflicting activities',
      'Always note assistance level for each activity',
      'Include rest periods — do not over-schedule',
    ],
    tools: [
      { id: 'living-profile', name: 'Living Profile (Memory)', requiresAuth: true },
      { id: 'caregoals-values', name: 'CareGoals Values Store', requiresAuth: true },
      { id: 'calendar-sync', name: 'Calendar Integration', requiresAuth: true },
    ],
    triggers: [
      {
        event: 'caregoals.profile_created',
        when: 'values_captured',
        description: 'Living Profile populated from care plan structuring',
      },
      {
        event: 'billing.pin_g0019',
        when: 'care_navigation_provided',
        description: 'Care navigation service delivered — PIN G0019 billable',
      },
      {
        event: 'acuity.score_generated',
        when: 'plan_assembled',
        description: 'Family acuity profile generated from structured care plan',
      },
    ],
    pricing: {
      perUse: undefined,
      includedInSubscription: true,
      billingCodes: ['G0019', 'G0023'],
    },
    landing: {
      title: 'Care Plan Structuring',
      description:
        'Sage organizes complex care needs into clear, time-based routines — so any substitute caregiver can step in and follow the plan without confusion.',
      tag: 'Living Profile',
      tagColor: '#c4956a',
      icon: 'care-plan',
    },
    requiresPhysicianReview: false,
    guideOrder: 2,
  },

  // ── 3. Medication Management ──────────────────────────────────────
  {
    id: 'medication-mgmt',
    name: 'Medication Management',
    brand: 'co-op.care',
    domainPrompt: `You are a medication management agent within the co-op.care ecosystem.
Given a care recipient's medication list, cross-reference for interactions,
flag timing conflicts, and build a visual daily medication schedule.

Track refill dates and generate alerts before medications run out.
All interaction findings must route to physician review.

Output format:
- med_schedule: array of {medication, dosage, times, with_food, special_instructions}
- interactions: array of {drug_a, drug_b, severity, description, recommendation}
- refill_tracker: array of {medication, pharmacy, next_refill, days_remaining}
- timing_conflicts: array of {medications, conflict, resolution}
- physician_flags: array of items requiring physician attention`,
    guardrails: [
      'Never recommend medication changes — physician only',
      'Always flag interactions of moderate or higher severity',
      'Never suggest stopping a medication',
      'Include pharmacy contact for each medication',
    ],
    tools: [
      { id: 'fhir-meds', name: 'FHIR Medication Sync', requiresAuth: true },
      { id: 'drug-interaction-db', name: 'Drug Interaction Database', requiresAuth: false },
      { id: 'pharmacy-api', name: 'Pharmacy Refill API', requiresAuth: true },
    ],
    triggers: [
      {
        event: 'clinicalswipe.review_needed',
        when: 'major_interaction_found',
        description: 'Major drug interaction found — immediate physician review',
      },
      {
        event: 'notification.refill_alert',
        when: 'refill_within_7_days',
        description: 'Medication refill due within 7 days — alert conductor',
      },
    ],
    pricing: {
      perUse: undefined,
      includedInSubscription: true,
      billingCodes: [],
    },
    landing: {
      title: 'Medication Management',
      description:
        'Sage cross-references medications for interactions, flags timing conflicts, and builds a visual daily med schedule with refill date tracking.',
      tag: 'FHIR medication sync',
      tagColor: '#7c956b',
      icon: 'medication',
    },
    requiresPhysicianReview: true,
    guideOrder: 3,
  },

  // ── 4. HSA/FSA Savings Finder (co-op.care wallet) ──────────────────
  {
    id: 'savings-finder',
    name: 'HSA/FSA Savings Finder',
    brand: 'co-op.care',
    domainPrompt: `You are an HSA/FSA savings identification agent within the co-op.care ecosystem.
Given a care recipient's conditions, care plan, and identified needs, determine
which expenses qualify as IRS 213(d) medical expenses eligible for HSA/FSA payment.

For each eligible expense, calculate estimated annual savings and generate the
data needed for a Letter of Medical Necessity (LMN).

Output format:
- eligible_expenses: array of {expense, category, annual_cost, tax_bracket_savings, irs_authority}
- total_annual_savings: number
- lmn_data: {conditions, services, medical_necessity_rationale, duration}
- non_eligible: array of {expense, reason}
- comfortcard_routing: array of {expense, payment_method, provider}`,
    guardrails: [
      'Only flag expenses with clear IRS 213(d) authority',
      'Never guarantee tax savings — always estimate with disclaimer',
      'LMN data must be physician-reviewable, not physician-signed',
      'Never include expenses that are cosmetic or elective without medical basis',
    ],
    tools: [
      { id: 'irs-213d-db', name: 'IRS 213(d) Eligibility Database', requiresAuth: false },
      { id: 'lmn-generator', name: 'LMN Draft Generator', requiresAuth: true },
      { id: 'comfortcard-wallet', name: 'ComfortCard Wallet', requiresAuth: true },
    ],
    triggers: [
      {
        event: 'lmn.draft_created',
        when: 'eligible_expenses_found',
        description: 'HSA/FSA-eligible needs identified — LMN draft queued for Josh',
      },
      {
        event: 'comfortcard.activated',
        when: 'payment_routing_configured',
        description: 'ComfortCard activated for HSA/FSA-eligible spending',
      },
      {
        event: 'billing.lmn_199',
        when: 'non_subscriber_lmn',
        description: 'Non-subscriber LMN request — $199 direct billing',
      },
    ],
    pricing: {
      perUse: 199,
      includedInSubscription: true,
      billingCodes: [],
    },
    landing: {
      title: 'HSA/FSA Savings Finder',
      description:
        'Identifies which care needs are HSA/FSA eligible and auto-generates a Letter of Medical Necessity — saving families an average of $936/year in pre-tax dollars.',
      tag: 'HSA/FSA savings',
      tagColor: '#c4956a',
      icon: 'savings',
    },
    requiresPhysicianReview: true,
    guideOrder: 4,
  },

  // ── 5. Remember & Learn (Living Profile) ──────────────────────────
  {
    id: 'living-memory',
    name: 'Remember & Learn',
    brand: 'co-op.care',
    domainPrompt: `You are the memory and continuity agent within the co-op.care ecosystem.
You maintain the Living Profile — a persistent, evolving record of a care
recipient's conditions, medications, routines, values, and care history.

When new information arrives (medication change, new diagnosis, routine update),
integrate it into the existing profile and flag what changed for the care team.

Output format:
- profile_updates: array of {field, previous_value, new_value, source, timestamp}
- care_team_alerts: array of {change, urgency, who_to_notify}
- guide_sections_affected: array of section IDs that need regeneration
- continuity_notes: string (context for substitute caregivers about recent changes)`,
    guardrails: [
      'Never delete previous profile data — archive with timestamp',
      'Always attribute the source of new information',
      'Flag conflicting information for physician review',
      'Maintain HIPAA-compliant data handling at all times',
    ],
    tools: [
      { id: 'living-profile', name: 'Living Profile (3-Layer Memory)', requiresAuth: true },
      { id: 'fhir-sync', name: 'FHIR Health Record Sync', requiresAuth: true },
      { id: 'event-bus', name: 'CareOS Event Bus', requiresAuth: true },
    ],
    triggers: [
      {
        event: 'profile.updated',
        when: 'new_information_integrated',
        description: 'Living Profile updated — guide sections may need regeneration',
      },
      {
        event: 'guide.section_stale',
        when: 'profile_change_affects_guide',
        description: 'Guide section outdated due to profile change — regeneration queued',
      },
    ],
    pricing: {
      perUse: undefined,
      includedInSubscription: true,
      billingCodes: [],
    },
    landing: {
      title: 'Remember & Learn',
      description:
        'Sage remembers medication changes, new diagnoses, and routine updates across sessions — so your caregiver guide stays current as care needs evolve.',
      tag: 'Always learning',
      tagColor: '#8b7355',
      icon: 'memory',
    },
    requiresPhysicianReview: false,
    guideOrder: 5,
  },

  // ── 6. Appointment Monitoring (Conductor) ─────────────────────────
  {
    id: 'appointment-monitor',
    name: 'Appointment Monitoring',
    brand: 'co-op.care',
    domainPrompt: `You are the appointment monitoring and care navigation agent within the
co-op.care ecosystem. Track upcoming doctor visits, medication refill dates,
care milestones, and certification renewals. Alert the conductor (family
caregiver) before anything is missed.

When an appointment generates follow-up needs (new medication, specialist
referral, test results), route them to the appropriate Connector.

Output format:
- upcoming: array of {type, date, provider, location, prep_needed, transport}
- overdue: array of {type, was_due, provider, urgency}
- milestones: array of {milestone, target_date, status, notes}
- follow_ups: array of {from_visit, action_needed, routed_to_connector}`,
    guardrails: [
      'Never cancel or reschedule appointments — alert conductor only',
      'Always include transportation needs for each appointment',
      'Flag appointments that conflict with medication schedules',
      'Track specialist referral chains — ensure nothing falls through',
    ],
    tools: [
      { id: 'calendar-sync', name: 'Calendar Integration', requiresAuth: true },
      { id: 'fhir-appointments', name: 'FHIR Appointment Sync', requiresAuth: true },
      { id: 'notification-service', name: 'Notification Service', requiresAuth: true },
    ],
    triggers: [
      {
        event: 'billing.pin_g0023',
        when: 'care_navigation_followup',
        description: 'Post-appointment care navigation — PIN G0023 billable',
      },
      {
        event: 'notification.appointment_reminder',
        when: 'appointment_within_48hrs',
        description: 'Appointment within 48 hours — conductor and care team alerted',
      },
      {
        event: 'access.outcome_captured',
        when: 'milestone_tracked',
        description: 'Care milestone recorded — feeds ACCESS Cohort 1 outcome metrics',
      },
    ],
    pricing: {
      perUse: undefined,
      includedInSubscription: true,
      billingCodes: ['G0023'],
    },
    landing: {
      title: 'Appointment Monitoring',
      description:
        'Sage tracks upcoming doctor visits, medication refill dates, and care milestones — alerting you before anything is missed.',
      tag: 'Never miss a visit',
      tagColor: '#5a7049',
      icon: 'calendar',
    },
    requiresPhysicianReview: false,
    guideOrder: 6,
  },
];

// ─── Workflow Templates ─────────────────────────────────────────────

export const WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'caregiver-guide',
    name: 'Caregiver Guide',
    description:
      'Runs all 6 Connectors in sequence to produce a complete, physician-reviewed caregiver guide.',
    connectorSequence: CONNECTORS.filter((c) => c.guideOrder !== null)
      .sort((a, b) => (a.guideOrder ?? 0) - (b.guideOrder ?? 0))
      .map((c) => c.id),
    assemblyPrompt: `You are the guide assembly agent. You have received outputs from 6 Connector
agents: clinical research, care plan structuring, medication management,
HSA/FSA savings identification, memory/continuity, and appointment monitoring.

Assemble these outputs into a single, cohesive Caregiver Guide with these sections:
1. About [Name] — personal values, what makes a good day, comfort measures
2. Daily Schedule — morning through night routine with assistance levels
3. Medications — visual schedule, interactions, refill dates
4. Diet & Nutrition — restrictions, meal guidelines, hydration
5. Emergency Protocols — scenarios, contact order, hospital bag list
6. Appointments & Milestones — upcoming visits, follow-ups, care goals
7. HSA/FSA Savings — eligible expenses, estimated savings, LMN status
8. Care Team — who does what, schedules, contact info

The guide must be:
- Written for a substitute caregiver who has never met this person
- Printable on standard letter paper
- Warm and human — this is someone's parent, not a medical chart
- Updated date prominent at the top`,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

export function getConnector(id: string): ConnectorConfig | undefined {
  return CONNECTORS.find((c) => c.id === id);
}

export function getConnectorsByBrand(brand: ConnectorConfig['brand']): ConnectorConfig[] {
  return CONNECTORS.filter((c) => c.brand === brand);
}

export function getGuideConnectors(): ConnectorConfig[] {
  return CONNECTORS.filter((c) => c.guideOrder !== null).sort(
    (a, b) => (a.guideOrder ?? 0) - (b.guideOrder ?? 0),
  );
}

export function getWorkflow(id: string): WorkflowTemplate | undefined {
  return WORKFLOWS.find((w) => w.id === id);
}
