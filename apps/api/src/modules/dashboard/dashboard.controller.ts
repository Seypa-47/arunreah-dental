import { successResponse } from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { getAdminDashboard } from '../../services/dashboard.service';
import { HttpError } from '../../shared/http-error';
import type { AppEnv } from '../../types/env';

export async function getAdminDashboardController(context: Context<AppEnv>) {
  const admin = context.get('authenticatedAdmin');
  if (!admin) throw new HttpError(401, 'UNAUTHORIZED', 'Authentication is required.');
  const dashboard = await getAdminDashboard(createDbClient(context.env.DB), admin);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(dashboard));
}
