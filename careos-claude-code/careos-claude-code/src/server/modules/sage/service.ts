/**
 * Sage Service — Conversational AI for caregiver support
 *
 * Architecture: Claude Sonnet API with keyword engine fallback.
 * If ANTHROPIC_API_KEY is set, Sage uses Claude for rich responses.
 * If not set or API fails, falls back to local keyword engine.
 */
import { logger } from '../../common/logger.js';
import { stripPhi } from './phi-strip.js';
import type { SageChatInput, SageIntentInput, SageResponse, ActionButton } from './schemas.js';
import { generateActions, type SageAction } from './action-engine.js';
import { buildSystemPrompt } from './system-prompt.js';

// ─── Agent Integration ──────────────────────────────────────────────────
// Sage is the sensory organ — it emits events that drive the entire pipeline.
import { eventBus } from '../../agents/event-bus.js';
import {
  getNextAssessmentQuestion,
  recordAssessmentResponse,
  finalizeAssessment,
} from '../../agents/assessor.agent.js';
import { extractProfileWithClaude } from '../../agents/profile-extractor.js';

// Lazy-init Claude client (only if API key is available)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let anthropicClient: any = null;

async function getClaudeClient() {
  if (anthropicClient) return anthropicClient;
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    logger.info('ANTHROPIC_API_KEY not set — Sage using keyword engine only');
    return null;
  }
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey });
    logger.info('Claude API client initialized for Sage');
    return anthropicClient;
  } catch (err) {
    logger.warn({ err }, 'Failed to initialize Claude client — falling back to keyword engine');
    return null;
  }
}

async function callClaude(
  message: string,
  history?: Array<{ role: string; content: string }>,
  profile?: Record<string, unknown>,
): Promise<{ content: string; followups?: Array<{ label: string; message: string }> } | null> {
  const client = await getClaudeClient();
  if (!client) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const systemPrompt = buildSystemPrompt(profile as any);

    // Build messages array from history + current message
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (history && history.length > 0) {
      for (const h of history.slice(-10)) {
        // Last 10 messages for context
        messages.push({ role: h.role as 'user' | 'assistant', content: h.content });
      }
    }
    messages.push({ role: 'user', content: message });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    if (!text) return null;

    logger.info(
      { messageLength: message.length, responseLength: text.length },
      'Claude API response received',
    );

    return { content: text };
  } catch (err) {
    logger.warn({ err }, 'Claude API call failed — falling back to keyword engine');
    return null;
  }
}

/** 12 Sage conversational domains */
type SageDomain =
  | 'intake'
  | 'assessment'
  | 'scheduling'
  | 'timebank'
  | 'care_logging'
  | 'billing'
  | 'emotional_support'
  | 'care_questions'
  | 'emergency'
  | 'community'
  | 'account'
  | 'visit_documentation';

/** Keyword → domain mapping for Phase 1 */
const KEYWORD_MAP: Record<string, SageDomain> = {
  'help with': 'intake',
  'get started': 'intake',
  'sign up': 'intake',
  'new here': 'intake',
  burnout: 'assessment',
  'check-in': 'assessment',
  'how am i': 'assessment',
  stressed: 'assessment',
  overwhelmed: 'assessment',
  schedule: 'scheduling',
  appointment: 'scheduling',
  thursday: 'scheduling',
  'come over': 'scheduling',
  'time bank': 'timebank',
  hours: 'timebank',
  credits: 'timebank',
  balance: 'timebank',
  volunteer: 'timebank',
  'good day': 'care_logging',
  'bad day': 'care_logging',
  'fell today': 'care_logging',
  'mom had': 'care_logging',
  'dad had': 'care_logging',
  hsa: 'billing',
  fsa: 'billing',
  cost: 'billing',
  pay: 'billing',
  'comfort card': 'billing',
  insurance: 'billing',
  lmn: 'billing',
  guilty: 'emotional_support',
  tired: 'emotional_support',
  alone: 'emotional_support',
  "can't do this": 'emotional_support',
  grief: 'emotional_support',
  sundowning: 'care_questions',
  dementia: 'care_questions',
  medication: 'care_questions',
  fall: 'care_questions',
  nutrition: 'care_questions',
  'not breathing': 'emergency',
  'chest pain': 'emergency',
  stroke: 'emergency',
  '911': 'emergency',
  suicid: 'emergency',
  neighbor: 'community',
  'join the co-op': 'community',
  address: 'account',
  password: 'account',
  settings: 'account',
  profile: 'account',
  'care plan': 'billing',
  plans: 'billing',
  'talk to': 'intake',
  'real person': 'intake',
};

