/**
 * TimeBankDashboard — View balance, transactions, and exchange care hours
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

interface Transaction {
  id: string;
  type: 'earned' | 'spent' | 'bought' | 'donated' | 'bonus';
  amount: number;
  description: string;
  date: string;
  with?: string;
}

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'bonus',
    amount: 1,
    description: 'Welcome bonus — founding member',
    date: '2026-03-20',
  },
  {
    id: '2',
    type: 'earned',
    amount: 2,
    description: 'Companion visit — Margaret D.',
    date: '2026-03-18',
    with: 'Margaret D.',
  },
  {
    id: '3',
    type: 'spent',
    amount: 1.5,
    description: 'Meal prep assistance',
    date: '2026-03-15',
    with: 'Tom R.',
  },
  {
    id: '4',
    type: 'earned',
    amount: 1,
    description: 'Yoga session — Senior Center',
    date: '2026-03-12',
  },
  {
    id: '5',
    type: 'bonus',
    amount: 1,
    description: 'Referral bonus — Sarah K. joined',
    date: '2026-03-10',
  },
];

const TYPE_STYLES: Record<string, { label: string; color: string; sign: string }> = {
  earned: { label: 'Earned', color: 'text-sage-dark bg-sage/10', sign: '+' },
  spent: { label: 'Spent', color: 'text-zone-red bg-zone-red/10', sign: '-' },
  bought: { label: 'Purchased', color: 'text-blue bg-blue/10', sign: '+' },
  donated: { label: 'Donated', color: 'text-gold bg-gold/10', sign: '-' },
  bonus: { label: 'Bonus', color: 'text-purple bg-purple/10', sign: '+' },
};

export default function TimeBankDashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(3.5);
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from backend
    (async () => {
      try {
        const res = await fetch('/api/v1/timebank/balance', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance ?? 3.5);
        }
        const txRes = await fetch('/api/v1/timebank/transactions', { credentials: 'include' });
        if (txRes.ok) {
          const txData = await txRes.json();
          if (txData.transactions?.length) setTransactions(txData.transactions);
        }
      } catch {
        // Use demo data
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageLayout>
      <section className="px-6 pb-20 pt-10 md:px-12 md:pt-16">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center">
            <p className="text-sm font-medium text-sage">Time Bank</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-navy">Your Care Hours</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Every hour you give is an hour you can receive.
            </p>
          </div>

          {/* Balance Card */}
          <div
            className="mt-8 overflow-hidden rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2A5580 100%)' }}
          >
            <div className="px-8 py-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Available Balance
              </p>
              <p className="mt-3 font-heading text-6xl font-bold text-white">
                {loading ? '...' : balance.toFixed(1)}
              </p>
              <p className="mt-1 text-sm text-sage-light">hours</p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/card')}
                  className="rounded-full bg-sage px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
                >
                  Request care
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/card')}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Give care
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {
                label: 'Earned',
                value: transactions
                  .filter((t) => t.type === 'earned')
                  .reduce((s, t) => s + t.amount, 0)
                  .toFixed(1),
              },
              {
                label: 'Spent',
                value: transactions
                  .filter((t) => t.type === 'spent')
                  .reduce((s, t) => s + t.amount, 0)
                  .toFixed(1),
              },
              {
                label: 'Bonuses',
                value: transactions
                  .filter((t) => t.type === 'bonus')
                  .reduce((s, t) => s + t.amount, 0)
                  .toFixed(1),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-white p-4 text-center"
              >
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="mt-1 font-heading text-xl font-bold text-navy">{s.value} hrs</p>
              </div>
            ))}
          </div>

          {/* Transaction History */}
          <div className="mt-8">
            <h2 className="font-heading text-lg font-bold text-navy">Recent Activity</h2>
            <div className="mt-4 space-y-2">
              {transactions.map((tx) => {
                const style = TYPE_STYLES[tx.type]!;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-3"
                  >
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.color}`}
                    >
                      {style.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`font-heading text-sm font-bold ${tx.type === 'spent' || tx.type === 'donated' ? 'text-zone-red' : 'text-sage-dark'}`}
                    >
                      {style.sign}
                      {tx.amount} hr{tx.amount !== 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How it works */}
          <div className="mt-10 rounded-2xl bg-warm-gray/40 p-6">
            <h3 className="font-heading text-sm font-bold text-navy">How the Time Bank works</h3>
            <ul className="mt-3 space-y-2 text-xs text-text-secondary">
              <li className="flex gap-2">
                <span className="text-sage">1.</span> Give care (companion visits, yoga, meals,
                rides) and earn hours.
              </li>
              <li className="flex gap-2">
                <span className="text-sage">2.</span> Spend hours when you need help — every hour
                given = one hour received.
              </li>
              <li className="flex gap-2">
                <span className="text-sage">3.</span> Hours expire after 12 months of inactivity and
                go to the Respite Fund.
              </li>
              <li className="flex gap-2">
                <span className="text-sage">4.</span> Refer friends — you both get 1 free hour. 5
                referrals = Founding Circle.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
