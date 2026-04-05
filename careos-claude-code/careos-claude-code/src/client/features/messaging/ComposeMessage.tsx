/**
 * ComposeMessage — New message composer
 *
 * Recipient search with role-based filtering, subject line, and message body.
 */
import { useState } from 'react';

interface Recipient {
  id: string;
  name: string;
  role: string;
  avatarInitials: string;
}

const DEMO_RECIPIENTS: Recipient[] = [
  { id: '1', name: 'Sarah K.', role: 'Conductor', avatarInitials: 'SK' },
  { id: '2', name: 'Dr. Martinez', role: 'Medical Director', avatarInitials: 'DM' },
  { id: '3', name: 'Michael T.', role: 'Time Bank Member', avatarInitials: 'MT' },
  { id: '4', name: 'Linda R.', role: 'Worker-Owner', avatarInitials: 'LR' },
  { id: '5', name: 'Robert M.', role: 'Time Bank Member', avatarInitials: 'RM' },
  { id: '6', name: 'Dorothy P.', role: 'Conductor', avatarInitials: 'DP' },
];

const ROLE_COLORS: Record<string, string> = {
  Conductor: 'bg-sage',
  'Medical Director': 'bg-copper',
  'Time Bank Member': 'bg-blue',
  'Worker-Owner': 'bg-purple',
};

export function ComposeMessage() {
  const [search, setSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const filteredRecipients =
    search.length > 0
      ? DEMO_RECIPIENTS.filter(
          (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.role.toLowerCase().includes(search.toLowerCase()),
        )
      : [];

  function handleSend() {
    if (!selectedRecipient || !message.trim()) return;
    // API call will be wired later
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage/10">
            <svg
              className="h-6 w-6 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading text-lg font-semibold text-text-primary">Message Sent</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Your message to {selectedRecipient?.name} has been sent.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href="#/messages"
              className="flex-1 rounded-lg bg-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-sage-dark"
            >
              Back to Messages
            </a>
            <button
              onClick={() => {
                setSent(false);
                setMessage('');
                setSelectedRecipient(null);
                setSearch('');
              }}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm text-text-secondary hover:bg-warm-gray"
            >
              New Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 md:px-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <a href="#/messages" className="text-text-muted hover:text-text-secondary">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 className="font-heading text-lg font-semibold text-text-primary">New Message</h1>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        {/* To field */}
        <div className="border-b border-border px-4 py-3">
          <label className="text-xs font-medium text-text-muted">To</label>
          {selectedRecipient ? (
            <div className="mt-1 flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white ${
                  ROLE_COLORS[selectedRecipient.role] ?? 'bg-warm-gray'
                }`}
              >
                {selectedRecipient.avatarInitials}
              </div>
              <span className="text-sm font-medium text-text-primary">
                {selectedRecipient.name}
              </span>
              <span className="text-xs text-text-muted">{selectedRecipient.role}</span>
              <button
                onClick={() => {
                  setSelectedRecipient(null);
                  setSearch('');
                }}
                className="ml-auto text-text-muted hover:text-text-secondary"
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
          ) : (
            <div className="relative mt-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or role..."
                className="w-full text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />

              {/* Search results dropdown */}
              {filteredRecipients.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-white shadow-lg">
                  {filteredRecipients.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedRecipient(r);
                        setSearch('');
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-warm-gray/50"
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium text-white ${
                          ROLE_COLORS[r.role] ?? 'bg-warm-gray'
                        }`}
                      >
                        {r.avatarInitials}
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-text-primary">
                          {r.name}
                        </span>
                        <span className="block text-[10px] text-text-muted">{r.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message body */}
        <div className="px-4 py-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={8}
            className="w-full resize-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-[10px] text-text-muted">
            Messages are encrypted and only visible to participants.
          </p>
          <button
            onClick={handleSend}
            disabled={!selectedRecipient || !message.trim()}
            className="rounded-lg bg-sage px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:bg-warm-gray disabled:text-text-muted"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
