import { Hono } from 'hono';
import { errorResponse } from '@arunreah/shared';
import { corsMiddleware } from './middleware/cors';
import { globalErrorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { healthModule } from './modules/health/health.route';
import { adminsModule } from './modules/admins/admins.route';
import { authModule } from './modules/auth/auth.route';
import type { AppEnv } from './types/env';

export const app = new Hono<AppEnv>();

app.use('*', requestLogger);
app.use('*', corsMiddleware);

app.route('/api/health', healthModule);
app.route('/api/auth', authModule);
app.route('/api/admin/admins', adminsModule);

app.notFound((context) => {
  return context.json(errorResponse('NOT_FOUND', 'The requested resource was not found.'), 404);
});

app.onError(globalErrorHandler);
