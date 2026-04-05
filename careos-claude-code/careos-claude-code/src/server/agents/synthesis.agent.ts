/**
 * Synthesis Agent — The cortex. Nightly learning cycle.
 *
 * Every 24 hours, this agent:
 * 1. Reads all events from the past 24 hours
 * 2. Calculates conversion metrics per funnel stage
 * 3. Identifies bottlenecks (where families get stuck)
 * 4. Checks agent health (error rates, throughput)
 * 5. Generates insights for the team
 * 6. In Phase 2: updates agent behavioral configs
 *
 * This is the self-optimizing loop that makes CareOS an organism, not a toolbox.
 */
import { BaseAgent } from './base-agent.js';
import { getAllJourneys, type JourneyStage } from './care-journey.js';
import { getReviewQueue } from './review-router.agent.js';
import { getBillingRecords } from './billing.agent.js';
import { logger } from '../common/logger.js';
import type { CareEvent } from './event-bus.js';

// ─── Synthesis Report ───────────────────────────────────────────────────

export interface SynthesisReport {
  timestamp: Date;
  period: '24h';

  // Funnel metrics
  funnel: {
    discovered: number;
    profiling: number;
    assessing: number;
    lmn_eligible: number;
    lmn_review: number;
    lmn_signed: number;
    active_lmn: number;
    care_matched: number;
    active_care: number;
    renewal: number;
  };

  // Conversion rates
  conversions: {
    discoveredToProfiling: number;
    profilingToAssessing: number;
    assessingToEligible: number;
    eligibleToSigned: number;
    signedToActive: number;
    overallConversion: number;
  };

  // Bottlenecks
  bottlenecks: Array<{
    stage: JourneyStage;
    count: number;
    avgDaysStuck: number;
    recommendation: string;
  }>;

  // Agent health
  agentHealth: Array<{
    name: string;
    eventCount: number;
    errorRate: number;
    status: 'healthy' | 'degraded' | 'failing';
  }>;

  // Revenue
  revenue: {
    lmnsPending: number;
    lmnsPaid: number;
    totalRevenue: number;
    avgLmnValue: number;
  };

  // Insights
  insights: string[];
}

// Store reports history
const reports: SynthesisReport[] = [];

export function getLatestReport(): SynthesisReport | null {
  return reports.length > 0 ? reports[reports.length - 1]! : null;
}

export function getReports(limit = 30): SynthesisReport[] {
  return reports.slice(-limit);
}

// ─── All Events Collector ───────────────────────────────────────────────

const allEvents: CareEvent[] = [];
const MAX_EVENT_HISTORY = 10000;

function recordEvent(event: CareEvent): void {
  allEvents.push(event);
  // Keep bounded
  if (allEvents.length > MAX_EVENT_HISTORY) {
    allEvents.splice(0, allEvents.length - MAX_EVENT_HISTORY);
  }
}

// ─── Agent ──────────────────────────────────────────────────────────────

export class SynthesisAgent extends BaseAgent {
  private agents: BaseAgent[] = [];

  constructor() {
    super({
      name: 'synthesis',
      description:
        'Nightly learning cycle — reads all events, identifies patterns, generates insights',
      subscribesTo: [], // Uses wildcard listener
      enabled: true,
    });
  }

  /**
   * Register all other agents so Synthesis can check their health.
   */
  registerAgents(agents: BaseAgent[]): void {
    this.agents = agents;
  }

  /**
   * Override init to use wildcard listener.
   */
  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { eventBus } = require('./event-bus.js');
    eventBus.on('*', (event: CareEvent) => {
      recordEvent(event);
    });

