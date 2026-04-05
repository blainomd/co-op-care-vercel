/**
 * CaregiverOnboarding — Application flow for Care Neighbors
 *
 * Steps: Info → Experience → Availability → Background Check Consent → Review
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { track } from '../../lib/analytics';

type Step = 'info' | 'experience' | 'availability' | 'consent' | 'review' | 'submitted';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  yearsExperience: string;
  certifications: string[];
  specialties: string[];
  availability: string[];
  hoursPerWeek: string;
  whyCoopCare: string;
  bgCheckConsent: boolean;
}

const CERTIFICATIONS = ['CNA', 'HHA', 'CPR/First Aid', 'Yoga/Wellness', 'PT/OT', 'None'];
const SPECIALTIES = [
  'Companion Care',
  'Meal Prep',
  'Mobility Assistance',
  'Yoga/Stretching',
  'Transportation',
  'Light Housekeeping',
  'Medication Reminders',
];
const AVAILABILITY_OPTIONS = [
  'Weekday mornings',
  'Weekday afternoons',
  'Weekday evenings',
  'Weekends',
  'Flexible',
];

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
    >
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              i <= current ? 'bg-sage text-white' : 'bg-border text-text-muted'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-6 ${i < current ? 'bg-sage' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CaregiverOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    yearsExperience: '',
    certifications: [],
    specialties: [],
    availability: [],
    hoursPerWeek: '',
    whyCoopCare: '',
    bgCheckConsent: false,
  });

  const update = (partial: Partial<FormData>) => setForm((prev) => ({ ...prev, ...partial }));

  const toggleArray = (field: 'certifications' | 'specialties' | 'availability', value: string) => {
    const arr = form[field];
    update({ [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  };

  const stepIndex = ['info', 'experience', 'availability', 'consent', 'review'].indexOf(step);

  const handleSubmit = async () => {
    track('caregiver_apply');
    try {
      await fetch('/api/v1/worker/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
    } catch {
      // Offline fallback — save locally
      localStorage.setItem('coop_caregiver_application', JSON.stringify(form));
    }
    setStep('submitted');
  };

  if (step === 'submitted') {
    return (
      <PageLayout>
        <section className="px-6 py-24 text-center md:px-12">
          <div className="mx-auto max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
              <svg
                className="h-8 w-8 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 font-heading text-2xl font-bold text-navy">Application received</h1>
            <p className="mt-3 text-sm text-text-secondary">
              Welcome to the co-op.care community. We'll review your application and be in touch
              within 48 hours.
            </p>
            <button
              type="button"
              onClick={() => navigate('/card')}
              className="mt-6 rounded-full bg-sage px-6 py-3 text-sm font-semibold text-white hover:bg-sage-dark"
            >
              Talk to Sage
            </button>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="px-6 pb-20 pt-10 md:px-12 md:pt-16">
        <div className="mx-auto max-w-lg">
          <div className="text-center">
            <p className="text-sm font-medium text-sage">Become a Care Neighbor</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-navy">
              Apply to join co-op.care
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              $25-28/hr · W-2 benefits · Equity ownership
            </p>
          </div>

          <div className="mt-8">
            <StepIndicator
              current={stepIndex}
              steps={['Info', 'Experience', 'Schedule', 'Consent', 'Review']}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-white p-6">
            {step === 'info' && (
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-navy">Your information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="apply-first" className="block text-sm font-medium text-navy">
                      First name
                    </label>
                    <input
                      id="apply-first"
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => update({ firstName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="apply-last" className="block text-sm font-medium text-navy">
                      Last name
                    </label>
                    <input
                      id="apply-last"
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => update({ lastName: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="apply-email" className="block text-sm font-medium text-navy">
                    Email
                  </label>
                  <input
                    id="apply-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update({ email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <div>
                  <label htmlFor="apply-phone" className="block text-sm font-medium text-navy">
                    Phone
                  </label>
                  <input
                    id="apply-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <div>
                  <label htmlFor="apply-city" className="block text-sm font-medium text-navy">
                    City
                  </label>
                  <input
                    id="apply-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => update({ city: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <button
                  type="button"
                  disabled={!form.firstName || !form.email}
                  onClick={() => setStep('experience')}
                  className="w-full rounded-xl bg-sage py-3 text-sm font-bold text-white hover:bg-sage-dark disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 'experience' && (
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-navy">Your experience</h2>
                <div>
                  <label htmlFor="apply-years" className="block text-sm font-medium text-navy">
                    Years of caregiving experience
                  </label>
                  <select
                    id="apply-years"
                    value={form.yearsExperience}
                    onChange={(e) => update({ yearsExperience: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                  >
                    <option value="">Select...</option>
                    <option value="0">No formal experience</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
                <fieldset>
                  <legend className="text-sm font-medium text-navy">Certifications</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CERTIFICATIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArray('certifications', c)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${form.certifications.includes(c) ? 'bg-sage text-white' : 'border border-border text-text-secondary hover:border-sage'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="text-sm font-medium text-navy">Specialties</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SPECIALTIES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleArray('specialties', s)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${form.specialties.includes(s) ? 'bg-sage text-white' : 'border border-border text-text-secondary hover:border-sage'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-navy hover:bg-warm-gray/40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('availability')}
                    className="flex-1 rounded-xl bg-sage py-3 text-sm font-bold text-white hover:bg-sage-dark"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 'availability' && (
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-navy">Your schedule</h2>
                <fieldset>
                  <legend className="text-sm font-medium text-navy">When are you available?</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleArray('availability', a)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${form.availability.includes(a) ? 'bg-sage text-white' : 'border border-border text-text-secondary hover:border-sage'}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="apply-hours" className="block text-sm font-medium text-navy">
                    Hours per week
                  </label>
                  <select
                    id="apply-hours"
                    value={form.hoursPerWeek}
                    onChange={(e) => update({ hoursPerWeek: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                  >
                    <option value="">Select...</option>
                    <option value="5-10">5-10 hours</option>
                    <option value="10-20">10-20 hours</option>
                    <option value="20-30">20-30 hours</option>
                    <option value="30+">30+ hours (full time)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="apply-why" className="block text-sm font-medium text-navy">
                    Why co-op.care?
                  </label>
                  <textarea
                    id="apply-why"
                    rows={3}
                    value={form.whyCoopCare}
                    onChange={(e) => update({ whyCoopCare: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                    placeholder="Tell us what interests you about worker-owned care..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('experience')}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-navy hover:bg-warm-gray/40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('consent')}
                    className="flex-1 rounded-xl bg-sage py-3 text-sm font-bold text-white hover:bg-sage-dark"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 'consent' && (
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-navy">
                  Background check consent
                </h2>
                <p className="text-sm text-text-secondary">
                  For the safety of the families we serve, all Care Neighbors must consent to a
                  background check. This is conducted through our verified screening partner.
                </p>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:border-sage/30">
                  <input
                    type="checkbox"
                    checked={form.bgCheckConsent}
                    onChange={(e) => update({ bgCheckConsent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-sage"
                  />
                  <span className="text-sm text-text-primary">
                    I consent to a background check and understand that employment is contingent
                    upon satisfactory results.
                  </span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('availability')}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-navy hover:bg-warm-gray/40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!form.bgCheckConsent}
                    onClick={() => setStep('review')}
                    className="flex-1 rounded-xl bg-sage py-3 text-sm font-bold text-white hover:bg-sage-dark disabled:opacity-50"
                  >
                    Review
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-navy">
                  Review your application
                </h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong className="text-navy">Name:</strong> {form.firstName} {form.lastName}
                  </p>
                  <p>
                    <strong className="text-navy">Email:</strong> {form.email}
                  </p>
                  {form.phone && (
                    <p>
                      <strong className="text-navy">Phone:</strong> {form.phone}
                    </p>
                  )}
                  {form.city && (
                    <p>
                      <strong className="text-navy">City:</strong> {form.city}
                    </p>
                  )}
                  <p>
                    <strong className="text-navy">Experience:</strong>{' '}
                    {form.yearsExperience || 'Not specified'}
                  </p>
                  {form.certifications.length > 0 && (
                    <p>
                      <strong className="text-navy">Certifications:</strong>{' '}
                      {form.certifications.join(', ')}
                    </p>
                  )}
                  {form.specialties.length > 0 && (
                    <p>
                      <strong className="text-navy">Specialties:</strong>{' '}
                      {form.specialties.join(', ')}
                    </p>
                  )}
                  {form.availability.length > 0 && (
                    <p>
                      <strong className="text-navy">Availability:</strong>{' '}
                      {form.availability.join(', ')}
                    </p>
                  )}
                  {form.hoursPerWeek && (
                    <p>
                      <strong className="text-navy">Hours/week:</strong> {form.hoursPerWeek}
                    </p>
                  )}
                  <p>
                    <strong className="text-navy">Background check:</strong> Consented
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('consent')}
                    className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-navy hover:bg-warm-gray/40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 rounded-xl bg-sage py-3 text-sm font-bold text-white hover:bg-sage-dark"
                  >
                    Submit application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
