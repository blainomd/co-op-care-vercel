/**
 * ConnectorCard — Renders any ConnectorConfig as a card
 *
 * Matches the Perplexity 6-card layout: warm cream background,
 * white cards, rounded corners, simple line icon, bold title, body text.
 *
 * Each card is a Connector company. Click → standalone Connector route.
 *
 * Inline styles — DO NOT apply Tailwind (standalone brand page).
 */
import { fonts } from '../marketing/design-tokens';
import type { ConnectorConfig } from '../../../shared/types/connector.types';

// ─── SVG Icons (matching Perplexity's minimal line style) ───────────

function ConnectorIcon({ icon, size = 28 }: { icon: string; size?: number }) {
  const stroke = '#3a3a3a';
  const sw = 1.5;

  const icons: Record<string, React.ReactElement> = {
    research: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    'care-plan': (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    medication: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    savings: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 7c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7z" />
        <path d="M16 3H8c-1.1 0-2 .9-2 2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    memory: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4" />
        <path d="M12 19v4" />
        <path d="M4.22 4.22l2.83 2.83" />
        <path d="M16.95 16.95l2.83 2.83" />
        <path d="M1 12h4" />
        <path d="M19 12h4" />
        <path d="M4.22 19.78l2.83-2.83" />
        <path d="M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    calendar: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
  };

  return icons[icon] || icons.research;
}

// ─── Card Component ─────────────────────────────────────────────────

interface ConnectorCardProps {
  connector: ConnectorConfig;
  onClick?: () => void;
}

export function ConnectorCard({ connector, onClick }: ConnectorCardProps) {
  const { landing } = connector;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '28px 24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: 180,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Icon */}
      <ConnectorIcon icon={landing.icon} />

      {/* Title */}
      <h3
        style={{
          fontFamily: fonts.body,
          fontSize: 18,
          fontWeight: 700,
          color: '#1a1a1a',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {landing.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: fonts.body,
          fontSize: 14,
          color: '#666',
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
        }}
      >
        {landing.description}
      </p>

      {/* Ecosystem tag — the thing Perplexity doesn't have */}
      {connector.requiresPhysicianReview && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 600,
            color: landing.tagColor,
            letterSpacing: '0.03em',
          }}
        >
          <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke={landing.tagColor} strokeWidth="1.5" />
            <path
              d="M3.5 5L4.5 6L6.5 4"
              stroke={landing.tagColor}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Physician reviewed
        </div>
      )}
    </div>
  );
}

// ─── Card Grid (renders all Connectors) ─────────────────────────────

interface ConnectorGridProps {
  connectors: ConnectorConfig[];
  onConnectorClick?: (connector: ConnectorConfig) => void;
}

export function ConnectorGrid({ connectors, onConnectorClick }: ConnectorGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      {connectors.map((c) => (
        <ConnectorCard
          key={c.id}
          connector={c}
          onClick={onConnectorClick ? () => onConnectorClick(c) : undefined}
        />
      ))}
    </div>
  );
}
