/**
 * LMN Public Request Page — Direct-to-consumer, no auth required
 *
 * Mobile-first form: family/patient fills out care needs assessment,
 * pays $199 via Stripe, physician reviews and signs within 24-48 hours.
 *
 * Entry points:
 *   1. SMS link from provider (text message with URL)
 *   2. Google search ("HSA home care letter of medical necessity")
 *   3. Direct link from co-op.care marketing
 *
 * No registration, no app download. Just a form in a browser.
 */
import { useState } from 'react';

type Step = 'intro' | 'patient' | 'needs' | 'services' | 'payment' | 'confirmation';

interface FormData {
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  relationshipToPatient: string;
  patientName: string;
  patientDOB: string;
  primaryConditions: string[];
  functionalLimitations: string[];
  currentCareDescription: string;
  servicesRequested: string[];
  otherServiceDescription: string;
  hsaFsaProvider: string;
  estimatedAnnualCost: string;
  consentToReview: boolean;
}

const FUNCTIONAL_LIMITATIONS = [
  { id: 'bathing', label: 'Bathing / Showering' },
  { id: 'dressing', label: 'Getting Dressed' },
  { id: 'meal_prep', label: 'Preparing Meals' },
  { id: 'medication_management', label: 'Managing Medications' },
  { id: 'mobility', label: 'Walking / Getting Around' },
  { id: 'toileting', label: 'Using the Bathroom' },
  { id: 'transfers', label: 'Getting In/Out of Bed or Chair' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'transportation', label: 'Getting to Appointments' },
  { id: 'companionship', label: 'Being Alone Safely' },
];

const SERVICES = [
  { id: 'companion_care', label: 'Companion Care (someone to be there)' },
  { id: 'personal_care', label: 'Personal Care (bathing, dressing, grooming)' },
  { id: 'respite_care', label: 'Respite Care (give family a break)' },
  { id: 'dementia_care', label: 'Dementia / Memory Care' },
  { id: 'fall_prevention', label: 'Fall Prevention' },
  { id: 'medication_reminders', label: 'Medication Reminders' },
  { id: 'meal_preparation', label: 'Meal Preparation' },
  { id: 'transportation', label: 'Transportation to Appointments' },
  { id: 'exercise_program', label: 'Exercise / Physical Activity Program' },
  { id: 'wellness_membership', label: 'Gym / Wellness Membership' },
  { id: 'home_modification', label: 'Home Safety Modifications' },
  { id: 'other', label: 'Other (describe below)' },
];

const COMMON_CONDITIONS = [
  "Dementia / Alzheimer's",
  'Mobility limitation',
  'Fall risk / history of falls',
  'Chronic pain',
  'Heart disease',
  'Diabetes',
  'COPD / breathing difficulty',
  'Arthritis',
  'Depression / anxiety',
  'Post-surgery recovery',
  "Parkinson's disease",
  'Stroke recovery',
  'Vision impairment',
  'Hearing impairment',
];

