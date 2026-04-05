/**
 * Caregiver Guide Landing Page — /guide
 *
 * Top-of-funnel for co-op.care. CareGoals brand palette.
 * "Build a caregiver guide in minutes. Ours comes with a physician."
 *
 * Inline styles — DO NOT apply Tailwind (standalone brand page).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { careGoals, fonts, fontLinks, company } from '../marketing/design-tokens';
import { ConnectorGrid } from './ConnectorCard';
import { getGuideConnectors } from '../../../shared/connectors/registry';

// ─── Workflow Steps (the 4-step progress bar) ───────────────────────

const STEPS = [
  {
    number: '01',
    label: 'Gathering',
    desc: 'Conditions, medications, routines, and emergency contacts',
  },
  {
    number: '02',
    label: 'Organizing',
    desc: 'Daily routine, meds, diet, and emergency sections',
  },
  {
    number: '03',
    label: 'Writing',
    desc: 'Clear instructions any caregiver can follow step by step',
  },
  {
    number: '04',
    label: 'Complete',
    desc: 'Physician-reviewed guide — printable and ready to hand off',
  },
];

// Pull feature cards from the Connector registry — not hardcoded
const GUIDE_CONNECTORS = getGuideConnectors();

// ─── Comparison Row ─────────────────────────────────────────────────

const COMPARISON = [
  { feature: 'Output', them: 'Static PDF', us: 'Living document that updates' },
  { feature: 'Clinical review', them: 'None', us: 'Physician-reviewed' },
  { feature: 'Medication check', them: 'AI only', us: 'Physician-attested' },
  { feature: 'HSA/FSA savings', them: 'Not included', us: 'Auto-identified + LMN' },
  { feature: 'Care team', them: 'Contact list', us: 'Matched caregivers' },
  { feature: 'Advance directives', them: 'Not included', us: 'Legally binding' },
  { feature: 'Price', them: '$20/mo', us: 'Free → $59/mo living' },
];

// ─── Component ──────────────────────────────────────────────────────

export function CaregiverGuideLanding() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleStart = () => {
    navigate('/guide/build');
  };

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <link rel="stylesheet" href={fontLinks.dmSans} />
      <link rel="stylesheet" href={fontLinks.lora} />

      <div
        style={{
          fontFamily: fonts.body,
          background: careGoals.cream,
          color: careGoals.text,
          minHeight: '100vh',
        }}
      >
        {/* ── Hero ── */}
        <section
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '80px 24px 60px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: careGoals.warmWhite,
              border: `1px solid ${careGoals.border}`,
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 13,
              color: careGoals.sage,
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: 24,
            }}
          >
            co-op.care
          </div>

          <h1
            style={{
              fontFamily: fonts.serif,
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: careGoals.charcoal,
              marginBottom: 20,
            }}
          >
            Build a caregiver guide
            <br />
            in minutes
          </h1>

          <p
            style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: careGoals.muted,
              maxWidth: 600,
              margin: '0 auto 12px',
            }}
          >
            Sage organizes conditions, medications, and routines into a complete guide any caregiver
            can follow.
          </p>

          <p
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: careGoals.sage,
              marginBottom: 36,
            }}
          >
            Ours comes with a physician.
          </p>

          <button
            onClick={handleStart}
            style={{
              background: careGoals.sage,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 40px',
              fontSize: 17,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: fonts.body,
              letterSpacing: '0.01em',
              boxShadow: '0 2px 12px rgba(124,149,107,0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,149,107,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,149,107,0.25)';
            }}
          >
            Build my guide
          </button>

          <p style={{ fontSize: 13, color: careGoals.muted, marginTop: 12 }}>
            Free to start. No account required.
          </p>
        </section>

        {/* ── 4-Step Progress ── */}
        <section
          style={{
            maxWidth: 800,
            margin: '0 auto',
            padding: '0 24px 60px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {STEPS.map((step) => (
              <div
                key={step.number}
                style={{
                  background: careGoals.card,
                  border: `1px solid ${careGoals.border}`,
                  borderRadius: 12,
                  padding: '20px 16px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: careGoals.sage,
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}
                >
                  STEP {step.number}
                </div>
                <div
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 17,
                    fontWeight: 600,
                    color: careGoals.charcoal,
                    marginBottom: 6,
                  }}
                >
                  {step.label}
                </div>
                <p style={{ fontSize: 13, color: careGoals.muted, lineHeight: 1.5, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Value Prop Strip ── */}
        <section
          style={{
            background: careGoals.warmWhite,
            padding: '60px 24px',
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: fonts.serif,
                fontSize: 28,
                fontWeight: 600,
                color: careGoals.charcoal,
                marginBottom: 12,
              }}
            >
              From scattered notes to a complete care guide
            </h2>
            <p
              style={{ fontSize: 16, color: careGoals.muted, maxWidth: 560, margin: '0 auto 40px' }}
            >
              Enter the details once, step away, come back to a guide any caregiver can follow. Then
              keep it alive as care needs evolve.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
                textAlign: 'left',
              }}
            >
              <div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: careGoals.sage, marginBottom: 6 }}
                >
                  Physician oversight
                </div>
                <p style={{ fontSize: 14, color: careGoals.text, lineHeight: 1.5, margin: 0 }}>
                  Every guide is reviewed by a licensed physician. Not a generic AI — a real doctor
                  who knows your family.
                </p>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: careGoals.copper,
                    marginBottom: 6,
                  }}
                >
                  HSA/FSA unlock
                </div>
                <p style={{ fontSize: 14, color: careGoals.text, lineHeight: 1.5, margin: 0 }}>
                  The guide identifies eligible expenses and auto-generates a Letter of Medical
                  Necessity. Average savings: $936/year.
                </p>
              </div>
              <div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: careGoals.earth, marginBottom: 6 }}
                >
                  Living updates
                </div>
                <p style={{ fontSize: 14, color: careGoals.text, lineHeight: 1.5, margin: 0 }}>
                  New medication? Hospital visit? The guide updates because your Living Profile
                  updates. No manual edits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Connector Cards (from registry — each card IS a company) ── */}
        <section style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px' }}>
          <h2
            style={{
              fontFamily: fonts.serif,
              fontSize: 28,
              fontWeight: 600,
              color: careGoals.charcoal,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Your caregiving coordinator, on autopilot
          </h2>
          <p
            style={{
              fontSize: 16,
              color: careGoals.muted,
              textAlign: 'center',
              maxWidth: 500,
              margin: '0 auto 40px',
            }}
          >
            Enter the details once, step away, come back to a guide any caregiver can follow.
          </p>

          <ConnectorGrid connectors={GUIDE_CONNECTORS} />
        </section>

        {/* ── Comparison Table ── */}
        <section style={{ background: careGoals.warmWhite, padding: '60px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: fonts.serif,
                fontSize: 26,
                fontWeight: 600,
                color: careGoals.charcoal,
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              AI guide vs. physician-backed guide
            </h2>

            <div
              style={{
                background: careGoals.card,
                border: `1px solid ${careGoals.border}`,
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  padding: '14px 20px',
                  background: careGoals.light,
                  borderBottom: `1px solid ${careGoals.border}`,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: careGoals.muted,
                }}
              >
                <span>FEATURE</span>
                <span>GENERIC AI</span>
                <span style={{ color: careGoals.sage }}>CO-OP.CARE</span>
              </div>

              {/* Rows */}
              {COMPARISON.map((row, i) => (
                <div
                  key={row.feature}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '12px 20px',
                    borderBottom:
                      i < COMPARISON.length - 1 ? `1px solid ${careGoals.border}` : 'none',
                    fontSize: 14,
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ fontWeight: 600, color: careGoals.charcoal }}>{row.feature}</span>
                  <span style={{ color: careGoals.muted }}>{row.them}</span>
                  <span style={{ color: careGoals.sage, fontWeight: 500 }}>{row.us}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          style={{
            maxWidth: 600,
            margin: '0 auto',
            padding: '60px 24px 40px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: fonts.serif,
              fontSize: 28,
              fontWeight: 600,
              color: careGoals.charcoal,
              marginBottom: 16,
            }}
          >
            Your family deserves a plan
          </h2>
          <p style={{ fontSize: 16, color: careGoals.muted, marginBottom: 32 }}>
            Build the guide for free. Keep it alive for $59/month — less than one hour of home care,
            and it pays for itself through HSA savings.
          </p>

          <button
            onClick={handleStart}
            style={{
              background: careGoals.sage,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 40px',
              fontSize: 17,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: fonts.body,
              marginBottom: 20,
              boxShadow: '0 2px 12px rgba(124,149,107,0.25)',
            }}
          >
            Build my guide
          </button>

          {/* Email capture fallback */}
          {!submitted ? (
            <form onSubmit={handleWaitlist} style={{ marginTop: 16 }}>
              <p style={{ fontSize: 13, color: careGoals.muted, marginBottom: 8 }}>
                Not ready yet? We'll remind you.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    border: `1px solid ${careGoals.border}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 14,
                    fontFamily: fonts.body,
                    width: 240,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: careGoals.copper,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: fonts.body,
                  }}
                >
                  Remind me
                </button>
              </div>
            </form>
          ) : (
            <p style={{ fontSize: 14, color: careGoals.sage, fontWeight: 500 }}>
              We'll send you a reminder. No spam.
            </p>
          )}
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: `1px solid ${careGoals.border}`,
            padding: '24px',
            textAlign: 'center',
            fontSize: 12,
            color: careGoals.muted,
          }}
        >
          <span>{company.name}</span>
          <span style={{ margin: '0 8px' }}>·</span>
          <span>Medical Director: {company.medicalDirector.name}</span>
          <span style={{ margin: '0 8px' }}>·</span>
          <span>{company.medicalDirector.license}</span>
        </footer>
      </div>
    </>
  );
}
