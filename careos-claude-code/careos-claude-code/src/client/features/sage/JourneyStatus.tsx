/**
 * Journey Status — Shows families where they are in the care pipeline
 *
 * Visual progress tracker:
 * Chatting → Building Profile → Assessment → LMN Review → Active
 *
 * Appears in the Sage chat interface when a family has progressed
 * past the "discovered" stage.
 */

const STAGES = [
  {
    key: 'profiling',
    label: 'Building Profile',
    icon: '💬',
    description: 'Sage is learning about your family',
  },
  {
    key: 'assessing',
    label: 'Assessment',
    icon: '📋',
    description: 'Quick check-in to understand your needs',
  },
  {
    key: 'lmn_eligible',
    label: 'Generating LMN',
    icon: '📝',
    description: 'Creating your Letter of Medical Necessity',
  },
  {
    key: 'lmn_review',
    label: 'Doctor Review',
    icon: '👨‍⚕️',
    description: 'Dr. Emdur is reviewing your letter',
  },
  {
    key: 'lmn_signed',
    label: 'LMN Ready',
    icon: '✅',
    description: 'Your letter is signed — HSA/FSA unlocked!',
  },
  {
    key: 'active_lmn',
    label: 'Active',
    icon: '🌱',
    description: "You're covered. Save 28-36% with your HSA/FSA.",
  },
] as const;

interface JourneyStatusProps {
  stage: string;
  profileCompleteness?: number;
}

export function JourneyStatus({ stage, profileCompleteness }: JourneyStatusProps) {
  if (stage === 'discovered') return null;

  const currentIndex = STAGES.findIndex((s) => s.key === stage);
  if (currentIndex === -1) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-3">
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-warm-gray/15 p-4 shadow-sm">
        <p className="mb-3 text-center font-body text-xs font-medium text-text-muted uppercase tracking-wider">
          Your care journey
        </p>

        {/* Progress bar */}
        <div className="relative mb-4">
          <div className="h-1.5 rounded-full bg-warm-gray/20">
            <div
              className="h-1.5 rounded-full bg-sage transition-all duration-700"
              style={{ width: `${Math.min(100, ((currentIndex + 1) / STAGES.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Current stage */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{STAGES[currentIndex]?.icon}</span>
          <div className="flex-1">
            <p className="font-serif font-semibold text-navy text-sm">
              {STAGES[currentIndex]?.label}
            </p>
            <p className="font-body text-xs text-text-muted">{STAGES[currentIndex]?.description}</p>
          </div>
          {stage === 'profiling' && profileCompleteness !== undefined && (
            <span className="rounded-full bg-sage/10 px-2 py-0.5 text-xs font-medium text-sage">
              {Math.round(profileCompleteness * 100)}%
            </span>
          )}
        </div>

        {/* Stage dots */}
        <div className="mt-3 flex justify-center gap-1.5">
          {STAGES.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i <= currentIndex ? 'bg-sage' : 'bg-warm-gray/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
