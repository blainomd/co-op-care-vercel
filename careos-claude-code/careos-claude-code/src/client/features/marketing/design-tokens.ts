/**
 * Design Tokens — Shared across all Solving Health brands
 *
 * co-op.care · SurgeonAccess · ClinicalSwipe · CareGoals
 *
 * These tokens are used by inline-styled marketing pages.
 * DO NOT convert these pages to Tailwind — they are standalone brand sites.
 */

// ─── Brand Palettes ──────────────────────────────────────────

export const coopCare = {
  teal: '#2dd4a8',
  tealDark: '#1a9e7a',
  navy: '#0f2035',
  accent: '#f4a261',
  coral: '#e76f51',
  bg: '#faf8f5',
  card: '#ffffff',
  border: '#eee',
  text: '#2a2a2a',
  muted: '#888',
  light: '#f5f0eb',
} as const;

export const surgeonAccess = {
  navy: '#0a1628',
  dark: '#0e1f33',
  mid: '#132a3e',
  teal: '#2dd4a8',
  tealDark: '#1a9e7a',
  gold: '#f4a261',
  coral: '#e76f51',
  text: '#e8edf2',
  muted: '#7a9aaa',
  dim: '#3a5a6a',
  card: 'rgba(255,255,255,0.025)',
  border: 'rgba(255,255,255,0.06)',
  glow: 'rgba(45, 212, 168, 0.08)',
} as const;

export const clinicalSwipe = {
  bg: '#08101e',
  surface: '#0c1829',
  card: 'rgba(255,255,255,0.025)',
  border: 'rgba(255,255,255,0.06)',
  green: '#00e5a0',
  blue: '#4a9eff',
  purple: '#8b5cf6',
  orange: '#f4a261',
  text: '#e2e8f0',
  muted: '#64748b',
  dim: '#334155',
} as const;

export const careGoals = {
  cream: '#faf6f0',
  warmWhite: '#f5efe6',
  sage: '#7c956b',
  sageDark: '#5a7049',
  copper: '#c4956a',
  earth: '#8b7355',
  charcoal: '#3a3a3a',
  text: '#4a4a4a',
  muted: '#8a8a7a',
  light: '#eee8dd',
  border: '#e0d8cc',
  card: '#ffffff',
} as const;

// ─── Icon System Themes ──────────────────────────────────────

export const iconThemes = {
  'co-op.care': { primary: '#2dd4a8', accent: '#f4a261' },
  SurgeonAccess: { primary: '#2dd4a8', accent: '#4a9eff' },
  'Warm Earth': { primary: '#e76f51', accent: '#e9c46a' },
  'Clinical Blue': { primary: '#4a9eff', accent: '#f4a261' },
  Berry: { primary: '#8b5cf6', accent: '#ec4899' },
} as const;

// ─── Typography ──────────────────────────────────────────────

export const fonts = {
  heading: "'DM Sans', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
  serif: "'Lora', 'Georgia', serif",
} as const;

export const fontLinks = {
  dmSans:
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap',
  jetBrainsMono:
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap',
  lora: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700&display=swap',
} as const;

// ─── Shared Company Info ─────────────────────────────────────

export const company = {
  name: 'Solving Health Inc.',
  ein: '41-5139576',
  address: '2490 University Heights Ave, Boulder, CO 80302',
  phone: '484-684-5287',
  medicalDirector: {
    name: 'Josh Emdur DO',
    npi: '1649218389',
    license: '50-state licensed',
    affiliation: 'Boulder Community Health',
  },
} as const;
