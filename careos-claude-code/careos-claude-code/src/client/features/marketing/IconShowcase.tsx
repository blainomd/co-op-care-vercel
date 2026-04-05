import { useState, type ReactElement } from 'react';

// ─── 38-Icon System ─────────────────────────────────────────────────────────
// Organized by category. Each icon is a function (size?) => ReactElement.
// Colors match SolvingHealth design tokens exactly.

type IconFn = (s?: number) => ReactElement;

// eslint-disable-next-line react-refresh/only-export-components
export const SHIcons: Record<string, IconFn> = {
  // CareGoals Modules
  sunrise: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="28" r="10" fill="#f4a26140" />
      <path
        d="M24 18v-6M12 28H6M42 28h-6M14 20l-4-4M34 20l4-4"
        stroke="#f4a261"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M10 36h28" stroke="#6b8f71" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M14 32c0-5.5 4.5-10 10-10s10 4.5 10 10"
        stroke="#f4a261"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  heart: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 42s-16-9.5-16-20c0-5.5 4.5-10 10-10 3.5 0 6 2 6 2s2.5-2 6-2c5.5 0 10 4.5 10 10 0 10.5-16 20-16 20z"
        fill="#d4766a30"
        stroke="#d4766a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  dove: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M16 32c4-8 12-12 20-10-4 6-10 10-16 12l-4-2z"
        fill="#6b8f7125"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 34c-4 2-8 2-10-2 2-2 6-2 10 0"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy="24" r="1.5" fill="#6b8f71" />
    </svg>
  ),
  people: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="18" cy="16" r="5" fill="#c4956a60" />
      <circle cx="32" cy="16" r="5" fill="#6b8f7140" />
      <path
        d="M8 36c0-5.5 4.5-10 10-10s10 4.5 10 10"
        fill="#c4956a25"
        stroke="#c4956a"
        strokeWidth="2"
      />
      <path
        d="M22 36c0-5.5 4.5-10 10-10s10 4.5 10 10"
        fill="#6b8f7120"
        stroke="#6b8f71"
        strokeWidth="2"
      />
    </svg>
  ),
  waves: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M6 20c4-4 8 0 12-4s8 0 12-4 8 0 12-4"
        stroke="#4a6fa5"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M6 28c4-4 8 0 12-4s8 0 12-4 8 0 12-4"
        stroke="#4a6fa5"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M6 36c4-4 8 0 12-4s8 0 12-4 8 0 12-4"
        stroke="#4a6fa5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  medical: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="10"
        y="10"
        width="28"
        height="28"
        rx="6"
        fill="#6b8f7115"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <rect x="20" y="16" width="8" height="16" rx="1.5" fill="#d4766a50" />
      <rect x="16" y="20" width="16" height="8" rx="1.5" fill="#d4766a50" />
    </svg>
  ),
  book: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M8 10h14c2 0 2 2 2 2v28s0-2-2-2H8V10z"
        fill="#c4956a20"
        stroke="#8b7355"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M40 10H26c-2 0-2 2-2 2v28s0-2 2-2h14V10z"
        fill="#c4956a20"
        stroke="#8b7355"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  horizon: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="30" r="10" fill="#f4a26125" />
      <path d="M8 34h32" stroke="#6b8f71" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M12 30c0-6.6 5.4-12 12-12s12 5.4 12 12"
        stroke="#f4a261"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),

  // Navigation
  home: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 8L6 24h6v16h10V30h4v10h10V24h6L24 8z"
        fill="#6b8f7120"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  goalHeart: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 42s-14-8.5-14-18c0-5 4-9 9-9 3 0 5 1.5 5 1.5s2-1.5 5-1.5c5 0 9 4 9 9 0 9.5-14 18-14 18z"
        fill="#c4956a30"
        stroke="#c4956a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 24l3 3 6-6"
        stroke="#c4956a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chart: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="6"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <polyline
        points="12,34 18,26 24,30 32,18 38,22"
        stroke="#6b8f71"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="38" cy="22" r="2.5" fill="#f4a261" />
    </svg>
  ),
  team: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="14" r="6" fill="#6b8f7130" />
      <circle cx="12" cy="20" r="4.5" fill="#6b8f7120" />
      <circle cx="36" cy="20" r="4.5" fill="#6b8f7120" />
      <path
        d="M14 38c0-5.5 4.5-10 10-10s10 4.5 10 10"
        stroke="#6b8f71"
        strokeWidth="2"
        fill="#6b8f7110"
      />
      <path d="M4 40c0-4.4 3.6-8 8-8" stroke="#6b8f71" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 40c0-4.4-3.6-8-8-8" stroke="#6b8f71" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  more: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="12" cy="24" r="3.5" fill="#6b8f71" />
      <circle cx="24" cy="24" r="3.5" fill="#6b8f71" />
      <circle cx="36" cy="24" r="3.5" fill="#6b8f71" />
    </svg>
  ),

  // Actions
  clipboard: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="10"
        y="8"
        width="28"
        height="34"
        rx="4"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <rect x="18" y="4" width="12" height="8" rx="4" fill="#f4a261" opacity="0.6" />
      <line
        x1="16"
        y1="22"
        x2="32"
        y2="22"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="16"
        y1="28"
        x2="28"
        y2="28"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="16"
        y1="34"
        x2="30"
        y2="34"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  ),
  camera: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="4"
        y="14"
        width="40"
        height="28"
        rx="5"
        fill="#6b8f7115"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <circle cx="24" cy="28" r="8" fill="#c4956a25" stroke="#6b8f71" strokeWidth="2" />
      <circle cx="24" cy="28" r="4" fill="#6b8f7130" />
      <path d="M18 14l2-6h8l2 6" stroke="#6b8f71" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="36" cy="20" r="2" fill="#c4956a" opacity="0.6" />
    </svg>
  ),
  send: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M6 24l36-16-16 36-4-16-16-4z"
        fill="#6b8f7115"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M22 28l20-20" stroke="#6b8f71" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  calendar: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="6"
        y="10"
        width="36"
        height="32"
        rx="5"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <line x1="6" y1="20" x2="42" y2="20" stroke="#6b8f71" strokeWidth="2" />
      <line
        x1="16"
        y1="6"
        x2="16"
        y2="14"
        stroke="#6b8f71"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="6"
        x2="32"
        y2="14"
        stroke="#6b8f71"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="12" y="26" width="6" height="6" rx="1.5" fill="#c4956a" opacity="0.5" />
      <rect x="21" y="26" width="6" height="6" rx="1.5" fill="#6b8f7125" />
      <rect x="30" y="26" width="6" height="6" rx="1.5" fill="#6b8f7125" />
    </svg>
  ),
  pill: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="16"
        y="8"
        width="16"
        height="32"
        rx="8"
        fill="#6b8f7115"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <line x1="16" y1="24" x2="32" y2="24" stroke="#6b8f71" strokeWidth="2" />
      <rect x="16" y="24" width="16" height="16" rx="8" fill="#d4766a25" />
    </svg>
  ),
  folder: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M6 14V38c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V18c0-2.2-1.8-4-4-4H24l-4-6H10c-2.2 0-4 1.8-4 4z"
        fill="#6b8f7115"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  dumbbell: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="8"
        y="18"
        width="6"
        height="12"
        rx="2"
        fill="#c4956a40"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <rect
        x="34"
        y="18"
        width="6"
        height="12"
        rx="2"
        fill="#c4956a40"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <line
        x1="14"
        y1="24"
        x2="34"
        y2="24"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="4" y="20" width="4" height="8" rx="1.5" fill="#6b8f71" opacity="0.4" />
      <rect x="40" y="20" width="4" height="8" rx="1.5" fill="#6b8f71" opacity="0.4" />
    </svg>
  ),

  // Status & UI
  settings: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="8" fill="#6b8f7115" stroke="#6b8f71" strokeWidth="2" />
      <circle cx="24" cy="24" r="3" fill="#6b8f71" opacity="0.4" />
      <line x1="24" y1="8" x2="24" y2="14" stroke="#6b8f71" strokeWidth="3" strokeLinecap="round" />
      <line
        x1="24"
        y1="34"
        x2="24"
        y2="40"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="12.7"
        y1="12.7"
        x2="16.9"
        y2="16.9"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="31.1"
        y1="31.1"
        x2="35.3"
        y2="35.3"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line x1="8" y1="24" x2="14" y2="24" stroke="#6b8f71" strokeWidth="3" strokeLinecap="round" />
      <line
        x1="34"
        y1="24"
        x2="40"
        y2="24"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="12.7"
        y1="35.3"
        x2="16.9"
        y2="31.1"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="31.1"
        y1="16.9"
        x2="35.3"
        y2="12.7"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
  document: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M12 6h16l10 10v26c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V10c0-2.2 1.8-4 4-4z"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <path d="M28 6v10h10" stroke="#6b8f71" strokeWidth="2" strokeLinecap="round" />
      <line
        x1="14"
        y1="24"
        x2="34"
        y2="24"
        stroke="#6b8f71"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <line
        x1="14"
        y1="30"
        x2="30"
        y2="30"
        stroke="#6b8f71"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <line
        x1="14"
        y1="36"
        x2="32"
        y2="36"
        stroke="#6b8f71"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  ),
  shield: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4l16 8v14c0 10-7 18-16 22-9-4-16-12-16-22V12l16-8z"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <path
        d="M18 24l4 4 8-8"
        stroke="#f4a261"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sparkle: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4l4 14h14l-11 8 4 14-11-8-11 8 4-14L6 18h14z"
        fill="#f4a26130"
        stroke="#f4a261"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill="#6b8f7120" stroke="#6b8f71" strokeWidth="2" />
      <path
        d="M16 24l6 6 12-12"
        stroke="#6b8f71"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  celebrate: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 6v4M14 10l2 3M34 10l-2 3M8 20h4M36 20h4"
        stroke="#f4a261"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 18l8 24 8-24c-4 6-12 6-16 0z"
        fill="#f4a26125"
        stroke="#f4a261"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="28" r="2" fill="#6b8f71" opacity="0.5" />
      <circle cx="28" cy="24" r="2" fill="#6b8f71" opacity="0.5" />
      <circle cx="24" cy="32" r="1.5" fill="#f4a261" opacity="0.4" />
    </svg>
  ),

  // Brand & Partners
  physician: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="14" r="7" fill="#c4956a50" />
      <path
        d="M12 38c0-6.6 5.4-12 12-12s12 5.4 12 12"
        stroke="#6b8f71"
        strokeWidth="2"
        fill="#6b8f7110"
      />
      <rect x="21" y="30" width="6" height="8" rx="1" fill="#6b8f7125" />
      <rect x="22.5" y="31.5" width="3" height="5" rx="0.5" fill="#6b8f71" opacity="0.3" />
    </svg>
  ),
  handshake: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M6 20l10-4 8 6 8-6 10 4"
        stroke="#6b8f71"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 20v12l10 6" stroke="#6b8f71" strokeWidth="2" strokeLinecap="round" />
      <path d="M42 20v12l-10 6" stroke="#6b8f71" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 38l4-4 4 2 4-2 4 4"
        stroke="#c4956a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  moneyCircle: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill="#6b8f7110" stroke="#6b8f71" strokeWidth="2" />
      <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fill="#6b8f71">
        $
      </text>
    </svg>
  ),
  cooperative: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="16" fill="#6b8f7110" stroke="#6b8f71" strokeWidth="2" />
      <circle cx="24" cy="18" r="4" fill="#c4956a40" />
      <circle cx="16" cy="28" r="3.5" fill="#6b8f7130" />
      <circle cx="32" cy="28" r="3.5" fill="#6b8f7130" />
      <path
        d="M16 28l8-10 8 10"
        stroke="#6b8f71"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  ),
  lmn: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M12 6h16l10 10v26c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V10c0-2.2 1.8-4 4-4z"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <path d="M28 6v10h10" stroke="#6b8f71" strokeWidth="2" />
      <rect x="20" y="22" width="8" height="2" rx="1" fill="#6b8f71" opacity="0.6" />
      <rect x="16" y="26" width="16" height="2" rx="1" fill="#6b8f71" opacity="0.4" />
      <path d="M14 34h8" stroke="#c4956a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="36" r="6" fill="#f4a26140" stroke="#f4a261" strokeWidth="1.5" />
      <path
        d="M31 36l2 2 4-4"
        stroke="#f4a261"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ai: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="10"
        y="10"
        width="28"
        height="28"
        rx="8"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <circle cx="20" cy="22" r="2.5" fill="#c4956a60" />
      <circle cx="28" cy="22" r="2.5" fill="#c4956a60" />
      <path d="M18 30c2 2 6 4 12 0" stroke="#6b8f71" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M18 10V6M30 10V6M18 38v4M30 38v4M10 18H6M10 30H6M38 18h4M38 30h4"
        stroke="#6b8f71"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  ),
  fhir: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 6l16 10v16L24 42 8 32V16L24 6z"
        fill="#6b8f7108"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 6v36M8 16l16 8 16-8M8 32l16-8 16 8"
        stroke="#6b8f71"
        strokeWidth="1"
        opacity="0.2"
      />
      <circle cx="24" cy="24" r="4" fill="#f4a26140" stroke="#f4a261" strokeWidth="1.5" />
    </svg>
  ),
  prom: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="6"
        y="8"
        width="36"
        height="32"
        rx="5"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <circle cx="16" cy="20" r="3" fill="#6b8f7130" />
      <circle cx="24" cy="20" r="3" fill="#c4956a40" />
      <circle cx="32" cy="20" r="3" fill="#d4766a30" />
      <rect x="12" y="28" width="24" height="3" rx="1.5" fill="#6b8f7120" />
      <rect x="12" y="28" width="16" height="3" rx="1.5" fill="#6b8f71" opacity="0.4" />
    </svg>
  ),
  payment: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="4"
        y="12"
        width="40"
        height="24"
        rx="4"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <rect x="4" y="18" width="40" height="6" fill="#6b8f7120" />
      <rect x="8" y="28" width="12" height="4" rx="1" fill="#c4956a40" />
      <circle cx="38" cy="30" r="3" fill="#f4a26140" stroke="#f4a261" strokeWidth="1" />
    </svg>
  ),

  // Hormone / RHM Med
  biomarker: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path
        d="M20 6c0 0 0 12-6 18s-6 18-6 18h32s0-12-6-18-6-18-6-18"
        fill="#6b8f7110"
        stroke="#6b8f71"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line
        x1="20"
        y1="6"
        x2="28"
        y2="6"
        stroke="#6b8f71"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="34" r="4" fill="#d4766a30" stroke="#d4766a" strokeWidth="1.5" />
    </svg>
  ),
  hormone: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <polyline
        points="6,34 12,28 18,32 24,18 30,22 36,12 42,16"
        stroke="#2dd4a8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="18" r="3" fill="#2dd4a820" stroke="#2dd4a8" strokeWidth="1.5" />
      <rect x="6" y="38" width="36" height="2" rx="1" fill="#6b8f71" opacity="0.2" />
    </svg>
  ),
  protocol: (s = 36) => (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect
        x="8"
        y="6"
        width="32"
        height="36"
        rx="4"
        fill="#1a242e10"
        stroke="#6b8f71"
        strokeWidth="2"
      />
      <line x1="14" y1="16" x2="34" y2="16" stroke="#6b8f71" strokeWidth="1.5" opacity="0.3" />
      <line x1="14" y1="22" x2="30" y2="22" stroke="#6b8f71" strokeWidth="1.5" opacity="0.3" />
      <line x1="14" y1="28" x2="32" y2="28" stroke="#6b8f71" strokeWidth="1.5" opacity="0.3" />
      <circle cx="14" cy="36" r="2" fill="#2dd4a8" />
      <line
        x1="20"
        y1="36"
        x2="34"
        y2="36"
        stroke="#2dd4a8"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

// ─── Icon name type ──────────────────────────────────────────────────────────
export type SHIconName = keyof typeof SHIcons;

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORIES: { name: string; desc: string; icons: [SHIconName, string][] }[] = [
  {
    name: 'CareGoals Modules',
    desc: 'Advance care planning conversation prompts',
    icons: [
      ['sunrise', 'A Good Day'],
      ['heart', 'What Matters'],
      ['dove', 'My Comfort'],
      ['people', 'My People'],
      ['waves', 'What Worries Me'],
      ['medical', "If I Can't Speak"],
      ['book', 'Legacy'],
      ['horizon', 'My Terms'],
    ],
  },
  {
    name: 'Navigation',
    desc: 'App tab bar and wayfinding',
    icons: [
      ['home', 'Home'],
      ['goalHeart', 'Goals'],
      ['chart', 'Forecast'],
      ['team', 'Team'],
      ['more', 'More'],
    ],
  },
  {
    name: 'Actions',
    desc: 'Interactive elements and quick actions',
    icons: [
      ['clipboard', 'LMN Request'],
      ['camera', 'Video Legacy'],
      ['send', 'Share'],
      ['calendar', 'Calendar'],
      ['pill', 'Medications'],
      ['folder', 'Documents'],
      ['dumbbell', 'Wellness'],
    ],
  },
  {
    name: 'Status & UI',
    desc: 'Feedback and system states',
    icons: [
      ['settings', 'Settings'],
      ['document', 'Document'],
      ['shield', 'Verified'],
      ['sparkle', 'Achievement'],
      ['check', 'Complete'],
      ['celebrate', 'Celebration'],
    ],
  },
  {
    name: 'Brand & Partners',
    desc: 'Ecosystem identity',
    icons: [
      ['physician', 'Physician'],
      ['handshake', 'Partnership'],
      ['moneyCircle', 'Revenue'],
      ['cooperative', 'Co-op'],
      ['lmn', 'LMN Signed'],
      ['ai', 'AI Agent'],
      ['fhir', 'FHIR'],
      ['prom', 'PROMs'],
      ['payment', 'Payment'],
    ],
  },
  {
    name: 'Hormone / RHM Med',
    desc: 'Clinical biomarker tracking',
    icons: [
      ['biomarker', 'Lab Test'],
      ['hormone', 'Trend Line'],
      ['protocol', 'Protocol'],
    ],
  },
];

const PALETTES = [
  {
    name: 'co-op.care',
    colors: ['#6b8f71', '#c4956a', '#faf8f4', '#d4766a', '#f4a261', '#1a2a3a'],
  },
  {
    name: 'SurgeonAccess',
    colors: ['#1a365d', '#2dd4a8', '#141c24', '#f4a261', '#4a9eff', '#8b5cf6'],
  },
  {
    name: 'ClinicalSwipe',
    colors: ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  },
  { name: 'CareGoals', colors: ['#6b8f71', '#c4956a', '#8b7355', '#faf6f0', '#f3ede5', '#4a4a4a'] },
];

// ─── Showcase Component ──────────────────────────────────────────────────────
export function IconShowcase() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [copied, setCopied] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bg = isDark ? '#0c1117' : '#faf8f4';
  const card = isDark ? '#1a242e' : '#fff';
  const text = isDark ? '#e2e8f0' : '#1a2a3a';
  const muted = isDark ? '#64748b' : '#888';
  const border = isDark ? 'rgba(255,255,255,0.06)' : '#e8e0d6';
  const chipBg = isDark ? '#141c24' : '#f5f0ea';

  const copyIcon = (name: string) => {
    const code = `{SHIcons.${name}(28)}`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(name);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div
      style={{
        background: bg,
        color: text,
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '100vh',
        padding: '40px 24px',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '48px',
          }}
        >
          <div>
            <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px' }}>
              Solving Health
            </div>
            <div style={{ fontSize: '14px', color: muted, marginTop: '4px' }}>
              Design System — {Object.keys(SHIcons).length} Custom SVG Icons
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: theme === t ? '#6b8f71' : 'transparent',
                  border: `1px solid ${border}`,
                  color: theme === t ? 'white' : muted,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Usage note */}
        <div
          style={{
            padding: '16px 20px',
            background: chipBg,
            borderRadius: '12px',
            marginBottom: '40px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            color: muted,
          }}
        >
          <span style={{ color: '#6b8f71' }}>import</span> {'{ SHIcons }'}{' '}
          <span style={{ color: '#6b8f71' }}>from</span>{' '}
          <span style={{ color: '#c4956a' }}>'@/features/marketing/IconShowcase'</span> &nbsp;&nbsp;
          <span style={{ opacity: 0.5 }}>// click any icon to copy usage</span>
        </div>

        {/* Categories */}
        {CATEGORIES.map((cat) => (
          <div key={cat.name} style={{ marginBottom: '48px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#6b8f71',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                {cat.name}
              </div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>{cat.desc}</div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '12px',
              }}
            >
              {cat.icons.map(([name, label]) => (
                <div
                  key={name}
                  onClick={() => copyIcon(name)}
                  title={`Click to copy: {SHIcons.${name}(28)}`}
                  style={{
                    background: copied === name ? '#6b8f7115' : card,
                    border: `1px solid ${copied === name ? '#6b8f71' : border}`,
                    borderRadius: '14px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    userSelect: 'none',
                  }}
                >
                  {SHIcons[name]?.(32)}
                  <div
                    style={{
                      fontSize: '11px',
                      color: muted,
                      textAlign: 'center',
                      lineHeight: '1.3',
                    }}
                  >
                    {copied === name ? '✓ copied' : label}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: isDark ? '#334155' : '#ccc',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Palettes */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#6b8f71',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            Brand Palettes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {PALETTES.map((p) => (
              <div
                key={p.name}
                style={{
                  background: card,
                  border: `1px solid ${border}`,
                  borderRadius: '14px',
                  padding: '20px',
                }}
              >
                <div
                  style={{ fontSize: '13px', fontWeight: '600', color: text, marginBottom: '12px' }}
                >
                  {p.name}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {p.colors.map((c) => (
                    <div
                      key={c}
                      title={c}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: c,
                        border: `1px solid ${border}`,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(c);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size demo */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#6b8f71',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            Size Reference
          </div>
          <div
            style={{
              background: card,
              border: `1px solid ${border}`,
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {[16, 20, 24, 28, 32, 40, 48, 64].map((s) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {SHIcons['shield']?.(s)}
                <div
                  style={{
                    fontSize: '10px',
                    color: muted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s}px
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: muted, paddingBottom: '40px' }}>
          SolvingHealth Design System · {Object.keys(SHIcons).length} icons · Click any icon to copy
          JSX usage
        </div>
      </div>
    </div>
  );
}
