/**
 * LMN Module Tests — template rendering, signing workflow,
 * schema validation, expiry calculations
 */
import { describe, it, expect } from 'vitest';
import { generateLMNDocument, lmnToPlainText, getCRIFactorNames } from './templates';
import type { LMNDocumentData } from './templates';
import {
  requestSignature,
  recordManualSignature,
  checkSignatureStatus,
  handleSignatureCallback,
} from './signing';
import { generateLMNSchema, signLMNSchema, renewLMNSchema } from './schemas';
import { calculateLMNExpiry, getLMNReminderTier } from '../../jobs/lmn-renewal';

// ── Test Data ────────────────────────────────────────────────

const SAMPLE_LMN_DATA: LMNDocumentData = {
  letterDate: '2026-03-01T00:00:00Z',
  patientName: 'Eleanor Davis',
  physicianName: 'Dr. Sarah Chen',
  criScore: 52.4,
  acuity: 'high',
  diagnosisCodes: ['F03.90', 'R26.89', 'Z74.1'],
  omahaProblems: [21, 25, 38],
  carePlanSummary: '',
  issuedAt: '2026-03-01T00:00:00Z',
  expiresAt: '2027-03-01T00:00:00Z',
  durationDays: 365,
  lmnId: 'lmn_test_001',
};

// ── Template Rendering ───────────────────────────────────────

