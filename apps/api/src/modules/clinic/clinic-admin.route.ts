import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import { getAdminClinicController, updateAdminClinicController } from './clinic.controller';
import type { AppEnv } from '../../types/env';

export const adminClinicModule = new Hono<AppEnv>();

adminClinicModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminClinicModule.get('/', getAdminClinicController);
adminClinicModule.patch('/', updateAdminClinicController);
