/**
 * RequestHelp — Create a new task request in the Time Bank
 *
 * Multi-step form: category → details → scheduling → confirmation.
 */
import { useState } from 'react';

type Step = 'category' | 'details' | 'schedule' | 'confirm';

interface TaskCategory {
  id: string;
  label: string;
  icon: string;
  examples: string;
}

const CATEGORIES: TaskCategory[] = [
  {
    id: 'meals',
    label: 'Meals & Cooking',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    examples: 'Cook a meal, grocery shopping',
  },
  {
    id: 'transport',
    label: 'Transportation',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    examples: 'Doctor visits, errands, pharmacy',
  },
  {
    id: 'companion',
    label: 'Companionship',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    examples: 'Visit, conversation, games',
  },
  {
    id: 'household',
    label: 'Household Help',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    examples: 'Light cleaning, laundry, yard work',
  },
  {
    id: 'tech',
    label: 'Tech Support',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    examples: 'Phone help, video calls, email',
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    examples: 'Anything else you need help with',
  },
];

export function RequestHelp() {
  const [step, setStep] = useState<Step>('category');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [urgency, setUrgency] = useState<'flexible' | 'this_week' | 'urgent'>('flexible');
  const [submitted, setSubmitted] = useState(false);

  const selectedCategory = CATEGORIES.find((c) => c.id === category);

  function handleSubmit() {
    // TODO: POST to /api/v1/tasks
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl p-4 md:p-6">
        <div className="rounded-2xl border border-sage/30 bg-sage/5 p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-sage"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-primary">Request Submitted</h2>
          <p className="mt-2 text-sm text-muted">
            Your request for help has been posted to the Time Bank. A neighbor will be matched soon.
          </p>
          <a
            href="#/timebank"
            className="mt-6 inline-block rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
          >
            Back to Time Bank
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Request Help</h1>
        <p className="text-sm text-muted">Post a task to the cooperative Time Bank</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {(['category', 'details', 'schedule', 'confirm'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                step === s
                  ? 'bg-sage text-white'
                  : ['category', 'details', 'schedule', 'confirm'].indexOf(step) > i
                    ? 'bg-sage/20 text-sage'
                    : 'bg-warm-gray/20 text-muted'
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Category */}
      {step === 'category' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-primary">What kind of help do you need?</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setStep('details');
                }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  category === cat.id
                    ? 'border-sage bg-sage/5'
                    : 'border-border hover:bg-warm-gray/10'
                }`}
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                </svg>
                <div>
                  <p className="text-sm font-medium text-primary">{cat.label}</p>
                  <p className="text-xs text-muted">{cat.examples}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Tell us more</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Task Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              placeholder={`e.g., ${selectedCategory?.examples.split(',')[0] ?? 'Help needed'}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              placeholder="Add any details that will help a neighbor understand what's needed..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Estimated Hours</label>
            <select
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
            >
              <option value="0.5">30 minutes</option>
              <option value="1">1 hour</option>
              <option value="1.5">1.5 hours</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('category')}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-warm-gray/20"
            >
              Back
            </button>
            <button
              onClick={() => setStep('schedule')}
              disabled={!title}
              className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 'schedule' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">When do you need help?</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Urgency</label>
            <div className="flex gap-2">
              {(
                [
                  { value: 'flexible', label: 'Flexible' },
                  { value: 'this_week', label: 'This Week' },
                  { value: 'urgent', label: 'Urgent' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setUrgency(opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    urgency === opt.value
                      ? 'border-sage bg-sage/5 font-medium text-sage'
                      : 'border-border text-muted hover:bg-warm-gray/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Preferred Date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Preferred Time</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              >
                <option value="">Any time</option>
                <option value="morning">Morning (8-12)</option>
                <option value="afternoon">Afternoon (12-5)</option>
                <option value="evening">Evening (5-8)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('details')}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-warm-gray/20"
            >
              Back
            </button>
            <button
              onClick={() => setStep('confirm')}
              className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Review Your Request</h2>
          <div className="rounded-xl border border-border bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Category
              </span>
              <span className="text-sm text-primary">{selectedCategory?.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">Task</span>
              <span className="text-sm font-medium text-primary">{title}</span>
            </div>
            {description && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  Details
                </span>
                <p className="mt-1 text-sm text-secondary">{description}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Est. Hours
              </span>
              <span className="text-sm text-primary">
                {estimatedHours} hr{Number(estimatedHours) !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Urgency
              </span>
              <span className="text-sm text-primary">
                {urgency === 'flexible'
                  ? 'Flexible'
                  : urgency === 'this_week'
                    ? 'This Week'
                    : 'Urgent'}
              </span>
            </div>
            {preferredDate && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  Date
                </span>
                <span className="text-sm text-primary">
                  {new Date(preferredDate + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted">
            This request will cost {estimatedHours} hour{Number(estimatedHours) !== 1 ? 's' : ''}{' '}
            from your Time Bank balance. A neighbor will be matched based on skills and
            availability.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('schedule')}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-warm-gray/20"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-sage px-6 py-2 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
