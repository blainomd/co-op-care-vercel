/**
 * LMN Detail — Preview, sign, and manage a Letter of Medical Necessity
 *
 * Shows the full LMN document preview with sections,
 * sign button for MD, renewal action for expiring LMNs.
 */
import { useState } from 'react';
import type { LMNStatus } from '@shared/types/lmn.types';

interface LMNSection {
  heading: string;
  content: string;
}

interface LMNDetailData {
  id: string;
  careRecipientName: string;
  status: LMNStatus;
  acuity: string;
  criScore: number;
  signingPhysicianName?: string;
  issuedAt?: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
  durationDays: number;
  diagnosisCodes: string[];
  signatureMethod?: string;
  signedAt?: string;
  createdAt: string;
}

/** Mock data */
const MOCK_LMN: LMNDetailData = {
  id: 'lmn_001',
  careRecipientName: 'Eleanor Davis',
  status: 'active',
  acuity: 'high',
  criScore: 52.4,
  signingPhysicianName: 'Dr. Sarah Chen',
  issuedAt: '2025-09-15T00:00:00Z',
  expiresAt: '2026-09-15T00:00:00Z',
  daysUntilExpiry: 191,
  durationDays: 365,
  diagnosisCodes: ['F03.90', 'R26.89', 'Z74.1'],
  signatureMethod: 'manual',
  signedAt: '2025-09-15T14:30:00Z',
  createdAt: '2025-09-14T10:00:00Z',
};

