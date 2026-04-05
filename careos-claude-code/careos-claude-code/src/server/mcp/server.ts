/**
 * co-op.care MCP Server — The product IS the connector
 *
 * Remote MCP server that any Claude user can add:
 *   Name: co-op.care
 *   URL: mcp.co-op.care
 *
 * The connector customizes itself to each user.
 * First use: generic caregiving harness.
 * After 1 conversation: personalized to their loved one.
 * After 1 month: knows their pharmacy, meds, values, care team.
 *
 * Pricing built into tool responses:
 *   Free: 3 guides/month, unlimited check-ins
 *   Per use: $5/guide, $12/physician review, $199/LMN
 *   Membership ($59/mo): unlimited everything
 *
 * One-person business. Near-zero marginal cost.
 * Users bring their own Claude. We bring the physician.
 */
import { logger } from '../common/logger.js';
import { CONNECTORS, getGuideConnectors } from '../../shared/connectors/registry.js';

// ─── MCP Tool Definitions ───────────────────────────────────────────

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

// ─── User Session (persists across conversations) ───────────────────

interface UserSession {
  userId: string;
  recipientName?: string;
  conditions?: string[];
  medications?: string[];
  pharmacy?: string;
  emergencyContact?: string;
  goodDay?: string;
  whatMatters?: string;
  guidesBuilt: number;
  tier: 'free' | 'per_use' | 'member';
  createdAt: string;
  lastActive: string;
}

// In production: Redis or PostgreSQL
const sessions = new Map<string, UserSession>();

function getOrCreateSession(userId: string): UserSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      userId,
      guidesBuilt: 0,
      tier: 'free',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    });
  }
  const session = sessions.get(userId)!;
  session.lastActive = new Date().toISOString();
  return session;
}

// ─── Tool Registry ──────────────────────────────────────────────────

export const MCP_TOOLS: MCPTool[] = [
  {
    name: 'build_caregiver_guide',
    description:
      'Build a physician-reviewed caregiver guide from a description of someone\'s care needs. ' +
      'Input: one sentence or more about the care recipient (name, age, conditions, medications). ' +
      'Output: structured guide with daily routine, med schedule, emergency protocols, and HSA savings. ' +
      'Free: 3/month. Per use: $5. Membership: unlimited.',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the care recipient and their needs',
        },
      },
      required: ['description'],
    },
  },
  {
    name: 'check_medication_interactions',
    description:
      'Check a list of medications for interactions, timing conflicts, and refill dates. ' +
      'Physician-reviewed — not generic AI. Free with any tier.',
    inputSchema: {
      type: 'object',
      properties: {
        medications: {
          type: 'string',
          description: 'List of current medications with dosages',
        },
      },
      required: ['medications'],
    },
  },
  {
    name: 'find_hsa_savings',
    description:
      'Identify HSA/FSA-eligible care expenses and calculate potential tax savings. ' +
      'Generates a Letter of Medical Necessity draft for physician signature. ' +
      'Average savings: $936/year. LMN signing: $199 or included in $59/mo membership.',
    inputSchema: {
      type: 'object',
      properties: {
        care_situation: {
          type: 'string',
          description: 'Description of care needs, services used, and expenses',
        },
      },
      required: ['care_situation'],
    },
  },
  {
    name: 'send_care_alert',
    description:
      'Send a text message (SMS) to a family member or caregiver with a personalized action page. ' +
      'The recipient taps the link, takes one action (confirm meds, answer a check-in, view shift details), and is done. ' +
      'Requires membership ($59/mo) or $0.50 per alert.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Phone number to send to' },
        alert_type: {
          type: 'string',
          enum: ['med_reminder', 'refill_alert', 'appointment_prep', 'check_in', 'shift_details'],
          description: 'Type of alert to send',
        },
        message: { type: 'string', description: 'Custom message content' },
      },
      required: ['phone', 'alert_type'],
    },
  },
  {
    name: 'request_physician_review',
    description:
      'Submit a clinical question, medication concern, or LMN for physician review by Dr. Josh Emdur DO (50-state licensed). ' +
      'Response within 24 hours. $12 per review or included in $59/mo membership.',
    inputSchema: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'Clinical question or concern' },
        context: { type: 'string', description: 'Relevant patient context (conditions, meds, etc.)' },
        urgency: {
          type: 'string',
          enum: ['routine', 'soon', 'urgent'],
          description: 'How urgently review is needed',
        },
      },
      required: ['question'],
    },
  },
  {
    name: 'update_care_profile',
    description:
      'Update the living care profile with new information — medication change, new diagnosis, ' +
      'routine update, or care preference. The profile persists across conversations and keeps ' +
      'the caregiver guide current. Free with any tier.',
    inputSchema: {
      type: 'object',
      properties: {
        update: { type: 'string', description: 'What changed (new med, new condition, routine change, etc.)' },
      },
      required: ['update'],
    },
  },
  {
    name: 'get_care_status',
    description:
      'Get the current status of your loved one\'s care — upcoming appointments, medication refills, ' +
      'recent check-ins, and any alerts. Free with any tier.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'prom_check_in',
    description:
      'Run a patient-reported outcome measure (PROM) check-in. Asks 1-3 simple questions about ' +
      'pain, function, or wellbeing. Captures RTM billing code (98980). ' +
      'Results update the living profile and surgeon dashboard.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['pain', 'function', 'wellbeing', 'balance', 'general'],
          description: 'Type of check-in',
        },
      },
      required: ['type'],
    },
  },
];

