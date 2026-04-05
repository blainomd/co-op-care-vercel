/**
 * Worker Module Tests
 * Schema validation, Omaha keyword extraction, category suggestion, billable hours math
 */
import { describe, it, expect } from 'vitest';
import {
  checkInShiftSchema,
  checkOutShiftSchema,
  createCareLogSchema,
  requestShiftSwapSchema,
  respondShiftSwapSchema,
  submitTranscriptionSchema,
} from './schemas.js';
import { FINANCIALS } from '@shared/constants/business-rules';

// ============================================================
// Helper: extract the service's pure functions for testing
// We re-implement them here since they're private to the module
// ============================================================

/** Keyword → Omaha problem code mapping (mirrors service.ts) */
const KEYWORD_OMAHA_MAP: Array<{ keywords: string[]; code: number }> = [
  { keywords: ['medication', 'medicine', 'pill', 'prescription', 'dose'], code: 24 },
  { keywords: ['fall', 'balance', 'tripped', 'stumble', 'unsteady'], code: 25 },
  { keywords: ['confused', 'disoriented', 'memory', 'forgot', 'cognitive'], code: 21 },
  { keywords: ['pain', 'ache', 'hurt', 'sore', 'discomfort'], code: 28 },
  { keywords: ['appetite', 'eating', 'nutrition', 'weight', 'meal'], code: 27 },
  { keywords: ['sleep', 'insomnia', 'rest', 'tired', 'fatigue'], code: 34 },
  { keywords: ['mood', 'sad', 'anxious', 'depressed', 'agitated'], code: 13 },
  { keywords: ['skin', 'wound', 'rash', 'bruise', 'pressure'], code: 36 },
  { keywords: ['breath', 'cough', 'wheeze', 'oxygen', 'respiratory'], code: 33 },
  { keywords: ['bath', 'hygiene', 'dress', 'groom', 'personal care'], code: 38 },
  { keywords: ['walk', 'mobility', 'transfer', 'wheelchair', 'ambulation'], code: 25 },
  { keywords: ['blood pressure', 'hypertension', 'circulation'], code: 20 },
  { keywords: ['toilet', 'incontinence', 'bowel', 'bladder', 'urinary'], code: 19 },
  { keywords: ['social', 'lonely', 'isolated', 'visitor', 'engagement'], code: 12 },
];

function extractOmahaProblems(text: string): number[] {
  const lower = text.toLowerCase();
  const codes = new Set<number>();
  for (const mapping of KEYWORD_OMAHA_MAP) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      codes.add(mapping.code);
    }
  }
  return Array.from(codes);
}

function suggestCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/medication|pill|prescription|dose/.test(lower)) return 'medication_reminder';
  if (/meal|cook|food|eat|lunch|dinner|breakfast/.test(lower)) return 'meal_preparation';
  if (/bath|shower|dress|groom|hygiene/.test(lower)) return 'personal_care';
  if (/walk|transfer|mobility|exercise/.test(lower)) return 'mobility_assist';
  if (/puzzle|game|read|memory|cognitive/.test(lower)) return 'cognitive_activity';
  if (/mood|comfort|talk|listen|emotional/.test(lower)) return 'emotional_support';
  if (/errand|store|pharmacy|shopping/.test(lower)) return 'errand';
  if (/vital|blood pressure|temperature|pulse/.test(lower)) return 'observation';
  return 'companion_visit';
}

function hoursBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

// ============================================================
// Omaha Auto-Coding from Voice Text
// ============================================================

describe('Omaha Keyword Extraction', () => {
  it('detects medication keywords → code 24', () => {
    const codes = extractOmahaProblems('Gave her the morning medication and pill');
    expect(codes).toContain(24);
  });

  it('detects fall risk → code 25', () => {
    const codes = extractOmahaProblems('She was unsteady on her feet and had a near fall');
    expect(codes).toContain(25);
  });

  it('detects cognitive issues → code 21', () => {
    const codes = extractOmahaProblems('He seemed confused and disoriented today');
    expect(codes).toContain(21);
  });

  it('detects multiple problems in one transcript', () => {
    const codes = extractOmahaProblems(
      'Gave medication at noon. She seemed confused and had pain in her lower back. Also noticed a skin rash.',
    );
    expect(codes).toContain(24); // medication
    expect(codes).toContain(21); // confused
    expect(codes).toContain(28); // pain
    expect(codes).toContain(36); // skin/rash
    expect(codes.length).toBeGreaterThanOrEqual(4);
  });

  it('returns empty for unrelated text', () => {
    const codes = extractOmahaProblems('Had a nice conversation about the weather and gardening');
    expect(codes).toHaveLength(0);
  });

  it('is case insensitive', () => {
    const codes = extractOmahaProblems('MEDICATION was given, she was CONFUSED');
    expect(codes).toContain(24);
    expect(codes).toContain(21);
  });

  it('deduplicates codes (walk and mobility both → 25)', () => {
    const codes = extractOmahaProblems('Helped with walk and mobility exercises');
    const count25 = codes.filter((c) => c === 25).length;
    expect(count25).toBe(1);
  });

  it('detects social isolation → code 12', () => {
    const codes = extractOmahaProblems('She seems lonely and isolated, no visitors this week');
    expect(codes).toContain(12);
  });

  it('detects respiratory → code 33', () => {
    const codes = extractOmahaProblems('Noticed some wheeze and cough during the visit');
    expect(codes).toContain(33);
  });

  it('detects blood pressure → code 20', () => {
    const codes = extractOmahaProblems('Took blood pressure reading, concern about hypertension');
    expect(codes).toContain(20);
  });
});

