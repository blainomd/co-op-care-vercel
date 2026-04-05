/**
 * WellnessPage — Yoga & Movement as Medicine
 *
 * Inspired by Stitch "Yoga as Medicine" flow and "Wellness Certification Path."
 * Tracks wellness activities, shows progress toward prescribed plans,
 * and connects to HSA/FSA eligibility via physician oversight.
 *
 * Design system: "The Humanist Collective" — editorial serif headlines,
 * tonal layering (no borders), ambient shadows, sage + bone palette.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { TileIcon } from '../../components/TileIcon';

// ─── Demo Wellness Data ──────────────────────────────────────────

interface WellnessSession {
  id: string;
  type: 'yoga' | 'stretching' | 'breathing' | 'walking' | 'meditation' | 'balance';
  title: string;
  date: string;
  duration: number; // minutes
  completed: boolean;
  notes?: string;
}

interface WellnessPlan {
  goal: string;
  prescribed: string;
  weeklyTarget: number;
  weeklyCompleted: number;
  totalSessions: number;
  streak: number;
}

const DEMO_PLAN: WellnessPlan = {
  goal: 'Fall prevention & caregiver stress relief',
  prescribed: 'Dr. Josh Emdur, DO',
  weeklyTarget: 4,
  weeklyCompleted: 3,
  totalSessions: 27,
  streak: 8,
};

const DEMO_SESSIONS: WellnessSession[] = [
  {
    id: '1',
    type: 'yoga',
    title: 'Chair Yoga for Mobility',
    date: '2026-03-20',
    duration: 25,
    completed: true,
    notes: 'Focused on hip flexors and balance',
  },
  {
    id: '2',
    type: 'breathing',
    title: 'Coherence Breathing',
    date: '2026-03-20',
    duration: 10,
    completed: true,
    notes: '4-7-8 pattern, 3 rounds',
  },
  {
    id: '3',
    type: 'walking',
    title: 'Guided Walk with Dorothy',
    date: '2026-03-19',
    duration: 20,
    completed: true,
  },
  {
    id: '4',
    type: 'stretching',
    title: 'Morning Stretch Routine',
    date: '2026-03-19',
    duration: 15,
    completed: true,
  },
  {
    id: '5',
    type: 'meditation',
    title: 'Body Scan Meditation',
    date: '2026-03-18',
    duration: 12,
    completed: true,
  },
  {
    id: '6',
    type: 'balance',
    title: 'Standing Balance Exercises',
    date: '2026-03-18',
    duration: 15,
    completed: true,
    notes: 'Single-leg hold improved to 18s',
  },
  {
    id: '7',
    type: 'yoga',
    title: 'Gentle Flow for Sleep',
    date: '2026-03-17',
    duration: 30,
    completed: true,
  },
  {
    id: '8',
    type: 'yoga',
    title: 'Chair Yoga for Mobility',
    date: '2026-03-16',
    duration: 25,
    completed: false,
    notes: 'Skipped — doctor appointment',
  },
];

const MODULES = [
  {
    title: 'Yoga for Seniors',
    description: 'Chair-based mobility, breath work, and gentle flow. Designed for aging bodies.',
    sessions: 12,
    completed: 8,
    icon: 'pulse',
    color: 'bg-sage/10 text-sage-dark',
  },
  {
    title: 'Fall Prevention',
    description: 'Balance training, strength foundations, and environment awareness.',
    sessions: 8,
    completed: 3,
    icon: 'shield',
    color: 'bg-gold/10 text-gold',
  },
  {
    title: 'Mindfulness & Stress',
    description: 'Breathing techniques, body scans, and guided meditation for caregivers.',
    sessions: 10,
    completed: 6,
    icon: 'brain',
    color: 'bg-navy/10 text-navy',
  },
  {
    title: 'Caregiver Recovery',
    description:
      'Back care, shoulder release, and physical recovery for the lifting and carrying you do.',
    sessions: 6,
    completed: 1,
    icon: 'heart',
    color: 'bg-copper/10 text-copper',
  },
];

const TYPE_ICONS: Record<WellnessSession['type'], string> = {
  yoga: 'pulse',
  stretching: 'compass',
  breathing: 'sparkle',
  walking: 'community',
  meditation: 'brain',
  balance: 'shield',
};

const TYPE_LABELS: Record<WellnessSession['type'], string> = {
  yoga: 'Yoga',
  stretching: 'Stretching',
  breathing: 'Breathing',
  walking: 'Walking',
  meditation: 'Meditation',
  balance: 'Balance',
};

// ─── Components ──────────────────────────────────────────────────

function BloomScore({ plan }: { plan: WellnessPlan }) {
  const pct = Math.round((plan.weeklyCompleted / plan.weeklyTarget) * 100);
  const circumference = 2 * Math.PI * 58;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative mx-auto h-44 w-44">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full bg-sage/10 blur-2xl" />
      <svg className="relative h-44 w-44 -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="58" fill="none" stroke="#F0ECE4" strokeWidth="7" />
        <circle
          cx="70"
          cy="70"
          r="58"
          fill="none"
          stroke="#2BA5A0"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-4xl font-bold text-navy">{plan.weeklyCompleted}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-sage-dark">
          of {plan.weeklyTarget} this week
        </span>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: WellnessSession }) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl bg-white/80 px-5 py-4 transition-all hover:bg-white ${
        !session.completed ? 'opacity-50' : ''
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          session.completed ? 'bg-sage/10' : 'bg-gray-100'
        }`}
      >
        <TileIcon
          name={TYPE_ICONS[session.type]}
          size={20}
          className={session.completed ? 'text-sage' : 'text-gray-400'}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-navy">{session.title}</p>
          {session.completed && (
            <svg
              className="h-4 w-4 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <span>{TYPE_LABELS[session.type]}</span>
          <span>·</span>
          <span>{session.duration} min</span>
          {session.notes && (
            <>
              <span>·</span>
              <span className="truncate italic">{session.notes}</span>
            </>
          )}
        </div>
      </div>
      <span className="text-[10px] text-text-muted whitespace-nowrap">
        {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
}

function ModuleCard({ module }: { module: (typeof MODULES)[0] }) {
  const pct = Math.round((module.completed / module.sessions) * 100);
  return (
    <div className="group rounded-2xl bg-white/80 p-5 transition-all hover:bg-white hover:shadow-md cursor-pointer">
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${module.color}`}>
        <TileIcon name={module.icon} size={24} />
      </div>
      <h4 className="font-heading text-base font-bold text-navy">{module.title}</h4>
      <p className="mt-1 text-xs text-text-secondary leading-relaxed">{module.description}</p>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-text-muted">
          <span>
            {module.completed}/{module.sessions} sessions
          </span>
          <span className="font-semibold text-sage-dark">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sage/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sage to-sage-dark transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export function WellnessPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'activity' | 'modules' | 'plan'>('activity');

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="transition-opacity active:opacity-70"
        >
          <Logo variant="horizontal" size="sm" />
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/card')}
            className="rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy/5"
          >
            My Card
          </button>
          <button
            type="button"
            onClick={() => navigate('/faq')}
            className="rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy/5"
          >
            FAQ
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pb-8 pt-8 md:px-12 md:pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage">
            Physician-Prescribed Wellness
          </p>
          <h1 className="mt-3 font-heading text-[2.4rem] font-bold leading-[1.08] text-navy md:text-[3.2rem]">
            Movement as <em className="font-heading italic text-sage-dark">Medicine</em>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-secondary">
            Yoga, breathing, and gentle movement — prescribed by Dr. Emdur, tracked in your care
            plan, payable with pre-tax health savings.
          </p>
        </div>
      </section>

      {/* Bloom Score + Stats */}
      <section className="px-6 pb-10 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div
            className="rounded-3xl bg-white/60 p-8 md:p-10"
            style={{ boxShadow: '0 20px 50px -12px rgba(0,0,0,0.04)' }}
          >
            <div className="grid items-center gap-8 md:grid-cols-2">
              {/* Left: Bloom ring */}
              <div className="text-center">
                <BloomScore plan={DEMO_PLAN} />
                <p className="mt-4 font-heading text-lg font-bold text-navy">
                  This Week's Wellness
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Prescribed by{' '}
                  <span className="font-semibold text-sage-dark">{DEMO_PLAN.prescribed}</span>
                </p>
              </div>

              {/* Right: Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-sage/5 p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-sage-dark">
                    {DEMO_PLAN.streak}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Day Streak
                  </p>
                </div>
                <div className="rounded-2xl bg-gold/5 p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-gold">
                    {DEMO_PLAN.totalSessions}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Total Sessions
                  </p>
                </div>
                <div className="rounded-2xl bg-navy/5 p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-navy">4.2</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Hrs / Week
                  </p>
                </div>
                <div className="rounded-2xl bg-sage/5 p-4 text-center">
                  <p className="font-heading text-2xl font-bold text-sage-dark">$312</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Tax Savings
                  </p>
                </div>
              </div>
            </div>

            {/* Goal banner */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-sage/5 px-5 py-3">
              <TileIcon name="stethoscope" size={18} className="text-sage-dark" />
              <p className="text-xs text-text-secondary">
                <span className="font-semibold text-navy">Care Plan Goal:</span> {DEMO_PLAN.goal}.
                Activities are documented in your care plan and eligible for health savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-6 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-1 rounded-xl bg-warm-gray/60 p-1">
            {[
              { key: 'activity' as const, label: 'Activity Log' },
              { key: 'modules' as const, label: 'Learning Modules' },
              { key: 'plan' as const, label: 'My Plan' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  tab === t.key ? 'bg-white text-navy shadow-sm' : 'text-text-muted hover:text-navy'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-3xl">
          {tab === 'activity' && (
            <div className="space-y-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-xl font-bold text-navy">Recent Sessions</h3>
                <button className="flex items-center gap-1.5 rounded-full bg-sage px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-sage-dark active:scale-95">
                  <span className="text-base">+</span> Log Session
                </button>
              </div>
              {DEMO_SESSIONS.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          )}

          {tab === 'modules' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold text-navy">Learning Modules</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    Self-paced, immersive care &amp; humanist training
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {MODULES.map((m) => (
                  <ModuleCard key={m.title} module={m} />
                ))}
              </div>
            </div>
          )}

          {tab === 'plan' && (
            <div className="space-y-6">
              <h3 className="font-heading text-xl font-bold text-navy">
                Your Prescribed Wellness Plan
              </h3>

              {/* Physician card */}
              <div
                className="flex items-start gap-4 rounded-2xl bg-white/80 p-6"
                style={{ boxShadow: '0 20px 50px -12px rgba(0,0,0,0.04)' }}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sage/10">
                  <TileIcon name="stethoscope" size={28} className="text-sage" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-navy">Dr. Josh Emdur, DO</p>
                  <p className="text-xs text-sage-dark font-medium">
                    co-op.care Medical Director · 50-State Licensed
                  </p>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    "Movement is the best catalyst for resilient aging. Stay consistent with the
                    plan — even 10 minutes of chair yoga produces measurable improvements in balance
                    and fall risk."
                  </p>
                </div>
              </div>

              {/* Weekly schedule */}
              <div
                className="rounded-2xl bg-white/80 p-6"
                style={{ boxShadow: '0 20px 50px -12px rgba(0,0,0,0.04)' }}
              >
                <h4 className="font-heading text-base font-bold text-navy mb-4">
                  Weekly Prescription
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      day: 'Mon / Wed / Fri',
                      activity: 'Chair Yoga for Mobility',
                      duration: '25 min',
                      type: 'yoga' as const,
                    },
                    {
                      day: 'Tue / Thu',
                      activity: 'Coherence Breathing + Walk',
                      duration: '20 min',
                      type: 'breathing' as const,
                    },
                    {
                      day: 'Sat',
                      activity: 'Balance Exercises',
                      duration: '15 min',
                      type: 'balance' as const,
                    },
                    {
                      day: 'Daily',
                      activity: 'Morning Stretch',
                      duration: '5 min',
                      type: 'stretching' as const,
                    },
                  ].map((rx) => (
                    <div
                      key={rx.day}
                      className="flex items-center gap-4 rounded-xl bg-sage/5 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                        <TileIcon name={TYPE_ICONS[rx.type]} size={18} className="text-sage" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy">{rx.activity}</p>
                        <p className="text-[11px] text-text-muted">
                          {rx.day} · {rx.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health savings info */}
              <div className="rounded-2xl bg-sage/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TileIcon name="shield" size={18} className="text-sage-dark" />
                  <h4 className="font-heading text-base font-bold text-navy">
                    Pay with health savings
                  </h4>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  This wellness plan is prescribed by a licensed physician and fully documented.
                  Your doctor's letter makes all wellness activities eligible for pre-tax health
                  savings — saving you 28-36% on every session.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="rounded-xl bg-white px-4 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      Regular price
                    </p>
                    <p className="font-heading text-lg font-bold text-text-secondary">
                      $42/session
                    </p>
                  </div>
                  <span className="text-xl text-sage-dark">→</span>
                  <div className="rounded-xl bg-white px-4 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                      With health savings
                    </p>
                    <p className="font-heading text-lg font-bold text-sage-dark">$28/session</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-warm-white px-6 py-6 text-center">
        <Logo variant="full" size="sm" />
        <p className="mt-2 text-[10px] text-text-muted">
          Boulder, Colorado · Pre-launch 2026 · Doctor-supervised wellness
        </p>
        <p className="mt-1 text-[10px] text-text-muted/50">
          © 2026 co-op.care Limited Cooperative Association
        </p>
      </footer>
    </div>
  );
}

export default WellnessPage;
