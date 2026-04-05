/* eslint-disable react-refresh/only-export-components */
// co-op.care Icon Library -- Warm Illustrated SVGs
// Usage: <Icon name="sunrise" size={24} /> or {icons.sunrise(24, "#6b8f71")}

import React from 'react';

type IconRenderer = (size?: number, color?: string, accent?: string) => React.ReactElement;

export const ICON_NAMES = [
  'sunrise',
  'heart',
  'dove',
  'people',
  'waves',
  'medical',
  'book',
  'horizon',
  'home',
  'goalHeart',
  'chart',
  'team',
  'more',
  'clipboard',
  'camera',
  'send',
  'calendar',
  'pill',
  'folder',
  'dumbbell',
  'settings',
  'document',
  'shield',
  'sparkle',
  'physician',
  'handshake',
  'moneyCircle',
  'check',
  'celebrate',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  accent?: string;
}

export const icons: Record<IconName, IconRenderer> = {
  // ===== CAREGOALS MODULE ICONS =====
  sunrise: (s = 24, c = '#6b8f71', a = '#f4a261') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="28" r="10" fill={`${a}40`} />
      <path
        d="M24 18v-6M12 28H6M42 28h-6M14 20l-4-4M34 20l4-4"
        stroke={a}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M10 36h28" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M14 32c0-5.5 4.5-10 10-10s10 4.5 10 10"
        stroke={a}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  heart: (s = 24, c = '#d4766a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 42s-16-9.5-16-20c0-5.5 4.5-10 10-10 3.5 0 6 2 6 2s2.5-2 6-2c5.5 0 10 4.5 10 10 0 10.5-16 20-16 20z"
        fill={`${c}30`}
        stroke={c}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  dove: (s = 24, c = '#6b8f71', a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M16 32c4-8 12-12 20-10-4 6-10 10-16 12l-4-2z"
        fill={`${c}25`}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 34c-4 2-8 2-10-2 2-2 6-2 10 0"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="24" r="1.5" fill={c} />
      <path d="M12 38l4-6" stroke={a} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 38l4-6" stroke={a} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  people: (s = 24, c = '#6b8f71', a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="18" cy="16" r="5" fill={`${a}60`} />
      <circle cx="32" cy="16" r="5" fill={`${c}40`} />
      <path d="M8 36c0-5.5 4.5-10 10-10s10 4.5 10 10" fill={`${a}25`} stroke={a} strokeWidth="2" />
      <path d="M22 36c0-5.5 4.5-10 10-10s10 4.5 10 10" fill={`${c}20`} stroke={c} strokeWidth="2" />
    </svg>
  ),
  waves: (s = 24, c = '#4a6fa5') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M6 20c4-4 8 0 12-4s8 0 12-4 8 0 12-4"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M6 28c4-4 8 0 12-4s8 0 12-4 8 0 12-4"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M6 36c4-4 8 0 12-4s8 0 12-4 8 0 12-4"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  medical: (s = 24, c = '#6b8f71', a = '#d4766a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="10"
        y="10"
        width="28"
        height="28"
        rx="6"
        fill={`${c}15`}
        stroke={c}
        strokeWidth="2"
      />
      <rect x="20" y="16" width="8" height="16" rx="1.5" fill={`${a}50`} />
      <rect x="16" y="20" width="16" height="8" rx="1.5" fill={`${a}50`} />
    </svg>
  ),
  book: (s = 24, c = '#8b7355', a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M8 10h14c2 0 2 2 2 2v28s0-2-2-2H8V10z"
        fill={`${a}20`}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M40 10H26c-2 0-2 2-2 2v28s0-2 2-2h14V10z"
        fill={`${a}20`}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line
        x1="13"
        y1="18"
        x2="19"
        y2="18"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="13"
        y1="23"
        x2="18"
        y2="23"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="29"
        y1="18"
        x2="35"
        y2="18"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="29"
        y1="23"
        x2="34"
        y2="23"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  ),
  horizon: (s = 24, c = '#6b8f71', a = '#f4a261') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="30" r="10" fill={`${a}25`} />
      <path d="M8 34h32" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M12 30c0-6.6 5.4-12 12-12s12 5.4 12 12"
        stroke={a}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M6 40h36" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),

  // ===== NAV & UI ICONS =====
  home: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 8L6 24h6v16h10V30h4v10h10V24h6L24 8z"
        fill={`${c}20`}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  goalHeart: (s = 24, c = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 42s-14-8.5-14-18c0-5 4-9 9-9 3 0 5 1.5 5 1.5s2-1.5 5-1.5c5 0 9 4 9 9 0 9.5-14 18-14 18z"
        fill={`${c}30`}
        stroke={c}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 24l3 3 6-6"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chart: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="36" height="36" rx="6" fill={`${c}10`} stroke={c} strokeWidth="2" />
      <polyline
        points="12,34 18,26 24,30 32,18 38,22"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="22" r="2.5" fill="#f4a261" />
    </svg>
  ),
  team: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="14" r="6" fill={`${c}30`} />
      <circle cx="12" cy="20" r="4.5" fill={`${c}20`} />
      <circle cx="36" cy="20" r="4.5" fill={`${c}20`} />
      <path d="M14 38c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke={c} strokeWidth="2" fill={`${c}10`} />
      <path d="M4 40c0-4.4 3.6-8 8-8" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 40c0-4.4-3.6-8-8-8" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  more: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="12" cy="24" r="3.5" fill={c} />
      <circle cx="24" cy="24" r="3.5" fill={c} />
      <circle cx="36" cy="24" r="3.5" fill={c} />
    </svg>
  ),

  // ===== ACTION ICONS =====
  clipboard: (s = 24, c = '#6b8f71', a = '#f4a261') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="10" y="8" width="28" height="34" rx="4" fill={`${c}10`} stroke={c} strokeWidth="2" />
      <rect x="18" y="4" width="12" height="8" rx="4" fill={a} opacity="0.6" />
      <line
        x1="16"
        y1="22"
        x2="32"
        y2="22"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="16"
        y1="28"
        x2="28"
        y2="28"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="16"
        y1="34"
        x2="30"
        y2="34"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  ),
  camera: (s = 24, c = '#6b8f71', a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="14" width="40" height="28" rx="5" fill={`${c}15`} stroke={c} strokeWidth="2" />
      <circle cx="24" cy="28" r="8" fill={`${a}25`} stroke={c} strokeWidth="2" />
      <circle cx="24" cy="28" r="4" fill={`${c}30`} />
      <path d="M18 14l2-6h8l2 6" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="36" cy="20" r="2" fill={a} opacity="0.6" />
    </svg>
  ),
  send: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M6 24l36-16-16 36-4-16-16-4z"
        fill={`${c}15`}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M22 28l20-20" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  calendar: (s = 24, c = '#6b8f71', a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="32" rx="5" fill={`${c}10`} stroke={c} strokeWidth="2" />
      <line x1="6" y1="20" x2="42" y2="20" stroke={c} strokeWidth="2" />
      <line x1="16" y1="6" x2="16" y2="14" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="6" x2="32" y2="14" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="12" y="26" width="6" height="6" rx="1.5" fill={a} opacity="0.5" />
      <rect x="21" y="26" width="6" height="6" rx="1.5" fill={`${c}25`} />
      <rect x="30" y="26" width="6" height="6" rx="1.5" fill={`${c}25`} />
      <rect x="12" y="34" width="6" height="6" rx="1.5" fill={`${c}25`} />
    </svg>
  ),
  pill: (s = 24, c = '#6b8f71', a = '#d4766a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="14"
        y="6"
        width="20"
        height="36"
        rx="10"
        fill={`${c}15`}
        stroke={c}
        strokeWidth="2"
        transform="rotate(30 24 24)"
      />
      <line x1="10" y1="28" x2="38" y2="16" stroke={c} strokeWidth="2" />
      <path d="M10 28c-2-6 0-12 4-16l12 6c-4 4-6 10-4 16" fill={`${a}30`} />
    </svg>
  ),
  folder: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M6 14V38c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V18c0-2.2-1.8-4-4-4H24l-4-6H10c-2.2 0-4 1.8-4 4z"
        fill={`${c}15`}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M6 18h36" stroke={c} strokeWidth="1.5" opacity="0.3" />
    </svg>
  ),
  dumbbell: (s = 24, c = '#6b8f71', a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="8" y="18" width="6" height="12" rx="2" fill={`${a}40`} stroke={c} strokeWidth="2" />
      <rect x="34" y="18" width="6" height="12" rx="2" fill={`${a}40`} stroke={c} strokeWidth="2" />
      <line x1="14" y1="24" x2="34" y2="24" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <rect x="4" y="20" width="4" height="8" rx="1.5" fill={c} opacity="0.4" />
      <rect x="40" y="20" width="4" height="8" rx="1.5" fill={c} opacity="0.4" />
    </svg>
  ),
  settings: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="8" fill={`${c}15`} stroke={c} strokeWidth="2" />
      <circle cx="24" cy="24" r="3" fill={c} opacity="0.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 24 + Math.cos(rad) * 12;
        const y1 = 24 + Math.sin(rad) * 12;
        const x2 = 24 + Math.cos(rad) * 16;
        const y2 = 24 + Math.sin(rad) * 16;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={c}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  ),
  document: (s = 24, c = '#6b8f71', _a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M12 6h16l10 10v26c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V10c0-2.2 1.8-4 4-4z"
        fill={`${c}10`}
        stroke={c}
        strokeWidth="2"
      />
      <path d="M28 6v10h10" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <line
        x1="14"
        y1="24"
        x2="34"
        y2="24"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <line
        x1="14"
        y1="30"
        x2="30"
        y2="30"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <line
        x1="14"
        y1="36"
        x2="32"
        y2="36"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  ),
  shield: (s = 24, c = '#6b8f71', a = '#f4a261') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4l16 8v14c0 10-7 18-16 22-9-4-16-12-16-22V12l16-8z"
        fill={`${c}10`}
        stroke={c}
        strokeWidth="2"
      />
      <path
        d="M18 24l4 4 8-8"
        stroke={a}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sparkle: (s = 24, c = '#f4a261') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4l4 14h14l-11 8 4 14-11-8-11 8 4-14L6 18h14z"
        fill={`${c}30`}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  physician: (s = 24, c = '#6b8f71', a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="14" r="7" fill={`${a}50`} />
      <path d="M12 38c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke={c} strokeWidth="2" fill={`${c}10`} />
      <path
        d="M20 28c-2 6-2 10 0 14"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M28 28c2 6 2 10 0 14"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <rect x="21" y="30" width="6" height="8" rx="1" fill={`${c}25`} />
      <rect x="22.5" y="31.5" width="3" height="5" rx="0.5" fill={c} opacity="0.3" />
    </svg>
  ),
  handshake: (s = 24, c = '#6b8f71', a = '#c4956a') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M6 20l10-4 8 6 8-6 10 4"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 16l8 6 8-6" fill={`${c}15`} />
      <path d="M6 20v12l10 6" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M42 20v12l-10 6" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 38l4-4 4 2 4-2 4 4"
        stroke={a}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  moneyCircle: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill={`${c}10`} stroke={c} strokeWidth="2" />
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fill={c}>
        $
      </text>
    </svg>
  ),
  check: (s = 24, c = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill={`${c}20`} stroke={c} strokeWidth="2" />
      <path
        d="M16 24l6 6 12-12"
        stroke={c}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  celebrate: (s = 24, c = '#f4a261', a = '#6b8f71') => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 6v4M14 10l2 3M34 10l-2 3M8 20h4M36 20h4"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 18l8 24 8-24c-4 6-12 6-16 0z"
        fill={`${c}25`}
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="28" r="2" fill={a} opacity="0.5" />
      <circle cx="28" cy="24" r="2" fill={a} opacity="0.5" />
      <circle cx="24" cy="32" r="1.5" fill={c} opacity="0.4" />
    </svg>
  ),
};

// Icon component wrapper
export function Icon({ name, size = 24, color, accent }: IconProps): React.ReactElement {
  const fn = icons[name];
  if (!fn) {
    return <span style={{ width: size, height: size, display: 'inline-block' }}>?</span>;
  }
  return (
    <span style={{ display: 'inline-flex', width: size, height: size }}>
      {fn(size, color, accent)}
    </span>
  );
}
