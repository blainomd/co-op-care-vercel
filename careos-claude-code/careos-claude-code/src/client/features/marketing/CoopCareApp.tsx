import { useState } from 'react';
import { fontLinks } from './design-tokens';

// ============ TYPES ============

interface CareGoalsModule {
  id: number;
  title: string;
  prompt: string;
  placeholder: string;
  abbr: string;
  time: string;
}

interface CIIQuestion {
  id: number;
  text: string;
  dimension: string;
}

interface ForecastItem {
  category: string;
  current: string;
  predicted: string;
  reason: string;
  risk: 'low' | 'medium' | 'high';
  action: string;
}

interface WorkerProfile {
  name: string;
  role: string;
  since: string;
  rating: number;
  visits: number;
  specialties: string[];
  photo: string;
}

interface VisitLog {
  date: string;
  worker: string;
  duration: string;
  notes: string;
  mood: 'great' | 'good' | 'okay' | 'low';
}

interface Tab {
  id: string;
  label: string;
  abbr: string;
}

interface MoreMenuItem {
  abbr: string;
  label: string;
  desc: string;
  action?: () => void;
}

type GoalAnswers = Record<number, string>;
type CIIScores = Record<number, number>;
type MoodKey = 'great' | 'good' | 'okay' | 'low';
type MoodColorMap = Record<MoodKey, string>;

// ============ DATA ============

const CARE_GOALS_MODULES: CareGoalsModule[] = [
  {
    id: 1,
    title: 'A Good Day',
    prompt: 'What does a good day look like?',
    placeholder: 'Morning coffee on the porch, a walk to the mailbox, calling my sister...',
    abbr: 'DAY',
    time: '3 min',
  },
  {
    id: 2,
    title: 'What Matters Most',
    prompt: 'What matters most to you right now?',
    placeholder: 'Being in my own home, seeing the grandkids, my garden...',
    abbr: 'HRT',
    time: '3 min',
  },
  {
    id: 3,
    title: 'My Comfort',
    prompt: 'What brings you comfort when things are hard?',
    placeholder: 'Classical music, a warm blanket, my dog next to me...',
    abbr: 'CMF',
    time: '2 min',
  },
  {
    id: 4,
    title: 'My People',
    prompt: 'Who do you want around you? Who speaks for you?',
    placeholder: 'My daughter Sarah makes the decisions. My son calls every Sunday...',
    abbr: 'PPL',
    time: '3 min',
  },
  {
    id: 5,
    title: 'My Fears',
    prompt: 'What are you afraid of?',
    placeholder: 'Being a burden, losing my mind, being in pain...',
    abbr: 'FRS',
    time: '3 min',
  },
  {
    id: 6,
    title: 'Medical Wishes',
    prompt: "If you couldn't speak, what would you want?",
    placeholder: 'Keep me comfortable. No machines. Let me go naturally...',
    abbr: 'MED',
    time: '4 min',
  },
  {
    id: 7,
    title: 'My Legacy',
    prompt: 'What do you want your grandchildren to know about you?',
    placeholder: 'How I met their grandfather, why I chose teaching, what made me laugh...',
    abbr: 'LGC',
    time: '3 min',
  },
  {
    id: 8,
    title: 'My Terms',
    prompt: 'How do you want to live the rest of your life?',
    placeholder: 'On my own terms. In my own home. With people I love around me...',
    abbr: 'TRM',
    time: '3 min',
  },
];

const CII_QUESTIONS: CIIQuestion[] = [
  { id: 1, text: 'How many hours per week do you spend on caregiving?', dimension: 'Time' },
  { id: 2, text: 'How physically demanding is the care you provide?', dimension: 'Physical' },
  { id: 3, text: 'How emotionally draining do you find caregiving?', dimension: 'Emotional' },
  { id: 4, text: 'How much has caregiving affected your work or career?', dimension: 'Financial' },
  { id: 5, text: 'How often do you feel you have no time for yourself?', dimension: 'Personal' },
  { id: 6, text: 'How complicated are the medical tasks you manage?', dimension: 'Medical' },
];

