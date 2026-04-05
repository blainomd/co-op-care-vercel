/**
 * CardAndSage — The entire co-op.care experience on one screen
 *
 * Card on top (QR + tappable tiles), Sage chat below.
 * Tap a tile → it sends a message to Sage.
 *
 * Design: matches homepage nav/footer/spacing/colors exactly.
 */
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useCallback } from 'react';
import { CareCard } from './CareCard';
import { SageChat } from './SageChat';
import { Logo } from '../../components/Logo';
import { useAuthStore } from '../../stores/authStore';
import { useSignupStore } from '../../stores/signupStore';
import { useFirebaseAuthStore } from '../../stores/firebaseAuthStore';
import { NudgeTiles } from './NudgeTiles';
import { useSageStore } from '../../stores/sageStore';
import { TileIcon } from '../../components/TileIcon';

export function CardAndSage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const firebaseUser = useFirebaseAuthStore((s) => s.firebaseUser);
  const isSignedIn = useFirebaseAuthStore((s) => s.isSignedIn);
  const isConfigured = useFirebaseAuthStore((s) => s.isConfigured);
  const googleSignIn = useFirebaseAuthStore((s) => s.googleSignIn);
  const logOut = useFirebaseAuthStore((s) => s.logOut);

  const isComfortCard = !user && !!cardHolder;

  const sendMessage = useSageStore((s) => s.sendMessage);
  const messages = useSageStore((s) => s.messages);

  // Track whether user has started chatting — collapse card after first exchange
  const hasConversation = messages.length > 1;
  // Card collapsed state — auto-collapses after conversation starts, user can toggle
  const [cardExpanded, setCardExpanded] = useState(true);
  const showCompactCard = hasConversation && !cardExpanded;

  const chatRef = useRef<HTMLDivElement>(null);

  const handleTileClick = useCallback(
    (message: string) => {
      sendMessage(message);
      // Auto-scroll to chat after a brief delay (let the message render)
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      // Auto-collapse card once user engages
      if (hasConversation) {
        setCardExpanded(false);
      }
    },
    [sendMessage, hasConversation],
  );

  return (
    <div className="min-h-screen bg-warm-white">
      {/* ─── Nav — matches homepage ───────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="transition-opacity active:opacity-70"
        >
          <Logo variant="horizontal" size="sm" />
        </button>
        <div className="flex items-center gap-3">
          {/* Sign in / user identity */}
          {isConfigured &&
            (isSignedIn && firebaseUser ? (
              <div className="flex items-center gap-2">
                {firebaseUser.photoURL && (
                  <img
                    src={firebaseUser.photoURL}
                    alt=""
                    className="h-7 w-7 rounded-full border border-border"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="hidden text-xs font-medium text-navy sm:inline">
                  {firebaseUser.displayName?.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={logOut}
                  className="rounded-full border border-navy/15 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-navy/5"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={googleSignIn}
                className="flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy/5"
              >
                <svg width="16" height="16" viewBox="0 0 48 48">
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
                Sign in
              </button>
            ))}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy/5"
          >
            Home
          </button>
        </div>
      </nav>

      {/* ─── Card Section (collapses after conversation starts) ── */}
      <section className="px-6 pb-4 pt-2 md:px-12">
        <div className="mx-auto max-w-md">
          {showCompactCard ? (
            /* ── Compact strip: tap to expand card again ── */
            <button
              type="button"
              onClick={() => setCardExpanded(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 shadow-sm transition-all hover:bg-warm-gray active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/10 text-sage-dark">
                  <TileIcon name="card" size={16} />
                </span>
                <div className="text-left">
                  <span className="text-sm font-heading font-semibold text-navy">
                    {cardHolder?.firstName || user?.firstName || 'Your'} Card
                  </span>
                  <span className="ml-2 text-xs text-text-muted">tap to expand</span>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-muted"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          ) : (
            /* ── Full card ── */
            <div>
              <CareCard onTileClick={handleTileClick} comfortCardMode={isComfortCard} />
              {/* Collapse button — only show after conversation starts */}
              {hasConversation && (
                <button
                  type="button"
                  onClick={() => setCardExpanded(false)}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs text-text-muted hover:text-sage-dark transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  Collapse card
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── Nudge Tiles (hide when card is collapsed) ─────── */}
      {(cardHolder || user) && !showCompactCard && (
        <section className="px-6 pb-4 md:px-12">
          <div className="mx-auto max-w-md">
            <NudgeTiles onTileClick={handleTileClick} />
          </div>
        </section>
      )}

      {/* ─── Share (card holders only) ────────────────────── */}
      {isComfortCard && cardHolder && (
        <section className="px-6 pb-4 md:px-12">
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="font-heading text-sm font-bold text-navy">
                Share &amp; earn a free hour
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                You both get a free Time Bank hour — 5 referrals = Founding Circle
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = encodeURIComponent(cardHolder.qrUrl || window.location.href);
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                      '_blank',
                      'width=600,height=400',
                    );
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                  aria-label="Share on Facebook"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = encodeURIComponent(cardHolder.qrUrl || window.location.href);
                    const text = encodeURIComponent(
                      'I joined co-op.care \u2014 a neighbor-powered care cooperative. Get your free card and we both earn a free hour!',
                    );
                    window.open(
                      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                      '_blank',
                      'width=600,height=400',
                    );
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                  aria-label="Share on X"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = cardHolder.qrUrl || window.location.href;
                    navigator.clipboard
                      .writeText(
                        `I joined @coopdotcare \u2014 a neighbor-powered care cooperative in Boulder! Get your free card: ${shareUrl} #CoopCare #CaregivingCommunity #Boulder`,
                      )
                      .then(() => {
                        alert('Caption + link copied! Paste it into your Instagram post or story.');
                      });
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                  aria-label="Copy for Instagram"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = cardHolder.qrUrl || window.location.href;
                    const shareText =
                      'I joined co-op.care \u2014 a neighbor-powered care cooperative in Boulder. Get your free card and we both earn a free hour!';
                    if (navigator.share) {
                      navigator
                        .share({
                          title: `${cardHolder.firstName} \u2014 co-op.care`,
                          text: shareText,
                          url: shareUrl,
                        })
                        .catch(() => {});
                    } else {
                      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
                        alert('Link copied to clipboard!');
                      });
                    }
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-navy shadow-sm transition-all hover:bg-warm-gray active:scale-95"
                  aria-label="Copy link"
                >
                  <TileIcon name="upload" size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Sage Chat ────────────────────────────────────── */}
      <section ref={chatRef} className="px-6 pb-8 md:px-12">
        <div className="mx-auto max-w-md">
          <SageChat
            key={isComfortCard ? 'comfort' : 'member'}
            isNewUser={false}
            comfortCardMode={isComfortCard}
          />
        </div>
      </section>

      {/* ─── Footer — matches homepage ────────────────────── */}
      <footer className="border-t border-border bg-warm-white px-6 py-6 text-center">
        <Logo variant="full" size="sm" />
        <p className="mt-2 text-[10px] text-text-muted">
          Boulder, Colorado · Pre-launch 2026 · Doctor-supervised care
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-[10px]">
          <button
            type="button"
            onClick={() => navigate('/partners')}
            className="text-text-muted hover:text-sage-dark transition-colors"
          >
            Employers &amp; healthcare partners
          </button>
        </div>
        <p className="mt-1 text-[10px] text-text-muted/50">
          © 2026 co-op.care Limited Cooperative Association
        </p>
      </footer>
    </div>
  );
}

export default CardAndSage;
