/**
 * CareTeam — View and manage the care team for a family
 *
 * Shows worker-owners, Time Bank neighbors, Medical Director, and wellness providers
 * assigned to the family. Includes contact info and trust badges.
 */

interface TeamMember {
  id: string;
  name: string;
  role: 'worker_owner' | 'timebank_member' | 'medical_director' | 'wellness_provider';
  roleLabel: string;
  initials: string;
  specialty?: string;
  phone?: string;
  rating: number;
  ratingCount: number;
  memberSince: string;
  backgroundChecked: boolean;
  backgroundCheckDate?: string;
  equityTier?: string;
  isW2: boolean;
  streakWeeks?: number;
  neighborhood?: string;
}

const MOCK_TEAM: TeamMember[] = [
  {
    id: 'tm1',
    name: 'James Park',
    role: 'worker_owner',
    roleLabel: 'Worker-Owner',
    initials: 'JP',
    specialty: 'Companion Care, Meal Prep',
    phone: '(303) 555-0142',
    rating: 4.9,
    ratingCount: 34,
    memberSince: '2024-06-15',
    backgroundChecked: true,
    backgroundCheckDate: '2024-05-20',
    equityTier: 'Year 2 — 40% vested',
    isW2: true,
    streakWeeks: 18,
    neighborhood: 'North Boulder',
  },
  {
    id: 'tm2',
    name: 'Linda Chen',
    role: 'timebank_member',
    roleLabel: 'Time Bank Neighbor',
    initials: 'LC',
    specialty: 'Grocery Shopping, Transportation',
    phone: '(303) 555-0198',
    rating: 5.0,
    ratingCount: 12,
    memberSince: '2025-01-10',
    backgroundChecked: true,
    backgroundCheckDate: '2025-01-05',
    isW2: false,
    streakWeeks: 8,
    neighborhood: 'Table Mesa',
  },
  {
    id: 'tm3',
    name: 'Dr. Michael Emdur',
    role: 'medical_director',
    roleLabel: 'Medical Director',
    initials: 'ME',
    specialty: 'Internal Medicine, Geriatrics',
    phone: '(303) 555-0200',
    rating: 5.0,
    ratingCount: 0,
    memberSince: '2024-01-01',
    backgroundChecked: true,
    backgroundCheckDate: '2023-12-01',
    isW2: false,
    neighborhood: 'Boulder',
  },
  {
    id: 'tm4',
    name: 'Maria Santos, LMT',
    role: 'wellness_provider',
    roleLabel: 'Wellness Provider',
    initials: 'MS',
    specialty: 'Massage Therapy',
    rating: 4.9,
    ratingCount: 47,
    memberSince: '2024-09-01',
    backgroundChecked: true,
    backgroundCheckDate: '2024-08-15',
    isW2: false,
    neighborhood: 'South Boulder',
  },
];

const ROLE_COLOR: Record<string, string> = {
  worker_owner: 'bg-copper/10 text-copper border-copper/30',
  timebank_member: 'bg-sage/10 text-sage border-sage/30',
  medical_director: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  wellness_provider: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
};

export function CareTeam() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Care Team</h1>
          <p className="text-sm text-muted">Your family's care team members</p>
        </div>
        <a
          href="#/messages/new"
          className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
        >
          Message Team
        </a>
      </div>

      <div className="space-y-3">
        {MOCK_TEAM.map((member) => (
          <div key={member.id} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-sm font-bold text-white">
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">{member.name}</h3>
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${ROLE_COLOR[member.role]}`}
                    >
                      {member.roleLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <svg className="h-3 w-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {member.rating} ({member.ratingCount})
                  </div>
                </div>

                {member.specialty && (
                  <p className="mt-1 text-xs text-secondary">{member.specialty}</p>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  {member.backgroundChecked && (
                    <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-[11px] font-medium text-sage">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Background Checked
                    </span>
                  )}
                  {member.isW2 && (
                    <span className="rounded-full bg-copper/10 px-2 py-0.5 text-[11px] font-medium text-copper">
                      W-2 Employee-Owner
                    </span>
                  )}
                  {member.streakWeeks && member.streakWeeks >= 4 && (
                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold">
                      {member.streakWeeks}w streak
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-4 text-[11px] text-muted">
                  {member.neighborhood && <span>{member.neighborhood}</span>}
                  <span>
                    Since{' '}
                    {new Date(member.memberSince).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {member.equityTier && <span>{member.equityTier}</span>}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-warm-gray/20"
                >
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
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                  Call
                </a>
              )}
              <a
                href="#/messages/new"
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-warm-gray/20"
              >
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Message
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted">
        All care team members are verified and background-checked. Contact your coordinator to
        update your team.
      </p>
    </div>
  );
}
