import { describe, it, expect } from 'vitest';
import {
  OMAHA_PROBLEMS,
  TIME_BANK_OMAHA_MAP,
  getOmahaProblem,
  getOmahaProblemsForDomain,
  getLMNEligibleProblems,
  getOmahaCodeForTask,
  getOmahaProblemsForICD10,
} from './omaha-system';

describe('Omaha System Taxonomy', () => {
  it('has exactly 42 problems', () => {
    expect(OMAHA_PROBLEMS).toHaveLength(42);
  });

  it('covers all 4 domains', () => {
    const domains = new Set(OMAHA_PROBLEMS.map((p) => p.domain));
    expect(domains.size).toBe(4);
    expect(domains).toContain('Environmental');
    expect(domains).toContain('Psychosocial');
    expect(domains).toContain('Physiological');
    expect(domains).toContain('Health-Related Behaviors');
  });

  it('Environmental domain has 4 problems (01-04)', () => {
    expect(getOmahaProblemsForDomain('Environmental')).toHaveLength(4);
  });

  it('Psychosocial domain has 12 problems (05-16)', () => {
    expect(getOmahaProblemsForDomain('Psychosocial')).toHaveLength(12);
  });

  it('Physiological domain has 18 problems (17-34)', () => {
    expect(getOmahaProblemsForDomain('Physiological')).toHaveLength(18);
  });

  it('Health-Related Behaviors domain has 8 problems (35-42)', () => {
    expect(getOmahaProblemsForDomain('Health-Related Behaviors')).toHaveLength(8);
  });

  it('codes are sequential 1-42', () => {
    OMAHA_PROBLEMS.forEach((p, i) => {
      expect(p.code).toBe(i + 1);
    });
  });
});

describe('getOmahaProblem', () => {
  it('finds Social Contact at code 6', () => {
    const problem = getOmahaProblem(6);
    expect(problem?.name).toBe('Social Contact');
    expect(problem?.domain).toBe('Psychosocial');
  });

  it('returns undefined for invalid code', () => {
    expect(getOmahaProblem(99)).toBeUndefined();
  });
});

describe('LMN Eligible Problems', () => {
  it('returns only problems with lmnEligible = true', () => {
    const eligible = getLMNEligibleProblems();
    expect(eligible.length).toBeGreaterThan(0);
    eligible.forEach((p) => {
      expect(p.lmnEligible).toBe(true);
      expect(p.lmnServices).toBeDefined();
    });
  });
});

describe('Time Bank → Omaha Auto-Coding', () => {
  it('maps meals to Digestion-Hydration (#28)', () => {
    const mapping = getOmahaCodeForTask('meals');
    expect(mapping?.omahaProblemCode).toBe(28);
    expect(mapping?.interventionCategory).toBe('Treatments/Procedures');
  });

  it('maps companionship to Social Contact (#06)', () => {
    const mapping = getOmahaCodeForTask('companionship');
    expect(mapping?.omahaProblemCode).toBe(6);
    expect(mapping?.interventionCategory).toBe('Surveillance');
  });

  it('maps rides to Communication with Community Resources (#05)', () => {
    const mapping = getOmahaCodeForTask('rides');
    expect(mapping?.omahaProblemCode).toBe(5);
    expect(mapping?.interventionCategory).toBe('Case Management');
  });

  it('has 11 task type mappings', () => {
    expect(TIME_BANK_OMAHA_MAP).toHaveLength(11);
  });

  it('returns undefined for unknown task', () => {
    expect(getOmahaCodeForTask('unknown_task')).toBeUndefined();
  });
});

describe('ICD-10 Crosswalk Lookup', () => {
  it('finds Omaha problems for CHF (I50.9)', () => {
    const problems = getOmahaProblemsForICD10('I50.9');
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]?.name).toBe('Circulation');
  });

  it('finds Omaha problems for dementia (F03.90)', () => {
    const problems = getOmahaProblemsForICD10('F03.90');
    expect(problems.some((p) => p.name === 'Cognition')).toBe(true);
  });
});
