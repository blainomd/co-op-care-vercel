/**
 * CareCard — Your evolving identity in the care community
 *
 * The card visually improves as the user engages with Sage:
 *   Level 0: Signup CTA (no card yet)
 *   Level 1: Basic card — muted, minimal (just created)
 *   Level 2: Name + intent → accent colors unlock
 *   Level 3: CII completed → progress ring appears around QR
 *   Level 4: CRI completed → QR becomes colorful
 *   Level 5: Referrals + deep engagement → full visual treatment
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useSignupStore } from '../../stores/signupStore';
import { useFirebaseAuthStore } from '../../stores/firebaseAuthStore';
import { useSageStore } from '../../stores/sageStore';
import { loadProfile } from './engine/SageEngine';
import { TileIcon } from '../../components/TileIcon';
import { Icon } from '../../components/Icon';
import type { CardIdentity } from '@shared/types/card.types';

// ─── Profile Completeness ───────────────────────────────────────────────

interface ProfileLevel {
  level: number; // 0-5
  percent: number; // 0-100
  label: string;
  nextAction: string;
  // Visual properties
  accentGradient: string;
  qrColor: string;
  qrAccent: string;
  cardBorder: string;
  glowClass: string;
  ringColor: string;
}

function getProfileLevel(profile: ReturnType<typeof loadProfile>, hasCard: boolean): ProfileLevel {
  if (!hasCard) {
    return {
      level: 0,
      percent: 0,
      label: 'Get started',
      nextAction: 'Get your free card',
      accentGradient: 'from-sage/20 via-sage/40 to-sage/20',
      qrColor: '#9CA3AF',
      qrAccent: '#D1D5DB',
      cardBorder: 'border-border',
      glowClass: '',
      ringColor: '#E5E5E0',
    };
  }

  let score = 20; // Base: has card
  const p = profile;
  if (p.conversationCount >= 1) score += 5;
  if (p.conversationCount >= 3) score += 5;
  if (p.lastMiniCII) score += 15;
  if (p.lastCRI) score += 15;
  if (p.referralCount > 0) score += 5;
  if (p.referralCount >= 5) score += 5;
  // Living profile richness — card blooms as Sage learns about your situation
  if (p.careRecipient?.name) score += 5;
  if (p.careRecipient?.conditions && p.careRecipient.conditions.length > 0) score += 5;
  if (p.careRecipient?.relationship) score += 5;
  if (p.caregiverContext?.employment) score += 5;
  if (p.network && p.network.length > 0) score += 5;
  if ((p.seeds?.total ?? 0) >= 50) score += 5;
  if ((p.seeds?.total ?? 0) >= 150) score += 5;

  if (score <= 20) {
    return {
      level: 1,
      percent: score,
      label: 'New member',
      nextAction: 'Chat with Sage to unlock your card',
      accentGradient: 'from-sage/30 via-sage/50 to-sage/30',
      qrColor: '#6B7280',
      qrAccent: '#9CA3AF',
      cardBorder: 'border-border',
      glowClass: '',
      ringColor: '#D1D5DB',
    };
  }
  if (score <= 40) {
    return {
      level: 2,
      percent: score,
      label: 'Getting started',
      nextAction: 'Do a wellness check-in',
      accentGradient: 'from-gold/60 via-sage/40 to-navy/30',
      qrColor: '#1B3A5C',
      qrAccent: '#4A7C59',
      cardBorder: 'border-border',
      glowClass: '',
      ringColor: '#4A7C59',
    };
  }
  if (score <= 60) {
    return {
      level: 3,
      percent: score,
      label: 'Connected',
      nextAction: 'Assess your loved one',
      accentGradient: 'from-gold via-sage to-navy',
      qrColor: '#1B3A5C',
      qrAccent: '#4A7C59',
      cardBorder: 'border-sage/30',
      glowClass: 'card-glow',
      ringColor: '#4A7C59',
    };
  }
  if (score <= 80) {
    return {
      level: 4,
      percent: score,
      label: 'Engaged',
      nextAction: 'Share your card',
      accentGradient: 'from-gold via-copper to-sage',
      qrColor: '#4A7C59',
      qrAccent: '#B87333',
      cardBorder: 'border-sage/40',
      glowClass: 'card-glow',
      ringColor: '#B87333',
    };
  }
  return {
    level: 5,
    percent: Math.min(score, 100),
    label: 'Founding member',
    nextAction: "You're fully connected!",
    accentGradient: 'from-gold via-copper to-navy',
    qrColor: '#1B3A5C',
    qrAccent: '#B87333',
    cardBorder: 'border-gold/40',
    glowClass: 'card-glow',
    ringColor: '#D4A853',
  };
}

// ─── QR Code with Progressive Color ─────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function QRPattern({
  data,
  size = 140,
  color,
  accent,
  ringPercent,
  ringColor,
}: {
  data: string;
  size?: number;
  color: string;
  accent: string;
  ringPercent: number;
  ringColor: string;
}) {
  const grid = 21;
  const cellSize = size / grid;
  const hash = simpleHash(data || 'default');
  const ringRadius = size / 2 + 10;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDash = (ringPercent / 100) * ringCircumference;

  const cells = useMemo(() => {
    const result: Array<{ x: number; y: number; isFinder: boolean }> = [];
    const addFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const isOuter = y === 0 || y === 6 || x === 0 || x === 6;
          const isInner = y >= 2 && y <= 4 && x >= 2 && x <= 4;
          if (isOuter || isInner) result.push({ x: ox + x, y: oy + y, isFinder: true });
        }
      }
    };
    addFinder(0, 0);
    addFinder(14, 0);
    addFinder(0, 14);

    let seed = hash;
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
        if (inFinder) continue;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        if (seed % 3 === 0) result.push({ x, y, isFinder: false });
      }
    }
    return result;
  }, [hash]);

  const totalSize = size + 24;
  const offset = 12;

  return (
    <svg width={totalSize} height={totalSize} viewBox={`0 0 ${totalSize} ${totalSize}`}>
      {/* Progress ring */}
      {ringPercent > 0 && (
        <>
          <circle
            cx={totalSize / 2}
            cy={totalSize / 2}
            r={ringRadius}
            fill="none"
            stroke="#F0ECE4"
            strokeWidth="3"
          />
          <circle
            cx={totalSize / 2}
            cy={totalSize / 2}
            r={ringRadius}
            fill="none"
            stroke={ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${ringDash} ${ringCircumference}`}
            transform={`rotate(-90 ${totalSize / 2} ${totalSize / 2})`}
            className="transition-all duration-1000"
          />
        </>
      )}
      {/* QR background */}
      <rect x={offset} y={offset} width={size} height={size} fill="white" rx="8" />
      {/* QR cells */}
      {cells.map((c, i) => (
        <rect
          key={i}
          x={offset + c.x * cellSize}
          y={offset + c.y * cellSize}
          width={cellSize - 0.5}
          height={cellSize - 0.5}
          rx={1.2}
          fill={c.isFinder ? accent : color}
        />
      ))}
    </svg>
  );
}

// ─── Living Bloom Visualization ────────────────────────────────────────

/**
 * Inspired by Stitch "Dorothy is blooming today" — a radial gradient orb
 * that breathes and pulses based on profile vitality. The bloom grows
 * more vibrant as the user engages deeper with co-op.care.
 */
function LivingBloom({ percent, level }: { percent: number; level: number }) {
  // Bloom intensity grows with engagement level
  const bloomSpeed = level >= 3 ? '5s' : '7s'; // Faster pulse at higher levels
  const bloomColor =
    level >= 5
      ? '#C49B40' // Gold for founding members
      : level >= 3
        ? '#2BA5A0' // Sage for connected+
        : '#2BA5A080'; // Muted sage for early

  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
      {/* Ambient glow — the "bloom orb" */}
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle at center, ${bloomColor} 0%, transparent 70%)`,
          animation: `bloom-breathe ${bloomSpeed} ease-in-out infinite`,
        }}
      />
      {/* Inner ring */}
      <svg className="relative h-28 w-28 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#F0ECE4" strokeWidth="5" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={level >= 5 ? '#C49B40' : '#2BA5A0'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(percent / 100) * 327} 327`}
          className="transition-all duration-1000"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-bold text-navy">{percent}</span>
        <span className="text-[8px] font-semibold uppercase tracking-[0.15em] text-sage-dark">
          {level >= 5 ? 'Founding' : level >= 3 ? 'Blooming' : 'Growing'}
        </span>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────

interface CareCardProps {
  onTileClick?: (message: string) => void;
  comfortCardMode?: boolean;
}

export function CareCard({ onTileClick, comfortCardMode }: CareCardProps) {
  const user = useAuthStore((s) => s.user);
  const activeRole = useAuthStore((s) => s.activeRole);
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const createCard = useSignupStore((s) => s.createCard);

  // Subscribe to Sage store profile — updates LIVE as conversation progresses
  const storeProfile = useSageStore((s) => s.profile);
  // Fall back to localStorage on first render before store initializes
  const profile = storeProfile.conversationCount > 0 ? storeProfile : loadProfile();

  // Firebase auth — pre-fill name/email from Google profile
  const firebaseUser = useFirebaseAuthStore((s) => s.firebaseUser);
  const isConfigured = useFirebaseAuthStore((s) => s.isConfigured);
  const googleSignIn = useFirebaseAuthStore((s) => s.googleSignIn);

  const hasCard = !!(cardHolder || user);
  const pl = getProfileLevel(profile, hasCard);

  // ── Pulse animation when profile updates live ──
  const prevProfileRef = useRef(profile);
  const [profilePulse, setProfilePulse] = useState(false);
  useEffect(() => {
    const prev = prevProfileRef.current;
    const changed =
      prev.careRecipient?.name !== profile.careRecipient?.name ||
      prev.careRecipient?.relationship !== profile.careRecipient?.relationship ||
      prev.careRecipient?.age !== profile.careRecipient?.age ||
      (prev.careRecipient?.conditions?.length ?? 0) !==
        (profile.careRecipient?.conditions?.length ?? 0) ||
      (prev.network?.length ?? 0) !== (profile.network?.length ?? 0) ||
      (prev.seeds?.total ?? 0) !== (profile.seeds?.total ?? 0) ||
      prev.caregiverContext?.employment !== profile.caregiverContext?.employment;
    if (changed && profile.conversationCount > 0) {
      setProfilePulse(true);
      const t = setTimeout(() => setProfilePulse(false), 1200);
      prevProfileRef.current = profile;
      return () => clearTimeout(t);
    }
    prevProfileRef.current = profile;
  }, [profile]);

  // ── No card yet → name + email input + signup CTA ──
  // Pre-fill from Firebase Google profile or localStorage
  const [nameInput, setNameInput] = useState(() => {
    return firebaseUser?.displayName?.split(' ')[0] || '';
  });
  const [emailInput, setEmailInput] = useState(() => {
    if (firebaseUser?.email) return firebaseUser.email;
    try {
      return localStorage.getItem('coop_email') || '';
    } catch {
      return '';
    }
  });

  // When user signs in with Google, update the fields
  useEffect(() => {
    if (firebaseUser?.displayName && !nameInput) {
      setNameInput(firebaseUser.displayName.split(' ')[0] || '');
    }
    if (firebaseUser?.email && !emailInput) {
      setEmailInput(firebaseUser.email);
    }
  }, [firebaseUser]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasCard) {
    const handleCreateCard = () => {
      const name = nameInput.trim() || 'Friend';
      const email = emailInput.trim();

      // Save email for waitlist / follow-up
      if (email) {
        try {
          localStorage.setItem('coop_email', email);
        } catch {
          /* ok */
        }
        // Fire-and-forget waitlist POST
        fetch('/api/v1/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'card_creation', name }),
        }).catch(() => {});
      }

      createCard({ firstName: name, email, intent: 'seeking_care' });
      onTileClick?.(`Hi, I'm ${name}! I just got my Comfort Card — what should I do first?`);
    };

    const canSubmit = nameInput.trim().length > 0;

    return (
      <div className="card-slide-up paper-texture w-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-sage/30 via-sage/60 to-sage/30" />
        <div className="px-6 py-6 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-text-muted">
            co-op.care · Boulder, CO
          </p>
          <h2 className="mt-3 font-heading text-xl font-bold text-navy">Your Comfort Card</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            One card for your care circle. Share it with neighbors, track Time Bank hours, and
            connect with people who help.
          </p>

          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your first name"
            className="mt-4 w-full rounded-xl border border-border bg-warm-white px-4 py-3 text-center text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
            autoFocus
          />

          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSubmit) handleCreateCard();
            }}
            placeholder="your@email.com"
            className="mt-2 w-full rounded-xl border border-border bg-warm-white px-4 py-3 text-center text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          />
          <p className="mt-1 text-[10px] text-text-muted">
            We'll notify you when co-op.care launches in your region.
          </p>

          <button
            type="button"
            onClick={handleCreateCard}
            disabled={!canSubmit}
            className="mt-3 w-full rounded-xl bg-sage py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-sage-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Get my free card
          </button>

          {/* Google sign-in shortcut */}
          {isConfigured && !firebaseUser && (
            <>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] text-text-muted">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <button
                type="button"
                onClick={async () => {
                  const success = await googleSignIn();
                  if (success) {
                    // After sign-in, firebaseUser will update via store —
                    // component re-renders with pre-filled name/email
                  }
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-medium text-navy shadow-sm transition-all hover:bg-warm-gray active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <p className="mt-2.5 text-[10px] text-text-muted">Free forever · No payment required</p>
        </div>
      </div>
    );
  }

  // ── Has card → evolving card ──
  const identity: CardIdentity =
    comfortCardMode && cardHolder
      ? {
          memberId: cardHolder.memberId,
          displayName: cardHolder.firstName,
          memberSince: new Date().toISOString().slice(0, 7),
          tier: 'seedling',
          tierIcon: '',
          balanceFormatted: '0.0 hrs',
          balanceHours: 0,
          qrData: cardHolder.qrUrl,
          activeRole: 'conductor',
        }
      : {
          memberId: user?.id || '',
          displayName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '',
          memberSince: user?.createdAt?.slice(0, 7) || new Date().toISOString().slice(0, 7),
          tier: 'seedling',
          tierIcon: '',
          balanceFormatted: '0.0 hrs',
          balanceHours: 0,
          qrData: user?.id || '',
          activeRole: activeRole || 'conductor',
        };

  const displayName =
    comfortCardMode && cardHolder
      ? cardHolder.firstName
      : user?.firstName
        ? `${user.firstName} ${user.lastName || ''}`
        : identity.displayName;

  const handleShare = () => {
    const shareUrl = cardHolder?.qrUrl || `${window.location.origin}${window.location.pathname}`;

    // Build community commitment summary for sharing
    const commitmentLines: string[] = [];
    if (profile.careRecipient?.name || profile.careRecipient?.relationship) {
      commitmentLines.push(
        `Caring for ${profile.careRecipient.name || `my ${profile.careRecipient.relationship}`}`,
      );
    }
    if ((profile.seeds?.total ?? 0) > 0) {
      commitmentLines.push(`${profile.seeds?.total} care seeds earned`);
    }
    if ((profile.network?.length ?? 0) > 0) {
      commitmentLines.push(`${profile.network?.length} people in my care circle`);
    }
    if (profile.referralCount > 0) {
      commitmentLines.push(`${profile.referralCount} neighbors invited`);
    }
    const tierName =
      pl.level >= 5 ? 'Founding Member' : pl.level >= 3 ? 'Rooted Member' : 'Seedling Member';
    commitmentLines.push(`${tierName} — ${pl.percent}% profile`);

    const shareText = `I'm a ${tierName} at co-op.care — a neighbor-powered care cooperative in Boulder.\n${commitmentLines.join('\n')}\nJoin me — scan my card or visit:`;

    if (navigator.share) {
      navigator
        .share({ title: `${displayName} — co-op.care ${tierName}`, text: shareText, url: shareUrl })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        // Brief visual feedback could be added here
      });
    }
  };

  const memberYear = identity.memberSince?.slice(0, 4) || '2026';

  // Tier display evolves with level
  const tierDisplay =
    pl.level >= 5
      ? { name: 'FOUNDING', icon: <TileIcon name="seedling" size={28} className="text-gold" /> }
      : pl.level >= 3
        ? {
            name: 'ROOTED',
            icon: <TileIcon name="seedling" size={28} className="text-sage-dark" />,
          }
        : {
            name: 'SEEDLING',
            icon: <TileIcon name="seedling" size={28} className="text-bark-light" />,
          };

  return (
    <div>
      <div
        className={`card-slide-up ${pl.glowClass} paper-texture w-full overflow-hidden rounded-2xl border ${pl.cardBorder} bg-white shadow-sm transition-all duration-700 ${profilePulse ? 'ring-2 ring-sage/40 ring-offset-1' : ''}`}
      >
        {/* Evolving accent bar */}
        <div
          className={`h-1.5 bg-gradient-to-r ${pl.accentGradient} transition-all duration-700`}
        />

        {/* Card body */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={() =>
                onTileClick?.('Tell me about my membership and how to improve my profile')
              }
              className="text-left transition-opacity active:opacity-70"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-bark-light">
                co-op.care · Boulder, CO
              </p>
              <h1 className="mt-1.5 font-heading text-2xl font-bold text-navy">
                {displayName || 'New Member'}
              </h1>
              <p className="mt-0.5 font-mono text-xs tracking-wide text-text-muted">
                {identity.memberId}
              </p>
            </button>
            <button
              type="button"
              onClick={() => onTileClick?.('What is my care tier and how do I level up?')}
              className="mt-1 flex flex-col items-center gap-0.5 transition-opacity active:opacity-70"
            >
              {tierDisplay.icon}
              <span className="text-[9px] font-semibold uppercase tracking-wider text-bark-light">
                {tierDisplay.name}
              </span>
            </button>
          </div>
        </div>

        {/* Living Bloom / QR toggle */}
        <div className="mx-auto my-2 flex justify-center">
          <button
            type="button"
            onClick={() => onTileClick?.('What is my QR code for and how do I use it?')}
            className="group relative transition-opacity active:opacity-70"
          >
            {/* Show Living Bloom at level 2+, QR at level 0-1 or on hover */}
            {pl.level >= 2 ? (
              <div className="relative">
                <LivingBloom percent={pl.percent} level={pl.level} />
                {/* Tiny QR hint */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-2 py-0.5 text-[8px] text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  tap for QR
                </div>
              </div>
            ) : (
              <QRPattern
                data={identity.qrData}
                size={130}
                color={pl.qrColor}
                accent={pl.qrAccent}
                ringPercent={pl.percent}
                ringColor={pl.ringColor}
              />
            )}
          </button>
        </div>

        {/* Bloom headline — personalized like "Dorothy is blooming today" */}
        {pl.level >= 2 && profile.careRecipient?.name && (
          <div className="px-6 pt-1 text-center">
            <p className="font-heading text-sm text-navy">
              {profile.careRecipient.name} is{' '}
              <em className="font-heading italic text-sage-dark">
                {pl.level >= 5 ? 'thriving' : pl.level >= 3 ? 'blooming' : 'growing'}
              </em>{' '}
              today.
            </p>
          </div>
        )}

        {/* Profile progress indicator */}
        <div className="px-6 pt-0 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-text-muted">{pl.label}</span>
            <span className="text-[10px] font-semibold text-sage-dark">{pl.percent}%</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sage to-gold transition-all duration-1000"
              style={{ width: `${pl.percent}%` }}
            />
          </div>
          {pl.level < 5 && (
            <button
              type="button"
              onClick={() => onTileClick?.(pl.nextAction)}
              className="mt-1 text-[9px] text-sage-dark hover:underline"
            >
              Next: {pl.nextAction}
            </button>
          )}
        </div>

        {/* Rewards milestones — what you've unlocked */}
        {pl.level >= 2 && (
          <div className="px-6 pt-1 pb-0">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {[
                { icon: 'seedling', label: 'Joined', unlocked: pl.level >= 1 },
                {
                  icon: 'chat',
                  label: 'First chat',
                  unlocked: (profile.conversationCount ?? 0) >= 1,
                },
                { icon: 'heart', label: 'Wellness check', unlocked: !!profile.lastMiniCII },
                { icon: 'handshake', label: 'First invite', unlocked: profile.referralCount > 0 },
                { icon: 'star', label: 'Founding circle', unlocked: profile.referralCount >= 5 },
              ].map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() =>
                    onTileClick?.(
                      m.unlocked
                        ? `Tell me about my "${m.label}" reward`
                        : `How do I earn the "${m.label}" reward?`,
                    )
                  }
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all active:scale-95 ${
                    m.unlocked ? 'bg-gold/10' : 'opacity-40'
                  }`}
                >
                  <TileIcon name={m.icon} size={16} />
                  <span className="whitespace-nowrap text-[8px] font-medium text-text-muted">
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Living Profile — ALWAYS visible, fills in from conversation */}
        <div className="px-6 pt-1 pb-1">
          <div
            className={`rounded-xl border border-gold/15 bg-gold/5 px-4 py-3 transition-all duration-500 ${profilePulse ? 'bg-gold/15 border-gold/30' : ''}`}
          >
            {/* ── Row 1: Who you're caring for ── */}
            {profile.careRecipient?.name || profile.careRecipient?.relationship ? (
              <button
                type="button"
                onClick={() => onTileClick?.('Tell me more about my care situation')}
                className="flex w-full items-center gap-2 text-left transition-all active:opacity-70"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-sm">
                  {profile.careRecipient.name?.[0]?.toUpperCase() || (
                    <Icon name="heart" size={14} className="text-gold" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-text-primary">
                    Caring for{' '}
                    {profile.careRecipient.name || `your ${profile.careRecipient.relationship}`}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {profile.careRecipient.relationship && profile.careRecipient.name && (
                      <span className="text-[10px] text-text-muted">
                        {profile.careRecipient.relationship}
                      </span>
                    )}
                    {profile.careRecipient.age && (
                      <span className="text-[10px] text-text-muted">
                        · age {profile.careRecipient.age}
                      </span>
                    )}
                    {profile.careRecipient.location && (
                      <span className="text-[10px] text-text-muted">
                        · {profile.careRecipient.location}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onTileClick?.("I'm caring for someone and could use some support")}
                className="flex w-full items-center gap-2 text-left transition-all active:opacity-70 group"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-gold/30 text-sm text-text-muted group-hover:border-gold/60 transition-colors">
                  ?
                </span>
                <span className="text-xs text-text-muted italic group-hover:text-text-secondary transition-colors">
                  Who are you caring for? Tell Sage...
                </span>
              </button>
            )}

            {/* ── Row 2: Conditions (if we know the care recipient) ── */}
            {(profile.careRecipient?.name || profile.careRecipient?.relationship) && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                {profile.careRecipient?.conditions &&
                profile.careRecipient.conditions.length > 0 ? (
                  profile.careRecipient.conditions.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-white/80 border border-gold/20 px-2 py-0.5 text-[10px] text-text-secondary"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onTileClick?.(
                        `What health conditions does ${profile.careRecipient?.name || 'my loved one'} have?`,
                      )
                    }
                    className="text-[10px] text-text-muted italic hover:text-sage-dark transition-colors"
                  >
                    + health conditions
                  </button>
                )}
                {!profile.careRecipient?.age && (
                  <button
                    type="button"
                    onClick={() =>
                      onTileClick?.(`How old is ${profile.careRecipient?.name || 'my loved one'}?`)
                    }
                    className="text-[10px] text-text-muted italic hover:text-sage-dark transition-colors"
                  >
                    + age
                  </button>
                )}
              </div>
            )}

            {/* ── Row 3: Your situation ── */}
            <div className="mt-2 pt-2 border-t border-gold/10">
              {profile.caregiverContext?.employment ? (
                <div className="flex items-center gap-2">
                  <TileIcon name="star" size={14} className="text-sage" />
                  <span className="text-[11px] text-text-secondary">
                    {profile.caregiverContext.employment === 'retired'
                      ? 'Retired'
                      : profile.caregiverContext.employment === 'full_time'
                        ? 'Working full-time'
                        : profile.caregiverContext.employment === 'part_time'
                          ? 'Working part-time'
                          : profile.caregiverContext.employment}
                    {profile.caregiverContext.livesWithRecipient !== undefined &&
                      (profile.caregiverContext.livesWithRecipient
                        ? ' · lives together'
                        : ' · lives separately')}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onTileClick?.(
                      'I want to tell you about my situation — am I working, retired, or something else?',
                    )
                  }
                  className="flex items-center gap-2 text-[11px] text-text-muted italic hover:text-sage-dark transition-colors"
                >
                  <TileIcon name="star" size={14} className="text-text-muted/40" />
                  Your situation — tell Sage about your life
                </button>
              )}
            </div>

            {/* ── Row 4: Care Circle ── */}
            <div className="mt-2 pt-2 border-t border-gold/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-text-muted">Your care circle</span>
                <button
                  type="button"
                  onClick={() =>
                    onTileClick?.('Who else helps me? I want to add someone to my care circle.')
                  }
                  className="text-[9px] text-sage-dark hover:underline"
                >
                  + add
                </button>
              </div>
              {(profile.network?.length ?? 0) > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {profile.network!.map((member, i) => {
                    const initial = (
                      member.name?.[0] ||
                      member.relationship?.[0] ||
                      '?'
                    ).toUpperCase();
                    const colors = [
                      'bg-sage/20 text-sage-dark',
                      'bg-gold/20 text-gold',
                      'bg-navy/15 text-navy',
                      'bg-copper/20 text-copper',
                      'bg-sage/30 text-sage-dark',
                      'bg-gold/30 text-gold',
                    ];
                    const color = colors[i % colors.length];
                    const label = member.name || member.relationship || 'Someone';
                    return (
                      <button
                        key={member.name || i}
                        type="button"
                        onClick={() =>
                          onTileClick?.(
                            `Tell me more about ${label} in my care circle. What role do they play?`,
                          )
                        }
                        className={`group flex items-center gap-1 rounded-full pl-0.5 pr-2 py-0.5 transition-all active:scale-95 hover:shadow-sm ${color}`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${color}`}
                        >
                          {initial}
                        </span>
                        <span className="text-[10px] font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onTileClick?.(
                      'Does anyone else help with caregiving? A sibling, neighbor, friend?',
                    )
                  }
                  className="flex items-center gap-1.5"
                >
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-sage/20 text-[9px] text-text-muted/40"
                    >
                      ?
                    </span>
                  ))}
                  <span className="text-[10px] text-text-muted italic ml-1">Who helps?</span>
                </button>
              )}
              {(profile.network?.length ?? 0) > 0 && profile.network!.length < 4 && (
                <p className="mt-1.5 text-[9px] text-text-muted italic">
                  Most caregivers who feel supported have 6-8 people in their circle.
                </p>
              )}
            </div>

            {/* ── Seeds row ── */}
            <div className="mt-2 pt-2 border-t border-gold/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onTileClick?.('What are Care Seeds and how do I earn more?')}
                className="flex items-center gap-1 transition-opacity active:opacity-70"
              >
                <TileIcon name="seedling" size={14} className="text-sage" />
                <span className="font-mono text-xs font-semibold text-sage-dark">
                  {profile.seeds?.total ?? 0}
                </span>
                <span className="text-[9px] text-text-muted">seeds</span>
              </button>
              {(profile.seeds?.total ?? 0) === 0 && (
                <span className="text-[9px] text-text-muted italic">
                  Chat with Sage to earn seeds
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Time Bank balance */}
        <div className="px-6 pt-2 pb-3">
          <button
            type="button"
            onClick={() =>
              onTileClick?.('What\u2019s my Time Bank balance and how do I earn hours?')
            }
            className="flex w-full items-center justify-between rounded-xl bg-sage/8 px-4 py-2.5 transition-all active:scale-[0.98] active:bg-sage/15"
          >
            <span className="text-xs text-text-muted">Time Bank</span>
            <span className="font-heading text-lg font-bold text-sage-dark">
              {identity.balanceFormatted}
            </span>
          </button>

          {/* Share + Member since */}
          <div className="mt-2.5 flex items-center justify-between">
            <p className="text-[10px] text-text-muted">Member since {memberYear}</p>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-navy/10 bg-white px-3 py-1 text-xs font-medium text-navy shadow-sm transition-all hover:bg-navy/5 active:scale-95"
            >
              <TileIcon name="upload" size={14} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
