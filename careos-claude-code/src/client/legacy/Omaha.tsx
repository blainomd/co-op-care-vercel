import React, { useState } from 'react';
import { C, ff, fs, useIsMobile } from './theme';

const OMAHA_DOMAINS = [
  {
    id: 'environmental',
    name: 'Environmental Domain',
    color: '#4caf50',
    problems: [
      { id: 'income', name: 'Income', description: 'Inadequate or unstable financial resources.' },
      { id: 'sanitation', name: 'Sanitation', description: 'Inadequate hygiene or cleanliness of living area.' },
      { id: 'residence', name: 'Residence', description: 'Inadequate or unsafe housing.' },
      { id: 'neighborhood', name: 'Neighborhood/Workplace Safety', description: 'Unsafe conditions in surrounding area.' }
    ]
  },
  {
    id: 'psychosocial',
    name: 'Psychosocial Domain',
    color: '#9c27b0',
    problems: [
      { id: 'communication', name: 'Communication with Community Resources', description: 'Inability to access or use necessary services.' },
      { id: 'social_contact', name: 'Social Contact', description: 'Inadequate or limited social interaction.' },
      { id: 'role_change', name: 'Role Change', description: 'Difficulty adjusting to new roles or responsibilities.' },
      { id: 'interpersonal', name: 'Interpersonal Relationship', description: 'Difficulty relating to others.' },
      { id: 'spirituality', name: 'Spirituality', description: 'Distress related to spiritual beliefs or practices.' },
      { id: 'grief', name: 'Grief', description: 'Difficulty coping with loss.' },
      { id: 'mental_health', name: 'Mental Health', description: 'Symptoms of mental illness or emotional distress.' },
      { id: 'sexuality', name: 'Sexuality', description: 'Concerns or difficulties related to sexual function or identity.' },
      { id: 'caretaking', name: 'Caretaking/Parenting', description: 'Difficulty providing care for dependents.' },
      { id: 'neglect', name: 'Neglect', description: 'Failure to provide necessary care or attention.' },
      { id: 'abuse', name: 'Abuse', description: 'Physical, emotional, or sexual harm inflicted by others.' },
      { id: 'growth', name: 'Growth and Development', description: 'Delayed or abnormal physical or cognitive development.' }
    ]
  },
  {
    id: 'physiological',
    name: 'Physiological Domain',
    color: '#f44336',
    problems: [
      { id: 'hearing', name: 'Hearing', description: 'Impaired ability to hear.' },
      { id: 'vision', name: 'Vision', description: 'Impaired ability to see.' },
      { id: 'speech', name: 'Speech and Language', description: 'Difficulty communicating verbally.' },
      { id: 'oral_health', name: 'Oral Health', description: 'Problems with teeth, gums, or mouth.' },
      { id: 'cognition', name: 'Cognition', description: 'Impaired thinking, memory, or judgment.' },
      { id: 'pain', name: 'Pain', description: 'Physical discomfort or suffering.' },
      { id: 'consciousness', name: 'Consciousness', description: 'Altered state of awareness.' },
      { id: 'skin', name: 'Skin', description: 'Problems with skin integrity or condition.' },
      { id: 'neuro', name: 'Neuromusculoskeletal Function', description: 'Impaired movement, strength, or coordination.' },
      { id: 'respiration', name: 'Respiration', description: 'Difficulty breathing.' },
      { id: 'circulation', name: 'Circulation', description: 'Impaired blood flow.' },
      { id: 'digestion', name: 'Digestion-Hydration', description: 'Problems with eating, drinking, or digestion.' },
      { id: 'bowel', name: 'Bowel Function', description: 'Problems with bowel elimination.' },
      { id: 'urinary', name: 'Urinary Function', description: 'Problems with urinary elimination.' },
      { id: 'reproductive', name: 'Reproductive Function', description: 'Problems with reproductive organs or processes.' },
      { id: 'pregnancy', name: 'Pregnancy', description: 'Conditions related to pregnancy or childbirth.' },
      { id: 'postpartum', name: 'Postpartum', description: 'Conditions related to the period after childbirth.' },
      { id: 'communicable', name: 'Communicable/Infectious Condition', description: 'Infection that can be transmitted to others.' }
    ]
  },
  {
    id: 'health_related_behaviors',
    name: 'Health Related Behaviors Domain',
    color: '#ff9800',
    problems: [
      { id: 'nutrition', name: 'Nutrition', description: 'Inadequate or inappropriate dietary intake.' },
      { id: 'sleep', name: 'Sleep and Rest Patterns', description: 'Inadequate or disrupted sleep.' },
      { id: 'physical_activity', name: 'Physical Activity', description: 'Inadequate or inappropriate exercise.' },
      { id: 'personal_care', name: 'Personal Care', description: 'Difficulty with activities of daily living (ADLs).' },
      { id: 'substance_use', name: 'Substance Use', description: 'Harmful use of alcohol, drugs, or tobacco.' },
      { id: 'family_planning', name: 'Family Planning', description: 'Concerns or difficulties related to contraception or family size.' },
      { id: 'healthcare_supervision', name: 'Health Care Supervision', description: 'Inadequate or inappropriate medical care.' },
      { id: 'medication', name: 'Medication Regimen', description: 'Difficulty managing or taking medications correctly.' }
    ]
  }
];

