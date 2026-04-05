/**
 * co-op.care Wearable MCP Server — Tool Implementations
 *
 * Each tool queries Aidbox FHIR R4 for Observation resources, computes
 * baselines/anomalies/trends/risk, and returns structured data for Sage AI.
 *
 * Data flow:
 *   Galaxy Watch → Samsung Health → Health Connect → [sync service] → Aidbox FHIR R4
 *   These tools ← Aidbox Observations (LOINC-coded)
 *
 * All clinical data stays in Aidbox. These tools READ only — no writes.
 */

import { logger } from '../../common/logger.js';
import { aidboxClient } from '../../database/aidbox.js';
import {
  WEARABLE_LOINC_CODES,
  getLOINCCode,
  getRiskScoreMetrics,
  RPM_CPT_CODES,
} from '../../../shared/constants/loinc-codes.js';
import {
  PIN_CODES,
  CHI_CODES,
  CCM_CODES,
  calculateMaxMonthlyRevenue,
} from '../../../shared/constants/billing-codes.js';
import type {
  VitalsRequest,
  VitalsResponse,
  VitalReading,
  AnomalyRequest,
  AnomalyResponse,
  Anomaly,
  TrendRequest,
  TrendResponse,
  TrendDirection,
  RiskScoreRequest,
  RiskScoreResponse,
  RiskFactor,
  DeviceStatusRequest,
  DeviceStatusResponse,
  CareContextRequest,
  CareContextResponse,
  SeverityLevel,
} from './wearable-types.js';

// ─── FHIR Bundle Types (minimal, for Aidbox responses) ────────────────────────

interface FHIRObservation {
  id: string;
  code: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  valueQuantity?: {
    value: number;
    unit: string;
  };
  effectiveDateTime?: string;
  device?: {
    display: string;
    extension?: Array<{ url: string; valueString: string }>;
  };
  subject: {
    reference: string;
  };
}

interface FHIRBundle {
  resourceType: 'Bundle';
  total?: number;
  entry?: Array<{
    resource: FHIRObservation;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FHIRDevice {
  id: string;
  type?: { coding: Array<{ display: string }> };
  version?: Array<{ value: string }>;
  property?: Array<{
    type: { coding: Array<{ code: string }> };
    valueQuantity?: Array<{ value: number }>;
  }>;
  extension?: Array<{ url: string; valueString?: string; valueBoolean?: boolean }>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getTimeRange(range: string): string {
  const now = new Date();
  switch (range) {
    case 'latest':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '48h':
      return new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  }
}

function classifySeverity(score: number): SeverityLevel {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 4) return 'moderate';
  return 'low';
}

function classifyRiskLevel(score: number): SeverityLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

/** Simple linear regression — returns slope, intercept, rSquared */
function linearRegression(points: Array<{ x: number; y: number }>): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0, rSquared: 0 };

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n, rSquared: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const yMean = sumY / n;
  let ssRes = 0,
    ssTot = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssRes += (p.y - predicted) ** 2;
    ssTot += (p.y - yMean) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

/** Extract LOINC code from FHIR Observation */
function extractLOINCCode(obs: FHIRObservation): string | undefined {
  return obs.code.coding.find((c) => c.system === 'http://loinc.org')?.code;
}

/** Convert FHIR Observation to VitalReading (without baseline — added later) */
function observationToReading(
  obs: FHIRObservation,
  baseline: { mean: number; sd: number; count: number },
): VitalReading {
  const loincCode = extractLOINCCode(obs) ?? '';
  const loincDef = getLOINCCode(loincCode);
  const value = obs.valueQuantity?.value ?? 0;
  const deviation = baseline.sd > 0 ? (value - baseline.mean) / baseline.sd : 0;

  // Extract device platform from extension or default
  const platformExt = obs.device?.extension?.find(
    (e) => e.url === 'http://co-op.care/fhir/device-platform',
  );
  const platform =
    (platformExt?.valueString as import('../../../shared/constants/loinc-codes.js').DevicePlatform) ??
    'galaxy-watch';

  return {
    code: loincCode,
    display: loincDef?.display ?? obs.code.coding[0]?.display ?? 'Unknown',
    value,
    unit: obs.valueQuantity?.unit ?? loincDef?.unit ?? '',
    timestamp: obs.effectiveDateTime ?? new Date().toISOString(),
    observationId: obs.id,
    baseline: {
      mean: baseline.mean,
      standardDeviation: baseline.sd,
      sampleCount: baseline.count,
      deviationSigma: Math.round(deviation * 100) / 100,
    },
    source: platform,
  };
}

/** Fetch baseline statistics for a patient/metric over N days */
async function fetchBaseline(
  patientId: string,
  loincCode: string,
  days: number,
): Promise<{ mean: number; sd: number; count: number }> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const bundle = await aidboxClient.search<FHIRBundle>('Observation', {
      subject: `Patient/${patientId}`,
      code: `http://loinc.org|${loincCode}`,
      date: `ge${since}`,
      _count: '500',
      _sort: '-date',
    });

