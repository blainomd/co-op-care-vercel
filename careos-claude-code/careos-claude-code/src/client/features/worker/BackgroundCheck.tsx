/**
 * BackgroundCheck — Worker-owner background check status and trust badges
 *
 * Shows verification status, W-2 employee-owner status, certifications,
 * and trust signals visible to families and community members.
 */

interface CheckItem {
  id: string;
  name: string;
  status: 'passed' | 'pending' | 'expired' | 'not_started';
  completedDate?: string;
  expiryDate?: string;
  provider: string;
}

interface Certification {
  name: string;
  earnedDate: string;
  expiryDate: string;
  hoursEarned: number;
}

const MOCK_CHECKS: CheckItem[] = [
  {
    id: 'c1',
    name: 'Criminal Background Check',
    status: 'passed',
    completedDate: '2025-09-15',
    expiryDate: '2026-09-15',
    provider: 'Checkr',
  },
  {
    id: 'c2',
    name: 'Sex Offender Registry',
    status: 'passed',
    completedDate: '2025-09-15',
    expiryDate: '2026-09-15',
    provider: 'Checkr',
  },
  {
    id: 'c3',
    name: 'Motor Vehicle Records',
    status: 'passed',
    completedDate: '2025-09-15',
    expiryDate: '2026-09-15',
    provider: 'Checkr',
  },
  {
    id: 'c4',
    name: 'OIG/SAM Exclusion Check',
    status: 'passed',
    completedDate: '2025-09-15',
    expiryDate: '2026-09-15',
    provider: 'CareOS Compliance',
  },
  {
    id: 'c5',
    name: 'Drug Screening',
    status: 'passed',
    completedDate: '2025-10-01',
    expiryDate: '2026-10-01',
    provider: 'Quest Diagnostics',
  },
  {
    id: 'c6',
    name: 'TB Test (2-Step)',
    status: 'passed',
    completedDate: '2025-10-01',
    expiryDate: '2026-10-01',
    provider: 'UCHealth',
  },
  {
    id: 'c7',
    name: 'CPR/First Aid',
    status: 'passed',
    completedDate: '2025-11-01',
    expiryDate: '2027-11-01',
    provider: 'American Red Cross',
  },
  {
    id: 'c8',
    name: 'COVID-19 Vaccination',
    status: 'passed',
    completedDate: '2025-03-01',
    provider: 'UCHealth',
  },
];

const MOCK_CERTS: Certification[] = [
  {
    name: 'Safe Transfers & Body Mechanics',
    earnedDate: '2025-10-15',
    expiryDate: '2026-10-15',
    hoursEarned: 5,
  },
  {
    name: 'Fall Prevention Assessment',
    earnedDate: '2025-11-01',
    expiryDate: '2026-11-01',
    hoursEarned: 5,
  },
  {
    name: 'Emergency Response',
    earnedDate: '2025-12-01',
    expiryDate: '2026-12-01',
    hoursEarned: 5,
  },
];

const STATUS_CONFIG = {
  passed: {
    label: 'Verified',
    color: 'text-sage',
    bg: 'bg-sage/10',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  pending: {
    label: 'Pending',
    color: 'text-gold',
    bg: 'bg-gold/10',
    icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  expired: {
    label: 'Expired',
    color: 'text-zone-red',
    bg: 'bg-zone-red/10',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  not_started: {
    label: 'Not Started',
    color: 'text-muted',
    bg: 'bg-warm-gray/10',
    icon: 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

export function BackgroundCheck() {
  const allPassed = MOCK_CHECKS.every((c) => c.status === 'passed');
  const totalCertHours = MOCK_CERTS.reduce((s, c) => s + c.hoursEarned, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Trust & Verification</h1>
        <p className="text-sm text-muted">
          Your background checks, certifications, and trust badges
        </p>
      </div>

      {/* Trust Badge Card */}
      <div
        className={`rounded-xl border-2 p-4 ${allPassed ? 'border-sage bg-sage/5' : 'border-gold bg-gold/5'}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${allPassed ? 'bg-sage' : 'bg-gold'} text-white`}
          >
            <svg
              className="h-7 w-7"
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
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">
              {allPassed ? 'Fully Verified Worker-Owner' : 'Verification In Progress'}
            </h2>
            <p className="text-xs text-secondary">
              {allPassed
                ? 'All background checks passed. Your trust badge is visible to families.'
                : 'Some checks are pending. Complete them to earn your trust badge.'}
            </p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-medium text-white">
                Background Checked
              </span>
              <span className="rounded-full bg-copper px-2 py-0.5 text-[10px] font-medium text-white">
                W-2 Employee-Owner
              </span>
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-gold">
                {MOCK_CERTS.length} Certifications
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">
            {MOCK_CHECKS.filter((c) => c.status === 'passed').length}/{MOCK_CHECKS.length}
          </p>
          <p className="text-[11px] text-muted">Checks Passed</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-copper">{MOCK_CERTS.length}</p>
          <p className="text-[11px] text-muted">Certifications</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">{totalCertHours}h</p>
          <p className="text-[11px] text-muted">Bonus Hours Earned</p>
        </div>
      </div>

      {/* Background Checks */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">Background Checks</h2>
        <div className="space-y-2">
          {MOCK_CHECKS.map((check) => {
            const config = STATUS_CONFIG[check.status];
            return (
              <div
                key={check.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-white p-3"
              >
                <svg
                  className={`h-5 w-5 shrink-0 ${config.color}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary">{check.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span>{check.provider}</span>
                    {check.completedDate && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(check.completedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-primary">CareOS Certifications</h2>
        <div className="space-y-2">
          {MOCK_CERTS.map((cert) => (
            <div
              key={cert.name}
              className="flex items-center gap-3 rounded-xl border border-sage/20 bg-sage/5 p-3"
            >
              <svg
                className="h-5 w-5 shrink-0 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary">{cert.name}</p>
                <p className="text-[11px] text-muted">
                  Earned{' '}
                  {new Date(cert.earnedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  · Expires{' '}
                  {new Date(cert.expiryDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
                +{cert.hoursEarned}h
              </span>
            </div>
          ))}
        </div>
        <a
          href="#/conductor/certification"
          className="mt-2 block text-center text-xs text-sage hover:text-sage/80"
        >
          View all available certifications →
        </a>
      </div>

      <p className="text-[11px] text-muted">
        Background checks renew annually. All worker-owners are W-2 employees with full benefits.
        Trust badges are visible to families when viewing your profile or accepting tasks.
      </p>
    </div>
  );
}