/** Classify message to a domain via keyword matching */
function classifyDomain(message: string): SageDomain {
  const lower = message.toLowerCase();
  for (const [keyword, domain] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return domain;
  }
  return 'emotional_support'; // Default: warm, validating response
}

/** Generate domain-specific response */
function generateResponse(domain: SageDomain, message: string): SageResponse {
  switch (domain) {
    case 'emergency':
      return {
        content:
          '**If someone is in immediate danger, please call 911 now.**\n\n' +
          'For a mental health crisis: call **988** (Suicide & Crisis Lifeline)\n' +
          'Crisis text: text **741741**\n\n' +
          "I'm here for support, but trained professionals can help right now.",
        actions: [
          {
            id: 'call-911',
            label: 'Call 911',
            icon: 'emergency',
            actionType: 'navigate',
            payload: 'tel:911',
          },
        ],
      };

    case 'assessment':
      return {
        content:
          "Let's do a quick 30-second check-in. It's just three sliders — " +
          "rate how you've been feeling this past week. Completely private, no judgment.",
        actions: [
          {
            id: 'start-cii',
            label: 'Start Check-In',
            icon: 'stethoscope',
            actionType: 'start-assessment',
          },
        ],
        followups: [
          { label: 'What is this?', message: 'What does the burnout check-in measure?' },
          { label: 'Not now', message: "I don't want to do an assessment right now" },
        ],
      };

    case 'intake':
      return {
        content:
          "I'd love to help you explore what co-op.care can do for your family. " +
          'We can start with a quick check-in to understand your situation, ' +
          'or you can schedule a call with one of our Care Navigators.',
        actions: [
          {
            id: 'start-assessment',
            label: 'Quick Check-In',
            icon: 'stethoscope',
            actionType: 'start-assessment',
          },
          { id: 'schedule', label: 'Schedule a Call', icon: 'phone', actionType: 'contact' },
          { id: 'plans', label: 'See Care Plans', icon: 'clipboard', actionType: 'show-plans' },
        ],
        followups: [
          { label: 'How does it work?', message: 'How does co-op.care work?' },
          { label: 'What does it cost?', message: 'How much does co-op.care cost?' },
        ],
      };

    case 'billing':
      return {
        content:
          'Great question! Most families save **28-36%** by using their HSA/FSA with a physician-signed Letter of Medical Necessity. ' +
          'Our Comfort Card makes it simple — one card, one monthly statement.\n\n' +
          '**Care plans start at ~$550/mo** (5 hrs/week). That drops to **$22-25/hr** after HSA savings.',
        actions: [
          {
            id: 'show-plans',
            label: 'View Care Plans',
            icon: 'clipboard',
            actionType: 'show-plans',
          },
          { id: 'schedule', label: 'Talk to Someone', icon: 'phone', actionType: 'contact' },
        ],
        followups: [
          { label: 'What is an LMN?', message: 'What is a Letter of Medical Necessity?' },
          { label: 'HSA eligibility', message: 'Is home care HSA eligible?' },
        ],
      };

    case 'emotional_support':
      return {
        content:
          "I hear you. What you're feeling — the exhaustion, the guilt, the loneliness — " +
          "that's not weakness. It's what happens when one person carries too much for too long.\n\n" +
          '**You are not failing.** You are doing one of the hardest jobs in the world.',
        followups: [
          { label: 'I need a break', message: 'How can I get some respite?' },
          { label: 'Check my burnout', message: "Let's do the burnout check-in" },
          { label: 'Talk to someone', message: 'I want to talk to a real person' },
        ],
      };

    case 'scheduling':
      return {
        content:
          "I can help with that! Let's find a time that works. " +
          'Our Care Navigators are available Monday through Saturday.',
        actions: [
          { id: 'schedule', label: 'Schedule a Visit', icon: 'phone', actionType: 'contact' },
        ],
        followups: [
          { label: 'How matching works', message: 'How do you match caregivers?' },
          { label: 'Service area', message: 'What area do you serve?' },
        ],
      };

    case 'timebank':
      return {
        content:
          'The Time Bank is how neighbors help neighbors. When you give an hour of help, you earn an hour of credit. ' +
          'When you need help, you spend credits.\n\n' +
          '**Your $100/year membership includes 40 Time Bank hours.** Additional hours are $15/hr.',
        followups: [
          { label: 'How do I earn?', message: 'How do I earn Time Bank credits?' },
          { label: 'What tasks?', message: 'What kind of tasks are in the Time Bank?' },
        ],
      };

    case 'care_questions':
      return {
        content: getSageAnswer(message),
        followups: [
          { label: 'Ask another question', message: 'I have another care question' },
          { label: 'Talk to someone', message: 'I want to talk to a real person' },
        ],
      };

    case 'care_logging':
      return {
        content:
          'Thank you for sharing that. Logging these moments helps us track patterns and ' +
          "adjust your care plan. I've noted this visit.",
        followups: [
          { label: 'Log another', message: 'I want to log another care event' },
          { label: 'View history', message: 'Show me my care log history' },
        ],
      };

    case 'community':
      return {
        content:
          'Welcome! Neighbors are the heart of co-op.care. As a neighbor, you can earn Time Bank credits ' +
          'by helping families in your area — meals, rides, companionship, tech support, and more.',
        actions: [
          {
            id: 'start-intake',
            label: 'Become a Neighbor',
            icon: 'home',
            actionType: 'start-intake',
          },
        ],
        followups: [
          { label: 'What tasks?', message: 'What kind of tasks can I help with?' },
          { label: 'How it works', message: 'How does the Time Bank work for neighbors?' },
        ],
      };

    case 'account':
      return {
        content:
          'I can help with account changes. For security, some changes require verification. ' +
          'What would you like to update?',
        followups: [
          { label: 'Change email', message: 'I want to change my email address' },
          { label: 'Update phone', message: 'I want to update my phone number' },
        ],
      };

    case 'visit_documentation':
      return {
        content:
          "Ready to document a visit. I'll capture your notes and auto-generate " +
          'Omaha-coded encounter documentation. Just describe what happened.',
        followups: [{ label: 'Start voice note', message: 'I want to dictate a visit note' }],
      };

    default:
      return {
        content:
          "I'm Sage, your guide to co-op.care. I can help with assessments, " +
          'care questions, scheduling, billing, or just listen when things get hard.',
        actions: [
          {
            id: 'start-assessment',
            label: 'Quick Check-In',
            icon: 'stethoscope',
            actionType: 'start-assessment',
          },
          { id: 'schedule', label: 'Schedule a Call', icon: 'phone', actionType: 'contact' },
        ],
      };
  }
}

