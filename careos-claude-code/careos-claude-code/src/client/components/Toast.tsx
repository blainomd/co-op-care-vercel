/**
 * Toast — Notification toast system with Zustand store
 *
 * Provides ephemeral toast notifications for success, error, info, and
 * notification events. Auto-dismisses after configurable duration.
 * Renders fixed-position toasts in top-right (desktop) or top-center (mobile).
 */
import { create } from 'zustand';
import { useEffect, useRef } from 'react';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'notification';
  title: string;
  message?: string;
  linkTo?: string;
  duration?: number; // ms, default 5000
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

/* ────────────────────────────────────────────
   Store
   ──────────────────────────────────────────── */

// eslint-disable-next-line react-refresh/only-export-components
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

/* ────────────────────────────────────────────
   Convenience helpers (use outside React)
   ──────────────────────────────────────────── */

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message }),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message }),
  notification: (title: string, message?: string, linkTo?: string) =>
    useToastStore.getState().addToast({ type: 'notification', title, message, linkTo }),
};

/* ────────────────────────────────────────────
   Icon paths (heroicons outline 24x24)
   ──────────────────────────────────────────── */

const TOAST_ICONS: Record<Toast['type'], string> = {
  success: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  error:
    'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  notification:
    'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
};

const TOAST_STYLES: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-sage/10',
    border: 'border-sage/30',
    icon: 'text-sage',
  },
  error: {
    bg: 'bg-zone-red/10',
    border: 'border-zone-red/30',
    icon: 'text-zone-red',
  },
  info: {
    bg: 'bg-blue/10',
    border: 'border-blue/30',
    icon: 'text-blue',
  },
  notification: {
    bg: 'bg-copper/10',
    border: 'border-copper/30',
    icon: 'text-copper',
  },
};

/* ────────────────────────────────────────────
   Single Toast Item
   ──────────────────────────────────────────── */

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = t.duration ?? 5000;

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onDismiss]);

  const styles = TOAST_STYLES[t.type];
  const iconPath = TOAST_ICONS[t.type];

  return (
    <div
      className={`pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border ${styles.border} ${styles.bg} p-4 shadow-lg backdrop-blur-sm toast-enter`}
      role="alert"
    >
      {/* Icon */}
      <svg
        className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
      </svg>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{t.title}</p>
        {t.message && <p className="mt-0.5 text-xs text-text-secondary">{t.message}</p>}
        {t.linkTo && (
          <a
            href={t.linkTo}
            className="mt-1 inline-block text-xs font-medium text-sage hover:text-sage-dark"
          >
            View details
          </a>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-0.5 text-text-muted hover:text-text-secondary transition-colors"
        aria-label="Dismiss notification"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────
   Toast Container (render in AppShell)
   ──────────────────────────────────────────── */

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-md:left-4 max-md:right-4 max-md:items-center"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
