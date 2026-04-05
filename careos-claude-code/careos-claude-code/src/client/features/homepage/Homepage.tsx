/**
 * Homepage — The product IS the homepage
 *
 * Not a page about the product. The product itself.
 * A text input. Sage pulls. Guide in 3 minutes. Free.
 *
 * Hero: typewriter cycling real things people say → live text input
 * Below: what happens when you type (the Connector cascade)
 * Below: what it replaces (comparison)
 * Below: what it costs (free → $59/mo)
 * Footer: physician, cooperative, Boulder
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';

// ─── Hooks ──────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const { ref, visible } = useInView();
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1200, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, target]);
  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Typewriter ─────────────────────────────────────────────────────

const TYPEWRITER_PHRASES = [
  'My mom keeps wandering at night...',
  'Dad forgot his meds again...',
  'Is home care HSA-eligible?',
  "I can't do this alone anymore...",
  'How do I find someone I can trust?',
  "She doesn't want to leave her house...",
];

function TypewriterHero() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx % TYPEWRITER_PHRASES.length]!;
    if (!deleting && charIdx < phrase.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 40 + Math.random() * 30);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === phrase.length) {
      const t = setTimeout(() => setDeleting(true), 2500);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx((c) => c - 1), 20);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % TYPEWRITER_PHRASES.length);
    }
  }, [charIdx, deleting, phraseIdx]);

  const phrase = TYPEWRITER_PHRASES[phraseIdx % TYPEWRITER_PHRASES.length]!;
  return (
    <span className="text-sage-light">
      {phrase.slice(0, charIdx)}
      <span className="animate-pulse text-white/60">|</span>
    </span>
  );
}

// ─── What Happens Next (Connector cascade preview) ──────────────────

const CASCADE_STEPS = [
  {
    label: 'Sage pulls records',
    detail: 'Medications, conditions, pharmacy, appointments — from connected health sources',
    time: '2 seconds',
    color: 'bg-sage/10 text-sage border-sage/20',
  },
  {
    label: 'Physician reviews',
    detail: 'Dr. Emdur checks interactions, verifies protocols, signs off',
    time: '< 24 hours',
    color: 'bg-gold/10 text-gold border-gold/20',
  },
  {
    label: 'Guide assembles',
    detail: 'Daily routine, med schedule, emergency protocols, care team contacts',
    time: '3 minutes',
    color: 'bg-sage/10 text-sage border-sage/20',
  },
  {
    label: 'Savings identified',
    detail: 'HSA/FSA eligible services found, Letter of Medical Necessity drafted',
    time: '$936/yr avg',
    color: 'bg-copper/10 text-copper border-copper/20',
  },
  {
    label: 'You get a text',
    detail: 'From now on, co-op.care texts you when something needs attention. Tap. Done.',
    time: 'Always on',
    color: 'bg-blue/10 text-blue border-blue/20',
  },
];

// ─── Action Page Preview (shows the SMS → tap → done flow) ─────────

function ActionPreview() {
  const { ref, visible } = useInView(0.2);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setStep((s) => (s < 2 ? s + 1 : s));
    }, 1800);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div ref={ref} className="mx-auto max-w-xs">
      {/* Phone frame */}
      <div className="overflow-hidden rounded-3xl border-4 border-white/10 bg-warm-white shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-navy px-4 py-2 text-[10px] text-white/50">
          <span>co-op.care</span>
          <span>9:41 AM</span>
        </div>

        {/* SMS notification */}
        <div
          className="border-b border-border bg-white p-4"
          style={{
            opacity: step >= 0 ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-sage">
            SMS from co-op.care
          </div>
          <p className="mt-1 text-sm text-text-primary">
            Margaret's refill is due tomorrow. CVS hasn't heard from you.
          </p>
          <div className="mt-2 text-xs text-sage font-semibold">Tap to handle it →</div>
        </div>

        {/* Action page */}
        <div
          className="p-6 text-center"
          style={{
            opacity: step >= 1 ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        >
          <div className="text-xs font-bold text-copper">REFILL ALERT</div>
          <h3 className="mt-1 font-heading text-lg font-bold text-text-primary">Lisinopril 10mg</h3>
          <p className="text-sm text-text-secondary">Due tomorrow at CVS</p>
          <button className="mt-4 w-full rounded-xl bg-sage py-3 text-sm font-bold text-white">
            Call CVS — (303) 555-0199
          </button>
        </div>

        {/* Done */}
        <div
          className="pb-6 text-center"
          style={{
            opacity: step >= 2 ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-sage/10">
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path d="M5 10L9 14L15 6" stroke="#2ba5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-sage">Done. Close this tab.</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOMEPAGE
// ═══════════════════════════════════════════════════════════════════

export function Homepage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [heroInput, setHeroInput] = useState('');

  const handleStart = useCallback(() => {
    navigate('/guide/build');
  }, [navigate]);

  const handleHeroSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Pass the input to the guide builder via URL param or state
      navigate('/guide/build');
    },
    [navigate],
  );

  const handleEmail = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.includes('@')) return;
      try {
        localStorage.setItem('coop_email', email);
      } catch {
        /* ok */
      }
      setEmailSubmitted(true);
    },
    [email],
  );

  return (
    <div className="min-h-screen">
      {/* ─── S1: Hero — The product IS the homepage ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-copper-dark via-navy to-navy-dark px-6 pb-24 pt-8 md:px-12 md:pb-32 md:pt-12">
        {/* Nav */}
        <nav className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo variant="horizontal" size="sm" />
          <button
            type="button"
            onClick={handleStart}
            className="rounded-full bg-sage px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-sage-dark hover:shadow-lg active:scale-95"
          >
            Start free
          </button>
        </nav>

        {/* Hero content */}
        <div className="mx-auto mt-16 max-w-3xl text-center md:mt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
            </span>
            Boulder, CO · Worker-owned cooperative
          </div>

          <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
            <TypewriterHero />
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            Tell <strong className="text-white/90">Sage</strong> one sentence about your loved one.
            It pulls their records, builds a care guide, and finds $936/year in savings — in 3 minutes.
          </p>

          {/* The product — a text input, right here in the hero */}
          <form onSubmit={handleHeroSubmit} className="mx-auto mt-8 max-w-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                placeholder="My mom is 78 and has diabetes..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-sage/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sage/20"
              />
              <button
                type="submit"
                className="rounded-xl bg-sage px-6 py-4 text-base font-bold text-white shadow-lg shadow-sage/30 transition-all hover:bg-sage-dark active:scale-[0.98]"
              >
                Go
              </button>
            </div>
            <p className="mt-3 text-xs text-white/30">
              Free. No account. Sage pulls what it can and estimates the rest.
            </p>
          </form>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-warm-white to-transparent" />
      </section>

      {/* ─── S2: What Happens When You Type ───────────────── */}
      <section className="bg-warm-white px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-sage">
                What happens next
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-text-primary">
                You type one sentence. We do the rest.
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 space-y-4">
            {CASCADE_STEPS.map((step, i) => (
              <Reveal key={step.label} delay={i * 0.1}>
                <div className={`flex items-center gap-4 rounded-xl border p-5 ${step.color}`}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold">{step.label}</h3>
                    <p className="mt-0.5 text-xs opacity-70">{step.detail}</p>
                  </div>
                  <div className="text-xs font-bold whitespace-nowrap">{step.time}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── S3: The Text Message (Dark Section) ─────────── */}
      <section className="bg-navy px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
            <Reveal className="flex-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sage-light">
                  No app. No portal. No login.
                </p>
                <h2 className="mt-3 font-heading text-3xl font-bold text-white">
                  You get a text when it matters.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/50">
                  co-op.care watches over your loved one 24/7. When something needs your attention —
                  a refill, an interaction, a check-in — you get a text. Tap it. One page.
                  One action. Done.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/50">
                  Every tap is physician-reviewed. Every tap can fire a billing code.
                  Every tap updates the living care guide. The system works while you sleep.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2} className="flex-shrink-0">
              <ActionPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── S4: The Numbers ──────────────────────────────── */}
      <section className="bg-warm-white px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-sage">
              The crisis nobody talks about
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-text-primary md:text-4xl">
              63 million Americans are working a secret, unpaid second job.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: 63, suffix: 'M', label: 'Family caregivers' },
              { value: 27, suffix: 'hrs', label: 'Unpaid care/week' },
              { value: 7200, suffix: '', label: 'Out-of-pocket/year', prefix: '$' },
              { value: 936, suffix: '', label: 'HSA savings we find', prefix: '$' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.1}>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <p className="font-heading text-2xl font-bold text-sage md:text-3xl">
                    {stat.prefix ?? ''}
                    <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── S5: Three Things That Make This Different ─────── */}
      <section className="bg-white px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              What makes this real
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'A physician behind every page',
                desc: 'Dr. Emdur reviews every care guide, every drug interaction, every Letter of Medical Necessity. Not a generic AI — a real doctor, 50-state licensed.',
                accent: 'border-sage/30 bg-sage/5',
              },
              {
                title: 'It pays for itself',
                desc: 'The guide identifies HSA/FSA-eligible care expenses you didn\'t know about. Average family saves $936/year. The $59/month membership is free after savings.',
                accent: 'border-copper/30 bg-copper/5',
              },
              {
                title: 'Caregivers who stay',
                desc: '$25-28/hr, W-2, equity in the cooperative. When turnover drops from 77% to 15%, your mom gets the same person every visit. That\'s the point.',
                accent: 'border-blue/30 bg-blue/5',
              },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1}>
                <div className={`rounded-2xl border p-6 text-left ${card.accent}`}>
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── S6: Pricing — Simple ─────────────────────────── */}
      <section className="bg-warm-white px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              Free forever. Better together.
            </h2>
            <p className="mt-3 text-sm text-text-secondary">
              Use any tool on its own, free, forever. The membership connects them.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {/* Free */}
              <div className="rounded-2xl border border-border bg-white p-6 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">Free</div>
                <div className="mt-1 font-heading text-3xl font-bold text-text-primary">$0</div>
                <div className="text-xs text-text-secondary">forever</div>
                <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                  {[
                    'Caregiver guide (printable)',
                    'Medication interaction check',
                    'HSA savings calculator',
                    'Values conversation',
                    'Works alone, no account',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-sage">-</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleStart}
                  className="mt-6 w-full rounded-xl border border-sage bg-white py-3 text-sm font-bold text-sage transition-all hover:bg-sage/5 active:scale-[0.98]"
                >
                  Start free
                </button>
              </div>

              {/* Membership */}
              <div className="rounded-2xl border-2 border-sage bg-sage/5 p-6 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-sage">Membership</div>
                <div className="mt-1 font-heading text-3xl font-bold text-text-primary">$59<span className="text-lg font-normal text-text-secondary">/mo</span></div>
                <div className="text-xs text-sage font-semibold">Pays for itself in HSA savings</div>
                <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                  {[
                    'Everything free, plus:',
                    'Living guide (auto-updates)',
                    'Physician oversight (Dr. Emdur)',
                    'Text alerts (refills, appointments)',
                    'HSA/FSA letter signed + savings',
                    'PROMs + billing code capture',
                    'Matched caregivers when ready',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-sage">-</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleStart}
                  className="mt-6 w-full rounded-xl bg-sage py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-sage-dark active:scale-[0.98]"
                >
                  Start free, upgrade anytime
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── S7: Email Capture ────────────────────────────── */}
      <section className="bg-white px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-md text-center">
          <Reveal>
            <h2 className="font-heading text-2xl font-bold text-text-primary">
              Not ready yet? We'll remind you.
            </h2>
          </Reveal>

          {emailSubmitted ? (
            <div className="mt-6 rounded-xl bg-sage/10 p-4 text-sm font-semibold text-sage">
              You're on the list. No spam.
            </div>
          ) : (
            <form onSubmit={handleEmail} className="mt-6 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-xl border border-border bg-warm-white px-4 py-3 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
              />
              <button
                type="submit"
                className="rounded-xl bg-sage px-5 py-3 text-sm font-bold text-white hover:bg-sage-dark active:scale-95"
              >
                Remind me
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ─── S8: Final CTA ────────────────────────────────── */}
      <section className="bg-gradient-to-b from-copper-dark to-navy px-6 py-20 text-center md:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
              The health system that works for you.
            </h2>
            <p className="mt-3 text-base text-white/50">
              Instead of you working for it.
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/40">
              Tell Sage about your loved one. Get a physician-backed care guide in 3 minutes.
              Keep it alive for $59/month — or use it free, forever.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <button
              type="button"
              onClick={handleStart}
              className="mt-8 rounded-xl bg-sage px-10 py-4 text-base font-bold text-white shadow-2xl shadow-sage/30 transition-all hover:bg-sage-dark active:scale-[0.98]"
            >
              Tell Sage about your loved one
            </button>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="bg-navy-dark px-6 py-8 text-center">
        <Logo variant="horizontal" size="sm" />
        <p className="mt-3 text-[10px] text-white/30">
          Boulder, CO · Worker-owned cooperative · Josh Emdur DO, Medical Director
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-white/20">
          <a href="/guide" className="hover:text-white/40">
            Caregiver Guide
          </a>
          <span>·</span>
          <a href="#/about" className="hover:text-white/40">
            About
          </a>
          <span>·</span>
          <a href="#/privacy" className="hover:text-white/40">
            Privacy
          </a>
          <span>·</span>
          <a href="#/terms" className="hover:text-white/40">
            Terms
          </a>
        </div>
        <p className="mt-3 text-[10px] text-white/15">
          © 2026 co-op.care Limited Cooperative Association
        </p>
      </footer>
    </div>
  );
}

export default Homepage;