// ============================================================
// Category Suggestion
// ============================================================

describe('Category Suggestion', () => {
  it('medication text → medication_reminder', () => {
    expect(suggestCategory('Gave morning medication and pills')).toBe('medication_reminder');
  });

  it('meal text → meal_preparation', () => {
    expect(suggestCategory('Prepared lunch and helped with eating')).toBe('meal_preparation');
  });

  it('bathing text → personal_care', () => {
    expect(suggestCategory('Assisted with bath and hygiene')).toBe('personal_care');
  });

  it('mobility text → mobility_assist', () => {
    expect(suggestCategory('Helped with walk to the garden')).toBe('mobility_assist');
  });

  it('cognitive text → cognitive_activity', () => {
    expect(suggestCategory('Did a puzzle and cognitive games together')).toBe('cognitive_activity');
  });

  it('emotional text → emotional_support', () => {
    expect(suggestCategory('Had a long talk and emotional support session')).toBe(
      'emotional_support',
    );
  });

  it('errand text → errand', () => {
    expect(suggestCategory('Went to the pharmacy and store')).toBe('errand');
  });

  it('vitals text → observation', () => {
    expect(suggestCategory('Checked vital signs and temperature')).toBe('observation');
  });

  it('generic text → companion_visit', () => {
    expect(suggestCategory('Had a nice afternoon together watching birds')).toBe('companion_visit');
  });
});

// ============================================================
// Billable Hours Calculation
// ============================================================

describe('Billable Hours Calculation', () => {
  it('4-hour shift with no breaks = 4 hours', () => {
    const actual = hoursBetween('2026-03-10T09:00:00Z', '2026-03-10T13:00:00Z');
    expect(actual).toBe(4);
  });

  it('4-hour shift with 30 min break = 3.5 billable', () => {
    const actual = hoursBetween('2026-03-10T09:00:00Z', '2026-03-10T13:00:00Z');
    const breakMinutes = 30;
    const billable = Math.max(0, actual - breakMinutes / 60);
    expect(billable).toBe(3.5);
  });

  it('short shift with long break floors at 0', () => {
    const actual = hoursBetween('2026-03-10T09:00:00Z', '2026-03-10T10:00:00Z');
    const breakMinutes = 90; // longer than shift
    const billable = Math.max(0, actual - breakMinutes / 60);
    expect(billable).toBe(0);
  });

  it('8-hour shift with two 15-min breaks = 7.5 billable', () => {
    const actual = hoursBetween('2026-03-10T08:00:00Z', '2026-03-10T16:00:00Z');
    const breakMinutes = 30;
    const billable = Math.max(0, actual - breakMinutes / 60);
    expect(billable).toBe(7.5);
  });

  it('rounds to 2 decimal places', () => {
    const actual = hoursBetween('2026-03-10T09:00:00Z', '2026-03-10T12:20:00Z');
    const breakMinutes = 15;
    const billable = Math.round(Math.max(0, actual - breakMinutes / 60) * 100) / 100;
    expect(billable).toBe(3.08);
  });
});

// ============================================================
// Schema Validation
// ============================================================