/** Simple care question answering (Phase 1) */
function getSageAnswer(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('sundown')) {
    return (
      '**Sundowning** is increased confusion or agitation in the late afternoon/evening, common in dementia. ' +
      'Tips: keep a consistent routine, increase afternoon lighting, limit caffeine after noon, ' +
      'and try calming activities before sunset. If it worsens suddenly, that could signal a UTI or medication issue.'
    );
  }

  if (lower.includes('fall')) {
    return (
      '**Fall prevention** is critical. Key steps: remove tripping hazards (rugs, cords), install grab bars in ' +
      'bathrooms, ensure good lighting, check medications for dizziness side effects, and consider a medical alert system. ' +
      "If they fell and hit their head or can't bear weight, seek medical attention immediately."
    );
  }

  if (lower.includes('medication')) {
    return (
      'Medication management gets complicated. Consider a **pill organizer**, set phone reminders, ' +
      'and keep an updated medication list. Bring the list to every doctor visit. ' +
      'Watch for new symptoms after medication changes — they could be side effects.'
    );
  }

  return (
    "That's a great question. Our Care Navigators can give you personalized guidance. " +
    'Would you like to schedule a call?'
  );
}

/**
 * Convert SageAction (from action engine) to ActionButton (client contract).
 * Encodes the full action metadata into the payload so the client can execute it.
 */
