/**
 * Assessment Module Tests
 * Zone classification edge cases, CRI scoring, KBS validation, schemas
 */
import { describe, it, expect } from 'vitest';
import { scoreCII, scoreMiniCII } from './cii.js';
import { scoreCRI } from './cri.js';
import { validateKBS } from './kbs.js';
import {
  submitCIISchema,
  submitMiniCIISchema,
  submitCRISchema,
  submitKBSSchema,
} from './schemas.js';
import {
  CII_DIMENSION_COUNT,
  CII_MAX_SCORE,
  MINI_CII_MAX_SCORE,
  CRI_MIN_RAW,
  CRI_MAX_RAW,
  CRI_FACTOR_COUNT,
  KBS_MIN,
  KBS_MAX,
} from '@shared/constants/business-rules';

// ============================================================
// CII Zone Classification Edge Cases
// ============================================================

describe('CII Scoring', () => {
  it('all 1s → total 12, Green zone', () => {
    const scores = Array(12).fill(1);
    const result = scoreCII(scores);
    expect(result.totalScore).toBe(12);
    expect(result.zone).toBe('GREEN');
  });

  it('all 10s → total 120, Red zone', () => {
    const scores = Array(12).fill(10);
    const result = scoreCII(scores);
    expect(result.totalScore).toBe(CII_MAX_SCORE);
    expect(result.zone).toBe('RED');
  });

  it('score 40 → Green zone (upper boundary)', () => {
    // 10 dimensions at 3 + 2 at 5 = 30 + 10 = 40
    const scores = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5];
    const result = scoreCII(scores);
    expect(result.totalScore).toBe(40);
    expect(result.zone).toBe('GREEN');
  });

  it('score 41 → Yellow zone (lower boundary)', () => {
    // 9 at 3 + 3 at (14/3 ≈ 4.67) → adjust: 9*3 + 2*5 + 1*4 = 27+10+4 = 41
    const scores = [3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 4];
    const result = scoreCII(scores);
    expect(result.totalScore).toBe(41);
    expect(result.zone).toBe('YELLOW');
  });

  it('score 79 → Yellow zone (upper boundary)', () => {
    // 7*10 + 1*5 + 4*1 = 70+5+4 = 79
    const scores = [10, 10, 10, 10, 10, 10, 10, 5, 1, 1, 1, 1];
    const result = scoreCII(scores);
    expect(result.totalScore).toBe(79);
    expect(result.zone).toBe('YELLOW');
  });

  it('score 84 → Red zone (above boundary)', () => {
    // 8*10 + 4*1 = 84
    const scores = [10, 10, 10, 10, 10, 10, 10, 10, 1, 1, 1, 1];
    const result = scoreCII(scores);
    expect(result.totalScore).toBe(84);
    expect(result.zone).toBe('RED');
  });

  it('score exactly 80 → Red zone', () => {
    // 7*10 + 5*2 = 70+10 = 80
    const scores = [10, 10, 10, 10, 10, 10, 10, 2, 2, 2, 2, 2];
    const result = scoreCII(scores);
    expect(result.totalScore).toBe(80);
    expect(result.zone).toBe('RED');
  });

  it('preserves all 12 dimension scores', () => {
    const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2];
    const result = scoreCII(scores);
    expect(result.scores).toEqual(scores);
    expect(result.scores).toHaveLength(CII_DIMENSION_COUNT);
  });
});

// ============================================================
// Mini CII Zone Classification Edge Cases
// ============================================================

