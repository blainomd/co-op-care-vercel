/**
 * NewUserCard — Welcome card for visitors who haven't joined yet.
 *
 * Shows the co-op.care value proposition with 3 tappable tiles
 * that send exploratory questions to Sage.
 */

interface TileData {
  label: string;
  value: string;
  sublabel?: string;
  color: string;
  message: string;
}

interface NewUserCardProps {
  onTileClick?: (message: string) => void;
  dynamicTiles?: TileData[];
}

const WELCOME_TILES = [
  {
    label: 'I\u2019m a Caregiver',
    value: 'Get support',
    sublabel: 'Burnout check \u2022 Respite \u2022 Community',
    color: 'sage' as const,
    message: 'I\u2019m a family caregiver and I need help',
  },
  {
    label: 'I Want to Help',
    value: 'Join the co-op',
    sublabel: '$25-28/hr \u2022 W-2 \u2022 Ownership',
    color: 'blue' as const,
    message: 'I want to become a care worker at co-op.care',
  },
  {
    label: 'Learn More',
    value: 'How it works',
    sublabel: 'Cooperative \u2022 Time Bank \u2022 Community',
    color: 'gold' as const,
    message: 'How is co-op.care different from a home care agency?',
  },
];

const TILE_COLORS: Record<string, string> = {
  sage: 'bg-sage/10 text-sage-dark border-sage/20',
  blue: 'bg-blue/10 text-blue-dark border-blue/20',
  gold: 'bg-gold/10 text-gold-dark border-gold/20',
};

export function NewUserCard({ onTileClick, dynamicTiles }: NewUserCardProps) {
  const tiles = dynamicTiles && dynamicTiles.length === 3 ? dynamicTiles : WELCOME_TILES;
  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-6 pb-2">
      {/* Welcome card — every element is tappable */}
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg ring-1 ring-border">
        <button
          type="button"
          onClick={() => onTileClick?.('How is co-op.care different from a home care agency?')}
          className="w-full text-center transition-opacity active:opacity-70"
        >
          <h1 className="font-heading text-2xl font-semibold text-text-primary">co-op.care</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Companion care, cooperatively owned. Our caregivers earn $25-28/hr, own the company, and
            don't leave. <strong className="text-sage-dark">That changes everything.</strong>
          </p>
        </button>

        <button
          type="button"
          onClick={() => onTileClick?.('I\u2019m a family caregiver and I need help')}
          className="mt-4 w-full space-y-2 text-center transition-opacity active:opacity-70"
        >
          <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
            <span>63M family caregivers</span>
            <span>{'\u2022'}</span>
            <span>27 hrs/week unpaid</span>
          </div>
          <p className="text-xs text-text-muted">You don't have to do this alone.</p>
        </button>
      </div>

      {/* 3 Tappable Tiles */}
      <div className="grid w-full max-w-sm grid-cols-3 gap-2.5">
        {tiles.map((tile, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onTileClick?.(tile.message)}
            className={`relative rounded-xl border p-3 text-left transition-all active:scale-95 ${TILE_COLORS[tile.color]}`}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">
              {tile.label}
            </p>
            <p className="mt-1 font-heading text-base font-semibold leading-tight">{tile.value}</p>
            <p className="mt-0.5 text-[10px] leading-tight opacity-60">{tile.sublabel}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
