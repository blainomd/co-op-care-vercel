/**
 * AssessmentsList — Overview of all assessment types with links to start/view
 *
 * Lists CII, CRI, and KBS assessments for the current family.
 */
import { useState } from 'react';

interface AssessmentSummary {
  id: string;
  type: 'cii' | 'cri' | 'kbs';
  label: string;
  description: string;
  status: 'completed' | 'due_soon' | 'overdue' | 'not_started';
  lastCompleted: string | null;
  nextDue: string | null;
  careRecipient: string;
  href: string;
}

const MOCK_ASSESSMENTS: AssessmentSummary[] = [
  {
    id: 'a1',
    type: 'cii',
    label: 'CII Assessment',
    description: 'Caregiver Impact Index — measures caregiver wellbeing across 6 domains',
    status: 'due_soon',
    lastCompleted: '2025-12-15',
    nextDue: '2026-03-15',
    careRecipient: 'Helen Park',
    href: '#/assessments/cii',
  },
  {
    id: 'a2',
    type: 'cri',
    label: 'CRI Assessment',
    description: 'Care Recipient Index — evaluates daily living needs and support requirements',
    status: 'completed',
    lastCompleted: '2026-02-20',
    nextDue: '2026-05-20',
    careRecipient: 'Helen Park',
    href: '#/assessments/cri',
  },
  {
    id: 'a3',
    type: 'kbs',
    label: 'KBS Assessment',
    description: 'Knowledge & Behavior Scale — caregiver skills proficiency check',
    status: 'not_started',
    lastCompleted: null,
    nextDue: null,
    careRecipient: 'Helen Park',
    href: '#/assessments/kbs',
  },
  {
    id: 'a4',
    type: 'cii',
    label: 'CII Assessment',
    description: 'Caregiver Impact Index — measures caregiver wellbeing across 6 domains',
    status: 'overdue',
    lastCompleted: '2025-09-01',
    nextDue: '2025-12-01',
    careRecipient: 'Roberto Mendez',
    href: '#/assessments/cii',
  },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-sage/10 text-sage' },
  due_soon: { label: 'Due Soon', className: 'bg-gold/10 text-gold' },
  overdue: { label: 'Overdue', className: 'bg-zone-red/10 text-zone-red' },
  not_started: { label: 'Not Started', className: 'bg-warm-gray/20 text-muted' },
};

const TYPE_ICON: Record<string, string> = {
  cii: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  cri: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  kbs: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};

export function AssessmentsList() {
  const [filter, setFilter] = useState<'all' | 'due_soon' | 'overdue'>('all');

  const filtered =
    filter === 'all' ? MOCK_ASSESSMENTS : MOCK_ASSESSMENTS.filter((a) => a.status === filter);

  const overdue = MOCK_ASSESSMENTS.filter((a) => a.status === 'overdue').length;
  const dueSoon = MOCK_ASSESSMENTS.filter((a) => a.status === 'due_soon').length;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Assessments</h1>
        <p className="text-sm text-muted">
          Track and complete assessments for your care recipients
        </p>
      </div>

      {/* Summary Cards */}
      {(overdue > 0 || dueSoon > 0) && (
        <div className="flex gap-3">
          {overdue > 0 && (
            <div className="flex-1 rounded-xl border border-zone-red/30 bg-zone-red/5 p-3">
              <p className="text-2xl font-bold text-zone-red">{overdue}</p>
              <p className="text-xs text-zone-red">Overdue</p>
            </div>
          )}
          {dueSoon > 0 && (
            <div className="flex-1 rounded-xl border border-gold/30 bg-gold/5 p-3">
              <p className="text-2xl font-bold text-gold">{dueSoon}</p>
              <p className="text-xs text-gold">Due Soon</p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'due_soon', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-sage text-white'
                : 'bg-warm-gray/20 text-muted hover:bg-warm-gray/30'
            }`}
          >
            {f === 'all' ? 'All' : f === 'due_soon' ? 'Due Soon' : 'Overdue'}
          </button>
        ))}
      </div>

      {/* Assessment List */}
      <div className="space-y-3">
        {filtered.map((assessment) => {
          const badge = STATUS_BADGE[assessment.status]!;
          const icon = TYPE_ICON[assessment.type]!;
          return (
            <a
              key={assessment.id}
              href={assessment.href}
              className="block rounded-xl border border-border bg-white p-4 transition-colors hover:bg-warm-gray/10"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-primary">{assessment.label}</p>
                      <p className="text-xs text-muted">for {assessment.careRecipient}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-secondary">{assessment.description}</p>
                  <div className="mt-2 flex gap-4 text-[11px] text-muted">
                    {assessment.lastCompleted && (
                      <span>
                        Last:{' '}
                        {new Date(assessment.lastCompleted).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {assessment.nextDue && (
                      <span>
                        Next due:{' '}
                        {new Date(assessment.nextDue).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-white py-12 text-center">
          <p className="text-sm text-muted">No assessments match the selected filter</p>
        </div>
      )}

      <p className="text-[11px] text-muted">
        CareOS assessments are evidence-based tools for evaluating caregiver wellbeing and care
        recipient needs.
      </p>
    </div>
  );
}
