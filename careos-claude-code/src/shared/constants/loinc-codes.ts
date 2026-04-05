/**
 * LOINC Codes for Apple Health API Wearable Vitals
 * These map to FHIR Observation.code in Aidbox
 */

export interface LOINCCode {
  code: string;
  display: string;
  unit: string;
  appleHealthKey: string;
  anomalyThresholdSigma: number;
  baselineDays: number;
}

export const WEARABLE_LOINC_CODES: readonly LOINCCode[] = [
  {
    code: '8867-4',
    display: 'Heart rate',
    unit: 'beats/minute',
    appleHealthKey: 'HKQuantityTypeIdentifierRestingHeartRate',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
  },
  {
    code: '80404-7',
    display: 'Heart rate variability',
    unit: 'ms',
    appleHealthKey: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
  },
  {
    code: '93832-4',
    display: 'Sleep duration',
    unit: 'hours',
    appleHealthKey: 'HKCategoryTypeIdentifierSleepAnalysis',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
  },
  {
    code: '55423-8',
    display: 'Steps',
    unit: 'steps/day',
    appleHealthKey: 'HKQuantityTypeIdentifierStepCount',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
  },
  {
    code: '2708-6',
    display: 'Oxygen saturation (SpO2)',
    unit: '%',
    appleHealthKey: 'HKQuantityTypeIdentifierOxygenSaturation',
    anomalyThresholdSigma: 2,
    baselineDays: 30,
  },
] as const;

export function getLOINCCode(code: string): LOINCCode | undefined {
  return WEARABLE_LOINC_CODES.find(c => c.code === code);
}
