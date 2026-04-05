/**
 * MedicalAlerts — Medical Director alerts dashboard
 *
 * Consolidated view of clinical alerts: wearable anomalies, predictive
 * hospitalization risk, CRI score changes, LMN renewals, and KBS flags.
 */

interface ClinicalAlert {
  id: string;
  type: 'wearable_anomaly' | 'hospitalization_risk' | 'cri_change' | 'lmn_renewal' | 'kbs_flag';
  severity: 'critical' | 'warning' | 'info';
  patient: string;
  patientId: string;
  title: string;
  description: string;
  timestamp: string;
  metrics?: { label: string; value: string }[];
  action: { label: string; href: string };
  acknowledged: boolean;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

const MOCK_ALERTS: ClinicalAlert[] = [
  {
    id: 'a1',
    type: 'hospitalization_risk',
    severity: 'critical',
    patient: 'Helen Park',
    patientId: 'hp1',
    title: 'Predictive Risk Score: 78/100',
    description:
      'Risk score exceeded 70 threshold. Combination of elevated resting HR (82 bpm, +2.3 SD), decreased HRV, and recent worker-owner note flagging fatigue.',
    timestamp: hoursAgo(1),
    metrics: [
      { label: 'Risk Score', value: '78/100' },
      { label: 'Resting HR', value: '82 bpm (+2.3 SD)' },
      { label: 'HRV', value: '28ms (-1.8 SD)' },
    ],
    action: { label: 'Review Vitals', href: '#/conductor/vitals' },
    acknowledged: false,
  },
  {
    id: 'a2',
    type: 'wearable_anomaly',
    severity: 'warning',
    patient: 'Helen Park',
    patientId: 'hp1',
    title: 'SpO2 Below Baseline',
    description:
      'Blood oxygen dropped to 93% (baseline 96.2%, -2.1 SD). Single reading — monitor for persistence. Mapped to Omaha #28 Circulation.',
    timestamp: hoursAgo(4),
    metrics: [
      { label: 'SpO2', value: '93% (-2.1 SD)' },
      { label: 'Baseline', value: '96.2%' },
    ],
    action: { label: 'View Vitals', href: '#/conductor/vitals' },
    acknowledged: false,
  },
  {
    id: 'a3',
    type: 'cri_change',
    severity: 'warning',
    patient: 'Robert Lee',
    patientId: 'rl1',
    title: 'CRI Score Increased (+8.2 points)',
    description:
      'Care Recipient Index rose from 28.4 to 36.6 over 30 days. Mobility and cognition domains showing decline. May need care plan adjustment.',
    timestamp: hoursAgo(12),
    metrics: [
      { label: 'CRI Score', value: '36.6 (+8.2)' },
      { label: 'Mobility', value: '3.2 → 4.1' },
      { label: 'Cognition', value: '2.8 → 3.5' },
    ],
    action: { label: 'Review CRI', href: '#/assessments/cri/review' },
    acknowledged: true,
  },
  {
    id: 'a4',
    type: 'lmn_renewal',
    severity: 'info',
    patient: 'Helen Park',
    patientId: 'hp1',
    title: 'LMN Renewal Due in 30 Days',
    description:
      'Annual Letter of Medical Necessity renewal required. CRI reassessment should be included in renewal telehealth.',
    timestamp: hoursAgo(24),
    action: { label: 'View LMN', href: '#/medical/lmn' },
    acknowledged: true,
  },
  {
    id: 'a5',
    type: 'kbs_flag',
    severity: 'info',
    patient: 'Margaret Chen',
    patientId: 'mc1',
    title: 'KBS Knowledge Score Below Target',
    description:
      'Medication management knowledge score is 2/5 after 3 months. Consider additional education or conductor certification referral.',
    timestamp: hoursAgo(48),
    metrics: [
      { label: 'Knowledge', value: '2/5' },
      { label: 'Behavior', value: '3/5' },
      { label: 'Status', value: '3/5' },
    ],
    action: { label: 'View KBS Trend', href: '#/assessments/kbs/trend' },
    acknowledged: true,
  },
];

const SEVERITY_CONFIG = {
  critical: {
    border: 'border-zone-red/30',
    bg: 'bg-zone-red/5',
    badge: 'bg-zone-red text-white',
    icon: 'text-zone-red',
  },
  warning: {
    border: 'border-gold/30',
    bg: 'bg-gold/5',
    badge: 'bg-gold text-white',
    icon: 'text-gold',
  },
  info: {
    border: 'border-border',
    bg: 'bg-white',
    badge: 'bg-warm-gray/30 text-muted',
    icon: 'text-blue-500',
  },
};

const TYPE_ICONS: Record<string, string> = {
  wearable_anomaly: 'M3 12h4l3-9 4 18 3-9h4',
  hospitalization_risk:
    'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  cri_change:
    'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
  lmn_renewal:
    'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  kbs_flag:
    'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
};

export function MedicalAlerts() {
  const unacknowledged = MOCK_ALERTS.filter((a) => !a.acknowledged);
  const critical = MOCK_ALERTS.filter((a) => a.severity === 'critical');

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Clinical Alerts</h1>
        <p className="text-sm text-muted">Medical Director — consolidated patient alerts</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zone-red/20 bg-zone-red/5 p-3 text-center">
          <p className="text-2xl font-bold text-zone-red">{critical.length}</p>
          <p className="text-[11px] text-muted">Critical</p>
        </div>
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-center">
          <p className="text-2xl font-bold text-gold">{unacknowledged.length}</p>
          <p className="text-[11px] text-muted">Unacknowledged</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{MOCK_ALERTS.length}</p>
          <p className="text-[11px] text-muted">Total Alerts</p>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {MOCK_ALERTS.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          const icon = TYPE_ICONS[alert.type] ?? TYPE_ICONS.wearable_anomaly!;
          const timeAgo = Math.round(
            (now.getTime() - new Date(alert.timestamp).getTime()) / 3600000,
          );

          return (
            <div
              key={alert.id}
              className={`rounded-xl border ${config.border} ${config.bg} p-4 ${alert.acknowledged ? 'opacity-70' : ''}`}
            >
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
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.badge}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[11px] text-muted">{timeAgo}h ago</span>
                    {alert.acknowledged && (
                      <span className="text-[10px] text-sage">Acknowledged</span>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-primary">{alert.title}</h3>
                  <p className="text-[11px] text-copper font-medium">Patient: {alert.patient}</p>
                  <p className="mt-1 text-xs text-secondary">{alert.description}</p>

                  {alert.metrics && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {alert.metrics.map((m) => (
                        <span key={m.label} className="rounded bg-white/80 px-2 py-0.5 text-[10px]">
                          <span className="text-muted">{m.label}:</span>{' '}
                          <span className="font-medium text-primary">{m.value}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <a
                    href={alert.action.href}
                    className="mt-2 inline-block rounded-lg bg-sage px-3 py-1 text-xs font-medium text-white hover:bg-sage-dark"
                  >
                    {alert.action.label}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted">
        Alerts generated from wearable data, assessment scores, and worker-owner care notes.
        Hospitalization risk scores above 70 trigger automatic Medical Director notification.
      </p>
    </div>
  );
}
