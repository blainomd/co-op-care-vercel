/**
 * MessageView — Single conversation thread with real-time messages
 *
 * Shows message bubbles, read receipts, and compose input.
 * WebSocket will be wired in later for real-time delivery.
 */
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  readAt?: string;
}

const CURRENT_USER_ID = 'user-1';

const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'user-2',
    senderName: 'Sarah K.',
    content: 'Hi! I wanted to let you know that Mom really enjoyed your visit yesterday.',
    timestamp: '10:32 AM',
    isOwn: false,
  },
  {
    id: '2',
    senderId: 'user-2',
    senderName: 'Sarah K.',
    content: 'She kept talking about the gardening stories you shared. 🌱',
    timestamp: '10:33 AM',
    isOwn: false,
  },
  {
    id: '3',
    senderId: CURRENT_USER_ID,
    senderName: 'You',
    content:
      'That makes me so happy! Margaret is wonderful to spend time with. She taught me about growing tomatoes!',
    timestamp: '10:45 AM',
    isOwn: true,
    readAt: '10:46 AM',
  },
  {
    id: '4',
    senderId: 'user-2',
    senderName: 'Sarah K.',
    content: 'Would you be available again this Thursday? Same time works great for us.',
    timestamp: '11:02 AM',
    isOwn: false,
  },
  {
    id: '5',
    senderId: CURRENT_USER_ID,
    senderName: 'You',
    content:
      "Thursday at 2pm works perfectly for me. I'll bring some seed catalogs she might enjoy!",
    timestamp: '11:15 AM',
    isOwn: true,
    readAt: '11:16 AM',
  },
  {
    id: '6',
    senderId: 'user-2',
    senderName: 'Sarah K.',
    content: 'Thanks so much for visiting Mom yesterday! She loved it.',
    timestamp: '2 min ago',
    isOwn: false,
  },
];

export function MessageView() {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!draft.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      content: draft.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
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
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-xs font-medium text-white">
          SK
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Sarah K.</h2>
          <p className="text-[10px] text-text-muted">Conductor</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.isOwn
                    ? 'rounded-br-md bg-sage text-white'
                    : 'rounded-bl-md bg-white border border-border text-text-primary'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div className={`mt-1 flex items-center gap-1 ${msg.isOwn ? 'justify-end' : ''}`}>
                  <span
                    className={`text-[10px] ${msg.isOwn ? 'text-white/60' : 'text-text-muted'}`}
                  >
                    {msg.timestamp}
                  </span>
                  {msg.isOwn && msg.readAt && (
                    <svg
                      className="h-3 w-3 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Compose */}
      <div className="border-t border-border bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-white transition-colors hover:bg-sage-dark disabled:bg-warm-gray disabled:text-text-muted"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-[10px] text-text-muted">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
