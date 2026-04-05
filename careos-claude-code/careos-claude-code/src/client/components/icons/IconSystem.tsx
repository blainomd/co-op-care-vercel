import { useState, type ReactNode } from 'react';

const icons = {
  // CARE & COMMUNITY
  caregiver: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person with heart */}
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      <circle cx="40" cy="26" r="9" fill={accent} opacity="0.9" />
      <path
        d="M24 52c0-8.8 7.2-16 16-16s16 7.2 16 16"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill={`${color}20`}
      />
      <path
        d="M40 44l-3.5 3.5c-1.9 1.9-1.9 5 0 6.9s5 1.9 6.9 0L47 50.8l3.5 3.5c1.9 1.9 5 1.9 6.9 0s1.9-5 0-6.9L40 44z"
        fill="#e76f51"
        opacity="0.8"
      />
    </svg>
  ),
  family: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Adult */}
      <circle cx="30" cy="24" r="7" fill={accent} opacity="0.9" />
      <path
        d="M18 46c0-6.6 5.4-12 12-12s12 5.4 12 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill={`${color}15`}
      />
      {/* Child */}
      <circle cx="52" cy="30" r="5.5" fill="#e9c46a" opacity="0.9" />
      <path
        d="M43 48c0-5 4-9 9-9s9 4 9 9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill={`${color}15`}
      />
      {/* Connection line */}
      <path
        d="M36 40c4 2 8 2 12 0"
        stroke={`${color}60`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
    </svg>
  ),
  elderCare: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Elder with cane */}
      <circle cx="36" cy="22" r="7.5" fill={`${accent}CC`} />
      <path d="M28 48c0-7 5.5-12 12-12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 36v22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Cane */}
      <path d="M50 28v30c0 2-3 2-3 0" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 28c3-2 6 0 6 3" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" />
      {/* Support hand */}
      <path
        d="M40 42h8"
        stroke={`${color}80`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
    </svg>
  ),
  community: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Three people in circle */}
      <circle cx="40" cy="20" r="6" fill={accent} opacity="0.85" />
      <circle cx="24" cy="42" r="6" fill="#e9c46a" opacity="0.85" />
      <circle cx="56" cy="42" r="6" fill="#e76f51" opacity="0.7" />
      {/* Connection arcs */}
      <path
        d="M34 26c-6 4-10 10-10 16"
        stroke={`${color}50`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M46 26c6 4 10 10 10 16"
        stroke={`${color}50`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M30 48c4 4 16 4 20 0"
        stroke={`${color}50`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Center heart */}
      <circle cx="40" cy="38" r="4" fill={`${color}30`} />
      <text x="40" y="41" textAnchor="middle" fontSize="8" fill={color}>
        ♥
      </text>
    </svg>
  ),

  // MEDICAL & CLINICAL
  physician: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      <circle cx="40" cy="24" r="8" fill={accent} opacity="0.9" />
      {/* Stethoscope */}
      <path d="M32 32c-2 8-2 16 4 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 32c2 8 2 16-4 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="54" r="3" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
      {/* Cross */}
      <rect x="37" y="38" width="6" height="12" rx="1" fill={`${color}40`} />
      <rect x="34" y="41" width="12" height="6" rx="1" fill={`${color}40`} />
    </svg>
  ),
  clinicalReview: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Clipboard */}
      <rect
        x="22"
        y="18"
        width="28"
        height="36"
        rx="4"
        fill="white"
        stroke={color}
        strokeWidth="2"
      />
      <rect x="32" y="14" width="8" height="8" rx="4" fill={accent} opacity="0.8" />
      {/* Lines */}
      <line
        x1="28"
        y1="30"
        x2="44"
        y2="30"
        stroke={`${color}40`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="36"
        x2="40"
        y2="36"
        stroke={`${color}40`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="28"
        y1="42"
        x2="42"
        y2="42"
        stroke={`${color}40`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Checkmark badge */}
      <circle cx="54" cy="50" r="12" fill={color} opacity="0.9" />
      <path
        d="M48 50l4 4 8-8"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  lmn: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Document */}
      <rect
        x="20"
        y="14"
        width="32"
        height="42"
        rx="3"
        fill="white"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M20 14h24l8 8v34c0 1.7-1.3 3-3 3H23c-1.7 0-3-1.3-3-3V14z"
        fill="white"
        stroke={color}
        strokeWidth="2"
      />
      <path d="M44 14v8h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Rx symbol */}
      <text x="30" y="36" fontSize="14" fontWeight="bold" fill={accent} opacity="0.8">
        Rx
      </text>
      {/* Lines */}
      <line
        x1="26"
        y1="42"
        x2="46"
        y2="42"
        stroke={`${color}30`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="26"
        y1="47"
        x2="42"
        y2="47"
        stroke={`${color}30`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* HSA badge */}
      <circle cx="56" cy="52" r="10" fill={accent} opacity="0.9" />
      <text x="56" y="55" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">
        HSA
      </text>
    </svg>
  ),
  prom: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Chart going up */}
      <rect
        x="18"
        y="20"
        width="44"
        height="36"
        rx="4"
        fill="white"
        stroke={color}
        strokeWidth="1.5"
      />
      <polyline
        points="24,48 32,40 38,44 46,32 54,28"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="54" cy="28" r="3" fill={accent} />
      {/* Grid lines */}
      <line x1="24" y1="48" x2="56" y2="48" stroke={`${color}20`} strokeWidth="1" />
      <line x1="24" y1="40" x2="56" y2="40" stroke={`${color}15`} strokeWidth="1" />
      <line x1="24" y1="32" x2="56" y2="32" stroke={`${color}15`} strokeWidth="1" />
      {/* Label */}
      <text x="40" y="62" textAnchor="middle" fontSize="7" fill={`${color}80`} fontWeight="600">
        PROM
      </text>
    </svg>
  ),

  // TECHNOLOGY
  ai: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Brain outline */}
      <path
        d="M40 18c-8 0-16 6-16 16 0 6 3 10 6 13v9h20v-9c3-3 6-7 6-13 0-10-8-16-16-16z"
        fill={`${color}15`}
        stroke={color}
        strokeWidth="2"
      />
      {/* Neural connections */}
      <circle cx="34" cy="32" r="2.5" fill={accent} opacity="0.8" />
      <circle cx="46" cy="30" r="2.5" fill={accent} opacity="0.8" />
      <circle cx="40" cy="40" r="2.5" fill={accent} opacity="0.8" />
      <circle cx="34" cy="46" r="2" fill={accent} opacity="0.6" />
      <circle cx="46" cy="44" r="2" fill={accent} opacity="0.6" />
      <line x1="34" y1="32" x2="40" y2="40" stroke={`${color}60`} strokeWidth="1" />
      <line x1="46" y1="30" x2="40" y2="40" stroke={`${color}60`} strokeWidth="1" />
      <line x1="34" y1="46" x2="40" y2="40" stroke={`${color}60`} strokeWidth="1" />
      <line x1="46" y1="44" x2="40" y2="40" stroke={`${color}60`} strokeWidth="1" />
      {/* Pulse line at bottom */}
      <polyline
        points="30,60 35,60 37,55 40,65 43,55 45,60 50,60"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  fhir: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* API brackets */}
      <text x="20" y="46" fontSize="24" fontWeight="300" fill={color} opacity="0.6">
        {'{'}
      </text>
      <text x="52" y="46" fontSize="24" fontWeight="300" fill={color} opacity="0.6">
        {'}'}
      </text>
      {/* Fire icon for FHIR */}
      <path
        d="M40 22c-2 6 2 8 0 14-1 3 2 6 5 6s6-3 5-6c-2-6 2-8 0-14"
        fill={accent}
        opacity="0.5"
        stroke={accent}
        strokeWidth="1.5"
      />
      <path
        d="M40 28c-1 3 1 4 0 7-.5 1.5 1 3 2.5 3s3-1.5 2.5-3c-1-3 1-4 0-7"
        fill="#e76f51"
        opacity="0.7"
      />
      {/* R4 label */}
      <text x="40" y="58" textAnchor="middle" fontSize="9" fontWeight="bold" fill={color}>
        R4
      </text>
    </svg>
  ),
  shield: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Shield */}
      <path
        d="M40 16l18 8v16c0 12-8 20-18 24-10-4-18-12-18-24V24l18-8z"
        fill={`${color}15`}
        stroke={color}
        strokeWidth="2"
      />
      {/* Lock */}
      <rect
        x="34"
        y="38"
        width="12"
        height="10"
        rx="2"
        fill={color}
        opacity="0.3"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M36 38v-4c0-2.2 1.8-4 4-4s4 1.8 4 4v4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="40" cy="43" r="1.5" fill={accent} />
    </svg>
  ),

  // COOPERATIVE & FINANCIAL
  cooperative: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Hands shaking / holding */}
      <path d="M20 42c4-6 10-8 16-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 42c-4-6-10-8-16-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 36c2 4 6 4 8 0" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      {/* Circular arrows - cooperative cycle */}
      <path
        d="M28 24c6-6 18-6 24 0"
        stroke={`${color}50`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M52 24l-3-3 3-3"
        stroke={`${color}50`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52 56c-6 6-18 6-24 0"
        stroke={`${color}50`}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M28 56l3 3-3 3"
        stroke={`${color}50`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Equity dots */}
      <circle cx="40" cy="50" r="3" fill={accent} opacity="0.7" />
      <circle cx="32" cy="52" r="2" fill="#e9c46a" opacity="0.6" />
      <circle cx="48" cy="52" r="2" fill="#e76f51" opacity="0.6" />
    </svg>
  ),
  payment: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* Dollar in circle */}
      <circle cx="40" cy="38" r="16" fill={`${color}15`} stroke={color} strokeWidth="2" />
      <text x="40" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>
        $
      </text>
      {/* Growth arrows */}
      <path d="M22 54l4-6" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M26 48l-4 0 0 4"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M58 54l-4-6" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M54 48l4 0 0 4"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  home: (color = '#2dd4a8', accent = '#f4a261') => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1.5" />
      {/* House */}
      <path
        d="M40 20L18 38h6v18h32V38h6L40 20z"
        fill={`${color}10`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Door */}
      <rect
        x="35"
        y="42"
        width="10"
        height="14"
        rx="1.5"
        fill={accent}
        opacity="0.5"
        stroke={accent}
        strokeWidth="1"
      />
      {/* Window */}
      <rect
        x="24"
        y="40"
        width="8"
        height="7"
        rx="1"
        fill={`${color}30`}
        stroke={color}
        strokeWidth="1"
      />
      {/* Heart above */}
      <path
        d="M40 30l-2 2c-1.2 1.2-1.2 3 0 4.2s3 1.2 4.2 0l2-2 2 2c1.2 1.2 3 1.2 4.2 0s1.2-3 0-4.2L40 30z"
        fill="#e76f51"
        opacity="0.5"
        transform="scale(0.5) translate(40, 30)"
      />
    </svg>
  ),
};