describe('Mini CII Scoring', () => {
  it('all 1s → total 3, Green zone', () => {
    const result = scoreMiniCII([1, 1, 1]);
    expect(result.totalScore).toBe(3);
    expect(result.zone).toBe('GREEN');
  });

  it('all 10s → total 30, Red zone', () => {
    const result = scoreMiniCII([10, 10, 10]);
    expect(result.totalScore).toBe(MINI_CII_MAX_SCORE);
    expect(result.zone).toBe('RED');
  });

  it('score 11 → Green zone (upper boundary)', () => {
    const result = scoreMiniCII([4, 4, 3]);
    expect(result.totalScore).toBe(11);
    expect(result.zone).toBe('GREEN');
  });

  it('score 12 → Yellow zone (lower boundary)', () => {
    const result = scoreMiniCII([4, 4, 4]);
    expect(result.totalScore).toBe(12);
    expect(result.zone).toBe('YELLOW');
  });

  it('score 20 → Yellow zone (upper boundary)', () => {
    const result = scoreMiniCII([7, 7, 6]);
    expect(result.totalScore).toBe(20);
    expect(result.zone).toBe('YELLOW');
  });

  it('score 21 → Red zone (lower boundary)', () => {
    const result = scoreMiniCII([7, 7, 7]);
    expect(result.totalScore).toBe(21);
    expect(result.zone).toBe('RED');
  });

  it('preserves 3 dimension scores', () => {
    const result = scoreMiniCII([3, 6, 9]);
    expect(result.scores).toEqual([3, 6, 9]);
    expect(result.scores).toHaveLength(3);
  });
});

// ============================================================
// CRI Scoring
// ============================================================

describe('CRI Scoring', () => {
  it('computes weighted score from 14 factors', () => {
    const factors = Array.from({ length: CRI_FACTOR_COUNT }, (_, i) => ({
      name: `Factor ${i + 1}`,
      weight: 1.0,
      score: 2.0,
    }));
    const result = scoreCRI(factors);
    expect(result.rawScore).toBe(28.0);
    expect(result.clamped).toBe(false);
  });

  it('clamps below CRI_MIN_RAW (14.4)', () => {
    const factors = Array.from({ length: CRI_FACTOR_COUNT }, (_, i) => ({
      name: `Factor ${i + 1}`,
      weight: 0.5,
      score: 1.0,
    }));
    const result = scoreCRI(factors);
    expect(result.rawScore).toBe(CRI_MIN_RAW);
    expect(result.clamped).toBe(true);
  });

  it('clamps above CRI_MAX_RAW (72.0)', () => {
    const factors = Array.from({ length: CRI_FACTOR_COUNT }, (_, i) => ({
      name: `Factor ${i + 1}`,
      weight: 10.0,
      score: 10.0,
    }));
    const result = scoreCRI(factors);
    expect(result.rawScore).toBe(CRI_MAX_RAW);
    expect(result.clamped).toBe(true);
  });

  it('rounds to 1 decimal place', () => {
    const factors = Array.from({ length: CRI_FACTOR_COUNT }, (_, i) => ({
      name: `Factor ${i + 1}`,
      weight: 1.0,
      score: i === 0 ? 3.33 : 2.0,
    }));
    const result = scoreCRI(factors);
    // 3.33 + 13*2 = 29.33
    expect(result.rawScore).toBe(29.3);
  });
});

// ============================================================
// KBS Validation
// ============================================================

describe('KBS Validation', () => {
  it('accepts valid ratings (1-5)', () => {
    expect(validateKBS(1, 1, 1).valid).toBe(true);
    expect(validateKBS(5, 5, 5).valid).toBe(true);
    expect(validateKBS(3, 2, 4).valid).toBe(true);
  });

  it('rejects knowledge < 1', () => {
    expect(validateKBS(0, 3, 3).valid).toBe(false);
  });

  it('rejects behavior > 5', () => {
    expect(validateKBS(3, 6, 3).valid).toBe(false);
  });

  it('rejects status < 1', () => {
    expect(validateKBS(3, 3, 0).valid).toBe(false);
  });

  it('boundary: KBS_MIN (1) is valid', () => {
    expect(validateKBS(KBS_MIN, KBS_MIN, KBS_MIN).valid).toBe(true);
  });

  it('boundary: KBS_MAX (5) is valid', () => {
    expect(validateKBS(KBS_MAX, KBS_MAX, KBS_MAX).valid).toBe(true);
  });
});

