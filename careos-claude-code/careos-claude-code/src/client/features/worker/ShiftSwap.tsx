/**
 * Shift Swap — Request or pick up shift swaps with team
 *
 * Workers can:
 * 1. Request a swap for one of their scheduled shifts
 * 2. Browse and pick up available swaps from teammates
 * 3. View status of their swap requests
 */
import { useState } from 'react';
import type { ShiftSwapStatus } from '@shared/types/worker.types';

interface SwapEntry {
  id: string;
  requesterName: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  careRecipientName: string;
  reason?: string;
  status: ShiftSwapStatus;
  isOwn: boolean;
}

/** Mock data */
const MOCK_SWAPS: SwapEntry[] = [
  {
    id: 'swap_001',
    requesterName: 'Maria Lopez',
    shiftDate: '2026-03-10',
    shiftStart: '2026-03-10T09:00:00',
    shiftEnd: '2026-03-10T13:00:00',
    careRecipientName: 'Eleanor Davis',
    reason: 'Doctor appointment conflict',
    status: 'open',
    isOwn: false,
  },
  {
    id: 'swap_002',
    requesterName: 'James Park',
    shiftDate: '2026-03-11',
    shiftStart: '2026-03-11T14:00:00',
    shiftEnd: '2026-03-11T18:00:00',
    careRecipientName: 'Harold Chen',
    reason: 'Family emergency',
    status: 'open',
    isOwn: false,
  },
  {
    id: 'swap_003',
    requesterName: 'You',
    shiftDate: '2026-03-12',
    shiftStart: '2026-03-12T08:00:00',
    shiftEnd: '2026-03-12T12:00:00',
    careRecipientName: 'Margaret Thompson',
    reason: 'Car maintenance',
    status: 'open',
    isOwn: true,
  },
  {
    id: 'swap_004',
    requesterName: 'You',
    shiftDate: '2026-03-08',
    shiftStart: '2026-03-08T10:00:00',
    shiftEnd: '2026-03-08T14:00:00',
    careRecipientName: 'Robert Williams',
    status: 'accepted',
    isOwn: true,
  },
];

const STATUS_STYLES: Record<ShiftSwapStatus, { bg: string; text: string; label: string }> = {
  open: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Open' },
  offered: { bg: 'bg-zone-yellow/10', text: 'text-zone-yellow', label: 'Offered' },
  accepted: { bg: 'bg-zone-green/10', text: 'text-zone-green', label: 'Accepted' },
  approved: { bg: 'bg-sage/10', text: 'text-sage', label: 'Approved' },
  rejected: { bg: 'bg-zone-red/10', text: 'text-zone-red', label: 'Rejected' },
  cancelled: { bg: 'bg-warm-gray', text: 'text-text-muted', label: 'Cancelled' },
  expired: { bg: 'bg-warm-gray', text: 'text-text-muted', label: 'Expired' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function ShiftSwap() {
  const [swaps, setSwaps] = useState<SwapEntry[]>(MOCK_SWAPS);
  const [tab, setTab] = useState<'available' | 'mine'>('available');
  const [confirmAction, setConfirmAction] = useState<{ swapId: string; action: 'accept' } | null>(
    null,
  );

  const availableSwaps = swaps.filter((s) => !s.isOwn && s.status === 'open');
  const mySwaps = swaps.filter((s) => s.isOwn);

  function handleAccept(swapId: string) {
    setSwaps((prev) =>
      prev.map((s) => (s.id === swapId ? { ...s, status: 'accepted' as const } : s)),
    );
    setConfirmAction(null);
    // API call: POST /swaps/:swapId/respond { action: 'accept' }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">Shift Swaps</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Pick up available shifts or manage your swap requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-lg border border-border bg-warm-gray/50 p-1">
        <button
          onClick={() => setTab('available')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === 'available'
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Available ({availableSwaps.length})
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === 'mine'
              ? 'bg-white text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          My Requests ({mySwaps.length})
        </button>
      </div>

      {/* Available swaps */}
      {tab === 'available' && (
        <div className="space-y-3">
          {availableSwaps.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-8 text-center">
              <h3 className="text-sm font-medium text-text-primary">No swaps available</h3>
              <p className="mt-1 text-xs text-text-muted">
                Check back later — team members may post shifts that need coverage.
              </p>
            </div>
          ) : (
            availableSwaps.map((swap) => (
              <div key={swap.id} className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {swap.careRecipientName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[swap.status].bg} ${STATUS_STYLES[swap.status].text}`}
                      >
                        {STATUS_STYLES[swap.status].label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Requested by {swap.requesterName}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    {formatDate(swap.shiftDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
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
                    {formatTime(swap.shiftStart)} – {formatTime(swap.shiftEnd)}
                  </span>
                </div>

                {swap.reason && (
                  <p className="mt-2 rounded-lg bg-warm-gray/50 px-3 py-2 text-xs text-text-muted italic">
                    &quot;{swap.reason}&quot;
                  </p>
                )}

                {/* Confirm dialog */}
                {confirmAction?.swapId === swap.id ? (
                  <div className="mt-3 rounded-lg border border-sage bg-sage/5 p-3">
                    <p className="text-xs font-medium text-sage">
                      Pick up this shift on {formatDate(swap.shiftDate)}?
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleAccept(swap.id)}
                        className="flex-1 rounded-lg bg-sage py-2 text-xs font-medium text-white hover:bg-sage-dark"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmAction(null)}
                        className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary hover:bg-warm-gray"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmAction({ swapId: swap.id, action: 'accept' })}
                    className="mt-3 w-full rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
                  >
                    Pick Up This Shift
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* My swap requests */}
      {tab === 'mine' && (
        <div className="space-y-3">
          {mySwaps.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-8 text-center">
              <h3 className="text-sm font-medium text-text-primary">No swap requests</h3>
              <p className="mt-1 text-xs text-text-muted">
                Need coverage for a shift? Request a swap from your schedule.
              </p>
            </div>
          ) : (
            mySwaps.map((swap) => {
              const statusStyle = STATUS_STYLES[swap.status];
              return (
                <div
                  key={swap.id}
                  className={`rounded-xl border p-4 ${
                    swap.status === 'accepted' || swap.status === 'approved'
                      ? 'border-zone-green/30 bg-zone-green/5'
                      : swap.status === 'open'
                        ? 'border-border bg-white'
                        : 'border-border bg-warm-gray/50 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-text-primary">
                        {swap.careRecipientName}
                      </span>
                      <p className="text-xs text-text-muted">
                        {formatDate(swap.shiftDate)} · {formatTime(swap.shiftStart)} –{' '}
                        {formatTime(swap.shiftEnd)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                  {swap.reason && (
                    <p className="mt-2 text-xs text-text-muted">Reason: {swap.reason}</p>
                  )}
                  {swap.status === 'accepted' && (
                    <p className="mt-2 text-xs text-zone-green">
                      A team member has picked up this shift. You&apos;re covered!
                    </p>
                  )}
                  {swap.status === 'open' && (
                    <p className="mt-2 text-xs text-text-muted">
                      Waiting for a team member to pick up this shift...
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
