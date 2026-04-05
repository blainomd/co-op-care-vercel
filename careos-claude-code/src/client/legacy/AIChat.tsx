import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { C, ff, fs, useIsMobile } from "../theme";

let ai: GoogleGenAI | null = null;
try {
  // We use import.meta.env for Vite client-side env vars
  // Wait, the system instructions say: "Always use process.env.GEMINI_API_KEY for the Gemini API. This is the only way to access the Gemini API key."
  // Vite replaces process.env with import.meta.env, but let's try process.env first as instructed.
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize Gemini", e);
}

export default function AIChat() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: "Hi! I'm the co-op.care Ambient Guide. I'm here to help you explore our platform.\n\nWhat would you like to do?\n• Learn how our worker-owned cooperative works\n• Understand the Time Bank & Care UBI\n• See how the LMN saves 28-36% in taxes\n• Explore the Product Strategy Map\n• Find out how to join as a Founding Family\n\nJust tell me what you're curious about!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  // Auto-open the chat after a short delay to act as an ambient guide
  useEffect(() => {
    if (!hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasAutoOpened]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (ai && !chatRef.current) {
      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are the co-op.care Ambient Guide. You are the primary way users interact with the website. Your goal is to proactively guide visitors, explain the cooperative model, and help them navigate the site.

KEY CONCEPTS TO EXPLAIN:
1. The 5 Sources of Care: Unpaid family care, Time Bank neighbors, W-2 Worker-Owners, Community Wellness, and Medical Oversight.
2. The Time Bank: Neighbors helping neighbors. Earn hours by helping, spend hours when you need help. 1 hour = 1 hour.
3. The LMN (Letter of Medical Necessity): Written by our Medical Director, it makes community wellness (tai chi, nutrition, etc.) HSA/FSA eligible, saving families 28-36% in taxes.
4. Worker-Owned: We bypass legacy agencies. Families pay less ($35/hr), workers earn more ($25-28/hr + equity).
5. The Omaha System: We use this clinical taxonomy to map community care to ICD-10 codes for hospital integration and predictive modeling.

WEBSITE NAVIGATION (Offer these links to users):
- /#website : The main landing page for families.
- /#product : The Product Strategy Map (for investors/builders).
- /#enzyme : The Behavioral Design Thesis (psychology of the Time Bank).
- /#ubi : The Care UBI policy thesis.
- /#master : The Master Synthesis (how it all connects).
- /#dashboard : The Conductor (family caregiver) dashboard prototype.

BEHAVIOR:
- Be warm, empathetic, and concise.
- Proactively ask questions to guide the user ("Would you like me to explain X or take you to page Y?").
- If a user asks about a specific topic, explain it briefly and offer the relevant link.
- Keep answers under 3 short paragraphs. Use bullet points for readability.`,
        }
      });
    }
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !ai || !chatRef.current) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again later or email us directly at blaine@co-op.care!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ai) return null; // Hide if no API key is available

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: C.sage,
            color: C.w,
            border: "none",
            borderRadius: "50%",
            width: 60,
            height: 60,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontSize: 24 }}>✨</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: isMobile ? 0 : 24,
          right: isMobile ? 0 : 24,
          width: isMobile ? "100%" : 420,
          height: isMobile ? "100%" : 680,
          maxHeight: "100%",
          background: C.bg,
          borderRadius: isMobile ? 0 : 16,
          boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: isMobile ? "none" : `1px solid ${C.border}`,
          animation: "fadeUp 0.3s ease-out"
        }}>
          {/* Header */}
          <div style={{ background: C.sage, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", color: C.w }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>✨</span>
              <div>
                <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 15 }}>AI Care Navigator</div>
                <div style={{ fontFamily: fs, fontSize: 11, opacity: 0.8 }}>co-op.care support</div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", border: "none", color: C.w, fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16, background: C.cream }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? C.sage : C.w,
                color: msg.role === 'user' ? C.w : C.t1,
                padding: "12px 16px",
                borderRadius: msg.role === 'user' ? "16px 16px 0 16px" : "16px 16px 16px 0",
                maxWidth: "85%",
                fontFamily: fs,
                fontSize: 14,
                lineHeight: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: msg.role === 'model' ? `1px solid ${C.border}` : "none"
              }}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', background: C.w, padding: "12px 16px", borderRadius: "16px 16px 16px 0", border: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: fs, fontSize: 14, color: C.t3 }}>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: 16, background: C.w, borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: "12px 16px", borderRadius: 24, border: `1px solid ${C.border}`, fontFamily: fs, fontSize: 14, outline: "none" }}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{ background: input.trim() && !isLoading ? C.sage : C.border, color: C.w, border: "none", width: 44, height: 44, borderRadius: "50%", cursor: input.trim() && !isLoading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s ease" }}
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
