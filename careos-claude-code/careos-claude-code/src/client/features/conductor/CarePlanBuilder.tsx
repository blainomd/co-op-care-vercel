/**
 * CarePlanBuilder — Build and view a care recipient's care plan
 *
 * ICD-10 -> Omaha System problem mapping. Care plans are structured around
 * Omaha problems with interventions from 5 sources of care:
 * Worker-Owners, Time Bank Neighbors, Wellness Providers, Family/Conductor, Technology.
 */
import { useState } from 'react';

type CareSource = 'worker' | 'timebank' | 'wellness' | 'family' | 'tech';

interface Intervention {
  description: string;
  source: CareSource;
}

interface OmahaProblem {
  code: number;
  name: string;
  goal: string;
  kbs: { k: number; b: number; s: number };
  icdCodes: string[];
  interventions: Intervention[];
  progress: number; // 0-100
}

interface CareRecipient {
  name: string;
  age: number;
  primaryConditions: string[];
}

const SOURCE_LABELS: Record<CareSource, string> = {
  worker: 'Worker-Owner',
  timebank: 'Time Bank',
  wellness: 'Wellness',
  family: 'Family',
  tech: 'Technology',
};

const SOURCE_COLORS: Record<CareSource, string> = {
  worker: 'text-sage',
  timebank: 'text-gold',
  wellness: 'text-copper',
  family: 'text-primary',
  tech: 'text-secondary',
};

const MOCK_RECIPIENT: CareRecipient = {
  name: 'Helen Park',
  age: 78,
  primaryConditions: [
    'Heart Failure (I50.9)',
    'History of Falls (Z87.39)',
    'Type 2 Diabetes (E11.9)',
  ],
};

const INITIAL_PROBLEMS: OmahaProblem[] = [
  {
    code: 27,
    name: 'Circulation',
    goal: 'Maintain stable vitals',
    kbs: { k: 3, b: 3, s: 2 },
    icdCodes: ['I50.9', 'I25.10'],
    interventions: [
      { description: 'Daily vitals check', source: 'worker' },
      { description: 'Companionship walks', source: 'timebank' },
      { description: 'Cardiac rehab program', source: 'wellness' },
      { description: 'Medication reminders', source: 'family' },
    ],
    progress: 45,
  },
  {
    code: 25,
    name: 'Neuro-musculo-skeletal function',
    goal: 'Prevent falls',
    kbs: { k: 4, b: 2, s: 3 },
    icdCodes: ['Z87.39', 'M62.81'],
    interventions: [
      { description: 'Home safety assessment', source: 'worker' },
      { description: 'Tai chi classes', source: 'wellness' },
      { description: 'Exercise buddy visits', source: 'timebank' },
    ],
    progress: 60,
  },
  {
    code: 6,
    name: 'Social Contact',
    goal: 'Reduce isolation',
    kbs: { k: 4, b: 3, s: 2 },
    icdCodes: ['Z60.2'],
    interventions: [
      { description: 'Companionship visits', source: 'worker' },
      { description: 'Phone calls', source: 'timebank' },
      { description: 'Community events', source: 'wellness' },
    ],
    progress: 35,
  },
  {
    code: 42,
    name: 'Medication regimen',
    goal: '95% adherence',
    kbs: { k: 3, b: 4, s: 3 },
    icdCodes: ['Z79.4', 'Z79.899'],
    interventions: [
      { description: 'Medication management', source: 'worker' },
      { description: 'Pharmacy pickup', source: 'timebank' },
      { description: 'Refill tracking alerts', source: 'tech' },
    ],
    progress: 72,
  },
  {
    code: 21,
    name: 'Cognition',
    goal: 'Maintain cognitive function',
    kbs: { k: 3, b: 3, s: 3 },
    icdCodes: ['R41.3'],
    interventions: [
      { description: 'Cognitive games and puzzles', source: 'timebank' },
      { description: 'Memory care activities', source: 'worker' },
    ],
    progress: 50,
  },
];

