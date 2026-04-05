/**
 * init-aidbox.ts — Load FHIR Init Bundle into Aidbox
 *
 * Loads: Omaha CodeSystem, CII/CRI Questionnaires, ICD-10↔Omaha ConceptMaps
 *
 * Usage: npx tsx scripts/init-aidbox.ts
 *
 * Environment variables:
 *   AIDBOX_URL — Aidbox base URL (default: http://localhost:8888)
 *   AIDBOX_CLIENT_ID — OAuth client ID
 *   AIDBOX_CLIENT_SECRET — OAuth client secret
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const AIDBOX_URL = process.env['AIDBOX_URL'] ?? 'http://localhost:8888';
const AIDBOX_CLIENT_ID = process.env['AIDBOX_CLIENT_ID'] ?? 'root';
const AIDBOX_CLIENT_SECRET = process.env['AIDBOX_CLIENT_SECRET'] ?? 'secret';

const BUNDLE_FILES = [
  'omaha-codesystem.json',
  'cii-questionnaire.json',
  'cri-questionnaire.json',
  'omaha-to-icd10-conceptmap.json',
  'icd10-to-omaha-conceptmap.json',
];

interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: unknown;
}

async function getAccessToken(): Promise<string> {
  const response = await fetch(`${AIDBOX_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: AIDBOX_CLIENT_ID,
      client_secret: AIDBOX_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

async function upsertResource(token: string, resource: FHIRResource): Promise<void> {
  const { resourceType, id } = resource;
  const url = `${AIDBOX_URL}/fhir/${resourceType}/${id}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to upsert ${resourceType}/${id}: ${response.status} — ${body}`);
  }

  console.log(`  ✓ ${resourceType}/${id}`);
}

async function main() {
  console.log(`\nInitializing Aidbox at ${AIDBOX_URL}...\n`);

  let token: string;
  try {
    token = await getAccessToken();
    console.log('  ✓ Authenticated\n');
  } catch (error) {
    console.error('  ✗ Failed to authenticate with Aidbox.');
    console.error('    Make sure Aidbox is running and credentials are correct.');
    console.error(`    URL: ${AIDBOX_URL}`);
    console.error(`    Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  const configDir = join(import.meta.dirname ?? __dirname, '..', 'config', 'aidbox');
  let successCount = 0;
  let errorCount = 0;

  for (const file of BUNDLE_FILES) {
    try {
      const filePath = join(configDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const resource = JSON.parse(content) as FHIRResource;
      await upsertResource(token, resource);
      successCount++;
    } catch (error) {
      console.error(`  ✗ ${file}: ${error instanceof Error ? error.message : error}`);
      errorCount++;
    }
  }

  console.log(`\nDone: ${successCount} loaded, ${errorCount} failed.\n`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
