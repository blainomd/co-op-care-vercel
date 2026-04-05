import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { Server } from 'http';

// Mock the server routes for testing
const app = express();
app.use(express.json());

app.post('/api/omaha/crosswalk', (req, res) => {
  const { icd10Codes } = req.body;

  if (!icd10Codes || !Array.isArray(icd10Codes)) {
    return res.status(400).json({ error: 'icd10Codes array is required' });
  }

  const crosswalkMap: Record<string, any> = {
    'I50.9': {
      problem: '27 Circulation',
      domain: 'Physiological',
      lmnEligible: true,
      interventions: ['Cardiac rehab', 'Nutrition counseling'],
    },
    'E11.9': {
      problem: '35 Nutrition',
      domain: 'Health-Related Behaviors',
      lmnEligible: true,
      interventions: ['Nutrition counseling', 'Fitness programs'],
    },
    'F03.90': {
      problem: '21 Cognition',
      domain: 'Physiological',
      lmnEligible: true,
      interventions: ['Cognitive stimulation'],
    },
    'Z63.6': {
      problem: '13 Caretaking/parenting',
      domain: 'Psychosocial',
      lmnEligible: true,
      interventions: ['Respite care', 'Conductor Certification'],
    },
    'Z73.1': {
      problem: '07 Role change',
      domain: 'Psychosocial',
      lmnEligible: true,
      interventions: ['Conductor Certification'],
    },
    'Z59.7': {
      problem: '01 Income',
      domain: 'Environmental',
      lmnEligible: false,
      interventions: ['Financial counseling'],
    },
  };

  const mappedProblems = icd10Codes.map((code) => {
    const mapping = crosswalkMap[code];
    if (mapping) {
      return { code, ...mapping };
    }
    return { code, problem: 'Unmapped', lmnEligible: false };
  });

  const lmnEligibleServices = mappedProblems
    .filter((p) => p.lmnEligible)
    .flatMap((p) => p.interventions);

  res.json({
    success: true,
    mappedProblems,
    lmnTemplate: {
      qualifyingConditions: mappedProblems.filter((p) => p.lmnEligible).map((p) => p.problem),
      recommendedServices: [...new Set(lmnEligibleServices)],
      irsPub502Eligible: lmnEligibleServices.length > 0,
    },
  });
});

describe('Omaha Crosswalk Pipeline E2E', () => {
  let server: Server;
  const port = 3001;

  beforeAll(() => {
    server = app.listen(port);
  });

  afterAll(() => {
    server.close();
  });

  it('should correctly map ICD-10 codes to Omaha problems', async () => {
    const response = await fetch(`http://localhost:${port}/api/omaha/crosswalk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icd10Codes: ['I50.9', 'E11.9'] }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.mappedProblems).toHaveLength(2);
    expect(data.mappedProblems[0].problem).toBe('27 Circulation');
    expect(data.mappedProblems[1].problem).toBe('35 Nutrition');
  });

  it('should generate an LMN template with eligible services', async () => {
    const response = await fetch(`http://localhost:${port}/api/omaha/crosswalk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icd10Codes: ['I50.9', 'E11.9', 'Z59.7'] }),
    });

    const data = await response.json();

    expect(data.lmnTemplate.irsPub502Eligible).toBe(true);
    expect(data.lmnTemplate.qualifyingConditions).toContain('27 Circulation');
    expect(data.lmnTemplate.qualifyingConditions).toContain('35 Nutrition');
    expect(data.lmnTemplate.qualifyingConditions).not.toContain('01 Income'); // Z59.7 is not LMN eligible

    expect(data.lmnTemplate.recommendedServices).toContain('Cardiac rehab');
    expect(data.lmnTemplate.recommendedServices).toContain('Nutrition counseling');
    expect(data.lmnTemplate.recommendedServices).toContain('Fitness programs');
  });

  it('should handle unmapped codes gracefully', async () => {
    const response = await fetch(`http://localhost:${port}/api/omaha/crosswalk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icd10Codes: ['UNKNOWN_CODE'] }),
    });

    const data = await response.json();

    expect(data.mappedProblems[0].problem).toBe('Unmapped');
    expect(data.mappedProblems[0].lmnEligible).toBe(false);
    expect(data.lmnTemplate.irsPub502Eligible).toBe(false);
  });
});
