/**
 * WalletButtons — Apple/Google Wallet + PWA install + Share QR
 *
 * Wallet passes need server-side signing (Apple cert / Google API).
 * Demo mode: graceful fallback to PWA install with helpful toast.
 * The PWA home screen icon IS the wallet card for now.
 */
import { useState } from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { useSignupStore } from '../../stores/signupStore';
import { IOSInstallGuide } from './IOSInstallGuide';
import { ShareQR } from './ShareQR';

interface WalletButtonsProps {
  onComplete?: () => void;
}

export function WalletButtons({ onComplete }: WalletButtonsProps) {
  const { canInstall, isIOS, isInstalled, showPrompt } = useInstallPrompt();
  const setPwaInstalled = useSignupStore((s) => s.setPwaInstalled);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [walletToast, setWalletToast] = useState('');

  const handleWalletClick = () => {
    setWalletToast('Wallet passes coming soon! Add to Home Screen for now.');
    setTimeout(() => setWalletToast(''), 3000);
  };

  const handlePWAInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (canInstall) {
      const accepted = await showPrompt();
      if (accepted) {
        setPwaInstalled();
      }
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Share QR — primary action */}
      <ShareQR />

      {/* Wallet buttons (demo mode — show toast) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleWalletClick}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-3 text-sm font-medium text-text-primary transition-all active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          Apple Wallet
        </button>
        <button
          type="button"
          onClick={handleWalletClick}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-3 text-sm font-medium text-text-primary transition-all active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          Google Wallet
        </button>
      </div>

      {/* PWA Install */}
      {!isInstalled && (canInstall || isIOS) && (
        <button
          type="button"
          onClick={handlePWAInstall}
          className="w-full rounded-xl border border-sage/20 bg-sage/5 px-4 py-3 text-sm font-semibold text-sage-dark transition-all active:scale-[0.98]"
        >
          {isIOS ? 'Add to Home Screen (iOS)' : 'Add to Home Screen'}
        </button>
      )}

      {/* Skip */}
      {onComplete && (
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-2 text-sm text-text-muted transition-opacity active:opacity-70"
        >
          I'll do this later
        </button>
      )}

      {/* Toast */}
      {walletToast && (
        <div className="toast-enter rounded-lg bg-copper/90 px-4 py-2 text-center text-sm text-white">
          {walletToast}
        </div>
      )}

      {/* iOS Guide Overlay */}
      {showIOSGuide && <IOSInstallGuide onClose={() => setShowIOSGuide(false)} />}
    </div>
  );
}
