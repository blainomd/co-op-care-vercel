/**
 * LMN Document Templates — generates structured LMN content
 *
 * Produces a complete Letter of Medical Necessity from CRI assessment data,
 * Omaha problem codes, diagnosis codes, and care plan information.
 * Output is structured content for PDF rendering or e-signature embedding.
 */
import { OMAHA_PROBLEMS } from '@shared/constants/omaha-system';
import { CRI_FACTOR_DEFINITIONS } from '../assessments/cri.js';

export interface LMNDocumentData {
  // Header
  letterDate: string;
  patientName: string;
  patientDOB?: string;
  physicianName: string;
  physicianNPI?: string;
  physicianLicense?: string;

  // Clinical data
  criScore: number;
  acuity: string;
  diagnosisCodes: string[];
  omahaProblems: number[];
  carePlanSummary: string;
  criFactors?: Array<{ name: string; score: number }>;

  // Document meta
  issuedAt: string;
  expiresAt: string;
  durationDays: number;
  lmnId: string;
}

export interface LMNSection {
  heading: string;
  content: string;
}

/**
 * Format a date as "March 8, 2026"
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get Omaha problem name by code
 */
function getOmahaProblemName(code: number): string {
  return OMAHA_PROBLEMS.find((p) => p.code === code)?.name ?? `Problem #${code}`;
}

/**
 * Get acuity description for clinical language
 */
function getAcuityDescription(acuity: string): string {
  switch (acuity) {
    case 'critical':
      return 'critical care needs requiring intensive in-home support';
    case 'high':
      return 'significant care needs requiring structured in-home assistance';
    case 'moderate':
      return 'moderate care needs benefiting from regular in-home support';
    default:
      return 'care needs requiring in-home support services';
  }
}

/**
 * Generate the structured LMN document content
 */
export function generateLMNDocument(data: LMNDocumentData): LMNSection[] {
  const sections: LMNSection[] = [];

  // 1. Letter header
  sections.push({
    heading: 'Letter of Medical Necessity',
    content: [
      `Date: ${formatDate(data.letterDate)}`,
      `Patient: ${data.patientName}`,
      data.patientDOB ? `Date of Birth: ${data.patientDOB}` : '',
      `Issuing Physician: ${data.physicianName}${data.physicianNPI ? `, NPI: ${data.physicianNPI}` : ''}`,
      `Document ID: ${data.lmnId}`,
      `Valid: ${formatDate(data.issuedAt)} through ${formatDate(data.expiresAt)}`,
    ]
      .filter(Boolean)
      .join('\n'),
  });

  // 2. Purpose statement
  sections.push({
    heading: 'Purpose',
    content: `This Letter of Medical Necessity certifies that ${data.patientName} requires in-home companion and personal care services due to ${getAcuityDescription(data.acuity)}. These services are medically necessary to maintain the patient's health, safety, and functional independence in their home environment.`,
  });

  // 3. Clinical assessment
  const factorSummary = data.criFactors
    ? data.criFactors
        .filter((f) => f.score >= 3) // only noteworthy factors
        .map((f) => `  - ${f.name}: ${f.score}/5`)
        .join('\n')
    : '';

  sections.push({
    heading: 'Clinical Assessment',
    content: [
      `Care Readiness Index (CRI) Score: ${data.criScore} — ${data.acuity.toUpperCase()} acuity`,
      `A standardized 14-factor clinical assessment was performed evaluating the patient's cognitive status, functional mobility, ADL independence, medication complexity, behavioral challenges, fall risk, nutritional status, social support, caregiver burden, home safety, and emergency preparedness.`,
      factorSummary ? `\nKey findings:\n${factorSummary}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  });

  // 4. Diagnosis codes
  if (data.diagnosisCodes.length > 0) {
    sections.push({
      heading: 'Diagnosis Codes (ICD-10)',
      content: data.diagnosisCodes.map((code) => `  - ${code}`).join('\n'),
    });
  }

  // 5. Identified problems (Omaha System)
  if (data.omahaProblems.length > 0) {
    sections.push({
      heading: 'Identified Problems (Omaha System Classification)',
      content: data.omahaProblems
        .map((code) => {
          const problem = OMAHA_PROBLEMS.find((p) => p.code === code);
          return problem
            ? `  - #${code} ${problem.name} (${problem.domain})`
            : `  - #${code} ${getOmahaProblemName(code)}`;
        })
        .join('\n'),
    });
  }

  // 6. Recommended services
  sections.push({
    heading: 'Recommended Services',
    content:
      data.carePlanSummary || getDefaultServiceRecommendation(data.acuity, data.omahaProblems),
  });

  // 7. Medical necessity statement
  sections.push({
    heading: 'Medical Necessity Determination',
    content: [
      `Based on the clinical assessment (CRI score: ${data.criScore}, acuity: ${data.acuity}), I certify that the above-described in-home care services are medically necessary for ${data.patientName}.`,
      '',
      'Without these services, the patient would be at increased risk for:',
      '  - Hospitalization or emergency department utilization',
      '  - Functional decline and loss of independence',
      '  - Caregiver burnout and collapse of informal support network',
      '  - Adverse health events related to identified clinical problems',
      '',
      'HSA/FSA ELIGIBILITY DETERMINATION:',
      'These services qualify as medical care expenses under IRS Publication 502, Section 213(d) of the Internal Revenue Code. Eligible expense categories include:',
      '  - Nursing services and personal care (Pub 502, "Nursing Services")',
      '  - Home health aide services (Pub 502, "Home Care")',
      '  - Companion care when medically necessary to maintain patient safety (Pub 502, medical necessity)',
      '',
      'This Letter of Medical Necessity serves as substantiation for HSA/FSA distributions covering the recommended in-home care services.',
    ].join('\n'),
  });

  // 8. Signature block
  sections.push({
    heading: 'Physician Certification',
    content: [
      `I, ${data.physicianName}, certify that the information provided in this letter is accurate and that the recommended services are medically necessary.`,
      '',
      `Physician: ${data.physicianName}`,
      data.physicianNPI ? `NPI: ${data.physicianNPI}` : '',
      data.physicianLicense ? `License: ${data.physicianLicense}` : '',
      `Date: ____________________`,
      `Signature: ____________________`,
    ]
      .filter(Boolean)
      .join('\n'),
  });

  // 9. Validity
  sections.push({
    heading: 'Document Validity',
    content: `This Letter of Medical Necessity is valid for ${data.durationDays} days from ${formatDate(data.issuedAt)} through ${formatDate(data.expiresAt)}. A reassessment and renewal will be required prior to expiration to maintain eligibility for reimbursement.`,
  });

  return sections;
}

