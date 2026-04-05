/**
 * CareOS Agent Registry — Initialize and manage all agents
 *
 * The organism boots here. Every agent registers, subscribes to events,
 * and begins autonomous operation.
 *
 * Boot sequence:
 * 1. Initialize event bus (already a singleton)
 * 2. Initialize care journey listener (auto-advances on events)
 * 3. Initialize each agent (subscribes to its events)
 * 4. Register all agents with Synthesis Agent (for health monitoring)
 * 5. Schedule Synthesis nightly cycle
 */
import { logger } from '../common/logger.js';
import { initJourneyListener } from './care-journey.js';
import { ProfileBuilderAgent } from './profile-builder.agent.js';
import { AssessorAgent } from './assessor.agent.js';
import { LMNTriggerAgent } from './lmn-trigger.agent.js';
import { ReviewRouterAgent } from './review-router.agent.js';
import { BillingAgent } from './billing.agent.js';
import { SynthesisAgent } from './synthesis.agent.js';
import { initJoshNotifications } from './notify-josh.js';
import type { BaseAgent } from './base-agent.js';

// ─── Agent Instances ────────────────────────────────────────────────────

let initialized = false;
const agents: BaseAgent[] = [];
let synthesisAgent: SynthesisAgent;

/**
 * Boot the agent organism. Called once at server startup.
 */
export function initAgents(): void {
  if (initialized) {
    logger.warn('Agents already initialized — skipping');
    return;
  }

  logger.info('═══ CareOS Agent Organism Booting ═══');

  // 1. Journey listener — auto-advances family journeys on events
  initJourneyListener();

  // 1b. Josh notification listener — alerts physician on urgent LMNs
  initJoshNotifications();

  // 2. Create all agents
  const profileBuilder = new ProfileBuilderAgent();
  const assessor = new AssessorAgent();
  const lmnTrigger = new LMNTriggerAgent();
  const reviewRouter = new ReviewRouterAgent();
  const billing = new BillingAgent();
  synthesisAgent = new SynthesisAgent();

  agents.push(profileBuilder, assessor, lmnTrigger, reviewRouter, billing, synthesisAgent);

  // 3. Initialize each agent (subscribes to events)
  for (const agent of agents) {
    agent.init();
  }

  // 4. Register all agents with Synthesis for health monitoring
  synthesisAgent.registerAgents(agents);

  initialized = true;

  logger.info(
    { agentCount: agents.length, agents: agents.map((a) => a.name) },
    '═══ CareOS Agent Organism Online — all agents listening ═══',
  );
}

/**
 * Run synthesis cycle on demand (also called by nightly scheduler).
 */
export async function runSynthesisCycle(): Promise<ReturnType<SynthesisAgent['runSynthesis']>> {
  if (!synthesisAgent) {
    throw new Error('Agents not initialized — call initAgents() first');
  }
  return synthesisAgent.runSynthesis();
}

/**
 * Get health metrics for all agents.
 */
export function getAgentMetrics(): ReturnType<BaseAgent['getMetrics']>[] {
  return agents.map((a) => a.getMetrics());
}

// Re-export key types and functions for API layer
export { eventBus } from './event-bus.js';
export { getJourney, getAllJourneys, type CareJourney, type JourneyStage } from './care-journey.js';
export {
  getReviewQueue,
  getReviewItem,
  getAutoApprovedItems,
  getTriageStats,
  signLMN,
  rejectLMN,
} from './review-router.agent.js';
export { getBillingRecords, markInvoicePaid } from './billing.agent.js';
export { getLatestReport, getReports } from './synthesis.agent.js';
export { getProfile, updateProfile } from './profile-builder.agent.js';
export {
  getAssessmentState,
  getNextAssessmentQuestion,
  recordAssessmentResponse,
  finalizeAssessment,
} from './assessor.agent.js';
