/**
 * WearableSetup — Apple Watch pairing and configuration for Conductors
 *
 * 3-step wizard: Connect device, select monitored metrics, set baseline preferences.
 * Apple Watch provides continuous passive monitoring: resting HR, HRV, sleep, steps, SpO2.
 * Personal baselines with anomaly detection at >2 SD from 30-day rolling average.
 * LOINC-coded vitals stored in Aidbox FHIR R4.
 * Maps to Omaha domains: #27 Circulation, #26 Respiration, #36 Sleep/Rest, #37 Physical Activity.
 */

import { useState } from 'react';

interface MetricConfig {
  id: string;
  label: string;
  description: string;
  loincCode: string;
  loincDisplay: string;
  omahaProblem: string;
  omahaCode: string;
  icon: string;
  enabled: boolean;
}

interface DeviceInfo {
  name: string;
  model: string;
  osVersion: string;
  battery: number;
  lastSync: string;
  dataPointsCollected: number;
  connected: boolean;
}

const INITIAL_METRICS: MetricConfig[] = [
  {
    id: 'heart-rate',
    label: 'Heart Rate',
    description: 'Resting heart rate measured continuously throughout the day',
    loincCode: '8867-4',
    loincDisplay: 'Heart rate',
    omahaProblem: 'Circulation',
    omahaCode: '#27',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    enabled: true,
  },
  {
    id: 'hrv',
    label: 'Heart Rate Variability',
    description:
      'Beat-to-beat interval variation — key indicator of autonomic nervous system health',
    loincCode: '80404-7',
    loincDisplay: 'R-R interval.standard deviation (Heart rate variability)',
    omahaProblem: 'Circulation',
    omahaCode: '#27',
    icon: 'M3 12h4l3-9 4 18 3-9h4',
    enabled: true,
  },
  {
    id: 'spo2',
    label: 'Blood Oxygen (SpO2)',
    description: 'Peripheral oxygen saturation — flags respiratory or circulatory concerns',
    loincCode: '2708-6',
    loincDisplay: 'Oxygen saturation in Arterial blood',
    omahaProblem: 'Respiration',
    omahaCode: '#26',
    icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    enabled: true,
  },
  {
    id: 'sleep',
    label: 'Sleep Duration & Quality',
    description: 'Total sleep time, sleep stages, and disturbances tracked nightly',
    loincCode: 'custom-sleep',
    loincDisplay: 'Sleep duration (custom composite)',
    omahaProblem: 'Sleep/Rest',
    omahaCode: '#36',
    icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    enabled: true,
  },
  {
    id: 'steps',
    label: 'Daily Steps',
    description: 'Step count and movement patterns for mobility and activity tracking',
    loincCode: '55423-8',
    loincDisplay: 'Number of steps in unspecified time Pedometer',
    omahaProblem: 'Physical Activity',
    omahaCode: '#37',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    enabled: false,
  },
  {
    id: 'blood-pressure',
    label: 'Blood Pressure',
    description: 'Systolic and diastolic readings via compatible cuff or watch sensor',
    loincCode: '85354-9',
    loincDisplay: 'Blood pressure panel with all children optional',
    omahaProblem: 'Circulation',
    omahaCode: '#27',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    enabled: false,
  },
];

const MOCK_DEVICE: DeviceInfo = {
  name: "Helen's Apple Watch",
  model: 'Apple Watch Series 9',
  osVersion: 'watchOS 11.3',
  battery: 72,
  lastSync: '3 minutes ago',
  dataPointsCollected: 14_832,
  connected: true,
};

const SUPPORTED_DEVICES = [
  { name: 'Apple Watch Series 9/10/Ultra 2', status: 'Full support' },
  { name: 'Apple Watch SE (2nd gen)', status: 'Full support' },
  { name: 'Apple Watch Series 7/8', status: 'Full support' },
  { name: 'Apple Watch Series 4/5/6', status: 'Limited (no SpO2)' },
];

