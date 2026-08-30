import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getRuntimeConfig } from './config/env';
import { healthRoute } from './routes/health';
import type { Bindings } from './types/env';
import { errorResponse } from './utils/api-response';

export const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (context, next) => {
  const { corsAllowedOrigin } = getRuntimeConfig(context.env);

  return cors({
    origin: corsAllowedOrigin,
    allowMethods: ['GET'],
  })(context, next);
});

app.route('/health', healthRoute);

app.notFound((context) => {
  return context.json(errorResponse('NOT_FOUND', 'The requested resource was not found.'), 404);
});

app.onError((error, context) => {
  console.error('Unhandled API error', {
    message: error instanceof Error ? error.message : 'Unknown error',
    method: context.req.method,
    path: context.req.path,
  });

  return context.json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred.'), 500);
});
