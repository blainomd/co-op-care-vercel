# II. Scope of Work

## 2.1 Summary

Phase 1 delivers the production infrastructure foundation for the **co-op.care** platform: a HIPAA-compliant cloud environment, development environment and CI/CD pipeline, Stripe payment backend, and role-based access control. This infrastructure enables the Client to develop and deploy application features (assessments, website, payment UI) using AI-assisted coding tools against a production-grade backend.

---

## 2.2 Phase 1 Deliverables

### 1. HIPAA-Compliant Cloud Infrastructure
a. AWS environment with encrypted storage  
b. Audit logging and access monitoring  
c. Role-based access control (RBAC) foundation supporting three role tiers (Admin, Clinical Director, Family)  
d. Business Associate Agreement (BAA) executed with AWS  

### 2. Development Environment and CI/CD Pipeline
a. GitHub repository with branch protection (PR required for `main`)  
b. CI pipeline (lint, type check, test on PR)  
c. Staging and production deployment pipeline  
d. Dev branch for Client development with PR-based review workflow  
e. GreptileAI integration for AI-assisted development  

### 3. Stripe Payment Backend
a. Stripe account configuration including MCC 8099 for HSA/FSA eligibility  
b. $100 deposit payment endpoint  
c. Webhook handling for payment events  
d. Payment data persistence with receipt generation  
e. Client to build payment UI against this backend  

### 4. Authentication and Authorization
a. Email/password authentication  
b. Three-role access control (Admin, Clinical Director, Family) enforced at the database level  
c. Session management and secure token handling  

---

## 2.3 Phase 1 Exclusions  
*(Client Responsibility or Deferred to Phase 1+)*

The following are the Client's responsibility to build using the infrastructure provided, or are deferred to Phase 1+:

- CII Assessment front-end UI (Client builds against provided backend)  
- CRI Assessment front-end UI (Client builds against provided backend)  
- Website deployment (Client deploys existing React components)  
- Payment collection UI (Client builds against Stripe backend)  
- Activation map UI  
- Admin dashboard UI  
- Email notifications  
- Production architecture document / CMS ACCESS narrative  
- CareOS Voice AI / ambient documentation pipeline  
- Omaha System coding engine and ICD-10 crosswalk  
- EVV compliance for Medicaid billing  
- Family dashboard MVP  
- Time Bank MVP  
- FHIR R4 integration with BCH EHR  
- Caregiver matching engine  
- Multi-payer billing engine  
- Cooperative governance tools  
- Patronage and equity tracking system  

---

## 2.4 Target Timeline

| Week   | Deliverables |
|--------|--------------|
| Week 1 | Kickoff, AWS environment, database schema, authentication, CI/CD pipeline |
| Week 2 | Stripe backend, RBAC enforcement, deployment pipeline, handoff documentation |

**Target Completion:** March 19, 2026  

 
Target Completion: March 19, 2026 (aligned with CMS ACCESS Model application deadline of April 1st)
<img width="468" height="637" alt="image" src="https://github.com/user-attachments/assets/22d486c9-4ba9-4798-9151-8bf9da63b7ed" />