function sageActionToButton(action: SageAction): ActionButton {
  // Map action types to the existing ActionButton actionType
  let actionType: ActionButton['actionType'];
  switch (action.type) {
    case 'start_assessment':
      actionType = 'start-assessment';
      break;
    case 'schedule_visit':
    case 'find_caregiver':
      actionType = 'contact';
      break;
    case 'recommend_product':
    case 'check_eligibility':
    case 'generate_lmn':
    case 'file_claim':
    case 'order_meal':
    case 'create_meal_plan':
      actionType = 'navigate';
      break;
    case 'join_community':
      actionType = 'navigate';
      break;
    case 'call_emergency':
      actionType = 'navigate';
      break;
    default:
      actionType = 'navigate';
  }

  // Encode full action context in payload as JSON
  const payloadData = JSON.stringify({
    endpoint: action.endpoint,
    method: action.method,
    payload: action.payload,
    module: action.module,
    estimatedTime: action.estimatedTime,
    estimatedSavings: action.estimatedSavings,
  });

  return {
    id: action.id,
    label: action.buttonLabel,
    icon: action.icon,
    actionType,
    payload: payloadData,
  };
}

export const sageService = {
  /**
   * Tier 0: Keyword-based chat (no auth, public homepage)
   * Now enhanced with the Action Engine — generates concrete, actionable
   * next steps that connect to real co-op.care modules.
   */
  async chat(input: SageChatInput): Promise<SageResponse> {
    const familyId = input.sessionId ?? `anon-${Date.now()}`;

    // ── Agent: Emit profile event from every conversation ──
    // Sage is the sensory organ — every message builds the Living Profile
    // Use regex for instant extraction, then Claude for deep extraction (async)
    const regexProfile = extractProfileData(input.message, input.profile);
    eventBus
      .emit({
        type: 'profile.updated',
        familyId,
        source: 'sage',
        payload: regexProfile,
        timestamp: new Date(),
      })
      .catch(() => {}); // fire-and-forget

    // Claude deep extraction (fire-and-forget, enriches profile async)
    extractProfileWithClaude(input.message, input.history)
      .then((claudeProfile) => {
        if (Object.keys(claudeProfile).length > 0) {
          const payload: Record<string, unknown> = {};
          if (claudeProfile.careRecipientName) payload.name = claudeProfile.careRecipientName;
          if (claudeProfile.careRecipientAge) payload.age = claudeProfile.careRecipientAge;
          if (claudeProfile.conditions?.length) payload.conditions = claudeProfile.conditions;
          if (claudeProfile.medications?.length) payload.medications = claudeProfile.medications;
          if (claudeProfile.mobilityLevel) payload.mobilityLevel = claudeProfile.mobilityLevel;
          if (claudeProfile.state) payload.state = claudeProfile.state;
          if (claudeProfile.caregiverName) payload.caregiverName = claudeProfile.caregiverName;
          if (claudeProfile.caregiverRelationship)
            payload.caregiverRelationship = claudeProfile.caregiverRelationship;

          if (Object.keys(payload).length > 0) {
            eventBus
              .emit({
                type: 'profile.updated',
                familyId,
                source: 'sage-claude-extractor',
                payload,
                timestamp: new Date(),
              })
              .catch(() => {});
          }

          // Emit Omaha problems if detected
          if (claudeProfile.omahaProblems?.length) {
            for (const code of claudeProfile.omahaProblems) {
              eventBus
                .emit({
                  type: 'omaha.problem.found',
                  familyId,
                  source: 'sage-claude-extractor',
                  payload: { code },
                  timestamp: new Date(),
                })
                .catch(() => {});
            }
          }
        }
      })
      .catch(() => {}); // never block on extraction failure

    // ── Agent: Check for assessment responses ──
    // If the Assessor Agent has pending questions, try to extract numeric responses
    const assessmentResponse = tryExtractAssessmentResponse(input.message, familyId);
    if (assessmentResponse) {
      const result = recordAssessmentResponse(
        familyId,
        assessmentResponse.domain,
        assessmentResponse.value,
      );
      if (result.complete) {
        // Assessment finished — finalize and trigger LMN pipeline
        finalizeAssessment(familyId).catch((err) => {
          logger.warn({ err, familyId }, 'Failed to finalize assessment');
        });
      }
    }

    // ── Agent: Weave assessment questions into response ──
    // If the Assessor Agent has a pending question, append it to Sage's response
    const nextQuestion = getNextAssessmentQuestion(familyId);

    // Try Claude API first (if available)
    const claudeResult = await callClaude(input.message, input.history, input.profile);
    if (claudeResult) {
      // Action Engine: still enrich Claude responses with actionable buttons
      const sageActions = generateActions(input.message);
      const actionButtons =
        sageActions.length > 0 ? sageActions.map(sageActionToButton) : undefined;

      // Weave assessment question into Claude response
      let content = claudeResult.content;
      if (nextQuestion) {
        content += `\n\n${nextQuestion.question}`;
      }

      logger.info(
        {
          source: 'claude',
          sessionId: input.sessionId,
          messageLength: input.message.length,
          assessmentQuestion: !!nextQuestion,
        },
        'Sage chat processed via Claude',
      );

      return {
        content,
        followups: claudeResult.followups,
        actions: actionButtons,
      };
    }

    // Fallback: keyword-based response
    const domain = input.topic ? (input.topic as SageDomain) : classifyDomain(input.message);

    const response = generateResponse(domain, input.message);

    // Weave assessment question into keyword response
    if (nextQuestion) {
      response.content += `\n\n${nextQuestion.question}`;
    }

    // Action Engine: generate concrete actions from the message
    const sageActions = generateActions(input.message);

    if (sageActions.length > 0) {
      const actionButtons = sageActions.map(sageActionToButton);
      const existingActions = response.actions ?? [];
      response.actions = [...existingActions, ...actionButtons];
    }

    logger.info(
      {
        source: 'keyword',
        domain,
        sessionId: input.sessionId,
        messageLength: input.message.length,
        assessmentQuestion: !!nextQuestion,
      },
      'Sage chat processed via keyword engine',
    );

    return response;
  },

  /**
   * Tier 2: Gemini Flash intent classification + Omaha auto-coding
   * Jacob: Wire Gemini Flash API here. See JACOB-BACKEND-HANDOFF-v4.md for spec.
   */
  async classifyIntent(input: SageIntentInput): Promise<{
    domain: SageDomain;
    confidence: number;
    omahaCodes: Array<{ code: number; problem: string; intervention: string }>;
    response: SageResponse;
  }> {
    // Strip PHI before sending to any external AI service (Gemini, etc.)
    const { stripped: safeMessage, replacementCount, categoriesFound } = stripPhi(input.message);
    if (replacementCount > 0) {
      logger.info(
        { replacementCount, categoriesFound, sessionId: input.sessionId },
        'PHI stripped from message before intent classification',
      );
    }

    // TODO: Jacob — Replace with Gemini Flash API call
    // When wiring Gemini, use `safeMessage` (not `input.message`) for the API call.
    // For now, fall back to keyword classification
    const domain = classifyDomain(safeMessage);
    const response = generateResponse(domain, input.message);

    logger.info(
      { domain, sessionId: input.sessionId, intent: 'keyword_fallback' },
      'Sage intent classified (keyword fallback)',
    );

    return {
      domain,
      confidence: 0.6, // Keyword matching = low confidence
      omahaCodes: [], // Phase 2: Gemini will extract these
      response,
    };
  },
};

