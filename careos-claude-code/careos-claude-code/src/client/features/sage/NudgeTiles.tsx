/**
 * NudgeTiles — Three progressive nudges between Card and Sage
 *
 * Not a dashboard. A guided path. Each tile is the next most
 * valuable thing you can do. Complete one → it transforms into
 * a reward, and the next step appears.
 *
 * KEY BEHAVIOR: Tiles ROTATE based on what you're talking about
 * with Sage. Ask about billing → the savings calculator tile appears.
 * Ask about burnout → the wellness check tile appears.
 *
 * Every completion gives an immediate reward:
 *   - Time Bank hours
 *   - Unlocked feature
 *   - Visible progress
 */
import { useSignupStore, type OnboardingPhase } from '../../stores/signupStore';
import { useSageStore } from '../../stores/sageStore';
import { loadProfile, type UserProfile, type Domain } from '../sage/engine/SageEngine';
import { TileIcon } from '../../components/TileIcon';
import { Icon } from '../../components/Icon';

interface NudgeTile {
  /** Small label above the value */
  label: string;
  /** Main value — the action or reward */
  value: string;
  /** Description */
  desc: string;
  /** What Sage says when tapped */
  message: string;
  /** Visual accent */
  icon: string;
  /** Whether this is completed */
  completed?: boolean;
  /** Reward shown when completed */
  reward?: string;
  /** Expandable detail (education bubble) */
  detail?: string;
}

interface NudgeTilesProps {
  onTileClick: (message: string) => void;
}

// ─── Domain-Reactive Tile Pool ─────────────────────────────────────────
// When the user asks Sage about a topic, a contextual tile swaps in

function getDomainTile(domain: Domain | null): NudgeTile | null {
  switch (domain) {
    case 'billing':
    case 'coverage':
    case 'lmn':
      return {
        label: 'Your savings',
        value: 'Cost calculator',
        desc: 'See what care really costs',
        message: 'How much could my family save on care costs?',
        icon: 'money',
        detail:
          "A doctor's note included with your membership can save you 28-36% on care costs by letting you pay with pre-tax health savings.",
      };
    case 'emotional_support':
    case 'assessment':
      return {
        label: '30 seconds',
        value: 'Wellness check',
        desc: 'How are you really doing?',
        message: "Let's do a quick wellness check — I want to see where I stand",
        icon: 'pulse',
        detail:
          "Three quick sliders measure physical strain, sleep impact, and social isolation. If you're in the red zone, our Respite Fund kicks in — yoga classes, meditation, massage, whatever helps you recover.",
      };
    case 'worker_intake':
    case 'equity':
    case 'governance':
      return {
        label: 'Become',
        value: 'A neighbor',
        desc: '$25-28/hr + equity',
        message: "I'm interested in becoming a Care Neighbor",
        icon: 'handshake',
        detail:
          'Care Neighbors earn $25-28/hr with full W-2 benefits and ownership equity in the cooperative. Same family every week.',
      };
    case 'visit_workflow':
    case 'scheduling':
      return {
        label: 'See how',
        value: 'Visits work',
        desc: 'Scan → visit → done',
        message: 'Walk me through how a care visit works — from start to finish',
        icon: 'refresh',
        detail:
          'Scan a QR code to start a visit. Your phone tracks the visit, logs what happened, and credits your Time Bank hours automatically.',
      };
    case 'timebank':
    case 'referral':
      return {
        label: 'Grow',
        value: 'Your circle',
        desc: 'You both get a free hour',
        message: 'I want to invite someone I trust to join co-op.care',
        icon: 'seedling',
        detail:
          'Share your QR code with a neighbor, friend, or family member. When they join, you both get a free Time Bank hour. Refer 5 people and you earn Founding Circle status — priority matching, early feature access, and a voice in co-op governance.',
      };
    case 'family_intake':
    case 'tell_my_story':
      return {
        label: 'Your family',
        value: 'Care profile',
        desc: "Who you're caring for",
        message: "I want to tell you about my family's care situation",
        icon: 'family',
        detail:
          'Tell Sage about your family and care situation. The more Sage knows, the better it can help you find the right resources and neighbors.',
      };
    default:
      return null;
  }
}

// ─── Tile Selection Logic ──────────────────────────────────────────────

