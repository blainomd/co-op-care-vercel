/**
 * InternalDirectory — Hidden page index for co-op.care internal/private pages
 *
 * Accessible at /#/internal — not linked from any public nav.
 * Serves as a directory of all hidden/private pages for the team.
 */
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { useFirebaseAuthStore } from '../../stores/firebaseAuthStore';

interface PageLink {
  path: string;
  title: string;
  description: string;
  category: 'partner' | 'clinical' | 'legal' | 'financial' | 'admin' | 'public';
  status: 'live' | 'draft' | 'planned';
}

const pages: PageLink[] = [
  // Partner pages
  {
    path: '/bch',
    title: 'BCH Foundation — Partnership Overview',
    description:
      'Private page for Grant Besser. Bob Dion case study, team bios, Boulder vision, financials.',
    category: 'partner',
    status: 'live',
  },
  {
    path: '/bch/dashboard',
    title: 'BCH Foundation — KPI Dashboard',
    description:
      '16-section dashboard: financial impact, adoption curve, CMS revenue, clinical paper, VtV Network.',
    category: 'partner',
    status: 'live',
  },
  {
    path: '/invest',
    title: 'Investor Page',
    description: 'Investment thesis, market opportunity, team, financials for potential investors.',
    category: 'partner',
    status: 'live',
  },

  // Legal & Regulatory
  {
    path: '/legal/lmn',
    title: 'LMN Legal Framework',
    description:
      'Full HSA/FSA + LMN legal analysis. IRS framework, case law, risk matrix, structural recommendations.',
    category: 'legal',
    status: 'live',
  },
  {
    path: '/legal/roi',
    title: 'Full ROI Model',
    description:
      'Multi-stakeholder ROI: families, caregivers, physician, co-op.care P&L, BCH, CMS, community, investors.',
    category: 'financial',
    status: 'live',
  },
  {
    path: '/bsw',
    title: 'Boulder Startup Week 2026 Proposal',
    description:
      'Session proposal: "Your Parents Are Going to Need Help." Panel with Blaine, Josh, Jess. Deadline ~April 1.',
    category: 'partner',
    status: 'live',
  },
  {
    path: '/grants',
    title: 'Grant & Funding Tracker',
    description:
      '23 opportunities with submission pipeline, to-do list, strategy, and SAM.gov blocker tracking.',
    category: 'financial',
    status: 'live',
  },
  {
    path: '/grants/write',
    title: 'Grant Writing Workspace',
    description:
      'Full grant narratives with readiness scores, copy buttons, and agentic improvement suggestions.',
    category: 'financial',
    status: 'live',
  },

  // Clinical
  {
    path: '/lmn',
    title: 'LMN Generator',
    description: 'AI-assisted Letter of Medical Necessity generation for physician review.',
    category: 'clinical',
    status: 'live',
  },
  {
    path: '/assess',
    title: 'Video Home Assessment',
    description: 'AI-powered video home assessment tool for care planning.',
    category: 'clinical',
    status: 'live',
  },
  {
    path: '/sim',
    title: 'Simulation Dashboard',
    description: 'Care delivery simulation and scenario modeling.',
    category: 'clinical',
    status: 'live',
  },
  {
    path: '/wellness',
    title: 'Wellness Page',
    description: 'Wellness tracking and health metrics dashboard.',
    category: 'clinical',
    status: 'live',
  },
  {
    path: '/admin/review',
    title: 'Admin Review Dashboard',
    description: 'Administrative review of care plans, LMNs, and clinical documentation.',
    category: 'admin',
    status: 'live',
  },

  // Authenticated features
  {
    path: '/timebank',
    title: 'Time Bank Dashboard',
    description: 'Neighbor-to-neighbor time banking credits and community exchange.',
    category: 'clinical',
    status: 'live',
  },
  {
    path: '/apply',
    title: 'Caregiver Onboarding',
    description: 'W-2 cooperative member application and onboarding flow.',
    category: 'admin',
    status: 'live',
  },
  {
    path: '/card',
    title: 'Sage AI + Living Profile',
    description: 'Main app experience — AI care companion and member profile card.',
    category: 'clinical',
    status: 'live',
  },

  // Public pages (for reference)
  {
    path: '/',
    title: 'Homepage',
    description: 'Public landing page with cooperative value prop and founding member signup.',
    category: 'public',
    status: 'live',
  },
  {
    path: '/partners',
    title: 'Partners Page',
    description: 'Public healthcare partnership overview.',
    category: 'public',
    status: 'live',
  },
  {
    path: '/about',
    title: 'About Page',
    description: 'Company story, mission, team overview.',
    category: 'public',
    status: 'live',
  },
  {
    path: '/pricing',
    title: 'Pricing Page',
    description: 'Care tiers and pricing transparency.',
    category: 'public',
    status: 'live',
  },
  {
    path: '/faq',
    title: 'FAQ',
    description: 'Frequently asked questions.',
    category: 'public',
    status: 'live',
  },
  {
    path: '/team',
    title: 'Team Page',
    description: 'Leadership and clinical team bios.',
    category: 'public',
    status: 'live',
  },
  {
    path: '/contact',
    title: 'Contact Page',
    description: 'Contact form and information.',
    category: 'public',
    status: 'live',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'HIPAA-aligned privacy policy.',
    category: 'public',
    status: 'live',
  },
  {
    path: '/terms',
    title: 'Terms of Service',
    description: 'Terms and conditions.',
    category: 'public',
    status: 'live',
  },
];

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  partner: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Partner' },
  clinical: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Clinical' },
  legal: { bg: 'bg-red-100', text: 'text-red-800', label: 'Legal' },
  financial: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Financial' },
  admin: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Admin' },
  public: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Public' },
};