const FORECAST_ITEMS: ForecastItem[] = [
  {
    category: 'Visits',
    current: '3/week',
    predicted: '4/week',
    reason:
      'Mobility score dropped 12% — recommend additional Tuesday visit for fall prevention exercises',
    risk: 'medium',
    action: 'Add visit',
  },
  {
    category: 'Nutrition',
    current: 'Self-managed',
    predicted: 'Support needed',
    reason: 'Weight down 3 lbs in 2 months. Appetite decreasing. Consider meal prep assistance.',
    risk: 'high',
    action: 'Generate LMN',
  },
  {
    category: 'Social',
    current: '1 outing/week',
    predicted: 'Increase recommended',
    reason: 'PHQ-2 screening suggests early isolation. Senior center attendance would help.',
    risk: 'low',
    action: 'Schedule',
  },
  {
    category: 'Medication',
    current: '7 medications',
    predicted: 'Review needed',
    reason: 'New prescription added by cardiologist. Interaction check recommended.',
    risk: 'medium',
    action: 'Flag for Josh',
  },
];

const WORKER_PROFILE: WorkerProfile = {
  name: 'Maria Santos',
  role: 'Care Partner',
  since: 'Member-owner since 2025',
  rating: 4.9,
  visits: 47,
  specialties: ['Mobility Support', 'Meal Prep', 'Dementia Care'],
  photo: 'MS',
};

const VISIT_LOG: VisitLog[] = [
  {
    date: 'Today, 9:15 AM',
    worker: 'Maria S.',
    duration: '2 hrs',
    notes:
      'Peggy had a good morning. Walked to mailbox independently. Ate full breakfast. Seemed cheerful — granddaughter called during visit.',
    mood: 'great',
  },
  {
    date: 'Mar 28, 9:00 AM',
    worker: 'Maria S.',
    duration: '2 hrs',
    notes:
      'Slight stiffness in right knee this morning. Did seated exercises together. Peggy mentioned wanting to try yoga class at senior center.',
    mood: 'good',
  },
  {
    date: 'Mar 26, 1:00 PM',
    worker: 'Maria S.',
    duration: '3 hrs',
    notes:
      'Bathing assistance. Meal prep for the week (chicken soup, pasta salad). Peggy was tired but in good spirits.',
    mood: 'okay',
  },
];

const TABS: Tab[] = [
  { id: 'home', label: 'Home', abbr: 'HM' },
  { id: 'goals', label: 'Goals', abbr: 'GL' },
  { id: 'forecast', label: 'Forecast', abbr: 'FC' },
  { id: 'team', label: 'Team', abbr: 'TM' },
  { id: 'more', label: 'More', abbr: '...' },
];

// ============ HELPER: Icon Badge ============

function IconBadge({
  abbr,
  size = 24,
  bg = '#6b8f71',
  color = '#fff',
}: {
  abbr: string;
  size?: number;
  bg?: string;
  color?: string;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '6px',
        background: bg,
        color,
        fontSize: `${Math.round(size * 0.4)}px`,
        fontWeight: '700',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {abbr}
    </span>
  );
}

// ============ COMPONENT ============

