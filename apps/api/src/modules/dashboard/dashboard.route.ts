import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import type { AppEnv } from '../../types/env';
import { getAdminDashboardController } from './dashboard.controller';

export const adminDashboardModule = new Hono<AppEnv>();

adminDashboardModule.use('*', requireAdmin);
adminDashboardModule.get('/', getAdminDashboardController);
