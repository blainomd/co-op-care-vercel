/**
 * LMNGenerator — Autonomous Letter of Medical Necessity generation and review
 *
 * Dual-view component:
 *   1. Family View (Alpha Daughter): status tracker, savings estimate, download
 *   2. Physician View (Josh's Review Queue): priority queue, approve/reject, stats
 *
 * Revenue engine flow:
 *   Sage conversation → Living Profile → CII + CRI assessments → auto-draft LMN
 *   → Josh's Review Queue (3-5 min review) → signed → HSA/FSA unlocked ($150-$300)
 *
 * Demo mode: works standalone with mock data, no backend required.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────

interface CareRecipient {
  name: string;
  age: number;
  conditions: string[];
  mobilityLevel: string;
}

interface Caregiver {
  name: string;
  relationship: string;
  ciiScore: number;
  ciiZone: 'green' | 'yellow' | 'red';
}

interface OmahaProblem {
  code: string;
  name: string;
  domain: string;
  kbs?: number;
}

interface LMNDraft {
  id: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'signed' | 'delivered';
  createdAt: Date;
  familyName: string;
  careRecipient: CareRecipient;
  caregiver: Caregiver;
  criScore: number;
  omahaProblems: OmahaProblem[];
  recommendedTier: string;
  recommendedHours: number;
  monthlyCost: number;
  hsaSavings: number;
  draftText: string;
  physicianNotes?: string;
  signedAt?: Date;
  signedBy?: string;
  state: string;
}

type ViewMode = 'family' | 'physician';

// ─── Mock Data ──────────────────────────────────────────────────────────

const MOCK_LMNS: LMNDraft[] = [
  {
    id: 'LMN-2026-0147',
    status: 'pending_review',
    createdAt: new Date('2026-03-13T14:32:00'),
    familyName: 'Morales',
    careRecipient: {
      name: 'Elena Morales',
      age: 81,
      conditions: [
        'Moderate dementia (F03.90)',
        'Type 2 diabetes (E11.9)',
        'Osteoarthritis bilateral knees (M17.0)',
        'Chronic kidney disease stage 3 (N18.3)',
      ],
      mobilityLevel: 'Requires walker, fall risk',
    },
    caregiver: {
      name: 'Sofia Morales-Chen',
      relationship: 'Daughter',
      ciiScore: 24,
      ciiZone: 'red',
    },
    criScore: 38,
    omahaProblems: [
      { code: 'H27', name: 'Cognition', domain: 'Health-related Behaviors', kbs: 2 },
      { code: 'H18', name: 'Neuro-musculo-skeletal function', domain: 'Physiological', kbs: 2 },
      { code: 'B40', name: 'Medication regimen', domain: 'Health-related Behaviors', kbs: 3 },
      { code: 'B36', name: 'Personal care', domain: 'Health-related Behaviors', kbs: 2 },
      { code: 'P06', name: 'Social contact', domain: 'Psychosocial', kbs: 2 },
      { code: 'E03', name: 'Residence', domain: 'Environmental', kbs: 3 },
    ],
    recommendedTier: 'Daily Companion',
    recommendedHours: 25,
    monthlyCost: 2750,
    hsaSavings: 990,
    draftText: generateMockDraftText('Elena Morales', 81, 38, 'critical', [
      'Moderate dementia (F03.90)',
      'Type 2 diabetes (E11.9)',
      'Osteoarthritis bilateral knees (M17.0)',
      'Chronic kidney disease stage 3 (N18.3)',
    ]),
    state: 'CO',
  },
  {
    id: 'LMN-2026-0148',
    status: 'signed',
    createdAt: new Date('2026-03-11T09:15:00'),
    familyName: 'Blackwell',
    careRecipient: {
      name: 'Robert Blackwell',
      age: 74,
      conditions: [
        "Parkinson's disease (G20)",
        'Major depressive disorder (F32.1)',
        'Essential hypertension (I10)',
      ],
      mobilityLevel: 'Ambulatory with assistance, freezing episodes',
    },
    caregiver: {
      name: 'Diana Blackwell',
      relationship: 'Spouse',
      ciiScore: 19,
      ciiZone: 'yellow',
    },
    criScore: 29,
    omahaProblems: [
      { code: 'H18', name: 'Neuro-musculo-skeletal function', domain: 'Physiological', kbs: 2 },
      { code: 'B40', name: 'Medication regimen', domain: 'Health-related Behaviors', kbs: 3 },
      { code: 'P06', name: 'Social contact', domain: 'Psychosocial', kbs: 2 },
      { code: 'B39', name: 'Health care supervision', domain: 'Health-related Behaviors', kbs: 3 },
    ],
    recommendedTier: 'Regular Companion',
    recommendedHours: 15,
    monthlyCost: 1650,
    hsaSavings: 594,
    draftText: generateMockDraftText('Robert Blackwell', 74, 29, 'high', [
      "Parkinson's disease (G20)",
      'Major depressive disorder (F32.1)',
      'Essential hypertension (I10)',
    ]),
    signedAt: new Date('2026-03-11T10:02:00'),
    signedBy: 'Joshua Emdur, DO',
    state: 'CO',
  },
  {
    id: 'LMN-2026-0149',
    status: 'pending_review',
    createdAt: new Date('2026-03-14T08:45:00'),
    familyName: 'Nakamura',
    careRecipient: {
      name: 'Yuki Nakamura',
      age: 88,
      conditions: [
        "Alzheimer's disease (G30.9)",
        'Atrial fibrillation (I48.91)',
        'Osteoporosis (M81.0)',
        'Chronic pain syndrome (G89.4)',
      ],
      mobilityLevel: 'Wheelchair-dependent, transfer assistance required',
    },
    caregiver: {
      name: 'Kenji Nakamura',
      relationship: 'Son',
      ciiScore: 22,
      ciiZone: 'red',
    },
    criScore: 42,
    omahaProblems: [
      { code: 'H27', name: 'Cognition', domain: 'Health-related Behaviors', kbs: 1 },
      { code: 'H18', name: 'Neuro-musculo-skeletal function', domain: 'Physiological', kbs: 1 },
      { code: 'B40', name: 'Medication regimen', domain: 'Health-related Behaviors', kbs: 2 },
      { code: 'B36', name: 'Personal care', domain: 'Health-related Behaviors', kbs: 1 },
      { code: 'P06', name: 'Social contact', domain: 'Psychosocial', kbs: 2 },
      { code: 'E03', name: 'Residence', domain: 'Environmental', kbs: 2 },
      { code: 'B39', name: 'Health care supervision', domain: 'Health-related Behaviors', kbs: 2 },
    ],
    recommendedTier: 'Intensive Companion',
    recommendedHours: 35,
    monthlyCost: 3850,
    hsaSavings: 1386,
    draftText: generateMockDraftText('Yuki Nakamura', 88, 42, 'critical', [
      "Alzheimer's disease (G30.9)",
      'Atrial fibrillation (I48.91)',
      'Osteoporosis (M81.0)',
      'Chronic pain syndrome (G89.4)',
    ]),
    state: 'AZ',
  },
];

function generateMockDraftText(
  name: string,
  age: number,
  criScore: number,
  acuity: string,
  conditions: string[],
): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `LETTER OF MEDICAL NECESSITY

Date: ${date}
Patient: ${name}, Age ${age}
Issuing Physician: Joshua Emdur, DO
NPI: [NPI on file]
Medical Licenses: All 50 states + DC

TO WHOM IT MAY CONCERN:

I am writing to certify that ${name}, age ${age}, requires medically necessary in-home companion and personal care services. This determination is based on a comprehensive clinical assessment conducted through the co-op.care Care Readiness Index (CRI) evaluation system.

CLINICAL ASSESSMENT:
Care Readiness Index (CRI) Score: ${criScore}/50 — ${acuity.toUpperCase()} acuity
This score reflects ${acuity === 'critical' ? 'critical care needs requiring intensive daily support' : 'significant care needs requiring structured ongoing assistance'}.

DIAGNOSES:
${conditions.map((c) => `  - ${c}`).join('\n')}

MEDICAL NECESSITY DETERMINATION:
Based on the clinical assessment, the above diagnoses, and the documented functional limitations, I certify that in-home companion and personal care services are medically necessary for this patient. Without these services, the patient faces increased risk of:
  - Hospitalization or emergency department utilization
  - Accelerated functional and cognitive decline
  - Caregiver burnout and collapse of the informal support network
  - Adverse health events including falls, medication errors, and nutritional deficiency

These services qualify as medical care expenses under IRS Publication 502 and are eligible for Health Savings Account (HSA) and Flexible Spending Account (FSA) distribution.

IRS PUBLICATION 502 QUALIFYING CATEGORIES:
  - Nursing services (non-RN personal care assistance)
  - Long-term care services (chronically ill individual)
  - Home health aide services prescribed by a physician

This letter is valid for 365 days from date of issuance. A reassessment will be required prior to expiration.

Respectfully,

Joshua Emdur, DO
Chief Medical Officer, co-op.care
Board Certified — Internal Medicine`;
}

// ─── Utility Helpers ────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const CII_ZONE_STYLES = {
  green: {
    bg: 'bg-zone-green/10',
    text: 'text-zone-green',
    dot: 'bg-zone-green',
    label: 'Manageable',
  },
  yellow: {
    bg: 'bg-zone-yellow/10',
    text: 'text-yellow-700',
    dot: 'bg-zone-yellow',
    label: 'Strained',
  },
  red: { bg: 'bg-zone-red/10', text: 'text-zone-red', dot: 'bg-zone-red', label: 'Crisis' },
} as const;

const STATUS_CONFIG = {
  draft: { label: 'Draft Generated', color: 'text-text-muted', bg: 'bg-warm-gray', step: 0 },
  pending_review: {
    label: 'Under Review',
    color: 'text-[#C49B40]',
    bg: 'bg-[#C49B40]/10',
    step: 1,
  },
  approved: { label: 'Approved', color: 'text-[#2BA5A0]', bg: 'bg-[#2BA5A0]/10', step: 2 },
  rejected: { label: 'Needs Revision', color: 'text-zone-red', bg: 'bg-zone-red/10', step: -1 },
  signed: { label: 'Signed', color: 'text-[#2BA5A0]', bg: 'bg-[#2BA5A0]/10', step: 3 },
  delivered: { label: 'Delivered', color: 'text-[#1B3A5C]', bg: 'bg-[#1B3A5C]/10', step: 4 },
} as const;

// ─── Family View ────────────────────────────────────────────────────────

function FamilyLMNView({ lmn }: { lmn: LMNDraft }) {
  const config = STATUS_CONFIG[lmn.status];
  const savingsPercent = Math.round((lmn.hsaSavings / lmn.monthlyCost) * 100);
  const isSigned = lmn.status === 'signed' || lmn.status === 'delivered';

  const steps = [
    { label: 'Draft Generated', done: config.step >= 0 },
    { label: 'Under Review', done: config.step >= 1 },
    { label: 'Signed by Dr. Emdur', done: config.step >= 3 },
    { label: 'Delivered to You', done: config.step >= 4 },
  ];

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-[#1B3A5C]">
              Your Letter of Medical Necessity
            </h3>
            <p className="mt-0.5 text-sm text-text-secondary">
              For {lmn.careRecipient.name}'s care
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
        </div>

        {/* Progress Steps */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-500 ${
                      step.done
                        ? 'bg-[#2BA5A0] text-white'
                        : 'border-2 border-gray-200 text-text-muted'
                    }`}
                  >
                    {step.done ? (
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] leading-tight text-center max-w-[60px] ${step.done ? 'text-[#2BA5A0] font-medium' : 'text-text-muted'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-8 sm:w-12 transition-all duration-500 ${step.done ? 'bg-[#2BA5A0]' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Card */}
      <div className="rounded-2xl border border-[#C49B40]/20 bg-[#C49B40]/5 p-5">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-[#C49B40]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h4 className="font-heading text-sm font-semibold text-[#C49B40]">
            HSA/FSA Savings Estimate
          </h4>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-[#1B3A5C]">${lmn.monthlyCost.toLocaleString()}</p>
            <p className="text-[10px] text-text-muted">Monthly cost</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#2BA5A0]">-${lmn.hsaSavings.toLocaleString()}</p>
            <p className="text-[10px] text-text-muted">HSA/FSA savings</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#C49B40]">{savingsPercent}%</p>
            <p className="text-[10px] text-text-muted">You save</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-text-secondary">
          Your LMN makes companion care services eligible for pre-tax HSA/FSA dollars under IRS
          Publication 502. Actual savings depend on your tax bracket (est. 28-36%).
        </p>
      </div>

      {/* Download / Action */}
      {isSigned && (
        <div className="rounded-2xl border border-[#2BA5A0]/20 bg-[#2BA5A0]/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2BA5A0]">Signed by {lmn.signedBy}</p>
              <p className="text-xs text-text-secondary">
                {lmn.signedAt ? formatDate(lmn.signedAt) : ''}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#2BA5A0] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#238F8A] active:scale-95"
            >
              Download PDF
            </button>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Submit this letter to your HSA/FSA administrator to begin using pre-tax funds for your
            companion care services.
          </p>
        </div>
      )}

      {/* Care Details Summary */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Care Details
        </h4>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Care recipient</span>
            <span className="font-medium text-[#1B3A5C]">
              {lmn.careRecipient.name}, {lmn.careRecipient.age}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Recommended tier</span>
            <span className="font-medium text-[#1B3A5C]">{lmn.recommendedTier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Weekly hours</span>
            <span className="font-medium text-[#1B3A5C]">{lmn.recommendedHours} hrs/wk</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Conditions documented</span>
            <span className="font-medium text-[#1B3A5C]">
              {lmn.careRecipient.conditions.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">State</span>
            <span className="font-medium text-[#1B3A5C]">{lmn.state}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Physician Review Queue ─────────────────────────────────────────────

interface ReviewAction {
  lmnId: string;
  action: 'approved' | 'rejected';
  notes?: string;
  timestamp: Date;
}

function PhysicianQueue({
  lmns,
  onAction,
}: {
  lmns: LMNDraft[];
  onAction: (lmnId: string, action: 'approved' | 'rejected', notes?: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [reviewTimer, setReviewTimer] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [reviewLog, setReviewLog] = useState<ReviewAction[]>([]);

  // Sort: Red Zone CII first, then by CRI descending
  const sortedLmns = useMemo(() => {
    const pending = lmns.filter((l) => l.status === 'pending_review');
    const rest = lmns.filter((l) => l.status !== 'pending_review');
    pending.sort((a, b) => {
      const zoneOrder = { red: 0, yellow: 1, green: 2 };
      const zoneDiff = zoneOrder[a.caregiver.ciiZone] - zoneOrder[b.caregiver.ciiZone];
      if (zoneDiff !== 0) return zoneDiff;
      return b.criScore - a.criScore;
    });
    return [...pending, ...rest];
  }, [lmns]);

  const pendingCount = lmns.filter((l) => l.status === 'pending_review').length;
  const reviewedToday = reviewLog.length;
  const approvalRate =
    reviewLog.length > 0
      ? Math.round(
          (reviewLog.filter((r) => r.action === 'approved').length / reviewLog.length) * 100,
        )
      : 100;
  const avgReviewTime = reviewLog.length > 0 ? Math.round(180 + Math.random() * 60) : 0;

  // Review timer
  useEffect(() => {
    if (expandedId) {
      setReviewTimer(0);
      timerRef.current = setInterval(() => setReviewTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expandedId]);

  const handleAction = useCallback(
    (lmnId: string, action: 'approved' | 'rejected', notes?: string) => {
      setReviewLog((prev) => [...prev, { lmnId, action, notes, timestamp: new Date() }]);
      onAction(lmnId, action, notes);
      setExpandedId(null);
      setRejectNotes('');
    },
    [onAction],
  );

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-[#1B3A5C]">{pendingCount}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Pending
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-[#2BA5A0]">{reviewedToday}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Reviewed
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-[#C49B40]">{approvalRate}%</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Approved
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-[#1B3A5C]">
            {avgReviewTime > 0
              ? `${Math.floor(avgReviewTime / 60)}:${(avgReviewTime % 60).toString().padStart(2, '0')}`
              : '--:--'}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Avg Time
          </p>
        </div>
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {sortedLmns.map((lmn) => {
          const isPending = lmn.status === 'pending_review';
          const isExpanded = expandedId === lmn.id;
          const ciiStyle = CII_ZONE_STYLES[lmn.caregiver.ciiZone];
          const statusCfg = STATUS_CONFIG[lmn.status];

          return (
            <div
              key={lmn.id}
              className={`rounded-2xl border bg-white transition-all duration-300 ${
                isPending
                  ? lmn.caregiver.ciiZone === 'red'
                    ? 'border-zone-red/30 shadow-md'
                    : 'border-[#C49B40]/20 shadow-sm'
                  : 'border-border opacity-75'
              } ${isExpanded ? 'ring-2 ring-[#2BA5A0]/30' : ''}`}
            >
              {/* Card Header */}
              <button
                type="button"
                onClick={() => isPending && setExpandedId(isExpanded ? null : lmn.id)}
                className="w-full p-4 text-left"
                disabled={!isPending}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isPending && lmn.caregiver.ciiZone === 'red' && (
                        <span className="flex h-2 w-2">
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-zone-red opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-zone-red" />
                        </span>
                      )}
                      <h4 className="font-heading text-base font-semibold text-[#1B3A5C]">
                        {lmn.careRecipient.name}
                      </h4>
                      <span className="text-xs text-text-muted">{lmn.id}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {lmn.careRecipient.age}yo · {lmn.careRecipient.mobilityLevel} · {lmn.state}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusCfg.bg} ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                    <span className="text-[10px] text-text-muted">{timeAgo(lmn.createdAt)}</span>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="mt-3 flex items-center gap-3">
                  {/* CII Badge */}
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${ciiStyle.bg} ${ciiStyle.text}`}
                  >
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${ciiStyle.dot}`} />
                    CII {lmn.caregiver.ciiScore}/30 · {ciiStyle.label}
                  </div>
                  {/* CRI Badge */}
                  <div
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      lmn.criScore >= 33
                        ? 'bg-zone-red/10 text-zone-red'
                        : lmn.criScore >= 19
                          ? 'bg-zone-yellow/10 text-yellow-700'
                          : 'bg-zone-green/10 text-zone-green'
                    }`}
                  >
                    CRI {lmn.criScore}/50
                  </div>
                  {/* Tier */}
                  <span className="text-[10px] text-text-muted">
                    {lmn.recommendedTier} · {lmn.recommendedHours}h/wk
                  </span>
                </div>
              </button>

              {/* Expanded Review Panel */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3 animate-in fade-in duration-200">
                  {/* Review Timer */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                      Review Time
                    </span>
                    <span
                      className={`font-mono text-sm font-semibold ${reviewTimer > 300 ? 'text-zone-red' : 'text-[#2BA5A0]'}`}
                    >
                      {formatTimer(reviewTimer)}
                    </span>
                  </div>

                  {/* Clinical Summary */}
                  <div className="space-y-3">
                    {/* Conditions */}
                    <div>
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Diagnoses
                      </h5>
                      <div className="mt-1 space-y-0.5">
                        {lmn.careRecipient.conditions.map((c) => (
                          <p key={c} className="text-xs text-text-secondary">
                            {c}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Omaha Problems */}
                    <div>
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Omaha Problems Detected
                      </h5>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {lmn.omahaProblems.map((p) => (
                          <span
                            key={p.code}
                            className="rounded-full bg-[#1B3A5C]/5 px-2 py-0.5 text-[10px] font-medium text-[#1B3A5C]"
                          >
                            {p.code}: {p.name}
                            {p.kbs !== undefined && (
                              <span
                                className={`ml-1 ${p.kbs <= 2 ? 'text-zone-red' : 'text-text-muted'}`}
                              >
                                KBS {p.kbs}/5
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Caregiver Burnout */}
                    <div className={`rounded-lg p-2.5 ${ciiStyle.bg}`}>
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Caregiver Burnout
                      </h5>
                      <p className={`mt-0.5 text-sm font-semibold ${ciiStyle.text}`}>
                        {lmn.caregiver.name} ({lmn.caregiver.relationship}) — CII{' '}
                        {lmn.caregiver.ciiScore}/30
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        {lmn.caregiver.ciiZone === 'red'
                          ? 'Caregiver is in crisis. Immediate respite support recommended.'
                          : lmn.caregiver.ciiZone === 'yellow'
                            ? 'Caregiver is strained. Regular companion support will reduce burnout risk.'
                            : 'Caregiver is managing. Companion visits will help maintain balance.'}
                      </p>
                    </div>

                    {/* Recommendation */}
                    <div className="rounded-lg bg-[#2BA5A0]/5 p-2.5">
                      <h5 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Recommendation
                      </h5>
                      <p className="mt-0.5 text-sm font-medium text-[#1B3A5C]">
                        {lmn.recommendedTier} — {lmn.recommendedHours} hours/week — $
                        {lmn.monthlyCost.toLocaleString()}/mo
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        HSA/FSA savings: ~${lmn.hsaSavings.toLocaleString()}/mo (
                        {Math.round((lmn.hsaSavings / lmn.monthlyCost) * 100)}%)
                      </p>
                    </div>

                    {/* Draft Text (collapsible) */}
                    <details className="group">
                      <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[#2BA5A0] hover:text-[#238F8A]">
                        View Full LMN Draft
                      </summary>
                      <pre className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-3 text-[11px] leading-relaxed text-text-secondary whitespace-pre-wrap font-sans">
                        {lmn.draftText}
                      </pre>
                    </details>

                    {/* Risk Flags */}
                    {(lmn.caregiver.ciiZone === 'red' || lmn.criScore >= 33) && (
                      <div className="rounded-lg border border-zone-red/20 bg-zone-red/5 p-2.5">
                        <h5 className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zone-red">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Risk Flags
                        </h5>
                        <ul className="mt-1 space-y-0.5 text-[10px] text-zone-red">
                          {lmn.caregiver.ciiZone === 'red' && (
                            <li>
                              Caregiver burnout in RED ZONE — high risk of care network collapse
                            </li>
                          )}
                          {lmn.criScore >= 40 && (
                            <li>
                              CRI score {lmn.criScore}/50 — critical acuity, may need escalation
                              beyond companion care
                            </li>
                          )}
                          {lmn.criScore >= 33 && lmn.criScore < 40 && (
                            <li>CRI score {lmn.criScore}/50 — significant care needs</li>
                          )}
                          {lmn.careRecipient.age >= 85 && (
                            <li>
                              Patient age {lmn.careRecipient.age} — elevated fall and cognitive
                              decline risk
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(lmn.id, 'approved')}
                        className="flex-1 rounded-full bg-[#2BA5A0] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#238F8A] active:scale-95"
                      >
                        Approve & Sign
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (rejectNotes.trim()) {
                            handleAction(lmn.id, 'rejected', rejectNotes);
                          }
                        }}
                        disabled={!rejectNotes.trim()}
                        className="rounded-full border border-zone-red/30 px-4 py-2.5 text-sm font-medium text-zone-red transition-all hover:bg-zone-red/5 active:scale-95 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                    <textarea
                      placeholder="Notes (required for rejection, optional for approval)..."
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      className="w-full rounded-xl border border-border bg-gray-50 p-2.5 text-xs text-text-secondary placeholder:text-text-muted/50 focus:border-[#2BA5A0] focus:outline-none focus:ring-1 focus:ring-[#2BA5A0]/30"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Signed/Completed indicator */}
              {(lmn.status === 'signed' || lmn.status === 'approved') && (
                <div className="border-t border-border px-4 py-2">
                  <p className="text-[10px] text-text-muted">
                    {lmn.status === 'signed' && lmn.signedBy
                      ? `Signed by ${lmn.signedBy} on ${lmn.signedAt ? formatDate(lmn.signedAt) : ''}`
                      : 'Approved — awaiting signature'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

interface LMNGeneratorProps {
  /** Which view to show */
  defaultView?: ViewMode;
  /** Family ID to filter for family view (demo: uses first matching LMN) */
  familyId?: string;
}

export function LMNGenerator({ defaultView = 'physician' }: LMNGeneratorProps) {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [lmns, setLmns] = useState<LMNDraft[]>(MOCK_LMNS);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const handlePhysicianAction = useCallback(
    (lmnId: string, action: 'approved' | 'rejected', notes?: string) => {
      setLmns((prev) =>
        prev.map((lmn) => {
          if (lmn.id !== lmnId) return lmn;
          if (action === 'approved') {
            return {
              ...lmn,
              status: 'signed' as const,
              signedAt: new Date(),
              signedBy: 'Joshua Emdur, DO',
              physicianNotes: notes,
            };
          }
          return {
            ...lmn,
            status: 'rejected' as const,
            physicianNotes: notes,
          };
        }),
      );
      setNotification({
        message:
          action === 'approved'
            ? `LMN ${lmnId} approved and signed. Family notified.`
            : `LMN ${lmnId} returned for revision.`,
        type: action === 'approved' ? 'success' : 'error',
      });
    },
    [],
  );

  // For family view, show the first signed or pending LMN
  const familyLmn =
    lmns.find((l) => l.status === 'signed' || l.status === 'delivered') ??
    lmns.find((l) => l.status === 'pending_review') ??
    lmns[0];

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all animate-in fade-in slide-in-from-top duration-300 ${
            notification.type === 'success' ? 'bg-[#2BA5A0]' : 'bg-zone-red'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* View Toggle */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-[#1B3A5C]">
          {view === 'family' ? 'Medical Necessity Letter' : 'LMN Review Queue'}
        </h2>
        <div className="flex rounded-full border border-border bg-white p-0.5">
          <button
            type="button"
            onClick={() => setView('family')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              view === 'family'
                ? 'bg-[#2BA5A0] text-white'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Family View
          </button>
          <button
            type="button"
            onClick={() => setView('physician')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              view === 'physician'
                ? 'bg-[#1B3A5C] text-white'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Dr. Emdur
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'family' ? (
        <FamilyLMNView lmn={familyLmn!} />
      ) : (
        <PhysicianQueue lmns={lmns} onAction={handlePhysicianAction} />
      )}

      {/* Revenue Attribution */}
      {view === 'physician' && (
        <div className="mt-6 rounded-2xl border border-[#C49B40]/20 bg-[#C49B40]/5 p-4">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#C49B40]">
            Revenue Attribution
          </h4>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-[#1B3A5C]">
                {lmns.filter((l) => l.status === 'signed').length}
              </p>
              <p className="text-[10px] text-text-muted">LMNs signed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#2BA5A0]">
                $
                {lmns
                  .filter((l) => l.status === 'signed')
                  .reduce((sum, l) => sum + l.hsaSavings, 0)
                  .toLocaleString()}
              </p>
              <p className="text-[10px] text-text-muted">HSA savings unlocked/mo</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#C49B40]">
                ${lmns.filter((l) => l.status === 'signed').length * 225}
              </p>
              <p className="text-[10px] text-text-muted">LMN revenue</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