function getNudges(
  phase: OnboardingPhase,
  profile: UserProfile,
  hasRoles: boolean,
  hasName: boolean,
  hasCard: boolean,
  lastDomain: Domain | null,
): [NudgeTile, NudgeTile, NudgeTile] {
  // Domain-reactive tile — swaps into position 2 when relevant
  const domainTile = getDomainTile(lastDomain);

  // ── CARD ACQUISITION — always the priority until they have one ──
  const cardTile: NudgeTile = hasCard
    ? {
        label: 'Your card',
        value: 'Active',
        desc: 'Share your QR code',
        message: 'I want to share my QR code with someone I trust',
        icon: 'card',
        completed: true,
        reward: 'Card ready!',
      }
    : {
        label: 'First step',
        value: 'Get your card',
        desc: 'Free — 30 seconds',
        message: 'I want my free Comfort Card',
        icon: 'card',
        detail:
          "Your Comfort Card is a digital identity with a QR code. Share it with family, neighbors, anyone in your care circle. It's free, always.",
      };

  // Phase 1: Fresh — haven't told their story yet
  if (phase === 'fresh' || phase === 'exploring') {
    const storyTile: NudgeTile = hasName
      ? {
          label: 'First step',
          value: 'Introduced',
          desc: 'Sage knows you',
          message: 'What should I do next to build my care profile?',
          icon: 'chat',
          completed: true,
          reward: '+1 hr banked',
        }
      : {
          label: 'Tell Sage',
          value: 'Your story',
          desc: 'Who are you caring for?',
          message: "I want to tell you about my family's care situation",
          icon: 'chat',
          detail:
            "No forms. Just tell Sage about your life — who you're caring for, what's hard, what you need. Sage remembers and builds your care profile from the conversation.",
        };

    const wellnessTile: NudgeTile = profile.lastMiniCII
      ? {
          label: '30 seconds',
          value: 'Checked in',
          desc: `Score: ${profile.lastMiniCII.total}/30`,
          message: 'Show me my wellness trend',
          icon: 'heart',
          completed: true,
          reward: 'Score unlocked',
        }
      : {
          label: '30 seconds',
          value: 'Wellness check',
          desc: 'How are you really doing?',
          message: "Let's do a quick wellness check — I want to see where I stand",
          icon: 'pulse',
          detail:
            "Three quick sliders measure physical strain, sleep impact, and social isolation. No judgment — just honest reflection. If you need it, we'll connect you with yoga, movement, or respite support.",
        };

    // If there's a domain-reactive tile, swap it into position 2
    return [
      hasCard ? storyTile : cardTile,
      domainTile || wellnessTile,
      hasCard ? cardTile : storyTile,
    ];
  }

  // Phase 2: Profile building
  if (phase === 'profile_intent' || phase === 'profile_roles') {
    const roleTile: NudgeTile = hasRoles
      ? {
          label: 'Your role',
          value: 'Role set',
          desc: 'Profile growing',
          message: 'What does my role mean for my care network?',
          icon: 'check',
          completed: true,
          reward: '+2 hrs banked',
        }
      : {
          label: 'Your role',
          value: 'Choose your role',
          desc: 'Conductor, neighbor, or both?',
          message: 'What roles can I have in co-op.care? I want to choose mine.',
          icon: 'compass',
          detail:
            'Conductors coordinate care for family. Neighbors give time. Many people are both. Your role shapes how Sage helps you.',
        };

    return [
      cardTile,
      domainTile || roleTile,
      {
        label: 'See how',
        value: 'Visits work',
        desc: 'Scan → visit → done',
        message: 'Walk me through how a care visit works',
        icon: 'refresh',
        detail:
          'Scan your card to start a visit. Your phone handles the rest — tracking, logging, and Time Bank credits, all automatic.',
      },
    ];
  }

  // Phase 3: Community building
  if (phase === 'profile_community' || phase === 'memory_consent') {
    return [
      cardTile,
      domainTile || {
        label: 'Your wishes',
        value: 'Care values',
        desc: 'What matters to your family?',
        message: 'I want to record what matters most to my family about how we receive care',
        icon: 'dove',
        detail:
          "Document your family's values, preferences, and wishes for care. This becomes part of your profile so every caregiver knows what matters.",
      },
      {
        label: 'Safety net',
        value: 'Emergency info',
        desc: 'Linked to your card',
        message: 'Help me set up emergency contacts on my card',
        icon: 'shield',
        detail:
          'Add emergency contacts, medications, and important health information to your Comfort Card. Available via QR scan when it matters most.',
      },
    ];
  }

  // Phase 4: Onboarded — ongoing engagement
  const conversationDepth = profile.conversationCount || 0;
  const referralCount = profile.referralCount || 0;

  return [
    cardTile,
    domainTile || {
      label: 'This week',
      value: conversationDepth > 5 ? 'Check in' : 'Talk to Sage',
      desc: conversationDepth > 5 ? 'How are things going?' : 'Build your care plan',
      message:
        conversationDepth > 5
          ? "Let's check in — how has care been going this week?"
          : "Help me think through my family's care needs this week",
      icon: 'clipboard',
    },
    {
      label: 'Your impact',
      value: referralCount > 0 ? `${referralCount} invited` : 'Grow the circle',
      desc: referralCount > 0 ? 'Your community is growing' : 'Every invite strengthens the co-op',
      message:
        referralCount > 0
          ? 'Tell me about my referrals and community growth'
          : 'I want to invite more people to co-op.care',
      icon: 'seedling',
    },
  ];
}