    const values = (bundle.entry ?? [])
      .map((e) => e.resource.valueQuantity?.value)
      .filter((v): v is number => v !== undefined);

    if (values.length === 0) {
      return { mean: 0, sd: 0, count: 0 };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const sd = Math.sqrt(variance);

    return {
      mean: Math.round(mean * 100) / 100,
      sd: Math.round(sd * 100) / 100,
      count: values.length,
    };
  } catch (error) {
    logger.warn({ patientId, loincCode, error }, 'Failed to fetch baseline, using defaults');
    return { mean: 0, sd: 0, count: 0 };
  }
}

// ─── Tool: get_vitals ──────────────────────────────────────────────────────────

export async function getVitals(req: VitalsRequest): Promise<VitalsResponse> {
  const { patientId, metric = 'all', range = 'latest' } = req;
  const since = getTimeRange(range);

  logger.info({ patientId, metric, range }, 'Fetching vitals');

  // Build LOINC code filter
  const loincCodes = metric === 'all' ? WEARABLE_LOINC_CODES.map((c) => c.code) : [metric];

  const codeParam = loincCodes.map((c) => `http://loinc.org|${c}`).join(',');

  const searchParams: Record<string, string> = {
    subject: `Patient/${patientId}`,
    code: codeParam,
    date: `ge${since}`,
    _sort: '-date',
    _count: range === 'latest' ? String(loincCodes.length) : '200',
  };

  const bundle = await aidboxClient.search<FHIRBundle>('Observation', searchParams);
  const observations = (bundle.entry ?? []).map((e) => e.resource);

  // For "latest" range, deduplicate to keep only most recent per metric
  let filtered = observations;
  if (range === 'latest') {
    const seen = new Set<string>();
    filtered = observations.filter((obs) => {
      const code = extractLOINCCode(obs);
      if (!code || seen.has(code)) return false;
      seen.add(code);
      return true;
    });
  }

  // Fetch baselines in parallel for all unique metrics
  const uniqueCodes = [...new Set(filtered.map(extractLOINCCode).filter(Boolean))] as string[];
  const baselineMap = new Map<string, { mean: number; sd: number; count: number }>();

  await Promise.all(
    uniqueCodes.map(async (code) => {
      const loincDef = getLOINCCode(code);
      const baseline = await fetchBaseline(patientId, code, loincDef?.baselineDays ?? 30);
      baselineMap.set(code, baseline);
    }),
  );

  const readings: VitalReading[] = filtered.map((obs) => {
    const code = extractLOINCCode(obs) ?? '';
    const baseline = baselineMap.get(code) ?? { mean: 0, sd: 0, count: 0 };
    return observationToReading(obs, baseline);
  });

  return {
    patientId,
    range,
    readings,
    fetchedAt: new Date().toISOString(),
    device: {
      platform: readings[0]?.source ?? 'galaxy-watch',
      model: 'Galaxy Watch 7',
      lastSyncAt: readings[0]?.timestamp ?? new Date().toISOString(),
    },
  };
}

// ─── Tool: get_anomalies ───────────────────────────────────────────────────────