/**
 * Convert LMN sections to plain text (for preview or simple rendering)
 */
export function lmnToPlainText(sections: LMNSection[]): string {
  return sections
    .map((s) => `${s.heading.toUpperCase()}\n${'='.repeat(s.heading.length)}\n\n${s.content}`)
    .join('\n\n---\n\n');
}

/**
 * Default service recommendation based on acuity and problems
 */
function getDefaultServiceRecommendation(acuity: string, omahaProblems: number[]): string {
  const services: string[] = [];

  if (acuity === 'critical') {
    services.push('Daily in-home companion care (4-8 hours/day)');
    services.push('Personal care assistance (bathing, dressing, grooming)');
    services.push('Medication management and administration monitoring');
  } else {
    services.push('Regular in-home companion care (2-4 hours, 3-5 days/week)');
  }

  // Add problem-specific services
  for (const code of omahaProblems) {
    const name = getOmahaProblemName(code);
    if (code === 21) services.push(`Cognitive support and supervision (${name})`);
    if (code === 25) services.push(`Fall prevention and mobility assistance (${name})`);
    if (code === 24) services.push(`Medication reminder and compliance monitoring (${name})`);
    if (code === 27) services.push(`Nutritional support and meal preparation (${name})`);
    if (code === 38) services.push(`Personal care and hygiene assistance (${name})`);
    if (code === 12) services.push(`Social engagement and companionship (${name})`);
    if (code === 13) services.push(`Emotional support and behavioral monitoring (${name})`);
  }

  services.push('Care coordination with primary care physician');
  services.push('Regular care plan review and KBS outcome tracking');

  return services.map((s) => `  - ${s}`).join('\n');
}

/**
 * CRI factor names (for document generation without full CRI data)
 */
export function getCRIFactorNames(): string[] {
  return CRI_FACTOR_DEFINITIONS.map((f) => f.name);
}
