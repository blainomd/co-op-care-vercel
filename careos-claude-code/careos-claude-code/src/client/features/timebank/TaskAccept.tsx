/**
 * TaskAccept — Task detail view with accept, GPS check-in/out, and gratitude flow
 *
 * 4-step flow: Accept → Check In (GPS) → Check Out (GPS) → Rate & Thank
 */
import { useState } from 'react';
import { TIME_BANK } from '@shared/constants/business-rules';

type FlowStep = 'detail' | 'checked_in' | 'checked_out' | 'gratitude' | 'complete';

// Demo task data
const DEMO_TASK = {
  id: '1',
  taskType: 'companionship' as const,
  title: 'Afternoon visit with Mom',
  description:
    'Mom enjoys company in the afternoon. She likes talking about gardening and watching cooking shows together. She has mild mobility issues so please help her to the kitchen if she wants tea.',
  requesterName: 'Sarah K.',
  careRecipientName: 'Margaret K.',
  distanceMiles: 0.3,
  estimatedHours: 2,
  scheduledFor: 'Today, 2:00 PM',
  location: { lat: 40.015, lng: -105.27 },
};

function formatDistance(miles: number): string {
  if (miles < 1) return `${Math.round(miles * 5280)} ft`;
  return `${miles.toFixed(1)} mi`;
}

export function TaskAccept() {
  const [step, setStep] = useState<FlowStep>('detail');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'checking' | 'verified' | 'too_far'>('idle');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [gratitudeNote, setGratitudeNote] = useState('');

  function simulateGPSCheck(callback: () => void) {
    setGpsStatus('checking');
    // Simulate GPS verification
    setTimeout(() => {
      setGpsStatus('verified');
      setTimeout(callback, 500);
    }, 1500);
  }

  function handleAcceptAndCheckIn() {
    simulateGPSCheck(() => {
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setStep('checked_in');
      setGpsStatus('idle');
    });
  }

  function handleCheckOut() {
    simulateGPSCheck(() => {
      setCheckOutTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setStep('checked_out');
      setGpsStatus('idle');
    });
  }

  function handleSubmitGratitude() {
    // API call will be wired in later
    setStep('complete');
  }

  // ── Complete screen ──
  if (step === 'complete') {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
            <svg
              className="h-8 w-8 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">Thank You!</h2>
          <p className="mt-2 text-sm text-text-secondary">
            You earned{' '}
            <span className="font-semibold text-sage">+{DEMO_TASK.estimatedHours} hours</span> for
            helping {DEMO_TASK.careRecipientName}.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Your kindness creates a ripple effect in the community.
          </p>
          <div className="mt-6 space-y-2">
            <a
              href="#/timebank"
              className="block rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Find More Tasks
            </a>
            <a
              href="#/conductor"
              className="block rounded-lg border border-border px-6 py-2.5 text-sm text-text-secondary hover:bg-warm-gray"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Gratitude screen ──
  if (step === 'checked_out') {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary">How did it go?</h2>
          <p className="mt-1 text-sm text-text-secondary">Your feedback helps the community</p>

          {/* Star rating */}
          <div className="mt-5">
            <label className="text-sm font-medium text-text-primary">Rate this experience</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`h-8 w-8 ${star <= rating ? 'fill-gold text-gold' : 'fill-none text-warm-gray'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Gratitude note */}
          <div className="mt-5">
            <label className="text-sm font-medium text-text-primary">
              Leave a thank you note <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              placeholder="Thanks for spending time with Mom today..."
              rows={3}
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>

          {/* Time summary */}
          <div className="mt-5 rounded-lg bg-warm-gray/50 p-3">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Check-in</span>
              <span className="font-medium text-text-primary">{checkInTime}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-text-muted">Check-out</span>
              <span className="font-medium text-text-primary">{checkOutTime}</span>
            </div>
            <div className="mt-2 border-t border-border pt-2 flex justify-between text-sm">
              <span className="font-medium text-text-primary">Credits earned</span>
              <span className="font-semibold text-sage">+{DEMO_TASK.estimatedHours}h</span>
            </div>
          </div>

          <button
            onClick={handleSubmitGratitude}
            disabled={rating === 0}
            className="mt-5 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:bg-warm-gray disabled:text-text-muted"
          >
            Submit & Earn Credits
          </button>
        </div>
      </div>
    );
  }

  // ── Checked-in state ──
  if (step === 'checked_in') {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-6">
          {/* Active session indicator */}
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-sage/10 px-3 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage" />
            </span>
            <span className="text-sm font-medium text-sage">Active Session</span>
            <span className="ml-auto text-xs text-text-muted">Since {checkInTime}</span>
          </div>

          <h2 className="font-heading text-lg font-semibold text-text-primary">
            {DEMO_TASK.title}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">With {DEMO_TASK.careRecipientName}</p>

          {DEMO_TASK.description && (
            <div className="mt-4 rounded-lg bg-warm-gray/50 p-3">
              <p className="text-xs leading-relaxed text-text-secondary">{DEMO_TASK.description}</p>
            </div>
          )}

          {/* GPS verification */}
          {gpsStatus === 'checking' && (
            <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Verifying your location...
            </div>
          )}

          {gpsStatus === 'verified' && (
            <div className="mt-4 flex items-center gap-2 text-sm text-sage">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Location verified
            </div>
          )}

          <button
            onClick={handleCheckOut}
            disabled={gpsStatus === 'checking'}
            className="mt-6 w-full rounded-lg bg-copper px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-copper/90 disabled:bg-warm-gray disabled:text-text-muted"
          >
            {gpsStatus === 'checking' ? 'Verifying...' : 'Check Out'}
          </button>

          <p className="mt-2 text-center text-[10px] text-text-muted">
            GPS verified within {TIME_BANK.GPS_VERIFICATION_MILES} mile
          </p>
        </div>
      </div>
    );
  }

  // ── Task detail (default) ──
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {/* Back link */}
      <a
        href="#/timebank"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tasks
      </a>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-lg font-semibold text-text-primary">
              {DEMO_TASK.title}
            </h1>
            <p className="mt-0.5 text-sm text-text-muted">Requested by {DEMO_TASK.requesterName}</p>
          </div>
          <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage">
            +{DEMO_TASK.estimatedHours}h
          </span>
        </div>

        {DEMO_TASK.description && (
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            {DEMO_TASK.description}
          </p>
        )}

        {/* Details grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Care Recipient
            </span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">
              {DEMO_TASK.careRecipientName}
            </p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">Distance</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">
              {formatDistance(DEMO_TASK.distanceMiles)}
            </p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">Scheduled</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{DEMO_TASK.scheduledFor}</p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">Estimated</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">
              {DEMO_TASK.estimatedHours} hours
            </p>
          </div>
        </div>

        {/* GPS verification */}
        {gpsStatus === 'checking' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-muted">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Verifying your location...
          </div>
        )}

        {gpsStatus === 'verified' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-sage">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Location verified — checking in...
          </div>
        )}

        <button
          onClick={handleAcceptAndCheckIn}
          disabled={gpsStatus === 'checking'}
          className="mt-6 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark disabled:bg-warm-gray disabled:text-text-muted"
        >
          {gpsStatus === 'checking' ? 'Verifying GPS...' : 'Accept & Check In'}
        </button>

        <p className="mt-2 text-center text-[10px] text-text-muted">
          GPS verifies you&apos;re within {TIME_BANK.GPS_VERIFICATION_MILES} mile of the care
          recipient
        </p>
      </div>
    </div>
  );
}
