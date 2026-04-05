/**
 * RespiteFund — Emergency fund balance, disbursement controls
 */
import { useState } from 'react';

interface FundBalance {
  totalHours: number;
  totalDollars: number;
  availableHours: number;
  reservedHours: number;
  autoApproveThreshold: number;
}

interface Disbursement {
  id: string;
  recipientName: string;
  hours: number;
  reason: string;
  approvedBy: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'denied';
}

const MOCK_BALANCE: FundBalance = {
  totalHours: 240,
  totalDollars: 6000,
  availableHours: 187,
  reservedHours: 53,
  autoApproveThreshold: 100,
};

const MOCK_DISBURSEMENTS: Disbursement[] = [
  {
    id: 'd1',
    recipientName: 'Martinez Family',
    hours: 12,
    reason: 'Emergency respite — caregiver hospitalized',
    approvedBy: 'Admin',
    createdAt: '2026-03-06T14:00:00Z',
    status: 'approved',
  },
  {
    id: 'd2',
    recipientName: 'Johnson Family',
    hours: 8,
    reason: 'Burnout prevention — >10 hrs/wk for 3 weeks',
    approvedBy: 'Auto',
    createdAt: '2026-03-04T10:00:00Z',
    status: 'approved',
  },
  {
    id: 'd3',
    recipientName: 'Williams Family',
    hours: 24,
    reason: 'Extended respite — family crisis',
    approvedBy: 'Admin',
    createdAt: '2026-03-01T09:00:00Z',
    status: 'approved',
  },
  {
    id: 'd4',
    recipientName: 'Chen Family',
    hours: 6,
    reason: 'Scheduled respite break',
    approvedBy: 'Auto',
    createdAt: '2026-02-28T16:00:00Z',
    status: 'approved',
  },
];

export function RespiteFund() {
  const [balance] = useState<FundBalance>(MOCK_BALANCE);
  const [disbursements] = useState<Disbursement[]>(MOCK_DISBURSEMENTS);
  const [showForm, setShowForm] = useState(false);
  const [formHours, setFormHours] = useState('');
  const [formRecipient, setFormRecipient] = useState('');

  const utilizationPct =
    balance.totalHours > 0
      ? ((balance.totalHours - balance.availableHours) / balance.totalHours) * 100
      : 0;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Respite Fund</h1>
          <p className="text-sm text-muted">Emergency fund management</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage/90"
        >
          {showForm ? 'Cancel' : 'New Disbursement'}
        </button>
      </div>

      {/* Fund Summary */}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Available Hours</p>
          <p className="text-2xl font-bold text-zone-green">{balance.availableHours}</p>
          <p className="text-xs text-muted">of {balance.totalHours} total</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Fund Value</p>
          <p className="text-2xl font-bold text-primary">
            ${balance.totalDollars.toLocaleString()}
          </p>
          <p className="text-xs text-muted">at $25/hr</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Reserved</p>
          <p className="text-2xl font-bold text-gold">{balance.reservedHours}h</p>
          <p className="text-xs text-muted">pending disbursements</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Utilization</p>
          <p
            className={`text-2xl font-bold ${utilizationPct > 80 ? 'text-zone-red' : utilizationPct > 50 ? 'text-gold' : 'text-zone-green'}`}
          >
            {Math.round(utilizationPct)}%
          </p>
          <div className="mt-1 h-1.5 w-full rounded-full bg-warm-gray/30">
            <div
              className={`h-1.5 rounded-full ${utilizationPct > 80 ? 'bg-zone-red' : utilizationPct > 50 ? 'bg-gold' : 'bg-zone-green'}`}
              style={{ width: `${Math.min(utilizationPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Disbursement Form */}
      {showForm && (
        <div className="rounded-xl border border-sage/30 bg-sage/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-primary">Emergency Disbursement</h3>
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted">Recipient User ID</label>
              <input
                type="text"
                value={formRecipient}
                onChange={(e) => setFormRecipient(e.target.value)}
                placeholder="User ID..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage"
              />
            </div>
            <div className="w-32">
              <label className="mb-1 block text-xs text-muted">Hours (1-48)</label>
              <input
                type="number"
                value={formHours}
                onChange={(e) => setFormHours(e.target.value)}
                min={1}
                max={48}
                placeholder="Hours"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage"
              />
            </div>
            <button className="rounded-lg bg-copper px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-copper/90">
              Disburse
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Auto-approve threshold: {balance.autoApproveThreshold}h. Emergency disbursements bypass
            this limit.
          </p>
        </div>
      )}

      {/* Disbursement History */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold text-primary">Recent Disbursements</h2>
        </div>
        <div className="divide-y divide-border">
          {disbursements.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-copper/10 text-copper">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{d.recipientName}</p>
                  <p className="text-xs text-muted">{d.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-copper">{d.hours}h</p>
                <p className="text-[11px] text-muted">
                  {formatDate(d.createdAt)} &middot; {d.approvedBy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
