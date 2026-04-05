/**
 * CascadeImpact — Visualize the viral ripple of care
 *
 * Shows how one act of help cascades through the community:
 * "your help → their help → downstream impact"
 * Multi-hop referral chain visualization with impact metrics.
 */

interface CascadeNode {
  id: string;
  name: string;
  avatar: string;
  hoursGiven: number;
  hoursReceived: number;
  joinedVia?: string;
  joinDate: string;
  depth: number;
  children: CascadeNode[];
  taskTypes: string[];
}

const MOCK_CASCADE: CascadeNode = {
  id: 'u1',
  name: 'You',
  avatar: 'SP',
  hoursGiven: 42,
  hoursReceived: 18,
  joinDate: '2025-09-01',
  depth: 0,
  taskTypes: ['Companionship', 'Meals', 'Transport'],
  children: [
    {
      id: 'u2',
      name: 'Helen Park',
      avatar: 'HP',
      hoursGiven: 8,
      hoursReceived: 24,
      joinedVia: 'Direct referral',
      joinDate: '2025-10-15',
      depth: 1,
      taskTypes: ['Companionship'],
      children: [
        {
          id: 'u5',
          name: 'Tom K.',
          avatar: 'TK',
          hoursGiven: 12,
          hoursReceived: 6,
          joinedVia: "Helen's neighbor",
          joinDate: '2025-12-01',
          depth: 2,
          taskTypes: ['Yard Work', 'Tech Help'],
          children: [],
        },
      ],
    },
    {
      id: 'u3',
      name: 'Linda Chen',
      avatar: 'LC',
      hoursGiven: 15,
      hoursReceived: 10,
      joinedVia: 'Employer pilot',
      joinDate: '2025-11-01',
      depth: 1,
      taskTypes: ['Grocery Shopping', 'Companionship'],
      children: [
        {
          id: 'u6',
          name: 'Maria G.',
          avatar: 'MG',
          hoursGiven: 5,
          hoursReceived: 8,
          joinedVia: "Linda's friend",
          joinDate: '2026-01-10',
          depth: 2,
          taskTypes: ['Meals'],
          children: [
            {
              id: 'u8',
              name: 'James T.',
              avatar: 'JT',
              hoursGiven: 3,
              hoursReceived: 0,
              joinedVia: "Maria's church group",
              joinDate: '2026-02-20',
              depth: 3,
              taskTypes: ['Transport'],
              children: [],
            },
          ],
        },
        {
          id: 'u7',
          name: 'Robert M.',
          avatar: 'RM',
          hoursGiven: 7,
          hoursReceived: 4,
          joinedVia: "Linda's coworker",
          joinDate: '2026-01-15',
          depth: 2,
          taskTypes: ['Companionship', 'Household'],
          children: [],
        },
      ],
    },
    {
      id: 'u4',
      name: 'Roberto M.',
      avatar: 'RM',
      hoursGiven: 6,
      hoursReceived: 14,
      joinedVia: 'Community event',
      joinDate: '2025-11-20',
      depth: 1,
      taskTypes: ['Household', 'Yard Work'],
      children: [],
    },
  ],
};

const DEPTH_COLORS = [
  'border-sage bg-sage/10 text-sage',
  'border-copper bg-copper/10 text-copper',
  'border-gold bg-gold/10 text-gold',
  'border-blue-500 bg-blue-500/10 text-blue-600',
];

function countNodes(node: CascadeNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}

function totalHours(node: CascadeNode): number {
  return node.hoursGiven + node.children.reduce((sum, c) => sum + totalHours(c), 0);
}

function CascadeNodeCard({ node, isRoot }: { node: CascadeNode; isRoot?: boolean }) {
  const colorClass = DEPTH_COLORS[Math.min(node.depth, DEPTH_COLORS.length - 1)]!;

  return (
    <div className="relative">
      {/* Connector line */}
      {!isRoot && <div className="absolute -top-4 left-6 h-4 w-px bg-border" />}

      <div className={`rounded-xl border-2 p-3 ${colorClass}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary shadow-sm">
            {node.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-primary">{node.name}</p>
              {isRoot && (
                <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-medium text-white">
                  Origin
                </span>
              )}
            </div>
            {node.joinedVia && <p className="text-[11px] text-muted">via {node.joinedVia}</p>}
            <div className="mt-1 flex gap-3 text-[11px]">
              <span className="text-sage">{node.hoursGiven}h given</span>
              <span className="text-copper">{node.hoursReceived}h received</span>
            </div>
          </div>
        </div>

        {node.taskTypes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {node.taskTypes.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] text-secondary"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="ml-6 mt-4 space-y-4 border-l-2 border-border pl-6">
          {node.children.map((child) => (
            <CascadeNodeCard key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CascadeImpact() {
  const totalPeople = countNodes(MOCK_CASCADE) - 1; // exclude self
  const totalHoursGiven = totalHours(MOCK_CASCADE);
  const maxDepth = 3;
  const viralCoefficient = (totalPeople / 1).toFixed(1); // referrals per original member

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Your Care Cascade</h1>
        <p className="text-sm text-muted">See how your help ripples through the community</p>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{totalPeople}</p>
          <p className="text-[11px] text-muted">People Reached</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-copper">{totalHoursGiven}</p>
          <p className="text-[11px] text-muted">Total Hours</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">{maxDepth}</p>
          <p className="text-[11px] text-muted">Hops Deep</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{viralCoefficient}x</p>
          <p className="text-[11px] text-muted">Viral Coefficient</p>
        </div>
      </div>

      {/* Cascade Explanation */}
      <div className="rounded-xl border border-sage/20 bg-sage/5 p-4">
        <h3 className="text-sm font-semibold text-sage">How the Cascade Works</h3>
        <p className="mt-1 text-xs text-secondary">
          When you help someone, they're more likely to help others. Each connection you make
          ripples outward — your 3 direct referrals led to {totalPeople - 3} additional members
          joining the care network. This is the enzyme effect.
        </p>
        <div className="mt-2 flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-sage bg-sage/20" />
            Direct (Depth 0)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-copper bg-copper/20" />
            1st hop
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-gold bg-gold/20" />
            2nd hop
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-blue-500 bg-blue-500/20" />
            3rd hop
          </span>
        </div>
      </div>

      {/* Cascade Tree */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-primary">Your Referral Tree</h2>
        <CascadeNodeCard node={MOCK_CASCADE} isRoot />
      </div>

      {/* Milestones */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Cascade Milestones</h3>
        <div className="mt-3 space-y-2">
          {[
            { label: 'First Referral', target: 1, current: totalPeople, icon: '1' },
            { label: '5 People Reached', target: 5, current: totalPeople, icon: '5' },
            { label: '10 People Reached', target: 10, current: totalPeople, icon: '10' },
            { label: '3 Hops Deep', target: 3, current: maxDepth, icon: '3+' },
          ].map((m) => {
            const complete = m.current >= m.target;
            return (
              <div key={m.label} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    complete ? 'bg-sage text-white' : 'bg-warm-gray/20 text-muted'
                  }`}
                >
                  {complete ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    m.icon
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${complete ? 'text-sage' : 'text-muted'}`}>
                    {m.label}
                  </p>
                </div>
                {complete && <span className="text-[10px] text-sage">Achieved!</span>}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Cascade metrics update daily. Each connection strengthens the cooperative care network.
      </p>
    </div>
  );
}