describe('LMN Templates', () => {
  describe('generateLMNDocument', () => {
    it('produces 9 sections for complete LMN', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      expect(sections).toHaveLength(9);
    });

    it('includes Letter of Medical Necessity header', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const header = sections[0]!;
      expect(header.heading).toBe('Letter of Medical Necessity');
      expect(header.content).toContain('Eleanor Davis');
      expect(header.content).toContain('Dr. Sarah Chen');
      expect(header.content).toContain('lmn_test_001');
    });

    it('includes Purpose section with acuity description', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const purpose = sections[1]!;
      expect(purpose.heading).toBe('Purpose');
      expect(purpose.content).toContain('medically necessary');
      expect(purpose.content).toContain('Eleanor Davis');
    });

    it('includes Clinical Assessment with CRI score', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const clinical = sections[2]!;
      expect(clinical.heading).toBe('Clinical Assessment');
      expect(clinical.content).toContain('52.4');
      expect(clinical.content).toContain('HIGH acuity');
    });

    it('includes ICD-10 diagnosis codes', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const diag = sections[3]!;
      expect(diag.heading).toBe('Diagnosis Codes (ICD-10)');
      expect(diag.content).toContain('F03.90');
      expect(diag.content).toContain('R26.89');
      expect(diag.content).toContain('Z74.1');
    });

    it('includes Omaha System problems', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const omaha = sections[4]!;
      expect(omaha.heading).toContain('Omaha System');
      expect(omaha.content).toContain('#21');
      expect(omaha.content).toContain('#25');
      expect(omaha.content).toContain('#38');
    });

    it('includes recommended services', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const services = sections[5]!;
      expect(services.heading).toBe('Recommended Services');
      expect(services.content).toContain('companion care');
    });

    it('includes medical necessity determination with HSA/FSA language', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const necessity = sections[6]!;
      expect(necessity.heading).toBe('Medical Necessity Determination');
      expect(necessity.content).toContain('HSA/FSA');
      expect(necessity.content).toContain('IRS Publication 502');
    });

    it('includes physician certification', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const cert = sections[7]!;
      expect(cert.heading).toBe('Physician Certification');
      expect(cert.content).toContain('Dr. Sarah Chen');
      expect(cert.content).toContain('certify');
    });

    it('includes document validity', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const validity = sections[8]!;
      expect(validity.heading).toBe('Document Validity');
      expect(validity.content).toContain('365 days');
      expect(validity.content).toContain('reassessment');
    });

    it('omits diagnosis section when no codes', () => {
      const data = { ...SAMPLE_LMN_DATA, diagnosisCodes: [], omahaProblems: [] };
      const sections = generateLMNDocument(data);
      const headings = sections.map((s) => s.heading);
      expect(headings).not.toContain('Diagnosis Codes (ICD-10)');
    });

    it('omits Omaha section when no problems', () => {
      const data = { ...SAMPLE_LMN_DATA, diagnosisCodes: [], omahaProblems: [] };
      const sections = generateLMNDocument(data);
      const headings = sections.map((s) => s.heading);
      expect(headings).not.toContain('Identified Problems (Omaha System Classification)');
    });

    it('uses custom care plan summary when provided', () => {
      const data = { ...SAMPLE_LMN_DATA, carePlanSummary: 'Custom care plan here' };
      const sections = generateLMNDocument(data);
      const services = sections.find((s) => s.heading === 'Recommended Services');
      expect(services?.content).toBe('Custom care plan here');
    });

    it('generates critical acuity services', () => {
      const data = { ...SAMPLE_LMN_DATA, acuity: 'critical', carePlanSummary: '' };
      const sections = generateLMNDocument(data);
      const services = sections.find((s) => s.heading === 'Recommended Services');
      expect(services?.content).toContain('Daily in-home companion care');
      expect(services?.content).toContain('Personal care assistance');
    });

    it('includes NPI when provided', () => {
      const data = { ...SAMPLE_LMN_DATA, physicianNPI: '1234567890' };
      const sections = generateLMNDocument(data);
      const header = sections[0]!;
      expect(header.content).toContain('NPI: 1234567890');
    });

    it('includes CRI factor findings when provided', () => {
      const data = {
        ...SAMPLE_LMN_DATA,
        criFactors: [
          { name: 'Cognitive Status', score: 4 },
          { name: 'Functional Mobility', score: 4 },
          { name: 'ADL Independence', score: 2 }, // below threshold
        ],
      };
      const sections = generateLMNDocument(data);
      const clinical = sections[2]!;
      expect(clinical.content).toContain('Cognitive Status: 4/5');
      expect(clinical.content).toContain('Functional Mobility: 4/5');
      expect(clinical.content).not.toContain('ADL Independence: 2/5');
    });
  });

  describe('lmnToPlainText', () => {
    it('converts sections to formatted plain text', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const text = lmnToPlainText(sections);
      expect(text).toContain('LETTER OF MEDICAL NECESSITY');
      expect(text).toContain('===');
      expect(text).toContain('---');
    });

    it('uppercases all headings', () => {
      const sections = generateLMNDocument(SAMPLE_LMN_DATA);
      const text = lmnToPlainText(sections);
      expect(text).toContain('CLINICAL ASSESSMENT');
      expect(text).toContain('PHYSICIAN CERTIFICATION');
    });
  });

  describe('getCRIFactorNames', () => {
    it('returns array of CRI factor names', () => {
      const names = getCRIFactorNames();
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('Cognitive Status');
    });
  });
});

// ── E-Signing ────────────────────────────────────────────────