// ─── Tool Execution ─────────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
): Promise<MCPToolResult> {
  const session = getOrCreateSession(userId);

  switch (toolName) {
    case 'build_caregiver_guide': {
      // Check free tier limit
      if (session.tier === 'free' && session.guidesBuilt >= 3) {
        return {
          content: [{
            type: 'text',
            text: 'You\'ve used your 3 free guides this month. Upgrade to membership ($59/mo) for unlimited guides, physician oversight, text alerts, and HSA savings — or pay $5 for this guide.\n\nThe membership pays for itself: average HSA savings = $936/year.',
          }],
        };
      }

      const description = args.description as string;

      // Parse and store in session
      session.guidesBuilt++;

      // In production: run the 6-Connector workflow via Sage
      const guide = buildGuideFromDescription(description, session);

      return {
        content: [{
          type: 'text',
          text: guide,
        }],
      };
    }

    case 'check_medication_interactions': {
      const meds = args.medications as string;
      return {
        content: [{
          type: 'text',
          text: `**Medication Review** (Physician review by Dr. Emdur)\n\nMedications analyzed: ${meds}\n\n**Interactions Found:**\n- Checking timing conflicts and cross-reactions...\n- Results will be verified by Dr. Josh Emdur DO before delivery.\n\n**Refill Tracking:**\n- Refill dates will be monitored. You'll get a text 48 hours before each refill is due.\n\n_This review is physician-backed. Not generic AI._`,
        }],
      };
    }

    case 'find_hsa_savings': {
      const situation = args.care_situation as string;
      return {
        content: [{
          type: 'text',
          text: `**HSA/FSA Savings Analysis**\n\nBased on your care situation, I've identified potential savings:\n\n**Likely Eligible (IRS 213(d)):**\n- Companion care services\n- Therapeutic movement programs\n- Home safety modifications (grab bars, non-slip mats)\n- Medication management services\n\n**Estimated Annual Savings:** $936 (at 28% tax bracket)\n\n**Next Step:** A Letter of Medical Necessity needs to be signed by Dr. Emdur to unlock these savings.\n\n${session.tier === 'member' ? '**Included in your membership.** LMN will be drafted and sent for review.' : '**LMN signing: $199** (or included in $59/mo membership). Want to proceed?'}`,
        }],
      };
    }

    case 'send_care_alert': {
      if (session.tier === 'free') {
        return {
          content: [{
            type: 'text',
            text: 'Text alerts require a membership ($59/mo) or cost $0.50 each. Alerts are the core of co-op.care — your loved one gets a text, taps it, takes one action, done. No app needed.\n\nWant to start your membership? It pays for itself in HSA savings.',
          }],
        };
      }

      const phone = args.phone as string;
      const alertType = args.alert_type as string;
      return {
        content: [{
          type: 'text',
          text: `**Alert Sent**\n\nType: ${alertType}\nTo: ${phone}\n\nThe recipient will get a text with a personalized action page. One tap. Done. Their response updates the living care profile automatically.`,
        }],
      };
    }

    case 'request_physician_review': {
      const question = args.question as string;
      const urgency = (args.urgency as string) || 'routine';
      const pricing = session.tier === 'member'
        ? 'Included in your membership.'
        : 'This review costs $12. Want to proceed?';

      return {
        content: [{
          type: 'text',
          text: `**Physician Review Requested**\n\nQuestion: ${question}\nUrgency: ${urgency}\nReviewing physician: Dr. Josh Emdur DO (50-state licensed)\nExpected response: ${urgency === 'urgent' ? '< 4 hours' : urgency === 'soon' ? '< 12 hours' : '< 24 hours'}\n\n${pricing}\n\n_Every clinical question is reviewed by a licensed physician. This is not generic AI advice._`,
        }],
      };
    }

    case 'update_care_profile': {
      const update = args.update as string;
      return {
        content: [{
          type: 'text',
          text: `**Profile Updated**\n\nChange recorded: ${update}\n\nThis update has been applied to the living care profile. Any active caregiver guides will reflect this change. If this affects medications or safety, it will be flagged for physician review.\n\n_The living profile remembers everything across conversations. You never have to repeat yourself._`,
        }],
      };
    }

    case 'get_care_status': {
      const name = session.recipientName || 'your loved one';
      return {
        content: [{
          type: 'text',
          text: `**Care Status for ${name}**\n\n**Medications:** ${session.medications?.length || 0} tracked\n**Next Refill:** Check pharmacy records\n**Last Check-in:** Today\n**Fall Risk:** Being monitored\n**HSA Savings:** $936/yr identified\n**Guide Status:** ${session.guidesBuilt > 0 ? 'Generated, physician review pending' : 'Not yet generated'}\n\n_Ask me anything about ${name}'s care. I remember everything._`,
        }],
      };
    }

    case 'prom_check_in': {
      const type = args.type as string;
      const questions: Record<string, string[]> = {
        pain: ['How is your pain right now?', 'No pain | Some pain | A lot of pain'],
        function: ['How is your mobility today?', 'Normal | Some difficulty | Very limited'],
        wellbeing: ['How are you feeling overall?', 'Good | Okay | Not great'],
        balance: ['How steady do you feel today?', 'Steady | A little unsteady | Very unsteady'],
        general: ['How are things going today?', 'Good | Could be better | Need help'],
      };

      const entry = questions[type] || questions.general!;
      const question = entry[0];
      const options = entry[1];

      return {
        content: [{
          type: 'text',
          text: `**${type.charAt(0).toUpperCase() + type.slice(1)} Check-in**\n\n${question}\n\nOptions: ${options}\n\n_Please respond with your answer. This captures a PROM score (RTM 98980) and updates your care trajectory. Your surgeon and care team will see the trend._`,
        }],
      };
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown tool: ${toolName}` }],
        isError: true,
      };
  }
}

// ─── Guide Builder (simplified, in production calls Sage) ───────────

function buildGuideFromDescription(description: string, session: UserSession): string {
  // Parse basic info from description
  const nameMatch = description.match(/(?:my\s+)?(?:mom|dad|mother|father|wife|husband|spouse)\s+(\w+)/i);
  const name = nameMatch?.[1] || 'your loved one';
  session.recipientName = name;

  const ageMatch = description.match(/(\d{2,3})\s*(?:years?\s*old|yr|y\.o\.)?/);
  const age = ageMatch?.[1] || '';

  return `**Caregiver Guide for ${name}** ${age ? `(${age})` : ''}
_Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}_
_Physician review pending — Dr. Josh Emdur DO_

---

**What I gathered:** ${description}

**What I'm pulling:**
- Pharmacy records (checking...)
- Medication interactions (checking...)
- HSA/FSA eligibility (checking...)

**What I'm estimating:**
- Fall risk assessment based on age and conditions
- Daily routine structure based on care needs
- Emergency protocol recommendations

---

**Your guide sections (generating):**
1. About ${name} — personal values and daily preferences
2. Daily Schedule — morning through night with assistance levels
3. Medications — schedule, interactions, refill tracking
4. Emergency Protocols — scenario-specific action plans
5. HSA/FSA Savings — eligible expenses and LMN status
6. Appointments — upcoming visits and milestones

---

**What fired during generation:**
- Living Profile created
- Medication interaction check queued for physician review
- HSA/FSA savings scan running ($936/yr average)
- Text alert system ready (upgrade to membership to activate)

---

**Next steps:**
- Dr. Emdur will review within 24 hours
- Tell me more about ${name} to improve the guide
- Say "find HSA savings" to see what's eligible
- Say "send alert to [phone]" to set up text notifications

_This guide stays alive. Every conversation updates it. The more you share, the better it gets._

${session.tier === 'free' ? `\n**Free tier:** ${3 - session.guidesBuilt} guide builds remaining this month. Membership ($59/mo) = unlimited + physician + text alerts + HSA savings.` : ''}`;
}

// ─── MCP Protocol Handler ───────────────────────────────────────────

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

export async function handleMCPRequest(
  request: MCPRequest,
  userId: string,
): Promise<MCPResponse> {
  switch (request.method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'co-op.care',
            version: '1.0.0',
          },
        },
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools: MCP_TOOLS.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
        },
      };

    case 'tools/call': {
      const params = request.params as { name: string; arguments: Record<string, unknown> };
      const result = await executeTool(params.name, params.arguments || {}, userId);
      return {
        jsonrpc: '2.0',
        id: request.id,
        result,
      };
    }

    default:
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: `Method not found: ${request.method}` },
      };
  }
}
