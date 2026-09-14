import { successResponse } from '@arunreah/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../../types/env';

export const healthModule = new Hono<AppEnv>();

healthModule.get('/', (context) => {
  return context.json(
    successResponse({
      service: 'arunreah-api',
      status: 'ok',
    }),
  );
});