// ─── Agent Helper Functions ─────────────────────────────────────────────

/**
 * Extract profile data from a user message + existing profile context.
 * This builds the Living Profile incrementally from every Sage conversation.
 */
function extractProfileData(
  message: string,
  profile?: Record<string, unknown>,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const lower = message.toLowerCase();

  // Extract age patterns: "my mom is 82", "she's 75", "age 80"
  const ageMatch =
    message.match(/(?:(?:age|aged)\s+)?(\d{2,3})\s*(?:years?\s*old|yr)/i) ??
    message.match(/(?:is|she's|he's)\s+(\d{2,3})/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]!, 10);
    if (age >= 50 && age <= 110) data.age = age;
  }

  // Extract state: "we live in Colorado", "from TX"
  const stateMatch = message.match(
    /\b(?:in|from|live in)\s+(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new\s+hampshire|new\s+jersey|new\s+mexico|new\s+york|north\s+carolina|north\s+dakota|ohio|oklahoma|oregon|pennsylvania|rhode\s+island|south\s+carolina|south\s+dakota|tennessee|texas|utah|vermont|virginia|washington|west\s+virginia|wisconsin|wyoming|AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i,
  );
  if (stateMatch) data.state = stateMatch[1];

  // Extract conditions
  const conditions: string[] = [];
  const conditionKeywords = [
    'dementia',
    'alzheimer',
    'parkinson',
    'diabetes',
    'copd',
    'heart failure',
    'stroke',
    'cancer',
    'arthritis',
    'osteoporosis',
  ];
  for (const kw of conditionKeywords) {
    if (lower.includes(kw)) conditions.push(kw);
  }
  if (conditions.length > 0) data.conditions = conditions;

  // Extract mobility hints
  if (lower.includes('wheelchair')) data.mobilityLevel = 'wheelchair';
  else if (lower.includes('walker') || lower.includes("can't walk"))
    data.mobilityLevel = 'dependent';
  else if (lower.includes('cane') || lower.includes('unsteady')) data.mobilityLevel = 'assisted';

  // Extract relationship
  if (lower.includes('my mom') || lower.includes('my mother'))
    data.caregiverRelationship = 'adult child';
  if (lower.includes('my dad') || lower.includes('my father'))
    data.caregiverRelationship = 'adult child';
  if (lower.includes('my wife') || lower.includes('my husband') || lower.includes('my spouse'))
    data.caregiverRelationship = 'spouse';

  // Pass through existing profile data
  if (profile) {
    if (profile.name && !data.name) data.name = profile.name;
    if (profile.caregiverName && !data.caregiverName) data.caregiverName = profile.caregiverName;
  }

  return data;
}

