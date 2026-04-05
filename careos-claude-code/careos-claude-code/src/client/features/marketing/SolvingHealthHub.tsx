/**
 * SolvingHealthHub — The ecosystem overview page
 *
 * "Creating the health system that works for you — instead of you working for it."
 *
 * Shows all 4 agentic modules and how they connect:
 *   SurgeonAccess (hooks surgeons) → ClinicalSwipe (captures value) → co-op.care (delivers care)
 *   CareGoals threads through as the conversation layer
 *
 * Each module is an agentic system — AI agents replace human operations,
 * physician-supervised, SDK-powered.
 */
import { useState } from 'react';
import { fontLinks, company } from './design-tokens';

interface Module {
  id: string;
  name: string;
  tagline: string;
  description: string;
  route: string;
  color: string;
  colorDark: string;
  agents: string[];
  role: string;
}

const MODULES: Module[] = [
  {
    id: 'coopc',
    name: 'co-op.care',
    tagline: 'The app that comes with a caregiver',
    description:
      '$59/month gives the Alpha Daughter a care team, a care plan, and a tax break. CareGoals built in. Predictive needs engine. Worker handoff. Unlimited LMNs. The only caregiving app connected to real care — W-2 worker-owners who already know how mom takes her coffee.',
    route: '#/',
    color: '#2BA5A0',
    colorDark: '#1B8A85',
    agents: [
      'Sage AI Assistant',
      'CareGoals Conversation Guide',
      'Predictive Needs Engine',
      'Worker Handoff',
      'Care Matcher',
      'Schedule Optimizer',
      'Living Profile Builder',
      'CII/CRI Assessor',
      'LMN Generator',
      'Monthly Care Forecast',
      'FHIR Sync Engine',
      'Omaha Auto-Coder',
    ],
    role: '$59/mo -- care team + care plan + tax break',
  },
  {
    id: 'surgeonaccess',
    name: 'SurgeonAccess',
    tagline: 'The orthopedic intelligence platform',
    description:
      'AI-powered practice OS for orthopedic surgeons. Ambient documentation, automated PROMs, prior auth, value-based payment engine. 9 agents make the clinic run — from patient intake to revenue capture.',
    route: '#/surgeonaccess',
    color: '#2dd4a8',
    colorDark: '#1a9e7a',
    agents: [
      'Ambient Scribe',
      'PROMs Pipeline',
      'Prior Auth',
      'Care Plan Generator',
      'LMN Engine',
      'ACCESS Model Compliance',
      'Revenue Cycle',
      'Patient Matching',
      'Referral Intelligence',
    ],
    role: 'Ortho practice OS -- hooks surgeons into the ecosystem',
  },
  {
    id: 'clinicalswipe',
    name: 'ClinicalSwipe',
    tagline: 'The physician review layer for healthcare AI',
    description:
      'Every AI-generated clinical recommendation needs qualified physician review. ClinicalSwipe makes it scalable, structured, and specialty-matched. API + MCP integration for AI companies. $12-$400/review for physicians.',
    route: '#/clinicalswipe',
    color: '#00e5a0',
    colorDark: '#00c48a',
    agents: [
      'Specialty Matcher',
      'Review Router',
      'Quality Scorer',
      'Feedback Loop',
      'Compliance Tracker',
      'Physician Scheduler',
    ],
    role: 'Physician app for all specialties',
  },
];

const VALUE_FLOW = [
  { from: 'co-op.care', to: 'ClinicalSwipe', label: 'LMNs reviewed by Josh via ClinicalSwipe' },
  { from: 'SurgeonAccess', to: 'ClinicalSwipe', label: 'AI outputs need physician review' },
  { from: 'ClinicalSwipe', to: 'co-op.care', label: 'Signed LMNs unlock HSA/FSA for families' },
];

const STATS = [
  { value: '$1T', label: 'Unpaid family care (AARP 2026)', suffix: '' },
  { value: '59M', label: 'Family caregivers in the US', suffix: '' },
  { value: '$59', label: '/mo -- pays for itself day one', suffix: '' },
  { value: '$3M', label: 'Year 1 from 200 families', suffix: '' },
];

const C = {
  bg: '#0a0f1a',
  surface: '#0f1628',
  card: 'rgba(255,255,255,0.025)',
  border: 'rgba(255,255,255,0.06)',
  text: '#e8edf2',
  muted: '#7a8a9a',
  dim: '#3a4a5a',
};

