/**
 * LMN Marketplace — Browse qualifying wellness services by Omaha problem
 *
 * Physician-governed marketplace making community wellness HSA/FSA eligible.
 * The LMN (Letter of Medical Necessity) covers all qualifying services for a family.
 * Marketplace UI filters by member's LMN conditions using Omaha problem mappings.
 * Provider referral revenue 8-12%.
 */
import { useState } from 'react';

type CategoryFilter = 'all' | 'fall_prevention' | 'nutrition' | 'cardiac' | 'cognition' | 'fitness';

interface WellnessService {
  id: string;
  providerName: string;
  serviceType: string;
  description: string;
  omahaProblem: string;
  omahaCode: string;
  icd10Code: string;
  category: Exclude<CategoryFilter, 'all'>;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  hsaEligible: boolean;
  distance: string;
}

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  fall_prevention: 'Fall Prevention',
  nutrition: 'Nutrition',
  cardiac: 'Cardiac',
  cognition: 'Cognition',
  fitness: 'Fitness',
};

const CATEGORY_COLORS: Record<Exclude<CategoryFilter, 'all'>, string> = {
  fall_prevention: 'bg-sage/10 text-sage',
  nutrition: 'bg-teal-500/10 text-teal-600',
  cardiac: 'bg-zone-red/10 text-zone-red',
  cognition: 'bg-purple-500/10 text-purple-600',
  fitness: 'bg-blue-500/10 text-blue-600',
};

const MOCK_SERVICES: WellnessService[] = [
  {
    id: 'ws1',
    providerName: 'Boulder Tai Chi Center',
    serviceType: 'Tai Chi Class',
    description:
      'Evidence-based tai chi for fall prevention. Slow-form practice improving balance, strength, and confidence.',
    omahaProblem: '#25 Neuro-musculo-skeletal',
    omahaCode: '#25 NMS',
    icd10Code: 'R26.81',
    category: 'fall_prevention',
    price: 25,
    priceUnit: 'per class',
    rating: 4.9,
    reviewCount: 47,
    hsaEligible: true,
    distance: '1.2 mi',
  },
  {
    id: 'ws2',
    providerName: 'Maria Gutierrez, RD, LD',
    serviceType: 'RD Counseling',
    description:
      'Registered dietitian counseling for chronic disease nutrition management, meal planning, and dietary education.',
    omahaProblem: '#35 Nutrition',
    omahaCode: '#35',
    icd10Code: 'Z71.3',
    category: 'nutrition',
    price: 95,
    priceUnit: 'per session',
    rating: 4.8,
    reviewCount: 32,
    hsaEligible: true,
    distance: '0.8 mi',
  },
  {
    id: 'ws3',
    providerName: 'Flatirons Cardiac Wellness',
    serviceType: 'Cardiac Rehab Program',
    description:
      'Supervised cardiac rehabilitation with monitored exercise, education, and risk factor management.',
    omahaProblem: '#27 Circulation',
    omahaCode: '#27',
    icd10Code: 'Z95.1',
    category: 'cardiac',
    price: 150,
    priceUnit: 'per session',
    rating: 4.7,
    reviewCount: 19,
    hsaEligible: true,
    distance: '2.4 mi',
  },
  {
    id: 'ws4',
    providerName: 'Memory Matters Boulder',
    serviceType: 'Cognitive Stimulation Group',
    description:
      'Structured group cognitive stimulation therapy. Evidence-based activities for memory, attention, and executive function.',
    omahaProblem: '#21 Cognition',
    omahaCode: '#21',
    icd10Code: 'R41.3',
    category: 'cognition',
    price: 40,
    priceUnit: 'per session',
    rating: 4.6,
    reviewCount: 24,
    hsaEligible: true,
    distance: '1.5 mi',
  },
  {
    id: 'ws5',
    providerName: 'Pearl Street Yoga Studio',
    serviceType: 'Adaptive Yoga',
    description:
      'Gentle, adaptive yoga classes designed for seniors. Chair-based and standing options with certified instructors.',
    omahaProblem: '#37 Physical Activity',
    omahaCode: '#37',
    icd10Code: 'Z72.3',
    category: 'fitness',
    price: 20,
    priceUnit: 'per class',
    rating: 4.8,
    reviewCount: 56,
    hsaEligible: true,
    distance: '0.5 mi',
  },
  {
    id: 'ws6',
    providerName: 'Dr. Lin Zhao, LAc',
    serviceType: 'Acupuncture',
    description:
      'Licensed acupuncture for pain management, stress reduction, and musculoskeletal support. ICD-10 justified.',
    omahaProblem: '#25 Neuro-musculo-skeletal',
    omahaCode: '#25 NMS',
    icd10Code: 'M54.5',
    category: 'fall_prevention',
    price: 85,
    priceUnit: 'per session',
    rating: 4.9,
    reviewCount: 38,
    hsaEligible: true,
    distance: '1.8 mi',
  },
  {
    id: 'ws7',
    providerName: 'Healing Hands Therapeutic Massage',
    serviceType: 'Therapeutic Massage',
    description:
      'Licensed massage therapy for circulation improvement, pain management, and mobility support.',
    omahaProblem: '#27 Circulation',
    omahaCode: '#27',
    icd10Code: 'I73.9',
    category: 'cardiac',
    price: 95,
    priceUnit: 'per session',
    rating: 4.7,
    reviewCount: 41,
    hsaEligible: true,
    distance: '1.1 mi',
  },
];

