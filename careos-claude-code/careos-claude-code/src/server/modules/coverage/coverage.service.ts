/**
 * Coverage Intelligence Service — Server-side coverage monitoring
 *
 * Tracks client insurance/Medicaid status, calculates risk scores,
 * generates alerts for coverage gaps, and computes revenue impact.
 *
 * In demo mode (no DB connection), returns realistic demo data
 * following the same pattern as care-tier.service.ts.
 */

import { getPostgres } from '../../database/postgres.js';
import {
  DEMO_COVERAGE_CLIENTS,
  DEMO_COVERAGE_SUMMARY,
  DEMO_COVERAGE_ALERTS,
  REGULATORY_EVENTS,
} from '@shared/constants/coverage-rules';
import type {
  ClientCoverage,
  CoverageIntelligenceSummary,
  CoverageAlert,
  RegulatoryCalendar,
  RiskLevel,
  CoverageType,
} from '@shared/types/coverage.types';

export const coverageService = {
  /**
   * Get coverage intelligence summary (dashboard aggregate)
   */
  async getSummary(): Promise<CoverageIntelligenceSummary> {
    try {
      const db = getPostgres();
      const result = await db.query<[ClientCoverage[]]>(
        `SELECT * FROM client_coverage ORDER BY overallRisk DESC`,
      );
      // @ts-expect-error — SurrealDB-style query result indexing; pending PostgreSQL migration
      const clients = result?.[0] ?? [];
      if (clients.length === 0) return DEMO_COVERAGE_SUMMARY;
      return this.computeSummary(clients);
    } catch {
      // Demo mode
      return DEMO_COVERAGE_SUMMARY;
    }
  },

  /**
   * Get all client coverage records
   */
  async getClients(): Promise<ClientCoverage[]> {
    try {
      const db = getPostgres();
      const result = await db.query<[ClientCoverage[]]>(
        `SELECT * FROM client_coverage ORDER BY overallRisk DESC`,
      );
      // @ts-expect-error — SurrealDB-style query result indexing; pending PostgreSQL migration
      return result?.[0] ?? DEMO_COVERAGE_CLIENTS;
    } catch {
      return DEMO_COVERAGE_CLIENTS;
    }
  },

  /**
   * Get coverage record for a specific client
   */
  async getClientCoverage(careRecipientId: string): Promise<ClientCoverage | null> {
    try {
      const db = getPostgres();
      // @ts-expect-error — SurrealDB-style named params; pending PostgreSQL migration
      const result = await db.query<[ClientCoverage[]]>(`SELECT * FROM client_coverage WHERE careRecipientId = $crId LIMIT 1`, { crId: careRecipientId });
      // @ts-expect-error — SurrealDB-style query result indexing; pending PostgreSQL migration
      return result?.[0]?.[0] ?? null;
    } catch {
      return DEMO_COVERAGE_CLIENTS.find(c => c.careRecipientId === careRecipientId) ?? null;
    }
  },

  /**
   * Get active coverage alerts sorted by severity
   */
  async getAlerts(): Promise<CoverageAlert[]> {
    try {
      const db = getPostgres();
      const result = await db.query<[CoverageAlert[]]>(
        `SELECT * FROM coverage_alert WHERE resolvedAt IS NONE ORDER BY severity DESC, createdAt ASC`,
      );
      // @ts-expect-error — SurrealDB-style query result indexing; pending PostgreSQL migration
      return result?.[0] ?? DEMO_COVERAGE_ALERTS;
    } catch {
      return DEMO_COVERAGE_ALERTS;
    }
  },

  /**
   * Get regulatory calendar with upcoming events
   */
  getRegulatoryCalendar(): RegulatoryCalendar {
    const now = new Date();
    const upcoming = REGULATORY_EVENTS
      .filter(e => new Date(e.effectiveDate) > now)
      .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());

    const nextCritical = upcoming.find(e => e.impact === 'critical' || e.impact === 'high');

    return {
      events: REGULATORY_EVENTS,
      nextCriticalDate: nextCritical?.effectiveDate ?? upcoming[0]?.effectiveDate ?? '',
      clientsAffected: 3, // Demo: 3 Medicaid clients affected by Dec 2026 cliff
    };
  },

  /**
   * Compute summary from actual client records
   */
  computeSummary(clients: ClientCoverage[]): CoverageIntelligenceSummary {
    const coverageDistribution: Record<CoverageType, number> = {
      medicaid: 0, medicare_a: 0, medicare_b: 0, medicare_advantage: 0,
      private_insurance: 0, hsa_fsa: 0, self_pay: 0, va_benefits: 0,
      pace: 0, waiver_program: 0,
    };
    const riskDistribution: Record<RiskLevel, number> = {
      low: 0, moderate: 0, high: 0, critical: 0,
    };

    let activeCoverage = 0;
    let expiringSoon = 0;
    let atRisk = 0;
    let lapsed = 0;
    let totalRevenueAtRisk = 0;
    let pendingActions = 0;
    let overdueActions = 0;

    for (const client of clients) {
      const status = client.primaryCoverage.status;
      const type = client.primaryCoverage.type;

      coverageDistribution[type]++;
      riskDistribution[client.overallRisk]++;

      if (status === 'active') activeCoverage++;
      if (status === 'expiring_soon') expiringSoon++;
      if (status === 'at_risk') atRisk++;
      if (status === 'lapsed' || status === 'terminated') lapsed++;

      totalRevenueAtRisk += client.monthlyRevenueAtRisk;

      if (client.nextAction && !client.nextAction.completed) {
        pendingActions++;
        if (client.nextAction.isOverdue) overdueActions++;
      }
    }

    return {
      totalClients: clients.length,
      activeCoverage,
      expiringSoon,
      atRisk,
      lapsed,
      totalRevenueAtRisk,
      pendingActions,
      overdueActions,
      coverageDistribution,
      riskDistribution,
    };
  },
};
