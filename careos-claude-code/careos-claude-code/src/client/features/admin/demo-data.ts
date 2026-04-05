/**
 * Client-Side Demo Data — Makes the dashboard self-explanatory
 *
 * When the backend isn't running, the dashboard auto-populates with
 * 12 realistic families so Josh can immediately understand the system.
 *
 * Distribution matches expected production:
 * - 7 auto-approved  (58%) — Josh never touches these
 * - 2 quick-review   (17%) — 30 sec glance
 * - 2 full-review    (17%) — 3-5 min read
 * - 1 clinical-hold  (8%)  — requires clinical decision
 */

// ─── Types ──────────────────────────────────────────────────────────────

export interface DemoReviewItem {
  id: string;
  familyId: string;
  priority: 'urgent' | 'elevated' | 'standard';
  status: string;
  acuity: string;
  recommendedTier: string;
  monthlyCost: number;
  estimatedHsaSavings: number;
  careRecipientName: string;
  careRecipientAge: number;
  careRecipientState: string;
  riskFlagCount: number;
  diagnosisCount: number;
  createdAt: string;
}

export interface DemoReviewDetail {
  id: string;
  draftText: string;
  riskFlags: string[];
  diagnosisCodes: string[];
  priority: string;
  status: string;
  careRecipientName: string;
  careRecipientAge: number;
  careRecipientState: string;
  monthlyCost: number;
  estimatedHsaSavings: number;
  recommendedTier: string;
  acuity: string;
}

export interface DemoAutoApprovedItem {
  id: string;
  familyId: string;
  careRecipientName: string;
  careRecipientAge: number;
  careRecipientState: string;
  recommendedTier: string;
  monthlyCost: number;
  estimatedHsaSavings: number;
  acuity: string;
  triage: {
    tier: string;
    riskScore: number;
    reason: string;
    joshTimeEstimate: string;
    gateResults: Array<{ gate: string; passed: boolean; value: string }>;
  };
  createdAt: string;
  reviewedAt: string;
}

export interface DemoTriageStats {
  total: number;
  autoApproved: number;
  pending: number;
  signed: number;
  rejected: number;
  autoApproveRate: number;
  estimatedJoshMinutesSaved: number;
}

export interface DemoSynthesisReport {
  timestamp: string;
  funnel: Record<string, number>;
  conversions: Record<string, number>;
  bottlenecks: Array<{
    stage: string;
    count: number;
    avgDaysStuck: number;
    recommendation: string;
  }>;
  revenue: { totalRevenue: number; lmnsPaid: number; lmnsPending: number; avgLmnValue: number };
  insights: string[];
  agentHealth: Array<{
    name: string;
    eventCount: number;
    errorRate: number;
    status: string;
    lastEventAt: string;
  }>;
}

// ─── Helper ─────────────────────────────────────────────────────────────

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function draftText(
  name: string,
  age: number,
  state: string,
  conditions: string[],
  meds: string[],
  cri: number,
  cii: number,
  ciiZone: string,
  tier: string,
  hours: number,
  cost: number,
  savings: number,
): string {
  return `LETTER OF MEDICAL NECESSITY

Date: ${new Date().toISOString().split('T')[0]}
Patient: ${name}
Age: ${age} | State: ${state}

CLINICAL ASSESSMENT:
${conditions.map((c) => `  • ${c}`).join('\n')}

Current Medications (${meds.length}):
${meds.map((m) => `  • ${m}`).join('\n')}

FUNCTIONAL STATUS:
  Care Recipient Index (CRI): ${cri}/50
  Caregiver Impact Index (CII): ${cii}/30 — ${ciiZone} zone

RECOMMENDED CARE PLAN:
  Tier: ${tier}
  Hours: ${hours} hrs/week
  Monthly Cost: $${cost}
  HSA/FSA Savings: $${savings}/mo (28-36% tax advantage)

MEDICAL NECESSITY DETERMINATION:
Based on clinical assessment, companion care services are medically
necessary for ${name} to maintain functional independence, ensure
medication compliance, prevent social isolation, and support the
family caregiver.

[Pending Physician Signature]
Joshua Emdur, DO — Medical Director, co-op.care`;
}

// ─── Gate Results Builder ───────────────────────────────────────────────

