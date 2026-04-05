/**
 * HIPAA-Safe Error Handler
 * Never exposes PHI, stack traces, or DB internals in responses.
 */
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../common/errors.js';
import { logger } from '../common/logger.js';

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // Known application errors
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
    });
    return;
  }

  // Fastify errors (validation, rate-limit, etc.)
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    if (error.statusCode === 429) {
      reply.status(429).send({
        error: 'RATE_LIMITED',
        message: 'Too many requests',
      });
      return;
    }

    if (error.statusCode === 400) {
      reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Invalid request',
      });
      return;
    }
  }

  // Unexpected errors — log internally but never expose details
  logger.error({ err: error, method: request.method, url: request.url }, 'Unhandled error');

  reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