export async function getAnomalies(req: AnomalyRequest): Promise<AnomalyResponse> {
  const { patientId, window = '48h', minSeverity = 3 } = req;

  logger.info({ patientId, window, minSeverity }, 'Detecting anomalies');

  // Fetch recent vitals
  const vitals = await getVitals({
    patientId,
    metric: 'all',
    range: window === '7d' ? '7d' : '24h',
  });

  // For 48h window, extend the search
  let allReadings = vitals.readings;
  if (window === '48h') {
    const extended = await getVitals({ patientId, metric: 'all', range: '7d' });
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    allReadings = extended.readings.filter((r) => r.timestamp >= cutoff);
  }

  // Detect anomalies: readings that exceed the threshold sigma from baseline
  const anomalies: Anomaly[] = [];
  let idCounter = 0;

  for (const reading of allReadings) {
    const loincDef = getLOINCCode(reading.code);
    const thresholdSigma = loincDef?.anomalyThresholdSigma ?? 2;
    const absDev = Math.abs(reading.baseline.deviationSigma);

    if (absDev >= thresholdSigma && reading.baseline.sampleCount >= 5) {
      // Calculate severity: scale deviation to 0-10
      const severity = Math.min(10, Math.round(absDev * 2.5));

      if (severity >= minSeverity) {
        idCounter++;
        anomalies.push({
          id: `anomaly-${patientId}-${idCounter}`,
          reading,
          severity,
          level: classifySeverity(severity),
          description: `${reading.display} is ${reading.baseline.deviationSigma > 0 ? 'elevated' : 'reduced'} at ${reading.value} ${reading.unit} (baseline: ${reading.baseline.mean} ± ${reading.baseline.standardDeviation})`,
          deviationSigma: absDev,
          direction: reading.baseline.deviationSigma > 0 ? 'above' : 'below',
          acknowledged: false,
          detectedAt: reading.timestamp,
          omahaProblemCode: loincDef?.omahaCode ?? '',
        });
      }
    }
  }

  // Sort by severity descending
  anomalies.sort((a, b) => b.severity - a.severity);

  // Generate summary
  const summary =
    anomalies.length === 0
      ? 'No anomalies detected. All vitals are within normal range.'
      : `${anomalies.length} anomal${anomalies.length === 1 ? 'y' : 'ies'} detected. ` +
        `Most significant: ${anomalies[0]?.description ?? 'unknown'}.`;

  return {
    patientId,
    window,
    anomalies,
    totalCount: anomalies.length,
    summary,
  };
}

// ─── Tool: get_trends ──────────────────────────────────────────────────────────

export async function getTrends(req: TrendRequest): Promise<TrendResponse> {
  const { patientId, metric, days = 30 } = req;
  const loincDef = getLOINCCode(metric);

  logger.info({ patientId, metric, days }, 'Analyzing trends');

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const bundle = await aidboxClient.search<FHIRBundle>('Observation', {
    subject: `Patient/${patientId}`,
    code: `http://loinc.org|${metric}`,
    date: `ge${since}`,
    _sort: 'date',
    _count: '500',
  });

  const observations = (bundle.entry ?? []).map((e) => e.resource);
  const values = observations
    .map((obs) => ({
      value: obs.valueQuantity?.value ?? 0,
      timestamp: obs.effectiveDateTime ?? '',
    }))
    .filter((v) => v.timestamp);

  if (values.length < 3) {
    return {
      patientId,
      metric: {
        code: metric,
        display: loincDef?.display ?? metric,
        unit: loincDef?.unit ?? '',
      },
      days,
      direction: 'stable',
      rateOfChange: 0,
      clinicallySignificant: false,
      statistics: {
        startValue: values[0]?.value ?? 0,
        endValue: values[values.length - 1]?.value ?? 0,
        minValue: 0,
        maxValue: 0,
        mean: 0,
        standardDeviation: 0,
        dataPoints: values.length,
        rSquared: 0,
      },
      interpretation: `Insufficient data for trend analysis (${values.length} data points, need at least 3).`,
    };
  }

  // Linear regression over time
  const firstValue = values[0]!;
  const lastValue = values[values.length - 1]!;
  const startTime = new Date(firstValue.timestamp).getTime();
  const points = values.map((v) => ({
    x: (new Date(v.timestamp).getTime() - startTime) / (24 * 60 * 60 * 1000), // days from start
    y: v.value,
  }));

  const regression = linearRegression(points);
  const allValues = values.map((v) => v.value);
  const mean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
  const variance = allValues.reduce((a, b) => a + (b - mean) ** 2, 0) / allValues.length;
  const sd = Math.sqrt(variance);

  // Determine direction based on slope significance
  const slopePerDay = regression.slope;
  const percentChange = mean !== 0 ? ((slopePerDay * days) / mean) * 100 : 0;

  let direction: TrendDirection = 'stable';
  if (regression.rSquared > 0.3 && Math.abs(percentChange) > 5) {
    // For most metrics, increasing = declining health (higher HR, lower SpO2)
    // For steps, increasing = improving
    const isHigherBetter = metric === '55423-8'; // Steps
    const isIncreasing = slopePerDay > 0;
    direction = isIncreasing === isHigherBetter ? 'improving' : 'declining';
  }

  const clinicallySignificant = regression.rSquared > 0.5 && Math.abs(percentChange) > 10;

  // Generate interpretation
  let interpretation: string;
  if (direction === 'stable') {
    interpretation = `${loincDef?.display ?? metric} has been stable over the last ${days} days, averaging ${mean.toFixed(1)} ${loincDef?.unit ?? ''}.`;
  } else {
    interpretation =
      `${loincDef?.display ?? metric} is ${direction} over the last ${days} days. ` +
      `Changed from ~${firstValue.value.toFixed(1)} to ~${lastValue.value.toFixed(1)} ${loincDef?.unit ?? ''} ` +
      `(${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%). ` +
      (clinicallySignificant
        ? 'This trend is clinically significant and may warrant attention.'
        : 'This trend is not yet clinically significant.');
  }

  return {
    patientId,
    metric: {
      code: metric,
      display: loincDef?.display ?? metric,
      unit: loincDef?.unit ?? '',
    },
    days,
    direction,
    rateOfChange: Math.round(slopePerDay * 1000) / 1000,
    clinicallySignificant,
    statistics: {
      startValue: firstValue.value,
      endValue: lastValue.value,
      minValue: Math.min(...allValues),
      maxValue: Math.max(...allValues),
      mean: Math.round(mean * 100) / 100,
      standardDeviation: Math.round(sd * 100) / 100,
      dataPoints: values.length,
      rSquared: Math.round(regression.rSquared * 1000) / 1000,
    },
    interpretation,
  };
}