function allGatesPassed(
  age: number,
  meds: number,
  cri: number,
  ciiZone: string,
  hours: number,
): Array<{ gate: string; passed: boolean; value: string }> {
  return [
    { gate: 'Acuity Level', passed: cri >= 19 && cri <= 32, value: `CRI ${cri}/50` },
    { gate: 'Caregiver Stability', passed: ciiZone !== 'red', value: `CII ${ciiZone} zone` },
    { gate: 'Critical Risk Flags', passed: true, value: '0 critical flags' },
    { gate: 'Age Risk', passed: age < 85, value: `Age ${age}` },
    { gate: 'Medication Complexity', passed: meds <= 5, value: `${meds} medications` },
    { gate: 'Diagnosis Complexity', passed: true, value: 'All standard codes' },
    { gate: 'Care Intensity', passed: hours <= 12, value: `${hours} hrs/week` },
    { gate: 'Data Consistency', passed: true, value: 'No contradictions' },
  ];
}

// ─── Auto-Approved Families (7) ─────────────────────────────────────────

export const DEMO_AUTO_APPROVED: DemoAutoApprovedItem[] = [
  {
    id: 'demo-aa-1',
    familyId: 'demo-chen',
    careRecipientName: 'Margaret Chen',
    careRecipientAge: 76,
    careRecipientState: 'CO',
    recommendedTier: 'Regular Companion',
    monthlyCost: 832,
    estimatedHsaSavings: 291,
    acuity: 'moderate',
    triage: {
      tier: 'auto_approved',
      riskScore: 0,
      reason: 'All 8 safety gates passed. Standard moderate-acuity LMN with no clinical concerns.',
      joshTimeEstimate: '0 sec (auto-approved, daily digest)',
      gateResults: allGatesPassed(76, 2, 25, 'yellow', 8),
    },
    createdAt: hoursAgo(6),
    reviewedAt: hoursAgo(6),
  },
  {
    id: 'demo-aa-2',
    familyId: 'demo-johnson',
    careRecipientName: 'Robert Johnson',
    careRecipientAge: 72,
    careRecipientState: 'TX',
    recommendedTier: 'Peace of Mind',
    monthlyCost: 416,
    estimatedHsaSavings: 146,
    acuity: 'moderate',
    triage: {
      tier: 'auto_approved',
      riskScore: 0,
      reason: 'All 8 safety gates passed. Standard moderate-acuity LMN with no clinical concerns.',
      joshTimeEstimate: '0 sec (auto-approved, daily digest)',
      gateResults: allGatesPassed(72, 2, 23, 'green', 4),
    },
    createdAt: hoursAgo(5),
    reviewedAt: hoursAgo(5),
  },
  {
    id: 'demo-aa-3',
    familyId: 'demo-williams',
    careRecipientName: 'Dorothy Williams',
    careRecipientAge: 78,
    careRecipientState: 'FL',
    recommendedTier: 'Regular Companion',
    monthlyCost: 1040,
    estimatedHsaSavings: 364,
    acuity: 'moderate',
    triage: {
      tier: 'auto_approved',
      riskScore: 0,
      reason: 'All 8 safety gates passed. Standard moderate-acuity LMN with no clinical concerns.',
      joshTimeEstimate: '0 sec (auto-approved, daily digest)',
      gateResults: allGatesPassed(78, 3, 26, 'yellow', 10),
    },
    createdAt: hoursAgo(4),
    reviewedAt: hoursAgo(4),
  },
  {
    id: 'demo-aa-4',
    familyId: 'demo-garcia',
    careRecipientName: 'Elena Garcia',
    careRecipientAge: 70,
    careRecipientState: 'CA',
    recommendedTier: 'Peace of Mind',
    monthlyCost: 624,
    estimatedHsaSavings: 218,
    acuity: 'moderate',
    triage: {
      tier: 'auto_approved',
      riskScore: 0,
      reason: 'All 8 safety gates passed. Standard moderate-acuity LMN with no clinical concerns.',
      joshTimeEstimate: '0 sec (auto-approved, daily digest)',
      gateResults: allGatesPassed(70, 1, 21, 'yellow', 6),
    },
    createdAt: hoursAgo(3.5),
    reviewedAt: hoursAgo(3.5),
  },
  {
    id: 'demo-aa-5',
    familyId: 'demo-patel',
    careRecipientName: 'Raj Patel',
    careRecipientAge: 74,
    careRecipientState: 'NJ',
    recommendedTier: 'Regular Companion',
    monthlyCost: 832,
    estimatedHsaSavings: 291,
    acuity: 'moderate',
    triage: {
      tier: 'auto_approved',
      riskScore: 0,
      reason: 'All 8 safety gates passed. Standard moderate-acuity LMN with no clinical concerns.',
      joshTimeEstimate: '0 sec (auto-approved, daily digest)',
      gateResults: allGatesPassed(74, 3, 23, 'green', 8),
    },
    createdAt: hoursAgo(3),
    reviewedAt: hoursAgo(3),
  },
  {
    id: 'demo-aa-6',
    familyId: 'demo-anderson',
    careRecipientName: 'Betty Anderson',
    careRecipientAge: 80,
    careRecipientState: 'AZ',
    recommendedTier: 'Regular Companion',
    monthlyCost: 832,
    estimatedHsaSavings: 291,
    acuity: 'moderate',
    triage: {
      tier: 'auto_approved',
      riskScore: 0,
      reason:
        'Renewal with stable trajectory. Previously reviewed and approved. All 8 safety gates passed.',
      joshTimeEstimate: '0 sec (auto-approved renewal, daily digest)',
      gateResults: allGatesPassed(80, 3, 22, 'green', 8),
    },
    createdAt: hoursAgo(2),
    reviewedAt: hoursAgo(2),
  },
  {
    id: 'demo-aa-7',
    familyId: 'demo-kim',
    careRecipientName: 'Soo-Jin Kim',
    careRecipientAge: 73,
    careRecipientState: 'WA',
    recommendedTier: 'Peace of Mind',
    monthlyCost: 624,
    estimatedHsaSavings: 218,
    acuity: 'moderate',
    triage: {
      tier: 'auto_approved',
      riskScore: 0,
      reason: 'All 8 safety gates passed. Standard moderate-acuity LMN with no clinical concerns.',
      joshTimeEstimate: '0 sec (auto-approved, daily digest)',
      gateResults: allGatesPassed(73, 2, 22, 'yellow', 6),
    },
    createdAt: hoursAgo(1),
    reviewedAt: hoursAgo(1),
  },
];

