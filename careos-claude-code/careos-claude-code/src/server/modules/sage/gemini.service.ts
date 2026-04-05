/**
 * Gemini Service — AI backbone for Sage RAG
 *
 * Wraps @google/generative-ai SDK for:
 *   1. Embeddings (text-embedding-004) — vector search queries
 *   2. Chat completions (gemini-2.0-flash) — Sage responses with RAG context
 *   3. Omaha code extraction — auto-coding care conversations
 *
 * Jacob: Install `npm install @google/generative-ai` and set GEMINI_API_KEY in .env
 */
import { logger } from '../../common/logger.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GeminiEmbeddingResult {
  values: number[];
  model: string;
}

export interface OmahaCodeExtraction {
  code: number;
  problem: string;
  intervention: string;
  confidence: number;
}

export interface GeminiChatOptions {
  systemPrompt: string;
  userMessage: string;
  knowledgeContext?: string[];
  conversationHistory?: Array<{ role: 'user' | 'model'; content: string }>;
  maxTokens?: number;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const EMBEDDING_MODEL = 'text-embedding-004';
const CHAT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const EMBEDDING_DIMENSION = 768; // text-embedding-004 output dimension

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Gemini service — all AI operations for Sage.
 *
 * NOTE: This is a skeleton. The actual @google/generative-ai SDK calls are
 * stubbed with TODO markers for Jacob to wire. The service works without
 * Gemini installed — it falls back to empty results so the app compiles
 * and runs in demo mode.
 */
export const geminiService = {
  /** Check if Gemini is configured (API key present) */
  isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  },

  /**
   * Generate embedding vector for a text query.
   * Used for vector search against sage_knowledge table.
   *
   * Jacob: Wire this with:
   *   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
   *   const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
   *   const result = await model.embedContent(text);
   *   return result.embedding.values;
   */
  async embed(text: string): Promise<GeminiEmbeddingResult> {
    if (!this.isConfigured()) {
      logger.warn('Gemini not configured — returning zero vector for embed()');
      return {
        values: new Array(EMBEDDING_DIMENSION).fill(0),
        model: EMBEDDING_MODEL,
      };
    }

    // TODO: Jacob — Replace with actual Gemini SDK call
    // const { GoogleGenerativeAI } = await import('@google/generative-ai');
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    // const result = await model.embedContent(text);
    // return { values: result.embedding.values, model: EMBEDDING_MODEL };

    logger.info({ textLength: text.length, model: EMBEDDING_MODEL }, 'Gemini embed (stub)');
    return {
      values: new Array(EMBEDDING_DIMENSION).fill(0),
      model: EMBEDDING_MODEL,
    };
  },

  /**
   * Chat completion with system prompt, RAG context, and conversation history.
   *
   * Pipeline:
   *   1. Build system prompt (Sage personality + care context)
   *   2. Inject top-K knowledge chunks from vector search
   *   3. Include last 5 conversation turns for continuity
   *   4. Generate response via Gemini Flash
   *
   * Jacob: Wire this with:
   *   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
   *   const chat = model.startChat({ history, systemInstruction });
   *   const result = await chat.sendMessage(userMessage);
   *   return result.response.text();
   */
  async chat(options: GeminiChatOptions): Promise<string> {
    const { systemPrompt, userMessage, knowledgeContext = [], conversationHistory = [] } = options;

    if (!this.isConfigured()) {
      logger.warn('Gemini not configured — returning fallback for chat()');
      return (
        "I hear you. I'm Sage, your care companion from co-op.care. " +
        "I'm currently running in demo mode — when fully connected, I'll be able to give you " +
        'personalized guidance based on your care situation. ' +
        'Would you like to try a quick check-in or schedule a call with a Care Navigator?'
      );
    }

    // Build the full prompt with RAG context
    const contextBlock =
      knowledgeContext.length > 0
        ? `\n\nRelevant knowledge:\n${knowledgeContext.join('\n---\n')}`
        : '';

    const historyBlock =
      conversationHistory.length > 0
        ? `\n\nRecent conversation:\n${conversationHistory
            .slice(-5) // Last 5 turns for context window management
            .map((m) => `${m.role === 'user' ? 'User' : 'Sage'}: ${m.content}`)
            .join('\n')}`
        : '';

    const fullPrompt = `${systemPrompt}${contextBlock}${historyBlock}\n\nUser: ${userMessage}`;

    // TODO: Jacob — Replace with actual Gemini SDK call
    // const { GoogleGenerativeAI } = await import('@google/generative-ai');
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
    // const result = await model.generateContent(fullPrompt);
    // return result.response.text();

    logger.info(
      {
        model: CHAT_MODEL,
        promptLength: fullPrompt.length,
        contextChunks: knowledgeContext.length,
        historyTurns: conversationHistory.length,
      },
      'Gemini chat (stub)',
    );

    return (
      "I hear you. I'm Sage, your care companion from co-op.care. " +
      "I'm currently running in demo mode — when fully connected, I'll be able to give you " +
      'personalized guidance based on your care situation. ' +
      'Would you like to try a quick check-in or schedule a call with a Care Navigator?'
    );
  },

