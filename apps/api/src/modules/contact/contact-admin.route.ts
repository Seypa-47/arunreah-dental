import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import { getAdminContactController, updateAdminContactController } from './contact.controller';
import type { AppEnv } from '../../types/env';

export const adminContactModule = new Hono<AppEnv>();

adminContactModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminContactModule.get('/', getAdminContactController);
adminContactModule.patch('/', updateAdminContactController);