// ─── Pending Review Families (5) ────────────────────────────────────────

export const DEMO_REVIEW_QUEUE: DemoReviewItem[] = [
  // CLINICAL HOLD — Walter Crawford (urgent)
  {
    id: 'demo-rq-1',
    familyId: 'demo-crawford',
    priority: 'urgent',
    status: 'pending',
    acuity: 'critical',
    recommendedTier: 'Full-Time Companion',
    monthlyCost: 3120,
    estimatedHsaSavings: 1092,
    careRecipientName: 'Walter Crawford',
    careRecipientAge: 91,
    careRecipientState: 'IL',
    riskFlagCount: 5,
    diagnosisCount: 5,
    createdAt: hoursAgo(1),
  },
  // FULL REVIEW — Charles Washington (elevated)
  {
    id: 'demo-rq-2',
    familyId: 'demo-washington',
    priority: 'elevated',
    status: 'pending',
    acuity: 'moderate',
    recommendedTier: 'Extended Companion',
    monthlyCost: 1664,
    estimatedHsaSavings: 582,
    careRecipientName: 'Charles Washington',
    careRecipientAge: 82,
    careRecipientState: 'GA',
    riskFlagCount: 2,
    diagnosisCount: 3,
    createdAt: hoursAgo(2),
  },
  // FULL REVIEW — Evelyn Baker (elevated)
  {
    id: 'demo-rq-3',
    familyId: 'demo-baker',
    priority: 'elevated',
    status: 'pending',
    acuity: 'moderate',
    recommendedTier: 'Extended Companion',
    monthlyCost: 1456,
    estimatedHsaSavings: 510,
    careRecipientName: 'Evelyn Baker',
    careRecipientAge: 88,
    careRecipientState: 'PA',
    riskFlagCount: 2,
    diagnosisCount: 3,
    createdAt: hoursAgo(3),
  },
  // QUICK REVIEW — Harold Thompson (standard)
  {
    id: 'demo-rq-4',
    familyId: 'demo-thompson',
    priority: 'standard',
    status: 'pending',
    acuity: 'moderate',
    recommendedTier: 'Regular Companion',
    monthlyCost: 1040,
    estimatedHsaSavings: 364,
    careRecipientName: 'Harold Thompson',
    careRecipientAge: 87,
    careRecipientState: 'OH',
    riskFlagCount: 1,
    diagnosisCount: 2,
    createdAt: hoursAgo(4),
  },
  // QUICK REVIEW — Carmen Martinez (standard)
  {
    id: 'demo-rq-5',
    familyId: 'demo-martinez',
    priority: 'standard',
    status: 'pending',
    acuity: 'moderate',
    recommendedTier: 'Regular Companion',
    monthlyCost: 1040,
    estimatedHsaSavings: 364,
    careRecipientName: 'Carmen Martinez',
    careRecipientAge: 79,
    careRecipientState: 'NM',
    riskFlagCount: 1,
    diagnosisCount: 3,
    createdAt: hoursAgo(5),
  },
];

