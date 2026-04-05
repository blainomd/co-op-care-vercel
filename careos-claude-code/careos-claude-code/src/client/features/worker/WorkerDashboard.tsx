/**
 * Worker Dashboard — Today's schedule, active shift, quick actions
 *
 * The daily home screen for worker-owner caregivers.
 * Shows today's shifts, current status, upcoming schedule,
 * and quick access to care logging, shift clock, and swaps.
 */
import { useState, useMemo } from 'react';
import type { Shift, ShiftStatus, WorkerEquity } from '@shared/types/worker.types';
import { FINANCIALS } from '@shared/constants/business-rules';

/** Mock data — will be replaced with API calls */
const MOCK_SHIFTS: Shift[] = [
  {
    id: 'shift_001',
    workerId: 'worker_1',
    careRecipientId: 'cr_001',
    careRecipientName: 'Margaret Thompson',
    scheduledStart: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    scheduledEnd: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    status: 'completed',
    checkInLocation: { latitude: 40.015, longitude: -105.27 },
    checkOutLocation: { latitude: 40.015, longitude: -105.27 },
    actualStart: new Date(new Date().setHours(7, 55, 0, 0)).toISOString(),
    actualEnd: new Date(new Date().setHours(12, 5, 0, 0)).toISOString(),
    breaks: [],
    totalBreakMinutes: 0,
    billableHours: 4.17,
    address: '1234 Pearl St, Boulder, CO',
    taskTypes: ['companionship', 'meal_preparation'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shift_002',
    workerId: 'worker_1',
    careRecipientId: 'cr_002',
    careRecipientName: 'Robert Williams',
    scheduledStart: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    scheduledEnd: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    status: 'scheduled',
    breaks: [],
    totalBreakMinutes: 0,
    address: '567 Canyon Blvd, Boulder, CO',
    taskTypes: ['companionship', 'cognitive_activity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'shift_003',
    workerId: 'worker_1',
    careRecipientId: 'cr_003',
    careRecipientName: 'Eleanor Davis',
    scheduledStart: new Date(Date.now() + 86400000).toISOString(),
    scheduledEnd: new Date(Date.now() + 86400000 + 4 * 3600000).toISOString(),
    status: 'scheduled',
    breaks: [],
    totalBreakMinutes: 0,
    address: '890 Mapleton Ave, Boulder, CO',
    taskTypes: ['personal_care', 'medication_reminder'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_EQUITY: WorkerEquity = {
  workerId: 'worker_1',
  hoursWorkedThisQuarter: 312,
  equityRatePerHour: 2.0,
  accumulatedEquity: 8240,
  vestedEquity: 5200,
  vestingStartDate: '2024-06-01',
  nextVestingDate: '2026-06-01',
};

const STATUS_STYLES: Record<ShiftStatus, { bg: string; text: string; label: string }> = {
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Scheduled' },
  checked_in: { bg: 'bg-zone-green/10', text: 'text-zone-green', label: 'Checked In' },
  on_break: { bg: 'bg-zone-yellow/10', text: 'text-zone-yellow', label: 'On Break' },
  active: { bg: 'bg-zone-green/10', text: 'text-zone-green', label: 'Active' },
  completed: { bg: 'bg-warm-gray', text: 'text-text-muted', label: 'Completed' },
  cancelled: { bg: 'bg-zone-red/10', text: 'text-zone-red', label: 'Cancelled' },
  no_show: { bg: 'bg-zone-red/10', text: 'text-zone-red', label: 'No Show' },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export function WorkerDashboard() {
  const [shifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [equity] = useState<WorkerEquity>(MOCK_EQUITY);

  const todayShifts = useMemo(() => {
    const today = new Date().toDateString();
    return shifts.filter((s) => new Date(s.scheduledStart).toDateString() === today);
  }, [shifts]);

  const upcomingShifts = useMemo(() => {
    const today = new Date().toDateString();
    return shifts.filter((s) => new Date(s.scheduledStart).toDateString() !== today);
  }, [shifts]);

  const activeShift = todayShifts.find(
    (s) => s.status === 'checked_in' || s.status === 'active' || s.status === 'on_break',
  );
  const nextShift = todayShifts.find((s) => s.status === 'scheduled') ?? upcomingShifts[0];

  const todayHours = useMemo(
    () => todayShifts.reduce((sum, s) => sum + (s.billableHours ?? 0), 0),
    [todayShifts],
  );

  const weeklyHoursEstimate = useMemo(() => {
    return shifts.reduce((sum, s) => {
      const hours =
        (new Date(s.scheduledEnd).getTime() - new Date(s.scheduledStart).getTime()) /
        (1000 * 60 * 60);
      return sum + hours;
    }, 0);
  }, [shifts]);

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          {new Date().getHours() < 12
            ? 'Good Morning'
            : new Date().getHours() < 17
              ? 'Good Afternoon'
              : 'Good Evening'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {todayShifts.length === 0
            ? 'No shifts scheduled today.'
            : `${todayShifts.length} shift${todayShifts.length !== 1 ? 's' : ''} today`}
        </p>
      </div>

      {/* Quick stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-lg font-bold text-sage">{todayHours.toFixed(1)}</p>
          <p className="text-[10px] text-text-muted">Hours Today</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-lg font-bold text-text-primary">{weeklyHoursEstimate.toFixed(0)}</p>
          <p className="text-[10px] text-text-muted">Est. This Week</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-lg font-bold text-sage">{formatCurrency(equity.vestedEquity)}</p>
          <p className="text-[10px] text-text-muted">Vested Equity</p>
        </div>
      </div>

      {/* Active shift card */}
      {activeShift && (
        <div className="mb-6 rounded-xl border-2 border-sage bg-sage/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-sage" />
              </span>
              <span className="text-sm font-semibold text-sage">Active Shift</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[activeShift.status].bg} ${STATUS_STYLES[activeShift.status].text}`}
            >
              {STATUS_STYLES[activeShift.status].label}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-text-primary">
            {activeShift.careRecipientName}
          </h3>
          <p className="text-xs text-text-muted">
            {formatTime(activeShift.scheduledStart)} – {formatTime(activeShift.scheduledEnd)}
            {activeShift.address && ` · ${activeShift.address}`}
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={`#/worker/care-log?shiftId=${activeShift.id}`}
              className="flex-1 rounded-lg bg-sage px-3 py-2 text-center text-xs font-medium text-white hover:bg-sage-dark"
            >
              Log Care
            </a>
            <a
              href={`#/worker/scribe?shiftId=${activeShift.id}`}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs font-medium text-text-secondary hover:bg-warm-gray"
            >
              Voice Note
            </a>
            <a
              href={`#/worker/clock?shiftId=${activeShift.id}`}
              className="flex-1 rounded-lg border border-sage px-3 py-2 text-center text-xs font-medium text-sage hover:bg-sage/5"
            >
              Clock Out
            </a>
          </div>
        </div>
      )}

      {/* Next shift card (when no active shift) */}
      {!activeShift && nextShift && (
        <div className="mb-6 rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Next Shift</span>
            <span className="text-xs text-text-muted">
              {formatDateShort(nextShift.scheduledStart)}
            </span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-text-primary">
            {nextShift.careRecipientName}
          </h3>
          <p className="text-xs text-text-muted">
            {formatTime(nextShift.scheduledStart)} – {formatTime(nextShift.scheduledEnd)}
          </p>
          {nextShift.address && <p className="mt-1 text-xs text-text-muted">{nextShift.address}</p>}
          <div className="mt-2 flex flex-wrap gap-1">
            {nextShift.taskTypes.map((type) => (
              <span
                key={type}
                className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage capitalize"
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          <a
            href={`#/worker/clock?shiftId=${nextShift.id}`}
            className="mt-3 block rounded-lg bg-sage px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-sage-dark"
          >
            Check In
          </a>
        </div>
      )}

      {/* Today's schedule */}
      {todayShifts.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Today&apos;s Schedule</h2>
          <div className="space-y-2">
            {todayShifts.map((shift) => {
              const style = STATUS_STYLES[shift.status];
              return (
                <div
                  key={shift.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {shift.careRecipientName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatTime(shift.scheduledStart)} – {formatTime(shift.scheduledEnd)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                  >
                    {style.label}
                  </span>
                  {shift.billableHours != null && (
                    <span className="text-xs font-semibold text-text-muted">
                      {shift.billableHours.toFixed(1)}h
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming shifts */}
      {upcomingShifts.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Upcoming</h2>
          <div className="space-y-2">
            {upcomingShifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-white p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{shift.careRecipientName}</p>
                  <p className="text-xs text-text-muted">
                    {formatDateShort(shift.scheduledStart)} · {formatTime(shift.scheduledStart)} –{' '}
                    {formatTime(shift.scheduledEnd)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {shift.taskTypes.slice(0, 2).map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-warm-gray px-2 py-0.5 text-[10px] text-text-muted capitalize"
                    >
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="#/worker/swaps"
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:bg-warm-gray"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Shift Swaps</p>
              <p className="text-[10px] text-text-muted">Request or pick up</p>
            </div>
          </a>
          <a
            href="#/messages"
            className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 hover:bg-warm-gray"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <svg
                className="h-5 w-5 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Messages</p>
              <p className="text-[10px] text-text-muted">Team & families</p>
            </div>
          </a>
        </div>
      </div>

      {/* Equity summary */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">Your Cooperative Equity</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted">Hours This Quarter</p>
            <p className="text-lg font-bold text-text-primary">{equity.hoursWorkedThisQuarter}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Equity Rate</p>
            <p className="text-lg font-bold text-text-primary">${equity.equityRatePerHour}/hr</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Accumulated</p>
            <p className="text-lg font-bold text-sage">
              {formatCurrency(equity.accumulatedEquity)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Vested</p>
            <p className="text-lg font-bold text-sage">{formatCurrency(equity.vestedEquity)}</p>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-warm-gray">
          <div
            className="h-full rounded-full bg-sage transition-all"
            style={{
              width: `${Math.min(100, (equity.accumulatedEquity / (FINANCIALS.WORKER_EQUITY_5YR_CENTS / 100)) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-1 text-[10px] text-text-muted text-center">
          {formatCurrency(equity.accumulatedEquity)} of{' '}
          {formatCurrency(FINANCIALS.WORKER_EQUITY_5YR_CENTS)} 5-year target
        </p>
      </div>
    </div>
  );
}