    logger.info({ agent: this.name }, 'Synthesis Agent initialized — recording all events');
  }

  /**
   * Not used (we use wildcard), but required by base class.
   */
  protected async handle(_event: CareEvent): Promise<void> {
    // Wildcard handler records events above
  }

  /**
   * Run the synthesis cycle. Called by scheduler (nightly) or on-demand.
   */
  async runSynthesis(): Promise<SynthesisReport> {
    const now = new Date();
    // Get all journeys
    const journeys = getAllJourneys();

    // Count per stage
    const funnel = {
      discovered: 0,
      profiling: 0,
      assessing: 0,
      lmn_eligible: 0,
      lmn_review: 0,
      lmn_signed: 0,
      active_lmn: 0,
      care_matched: 0,
      active_care: 0,
      renewal: 0,
    };
    for (const j of journeys) {
      funnel[j.stage]++;
    }

    // Conversion rates
    const total = journeys.length || 1;
    const conversions = {
      discoveredToProfiling: funnel.discovered > 0 ? (total - funnel.discovered) / total : 0,
      profilingToAssessing:
        funnel.profiling +
          funnel.assessing +
          funnel.lmn_eligible +
          funnel.lmn_review +
          funnel.lmn_signed +
          funnel.active_lmn +
          funnel.care_matched +
          funnel.active_care >
        0
          ? (funnel.assessing +
              funnel.lmn_eligible +
              funnel.lmn_review +
              funnel.lmn_signed +
              funnel.active_lmn) /
            total
          : 0,
      assessingToEligible:
        funnel.assessing > 0
          ? (funnel.lmn_eligible + funnel.lmn_review + funnel.lmn_signed + funnel.active_lmn) /
            (funnel.assessing +
              funnel.lmn_eligible +
              funnel.lmn_review +
              funnel.lmn_signed +
              funnel.active_lmn)
          : 0,
      eligibleToSigned:
        funnel.lmn_eligible + funnel.lmn_review > 0
          ? (funnel.lmn_signed + funnel.active_lmn) /
            (funnel.lmn_eligible + funnel.lmn_review + funnel.lmn_signed + funnel.active_lmn)
          : 0,
      signedToActive:
        funnel.lmn_signed > 0 ? funnel.active_lmn / (funnel.lmn_signed + funnel.active_lmn) : 0,
      overallConversion:
        total > 0 ? (funnel.active_lmn + funnel.care_matched + funnel.active_care) / total : 0,
    };

    // Bottlenecks (stages where families are stuck > 3 days)
    const bottlenecks: SynthesisReport['bottlenecks'] = [];
    const stageGroups = new Map<JourneyStage, number[]>();
    for (const j of journeys) {
      const daysSince = (now.getTime() - j.stageEnteredAt.getTime()) / (1000 * 60 * 60 * 24);
      if (!stageGroups.has(j.stage)) stageGroups.set(j.stage, []);
      stageGroups.get(j.stage)!.push(daysSince);
    }
    for (const [stage, days] of stageGroups) {
      const avg = days.reduce((a, b) => a + b, 0) / days.length;
      if (avg > 3 && days.length >= 2) {
        bottlenecks.push({
          stage,
          count: days.length,
          avgDaysStuck: Math.round(avg * 10) / 10,
          recommendation: getBottleneckRecommendation(stage),
        });
      }
    }

    // Agent health
    const agentHealth = this.agents.map((a) => {
      const m = a.getMetrics();
      return {
        name: m.name,
        eventCount: m.eventCount,
        errorRate: m.errorRate,
        status: (m.errorRate > 0.5 ? 'failing' : m.errorRate > 0.1 ? 'degraded' : 'healthy') as
          | 'healthy'
          | 'degraded'
          | 'failing',
      };
    });

    // Revenue
    const billingRecords = getBillingRecords();
    const lmnRecords = billingRecords.filter((r) => r.type === 'lmn');
    const paidRecords = lmnRecords.filter((r) => r.status === 'paid');
    const revenue = {
      lmnsPending: lmnRecords.filter((r) => r.status === 'pending').length,
      lmnsPaid: paidRecords.length,
      totalRevenue: paidRecords.reduce((sum, r) => sum + r.amount / 100, 0),
      avgLmnValue:
        paidRecords.length > 0
          ? paidRecords.reduce((sum, r) => sum + r.amount / 100, 0) / paidRecords.length
          : 0,
    };

    // Generate insights
    const insights = generateInsights(funnel, conversions, bottlenecks, revenue);

    const report: SynthesisReport = {
      timestamp: now,
      period: '24h',
      funnel,
      conversions,
      bottlenecks,
      agentHealth,
      revenue,
      insights,
    };

    reports.push(report);

    // Emit synthesis event
    await this.emit('synthesis.insights', 'system', {
      reportTimestamp: now.toISOString(),
      totalFamilies: journeys.length,
      overallConversion: conversions.overallConversion,
      bottleneckCount: bottlenecks.length,
      totalRevenue: revenue.totalRevenue,
      insightCount: insights.length,
    });

    logger.info(
      {
        totalFamilies: journeys.length,
        overallConversion: (conversions.overallConversion * 100).toFixed(1) + '%',
        bottleneckCount: bottlenecks.length,
        revenue: revenue.totalRevenue,
      },
      'Synthesis cycle complete',
    );

    return report;
  }
}

