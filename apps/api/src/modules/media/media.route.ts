import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import type { AppEnv } from '../../types/env';
import { deleteMediaController, uploadMediaController } from './media.controller';

export const adminMediaModule = new Hono<AppEnv>();

adminMediaModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminMediaModule.post('/', uploadMediaController);
adminMediaModule.delete('/', deleteMediaController);
