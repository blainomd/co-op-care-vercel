#!/usr/bin/env node
/**
 * Generate ES256 keypair for JWT signing.
 * Run: node scripts/generate-keys.js
 * Copy output into your .env file.
 */
import { generateKeyPair, exportSPKI, exportPKCS8 } from 'jose';

async function main() {
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const pub = await exportSPKI(publicKey);
  const priv = await exportPKCS8(privateKey);

  console.log('# Add these to your .env file:\n');
  console.log(`JWT_PUBLIC_KEY="${pub.replace(/\n/g, '\\n')}"`);
  console.log(`JWT_PRIVATE_KEY="${priv.replace(/\n/g, '\\n')}"`);
}

main().catch(console.error);
