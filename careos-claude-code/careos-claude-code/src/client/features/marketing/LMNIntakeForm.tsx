import { useState } from 'react';
import { coopCare, fontLinks, company } from './design-tokens';

// ─── Types ──────────────────────────────────────────────────

interface Condition {
  id: string;
  label: string;
  icd10: string;
}

interface Service {
  id: string;
  label: string;
  category: 'Movement' | 'Wellness' | 'Community';
}

interface LMNFormState {
  // Patient
  patientFirst: string;
  patientLast: string;
  patientDOB: string;
  patientPhone: string;
  patientEmail: string;
  // Conductor (family caregiver)
  conductorFirst: string;
  conductorLast: string;
  conductorRelation: string;
  conductorEmail: string;
  // Clinical
  conditions: string[];
  services: string[];
  duration: string;
  frequency: string;
  clinicalNotes: string;
  // Payment
  paymentProcessing: boolean;
  paymentComplete: boolean;
}

interface StatusItem {
  label: string;
  status: 'complete' | 'pending' | 'upcoming';
}

// ─── Data ───────────────────────────────────────────────────

const CONDITIONS: Condition[] = [
  { id: 'chronic_pain', label: 'Chronic Musculoskeletal Pain', icd10: 'M79.3' },
  { id: 'osteoarthritis', label: 'Osteoarthritis', icd10: 'M19.90' },
  { id: 'low_back', label: 'Chronic Low Back Pain', icd10: 'M54.5' },
  { id: 'fall_risk', label: 'Fall Risk / Balance Disorder', icd10: 'R29.6' },
  { id: 'deconditioning', label: 'Physical Deconditioning', icd10: 'Z72.3' },
  { id: 'obesity', label: 'Obesity (BMI >= 30)', icd10: 'E66.01' },
  { id: 'hypertension', label: 'Hypertension', icd10: 'I10' },
  { id: 'diabetes_prev', label: 'Prediabetes / Type 2 Diabetes', icd10: 'R73.03 / E11' },
  { id: 'depression', label: 'Depression', icd10: 'F32.9' },
  { id: 'anxiety', label: 'Anxiety', icd10: 'F41.9' },
  { id: 'caregiver_burden', label: 'Caregiver Burnout / Stress', icd10: 'Z73.0' },
];

const SERVICES: Service[] = [
  { id: 'yoga', label: 'Therapeutic Yoga', category: 'Movement' },
  { id: 'tai_chi', label: 'Tai Chi / Balance Training', category: 'Movement' },
  { id: 'aquatic', label: 'Aquatic Therapy', category: 'Movement' },
  { id: 'strength', label: 'Strength & Conditioning', category: 'Movement' },
  { id: 'nutrition', label: 'Nutrition Counseling', category: 'Wellness' },
  { id: 'meditation', label: 'Mindfulness / Meditation', category: 'Wellness' },
  { id: 'massage', label: 'Therapeutic Massage', category: 'Wellness' },
  { id: 'acupuncture', label: 'Acupuncture', category: 'Wellness' },
  { id: 'senior_fitness', label: 'Senior Fitness Program', category: 'Community' },
  { id: 'social_program', label: 'Social Engagement Program', category: 'Community' },
  { id: 'caregiver_respite', label: 'Caregiver Respite Services', category: 'Community' },
];

const DURATION_OPTIONS = ['3 months', '6 months', '12 months'] as const;
const FREQUENCY_OPTIONS = ['1x/week', '2x/week', '3x/week', 'As needed'] as const;

const SERVICE_CATEGORIES: Service['category'][] = ['Movement', 'Wellness', 'Community'];

// ─── Component ──────────────────────────────────────────────

