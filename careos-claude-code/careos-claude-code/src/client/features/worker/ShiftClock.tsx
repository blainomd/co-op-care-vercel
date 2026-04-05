/**
 * Shift Clock — GPS check-in/out with break tracking
 *
 * Workers check in and out of shifts with GPS verification.
 * Supports break tracking with real-time elapsed time display.
 * Shows shift summary upon checkout.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ShiftSummary, ShiftBreak } from '@shared/types/worker.types';
import { TIME_BANK } from '@shared/constants/business-rules';

type ClockPhase = 'pre_checkin' | 'checked_in' | 'on_break' | 'summary';

/** Mock shift info */
const MOCK_SHIFT = {
  id: 'shift_002',
  careRecipientName: 'Robert Williams',
  address: '567 Canyon Blvd, Boulder, CO',
  scheduledStart: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
  scheduledEnd: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
  taskTypes: ['companionship', 'cognitive_activity'],
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ShiftClock() {
  const [phase, setPhase] = useState<ClockPhase>('pre_checkin');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const [breaks, setBreaks] = useState<ShiftBreak[]>([]);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'acquiring' | 'success' | 'error'>('idle');
  const [gpsPosition, setGpsPosition] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [now, setNow] = useState(Date.now());
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<ShiftSummary | null>(null);

  // Tick every second for elapsed time
  useEffect(() => {
    if (phase === 'checked_in' || phase === 'on_break') {
      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const elapsed = useMemo(() => {
    if (!checkInTime) return 0;
    return now - new Date(checkInTime).getTime();
  }, [checkInTime, now]);

  const totalBreakMs = useMemo(() => {
    return breaks.reduce((sum, b) => {
      if (b.endedAt) {
        return sum + (new Date(b.endedAt).getTime() - new Date(b.startedAt).getTime());
      }
      if (phase === 'on_break') {
        return sum + (now - new Date(b.startedAt).getTime());
      }
      return sum;
    }, 0);
  }, [breaks, phase, now]);

  const activeMs = elapsed - totalBreakMs;
  const isOnBreak = phase === 'on_break';

  const acquireGPS = useCallback(() => {
    setGpsStatus('acquiring');
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsStatus('success');
      },
      () => {
        // For demo/mock, use Boulder coordinates
        setGpsPosition({ latitude: 40.015, longitude: -105.27 });
        setGpsStatus('success');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  function handleCheckIn() {
    if (!gpsPosition) return;
    const time = new Date().toISOString();
    setCheckInTime(time);
    setPhase('checked_in');
    // API call: POST /shifts/:shiftId/checkin
  }

  function handleStartBreak() {
    setBreaks((prev) => [...prev, { startedAt: new Date().toISOString() }]);
    setPhase('on_break');
    // API call: POST /shifts/:shiftId/break/start
  }

  function handleEndBreak() {
    setBreaks((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && !last.endedAt) {
        const endedAt = new Date().toISOString();
        last.endedAt = endedAt;
        last.durationMinutes = Math.round(
          (new Date(endedAt).getTime() - new Date(last.startedAt).getTime()) / (1000 * 60),
        );
      }
      return updated;
    });
    setPhase('checked_in');
    // API call: POST /shifts/:shiftId/break/end
  }

  function handleCheckOut() {
    const totalBreakMinutes = Math.round(totalBreakMs / (1000 * 60));
    const actualHours = elapsed / (1000 * 60 * 60);
    const billableHours = Math.max(0, actualHours - totalBreakMinutes / 60);

    setSummary({
      shiftId: MOCK_SHIFT.id,
      scheduledHours: 3,
      actualHours: Math.round(actualHours * 100) / 100,
      breakMinutes: totalBreakMinutes,
      billableHours: Math.round(billableHours * 100) / 100,
      careRecipientName: MOCK_SHIFT.careRecipientName,
      taskTypes: MOCK_SHIFT.taskTypes,
      careLogsCount: 2,
    });
    setPhase('summary');
    // API call: POST /shifts/:shiftId/checkout
  }

  // ─── Summary Screen ─────────────────────────────────────
  if (phase === 'summary' && summary) {
    return (
      <div className="mx-auto max-w-md p-6">
        <div className="rounded-2xl border border-border bg-white p-6 text-center">
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
          <h2 className="font-heading text-xl font-semibold text-text-primary">Shift Complete</h2>
          <p className="mt-1 text-sm text-text-muted">{summary.careRecipientName}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-warm-gray/50 p-3">
              <p className="text-lg font-bold text-sage">{summary.billableHours.toFixed(1)}h</p>
              <p className="text-[10px] text-text-muted">Billable</p>
            </div>
            <div className="rounded-lg bg-warm-gray/50 p-3">
              <p className="text-lg font-bold text-text-primary">
                {summary.actualHours.toFixed(1)}h
              </p>
              <p className="text-[10px] text-text-muted">Total Time</p>
            </div>
            <div className="rounded-lg bg-warm-gray/50 p-3">
              <p className="text-lg font-bold text-text-primary">{summary.breakMinutes}m</p>
              <p className="text-[10px] text-text-muted">Break Time</p>
            </div>
            <div className="rounded-lg bg-warm-gray/50 p-3">
              <p className="text-lg font-bold text-text-primary">{summary.careLogsCount}</p>
              <p className="text-[10px] text-text-muted">Care Logs</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-sage/5 p-3 text-xs text-sage">
            Equity earned: ${(summary.billableHours * 2.0).toFixed(2)}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <a
              href="#/worker"
              className="rounded-lg bg-sage px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Shift Clock</h1>
        <p className="mt-1 text-sm text-text-muted">{MOCK_SHIFT.careRecipientName}</p>
        <p className="text-xs text-text-muted">
          {formatTime(MOCK_SHIFT.scheduledStart)} – {formatTime(MOCK_SHIFT.scheduledEnd)}
          {MOCK_SHIFT.address && ` · ${MOCK_SHIFT.address}`}
        </p>
      </div>

      {/* Timer display */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-6 text-center">
        <p
          className={`font-mono text-4xl font-bold ${isOnBreak ? 'text-zone-yellow' : 'text-text-primary'}`}
        >
          {phase === 'pre_checkin' ? '00:00:00' : formatElapsed(activeMs)}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {phase === 'pre_checkin' && 'Ready to check in'}
          {phase === 'checked_in' && 'Active shift time'}
          {phase === 'on_break' && 'On break — timer paused'}
        </p>
        {totalBreakMs > 0 && (
          <p className="mt-1 text-[10px] text-zone-yellow">
            Break time: {formatElapsed(totalBreakMs)}
          </p>
        )}
      </div>

      {/* GPS Status */}
      {phase === 'pre_checkin' && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">GPS Verification</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                gpsStatus === 'success'
                  ? 'bg-zone-green/10 text-zone-green'
                  : gpsStatus === 'error'
                    ? 'bg-zone-red/10 text-zone-red'
                    : gpsStatus === 'acquiring'
                      ? 'bg-zone-yellow/10 text-zone-yellow'
                      : 'bg-warm-gray text-text-muted'
              }`}
            >
              {gpsStatus === 'success'
                ? 'Located'
                : gpsStatus === 'error'
                  ? 'Error'
                  : gpsStatus === 'acquiring'
                    ? 'Acquiring...'
                    : 'Not started'}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Must be within {TIME_BANK.GPS_VERIFICATION_MILES} miles of the shift location.
          </p>
          {gpsStatus !== 'success' && (
            <button
              onClick={acquireGPS}
              disabled={gpsStatus === 'acquiring'}
              className="mt-3 w-full rounded-lg border border-sage px-4 py-2 text-sm font-medium text-sage hover:bg-sage/5 disabled:opacity-50"
            >
              {gpsStatus === 'acquiring' ? 'Acquiring GPS...' : 'Get My Location'}
            </button>
          )}
          {gpsPosition && (
            <p className="mt-2 text-[10px] text-text-muted text-center">
              {gpsPosition.latitude.toFixed(4)}, {gpsPosition.longitude.toFixed(4)}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {phase === 'pre_checkin' && (
          <button
            onClick={handleCheckIn}
            disabled={gpsStatus !== 'success'}
            className="w-full rounded-xl bg-sage py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check In
          </button>
        )}

        {phase === 'checked_in' && (
          <>
            <button
              onClick={handleStartBreak}
              className="w-full rounded-xl border border-zone-yellow bg-zone-yellow/5 py-3 text-sm font-medium text-zone-yellow hover:bg-zone-yellow/10"
            >
              Start Break
            </button>
            <div className="flex gap-3">
              <a
                href={`#/worker/care-log?shiftId=${MOCK_SHIFT.id}`}
                className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-medium text-text-secondary hover:bg-warm-gray"
              >
                Log Care
              </a>
              <a
                href={`#/worker/scribe?shiftId=${MOCK_SHIFT.id}`}
                className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-medium text-text-secondary hover:bg-warm-gray"
              >
                Voice Note
              </a>
            </div>
            <div className="rounded-xl border border-border bg-white p-3">
              <label className="mb-1 block text-xs font-medium text-text-muted">
                Shift Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about the shift..."
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none"
                rows={2}
              />
            </div>
            <button
              onClick={handleCheckOut}
              className="w-full rounded-xl bg-zone-red py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
            >
              Check Out
            </button>
          </>
        )}

        {phase === 'on_break' && (
          <button
            onClick={handleEndBreak}
            className="w-full rounded-xl bg-sage py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-sage-dark"
          >
            End Break
          </button>
        )}
      </div>

      {/* Break history */}
      {breaks.length > 0 && phase !== 'summary' && (
        <div className="mt-6 rounded-xl border border-border bg-white p-4">
          <h3 className="mb-2 text-xs font-medium text-text-muted">Breaks</h3>
          <div className="space-y-1">
            {breaks.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Break {i + 1}:{' '}
                  {new Date(b.startedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {b.endedAt &&
                    ` – ${new Date(b.endedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                </span>
                <span className="text-text-muted">
                  {b.durationMinutes ? `${b.durationMinutes}m` : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
