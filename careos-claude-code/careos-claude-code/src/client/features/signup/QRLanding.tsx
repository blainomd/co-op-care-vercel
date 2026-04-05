/**
 * QRLanding — QR scan entry point
 *
 * Scanning a QR code is the key that starts a care relationship.
 * - Existing member → Start a visit session
 * - New visitor → Name + email, then join the community
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSignupStore } from '../../stores/signupStore';
import { useAuthStore } from '../../stores/authStore';
import { Logo } from '../../components/Logo';
import { TileIcon } from '../../components/TileIcon';

export function QRLanding() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const createCard = useSignupStore((s) => s.createCard);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const handleJoin = (destination: 'visit' | 'card') => {
    const name = nameInput.trim() || 'Friend';
    const email = emailInput.trim();

    // Save email
    if (email) {
      try {
        localStorage.setItem('coop_email', email);
      } catch {
        /* ok */
      }
      fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'qr_referral', name, referredBy: memberId }),
      }).catch(() => {});
    }

    createCard({ firstName: name, email, intent: 'seeking_care', referredBy: memberId });
    navigate(destination === 'visit' ? `/visit/${memberId}` : '/card');
  };

  // Already have an account/card → go to visit
  if (isAuthenticated || cardHolder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6">
        <div className="w-full max-w-sm text-center">
          <Logo variant="horizontal" size="sm" />
          <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
              <TileIcon name="home" size={28} />
            </div>
            <h1 className="font-heading text-xl font-bold text-navy">Ready to visit</h1>
            <p className="mt-2 text-sm text-text-secondary">
              You scanned <strong className="text-navy">{memberId}</strong>'s card. Start a care
              visit to log time and help your neighbor.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/visit/${memberId}`)}
              className="mt-5 w-full rounded-xl bg-sage py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-sage-dark active:scale-[0.98]"
            >
              Start visit
            </button>
            <button
              type="button"
              onClick={() => navigate('/card')}
              className="mt-2 w-full rounded-xl border border-navy/10 bg-white py-2.5 text-sm font-medium text-navy transition-all active:scale-[0.98]"
            >
              Just connect for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // New visitor — collect name + email, then join
  const canSubmit = nameInput.trim().length > 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6">
      <div className="w-full max-w-sm text-center">
        <Logo variant="horizontal" size="sm" />
        <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
            <TileIcon name="check" size={28} />
          </div>
          <h1 className="font-heading text-xl font-bold text-navy">You've been invited</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Someone in your community shared their co-op.care card with you. Get your own free card
            and <strong className="text-navy">you both get a free Time Bank hour</strong>.
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
              if (e.key === 'Enter' && canSubmit) handleJoin('card');
            }}
            placeholder="your@email.com"
            className="mt-2 w-full rounded-xl border border-border bg-warm-white px-4 py-3 text-center text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20"
          />
          <p className="mt-1 text-[10px] text-text-muted">
            We'll notify you when co-op.care launches in your region.
          </p>

          <button
            type="button"
            onClick={() => handleJoin('visit')}
            disabled={!canSubmit}
            className="mt-4 w-full rounded-xl bg-sage py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-sage-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Join &amp; start visit
          </button>
          <button
            type="button"
            onClick={() => handleJoin('card')}
            disabled={!canSubmit}
            className="mt-2 w-full rounded-xl border border-navy/10 bg-white py-2.5 text-sm font-medium text-navy transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Get my card first
          </button>

          <p className="mt-4 text-xs text-text-muted">Free forever · No payment required</p>
        </div>
      </div>
    </div>
  );
}

export default QRLanding;
