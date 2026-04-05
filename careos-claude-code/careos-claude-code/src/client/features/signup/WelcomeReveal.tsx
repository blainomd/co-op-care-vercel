/**
 * WelcomeReveal — Post-signup magic moment
 *
 * Sequence:
 * 1. Dark background fades in
 * 2. Personalized card slides up with spring animation
 * 3. "Your Comfort Card is ready" fades in
 * 4. Wallet/PWA/Share buttons appear
 * 5. "Start chatting with Sage" to enter the app
 *
 * If referred, shows who connected them.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupStore } from '../../stores/signupStore';
import { CardRevealAnimation } from './CardRevealAnimation';
import { WalletButtons } from '../wallet/WalletButtons';

export function WelcomeReveal() {
  const navigate = useNavigate();
  const cardHolder = useSignupStore((s) => s.cardHolder);

  // If no card holder, redirect to signup
  useEffect(() => {
    if (!cardHolder) {
      navigate('/join');
    }
  }, [cardHolder, navigate]);

  if (!cardHolder) return null;

  const handleComplete = () => {
    navigate('/card');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-copper-dark px-4 py-8 fade-in">
      {/* Card reveal */}
      <CardRevealAnimation cardHolder={cardHolder} />

      {/* Text */}
      <div className="mt-6 text-center fade-in-delay-1">
        <h1 className="font-heading text-2xl font-semibold text-white">
          Your Comfort Card is ready
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Your QR code to caring. Share it and grow the community.
        </p>
        {cardHolder.referredBy && (
          <p className="mt-2 text-xs text-sage-light">
            You were connected by someone in the co-op.care community
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 w-full max-w-sm fade-in-delay-2">
        <WalletButtons onComplete={handleComplete} />
      </div>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={handleComplete}
        className="mt-6 w-full max-w-sm rounded-xl bg-sage py-4 text-base font-semibold text-white shadow-lg transition-all active:scale-[0.98] fade-in-delay-3"
      >
        Start chatting with Sage
      </button>
    </div>
  );
}

export default WelcomeReveal;
