/**
 * Employer module tests — k-anonymity, PEPM calculations, ROI formulas, schema validation
 */
import { describe, it, expect } from 'vitest';
import { employerService } from './service';
import { quarterlyROIQuerySchema } from './schemas';
import { FINANCIALS } from '@shared/constants/business-rules';

describe('Employer: K-Anonymity', () => {
  const { kAnonymize, K_ANONYMITY_THRESHOLD } = employerService;

  it('threshold is 5', () => {
    expect(K_ANONYMITY_THRESHOLD).toBe(5);
  });

  it('suppresses counts below threshold', () => {
    expect(kAnonymize(0)).toBeNull();
    expect(kAnonymize(1)).toBeNull();
    expect(kAnonymize(4)).toBeNull();
  });

  it('passes counts at or above threshold', () => {
    expect(kAnonymize(5)).toBe(5);
    expect(kAnonymize(10)).toBe(10);
    expect(kAnonymize(100)).toBe(100);
  });

  it('exact threshold boundary', () => {
    expect(kAnonymize(K_ANONYMITY_THRESHOLD - 1)).toBeNull();
    expect(kAnonymize(K_ANONYMITY_THRESHOLD)).toBe(K_ANONYMITY_THRESHOLD);
  });
});

describe('Employer: Quarterly ROI Generation', () => {
  it('generates correct number of quarters', () => {
    const result = employerService.generateQuarterlyROI(50, 500, 4);
    expect(result.length).toBe(4);
  });

  it('generates 1 quarter when requested', () => {
    const result = employerService.generateQuarterlyROI(50, 500, 1);
    expect(result.length).toBe(1);
  });

  it('calculates PEPM revenue correctly (3 months per quarter)', () => {
    const enrolled = 50;
    const result = employerService.generateQuarterlyROI(enrolled, 1000, 1);
    const expected = enrolled * FINANCIALS.EMPLOYER_PEPM_CENTS * 3;
    expect(result[0]!.pepmRevenueCents).toBe(expected);
  });

  it('uses private pay rate for productivity value', () => {
    const result = employerService.generateQuarterlyROI(10, 100, 1);
    const q = result[0]!;
    // With 1 quarter and weight=1, all care hours go to this quarter
    const expectedProductivity = Math.round(
      q.careHoursDelivered * FINANCIALS.PRIVATE_PAY_RATE_CENTS_PER_HOUR,
    );
    expect(q.productivityValueCents).toBe(expectedProductivity);
  });

  it('distributes care hours weighted toward recent quarters', () => {
    const result = employerService.generateQuarterlyROI(50, 1000, 4);
    // Last quarter (most recent) should have the most hours
    expect(result[3]!.careHoursDelivered).toBeGreaterThan(result[0]!.careHoursDelivered);
  });

  it('net ROI = productivity + readmission - PEPM', () => {
    const result = employerService.generateQuarterlyROI(50, 500, 1);
    const q = result[0]!;
    expect(q.netROICents).toBe(
      q.productivityValueCents + q.readmissionSavingsCents - q.pepmRevenueCents,
    );
  });

  it('ROI multiple = (productivity + readmission) / PEPM', () => {
    const result = employerService.generateQuarterlyROI(50, 500, 1);
    const q = result[0]!;
    const expected =
      Math.round(
        ((q.productivityValueCents + q.readmissionSavingsCents) / q.pepmRevenueCents) * 100,
      ) / 100;
    expect(q.roiMultiple).toBe(expected);
  });

  it('handles zero employees gracefully', () => {
    const result = employerService.generateQuarterlyROI(0, 500, 2);
    expect(result.length).toBe(2);
    expect(result[0]!.pepmRevenueCents).toBe(0);
    expect(result[0]!.roiMultiple).toBe(0);
  });

  it('handles zero care hours', () => {
    const result = employerService.generateQuarterlyROI(50, 0, 2);
    expect(result.length).toBe(2);
    expect(result[0]!.careHoursDelivered).toBe(0);
    expect(result[0]!.productivityValueCents).toBe(0);
  });
});

describe('Employer: PEPM Financial Constants', () => {
  it('PEPM is $4.50 (450 cents)', () => {
    expect(FINANCIALS.EMPLOYER_PEPM_CENTS).toBe(450);
  });

  it('private pay rate is $35/hr (3500 cents)', () => {
    expect(FINANCIALS.PRIVATE_PAY_RATE_CENTS_PER_HOUR).toBe(3500);
  });

  it('BCH readmission rate is 15.4%', () => {
    expect(FINANCIALS.BCH_READMISSION_RATE).toBe(0.154);
  });

  it('BCH readmission cost is $16,037 (1603700 cents)', () => {
    expect(FINANCIALS.BCH_READMISSION_COST_CENTS).toBe(1603700);
  });
});

describe('Employer: Productivity Impact Math', () => {
  it('absenteeism reduction = care hours × 0.5', () => {
    const careHours = 100;
    const reduction = Math.round(careHours * 0.5 * 10) / 10;
    expect(reduction).toBe(50);
  });

  it('productivity value = care hours × $35', () => {
    const careHours = 100;
    const value = Math.round(careHours * FINANCIALS.PRIVATE_PAY_RATE_CENTS_PER_HOUR);
    expect(value).toBe(350000); // $3,500
  });

  it('readmission avoidance = (hours/100) × baseline rate', () => {
    const careHours = 200;
    const avoidance = Math.round((careHours / 100) * FINANCIALS.BCH_READMISSION_RATE * 10) / 10;
    expect(avoidance).toBe(0.3); // 0.308 rounded to 1 decimal
  });

  it('readmission savings = avoided × $16,037', () => {
    const avoided = 1.5;
    const savings = Math.round(avoided * FINANCIALS.BCH_READMISSION_COST_CENTS);
    expect(savings).toBe(2405550); // $24,055.50
  });
});

describe('Employer: Schema Validation', () => {
  describe('quarterlyROIQuerySchema', () => {
    it('accepts valid quarters', () => {
      expect(quarterlyROIQuerySchema.safeParse({ quarters: 4 }).success).toBe(true);
      expect(quarterlyROIQuerySchema.safeParse({ quarters: '4' }).success).toBe(true); // coerce
    });

    it('defaults to 4 quarters when omitted', () => {
      const result = quarterlyROIQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.quarters).toBe(4);
    });

    it('rejects quarters > 8', () => {
      expect(quarterlyROIQuerySchema.safeParse({ quarters: 9 }).success).toBe(false);
    });

    it('rejects quarters < 1', () => {
      expect(quarterlyROIQuerySchema.safeParse({ quarters: 0 }).success).toBe(false);
    });

    it('accepts boundary values', () => {
      expect(quarterlyROIQuerySchema.safeParse({ quarters: 1 }).success).toBe(true);
      expect(quarterlyROIQuerySchema.safeParse({ quarters: 8 }).success).toBe(true);
    });
  });
});