export function CoopCareApp() {
  const [tab, setTab] = useState<string>('home');
  const [goalModule, setGoalModule] = useState<number | null>(null);
  const [goalAnswers, setGoalAnswers] = useState<GoalAnswers>({});
  const [ciiScores, setCiiScores] = useState<CIIScores>({ 1: 3, 2: 2, 3: 4, 4: 2, 5: 3, 6: 1 });
  const [showLMN, setShowLMN] = useState<boolean>(false);
  const [lmnSent, setLmnSent] = useState<boolean>(false);
  const completedGoals: number = Object.keys(goalAnswers).length;
  const goalProgress: number = Math.round((completedGoals / CARE_GOALS_MODULES.length) * 100);
  const ciiAvg: number =
    Object.values(ciiScores).reduce((a, b) => a + b, 0) / Object.values(ciiScores).length;

  // suppress unused-variable lint for setCiiScores (used indirectly via data)
  void setCiiScores;

  const C = {
    bg: '#faf8f4',
    card: '#ffffff',
    sage: '#6b8f71',
    sageDark: '#4a7050',
    sageLight: '#e8f0e9',
    copper: '#c4956a',
    copperLight: '#faf0e6',
    coral: '#d4766a',
    text: '#2a2a2a',
    muted: '#888',
    light: '#f3ede5',
    border: '#e8e0d6',
    navy: '#1a2a3a',
  } as const;

  const moodColor: MoodColorMap = {
    great: '#6b8f71',
    good: '#7ab648',
    okay: '#c4956a',
    low: '#d4766a',
  };

  const moodLabel = (mood: string): string => {
    if (mood === 'great') return 'Great';
    if (mood === 'good') return 'Good';
    return 'Okay';
  };

  const s = {
    phone: {
      width: '390px',
      minHeight: '844px',
      background: C.bg,
      borderRadius: '40px',
      border: `3px solid #ddd`,
      overflow: 'hidden' as const,
      position: 'relative' as const,
      fontFamily: "'DM Sans', sans-serif",
      margin: '20px auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    },
    statusBar: {
      height: '50px',
      display: 'flex' as const,
      alignItems: 'flex-end' as const,
      justifyContent: 'center' as const,
      padding: '0 24px 8px',
      fontSize: '13px',
      fontWeight: '600' as const,
      color: C.text,
    },
    content: {
      padding: '0 20px 100px',
      overflowY: 'auto' as const,
      maxHeight: '700px',
    },
    tabBar: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: '85px',
      background: C.card,
      borderTop: `1px solid ${C.border}`,
      display: 'flex' as const,
      justifyContent: 'space-around' as const,
      alignItems: 'flex-start' as const,
      paddingTop: '10px',
      borderRadius: '0 0 37px 37px',
    },
    tabItem: (_active: boolean) => ({
      display: 'flex' as const,
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      gap: '4px',
      cursor: 'pointer' as const,
      padding: '4px 12px',
    }),
    tabIcon: { fontSize: '22px' },
    tabLabel: (active: boolean) => ({
      fontSize: '10px',
      fontWeight: (active ? '700' : '500') as React.CSSProperties['fontWeight'],
      color: active ? C.sage : C.muted,
    }),
    greeting: {
      fontSize: '26px',
      fontWeight: '700' as const,
      color: C.navy,
      letterSpacing: '-0.5px',
      marginBottom: '4px',
      marginTop: '8px',
    },
    subGreeting: {
      fontSize: '14px',
      color: C.muted,
      marginBottom: '20px',
    },
    sectionLabel: {
      fontSize: '11px',
      fontWeight: '700' as const,
      color: C.muted,
      textTransform: 'uppercase' as const,
      letterSpacing: '1.5px',
      marginBottom: '10px',
      marginTop: '24px',
    },
    card: {
      background: C.card,
      borderRadius: '16px',
      border: `1px solid ${C.border}`,
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    },
    badge: (color: string) => ({
      display: 'inline-flex' as const,
      alignItems: 'center' as const,
      gap: '4px',
      padding: '3px 8px',
      borderRadius: '6px',
      background: `${color}18`,
      fontSize: '10px',
      fontWeight: '600' as const,
      color: color,
    }),
    btn: {
      width: '100%',
      padding: '14px',
      background: C.sage,
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontSize: '15px',
      fontWeight: '700' as const,
      cursor: 'pointer' as const,
    },
    btnOutline: {
      width: '100%',
      padding: '14px',
      background: 'transparent',
      border: `1.5px solid ${C.sage}`,
      borderRadius: '12px',
      color: C.sage,
      fontSize: '15px',
      fontWeight: '600' as const,
      cursor: 'pointer' as const,
    },
    slider: {
      width: '100%',
      accentColor: C.sage,
    },
    progressBar: (_pct: number) => ({
      height: '6px',
      borderRadius: '3px',
      background: C.light,
      overflow: 'hidden' as const,
      position: 'relative' as const,
    }),
    progressFill: (pct: number, color?: string) => ({
      height: '100%',
      width: `${pct}%`,
      background: color || C.sage,
      borderRadius: '3px',
      transition: 'width 0.5s ease',
    }),
  };

  const renderHome = () => {
    const latestVisit = VISIT_LOG[0]!;
    return (
      <div>
        <div style={s.greeting}>Hi Sarah</div>
        <div style={s.subGreeting}>Here's how Peggy is doing today.</div>

        {/* Quick status */}
        <div style={{ ...s.card, background: C.sageLight, border: `1px solid ${C.sage}30` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: C.navy }}>
                Next visit: Tomorrow, 9 AM
              </div>
              <div style={{ fontSize: '13px', color: C.muted }}>
                Maria Santos -- Mobility + Meal Prep
              </div>
            </div>
            <IconBadge abbr="CG" size={32} bg={C.sage} />
          </div>
        </div>

        {/* CareGoals progress */}
        <div style={s.sectionLabel}>CareGoals</div>
        <div style={s.card} onClick={() => setTab('goals')}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: '600', color: C.navy }}>
              Peggy's Goals & Wishes
            </div>
            <div style={s.badge(goalProgress === 100 ? C.sage : C.copper)}>
              {goalProgress}% complete
            </div>
          </div>
          <div style={s.progressBar(goalProgress)}>
            <div style={s.progressFill(goalProgress)} />
          </div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '8px' }}>
            {completedGoals === 0
              ? 'Start the conversation — takes 3 minutes per module'
              : `${completedGoals} of ${CARE_GOALS_MODULES.length} modules complete`}
          </div>
        </div>

        {/* Recent visit */}
        <div style={s.sectionLabel}>Latest Visit</div>
        <div style={s.card}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: C.navy }}>
                {latestVisit.date}
              </div>
              <div style={{ fontSize: '12px', color: C.muted }}>
                {latestVisit.worker} -- {latestVisit.duration}
              </div>
            </div>
            <span style={s.badge(moodColor[latestVisit.mood])}>{moodLabel(latestVisit.mood)}</span>
          </div>
          <div style={{ fontSize: '13px', color: C.text, lineHeight: '1.6', marginTop: '10px' }}>
            {latestVisit.notes}
          </div>
        </div>

        {/* Monthly forecast teaser */}
        <div style={s.sectionLabel}>April Forecast</div>
        <div
          style={{
            ...s.card,
            background: C.copperLight,
            border: `1px solid ${C.copper}30`,
            cursor: 'pointer',
          }}
          onClick={() => setTab('forecast')}
        >
          <div style={{ fontSize: '15px', fontWeight: '600', color: C.navy, marginBottom: '6px' }}>
            2 recommendations for next month
          </div>
          <div style={{ fontSize: '13px', color: C.copper, lineHeight: '1.5' }}>
            Mobility declining — consider adding a visit. Weight dropping — nutrition support may
            help. Tap to review.
          </div>
        </div>

        {/* LMN quick action */}
        <div style={s.sectionLabel}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            style={{ ...s.card, textAlign: 'center', cursor: 'pointer' }}
            onClick={() => setShowLMN(true)}
          >
            <div style={{ marginBottom: '6px' }}>
              <IconBadge abbr="LMN" size={28} bg={C.copper} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: C.navy }}>Request LMN</div>
            <div style={{ fontSize: '10px', color: C.sage }}>HSA/FSA eligible</div>
          </div>
          <div style={{ ...s.card, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ marginBottom: '6px' }}>
              <IconBadge abbr="REC" size={28} bg={C.coral} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: C.navy }}>
              Record a Memory
            </div>
            <div style={{ fontSize: '10px', color: C.sage }}>Video Legacy</div>
          </div>
          <div style={{ ...s.card, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ marginBottom: '6px' }}>
              <IconBadge abbr="SHR" size={28} bg={C.sage} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: C.navy }}>
              Share with Doctor
            </div>
            <div style={{ fontSize: '10px', color: C.sage }}>One tap</div>
          </div>
          <div style={{ ...s.card, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ marginBottom: '6px' }}>
              <IconBadge abbr="BK" size={28} bg={C.navy} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: C.navy }}>Book a Visit</div>
            <div style={{ fontSize: '10px', color: C.sage }}>Extra visit</div>
          </div>
        </div>
      </div>
    );
  };

  const renderGoals = () => {
    if (goalModule !== null) {
      const mod = CARE_GOALS_MODULES[goalModule]!;
      return (
        <div>
          <button
            onClick={() => setGoalModule(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              color: C.sage,
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            Back to modules
          </button>
          <div style={{ marginBottom: '12px' }}>
            <IconBadge abbr={mod.abbr} size={40} bg={C.sage} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: C.navy, marginBottom: '4px' }}>
            {mod.title}
          </div>
          <div style={{ fontSize: '16px', color: C.text, marginBottom: '20px', lineHeight: '1.6' }}>
            {mod.prompt}
          </div>
          <textarea
            value={goalAnswers[mod.id] || ''}
            onChange={(e) => setGoalAnswers({ ...goalAnswers, [mod.id]: e.target.value })}
            placeholder={mod.placeholder}
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '16px',
              background: C.light,
              border: `1px solid ${C.border}`,
              borderRadius: '14px',
              fontSize: '15px',
              color: C.text,
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: '1.7',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button style={{ ...s.btnOutline, flex: 1 }}>Record Instead</button>
            <button
              style={{ ...s.btn, flex: 1, opacity: goalAnswers[mod.id] ? 1 : 0.4 }}
              onClick={() => {
                if (goalAnswers[mod.id]) {
                  if (goalModule < CARE_GOALS_MODULES.length - 1) setGoalModule(goalModule + 1);
                  else setGoalModule(null);
                }
              }}
            >
              {goalModule < CARE_GOALS_MODULES.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: C.muted }}>
            Module {goalModule + 1} of {CARE_GOALS_MODULES.length} -- {mod.time}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={s.greeting}>Peggy's Goals</div>
        <div style={s.subGreeting}>Advance care planning made fun and simple.</div>

        <div
          style={{
            ...s.card,
            background: C.sageLight,
            border: `1px solid ${C.sage}30`,
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '36px', fontWeight: '800', color: C.sage }}>{goalProgress}%</div>
          <div style={{ fontSize: '13px', color: C.muted }}>
            {goalProgress === 0
              ? "Let's get started — just 3 minutes per module"
              : goalProgress === 100
                ? 'All done! Advance directive generated.'
                : `${completedGoals} of ${CARE_GOALS_MODULES.length} modules complete`}
          </div>
          <div style={{ ...s.progressBar(goalProgress), marginTop: '12px' }}>
            <div style={s.progressFill(goalProgress)} />
          </div>
        </div>

        {CARE_GOALS_MODULES.map((m, i) => {
          const done: boolean = !!goalAnswers[m.id];
          return (
            <div
              key={m.id}
              onClick={() => setGoalModule(i)}
              style={{
                ...s.card,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                background: done ? `${C.sage}08` : C.card,
                border: `1px solid ${done ? `${C.sage}30` : C.border}`,
              }}
            >
              <IconBadge abbr={m.abbr} size={28} bg={done ? C.sage : C.copper} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: C.navy }}>{m.title}</div>
                <div style={{ fontSize: '12px', color: C.muted }}>{m.prompt}</div>
              </div>
              <div>
                {done ? (
                  <span style={s.badge(C.sage)}>Done</span>
                ) : (
                  <span style={{ fontSize: '12px', color: C.copper }}>{m.time}</span>
                )}
              </div>
            </div>
          );
        })}

        {goalProgress >= 75 && (
          <div
            style={{
              ...s.card,
              background: C.copperLight,
              border: `1px solid ${C.copper}30`,
              marginTop: '16px',
            }}
          >
            <div
              style={{ fontSize: '14px', fontWeight: '600', color: C.navy, marginBottom: '6px' }}
            >
              Share with Peggy's Doctor
            </div>
            <div
              style={{ fontSize: '13px', color: C.muted, lineHeight: '1.5', marginBottom: '12px' }}
            >
              Send Peggy's goals and advance directive to her primary care physician. They can bill
              Medicare for reviewing it with her.
            </div>
            <button style={s.btnOutline}>Share via Text</button>
          </div>
        )}
      </div>
    );
  };

  const renderForecast = () => (
    <div>
      <div style={s.greeting}>April Forecast</div>
      <div style={s.subGreeting}>AI-predicted care needs for Peggy next month.</div>

      {/* CII Summary */}
      <div style={{ ...s.card, background: C.sageLight, border: `1px solid ${C.sage}30` }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '600', color: C.navy }}>
            Your Caregiver Intensity
          </div>
          <span style={s.badge(ciiAvg > 3 ? C.coral : ciiAvg > 2 ? C.copper : C.sage)}>
            {ciiAvg > 3 ? 'High' : ciiAvg > 2 ? 'Moderate' : 'Manageable'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {Object.entries(ciiScores).map(([k, v]) => (
            <div
              key={k}
              style={{
                flex: 1,
                height: '32px',
                borderRadius: '6px',
                background: v >= 4 ? C.coral : v >= 3 ? C.copper : v >= 2 ? '#ddd' : C.sageLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '600',
                color: v >= 3 ? 'white' : C.muted,
              }}
            >
              {CII_QUESTIONS.find((q) => q.id === parseInt(k))?.dimension?.substring(0, 4)}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: C.muted, marginTop: '8px' }}>
          Last updated 3 days ago --{' '}
          <span style={{ color: C.sage, cursor: 'pointer' }}>Refresh (3 min)</span>
        </div>
      </div>

      {/* Forecast items */}
      <div style={s.sectionLabel}>Recommendations</div>
      {FORECAST_ITEMS.map((item, i) => (
        <div key={i} style={s.card}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: C.navy }}>
                {item.category}
              </div>
              <div style={{ fontSize: '11px', color: C.muted }}>
                {item.current} {'->'} {item.predicted}
              </div>
            </div>
            <span
              style={s.badge(
                item.risk === 'high' ? C.coral : item.risk === 'medium' ? C.copper : C.sage,
              )}
            >
              {item.risk} priority
            </span>
          </div>
          <div style={{ fontSize: '13px', color: C.text, lineHeight: '1.6', marginBottom: '12px' }}>
            {item.reason}
          </div>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: item.action === 'Generate LMN' ? C.copper : C.sage,
              border: 'none',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onClick={() => item.action === 'Generate LMN' && setShowLMN(true)}
          >
            {item.action}
          </button>
        </div>
      ))}

      {/* Monthly trend */}
      <div style={s.sectionLabel}>3-Month Trend</div>
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          {['Jan', 'Feb', 'Mar'].map((month, i) => (
            <div key={month} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '11px', color: C.muted, marginBottom: '4px' }}>{month}</div>
              <div
                style={{
                  height: [40, 48, 56][i],
                  width: '100%',
                  background: [C.sageLight, `${C.copper}30`, `${C.copper}50`][i],
                  borderRadius: '6px',
                  margin: '0 4px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: i === 2 ? C.coral : C.muted,
                }}
              >
                {['Stable', 'Watch', 'Act'][i]}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: C.muted, textAlign: 'center' }}>
          Peggy's care needs are trending upward. The system is adapting.
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div>
      <div style={s.greeting}>Care Team</div>
      <div style={s.subGreeting}>The people caring for Peggy.</div>

      {/* Primary worker */}
      <div style={{ ...s.card, border: `1px solid ${C.sage}30` }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: C.sage,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
            }}
          >
            {WORKER_PROFILE.photo}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: C.navy }}>
              {WORKER_PROFILE.name}
            </div>
            <div style={{ fontSize: '12px', color: C.muted }}>
              {WORKER_PROFILE.role} -- {WORKER_PROFILE.since}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: C.sage }}>
              {WORKER_PROFILE.rating}
            </div>
            <div style={{ fontSize: '10px', color: C.muted }}>{WORKER_PROFILE.visits} visits</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {WORKER_PROFILE.specialties.map((sp) => (
            <span key={sp} style={s.badge(C.sage)}>
              {sp}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button style={{ ...s.btn, flex: 1, fontSize: '13px', padding: '10px' }}>
            Message Maria
          </button>
          <button style={{ ...s.btnOutline, flex: 1, fontSize: '13px', padding: '10px' }}>
            Schedule
          </button>
        </div>
      </div>

      {/* Medical Director */}
      <div style={s.card}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: C.navy,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
            }}
          >
            JE
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: C.navy }}>Josh Emdur, DO</div>
            <div style={{ fontSize: '12px', color: C.muted }}>
              Medical Director -- NPI 1649218389
            </div>
            <div style={{ fontSize: '11px', color: C.sage }}>
              Signs LMNs, advance directives, POLSTs
            </div>
          </div>
        </div>
      </div>

      {/* Visit history */}
      <div style={s.sectionLabel}>Recent Visits</div>
      {VISIT_LOG.map((v, i) => (
        <div key={i} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: C.navy }}>{v.date}</div>
            <span style={s.badge(moodColor[v.mood])}>{moodLabel(v.mood)}</span>
          </div>
          <div style={{ fontSize: '11px', color: C.muted, marginBottom: '6px' }}>
            {v.worker} -- {v.duration}
          </div>
          <div style={{ fontSize: '13px', color: C.text, lineHeight: '1.6' }}>{v.notes}</div>
        </div>
      ))}
    </div>
  );

  const renderMore = () => {
    const menuItems: MoreMenuItem[] = [
      {
        abbr: 'LMN',
        label: 'Request LMN',
        desc: 'Make wellness HSA/FSA eligible',
        action: () => setShowLMN(true),
      },
      {
        abbr: 'ADV',
        label: 'Advance Directive',
        desc: goalProgress >= 75 ? 'Ready to share' : 'Complete CareGoals first',
      },
      { abbr: 'VID', label: 'Video Legacy', desc: 'Record stories and messages' },
      { abbr: 'SHR', label: 'Share with Doctor', desc: "Send goals to Peggy's PCP" },
      { abbr: 'RX', label: 'Medications', desc: '7 active prescriptions' },
      { abbr: 'CAL', label: 'Calendar', desc: 'Visits, appointments, family events' },
      { abbr: 'DOC', label: 'Documents', desc: 'Insurance, legal, medical records' },
      { abbr: 'FIT', label: 'Community Wellness', desc: 'Yoga, fitness, nutrition near Peggy' },
      { abbr: 'SET', label: 'Settings', desc: 'Account, notifications, billing' },
    ];

    return (
      <div>
        <div style={s.greeting}>More</div>
        <div style={s.subGreeting}>Everything else for Peggy's care.</div>
        {menuItems.map((item, i) => (
          <div
            key={i}
            style={{
              ...s.card,
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
            }}
            onClick={item.action}
          >
            <IconBadge abbr={item.abbr} size={28} bg={C.sage} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: C.navy }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: C.muted }}>{item.desc}</div>
            </div>
            <div style={{ fontSize: '14px', color: C.muted }}>{'>'}</div>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: C.muted }}>
          co-op.care -- $59/month -- Worker-owned home care
          <br />
          Medical Director: Josh Emdur DO
        </div>
      </div>
    );
  };

  // LMN modal
  const renderLMNModal = () =>
    showLMN && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'flex-end',
        }}
        onClick={() => !lmnSent && setShowLMN(false)}
      >
        <div
          style={{
            background: C.card,
            borderRadius: '24px 24px 0 0',
            padding: '28px 20px 40px',
            width: '100%',
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {lmnSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '12px' }}>
                <IconBadge abbr="OK" size={48} bg={C.sage} />
              </div>
              <div
                style={{ fontSize: '18px', fontWeight: '700', color: C.navy, marginBottom: '8px' }}
              >
                LMN Submitted
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: C.muted,
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                Josh Emdur DO will review and sign within 24 hours. Signed PDF will appear in your
                Documents.
              </div>
              <button
                style={s.btn}
                onClick={() => {
                  setShowLMN(false);
                  setLmnSent(false);
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div
                style={{ fontSize: '18px', fontWeight: '700', color: C.navy, marginBottom: '4px' }}
              >
                Request LMN
              </div>
              <div style={{ fontSize: '13px', color: C.muted, marginBottom: '16px' }}>
                Make Peggy's wellness activities HSA/FSA eligible. Included in your $59/month.
              </div>
              <div
                style={{ fontSize: '12px', fontWeight: '600', color: C.muted, marginBottom: '8px' }}
              >
                SERVICE
              </div>
              {[
                'Therapeutic Yoga',
                'Senior Fitness Program',
                'Nutrition Counseling',
                'Aquatic Therapy',
              ].map((svc) => (
                <div
                  key={svc}
                  style={{
                    padding: '12px',
                    background: C.light,
                    borderRadius: '10px',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: C.text,
                    cursor: 'pointer',
                  }}
                >
                  {svc}
                </div>
              ))}
              <div
                style={{ fontSize: '11px', color: C.sage, textAlign: 'center', margin: '12px 0' }}
              >
                Peggy's conditions auto-populated from her profile -- ICD-10 coded
              </div>
              <button style={s.btn} onClick={() => setLmnSent(true)}>
                Submit for Josh's Review
              </button>
              <div
                style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: C.muted }}
              >
                No extra charge -- Included in your subscription
              </div>
            </>
          )}
        </div>
      </div>
    );

  return (
    <div
      style={{
        background: '#e8e0d6',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link href={fontLinks.dmSans} rel="stylesheet" />

      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <div
          style={{ fontSize: '24px', fontWeight: '800', color: '#4a4a4a', letterSpacing: '-0.5px' }}
        >
          co-op.care
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          $59/month -- The app that comes with a caregiver
        </div>
      </div>

      <div style={s.phone}>
        <div style={s.statusBar}>
          <span>9:41</span>
        </div>
        <div style={s.content}>
          {tab === 'home' && renderHome()}
          {tab === 'goals' && renderGoals()}
          {tab === 'forecast' && renderForecast()}
          {tab === 'team' && renderTeam()}
          {tab === 'more' && renderMore()}
        </div>
        {renderLMNModal()}
        <div style={s.tabBar}>
          {TABS.map((t) => (
            <div key={t.id} style={s.tabItem(tab === t.id)} onClick={() => setTab(t.id)}>
              <IconBadge abbr={t.abbr} size={22} bg={tab === t.id ? C.sage : '#ccc'} />
              <span style={s.tabLabel(tab === t.id)}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
