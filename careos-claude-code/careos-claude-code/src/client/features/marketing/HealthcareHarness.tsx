import { useEffect } from 'react';
import { fontLinks, company } from './design-tokens';

// ─── Types ──────────────────────────────────────────────────

interface StackLayer {
  name: string;
  desc: string;
  color: string;
  width: string;
  highlight?: boolean;
}

interface HarnessComponent {
  icon: (s?: number) => React.ReactElement;
  title: string;
  desc: string;
}

interface MarketStat {
  stat: string;
  label: string;
  sub: string;
}

interface Specialty {
  name: string;
  status: string;
}

// ─── Inline SVG Icons ───────────────────────────────────────

const I = {
  shield: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4l16 8v14c0 10-7 18-16 22-9-4-16-12-16-22V12l16-8z"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <path
        d="M18 24l4 4 8-8"
        stroke="#f4a261"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  physician: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="14" r="7" fill="#c4956a50" />
      <path
        d="M12 38c0-6.6 5.4-12 12-12s12 5.4 12 12"
        stroke="#6b8f71"
        strokeWidth="2"
        fill="#6b8f7110"
      />
      <rect x="21" y="30" width="6" height="8" rx="1" fill="#6b8f7125" />
    </svg>
  ),
  ai: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="10"
        y="10"
        width="28"
        height="28"
        rx="8"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <circle cx="20" cy="22" r="2.5" fill="#c4956a60" />
      <circle cx="28" cy="22" r="2.5" fill="#c4956a60" />
      <path d="M18 30c2 2 6 4 12 0" stroke="#6b8f71" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  check: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill="#6b8f7120" stroke="#6b8f71" strokeWidth="2" />
      <path
        d="M16 24l6 6 12-12"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chart: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="6"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <polyline
        points="12,34 18,26 24,30 32,18 38,22"
        stroke="#6b8f71"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="38" cy="22" r="2.5" fill="#f4a261" />
    </svg>
  ),
  money: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill="#6b8f7110" stroke="#6b8f71" strokeWidth="2" />
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fill="#6b8f71">
        $
      </text>
    </svg>
  ),
};

// ─── Color Palette ──────────────────────────────────────────

const C = {
  bg: '#0c1117',
  surface: '#141c24',
  card: '#1a242e',
  border: 'rgba(255,255,255,0.06)',
  text: '#e2e8f0',
  muted: '#64748b',
  dim: '#334155',
  teal: '#2dd4a8',
  gold: '#f4a261',
  coral: '#ef6461',
  sage: '#6b8f71',
  copper: '#c4956a',
} as const;

// ─── Component ──────────────────────────────────────────────

