/**
 * Care Log — Structured care interaction logging
 *
 * Workers log each meaningful care interaction during a shift.
 * Auto-suggests Omaha problem codes based on category selection.
 * Supports optional vitals recording and mood tracking.
 */
import { useState, useMemo } from 'react';
import { OMAHA_PROBLEMS, type OmahaDomain } from '@shared/constants/omaha-system';
import type { CareLogCategory, VitalsRecord } from '@shared/types/worker.types';

const DOMAINS: OmahaDomain[] = [
  'Environmental',
  'Psychosocial',
  'Physiological',
  'Health-Related Behaviors',
];

const CATEGORIES: Array<{
  value: CareLogCategory;
  label: string;
  icon: string;
  suggestedProblems: number[];
}> = [
  {
    value: 'companion_visit',
    label: 'Companion Visit',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    suggestedProblems: [12],
  },
  {
    value: 'personal_care',
    label: 'Personal Care',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    suggestedProblems: [38],
  },
  {
    value: 'medication_reminder',
    label: 'Medication',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    suggestedProblems: [24],
  },
  {
    value: 'meal_preparation',
    label: 'Meal Prep',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
    suggestedProblems: [27],
  },
  {
    value: 'mobility_assist',
    label: 'Mobility',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    suggestedProblems: [25],
  },
  {
    value: 'cognitive_activity',
    label: 'Cognitive Activity',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    suggestedProblems: [21],
  },
  {
    value: 'emotional_support',
    label: 'Emotional Support',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    suggestedProblems: [13],
  },
  {
    value: 'errand',
    label: 'Errand',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    suggestedProblems: [],
  },
  {
    value: 'observation',
    label: 'Observation',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    suggestedProblems: [],
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    suggestedProblems: [],
  },
];

const ALERT_LEVELS = [
  { value: 'normal' as const, label: 'Normal', color: 'bg-zone-green/10 text-zone-green' },
  { value: 'monitor' as const, label: 'Monitor', color: 'bg-zone-yellow/10 text-zone-yellow' },
  { value: 'alert' as const, label: 'Alert', color: 'bg-zone-red/10 text-zone-red' },
];

const MOOD_LABELS = ['Very Low', 'Low', 'Neutral', 'Good', 'Very Good'];

