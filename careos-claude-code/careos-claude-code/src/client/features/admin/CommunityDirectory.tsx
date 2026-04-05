/**
 * CommunityDirectory — Browse community members with trust signals
 *
 * Searchable directory showing member profiles with trust badges,
 * skills, availability, and neighborhood proximity.
 */
import { useState } from 'react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'worker_owner' | 'timebank_member' | 'conductor' | 'both';
  neighborhood: string;
  distance: string;
  memberSince: string;
  skills: string[];
  rating: number;
  totalHoursGiven: number;
  totalHoursReceived: number;
  streak: number;
  backgroundChecked: boolean;
  equityTier?: string;
  isAvailable: boolean;
}

const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'James Park',
    avatar: 'JP',
    role: 'worker_owner',
    neighborhood: 'Table Mesa',
    distance: '0.3 mi',
    memberSince: '2025-06-01',
    skills: ['Safe Transfers', 'Medication Mgmt', 'Emergency Response'],
    rating: 4.9,
    totalHoursGiven: 340,
    totalHoursReceived: 12,
    streak: 26,
    backgroundChecked: true,
    equityTier: 'Silver',
    isAvailable: true,
  },
  {
    id: 'm2',
    name: 'Linda Chen',
    avatar: 'LC',
    role: 'both',
    neighborhood: 'Martin Acres',
    distance: '0.8 mi',
    memberSince: '2025-08-15',
    skills: ['Grocery Shopping', 'Companionship', 'Meal Prep'],
    rating: 4.8,
    totalHoursGiven: 85,
    totalHoursReceived: 42,
    streak: 12,
    backgroundChecked: true,
    equityTier: 'Bronze',
    isAvailable: true,
  },
  {
    id: 'm3',
    name: 'Tom K.',
    avatar: 'TK',
    role: 'timebank_member',
    neighborhood: 'Bear Creek',
    distance: '1.2 mi',
    memberSince: '2025-12-01',
    skills: ['Yard Work', 'Tech Help', 'Pet Care'],
    rating: 4.6,
    totalHoursGiven: 28,
    totalHoursReceived: 15,
    streak: 6,
    backgroundChecked: false,
    isAvailable: false,
  },
  {
    id: 'm4',
    name: 'Maria Garcia',
    avatar: 'MG',
    role: 'timebank_member',
    neighborhood: 'South Boulder',
    distance: '1.5 mi',
    memberSince: '2026-01-10',
    skills: ['Meals', 'Companionship', 'Spanish Translation'],
    rating: 4.7,
    totalHoursGiven: 15,
    totalHoursReceived: 8,
    streak: 4,
    backgroundChecked: false,
    isAvailable: true,
  },
  {
    id: 'm5',
    name: 'Roberto Mendez',
    avatar: 'RM',
    role: 'worker_owner',
    neighborhood: 'Frasier Meadows',
    distance: '0.5 mi',
    memberSince: '2025-07-01',
    skills: ['Dementia Communication', 'Bathing', 'Safe Transfers'],
    rating: 4.9,
    totalHoursGiven: 280,
    totalHoursReceived: 8,
    streak: 20,
    backgroundChecked: true,
    equityTier: 'Silver',
    isAvailable: true,
  },
  {
    id: 'm6',
    name: 'Sarah Miller',
    avatar: 'SM',
    role: 'timebank_member',
    neighborhood: 'North Boulder',
    distance: '2.1 mi',
    memberSince: '2025-11-20',
    skills: ['Transport', 'Errands', 'Light Housekeeping'],
    rating: 4.5,
    totalHoursGiven: 22,
    totalHoursReceived: 18,
    streak: 0,
    backgroundChecked: false,
    isAvailable: true,
  },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  worker_owner: { label: 'Worker-Owner', color: 'bg-copper/10 text-copper' },
  timebank_member: { label: 'Time Bank', color: 'bg-sage/10 text-sage' },
  conductor: { label: 'Conductor', color: 'bg-blue-500/10 text-blue-600' },
  both: { label: 'Worker + TB', color: 'bg-gold/10 text-gold' },
};

export function CommunityDirectory() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = MOCK_MEMBERS.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      m.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === 'all' ||
      m.role === roleFilter ||
      (roleFilter === 'worker_owner' && m.role === 'both');
    return matchesSearch && matchesRole;
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Community Directory</h1>
        <p className="text-sm text-muted">Find neighbors, worker-owners, and care team members</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by name, skill, or neighborhood..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
        />
      </div>

      {/* Role Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'worker_owner', label: 'Worker-Owners' },
          { value: 'timebank_member', label: 'Time Bank' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setRoleFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              roleFilter === f.value
                ? 'bg-sage text-white'
                : 'bg-warm-gray/20 text-muted hover:bg-warm-gray/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{MOCK_MEMBERS.length}</p>
          <p className="text-[11px] text-muted">Members</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">
            {MOCK_MEMBERS.filter((m) => m.isAvailable).length}
          </p>
          <p className="text-[11px] text-muted">Available Now</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-copper">
            {MOCK_MEMBERS.filter((m) => m.backgroundChecked).length}
          </p>
          <p className="text-[11px] text-muted">Verified</p>
        </div>
      </div>

      {/* Member List */}
      <div className="space-y-3">
        {filtered.map((member) => {
          const roleConfig = ROLE_LABELS[member.role]!;
          return (
            <div key={member.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/10 text-sm font-bold text-sage">
                    {member.avatar}
                  </div>
                  {member.isAvailable && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-sage" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary">{member.name}</h3>
                    {member.backgroundChecked && (
                      <svg
                        className="h-4 w-4 text-sage"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        />
                      </svg>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${roleConfig.color}`}
                    >
                      {roleConfig.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
                    <span>{member.neighborhood}</span>
                    <span>{member.distance}</span>
                    <span>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.round(member.rating) ? 'text-gold' : 'text-warm-gray/30'
                          }
                        >
                          ★
                        </span>
                      ))}{' '}
                      {member.rating}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {member.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-warm-gray/10 px-2 py-0.5 text-[10px] text-secondary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-[11px]">
                    <span className="text-sage">{member.totalHoursGiven}h given</span>
                    <span className="text-copper">{member.totalHoursReceived}h received</span>
                    {member.streak > 0 && (
                      <span className="text-gold">{member.streak}w streak</span>
                    )}
                    {member.equityTier && (
                      <span className="rounded bg-copper/10 px-1.5 py-0.5 text-[10px] font-medium text-copper">
                        {member.equityTier}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <a
                    href={`#/messages/new?to=${member.id}`}
                    className="rounded-lg border border-border p-1.5 text-muted hover:bg-warm-gray/20 hover:text-primary"
                  >
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
                        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-white p-6 text-center">
          <p className="text-sm text-muted">No members found matching your search.</p>
        </div>
      )}

      <p className="text-[11px] text-muted">
        {MOCK_MEMBERS.length} community members. Verified badge indicates completed background
        check.
      </p>
    </div>
  );
}
