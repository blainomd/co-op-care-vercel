/**
 * CRI Review Queue — Medical Director review dashboard
 *
 * Shows pending CRI assessments awaiting MD review.
 * MD can approve, request revisions, or mark as reviewed.
 * 24-hour SLA indicator on each pending assessment.
 */
import { useState } from 'react';
import type { CRIAcuity, CRIReviewStatus } from '@shared/types/assessment.types';

/** Mock pending reviews — will be replaced with API call */
const MOCK_REVIEWS: PendingReview[] = [
  {
    id: 'cri_001',
    careRecipientName: 'Margaret Thompson',
    assessorName: 'Sarah Chen',
    rawScore: 52.4,
    acuity: 'high',
    lmnEligible: true,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
    factors: [
      { name: 'Cognitive Status', weight: 1.2, score: 4 },
      { name: 'Functional Mobility', weight: 1.2, score: 3 },
      { name: 'ADL Independence', weight: 1.0, score: 4 },
      { name: 'IADL Capacity', weight: 0.8, score: 5 },
      { name: 'Medication Complexity', weight: 1.0, score: 3 },
      { name: 'Behavioral Challenges', weight: 1.2, score: 4 },
      { name: 'Fall Risk', weight: 1.0, score: 4 },
      { name: 'Nutritional Status', weight: 0.8, score: 2 },
      { name: 'Social Support Network', weight: 0.8, score: 3 },
      { name: 'Caregiver Burnout Level', weight: 1.0, score: 4 },
      { name: 'Home Environment Safety', weight: 0.8, score: 3 },
      { name: 'Emergency Preparedness', weight: 0.6, score: 2 },
      { name: 'Financial Resources', weight: 0.6, score: 2 },
      { name: 'Care Plan Adherence History', weight: 0.8, score: 3 },
    ],
  },
  {
    id: 'cri_002',
    careRecipientName: 'Robert Williams',
    assessorName: 'Maria Lopez',
    rawScore: 34.6,
    acuity: 'moderate',
    lmnEligible: false,
    submittedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hrs ago
    factors: [
      { name: 'Cognitive Status', weight: 1.2, score: 2 },
      { name: 'Functional Mobility', weight: 1.2, score: 3 },
      { name: 'ADL Independence', weight: 1.0, score: 2 },
      { name: 'IADL Capacity', weight: 0.8, score: 3 },
      { name: 'Medication Complexity', weight: 1.0, score: 3 },
      { name: 'Behavioral Challenges', weight: 1.2, score: 1 },
      { name: 'Fall Risk', weight: 1.0, score: 3 },
      { name: 'Nutritional Status', weight: 0.8, score: 2 },
      { name: 'Social Support Network', weight: 0.8, score: 4 },
      { name: 'Caregiver Burnout Level', weight: 1.0, score: 3 },
      { name: 'Home Environment Safety', weight: 0.8, score: 2 },
      { name: 'Emergency Preparedness', weight: 0.6, score: 3 },
      { name: 'Financial Resources', weight: 0.6, score: 2 },
      { name: 'Care Plan Adherence History', weight: 0.8, score: 3 },
    ],
  },
];

interface Factor {
  name: string;
  weight: number;
  score: number;
}

interface PendingReview {
  id: string;
  careRecipientName: string;
  assessorName: string;
  rawScore: number;
  acuity: CRIAcuity;
  lmnEligible: boolean;
  submittedAt: string;
  factors: Factor[];
}

const ACUITY_STYLES: Record<CRIAcuity, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-zone-green/10', text: 'text-zone-green', label: 'Low' },
  moderate: { bg: 'bg-zone-yellow/10', text: 'text-zone-yellow', label: 'Moderate' },
  high: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'High' },
  critical: { bg: 'bg-zone-red/10', text: 'text-zone-red', label: 'Critical' },
};

const STATUS_STYLES: Record<CRIReviewStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-zone-yellow/10', text: 'text-zone-yellow', label: 'Pending' },
  reviewed: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Reviewed' },
  approved: { bg: 'bg-zone-green/10', text: 'text-zone-green', label: 'Approved' },
  revision_requested: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Revision Requested' },
};

function getHoursAgo(isoDate: string): number {
  return Math.round((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60));
}

