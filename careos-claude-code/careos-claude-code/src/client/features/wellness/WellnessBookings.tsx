/**
 * WellnessBookings — Manage booked wellness sessions
 *
 * View upcoming and past wellness appointments: massage, acupuncture, yoga, etc.
 * Comfort Card balance tracking and LMN-filtered services.
 */
import { useState } from 'react';

interface Booking {
  id: string;
  providerName: string;
  providerType: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  cost: number;
  comfortCardApplied: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  omahaMapping?: string;
  lmnCovered: boolean;
  rating?: number;
  notes?: string;
}

const today = new Date();
const fmt = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0]!;
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    providerName: 'Lisa Chen, RYT-500',
    providerType: 'Yoga',
    service: 'Gentle Chair Yoga',
    date: fmt(2),
    time: '9:00 AM',
    duration: '60 min',
    cost: 45,
    comfortCardApplied: 15,
    status: 'upcoming',
    omahaMapping: '#29 Neuro-musculo-skeletal',
    lmnCovered: true,
  },
  {
    id: 'b2',
    providerName: 'Dr. Wei Zhang, LAc',
    providerType: 'Acupuncture',
    service: 'Pain Management Session',
    date: fmt(5),
    time: '2:00 PM',
    duration: '45 min',
    cost: 85,
    comfortCardApplied: 25,
    status: 'upcoming',
    omahaMapping: '#30 Pain',
    lmnCovered: true,
  },
  {
    id: 'b3',
    providerName: 'Sarah Miller, LMT',
    providerType: 'Massage',
    service: 'Therapeutic Massage',
    date: fmt(-3),
    time: '10:00 AM',
    duration: '60 min',
    cost: 95,
    comfortCardApplied: 20,
    status: 'completed',
    omahaMapping: '#30 Pain',
    lmnCovered: true,
    rating: 5,
    notes: 'Excellent session, focused on lower back tension',
  },
  {
    id: 'b4',
    providerName: 'Lisa Chen, RYT-500',
    providerType: 'Yoga',
    service: 'Gentle Chair Yoga',
    date: fmt(-10),
    time: '9:00 AM',
    duration: '60 min',
    cost: 45,
    comfortCardApplied: 15,
    status: 'completed',
    omahaMapping: '#29 Neuro-musculo-skeletal',
    lmnCovered: true,
    rating: 4,
  },
  {
    id: 'b5',
    providerName: 'Dr. Amy Santos, DC',
    providerType: 'Chiropractic',
    service: 'Spinal Adjustment',
    date: fmt(-5),
    time: '3:00 PM',
    duration: '30 min',
    cost: 65,
    comfortCardApplied: 0,
    status: 'cancelled',
    lmnCovered: false,
  },
];

const TYPE_COLORS: Record<string, string> = {
  Yoga: 'bg-teal-500/10 text-teal-600',
  Acupuncture: 'bg-purple-500/10 text-purple-600',
  Massage: 'bg-copper/10 text-copper',
  Chiropractic: 'bg-blue-500/10 text-blue-600',
};

export function WellnessBookings() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filtered =
    filter === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter((b) => b.status === filter);

  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'upcoming');
  const totalSpent = MOCK_BOOKINGS.filter((b) => b.status === 'completed').reduce(
    (s, b) => s + b.cost,
    0,
  );
  const totalSaved = MOCK_BOOKINGS.filter((b) => b.status === 'completed').reduce(
    (s, b) => s + b.comfortCardApplied,
    0,
  );
  const comfortBalance = 150; // remaining Comfort Card balance

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Wellness Bookings</h1>
          <p className="text-sm text-muted">Your wellness appointments and Comfort Card usage</p>
        </div>
        <a
          href="#/wellness"
          className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
        >
          Browse Providers
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{upcoming.length}</p>
          <p className="text-[11px] text-muted">Upcoming</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">${totalSpent}</p>
          <p className="text-[11px] text-muted">Total Spent</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-copper">${totalSaved}</p>
          <p className="text-[11px] text-muted">Card Savings</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">${comfortBalance}</p>
          <p className="text-[11px] text-muted">Card Balance</p>
        </div>
      </div>

      {/* Comfort Card Banner */}
      <div className="rounded-xl bg-gradient-to-r from-copper to-gold p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/80">Comfort Card Balance</p>
            <p className="text-2xl font-bold">${comfortBalance}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/80">Monthly Reload</p>
            <p className="text-sm font-semibold">$75 on the 1st</p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-white/70">
          Use at participating wellness providers for LMN-covered services
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-sage text-white'
                : 'bg-warm-gray/20 text-muted hover:bg-warm-gray/30'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filtered.map((booking) => {
          const typeColor = TYPE_COLORS[booking.providerType] ?? 'bg-warm-gray/20 text-muted';
          const d = new Date(booking.date + 'T12:00:00');
          return (
            <div
              key={booking.id}
              className={`rounded-xl border bg-white p-4 ${
                booking.status === 'cancelled' ? 'border-border opacity-60' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-primary">{booking.service}</h3>
                  <p className="text-xs text-secondary">{booking.providerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColor}`}>
                    {booking.providerType}
                  </span>
                  {booking.status === 'cancelled' && (
                    <span className="rounded-full bg-zone-red/10 px-2 py-0.5 text-[10px] font-medium text-zone-red">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                <span>
                  {d.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span>{booking.time}</span>
                <span>{booking.duration}</span>
              </div>

              {booking.omahaMapping && (
                <div className="mt-2">
                  <span className="rounded bg-sage/10 px-1.5 py-0.5 text-[10px] font-medium text-sage">
                    {booking.omahaMapping}
                  </span>
                  {booking.lmnCovered && (
                    <span className="ml-1 rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                      LMN Covered
                    </span>
                  )}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-medium">${booking.cost}</span>
                  {booking.comfortCardApplied > 0 && (
                    <span className="text-copper">-${booking.comfortCardApplied} Comfort Card</span>
                  )}
                </div>
                <span className="font-medium text-primary">
                  ${booking.cost - booking.comfortCardApplied} out of pocket
                </span>
              </div>

              {booking.rating && (
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`h-3.5 w-3.5 ${i < booking.rating! ? 'text-gold' : 'text-warm-gray/30'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  {booking.notes && (
                    <span className="ml-2 text-[11px] text-muted">{booking.notes}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted">
        Comfort Card funds are loaded monthly and apply automatically at participating providers.
        LMN-covered services are also HSA/FSA eligible.
      </p>
    </div>
  );
}