const CATEGORIES = {
  'Care & Community': ['caregiver', 'family', 'elderCare', 'community', 'home'],
  'Medical & Clinical': ['physician', 'clinicalReview', 'lmn', 'prom'],
  Technology: ['ai', 'fhir', 'shield'],
  'Cooperative & Financial': ['cooperative', 'payment'],
};

const THEMES = {
  'co-op.care': { primary: '#2dd4a8', accent: '#f4a261' },
  SurgeonAccess: { primary: '#2dd4a8', accent: '#4a9eff' },
  'Warm Earth': { primary: '#e76f51', accent: '#e9c46a' },
  'Clinical Blue': { primary: '#4a9eff', accent: '#f4a261' },
  Berry: { primary: '#8b5cf6', accent: '#ec4899' },
};

export default function IconSystem() {
  const [theme, setTheme] = useState('co-op.care');
  const [size, setSize] = useState(80);
  const colors = (THEMES as Record<string, { primary: string; accent: string }>)[theme] ?? {
    primary: '#2dd4a8',
    accent: '#f4a261',
  };

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
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

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
          Warm, human-centered illustrations for co-op.care &amp; SurgeonAccess
        </p>

        {/* Theme selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {Object.entries(THEMES).map(([name, t]) => (
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
          ))}
        </div>

        {/* Size control */}
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

        {/* Icon grid by category */}
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
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: size, height: size }}>
                    {(icons as Record<string, (color: string, accent: string) => ReactNode>)[
                      name
                    ]?.(colors.primary, colors.accent)}
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

        {/* Usage examples */}
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
                title: 'Trained Caregivers',
                desc: 'W-2 workers with ownership equity',
              },
              {
                icon: 'lmn',
                title: 'HSA/FSA Eligible',
                desc: 'Medical Director LMNs unlock tax-advantaged care',
              },
              {
                icon: 'cooperative',
                title: 'Worker-Owned',
                desc: 'Democratic governance, shared prosperity',
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
                  {(icons as Record<string, (color: string, accent: string) => ReactNode>)[
                    item.icon
                  ]?.(colors.primary, colors.accent)}
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