export function CareLog() {
  const [category, setCategory] = useState<CareLogCategory | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<number[]>([]);
  const [showProblems, setShowProblems] = useState(false);
  const [vitals, setVitals] = useState<VitalsRecord>({});
  const [showVitals, setShowVitals] = useState(false);
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [alertLevel, setAlertLevel] = useState<'normal' | 'monitor' | 'alert'>('normal');
  const [duration, setDuration] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedCategoryInfo = useMemo(
    () => CATEGORIES.find((c) => c.value === category),
    [category],
  );

  function handleCategorySelect(cat: CareLogCategory) {
    setCategory(cat);
    const info = CATEGORIES.find((c) => c.value === cat);
    if (info?.suggestedProblems.length) {
      setSelectedProblems(info.suggestedProblems);
    }
  }

  function toggleProblem(code: number) {
    setSelectedProblems((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function handleSubmit() {
    if (!category || !notes.trim()) return;
    setSubmitted(true);
    // API call will be wired in later
  }

  if (submitted) {
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
          <h2 className="font-heading text-2xl font-semibold text-text-primary">Care Log Saved</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {selectedCategoryInfo?.label} logged with {selectedProblems.length} Omaha problem
            {selectedProblems.length !== 1 ? 's' : ''}
          </p>
          {alertLevel === 'alert' && (
            <div className="mt-3 rounded-lg bg-zone-red/5 p-3 text-sm text-zone-red">
              Alert notification sent to the care coordinator.
            </div>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setCategory(null);
                setNotes('');
                setSelectedProblems([]);
                setVitals({});
                setMoodRating(null);
                setAlertLevel('normal');
                setDuration(null);
                setShowVitals(false);
                setShowProblems(false);
              }}
              className="rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Log Another
            </button>
            <a
              href="#/worker"
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
          Log Care Interaction
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Document what happened during this visit.
        </p>
      </div>

      {/* Category selection */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-text-primary">
          1. What type of care?
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategorySelect(cat.value)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                category === cat.value
                  ? 'bg-sage text-white'
                  : 'border border-border bg-white text-text-secondary hover:bg-warm-gray'
              }`}
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
              </svg>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-text-primary">
          2. What happened?
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe the care interaction, observations, or concerns..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          rows={4}
        />
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-text-muted">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Duration (min):
          </label>
          <input
            type="number"
            value={duration ?? ''}
            onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value, 10) : null)}
            placeholder="–"
            className="w-16 rounded border border-border px-2 py-1 text-xs text-text-primary focus:border-sage focus:outline-none"
          />
        </div>
      </div>

      {/* Alert level */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-text-primary">3. Alert Level</label>
        <div className="flex gap-2">
          {ALERT_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setAlertLevel(level.value)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                alertLevel === level.value
                  ? level.color
                  : 'border border-border bg-white text-text-secondary hover:bg-warm-gray'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood rating */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-text-primary">
          4. Care Recipient Mood
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setMoodRating(value)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                moodRating === value
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
        {moodRating && (
          <p className="mt-1 text-center text-[10px] text-text-muted">
            {MOOD_LABELS[moodRating - 1]}
          </p>
        )}
      </div>

      {/* Omaha problems (collapsible) */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <button
          onClick={() => setShowProblems(!showProblems)}
          className="flex w-full items-center justify-between text-sm font-medium text-text-primary"
        >
          <span>Omaha Problems ({selectedProblems.length} selected)</span>
          <span className="text-xs text-text-muted">{showProblems ? 'Hide' : 'Show'}</span>
        </button>
        {showProblems && (
          <div className="mt-3 space-y-2">
            {DOMAINS.map((domain) => {
              const problems = OMAHA_PROBLEMS.filter((p) => p.domain === domain);
              return (
                <div key={domain}>
                  <span className="text-[10px] font-medium text-text-muted uppercase">
                    {domain}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {problems.map((problem) => (
                      <button
                        key={problem.code}
                        onClick={() => toggleProblem(problem.code)}
                        className={`rounded px-2 py-1 text-[10px] transition-colors ${
                          selectedProblems.includes(problem.code)
                            ? 'bg-sage text-white'
                            : 'bg-warm-gray text-text-secondary hover:bg-border'
                        }`}
                      >
                        {problem.code}. {problem.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vitals (collapsible) */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <button
          onClick={() => setShowVitals(!showVitals)}
          className="flex w-full items-center justify-between text-sm font-medium text-text-primary"
        >
          <span>Vitals (Optional)</span>
          <span className="text-xs text-text-muted">{showVitals ? 'Hide' : 'Show'}</span>
        </button>
        {showVitals && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { key: 'bloodPressureSystolic' as const, label: 'BP Systolic', unit: 'mmHg' },
              { key: 'bloodPressureDiastolic' as const, label: 'BP Diastolic', unit: 'mmHg' },
              { key: 'heartRate' as const, label: 'Heart Rate', unit: 'bpm' },
              { key: 'temperature' as const, label: 'Temperature', unit: '\u00B0F' },
              { key: 'oxygenSaturation' as const, label: 'SpO2', unit: '%' },
              { key: 'painLevel' as const, label: 'Pain Level', unit: '0-10' },
            ].map(({ key, label, unit }) => (
              <div key={key}>
                <label className="text-[10px] font-medium text-text-muted">
                  {label} ({unit})
                </label>
                <input
                  type="number"
                  value={vitals[key] ?? ''}
                  onChange={(e) =>
                    setVitals((prev) => ({
                      ...prev,
                      [key]: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  className="mt-0.5 w-full rounded border border-border px-2 py-1.5 text-xs text-text-primary focus:border-sage focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!category || !notes.trim()}
          className="rounded-lg bg-sage px-8 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Care Log
        </button>
      </div>
    </div>
  );
}
