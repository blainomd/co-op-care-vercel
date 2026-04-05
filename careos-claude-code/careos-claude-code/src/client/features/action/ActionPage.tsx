/**
 * ActionPage — The entire mobile experience
 *
 * /act/:token → loads personalized template → user takes ONE action → done
 *
 * No app. No login. No navigation. One page. One action. Close tab.
 * Billing fires. Profile updates. Guide stays current.
 *
 * Inline styles — optimized for mobile tap targets (min 48px).
 * DO NOT apply Tailwind (standalone page served via SMS link).
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { careGoals, fonts, fontLinks, company } from '../marketing/design-tokens';
import type { ActionTemplate } from '../../../shared/types/action-page.types';

// ─── Mock token fetch (replace with /api/v1/action/:token) ──────────

interface ActionData {
  template: ActionTemplate;
  role: 'conductor' | 'worker' | 'physician' | 'recipient';
  recipientName: string;
  data: Record<string, unknown>;
  billingCodes?: string[];
  expired: boolean;
}

function mockFetchToken(token: string): ActionData {
  // Demo tokens for testing
  const demos: Record<string, ActionData> = {
    'demo-prom': {
      template: 'prom',
      role: 'recipient',
      recipientName: 'Margaret',
      data: {
        surgeonName: 'Dr. Chen',
        procedure: 'Total Knee Replacement',
        dayPostOp: 14,
        question: "How's your knee today?",
        options: ['No pain', 'Some pain', 'A lot of pain'],
      },
      billingCodes: ['98980'],
      expired: false,
    },
    'demo-med': {
      template: 'med_reminder',
      role: 'recipient',
      recipientName: 'Margaret',
      data: {
        medication: 'Metformin 500mg',
        time: 'afternoon',
        withFood: true,
      },
      billingCodes: [],
      expired: false,
    },
    'demo-lmn': {
      template: 'lmn_confirm',
      role: 'conductor',
      recipientName: 'Margaret',
      data: {
        savings: 936,
        services: ['Companion care', 'Therapeutic yoga', 'Grab bars'],
        physicianName: 'Dr. Emdur',
      },
      billingCodes: [],
      expired: false,
    },
    'demo-shift': {
      template: 'shift_checklist',
      role: 'worker',
      recipientName: 'Margaret',
      data: {
        startTime: '9:00 AM',
        endTime: '3:00 PM',
        meds: [{ name: 'Metformin 500mg', time: '12:00 PM', withFood: true }],
        routine: ['Coffee on the porch', 'Morning walk (15 min, supervision)', 'Garden time', 'Lunch with meds'],
        goodDay: 'Garden time, grandkids calling, morning coffee on the porch',
        emergencyContact: 'Jane — (555) 123-4567',
      },
      billingCodes: [],
      expired: false,
    },
    'demo-review': {
      template: 'physician_review',
      role: 'physician',
      recipientName: 'Margaret',
      data: {
        pendingLMNs: 3,
        interactions: 1,
        topPriority: 'Margaret W. — Metformin + Donepezil timing',
        estimatedBilling: 1240,
      },
      billingCodes: ['G0019', 'G0023'],
      expired: false,
    },
    'demo-refill': {
      template: 'refill_alert',
      role: 'conductor',
      recipientName: 'Margaret',
      data: {
        medication: 'Lisinopril 10mg',
        pharmacy: 'CVS',
        pharmacyPhone: '(303) 555-0199',
        dueDate: 'Tomorrow',
      },
      billingCodes: [],
      expired: false,
    },
    'demo-fall': {
      template: 'fall_check',
      role: 'recipient',
      recipientName: 'Margaret',
      data: {
        question: 'How steady do you feel today?',
        options: ['Steady', 'A little unsteady', 'Very unsteady'],
      },
      billingCodes: ['98980'],
      expired: false,
    },
    'demo-ccm': {
      template: 'ccm_checkin',
      role: 'recipient',
      recipientName: 'Margaret',
      data: {
        question: 'Has anything changed with your health this month?',
        options: ['No changes', 'Yes, something changed'],
      },
      billingCodes: ['99490'],
      expired: false,
    },
  };

  return demos[token] || {
    template: 'med_reminder',
    role: 'recipient',
    recipientName: 'User',
    data: {},
    expired: true,
  };
}

// ─── Shared Styles ──────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  fontFamily: fonts.body,
  background: careGoals.cream,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  padding: '32px 24px',
  maxWidth: 380,
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
};

const bigButtonStyle = (color: string): React.CSSProperties => ({
  width: '100%',
  padding: '18px 24px',
  fontSize: 18,
  fontWeight: 600,
  fontFamily: fonts.body,
  border: 'none',
  borderRadius: 14,
  cursor: 'pointer',
  color: '#fff',
  background: color,
  marginBottom: 10,
  minHeight: 56,
  transition: 'transform 0.1s',
});

const optionButtonStyle = (selected: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '18px 24px',
  fontSize: 17,
  fontWeight: 500,
  fontFamily: fonts.body,
  border: `2px solid ${selected ? careGoals.sage : careGoals.border}`,
  borderRadius: 14,
  cursor: 'pointer',
  color: selected ? '#fff' : careGoals.charcoal,
  background: selected ? careGoals.sage : '#fff',
  marginBottom: 10,
  minHeight: 56,
  transition: 'all 0.15s',
});

// ─── Template Renderers ─────────────────────────────────────────────

function PromPage({ data, onComplete }: { data: Record<string, unknown>; onComplete: (value: string) => void }) {
  const options = (data.options as string[]) || ['Good', 'Okay', 'Not great'];
  const question = (data.question as string) || "How are you feeling?";
  const dayPostOp = data.dayPostOp as number | undefined;

  return (
    <div style={cardStyle}>
      {dayPostOp && (
        <div style={{ fontSize: 12, color: careGoals.sage, fontWeight: 600, marginBottom: 8 }}>
          DAY {dayPostOp} POST-OP
        </div>
      )}
      <h1 style={{ fontFamily: fonts.serif, fontSize: 26, fontWeight: 700, color: careGoals.charcoal, marginBottom: 24, lineHeight: 1.3 }}>
        {question}
      </h1>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onComplete(opt)}
          style={optionButtonStyle(false)}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MedReminderPage({ data, onComplete }: { data: Record<string, unknown>; onComplete: (value: string) => void }) {
  const medication = (data.medication as string) || 'Your medication';
  const withFood = data.withFood as boolean;

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, color: careGoals.muted, marginBottom: 8 }}>MEDICATION REMINDER</div>
      <h1 style={{ fontFamily: fonts.serif, fontSize: 24, fontWeight: 700, color: careGoals.charcoal, marginBottom: 8 }}>
        {medication}
      </h1>
      {withFood && (
        <p style={{ fontSize: 15, color: careGoals.copper, fontWeight: 500, marginBottom: 24 }}>
          Take with food
        </p>
      )}
      <button onClick={() => onComplete('taken')} style={bigButtonStyle(careGoals.sage)}>
        Done — I took it
      </button>
      <button onClick={() => onComplete('skipped')} style={{ ...bigButtonStyle(careGoals.border), color: careGoals.muted }}>
        Skipped today
      </button>
    </div>
  );
}

function LmnConfirmPage({ data, onComplete }: { data: Record<string, unknown>; onComplete: (value: string) => void }) {
  const savings = (data.savings as number) || 0;
  const services = (data.services as string[]) || [];
  const physicianName = (data.physicianName as string) || 'your physician';

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, color: careGoals.copper, fontWeight: 600, marginBottom: 8 }}>HSA/FSA SAVINGS</div>
      <h1 style={{ fontFamily: fonts.serif, fontSize: 28, fontWeight: 700, color: careGoals.charcoal, marginBottom: 4 }}>
        ${savings}/year
      </h1>
      <p style={{ fontSize: 14, color: careGoals.muted, marginBottom: 20 }}>
        in pre-tax savings identified
      </p>
      <div style={{ textAlign: 'left', marginBottom: 24 }}>
        {services.map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 15, color: careGoals.text }}>
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
              <path d="M3 7L6 10L11 4" stroke={careGoals.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {s}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: careGoals.muted, marginBottom: 16 }}>
        Letter reviewed by {physicianName}
      </p>
      <button onClick={() => onComplete('confirmed')} style={bigButtonStyle(careGoals.sage)}>
        Unlock my savings
      </button>
    </div>
  );
}

function ShiftChecklistPage({ data, onComplete }: { data: Record<string, unknown>; onComplete: (value: string) => void }) {
  const startTime = (data.startTime as string) || '';
  const endTime = (data.endTime as string) || '';
  const routine = (data.routine as string[]) || [];
  const meds = (data.meds as Array<{ name: string; time: string; withFood: boolean }>) || [];
  const goodDay = (data.goodDay as string) || '';
  const emergencyContact = (data.emergencyContact as string) || '';

  return (
    <div style={{ ...cardStyle, textAlign: 'left' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: careGoals.sage, fontWeight: 600 }}>TODAY'S SHIFT</div>
        <div style={{ fontFamily: fonts.serif, fontSize: 22, fontWeight: 700, color: careGoals.charcoal }}>
          {startTime} – {endTime}
        </div>
      </div>

      {goodDay && (
        <div style={{ background: `${careGoals.sage}10`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: careGoals.sage, marginBottom: 4 }}>WHAT MAKES A GOOD DAY</div>
          <div style={{ fontSize: 14, color: careGoals.text, lineHeight: 1.5 }}>{goodDay}</div>
        </div>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, color: careGoals.copper, marginBottom: 8 }}>ROUTINE</div>
      {routine.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: 14, color: careGoals.text, borderBottom: `1px solid ${careGoals.border}` }}>
          <span style={{ color: careGoals.muted, minWidth: 20 }}>{i + 1}.</span>
          {item}
        </div>
      ))}

      {meds.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c0392b', marginBottom: 8, marginTop: 16 }}>MEDICATIONS TO GIVE</div>
          {meds.map((med) => (
            <div key={med.name} style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#c0392b' }}>{med.name}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{med.time}{med.withFood ? ' · with food' : ''}</div>
            </div>
          ))}
        </>
      )}

      {emergencyContact && (
        <div style={{ background: '#fef2f2', borderRadius: 12, padding: '12px 14px', marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c0392b', marginBottom: 4 }}>EMERGENCY</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#c0392b' }}>{emergencyContact}</div>
        </div>
      )}

      <button onClick={() => onComplete('acknowledged')} style={{ ...bigButtonStyle(careGoals.sage), marginTop: 20 }}>
        Got it — ready for my shift
      </button>
    </div>
  );
}

function PhysicianReviewPage({ data, onComplete }: { data: Record<string, unknown>; onComplete: (value: string) => void }) {
  const pendingLMNs = (data.pendingLMNs as number) || 0;
  const interactions = (data.interactions as number) || 0;
  const topPriority = (data.topPriority as string) || '';
  const estimatedBilling = (data.estimatedBilling as number) || 0;

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: careGoals.sage, fontWeight: 600, marginBottom: 8 }}>REVIEW QUEUE</div>
      <h1 style={{ fontFamily: fonts.serif, fontSize: 24, fontWeight: 700, color: careGoals.charcoal, marginBottom: 20 }}>
        {pendingLMNs} items awaiting signature
      </h1>

      <div style={{ textAlign: 'left', marginBottom: 20 }}>
        {pendingLMNs > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${careGoals.border}`, fontSize: 14 }}>
            <span>LMNs to sign</span>
            <span style={{ fontWeight: 700, color: careGoals.charcoal }}>{pendingLMNs}</span>
          </div>
        )}
        {interactions > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${careGoals.border}`, fontSize: 14 }}>
            <span>Interactions to verify</span>
            <span style={{ fontWeight: 700, color: '#c0392b' }}>{interactions}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
          <span>Estimated billing</span>
          <span style={{ fontWeight: 700, color: careGoals.sage }}>${estimatedBilling}</span>
        </div>
      </div>

      {topPriority && (
        <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#c0392b', textAlign: 'left' }}>
          Priority: {topPriority}
        </div>
      )}

      <button onClick={() => onComplete('opened_queue')} style={bigButtonStyle(careGoals.sage)}>
        Open review queue
      </button>
    </div>
  );
}

function RefillAlertPage({ data, onComplete }: { data: Record<string, unknown>; onComplete: (value: string) => void }) {
  const medication = (data.medication as string) || '';
  const pharmacy = (data.pharmacy as string) || '';
  const pharmacyPhone = (data.pharmacyPhone as string) || '';
  const dueDate = (data.dueDate as string) || '';

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: '#e67e22', fontWeight: 600, marginBottom: 8 }}>REFILL ALERT</div>
      <h1 style={{ fontFamily: fonts.serif, fontSize: 22, fontWeight: 700, color: careGoals.charcoal, marginBottom: 4 }}>
        {medication}
      </h1>
      <p style={{ fontSize: 15, color: careGoals.muted, marginBottom: 24 }}>
        Refill due {dueDate} at {pharmacy}
      </p>
      <a href={`tel:${pharmacyPhone.replace(/\D/g, '')}`} style={{ textDecoration: 'none' }}>
        <button style={bigButtonStyle(careGoals.sage)}>
          Call {pharmacy} — {pharmacyPhone}
        </button>
      </a>
      <button onClick={() => onComplete('will_handle')} style={{ ...bigButtonStyle(careGoals.border), color: careGoals.muted }}>
        I'll handle it
      </button>
    </div>
  );
}

function SimpleQuestionPage({ data, onComplete, label }: { data: Record<string, unknown>; onComplete: (value: string) => void; label: string }) {
  const question = (data.question as string) || "How are you?";
  const options = (data.options as string[]) || ['Good', 'Not great'];

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: careGoals.sage, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <h1 style={{ fontFamily: fonts.serif, fontSize: 24, fontWeight: 700, color: careGoals.charcoal, marginBottom: 24, lineHeight: 1.3 }}>
        {question}
      </h1>
      {options.map((opt) => (
        <button key={opt} onClick={() => onComplete(opt)} style={optionButtonStyle(false)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Completion Screen ──────────────────────────────────────────────

function CompletionScreen({ billingCodes }: { billingCodes?: string[] }) {
  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: 16 }}>
        <svg width={48} height={48} viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto' }}>
          <circle cx="24" cy="24" r="22" fill={`${careGoals.sage}20`} />
          <path d="M16 24L22 30L32 18" stroke={careGoals.sage} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontFamily: fonts.serif, fontSize: 22, fontWeight: 700, color: careGoals.charcoal, marginBottom: 8 }}>
        Done
      </h2>
      <p style={{ fontSize: 14, color: careGoals.muted, marginBottom: 4 }}>
        Your care team has been updated.
      </p>
      {billingCodes && billingCodes.length > 0 && (
        <p style={{ fontSize: 11, color: careGoals.sage, fontWeight: 500 }}>
          {billingCodes.join(', ')} captured
        </p>
      )}
      <p style={{ fontSize: 12, color: careGoals.border, marginTop: 24 }}>
        You can close this tab.
      </p>
    </div>
  );
}

// ─── Expired Screen ─────────────────────────────────────────────────

function ExpiredScreen() {
  return (
    <div style={cardStyle}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: 20, color: careGoals.charcoal, marginBottom: 8 }}>
        This link has expired
      </h2>
      <p style={{ fontSize: 14, color: careGoals.muted }}>
        Contact your care team for a new link.
      </p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function ActionPage() {
  const { token } = useParams<{ token: string }>();
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production: fetch from /api/v1/action/:token
    const data = mockFetchToken(token || '');
    setActionData(data);
    setLoading(false);
  }, [token]);

  const handleComplete = async (value: string) => {
    // In production: POST to /api/v1/action/:token/complete
    // { value, completedAt: new Date().toISOString() }
    // Server records action, fires billing, updates profile
    setCompleted(true);
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ color: careGoals.muted, fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (!actionData || actionData.expired) {
    return (
      <div style={pageStyle}>
        <ExpiredScreen />
      </div>
    );
  }

  if (completed) {
    return (
      <div style={pageStyle}>
        <link rel="stylesheet" href={fontLinks.dmSans} />
        <link rel="stylesheet" href={fontLinks.lora} />
        <CompletionScreen billingCodes={actionData.billingCodes} />
      </div>
    );
  }

  const recipientName = actionData.recipientName;

  return (
    <>
      <link rel="stylesheet" href={fontLinks.dmSans} />
      <link rel="stylesheet" href={fontLinks.lora} />

      <div style={pageStyle}>
        {/* Minimal header — just the name and co-op.care badge */}
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: careGoals.sage }}>co-op.care</span>
          {recipientName && (
            <span style={{ fontSize: 11, color: careGoals.muted }}> · {recipientName}</span>
          )}
        </div>

        {/* Template renderer */}
        {actionData.template === 'prom' && <PromPage data={actionData.data} onComplete={handleComplete} />}
        {actionData.template === 'med_reminder' && <MedReminderPage data={actionData.data} onComplete={handleComplete} />}
        {actionData.template === 'lmn_confirm' && <LmnConfirmPage data={actionData.data} onComplete={handleComplete} />}
        {actionData.template === 'shift_checklist' && <ShiftChecklistPage data={actionData.data} onComplete={handleComplete} />}
        {actionData.template === 'physician_review' && <PhysicianReviewPage data={actionData.data} onComplete={handleComplete} />}
        {actionData.template === 'refill_alert' && <RefillAlertPage data={actionData.data} onComplete={handleComplete} />}
        {actionData.template === 'fall_check' && <SimpleQuestionPage data={actionData.data} onComplete={handleComplete} label="BALANCE CHECK" />}
        {actionData.template === 'ccm_checkin' && <SimpleQuestionPage data={actionData.data} onComplete={handleComplete} label="MONTHLY CHECK-IN" />}
        {actionData.template === 'acp_question' && <SimpleQuestionPage data={actionData.data} onComplete={handleComplete} label="WHAT MATTERS" />}

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: careGoals.border }}>
          {company.medicalDirector.name} · {company.medicalDirector.license}
        </div>
      </div>
    </>
  );
}
