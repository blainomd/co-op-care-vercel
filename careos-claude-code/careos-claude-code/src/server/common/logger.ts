/**
 * Structured Logger — HIPAA-safe (no PHI in logs)
 * Uses Pino for high-performance structured logging.
 */
import pino from 'pino';
import { config } from '../config/settings.js';

export const logger = pino({
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
  // Redact any PHI fields that might accidentally appear
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
});

export type Logger = typeof logger;
