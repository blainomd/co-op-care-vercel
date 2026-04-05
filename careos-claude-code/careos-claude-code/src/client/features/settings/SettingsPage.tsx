/**
 * SettingsPage — Notification preferences, appearance, and privacy controls
 *
 * Warm cooperative tone. All toggles are local state for now (will connect to API).
 */
import { useState } from 'react';

interface NotificationPref {
  key: string;
  label: string;
  description: string;
  push: boolean;
  email: boolean;
  sms: boolean;
}

const INITIAL_PREFS: NotificationPref[] = [
  {
    key: 'task_updates',
    label: 'Task Updates',
    description: 'When tasks are matched, accepted, or completed',
    push: true,
    email: true,
    sms: false,
  },
  {
    key: 'assessment_reminders',
    label: 'Assessment Reminders',
    description: 'CII reassessment and review deadlines',
    push: true,
    email: true,
    sms: true,
  },
  {
    key: 'billing',
    label: 'Billing & Membership',
    description: 'Renewal reminders, payment confirmations',
    push: false,
    email: true,
    sms: false,
  },
  {
    key: 'community',
    label: 'Community Updates',
    description: 'Referral bonuses, streak milestones',
    push: true,
    email: false,
    sms: false,
  },
  {
    key: 'shift_updates',
    label: 'Shift Updates',
    description: 'Shift swap requests and schedule changes',
    push: true,
    email: true,
    sms: true,
  },
];

export function SettingsPage() {
  const [prefs, setPrefs] = useState(INITIAL_PREFS);
  const [theme, setTheme] = useState<'light' | 'system'>('system');
  const [saved, setSaved] = useState(false);

  const togglePref = (key: string, channel: 'push' | 'email' | 'sms') => {
    setPrefs((prev) => prev.map((p) => (p.key === key ? { ...p, [channel]: !p[channel] } : p)));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: POST to /api/v1/settings/notifications
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-muted">Manage your preferences</p>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Notification Preferences</h2>

        {/* Channel Headers */}
        <div className="mb-2 flex items-center">
          <div className="flex-1" />
          <div className="flex w-36 justify-between text-center text-[11px] font-medium uppercase tracking-wider text-muted">
            <span className="w-12">Push</span>
            <span className="w-12">Email</span>
            <span className="w-12">SMS</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {prefs.map((pref) => (
            <div key={pref.key} className="flex items-center py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{pref.label}</p>
                <p className="text-xs text-muted">{pref.description}</p>
              </div>
              <div className="flex w-36 justify-between">
                {(['push', 'email', 'sms'] as const).map((channel) => (
                  <div key={channel} className="flex w-12 justify-center">
                    <button
                      onClick={() => togglePref(pref.key, channel)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        pref[channel] ? 'bg-sage' : 'bg-warm-gray/30'
                      }`}
                      aria-label={`${pref.label} ${channel}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          pref[channel] ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          {saved && <span className="text-xs font-medium text-sage">Saved</span>}
          <button
            onClick={handleSave}
            className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-dark"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Appearance</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 rounded-lg border p-4 text-center transition-colors ${
              theme === 'light' ? 'border-sage bg-sage/5' : 'border-border hover:bg-warm-gray/20'
            }`}
          >
            <svg
              className="mx-auto mb-2 h-6 w-6 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
            <p className="text-sm font-medium text-primary">Light</p>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex-1 rounded-lg border p-4 text-center transition-colors ${
              theme === 'system' ? 'border-sage bg-sage/5' : 'border-border hover:bg-warm-gray/20'
            }`}
          >
            <svg
              className="mx-auto mb-2 h-6 w-6 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25h-13.5A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25h-13.5A2.25 2.25 0 013 12V5.25"
              />
            </svg>
            <p className="text-sm font-medium text-primary">System</p>
          </button>
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary">Privacy</h2>
        <div className="space-y-3 text-sm text-secondary">
          <p>
            Your health information is protected under HIPAA. CareOS never shares PHI without your
            consent.
          </p>
          <p>
            All API responses containing health data use NetworkOnly caching — nothing is stored in
            your browser.
          </p>
        </div>
        <div className="mt-4 flex gap-3">
          <a href="#" className="text-xs font-medium text-sage hover:text-sage/80">
            Privacy Policy
          </a>
          <a href="#" className="text-xs font-medium text-sage hover:text-sage/80">
            Data Export
          </a>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        CareOS — cooperative home care. Your data, your cooperative.
      </p>
    </div>
  );
}
