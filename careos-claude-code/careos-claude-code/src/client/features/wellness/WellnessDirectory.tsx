/**
 * WellnessDirectory — Browse and book local wellness providers
 *
 * Lists massage therapists, acupuncturists, yoga instructors, etc.
 * who offer discounted services to co-op members via the Comfort Card.
 */
import { useState } from 'react';

interface WellnessProvider {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  rating: number;
  ratingCount: number;
  hourlyRate: number;
  memberDiscount: number;
  distance: string;
  availability: string;
  acceptsComfortCard: boolean;
}

const MOCK_PROVIDERS: WellnessProvider[] = [
  {
    id: 'wp1',
    name: 'Maria Santos, LMT',
    specialty: 'Massage Therapy',
    bio: 'Specializing in deep tissue and therapeutic massage for caregivers. 12 years experience.',
    rating: 4.9,
    ratingCount: 47,
    hourlyRate: 95,
    memberDiscount: 20,
    distance: '1.2 mi',
    availability: 'Mon, Wed, Fri',
    acceptsComfortCard: true,
  },
  {
    id: 'wp2',
    name: 'James Liu, LAc',
    specialty: 'Acupuncture',
    bio: 'Traditional Chinese medicine and acupuncture. Focus on stress and chronic pain relief.',
    rating: 4.8,
    ratingCount: 32,
    hourlyRate: 110,
    memberDiscount: 15,
    distance: '2.4 mi',
    availability: 'Tue, Thu, Sat',
    acceptsComfortCard: true,
  },
  {
    id: 'wp3',
    name: 'Lisa Chen, RYT-500',
    specialty: 'Yoga & Meditation',
    bio: 'Gentle yoga and guided meditation for caregiver stress management. Group and private sessions.',
    rating: 5.0,
    ratingCount: 28,
    hourlyRate: 60,
    memberDiscount: 25,
    distance: '0.8 mi',
    availability: 'Daily',
    acceptsComfortCard: true,
  },
  {
    id: 'wp4',
    name: 'Robert Kim, DC',
    specialty: 'Chiropractic',
    bio: 'Chiropractic adjustments and ergonomic counseling. Special rates for home care workers.',
    rating: 4.7,
    ratingCount: 19,
    hourlyRate: 85,
    memberDiscount: 10,
    distance: '3.1 mi',
    availability: 'Mon-Fri',
    acceptsComfortCard: false,
  },
];

export function WellnessDirectory() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('all');

  const specialties = ['all', ...new Set(MOCK_PROVIDERS.map((p) => p.specialty))];
  const filtered = MOCK_PROVIDERS.filter((p) => {
    if (specialty !== 'all' && p.specialty !== specialty) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.specialty.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Wellness Providers</h1>
        <p className="text-sm text-muted">Discounted services for co-op members</p>
      </div>

      {/* Comfort Card Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-copper/30 bg-copper/5 p-4">
        <svg
          className="h-6 w-6 shrink-0 text-copper"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-primary">
            Use your Comfort Card for extra savings
          </p>
          <p className="text-xs text-muted">
            Providers marked with a star accept Comfort Card payments
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
          placeholder="Search providers..."
        />
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
        >
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Specialties' : s}
            </option>
          ))}
        </select>
      </div>

      {/* Provider List */}
      <div className="space-y-3">
        {filtered.map((provider) => (
          <div key={provider.id} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-primary">{provider.name}</h3>
                  {provider.acceptsComfortCard && (
                    <svg className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-sage">{provider.specialty}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">
                  ${provider.hourlyRate - provider.memberDiscount}/hr
                </p>
                <p className="text-[11px] text-muted line-through">${provider.hourlyRate}/hr</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-secondary">{provider.bio}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-4 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {provider.rating} ({provider.ratingCount})
                </span>
                <span>{provider.distance}</span>
                <span>{provider.availability}</span>
              </div>
              <button className="rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-dark">
                Book
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-white py-12 text-center">
          <p className="text-sm text-muted">No providers match your search</p>
        </div>
      )}

      <p className="text-[11px] text-muted">
        All providers are verified and background-checked. Member discounts apply automatically.
      </p>
    </div>
  );
}
