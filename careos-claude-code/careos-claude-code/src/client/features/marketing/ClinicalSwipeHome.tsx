import { useState, useEffect, type ReactElement } from 'react';
import { clinicalSwipe, company, fontLinks } from './design-tokens';
import { SHIcons } from './IconShowcase';

// ─── Types ──────────────────────────────────────────────────

interface Specialty {
  name: string;
  icon: string;
  status: 'live' | 'coming' | 'planned';
  physicians: number;
  reviews: string;
}

interface FeatureCard {
  title: string;
  desc: string;
  icon: string | ReactElement;
}

interface FlowStep {
  label: string;
  sub: string;
  color: string;
}

interface EarningsItem {
  val: string;
  label: string;
}

interface TrustItem {
  label: string;
  icon: string | ReactElement;
}

interface Tab {
  id: string;
  label: string;
  color: string;
}

// ─── Data ───────────────────────────────────────────────────

const SPECIALTIES: Specialty[] = [
  { name: 'Musculoskeletal', icon: 'MSK', status: 'live', physicians: 12, reviews: '2.4K' },
  { name: 'Regenerative Medicine', icon: 'RGN', status: 'live', physicians: 3, reviews: '340' },
  { name: 'Cardiology', icon: 'CV', status: 'coming', physicians: 0, reviews: '—' },
  { name: 'Behavioral Health', icon: 'BH', status: 'coming', physicians: 0, reviews: '—' },
  { name: 'Radiology', icon: 'RAD', status: 'planned', physicians: 0, reviews: '—' },
  { name: 'Dermatology', icon: 'DRM', status: 'planned', physicians: 0, reviews: '—' },
  { name: 'Primary Care', icon: 'PCP', status: 'planned', physicians: 0, reviews: '—' },
  { name: 'Endocrinology', icon: 'END', status: 'planned', physicians: 0, reviews: '—' },
  { name: 'Oncology', icon: 'ONC', status: 'planned', physicians: 0, reviews: '—' },
];

const FOR_AI: FeatureCard[] = [
  {
    title: 'API Integration',
    desc: 'Submit AI outputs via REST API with HMAC-SHA256 signatures. Get structured physician review back in hours.',
    icon: '{ }',
  },
  {
    title: 'MCP Connector',
    desc: 'Drop ClinicalSwipe into your Anthropic Claude workflow as a Model Context Protocol server.',
    icon: 'MCP',
  },
  {
    title: 'Specialty Matching',
    desc: 'Our algorithm routes each output to a board-certified physician in the exact subspecialty needed.',
    icon: '>>>',
  },
  {
    title: 'Review Data',
    desc: 'Every accept/modify/reject generates structured feedback for model improvement and regulatory submission.',
    icon: '|||',
  },
];

const FOR_DOCS: FeatureCard[] = [
  {
    title: 'Swipe to Review',
    desc: 'Accept, modify, or reject AI outputs in under 2 minutes. Built for mobile.',
    icon: 'TAP',
  },
  {
    title: '$12–$400 Per Review',
    desc: 'Earn based on complexity. Simple swipe reviews to full AI safety evaluations.',
    icon: '$',
  },
  {
    title: 'Your Schedule',
    desc: 'Set availability blocks. Accept or decline any case. No minimums.',
    icon: 'CAL',
  },
  {
    title: 'Build the Future',
    desc: 'Your reviews train the next generation of clinical AI. Own a piece of the platform.',
    icon: SHIcons['ai']?.(20) ?? <span />,
  },
];

// ─── Component ──────────────────────────────────────────────