describe('LMN Signing', () => {
  describe('requestSignature', () => {
    it('returns manual request for manual provider', async () => {
      const result = await requestSignature('manual', {
        documentId: 'lmn_001',
        signerEmail: 'dr@example.com',
        signerName: 'Dr. Smith',
        documentTitle: 'LMN — Test Patient',
      });
      expect(result.provider).toBe('manual');
      expect(result.status).toBe('sent');
      expect(result.requestId).toContain('manual_lmn_001');
    });

    it('returns e-signature URL for docusign', async () => {
      const result = await requestSignature('docusign', {
        documentId: 'lmn_002',
        signerEmail: 'dr@example.com',
        signerName: 'Dr. Smith',
        documentTitle: 'LMN — Test Patient',
      });
      expect(result.provider).toBe('docusign');
      expect(result.status).toBe('sent');
      expect(result.signatureUrl).toContain('docusign.mock');
    });

    it('returns e-signature URL for hellosign', async () => {
      const result = await requestSignature('hellosign', {
        documentId: 'lmn_003',
        signerEmail: 'dr@example.com',
        signerName: 'Dr. Smith',
        documentTitle: 'LMN — Test Patient',
      });
      expect(result.provider).toBe('hellosign');
      expect(result.signatureUrl).toContain('hellosign.mock');
    });
  });

  describe('recordManualSignature', () => {
    it('records manual signature with timestamp', async () => {
      const result = await recordManualSignature('lmn_004', 'Dr. Chen');
      expect(result.provider).toBe('manual');
      expect(result.status).toBe('signed');
      expect(result.signedAt).toBeDefined();
      expect(result.requestId).toContain('manual_lmn_004');
    });
  });

  describe('checkSignatureStatus', () => {
    it('returns current status', async () => {
      const result = await checkSignatureStatus('docusign', 'req_123');
      expect(result.requestId).toBe('req_123');
      expect(result.provider).toBe('docusign');
      expect(result.status).toBe('sent');
    });
  });

  describe('handleSignatureCallback', () => {
    it('detects completed signature', async () => {
      const result = await handleSignatureCallback('docusign', {
        requestId: 'req_456',
        status: 'completed',
      });
      expect(result.requestId).toBe('req_456');
      expect(result.signed).toBe(true);
    });

    it('detects non-completed signature', async () => {
      const result = await handleSignatureCallback('docusign', {
        requestId: 'req_789',
        status: 'pending',
      });
      expect(result.signed).toBe(false);
    });

    it('handles envelope_id from DocuSign format', async () => {
      const result = await handleSignatureCallback('docusign', {
        envelope_id: 'env_abc',
        status: 'signed',
      });
      expect(result.requestId).toBe('env_abc');
      expect(result.signed).toBe(true);
    });
  });
});

// ── Schema Validation ────────────────────────────────────────