function SourceIcon({ source }: { source: CareSource }) {
  const color = SOURCE_COLORS[source];
  switch (source) {
    case 'worker':
      return (
        <svg
          className={`h-4 w-4 ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      );
    case 'timebank':
      return (
        <svg
          className={`h-4 w-4 ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'wellness':
      return (
        <svg
          className={`h-4 w-4 ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      );
    case 'family':
      return (
        <svg
          className={`h-4 w-4 ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      );
    case 'tech':
      return (
        <svg
          className={`h-4 w-4 ${color}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
          />
        </svg>
      );
  }
}

function KBSBadge({ label, value }: { label: string; value: number }) {
  const bgColor =
    value >= 4
      ? 'bg-sage/10 text-sage'
      : value >= 3
        ? 'bg-gold/10 text-gold'
        : 'bg-zone-red/10 text-zone-red';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${bgColor}`}
    >
      {label}:{value}
    </span>
  );
}

export function CarePlanBuilder() {
  const [problems, setProblems] = useState<OmahaProblem[]>(INITIAL_PROBLEMS);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 27: true });
  const [showAddForm, setShowAddForm] = useState(false);

  const recipient = MOCK_RECIPIENT;

  const toggleExpanded = (code: number) => {
    setExpanded((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const totalInterventions = problems.reduce((sum, p) => sum + p.interventions.length, 0);

  const sourceCounts: Record<CareSource, number> = {
    worker: 0,
    timebank: 0,
    wellness: 0,
    family: 0,
    tech: 0,
  };
  problems.forEach((p) =>
    p.interventions.forEach((i) => {
      sourceCounts[i.source]++;
    }),
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + 30);

  const addSampleProblem = () => {
    const newProblem: OmahaProblem = {
      code: 28,
      name: 'Digestion-Hydration',
      goal: 'Maintain adequate nutrition',
      kbs: { k: 3, b: 3, s: 2 },
      icdCodes: ['E11.9'],
      interventions: [
        { description: 'Meal planning', source: 'worker' },
        { description: 'Grocery shopping', source: 'timebank' },
        { description: 'Dietitian consult', source: 'wellness' },
      ],
      progress: 20,
    };
    setProblems((prev) => [...prev, newProblem]);
    setShowAddForm(false);
    setExpanded((prev) => ({ ...prev, 28: true }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Care Plan Builder</h1>
        <p className="text-sm text-muted">Omaha System care plan with 5 sources of care</p>
      </div>

      {/* Care Recipient Header */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage/10 text-lg font-bold text-sage">
            {recipient.name
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-primary">{recipient.name}</h2>
            <p className="text-xs text-muted">Age {recipient.age}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recipient.primaryConditions.map((condition) => (
                <span
                  key={condition}
                  className="rounded-full bg-zone-red/5 px-2 py-0.5 text-[11px] text-zone-red"
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Omaha Problems */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">
            Active Problems ({problems.length})
          </h3>
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg border border-sage/30 px-2.5 py-1 text-xs font-medium text-sage hover:bg-sage/5"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Problem
          </button>
        </div>

        {/* Add Problem Form */}
        {showAddForm && (
          <div className="mb-3 rounded-xl border border-sage/20 bg-sage/5 p-4">
            <h4 className="text-sm font-semibold text-sage">Add Omaha Problem</h4>
            <p className="mt-1 text-xs text-secondary">
              Select from the Omaha System's 42 problems across 4 domains.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={addSampleProblem}
                className="rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-dark"
              >
                Add #28 Digestion-Hydration
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary hover:bg-warm-gray/20"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Problem Cards */}
        <div className="space-y-3">
          {problems.map((problem) => {
            const isOpen = expanded[problem.code] ?? false;
            return (
              <div key={problem.code} className="rounded-xl border border-border bg-white">
                {/* Card Header — always visible */}
                <button
                  onClick={() => toggleExpanded(problem.code)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage/10 text-xs font-bold text-sage">
                    #{problem.code}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-primary">{problem.name}</p>
                      <div className="flex gap-1">
                        <KBSBadge label="K" value={problem.kbs.k} />
                        <KBSBadge label="B" value={problem.kbs.b} />
                        <KBSBadge label="S" value={problem.kbs.s} />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted">Goal: {problem.goal}</p>
                    {/* Progress bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-warm-gray/20">
                        <div
                          className={`h-1.5 rounded-full ${
                            problem.progress >= 70
                              ? 'bg-sage'
                              : problem.progress >= 40
                                ? 'bg-gold'
                                : 'bg-zone-red'
                          }`}
                          style={{ width: `${problem.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted">
                        {problem.progress}%
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    {/* ICD-10 Codes */}
                    <div className="mb-3">
                      <p className="text-[11px] font-medium text-muted">ICD-10 Codes</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {problem.icdCodes.map((code) => (
                          <span
                            key={code}
                            className="rounded bg-zone-red/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zone-red"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Interventions */}
                    <div>
                      <p className="text-[11px] font-medium text-muted">
                        Interventions ({problem.interventions.length})
                      </p>
                      <div className="mt-1.5 space-y-2">
                        {problem.interventions.map((intervention, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 rounded-lg bg-warm-gray/5 px-3 py-2"
                          >
                            <SourceIcon source={intervention.source} />
                            <span className="flex-1 text-xs text-secondary">
                              {intervention.description}
                            </span>
                            <span
                              className={`text-[10px] font-medium ${SOURCE_COLORS[intervention.source]}`}
                            >
                              {SOURCE_LABELS[intervention.source]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Care Plan Summary */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Care Plan Summary</h3>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Active Problems</span>
            <span className="font-medium text-primary">{problems.length} Omaha problems</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Total Interventions</span>
            <span className="font-medium text-primary">{totalInterventions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Next Review</span>
            <span className="font-medium text-sage">
              {nextReview.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Sources of Care Distribution */}
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-[11px] font-medium text-muted">Sources of Care Distribution</p>
          <div className="mt-2 space-y-1.5">
            {(Object.entries(sourceCounts) as [CareSource, number][])
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => {
                const pct = Math.round((count / totalInterventions) * 100);
                return (
                  <div key={source} className="flex items-center gap-2">
                    <SourceIcon source={source} />
                    <span className="w-20 text-[11px] text-secondary">{SOURCE_LABELS[source]}</span>
                    <div className="h-2 flex-1 rounded-full bg-warm-gray/20">
                      <div
                        className={`h-2 rounded-full ${
                          source === 'worker'
                            ? 'bg-sage'
                            : source === 'timebank'
                              ? 'bg-gold'
                              : source === 'wellness'
                                ? 'bg-copper'
                                : source === 'family'
                                  ? 'bg-primary/30'
                                  : 'bg-secondary/30'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-[11px] font-medium text-muted">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-sage/20 bg-sage/5 p-4">
        <h3 className="text-sm font-semibold text-sage">5 Sources of Care</h3>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {(Object.entries(SOURCE_LABELS) as [CareSource, string][]).map(([source, label]) => (
            <div key={source} className="flex items-center gap-1.5">
              <SourceIcon source={source} />
              <span className="text-[11px] text-secondary">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-secondary">
          KBS = Knowledge / Behavior / Status (Omaha Outcome Scale, 1-5 each)
        </p>
      </div>

      <p className="text-[11px] text-muted">
        Care plan structured using Omaha System taxonomy. ICD-10 codes mapped for billing and
        clinical documentation.
      </p>
    </div>
  );
}
