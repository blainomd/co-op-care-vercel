/**
 * BSWProposal — Boulder Startup Week 2026 session proposal
 *
 * Private page at /#/bsw — not linked from any nav.
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Reveal } from '../../components/Reveal';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="mb-10">
        <h2 className="mb-4 border-b-2 border-[#0D7377] pb-2 text-xl font-bold text-[#1B2A4A]">
          {title}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

export default function BSWProposal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="md" />
          </button>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 border border-purple-200">
              BSW 2026 PROPOSAL
            </span>
            <button
              onClick={() => navigate('/internal')}
              className="text-sm text-[#0D7377] hover:underline"
            >
              ← Directory
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Hero */}
        <Reveal>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#1B2A4A] to-[#0D7377] flex items-center justify-center text-white text-xl">
                BSW
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Boulder Startup Week 2026</h1>
                <p className="text-sm text-slate-500">Session Proposal — May 4-8, 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
                <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Deadline</p>
                <p className="text-lg font-bold text-red-600">~April 1</p>
              </div>
              <div className="rounded-lg bg-[#0D7377]/10 border border-[#0D7377]/20 p-3 text-center">
                <p className="text-xs font-bold text-[#0D7377] uppercase tracking-wider">Event</p>
                <p className="text-lg font-bold text-[#1B2A4A]">May 4-8</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format</p>
                <p className="text-lg font-bold text-[#1B2A4A]">45 min</p>
              </div>
            </div>

            <a
              href="https://boulderstartupweek.com/volunteer/host-a-session"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0D7377] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5c5f] transition-colors"
            >
              Submit at boulderstartupweek.com
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </Reveal>

        {/* Session Title */}
        <Section title="Session Title">
          <div className="rounded-xl border-2 border-[#1B2A4A] bg-[#1B2A4A] p-6 text-white">
            <p className="text-xl font-bold leading-relaxed">
              "Your Parents Are Going to Need Help. Here's Why the $400B Home Care Industry Can't
              Provide It — and What Boulder Is Building Instead."
            </p>
          </div>
          <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Alternate Titles
            </h4>
            <ol className="space-y-1 text-sm text-slate-600 list-decimal list-inside">
              <li>
                "The Care Cooperative: How AI + Worker Ownership Is Fixing Home Care in Boulder"
              </li>
              <li>"$55/Hour and Nobody Wins: Rebuilding Home Care from Boulder"</li>
              <li>
                "When Your Parents Need Help: A Boulder Startup's Honest Playbook for Fixing Aging
                Care"
              </li>
              <li>
                "The Jevons Paradox of Care: Why Cheaper Home Care Creates MORE Jobs, Not Fewer"
              </li>
            </ol>
          </div>
        </Section>

        {/* Description */}
        <Section title="Session Description">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              15,000 Boulder residents are over 65. By 2030, that number doubles. Home care agencies
              charge families $55/hour, pay caregivers $16/hour, and lose 77% of their workforce
              every year. The math doesn't work for anyone.
            </p>
            <p>
              co-op.care is a Boulder-born, worker-owned cooperative that's rewriting the equation.
              Using AI-powered care assessments, physician-reviewed Letters of Medical Necessity
              that unlock HSA/FSA funds, and a cooperative ownership model where caregivers earn
              $26/hour W-2 with equity — we're proving that better care, better jobs, and lower
              costs aren't tradeoffs. They're the same thing.
            </p>
            <p>
              Join the founding team for an honest conversation about what it takes to build a
              healthcare company in Boulder that actually serves the community it's part of.
            </p>

            <div className="grid gap-3 md:grid-cols-2 mt-4">
              {[
                {
                  title: 'The Economics',
                  desc: 'How a cooperative structure transforms a -15% margin business into a 43% margin platform',
                },
                {
                  title: 'The AI Play',
                  desc: 'How Sage AI conducts clinical assessments and generates physician-ready documentation in minutes',
                },
                {
                  title: 'The HSA/FSA Unlock',
                  desc: "How a physician's LMN saves families 30-47% on care costs using money they already have",
                },
                {
                  title: 'The Boulder Angle',
                  desc: 'Why this model only works if you start hyperlocal and why we chose Boulder',
                },
                {
                  title: 'The Cooperative Difference',
                  desc: 'Why worker-owned means 15% turnover vs. 77% industry average — the real moat',
                },
                {
                  title: 'The Jevons Paradox',
                  desc: 'When care gets cheaper, demand expands 6x. More families, more jobs, more outcomes.',
                },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <h4 className="font-bold text-[#1B2A4A] text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-500 italic mt-4">
              Whether you're a founder thinking about healthcare, someone with aging parents, or a
              caregiver looking for a better deal — this session is for you.
            </p>
          </div>
        </Section>

        {/* Speakers */}
        <Section title="Speakers">
          <div className="space-y-4">
            {[
              {
                name: 'Blaine Warkentine',
                role: 'CEO, co-op.care — Session Facilitator',
                bio: "MD (Medical College of Wisconsin), MBA (University of Utah). 20+ years in orthopedic technology and health system partnerships. Grew BrainLAB's orthopedic vertical to $250M. Multiple healthcare M&A exits including HCA Healthcare and Anytime Fitness. Now building co-op.care — a worker-owned cooperative using AI to transform aging care in Boulder.",
                color: 'border-[#0D7377] bg-[#0D7377]/5',
              },
              {
                name: 'Josh Emdur, DO',
                role: 'Medical Director & Co-Founder, co-op.care',
                bio: "50-state licensed physician. Boulder Community Health hospitalist since 2008. CMO of Automate Clinic. Josh's 50-state license is the platform — he reviews AI-generated Letters of Medical Necessity that unlock HSA/FSA eligibility for families nationwide.",
                color: 'border-purple-200 bg-purple-50',
              },
              {
                name: 'Jessica Dion',
                role: 'Co-op Community Director, co-op.care',
                bio: "Physical therapist at Boulder Community Health. Daughter of Bob Dion, co-op.care's first care recipient — a 68-year-old former competitive cyclist managing multiple chronic conditions. Jessica bridges the gap between clinical care and community, directing cooperative operations and caregiver onboarding.",
                color: 'border-blue-200 bg-blue-50',
              },
            ].map((speaker, i) => (
              <div key={i} className={`rounded-xl border ${speaker.color} p-5`}>
                <h3 className="font-bold text-[#1B2A4A] text-lg">{speaker.name}</h3>
                <p className="text-sm text-[#0D7377] font-semibold mb-2">{speaker.role}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{speaker.bio}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Target Audience */}
        <Section title="Target Audience">
          <div className="grid gap-2 md:grid-cols-2">
            {[
              'Founders & operators in health tech, aging, insurance, fintech',
              'Anyone with aging parents or grandparents (i.e., everyone)',
              'Caregivers and home care professionals',
              'Impact investors interested in cooperative models',
              'Health system administrators and community health leaders',
              'Boulder residents curious about local innovation in aging care',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 p-3"
              >
                <div className="h-2 w-2 rounded-full bg-[#0D7377] flex-shrink-0" />
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Tracks */}
        <Section title="Tracks / Categories">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Health & Wellness', primary: true },
              { label: 'Social Impact / Community', primary: false },
              { label: 'Future of Work', primary: false },
              { label: 'AI & Machine Learning', primary: false },
            ].map((track, i) => (
              <span
                key={i}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${track.primary ? 'bg-[#0D7377] text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}
              >
                {track.label}
                {track.primary && <span className="ml-1 text-xs opacity-75">(primary)</span>}
              </span>
            ))}
          </div>
        </Section>

        {/* Why Unique */}
        <Section title="What Makes This Session Unique to BSW / Boulder">
          <div className="space-y-3">
            {[
              {
                num: '1',
                title: "We're building it HERE.",
                desc: 'Not a Bay Area startup parachuting in — co-op.care is Boulder-first, for Boulder families, employing Boulder caregivers at W-2 wages with cooperative equity.',
              },
              {
                num: '2',
                title: 'Real case study, not theory.',
                desc: "We'll present Bob Dion's story — 5 ER visits in one month before co-op.care, stable at home after. Real family, real data, real Boulder.",
              },
              {
                num: '3',
                title: 'The audience IS the customer.',
                desc: "Everyone in that room either has aging parents, will need care themselves, or knows a caregiver. This isn't abstract B2B — it's personal.",
              },
              {
                num: '4',
                title: 'Cooperative model aligns with Boulder values.',
                desc: 'Worker-owned, community-governed, technology-enabled. This is what Boulder says it wants to be.',
              },
              {
                num: '5',
                title: 'Live demo.',
                desc: "We'll run a live Sage AI care assessment during the session — attendees can see the technology in action and try it themselves via QR code.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#0D7377] text-white flex items-center justify-center font-bold text-sm">
                  {item.num}
                </div>
                <div>
                  <h4 className="font-bold text-[#1B2A4A]">{item.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Engagement Plan */}
        <Section title="Attendee Engagement Plan">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                icon: '📱',
                title: 'QR Code on Screen',
                desc: 'Free Sage AI care assessment — live during session',
              },
              {
                icon: '🏠',
                title: 'Founding Member Signup',
                desc: 'Early access to co-op.care services in Boulder',
              },
              {
                icon: '🤝',
                title: 'Time Banking Signup',
                desc: 'Neighbors earn credits providing light support',
              },
              {
                icon: '📄',
                title: 'Digital Handout',
                desc: 'One-pager with HSA/FSA savings calculator',
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <h4 className="font-bold text-[#1B2A4A] text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section title="Facilitator Contact">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <span className="text-xs text-slate-400">Name</span>
                <p className="font-semibold text-[#1B2A4A]">Blaine Warkentine</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Email</span>
                <p className="font-semibold text-[#1B2A4A]">blainecoopcare@gmail.com</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Website</span>
                <p className="font-semibold text-[#0D7377]">co-op.care</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Format</span>
                <p className="font-semibold text-[#1B2A4A]">Panel / Fireside Chat — 45 min</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Tech Requirements */}
        <Section title="Technical Requirements">
          <div className="flex flex-wrap gap-2">
            {[
              'Projector/screen for slides + live demo',
              'Wi-Fi for Sage AI demonstration',
              'Microphones for 3 panelists',
              'Standard AV setup',
            ].map((item, i) => (
              <span
                key={i}
                className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </Section>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
          <p className="text-xs text-slate-400">
            co-op.care Technologies LLC · Boulder Startup Week 2026 Proposal · March 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