// ─── Tool: get_risk_score ──────────────────────────────────────────────────────

export async function getRiskScore(req: RiskScoreRequest): Promise<RiskScoreResponse> {
  const { patientId } = req;

  logger.info({ patientId }, 'Calculating risk score');

  const riskMetrics = getRiskScoreMetrics();
  const factors: RiskFactor[] = [];
  let totalWeightedRisk = 0;
  let totalWeight = 0;

  // Analyze each metric that contributes to risk score
  await Promise.all(
    riskMetrics.map(async (metric) => {
      try {
        const trend = await getTrends({ patientId, metric: metric.code, days: 7 });
        await fetchBaseline(patientId, metric.code, metric.baselineDays);

        // Get most recent value
        const vitals = await getVitals({ patientId, metric: metric.code, range: 'latest' });
        const latestReading = vitals.readings[0];

        if (!latestReading) return;

        // Calculate individual risk contribution (0-1)
        const absDev = Math.abs(latestReading.baseline.deviationSigma);
        const trendPenalty = trend.direction === 'declining' ? 0.2 : 0;
        const contribution = Math.min(
          1,
          absDev / (metric.anomalyThresholdSigma * 2) + trendPenalty,
        );

        totalWeightedRisk += contribution * metric.riskScoreWeight;
        totalWeight += metric.riskScoreWeight;

        // Generate note
        let note = `${metric.display}: ${latestReading.value} ${metric.unit}`;
        if (trend.direction !== 'stable') {
          note += ` (${trend.direction})`;
        }
        if (absDev > metric.anomalyThresholdSigma) {
          note += ` — ${absDev.toFixed(1)} SD from baseline`;
        }

        factors.push({
          code: metric.code,
          display: metric.display,
          value: latestReading.value,
          unit: metric.unit,
          weight: metric.riskScoreWeight,
          contribution: Math.round(contribution * 100) / 100,
          trend: trend.direction,
          note,
        });
      } catch (error) {
        logger.warn({ patientId, metric: metric.code, error }, 'Failed to assess risk factor');
      }
    }),
  );

  // Composite score: 0-100
  const score = totalWeight > 0 ? Math.round((totalWeightedRisk / totalWeight) * 100) : 0;

  const level = classifyRiskLevel(score);

  // Estimate hospitalization probability
  const hospitalizationProbability = Math.min(0.95, (score / 100) * 0.6);

  // Sort factors by contribution
  factors.sort((a, b) => b.contribution - a.contribution);

  // Generate summary and recommendations
  const topFactors = factors.filter((f) => f.contribution > 0.3);
  const summary =
    score < 25
      ? `Low risk (score: ${score}/100). All vitals stable and within normal ranges.`
      : score < 50
        ? `Moderate risk (score: ${score}/100). ${topFactors.length > 0 ? `Watch: ${topFactors.map((f) => f.display).join(', ')}.` : 'Some metrics trending outside normal range.'}`
        : score < 75
          ? `High risk (score: ${score}/100). ${topFactors.map((f) => f.display).join(', ')} ${topFactors.length === 1 ? 'is' : 'are'} concerning. Consider clinical review.`
          : `Critical risk (score: ${score}/100). Multiple vitals significantly outside normal range. Urgent clinical review recommended.`;

  const recommendations: string[] = [];
  if (level === 'critical') {
    recommendations.push('Contact primary care physician or nurse line immediately');
    recommendations.push('Increase monitoring frequency to continuous');
  }
  if (level === 'high') {
    recommendations.push('Schedule clinical review within 24-48 hours');
    recommendations.push('Increase caregiver check-in frequency');
  }
  if (topFactors.some((f) => f.code === '2708-6')) {
    recommendations.push(
      'Monitor oxygen saturation closely — consider pulse oximeter verification',
    );
  }
  if (topFactors.some((f) => f.code === '93832-4')) {
    recommendations.push(
      'Sleep disruption detected — assess sleep environment and medication timing',
    );
  }
  if (topFactors.some((f) => f.code === '55423-8')) {
    recommendations.push('Activity decline detected — assess mobility and fall risk');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue routine monitoring');
  }

  return {
    patientId,
    score,
    level,
    hospitalizationProbability: Math.round(hospitalizationProbability * 100) / 100,
    factors,
    calculatedAt: new Date().toISOString(),
    summary,
    recommendations,
  };
}

