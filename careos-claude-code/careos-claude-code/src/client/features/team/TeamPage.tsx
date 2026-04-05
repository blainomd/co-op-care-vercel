/**
 * TeamPage — Leadership team page for co-op.care
 *
 * Matches PartnersPage/FAQPage design pattern.
 * Shows CEO, Medical Director, and Development Partner.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TileIcon } from '../../components/TileIcon';
import PageLayout from '../../components/layout/PageLayout';

interface TeamMember {
  name: string;
  title: string;
  org?: string;
  location: string;
  image?: string;
  linkedin?: string;
  website?: string;
  bio: string[];
  credentials: string[];
  highlights: Array<{ label: string; value: string }>;
}

const team: TeamMember[] = [
  {
    name: 'Blaine Warkentine, MD MBA',
    title: 'Architect & Co-Founder',
    location: 'Boulder, Colorado',
    linkedin: 'https://www.linkedin.com/in/blainewarkentine/',
    bio: [
      'Healthcare technology strategist and builder. 20+ years in orthopedic technology and health system partnerships.',
      "Grew BrainLAB's orthopedic navigation vertical to $250M in revenue as Clinical Orthopaedic Director. Multiple strategic exits including InVivoLink (acquired by HCA Healthcare) and PumpOne (acquired by Anytime Fitness).",
      'MD from Medical College of Wisconsin with DePuy/BrainLAB-sponsored fellowship in computer-assisted orthopedic surgery. MBA from University of Utah. Faculty Physician at Automate Clinic. Architect of the CareOS platform and cooperative business model.',
    ],
    credentials: [
      'MD — Medical College of Wisconsin',
      'MBA — University of Utah',
      '5 patents in image-guided surgical navigation',
      'Faculty Physician — Automate Clinic',
    ],
    highlights: [
      { label: 'BrainLAB', value: '$250M vertical' },
      { label: 'M&A exits', value: '3 strategic' },
      { label: 'Experience', value: '20+ years' },
      { label: 'Role', value: 'Architect' },
    ],
  },
  {
    name: 'Josh Emdur, DO',
    title: 'Co-Founder & CMO',
    location: 'Boulder, Colorado',
    linkedin: 'https://www.linkedin.com/in/josh-emdur-do-80b4867/',
    website: 'https://www.boulderdoc.com',
    bio: [
      'Board-certified physician with a mission to make high-quality, personalized healthcare more accessible. 50-state medical licensure. NPI: 1649218389.',
      'Hospitalist at Boulder Community Health since 2008 (contract employee, no restrictions) — he knows the hospital, the physicians, and the community. Former Chief Medical Officer at SteadyMD, where he led telehealth partnerships at scale.',
      'Currently CMO of Automate Clinic. Signs every Letter of Medical Necessity for HSA/FSA eligibility ($50-75 per LMN reviewed). Medical Director for Colorado Class B license. His 50-state licensure enables national LMN revenue from Day 1.',
    ],
    credentials: [
      'DO — Western University of Health Sciences',
      'Board Certified — American Board of Family Medicine',
      '50-state medical licensure (NPI: 1649218389)',
      'BCH Contract Hospitalist since 2008',
    ],
    highlights: [
      { label: 'BCH tenure', value: 'Since 2008' },
      { label: 'Licensed in', value: '50 states' },
      { label: 'LMN review', value: '$50-75 each' },
      { label: 'Current CMO', value: 'Automate Clinic' },
    ],
  },
  {
    name: 'Srushti Sangawar',
    title: 'Backend Engineer',
    location: 'Boulder, Colorado',
    linkedin: 'https://www.linkedin.com/in/srushti-sangawar-64984717a/',
    bio: [
      "Backend engineer with 2+ years building robust, scalable applications. MS student at CU Boulder with prior experience at Trimble, Lowe's, and Apple. CSE degree from NIT Rourkela.",
      'Built the CareOS production backend: Stripe payments with HSA/FSA eligibility, HIPAA-compliant audit logging, PostgreSQL migration, JWT security hardening, and 682 passing tests including 65+ security-focused test suites.',
      "Proficient in RESTful API design, database modeling, CI/CD pipelines, and application security. Reduced incident analysis time by 80% at Lowe's through full-stack utility tooling.",
    ],
    credentials: [
      'MS CS — CU Boulder (current)',
      'B.Tech CSE — NIT Rourkela',
      "Trimble / Lowe's / Apple",
      'Spring Boot / Node / PostgreSQL',
    ],
    highlights: [
      { label: 'Tests', value: '682 passing' },
      { label: 'Security', value: 'HIPAA compliant' },
      { label: 'Education', value: 'CU Boulder MS' },
      { label: 'Stack', value: 'Node / PG / Redis' },
    ],
  },
  {
    name: 'Jacob Pielke',
    title: 'Lead Developer — SurgeonAccess',
    org: 'Cohesion Labs',
    location: 'Boulder, Colorado',
    linkedin: 'https://www.linkedin.com/in/jacob-pielke',
    website: 'https://cohesionxlabs.com',
    bio: [
      'CEO of Cohesion Labs — a full-stack software consultancy solving the biggest problems in healthcare and AI. Builder of mission-critical systems with secure integrations, analytics, and agentic AI.',
      "Leading development of SurgeonAccess (surgeonaccess.com) — co-op.care's sister platform for orthopedic surgeons under the CMS ACCESS Model. Supabase, Twilio SMS, and FHIR R4 integration.",
      'Previously co-founded Virtual Fork (2020-2024). Education from USC Marshall School of Business and Universita Bocconi (World Bachelor in Business).',
    ],
    credentials: [
      'CEO — Cohesion Labs (est. 2025)',
      'BBA — USC Marshall / Universita Bocconi',
      'Co-Founder — Virtual Fork (2020-2024)',
      'Full-stack: React, Node, Python, Swift',
    ],
    highlights: [
      { label: 'Company', value: 'Cohesion Labs' },
      { label: 'Platform', value: 'SurgeonAccess' },
      { label: 'Education', value: 'USC / Bocconi' },
      { label: 'Stack', value: 'Next.js / Supabase' },
    ],
  },
  {
    name: 'Jessica Dion',
    title: 'Co-op Community Director',
    location: 'Boulder, Colorado',
    linkedin: 'https://www.linkedin.com/in/jessica-d-78332399/',
    bio: [
      "Physical therapist at Boulder Community Health with deep clinical and community roots in Boulder County. Brings hands-on patient care experience, rehabilitation expertise, and movement science to co-op.care's cooperative model.",
      'As Co-op Community Director, Jessica leads member engagement, caregiver recruitment, and community wellness programs. Her PT background bridges the gap between hospital discharge teams and home-based care — she designs the yoga, movement, and wellness protocols that keep both caregivers and care recipients healthy.',
      "Responsible for growing the cooperative's membership base, onboarding founding caregiver-owners, and building the wellness-integrated neighbor support network that makes co-op.care's community model work.",
    ],
    credentials: [
      'Physical Therapist — BCH',
      'Co-op Community Director',
      'Wellness & Movement Programs',
      'Member Engagement & Recruitment',
    ],
    highlights: [
      { label: 'Clinical', value: 'PT at BCH' },
      { label: 'Focus', value: 'Wellness' },
      { label: 'Region', value: 'Boulder Co.' },
      { label: 'Role', value: 'Community' },
    ],
  },
];

function HighlightStat({ h }: { h: { label: string; value: string } }) {
  const [pulsing, setPulsing] = useState(false);
  return (
    <div
      key={h.label}
      className={`cursor-pointer select-none px-3 py-3 text-center transition-transform ${pulsing ? 'scale-110' : ''}`}
      style={pulsing ? { animation: 'highlight-pulse 0.35s ease-out' } : undefined}
      onClick={() => {
        setPulsing(true);
        setTimeout(() => setPulsing(false), 350);
      }}
    >
      <p className="text-xs font-bold text-navy">{h.value}</p>
      <p className="mt-0.5 text-[10px] text-text-muted">{h.label}</p>
    </div>
  );
}

function TeamCard({ member, accent }: { member: TeamMember; accent: 'sage' | 'gold' | 'navy' }) {
  const [expanded, setExpanded] = useState(false);
  const colors = {
    sage: {
      border: 'border-sage',
      bg: 'bg-sage/5',
      text: 'text-sage-dark',
      badge: 'bg-sage text-white',
    },
    gold: {
      border: 'border-gold',
      bg: 'bg-gold/5',
      text: 'text-gold',
      badge: 'bg-gold text-white',
    },
    navy: {
      border: 'border-navy',
      bg: 'bg-navy/5',
      text: 'text-navy',
      badge: 'bg-navy text-white',
    },
  }[accent];

  return (
    <div className={`rounded-2xl border-2 ${colors.border} bg-white overflow-hidden`}>
      {/* Header */}
      <div className={`${colors.bg} px-6 py-5 md:px-8`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading text-xl font-bold text-navy md:text-2xl">{member.name}</h3>
            <p className={`mt-1 text-sm font-semibold ${colors.text}`}>
              {member.title}
              {member.org ? ` — ${member.org}` : ''}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{member.location}</p>
          </div>
          <div className="flex gap-2">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-navy/15 p-2 text-navy/60 transition-colors hover:bg-navy/5 hover:text-navy"
                aria-label={`${member.name} LinkedIn`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-navy/15 p-2 text-navy/60 transition-colors hover:bg-navy/5 hover:text-navy"
                aria-label={`${member.name} website`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
        {member.highlights.map((h) => (
          <HighlightStat key={h.label} h={h} />
        ))}
      </div>

      {/* Bio */}
      <div className="px-6 py-5 md:px-8">
        <p className="text-sm leading-relaxed text-text-primary">{member.bio[0]}</p>
        {expanded &&
          member.bio.slice(1).map((p, i) => (
            <p
              key={i}
              className="mt-3 text-sm leading-relaxed text-text-primary"
              style={{ animation: 'fade-up 0.3s ease-out' }}
            >
              {p}
            </p>
          ))}
        {member.bio.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs font-semibold text-sage hover:text-sage-dark transition-colors"
          >
            {expanded ? '\u2190 Less' : 'Read more \u2192'}
          </button>
        )}
      </div>

      {/* Credentials */}
      <div className="border-t border-border px-6 py-4 md:px-8">
        <div className="flex flex-wrap gap-2">
          {member.credentials.map((c) => (
            <span key={c} className={`rounded-full ${colors.badge} px-3 py-1 text-xs font-medium`}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      {/* Hero */}
      <section className="px-6 pb-8 pt-12 text-center md:px-12 md:pt-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-sage">Leadership</p>
        <h1 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-bold leading-tight text-navy md:text-4xl">
          The people building
          <br />
          community care infrastructure.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary">
          A physician who knows the hospital. Engineers who ship production code. Community roots in
          Boulder.
        </p>
      </section>

      {/* Team Cards */}
      <section className="mx-auto max-w-4xl space-y-8 px-6 pb-16 md:px-12">
        <TeamCard member={team[0]!} accent="sage" />
        <TeamCard member={team[1]!} accent="gold" />
        <TeamCard member={team[2]!} accent="navy" />
        <TeamCard member={team[3]!} accent="sage" />
        <TeamCard member={team[4]!} accent="gold" />
      </section>

      {/* Advisory note */}
      <section className="border-t border-border bg-white px-6 py-12 text-center md:px-12">
        <div className="mx-auto max-w-2xl">
          <TileIcon name="users" size={32} />
          <h2 className="mt-4 font-heading text-xl font-bold text-navy">Advisory Network</h2>
          <p className="mt-3 text-sm text-text-secondary">
            co-op.care is supported by advisors across healthcare policy, cooperative governance,
            and health system partnerships — including connections at Boulder Community Health,
            Alliance for Care at Home, and StartUp Health.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy px-6 py-14 text-center md:px-12">
        <h2 className="font-heading text-2xl font-bold text-white">Want to work with us?</h2>
        <p className="mt-3 text-sage/80">
          Whether you're a health system, employer, caregiver, or community member.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/partners')}
            className="rounded-full bg-sage px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-dark"
          >
            Healthcare partners
          </button>
          <button
            type="button"
            onClick={() => navigate('/card')}
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Talk to Sage
          </button>
        </div>
      </section>
    </PageLayout>
  );
}
