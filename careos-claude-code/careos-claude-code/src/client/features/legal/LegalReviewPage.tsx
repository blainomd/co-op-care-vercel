/**
 * LegalReviewPage — Comprehensive HSA/FSA + LMN legal framework analysis
 *
 * Private page at /#/legal/lmn — not linked from any nav.
 * Presents the full legal research in a professional, readable format.
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Reveal } from '../../components/Reveal';

/* ── Risk Badge ──────────────────────────────────────────────── */
function RiskBadge({
  level,
}: {
  level: 'low' | 'moderate' | 'high' | 'low-moderate' | 'moderate-high';
}) {
  const colors: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'low-moderate': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    'moderate-high': 'bg-orange-100 text-orange-800 border-orange-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  };
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colors[level]}`}
    >
      {level} risk
    </span>
  );
}

/* ── Section wrapper ─────────────────────────────────────────── */
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="mb-12 scroll-mt-24">
        <h2 className="mb-6 border-b-2 border-[#0D7377] pb-2 text-2xl font-bold text-[#1B2A4A]">
          {title}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

/* ── Table of Contents ───────────────────────────────────────── */
const tocItems = [
  { id: 'summary', label: 'Executive Summary' },
  { id: 'verdict', label: 'Bottom-Line Verdict' },
  { id: 'irs-framework', label: 'IRS Legal Framework' },
  { id: 'lmn-requirements', label: 'LMN Requirements' },
  { id: 'hsa-fsa', label: 'HSA vs FSA Distinctions' },
  { id: 'home-care', label: 'Home Care Specific Rules' },
  { id: 'case-law', label: 'Landmark Case: Estate of Baral' },
  { id: 'risks', label: 'Risk Analysis (6 Categories)' },
  { id: 'competitors', label: 'Competitive Landscape' },
  { id: 'ai-documentation', label: 'AI-Assisted Documentation' },
  { id: 'structure', label: 'Structural Recommendations' },
  { id: 'attorney-questions', label: 'Questions for Attorney' },
  { id: 'sources', label: 'Sources & Citations' },
];

export default function LegalReviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="md" />
          </button>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 border border-red-200">
              CONFIDENTIAL — INTERNAL USE ONLY
            </span>
            <button
              onClick={() => navigate('/internal')}
              className="text-sm text-[#0D7377] hover:underline"
            >
              ← Back to Directory
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Title */}
        <Reveal>
          <div className="mb-12 text-center">
            <div className="inline-block rounded-full bg-[#0D7377]/10 px-4 py-1.5 text-sm font-semibold text-[#0D7377] mb-4">
              Legal & Regulatory Analysis
            </div>
            <h1 className="text-4xl font-bold text-[#1B2A4A] mb-3">
              HSA/FSA Eligibility via Letters of Medical Necessity
            </h1>
            <p className="text-lg text-slate-500">
              Comprehensive legal framework analysis for co-op.care's physician-reviewed LMN model
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Research date: March 22, 2026 · 40+ primary sources
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sticky TOC */}
          <Reveal delay={0.1}>
            <nav className="hidden lg:block sticky top-24 self-start">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contents
                </h3>
                <ul className="space-y-2">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-sm text-slate-600 hover:text-[#0D7377] transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </Reveal>

          {/* Content */}
          <div>
            {/* EXECUTIVE SUMMARY */}
            <Section id="summary" title="Executive Summary">
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-slate-700 leading-relaxed mb-6">
                  co-op.care's LMN model sits at the intersection of two well-established legal
                  frameworks — HSA/FSA eligibility under IRC 213(d) and physician-issued Letters of
                  Medical Necessity — but also in a zone of increasing IRS scrutiny.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-5">
                    <h4 className="font-bold text-emerald-800 mb-3">✓ What Works</h4>
                    <ul className="space-y-2 text-sm text-emerald-900">
                      <li>
                        • IRS Pub 502 and IRC §213(d) explicitly allow home care for{' '}
                        <strong>chronically ill individuals</strong> under a physician plan of care
                      </li>
                      <li>
                        • <em>Estate of Baral v. Commissioner</em> (2011) confirmed even{' '}
                        <strong>unlicensed caregivers</strong> can provide deductible services
                      </li>
                      <li>• A DO is fully qualified to issue LMNs</li>
                      <li>
                        • Telehealth-based assessments are acceptable for physician-patient
                        relationship
                      </li>
                      <li>
                        • Multiple companies (Truemed, Flex, Sika Health) already operate
                        LMN-to-HSA/FSA models at scale
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-red-50 border border-red-200 p-5">
                    <h4 className="font-bold text-red-800 mb-3">✗ What Doesn't</h4>
                    <ul className="space-y-2 text-sm text-red-900">
                      <li>
                        • IRS issued <strong>IR-2024-65</strong> (March 2024) specifically targeting
                        LMN-facilitating companies
                      </li>
                      <li>
                        • Self-referral risk: Josh has financial interest in the company providing
                        the care services
                      </li>
                      <li>
                        • <strong>General companion care</strong> for healthy elderly does NOT
                        qualify regardless of LMN
                      </li>
                      <li>
                        • Colorado proposed mini-Stark legislation (2026) adds disclosure
                        requirements
                      </li>
                      <li>
                        • State laws vary widely — FL, NY, CA extend self-referral rules to ALL
                        payers
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            {/* VERDICT */}
            <Section id="verdict" title="Bottom-Line Verdict">
              <div className="rounded-xl border-2 border-[#0D7377] bg-[#0D7377]/5 p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 h-12 w-12 rounded-full bg-[#0D7377] flex items-center justify-center">
                    <span className="text-2xl text-white">⚖</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1B2A4A] mb-3">
                      Legally Defensible IF Structured Correctly
                    </h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      The model is{' '}
                      <strong>not a universal HSA/FSA unlock for all companion care</strong>. It
                      works for a specific, well-defined patient population:{' '}
                      <strong>
                        chronically ill individuals who need ADL assistance under a physician plan
                        of care
                      </strong>
                      . Attempting to make general companion care HSA/FSA eligible for anyone who
                      wants it would likely fail IRS scrutiny.
                    </p>
                    <div className="rounded-lg bg-white border border-[#0D7377]/20 p-4">
                      <h4 className="font-semibold text-[#1B2A4A] mb-2">
                        Qualifying Population (IRC 7702B)
                      </h4>
                      <p className="text-sm text-slate-700">
                        A licensed health care practitioner must certify within the prior 12 months
                        that the individual:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        <li>
                          • Is unable to perform at least <strong>2 of 6 ADLs</strong> (eating,
                          toileting, transferring, bathing, dressing, continence) without
                          substantial assistance for at least <strong>90 days</strong>, OR
                        </li>
                        <li>
                          • Requires <strong>substantial supervision</strong> due to severe
                          cognitive impairment
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* IRS FRAMEWORK */}
            <Section id="irs-framework" title="IRS Legal Framework">
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-[#1B2A4A] mb-3">
                    IRC Section 213(d): Definition of "Medical Care"
                  </h3>
                  <p className="text-sm text-slate-700 mb-3">
                    Medical care includes amounts paid for:
                  </p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• Diagnosis, cure, mitigation, treatment, or prevention of disease</li>
                    <li>• Affecting any structure or function of the body</li>
                    <li>• Transportation primarily for medical care</li>
                    <li>• Insurance covering medical care</li>
                  </ul>
                  <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-sm text-amber-900 italic">
                      "Medical care expenses must be primarily to alleviate or prevent a physical or
                      mental defect or illness. They do not include expenses that are merely
                      beneficial to general health."
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-[#1B2A4A] mb-3">
                    IRS Publication 502: Home Care Specifics
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#0D7377] text-sm mb-2">
                        Nursing Services
                      </h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>
                          • Services need NOT be performed by a nurse — just "of a kind generally
                          performed by a nurse"
                        </li>
                        <li>
                          • Includes: medication, wound care, bathing/grooming related to medical
                          condition
                        </li>
                        <li>
                          • Must divide time between medical and non-medical tasks — only medical
                          portion deductible
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0D7377] text-sm mb-2">
                        Long-Term Care Services (Chronically Ill)
                      </h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        <li>
                          • "Maintenance and personal care services" ARE deductible for chronically
                          ill individuals
                        </li>
                        <li>• Must be pursuant to a physician-prescribed plan of care</li>
                        <li>
                          • This is co-op.care's primary pathway — allows full ADL assistance to be
                          deductible
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                      <h4 className="font-semibold text-red-800 text-sm mb-1">
                        What is NOT Deductible
                      </h4>
                      <p className="text-sm text-red-900 italic">
                        "You can't include in medical expenses the cost of household help, even if
                        such help is recommended by a doctor."
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Companion care that is primarily social/emotional rather than medical does
                        not qualify.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                  <h3 className="font-bold text-red-800 mb-3">
                    ⚠ IRS Alert IR-2024-65 (March 2024)
                  </h3>
                  <p className="text-sm text-red-900 mb-3">
                    The IRS specifically warned about companies "misleading taxpayers into believing
                    nutrition, wellness, or general health expenses can be reimbursable simply by
                    obtaining a note from a doctor."
                  </p>
                  <ul className="space-y-1 text-sm text-red-800">
                    <li>
                      • "Documentation based on self-reported health information cannot convert
                      personal expenses into medical expenses"
                    </li>
                    <li>
                      • Plans that reimburse non-medical expenses risk losing qualified tax-favored
                      status entirely
                    </li>
                    <li>• Directly targets companies like Truemed (98%+ approval rate)</li>
                  </ul>
                </div>
              </div>
            </Section>

            {/* LMN REQUIREMENTS */}
            <Section id="lmn-requirements" title="LMN Requirements">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-[#1B2A4A] mb-3">What an LMN Must Contain</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-2">
                      <span className="text-[#0D7377]">✓</span> Patient name and identifying
                      information
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#0D7377]">✓</span> Specific diagnosis (ICD-10 codes
                      recommended)
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#0D7377]">✓</span> Medical justification for the
                      service
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#0D7377]">✓</span> Frequency, duration, and scope
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#0D7377]">✓</span> Provider name, credentials, license
                      number
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#0D7377]">✓</span> Provider signature on letterhead
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#0D7377]">✓</span> Date of issuance (valid 12 months)
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-[#1B2A4A] mb-3">Who Can Issue</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
                      <span className="text-lg">👨‍⚕️</span>
                      <div>
                        <p className="font-semibold text-sm text-emerald-800">
                          DO (Josh Emdur) — Fully Qualified
                        </p>
                        <p className="text-xs text-emerald-600">
                          50-state licensed, meets all requirements
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      Also qualified: MD, NP, PA (if licensed and treating)
                    </p>
                    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <h4 className="font-semibold text-blue-800 text-sm mb-1">
                        Telehealth Acceptable
                      </h4>
                      <p className="text-xs text-blue-700">
                        LMNs are not prescriptions for controlled substances — DEA telehealth rules
                        don't apply. Synchronous video evaluation is best practice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* HSA vs FSA */}
            <Section id="hsa-fsa" title="HSA vs FSA Distinctions">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-[#0D7377] flex items-center justify-center text-white text-sm font-bold">
                      H
                    </div>
                    <h3 className="font-bold text-[#1B2A4A]">HSA (Easier Path)</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>
                      • <strong>Owned by individual</strong> — no administrative gatekeeper
                    </li>
                    <li>• Custodians generally do NOT pre-approve withdrawals</li>
                    <li>• Burden of proof on individual at tax time / IRS audit</li>
                    <li>
                      • Non-medical distributions: income tax + <strong>20% penalty</strong>
                    </li>
                    <li>• Funds roll over year to year</li>
                    <li>• Individual keeps LMN with tax records</li>
                  </ul>
                  <div className="mt-3 rounded bg-emerald-50 p-2 text-xs text-emerald-800">
                    Lower friction for families — self-determined eligibility
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white text-sm font-bold">
                      F
                    </div>
                    <h3 className="font-bold text-[#1B2A4A]">FSA (Stronger Footing)</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>
                      • <strong>Employer-sponsored</strong> with Third-Party Administrator
                    </li>
                    <li>• TPA reviews/substantiates claims BEFORE reimbursement</li>
                    <li>• LMN must be submitted to plan administrator</li>
                    <li>• "Use it or lose it" (limited carryover)</li>
                    <li>• Multi-level appeal process</li>
                    <li>• If TPA approves = stronger legal footing</li>
                  </ul>
                  <div className="mt-3 rounded bg-blue-50 p-2 text-xs text-blue-800">
                    More friction, but if approved, provides stronger legal protection
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h4 className="font-bold text-amber-800 mb-2">Critical Marketing Rule</h4>
                <p className="text-sm text-amber-900">
                  co-op.care should <strong>NEVER guarantee</strong> HSA/FSA eligibility. Use
                  language like "may be eligible" and "families should verify with their plan
                  administrator." co-op.care provides the LMN; eligibility is ultimately the
                  individual's and plan's determination.
                </p>
              </div>
            </Section>

            {/* HOME CARE SPECIFIC */}
            <Section id="home-care" title="Home Care Specific Rules">
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-6">
                    <h3 className="font-bold text-emerald-800 mb-3">
                      Pathway 1: Nursing-Type Services
                    </h3>
                    <p className="text-xs text-emerald-600 mb-3">
                      (Any patient with medical condition)
                    </p>
                    <ul className="space-y-2 text-sm text-emerald-900">
                      <li>• Services "of a kind generally performed by a nurse"</li>
                      <li>• Medication management, wound care, vital signs</li>
                      <li>
                        • Bathing/grooming <strong>related to medical condition</strong>
                      </li>
                      <li>• Must split time: only medical portion deductible</li>
                      <li>• Caregiver does NOT need nursing license</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border-2 border-[#0D7377] bg-[#0D7377]/5 p-6">
                    <h3 className="font-bold text-[#0D7377] mb-3">Pathway 2: Long-Term Care</h3>
                    <p className="text-xs text-[#0D7377] mb-3">
                      (Chronically ill only — co-op.care's primary pathway)
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li>• Patient certified as chronically ill (2+ ADLs, 90+ days)</li>
                      <li>• Under physician-prescribed plan of care</li>
                      <li>
                        • <strong>"Maintenance and personal care" ARE deductible</strong>
                      </li>
                      <li>• Allows full ADL assistance to be deductible</li>
                      <li>• Stronger legal basis for companion care services</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-[#1B2A4A] mb-3">Industry Landscape</h3>
                  <p className="text-sm text-slate-700 mb-3">
                    Major home care companies (Honor, Home Instead, BrightStar, Visiting Angels) do{' '}
                    <strong>NOT</strong> actively market HSA/FSA payment or facilitate LMNs.
                    Existing LMN platforms (Truemed, Flex, Sika) focus on <strong>products</strong>
                    (supplements, fitness equipment), not <strong>ongoing care services</strong>.
                  </p>
                  <div className="rounded-lg bg-[#0D7377]/10 p-3">
                    <p className="text-sm font-semibold text-[#0D7377]">
                      co-op.care would be pioneering the LMN-to-HSA/FSA model for home care services
                      — both an opportunity (no competition) and a risk (no proven precedent).
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* CASE LAW */}
            <Section id="case-law" title="Landmark Case: Estate of Baral v. Commissioner">
              <div className="rounded-xl border-2 border-[#1B2A4A] bg-[#1B2A4A] p-8 text-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                    ⚖
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Estate of Baral v. Commissioner</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      137 T.C. No. 1, 2011 — co-op.care's Strongest Precedent
                    </p>
                    <div className="space-y-3 text-sm text-slate-200">
                      <p>
                        Lillian Baral had dementia requiring 24-hour care per her physician. Two{' '}
                        <strong>unlicensed</strong> caregivers provided care (bathing, dressing,
                        medication management, wheelchair transfers).
                      </p>
                      <p>~$50,000 in caregiver expenses were claimed as medical deductions.</p>
                      <p className="text-emerald-300 font-bold text-base">
                        Tax Court ruled in favor of the estate.
                      </p>
                      <div className="rounded-lg bg-white/10 p-4 mt-4">
                        <h4 className="font-semibold mb-2">Key Factors:</h4>
                        <ul className="space-y-1">
                          <li>✓ Physician diagnosis of chronic illness</li>
                          <li>✓ Physician-prescribed plan of care</li>
                          <li>✓ Caregivers performing qualified long-term care services</li>
                          <li>✓ Caregiver licensing/credentials NOT required</li>
                        </ul>
                      </div>
                      <p className="mt-4 text-emerald-300">
                        This directly supports co-op.care's model: Josh certifies chronic illness,
                        prescribes plan of care, co-op.care caregivers provide ADL assistance →
                        costs qualify as HSA/FSA eligible medical expenses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* RISK ANALYSIS */}
            <Section id="risks" title="Risk Analysis">
              <div className="space-y-6">
                {/* Risk 1 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1B2A4A]">
                      1. Self-Referral / Conflict of Interest
                    </h3>
                    <RiskBadge level="high" />
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    Josh issuing LMNs that direct patients to his own company's services is the{' '}
                    <strong>single largest structural risk</strong>.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-red-50 p-3">
                      <h4 className="text-xs font-bold text-red-800 mb-2">EXPOSURE</h4>
                      <ul className="space-y-1 text-xs text-red-700">
                        <li>• Federal Stark/AKS: low risk for private-pay</li>
                        <li>• FL, NY, CA extend to ALL payers — felony in FL</li>
                        <li>• CO proposed mini-Stark (2026): disclosure req'd</li>
                        <li>• 50-state practice = most restrictive state governs</li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <h4 className="text-xs font-bold text-emerald-800 mb-2">MITIGATION</h4>
                      <ul className="space-y-1 text-xs text-emerald-700">
                        <li>• Structural separation: Josh evaluates through Automate Clinic</li>
                        <li>• co-op.care delivers care as separate entity</li>
                        <li>• Full financial disclosure to patients</li>
                        <li>• No requirement to use co-op.care after LMN</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Risk 2 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1B2A4A]">2. "LMN Mill" Perception</h3>
                    <RiskBadge level="moderate-high" />
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    IRS IR-2024-65 specifically targets companies facilitating LMNs based on
                    "self-reported health information."
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-red-50 p-3">
                      <h4 className="text-xs font-bold text-red-800 mb-2">RED FLAGS</h4>
                      <ul className="space-y-1 text-xs text-red-700">
                        <li>• 98%+ approval rates (Truemed criticism)</li>
                        <li>• Async form-only review (no live evaluation)</li>
                        <li>• Generic boilerplate LMN language</li>
                        <li>• High volume from single physician</li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <h4 className="text-xs font-bold text-emerald-800 mb-2">MITIGATION</h4>
                      <ul className="space-y-1 text-xs text-emerald-700">
                        <li>• Video telehealth evaluations (not forms)</li>
                        <li>• Maintain reasonable denial rate</li>
                        <li>• Individualized LMN language per patient</li>
                        <li>• Detailed clinical records for each patient</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Risk 3 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1B2A4A]">3. AI-Assisted Documentation</h3>
                    <RiskBadge level="moderate" />
                  </div>
                  <p className="text-sm text-slate-700 mb-3">
                    Multiple states now require disclosure of AI involvement and prohibit AI from
                    generating treatment plans without physician review.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-2 pr-3 text-left text-slate-500">State</th>
                          <th className="py-2 pr-3 text-left text-slate-500">Law</th>
                          <th className="py-2 text-left text-slate-500">Key Requirement</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-600">
                        <tr className="border-b border-slate-100">
                          <td className="py-2 pr-3 font-medium">Texas</td>
                          <td className="py-2 pr-3">SB 1188</td>
                          <td className="py-2">
                            Must "personally review all AI-generated content"
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 pr-3 font-medium">California</td>
                          <td className="py-2 pr-3">AB 3030</td>
                          <td className="py-2">Must disclose AI involvement</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 pr-3 font-medium">Illinois</td>
                          <td className="py-2 pr-3">WOPRA</td>
                          <td className="py-2">
                            AI cannot generate plans without physician approval
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3 font-medium">Colorado</td>
                          <td className="py-2 pr-3">AI Law 2/2026</td>
                          <td className="py-2">Comprehensive AI requirements (first state)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Risk 4 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1B2A4A]">4. IRS Audit Risk to Families</h3>
                    <RiskBadge level="moderate" />
                  </div>
                  <p className="text-sm text-slate-700">
                    HSA holders bear burden of proof. If audited, non-qualifying expenses = income
                    tax + <strong>20% penalty</strong>. co-op.care would not be directly liable, but
                    reputational damage would be significant.
                    <strong> Never guarantee eligibility in marketing.</strong>
                  </p>
                </div>

                {/* Risk 5 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1B2A4A]">5. Anti-Kickback / Stark</h3>
                    <RiskBadge level="low-moderate" />
                  </div>
                  <p className="text-sm text-slate-700">
                    Federal AKS/Stark likely don't apply to private-pay model. Risk increases if
                    co-op.care ever accepts Medicare/Medicaid.{' '}
                    <strong>Stay purely private-pay initially.</strong>
                  </p>
                </div>

                {/* Risk 6 */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1B2A4A]">6. False Claims Act</h3>
                    <RiskBadge level="low" />
                  </div>
                  <p className="text-sm text-slate-700">
                    Low for pure private-pay. Fraudulent LMNs could theoretically be tax fraud (IRC
                    7206/7207), not FCA. Risk increases significantly if ever touching
                    Medicare/Medicaid.
                  </p>
                </div>
              </div>
            </Section>

            {/* COMPETITORS */}
            <Section id="competitors" title="Competitive Landscape">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#1B2A4A]">
                      <th className="py-3 pr-4 text-left text-[#1B2A4A]">Company</th>
                      <th className="py-3 pr-4 text-left text-[#1B2A4A]">Model</th>
                      <th className="py-3 pr-4 text-left text-[#1B2A4A]">Focus</th>
                      <th className="py-3 pr-4 text-left text-[#1B2A4A]">Physician Process</th>
                      <th className="py-3 text-left text-[#1B2A4A]">Funding</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-semibold">Truemed</td>
                      <td className="py-3 pr-4">Payment + LMN</td>
                      <td className="py-3 pr-4">Wellness products</td>
                      <td className="py-3 pr-4">Async questionnaire, 98%+ approval</td>
                      <td className="py-3">$44.1M</td>
                    </tr>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <td className="py-3 pr-4 font-semibold">Flex</td>
                      <td className="py-3 pr-4">Checkout + LMN</td>
                      <td className="py-3 pr-4">Retail/wellness</td>
                      <td className="py-3 pr-4">Short form at checkout</td>
                      <td className="py-3">Active</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-semibold">Sika Health</td>
                      <td className="py-3 pr-4">HSA/FSA enablement</td>
                      <td className="py-3 pr-4">E-commerce</td>
                      <td className="py-3 pr-4">Async telehealth, 12hr turnaround</td>
                      <td className="py-3">Active</td>
                    </tr>
                    <tr className="bg-[#0D7377]/5 border-2 border-[#0D7377]">
                      <td className="py-3 pr-4 font-bold text-[#0D7377]">co-op.care</td>
                      <td className="py-3 pr-4 font-semibold text-[#0D7377]">
                        LMN + Care Services
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#0D7377]">Home care (ADL)</td>
                      <td className="py-3 pr-4 font-semibold text-[#0D7377]">
                        Video eval + AI-assist + physician review
                      </td>
                      <td className="py-3 font-semibold text-[#0D7377]">Pre-seed</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 rounded-lg bg-[#0D7377]/10 p-3">
                  <p className="text-sm font-semibold text-[#0D7377]">
                    Key differentiator: ALL existing LMN platforms sell LMNs for products.
                    co-op.care issues LMNs for actual medical care services to chronically ill
                    individuals — much stronger legal footing under IRC 7702B.
                  </p>
                </div>
              </div>
            </Section>

            {/* AI DOCUMENTATION */}
            <Section id="ai-documentation" title="AI-Assisted Documentation">
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-[#1B2A4A] mb-3">Legal Status</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• No federal law prohibits AI from drafting clinical documents</li>
                    <li>
                      • Physician remains <strong>fully liable</strong> for all content they sign
                    </li>
                    <li>
                      • AI-generated documents treated legally same as scribe-drafted documents
                    </li>
                    <li>• AMA: Physicians must be "full partners throughout the AI lifecycle"</li>
                    <li>
                      • FSMB: Automatic signatures on AI content are <strong>discouraged</strong>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#0D7377] bg-[#0D7377]/5 p-6">
                  <h3 className="font-bold text-[#0D7377] mb-3">Best Practices for co-op.care</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      'Josh must meaningfully review each AI-drafted LMN — not rubber-stamp',
                      'Modify as needed — demonstrate independent clinical judgment',
                      'Disclose AI involvement to patients (required in CA, TX)',
                      'Maintain clinical records separate from AI draft',
                      'Regular audits of AI-generated content quality',
                      'Keep denial rate reasonable — 100% approval suggests insufficient review',
                    ].map((item, i) => (
                      <div key={i} className="flex gap-2 items-start text-sm text-slate-700">
                        <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-[#0D7377] text-white text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* STRUCTURAL RECOMMENDATIONS */}
            <Section id="structure" title="Structural Recommendations">
              <div className="space-y-4">
                {[
                  {
                    num: '1',
                    title: 'Separate LMN from Care Delivery',
                    desc: 'Josh evaluates patients through Automate Clinic (separate clinical entity). co-op.care provides care services. This creates organizational separation between referral and service.',
                    critical: true,
                  },
                  {
                    num: '2',
                    title: 'Target Correct Patient Population',
                    desc: 'Focus LMN marketing on families with chronically ill individuals (2+ ADL deficits OR cognitive impairment). Do NOT market for general companion care or healthy elderly.',
                    critical: true,
                  },
                  {
                    num: '3',
                    title: 'Build Genuine Clinical Evaluations',
                    desc: 'Video telehealth evaluations (not form review). Document cognitive/functional assessment findings. Use ICD-10 codes and individualized LMN language.',
                    critical: false,
                  },
                  {
                    num: '4',
                    title: 'Never Guarantee HSA/FSA Eligibility',
                    desc: 'Marketing: "may be eligible" and "consult your plan administrator." co-op.care provides the LMN; eligibility is the individual\'s determination.',
                    critical: true,
                  },
                  {
                    num: '5',
                    title: 'Stay Purely Private-Pay Initially',
                    desc: 'Avoid Medicare/Medicaid involvement. Keeps federal AKS and Stark largely inapplicable. Re-evaluate structure before accepting government payer.',
                    critical: false,
                  },
                  {
                    num: '6',
                    title: 'Get Healthcare Attorney Opinion',
                    desc: 'Colorado-specific self-referral rules, 2026 mini-Stark legislation, state-by-state analysis for high-volume LMN states.',
                    critical: true,
                  },
                  {
                    num: '7',
                    title: 'Document Everything',
                    desc: 'Clinical rationale per LMN, time tracking (medical vs non-medical), AI review/modification records, patient consent for AI documentation.',
                    critical: false,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border ${item.critical ? 'border-[#0D7377] bg-[#0D7377]/5' : 'border-slate-200 bg-white'} p-5 shadow-sm`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-full ${item.critical ? 'bg-[#0D7377]' : 'bg-slate-300'} text-white flex items-center justify-center font-bold`}
                      >
                        {item.num}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1B2A4A] mb-1">
                          {item.title}
                          {item.critical && (
                            <span className="ml-2 text-xs text-red-600 font-normal">
                              (Critical)
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ATTORNEY QUESTIONS */}
            <Section id="attorney-questions" title="Questions for Healthcare Attorney">
              <div className="rounded-xl border-2 border-[#1B2A4A] bg-white p-6">
                <ol className="space-y-4">
                  {[
                    "Does Josh's dual role (co-founder/CMO + LMN-issuing physician) create an impermissible self-referral under any state law?",
                    'What structural separation would protect against self-referral claims? Is Automate Clinic → co-op.care sufficient?',
                    'Can co-op.care market HSA/FSA eligibility as a feature, or must this be family-initiated?',
                    "What are the disclosure requirements for Josh's financial interest when issuing LMNs?",
                    'Does the proposed 2026 Colorado mini-Stark bill affect this model?',
                    'What are the tax fraud implications if an LMN is later determined unsupported?',
                    "Is there exposure under state consumer protection laws if families' claims are denied?",
                    'What is the standard for "meaningful physician review" of AI-generated LMNs in Colorado?',
                  ].map((q, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full bg-[#1B2A4A] text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-700">{q}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Section>

            {/* SOURCES */}
            <Section id="sources" title="Sources & Citations">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-bold text-[#1B2A4A] mb-3 text-sm">IRS / Tax Law</h4>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• IRS Publication 502 (2025)</li>
                      <li>• 26 U.S.C. Section 213 — Medical Care Definition</li>
                      <li>• 26 U.S.C. Section 7702B — Chronically Ill Individual</li>
                      <li>• IRS Publication 969 — HSA/FSA Rules</li>
                      <li>• IRS Alert IR-2024-65 (March 2024)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B2A4A] mb-3 text-sm">Case Law</h4>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• Estate of Baral v. Commissioner, 137 T.C. No. 1 (2011)</li>
                      <li>• IRS Revenue Ruling 2002-19</li>
                      <li>• Polyak v. Commissioner, 94 T.C. 337 (1990)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B2A4A] mb-3 text-sm">Federal Statute</h4>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• OIG Fraud & Abuse Laws</li>
                      <li>• CMS Physician Self-Referral (Stark)</li>
                      <li>• Anti-Kickback Statute (42 U.S.C. § 1320a-7b)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1B2A4A] mb-3 text-sm">State Law & Guidance</h4>
                    <ul className="space-y-1 text-xs text-slate-600">
                      <li>• Colorado SB18-115 (Stark expansion)</li>
                      <li>• Texas SB 1188, California AB 3030/489</li>
                      <li>• Illinois WOPRA, Colorado AI Law (2/2026)</li>
                      <li>• FSMB & AMA AI Governance Guidelines</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* Footer */}
        <Reveal>
          <footer className="mt-16 border-t border-slate-200 pt-8 text-center">
            <p className="text-sm text-slate-400">
              Prepared for co-op.care internal use · March 2026 · Confidential
            </p>
            <p className="text-xs text-slate-300 mt-1">
              This analysis is for informational purposes and does not constitute legal advice.
              Consult a qualified healthcare attorney for specific guidance.
            </p>
          </footer>
        </Reveal>
      </main>
    </div>
  );
}
