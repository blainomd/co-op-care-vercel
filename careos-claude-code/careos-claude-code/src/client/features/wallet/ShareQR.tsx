/**
 * ShareQR — Export your QR code as a shareable image or link
 *
 * Uses Web Share API (native share sheet) when available,
 * falls back to copy-to-clipboard.
 * The QR code IS the viral growth engine.
 */
import { useState, useCallback } from 'react';
import { useSignupStore } from '../../stores/signupStore';

interface ShareQRProps {
  className?: string;
  variant?: 'button' | 'compact';
}

export function ShareQR({ className = '', variant = 'button' }: ShareQRProps) {
  const cardHolder = useSignupStore((s) => s.cardHolder);
  const [copied, setCopied] = useState(false);

  const shareUrl = cardHolder?.qrUrl ?? '';
  const shareText = `Join me on co-op.care — community care, cooperatively owned. Get your free Comfort Card:`;

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;

    // Try native share sheet first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'co-op.care — Your QR code to caring',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failed — show URL in alert as last resort
      window.prompt('Copy your share link:', shareUrl);
    }
  }, [shareUrl, shareText]);

  if (!cardHolder) return null;

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark transition-opacity active:opacity-70 ${className}`}
      >
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
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {copied ? 'Copied!' : 'Share'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border border-sage/20 bg-sage/5 px-4 py-3 font-semibold text-sage-dark transition-all active:scale-[0.98] active:bg-sage/10 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? 'Link copied!' : 'Share your QR code'}
    </button>
  );
}
