/**
 * RespiteDispatch — Emergency care dispatch from Respite Fund
 *
 * "We need help NOW" — crisis activation with 2-min confirmation,
 * nearest available worker-owner dispatch, real-time ETA tracking.
 */
import { useState } from 'react';

type DispatchStatus = 'idle' | 'confirming' | 'dispatching' | 'matched' | 'en_route';

interface AvailableWorker {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  eta: string;
  rating: number;
  certifications: string[];
  lastActive: string;
}

const MOCK_WORKERS: AvailableWorker[] = [
  {
    id: 'w1',
    name: 'James Park',
    avatar: 'JP',
    distance: '0.3 mi',
    eta: '12 min',
    rating: 4.9,
    certifications: ['Safe Transfers', 'Emergency Response'],
    lastActive: '2 min ago',
  },
  {
    id: 'w2',
    name: 'Linda Chen',
    avatar: 'LC',
    distance: '0.8 mi',
    eta: '18 min',
    rating: 4.8,
    certifications: ['Medication Management', 'Fall Prevention'],
    lastActive: '5 min ago',
  },
  {
    id: 'w3',
    name: 'Roberto Mendez',
    avatar: 'RM',
    distance: '1.2 mi',
    eta: '22 min',
    rating: 4.7,
    certifications: ['Dementia Communication', 'Safe Transfers'],
    lastActive: '10 min ago',
  },
];

