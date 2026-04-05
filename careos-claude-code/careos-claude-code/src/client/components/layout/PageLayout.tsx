/**
 * PageLayout — Shared nav + footer for all public pages
 *
 * Extracts the duplicated nav/footer pattern from Homepage, FAQ, Team, etc.
 * Variants: standard (full footer), minimal (no footer), app (no nav CTA).
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: 'standard' | 'minimal';
  navRight?: React.ReactNode;
}

const FOOTER_LINKS = [
  { label: 'How it works', to: '/faq' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Partners', to: '/partners' },
  { label: 'Our Team', to: '/team' },
  { label: 'Wellness', to: '/wellness' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

export default function PageLayout({ children, variant = 'standard', navRight }: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-sage focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Skip to content
      </a>

      {/* Nav */}
      <nav
        aria-label="Main navigation"
        className="flex items-center justify-between px-6 py-5 md:px-12"
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="transition-opacity active:opacity-70"
          aria-label="co-op.care home"
        >
          <Logo variant="horizontal" size="sm" />
        </button>
        {navRight || (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/partners')}
              className="hidden rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-navy/5 sm:block"
            >
              Partners
            </button>
            <button
              type="button"
              onClick={() => navigate('/card')}
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-navy-dark hover:shadow-lg active:scale-95"
            >
              Get started
            </button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main id="main-content">{children}</main>

      {/* Footer */}
      {variant === 'standard' && (
        <footer
          role="contentinfo"
          className="border-t border-border bg-warm-white px-6 py-10 md:px-12"
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <Logo variant="full" size="sm" />
            </div>
            <p className="mt-3 text-center text-[10px] text-text-muted">
              Boulder, Colorado · Pre-launch 2026 · Doctor-supervised care
            </p>

            {/* Page links */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px]">
              {FOOTER_LINKS.map((link, i) => (
                <span key={link.to} className="flex items-center gap-3">
                  {i > 0 && <span className="text-text-muted/30">·</span>}
                  <button
                    type="button"
                    onClick={() => navigate(link.to)}
                    className="text-text-muted transition-colors hover:text-sage-dark"
                  >
                    {link.label}
                  </button>
                </span>
              ))}
            </div>

            {/* Legal links */}
            <div className="mt-2 flex items-center justify-center gap-3 text-[10px]">
              {LEGAL_LINKS.map((link, i) => (
                <span key={link.to} className="flex items-center gap-3">
                  {i > 0 && <span className="text-text-muted/30">·</span>}
                  <button
                    type="button"
                    onClick={() => navigate(link.to)}
                    className="text-text-muted/60 transition-colors hover:text-sage-dark"
                  >
                    {link.label}
                  </button>
                </span>
              ))}
            </div>

            <p className="mt-3 text-center text-[10px] text-text-muted/50">
              © 2026 co-op.care Limited Cooperative Association
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