// ─── Review Detail (full LMN text for each pending item) ────────────────

export const DEMO_REVIEW_DETAILS: Record<string, DemoReviewDetail> = {
  'demo-rq-1': {
    id: 'demo-rq-1',
    priority: 'urgent',
    status: 'pending',
    acuity: 'critical',
    careRecipientName: 'Walter Crawford',
    careRecipientAge: 91,
    careRecipientState: 'IL',
    recommendedTier: 'Full-Time Companion',
    monthlyCost: 3120,
    estimatedHsaSavings: 1092,
    riskFlags: [
      'CRITICAL_FALL_RISK',
      'WHEELCHAIR_DEPENDENT',
      'SEVERE_MOBILITY',
      'POLYPHARMACY',
      'COLLAPSE_RISK',
    ],
    diagnosisCodes: ['G20', 'R13.10', 'G89.4', 'I50.9', 'W19.XXXA'],
    draftText: draftText(
      'Walter Crawford',
      91,
      'IL',
      [
        "Advanced Parkinson's disease",
        'Dysphagia (swallowing difficulty)',
        'Chronic pain syndrome',
        'Heart failure (NYHA Class III)',
        'Recurrent falls (3+ in past 6 months)',
      ],
      [
        'Carbidopa-levodopa 25/100',
        'Entacapone 200mg',
        'Oxycodone 5mg PRN',
        'Furosemide 40mg',
        'Lisinopril 20mg',
        'Metoprolol 50mg',
        'Gabapentin 300mg',
        'Omeprazole 20mg',
      ],
      42,
      24,
      'RED',
      'Full-Time Companion',
      30,
      3120,
      1092,
    ),
  },
  'demo-rq-2': {
    id: 'demo-rq-2',
    priority: 'elevated',
    status: 'pending',
    acuity: 'moderate',
    careRecipientName: 'Charles Washington',
    careRecipientAge: 82,
    careRecipientState: 'GA',
    recommendedTier: 'Extended Companion',
    monthlyCost: 1664,
    estimatedHsaSavings: 582,
    riskFlags: ['FALL_RISK_SEVERE', 'WHEELCHAIR_DEPENDENT'],
    diagnosisCodes: ['G20', 'F32.1', 'W19.XXXA'],
    draftText: draftText(
      'Charles Washington',
      82,
      'GA',
      [
        "Parkinson's disease (diagnosed 2019)",
        'Major depressive disorder',
        'Fall history — 3 falls in past year',
      ],
      ['Carbidopa-levodopa 25/250', 'Pramipexole 1mg', 'Sertraline 100mg', 'Melatonin 5mg'],
      32,
      18,
      'yellow',
      'Extended Companion',
      16,
      1664,
      582,
    ),
  },
  'demo-rq-3': {
    id: 'demo-rq-3',
    priority: 'elevated',
    status: 'pending',
    acuity: 'moderate',
    careRecipientName: 'Evelyn Baker',
    careRecipientAge: 88,
    careRecipientState: 'PA',
    recommendedTier: 'Extended Companion',
    monthlyCost: 1456,
    estimatedHsaSavings: 510,
    riskFlags: ['FALL_RISK_SEVERE', 'POLYPHARMACY'],
    diagnosisCodes: ['I50.9', 'N18.3', 'I48.91'],
    draftText: draftText(
      'Evelyn Baker',
      88,
      'PA',
      [
        'Heart failure (compensated)',
        'Chronic kidney disease stage 3',
        'Atrial fibrillation (controlled)',
      ],
      [
        'Furosemide 40mg',
        'Lisinopril 20mg',
        'Warfarin (INR-monitored)',
        'Metoprolol 25mg',
        'Potassium 20mEq',
        'Digoxin 0.125mg',
      ],
      31,
      15,
      'yellow',
      'Extended Companion',
      14,
      1456,
      510,
    ),
  },
  'demo-rq-4': {
    id: 'demo-rq-4',
    priority: 'standard',
    status: 'pending',
    acuity: 'moderate',
    careRecipientName: 'Harold Thompson',
    careRecipientAge: 87,
    careRecipientState: 'OH',
    recommendedTier: 'Regular Companion',
    monthlyCost: 1040,
    estimatedHsaSavings: 364,
    riskFlags: ['FALL_RISK_MODERATE'],
    diagnosisCodes: ['G31.84', 'J44.9'],
    draftText: draftText(
      'Harold Thompson',
      87,
      'OH',
      ['Mild cognitive decline', 'COPD (stable, controlled)'],
      ['Albuterol inhaler PRN', 'Donepezil 5mg', 'Aspirin 81mg'],
      24,
      10,
      'green',
      'Regular Companion',
      10,
      1040,
      364,
    ),
  },
  'demo-rq-5': {
    id: 'demo-rq-5',
    priority: 'standard',
    status: 'pending',
    acuity: 'moderate',
    careRecipientName: 'Carmen Martinez',
    careRecipientAge: 79,
    careRecipientState: 'NM',
    recommendedTier: 'Regular Companion',
    monthlyCost: 1040,
    estimatedHsaSavings: 364,
    riskFlags: ['POLYPHARMACY'],
    diagnosisCodes: ['M06.9', 'I10', 'E03.9'],
    draftText: draftText(
      'Carmen Martinez',
      79,
      'NM',
      ['Rheumatoid arthritis (moderate)', 'Hypertension', 'Hypothyroidism'],
      [
        'Methotrexate 15mg weekly',
        'Losartan 50mg',
        'Levothyroxine 75mcg',
        'Folic acid 1mg',
        'Calcium 600mg',
        'Omeprazole 20mg',
      ],
      25,
      12,
      'yellow',
      'Regular Companion',
      10,
      1040,
      364,
    ),
  },
};

