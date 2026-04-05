/**
 * Connector Types — The atomic unit of the SolvingHealth ecosystem
 *
 * A Connector is NOT a product. It's a configured instance of the same engine:
 *   Sage (Claude) + Domain Prompt + Guardrails + Tool Connections + Trigger Config
 *
 * Each Connector:
 *   - Works standalone (ClinicalSwipe reviews, ComfortCard payments)
 *   - Composes into workflows (Caregiver Guide runs all 6 in sequence)
 *   - Emits events that other Connectors consume (via event bus)
 *   - Has independent pricing AND is included in $59/mo subscription
 *
 * The Caregiver Guide is the first workflow — it orchestrates all 6 Connectors
 * and assembles their outputs into a single deliverable.
 *
 * Why this matters:
 *   Perplexity has 6 feature descriptions. We have 6 companies.
 *   Same landing page. Different thing behind each card.
 */

// ─── Connector Config (one file = one company) ─────────────────────

export interface ConnectorTrigger {
  /** Event type emitted to the CareOS event bus */
  event: string;
  /** Condition that causes this trigger to fire */
  when: string;
  /** Human-readable description for audit trail */
  description: string;
}

export interface ConnectorTool {
  /** Tool identifier (matches server-side tool registry) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Whether this tool requires authentication */
  requiresAuth: boolean;
}

export interface ConnectorPricing {
  /** Per-use price for non-subscribers */
  perUse?: number;
  /** Whether included in $59/mo co-op.care subscription */
  includedInSubscription: boolean;
  /** Medicare/billing codes this Connector can generate */
  billingCodes?: string[];
}

export interface ConnectorLandingCopy {
  /** Card title (matches Perplexity card layout) */
  title: string;
  /** Card description (~2 sentences) */
  description: string;
  /** Ecosystem tag shown on the card (e.g., "ClinicalSwipe verification") */
  tag: string;
  /** Tag color (from design tokens) */
  tagColor: string;
  /** Icon identifier from CareOS icon system */
  icon: string;
}

export interface ConnectorConfig {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /**
   * Three brands. Not ten.
   * - co-op.care: everything the family touches
   * - SurgeonValue: everything the surgeon touches
   * - SolvingHealth: the invisible engine (nobody sees this brand)
   */
  brand: 'co-op.care' | 'SurgeonValue' | 'SolvingHealth';
  /** System prompt injected into Sage for this domain */
  domainPrompt: string;
  /** Guardrails — what this Connector must NOT do */
  guardrails: string[];
  /** External tools this Connector can invoke */
  tools: ConnectorTool[];
  /** Events this Connector emits (side effects) */
  triggers: ConnectorTrigger[];
  /** Pricing config */
  pricing: ConnectorPricing;
  /** Landing page card content */
  landing: ConnectorLandingCopy;
  /** Whether physician review is required before output is delivered */
  requiresPhysicianReview: boolean;
  /** Order in the Caregiver Guide workflow (null = not part of guide) */
  guideOrder: number | null;
}

// ─── Connector Runtime State ────────────────────────────────────────

export type ConnectorStatus = 'idle' | 'running' | 'complete' | 'error' | 'awaiting_review';

export interface ConnectorExecution {
  connectorId: string;
  status: ConnectorStatus;
  startedAt: string;
  completedAt?: string;
  /** Output from this Connector's domain prompt */
  output?: Record<string, unknown>;
  /** Triggers that fired during execution */
  triggersEmitted: ConnectorTrigger[];
  /** Error details if status === 'error' */
  error?: string;
}

// ─── Workflow (sequence of Connector executions) ────────────────────

export type WorkflowStatus = 'pending' | 'running' | 'complete' | 'error' | 'awaiting_review';

export interface ConnectorWorkflow {
  /** Unique workflow ID */
  id: string;
  /** Which workflow template (e.g., 'caregiver-guide') */
  templateId: string;
  /** Family this workflow belongs to */
  familyId: string;
  /** Ordered list of Connector executions */
  steps: ConnectorExecution[];
  /** Current step index */
  currentStep: number;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
  /** Assembled output (the final deliverable) */
  assembledOutput?: Record<string, unknown>;
}

// ─── Workflow Template ──────────────────────────────────────────────

export interface WorkflowTemplate {
  /** Template ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;
  /** Ordered list of Connector IDs to execute */
  connectorSequence: string[];
  /** System prompt for the assembly step (combines all outputs) */
  assemblyPrompt: string;
}