export default function LMNPublicRequest() {
  const [step, setStep] = useState<Step>('intro');
  const [form, setForm] = useState<FormData>({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    relationshipToPatient: '',
    patientName: '',
    patientDOB: '',
    primaryConditions: [],
    functionalLimitations: [],
    currentCareDescription: '',
    servicesRequested: [],
    otherServiceDescription: '',
    hsaFsaProvider: '',
    estimatedAnnualCost: '',
    consentToReview: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [lmnId, setLmnId] = useState<string | null>(null);

  const update = (field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArray = (
    field: 'primaryConditions' | 'functionalLimitations' | 'servicesRequested',
    value: string,
  ) => {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const savingsEstimate = form.estimatedAnnualCost
    ? Math.round(Number(form.estimatedAnnualCost) * 0.32)
    : null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Check if returning from successful Stripe checkout
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (sessionId) {
        // Returning from Stripe — submit the LMN request with payment proof
        const response = await fetch('/api/lmn/public-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            estimatedAnnualCost: form.estimatedAnnualCost
              ? Number(form.estimatedAnnualCost)
              : undefined,
            consentToReview: true,
            stripePaymentIntentId: sessionId,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setLmnId(data.lmnId);
          setStep('confirmation');
        }
      } else {
        // First time — redirect to Stripe Checkout
        const response = await fetch('/api/lmn/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.requesterEmail,
            patientName: form.patientName,
          }),
        });
        const data = await response.json();
        if (data.checkoutUrl) {
          // Save form data to sessionStorage before redirecting
          sessionStorage.setItem('lmn_form_data', JSON.stringify(form));
          window.location.href = data.checkoutUrl;
        }
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  // On mount: check if returning from Stripe with saved form data
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const saved = sessionStorage.getItem('lmn_form_data');
      if (saved) {
        const savedForm = JSON.parse(saved) as FormData;
        setForm(savedForm);
        setStep('payment');
        // Auto-submit with the session_id
        setTimeout(() => handleSubmit(), 500);
        sessionStorage.removeItem('lmn_form_data');
      }
    }
  });

  // Shared styles
  const pageStyle: React.CSSProperties = {
    maxWidth: 480,
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: '"DM Sans", -apple-system, sans-serif',
    color: '#1B3A5C',
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    marginBottom: 16,
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: '"Literata", Georgia, serif',
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
    color: '#1B3A5C',
  };

  const subStyle: React.CSSProperties = {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    lineHeight: 1.5,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 16,
    marginBottom: 12,
    fontFamily: '"DM Sans", sans-serif',
    boxSizing: 'border-box',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 24px',
    borderRadius: 12,
    border: 'none',
    fontSize: 17,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: '"DM Sans", sans-serif',
  };

  const primaryBtn: React.CSSProperties = {
    ...btnStyle,
    background: '#4F7A5E',
    color: '#fff',
  };

  const chipStyle = (selected: boolean): React.CSSProperties => ({
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: 20,
    border: selected ? '2px solid #4F7A5E' : '1px solid #ddd',
    background: selected ? '#E8F0EB' : '#fff',
    color: selected ? '#4F7A5E' : '#333',
    fontSize: 14,
    fontWeight: selected ? 600 : 400,
    cursor: 'pointer',
    margin: '4px 4px',
    transition: 'all 0.15s',
  });

  // ── INTRO ──────────────────────────────────────
  if (step === 'intro') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>&#x1f3e0;</div>
            <h1 style={{ ...headingStyle, fontSize: 28 }}>Save on Home Care with Your HSA</h1>
          </div>
          <p style={subStyle}>
            A Letter of Medical Necessity from a licensed physician lets you pay for home care,
            companion care, and wellness expenses with your HSA or FSA — saving you 28-36% in taxes.
          </p>
          <div style={{ background: '#F0F7F2', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>How it works:</div>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              1. Tell us about the care needs (5 minutes)
              <br />
              2. Pay $199 (one-time fee)
              <br />
              3. A licensed physician reviews and signs your letter
              <br />
              4. Receive your signed LMN via email within 24-48 hours
              <br />
              5. Submit to your HSA/FSA provider and start saving
            </div>
          </div>
          <div style={{ background: '#FFF8E8', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: '#B07A4F' }}>Example savings:</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              $5,000/year in care expenses = $1,400-$1,800 saved in taxes
            </div>
          </div>
          <button style={primaryBtn} onClick={() => setStep('patient')}>
            Get Started — $199
          </button>
          <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 12 }}>
            No account needed. No app to download. Physician review included.
          </p>
        </div>
      </div>
    );
  }

  // ── PATIENT INFO ───────────────────────────────
  if (step === 'patient') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={headingStyle}>Who needs care?</h2>
          <p style={subStyle}>Tell us about yourself and the person receiving care.</p>

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>Your Name</label>
          <input
            style={inputStyle}
            value={form.requesterName}
            onChange={(e) => update('requesterName', e.target.value)}
            placeholder="Your full name"
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>Your Email</label>
          <input
            style={inputStyle}
            type="email"
            value={form.requesterEmail}
            onChange={(e) => update('requesterEmail', e.target.value)}
            placeholder="Where we'll send the signed letter"
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>
            Your Phone (optional)
          </label>
          <input
            style={inputStyle}
            type="tel"
            value={form.requesterPhone}
            onChange={(e) => update('requesterPhone', e.target.value)}
            placeholder="For delivery confirmation"
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>Your Relationship</label>
          <select
            style={inputStyle}
            value={form.relationshipToPatient}
            onChange={(e) => update('relationshipToPatient', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="self">This is for me</option>
            <option value="parent">My parent</option>
            <option value="spouse">My spouse</option>
            <option value="child">My child</option>
            <option value="sibling">My sibling</option>
            <option value="caregiver">I'm their caregiver</option>
            <option value="other">Other</option>
          </select>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>Patient Name</label>
          <input
            style={inputStyle}
            value={form.patientName}
            onChange={(e) => update('patientName', e.target.value)}
            placeholder="Person receiving care"
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>
            Patient Date of Birth
          </label>
          <input
            style={inputStyle}
            type="date"
            value={form.patientDOB}
            onChange={(e) => update('patientDOB', e.target.value)}
          />

          <button
            style={{
              ...primaryBtn,
              marginTop: 16,
              opacity:
                form.requesterName &&
                form.requesterEmail &&
                form.patientName &&
                form.patientDOB &&
                form.relationshipToPatient
                  ? 1
                  : 0.5,
            }}
            disabled={
              !form.requesterName ||
              !form.requesterEmail ||
              !form.patientName ||
              !form.patientDOB ||
              !form.relationshipToPatient
            }
            onClick={() => setStep('needs')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── CARE NEEDS ─────────────────────────────────
  if (step === 'needs') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={headingStyle}>What are the care needs?</h2>
          <p style={subStyle}>
            Select all that apply. This helps our physician write an accurate letter.
          </p>

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#666',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Conditions
          </label>
          <div style={{ marginBottom: 20 }}>
            {COMMON_CONDITIONS.map((c) => (
              <span
                key={c}
                style={chipStyle(form.primaryConditions.includes(c))}
                onClick={() => toggleArray('primaryConditions', c)}
              >
                {c}
              </span>
            ))}
          </div>

          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#666',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Difficulty with daily activities
          </label>
          <div style={{ marginBottom: 20 }}>
            {FUNCTIONAL_LIMITATIONS.map((fl) => (
              <span
                key={fl.id}
                style={chipStyle(form.functionalLimitations.includes(fl.id))}
                onClick={() => toggleArray('functionalLimitations', fl.id)}
              >
                {fl.label}
              </span>
            ))}
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>
            Anything else we should know? (optional)
          </label>
          <textarea
            style={{ ...inputStyle, height: 80, resize: 'vertical' }}
            value={form.currentCareDescription}
            onChange={(e) => update('currentCareDescription', e.target.value)}
            placeholder="Current care situation, recent hospitalizations, concerns..."
          />

          <button
            style={{
              ...primaryBtn,
              marginTop: 8,
              opacity:
                form.primaryConditions.length > 0 && form.functionalLimitations.length > 0
                  ? 1
                  : 0.5,
            }}
            disabled={
              form.primaryConditions.length === 0 || form.functionalLimitations.length === 0
            }
            onClick={() => setStep('services')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── SERVICES ───────────────────────────────────
  if (step === 'services') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={headingStyle}>What services do you need?</h2>
          <p style={subStyle}>Select the services you want covered by your HSA/FSA.</p>

          <div style={{ marginBottom: 20 }}>
            {SERVICES.map((s) => (
              <span
                key={s.id}
                style={chipStyle(form.servicesRequested.includes(s.id))}
                onClick={() => toggleArray('servicesRequested', s.id)}
              >
                {s.label}
              </span>
            ))}
          </div>

          {form.servicesRequested.includes('other') && (
            <textarea
              style={{ ...inputStyle, height: 60 }}
              value={form.otherServiceDescription}
              onChange={(e) => update('otherServiceDescription', e.target.value)}
              placeholder="Describe the other services you need..."
            />
          )}

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>
            HSA/FSA Provider (optional)
          </label>
          <input
            style={inputStyle}
            value={form.hsaFsaProvider}
            onChange={(e) => update('hsaFsaProvider', e.target.value)}
            placeholder="e.g. Fidelity, HealthEquity, Optum Bank"
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>
            Estimated Annual Care Cost (optional)
          </label>
          <input
            style={inputStyle}
            type="number"
            value={form.estimatedAnnualCost}
            onChange={(e) => update('estimatedAnnualCost', e.target.value)}
            placeholder="$"
          />

          {savingsEstimate && (
            <div
              style={{
                background: '#F0F7F2',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              Estimated tax savings with LMN:{' '}
              <strong>${savingsEstimate.toLocaleString()}/year</strong>
            </div>
          )}

          <button
            style={{
              ...primaryBtn,
              marginTop: 8,
              opacity: form.servicesRequested.length > 0 ? 1 : 0.5,
            }}
            disabled={form.servicesRequested.length === 0}
            onClick={() => setStep('payment')}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    );
  }

  // ── PAYMENT ────────────────────────────────────
  if (step === 'payment') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={headingStyle}>Review & Pay</h2>

          <div
            style={{
              background: '#F8F9FA',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            <div>
              <strong>Patient:</strong> {form.patientName}
            </div>
            <div>
              <strong>Conditions:</strong> {form.primaryConditions.join(', ')}
            </div>
            <div>
              <strong>Services:</strong> {form.servicesRequested.length} selected
            </div>
            <div>
              <strong>Delivery:</strong> {form.requesterEmail}
            </div>
          </div>

          <div
            style={{
              borderRadius: 12,
              border: '2px solid #4F7A5E',
              padding: 20,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 700, color: '#4F7A5E' }}>$199</div>
            <div style={{ fontSize: 14, color: '#666' }}>
              One-time fee. Letter valid for 12 months.
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={form.consentToReview}
                onChange={(e) => update('consentToReview', e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                I consent to having a licensed physician review these care needs and issue a Letter
                of Medical Necessity. I understand this letter is for HSA/FSA eligibility purposes.
              </span>
            </label>
          </div>

          <button
            style={{ ...primaryBtn, opacity: form.consentToReview ? 1 : 0.5 }}
            disabled={!form.consentToReview || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Processing...' : 'Pay $199 & Submit'}
          </button>

          <p style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 12 }}>
            Secure payment via Stripe. Your card details never touch our servers.
          </p>
        </div>
      </div>
    );
  }

  // ── CONFIRMATION ───────────────────────────────
  if (step === 'confirmation') {
    return (
      <div style={pageStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#x2705;</div>
          <h2 style={{ ...headingStyle, color: '#4F7A5E' }}>Request Received</h2>
          <p style={subStyle}>
            Your Letter of Medical Necessity request has been submitted. A licensed physician will
            review your care needs and sign the letter within 24-48 hours.
          </p>
          <div style={{ background: '#F0F7F2', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 14 }}>
              <strong>Confirmation:</strong> {lmnId}
              <br />
              <strong>Delivery to:</strong> {form.requesterEmail}
              <br />
              <strong>Expected:</strong> Within 24-48 hours
            </div>
          </div>
          <p style={{ fontSize: 14, color: '#666' }}>
            Once signed, submit the letter to your HSA/FSA provider to unlock tax-free spending on
            the care services described in your letter.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
