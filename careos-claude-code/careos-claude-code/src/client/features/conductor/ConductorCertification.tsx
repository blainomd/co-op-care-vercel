/**
 * ConductorCertification — Training modules for family conductors
 *
 * 7 certification modules: Safe Transfers, Bathing, Medication Management,
 * Dementia Communication, Fall Prevention, Emergency Response, Comprehensive.
 * Each module earns 5 Time Bank bonus hours and is HSA/FSA eligible via LMN.
 */
import { useState } from 'react';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  cost: number;
  bonusHours: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completedDate?: string;
  omahaMapping: string;
}

const MODULES: Module[] = [
  {
    id: 'safe-transfers',
    title: 'Safe Transfers',
    description:
      'Proper body mechanics for bed-to-wheelchair, wheelchair-to-car, and stand-pivot transfers. Includes Hoyer lift basics.',
    duration: '2 hours',
    cost: 150,
    bonusHours: 5,
    status: 'completed',
    completedDate: '2025-11-15',
    omahaMapping: '#37 Physical Activity — TGC',
  },
  {
    id: 'bathing',
    title: 'Bathing & Personal Care',
    description:
      'Dignity-preserving bathing techniques, skin inspection, fall prevention during bathing.',
    duration: '2 hours',
    cost: 150,
    bonusHours: 5,
    status: 'completed',
    completedDate: '2025-12-10',
    omahaMapping: '#38 Personal Care — TGC',
  },
  {
    id: 'medication',
    title: 'Medication Management',
    description:
      'Medication scheduling, safe administration, recognizing adverse reactions, and proper storage.',
    duration: '3 hours',
    cost: 200,
    bonusHours: 5,
    status: 'in_progress',
    omahaMapping: '#25 Neuromusculoskeletal — TGC',
  },
  {
    id: 'dementia',
    title: 'Dementia Communication',
    description:
      'Validation therapy, redirection techniques, managing sundowning, and creating calming environments.',
    duration: '4 hours',
    cost: 250,
    bonusHours: 5,
    status: 'not_started',
    omahaMapping: '#21 Cognition — TGC',
  },
  {
    id: 'fall-prevention',
    title: 'Fall Prevention',
    description:
      'Home safety assessment, grab bar placement, lighting optimization, and gait-belt use.',
    duration: '2 hours',
    cost: 150,
    bonusHours: 5,
    status: 'not_started',
    omahaMapping: '#25 Neuromusculoskeletal — TGC',
  },
  {
    id: 'emergency',
    title: 'Emergency Response',
    description:
      'CPR/AED basics, choking response, fall assessment, when to call 911 vs telehealth.',
    duration: '2 hours',
    cost: 150,
    bonusHours: 5,
    status: 'not_started',
    omahaMapping: '#27 Circulation — TGC',
  },
  {
    id: 'comprehensive',
    title: 'Comprehensive Certification',
    description:
      'Full-day intensive covering all modules. Includes practicum with hands-on skill verification.',
    duration: 'Full day',
    cost: 750,
    bonusHours: 5,
    status: 'not_started',
    omahaMapping: 'All Omaha domains — TGC',
  },
];

const STATUS_CONFIG = {
  not_started: {
    label: 'Not Started',
    className: 'bg-warm-gray/20 text-muted',
    actionLabel: 'Enroll',
  },
  in_progress: { label: 'In Progress', className: 'bg-gold/10 text-gold', actionLabel: 'Continue' },
  completed: { label: 'Completed', className: 'bg-sage/10 text-sage', actionLabel: 'Certificate' },
};

export function ConductorCertification() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completed = MODULES.filter((m) => m.status === 'completed').length;
  const totalBonusEarned = MODULES.filter((m) => m.status === 'completed').length * 5;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Conductor Certification</h1>
        <p className="text-sm text-muted">
          Earn skills and Time Bank bonus hours — all HSA/FSA eligible
        </p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{completed}</p>
          <p className="text-[11px] text-muted">Modules Completed</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{MODULES.length - completed}</p>
          <p className="text-[11px] text-muted">Remaining</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">{totalBonusEarned}</p>
          <p className="text-[11px] text-muted">Bonus Hours Earned</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Progress</span>
          <span>
            {completed} / {MODULES.length} modules
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-warm-gray/20">
          <div
            className="h-full rounded-full bg-sage transition-all"
            style={{ width: `${(completed / MODULES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-3">
        {MODULES.map((mod) => {
          const config = STATUS_CONFIG[mod.status];
          const isExpanded = expandedId === mod.id;
          return (
            <div key={mod.id} className="rounded-xl border border-border bg-white overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : mod.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    mod.status === 'completed'
                      ? 'bg-sage text-white'
                      : mod.status === 'in_progress'
                        ? 'bg-gold/20 text-gold'
                        : 'bg-warm-gray/20 text-muted'
                  }`}
                >
                  {mod.status === 'completed' ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    MODULES.indexOf(mod) + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{mod.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span>{mod.duration}</span>
                    <span>·</span>
                    <span>${mod.cost}</span>
                    <span>·</span>
                    <span>{mod.bonusHours} bonus hrs</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${config.className}`}
                >
                  {config.label}
                </span>
                <svg
                  className={`h-4 w-4 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <p className="text-sm text-secondary">{mod.description}</p>
                  <p className="mt-2 text-[11px] text-muted">Omaha: {mod.omahaMapping}</p>
                  {mod.completedDate && (
                    <p className="mt-1 text-[11px] text-sage">
                      Completed{' '}
                      {new Date(mod.completedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  <div className="mt-3">
                    <button
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        mod.status === 'completed'
                          ? 'border border-sage text-sage hover:bg-sage/5'
                          : 'bg-sage text-white hover:bg-sage-dark'
                      }`}
                    >
                      {config.actionLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted">
        All modules are HSA/FSA eligible with a valid LMN. Each completed module earns 5 bonus Time
        Bank hours.
      </p>
    </div>
  );
}