const MOCK_SECTIONS: LMNSection[] = [
  {
    heading: 'Letter of Medical Necessity',
    content:
      'Date: September 15, 2025\nPatient: Eleanor Davis\nIssuing Physician: Dr. Sarah Chen\nDocument ID: lmn_001\nValid: September 15, 2025 through September 15, 2026',
  },
  {
    heading: 'Purpose',
    content:
      "This Letter of Medical Necessity certifies that Eleanor Davis requires in-home companion and personal care services due to significant care needs requiring structured in-home assistance. These services are medically necessary to maintain the patient's health, safety, and functional independence in their home environment.",
  },
  {
    heading: 'Clinical Assessment',
    content:
      "Care Readiness Index (CRI) Score: 52.4 — HIGH acuity\nA standardized 14-factor clinical assessment was performed evaluating the patient's cognitive status, functional mobility, ADL independence, medication complexity, behavioral challenges, fall risk, nutritional status, social support, caregiver burden, home safety, and emergency preparedness.\n\nKey findings:\n  - Cognitive Status: 4/5\n  - Functional Mobility: 4/5\n  - Behavioral Challenges: 4/5\n  - Fall Risk: 3/5",
  },
  {
    heading: 'Diagnosis Codes (ICD-10)',
    content:
      '  - F03.90 — Unspecified dementia\n  - R26.89 — Other abnormalities of gait and mobility\n  - Z74.1 — Need for assistance with personal care',
  },
  {
    heading: 'Identified Problems (Omaha System Classification)',
    content:
      '  - #21 Cognition (Physiological)\n  - #25 Neuro-Musculo-Skeletal Function (Physiological)\n  - #38 Personal Care (Health-Related Behaviors)',
  },
  {
    heading: 'Recommended Services',
    content:
      '  - Regular in-home companion care (2-4 hours, 3-5 days/week)\n  - Cognitive support and supervision (Cognition)\n  - Fall prevention and mobility assistance (Neuro-Musculo-Skeletal Function)\n  - Personal care and hygiene assistance (Personal Care)\n  - Care coordination with primary care physician\n  - Regular care plan review and KBS outcome tracking',
  },
  {
    heading: 'Medical Necessity Determination',
    content:
      'Based on the clinical assessment (CRI score: 52.4, acuity: high), I certify that the above-described in-home care services are medically necessary for Eleanor Davis.\n\nWithout these services, the patient would be at increased risk for:\n  - Hospitalization or emergency department utilization\n  - Functional decline and loss of independence\n  - Caregiver burnout and collapse of informal support network\n  - Adverse health events related to identified clinical problems\n\nThese services qualify for reimbursement under IRS Publication 502 as medical care expenses eligible for HSA/FSA distribution.',
  },
  {
    heading: 'Physician Certification',
    content:
      'I, Dr. Sarah Chen, certify that the information provided in this letter is accurate and that the recommended services are medically necessary.\n\nPhysician: Dr. Sarah Chen\nDate: September 15, 2025\nSignature: [SIGNED ELECTRONICALLY]',
  },
  {
    heading: 'Document Validity',
    content:
      'This Letter of Medical Necessity is valid for 365 days from September 15, 2025 through September 15, 2026. A reassessment and renewal will be required prior to expiration to maintain eligibility for reimbursement.',
  },
];

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function LMNDetail() {
  const [lmn] = useState<LMNDetailData>(MOCK_LMN);
  const [sections] = useState<LMNSection[]>(MOCK_SECTIONS);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signMethod, setSignMethod] = useState<'manual' | 'docusign' | 'hellosign'>('manual');
  const [signing, setSigning] = useState(false);

  const statusConfig = STATUS_CONFIG[lmn.status];
  const canSign = lmn.status === 'draft' || lmn.status === 'pending_signature';
  const canRenew = lmn.status === 'expiring' || lmn.status === 'expired';
  const canRevoke = lmn.status === 'active' || lmn.status === 'expiring';

  function handleSign() {
    setSigning(true);
    // API call: POST /lmn/:id/sign { signatureMethod: signMethod }
    setTimeout(() => {
      setSigning(false);
      setShowSignDialog(false);
    }, 1500);
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      {/* Back link */}
      <a
        href="#/lmn"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to LMN List
      </a>

      {/* Header card */}
      <div className="mb-6 rounded-xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-xl font-semibold text-text-primary">
                LMN — {lmn.careRecipientName}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-text-secondary">
              <span>
                CRI: <span className="font-semibold">{lmn.criScore}</span> ({lmn.acuity})
              </span>
              {lmn.signingPhysicianName && <span>Signed by {lmn.signingPhysicianName}</span>}
              {lmn.daysUntilExpiry !== undefined && lmn.daysUntilExpiry > 0 && (
                <span className={lmn.daysUntilExpiry <= 30 ? 'text-orange-600 font-medium' : ''}>
                  {lmn.daysUntilExpiry} days remaining
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {canSign && (
              <button
                onClick={() => setShowSignDialog(true)}
                className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
              >
                Sign LMN
              </button>
            )}
            {canRenew && (
              <a
                href="#/lmn/generate"
                className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark"
              >
                Renew
              </a>
            )}
            {canRevoke && (
              <button className="rounded-lg border border-zone-red/30 px-4 py-2 text-sm font-medium text-zone-red hover:bg-zone-red/5">
                Revoke
              </button>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-warm-gray/50 p-3 text-xs md:grid-cols-4">
          <div>
            <span className="text-text-muted">Document ID</span>
            <p className="font-mono font-medium text-text-primary">{lmn.id}</p>
          </div>
          <div>
            <span className="text-text-muted">Duration</span>
            <p className="font-medium text-text-primary">{lmn.durationDays} days</p>
          </div>
          {lmn.issuedAt && (
            <div>
              <span className="text-text-muted">Issued</span>
              <p className="font-medium text-text-primary">{formatDate(lmn.issuedAt)}</p>
            </div>
          )}
          {lmn.expiresAt && (
            <div>
              <span className="text-text-muted">Expires</span>
              <p className="font-medium text-text-primary">{formatDate(lmn.expiresAt)}</p>
            </div>
          )}
        </div>

        {/* Diagnosis codes */}
        {lmn.diagnosisCodes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lmn.diagnosisCodes.map((code) => (
              <span
                key={code}
                className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600"
              >
                {code}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Signing dialog */}
      {showSignDialog && (
        <div className="mb-6 rounded-xl border border-sage bg-sage/5 p-6">
          <h3 className="text-sm font-semibold text-sage">Sign Letter of Medical Necessity</h3>
          <p className="mt-1 text-xs text-text-muted">
            Select a signature method to certify this LMN.
          </p>

          <div className="mt-4 space-y-2">
            {[
              {
                value: 'manual' as const,
                label: 'Manual Signature',
                desc: 'Mark as manually signed (in-person or uploaded)',
              },
              {
                value: 'docusign' as const,
                label: 'DocuSign',
                desc: 'Send for e-signature via DocuSign',
              },
              {
                value: 'hellosign' as const,
                label: 'HelloSign',
                desc: 'Send for e-signature via HelloSign',
              },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setSignMethod(method.value)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  signMethod === method.value
                    ? 'border-sage bg-white'
                    : 'border-border bg-white hover:bg-warm-gray/50'
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    signMethod === method.value ? 'border-sage' : 'border-border'
                  }`}
                >
                  {signMethod === method.value && (
                    <div className="h-2.5 w-2.5 rounded-full bg-sage" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{method.label}</p>
                  <p className="text-xs text-text-muted">{method.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSign}
              disabled={signing}
              className="flex-1 rounded-lg bg-sage py-2.5 text-sm font-medium text-white hover:bg-sage-dark disabled:opacity-50"
            >
              {signing
                ? 'Processing...'
                : signMethod === 'manual'
                  ? 'Confirm Signature'
                  : 'Send for Signature'}
            </button>
            <button
              onClick={() => setShowSignDialog(false)}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-warm-gray"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document preview */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-6 py-3">
          <h2 className="text-sm font-semibold text-text-primary">Document Preview</h2>
        </div>
        <div className="divide-y divide-border">
          {sections.map((section, i) => (
            <div key={i} className="px-6 py-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {section.heading}
              </h3>
              <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-secondary">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Signature record */}
      {lmn.signedAt && (
        <div className="mt-4 rounded-xl border border-zone-green/30 bg-zone-green/5 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-zone-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-zone-green">
                Signed by {lmn.signingPhysicianName}
              </p>
              <p className="text-xs text-text-muted">
                {formatDate(lmn.signedAt)} via{' '}
                {lmn.signatureMethod === 'manual' ? 'manual signature' : lmn.signatureMethod}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
