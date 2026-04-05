/**
 * FAQPage — Comprehensive FAQ for families, partners, and BCH team
 *
 * Covers: how co-op.care works, physician oversight, pricing,
 * HSA/FSA eligibility, cooperative model, palliative/aging care,
 * PACE gap, technology, and partnership details.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TileIcon } from '../../components/TileIcon';
import PageLayout from '../../components/layout/PageLayout';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  icon: string;
  items: FAQItem[];
}

const sections: FAQSection[] = [
  {
    title: 'About co-op.care',
    icon: 'heart',
    items: [
      {
        q: 'What is co-op.care?',
        a: 'co-op.care is a worker-owned cooperative that provides physician-supervised companion care for aging adults and their families. We combine five care sources — professional caregivers, family members, neighbors, community volunteers, and AI-assisted coordination — under one physician who reviews every care plan. Our $59/month membership includes physician oversight, care coordination, and a Letter of Medical Necessity for HSA/FSA eligibility.',
      },
      {
        q: 'How is co-op.care different from a traditional home care agency?',
        a: 'Traditional agencies are staffing companies — they send whoever is available, experience 65-80% annual turnover, and extract profits from caregivers and families. co-op.care is a Limited Cooperative Association where caregivers are W-2 employees earning $25-28/hr with equity ownership. Our projected turnover is 15% because caregivers are building something they own. Every visit produces structured clinical data (Omaha System-coded, FHIR R4-ready), and a real physician reviews every care plan.',
      },
      {
        q: 'What is a Limited Cooperative Association (LCA)?',
        a: 'An LCA is a legal entity under Colorado law that allows worker-owners and investor-members to share governance. Our caregivers earn equity as they work, giving them a real stake in the company. This structure aligns with nonprofit health system values because it prioritizes community benefit over corporate extraction.',
      },
      {
        q: 'Where does co-op.care operate?',
        a: "We are launching in Boulder, Colorado, with plans to federate to other communities. Our physician-supervised Letter of Medical Necessity (LMN) service is available nationally through Dr. Josh Emdur's 50-state medical licensure.",
      },
    ],
  },
  {
    title: 'Clinical Oversight & Leadership',
    icon: 'stethoscope',
    items: [
      {
        q: 'Who provides physician oversight?',
        a: 'Josh Emdur, DO — a Boulder Community Health hospitalist since 2008, with 50-state medical licensure. He reviews every care plan, signs Letters of Medical Necessity, and provides clinical direction. He previously served as CMO of SteadyMD and is currently CMO of Automate Clinic.',
      },
      {
        q: 'What does physician oversight include?',
        a: 'Dr. Emdur reviews care plans, evaluates assessment data (CII, CRI, PROMIS-29), signs physician orders, and issues Letters of Medical Necessity for HSA/FSA eligibility. He does not provide direct patient care through co-op.care — he provides clinical supervision and documentation review.',
      },
      {
        q: 'What clinical assessments do you use?',
        a: 'We use validated instruments: the Caregiver Impact Index (CII) for family burnout, the Care Recipient Index (CRI) for patient acuity, and PROMIS-29 for patient-reported outcomes. Visit data is coded using the Omaha System nursing classification and stored in FHIR R4 format for interoperability with health systems.',
      },
      {
        q: 'What is the Omaha System?',
        a: 'The Omaha System is a standardized nursing classification used in community health, home care, and public health. It maps problems, interventions, and outcomes across 42 health domains. We chose it because it was designed specifically for community-based care — unlike ICD-10 or CPT, which were designed for hospital billing. Our AI pipeline automatically classifies every care interaction into Omaha codes.',
      },
    ],
  },
  {
    title: 'Services & Pricing',
    icon: 'card',
    items: [
      {
        q: 'What does the $59/month membership include?',
        a: 'The membership includes: physician oversight of your care plan by Dr. Emdur, a Letter of Medical Necessity for HSA/FSA eligibility, access to Sage (our AI care companion) for scheduling, check-ins, and care questions, ongoing care coordination, and a digital Comfort Card with your care profile. Companion care hours are billed separately based on your care tier.',
      },
      {
        q: 'What are the care tiers?',
        a: 'We offer four tiers based on needs: Seedling (light support, 2-4 hrs/week, ~$400-600/mo), Roots (moderate support, 8-12 hrs/week, ~$1,200-2,400/mo), Canopy (comprehensive care, 20+ hrs/week, ~$3,000-6,000/mo), and Grove (full-time care, 40+ hrs/week, ~$6,000-12,000/mo). All tiers include physician oversight and Sage.',
      },
      {
        q: 'Is co-op.care covered by insurance?',
        a: "Companion care is not currently covered by traditional health insurance. However, Dr. Emdur's Letter of Medical Necessity makes our services eligible for HSA/FSA reimbursement, which can provide significant tax savings (25-35% depending on your bracket). We are also pursuing Medicare billing codes (PIN, CHI, CCM) for eligible patients.",
      },
      {
        q: 'What Medicare billing codes apply?',
        a: 'Our physician-supervised model unlocks several Medicare codes: Principal Illness Navigation (G0023-G0024, ~$78-127/patient/month), Community Health Integration (G0019-G0022, ~$78-127/patient/month), and Chronic Care Management (99490-99491, ~$60-106/patient/month). These can be stacked for eligible patients, potentially generating $85-359/patient/month in Medicare revenue.',
      },
    ],
  },
  {
    title: 'HSA/FSA & Letters of Medical Necessity',
    icon: 'shield',
    items: [
      {
        q: 'What is a Letter of Medical Necessity (LMN)?',
        a: 'An LMN is a document signed by a licensed physician stating that specific care services are medically necessary for a patient. Under IRS guidelines, an LMN can make certain care expenses eligible for reimbursement from Health Savings Accounts (HSAs) and Flexible Spending Accounts (FSAs).',
      },
      {
        q: 'How does the LMN process work?',
        a: 'After your initial assessment with Sage, our AI generates a draft LMN based on your clinical profile (diagnoses, functional limitations, care needs). Dr. Emdur reviews and signs each letter personally — typically within 3-5 minutes per letter. The signed LMN is provided to you digitally for submission to your HSA/FSA administrator.',
      },
      {
        q: 'How much can families save with HSA/FSA?',
        a: "HSA/FSA contributions are pre-tax, meaning families save their marginal tax rate on every dollar spent. For a family in the 24% federal bracket with 4.55% Colorado state tax, that's nearly 30% savings on care expenses. On $1,000/month of care, that's $3,400+ in annual tax savings.",
      },
      {
        q: 'Do I need to itemize my taxes to use HSA/FSA?',
        a: 'No — and this is one of the biggest misconceptions. HSA and FSA are completely separate from itemizing on your tax return. HSA contributions are an "above-the-line" deduction that works whether you take the standard deduction or itemize. FSA is a pre-tax payroll deduction that never touches your tax return at all. The medical expense deduction on Schedule A does require itemizing, but that\'s a different mechanism entirely. The LMN unlocks HSA/FSA spending for everyone who has one of those accounts — roughly 63 million Americans with HSAs alone.',
      },
      {
        q: 'What about Medicare recipients — does the LMN help them?',
        a: "Medicare recipients can't contribute to HSAs (you lose HSA eligibility when you enroll in Medicare Part A). However, the LMN and co-op.care services benefit Medicare families in other ways: (1) Our services can be billed through Medicare codes — PIN (G0023-G0024), CHI (G0019-G0022), and CCM (99490-99491) — generating up to $359/patient/month in Medicare revenue when provided under physician oversight. (2) The CMS TEAM model (now active) bundles surgical episode payments for 30 days post-discharge — co-op.care's coordination directly reduces episode costs. (3) Families with both a Medicare parent AND working-age children may use the children's HSA/FSA for the parent's care expenses with a valid LMN.",
      },
    ],
  },
  {
    title: 'For Healthcare Partners',
    icon: 'clipboard',
    items: [
      {
        q: 'What does a partnership with co-op.care look like?',
        a: 'We propose a 90-day zero-cost pilot: 5-10 post-discharge families (orthopedic, cardiac, or palliative preferred), one named BCH liaison for referral coordination, and weekly outcome tracking. At Day 90, we sit down with your team, review readmission rates, family satisfaction, and Omaha-coded health data, and decide on expansion together.',
      },
      {
        q: 'What does co-op.care need from BCH?',
        a: 'One thing: a named liaison who can coordinate referrals for 5-10 discharge families. We are NOT asking for money, IT integration, legal/MOU, or EHR access. We handle everything else — caregiver matching, care coordination, physician oversight, documentation, and billing.',
      },
      {
        q: 'How does co-op.care reduce readmissions?',
        a: "Project HEALS covers 10 days post-discharge. Day 11+, there's nothing. co-op.care fills that gap with continuous companion care, physician oversight, and structured health monitoring. Home-based palliative care has been shown to reduce total cost of care by 35% and readmissions by 25-40%. Every visit generates data — so you'll see the clinical impact in real numbers, not just anecdotes.",
      },
      {
        q: 'What about the PACE gap?',
        a: "TRU PACE in Lafayette serves Boulder County but requires nursing-home-level care certification and is Medicaid-centric. Patients who are too well for PACE, too young (under 55), above Medicaid income limits, or who won't give up their primary care physician fall into a massive gap. co-op.care serves exactly this population — moderate-acuity aging adults who need support but don't meet PACE criteria.",
      },
      {
        q: 'What is the CMS TEAM model and why does it matter?',
        a: "The Transforming Episode Accountability Model (TEAM) went live January 1, 2026. It makes 741 hospitals financially responsible for patient outcomes across a 30-day post-discharge episode for joint replacement, hip fracture, spinal fusion, CABG, and major bowel procedures. Two-thirds of affected hospitals are projected to lose money under TEAM. co-op.care's post-discharge services — caregiver training, medication reconciliation, telehealth follow-ups, Omaha-coded outcome tracking — directly reduce the episode cost that TEAM measures. At $35/hr vs. $38-45/hr from competitors, we're also the most cost-effective option.",
      },
      {
        q: 'What is the CMS ACCESS Model and why is it urgent?',
        a: 'CMS ACCESS (Advancing Chronic Care with Effective, Scalable Solutions) is a new 10-year demonstration model launching July 2026. The application deadline is April 1, 2026 — this is a once-in-a-decade opportunity. It offers Outcome-Aligned Payments for chronic disease management across four tracks: cardio-kidney-metabolic, musculoskeletal pain, behavioral health, and early CKM. co-op.care + BCH could apply jointly, with Dr. Emdur as Medical Director.',
      },
      {
        q: 'What data does co-op.care produce?',
        a: 'Every care interaction — whether from a professional caregiver, family member, or neighbor — flows through our AI pipeline and produces: Omaha System-coded problem/intervention/outcome data, FHIR R4-formatted health records, PROMIS-29 patient-reported outcomes, CII/CRI assessment scores, and time-stamped visit documentation. This is hospital-grade data from home-based care.',
      },
    ],
  },
  {
    title: 'Technology',
    icon: 'brain',
    items: [
      {
        q: 'What is CareOS?',
        a: 'CareOS is our technology platform — the operating system for cooperative community care. It includes Sage (conversational AI for families), Living Profile (auto-built from every conversation), AmbientScribe (voice-to-clinical-documentation during visits), assessment tools (CII, CRI, PROMIS-29, video home assessment), and the Autonomous LMN Generation System.',
      },
      {
        q: 'What is Sage?',
        a: "Sage is our conversational AI companion. Families talk to Sage naturally — about their worries, their loved one's needs, scheduling, care questions. Sage builds a Living Profile from these conversations, surfaces relevant care stories from families like theirs, and coordinates care logistics. Voice is the interface — no forms, no portals, no passwords.",
      },
      {
        q: 'Is the technology HIPAA-compliant?',
        a: "We are building toward full HIPAA compliance with our infrastructure choices: FHIR R4 data standards, Health Samurai/Aidbox integration for clinical data storage, identity verification via driver's license capture, and role-based access controls. Our physician reviews occur within the secured platform.",
      },
      {
        q: 'Can I try the platform?',
        a: 'Yes. Visit co-op.care to see the homepage, talk to Sage, and explore the platform. The partners page at co-op.care/#/partners has specific information for healthcare organizations.',
      },
    ],
  },
  {
    title: 'For Caregivers (Care Neighbors)',
    icon: 'users',
    items: [
      {
        q: 'What does "worker-owned" mean for caregivers?',
        a: 'Our caregivers (we call them Care Neighbors) are W-2 employees who earn equity in the cooperative as they work. After a vesting period, they become worker-owners with voting rights on company decisions. This means caregivers build long-term wealth — not just a paycheck — and have a real voice in how care is delivered.',
      },
      {
        q: 'What do Care Neighbors earn?',
        a: '$25-28/hour W-2 with full benefits, plus equity ownership. Compare that to typical agency rates of $15-18/hour as 1099 contractors with no benefits. Our model costs more per hour but saves dramatically on turnover, training, and family satisfaction.',
      },
      {
        q: 'Why does the cooperative model reduce turnover?',
        a: "Three reasons: ownership (you're building equity, not just clocking hours), continuity (you work with the same family every week, building real relationships), and respect (W-2 status, benefits, physician backup, and a voice in company decisions). Industry turnover is 65-80%. We project 15%.",
      },
    ],
  },
  {
    title: 'Wellness, Yoga & Movement',
    icon: 'pulse',
    items: [
      {
        q: 'Does co-op.care include yoga and wellness?',
        a: "Yes. Yoga, gentle movement, stretching, breathing exercises, and meditation are part of every care plan — not extras. For caregivers, these activities prevent burnout and physical injury. For the person you're caring for, they reduce falls, improve sleep, and lower stress. Every session is tracked in the care plan and visible to the doctor.",
      },
      {
        q: 'Can I use my health savings account to pay for yoga?',
        a: "When yoga and wellness are prescribed by a doctor as part of your care plan, you can pay with pre-tax health savings (HSA or FSA). Dr. Emdur writes a letter explaining why it's medically needed — things like fall prevention, better mobility, or less stress. That letter lets you use health savings dollars, which saves families 28-36% compared to paying out of pocket.",
      },
      {
        q: 'What types of wellness activities are available?',
        a: 'Chair yoga for balance and mobility, gentle stretching for pain, guided breathing for stress and sleep, meditation for calm, walking groups for connection, and movement classes for fall prevention. Care Neighbors can lead these activities during visits — and every session produces real health data the doctor can see.',
      },
      {
        q: 'What is the Respite Fund and does it cover wellness?',
        a: "The Respite Fund is a community pool that helps caregivers who are running on empty. It covers yoga classes, meditation apps, massage, gym memberships, and anything that helps you recover. If your burnout score shows you're in the red zone, the Respite Fund steps in — no questions asked.",
      },
      {
        q: 'Can Care Neighbors lead yoga or wellness activities?',
        a: 'Absolutely. Many Care Neighbors have yoga, fitness, or wellness backgrounds. Leading a yoga session through the Time Bank is worth one hour — same as any other care task. Some neighbors focus on chair yoga for seniors, gentle stretching, or guided meditation. These skills are especially helpful for families dealing with mobility challenges or caregiver burnout.',
      },
    ],
  },
  {
    title: 'Boulder County & Aging',
    icon: 'home',
    items: [
      {
        q: 'Why Boulder?',
        a: "Boulder Community Health's 2025-2028 CHNA identifies healthy aging as the #1 community priority (47% of respondents). Boulder County's 60+ population is 73,526 today and projected to reach 111,685 by 2050. By 2030, 1 in 5 residents will be 65+. BCH is Boulder's only hospital — and their vision is to \"partner to create and care for the healthiest community in the nation.\" We're that partner.",
      },
      {
        q: 'What is the palliative care gap in Boulder?',
        a: "Colorado has only 3.0 certified palliative prescribers per 100,000 population. BCH's palliative team is small (2 APRNs + 3 part-time nurses) and primarily hospital-based. Only 5% of palliative-eligible patients nationally receive home-based palliative care. The hospital team cannot follow patients home — and that transition is where patients and families fall through.",
      },
      {
        q: "How does co-op.care fit with BCH's mission?",
        a: "BCH is a nonprofit, independent community hospital — not a corporate health system. co-op.care is a cooperative — not a corporate vendor. We share the same DNA: community benefit over profit extraction. Our model extends BCH's clinical reach into the home without requiring BCH to build and staff a home care division.",
      },
    ],
  },
];

function FAQAccordion({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:bg-warm-gray/30"
      >
        <span className="font-body text-[0.95rem] font-semibold leading-snug text-navy">
          {item.q}
        </span>
        <span
          className={`mt-0.5 flex-shrink-0 text-sage transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
        role="region"
      >
        <p className="font-body text-sm leading-relaxed text-text-secondary pr-8">{item.a}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PageLayout>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="px-6 pb-8 pt-12 md:px-12 md:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-sage">Frequently asked questions</p>
          <h1 className="mt-3 font-heading text-[2.2rem] font-bold leading-[1.1] text-navy md:text-[2.8rem]">
            Everything you need to know
            <br />
            about co-op.care.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-text-secondary">
            Five care sources. One physician. Worker-owned. Community-powered. Here's how it all
            works.
          </p>
        </div>
      </section>

      {/* ─── FAQ Sections ───────────────────────────────────── */}
      <section className="px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-2xl space-y-12">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/10">
                  <TileIcon name={section.icon} className="h-5 w-5 text-sage" />
                </div>
                <h2 className="font-heading text-lg font-bold text-navy">{section.title}</h2>
              </div>
              <div className="rounded-2xl border border-border/60 bg-white px-5">
                {section.items.map((item, i) => {
                  const key = `${section.title}-${i}`;
                  return (
                    <FAQAccordion
                      key={key}
                      item={item}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="bg-navy px-6 py-16 md:px-12">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-2xl font-bold text-white">Still have questions?</h2>
          <p className="mt-3 text-sm text-white/70">
            Talk to Sage — our AI companion can answer questions about your specific situation. Or
            reach out directly.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate('/card')}
              className="rounded-full bg-sage px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-dark active:scale-95"
            >
              Talk to Sage
            </button>
            <a
              href="mailto:blaine@co-op.care"
              className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
            >
              Email blaine@co-op.care
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
