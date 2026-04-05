/**
 * Governance — Worker-owner democratic governance and voting
 *
 * Active proposals, voting interface, and cooperative governance metrics.
 * Worker-owners with equity can vote on co-op decisions.
 */
import { useState } from 'react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'policy' | 'budget' | 'membership' | 'operations';
  status: 'active' | 'passed' | 'rejected' | 'pending';
  proposedBy: string;
  proposedDate: string;
  deadline: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalEligible: number;
  userVote?: 'for' | 'against' | 'abstain';
}

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'p1',
    title: 'Increase base hourly rate to $28/hr',
    description:
      'Proposal to raise the minimum worker-owner hourly rate from $25 to $28 effective Q3 2026, funded by increased membership fees.',
    category: 'policy',
    status: 'active',
    proposedBy: 'Worker Council',
    proposedDate: '2026-03-01',
    deadline: '2026-03-15',
    votesFor: 12,
    votesAgainst: 3,
    votesAbstain: 1,
    totalEligible: 23,
  },
  {
    id: 'p2',
    title: 'Add dental insurance to benefits package',
    description:
      'Expand worker-owner benefits to include dental coverage. Estimated cost: $180/member/month from cooperative surplus.',
    category: 'budget',
    status: 'active',
    proposedBy: 'Maria Santos',
    proposedDate: '2026-02-20',
    deadline: '2026-03-20',
    votesFor: 8,
    votesAgainst: 6,
    votesAbstain: 2,
    totalEligible: 23,
  },
  {
    id: 'p3',
    title: 'Approve 3 new worker-owner candidates',
    description:
      'Admit James Park, Linda Chen, and Roberto Mendez as full worker-owners after completing probationary period.',
    category: 'membership',
    status: 'passed',
    proposedBy: 'Admissions Committee',
    proposedDate: '2026-02-01',
    deadline: '2026-02-15',
    votesFor: 20,
    votesAgainst: 1,
    votesAbstain: 2,
    totalEligible: 23,
    userVote: 'for',
  },
  {
    id: 'p4',
    title: 'Partner with Table Mesa senior center',
    description:
      'Establish referral partnership with Table Mesa Senior Center for Time Bank member recruitment.',
    category: 'operations',
    status: 'passed',
    proposedBy: 'Growth Committee',
    proposedDate: '2026-01-15',
    deadline: '2026-01-31',
    votesFor: 19,
    votesAgainst: 0,
    votesAbstain: 4,
    totalEligible: 23,
    userVote: 'for',
  },
];

const CATEGORY_BADGE: Record<string, { label: string; className: string }> = {
  policy: { label: 'Policy', className: 'bg-purple-500/10 text-purple-600' },
  budget: { label: 'Budget', className: 'bg-copper/10 text-copper' },
  membership: { label: 'Membership', className: 'bg-sage/10 text-sage' },
  operations: { label: 'Operations', className: 'bg-blue-500/10 text-blue-600' },
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: 'Voting Open', className: 'bg-gold/10 text-gold' },
  passed: { label: 'Passed', className: 'bg-sage/10 text-sage' },
  rejected: { label: 'Rejected', className: 'bg-zone-red/10 text-zone-red' },
  pending: { label: 'Pending', className: 'bg-warm-gray/20 text-muted' },
};

export function Governance() {
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);

  const filtered = filter === 'active' ? proposals.filter((p) => p.status === 'active') : proposals;

  const handleVote = (proposalId: string, vote: 'for' | 'against' | 'abstain') => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const key = `votes${vote.charAt(0).toUpperCase()}${vote.slice(1)}` as
          | 'votesFor'
          | 'votesAgainst'
          | 'votesAbstain';
        return { ...p, userVote: vote, [key]: p[key] + 1 };
      }),
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Governance</h1>
        <p className="text-sm text-muted">Democratic decisions for your cooperative</p>
      </div>

      {/* Co-op Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">23</p>
          <p className="text-[11px] text-muted">Worker-Owners</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">
            {proposals.filter((p) => p.status === 'active').length}
          </p>
          <p className="text-[11px] text-muted">Active Votes</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">
            {proposals.filter((p) => p.status === 'passed').length}
          </p>
          <p className="text-[11px] text-muted">Passed (YTD)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-sage text-white'
                : 'bg-warm-gray/20 text-muted hover:bg-warm-gray/30'
            }`}
          >
            {f === 'all' ? 'All Proposals' : 'Active Votes'}
          </button>
        ))}
      </div>

      {/* Proposals */}
      <div className="space-y-3">
        {filtered.map((proposal) => {
          const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
          const participation = Math.round((totalVotes / proposal.totalEligible) * 100);
          const forPct = totalVotes > 0 ? Math.round((proposal.votesFor / totalVotes) * 100) : 0;
          const cat = CATEGORY_BADGE[proposal.category]!;
          const status = STATUS_BADGE[proposal.status]!;
          const daysLeft = Math.max(
            0,
            Math.ceil((new Date(proposal.deadline).getTime() - Date.now()) / 86400000),
          );

          return (
            <div key={proposal.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-primary">{proposal.title}</h3>
                  <div className="mt-1 flex gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.className}`}
                    >
                      {cat.label}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
                {proposal.status === 'active' && (
                  <span className="text-[11px] text-muted">{daysLeft}d left</span>
                )}
              </div>

              <p className="mt-2 text-xs text-secondary">{proposal.description}</p>

              {/* Vote Bar */}
              <div className="mt-3">
                <div className="flex h-2 overflow-hidden rounded-full bg-warm-gray/20">
                  {proposal.votesFor > 0 && (
                    <div
                      className="bg-sage"
                      style={{ width: `${(proposal.votesFor / proposal.totalEligible) * 100}%` }}
                    />
                  )}
                  {proposal.votesAgainst > 0 && (
                    <div
                      className="bg-zone-red"
                      style={{
                        width: `${(proposal.votesAgainst / proposal.totalEligible) * 100}%`,
                      }}
                    />
                  )}
                  {proposal.votesAbstain > 0 && (
                    <div
                      className="bg-warm-gray/40"
                      style={{
                        width: `${(proposal.votesAbstain / proposal.totalEligible) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted">
                  <span>
                    {proposal.votesFor} for ({forPct}%)
                  </span>
                  <span>{proposal.votesAgainst} against</span>
                  <span>{participation}% participation</span>
                </div>
              </div>

              {/* Vote Buttons */}
              {proposal.status === 'active' && !proposal.userVote && (
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => handleVote(proposal.id, 'for')}
                    className="flex-1 rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-dark"
                  >
                    Vote For
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'against')}
                    className="flex-1 rounded-lg border border-zone-red/30 px-3 py-1.5 text-xs font-medium text-zone-red hover:bg-zone-red/5"
                  >
                    Vote Against
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'abstain')}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-warm-gray/20"
                  >
                    Abstain
                  </button>
                </div>
              )}

              {proposal.userVote && (
                <p className="mt-2 text-[11px] text-sage">You voted: {proposal.userVote}</p>
              )}

              <div className="mt-2 text-[11px] text-muted">
                Proposed by {proposal.proposedBy} ·{' '}
                {new Date(proposal.proposedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted">
        One worker-owner, one vote. Proposals require simple majority to pass with at least 50%
        participation.
      </p>
    </div>
  );
}
