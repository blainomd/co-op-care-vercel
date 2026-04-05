/**
 * DashboardTiles — Rich engagement sections between card and Sage chat.
 *
 * Sections adapt by user type:
 *   - New user / comfort card: profile completion + discovery tiles
 *   - Full member: network, scheduling, assessments, next actions
 *
 * Every tile tap sends a message to Sage via onTileClick.
 */
import type { CardTile } from '@shared/types/card.types';

interface TileWithAction extends CardTile {
  message: string;
}

interface TileSection {
  title: string;
  subtitle?: string;
  tiles: TileWithAction[];
  /** Columns: 2 for wide tiles, 3 for compact */
  cols?: 2 | 3;
}

interface DashboardTilesProps {
  onTileClick: (message: string) => void;
  /** User type determines which sections appear */
  variant: 'new' | 'comfort' | 'member';
}

const TILE_COLORS: Record<CardTile['color'], string> = {
  sage: 'bg-sage/10 text-sage-dark border-sage/20',
  copper: 'bg-copper/10 text-copper border-copper/20',
  gold: 'bg-gold/10 text-gold-dark border-gold/20',
  blue: 'bg-blue/10 text-blue-dark border-blue/20',
  red: 'bg-zone-red/10 text-zone-red border-zone-red/20',
  yellow: 'bg-zone-yellow/10 text-yellow-700 border-zone-yellow/20',
  gray: 'bg-warm-gray text-text-secondary border-border',
};

// ─── Tile Data by Variant ──────────────────────────────────────────────

const NEW_USER_SECTIONS: TileSection[] = [
  {
    title: 'Get started',
    subtitle: 'Tap any tile to learn more',
    cols: 2,
    tiles: [
      {
        label: 'Care Identity',
        value: 'Free card',
        sublabel: 'QR-coded, in your pocket',
        color: 'sage',
        message: 'How does the Comfort Card work?',
      },
      {
        label: 'Time Bank',
        value: '40 hrs free',
        sublabel: 'With $100/yr membership',
        color: 'gold',
        message: 'How does the Time Bank work?',
      },
      {
        label: 'Find Help',
        value: 'Within 2mi',
        sublabel: 'Vetted neighbors nearby',
        color: 'blue',
        message: 'How does neighbor matching work?',
      },
      {
        label: 'You Own It',
        value: 'Co-op model',
        sublabel: 'Members own it together',
        color: 'copper',
        message: 'Tell me about cooperative ownership',
      },
    ],
  },
];

const COMFORT_CARD_SECTIONS: TileSection[] = [
  {
    title: 'Complete your profile',
    subtitle: 'The more Sage knows, the better help you get',
    cols: 2,
    tiles: [
      {
        label: 'Care Needs',
        value: 'Tell Sage',
        sublabel: 'Who needs care?',
        color: 'sage',
        message: 'I need help caring for a family member',
      },
      {
        label: 'Your Role',
        value: 'Pick one',
        sublabel: 'Conductor or Neighbor?',
        color: 'copper',
        message: 'What roles can I have in co-op.care?',
      },
      {
        label: 'Location',
        value: 'Set zip',
        sublabel: 'For neighbor matching',
        color: 'blue',
        message: 'I want to set my location for matching',
      },
      {
        label: 'Emergency',
        value: 'Add contacts',
        sublabel: 'Linked to your card',
        color: 'red',
        message: 'How do I add emergency contacts to my card?',
      },
    ],
  },
  {
    title: 'Discover',
    cols: 3,
    tiles: [
      {
        label: 'Assessments',
        value: 'Quick check',
        sublabel: '30 seconds',
        color: 'yellow',
        message: "Let's do a quick wellness check",
      },
      {
        label: 'Neighbors',
        value: 'Browse',
        sublabel: 'Near you',
        color: 'blue',
        message: 'Are there neighbors near me who can help?',
      },
      {
        label: 'Invite',
        value: 'Share card',
        sublabel: 'Earn hours',
        color: 'gold',
        message: 'How do I invite someone to co-op.care?',
      },
    ],
  },
];