// ─── Tool: get_device_status ───────────────────────────────────────────────────

export async function getDeviceStatus(req: DeviceStatusRequest): Promise<DeviceStatusResponse> {
  const { patientId } = req;

  logger.info({ patientId }, 'Checking device status');

  // Query for the most recent observation to determine last sync
  const recentBundle = await aidboxClient.search<FHIRBundle>('Observation', {
    subject: `Patient/${patientId}`,
    _sort: '-date',
    _count: '1',
  });

  const lastObs = recentBundle.entry?.[0]?.resource;
  const lastSyncAt = lastObs?.effectiveDateTime ?? new Date(0).toISOString();
  const hoursSinceSync = (Date.now() - new Date(lastSyncAt).getTime()) / (60 * 60 * 1000);

  // Check for data gaps in the last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekBundle = await aidboxClient.search<FHIRBundle>('Observation', {
    subject: `Patient/${patientId}`,
    code: 'http://loinc.org|8867-4', // Heart rate — most frequent metric
    date: `ge${weekAgo}`,
    _sort: 'date',
    _count: '500',
  });

  const hrObservations = (weekBundle.entry ?? []).map((e) => e.resource);

  // Detect gaps > 6 hours between consecutive heart rate readings
  const dataGaps: DeviceStatusResponse['dataGaps'] = [];
  for (let i = 1; i < hrObservations.length; i++) {
    const prevObs = hrObservations[i - 1]!;
    const currObs = hrObservations[i]!;
    const prev = new Date(prevObs.effectiveDateTime ?? '').getTime();
    const curr = new Date(currObs.effectiveDateTime ?? '').getTime();
    const gapHours = (curr - prev) / (60 * 60 * 1000);

    if (gapHours > 6) {
      dataGaps.push({
        startAt: prevObs.effectiveDateTime ?? '',
        endAt: currObs.effectiveDateTime ?? '',
        durationHours: Math.round(gapHours * 10) / 10,
        missingMetrics: ['8867-4', '80404-7', '2708-6'], // HR, HRV, SpO2 typically gap together
      });
    }
  }

  // Check if there's an ongoing gap (last reading > 6 hours ago)
  if (hoursSinceSync > 6 && hrObservations.length > 0) {
    dataGaps.push({
      startAt: lastSyncAt,
      endAt: null,
      durationHours: Math.round(hoursSinceSync * 10) / 10,
      missingMetrics: ['8867-4', '80404-7', '2708-6'],
    });
  }

  // Calculate wear compliance (percentage of 7-day period with data)
  const totalHours = 7 * 24;
  const gapHours = dataGaps.reduce((sum, g) => sum + g.durationHours, 0);
  const wearCompliance = Math.round(((totalHours - gapHours) / totalHours) * 100);

  // Count RPM data transmission days this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthBundle = await aidboxClient.search<FHIRBundle>('Observation', {
    subject: `Patient/${patientId}`,
    date: `ge${monthStart.toISOString()}`,
    _sort: 'date',
    _count: '1000',
  });

  const dataDays = new Set(
    (monthBundle.entry ?? [])
      .map((e) => {
        const dt = e.resource.effectiveDateTime;
        return dt ? dt.slice(0, 10) : '';
      })
      .filter(Boolean),
  );

  // Identify issues
  const issues: string[] = [];
  if (hoursSinceSync > 18) {
    issues.push(
      `No data for ${Math.round(hoursSinceSync)} hours — device may be off, uncharged, or out of range`,
    );
  } else if (hoursSinceSync > 6) {
    issues.push(
      `Last sync was ${Math.round(hoursSinceSync)} hours ago — check Bluetooth connection`,
    );
  }
  if (wearCompliance < 70) {
    issues.push(
      `Low wear compliance (${wearCompliance}%) — encourage consistent wear for accurate monitoring`,
    );
  }
  if (dataGaps.length > 3) {
    issues.push(`${dataGaps.length} data gaps detected this week — may affect trend accuracy`);
  }
  if (dataDays.size < 16 && new Date().getDate() > 20) {
    issues.push(`Only ${dataDays.size} RPM data days this month — need 16+ for CPT 99454 billing`);
  }

  // ─── Billing eligibility summary ─────────────────────────────────────────────
  // Surface full revenue stack awareness so Sage AI can report billing status.
  // RPM (99454): requires 16+ data days/month from device
  // PIN (G0023): requires navigation services, incident-to physician
  // CHI (G0019): requires community health integration, incident-to physician
  // CCM (99490): requires 20+ minutes/month clinical staff time for chronic conditions
  // Calculate max revenue assuming full engagement for this patient
  const maxRevenue = calculateMaxMonthlyRevenue({
    pinMinutes: 90, // 60 min base + 30 min additional
    chiMinutes: 90, // 60 min base + 30 min additional
    ccmMinutes: 20, // Standard CCM (not complex)
    rpmDataDays: dataDays.size,
    rpmManagementMinutes: 40, // 20 base + 20 additional
    isComplexCCM: false,
    isFirstRPMMonth: false,
  });

  const billingEligibility = {
    rpm: {
      eligible: dataDays.size >= 16,
      dataDaysThisMonth: dataDays.size,
      requiredDays: 16,
      codes: RPM_CPT_CODES.map((c: { code: string }) => c.code),
      note:
        dataDays.size >= 16
          ? 'RPM data day threshold met — 99454 billable this month'
          : `${16 - dataDays.size} more data days needed for RPM billing`,
    },
    pin: {
      codes: PIN_CODES.map((c) => c.code),
      note: 'PIN (G0023/G0024) requires navigation services by Conductor, billed incident-to Clinical Director',
    },
    chi: {
      codes: CHI_CODES.map((c) => c.code),
      note: 'CHI (G0019/G0022) requires community health integration services, billed incident-to Clinical Director',
    },
    ccm: {
      codes: CCM_CODES.map((c) => c.code),
      note: 'CCM (99490/99491) requires 20+ min/month clinical staff time for 2+ chronic conditions',
    },
    maxMonthlyRevenueCents: maxRevenue.total,
  };

  return {
    patientId,
    device: {
      platform: 'galaxy-watch',
      model: 'Galaxy Watch 7',
      firmwareVersion: 'One UI Watch 6.0',
      batteryLevel: 72, // Would come from device API in production
      isWorn: hoursSinceSync < 2,
    },
    sync: {
      lastSyncAt,
      hoursSinceSync: Math.round(hoursSinceSync * 10) / 10,
      syncOverdue: hoursSinceSync > 6,
    },
    dataGaps,
    wearCompliance,
    rpmDataDays: dataDays.size,
    billingEligibility,
    issues,
  };
}

