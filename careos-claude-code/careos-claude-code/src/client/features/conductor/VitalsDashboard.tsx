/**
 * VitalsDashboard — Wearable vitals monitoring for care recipients
 *
 * Displays Apple Watch passive monitoring data: resting HR, HRV, sleep, steps, SpO2.
 * Anomaly detection highlights readings >2 SD from 30-day rolling average.
 * Maps to Omaha domains: #27 Circulation, #26 Respiration, #36 Sleep/Rest, #37 Physical Activity.
 */

interface VitalReading {
  timestamp: string;
  value: number;
}

interface VitalMetric {
  id: string;
  label: string;
  unit: string;
  current: number;
  baseline30Day: number;
  stdDev: number;
  trend: 'stable' | 'improving' | 'declining';
  omahaCode: string;
  icon: string;
  color: string;
  history: VitalReading[];
}

const MOCK_VITALS: VitalMetric[] = [
  {
    id: 'rhr',
    label: 'Resting Heart Rate',
    unit: 'bpm',
    current: 72,
    baseline30Day: 68,
    stdDev: 4,
    trend: 'stable',
    omahaCode: '#27 Circulation',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    color: 'text-zone-red',
    history: Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
      value: 66 + Math.floor(Math.random() * 8),
    })),
  },
  {
    id: 'hrv',
    label: 'Heart Rate Variability',
    unit: 'ms',
    current: 42,
    baseline30Day: 45,
    stdDev: 6,
    trend: 'stable',
    omahaCode: '#27 Circulation',
    icon: 'M3 12h4l3-9 4 18 3-9h4',
    color: 'text-copper',
    history: Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
      value: 38 + Math.floor(Math.random() * 12),
    })),
  },
  {
    id: 'spo2',
    label: 'Blood Oxygen (SpO2)',
    unit: '%',
    current: 97,
    baseline30Day: 97,
    stdDev: 1,
    trend: 'stable',
    omahaCode: '#26 Respiration',
    icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-blue-500',
    history: Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
      value: 95 + Math.floor(Math.random() * 4),
    })),
  },
  {
    id: 'sleep',
    label: 'Sleep Duration',
    unit: 'hrs',
    current: 6.5,
    baseline30Day: 7.2,
    stdDev: 0.8,
    trend: 'declining',
    omahaCode: '#36 Sleep/Rest',
    icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    color: 'text-purple-500',
    history: Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
      value: 5.5 + Math.random() * 3,
    })),
  },
  {
    id: 'steps',
    label: 'Daily Steps',
    unit: 'steps',
    current: 3420,
    baseline30Day: 4100,
    stdDev: 800,
    trend: 'declining',
    omahaCode: '#37 Physical Activity',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'text-sage',
    history: Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
      value: 2800 + Math.floor(Math.random() * 2500),
    })),
  },
];

function isAnomaly(metric: VitalMetric): boolean {
  return Math.abs(metric.current - metric.baseline30Day) > 2 * metric.stdDev;
}

export function VitalsDashboard() {
  const anomalies = MOCK_VITALS.filter(isAnomaly);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Vitals Monitor</h1>
        <p className="text-sm text-muted">Apple Watch passive monitoring for Helen Park</p>
      </div>

      {/* Anomaly Alert */}
      {anomalies.length > 0 && (
        <div className="rounded-xl border border-zone-red/30 bg-zone-red/5 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-zone-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm font-medium text-zone-red">
              {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected
            </p>
          </div>
          <p className="mt-1 text-xs text-zone-red/80">
            Reading{anomalies.length > 1 ? 's' : ''} &gt;2 standard deviations from 30-day baseline:{' '}
            {anomalies.map((a) => a.label).join(', ')}
          </p>
        </div>
      )}

      {/* Vital Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {MOCK_VITALS.map((metric) => {
          const anomaly = isAnomaly(metric);
          const deviation = ((metric.current - metric.baseline30Day) / metric.stdDev).toFixed(1);
          return (
            <div
              key={metric.id}
              className={`rounded-xl border p-4 ${
                anomaly ? 'border-zone-red/30 bg-zone-red/5' : 'border-border bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className={`h-5 w-5 ${metric.color}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={metric.icon} />
                  </svg>
                  <span className="text-sm font-medium text-primary">{metric.label}</span>
                </div>
                {anomaly && (
                  <span className="rounded-full bg-zone-red/10 px-2 py-0.5 text-[10px] font-medium text-zone-red">
                    {deviation}σ
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">
                  {metric.id === 'sleep'
                    ? metric.current.toFixed(1)
                    : Math.round(metric.current).toLocaleString()}
                </span>
                <span className="text-sm text-muted">{metric.unit}</span>
              </div>

              <div className="mt-2 flex items-center gap-3 text-[11px]">
                <span className="text-muted">
                  30d avg:{' '}
                  {metric.id === 'sleep'
                    ? metric.baseline30Day.toFixed(1)
                    : Math.round(metric.baseline30Day).toLocaleString()}{' '}
                  {metric.unit}
                </span>
                <span
                  className={
                    metric.trend === 'improving'
                      ? 'text-sage'
                      : metric.trend === 'declining'
                        ? 'text-zone-red'
                        : 'text-muted'
                  }
                >
                  {metric.trend === 'improving' ? '↑' : metric.trend === 'declining' ? '↓' : '→'}{' '}
                  {metric.trend}
                </span>
              </div>

              {/* Mini sparkline (text-based) */}
              <div className="mt-2 flex items-end gap-0.5 h-8">
                {metric.history.map((reading, i) => {
                  const min = Math.min(...metric.history.map((r) => r.value));
                  const max = Math.max(...metric.history.map((r) => r.value));
                  const range = max - min || 1;
                  const height = Math.max(4, ((reading.value - min) / range) * 28);
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${anomaly && i === metric.history.length - 1 ? 'bg-zone-red/40' : 'bg-sage/30'}`}
                      style={{ height: `${height}px` }}
                      title={`${new Date(reading.timestamp).toLocaleDateString()}: ${metric.id === 'sleep' ? reading.value.toFixed(1) : Math.round(reading.value)} ${metric.unit}`}
                    />
                  );
                })}
              </div>

              <p className="mt-1 text-[10px] text-muted">Omaha: {metric.omahaCode}</p>
            </div>
          );
        })}
      </div>

      {/* Risk Score */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-primary">Predictive Risk Score</h3>
            <p className="text-xs text-muted">72-96 hour hospitalization prediction</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-sage">23</p>
              <p className="text-[10px] text-muted">/100</p>
            </div>
            <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[11px] font-medium text-sage">
              Low Risk
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary">
          Based on wearable trends, worker care notes, Time Bank neighbor observations, CRI scores,
          and medication adherence. Score &gt;70 triggers Medical Director notification + additional
          worker visit.
        </p>
      </div>

      <p className="text-[11px] text-muted">
        Vitals are passively collected via Apple Watch. Anomaly detection alerts when readings
        exceed 2 standard deviations from 30-day baseline.
      </p>
    </div>
  );
}
