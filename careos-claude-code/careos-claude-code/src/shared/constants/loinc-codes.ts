/**
 * LOINC Codes for Wearable Vitals — Multi-Device Support
 *
 * Maps wearable health metrics to FHIR Observation.code in Aidbox.
 * Supports Apple HealthKit (Apple Watch) and Samsung Health / Google Health Connect
 * (Galaxy Watch). Galaxy Watch is PRIMARY for elderly companion care — lower cost,
 * broader Android ecosystem, Samsung BioActive sensor, Verily Pre platform integration.
 *
 * Data flow: Galaxy Watch → Samsung Health → Health Connect → co-op.care sync → Aidbox FHIR R4
 *           Apple Watch → HealthKit → co-op.care sync → Aidbox FHIR R4
 */

// ─── Device Platform ────────────────────────────────────────────────────────

export type DevicePlatform = 'galaxy-watch' | 'apple-watch' | 'fitbit' | 'other';

export interface DeviceProfile {
  platform: DevicePlatform;
  label: string;
  description: string;
  recommended: boolean;
  supportedMetrics: string[]; // LOINC codes
  dataSource: string;
  setupInstructions: string[];
}

export const DEVICE_PROFILES: readonly DeviceProfile[] = [
  {
    platform: 'galaxy-watch',
    label: 'Samsung Galaxy Watch',
    description:
      'Recommended for co-op.care. FDA-cleared ECG, AFib detection, sleep apnea assessment, SpO2, body composition. Works with any Android phone via Health Connect.',
    recommended: true,
    supportedMetrics: [
      '8867-4',
      '80404-7',
      '93832-4',
      '55423-8',
      '2708-6',
      '8310-5',
      '73708-0',
      '88020-3',
      '55284-4',
    ],
    dataSource: 'health-connect',
    setupInstructions: [
      'Pair the Galaxy Watch with their Android phone via Galaxy Wearable app',
      'Open Samsung Health on the phone and enable background sync',
      'Open Health Connect settings and grant co-op.care read access',
      'Tap "Connect" below to authorize data access',
    ],
  },
  {
    platform: 'apple-watch',
    label: 'Apple Watch',
    description:
      'Full support for Apple ecosystem users. ECG, fall detection, SpO2, sleep tracking. Requires iPhone.',
    recommended: false,
    supportedMetrics: ['8867-4', '80404-7', '93832-4', '55423-8', '2708-6', '85354-9'],
    dataSource: 'apple-healthkit',
    setupInstructions: [
      'Ensure the Apple Watch is paired with their iPhone',
      'Open the Health app on their iPhone',
      'Go to Settings > Privacy > Apps and enable CareOS',
      'Tap "Connect" below to authorize data access',
    ],
  },
  {
    platform: 'fitbit',
    label: 'Fitbit / Google Pixel Watch',
    description: 'Basic vitals via Health Connect. Heart rate, sleep, steps, SpO2.',
    recommended: false,
    supportedMetrics: ['8867-4', '93832-4', '55423-8', '2708-6'],
    dataSource: 'health-connect',
    setupInstructions: [
      'Ensure the Fitbit/Pixel Watch is paired with their Android phone',
      'Open Fitbit app and enable Health Connect sync',
      'Grant co-op.care read access in Health Connect settings',
      'Tap "Connect" below to authorize data access',
    ],
  },
] as const;

// ─── LOINC Code Definitions ─────────────────────────────────────────────────

export interface LOINCCode {
  code: string;
  display: string;
  unit: string;
  /** Apple HealthKit quantity/category type identifier */
  appleHealthKey: string;
  /** Samsung Health / Google Health Connect data type */
  healthConnectType: string;
  /** Samsung Health SDK specific key (for deeper Samsung integration) */
  samsungHealthKey: string;
  /** Omaha System problem domain mapping */
  omahaDomain: string;
  omahaCode: string;
  /** Anomaly detection: flag when reading exceeds this many SDs from baseline */
  anomalyThresholdSigma: number;
  /** Number of days used to calculate personal baseline */
  baselineDays: number;
  /** Which device platforms support this metric */
  platforms: DevicePlatform[];
  /** Whether this metric contributes to the 72-96hr hospitalization risk score */
  riskScoreWeight: number;
  /** RPM: does this metric count toward CMS data transmission day requirements? */
  rpmEligible: boolean;
}