// ─── Tool: get_care_context ────────────────────────────────────────────────────

export async function getCareContext(req: CareContextRequest): Promise<CareContextResponse> {
  const {
    patientId,
    includeVitals = true,
    includeCareLogs = true,
    includeMedications = true,
    includeRiskScore = true,
  } = req;

  logger.info({ patientId }, 'Assembling care context');

  // Fetch all requested data in parallel
  const [vitalsResult, anomaliesResult, riskScoreResult, deviceStatusResult, patientResult] =
    await Promise.all([
      includeVitals ? getVitals({ patientId, range: 'latest' }).catch(() => null) : null,
      includeVitals ? getAnomalies({ patientId, window: '48h' }).catch(() => null) : null,
      includeRiskScore ? getRiskScore({ patientId }).catch(() => null) : null,
      getDeviceStatus({ patientId }).catch(() => null),
      aidboxClient
        .read<{
          id: string;
          name?: Array<{ given?: string[]; family?: string }>;
        }>('Patient', patientId)
        .catch(() => null),
    ]);

  // Get patient name
  const patientName = patientResult?.name?.[0]
    ? `${patientResult.name[0].given?.join(' ') ?? ''} ${patientResult.name[0].family ?? ''}`.trim()
    : `Patient ${patientId}`;

  // Fetch care logs from PostgreSQL would go here — for now, return empty
  // In production, this queries the timebank_task table for completed tasks
  const careLogs = includeCareLogs ? [] : undefined;

  // Fetch medications from Aidbox
  let medications;
  if (includeMedications) {
    try {
      const medBundle = await aidboxClient.search<{
        entry?: Array<{
          resource: {
            id: string;
            medicationCodeableConcept?: { text: string };
            dosage?: Array<{ text: string }>;
            status: string;
          };
        }>;
      }>('MedicationStatement', {
        subject: `Patient/${patientId}`,
        status: 'active',
      });

      medications = (medBundle.entry ?? []).map((e) => ({
        id: e.resource.id,
        name: e.resource.medicationCodeableConcept?.text ?? 'Unknown medication',
        dosage: e.resource.dosage?.[0]?.text ?? '',
        frequency: '',
        active: e.resource.status === 'active',
      }));
    } catch {
      medications = [];
    }
  }

  // Build comprehensive summary for Sage AI
  const summaryParts: string[] = [];

  if (vitalsResult && vitalsResult.readings.length > 0) {
    const vitalsSummary = vitalsResult.readings
      .map((r) => `${r.display}: ${r.value} ${r.unit}`)
      .join(', ');
    summaryParts.push(`Latest vitals: ${vitalsSummary}.`);
  }

  if (anomaliesResult && anomaliesResult.anomalies.length > 0) {
    summaryParts.push(anomaliesResult.summary);
  } else if (anomaliesResult) {
    summaryParts.push('No anomalies detected.');
  }

  if (riskScoreResult) {
    summaryParts.push(riskScoreResult.summary);
  }

  if (deviceStatusResult?.issues && deviceStatusResult.issues.length > 0) {
    summaryParts.push(`Device issues: ${deviceStatusResult.issues.join('; ')}.`);
  }

  // Billing eligibility summary for Sage AI
  if (deviceStatusResult?.billingEligibility) {
    const billing = deviceStatusResult.billingEligibility;
    const rpmStatus = billing.rpm.eligible
      ? 'RPM ✓'
      : `RPM (${billing.rpm.dataDaysThisMonth}/${billing.rpm.requiredDays} days)`;
    const maxRevenue = (billing.maxMonthlyRevenueCents / 100).toFixed(0);
    summaryParts.push(
      `Billing: ${rpmStatus}. PIN/CHI/CCM available with Conductor services + Clinical Director incident-to. ` +
        `Max monthly revenue: $${maxRevenue}/patient if all layers active.`,
    );
  }

  if (careLogs && careLogs.length > 0) {
    summaryParts.push(`${careLogs.length} care visits in the last 7 days.`);
  }

  if (medications && medications.length > 0) {
    summaryParts.push(`${medications.length} active medications.`);
  }

  const summary =
    summaryParts.length > 0
      ? summaryParts.join(' ')
      : `Care context for ${patientName}. Limited data available — device may need attention.`;

  return {
    patientId,
    patientName,
    vitals: vitalsResult ?? undefined,
    anomalies: anomaliesResult ?? undefined,
    riskScore: riskScoreResult ?? undefined,
    careLogs,
    medications,
    deviceStatus: deviceStatusResult ?? undefined,
    summary,
    assembledAt: new Date().toISOString(),
  };
}
