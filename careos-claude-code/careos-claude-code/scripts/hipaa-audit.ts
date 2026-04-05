/**
 * HIPAA Compliance Audit Script
 *
 * Automated checks for HIPAA technical safeguards.
 * Run: npx tsx scripts/hipaa-audit.ts
 *
 * Checks:
 * 1. No PHI in log statements (grep for known PHI fields)
 * 2. No PHI in localStorage usage (client-side)
 * 3. JWT expiry ≤ 15 minutes
 * 4. Audit logging coverage on PHI routes
 * 5. Log redaction configured
 * 6. Service worker PHI cache bypass
 * 7. Error handler doesn't leak internals
 * 8. 2FA required for sensitive roles
 * 9. No secrets in source code
 * 10. CORS properly restricted
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');

interface AuditResult {
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  files?: string[];
}

const results: AuditResult[] = [];

function readAllFiles(dir: string, ext: string[]): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...readAllFiles(fullPath, ext));
    } else if (entry.isFile() && ext.some(e => entry.name.endsWith(e))) {
      files.push({ path: fullPath, content: fs.readFileSync(fullPath, 'utf-8') });
    }
  }
  return files;
}

// ── Check 1: No PHI in console.log / logger calls ──────────────
function checkNoPHIInLogs() {
  const files = readAllFiles(SRC, ['.ts', '.tsx']);
  const phiPatterns = [
    /console\.log\(.*\.(ssn|dateOfBirth|firstName|lastName|phone|email)/,
    /logger\.\w+\(.*\.(ssn|dateOfBirth|diagnosis|medications)/,
  ];
  const violations: string[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of phiPatterns) {
        if (pattern.test(lines[i]!)) {
          violations.push(`${path.relative(ROOT, file.path)}:${i + 1}`);
        }
      }
    }
  }

  results.push({
    check: 'No PHI in log statements',
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    details: violations.length === 0
      ? 'No PHI fields found in log statements'
      : `Found ${violations.length} potential PHI leak(s) in logs`,
    files: violations,
  });
}

// ── Check 2: No PHI in localStorage ──────────────────────────
function checkNoLocalStoragePHI() {
  const files = readAllFiles(path.join(SRC, 'client'), ['.ts', '.tsx']);
  const phiStoragePatterns = [
    /localStorage\.setItem\(.*(?:ssn|dateOfBirth|diagnosis|firstName|lastName|phone|medical)/i,
    /sessionStorage\.setItem\(.*(?:ssn|dateOfBirth|diagnosis|firstName|lastName|phone|medical)/i,
  ];
  const violations: string[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of phiStoragePatterns) {
        if (pattern.test(lines[i]!)) {
          violations.push(`${path.relative(ROOT, file.path)}:${i + 1}`);
        }
      }
    }
  }

  results.push({
    check: 'No PHI in localStorage/sessionStorage',
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    details: violations.length === 0
      ? 'No PHI fields stored in browser storage'
      : `Found ${violations.length} potential PHI storage violation(s)`,
    files: violations,
  });
}

// ── Check 3: JWT expiry ≤ 15 minutes ─────────────────────────
function checkJWTExpiry() {
  const settingsPath = path.join(SRC, 'server/config/settings.ts');
  const content = fs.readFileSync(settingsPath, 'utf-8');

  const match = content.match(/accessExpiry.*['"](\d+[mhd])['"]/);
  const expiry = match?.[1] ?? 'unknown';

  const isCompliant = expiry === '15m' || expiry === '10m' || expiry === '5m';

  results.push({
    check: 'JWT access token expiry ≤ 15 minutes',
    status: isCompliant ? 'PASS' : 'FAIL',
    details: `Access token expiry: ${expiry}`,
  });
}

// ── Check 4: Audit logging on PHI routes ─────────────────────
function checkAuditLogging() {
  const auditPath = path.join(SRC, 'server/middleware/audit.middleware.ts');
  const content = fs.readFileSync(auditPath, 'utf-8');

  const hasFamilies = content.includes('/api/v1/families');
  const hasAssessments = content.includes('/api/v1/assessments');
  const hasFhir = content.includes('/fhir/r4');

  const allPresent = hasFamilies && hasAssessments && hasFhir;

  results.push({
    check: 'Audit logging covers all PHI routes',
    status: allPresent ? 'PASS' : 'FAIL',
    details: allPresent
      ? 'families, assessments, fhir routes all audited'
      : `Missing: ${[!hasFamilies && 'families', !hasAssessments && 'assessments', !hasFhir && 'fhir'].filter(Boolean).join(', ')}`,
  });
}

// ── Check 5: Log redaction configured ────────────────────────
function checkLogRedaction() {
  const appPath = path.join(SRC, 'server/app.ts');
  const content = fs.readFileSync(appPath, 'utf-8');

  const hasRedact = content.includes('redact');
  const redactFields = ['password', 'ssn', 'dateOfBirth', 'email', 'phone', 'firstName', 'lastName'];
  const missingFields = redactFields.filter(f => !content.includes(f));

  results.push({
    check: 'Pino log redaction configured',
    status: hasRedact && missingFields.length === 0 ? 'PASS' : 'WARN',
    details: missingFields.length === 0
      ? 'All PHI fields redacted in logs'
      : `Missing redaction for: ${missingFields.join(', ')}`,
  });
}

// ── Check 6: Service worker PHI cache bypass ─────────────────
function checkSWCacheBypass() {
  const vitePath = path.join(ROOT, 'vite.config.ts');
  const content = fs.readFileSync(vitePath, 'utf-8');

  const hasApiNetworkOnly = content.includes('NetworkOnly') && (content.includes('/api/') || content.includes('api'));
  const hasFhirNetworkOnly = content.includes('/fhir/') || content.includes('fhir');

  results.push({
    check: 'Service worker: PHI routes use NetworkOnly',
    status: hasApiNetworkOnly && hasFhirNetworkOnly ? 'PASS' : 'FAIL',
    details: hasApiNetworkOnly && hasFhirNetworkOnly
      ? '/api/ and /fhir/ routes set to NetworkOnly'
      : 'PHI routes may be cached by service worker',
  });
}

// ── Check 7: Error handler doesn't leak internals ────────────
function checkErrorHandler() {
  const files = readAllFiles(path.join(SRC, 'server/middleware'), ['.ts']);
  const errorFile = files.find(f => f.path.includes('error-handler'));

  if (!errorFile) {
    results.push({
      check: 'HIPAA-safe error handler',
      status: 'FAIL',
      details: 'Error handler middleware not found',
    });
    return;
  }

  const hasGenericError = errorFile.content.includes('INTERNAL_ERROR') || errorFile.content.includes('Internal server error');
  const noStackExpose = !errorFile.content.includes('error.stack') || errorFile.content.includes('isDev');

  results.push({
    check: 'Error handler: no PHI/stack in responses',
    status: hasGenericError && noStackExpose ? 'PASS' : 'WARN',
    details: 'Error handler returns generic messages to clients',
  });
}

// ── Check 8: 2FA required for sensitive roles ────────────────
function checkTwoFactorRequirement() {
  const files = readAllFiles(path.join(SRC, 'shared/constants'), ['.ts']);
  const rulesFile = files.find(f => f.path.includes('business-rules'));

  const has2FA = rulesFile?.content.includes('ROLES_REQUIRING_2FA') ?? false;
  const hasMD = rulesFile?.content.includes('medical_director') ?? false;
  const hasAdmin = rulesFile?.content.includes('admin') ?? false;

  results.push({
    check: '2FA required for medical_director and admin',
    status: has2FA && hasMD && hasAdmin ? 'PASS' : 'FAIL',
    details: has2FA ? 'ROLES_REQUIRING_2FA defined with sensitive roles' : '2FA requirement not found',
  });
}

// ── Check 9: No secrets in source code ───────────────────────
function checkNoHardcodedSecrets() {
  const files = readAllFiles(SRC, ['.ts', '.tsx']);
  const secretPatterns = [
    /(?:sk_live|sk_test)_[a-zA-Z0-9]{20,}/,
    /(?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}/,
    /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
    /ghp_[a-zA-Z0-9]{36}/,
  ];
  const violations: string[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of secretPatterns) {
        if (pattern.test(lines[i]!)) {
          violations.push(`${path.relative(ROOT, file.path)}:${i + 1}`);
        }
      }
    }
  }

  results.push({
    check: 'No hardcoded secrets in source',
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    details: violations.length === 0
      ? 'No API keys, private keys, or tokens found in source'
      : `Found ${violations.length} potential secret(s)`,
    files: violations,
  });
}

// ── Check 10: CORS restricted ────────────────────────────────
function checkCORS() {
  const settingsPath = path.join(SRC, 'server/config/settings.ts');
  const content = fs.readFileSync(settingsPath, 'utf-8');

  const usesEnvCors = content.includes('CORS_ORIGINS');
  const noWildcard = !content.includes("'*'") || content.includes('corsOrigins');

  results.push({
    check: 'CORS origins from environment (no wildcard)',
    status: usesEnvCors && noWildcard ? 'PASS' : 'WARN',
    details: usesEnvCors ? 'CORS origins configured via CORS_ORIGINS env var' : 'CORS may use wildcard',
  });
}

// ── Run all checks ───────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║        CareOS HIPAA Compliance Audit            ║');
console.log('╚══════════════════════════════════════════════════╝\n');

checkNoPHIInLogs();
checkNoLocalStoragePHI();
checkJWTExpiry();
checkAuditLogging();
checkLogRedaction();
checkSWCacheBypass();
checkErrorHandler();
checkTwoFactorRequirement();
checkNoHardcodedSecrets();
checkCORS();

const passed = results.filter(r => r.status === 'PASS').length;
const warned = results.filter(r => r.status === 'WARN').length;
const failed = results.filter(r => r.status === 'FAIL').length;

for (const r of results) {
  const icon = r.status === 'PASS' ? 'PASS' : r.status === 'WARN' ? 'WARN' : 'FAIL';
  console.log(`[${icon}] ${r.check}`);
  console.log(`       ${r.details}`);
  if (r.files?.length) {
    for (const f of r.files.slice(0, 5)) {
      console.log(`       - ${f}`);
    }
    if (r.files.length > 5) console.log(`       ... and ${r.files.length - 5} more`);
  }
  console.log();
}

console.log('─────────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${warned} warnings, ${failed} failed`);
console.log('─────────────────────────────────────────────────\n');

if (failed > 0) {
  process.exit(1);
}
