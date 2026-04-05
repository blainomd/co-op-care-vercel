/**
 * co-op.care Wearable MCP Server
 *
 * Model Context Protocol server that bridges Galaxy Watch / Apple Watch health
 * data into CareOS's Sage AI care companion. Gives Sage real-time health context
 * for every conversation — turning "How is Mom doing?" from a guess into a
 * data-informed answer.
 *
 * 6 tools: get_vitals, get_anomalies, get_trends, get_risk_score,
 *          get_device_status, get_care_context
 *
 * 4 resources: vitals://latest, anomalies://active, device://status,
 *              baseline://summary
 *
 * Data flow:
 *   Galaxy Watch → Samsung Health → Health Connect → [sync service] → Aidbox FHIR R4
 *   Sage AI ←── MCP Server ←── FHIR Observation queries ←── Aidbox
 */

import { logger } from '../../common/logger.js';
import type {
  VitalsRequest,
  AnomalyRequest,
  TrendRequest,
  RiskScoreRequest,
  DeviceStatusRequest,
  CareContextRequest,
} from './wearable-types.js';
import {
  getVitals,
  getAnomalies,
  getTrends,
  getRiskScore,
  getDeviceStatus,
  getCareContext,
} from './wearable-tools.js';

// ─── MCP Tool Definitions ───────────────────────────────────────────────────

export const MCP_TOOLS = [
  {
    name: 'get_vitals',
    description:
      'Retrieve the most recent vital sign readings for a care recipient. ' +
      'Returns FHIR Observations with LOINC codes, values, timestamps, and ' +
      'comparison to personal baseline. Supports all Galaxy Watch and Apple Watch metrics.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        patientId: { type: 'string', description: 'FHIR Patient resource ID' },
        metric: {
          type: 'string',
          description: 'LOINC code (e.g., "8867-4" for heart rate) or "all" for all metrics',
        },
        range: {
          type: 'string',
          enum: ['latest', '24h', '7d', '30d'],
          description: 'Time range for readings. Default: "latest"',
        },
      },
      required: ['patientId'],
    },
  },
  {
    name: 'get_anomalies',
    description:
      'Retrieve active anomalies — vital readings that deviate >2 SD from the ' +
      "care recipient's 30-day personal baseline. These are clinically meaningful " +
      'changes that may warrant attention. Sorted by severity.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        patientId: { type: 'string', description: 'FHIR Patient resource ID' },
        window: {
          type: 'string',
          enum: ['24h', '48h', '7d'],
          description: 'Lookback window for anomalies. Default: "48h"',
        },
        minSeverity: {
          type: 'number',
          description: 'Minimum severity score (0-10) to include. Default: 3',
        },
      },
      required: ['patientId'],
    },
  },
  {
    name: 'get_trends',
    description:
      'Analyze trends in a specific vital sign over time. Returns direction ' +
      '(improving/declining/stable), rate of change, and clinical significance. ' +
      'Useful for identifying gradual deterioration that daily readings miss.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        patientId: { type: 'string', description: 'FHIR Patient resource ID' },
        metric: { type: 'string', description: 'LOINC code for the metric to analyze' },
        days: {
          type: 'number',
          description: 'Number of days to analyze. Default: 30',
        },
      },
      required: ['patientId', 'metric'],
    },
  },
  {
    name: 'get_risk_score',
    description:
      'Calculate a composite 72-96 hour hospitalization risk score based on ' +
      'all available wearable data. Combines HR, HRV, SpO2, sleep, steps, and ' +
      'skin temperature trends using weighted scoring. Returns risk level ' +
      '(low/moderate/high/critical) with contributing factors.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        patientId: { type: 'string', description: 'FHIR Patient resource ID' },
      },
      required: ['patientId'],
    },
  },
  {
    name: 'get_device_status',
    description:
      "Check the status of a care recipient's wearable device. Returns battery " +
      'level, last sync time, data gaps, firmware version, and wear compliance. ' +
      'Flags issues like "no data for 18 hours" that may need caregiver attention.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        patientId: { type: 'string', description: 'FHIR Patient resource ID' },
      },
      required: ['patientId'],
    },
  },
  {
    name: 'get_care_context',
    description:
      'Merge wearable health data with care logs, CII score, medications, and ' +
      'recent caregiver observations to build a complete picture of how the care ' +
      "recipient is doing. This is the primary tool for answering 'How is Mom?'",
    inputSchema: {
      type: 'object' as const,
      properties: {
        patientId: { type: 'string', description: 'FHIR Patient resource ID' },
        includeVitals: { type: 'boolean', description: 'Include wearable vitals. Default: true' },
        includeCareLogs: {
          type: 'boolean',
          description: 'Include recent care logs. Default: true',
        },
        includeMedications: {
          type: 'boolean',
          description: 'Include medication list. Default: true',
        },
        includeRiskScore: { type: 'boolean', description: 'Include risk score. Default: true' },
      },
      required: ['patientId'],
    },
  },
] as const;