// ─── Triage Stats ───────────────────────────────────────────────────────

export const DEMO_TRIAGE_STATS: DemoTriageStats = {
  total: 12,
  autoApproved: 7,
  pending: 5,
  signed: 0,
  rejected: 0,
  autoApproveRate: 0.583,
  estimatedJoshMinutesSaved: 21, // 7 auto-approved × 3 min each
};

// ─── Synthesis Report ───────────────────────────────────────────────────

export const DEMO_SYNTHESIS: DemoSynthesisReport = {
  timestamp: new Date().toISOString(),
  funnel: {
    discovered: 18,
    profiling: 14,
    assessing: 12,
    lmn_eligible: 12,
    lmn_review: 5,
    lmn_signed: 7,
    active_lmn: 4,
    care_matched: 2,
    active_care: 2,
    renewal: 1,
  },
  conversions: {
    'discovered → profiling': 0.78,
    'profiling → assessing': 0.86,
    'assessing → lmn_eligible': 1.0,
    'lmn_eligible → lmn_review': 1.0,
    'lmn_review → lmn_signed': 0.58,
  },
  bottlenecks: [
    {
      stage: 'profiling',
      count: 4,
      avgDaysStuck: 3.2,
      recommendation:
        "Sage needs more data — consider proactive follow-up messages to families who haven't responded in 48hrs",
    },
  ],
  revenue: {
    totalRevenue: 2100,
    lmnsPaid: 7,
    lmnsPending: 5,
    avgLmnValue: 200,
  },
  insights: [
    '58% of LMNs auto-approved — Josh saved ~21 minutes today',
    'Colorado families convert 2.3× faster than out-of-state (in-person Sage conversations)',
    'Average CII score trending up (12.4 → 14.1) — caregivers reaching out later, consider earlier outreach',
    'Renewal auto-approval rate is 92% — stable families rarely need re-review',
    'Walter Crawford (clinical hold) may need referral to home health agency — exceeds companion care scope',
  ],
  agentHealth: [
    {
      name: 'profile-builder',
      eventCount: 47,
      errorRate: 0,
      status: 'HEALTHY',
      lastEventAt: hoursAgo(0.1),
    },
    {
      name: 'assessor',
      eventCount: 31,
      errorRate: 0,
      status: 'HEALTHY',
      lastEventAt: hoursAgo(0.3),
    },
    {
      name: 'lmn-trigger',
      eventCount: 12,
      errorRate: 0,
      status: 'HEALTHY',
      lastEventAt: hoursAgo(0.5),
    },
    {
      name: 'review-router',
      eventCount: 12,
      errorRate: 0,
      status: 'HEALTHY',
      lastEventAt: hoursAgo(0.5),
    },
    { name: 'billing', eventCount: 7, errorRate: 0, status: 'HEALTHY', lastEventAt: hoursAgo(1) },
    {
      name: 'synthesis',
      eventCount: 109,
      errorRate: 0.009,
      status: 'HEALTHY',
      lastEventAt: hoursAgo(0.01),
    },
  ],
};

// ─── Agent Status ───────────────────────────────────────────────────────

export const DEMO_AGENT_STATUS = {
  status: 'online',
  agents: DEMO_SYNTHESIS.agentHealth,
  timestamp: new Date().toISOString(),
};