export function SolvingHealthHub() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

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

      {/* NAV */}
      <nav
        style={{
          padding: '20px 32px',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2dd4a8, #4a9eff, #7c956b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '900',
              color: C.bg,
            }}
          >
            SH
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              Solving Health
            </div>
            <div
              style={{
                fontSize: '10px',
                color: C.dim,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Agentic Healthcare Infrastructure
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {MODULES.map((m) => (
            <a
              key={m.id}
              href={m.route}
              style={{
                color: C.muted,
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'color 0.2s',
              }}
            >
              {m.name}
            </a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 32px 40px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '500px',
            background:
              'radial-gradient(ellipse, rgba(45,212,168,0.04) 0%, rgba(74,159,255,0.03) 40%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(45,212,168,0.08)',
            border: '1px solid rgba(45,212,168,0.2)',
            marginBottom: '28px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#2dd4a8',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#2dd4a8',
            }}
          />
          3 modules, 27 agents, 1 physician -- $59/month
        </div>

        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: '900',
            lineHeight: '1.05',
            letterSpacing: '-3px',
            marginBottom: '20px',
            maxWidth: '800px',
            margin: '0 auto 20px',
          }}
        >
          The health system that works{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #2dd4a8, #4a9eff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            for you
          </span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: C.muted,
            maxWidth: '600px',
            margin: '0 auto 48px',
          }}
        >
          59 million family caregivers provide $1 trillion in unpaid care every year. Every
          caregiver app is a coordination tool. co-op.care is the only app where the care team is IN
          the app — W-2 worker-owners who already read mom's goals, know she likes her coffee hot,
          and do things WITH her, not FOR her.
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: C.border,
            borderRadius: '16px',
            overflow: 'hidden',
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          {STATS.map((stat, i) => (
            <div key={i} style={{ padding: '24px', background: C.surface, textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #2dd4a8, #4a9eff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                }}
              >
                {stat.value}
                {stat.suffix}
              </div>
              <div
                style={{ fontSize: '12px', color: C.muted, marginTop: '4px', fontWeight: '500' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUE FLOW DIAGRAM */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#4a9eff',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '10px',
            }}
          >
            Value Flow
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
            How the modules connect
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            padding: '32px 0',
            flexWrap: 'wrap',
          }}
        >
          {MODULES.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  textAlign: 'center',
                  width: '180px',
                  padding: '24px 16px',
                  borderRadius: '16px',
                  background: activeModule === m.id ? `${m.color}10` : C.card,
                  border: `1px solid ${activeModule === m.id ? `${m.color}40` : C.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={() => setActiveModule(m.id)}
                onMouseLeave={() => setActiveModule(null)}
                onClick={() => {
                  window.location.href = m.route;
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: `${m.color}12`,
                    border: `1px solid ${m.color}30`,
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: m.color,
                  }}
                >
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '11px', color: C.muted, lineHeight: '1.4' }}>{m.role}</div>
              </div>
              {i < MODULES.length - 1 && (
                <div
                  style={{
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke={C.dim}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Flow labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '16px',
            flexWrap: 'wrap',
          }}
        >
          {VALUE_FLOW.map((flow, i) => (
            <div
              key={i}
              style={{
                fontSize: '11px',
                color: C.dim,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontWeight: '600', color: C.muted }}>{flow.from}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke={C.dim} strokeWidth="1" strokeLinecap="round" />
              </svg>
              <span style={{ fontWeight: '600', color: C.muted }}>{flow.to}</span>
              <span style={{ color: C.dim }}>({flow.label})</span>
            </div>
          ))}
        </div>
      </section>

      {/* MODULE CARDS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#f4a261',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '10px',
            }}
          >
            Agentic Modules
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>
            Every module is an AI agent system
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: C.muted,
              maxWidth: '520px',
              margin: '8px auto 0',
              lineHeight: '1.6',
            }}
          >
            Each module runs autonomous AI agents supervised by {company.medicalDirector.name}.
            Agents replace administrative overhead — not clinical judgment.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {MODULES.map((m) => (
            <a
              key={m.id}
              href={m.route}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '36px',
                background: activeModule === m.id ? `${m.color}06` : C.card,
                border: `1px solid ${activeModule === m.id ? `${m.color}30` : C.border}`,
                borderRadius: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'block',
              }}
              onMouseEnter={() => setActiveModule(m.id)}
              onMouseLeave={() => setActiveModule(null)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${m.color}, ${m.colorDark})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '900',
                      color: C.bg,
                    }}
                  >
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {m.name}
                    </div>
                    <div style={{ fontSize: '12px', color: m.color, fontWeight: '500' }}>
                      {m.tagline}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: `${m.color}12`,
                    fontSize: '11px',
                    fontWeight: '700',
                    color: m.color,
                  }}
                >
                  {m.agents.length} agents
                </span>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  color: C.muted,
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                {m.description}
              </p>

              {/* Agent chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {m.agents.map((agent) => (
                  <span
                    key={agent}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: `${m.color}08`,
                      border: `1px solid ${m.color}15`,
                      fontSize: '11px',
                      fontWeight: '500',
                      color: C.muted,
                    }}
                  >
                    {agent}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* THE THESIS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}>
        <div
          style={{
            padding: '48px',
            background: 'linear-gradient(135deg, #0e1f33, #132a3e)',
            borderRadius: '24px',
            border: '1px solid rgba(45,212,168,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(45,212,168,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#2dd4a8',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                marginBottom: '16px',
              }}
            >
              The Thesis
            </div>
            <h2
              style={{
                fontSize: '28px',
                fontWeight: '800',
                letterSpacing: '-1px',
                marginBottom: '20px',
                maxWidth: '600px',
              }}
            >
              $59/month gives the Alpha Daughter a care team, a care plan, and a tax break. Nobody
              else does all three.
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginTop: '32px',
              }}
            >
              {[
                {
                  title: 'The App Pays for Itself',
                  desc: '$200/mo in wellness + LMN = $60/mo HSA savings. Subscription costs $59. Conductor is $1 ahead before using care coordination.',
                  color: '#2dd4a8',
                },
                {
                  title: 'The App Comes with a Caregiver',
                  desc: "Every other app organizes chaos. co-op.care is the only app where the W-2 worker who walks through the door already knows mom's CareGoals.",
                  color: '#4a9eff',
                },
                {
                  title: "The App Predicts What's Next",
                  desc: 'Monthly CII/CRI check-in takes 3 minutes. AI says what mom needs next month. Conductor taps to approve. Care plan updates. Workers see it.',
                  color: '#7c956b',
                },
              ].map((moat, i) => (
                <div
                  key={i}
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: moat.color,
                      marginBottom: '8px',
                    }}
                  >
                    {moat.title}
                  </div>
                  <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.6' }}>
                    {moat.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MEDICAL DIRECTOR */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
        <div
          style={{
            padding: '32px 40px',
            background: C.card,
            borderRadius: '20px',
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#2dd4a8',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '8px',
              }}
            >
              Medical Director -- All Entities
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
              {company.medicalDirector.name}
            </div>
            <div style={{ fontSize: '13px', color: C.muted }}>
              NPI {company.medicalDirector.npi} -- {company.medicalDirector.license} --{' '}
              {company.medicalDirector.affiliation}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: C.muted, lineHeight: '1.8' }}>
              {company.name} -- EIN {company.ein}
              <br />
              {company.address}
            </div>
          </div>
        </div>
      </section>

      {/* LMN + ICON SYSTEM LINKS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <a
            href="#/lmn-intake"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              padding: '28px 32px',
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'border-color 0.2s',
            }}
          >
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                LMN Intake Form
              </div>
              <div style={{ fontSize: '13px', color: C.muted }}>
                Letter of Medical Necessity -- $199 flat fee -- HSA/FSA eligible
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 10h10M11 6l4 4-4 4"
                stroke={C.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="#/design-system"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              padding: '28px 32px',
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'border-color 0.2s',
            }}
          >
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                Icon System + Design Tokens
              </div>
              <div style={{ fontSize: '13px', color: C.muted }}>
                Shared visual language across all Solving Health brands
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 10h10M11 6l4 4-4 4"
                stroke={C.muted}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: '40px 32px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2dd4a8, #4a9eff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: '900',
                  color: C.bg,
                }}
              >
                SH
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>Solving Health</span>
            </div>
            <div style={{ fontSize: '12px', color: C.dim, lineHeight: '1.8' }}>
              {company.name} -- EIN {company.ein}
              <br />
              {company.address}
              <br />
              {company.phone}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '48px' }}>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                }}
              >
                Modules
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {MODULES.map((m) => (
                  <a
                    key={m.id}
                    href={m.route}
                    style={{
                      color: C.dim,
                      textDecoration: 'none',
                      fontSize: '13px',
                    }}
                  >
                    {m.name}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginBottom: '12px',
                }}
              >
                Tools
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href="#/lmn-intake"
                  style={{ color: C.dim, textDecoration: 'none', fontSize: '13px' }}
                >
                  LMN Intake
                </a>
                <a
                  href="#/design-system"
                  style={{ color: C.dim, textDecoration: 'none', fontSize: '13px' }}
                >
                  Design System
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        a:hover { color: #2dd4a8 !important; }
        button:hover { transform: translateY(-1px); }
        button { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}