export function ClinicalSwipeHome() {
  const [activeTab, setActiveTab] = useState<string>('ai');
  const [hoveredSpec, setHoveredSpec] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => setCount((c: number) => c + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const C = clinicalSwipe;

  const statusColor: Record<Specialty['status'], string> = {
    live: C.green,
    coming: C.orange,
    planned: C.dim,
  };
  const statusLabel: Record<Specialty['status'], string> = {
    live: 'Live',
    coming: 'Q3 2026',
    planned: '2027+',
  };

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
      }}
    >
      <link href={fontLinks.dmSans} rel="stylesheet" />
      <link href={fontLinks.jetBrainsMono} rel="stylesheet" />

      {/* NAV */}
      <nav
        style={{
          padding: '18px 32px',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '900',
              color: C.bg,
            }}
          >
            CS
          </div>
          <span style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            ClinicalSwipe
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: C.green,
              background: `${C.green}15`,
              padding: '3px 8px',
              borderRadius: '4px',
              marginLeft: '4px',
            }}
          >
            BETA
          </span>
        </div>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <a
            href="#specialties"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}
          >
            Specialties
          </a>
          <a
            href="#ai"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}
          >
            For AI Companies
          </a>
          <a
            href="#docs"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}
          >
            For Physicians
          </a>
          <a
            href="https://docs.clinicalswipe.com"
            style={{
              color: C.muted,
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            API Docs
          </a>
          <button
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              background: 'transparent',
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${C.green}, #00c48a)`,
              border: 'none',
              color: C.bg,
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 32px 40px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: `radial-gradient(ellipse, ${C.green}06 0%, ${C.blue}04 40%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ textAlign: 'center', position: 'relative' }}>
          <h1
            style={{
              fontSize: 'clamp(44px, 7vw, 80px)',
              fontWeight: '900',
              lineHeight: '1.0',
              letterSpacing: '-3px',
              marginBottom: '20px',
              background: `linear-gradient(135deg, ${C.text} 0%, ${C.green} 50%, ${C.blue} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The physician review layer
            <br />
            for healthcare AI
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: C.muted,
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: '1.7',
            }}
          >
            Every AI-generated clinical recommendation needs qualified physician review.
            ClinicalSwipe makes it scalable, structured, and specialty-matched.
          </p>

          <div
            style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '48px' }}
          >
            <button
              style={{
                padding: '16px 36px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${C.green}, #00c48a)`,
                border: 'none',
                color: C.bg,
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: `0 6px 24px ${C.green}30`,
              }}
            >
              {'Integrate ClinicalSwipe \u2192'}
            </button>
            <button
              style={{
                padding: '16px 36px',
                borderRadius: '12px',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                color: C.text,
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Start Reviewing
            </button>
          </div>

          {/* Live counter */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '20px',
              background: C.card,
              border: `1px solid ${C.border}`,
              fontSize: '13px',
              color: C.muted,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: C.green,
                boxShadow: `0 0 8px ${C.green}`,
              }}
            />
            Physician-reviewed AI outputs today:{' '}
            <span
              style={{
                color: C.green,
                fontWeight: '700',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {(247 + count * 3).toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT FLOWS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            padding: '32px 0',
          }}
        >
          {(
            [
              { label: 'AI Company', sub: 'Submits output', color: C.blue },
              { label: 'ClinicalSwipe', sub: 'Routes to specialist', color: C.green },
              { label: 'Physician', sub: 'Reviews in 2 min', color: C.orange },
              { label: 'Patient', sub: 'Gets validated care', color: C.purple },
            ] as FlowStep[]
          ).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', width: '160px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: `${item.color}12`,
                    border: `1px solid ${item.color}30`,
                    margin: '0 auto 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '800',
                    color: item.color,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: C.text }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{item.sub}</div>
              </div>
              {i < 3 && (
                <div
                  style={{
                    width: '60px',
                    height: '1px',
                    background: `linear-gradient(90deg, ${item.color}40, ${[C.green, C.orange, C.purple][i]}40)`,
                    margin: '0 -10px',
                    marginTop: '-20px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALTIES */}
      <section
        id="specialties"
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}
      >
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: C.green,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '10px',
            }}
          >
            Coverage
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px' }}>
            Every specialty. Every AI output.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {SPECIALTIES.map((spec, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredSpec(i)}
              onMouseLeave={() => setHoveredSpec(null)}
              style={{
                padding: '24px',
                background: hoveredSpec === i ? `${statusColor[spec.status]}08` : C.card,
                border: `1px solid ${hoveredSpec === i ? `${statusColor[spec.status]}30` : C.border}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${statusColor[spec.status]}12`,
                    border: `1px solid ${statusColor[spec.status]}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: statusColor[spec.status],
                  }}
                >
                  {spec.icon}
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: `${statusColor[spec.status]}15`,
                    color: statusColor[spec.status],
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {statusLabel[spec.status]}
                </span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
                {spec.name}
              </div>
              {spec.status === 'live' && (
                <div style={{ fontSize: '12px', color: C.muted }}>
                  {spec.physicians} physicians · {spec.reviews} reviews
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <a
            href="#/surgeonaccess"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: `${C.green}10`,
              border: `1px solid ${C.green}30`,
              fontSize: '13px',
              fontWeight: '600',
              color: C.green,
              textDecoration: 'none',
            }}
          >
            SurgeonAccess (MSK) {'\u2192'}
          </a>
          <a
            href="#/clinicalswipe/regen"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: `${C.green}10`,
              border: `1px solid ${C.green}30`,
              fontSize: '13px',
              fontWeight: '600',
              color: C.green,
              textDecoration: 'none',
            }}
          >
            RegenAccess (Hormone) {'\u2192'}
          </a>
        </div>
      </section>

      {/* DUAL AUDIENCE TABS */}
      <section id="ai" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '40px' }}>
          {(
            [
              { id: 'ai', label: 'For AI Companies', color: C.blue },
              { id: 'docs', label: 'For Physicians', color: C.green },
            ] as Tab[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                background: activeTab === tab.id ? `${tab.color}12` : 'transparent',
                border: `1px solid ${activeTab === tab.id ? `${tab.color}40` : C.border}`,
                color: activeTab === tab.id ? tab.color : C.muted,
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'ai' ? (
          <div>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '800',
                letterSpacing: '-1px',
                marginBottom: '8px',
              }}
            >
              Structured physician review for your AI outputs
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: C.muted,
                marginBottom: '36px',
                maxWidth: '560px',
                lineHeight: '1.7',
              }}
            >
              Integrate ClinicalSwipe via API or MCP connector. Submit AI-generated clinical
              recommendations. Get specialty-matched physician review back in hours. Structured data
              for model improvement and regulatory compliance.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {FOR_AI.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '28px',
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      width: '44px',
                      height: '44px',
                      background: `${C.blue}10`,
                      border: `1px solid ${C.blue}20`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: '600',
                      color: C.blue,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.6' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '32px',
                padding: '24px',
                background: C.surface,
                borderRadius: '14px',
                border: `1px solid ${C.border}`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                color: C.muted,
                lineHeight: '2',
                overflow: 'auto',
              }}
            >
              <div style={{ color: C.dim }}>// Submit an AI output for physician review</div>
              <div>
                <span style={{ color: C.blue }}>POST</span>{' '}
                <span style={{ color: C.green }}>/api/v1/reviews</span>
              </div>
              <div style={{ color: C.dim }}>{'{'}</div>
              <div>
                &nbsp;&nbsp;<span style={{ color: C.orange }}>"specialty"</span>:{' '}
                <span style={{ color: C.green }}>"msk.spine"</span>,
              </div>
              <div>
                &nbsp;&nbsp;<span style={{ color: C.orange }}>"output_type"</span>:{' '}
                <span style={{ color: C.green }}>"treatment_plan"</span>,
              </div>
              <div>
                &nbsp;&nbsp;<span style={{ color: C.orange }}>"ai_output"</span>:{' '}
                <span style={{ color: C.green }}>"Recommend PT 2x/wk..."</span>,
              </div>
              <div>
                &nbsp;&nbsp;<span style={{ color: C.orange }}>"urgency"</span>:{' '}
                <span style={{ color: C.green }}>"standard"</span>
              </div>
              <div style={{ color: C.dim }}>{'}'}</div>
              <div style={{ marginTop: '8px', color: C.dim }}>
                // Response: physician review within 4 hours
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: '800',
                letterSpacing: '-1px',
                marginBottom: '8px',
              }}
            >
              Your expertise is more valuable than ever
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: C.muted,
                marginBottom: '36px',
                maxWidth: '560px',
                lineHeight: '1.7',
              }}
            >
              Healthcare AI needs you — not to be replaced, but to validate. Review AI-generated
              clinical outputs on your phone between cases. Earn $12–$400 per review. Keep your
              practice. Add a revenue stream.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {FOR_DOCS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '28px',
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      width: '44px',
                      height: '44px',
                      background: `${C.green}10`,
                      border: `1px solid ${C.green}20`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      color: C.green,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.6' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '32px',
                padding: '28px',
                background: `${C.green}06`,
                borderRadius: '16px',
                border: `1px solid ${C.green}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
            >
              {(
                [
                  { val: '$31K', label: '15 min/day' },
                  { val: '$62K', label: '30 min/day' },
                  { val: '$117K', label: '60 min/day' },
                ] as EarningsItem[]
              ).map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: '900',
                      color: C.green,
                      letterSpacing: '-1px',
                    }}
                  >
                    {item.val}
                  </div>
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
                    {item.label}
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '11px',
                    color: C.muted,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Annual
                </div>
                <div style={{ fontSize: '11px', color: C.muted }}>estimated earnings</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* TRUST BAR */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            alignItems: 'center',
            padding: '32px',
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {(
            [
              { label: 'HIPAA Compliant', icon: 'HIPAA' },
              { label: 'FHIR R4 Native', icon: SHIcons['fhir']?.(16) ?? <span /> },
              { label: 'SOC 2 (Planned)', icon: 'SOC2' },
              { label: 'HMAC-SHA256', icon: 'SHA' },
              { label: '50-State Coverage', icon: 'US' },
            ] as TrustItem[]
          ).map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: C.muted,
                fontWeight: '500',
              }}
            >
              <span style={{ fontWeight: '700', fontSize: '10px', letterSpacing: '0.5px' }}>
                {item.icon}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}
      >
        <h2
          style={{
            fontSize: '44px',
            fontWeight: '900',
            letterSpacing: '-2px',
            marginBottom: '16px',
            background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Every AI output reviewed.
          <br />
          Every patient protected.
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: C.muted,
            maxWidth: '460px',
            margin: '0 auto 32px',
            lineHeight: '1.6',
          }}
        >
          Whether you're building healthcare AI or practicing medicine, ClinicalSwipe is your
          infrastructure.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            style={{
              padding: '16px 36px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${C.blue}, #3a8ae5)`,
              border: 'none',
              color: 'white',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: `0 6px 20px ${C.blue}30`,
            }}
          >
            I'm an AI Company
          </button>
          <button
            style={{
              padding: '16px 36px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${C.green}, #00c48a)`,
              border: 'none',
              color: C.bg,
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: `0 6px 20px ${C.green}30`,
            }}
          >
            I'm a Physician
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '32px',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '13px', color: C.dim }}>
          ClinicalSwipe · {company.name} · Boulder, CO
        </div>
        <div style={{ fontSize: '12px', color: C.dim }}>
          Medical Director: {company.medicalDirector.name} · NPI {company.medicalDirector.npi}
        </div>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        a:hover { color: #00e5a0 !important; }
        button:hover { transform: translateY(-1px); }
        button { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}
