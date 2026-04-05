/**
 * Claude-Powered Profile Extraction
 *
 * Instead of regex matching "my mom is 82", use Claude to extract
 * structured profile data from natural conversation. Much smarter.
 *
 * Called after each Sage conversation turn. Claude extracts:
 * - Care recipient: name, age, conditions, medications, mobility, state
 * - Caregiver: name, relationship, burnout signals
 * - Omaha problems detected in conversation
 *
 * Falls back to regex extraction if Claude is unavailable.
 */
import { logger } from '../common/logger.js';

interface ExtractedProfile {
  careRecipientName?: string;
  careRecipientAge?: number;
  conditions?: string[];
  medications?: string[];
  mobilityLevel?: 'independent' | 'assisted' | 'dependent' | 'wheelchair';
  state?: string;
  caregiverName?: string;
  caregiverRelationship?: string;
  omahaProblems?: string[];
  burnoutSignals?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let anthropicClient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getClient(): Promise<any | null> {
  if (anthropicClient) return anthropicClient;
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) return null;
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey });
    return anthropicClient;
  } catch {
    return null;
  }
}

const EXTRACTION_PROMPT = `You are a clinical data extraction system for a home care platform. Extract structured data from this family caregiver conversation.

Return ONLY a JSON object (no markdown, no explanation) with these fields. Omit any field where the information is not present:
{
  "careRecipientName": "string — first name of the person receiving care",
  "careRecipientAge": number,
  "conditions": ["list of medical conditions mentioned"],
  "medications": ["list of medications mentioned"],
  "mobilityLevel": "independent | assisted | dependent | wheelchair",
  "state": "US state (2-letter code)",
  "caregiverName": "string — the person talking/caregiving",
  "caregiverRelationship": "spouse | adult child | sibling | friend | other",
  "omahaProblems": ["Omaha System problem codes detected: H18=mobility, H27=cognition, B36=physical activity, B39=health care supervision, B40=medication regimen, P06=social contact, E03=residence"],
  "burnoutSignals": ["any signs of caregiver burnout: exhaustion, sleep disruption, isolation, guilt, overwhelm"]
}`;

/**
 * Extract structured profile data from a conversation message using Claude.
 * Falls back to empty object if Claude is unavailable.
 */
export async function extractProfileWithClaude(
  message: string,
  conversationHistory?: Array<{ role: string; content: string }>,
): Promise<ExtractedProfile> {
  const client = await getClient();
  if (!client) return {};

  try {
    // Build context from recent history
    let context = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-6);
      context =
        'Recent conversation:\n' + recent.map((h) => `${h.role}: ${h.content}`).join('\n') + '\n\n';
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', // Fast + cheap for extraction
      max_tokens: 500,
      system: EXTRACTION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${context}Latest message from family caregiver:\n"${message}"`,
        },
      ],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    if (!text) return {};

    // Parse JSON response
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const extracted = JSON.parse(cleaned) as ExtractedProfile;

    logger.info(
      {
        fieldsExtracted: Object.keys(extracted).filter(
          (k) => extracted[k as keyof ExtractedProfile] !== undefined,
        ).length,
        hasConditions: !!extracted.conditions?.length,
        hasOmaha: !!extracted.omahaProblems?.length,
      },
      'Claude profile extraction complete',
    );

    return extracted;
  } catch (err) {
    logger.warn({ err }, 'Claude profile extraction failed — using regex fallback');
    return {};
  }
}
