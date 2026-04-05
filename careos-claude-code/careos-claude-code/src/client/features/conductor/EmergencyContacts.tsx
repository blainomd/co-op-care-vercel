/**
 * EmergencyContacts — Emergency contact management for care recipients
 *
 * The Conductor's quick-access page for critical contacts: family decision-makers,
 * Medical Director, care team worker-owners, healthcare providers, and a quick-dial
 * section for mobile use.
 */
import { useState } from 'react';

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  relationship: string;
  phone: string;
  email?: string;
  badge?: string;
  badgeColor?: string;
  initials: string;
}

interface CareTeamWorker {
  id: string;
  name: string;
  role: string;
  initials: string;
  phone: string;
  schedule: string;
  specialty: string;
}

interface HealthcareProvider {
  id: string;
  name: string;
  type: string;
  phone: string;
  address?: string;
  detail?: string;
}

interface NewContactForm {
  name: string;
  phone: string;
  email: string;
  relationship: string;
  priority: string;
}

const PRIMARY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ec1',
    name: 'Sarah Henderson',
    role: 'Conductor / Daughter',
    relationship: 'Daughter',
    phone: '(303) 555-0147',
    email: 'sarah.henderson@email.com',
    badge: 'Primary Decision Maker',
    badgeColor: 'bg-copper/10 text-copper border-copper/30',
    initials: 'SH',
  },
  {
    id: 'ec2',
    name: 'Dr. Josh Emdur, DO',
    role: 'Medical Director',
    relationship: 'Medical Director',
    phone: '(303) 555-0200',
    badge: '50-State Licensed',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
    initials: 'JE',
  },
  {
    id: 'ec3',
    name: 'Michael Henderson',
    role: 'Son',
    relationship: 'Son',
    phone: '(303) 555-0183',
    email: 'michael.henderson@email.com',
    badge: 'Secondary Contact',
    badgeColor: 'bg-sage/10 text-sage border-sage/30',
    initials: 'MH',
  },
];

const CARE_TEAM: CareTeamWorker[] = [
  {
    id: 'cw1',
    name: 'Maria Garcia',
    role: 'Worker-Owner',
    initials: 'MG',
    phone: '(303) 555-0156',
    schedule: 'Mon / Wed / Fri',
    specialty: 'Companion Care',
  },
  {
    id: 'cw2',
    name: 'Janet Rodriguez',
    role: 'Worker-Owner',
    initials: 'JR',
    phone: '(303) 555-0171',
    schedule: 'Tue / Thu',
    specialty: 'Meal Prep',
  },
];

const HEALTHCARE_PROVIDERS: HealthcareProvider[] = [
  {
    id: 'hp1',
    name: 'Dr. Sarah Kim',
    type: 'Primary Care Physician',
    phone: '(303) 441-0400',
    address: '4800 Riverbend Rd, Boulder, CO 80301',
    detail: 'Boulder Medical Center',
  },
  {
    id: 'hp2',
    name: 'Walgreens #3421',
    type: 'Pharmacy',
    phone: '(303) 449-1286',
    address: '2800 Arapahoe Ave, Boulder, CO 80302',
    detail: 'Auto-refill enrolled',
  },
  {
    id: 'hp3',
    name: 'Medicare Part B + AARP Supplement',
    type: 'Insurance',
    phone: '1-800-633-4227',
    detail: 'Member ID: 1EG4-TE5-MK72',
  },
];

const EMPTY_FORM: NewContactForm = {
  name: '',
  phone: '',
  email: '',
  relationship: '',
  priority: '',
};