// ============================================================
// Schema Validation
// ============================================================

describe('Assessment Schemas', () => {
  describe('submitCIISchema', () => {
    it('accepts valid 12-dimension CII', () => {
      const result = submitCIISchema.safeParse({
        familyId: 'family:abc',
        scores: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      });
      expect(result.success).toBe(true);
    });

    it('rejects 11 dimensions', () => {
      const result = submitCIISchema.safeParse({
        familyId: 'family:abc',
        scores: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      });
      expect(result.success).toBe(false);
    });

    it('rejects score > 10', () => {
      const result = submitCIISchema.safeParse({
        familyId: 'family:abc',
        scores: [11, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      });
      expect(result.success).toBe(false);
    });

    it('rejects score < 1', () => {
      const result = submitCIISchema.safeParse({
        familyId: 'family:abc',
        scores: [0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('submitMiniCIISchema', () => {
    it('accepts valid 3-slider Mini CII', () => {
      const result = submitMiniCIISchema.safeParse({
        scores: [3, 6, 9],
      });
      expect(result.success).toBe(true);
    });

    it('accepts without familyId (public)', () => {
      const result = submitMiniCIISchema.safeParse({
        scores: [5, 5, 5],
      });
      expect(result.success).toBe(true);
    });

    it('rejects 4 sliders', () => {
      const result = submitMiniCIISchema.safeParse({
        scores: [5, 5, 5, 5],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('submitCRISchema', () => {
    it('accepts valid 14-factor CRI', () => {
      const factors = Array.from({ length: 14 }, (_, i) => ({
        name: `Factor ${i}`,
        weight: 1.0,
        score: 3.0,
      }));
      const result = submitCRISchema.safeParse({
        careRecipientId: 'cr:abc',
        factors,
      });
      expect(result.success).toBe(true);
    });

    it('rejects 13 factors', () => {
      const factors = Array.from({ length: 13 }, (_, i) => ({
        name: `Factor ${i}`,
        weight: 1.0,
        score: 3.0,
      }));
      const result = submitCRISchema.safeParse({
        careRecipientId: 'cr:abc',
        factors,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('submitKBSSchema', () => {
    it('accepts valid KBS at day 0', () => {
      const result = submitKBSSchema.safeParse({
        careRecipientId: 'cr:abc',
        omahaProblemCode: 6,
        knowledge: 3,
        behavior: 4,
        status: 2,
        assessmentDay: 0,
      });
      expect(result.success).toBe(true);
    });

    it('accepts all valid assessment days', () => {
      for (const day of [0, 30, 60, 90]) {
        const result = submitKBSSchema.safeParse({
          careRecipientId: 'cr:abc',
          omahaProblemCode: 28,
          knowledge: 3,
          behavior: 3,
          status: 3,
          assessmentDay: day,
        });
        expect(result.success, `Day ${day} should be valid`).toBe(true);
      }
    });

    it('rejects invalid assessment day', () => {
      const result = submitKBSSchema.safeParse({
        careRecipientId: 'cr:abc',
        omahaProblemCode: 6,
        knowledge: 3,
        behavior: 3,
        status: 3,
        assessmentDay: 45,
      });
      expect(result.success).toBe(false);
    });

    it('rejects omahaProblemCode > 42', () => {
      const result = submitKBSSchema.safeParse({
        careRecipientId: 'cr:abc',
        omahaProblemCode: 43,
        knowledge: 3,
        behavior: 3,
        status: 3,
        assessmentDay: 30,
      });
      expect(result.success).toBe(false);
    });

    it('rejects KBS rating > 5', () => {
      const result = submitKBSSchema.safeParse({
        careRecipientId: 'cr:abc',
        omahaProblemCode: 6,
        knowledge: 6,
        behavior: 3,
        status: 3,
        assessmentDay: 0,
      });
      expect(result.success).toBe(false);
    });
  });
});