  /**
   * Extract Omaha System codes from a care conversation transcript.
   * Used for auto-coding Time Bank visits and Sage conversations.
   *
   * Returns codes with confidence > 0.6 only.
   *
   * Jacob: Wire this with structured output from Gemini Flash:
   *   const prompt = `Extract Omaha System problem codes...`;
   *   const result = await model.generateContent(prompt);
   *   return JSON.parse(result.response.text());
   */
  async extractOmahaCodes(transcript: string): Promise<OmahaCodeExtraction[]> {
    if (!this.isConfigured()) {
      logger.warn('Gemini not configured — returning empty codes for extractOmahaCodes()');
      return [];
    }

    // TODO: Jacob — Replace with actual Gemini SDK call
    // const { GoogleGenerativeAI } = await import('@google/generative-ai');
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
    // const prompt = `You are a clinical documentation specialist.
    // Extract Omaha System problem codes from this care conversation.
    // Return a JSON array of objects with: code (number), problem (string),
    // intervention (string from: Teaching/Guidance/Counseling, Treatments/Procedures,
    // Case Management, Surveillance), confidence (0-1).
    // Only include codes with confidence > 0.6.
    // Conversation:\n${transcript}`;
    // const result = await model.generateContent(prompt);
    // try { return JSON.parse(result.response.text()); } catch { return []; }

    logger.info({ transcriptLength: transcript.length }, 'Gemini extractOmahaCodes (stub)');
    return [];
  },

  /**
   * Vector search against PostgreSQL sage_knowledge table.
   *
   * Jacob: Wire this with PostgreSQL vector query (pgvector):
   *   const embedding = await this.embed(query);
   *   const results = await pool.query(
   *     `SELECT *, 1 - (embedding <=> $1) AS score
   *      FROM sage_knowledge
   *      WHERE 1 - (embedding <=> $1) > 0.7
   *      ORDER BY score DESC
   *      LIMIT $limit`,
   *     { vec: embedding.values, limit: topK }
   *   );
   *   return results;
   */
  async searchKnowledge(
    query: string,
    topK: number = 5,
  ): Promise<
    Array<{
      title: string;
      content: string;
      category: string;
      score: number;
    }>
  > {
    if (!this.isConfigured()) {
      logger.warn('Gemini not configured — returning empty results for searchKnowledge()');
      return [];
    }

    // TODO: Jacob — Wire PostgreSQL vector search here (pgvector)
    logger.info({ queryLength: query.length, topK }, 'Gemini searchKnowledge (stub)');
    return [];
  },
};

// ---------------------------------------------------------------------------
// Constants exported for other modules
// ---------------------------------------------------------------------------

export { EMBEDDING_DIMENSION, EMBEDDING_MODEL, CHAT_MODEL };
