/**
 * ComfortCard — Card balance, auto-reload settings, usage by category
 *
 * The Comfort Card is a recurring subscription that funds companion care
 * services. HSA/FSA-eligible when an active LMN is on file.
 */
import { useState } from 'react';

interface ComfortCardData {
  status: 'active' | 'paused' | 'cancelled';
  balanceCents: number;
  monthlyAmountCents: number;
  nextChargeDate: string;
  autoReload: boolean;
  autoReloadThresholdCents: number;
  autoReloadAmountCents: number;
  hsaEligible: boolean;
  usageByCategory: UsageCategory[];
  recentCharges: CardCharge[];
}

interface UsageCategory {
  label: string;
  amountCents: number;
  percentage: number;
  color: string;
}

interface CardCharge {
  id: string;
  date: string;
  description: string;
  amountCents: number;
  type: 'charge' | 'reload' | 'refund';
}

const MOCK_CARD: ComfortCardData = {
  status: 'active',
  balanceCents: 28500,
  monthlyAmountCents: 15000,
  nextChargeDate: '2026-04-01',
  autoReload: true,
  autoReloadThresholdCents: 5000,
  autoReloadAmountCents: 15000,
  hsaEligible: true,
  usageByCategory: [
    { label: 'Companion Visits', amountCents: 95000, percentage: 55, color: 'bg-sage' },
    { label: 'Transportation', amountCents: 35000, percentage: 20, color: 'bg-copper' },
    { label: 'Meal Preparation', amountCents: 25000, percentage: 14, color: 'bg-blue-500' },
    { label: 'Light Housekeeping', amountCents: 20000, percentage: 11, color: 'bg-purple-500' },
  ],
  recentCharges: [
    {
      id: 'c1',
      date: '2026-03-01',
      description: 'Monthly subscription',
      amountCents: 15000,
      type: 'reload',
    },
    {
      id: 'c2',
      date: '2026-02-28',
      description: 'Companion visit — 3 hrs',
      amountCents: 10500,
      type: 'charge',
    },
    {
      id: 'c3',
      date: '2026-02-25',
      description: 'Transportation assistance',
      amountCents: 3500,
      type: 'charge',
    },
    {
      id: 'c4',
      date: '2026-02-20',
      description: 'Meal preparation — 2 hrs',
      amountCents: 7000,
      type: 'charge',
    },
    {
      id: 'c5',
      date: '2026-02-15',
      description: 'Light housekeeping — 1 hr',
      amountCents: 3500,
      type: 'charge',
    },
    {
      id: 'c6',
      date: '2026-02-01',
      description: 'Monthly subscription',
      amountCents: 15000,
      type: 'reload',
    },
  ],
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ComfortCard() {
  const [card] = useState<ComfortCardData>(MOCK_CARD);
  const [autoReload, setAutoReload] = useState(card.autoReload);

  const statusColors: Record<string, string> = {
    active: 'text-zone-green',
    paused: 'text-zone-yellow',
    cancelled: 'text-zone-red',
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Comfort Card</h1>
        <p className="text-sm text-muted">Manage your companion care payment card</p>
      </div>

      {/* Card Visual */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sage to-sage/80 p-6 text-white shadow-lg">
        <div className="absolute right-4 top-4 text-xs font-medium opacity-80">co.op.care</div>
        <div className="mb-8">
          <p className="text-xs opacity-70">Current Balance</p>
          <p className="text-3xl font-bold">{formatCents(card.balanceCents)}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs opacity-70">Monthly Amount</p>
            <p className="text-lg font-semibold">{formatCents(card.monthlyAmountCents)}/mo</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Status</p>
            <p className="text-lg font-semibold capitalize">{card.status}</p>
          </div>
        </div>
        {card.hsaEligible && (
          <div className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            HSA/FSA Eligible
          </div>
        )}
      </div>

      {/* Status & Next Charge */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Status</p>
          <p className={`text-lg font-bold capitalize ${statusColors[card.status]}`}>
            {card.status}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Balance</p>
          <p className="text-lg font-bold text-primary">{formatCents(card.balanceCents)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">Next Charge</p>
          <p className="text-lg font-bold text-secondary">{formatDate(card.nextChargeDate)}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted">HSA Eligible</p>
          <p
            className={`text-lg font-bold ${card.hsaEligible ? 'text-zone-green' : 'text-zone-red'}`}
          >
            {card.hsaEligible ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Auto-Reload Settings */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Auto-Reload</h2>
            <p className="text-xs text-muted">
              Automatically reload when balance drops below{' '}
              {formatCents(card.autoReloadThresholdCents)}
            </p>
          </div>
          <button
            onClick={() => setAutoReload(!autoReload)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoReload ? 'bg-sage' : 'bg-warm-gray'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoReload ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {autoReload && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-muted">Reload Amount</label>
              <p className="text-sm font-medium text-primary">
                {formatCents(card.autoReloadAmountCents)}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted">When Balance Below</label>
              <p className="text-sm font-medium text-primary">
                {formatCents(card.autoReloadThresholdCents)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Usage by Category */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Usage by Category</h2>
        <div className="space-y-3">
          {card.usageByCategory.map((cat) => (
            <div key={cat.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-secondary">{cat.label}</span>
                <span className="text-sm font-medium text-primary">
                  {formatCents(cat.amountCents)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-warm-gray/20">
                <div
                  className={`h-2 rounded-full ${cat.color}`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Charges */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-primary">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {card.recentCharges.map((charge) => (
            <div key={charge.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    charge.type === 'reload'
                      ? 'bg-sage'
                      : charge.type === 'refund'
                        ? 'bg-blue-500'
                        : 'bg-secondary'
                  }`}
                >
                  {charge.type === 'reload' ? '+' : charge.type === 'refund' ? 'R' : '-'}
                </div>
                <div>
                  <p className="text-sm text-primary">{charge.description}</p>
                  <p className="text-xs text-muted">{formatDate(charge.date)}</p>
                </div>
              </div>
              <p
                className={`text-sm font-semibold ${
                  charge.type === 'reload'
                    ? 'text-sage'
                    : charge.type === 'refund'
                      ? 'text-blue-500'
                      : 'text-secondary'
                }`}
              >
                {charge.type === 'charge' ? '-' : '+'}
                {formatCents(charge.amountCents)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Comfort Card is a pre-paid care account for companion care services. HSA/FSA eligibility
        requires an active Letter of Medical Necessity (LMN). Contact support to adjust your monthly
        subscription amount.
      </p>
    </div>
  );
}