/**
 * Try to extract a numeric assessment response from a user message.
 * Handles natural language: "about a 7", "maybe 6 or 7", "I'd say eight",
 * "probably like a 5", "7/10", "seven", etc.
 */
function tryExtractAssessmentResponse(
  message: string,
  familyId: string,
): { domain: string; value: number } | null {
  const question = getNextAssessmentQuestion(familyId);
  if (!question) return null;

  const lower = message.toLowerCase().trim();

  // Word-to-number mapping
  const wordNumbers: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  // Try word numbers first: "about a seven", "I'd say eight"
  for (const [word, num] of Object.entries(wordNumbers)) {
    if (lower.includes(word)) return { domain: question.domain, value: num };
  }

  // Try "X/10" or "X out of 10" pattern
  const outOfMatch = lower.match(/(\d{1,2})\s*(?:\/|out of)\s*10/);
  if (outOfMatch) {
    const v = parseInt(outOfMatch[1]!, 10);
    if (v >= 1 && v <= 10) return { domain: question.domain, value: v };
  }

  // Try "maybe X or Y" — take the average
  const rangeMatch = lower.match(/(\d{1,2})\s*(?:or|to|-)\s*(\d{1,2})/);
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1]!, 10);
    const b = parseInt(rangeMatch[2]!, 10);
    if (a >= 1 && a <= 10 && b >= 1 && b <= 10) {
      return { domain: question.domain, value: Math.round((a + b) / 2) };
    }
  }

  // Try bare number: "7", "about a 7", "probably 8", "like a 5"
  const numMatch = lower.match(/\b(\d{1,2})\b/);
  if (numMatch) {
    const value = parseInt(numMatch[1]!, 10);
    if (value >= 1 && value <= 10) return { domain: question.domain, value };
  }

  return null;
}