export const WEARABLE_LOINC_CODES: readonly LOINCCode[] = [
  // ─── Core vitals (all devices) ──────────────────────────────────────────
  {
    code: '8867-4',
    display: 'Heart rate',
    unit: 'beats/minute',
    appleHealthKey: 'HKQuantityTypeIdentifierRestingHeartRate',
    healthConnectType: 'androidx.health.connect.client.records.HeartRateRecord',
    samsungHealthKey: 'com.samsung.health.heart_rate',
    omahaDomain: 'Circulation',
    omahaCode: '#27',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
    platforms: ['galaxy-watch', 'apple-watch', 'fitbit'],
    riskScoreWeight: 0.25,
    rpmEligible: true,
  },
  {
    code: '80404-7',
    display: 'Heart rate variability',
    unit: 'ms',
    appleHealthKey: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    healthConnectType: 'androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord',
    samsungHealthKey: 'com.samsung.health.heart_rate.heart_rate_variability',
    omahaDomain: 'Circulation',
    omahaCode: '#27',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
    platforms: ['galaxy-watch', 'apple-watch'],
    riskScoreWeight: 0.2,
    rpmEligible: true,
  },
  {
    code: '93832-4',
    display: 'Sleep duration',
    unit: 'hours',
    appleHealthKey: 'HKCategoryTypeIdentifierSleepAnalysis',
    healthConnectType: 'androidx.health.connect.client.records.SleepSessionRecord',
    samsungHealthKey: 'com.samsung.health.sleep',
    omahaDomain: 'Sleep/Rest',
    omahaCode: '#36',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
    platforms: ['galaxy-watch', 'apple-watch', 'fitbit'],
    riskScoreWeight: 0.15,
    rpmEligible: true,
  },
  {
    code: '55423-8',
    display: 'Steps',
    unit: 'steps/day',
    appleHealthKey: 'HKQuantityTypeIdentifierStepCount',
    healthConnectType: 'androidx.health.connect.client.records.StepsRecord',
    samsungHealthKey: 'com.samsung.health.step_count',
    omahaDomain: 'Physical Activity',
    omahaCode: '#37',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
    platforms: ['galaxy-watch', 'apple-watch', 'fitbit'],
    riskScoreWeight: 0.15,
    rpmEligible: true,
  },
  {
    code: '2708-6',
    display: 'Oxygen saturation (SpO2)',
    unit: '%',
    appleHealthKey: 'HKQuantityTypeIdentifierOxygenSaturation',
    healthConnectType: 'androidx.health.connect.client.records.OxygenSaturationRecord',
    samsungHealthKey: 'com.samsung.health.oxygen_saturation',
    omahaDomain: 'Respiration',
    omahaCode: '#26',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
    platforms: ['galaxy-watch', 'apple-watch', 'fitbit'],
    riskScoreWeight: 0.25,
    rpmEligible: true,
  },

  // ─── Galaxy Watch exclusive metrics ─────────────────────────────────────
  {
    code: '8310-5',
    display: 'Body temperature (skin)',
    unit: '°C',
    appleHealthKey: '',
    healthConnectType: 'androidx.health.connect.client.records.SkinTemperatureRecord',
    samsungHealthKey: 'com.samsung.health.skin_temperature',
    omahaDomain: 'Circulation',
    omahaCode: '#27',
    anomalyThresholdSigma: 2,
    baselineDays: 14,
    platforms: ['galaxy-watch'],
    riskScoreWeight: 0.1,
    rpmEligible: true,
  },
  {
    code: '73708-0',
    display: 'Body fat percentage',
    unit: '%',
    appleHealthKey: '',
    healthConnectType: 'androidx.health.connect.client.records.BodyFatRecord',
    samsungHealthKey: 'com.samsung.health.body_composition.body_fat',
    omahaDomain: 'Nutrition',
    omahaCode: '#31',
    anomalyThresholdSigma: 2,
    baselineDays: 90,
    platforms: ['galaxy-watch'],
    riskScoreWeight: 0.05,
    rpmEligible: false,
  },
  {
    code: '88020-3',
    display: 'Sleep apnea risk assessment',
    unit: 'score',
    appleHealthKey: '',
    healthConnectType: '',
    samsungHealthKey: 'com.samsung.health.sleep.sleep_apnea',
    omahaDomain: 'Respiration',
    omahaCode: '#26',
    anomalyThresholdSigma: 1.5,
    baselineDays: 30,
    platforms: ['galaxy-watch'],
    riskScoreWeight: 0.15,
    rpmEligible: true,
  },

  // ─── Blood pressure (external cuff or Galaxy Watch 7+) ─────────────────
  {
    code: '55284-4',
    display: 'Blood pressure systolic and diastolic',
    unit: 'mmHg',
    appleHealthKey: '',
    healthConnectType: 'androidx.health.connect.client.records.BloodPressureRecord',
    samsungHealthKey: 'com.samsung.health.blood_pressure',
    omahaDomain: 'Circulation',
    omahaCode: '#27',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
    platforms: ['galaxy-watch'],
    riskScoreWeight: 0.2,
    rpmEligible: true,
  },
  {
    code: '85354-9',
    display: 'Blood pressure panel',
    unit: 'mmHg',
    appleHealthKey: 'HKQuantityTypeIdentifierBloodPressureSystolic',
    healthConnectType: 'androidx.health.connect.client.records.BloodPressureRecord',
    samsungHealthKey: 'com.samsung.health.blood_pressure',
    omahaDomain: 'Circulation',
    omahaCode: '#27',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
    platforms: ['apple-watch'],
    riskScoreWeight: 0.2,
    rpmEligible: true,
  },
] as const;

