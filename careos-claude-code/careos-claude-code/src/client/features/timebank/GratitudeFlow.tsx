/**
 * GratitudeFlow — Post-task gratitude and feedback flow
 *
 * After a Time Bank task is completed, both parties rate and thank each other.
 * Feeds the streak system and the reputation/trust system.
 * Includes Omaha problem tagging and KBS observation prompts.
 */
import { useState } from 'react';

// ── Types ──

interface GratitudeTag {
  label: string;
  selected: boolean;
}

interface GratitudeMessage {
  id: string;
  senderName: string;
  recipientName: string;
  rating: number;
  message: string;
  timeAgo: string;
  taskType: string;
  taskLabel: string;
}

interface OmahaProblem {
  code: string;
  label: string;
}

// ── Mock Data ──

const OMAHA_PROBLEMS: OmahaProblem[] = [
  { code: '#06', label: 'Social Contact' },
  { code: '#05', label: 'Communication w/ Community Resources' },
  { code: '#28', label: 'Digestion-Hydration' },
  { code: '#03', label: 'Residence' },
  { code: '#02', label: 'Sanitation' },
];

const INITIAL_TAGS: GratitudeTag[] = [
  { label: 'Kind', selected: false },
  { label: 'Reliable', selected: false },
  { label: 'Skilled', selected: false },
  { label: 'Patient', selected: false },
  { label: 'Fun', selected: false },
  { label: 'Helpful', selected: false },
];

const MOCK_WALL: GratitudeMessage[] = [
  {
    id: '1',
    senderName: 'Margaret H.',
    recipientName: 'David L.',
    rating: 5,
    message: 'David drove me to my appointment and waited the whole time. So thoughtful!',
    timeAgo: '2 hours ago',
    taskType: 'rides',
    taskLabel: 'Ride',
  },
  {
    id: '2',
    senderName: 'Tom R.',
    recipientName: 'Sarah K.',
    rating: 5,
    message: 'Sarah made the most wonderful soup and stayed to chat. Made my whole week.',
    timeAgo: '5 hours ago',
    taskType: 'meals',
    taskLabel: 'Meal Prep',
  },
  {
    id: '3',
    senderName: 'Linda P.',
    recipientName: 'James M.',
    rating: 4,
    message: 'James helped me set up my new tablet so I can video call my grandkids.',
    timeAgo: '1 day ago',
    taskType: 'tech_support',
    taskLabel: 'Tech Support',
  },
  {
    id: '4',
    senderName: 'Robert C.',
    recipientName: 'Emily W.',
    rating: 5,
    message: 'Emily is the best companion. We played cards and she remembered my favorite game.',
    timeAgo: '1 day ago',
    taskType: 'companionship',
    taskLabel: 'Companionship',
  },
  {
    id: '5',
    senderName: 'Dorothy A.',
    recipientName: 'Michael B.',
    rating: 5,
    message: 'Michael got everything on my list and even found the brand I like. Thank you!',
    timeAgo: '2 days ago',
    taskType: 'grocery_run',
    taskLabel: 'Grocery Run',
  },
  {
    id: '6',
    senderName: 'Helen F.',
    recipientName: 'Nancy G.',
    rating: 4,
    message: 'Nancy cleared the snow from my walkway before I even asked. True neighbor.',
    timeAgo: '3 days ago',
    taskType: 'yard_work',
    taskLabel: 'Yard Work',
  },
];

const TASK_TYPE_COLORS: Record<string, string> = {
  rides: 'bg-blue/10 text-blue',
  meals: 'bg-copper/10 text-copper',
  tech_support: 'bg-blue/10 text-blue',
  companionship: 'bg-sage/10 text-sage',
  grocery_run: 'bg-copper/10 text-copper',
  yard_work: 'bg-sage/10 text-sage',
  housekeeping: 'bg-gold/10 text-gold',
  phone_companionship: 'bg-purple/10 text-purple',
  errands: 'bg-gold/10 text-gold',
  pet_care: 'bg-sage/10 text-sage',
  admin_help: 'bg-purple/10 text-purple',
  teaching: 'bg-blue/10 text-blue',
};

const KBS_PROMPTS = [
  'Seemed in good spirits today',
  'Mentioned feeling lonely or isolated',
  'Appeared more tired than usual',
  'Home looked well-maintained',
  'Mentioned difficulty with meals or eating',
  'Seemed confused or forgetful',
  'Expressed interest in more social activities',
  'No concerns to report',
];

const MOCK_STATS = {
  thankYousSent: 24,
  averageRating: 4.8,
  thankYousReceived: 31,
};

// ── Component ──