export function EmergencyContacts() {
  const [form, setForm] = useState<NewContactForm>({ ...EMPTY_FORM });
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof NewContactForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    if (!form.name || !form.phone) return;
    setSaved(true);
    setForm({ ...EMPTY_FORM });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">Emergency Contacts</h1>
        <p className="text-sm text-text-secondary">
          Critical contacts for Dorothy Henderson's care team
        </p>
      </div>

      {/* Emergency Call Banner */}
      <div className="rounded-xl border border-zone-red/30 bg-zone-red/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zone-red">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zone-red">
              In a medical emergency, always call 911 first
            </p>
            <a
              href="tel:911"
              className="mt-1 inline-flex items-center gap-1 rounded-lg bg-zone-red px-3 py-1 text-xs font-medium text-white"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              Call 911
            </a>
          </div>
        </div>
      </div>

      {/* Primary Contacts */}
      <div>
        <h2 className="font-heading mb-2 text-lg font-semibold text-text-primary">
          Primary Contacts
        </h2>
        <div className="space-y-3">
          {PRIMARY_CONTACTS.map((contact) => (
            <div key={contact.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage text-sm font-bold text-white">
                  {contact.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{contact.name}</h3>
                      <p className="text-xs text-text-secondary">{contact.role}</p>
                    </div>
                    {contact.badge && (
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${contact.badgeColor}`}
                      >
                        {contact.badge}
                      </span>
                    )}
                  </div>

                  {contact.id === 'ec2' && (
                    <span className="mt-1 inline-block rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      BCH Hospitalist
                    </span>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
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
                    <span>{contact.phone}</span>
                    {contact.email && (
                      <>
                        <span className="text-text-muted">|</span>
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
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                        <span>{contact.email}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <a
                      href={`tel:${contact.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-1 rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage/90"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                      Call
                    </a>
                    <a
                      href="#/messages/new"
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-warm-gray/20"
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
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-warm-gray/20"
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
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Care Team Contacts */}
      <div>
        <h2 className="font-heading mb-2 text-lg font-semibold text-text-primary">Care Team</h2>
        <p className="mb-2 text-xs text-text-muted">Worker-owners assigned to Dorothy's care</p>
        <div className="space-y-3">
          {CARE_TEAM.map((worker) => (
            <div key={worker.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper/10 text-sm font-bold text-copper">
                  {worker.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{worker.name}</h3>
                      <span className="rounded-full border border-copper/30 bg-copper/10 px-2 py-0.5 text-[11px] font-medium text-copper">
                        {worker.role}
                      </span>
                    </div>
                    <span className="rounded-full bg-sage/10 px-2 py-0.5 text-[10px] font-medium text-sage">
                      {worker.specialty}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
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
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    <span>{worker.schedule}</span>
                    <span className="text-text-muted">|</span>
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
                    <span>{worker.phone}</span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <a
                      href={`tel:${worker.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-1 rounded-lg bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage/90"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                      Call
                    </a>
                    <a
                      href="#/messages/new"
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-warm-gray/20"
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Healthcare Providers */}
      <div>
        <h2 className="font-heading mb-2 text-lg font-semibold text-text-primary">
          Healthcare Providers
        </h2>
        <div className="space-y-3">
          {HEALTHCARE_PROVIDERS.map((provider) => (
            <div key={provider.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm-gray/30">
                  <svg
                    className="h-5 w-5 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    {provider.type === 'Primary Care Physician' && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    )}
                    {provider.type === 'Pharmacy' && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                      />
                    )}
                    {provider.type === 'Insurance' && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    )}
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-text-primary">{provider.name}</h3>
                  <p className="text-xs text-text-secondary">{provider.type}</p>
                  {provider.detail && (
                    <p className="text-[11px] text-text-muted">{provider.detail}</p>
                  )}
                  {provider.address && (
                    <p className="mt-1 text-[11px] text-text-muted">{provider.address}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <a
                      href={`tel:${provider.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-warm-gray/20"
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
                      {provider.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Contact Form */}
      <div>
        <h2 className="font-heading mb-2 text-lg font-semibold text-text-primary">Add Contact</h2>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-border bg-warm-gray/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(303) 555-0000"
                  className="w-full rounded-lg border border-border bg-warm-gray/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-border bg-warm-gray/10 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Relationship
                </label>
                <select
                  value={form.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="w-full rounded-lg border border-border bg-warm-gray/10 px-3 py-2 text-sm text-text-primary focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                >
                  <option value="">Select...</option>
                  <option value="spouse">Spouse</option>
                  <option value="daughter">Daughter</option>
                  <option value="son">Son</option>
                  <option value="sibling">Sibling</option>
                  <option value="grandchild">Grandchild</option>
                  <option value="friend">Friend</option>
                  <option value="neighbor">Neighbor</option>
                  <option value="physician">Physician</option>
                  <option value="specialist">Specialist</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="attorney">Attorney / POA</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">
                  Priority Level
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full rounded-lg border border-border bg-warm-gray/10 px-3 py-2 text-sm text-text-primary focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                >
                  <option value="">Select...</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="informational">Informational</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.name || !form.phone}
                className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Contact
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-xs font-medium text-sage">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Contact saved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Dial Section */}
      <div>
        <h2 className="font-heading mb-2 text-lg font-semibold text-text-primary">Quick Dial</h2>
        <p className="mb-2 text-xs text-text-muted">Tap to call — large buttons for mobile use</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PRIMARY_CONTACTS.map((contact) => (
            <a
              key={contact.id}
              href={`tel:${contact.phone.replace(/\D/g, '')}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-5 text-center transition-colors hover:border-sage hover:bg-sage/5 active:bg-sage/10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-lg font-bold text-white">
                {contact.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{contact.name}</p>
                <p className="text-[11px] text-text-muted">{contact.relationship}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                Call
              </div>
            </a>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        Emergency contacts are encrypted and stored in compliance with HIPAA. Only authorized care
        team members can view this information.
      </p>
    </div>
  );
}
