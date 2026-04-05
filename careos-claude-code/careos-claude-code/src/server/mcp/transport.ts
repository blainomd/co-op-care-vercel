/**
 * MCP HTTP Transport — The endpoint Claude connects to
 *
 * Registers as a Fastify route at /mcp
 * Handles the MCP JSON-RPC protocol over HTTP + SSE
 *
 * Claude's custom connector dialog:
 *   Name: co-op.care
 *   Remote MCP server URL: https://careos-claude-code.vercel.app/mcp
 *
 * That's it. One URL. Everyone gets a personalized harness.
 */
import type { FastifyInstance } from 'fastify';
import { handleMCPRequest, type MCPRequest } from './server.js';
import { logger } from '../common/logger.js';

export async function mcpTransport(app: FastifyInstance): Promise<void> {
  /**
   * POST /mcp — JSON-RPC endpoint for MCP protocol
   * Claude sends tool calls here. We return results.
   */
  app.post('/mcp', async (request, reply) => {
    const body = request.body as MCPRequest;

    // Extract user identity from headers or generate session
    const userId =
      (request.headers['x-user-id'] as string) ||
      (request.headers['authorization'] as string) ||
      `anon-${request.ip}`;

    logger.info(
      { method: body.method, userId: userId.slice(0, 8) + '...' },
      'MCP request received',
    );

    const response = await handleMCPRequest(body, userId);

    reply.header('Content-Type', 'application/json');
    return response;
  });

  /**
   * GET /mcp — SSE endpoint for server-initiated messages
   * Used for real-time updates (medication alerts, etc.)
   */
  app.get('/mcp', async (request, reply) => {
    reply.header('Content-Type', 'text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');

    // Send initial connection event
    reply.raw.write(`data: ${JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    })}\n\n`);

    // Keep connection alive
    const keepAlive = setInterval(() => {
      reply.raw.write(': keepalive\n\n');
    }, 30000);

    request.raw.on('close', () => {
      clearInterval(keepAlive);
    });
  });

  /**
   * OPTIONS /mcp — CORS preflight
   */
  app.options('/mcp', async (_request, reply) => {
    reply
      .header('Access-Control-Allow-Origin', '*')
      .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id')
      .status(204)
      .send();
  });
}