export function HealthcareHarness() {
  useEffect(() => {
    document.title = 'ClinicalSwipe -- The Healthcare AI Harness';
  }, []);

  const layers: StackLayer[] = [
    {
      name: 'AI Model',
      desc: 'Claude, GPT, Gemini -- raw intelligence',
      color: C.muted,
      width: '100%',
    },
    {
      name: 'Healthcare Harness',
      desc: 'ClinicalSwipe -- the required review layer',
      color: C.teal,
      width: '85%',
      highlight: true,
    },
    {
      name: 'Clinical Output',
      desc: 'Safe, attested, billable, auditable',
      color: C.sage,
      width: '70%',
    },
  ];

  const harnessComponents: HarnessComponent[] = [
    {
      icon: I.shield,
      title: 'Physician Attestation',
      desc: "Every AI output reviewed and signed by a qualified physician. Required by Anthropic's acceptable use policy.",
    },
    {
      icon: I.physician,
      title: 'Learned Intermediary',
      desc: 'Preserves the legal doctrine that shields AI companies from direct liability. Without it, manufacturers face unprecedented exposure.',
    },
    {
      icon: I.ai,
      title: 'Codified Clinical Expertise',
      desc: 'Specialty-specific review protocols. Ortho, hormone, behavioral health, cardiology -- each with domain-appropriate validation rules.',
    },
    {
      icon: I.check,
      title: 'Audit Trail',
      desc: 'Every decision documented, timestamped, physician-signed. Survives regulatory review, malpractice challenge, CMS audit.',
    },
    {
      icon: I.chart,
      title: 'FHIR Data Submission',
      desc: 'Structured clinical data flows to CMS, payers, and referring physicians. ACCESS Model OAP measures tracked automatically.',
    },
    {
      icon: I.money,
      title: 'Revenue Capture',
      desc: 'CPT 99358 (prolonged services) generated per review. Physicians earn $12-$400/review. AI companies get compliant clinical output.',
    },
  ];

  const marketStats: MarketStat[] = [
    {
      stat: '$6.4B',
      label: 'Digital health funding H1 2025',
      sub: 'AI-enabled companies captured the majority',
    },
    {
      stat: '80%',
      label: 'Healthcare execs expect AI value in 2026',
      sub: 'Deloitte 2026 US Healthcare Outlook',
    },
    {
      stat: '1,250+',
      label: 'FDA-authorized AI medical devices',
      sub: 'Every one needs physician oversight',
    },
  ];

  const specialties: Specialty[] = [
    { name: 'MSK / Orthopedics', status: 'live' },
    { name: 'Hormone / Regenerative', status: 'live' },
    { name: 'Cardio-Kidney-Metabolic', status: 'Q3 2026' },
    { name: 'Behavioral Health', status: 'Q4 2026' },
    { name: 'Radiology', status: '2027' },
    { name: 'Dermatology', status: '2027' },
    { name: 'Primary Care', status: '2027' },
    { name: 'Oncology', status: '2027+' },
  ];

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        padding: '40px 24px',
      }}
    >
      <link href={fontLinks.dmSans} rel="stylesheet" />
      <link href={fontLinks.jetBrainsMono} rel="stylesheet" />
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${C.teal}, ${C.sage})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '900',
                color: C.bg,
              }}
            >
              CS
            </div>
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: C.teal,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                ClinicalSwipe
              </div>
              <div style={{ fontSize: '11px', color: C.muted }}>by {company.name}</div>
            </div>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: '900',
              lineHeight: '1.1',
              letterSpacing: '-2px',
              marginBottom: '16px',
            }}
          >
            The Healthcare Harness.
          </h1>
          <p style={{ fontSize: '20px', color: C.muted, lineHeight: '1.6', maxWidth: '640px' }}>
            Every healthcare AI company needs physician review of clinical outputs. The model
            companies can't provide it. We can.
          </p>
        </div>

        {/* The Problem */}
        <div
          style={{
            padding: '32px',
            background: C.card,
            borderRadius: '20px',
            border: `1px solid ${C.border}`,
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: C.coral,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '12px',
            }}
          >
            The Problem
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: C.text,
              lineHeight: '1.6',
              marginBottom: '16px',
            }}
          >
            Anthropic's acceptable use policy requires that{' '}
            <span style={{ color: C.gold }}>
              "a qualified professional must review the content or decision prior to dissemination
              or finalization"
            </span>{' '}
            when Claude is used for healthcare decisions.
          </div>
          <div style={{ fontSize: '15px', color: C.muted, lineHeight: '1.7' }}>
            OpenAI, Google, and Microsoft have identical policies. Every healthcare AI deployment
            requires physician oversight. But model companies are platform companies -- they don't
            employ physicians. Healthcare AI companies are focused on their specialty -- they don't
            have review infrastructure. Nobody provides the qualified professional review layer at
            scale.
          </div>
        </div>

        {/* The Stack Diagram */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            The Stack
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
          >
            {layers.map((layer, i) => (
              <div
                key={i}
                style={{
                  width: layer.width,
                  padding: '20px 24px',
                  background: layer.highlight
                    ? `linear-gradient(135deg, ${C.teal}15, ${C.sage}10)`
                    : C.card,
                  border: `1.5px solid ${layer.highlight ? C.teal : C.border}`,
                  borderRadius: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: layer.highlight ? `0 0 30px ${C.teal}15` : 'none',
                  transition: 'all 0.3s',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: layer.highlight ? C.teal : C.text,
                    }}
                  >
                    {layer.name}
                  </div>
                  <div style={{ fontSize: '13px', color: C.muted }}>{layer.desc}</div>
                </div>
                {layer.highlight && (
                  <div
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: `${C.teal}20`,
                      fontSize: '11px',
                      fontWeight: '700',
                      color: C.teal,
                    }}
                  >
                    THIS IS US
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: C.dim }}>
            The harness produces up to 6x performance improvement on the same model (Stanford/MIT,
            2026)
          </div>
        </div>

        {/* Six Components */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            What the Harness Provides
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {harnessComponents.map((comp, i) => (
              <div
                key={i}
                style={{
                  background: C.card,
                  borderRadius: '16px',
                  border: `1px solid ${C.border}`,
                  padding: '20px',
                }}
              >
                <div style={{ marginBottom: '10px' }}>{comp.icon(28)}</div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: C.text,
                    marginBottom: '6px',
                  }}
                >
                  {comp.title}
                </div>
                <div style={{ fontSize: '12px', color: C.muted, lineHeight: '1.6' }}>
                  {comp.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          {marketStats.map((item, i) => (
            <div
              key={i}
              style={{
                background: C.card,
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: C.teal,
                  letterSpacing: '-1px',
                }}
              >
                {item.stat}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: C.text, marginTop: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '10px', color: C.dim, marginTop: '4px' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div
          style={{
            padding: '32px',
            background: C.card,
            borderRadius: '20px',
            border: `1px solid ${C.border}`,
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            Integration -- 3 Lines of Code
          </div>
          <div
            style={{
              background: C.bg,
              borderRadius: '12px',
              padding: '20px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              lineHeight: '1.8',
              color: C.teal,
              overflowX: 'auto',
            }}
          >
            <div>
              <span style={{ color: C.muted }}>
                // Submit any AI clinical output for physician review
              </span>
            </div>
            <div>
              <span style={{ color: C.gold }}>const</span> review ={' '}
              <span style={{ color: C.gold }}>await</span> clinicalswipe.
              <span style={{ color: C.text }}>submit</span>
              {'({'}
            </div>
            <div>
              {'  '}specialty: <span style={{ color: C.sage }}>"ortho"</span>,
            </div>
            <div>{'  '}content: aiOutput,</div>
            <div>
              {'  '}priority: <span style={{ color: C.sage }}>"standard"</span>
            </div>
            <div>{'});'}</div>
            <div style={{ marginTop: '8px' }}>
              <span style={{ color: C.muted }}>
                // Returns: physician-attested, CPT-coded, audit-trailed
              </span>
            </div>
            <div>
              <span style={{ color: C.muted }}>// Average review time: 60 seconds</span>
            </div>
            <div>
              <span style={{ color: C.muted }}>// Webhook fires on completion</span>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div
          style={{
            padding: '32px',
            background: C.card,
            borderRadius: '20px',
            border: `1px solid ${C.border}`,
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            Specialty Coverage
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {specialties.map((spec, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: spec.status === 'live' ? `${C.teal}15` : C.surface,
                  border: `1px solid ${spec.status === 'live' ? `${C.teal}40` : C.border}`,
                  fontSize: '13px',
                  fontWeight: '500',
                  color: spec.status === 'live' ? C.teal : C.muted,
                }}
              >
                {spec.name}{' '}
                <span style={{ fontSize: '10px', opacity: 0.6 }}>
                  {'\u00B7'} {spec.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* The Question */}
        <div
          style={{
            padding: '40px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${C.teal}08, ${C.sage}08)`,
            border: `1px solid ${C.teal}20`,
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: C.text,
              marginBottom: '12px',
              letterSpacing: '-0.5px',
            }}
          >
            "Who provides the qualified professional review?"
          </div>
          <div
            style={{
              fontSize: '16px',
              color: C.muted,
              lineHeight: '1.7',
              maxWidth: '560px',
              margin: '0 auto 20px',
            }}
          >
            Every model company's policy requires it. No model company provides it. ClinicalSwipe is
            the infrastructure layer that makes healthcare AI deployments compliant, auditable, and
            safe.
          </div>
          <div style={{ fontSize: '14px', color: C.teal, fontWeight: '600' }}>
            We built the harness layer for healthcare AI.
          </div>
        </div>

        {/* Contact */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 0',
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Blaine Warkentine, MD</div>
            <div style={{ fontSize: '12px', color: C.muted }}>
              Founder, {company.name} {'\u00B7'} blaine@co-op.care {'\u00B7'} {company.phone}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: C.dim }}>
            <div>BrainLAB Orthopedics: $0 {'\u2192'} $250M</div>
            <div>Automate Clinic Faculty {'\u00B7'} 5 Patents</div>
            <div>Boulder, Colorado</div>
          </div>
        </div>
      </div>
    </div>
  );
}
