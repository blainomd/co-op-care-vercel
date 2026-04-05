/**
 * KBS Assessment — Per-problem Knowledge-Behavior-Status entry
 *
 * Allows conductors to rate K (1-5), B (1-5), S (1-5) for a specific
 * Omaha problem at specified assessment intervals (intake, 30, 60, 90 days).
 * Includes Omaha problem selector grouped by domain.
 */
import { useState, useMemo } from 'react';
import { OMAHA_PROBLEMS, type OmahaDomain } from '@shared/constants/omaha-system';
import { KBS_MIN, KBS_MAX } from '@shared/constants/business-rules';

const DOMAINS: OmahaDomain[] = [
  'Environmental',
  'Psychosocial',
  'Physiological',
  'Health-Related Behaviors',
];

const DOMAIN_COLORS: Record<OmahaDomain, string> = {
  Environmental: 'bg-zone-green/10 text-zone-green',
  Psychosocial: 'bg-purple-100 text-purple-600',
  Physiological: 'bg-blue-100 text-blue-600',
  'Health-Related Behaviors': 'bg-orange-100 text-orange-600',
};

const ASSESSMENT_DAYS = [
  { value: 0, label: 'Intake (Day 0)' },
  { value: 30, label: '30-Day Reassessment' },
  { value: 60, label: '60-Day Reassessment' },
  { value: 90, label: '90-Day Reassessment' },
] as const;

const KBS_DESCRIPTIONS = {
  knowledge: {
    label: 'Knowledge',
    description: 'Ability to remember and interpret information',
    levels: [
      'No knowledge',
      'Minimal knowledge',
      'Basic knowledge',
      'Adequate knowledge',
      'Superior knowledge',
    ],
  },
  behavior: {
    label: 'Behavior',
    description: 'Observable actions and compliance with recommendations',
    levels: [
      'Not appropriate',
      'Rarely appropriate',
      'Inconsistently appropriate',
      'Usually appropriate',
      'Consistently appropriate',
    ],
  },
  status: {
    label: 'Status',
    description: 'Current condition relative to the problem',
    levels: [
      'Extreme signs/symptoms',
      'Severe signs/symptoms',
      'Moderate signs/symptoms',
      'Minimal signs/symptoms',
      'No signs/symptoms',
    ],
  },
} as const;

type Dimension = 'knowledge' | 'behavior' | 'status';

export function KBSAssessment() {
  const [selectedProblemCode, setSelectedProblemCode] = useState<number | null>(null);
  const [assessmentDay, setAssessmentDay] = useState<number>(0);
  const [scores, setScores] = useState<Record<Dimension, number>>({
    knowledge: 3,
    behavior: 3,
    status: 3,
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedProblem = useMemo(
    () => OMAHA_PROBLEMS.find((p) => p.code === selectedProblemCode),
    [selectedProblemCode],
  );

  const problemsByDomain = useMemo(() => {
    const grouped = new Map<OmahaDomain, (typeof OMAHA_PROBLEMS)[number][]>();
    for (const domain of DOMAINS) {
      grouped.set(
        domain,
        OMAHA_PROBLEMS.filter((p) => p.domain === domain),
      );
    }
    return grouped;
  }, []);

  function updateScore(dimension: Dimension, value: number) {
    setScores((prev) => ({ ...prev, [dimension]: value }));
  }

  function handleSubmit() {
    if (!selectedProblemCode) return;
    setSubmitted(true);
    // API call will be wired in later
  }

  function handleReset() {
    setSubmitted(false);
    setSelectedProblemCode(null);
    setAssessmentDay(0);
    setScores({ knowledge: 3, behavior: 3, status: 3 });
  }

  if (submitted && selectedProblem) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
            <svg
              className="h-8 w-8 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            KBS Rating Recorded
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {selectedProblem.name} — {ASSESSMENT_DAYS.find((d) => d.value === assessmentDay)?.label}
          </p>
          <div className="mt-4 flex justify-center gap-6">
            {(['knowledge', 'behavior', 'status'] as Dimension[]).map((dim) => (
              <div key={dim} className="text-center">
                <span className="text-xs text-text-muted capitalize">{dim[0]}</span>
                <p className="text-lg font-bold text-sage">{scores[dim]}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Record Another
            </button>
            <a
              href="#/conductor"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-warm-gray"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          KBS Outcome Rating
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Rate Knowledge, Behavior, and Status for an Omaha System problem. Each dimension is scored{' '}
          {KBS_MIN}–{KBS_MAX}.
        </p>
      </div>

      {/* Step 1: Select Omaha Problem */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-text-primary">
          1. Select Omaha Problem
        </label>
        {!selectedProblem ? (
          <div className="space-y-3">
            {DOMAINS.map((domain) => {
              const problems = problemsByDomain.get(domain) ?? [];
              return (
                <div key={domain}>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${DOMAIN_COLORS[domain]}`}
                  >
                    {domain}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {problems.map((problem) => (
                      <button
                        key={problem.code}
                        onClick={() => setSelectedProblemCode(problem.code)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-sage hover:bg-sage/5 hover:text-sage"
                        title={problem.description}
                      >
                        {problem.code}. {problem.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg bg-sage/5 px-3 py-2">
            <div>
              <span className="text-sm font-medium text-sage">
                #{selectedProblem.code} {selectedProblem.name}
              </span>
              <p className="text-xs text-text-muted">{selectedProblem.description}</p>
            </div>
            <button
              onClick={() => setSelectedProblemCode(null)}
              className="text-xs text-text-muted hover:text-text-secondary"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Assessment Day */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-text-primary">
          2. Assessment Interval
        </label>
        <div className="flex gap-2">
          {ASSESSMENT_DAYS.map((day) => (
            <button
              key={day.value}
              onClick={() => setAssessmentDay(day.value)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                assessmentDay === day.value
                  ? 'bg-sage text-white'
                  : 'border border-border bg-white text-text-secondary hover:bg-warm-gray'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: KBS Ratings */}
      <div className="mb-6 space-y-4">
        {(['knowledge', 'behavior', 'status'] as Dimension[]).map((dimension) => {
          const info = KBS_DESCRIPTIONS[dimension];
          return (
            <div key={dimension} className="rounded-xl border border-border bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">{info.label}</label>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    scores[dimension] <= 2
                      ? 'bg-zone-red/10 text-zone-red'
                      : scores[dimension] <= 3
                        ? 'bg-zone-yellow/10 text-zone-yellow'
                        : 'bg-zone-green/10 text-zone-green'
                  }`}
                >
                  {scores[dimension]}/{KBS_MAX}
                </span>
              </div>
              <p className="mb-3 text-xs text-text-muted">{info.description}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => updateScore(dimension, value)}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                      scores[dimension] === value
                        ? value <= 2
                          ? 'bg-zone-red text-white'
                          : value <= 3
                            ? 'bg-zone-yellow text-white'
                            : 'bg-zone-green text-white'
                        : 'border border-border bg-white text-text-secondary hover:bg-warm-gray'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-text-muted text-center">
                {info.levels[scores[dimension] - 1]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedProblemCode}
          className="rounded-lg bg-sage px-8 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Record KBS Rating
        </button>
      </div>
    </div>
  );
}