const statusColors: Record<string, string> = {
  live: 'bg-emerald-500',
  draft: 'bg-amber-500',
  planned: 'bg-slate-400',
};

export default function InternalDirectory() {
  const navigate = useNavigate();
  const firebaseUser = useFirebaseAuthStore((s) => s.firebaseUser);
  const logOut = useFirebaseAuthStore((s) => s.logOut);

  const categories = ['partner', 'legal', 'financial', 'clinical', 'admin', 'public'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="md" />
          </button>
          <div className="flex items-center gap-3">
            {firebaseUser && (
              <div className="flex items-center gap-2">
                {firebaseUser.photoURL && (
                  <img
                    src={firebaseUser.photoURL}
                    alt=""
                    className="h-7 w-7 rounded-full border border-slate-200"
                  />
                )}
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {firebaseUser.email}
                </span>
              </div>
            )}
            <span className="rounded-full bg-[#1B2A4A] px-3 py-1 text-xs font-semibold text-white">
              INTERNAL
            </span>
            <button
              onClick={logOut}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Site Directory</h1>
          <p className="text-slate-500">
            All pages — public and private. This page is not linked from any navigation.
          </p>
          <p className="mt-2 text-xs text-slate-400">Base URL: co-op.care/#</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-[#1B2A4A]">{pages.length}</p>
            <p className="text-xs text-slate-500">Total Pages</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-[#0D7377]">
              {pages.filter((p) => p.category !== 'public').length}
            </p>
            <p className="text-xs text-slate-500">Hidden / Private</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-emerald-600">
              {pages.filter((p) => p.status === 'live').length}
            </p>
            <p className="text-xs text-slate-500">Live</p>
          </div>
        </div>

        {/* Pages by category */}
        {categories.map((cat) => {
          const catPages = pages.filter((p) => p.category === cat);
          if (catPages.length === 0) return null;
          const catInfo = categoryColors[cat] ?? {
            bg: 'bg-slate-100',
            text: 'text-slate-800',
            label: cat,
          };

          return (
            <div key={cat} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`${catInfo.bg} ${catInfo.text} rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider`}
                >
                  {catInfo.label}
                </span>
                <span className="text-xs text-slate-400">{catPages.length} pages</span>
              </div>

              <div className="space-y-2">
                {catPages.map((page) => (
                  <button
                    key={page.path}
                    onClick={() => navigate(page.path)}
                    className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#0D7377] hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${statusColors[page.status] ?? 'bg-slate-400'}`}
                            aria-label={`Status: ${page.status}`}
                            title={page.status}
                          />
                          <h3 className="font-semibold text-[#1B2A4A] group-hover:text-[#0D7377] transition-colors">
                            {page.title}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{page.description}</p>
                      </div>
                      <code className="ml-4 flex-shrink-0 rounded bg-slate-100 px-2 py-1 text-xs text-slate-500 font-mono">
                        /{page.path.replace(/^\//, '')}
                      </code>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
          <p className="text-xs text-slate-400">
            co-op.care Internal Directory · Not for public distribution · March 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
