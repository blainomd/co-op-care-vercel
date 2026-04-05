/**
 * GPSCheckin — GPS check-in/check-out flow for Time Bank tasks
 *
 * Task state machine: Accepted -> In Progress (GPS check-in) -> Completed (GPS check-out) -> Rated -> Credits transferred
 * Haversine distance verification with 0.25mi threshold.
 */
import { useState } from 'react';
import { TIME_BANK } from '@shared/constants/business-rules';

type TaskState = 'accepted' | 'in_progress' | 'completed' | 'rated';

type GPSVerification = 'idle' | 'verifying' | 'within_range' | 'too_far';

// Demo task data
const DEMO_TASK = {
  id: 'tb-2047',
  taskType: 'companionship' as const,
  familyName: 'Henderson Family',
  careRecipientName: 'Dorothy H.',
  address: '1847 Mapleton Ave, Boulder, CO 80304',
  expectedDuration: 2.5,
  scheduledFor: 'Today, 3:00 PM',
  distanceMiles: 0.18,
  location: { lat: 40.0176, lng: -105.2797 },
  credits: 2.5,
};

// Weekly stats
const WEEKLY_STATS = {
  tasksToday: 1,
  totalHoursThisWeek: 6.5,
};

function formatElapsed(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(mins)}:${pad(secs)}`;
}

export function GPSCheckin() {
  const [taskState, setTaskState] = useState<TaskState>('accepted');
  const [gpsStatus, setGpsStatus] = useState<GPSVerification>('idle');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [gratitudeNote, setGratitudeNote] = useState('');

  // Simulate GPS verification (Haversine check)
  function simulateGPSVerification(onSuccess: () => void) {
    setGpsStatus('verifying');
    setTimeout(() => {
      // Simulate: 85% chance within range, 15% too far
      const withinRange = Math.random() > 0.15;
      if (withinRange) {
        setGpsStatus('within_range');
        setTimeout(onSuccess, 600);
      } else {
        setGpsStatus('too_far');
      }
    }, 2000);
  }

  function handleCheckIn() {
    simulateGPSVerification(() => {
      const now = new Date();
      setCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTaskState('in_progress');
      setGpsStatus('idle');
      // Start elapsed timer
      const interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      setTimerRef(interval);
    });
  }

  function handleCheckOut() {
    simulateGPSVerification(() => {
      const now = new Date();
      setCheckOutTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTaskState('completed');
      setGpsStatus('idle');
      if (timerRef) {
        clearInterval(timerRef);
        setTimerRef(null);
      }
    });
  }

  function handleRetryGPS() {
    setGpsStatus('idle');
  }

  function handleSubmitRating() {
    setTaskState('rated');
  }

  // Duration in hours from elapsed seconds
  const durationHours = elapsedSeconds / 3600;
  const creditsEarned = Math.max(parseFloat(durationHours.toFixed(1)), DEMO_TASK.credits);

  // ── Rated / Credits Transferred ──
  if (taskState === 'rated') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
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
          <h2 className="font-heading text-xl font-semibold text-primary">Task Complete</h2>
          <p className="mt-2 text-sm text-secondary">
            You earned <span className="font-semibold text-sage">+{creditsEarned}h</span> for
            helping {DEMO_TASK.careRecipientName}.
          </p>
          <p className="mt-1 text-xs text-muted">
            Credits have been transferred to your Time Bank balance.
          </p>

          {/* Summary card */}
          <div className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-warm-gray/30 p-4 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Task</span>
              <span className="font-medium text-primary capitalize">{DEMO_TASK.taskType}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-xs">
              <span className="text-muted">Family</span>
              <span className="font-medium text-primary">{DEMO_TASK.familyName}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-xs">
              <span className="text-muted">Check-in</span>
              <span className="font-medium text-primary">{checkInTime}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-xs">
              <span className="text-muted">Check-out</span>
              <span className="font-medium text-primary">{checkOutTime}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-xs">
              <span className="text-muted">Duration</span>
              <span className="font-medium text-primary">{formatElapsed(elapsedSeconds)}</span>
            </div>
            <div className="mt-2 border-t border-border pt-2 flex justify-between text-sm">
              <span className="font-medium text-primary">Credits earned</span>
              <span className="font-semibold text-sage">+{creditsEarned}h</span>
            </div>
          </div>

          {/* Task completion stats */}
          <div className="mx-auto mt-4 flex max-w-sm gap-3">
            <div className="flex-1 rounded-lg bg-sage/10 p-3 text-center">
              <p className="text-lg font-semibold text-sage">{WEEKLY_STATS.tasksToday + 1}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted">Tasks today</p>
            </div>
            <div className="flex-1 rounded-lg bg-copper/10 p-3 text-center">
              <p className="text-lg font-semibold text-copper">
                {(WEEKLY_STATS.totalHoursThisWeek + creditsEarned).toFixed(1)}h
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted">This week</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <a
              href="#/timebank"
              className="block rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Find More Tasks
            </a>
            <a
              href="#/conductor"
              className="block rounded-lg border border-border px-6 py-2.5 text-sm text-secondary hover:bg-warm-gray"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Completed — Rate & Gratitude ──
  if (taskState === 'completed') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-lg font-semibold text-primary">How did it go?</h2>
          <p className="mt-1 text-sm text-secondary">
            Rate your experience and leave a note of gratitude
          </p>

          {/* Duration summary */}
          <div className="mt-5 rounded-lg bg-warm-gray/50 p-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Check-in</span>
              <span className="font-medium text-primary">{checkInTime}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-muted">Check-out</span>
              <span className="font-medium text-primary">{checkOutTime}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-muted">Duration</span>
              <span className="font-medium text-primary">{formatElapsed(elapsedSeconds)}</span>
            </div>
            <div className="mt-2 border-t border-border pt-2 flex justify-between text-sm">
              <span className="font-medium text-primary">Credits earned</span>
              <span className="font-semibold text-sage">+{creditsEarned}h</span>
            </div>
          </div>

          {/* Star rating */}
          <div className="mt-5">
            <label className="text-sm font-medium text-primary">Rate this experience</label>
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
            <label className="text-sm font-medium text-primary">
              Leave a gratitude note <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              placeholder="Thank you for the warm welcome today..."
              rows={3}
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>

          <button
            onClick={handleSubmitRating}
            disabled={rating === 0}
            className="mt-5 w-full rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:bg-warm-gray disabled:text-muted"
          >
            Submit & Earn Credits
          </button>
        </div>
      </div>
    );
  }

  // ── In Progress — Timer, Notes, Check Out ──
  if (taskState === 'in_progress') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-6">
          {/* Active session indicator */}
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-sage/10 px-3 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage" />
            </span>
            <span className="text-sm font-medium text-sage">Active Session</span>
            <span className="ml-auto text-xs text-muted">Since {checkInTime}</span>
          </div>

          {/* Task info */}
          <h2 className="font-heading text-lg font-semibold text-primary">
            {DEMO_TASK.taskType.charAt(0).toUpperCase() + DEMO_TASK.taskType.slice(1)} Visit
          </h2>
          <p className="mt-1 text-sm text-secondary">
            With {DEMO_TASK.careRecipientName} &mdash; {DEMO_TASK.familyName}
          </p>

          {/* Elapsed timer */}
          <div className="mt-5 flex items-center justify-center">
            <div className="rounded-xl bg-warm-gray/50 px-8 py-5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted">Elapsed Time</p>
              <p className="mt-1 font-mono text-3xl font-semibold text-primary">
                {formatElapsed(elapsedSeconds)}
              </p>
              <p className="mt-1 text-xs text-muted">Expected: {DEMO_TASK.expectedDuration}h</p>
            </div>
          </div>

          {/* Task notes */}
          <div className="mt-5">
            <label className="text-sm font-medium text-primary">
              Task Notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="How is the visit going? Any observations to share..."
              rows={3}
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>

          {/* Mock map placeholder */}
          <div className="mt-5 overflow-hidden rounded-lg border border-border">
            <div className="flex h-36 items-center justify-center bg-warm-gray/30">
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <p className="mt-1 text-xs text-muted">{DEMO_TASK.address}</p>
                <p className="mt-0.5 text-[10px] text-sage">
                  {DEMO_TASK.distanceMiles < TIME_BANK.GPS_VERIFICATION_MILES
                    ? `${Math.round(DEMO_TASK.distanceMiles * 5280)} ft away — within range`
                    : `${DEMO_TASK.distanceMiles.toFixed(2)} mi away`}
                </p>
              </div>
            </div>
          </div>

          {/* GPS verification status */}
          {gpsStatus === 'verifying' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
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
              Verifying location...
            </div>
          )}

          {gpsStatus === 'within_range' && (
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
              Within {TIME_BANK.GPS_VERIFICATION_MILES} miles — location verified
            </div>
          )}

          {gpsStatus === 'too_far' && (
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-zone-red">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Too far — move closer to check out
              </div>
              <button
                onClick={handleRetryGPS}
                className="mt-2 text-xs text-sage underline hover:text-sage-dark"
              >
                Retry GPS verification
              </button>
            </div>
          )}

          {/* Check Out button */}
          <button
            onClick={handleCheckOut}
            disabled={gpsStatus === 'verifying'}
            className="mt-6 w-full rounded-lg bg-copper px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-copper/90 disabled:bg-warm-gray disabled:text-muted"
          >
            {gpsStatus === 'verifying' ? 'Verifying GPS...' : 'Check Out'}
          </button>

          <p className="mt-2 text-center text-[10px] text-muted">
            GPS verifies you're within {TIME_BANK.GPS_VERIFICATION_MILES} mile of the care recipient
          </p>
        </div>

        {/* Task completion stats */}
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-xl border border-border bg-white p-3 text-center">
            <p className="text-lg font-semibold text-sage">{WEEKLY_STATS.tasksToday}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Tasks today</p>
          </div>
          <div className="flex-1 rounded-xl border border-border bg-white p-3 text-center">
            <p className="text-lg font-semibold text-copper">{WEEKLY_STATS.totalHoursThisWeek}h</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">This week</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Accepted — Task Card + Check In ──
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <a
        href="#/timebank"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-secondary"
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

      {/* Task card */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block rounded-full bg-sage/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sage">
              {DEMO_TASK.taskType}
            </span>
            <h1 className="mt-2 font-heading text-lg font-semibold text-primary">
              Visit with {DEMO_TASK.careRecipientName}
            </h1>
            <p className="mt-0.5 text-sm text-muted">{DEMO_TASK.familyName}</p>
          </div>
          <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage">
            +{DEMO_TASK.credits}h
          </span>
        </div>

        {/* Details grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <span className="text-[10px] uppercase tracking-wider text-muted">Address</span>
            <p className="mt-0.5 text-sm font-medium text-primary">{DEMO_TASK.address}</p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <span className="text-[10px] uppercase tracking-wider text-muted">Distance</span>
            <p className="mt-0.5 text-sm font-medium text-primary">
              {DEMO_TASK.distanceMiles < 1
                ? `${Math.round(DEMO_TASK.distanceMiles * 5280)} ft`
                : `${DEMO_TASK.distanceMiles.toFixed(1)} mi`}
            </p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <span className="text-[10px] uppercase tracking-wider text-muted">Scheduled</span>
            <p className="mt-0.5 text-sm font-medium text-primary">{DEMO_TASK.scheduledFor}</p>
          </div>
          <div className="rounded-lg bg-warm-gray/50 p-3">
            <span className="text-[10px] uppercase tracking-wider text-muted">
              Expected Duration
            </span>
            <p className="mt-0.5 text-sm font-medium text-primary">
              {DEMO_TASK.expectedDuration} hours
            </p>
          </div>
        </div>

        {/* Mock map placeholder */}
        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          <div className="flex h-40 items-center justify-center bg-warm-gray/30">
            <div className="text-center">
              <svg
                className="mx-auto h-10 w-10 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <p className="mt-2 text-xs font-medium text-secondary">{DEMO_TASK.address}</p>
              <p className="mt-1 text-[10px] text-muted">
                {DEMO_TASK.distanceMiles < TIME_BANK.GPS_VERIFICATION_MILES
                  ? `${Math.round(DEMO_TASK.distanceMiles * 5280)} ft away — within ${TIME_BANK.GPS_VERIFICATION_MILES} mi threshold`
                  : `${DEMO_TASK.distanceMiles.toFixed(2)} mi away — must be within ${TIME_BANK.GPS_VERIFICATION_MILES} mi`}
              </p>
            </div>
          </div>
        </div>

        {/* GPS verification status */}
        {gpsStatus === 'verifying' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
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
            Verifying location...
          </div>
        )}

        {gpsStatus === 'within_range' && (
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
            Within {TIME_BANK.GPS_VERIFICATION_MILES} miles — checking in...
          </div>
        )}

        {gpsStatus === 'too_far' && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-zone-red/10 px-3 py-2 text-sm text-zone-red">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Too far — move closer to {DEMO_TASK.address}
            </div>
            <button
              onClick={handleRetryGPS}
              className="mt-2 block w-full text-xs text-sage underline hover:text-sage-dark"
            >
              Retry GPS verification
            </button>
          </div>
        )}

        {/* Check In button */}
        <button
          onClick={handleCheckIn}
          disabled={gpsStatus === 'verifying'}
          className="mt-6 w-full rounded-lg bg-sage px-6 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sage-dark disabled:bg-warm-gray disabled:text-muted"
        >
          {gpsStatus === 'verifying' ? 'Verifying GPS...' : 'Check In'}
        </button>

        <p className="mt-2 text-center text-[10px] text-muted">
          GPS verifies you're within {TIME_BANK.GPS_VERIFICATION_MILES} mile of the care recipient
        </p>
      </div>

      {/* Task completion stats */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-lg font-semibold text-sage">{WEEKLY_STATS.tasksToday}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted">Tasks today</p>
        </div>
        <div className="flex-1 rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-lg font-semibold text-copper">{WEEKLY_STATS.totalHoursThisWeek}h</p>
          <p className="text-[10px] uppercase tracking-wider text-muted">This week</p>
        </div>
      </div>
    </div>
  );
}