// ─── CPT Codes for RPM Billing ──────────────────────────────────────────────

export interface CPTCode {
  code: string;
  display: string;
  rate2026: number;
  frequency: 'one-time' | 'monthly';
  minDataDays: number;
  minMinutes: number;
  canStackWith: string[];
  notes: string;
}

export const RPM_CPT_CODES: readonly CPTCode[] = [
  {
    code: '99453',
    display: 'RPM setup and patient education',
    rate2026: 22,
    frequency: 'one-time',
    minDataDays: 2,
    minMinutes: 0,
    canStackWith: ['99454', '99457'],
    notes: 'One-time per enrollment. Requires at least 2 days of monitoring data.',
  },
  {
    code: '99454',
    display: 'RPM device supply (16+ days data)',
    rate2026: 47,
    frequency: 'monthly',
    minDataDays: 16,
    minMinutes: 0,
    canStackWith: ['99453', '99457', '99458'],
    notes:
      'Monthly. Requires 16+ days of data transmission in 30-day period. Cannot combine with 99445.',
  },
  {
    code: '99445',
    display: 'RPM device supply (2-15 days data)',
    rate2026: 50,
    frequency: 'monthly',
    minDataDays: 2,
    minMinutes: 0,
    canStackWith: ['99453', '99470'],
    notes: 'NEW 2026. For episodic/transitional monitoring. Cannot combine with 99454 or 99457.',
  },
  {
    code: '99457',
    display: 'RPM management first 20 minutes',
    rate2026: 52,
    frequency: 'monthly',
    minDataDays: 16,
    minMinutes: 20,
    canStackWith: ['99453', '99454', '99458'],
    notes:
      'Monthly. Requires 20 cumulative minutes of clinical review. Requires interactive communication.',
  },
  {
    code: '99458',
    display: 'RPM management additional 20 minutes',
    rate2026: 40,
    frequency: 'monthly',
    minDataDays: 16,
    minMinutes: 20,
    canStackWith: ['99457'],
    notes: 'Add-on to 99457. Each additional 20-minute increment.',
  },
  {
    code: '99470',
    display: 'RPM management 10 minutes',
    rate2026: 26,
    frequency: 'monthly',
    minDataDays: 2,
    minMinutes: 10,
    canStackWith: ['99445'],
    notes:
      'NEW 2026. For shorter management interactions (10-19 min). Cannot combine with 99454/99457.',
  },
] as const;

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

export function getLOINCCode(code: string): LOINCCode | undefined {
  return WEARABLE_LOINC_CODES.find((c) => c.code === code);
}

export function getMetricsForPlatform(platform: DevicePlatform): LOINCCode[] {
  return WEARABLE_LOINC_CODES.filter((c) => c.platforms.includes(platform));
}

export function getRPMEligibleMetrics(): LOINCCode[] {
  return WEARABLE_LOINC_CODES.filter((c) => c.rpmEligible);
}

export function getRiskScoreMetrics(): LOINCCode[] {
  return WEARABLE_LOINC_CODES.filter((c) => c.riskScoreWeight > 0);
}

export function getDeviceProfile(platform: DevicePlatform): DeviceProfile | undefined {
  return DEVICE_PROFILES.find((d) => d.platform === platform);
}

export function getCPTCode(code: string): CPTCode | undefined {
  return RPM_CPT_CODES.find((c) => c.code === code);
}

/**
 * Calculate maximum monthly RPM revenue per patient.
 * Full engagement: 99453 (month 1) + 99454 + 99457 + 99458
 * = $22 (once) + $47 + $52 + $40 = $161 month 1, $139/mo ongoing
 */
export function calculateMonthlyRPMRevenue(
  dataDays: number,
  managementMinutes: number,
  isFirstMonth: boolean,
): number {
  let revenue = 0;

  if (isFirstMonth && dataDays >= 2) {
    revenue += 22; // 99453 setup
  }

  if (dataDays >= 16) {
    revenue += 47; // 99454
    if (managementMinutes >= 20) {
      revenue += 52; // 99457
      const additionalIncrements = Math.floor((managementMinutes - 20) / 20);
      revenue += additionalIncrements * 40; // 99458
    }
  } else if (dataDays >= 2) {
    revenue += 50; // 99445
    if (managementMinutes >= 10) {
      revenue += 26; // 99470
    }
  }

  return revenue;
}
