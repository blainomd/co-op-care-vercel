#!/usr/bin/env node
/**
 * Generate VAPID keys for web push notifications.
 * Run: node scripts/generate-vapid.js
 * Copy output into your .env file.
 */
import webPush from 'web-push';

const vapidKeys = webPush.generateVAPIDKeys();

console.log('# Add these to your .env file:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