/** Mock LMN coverage — conditions covered by the family's active LMN */
const MOCK_LMN_COVERED_CATEGORIES: CategoryFilter[] = ['fall_prevention', 'nutrition', 'cardiac'];
const HAS_ACTIVE_LMN = true;

export function LMNMarketplace() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');

  const filtered =
    activeFilter === 'all'
      ? MOCK_SERVICES
      : MOCK_SERVICES.filter((s) => s.category === activeFilter);

  const coveredCount = MOCK_SERVICES.filter((s) =>
    MOCK_LMN_COVERED_CATEGORIES.includes(s.category),
  ).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">LMN Marketplace</h1>
          <p className="text-sm text-muted">Browse qualifying wellness services by condition</p>
        </div>
        <a
          href="#/lmn"
          className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
        >
          My LMNs
        </a>
      </div>

      {/* LMN Status Banner */}
      {HAS_ACTIVE_LMN ? (
        <div className="rounded-xl border border-sage/30 bg-sage/5 p-4">
          <div className="flex items-start gap-3">
            {/* Shield check icon */}
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">Your LMN covers:</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {MOCK_LMN_COVERED_CATEGORIES.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-sage/10 px-2.5 py-0.5 text-xs font-medium text-sage"
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                {coveredCount} qualifying services available with HSA/FSA savings
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <div className="flex items-start gap-3">
            {/* Info circle icon */}
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-primary">
                Get an LMN to unlock HSA/FSA savings
              </p>
              <p className="mt-0.5 text-xs text-muted">
                A Letter of Medical Necessity from your physician makes these wellness services
                eligible for HSA/FSA payment.
              </p>
              <button className="mt-2 rounded-lg bg-gold px-3 py-1.5 text-xs font-medium text-white hover:bg-gold/90">
                Learn How It Works
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Savings Callout */}
      <div className="rounded-xl bg-gradient-to-r from-copper to-gold p-4 text-white">
        <div className="flex items-center gap-3">
          {/* Wallet icon */}
          <svg
            className="h-8 w-8 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
            />
          </svg>
          <div>
            <p className="text-lg font-bold">Save 28-36% on every booking with HSA/FSA</p>
            <p className="text-xs text-white/80">
              All services booked through the LMN Marketplace qualify for pre-tax payment with your
              Comfort Card
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeFilter === cat
                ? 'bg-sage text-white'
                : 'bg-warm-gray/20 text-muted hover:bg-warm-gray/30'
            }`}
          >
            {CATEGORY_LABELS[cat]}
            {cat !== 'all' && MOCK_LMN_COVERED_CATEGORIES.includes(cat) && (
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
            )}
          </button>
        ))}
      </div>

      {/* Service Cards */}
      <div className="space-y-3">
        {filtered.map((service) => {
          const catColor = CATEGORY_COLORS[service.category];
          const isCovered = MOCK_LMN_COVERED_CATEGORIES.includes(service.category);

          return (
            <div key={service.id} className="rounded-xl border border-border bg-white p-4">
              {/* Top Row: Provider + Category Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-primary">{service.serviceType}</h3>
                  <p className="text-xs text-secondary">{service.providerName}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${catColor}`}
                >
                  {CATEGORY_LABELS[service.category]}
                </span>
              </div>

              {/* Description */}
              <p className="mt-2 text-xs leading-relaxed text-muted">{service.description}</p>

              {/* Omaha + ICD-10 Tags */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded bg-sage/10 px-1.5 py-0.5 text-[10px] font-medium text-sage">
                  {service.omahaProblem}
                </span>
                <span className="rounded bg-warm-gray/20 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                  ICD-10: {service.icd10Code}
                </span>
                {service.hsaEligible && isCovered && (
                  <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                    HSA/FSA Eligible
                  </span>
                )}
                {isCovered && (
                  <span className="rounded bg-sage/10 px-1.5 py-0.5 text-[10px] font-medium text-sage">
                    LMN Covered
                  </span>
                )}
              </div>

              {/* Price Row + Rating + Distance */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-primary">${service.price}</span>
                  <span className="text-muted">{service.priceUnit}</span>
                  <span className="text-muted">{service.distance}</span>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-medium text-primary">{service.rating}</span>
                  <span className="text-[10px] text-muted">({service.reviewCount})</span>
                </div>
              </div>

              {/* Book Button */}
              <button
                className={`mt-3 w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                  isCovered
                    ? 'bg-sage text-white hover:bg-sage-dark'
                    : 'bg-warm-gray/20 text-secondary hover:bg-warm-gray/30'
                }`}
              >
                {isCovered ? (
                  <span className="flex items-center justify-center gap-1.5">
                    {/* Credit card icon */}
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25h-15a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    Book with Comfort Card
                  </span>
                ) : (
                  'Book Session'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <p className="text-sm text-muted">No services found for this category.</p>
        </div>
      )}

      {/* Footer note */}
      <p className="text-[11px] text-muted">
        All marketplace services require a valid LMN signed by your physician for HSA/FSA
        eligibility. Provider referral partnerships support cooperative operations at 8-12% of
        service fees.
      </p>
    </div>
  );
}
