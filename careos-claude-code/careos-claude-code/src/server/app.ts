/**
 * Fastify 5 App Factory
 * Plugin registration, CORS, Helmet, middleware
 */
import Fastify, { type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fs from 'fs';
import path from 'path';
import { config } from './config/settings.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { auditHook } from './middleware/audit.middleware.js';
import { authPlugin } from './modules/auth/plugin.js';
import { familyPlugin } from './modules/family/plugin.js';
import { assessmentPlugin } from './modules/assessments/plugin.js';
import { timebankPlugin } from './modules/timebank/plugin.js';
import { fhirSyncPlugin } from './modules/fhir-sync/plugin.js';
import { notificationPlugin } from './modules/notifications/plugin.js';
import { paymentPlugin } from './modules/payment/plugin.js';
import { workerPlugin } from './modules/worker/plugin.js';
import { lmnPlugin } from './modules/lmn/plugin.js';
import { adminPlugin } from './modules/admin/plugin.js';
import { employerPlugin } from './modules/employer/plugin.js';
import { acpPlugin } from './modules/acp/plugin.js';
import { coveragePlugin } from './modules/coverage/plugin.js';
import { settingsPlugin } from './modules/settings/plugin.js';
import { sagePlugin } from './modules/sage/plugin.js';
import { contactPlugin } from './modules/contact/plugin.js';
import { referralPlugin } from './modules/referrals/plugin.js';
import { communityPlugin } from './modules/community/plugin.js';
import { reimbursementPlugin } from './modules/reimbursement/plugin.js';
import { socialPlugin } from './modules/social/plugin.js';
import { matchingPlugin } from './modules/matching/plugin.js';
import { waitlistPlugin } from './modules/waitlist/plugin.js';
import { analyticsPlugin } from './modules/analytics/plugin.js';
import { web3Plugin } from './modules/web3/plugin.js';
import { nutritionPlugin } from './modules/nutrition/plugin.js';
import { referralRewardsPlugin } from './modules/referral-rewards/plugin.js';
import { peerSupportPlugin } from './modules/peer-support/plugin.js';
import { wellnessPlugin } from './modules/wellness/plugin.js';
import { wsPlugin } from './ws/handler.js';
import { initAgents } from './agents/index.js';
import { registerAgentRoutes } from './agents/api.js';
import { guidePlugin } from './modules/guide/plugin.js';
import { actionPlugin } from './modules/action/plugin.js';
import { mcpTransport } from './mcp/transport.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.isDev() ? 'debug' : 'info',
      transport: config.isDev()
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:HH:MM:ss',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          '*.password',
          '*.ssn',
          '*.dateOfBirth',
          '*.email',
          '*.phone',
          '*.firstName',
          '*.lastName',
        ],
        censor: '[REDACTED]',
      },
    },
    disableRequestLogging: config.isProd(),
  });

  // --- Core plugins ---
  await app.register(cors, {
    origin: config.corsOrigins,
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: config.isProd()
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://plausible.io'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://plausible.io', 'wss:', 'https://js.stripe.com'],
            frameSrc: ["'self'", 'https://js.stripe.com'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
  });

  await app.register(cookie);

  await app.register(sensible);

  // --- Swagger / OpenAPI docs (dev only) ---
  if (config.isDev()) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'CareOS API',
          description: 'The operating system for cooperative home care and wellness',
          version: '1.0.0',
        },
        servers: [{ url: '/' }],
        tags: [
          { name: 'auth', description: 'Authentication' },
          { name: 'families', description: 'Family management' },
          { name: 'assessments', description: 'CII/CRI/KBS assessments' },
          { name: 'timebank', description: 'Time Bank operations' },
          { name: 'workers', description: 'Worker-Owner management' },
          { name: 'billing', description: 'Billing & Comfort Card' },
          { name: 'admin', description: 'Administration' },
        ],
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', deepLinking: true },
    });
  }

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // --- Middleware hooks ---
  app.addHook('onResponse', auditHook);
  app.setErrorHandler(errorHandler);

  // --- Health check (verifies database connectivity) ---
  app.get('/health', async (_request, reply) => {
    const checks: Record<string, 'ok' | 'error'> = {};
    let healthy = true;

    // PostgreSQL check
    try {
      const { getPostgres } = await import('./database/postgres.js');
      const pg = getPostgres();
      await pg.query('SELECT 1');
      checks.postgres = 'ok';
    } catch {
      checks.postgres = 'error';
      healthy = false;
    }

    // Redis check
    try {
      const { getRedis } = await import('./database/redis.js');
      const redis = getRedis();
      await redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
      healthy = false;
    }

    const payload = {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };

    return reply.status(healthy ? 200 : 503).send(payload);
  });

  // --- Module plugins ---
  await app.register(authPlugin, { prefix: '/api/v1/auth' });
  await app.register(familyPlugin, { prefix: '/api/v1/families' });
  await app.register(assessmentPlugin, { prefix: '/api/v1/assessments' });
  await app.register(timebankPlugin, { prefix: '/api/v1/timebank' });
  await app.register(fhirSyncPlugin, { prefix: '/api/v1/fhir-sync' });
  await app.register(notificationPlugin, { prefix: '/api/v1/notifications' });
  await app.register(paymentPlugin, { prefix: '/api/v1/payments' });
  await app.register(workerPlugin, { prefix: '/api/v1/workers' });
  await app.register(lmnPlugin, { prefix: '/api/v1/lmn' });
  await app.register(adminPlugin, { prefix: '/api/v1/admin' });
  await app.register(employerPlugin, { prefix: '/api/v1/employer' });
  await app.register(acpPlugin, { prefix: '/api/v1/acp' });
  await app.register(coveragePlugin, { prefix: '/api/v1/coverage' });
  await app.register(settingsPlugin, { prefix: '/api/v1/settings' });
  await app.register(sagePlugin, { prefix: '/api/v1/sage' });
  await app.register(guidePlugin, { prefix: '/api/v1/guide' });
  await app.register(actionPlugin, { prefix: '/api/v1/action' });
  await app.register(mcpTransport);
  await app.register(contactPlugin, { prefix: '/api/v1/contact' });
  await app.register(referralPlugin, { prefix: '/api/v1/referrals' });
  await app.register(communityPlugin, { prefix: '/api/v1/community' });
  await app.register(reimbursementPlugin, { prefix: '/api/v1/reimbursement' });
  await app.register(socialPlugin, { prefix: '/api/v1/social' });
  await app.register(matchingPlugin, { prefix: '/api/v1/matching' });
  await app.register(waitlistPlugin, { prefix: '/api/v1/waitlist' });
  await app.register(analyticsPlugin, { prefix: '/api/v1/analytics' });
  await app.register(web3Plugin, { prefix: '/api/v1/web3' });
  await app.register(nutritionPlugin, { prefix: '/api/v1/nutrition' });
  await app.register(referralRewardsPlugin, { prefix: '/api/v1/referral-rewards' });
  await app.register(peerSupportPlugin, { prefix: '/api/v1/peer-support' });
  await app.register(wellnessPlugin, { prefix: '/api/v1/wellness' });

  // --- WebSocket ---
  await app.register(wsPlugin);

  // --- Agent System ---
  initAgents();
  await registerAgentRoutes(app);

  // --- Static file serving (any Railway environment — dev or prod) ---
  // Guard on file existence so local `npm run dev:server` (no build) still works.
  const clientDir = path.join(process.cwd(), 'dist', 'client');
  if (fs.existsSync(path.join(clientDir, 'index.html'))) {
    await app.register(fastifyStatic, {
      root: clientDir,
      prefix: '/',
      wildcard: false,
    });

    // SPA fallback: serve index.html for all non-API, non-file routes
    app.setNotFoundHandler(async (req, reply) => {
      if (req.url.startsWith('/api/') || req.url.startsWith('/ws')) {
        return reply.code(404).send({ error: 'Not found' });
      }
      return reply.sendFile('index.html');
    });
  }

  return app;
}
