/**
 * LMN List — Letter of Medical Necessity lifecycle view
 *
 * Shows all LMNs with status filtering (draft, pending-signature,
 * active, expiring, expired). Links to detail/sign view.
 */
import { useState, useMemo } from 'react';
import type { LMNStatus } from '@shared/types/lmn.types';

interface LMNListItem {
  id: string;
  careRecipientName: string;
  status: LMNStatus;
  acuity: string;
  issuedAt?: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
  signingPhysicianName?: string;
  criScore: number;
}

/** Mock data */
const MOCK_LMNS: LMNListItem[] = [
  {
    id: 'lmn_001',
    careRecipientName: 'Eleanor Davis',
    status: 'active',
    acuity: 'high',
    criScore: 52.4,
    issuedAt: '2025-09-15T00:00:00Z',
    expiresAt: '2026-09-15T00:00:00Z',
    daysUntilExpiry: 191,
    signingPhysicianName: 'Dr. Sarah Chen',
  },
  {
    id: 'lmn_002',
    careRecipientName: 'Harold Chen',
    status: 'expiring',
    acuity: 'critical',
    criScore: 64.2,
    issuedAt: '2025-04-01T00:00:00Z',
    expiresAt: '2026-04-01T00:00:00Z',
    daysUntilExpiry: 24,
    signingPhysicianName: 'Dr. Sarah Chen',
  },
  {
    id: 'lmn_003',
    careRecipientName: 'Margaret Thompson',
    status: 'pending_signature',
    acuity: 'high',
    criScore: 48.6,
    signingPhysicianName: 'Dr. Sarah Chen',
  },
  {
    id: 'lmn_004',
    careRecipientName: 'Robert Williams',
    status: 'draft',
    acuity: 'high',
    criScore: 46.1,
  },
  {
    id: 'lmn_005',
    careRecipientName: 'Grace Martinez',
    status: 'expired',
    acuity: 'high',
    criScore: 51.0,
    issuedAt: '2024-12-01T00:00:00Z',
    expiresAt: '2025-12-01T00:00:00Z',
    daysUntilExpiry: -98,
    signingPhysicianName: 'Dr. Sarah Chen',
  },
];

type FilterTab = 'all' | 'active' | 'pending' | 'expiring' | 'expired';

const STATUS_CONFIG: Record<LMNStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-warm-gray', text: 'text-text-muted', label: 'Draft' },
  pending_signature: {
    bg: 'bg-zone-yellow/10',
    text: 'text-zone-yellow',
    label: 'Pending Signature',
  },
  active: { bg: 'bg-zone-green/10', text: 'text-zone-green', label: 'Active' },
  expiring: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Expiring Soon' },
  expired: { bg: 'bg-zone-red/10', text: 'text-zone-red', label: 'Expired' },
  revoked: { bg: 'bg-zone-red/10', text: 'text-zone-red', label: 'Revoked' },
};

const ACUITY_COLORS: Record<string, string> = {
  critical: 'text-zone-red',
  high: 'text-orange-600',
  moderate: 'text-zone-yellow',
  low: 'text-zone-green',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function LMNList() {
  const [lmns] = useState<LMNListItem[]>(MOCK_LMNS);
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredLmns = useMemo(() => {
    switch (filter) {
      case 'active':
        return lmns.filter((l) => l.status === 'active');
      case 'pending':
        return lmns.filter((l) => l.status === 'draft' || l.status === 'pending_signature');
      case 'expiring':
        return lmns.filter((l) => l.status === 'expiring');
      case 'expired':
        return lmns.filter((l) => l.status === 'expired' || l.status === 'revoked');
      default:
        return lmns;
    }
  }, [lmns, filter]);

  const counts = useMemo(
    () => ({
      all: lmns.length,
      active: lmns.filter((l) => l.status === 'active').length,
      pending: lmns.filter((l) => l.status === 'draft' || l.status === 'pending_signature').length,
      expiring: lmns.filter((l) => l.status === 'expiring').length,
      expired: lmns.filter((l) => l.status === 'expired' || l.status === 'revoked').length,
    }),
    [lmns],
  );

  const tabs: Array<{ key: FilterTab; label: string }> = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'active', label: `Active (${counts.active})` },
    { key: 'pending', label: `Pending (${counts.pending})` },
    { key: 'expiring', label: `Expiring (${counts.expiring})` },
    { key: 'expired', label: `Expired (${counts.expired})` },
  ];

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            Letters of Medical Necessity
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            LMN documents for HSA/FSA care service eligibility.
          </p>
        </div>
        <a
          href="#/lmn/generate"
          className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
        >
          Generate LMN
        </a>
      </div>

      {/* Alert: expiring LMNs */}
      {counts.expiring > 0 && (
        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span className="text-sm font-medium text-orange-600">
              {counts.expiring} LMN{counts.expiring !== 1 ? 's' : ''} expiring soon — renewal
              required to maintain HSA eligibility.
            </span>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-border bg-warm-gray/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LMN cards */}
      <div className="space-y-3">
        {filteredLmns.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-8 text-center">
            <h3 className="text-sm font-medium text-text-primary">No LMNs found</h3>
            <p className="mt-1 text-xs text-text-muted">
              Generate an LMN from an approved CRI assessment.
            </p>
          </div>
        ) : (
          filteredLmns.map((lmn) => {
            const statusConfig = STATUS_CONFIG[lmn.status];
            return (
              <a
                key={lmn.id}
                href={`#/lmn/${lmn.id}`}
                className={`block rounded-xl border p-4 transition-colors hover:bg-warm-gray/30 ${
                  lmn.status === 'expiring'
                    ? 'border-orange-200 bg-orange-50/50'
                    : lmn.status === 'expired' || lmn.status === 'revoked'
                      ? 'border-border bg-warm-gray/30 opacity-70'
                      : 'border-border bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {lmn.careRecipientName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      <span>
                        CRI:{' '}
                        <span className={`font-semibold ${ACUITY_COLORS[lmn.acuity] ?? ''}`}>
                          {lmn.criScore}
                        </span>{' '}
                        ({lmn.acuity})
                      </span>
                      {lmn.signingPhysicianName && <span>{lmn.signingPhysicianName}</span>}
                    </div>
                  </div>

                  {/* Expiry info */}
                  <div className="text-right">
                    {lmn.issuedAt && (
                      <p className="text-xs text-text-muted">Issued {formatDate(lmn.issuedAt)}</p>
                    )}
                    {lmn.daysUntilExpiry !== undefined && lmn.daysUntilExpiry > 0 && (
                      <p
                        className={`text-xs font-medium ${
                          lmn.daysUntilExpiry <= 30
                            ? 'text-orange-600'
                            : lmn.daysUntilExpiry <= 60
                              ? 'text-zone-yellow'
                              : 'text-text-muted'
                        }`}
                      >
                        {lmn.daysUntilExpiry} days remaining
                      </p>
                    )}
                    {lmn.daysUntilExpiry !== undefined && lmn.daysUntilExpiry <= 0 && (
                      <p className="text-xs font-medium text-zone-red">
                        Expired {Math.abs(lmn.daysUntilExpiry)} days ago
                      </p>
                    )}
                    {lmn.status === 'pending_signature' && (
                      <p className="text-xs font-medium text-zone-yellow">Awaiting MD signature</p>
                    )}
                    {lmn.status === 'draft' && (
                      <p className="text-xs font-medium text-text-muted">
                        Ready to send for signature
                      </p>
                    )}
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