// ─── Tile Component — tap goes straight to Sage ─────────────────────────

function Tile({ tile, onTileClick }: { tile: NudgeTile; onTileClick: (msg: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onTileClick(tile.message)}
      className={`flex flex-col items-center rounded-xl border p-3 text-center transition-all active:scale-95 ${
        tile.completed
          ? 'border-sage/30 bg-sage/5'
          : 'border-border bg-white hover:border-sage/20 hover:bg-sage/3'
      }`}
    >
      <span className={`${tile.completed ? 'text-sage-dark' : 'text-navy gentle-float'}`}>
        <TileIcon name={tile.icon} size={22} />
      </span>

      <p
        className={`mt-1.5 font-heading text-[0.8rem] font-semibold leading-tight ${
          tile.completed ? 'text-sage-dark' : 'text-navy'
        }`}
      >
        {tile.completed && <Icon name="check" size={12} className="inline mr-0.5" />}
        {tile.value}
      </p>

      <p className="mt-0.5 text-[10px] leading-tight text-text-muted">{tile.desc}</p>

      {tile.reward && (
        <span className="mt-1.5 inline-block rounded-full bg-sage/10 px-2 py-0.5 text-[9px] font-semibold text-sage-dark">
          {tile.reward}
        </span>
      )}
    </button>
  );
}

// ─── Component ──────────────────────────────────────────────────────────

export function NudgeTiles({ onTileClick }: NudgeTilesProps) {
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const phase = cardHolder?.onboardingPhase || 'fresh';
  const hasRoles = (cardHolder?.communityRoles?.length ?? 0) > 0;
  const hasName = !!cardHolder?.firstName && cardHolder.firstName !== 'New Member';
  const hasCard = !!cardHolder;
  // Reactive: re-render when Sage updates profile during conversation
  const storeProfile = useSageStore((s) => s.profile);
  const profile = storeProfile.conversationCount > 0 ? storeProfile : loadProfile();

  // Domain-reactive: read what the user last asked Sage about
  const lastDomain = useSageStore((s) => s.context.lastDomain);

  const nudges = getNudges(phase, profile, hasRoles, hasName, hasCard, lastDomain);

  // Profile completion — visual progress
  const steps = [
    hasCard,
    hasName,
    !!profile.lastMiniCII,
    hasRoles,
    phase === 'onboarded' || phase === 'returning',
  ];
  const completed = steps.filter(Boolean).length;
  const total = steps.length;

  return (
    <div>
      <div className="w-full">
        {/* Progress — subtle, warm */}
        {completed < total && (
          <div className="mb-3 flex items-center gap-2 px-1">
            <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-sage transition-all duration-700"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-bark-light">
              {completed}/{total}
            </span>
          </div>
        )}

        {/* The 3 nudge tiles */}
        <div className="grid grid-cols-3 gap-2">
          {nudges.map((tile, i) => (
            <Tile key={`${tile.label}-${i}`} tile={tile} onTileClick={onTileClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