// ─── MCP Resource Definitions ───────────────────────────────────────────────

export const MCP_RESOURCES = [
  {
    uri: 'vitals://latest/{patientId}',
    name: 'Latest Vitals',
    description: 'Most recent reading for each monitored metric',
    mimeType: 'application/json',
  },
  {
    uri: 'anomalies://active/{patientId}',
    name: 'Active Anomalies',
    description: 'Currently flagged anomalies within the last 48 hours',
    mimeType: 'application/json',
  },
  {
    uri: 'device://status/{patientId}',
    name: 'Device Status',
    description: 'Current wearable device status, battery, and sync info',
    mimeType: 'application/json',
  },
  {
    uri: 'baseline://summary/{patientId}',
    name: 'Baseline Summary',
    description: '30-day rolling baseline for all monitored metrics',
    mimeType: 'application/json',
  },
] as const;

// ─── MCP Request Handler ────────────────────────────────────────────────────

export async function handleMCPToolCall(
  toolName: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  logger.info({ tool: toolName, args }, 'MCP wearable tool call');

  try {
    let result: unknown;

    switch (toolName) {
      case 'get_vitals':
        result = await getVitals(args as unknown as VitalsRequest);
        break;
      case 'get_anomalies':
        result = await getAnomalies(args as unknown as AnomalyRequest);
        break;
      case 'get_trends':
        result = await getTrends(args as unknown as TrendRequest);
        break;
      case 'get_risk_score':
        result = await getRiskScore(args as unknown as RiskScoreRequest);
        break;
      case 'get_device_status':
        result = await getDeviceStatus(args as unknown as DeviceStatusRequest);
        break;
      case 'get_care_context':
        result = await getCareContext(args as unknown as CareContextRequest);
        break;
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${toolName}` }],
        };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    logger.error({ tool: toolName, error }, 'MCP tool call failed');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error',
            tool: toolName,
          }),
        },
      ],
    };
  }
}

// ─── MCP Resource Handler ───────────────────────────────────────────────────

export async function handleMCPResourceRead(
  uri: string,
): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
  const patientIdMatch = uri.match(/\/([^/]+)$/);
  const patientId = patientIdMatch?.[1] ?? '';

  logger.info({ uri, patientId }, 'MCP wearable resource read');

  try {
    let data: unknown;

    if (uri.startsWith('vitals://latest/')) {
      data = await getVitals({ patientId, metric: 'all', range: 'latest' });
    } else if (uri.startsWith('anomalies://active/')) {
      data = await getAnomalies({ patientId, window: '48h' });
    } else if (uri.startsWith('device://status/')) {
      data = await getDeviceStatus({ patientId });
    } else if (uri.startsWith('baseline://summary/')) {
      data = await getVitals({ patientId, metric: 'all', range: '30d' });
    } else {
      data = { error: true, message: `Unknown resource URI: ${uri}` };
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error({ uri, error }, 'MCP resource read failed');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        },
      ],
    };
  }
}
