/**
 * Shared scroll-reveal animation components used across internal pages.
 * Extracts useInView, Reveal, AnimCounter, and Expandable from duplicated code.
 */
import { useRef, useState, useEffect } from 'react';

/* ── useInView ───────────────────────────────────────────────── */
// eslint-disable-next-line react-refresh/only-export-components
export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Reveal ──────────────────────────────────────────────────── */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── AnimCounter ─────────────────────────────────────────────── */
export function AnimCounter({
  end,
  prefix = '',
  suffix = '',
  duration = 1500,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const { ref, visible } = useInView(0.1);
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [visible, end, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── Expandable ──────────────────────────────────────────────── */
export function Expandable({
  title,
  summary,
  children,
  defaultOpen = false,
  urgency,
}: {
  title: React.ReactNode;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  urgency?: 'critical' | 'soon' | 'monitor';
}) {
  const [open, setOpen] = useState(defaultOpen);
  const borderMap: Record<string, string> = {
    critical: 'border-red-400',
    soon: 'border-amber-400',
    monitor: 'border-slate-200',
  };
  const border = urgency ? (borderMap[urgency] ?? 'border-slate-200') : 'border-slate-200';

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${open ? `${border} shadow-md` : 'border-slate-200 shadow-sm'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors rounded-xl"
      >
        <div className="flex-1">
          {title}
          {summary && !open && <p className="mt-1 text-sm text-slate-400">{summary}</p>}
        </div>
        <div
          className={`ml-4 flex-shrink-0 h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-180 bg-[#0D7377] border-[#0D7377]' : 'bg-white'}`}
        >
          <svg
            className={`h-4 w-4 ${open ? 'text-white' : 'text-slate-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">{children}</div>
      </div>
    </div>
  );
}