function getBottleneckRecommendation(stage: JourneyStage): string {
  const recs: Record<JourneyStage, string> = {
    discovered: 'Sage needs stronger onboarding hooks — try asking about their situation sooner',
    profiling:
      'Profile questions not engaging — consider starting with emotional validation before data gathering',
    assessing: 'Assessment questions may feel too clinical — soften conversational wrappers',
    lmn_eligible: 'LMN drafts not reaching review — check LMN Trigger Agent health',
    lmn_review: 'Josh review queue backing up — consider increasing review session frequency',
    lmn_signed: 'Families not paying after LMN signed — improve HSA/FSA savings messaging',
    active_lmn:
      'Families with active LMNs not subscribing to care — care plan value proposition needs work',
    care_matched:
      'Matches not converting to active care — check caregiver availability in service area',
    active_care:
      'Active care families approaching renewal — healthy, ensure renewal reminders are working',
    renewal: 'Renewals not converting back to assessment — reassessment flow may be broken',
  };
  return recs[stage] ?? 'Investigate stage-specific drop-off';
}

function generateInsights(
  funnel: SynthesisReport['funnel'],
  conversions: SynthesisReport['conversions'],
  bottlenecks: SynthesisReport['bottlenecks'],
  revenue: SynthesisReport['revenue'],
): string[] {
  const insights: string[] = [];

  const total = Object.values(funnel).reduce((a, b) => a + b, 0);
  if (total === 0) {
    insights.push('No families in pipeline yet. Focus on driving first conversations with Sage.');
    return insights;
  }

  // Overall health
  if (conversions.overallConversion > 0.3) {
    insights.push(
      `Strong overall conversion: ${(conversions.overallConversion * 100).toFixed(1)}% of families reaching active LMN stage.`,
    );
  } else if (conversions.overallConversion > 0.1) {
    insights.push(
      `Moderate overall conversion: ${(conversions.overallConversion * 100).toFixed(1)}%. Look for the biggest drop-off stage.`,
    );
  }

  // Bottleneck insights
  if (bottlenecks.length > 0) {
    const worst = bottlenecks.sort((a, b) => b.avgDaysStuck - a.avgDaysStuck)[0]!;
    insights.push(
      `Biggest bottleneck: ${worst.count} families stuck in "${worst.stage}" for avg ${worst.avgDaysStuck} days. ${worst.recommendation}`,
    );
  }

  // Revenue insights
  if (revenue.totalRevenue > 0) {
    insights.push(
      `LMN revenue: $${revenue.totalRevenue.toLocaleString()} from ${revenue.lmnsPaid} signed LMNs (avg $${revenue.avgLmnValue}/LMN).`,
    );
  }
  if (revenue.lmnsPending > 0) {
    insights.push(
      `${revenue.lmnsPending} LMN invoices pending payment — follow up on HSA/FSA filing.`,
    );
  }

  // Queue depth
  const reviewQueue = getReviewQueue('pending');
  if (reviewQueue.length > 5) {
    insights.push(
      `Review queue depth: ${reviewQueue.length} LMNs waiting for Josh. Consider scheduling a dedicated review session.`,
    );
  }

  return insights;
}