describe('LMN Schemas', () => {
  describe('generateLMNSchema', () => {
    it('validates correct input', () => {
      const result = generateLMNSchema.safeParse({
        careRecipientId: 'cr_001',
        criAssessmentId: 'cri_001',
        diagnosisCodes: ['F03.90', 'Z74.1'],
        carePlanSummary: 'Regular companion care',
      });
      expect(result.success).toBe(true);
    });

    it('validates minimal input (no optional fields)', () => {
      const result = generateLMNSchema.safeParse({
        careRecipientId: 'cr_001',
        criAssessmentId: 'cri_001',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty careRecipientId', () => {
      const result = generateLMNSchema.safeParse({
        careRecipientId: '',
        criAssessmentId: 'cri_001',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty criAssessmentId', () => {
      const result = generateLMNSchema.safeParse({
        careRecipientId: 'cr_001',
        criAssessmentId: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid ICD-10 codes', () => {
      const result = generateLMNSchema.safeParse({
        careRecipientId: 'cr_001',
        criAssessmentId: 'cri_001',
        diagnosisCodes: ['INVALID'],
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid ICD-10 code formats', () => {
      const result = generateLMNSchema.safeParse({
        careRecipientId: 'cr_001',
        criAssessmentId: 'cri_001',
        diagnosisCodes: ['F03', 'R26.89', 'Z74.1', 'S72.0021'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects carePlanSummary over 5000 chars', () => {
      const result = generateLMNSchema.safeParse({
        careRecipientId: 'cr_001',
        criAssessmentId: 'cri_001',
        carePlanSummary: 'x'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('signLMNSchema', () => {
    it('accepts manual signature', () => {
      expect(signLMNSchema.safeParse({ signatureMethod: 'manual' }).success).toBe(true);
    });

    it('accepts docusign', () => {
      expect(signLMNSchema.safeParse({ signatureMethod: 'docusign' }).success).toBe(true);
    });

    it('accepts hellosign', () => {
      expect(signLMNSchema.safeParse({ signatureMethod: 'hellosign' }).success).toBe(true);
    });

    it('rejects invalid provider', () => {
      expect(signLMNSchema.safeParse({ signatureMethod: 'invalid' }).success).toBe(false);
    });

    it('rejects missing signatureMethod', () => {
      expect(signLMNSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('renewLMNSchema', () => {
    it('validates minimal input', () => {
      expect(renewLMNSchema.safeParse({ criAssessmentId: 'cri_002' }).success).toBe(true);
    });

    it('validates with custom duration', () => {
      const result = renewLMNSchema.safeParse({ criAssessmentId: 'cri_002', durationDays: 180 });
      expect(result.success).toBe(true);
    });

    it('rejects duration below 30', () => {
      const result = renewLMNSchema.safeParse({ criAssessmentId: 'cri_002', durationDays: 10 });
      expect(result.success).toBe(false);
    });

    it('rejects duration above 730', () => {
      const result = renewLMNSchema.safeParse({ criAssessmentId: 'cri_002', durationDays: 800 });
      expect(result.success).toBe(false);
    });

    it('rejects empty criAssessmentId', () => {
      expect(renewLMNSchema.safeParse({ criAssessmentId: '' }).success).toBe(false);
    });
  });
});

// ── Expiry Calculations (extended) ───────────────────────────

describe('LMN Expiry (extended)', () => {
  describe('calculateLMNExpiry', () => {
    it('handles leap year', () => {
      const issued = new Date(2028, 1, 29); // Feb 29, 2028 (leap)
      const expiry = calculateLMNExpiry(issued, 365);
      expect(expiry.getFullYear()).toBe(2029);
    });

    it('handles 90-day duration', () => {
      const issued = new Date(2026, 0, 1);
      const expiry = calculateLMNExpiry(issued, 90);
      expect(expiry.getMonth()).toBe(3); // April
      expect(expiry.getDate()).toBe(1);
    });

    it('handles 730-day duration (2 years)', () => {
      const issued = new Date(2026, 0, 1);
      const expiry = calculateLMNExpiry(issued, 730);
      expect(expiry.getFullYear()).toBe(2028);
    });
  });

  describe('getLMNReminderTier (range-based)', () => {
    it('returns 7 when expiry is exactly 7 days away', () => {
      const now = new Date(2026, 0, 1);
      const expiry = new Date(2026, 0, 8);
      expect(getLMNReminderTier(expiry, now)).toBe(7);
    });

    it('returns 7 for 3 days away (within 7-day tier)', () => {
      const now = new Date(2026, 0, 1);
      const expiry = new Date(2026, 0, 4);
      expect(getLMNReminderTier(expiry, now)).toBe(7);
    });

    it('returns 14 for 10 days away (within 14-day tier)', () => {
      const now = new Date(2026, 0, 1);
      const expiry = new Date(2026, 0, 11);
      expect(getLMNReminderTier(expiry, now)).toBe(14);
    });

    it('returns 30 for 20 days away', () => {
      const now = new Date(2026, 0, 1);
      const expiry = new Date(2026, 0, 21);
      expect(getLMNReminderTier(expiry, now)).toBe(30);
    });

    it('returns 60 for 45 days away', () => {
      const now = new Date(2026, 0, 1);
      const expiry = new Date(2026, 1, 15);
      expect(getLMNReminderTier(expiry, now)).toBe(60);
    });

    it('returns null for 90 days away (outside all tiers)', () => {
      const now = new Date(2026, 0, 1);
      const expiry = new Date(2026, 3, 1);
      expect(getLMNReminderTier(expiry, now)).toBeNull();
    });

    it('returns 7 for already expired (negative days)', () => {
      const now = new Date(2026, 0, 10);
      const expiry = new Date(2026, 0, 5);
      expect(getLMNReminderTier(expiry, now)).toBe(7);
    });
  });
});
