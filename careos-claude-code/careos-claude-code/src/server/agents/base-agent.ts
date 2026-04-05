/**
 * Base Agent — Abstract class for all CareOS agents
 *
 * Every agent in the organism:
 * 1. Has a name and description
 * 2. Subscribes to specific events
 * 3. Processes events and emits new ones
 * 4. Reads a behavioral config (markdown) that shapes its behavior
 * 5. Logs everything for the Synthesis Agent to review
 */
import { logger } from '../common/logger.js';
import { eventBus, type CareEvent, type CareEventType } from './event-bus.js';

export interface AgentConfig {
  /** Unique agent name */
  name: string;
  /** What this agent does */
  description: string;
  /** Events this agent listens to */
  subscribesTo: CareEventType[];
  /** Whether this agent is enabled */
  enabled: boolean;
}

export abstract class BaseAgent {
  readonly name: string;
  readonly description: string;
  readonly subscribesTo: CareEventType[];
  protected enabled: boolean;
  private eventCount = 0;
  private errorCount = 0;
  private lastEventAt: Date | null = null;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.description = config.description;
    this.subscribesTo = config.subscribesTo;
    this.enabled = config.enabled;
  }

  /**
   * Initialize this agent — subscribe to events.
   */
  init(): void {
    if (!this.enabled) {
      logger.info({ agent: this.name }, `Agent disabled: ${this.name}`);
      return;
    }

    for (const eventType of this.subscribesTo) {
      eventBus.on(eventType, async (event: CareEvent) => {
        await this.safeHandle(event);
      });
    }

    logger.info(
      { agent: this.name, subscribesTo: this.subscribesTo },
      `Agent initialized: ${this.name} — listening to ${this.subscribesTo.length} event types`,
    );
  }

  /**
   * Safe wrapper around handle — catches errors, logs metrics.
   */
  private async safeHandle(event: CareEvent): Promise<void> {
    const start = Date.now();
    try {
      await this.handle(event);
      this.eventCount++;
      this.lastEventAt = new Date();

      logger.info(
        {
          agent: this.name,
          eventType: event.type,
          familyId: event.familyId,
          durationMs: Date.now() - start,
        },
        `Agent processed event: ${this.name} ← ${event.type}`,
      );
    } catch (err) {
      this.errorCount++;
      logger.error(
        {
          agent: this.name,
          eventType: event.type,
          familyId: event.familyId,
          err,
          durationMs: Date.now() - start,
        },
        `Agent error: ${this.name} failed to handle ${event.type}`,
      );
    }
  }

  /**
   * Emit an event from this agent.
   */
  protected async emit(
    type: CareEventType,
    familyId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await eventBus.emit({
      type,
      familyId,
      source: this.name,
      payload,
      timestamp: new Date(),
    });
  }

  /**
   * Handle an incoming event. Implement in each agent.
   */
  protected abstract handle(event: CareEvent): Promise<void>;

  /**
   * Get agent health metrics (for Synthesis Agent).
   */
  getMetrics(): {
    name: string;
    enabled: boolean;
    eventCount: number;
    errorCount: number;
    lastEventAt: Date | null;
    errorRate: number;
  } {
    return {
      name: this.name,
      enabled: this.enabled,
      eventCount: this.eventCount,
      errorCount: this.errorCount,
      lastEventAt: this.lastEventAt,
      errorRate: this.eventCount > 0 ? this.errorCount / this.eventCount : 0,
    };
  }
}
