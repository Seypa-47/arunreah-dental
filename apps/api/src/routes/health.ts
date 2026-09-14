import { Hono } from 'hono';
import type { Bindings } from '../types/env';
import { successResponse } from '../utils/api-response';

export const healthRoute = new Hono<{ Bindings: Bindings }>();

healthRoute.get('/', (context) => {
  return context.json(
    successResponse({
      service: 'arunreah-api',
      status: 'ok',
    }),
  );
});