export function RespiteDispatch() {
  const [status, setStatus] = useState<DispatchStatus>('idle');
  const [selectedWorker, setSelectedWorker] = useState<AvailableWorker | null>(null);
  const [reason, setReason] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'urgent' | 'emergency'>('urgent');

  const respiteFundBalance = 847.5; // hours
  const estimatedCost = urgencyLevel === 'emergency' ? 4 : 2; // hours from fund

  const handleActivate = () => {
    setStatus('confirming');
  };

  const handleConfirmDispatch = () => {
    setStatus('dispatching');
    // Simulate matching
    setTimeout(() => {
      setSelectedWorker(MOCK_WORKERS[0]!);
      setStatus('matched');
    }, 2000);
  };

  const handleAcceptMatch = () => {
    setStatus('en_route');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Respite Emergency Dispatch</h1>
        <p className="text-sm text-muted">
          Activate emergency care from the community Respite Fund
        </p>
      </div>

      {/* Fund Status */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{respiteFundBalance}</p>
          <p className="text-[11px] text-muted">Fund Balance (hrs)</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-copper">{MOCK_WORKERS.length}</p>
          <p className="text-[11px] text-muted">Workers Available</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">{MOCK_WORKERS[0]?.eta}</p>
          <p className="text-[11px] text-muted">Nearest ETA</p>
        </div>
      </div>

      {/* Idle State — Emergency Activation */}
      {status === 'idle' && (
        <>
          <div className="rounded-xl border border-zone-red/20 bg-zone-red/5 p-4">
            <h3 className="text-sm font-semibold text-zone-red">When to Use Emergency Dispatch</h3>
            <ul className="mt-2 space-y-1 text-xs text-secondary">
              <li>• Caregiver is suddenly unavailable and care recipient needs immediate help</li>
              <li>• Care recipient has had a fall or safety concern (non-911)</li>
              <li>• Family member needs respite break urgently</li>
              <li>• Scheduled care worker called out with no replacement</li>
            </ul>
            <p className="mt-2 text-[11px] text-muted">
              For medical emergencies, always call 911 first.
            </p>
          </div>

          {/* Urgency Level */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-primary">Urgency Level</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: 'urgent' as const,
                  label: 'Urgent',
                  desc: 'Need help within 1-2 hours',
                  cost: '2 hrs from fund',
                },
                {
                  value: 'emergency' as const,
                  label: 'Emergency',
                  desc: 'Need help within 30 minutes',
                  cost: '4 hrs from fund',
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setUrgencyLevel(opt.value)}
                  className={`rounded-xl border-2 p-3 text-left transition-colors ${
                    urgencyLevel === opt.value
                      ? opt.value === 'emergency'
                        ? 'border-zone-red bg-zone-red/5'
                        : 'border-gold bg-gold/5'
                      : 'border-border bg-white hover:border-warm-gray'
                  }`}
                >
                  <p className="text-sm font-semibold text-primary">{opt.label}</p>
                  <p className="text-[11px] text-secondary">{opt.desc}</p>
                  <p className="mt-1 text-[10px] text-muted">{opt.cost}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">
              What happened? <span className="text-muted">(brief description)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              rows={3}
              placeholder="e.g., Regular caregiver called out sick, need someone for afternoon care..."
            />
          </div>

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={!reason.trim()}
            className="w-full rounded-xl bg-zone-red px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zone-red/90 disabled:opacity-50"
          >
            Activate Emergency Dispatch
          </button>
        </>
      )}

      {/* Confirming State */}
      {status === 'confirming' && (
        <div className="rounded-xl border-2 border-zone-red bg-zone-red/5 p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-zone-red"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <h2 className="mt-3 text-lg font-bold text-primary">Confirm Emergency Dispatch</h2>
          <p className="mt-1 text-sm text-secondary">
            This will deduct <strong>{estimatedCost} hours</strong> from the Respite Fund and alert
            all available worker-owners within 2 miles.
          </p>
          <p className="mt-2 text-xs text-muted">Reason: {reason}</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setStatus('idle')}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-secondary hover:bg-warm-gray/20"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDispatch}
              className="flex-1 rounded-lg bg-zone-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-zone-red/90"
            >
              Confirm — Dispatch Now
            </button>
          </div>
        </div>
      )}

      {/* Dispatching State — Loading */}
      {status === 'dispatching' && (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-sage border-t-transparent" />
          <h2 className="mt-4 text-lg font-bold text-primary">Finding Available Worker-Owner...</h2>
          <p className="mt-1 text-sm text-muted">
            Alerting certified caregivers near the care recipient
          </p>
          <div className="mt-4 flex justify-center gap-1">
            {MOCK_WORKERS.map((w) => (
              <div
                key={w.id}
                className="h-2 w-2 animate-pulse rounded-full bg-sage"
                style={{ animationDelay: `${parseInt(w.id.slice(1)) * 200}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Matched State */}
      {status === 'matched' && selectedWorker && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-sage bg-sage/5 p-4 text-center">
            <svg
              className="mx-auto h-8 w-8 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-2 text-lg font-bold text-sage">Match Found!</h2>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/10 text-lg font-bold text-sage">
                {selectedWorker.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-primary">{selectedWorker.name}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span>{selectedWorker.distance} away</span>
                  <span>ETA: {selectedWorker.eta}</span>
                  <span>{selectedWorker.rating} rating</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedWorker.certifications.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedWorker(null);
                setStatus('dispatching');
              }}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-secondary hover:bg-warm-gray/20"
            >
              Find Another
            </button>
            <button
              onClick={handleAcceptMatch}
              className="flex-1 rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-white hover:bg-sage-dark"
            >
              Accept — Send {selectedWorker.name.split(' ')[0]}
            </button>
          </div>
        </div>
      )}

      {/* En Route State */}
      {status === 'en_route' && selectedWorker && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-sage bg-sage/5 p-6 text-center">
            <h2 className="text-xl font-bold text-sage">Help is on the way!</h2>
            <p className="mt-1 text-sm text-secondary">
              {selectedWorker.name} is heading to the care recipient now
            </p>
            <p className="mt-3 text-3xl font-bold text-primary">{selectedWorker.eta}</p>
            <p className="text-xs text-muted">Estimated arrival</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="text-sm font-semibold text-primary">Dispatch Details</h3>
            <div className="mt-2 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Worker-Owner</span>
                <span className="font-medium text-primary">{selectedWorker.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Distance</span>
                <span className="font-medium text-primary">{selectedWorker.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Urgency</span>
                <span
                  className={`font-medium ${urgencyLevel === 'emergency' ? 'text-zone-red' : 'text-gold'}`}
                >
                  {urgencyLevel === 'emergency' ? 'Emergency' : 'Urgent'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Respite Fund Cost</span>
                <span className="font-medium text-primary">{estimatedCost} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Remaining Balance</span>
                <span className="font-medium text-sage">
                  {respiteFundBalance - estimatedCost} hours
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="tel:+15551234567"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-sage px-4 py-2.5 text-sm font-medium text-sage hover:bg-sage/5"
            >
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
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              Call {selectedWorker.name.split(' ')[0]}
            </a>
            <a
              href="#/messages/new"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-secondary hover:bg-warm-gray/20"
            >
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
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
              Message
            </a>
          </div>
        </div>
      )}

      {/* Available Workers List (shown in idle and confirming) */}
      {(status === 'idle' || status === 'confirming') && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-primary">
            Available Worker-Owners Nearby
          </h2>
          <div className="space-y-2">
            {MOCK_WORKERS.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-white p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sm font-bold text-sage">
                  {worker.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary">{worker.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span>{worker.distance}</span>
                    <span>•</span>
                    <span>ETA {worker.eta}</span>
                    <span>•</span>
                    <span>{worker.rating} stars</span>
                  </div>
                </div>
                <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] text-sage">
                  {worker.lastActive}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted">
        Respite Fund is collectively owned. 10% of all Time Bank transactions contribute to
        emergency reserves.
      </p>
    </div>
  );
}
