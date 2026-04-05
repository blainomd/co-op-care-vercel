/**
 * MemberManagement — Member list, status, role filtering
 */
import { useState, useMemo } from 'react';

interface Member {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

type RoleFilter =
  | 'all'
  | 'conductor'
  | 'worker_owner'
  | 'timebank_member'
  | 'medical_director'
  | 'admin';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  conductor: { label: 'Conductor', color: 'bg-blue-100 text-blue-700' },
  worker_owner: { label: 'Caregiver', color: 'bg-copper/10 text-copper' },
  timebank_member: { label: 'Member', color: 'bg-sage/10 text-sage' },
  medical_director: { label: 'Medical Director', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', color: 'bg-zone-red/10 text-zone-red' },
  employer_hr: { label: 'Employer HR', color: 'bg-gold/10 text-gold' },
  wellness_provider: { label: 'Wellness', color: 'bg-teal-100 text-teal-700' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-zone-green/10 text-zone-green' },
  pending: { label: 'Pending', color: 'bg-gold/10 text-gold' },
  suspended: { label: 'Suspended', color: 'bg-zone-red/10 text-zone-red' },
  inactive: { label: 'Inactive', color: 'bg-warm-gray/30 text-secondary' },
};

const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    email: 'sarah.chen@example.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    roles: ['worker_owner'],
    status: 'active',
    createdAt: '2025-11-15T00:00:00Z',
    lastLoginAt: '2026-03-08T10:30:00Z',
  },
  {
    id: 'm2',
    email: 'marcus.j@example.com',
    firstName: 'Marcus',
    lastName: 'Johnson',
    roles: ['worker_owner'],
    status: 'active',
    createdAt: '2025-12-01T00:00:00Z',
    lastLoginAt: '2026-03-07T15:45:00Z',
  },
  {
    id: 'm3',
    email: 'emily.r@example.com',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    roles: ['conductor'],
    status: 'active',
    createdAt: '2025-10-20T00:00:00Z',
    lastLoginAt: '2026-03-08T09:00:00Z',
  },
  {
    id: 'm4',
    email: 'dr.patel@example.com',
    firstName: 'Amir',
    lastName: 'Patel',
    roles: ['medical_director'],
    status: 'active',
    createdAt: '2025-09-01T00:00:00Z',
    lastLoginAt: '2026-03-06T14:00:00Z',
  },
  {
    id: 'm5',
    email: 'david.p@example.com',
    firstName: 'David',
    lastName: 'Park',
    roles: ['timebank_member'],
    status: 'pending',
    createdAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'm6',
    email: 'lisa.w@example.com',
    firstName: 'Lisa',
    lastName: 'Wang',
    roles: ['worker_owner'],
    status: 'inactive',
    createdAt: '2025-08-15T00:00:00Z',
    lastLoginAt: '2025-12-20T08:00:00Z',
  },
  {
    id: 'm7',
    email: 'admin@co-op.care',
    firstName: 'System',
    lastName: 'Admin',
    roles: ['admin'],
    status: 'active',
    createdAt: '2025-06-01T00:00:00Z',
    lastLoginAt: '2026-03-08T11:00:00Z',
  },
];

const FILTER_TABS: { key: RoleFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'worker_owner', label: 'Caregivers' },
  { key: 'conductor', label: 'Conductors' },
  { key: 'timebank_member', label: 'Members' },
  { key: 'medical_director', label: 'Directors' },
  { key: 'admin', label: 'Admins' },
];

export function MemberManagement() {
  const [members] = useState<Member[]>(MOCK_MEMBERS);
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = members;
    if (filter !== 'all') {
      result = result.filter((m) => m.roles.includes(filter));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.email.toLowerCase().includes(q) ||
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q),
      );
    }
    return result;
  }, [members, filter, search]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelative = (iso?: string) => {
    if (!iso) return 'Never';
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Member Management</h1>
          <p className="text-sm text-muted">{members.length} total members</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex gap-1 rounded-lg bg-warm-gray/30 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === tab.key ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-sage md:w-64"
        />
      </div>

      {/* Member Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-warm-gray/20">
              <th className="px-4 py-3 text-left font-medium text-secondary">Name</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Roles</th>
              <th className="px-4 py-3 text-left font-medium text-secondary">Status</th>
              <th className="hidden px-4 py-3 text-left font-medium text-secondary md:table-cell">
                Joined
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-secondary md:table-cell">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => {
              const statusCfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG['active']!;
              return (
                <tr key={m.id} className="transition-colors hover:bg-warm-gray/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/10 text-xs font-semibold text-sage">
                        {m.firstName?.[0] ?? '?'}
                        {m.lastName?.[0] ?? ''}
                      </div>
                      <div>
                        <p className="font-medium text-primary">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="text-xs text-muted">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.roles.map((r) => {
                        const cfg = ROLE_LABELS[r] ?? {
                          label: r,
                          color: 'bg-warm-gray/20 text-secondary',
                        };
                        return (
                          <span
                            key={r}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted md:table-cell">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted md:table-cell">
                    {formatRelative(m.lastLoginAt)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No members match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