export function LMNIntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LMNFormState>({
    patientFirst: '',
    patientLast: '',
    patientDOB: '',
    patientPhone: '',
    patientEmail: '',
    conductorFirst: '',
    conductorLast: '',
    conductorRelation: '',
    conductorEmail: '',
    conditions: [],
    services: [],
    duration: '6 months',
    frequency: '2x/week',
    clinicalNotes: '',
    paymentProcessing: false,
    paymentComplete: false,
  });

  const update = <K extends keyof LMNFormState>(field: K, value: LMNFormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleItem = (field: 'conditions' | 'services', item: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  const selectedConditions = CONDITIONS.filter((c) => form.conditions.includes(c.id));
  const selectedServices = SERVICES.filter((s) => form.services.includes(s.id));
  const totalSteps = 5;

  const handlePayment = () => {
    update('paymentProcessing', true);
    // In production: call Stripe Checkout API
    // const stripe = await loadStripe('pk_live_...');
    // const session = await fetch('/api/create-checkout-session', { method: 'POST', body: JSON.stringify({ price: 'price_lmn_199', ... }) });
    // stripe.redirectToCheckout({ sessionId: session.id });
    setTimeout(() => {
      update('paymentProcessing', false);
      update('paymentComplete', true);
      setStep(4);
    }, 2000);
  };

  const C = {
    teal: coopCare.teal,
    navy: coopCare.navy,
    warm: coopCare.accent,
    coral: coopCare.coral,
    bg: coopCare.bg,
    card: coopCare.card,
    border: coopCare.border,
    text: coopCare.text,
    muted: coopCare.muted,
    light: coopCare.light,
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'DM Sans', sans-serif",
      color: C.text,
      padding: '24px 16px',
    } as React.CSSProperties,
    container: { maxWidth: '680px', margin: '0 auto' } as React.CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px',
    } as React.CSSProperties,
    logoMark: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: `linear-gradient(135deg, ${C.teal}, ${coopCare.tealDark})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '800',
      color: 'white',
      boxShadow: `0 4px 16px ${C.teal}40`,
    } as React.CSSProperties,
    title: {
      fontSize: '22px',
      fontWeight: '800',
      color: C.navy,
      letterSpacing: '-0.5px',
    } as React.CSSProperties,
    subtitle: {
      fontSize: '13px',
      color: C.muted,
      marginBottom: '28px',
    } as React.CSSProperties,
    progress: {
      display: 'flex',
      gap: '4px',
      marginBottom: '32px',
    } as React.CSSProperties,
    progressBar: (active: boolean, done: boolean): React.CSSProperties => ({
      flex: 1,
      height: '4px',
      borderRadius: '2px',
      background: done
        ? C.teal
        : active
          ? `linear-gradient(90deg, ${C.teal}, ${C.teal}60)`
          : '#e0e0e0',
      transition: 'all 0.4s ease',
    }),
    card: {
      background: C.card,
      borderRadius: '20px',
      border: `1px solid ${C.border}`,
      padding: '36px 32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '800',
      color: C.navy,
      marginBottom: '6px',
      letterSpacing: '-0.5px',
    } as React.CSSProperties,
    sectionDesc: {
      fontSize: '14px',
      color: C.muted,
      marginBottom: '28px',
      lineHeight: '1.6',
    } as React.CSSProperties,
    fieldGroup: { marginBottom: '18px' } as React.CSSProperties,
    label: {
      fontSize: '11px',
      fontWeight: '700',
      color: C.muted,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      marginBottom: '6px',
      display: 'block',
    } as React.CSSProperties,
    input: {
      width: '100%',
      padding: '13px 16px',
      background: C.light,
      border: `1px solid ${C.border}`,
      borderRadius: '12px',
      color: C.text,
      fontSize: '15px',
      outline: 'none',
      boxSizing: 'border-box' as const,
      transition: 'border-color 0.2s',
    } as React.CSSProperties,
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    } as React.CSSProperties,
    chip: (selected: boolean): React.CSSProperties => ({
      padding: '10px 14px',
      background: selected ? `${C.teal}12` : C.light,
      border: `1.5px solid ${selected ? C.teal : C.border}`,
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: selected ? '600' : '400',
      color: selected ? C.teal : C.text,
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }),
    chipCode: {
      fontSize: '10px',
      color: C.muted,
      fontFamily: 'monospace',
      background: 'rgba(0,0,0,0.04)',
      padding: '2px 6px',
      borderRadius: '4px',
    } as React.CSSProperties,
    categoryLabel: {
      fontSize: '11px',
      fontWeight: '700',
      color: C.warm,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      marginTop: '20px',
      marginBottom: '10px',
    } as React.CSSProperties,
    toggle: (active: boolean): React.CSSProperties => ({
      padding: '10px 20px',
      background: active ? `${C.teal}12` : C.light,
      border: `1.5px solid ${active ? C.teal : C.border}`,
      borderRadius: '10px',
      cursor: 'pointer',
      color: active ? C.teal : C.muted,
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.15s',
    }),
    textarea: {
      width: '100%',
      padding: '14px 16px',
      background: C.light,
      border: `1px solid ${C.border}`,
      borderRadius: '12px',
      color: C.text,
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box' as const,
      minHeight: '100px',
      resize: 'vertical' as const,
      fontFamily: "'DM Sans', sans-serif",
      lineHeight: '1.6',
    } as React.CSSProperties,
    previewBox: {
      background: C.light,
      borderRadius: '16px',
      padding: '28px',
      border: `1px solid ${C.border}`,
      marginBottom: '20px',
    } as React.CSSProperties,
    previewSection: {
      paddingBottom: '14px',
      marginBottom: '14px',
      borderBottom: `1px solid ${C.border}`,
    } as React.CSSProperties,
    previewLabel: {
      fontSize: '10px',
      fontWeight: '700',
      color: C.muted,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
    } as React.CSSProperties,
    previewValue: {
      fontSize: '14px',
      color: C.text,
      fontWeight: '500',
      marginTop: '4px',
    } as React.CSSProperties,
    priceBox: {
      background: `linear-gradient(135deg, ${C.navy}, #1a3a55)`,
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      textAlign: 'center' as const,
      marginBottom: '20px',
    } as React.CSSProperties,
    priceAmount: {
      fontSize: '48px',
      fontWeight: '800',
      letterSpacing: '-2px',
    } as React.CSSProperties,
    priceLabel: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.6)',
      marginTop: '4px',
    } as React.CSSProperties,
    btnRow: {
      display: 'flex',
      gap: '12px',
      marginTop: '28px',
    } as React.CSSProperties,
    btnPrimary: {
      flex: 1,
      padding: '16px',
      background: `linear-gradient(135deg, ${C.teal}, ${coopCare.tealDark})`,
      border: 'none',
      borderRadius: '14px',
      color: 'white',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: `0 4px 16px ${C.teal}40`,
      transition: 'all 0.2s',
    } as React.CSSProperties,
    btnSecondary: {
      padding: '16px 24px',
      background: C.light,
      border: `1px solid ${C.border}`,
      borderRadius: '14px',
      color: C.muted,
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
    } as React.CSSProperties,
    successCard: {
      textAlign: 'center' as const,
      padding: '48px 32px',
    } as React.CSSProperties,
    successIcon: {
      width: '80px',
      height: '80px',
      background: `linear-gradient(135deg, ${C.teal}, ${coopCare.tealDark})`,
      borderRadius: '50%',
      margin: '0 auto 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '36px',
      color: 'white',
      boxShadow: `0 8px 32px ${C.teal}40`,
    } as React.CSSProperties,
    stripeBtn: (processing: boolean): React.CSSProperties => ({
      width: '100%',
      padding: '18px',
      background: processing ? '#6772e5' : 'linear-gradient(135deg, #6772e5, #5469d4)',
      border: 'none',
      borderRadius: '14px',
      color: 'white',
      fontSize: '16px',
      fontWeight: '700',
      cursor: processing ? 'wait' : 'pointer',
      boxShadow: '0 4px 16px rgba(103, 114, 229, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.2s',
      opacity: processing ? 0.8 : 1,
    }),
    stripeLogo: { fontSize: '12px', opacity: 0.7 } as React.CSSProperties,
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '600',
    } as React.CSSProperties,
  };

  /** SVG checkmark icon used in place of emoji checkmarks */
  const CheckIcon = ({ size = 12, color = 'white' }: { size?: number; color?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8.5L6.5 12L13 4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  /** SVG clock icon for pending status */
  const ClockIcon = ({ size = 12, color = 'white' }: { size?: number; color?: string }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="2" />
      <path d="M8 5V8.5L10.5 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <div style={s.sectionTitle}>Patient & Caregiver Info</div>
            <div style={s.sectionDesc}>
              Enter the care recipient's information and their primary family caregiver (Conductor).
            </div>
            <div style={{ ...s.label, color: C.warm, fontSize: '12px', marginBottom: '14px' }}>
              Care Recipient
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>First Name</label>
                <input
                  style={s.input}
                  value={form.patientFirst}
                  onChange={(e) => update('patientFirst', e.target.value)}
                  placeholder="Margaret"
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Last Name</label>
                <input
                  style={s.input}
                  value={form.patientLast}
                  onChange={(e) => update('patientLast', e.target.value)}
                  placeholder="Johnson"
                />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Date of Birth</label>
                <input
                  style={s.input}
                  type="date"
                  value={form.patientDOB}
                  onChange={(e) => update('patientDOB', e.target.value)}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Phone</label>
                <input
                  style={s.input}
                  value={form.patientPhone}
                  onChange={(e) => update('patientPhone', e.target.value)}
                  placeholder="(303) 555-0100"
                />
              </div>
            </div>
            <div
              style={{
                ...s.label,
                color: C.warm,
                fontSize: '12px',
                marginBottom: '14px',
                marginTop: '24px',
              }}
            >
              Family Conductor
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>First Name</label>
                <input
                  style={s.input}
                  value={form.conductorFirst}
                  onChange={(e) => update('conductorFirst', e.target.value)}
                  placeholder="Sarah"
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Last Name</label>
                <input
                  style={s.input}
                  value={form.conductorLast}
                  onChange={(e) => update('conductorLast', e.target.value)}
                  placeholder="Johnson"
                />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Relationship</label>
                <input
                  style={s.input}
                  value={form.conductorRelation}
                  onChange={(e) => update('conductorRelation', e.target.value)}
                  placeholder="Daughter"
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Email</label>
                <input
                  style={s.input}
                  value={form.conductorEmail}
                  onChange={(e) => update('conductorEmail', e.target.value)}
                  placeholder="sarah@email.com"
                />
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div style={s.sectionTitle}>Clinical Conditions</div>
            <div style={s.sectionDesc}>
              Select all qualifying conditions that support medical necessity for community wellness
              services.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CONDITIONS.map((c) => (
                <div
                  key={c.id}
                  style={s.chip(form.conditions.includes(c.id))}
                  onClick={() => toggleItem('conditions', c.id)}
                >
                  <span style={{ flex: 1 }}>{c.label}</span>
                  <span style={s.chipCode}>{c.icd10}</span>
                </div>
              ))}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div style={s.sectionTitle}>Recommended Services</div>
            <div style={s.sectionDesc}>
              Select community wellness services medically necessary for the patient's conditions.
              These become HSA/FSA eligible with the LMN.
            </div>
            {SERVICE_CATEGORIES.map((cat) => (
              <div key={cat}>
                <div style={s.categoryLabel}>{cat}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {SERVICES.filter((sv) => sv.category === cat).map((sv) => (
                    <div
                      key={sv.id}
                      style={s.chip(form.services.includes(sv.id))}
                      onClick={() => toggleItem('services', sv.id)}
                    >
                      {sv.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginTop: '24px' }}>
              <div style={s.label}>Duration</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {DURATION_OPTIONS.map((d) => (
                  <span
                    key={d}
                    style={s.toggle(form.duration === d)}
                    onClick={() => update('duration', d)}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={s.label}>Frequency</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {FREQUENCY_OPTIONS.map((f) => (
                  <span
                    key={f}
                    style={s.toggle(form.frequency === f)}
                    onClick={() => update('frequency', f)}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ ...s.fieldGroup, marginTop: '20px' }}>
              <label style={s.label}>Clinical Notes (optional)</label>
              <textarea
                style={s.textarea}
                value={form.clinicalNotes}
                onChange={(e) => update('clinicalNotes', e.target.value)}
                placeholder="Additional clinical justification, functional limitations, treatment goals..."
              />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div style={s.sectionTitle}>Review & Pay</div>
            <div style={s.sectionDesc}>
              Your LMN will be reviewed and signed by Medical Director{' '}
              {company.medicalDirector.name} via ClinicalSwipe within 24 hours.
            </div>
            <div style={s.previewBox}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: C.navy,
                  marginBottom: '16px',
                }}
              >
                Letter of Medical Necessity Preview
              </div>
              <div style={s.previewSection}>
                <div style={s.previewLabel}>Patient</div>
                <div style={s.previewValue}>
                  {form.patientFirst} {form.patientLast}{' '}
                  {form.patientDOB ? `-- DOB ${form.patientDOB}` : ''}
                </div>
              </div>
              <div style={s.previewSection}>
                <div style={s.previewLabel}>Conductor</div>
                <div style={s.previewValue}>
                  {form.conductorFirst} {form.conductorLast} ({form.conductorRelation})
                </div>
              </div>
              <div style={s.previewSection}>
                <div style={s.previewLabel}>Conditions ({selectedConditions.length})</div>
                <div style={s.previewValue}>
                  {selectedConditions.map((c) => c.label).join(' -- ') || 'None selected'}
                </div>
              </div>
              <div style={s.previewSection}>
                <div style={s.previewLabel}>Services ({selectedServices.length})</div>
                <div style={s.previewValue}>
                  {selectedServices.map((sv) => sv.label).join(' -- ') || 'None selected'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <div style={s.previewLabel}>Duration</div>
                  <div style={s.previewValue}>{form.duration}</div>
                </div>
                <div>
                  <div style={s.previewLabel}>Frequency</div>
                  <div style={s.previewValue}>{form.frequency}</div>
                </div>
              </div>
            </div>

            <div style={s.priceBox}>
              <div style={s.priceAmount}>$199</div>
              <div style={s.priceLabel}>
                One-time LMN generation fee -- Signed by Medical Director within 24 hours
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '12px',
                  marginTop: '16px',
                }}
              >
                <span
                  style={{
                    ...s.badge,
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  <CheckIcon size={10} color="rgba(255,255,255,0.8)" /> HSA/FSA eligible
                </span>
                <span
                  style={{
                    ...s.badge,
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  <CheckIcon size={10} color="rgba(255,255,255,0.8)" /> Valid 12 months
                </span>
              </div>
            </div>

            <button
              style={s.stripeBtn(form.paymentProcessing)}
              onClick={handlePayment}
              disabled={form.paymentProcessing}
            >
              {form.paymentProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                  </svg>
                  Pay $199 with Stripe
                </>
              )}
            </button>
            <div
              style={{
                textAlign: 'center',
                marginTop: '12px',
                fontSize: '12px',
                color: C.muted,
              }}
            >
              Secure payment powered by Stripe -- 256-bit encryption
            </div>
          </>
        );
      case 4: {
        const statusItems: StatusItem[] = [
          { label: 'Payment confirmed', status: 'complete' },
          { label: 'LMN queued for ClinicalSwipe review', status: 'complete' },
          { label: 'Medical Director review (within 24 hrs)', status: 'pending' },
          { label: 'Signed PDF emailed to Conductor', status: 'upcoming' },
          { label: 'HSA/FSA claims eligible', status: 'upcoming' },
        ];
        return (
          <div style={s.successCard}>
            <div style={s.successIcon}>
              <CheckIcon size={36} />
            </div>
            <div style={{ ...s.sectionTitle, textAlign: 'center' }}>LMN Submitted</div>
            <div
              style={{
                fontSize: '15px',
                color: C.muted,
                lineHeight: '1.7',
                marginBottom: '24px',
              }}
            >
              Your Letter of Medical Necessity has been submitted for review by Medical Director{' '}
              {company.medicalDirector.name}. You'll receive a signed PDF via email within 24 hours.
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left',
                maxWidth: '380px',
                margin: '0 auto',
              }}
            >
              {statusItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    background: C.light,
                    borderRadius: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background:
                        item.status === 'complete'
                          ? C.teal
                          : item.status === 'pending'
                            ? C.warm
                            : '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'white',
                      fontWeight: '700',
                    }}
                  >
                    {item.status === 'complete' ? (
                      <CheckIcon size={12} />
                    ) : item.status === 'pending' ? (
                      <ClockIcon size={12} />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: item.status === 'upcoming' ? C.muted : C.text,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '28px',
                padding: '16px',
                background: `${C.teal}08`,
                borderRadius: '12px',
                border: `1px solid ${C.teal}20`,
              }}
            >
              <div style={{ fontSize: '13px', color: C.text, lineHeight: '1.6' }}>
                <strong>What happens next:</strong> Once signed, present this LMN to your HSA/FSA
                administrator along with receipts from the approved community wellness services. The
                LMN makes these services eligible for tax-advantaged reimbursement.
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div style={s.page}>
      <link href={fontLinks.dmSans} rel="stylesheet" />
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.logoMark}>co</div>
          <div>
            <div style={s.title}>Letter of Medical Necessity</div>
          </div>
        </div>
        <div style={s.subtitle}>Unlock HSA/FSA eligibility for community wellness services</div>

        {step < 4 && (
          <div style={s.progress}>
            {Array.from({ length: totalSteps - 1 }).map((_, i) => (
              <div key={i} style={s.progressBar(i === step, i < step)} />
            ))}
          </div>
        )}

        <div style={s.card}>
          {renderStep()}
          {step < 3 && (
            <div style={s.btnRow}>
              {step > 0 && (
                <button style={s.btnSecondary} onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              <button style={s.btnPrimary} onClick={() => setStep(step + 1)}>
                Continue
              </button>
            </div>
          )}
          {step === 3 && (
            <div style={s.btnRow}>
              <button style={s.btnSecondary} onClick={() => setStep(step - 1)}>
                Back
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '12px',
            color: C.muted,
          }}
        >
          Medical Director: {company.medicalDirector.name} -- NPI {company.medicalDirector.npi} --
          co-op.care
        </div>
      </div>
    </div>
  );
}