export default function Omaha() {
  const isMobile = useIsMobile();
  const [activeDomain, setActiveDomain] = useState(OMAHA_DOMAINS[0].id);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: fs, color: C.dark }}>
      <header style={{ background: C.dark, color: C.w, padding: isMobile ? '32px 16px' : '64px 48px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: ff, fontSize: isMobile ? 32 : 48, fontWeight: 600, margin: '0 0 16px 0' }}>The Omaha System</h1>
        <p style={{ fontSize: 18, color: C.t4, maxWidth: 800, margin: '0 auto', lineHeight: 1.6 }}>
          A research-based, comprehensive practice and documentation standardized taxonomy designed to describe client care.
          We use this to map everyday observations into structured clinical data.
        </p>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '48px' }}>
        
        {/* Domain Navigation */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 48, justifyContent: 'center' }}>
          {OMAHA_DOMAINS.map(domain => (
            <button
              key={domain.id}
              onClick={() => setActiveDomain(domain.id)}
              style={{
                background: activeDomain === domain.id ? domain.color : C.w,
                color: activeDomain === domain.id ? C.w : C.t1,
                border: `1px solid ${activeDomain === domain.id ? domain.color : C.border}`,
                padding: '12px 24px',
                borderRadius: 24,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {domain.name}
            </button>
          ))}
        </div>

        {/* Active Domain Content */}
        {OMAHA_DOMAINS.map(domain => (
          <div key={domain.id} style={{ display: activeDomain === domain.id ? 'block' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {domain.problems.map(problem => (
                <div key={problem.id} style={{ background: C.w, padding: 24, borderRadius: 12, border: `1px solid ${C.border}`, borderTop: `4px solid ${domain.color}` }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: C.dark, margin: '0 0 8px 0' }}>{problem.name}</h3>
                  <p style={{ fontSize: 14, color: C.t1, margin: 0, lineHeight: 1.5 }}>{problem.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* How We Use It Section */}
        <div style={{ marginTop: 64, background: C.dark, color: C.w, padding: isMobile ? 32 : 48, borderRadius: 16 }}>
          <h2 style={{ fontFamily: ff, fontSize: 24, fontWeight: 600, margin: '0 0 24px 0', color: C.sage }}>How We Use The Omaha System</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 32 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>1. Ambient Scribe Translation</h3>
              <p style={{ fontSize: 14, color: C.t4, lineHeight: 1.6 }}>
                When a CNA or neighbor records a voice note (e.g., "Mom didn't eat much today and seems confused"), our Ambient Scribe uses LLMs to map this to specific Omaha problems (Nutrition, Cognition).
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>2. LMN Generation</h3>
              <p style={{ fontSize: 14, color: C.t4, lineHeight: 1.6 }}>
                These structured problems form the basis of the Letter of Medical Necessity (LMN). By proving a deficit in an Omaha domain, we justify the use of pre-tax HSA funds for care.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>3. Caregiver Intensity Index (CII)</h3>
              <p style={{ fontSize: 14, color: C.t4, lineHeight: 1.6 }}>
                The severity and frequency of Omaha problems directly feed into our CII algorithm, helping us predict caregiver burnout and intervene before a crisis occurs.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>4. FHIR Interoperability</h3>
              <p style={{ fontSize: 14, color: C.t4, lineHeight: 1.6 }}>
                Omaha System codes are mapped to SNOMED CT and LOINC, allowing us to seamlessly share care data with hospital EHRs (like Epic) via FHIR Observations.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