export function GratitudeFlow() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState<GratitudeTag[]>(INITIAL_TAGS);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [kbsObservations, setKbsObservations] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (label: string) => {
    setTags((prev) => prev.map((t) => (t.label === label ? { ...t, selected: !t.selected } : t)));
  };

  const toggleKbs = (prompt: string) => {
    setKbsObservations((prev) =>
      prev.includes(prompt) ? prev.filter((p) => p !== prompt) : [...prev, prompt],
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Gratitude &amp; Feedback</h1>
        <p className="text-sm text-muted">Thank your helper and share your experience</p>
      </div>

      {/* ── Rate Your Experience ── */}
      {!submitted ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-primary">Rate Your Experience</h2>
            <p className="mt-1 text-xs text-secondary">
              How was your Time Bank exchange with David L.?
            </p>

            {/* Star Rating */}
            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <svg
                    className={`h-8 w-8 ${star <= displayRating ? 'text-gold' : 'text-warm-gray/30'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-gold">
                  {rating === 5
                    ? 'Outstanding!'
                    : rating === 4
                      ? 'Great'
                      : rating === 3
                        ? 'Good'
                        : rating === 2
                          ? 'Fair'
                          : 'Needs Improvement'}
                </span>
              )}
            </div>

            {/* Thank-you Message */}
            <div className="mt-4">
              <label htmlFor="gratitude-message" className="text-xs font-medium text-secondary">
                Thank-you message (optional)
              </label>
              <textarea
                id="gratitude-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a kind word about your experience..."
                rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-warm-gray/5 p-3 text-sm text-primary placeholder:text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>

            {/* Gratitude Tags */}
            <div className="mt-3">
              <p className="text-xs font-medium text-secondary">Quick tags</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      tag.selected
                        ? 'bg-sage text-white'
                        : 'border border-border bg-white text-secondary hover:border-sage hover:text-sage'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Omaha Problem Tagging ── */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-sage"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              <h2 className="text-sm font-semibold text-primary">Problem Area Addressed</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              Which area of need did this task help with? (Omaha System)
            </p>
            <div className="mt-3 space-y-1.5">
              {OMAHA_PROBLEMS.map((problem) => (
                <button
                  key={problem.code}
                  type="button"
                  onClick={() =>
                    setSelectedProblem((prev) => (prev === problem.code ? null : problem.code))
                  }
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedProblem === problem.code
                      ? 'border border-sage/30 bg-sage/5 text-sage'
                      : 'border border-border bg-white text-secondary hover:bg-warm-gray/5'
                  }`}
                >
                  <span className="text-[10px] font-mono text-muted">{problem.code}</span>
                  <span className="font-medium">{problem.label}</span>
                  {selectedProblem === problem.code && (
                    <svg
                      className="ml-auto h-4 w-4 text-sage"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── KBS Observation ── */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-copper"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h2 className="text-sm font-semibold text-primary">KBS Observation</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              Did you notice anything about the care recipient? (Select all that apply)
            </p>
            <div className="mt-3 space-y-1.5">
              {KBS_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => toggleKbs(prompt)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    kbsObservations.includes(prompt)
                      ? 'border border-copper/30 bg-copper/5 text-copper'
                      : 'border border-border bg-white text-secondary hover:bg-warm-gray/5'
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      kbsObservations.includes(prompt) ? 'border-copper bg-copper' : 'border-border'
                    }`}
                  >
                    {kbsObservations.includes(prompt) && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Submit Button ── */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
              rating > 0
                ? 'bg-sage text-white hover:bg-sage/90'
                : 'cursor-not-allowed bg-warm-gray/20 text-muted'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              Send Thanks
            </span>
          </button>
        </div>
      ) : (
        /* ── Confirmation ── */
        <div className="rounded-xl border-2 border-sage bg-sage/5 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage">
            <svg
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-primary">Thanks Sent!</h2>
          <p className="mt-1 text-sm text-secondary">
            Your gratitude has been shared with David L. and added to the community wall.
          </p>
          <div className="mt-3 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-5 w-5 ${star <= rating ? 'text-gold' : 'text-warm-gray/30'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          {tags.filter((t) => t.selected).length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {tags
                .filter((t) => t.selected)
                .map((t) => (
                  <span
                    key={t.label}
                    className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-medium text-white"
                  >
                    {t.label}
                  </span>
                ))}
            </div>
          )}
          <p className="mt-3 text-xs text-sage">
            +1 to your streak! Keep helping to unlock milestones.
          </p>
        </div>
      )}

      {/* ── Gratitude Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-primary">{MOCK_STATS.thankYousSent}</p>
          <p className="text-[11px] text-muted">Thanks Sent</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-2xl font-bold text-gold">{MOCK_STATS.averageRating}</p>
            <svg className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-[11px] text-muted">Avg Rating Given</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <p className="text-2xl font-bold text-sage">{MOCK_STATS.thankYousReceived}</p>
          <p className="text-[11px] text-muted">Thanks Received</p>
        </div>
      </div>

      {/* ── Community Gratitude Wall ── */}
      <div>
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <h2 className="text-sm font-semibold text-primary">Community Gratitude Wall</h2>
        </div>
        <p className="mt-0.5 text-xs text-muted">Recent thank-you messages from the community</p>

        <div className="mt-3 space-y-2">
          {MOCK_WALL.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-white p-4 transition-colors hover:border-sage/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {/* Sender avatar placeholder */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-xs font-bold text-sage">
                    {item.senderName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-primary">
                      <span className="font-semibold">{item.senderName}</span>
                      <span className="text-muted"> thanked </span>
                      <span className="font-semibold">{item.recipientName}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-3 w-3 ${star <= item.rating ? 'text-gold' : 'text-warm-gray/20'}`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted">{item.timeAgo}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    TASK_TYPE_COLORS[item.taskType] ?? 'bg-warm-gray/10 text-muted'
                  }`}
                >
                  {item.taskLabel}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-secondary">
                &ldquo;{item.message}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted">
        Gratitude ratings build your reputation score and contribute to your streak milestones. KBS
        observations help the care team track well-being over time.
      </p>
    </div>
  );
}
