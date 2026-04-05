/**
 * IOSInstallGuide — Manual "Add to Home Screen" instructions for iOS
 *
 * iOS doesn't support beforeinstallprompt, so we show a visual guide
 * pointing users to Safari's share button → "Add to Home Screen".
 */

interface IOSInstallGuideProps {
  onClose: () => void;
}

export function IOSInstallGuide({ onClose }: IOSInstallGuideProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl fade-up">
        <h3 className="font-heading text-lg font-semibold text-text-primary">Add to Home Screen</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Install co-op.care on your iPhone in two steps:
        </p>

        <div className="mt-4 space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sm font-semibold text-sage-dark">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Tap the Share button</p>
              <p className="text-xs text-text-muted">
                The square with an arrow pointing up, at the bottom of Safari
              </p>
              <div className="mt-1 inline-flex items-center rounded bg-warm-gray px-2 py-1">
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
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sm font-semibold text-sage-dark">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Tap &quot;Add to Home Screen&quot;
              </p>
              <p className="text-xs text-text-muted">
                Scroll down in the share menu if you don't see it right away
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-sage py-3 font-semibold text-white transition-all active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
