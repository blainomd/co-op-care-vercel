/**
 * ExpiryAlerts — Loss aversion notifications for Time Bank hours & LMN renewal
 *
 * "4.5 hours expire in 30 days" with "Use them or donate to Respite" CTA.
 * Graduated urgency at 60/30/7-day windows. LMN renewal warnings.
 */

interface ExpiryItem {
  id: string;
  type: 'hours' | 'lmn' | 'certification';
  title: string;
  description: string;
  expiryDate: string;
  daysLeft: number;
  urgency: 'low' | 'medium' | 'high';
  value: string;
  actions: { label: string; href: string; primary?: boolean }[];
}

const MOCK_ALERTS: ExpiryItem[] = [
  {
    id: 'e1',
    type: 'hours',
    title: '4.5 Time Bank hours expiring',
    description:
      'Hours earned before April 2025 will expire on April 8, 2026. Use them or donate to the Respite Fund.',
    expiryDate: '2026-04-08',
    daysLeft: 31,
    urgency: 'medium',
    value: '4.5 hours ($121.50 value)',
    actions: [
      { label: 'Find Tasks to Use Hours', href: '#/timebank', primary: true },
      { label: 'Donate to Respite Fund', href: '#/admin/respite' },
    ],
  },
  {
    id: 'e2',
    type: 'lmn',
    title: 'LMN renewal due',
    description:
      'Your Letter of Medical Necessity expires in 45 days. Without renewal, you lose HSA/FSA eligibility — saving you ~$6,200/year.',
    expiryDate: '2026-04-22',
    daysLeft: 45,
    urgency: 'medium',
    value: '$6,200/year in tax savings at risk',
    actions: [
      { label: 'Schedule LMN Renewal', href: '#/lmn', primary: true },
      { label: 'View Tax Savings', href: '#/billing/tax-calculator' },
    ],
  },
  {
    id: 'e3',
    type: 'hours',
    title: '2.0 hours expiring soon',
    description:
      'These hours will be forfeited in 7 days if not used. Consider requesting help from a neighbor or donating them.',
    expiryDate: '2026-03-15',
    daysLeft: 7,
    urgency: 'high',
    value: '2.0 hours ($54.00 value)',
    actions: [
      { label: 'Request Help Now', href: '#/timebank/new', primary: true },
      { label: 'Donate to Respite', href: '#/admin/respite' },
    ],
  },
  {
    id: 'e4',
    type: 'certification',
    title: 'Fall Prevention certification renewal',
    description:
      'Your Fall Prevention training certification expires in 60 days. Renewal earns 5 bonus Time Bank hours.',
    expiryDate: '2026-05-07',
    daysLeft: 60,
    urgency: 'low',
    value: '5 bonus hours for renewal',
    actions: [{ label: 'Renew Certification', href: '#/conductor/certification', primary: true }],
  },
];

const URGENCY_CONFIG = {
  high: {
    border: 'border-zone-red/30',
    bg: 'bg-zone-red/5',
    badge: 'bg-zone-red text-white',
    badgeLabel: 'Urgent',
    icon: 'text-zone-red',
  },
  medium: {
    border: 'border-gold/30',
    bg: 'bg-gold/5',
    badge: 'bg-gold text-white',
    badgeLabel: 'Upcoming',
    icon: 'text-gold',
  },
  low: {
    border: 'border-border',
    bg: 'bg-white',
    badge: 'bg-warm-gray/30 text-muted',
    badgeLabel: 'FYI',
    icon: 'text-muted',
  },
};

const TYPE_ICONS: Record<string, string> = {
  hours: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  lmn: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  certification:
    'M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
};

export function ExpiryAlerts() {
  const sorted = [...MOCK_ALERTS].sort((a, b) => a.daysLeft - b.daysLeft);
  const highUrgency = sorted.filter((a) => a.urgency === 'high');
  const totalAtRisk = MOCK_ALERTS.filter((a) => a.type === 'hours').reduce((sum, a) => {
    const match = a.value.match(/[\d.]+/);
    return sum + (match ? parseFloat(match[0]) : 0);
  }, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Expiring Soon</h1>
        <p className="text-sm text-muted">Items that need your attention before they expire</p>
      </div>

      {/* Summary Banner */}
      {highUrgency.length > 0 && (
        <div className="rounded-xl border-2 border-zone-red/30 bg-zone-red/5 p-4">
          <div className="flex items-center gap-3">
            <svg
              className="h-6 w-6 text-zone-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-zone-red">
                {highUrgency.length} item{highUrgency.length > 1 ? 's' : ''} expiring within 7 days
              </p>
              <p className="text-xs text-secondary">
                {totalAtRisk} Time Bank hours at risk of forfeiture
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-zone-red">{highUrgency.length}</p>
          <p className="text-[11px] text-muted">Urgent</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-gold">
            {MOCK_ALERTS.filter((a) => a.urgency === 'medium').length}
          </p>
          <p className="text-[11px] text-muted">Upcoming</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{totalAtRisk}h</p>
          <p className="text-[11px] text-muted">Hours at Risk</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {sorted.map((alert) => {
          const config = URGENCY_CONFIG[alert.urgency];
          const icon = TYPE_ICONS[alert.type] ?? TYPE_ICONS.hours!;
          return (
            <div key={alert.id} className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
              <div className="flex items-start gap-3">
                <svg
                  className={`mt-0.5 h-5 w-5 shrink-0 ${config.icon}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary">{alert.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.badge}`}
                    >
                      {config.badgeLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-secondary">{alert.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-[11px]">
                    <span className="font-medium text-primary">{alert.value}</span>
                    <span
                      className={`font-medium ${
                        alert.daysLeft <= 7
                          ? 'text-zone-red'
                          : alert.daysLeft <= 30
                            ? 'text-gold'
                            : 'text-muted'
                      }`}
                    >
                      {alert.daysLeft} days left
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {alert.actions.map((action) => (
                      <a
                        key={action.label}
                        href={action.href}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          action.primary
                            ? 'bg-sage text-white hover:bg-sage-dark'
                            : 'border border-border text-secondary hover:bg-warm-gray/20'
                        }`}
                      >
                        {action.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expiry Rules */}
      <div className="rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Expiry Policy</h3>
        <div className="mt-2 space-y-1.5 text-xs text-secondary">
          <p>• Time Bank hours expire 12 months after earning</p>
          <p>• LMN requires annual renewal for HSA/FSA eligibility</p>
          <p>• Certifications renew annually with bonus hours</p>
          <p>• Expired hours can be donated to the Respite Fund instead of being forfeited</p>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Notifications are sent at 60, 30, and 7 days before expiry. Respite donations are
        tax-reportable.
      </p>
    </div>
  );
}