function getSLAStatus(submittedAt: string): { urgent: boolean; label: string; color: string } {
  const hours = getHoursAgo(submittedAt);
  if (hours >= 24) return { urgent: true, label: 'SLA BREACHED', color: 'text-zone-red' };
  if (hours >= 20)
    return { urgent: true, label: `${24 - hours}h remaining`, color: 'text-orange-600' };
  return { urgent: false, label: `${24 - hours}h remaining`, color: 'text-text-muted' };
}

export function CRIReviewQueue() {
  const [reviews] = useState<PendingReview[]>(MOCK_REVIEWS);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewedIds, setReviewedIds] = useState<Record<string, CRIReviewStatus>>({});

  function handleReview(id: string, status: CRIReviewStatus) {
    setReviewedIds((prev) => ({ ...prev, [id]: status }));
    setSelectedReview(null);
    setReviewNotes('');
    // API call will be wired in later
  }

  const pendingCount = reviews.filter((r) => !reviewedIds[r.id]).length;

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            CRI Review Queue
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {pendingCount} assessment{pendingCount !== 1 ? 's' : ''} pending review (24h SLA)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage">
            Medical Director
          </span>
        </div>
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const status = reviewedIds[review.id];
          const sla = getSLAStatus(review.submittedAt);
          const acuityStyle = ACUITY_STYLES[review.acuity];
          const isExpanded = selectedReview?.id === review.id;

          if (status) {
            const statusStyle = STATUS_STYLES[status];
            return (
              <div
                key={review.id}
                className="rounded-xl border border-border bg-warm-gray/50 p-4 opacity-70"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-text-primary">
                      {review.careRecipientName}
                    </span>
                    <span className="ml-2 text-xs text-text-muted">Score: {review.rawScore}</span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={review.id}
              className={`rounded-xl border ${sla.urgent ? 'border-orange-300' : 'border-border'} bg-white`}
            >
              {/* Card header */}
              <button
                onClick={() => setSelectedReview(isExpanded ? null : review)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {review.careRecipientName}
                    </h3>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Assessed by {review.assessorName} &middot; {getHoursAgo(review.submittedAt)}h
                      ago
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.lmnEligible && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                        LMN
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${acuityStyle.bg} ${acuityStyle.text}`}
                    >
                      {acuityStyle.label}
                    </span>
                    <span className={`text-xs font-medium ${sla.color}`}>{sla.label}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`text-lg font-bold ${acuityStyle.text}`}>{review.rawScore}</span>
                  <span className="text-xs text-text-muted">Raw Score (14.4 – 72.0)</span>
                  <span className="ml-auto text-xs text-text-muted">
                    {isExpanded ? 'Collapse' : 'Expand to review'}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  {/* Factor grid */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {review.factors.map((factor) => (
                      <div
                        key={factor.name}
                        className="flex items-center justify-between rounded-lg bg-warm-gray/50 px-3 py-2"
                      >
                        <div>
                          <span className="text-xs font-medium text-text-primary">
                            {factor.name}
                          </span>
                          <span className="ml-1 text-[10px] text-text-muted">
                            ({factor.weight}x)
                          </span>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                            factor.score <= 2
                              ? 'bg-zone-green/10 text-zone-green'
                              : factor.score <= 3
                                ? 'bg-zone-yellow/10 text-zone-yellow'
                                : factor.score <= 4
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-zone-red/10 text-zone-red'
                          }`}
                        >
                          {factor.score}/5
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Review notes */}
                  <div className="mb-4">
                    <label className="mb-1 block text-xs font-medium text-text-secondary">
                      Review Notes (optional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Clinical observations, concerns, or revision instructions..."
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                      rows={3}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(review.id, 'approved')}
                      className="flex-1 rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
                    >
                      Approve{review.lmnEligible ? ' + Generate LMN' : ''}
                    </button>
                    <button
                      onClick={() => handleReview(review.id, 'reviewed')}
                      className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-warm-gray"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleReview(review.id, 'revision_requested')}
                      className="rounded-lg border border-orange-300 px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50"
                    >
                      Request Revision
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {pendingCount === 0 && (
        <div className="mt-8 rounded-xl border border-border bg-white p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zone-green/10">
            <svg
              className="h-6 w-6 text-zone-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-text-primary">All caught up</h3>
          <p className="mt-1 text-xs text-text-muted">No pending CRI assessments to review</p>
        </div>
      )}
    </div>
  );
}