export function WearableSetup() {
  const [step, setStep] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<MetricConfig[]>(INITIAL_METRICS);
  const [anomalyThreshold, setAnomalyThreshold] = useState(2);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  function toggleMetric(id: string) {
    setMetrics((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  }

  function handleConnect() {
    setIsConnecting(true);
    // Simulate pairing delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  }

  const enabledCount = metrics.filter((m) => m.enabled).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Wearable Setup</h1>
        <p className="text-sm text-muted">Connect Apple Watch for continuous passive monitoring</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s === 1 || (s === 2 && isConnected) || (s === 3 && isConnected)) {
                  setStep(s);
                }
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                step === s
                  ? 'bg-sage text-white'
                  : step > s
                    ? 'bg-sage/20 text-sage'
                    : 'bg-warm-gray text-muted'
              }`}
            >
              {step > s ? (
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
                s
              )}
            </button>
            {s < 3 && (
              <div className={`h-0.5 w-8 rounded ${step > s ? 'bg-sage/40' : 'bg-warm-gray'}`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted">
          {step === 1 && 'Connect Device'}
          {step === 2 && 'Select Metrics'}
          {step === 3 && 'Baseline Preferences'}
        </span>
      </div>

      {/* Step 1: Connect Apple Watch */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-start gap-4">
              {/* Watch icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sage/10">
                <svg
                  className="h-7 w-7 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 3h6v2H9V3zM9 19h6v2H9v-2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-primary">Connect Apple Watch</h2>
                <p className="mt-1 text-sm text-secondary">
                  CareOS uses Apple Health to passively collect vitals from your loved one's Apple
                  Watch. No manual logging required.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-medium text-primary">How it works:</h3>
              <div className="space-y-2">
                {[
                  { num: '1', text: 'Ensure the Apple Watch is paired with their iPhone' },
                  { num: '2', text: 'Open the Health app on their iPhone' },
                  { num: '3', text: 'Go to Settings > Privacy > Apps and enable CareOS' },
                  { num: '4', text: 'Tap "Connect" below to authorize data access' },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage/10 text-xs font-semibold text-sage">
                      {item.num}
                    </span>
                    <p className="text-sm text-secondary">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={isConnecting || isConnected}
              className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                isConnected
                  ? 'bg-sage/10 text-sage'
                  : isConnecting
                    ? 'bg-sage/60 text-white'
                    : 'bg-sage text-white hover:bg-sage/90'
              }`}
            >
              {isConnected ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Connected to Apple Health
                </span>
              ) : isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect Apple Health'
              )}
            </button>
          </div>

          {/* Supported Devices */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="text-sm font-semibold text-primary">Supported Devices</h3>
            <div className="mt-3 space-y-2">
              {SUPPORTED_DEVICES.map((device) => (
                <div key={device.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-secondary">{device.name}</span>
                  </div>
                  <span
                    className={`text-xs ${device.status === 'Full support' ? 'text-sage' : 'text-gold'}`}
                  >
                    {device.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Device Status Card */}
          {isConnected && (
            <div className="rounded-xl border border-sage/30 bg-sage/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10">
                    <svg
                      className="h-5 w-5 text-sage"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 3h6v2H9V3zM9 19h6v2H9v-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{MOCK_DEVICE.name}</p>
                    <p className="text-xs text-muted">
                      {MOCK_DEVICE.model} — {MOCK_DEVICE.osVersion}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-[11px] font-medium text-sage">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  Connected
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <svg
                      className="h-3.5 w-3.5 text-sage"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z"
                      />
                    </svg>
                    <span className="text-sm font-bold text-primary">{MOCK_DEVICE.battery}%</span>
                  </div>
                  <p className="text-[10px] text-muted">Battery</p>
                </div>
                <div className="rounded-lg bg-white p-2 text-center">
                  <p className="text-sm font-bold text-primary">{MOCK_DEVICE.lastSync}</p>
                  <p className="text-[10px] text-muted">Last Sync</p>
                </div>
                <div className="rounded-lg bg-white p-2 text-center">
                  <p className="text-sm font-bold text-primary">
                    {MOCK_DEVICE.dataPointsCollected.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted">Data Points</p>
                </div>
              </div>
            </div>
          )}

          {/* Next button */}
          {isConnected && (
            <button
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage/90"
            >
              Continue to Metric Selection
            </button>
          )}
        </div>
      )}

      {/* Step 2: Select Metrics */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-lg font-semibold text-primary">Select Metrics to Monitor</h2>
            <p className="mt-1 text-sm text-muted">
              Choose which vitals to track. Each metric is passively collected and mapped to
              clinical codes for your care team.
            </p>
            <p className="mt-2 text-xs text-copper">
              {enabledCount} of {metrics.length} metrics enabled
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => toggleMetric(metric.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  metric.enabled
                    ? 'border-sage/40 bg-sage/5'
                    : 'border-border bg-white hover:border-border/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className={`h-5 w-5 ${metric.enabled ? 'text-sage' : 'text-muted'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={metric.icon} />
                    </svg>
                    <span className="text-sm font-semibold text-primary">{metric.label}</span>
                  </div>
                  {/* Toggle indicator */}
                  <div
                    className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
                      metric.enabled ? 'bg-sage' : 'bg-warm-gray'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        metric.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-secondary">{metric.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-warm-gray px-1.5 py-0.5 text-[10px] font-medium text-muted">
                    LOINC {metric.loincCode}
                  </span>
                  <span className="rounded bg-warm-gray px-1.5 py-0.5 text-[10px] font-medium text-muted">
                    Omaha {metric.omahaCode} {metric.omahaProblem}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-warm-gray"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={enabledCount === 0}
              className="flex-1 rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage/90 disabled:bg-sage/40"
            >
              Continue to Preferences
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Baseline Preferences */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Anomaly Threshold */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-lg font-semibold text-primary">Anomaly Detection Threshold</h2>
            <p className="mt-1 text-sm text-secondary">
              CareOS builds a personal baseline from the 30-day rolling average. Alerts trigger when
              a reading deviates beyond the threshold you set below.
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-primary">Standard Deviations</label>
                <span className="rounded-full bg-sage/10 px-3 py-1 text-sm font-bold text-sage">
                  {anomalyThreshold} SD
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(parseFloat(e.target.value))}
                className="mt-2 w-full accent-sage"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted">
                <span>1 SD (sensitive)</span>
                <span>2 SD (recommended)</span>
                <span>4 SD (conservative)</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-warm-gray p-3">
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <p className="text-xs text-secondary">
                  <span className="font-medium text-primary">Lower = more alerts.</span> At 1 SD,
                  you may see frequent notifications for normal variation. At 2 SD, only clinically
                  meaningful deviations trigger alerts. Medical Director Josh Emdur recommends 2 SD
                  for most care recipients.
                </p>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-primary">Alert Notifications</h3>
            <p className="mt-1 text-xs text-muted">
              How should CareOS notify you when an anomaly is detected?
            </p>

            <div className="mt-4 space-y-3">
              {[
                {
                  id: 'push',
                  label: 'Push Notifications',
                  desc: 'Immediate alerts on your phone',
                  checked: notifyPush,
                  toggle: () => setNotifyPush((v) => !v),
                  icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
                },
                {
                  id: 'sms',
                  label: 'SMS Text Messages',
                  desc: 'Text alert for critical anomalies',
                  checked: notifySms,
                  toggle: () => setNotifySms((v) => !v),
                  icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
                },
                {
                  id: 'email',
                  label: 'Email Digest',
                  desc: 'Daily summary of all readings',
                  checked: notifyEmail,
                  toggle: () => setNotifyEmail((v) => !v),
                  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                },
              ].map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={notif.icon} />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-primary">{notif.label}</p>
                      <p className="text-[11px] text-muted">{notif.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={notif.toggle}
                    className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
                      notif.checked ? 'bg-sage' : 'bg-warm-gray'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        notif.checked ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact for Critical Alerts */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-primary">
              Emergency Contact for Critical Alerts
            </h3>
            <p className="mt-1 text-xs text-muted">
              If a vital reading reaches a critical threshold (e.g., SpO2 below 90%, resting HR
              above 120 bpm), CareOS can also notify an emergency contact.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-secondary">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g., Dr. Sarah Kim"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-secondary">Phone Number</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="(303) 555-0199"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-warm-gray p-3">
              <p className="text-xs text-secondary">
                <span className="font-medium text-primary">Critical alert criteria:</span> SpO2
                &lt;90%, resting HR &gt;120 or &lt;40 bpm, no data received for &gt;24 hours. These
                alerts always notify the Medical Director regardless of your settings.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-warm-gray"
            >
              Back
            </button>
            <button
              onClick={() => {
                // In production: save preferences to PostgreSQL + kick off FHIR sync
              }}
              className="flex-1 rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage/90"
            >
              Save & Activate Monitoring
            </button>
          </div>
        </div>
      )}

      {/* Connected Device Status Card — always visible after connection when not on step 1 */}
      {isConnected && step !== 1 && (
        <div className="rounded-xl border border-sage/30 bg-sage/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10">
                <svg
                  className="h-5 w-5 text-sage"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 3h6v2H9V3zM9 19h6v2H9v-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{MOCK_DEVICE.name}</p>
                <p className="text-xs text-muted">{MOCK_DEVICE.model}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-muted">
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
                    d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z"
                  />
                </svg>
                {MOCK_DEVICE.battery}%
              </span>
              <span className="flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-[11px] font-medium text-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                Connected
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted">
        All vitals are LOINC-coded and stored in Aidbox FHIR R4. Anomaly detection uses a 30-day
        rolling average with configurable standard deviation thresholds. Data is never sold or
        shared outside your care team.
      </p>
    </div>
  );
}
