import { useState, type ReactElement } from 'react';
import { iconThemes, fontLinks } from './design-tokens';

/**
 * Illustrated Icon System — Solving Health
 *
 * Style: ICA Group cooperative illustration style
 * - 2px dark navy outlines on all shapes
 * - Solid saturated fills, NO opacity washes
 * - 4-5 distinct colors per icon
 * - Recognizable objects with fine details
 * - Gold sparkle accents
 */

type IconRenderer = (primary: string, accent: string) => ReactElement;

const O = '#2d3748';
const CREAM = '#f7e8d0';
const SKIN = '#f4c9a0';
const TEAL = '#5bbfb5';
const CORAL = '#e8735a';
const GOLD = '#f0c75e';
const SKY = '#8ec5e8';
const LEAF = '#5a9e6f';
const LEAFDK = '#3d7a52';
const TERRA = '#c4703e';
const GRAY = '#b8c4ce';
const GRAYLT = '#dce3e8';
const WHITE = '#ffffff';

const icons: Record<string, IconRenderer> = {
  caregiver: (_p, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <rect x="33" y="24" width="14" height="24" rx="7" fill={GOLD} stroke={O} strokeWidth="2" />
      <line x1="36" y1="30" x2="44" y2="30" stroke={O} strokeWidth="1.2" />
      <line x1="36" y1="34" x2="44" y2="34" stroke={O} strokeWidth="1.2" />
      <line x1="36" y1="38" x2="44" y2="38" stroke={O} strokeWidth="1.2" />
      <circle cx="40" cy="42" r="2" fill={CORAL} stroke={O} strokeWidth="1" />
      <line x1="40" y1="48" x2="40" y2="58" stroke={O} strokeWidth="2.5" />
      <path d="M30 58h20" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="35" y="56" width="10" height="3" rx="1.5" fill={GRAY} stroke={O} strokeWidth="1.2" />
      <path d="M28 20c-3 3-5 7-5 12" stroke={O} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path
        d="M24 16c-5 5-8 11-8 18"
        stroke={O}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 12c-6 6-10 15-10 24"
        stroke={O}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M52 20c3 3 5 7 5 12" stroke={O} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M56 16c5 5 8 11 8 18" stroke={O} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path
        d="M60 12c6 6 10 15 10 24"
        stroke={O}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),

  family: (_p, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <path
        d="M30 48l4 20h12l4-20H30z"
        fill={TERRA}
        stroke={O}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="28" y="44" width="24" height="6" rx="2" fill={CORAL} stroke={O} strokeWidth="2" />
      <line x1="33" y1="56" x2="47" y2="56" stroke={O} strokeWidth="1" opacity="0.4" />
      <line x1="40" y1="44" x2="40" y2="26" stroke={LEAFDK} strokeWidth="2.5" />
      <path
        d="M40 34c-8-2-14-8-12-14 6 0 12 6 12 14z"
        fill={LEAF}
        stroke={O}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M34 24c3 3 5 7 6 10" stroke={LEAFDK} strokeWidth="1.2" />
      <path
        d="M40 28c8-2 14-8 12-14-6 0-12 6-12 14z"
        fill={TEAL}
        stroke={O}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M46 18c-3 3-5 5-6 10" stroke={O} strokeWidth="1.2" opacity="0.4" />
      <path d="M24 18l2-4 2 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="18" r="1" fill={GOLD} />
      <path d="M56 24l1.5-3 1.5 3" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="57.5" cy="24" r=".8" fill={GOLD} />
      <path d="M20 30l1-2 1 2" stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),

  elderCare: (_p, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="30" r="18" fill={SKY} stroke={O} strokeWidth="2" />
      <path
        d="M30 22c2-4 6-7 10-8"
        stroke={WHITE}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M44 20l-6 12h8l-6 12"
        fill={GOLD}
        stroke={O}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <rect x="33" y="48" width="14" height="4" rx="1" fill={GRAY} stroke={O} strokeWidth="1.8" />
      <rect x="34" y="52" width="12" height="3" rx="1" fill={GRAYLT} stroke={O} strokeWidth="1.5" />
      <rect x="35" y="55" width="10" height="3" rx="1" fill={GRAY} stroke={O} strokeWidth="1.5" />
      <path d="M35.5 59c3 2 6 2 9 0" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="6" x2="40" y2="10" stroke={O} strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="14" x2="53" y2="17" stroke={O} strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="14" x2="27" y2="17" stroke={O} strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="28" x2="58" y2="28" stroke={O} strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="28" x2="22" y2="28" stroke={O} strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="10" x2="48" y2="12" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="10" x2="32" y2="12" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  community: (_p, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <path
        d="M8 44l14-6c3-1 6 0 8 2l4 4"
        stroke={O}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M8 44c-1 2 0 4 2 4h6" stroke={O} strokeWidth="2" strokeLinecap="round" fill={SKIN} />
      <circle cx="10" cy="44" r="4" fill={SKIN} stroke={O} strokeWidth="1.5" />
      <path
        d="M72 44l-14-6c-3-1-6 0-8 2l-4 4"
        stroke={O}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M72 44c1 2 0 4-2 4h-6"
        stroke={O}
        strokeWidth="2"
        strokeLinecap="round"
        fill={CREAM}
      />
      <circle cx="70" cy="44" r="4" fill={CREAM} stroke={O} strokeWidth="1.5" />
      <path d="M34 44c2 3 4 4 6 4s4-1 6-4" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="37" cy="44" rx="4" ry="3" fill={SKIN} stroke={O} strokeWidth="1.5" />
      <ellipse cx="43" cy="44" rx="4" ry="3" fill={CREAM} stroke={O} strokeWidth="1.5" />
      <path d="M10 40l8-4" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
      <path d="M70 40l-8-4" stroke={CORAL} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M40 22l-3 3c-1.7 1.7-1.7 4.3 0 6s4.3 1.7 6 0L40 22z"
        fill={CORAL}
        stroke={O}
        strokeWidth="1.5"
      />
      <path d="M40 22l3 3c1.7 1.7 1.7 4.3 0 6" stroke={O} strokeWidth="1.5" />
      <path d="M28 20l1.5-3 1.5 3" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="29.5" cy="20" r=".8" fill={GOLD} />
      <path d="M50 18l1.5-3 1.5 3" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="51.5" cy="18" r=".8" fill={GOLD} />
      <line
        x1="20"
        y1="58"
        x2="60"
        y2="58"
        stroke={GRAY}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 3"
      />
    </svg>
  ),

  home: (_p, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <rect x="20" y="38" width="40" height="28" rx="1" fill={CREAM} stroke={O} strokeWidth="2" />
      <path
        d="M16 40l24-22 24 22"
        stroke={O}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={CORAL}
      />
      <path d="M40 18l20 18H40V18z" fill={TERRA} opacity="0.3" />
      <rect x="34" y="48" width="12" height="18" rx="1.5" fill={TEAL} stroke={O} strokeWidth="2" />
      <circle cx="43" cy="58" r="1.5" fill={GOLD} stroke={O} strokeWidth="1" />
      <rect x="22" y="42" width="10" height="10" rx="1.5" fill={SKY} stroke={O} strokeWidth="1.8" />
      <line x1="27" y1="42" x2="27" y2="52" stroke={O} strokeWidth="1.2" />
      <line x1="22" y1="47" x2="32" y2="47" stroke={O} strokeWidth="1.2" />
      <rect x="48" y="42" width="10" height="10" rx="1.5" fill={SKY} stroke={O} strokeWidth="1.8" />
      <line x1="53" y1="42" x2="53" y2="52" stroke={O} strokeWidth="1.2" />
      <line x1="48" y1="47" x2="58" y2="47" stroke={O} strokeWidth="1.2" />
      <rect x="50" y="24" width="7" height="14" rx="1" fill={CREAM} stroke={O} strokeWidth="2" />
      <circle cx="53" cy="20" r="2.5" fill={GRAYLT} stroke={O} strokeWidth="1.2" />
      <circle cx="56" cy="16" r="3" fill={GRAYLT} stroke={O} strokeWidth="1.2" />
      <circle cx="54" cy="12" r="2" fill={GRAYLT} stroke={O} strokeWidth="1" />
      <line x1="12" y1="66" x2="68" y2="66" stroke={O} strokeWidth="2" />
      <path d="M14 66c0-4 2-4 2 0" stroke={LEAF} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 66c0-3 2-3 2 0" stroke={LEAF} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M62 66c0-3 2-3 2 0" stroke={LEAF} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M66 66c0-4 2-4 2 0" stroke={LEAFDK} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  physician: (_p, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <path
        d="M24 14c0 12 0 26 12 34"
        stroke={O}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 14c0 12 0 26-12 34"
        stroke={O}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="12" r="3.5" fill={GRAY} stroke={O} strokeWidth="2" />
      <circle cx="56" cy="12" r="3.5" fill={GRAY} stroke={O} strokeWidth="2" />
      <circle cx="40" cy="52" r="10" fill={TEAL} stroke={O} strokeWidth="2.5" />
      <circle cx="40" cy="52" r="5" fill={WHITE} stroke={O} strokeWidth="1.5" />
      <circle cx="40" cy="52" r="2" fill={O} />
      <path d="M40 64c-3 2-3 5 0 7" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 66c-3 2-3 5 0 7" stroke={TEAL} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M44 66c3 2 3 5 0 7" stroke={TEAL} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="38" y="36" width="4" height="10" rx="1" fill={CORAL} />
      <rect x="35" y="39" width="10" height="4" rx="1" fill={CORAL} />
    </svg>
  ),

  clinicalReview: (_p, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <rect x="16" y="18" width="34" height="48" rx="3" fill={WHITE} stroke={O} strokeWidth="2" />
      <rect x="26" y="12" width="14" height="10" rx="3" fill={O} />
      <circle cx="33" cy="17" r="2.5" fill={GOLD} stroke={O} strokeWidth="1" />
      <rect x="22" y="28" width="4" height="4" rx="1" fill={TEAL} stroke={O} strokeWidth="1.2" />
      <path
        d="M23 30l1.5 1.5 3-3"
        stroke={WHITE}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="30" y1="30" x2="44" y2="30" stroke={GRAY} strokeWidth="2" strokeLinecap="round" />
      <rect x="22" y="36" width="4" height="4" rx="1" fill={TEAL} stroke={O} strokeWidth="1.2" />
      <path
        d="M23 38l1.5 1.5 3-3"
        stroke={WHITE}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="30" y1="38" x2="42" y2="38" stroke={GRAY} strokeWidth="2" strokeLinecap="round" />
      <rect x="22" y="44" width="4" height="4" rx="1" fill={GRAYLT} stroke={O} strokeWidth="1.2" />
      <line x1="30" y1="46" x2="40" y2="46" stroke={GRAY} strokeWidth="2" strokeLinecap="round" />
      <rect x="22" y="52" width="4" height="4" rx="1" fill={GRAYLT} stroke={O} strokeWidth="1.2" />
      <line x1="30" y1="54" x2="44" y2="54" stroke={GRAY} strokeWidth="2" strokeLinecap="round" />
      <circle cx="58" cy="50" r="14" fill={TEAL} stroke={O} strokeWidth="2.5" />
      <path
        d="M52 50l4 4 8-8"
        stroke={WHITE}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M64 32l2-4 2 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="66" cy="32" r=".8" fill={GOLD} />
    </svg>
  ),

  lmn: (_p, accent) => (
    <svg viewBox="0 0 80 80" fill="none">
      <path
        d="M16 10h30l12 12v42c0 2-2 4-4 4H20c-2 0-4-2-4-4V10z"
        fill={WHITE}
        stroke={O}
        strokeWidth="2"
      />
      <path d="M46 10v12h12" fill={GRAYLT} stroke={O} strokeWidth="2" strokeLinejoin="round" />
      <text x="24" y="32" fontSize="16" fontWeight="bold" fill={O} fontFamily="serif">
        Rx
      </text>
      <line x1="22" y1="38" x2="50" y2="38" stroke={GRAY} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="43" x2="46" y2="43" stroke={GRAY} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="48" x2="48" y2="48" stroke={GRAY} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="53" x2="40" y2="53" stroke={GRAY} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 58c4-2 8 2 12 0s8 1 10-1" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="52" r="13" fill={accent} stroke={O} strokeWidth="2.5" />
      <text
        x="60"
        y="49"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill={WHITE}
        fontFamily="sans-serif"
      >
        HSA
      </text>
      <text x="60" y="58" textAnchor="middle" fontSize="7" fill={WHITE} fontFamily="sans-serif">
        FSA
      </text>
      <path d="M68 34l1.5-3 1.5 3" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="69.5" cy="34" r=".8" fill={GOLD} />
    </svg>
  ),

  prom: (primary, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <rect x="10" y="10" width="52" height="44" rx="3" fill={WHITE} stroke={O} strokeWidth="2" />
      <line x1="18" y1="16" x2="18" y2="48" stroke={O} strokeWidth="1.5" />
      <line x1="18" y1="48" x2="56" y2="48" stroke={O} strokeWidth="1.5" />
      <line x1="18" y1="38" x2="56" y2="38" stroke={GRAYLT} strokeWidth="1" strokeDasharray="3 2" />
      <line x1="18" y1="28" x2="56" y2="28" stroke={GRAYLT} strokeWidth="1" strokeDasharray="3 2" />
      <path d="M22 44L30 38 36 42 42 32 48 26 54 20V48H22z" fill={TEAL} opacity="0.15" />
      <polyline
        points="22,44 30,38 36,42 42,32 48,26 54,20"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="22" cy="44" r="3" fill={WHITE} stroke={primary} strokeWidth="2" />
      <circle cx="30" cy="38" r="3" fill={WHITE} stroke={primary} strokeWidth="2" />
      <circle cx="36" cy="42" r="3" fill={WHITE} stroke={primary} strokeWidth="2" />
      <circle cx="42" cy="32" r="3" fill={WHITE} stroke={primary} strokeWidth="2" />
      <circle cx="48" cy="26" r="3" fill={WHITE} stroke={primary} strokeWidth="2" />
      <circle cx="54" cy="20" r="3.5" fill={primary} stroke={O} strokeWidth="2" />
      <circle cx="66" cy="26" r="11" fill={GOLD} stroke={O} strokeWidth="2" />
      <path
        d="M62 26l3 3 5-6"
        stroke={O}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="36"
        y="62"
        textAnchor="middle"
        fontSize="8"
        fill={O}
        fontWeight="700"
        fontFamily="sans-serif"
      >
        OUTCOMES
      </text>
    </svg>
  ),

  ai: (primary, accent) => (
    <svg viewBox="0 0 80 80" fill="none">
      <path
        d="M40 10c-12 0-20 9-20 20 0 8 4 14 8 18v10h24V48c4-4 8-10 8-18 0-11-8-20-20-20z"
        fill={SKY}
        stroke={O}
        strokeWidth="2"
      />
      <path d="M24 24c-2 4 0 10 4 12" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 32c-1 4 1 8 6 8" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M56 24c2 4 0 10-4 12" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58 32c1 4-1 8-6 8" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 14c-2 6 0 14 0 20" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="34" cy="26" r="3" fill={accent} stroke={O} strokeWidth="1.5" />
      <circle cx="46" cy="24" r="3" fill={GOLD} stroke={O} strokeWidth="1.5" />
      <circle cx="40" cy="36" r="3.5" fill={CORAL} stroke={O} strokeWidth="1.5" />
      <circle cx="33" cy="40" r="2" fill={primary} stroke={O} strokeWidth="1" />
      <circle cx="47" cy="38" r="2" fill={accent} stroke={O} strokeWidth="1" />
      <line x1="34" y1="26" x2="40" y2="36" stroke={O} strokeWidth="1.2" />
      <line x1="46" y1="24" x2="40" y2="36" stroke={O} strokeWidth="1.2" />
      <line x1="33" y1="40" x2="40" y2="36" stroke={O} strokeWidth="1" />
      <line x1="47" y1="38" x2="40" y2="36" stroke={O} strokeWidth="1" />
      <rect x="28" y="48" width="24" height="4" rx="1" fill={GRAY} stroke={O} strokeWidth="1.5" />
      <rect x="30" y="52" width="20" height="3" rx="1" fill={GRAYLT} stroke={O} strokeWidth="1.2" />
      <polyline
        points="28,62 32,62 35,56 38,68 41,56 44,62 48,62 52,62"
        stroke={primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M60 12l2-4 2 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="62" cy="12" r=".8" fill={GOLD} />
      <path d="M66 22l1.5-3 1.5 3" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),

  fhir: (_p, accent) => (
    <svg viewBox="0 0 80 80" fill="none">
      <rect x="8" y="10" width="28" height="14" rx="3" fill={SKY} stroke={O} strokeWidth="2" />
      <circle cx="16" cy="17" r="3" fill={TEAL} stroke={O} strokeWidth="1.2" />
      <line x1="22" y1="15" x2="32" y2="15" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="19" x2="30" y2="19" stroke={O} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="8" y="28" width="28" height="14" rx="3" fill={SKY} stroke={O} strokeWidth="2" />
      <circle cx="16" cy="35" r="3" fill={GOLD} stroke={O} strokeWidth="1.2" />
      <line x1="22" y1="33" x2="32" y2="33" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="37" x2="30" y2="37" stroke={O} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="8" y="46" width="28" height="14" rx="3" fill={SKY} stroke={O} strokeWidth="2" />
      <circle cx="16" cy="53" r="3" fill={CORAL} stroke={O} strokeWidth="1.2" />
      <line x1="22" y1="51" x2="32" y2="51" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="55" x2="30" y2="55" stroke={O} strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M36 17h4l3 3-3 3"
        stroke={O}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 35h4l3 3-3 3"
        stroke={O}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 53h4l3 3-3 3"
        stroke={O}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="35" r="16" fill={WHITE} stroke={O} strokeWidth="2" />
      <path
        d="M60 22c-3 7 2 10 0 16-1 3 2 6 5 6s6-3 5-6c-2-6 3-9 0-16"
        fill={accent}
        stroke={O}
        strokeWidth="1.8"
      />
      <path
        d="M60 28c-1.5 3.5 1 5 0 8-.5 1.5 1 3 2.5 3s3-1.5 2.5-3c-1-3 1.5-4.5 0-8"
        fill={CORAL}
      />
      <text
        x="60"
        y="54"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill={O}
        fontFamily="sans-serif"
      >
        R4
      </text>
    </svg>
  ),

  shield: (primary, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <path
        d="M40 6l24 12v20c0 16-12 24-24 30C28 62 16 54 16 38V18L40 6z"
        fill={TEAL}
        stroke={O}
        strokeWidth="2.5"
      />
      <path
        d="M40 14l16 8v14c0 10-8 16-16 20-8-4-16-10-16-20V22l16-8z"
        fill={WHITE}
        stroke={O}
        strokeWidth="1.5"
      />
      <rect x="33" y="36" width="14" height="14" rx="3" fill={primary} stroke={O} strokeWidth="2" />
      <path
        d="M36 36v-6c0-2.2 1.8-4 4-4s4 1.8 4 4v6"
        stroke={O}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="40" cy="42" r="2.5" fill={WHITE} />
      <rect x="39" y="43" width="2" height="4" rx="1" fill={WHITE} />
      <path d="M60 10l2-4 2 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="62" cy="10" r=".8" fill={GOLD} />
      <path d="M66 20l1.5-3 1.5 3" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),

  cooperative: (primary, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="16" r="6" fill={SKIN} stroke={O} strokeWidth="2" />
      <path
        d="M34 30c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke={O}
        strokeWidth="2"
        strokeLinecap="round"
        fill={TEAL}
      />
      <circle cx="22" cy="48" r="6" fill={CREAM} stroke={O} strokeWidth="2" />
      <path
        d="M16 62c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke={O}
        strokeWidth="2"
        strokeLinecap="round"
        fill={CORAL}
      />
      <circle cx="58" cy="48" r="6" fill={SKIN} stroke={O} strokeWidth="2" />
      <path
        d="M52 62c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke={O}
        strokeWidth="2"
        strokeLinecap="round"
        fill={primary}
      />
      <line x1="34" y1="22" x2="26" y2="42" stroke={O} strokeWidth="2" strokeDasharray="4 3" />
      <line x1="46" y1="22" x2="54" y2="42" stroke={O} strokeWidth="2" strokeDasharray="4 3" />
      <line x1="28" y1="54" x2="52" y2="54" stroke={O} strokeWidth="2" strokeDasharray="4 3" />
      <line x1="36" y1="38" x2="44" y2="38" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="42" x2="44" y2="42" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M48 14c6 4 10 12 10 20"
        stroke={O}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 2"
      />
      <path
        d="M12 42c2-8 8-16 16-20"
        stroke={O}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 2"
      />
    </svg>
  ),

  payment: (_p, _a) => (
    <svg viewBox="0 0 80 80" fill="none">
      <rect x="10" y="22" width="44" height="30" rx="4" fill={TEAL} stroke={O} strokeWidth="2" />
      <rect x="10" y="28" width="44" height="8" fill={O} />
      <rect x="16" y="40" width="10" height="8" rx="2" fill={GOLD} stroke={O} strokeWidth="1.5" />
      <line x1="21" y1="40" x2="21" y2="48" stroke={O} strokeWidth=".8" />
      <line x1="16" y1="44" x2="26" y2="44" stroke={O} strokeWidth=".8" />
      <circle cx="34" cy="46" r="1.5" fill={WHITE} />
      <circle cx="39" cy="46" r="1.5" fill={WHITE} />
      <circle cx="44" cy="46" r="1.5" fill={WHITE} />
      <circle cx="49" cy="46" r="1.5" fill={WHITE} />
      <circle cx="60" cy="36" r="16" fill={GOLD} stroke={O} strokeWidth="2.5" />
      <circle cx="60" cy="36" r="12" stroke={O} strokeWidth="1.2" />
      <text
        x="60"
        y="42"
        textAnchor="middle"
        fontSize="18"
        fontWeight="800"
        fill={O}
        fontFamily="sans-serif"
      >
        $
      </text>
      <path
        d="M18 62l8-6 8 4 10-10"
        stroke={LEAF}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 50l-5 0 0 5"
        stroke={LEAF}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M70 18l2-4 2 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="72" cy="18" r=".8" fill={GOLD} />
    </svg>
  ),
};

const CATEGORIES: Record<string, string[]> = {
  'Care & Community': ['caregiver', 'family', 'elderCare', 'community', 'home'],
  'Medical & Clinical': ['physician', 'clinicalReview', 'lmn', 'prom'],
  Technology: ['ai', 'fhir', 'shield'],
  'Cooperative & Financial': ['cooperative', 'payment'],
};

type ThemeName = keyof typeof iconThemes;

export function IconSystem() {
  const [theme, setTheme] = useState<ThemeName>('co-op.care');
  const [size, setSize] = useState<number>(80);
  const colors = iconThemes[theme];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #faf8f5 0%, #f5f0eb 50%, #faf8f5 100%)',
        fontFamily: "'DM Sans', sans-serif",
        padding: '32px 24px',
        color: '#2a2a2a',
      }}
    >
      <link href={fontLinks.dmSans} rel="stylesheet" />
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '4px',
            color: '#1a1a1a',
            letterSpacing: '-1px',
          }}
        >
          Icon System
        </h1>
        <p style={{ fontSize: '15px', color: '#888', marginBottom: '32px' }}>
          Illustrated icons for co-op.care, SurgeonAccess &amp; Solving Health
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {(Object.entries(iconThemes) as [ThemeName, (typeof iconThemes)[ThemeName]][]).map(
            ([name, t]) => (
              <button
                key={name}
                onClick={() => setTheme(name)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: theme === name ? `2px solid ${t.primary}` : '1px solid #ddd',
                  background: theme === name ? `${t.primary}15` : 'white',
                  color: theme === name ? t.primary : '#666',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
                    display: 'inline-block',
                  }}
                />
                {name}
              </button>
            ),
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '12px',
              color: '#888',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Size
          </span>
          {[48, 64, 80, 120].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                border: size === s ? `1px solid ${colors.primary}` : '1px solid #ddd',
                background: size === s ? `${colors.primary}15` : 'white',
                color: size === s ? colors.primary : '#888',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {s}px
            </button>
          ))}
        </div>

        {Object.entries(CATEGORIES).map(([category, iconNames]) => (
          <div key={category} style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid #eee',
              }}
            >
              {category}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {iconNames.map((name) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #eee',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    width: Math.max(size + 40, 120),
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: size, height: size }}>
                    {icons[name]?.(colors.primary, colors.accent)}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#888',
                      textAlign: 'center',
                    }}
                  >
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: '48px',
            padding: '32px',
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #eee',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
            Usage Examples
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              {
                icon: 'caregiver',
                title: 'Worker Voice',
                desc: 'W-2 caregivers at the center of care decisions',
              },
              {
                icon: 'family',
                title: 'Worker Wealth',
                desc: 'Equity ownership grows with every hour worked',
              },
              {
                icon: 'elderCare',
                title: 'Worker Power',
                desc: 'Cooperative governance transforms home care',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ width: 64, height: 64 }}>
                  {icons[item.icon]?.(colors.primary, colors.accent)}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