const MEMBER_SECTIONS: TileSection[] = [
  {
    title: 'Your care network',
    cols: 3,
    tiles: [
      {
        label: 'Care Team',
        value: '3 people',
        sublabel: 'View connections',
        color: 'sage',
        message: "Who's on my care team?",
      },
      {
        label: 'Neighbors',
        value: '7 nearby',
        sublabel: 'Within 2 miles',
        color: 'blue',
        message: "Who's available to help near me?",
      },
      {
        label: 'Invited',
        value: '2 pending',
        sublabel: 'Check status',
        color: 'copper',
        message: 'Did anyone accept my invitations?',
      },
    ],
  },
  {
    title: 'Scheduling',
    cols: 2,
    tiles: [
      {
        label: 'Next Visit',
        value: 'Schedule',
        sublabel: 'Book your first visit',
        color: 'blue',
        message: 'I want to schedule a visit',
      },
      {
        label: 'Request Help',
        value: 'New task',
        sublabel: 'Post to neighbors',
        color: 'sage',
        message: 'I need to request help from a neighbor',
      },
      {
        label: 'Task Feed',
        value: '5 nearby',
        sublabel: 'Earn Time Bank hrs',
        color: 'gold',
        message: 'What tasks are available near me?',
      },
      {
        label: 'History',
        value: '12 visits',
        sublabel: 'This month',
        color: 'gray',
        message: 'Show me my visit history',
      },
    ],
  },
  {
    title: 'Health & assessments',
    cols: 3,
    tiles: [
      {
        label: 'Wellness',
        value: 'Check in',
        sublabel: 'Quick 30-sec CII',
        color: 'yellow',
        pulse: true,
        message: "Let's do a quick wellness check",
      },
      {
        label: 'Burnout',
        value: 'CII Score',
        sublabel: 'Take assessment',
        color: 'yellow',
        message: "Let's check my burnout score",
      },
      {
        label: 'Care Risk',
        value: 'CRI',
        sublabel: 'MD review',
        color: 'red',
        message: 'What is the Care Risk Index?',
      },
    ],
  },
  {
    title: 'Recommended next',
    subtitle: 'Based on your activity',
    cols: 2,
    tiles: [
      {
        label: 'LMN Savings',
        value: '28-36% off',
        sublabel: 'HSA/FSA eligible',
        color: 'gold',
        message: 'How can I save money with a Letter of Medical Necessity?',
      },
      {
        label: 'Streak',
        value: '4 weeks',
        sublabel: 'Keep it going!',
        color: 'sage',
        message: 'Tell me about my streak',
      },
    ],
  },
];

function getSections(variant: DashboardTilesProps['variant']): TileSection[] {
  switch (variant) {
    case 'new':
      return NEW_USER_SECTIONS;
    case 'comfort':
      return COMFORT_CARD_SECTIONS;
    case 'member':
      return MEMBER_SECTIONS;
  }
}

// ─── Component ──────────────────────────────────────────────────────────

export function DashboardTiles({ onTileClick, variant }: DashboardTilesProps) {
  const sections = getSections(variant);

  return (
    <div className="flex justify-center px-4 pb-2">
      <div className="w-full max-w-sm space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            {/* Section header */}
            <div className="mb-2 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {section.title}
              </h3>
              {section.subtitle && (
                <p className="text-[10px] text-text-muted/70">{section.subtitle}</p>
              )}
            </div>

            {/* Tile grid */}
            <div className={`grid gap-2.5 ${section.cols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {section.tiles.map((tile) => (
                <button
                  key={tile.label}
                  type="button"
                  onClick={() => onTileClick(tile.message)}
                  className={`relative rounded-xl border p-3 text-left transition-all active:scale-95 ${TILE_COLORS[tile.color]} ${tile.pulse ? 'animate-pulse' : ''}`}
                >
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                    {tile.label}
                  </p>
                  <p className="mt-1 font-heading text-base font-semibold leading-tight">
                    {tile.value}
                  </p>
                  {tile.sublabel && (
                    <p className="mt-0.5 text-[10px] leading-tight opacity-60">{tile.sublabel}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