describe('Worker Schemas', () => {
  describe('checkInShiftSchema', () => {
    it('accepts valid GPS location', () => {
      const result = checkInShiftSchema.safeParse({
        location: { latitude: 40.015, longitude: -105.27 },
      });
      expect(result.success).toBe(true);
    });

    it('rejects latitude > 90', () => {
      const result = checkInShiftSchema.safeParse({
        location: { latitude: 91, longitude: -105.27 },
      });
      expect(result.success).toBe(false);
    });

    it('rejects longitude < -180', () => {
      const result = checkInShiftSchema.safeParse({
        location: { latitude: 40, longitude: -181 },
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing location', () => {
      const result = checkInShiftSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('checkOutShiftSchema', () => {
    it('accepts valid check-out with notes', () => {
      const result = checkOutShiftSchema.safeParse({
        location: { latitude: 40.015, longitude: -105.27 },
        notes: 'Shift went well, client was in good spirits.',
      });
      expect(result.success).toBe(true);
    });

    it('accepts check-out without notes', () => {
      const result = checkOutShiftSchema.safeParse({
        location: { latitude: 40.015, longitude: -105.27 },
      });
      expect(result.success).toBe(true);
    });

    it('rejects notes > 2000 chars', () => {
      const result = checkOutShiftSchema.safeParse({
        location: { latitude: 40.015, longitude: -105.27 },
        notes: 'x'.repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createCareLogSchema', () => {
    it('accepts valid care log', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'companion_visit',
        notes: 'Had a great conversation about family history.',
      });
      expect(result.success).toBe(true);
    });

    it('accepts full care log with vitals', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'observation',
        notes: 'Routine vitals check.',
        omahaProblems: [20, 28],
        vitals: {
          bloodPressureSystolic: 130,
          bloodPressureDiastolic: 85,
          heartRate: 72,
          temperature: 98.6,
          oxygenSaturation: 97,
        },
        moodRating: 4,
        alertLevel: 'normal',
        duration: 30,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid category', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'surgery',
        notes: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty notes', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'companion_visit',
        notes: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects mood rating > 5', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'companion_visit',
        notes: 'Good visit.',
        moodRating: 6,
      });
      expect(result.success).toBe(false);
    });

    it('rejects mood rating < 1', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'companion_visit',
        notes: 'Good visit.',
        moodRating: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid alert level', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'companion_visit',
        notes: 'Test',
        alertLevel: 'critical',
      });
      expect(result.success).toBe(false);
    });

    it('rejects Omaha code > 42', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'companion_visit',
        notes: 'Test',
        omahaProblems: [43],
      });
      expect(result.success).toBe(false);
    });

    it('rejects vitals out of range', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'observation',
        notes: 'Test',
        vitals: {
          heartRate: 250, // max is 220
        },
      });
      expect(result.success).toBe(false);
    });

    it('rejects duration > 720 minutes (12 hours)', () => {
      const result = createCareLogSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        category: 'companion_visit',
        notes: 'Test',
        duration: 721,
      });
      expect(result.success).toBe(false);
    });

    it('accepts all 10 care categories', () => {
      const categories = [
        'companion_visit',
        'personal_care',
        'medication_reminder',
        'meal_preparation',
        'mobility_assist',
        'cognitive_activity',
        'emotional_support',
        'errand',
        'observation',
        'other',
      ];
      for (const category of categories) {
        const result = createCareLogSchema.safeParse({
          shiftId: 'shift:001',
          careRecipientId: 'cr:001',
          category,
          notes: 'Test note.',
        });
        expect(result.success, `category "${category}" should be valid`).toBe(true);
      }
    });
  });

  describe('requestShiftSwapSchema', () => {
    it('accepts valid swap request', () => {
      const result = requestShiftSwapSchema.safeParse({
        shiftId: 'shift:001',
        reason: 'Doctor appointment conflict',
      });
      expect(result.success).toBe(true);
    });

    it('accepts swap without reason', () => {
      const result = requestShiftSwapSchema.safeParse({
        shiftId: 'shift:001',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty shiftId', () => {
      const result = requestShiftSwapSchema.safeParse({
        shiftId: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects reason > 500 chars', () => {
      const result = requestShiftSwapSchema.safeParse({
        shiftId: 'shift:001',
        reason: 'x'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('respondShiftSwapSchema', () => {
    it('accepts accept', () => {
      const result = respondShiftSwapSchema.safeParse({ action: 'accept' });
      expect(result.success).toBe(true);
    });

    it('accepts reject', () => {
      const result = respondShiftSwapSchema.safeParse({ action: 'reject' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid action', () => {
      const result = respondShiftSwapSchema.safeParse({ action: 'cancel' });
      expect(result.success).toBe(false);
    });
  });

  describe('submitTranscriptionSchema', () => {
    it('accepts valid transcription', () => {
      const result = submitTranscriptionSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        rawText: 'She took her medication and had lunch. She seemed a bit confused later.',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty rawText', () => {
      const result = submitTranscriptionSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        rawText: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects rawText > 10000 chars', () => {
      const result = submitTranscriptionSchema.safeParse({
        shiftId: 'shift:001',
        careRecipientId: 'cr:001',
        rawText: 'x'.repeat(10001),
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================
// Business Rule Constants
// ============================================================

describe('Worker Business Rules', () => {
  it('worker wage range: $25-28/hr', () => {
    expect(FINANCIALS.WORKER_OWNER_WAGE_MIN_CENTS).toBe(2500);
    expect(FINANCIALS.WORKER_OWNER_WAGE_MAX_CENTS).toBe(2800);
  });

  it('5-year equity target: ~$52K', () => {
    expect(FINANCIALS.WORKER_EQUITY_5YR_CENTS).toBe(5200000);
  });

  it('private pay rate: $35/hr', () => {
    expect(FINANCIALS.PRIVATE_PAY_RATE_CENTS_PER_HOUR).toBe(3500);
  });
});
