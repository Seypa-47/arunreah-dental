import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import type { AppEnv } from '../../types/env';
import {
  createAdminServiceController,
  deleteAdminServiceController,
  getAdminServiceController,
  getPublicServiceController,
  listAdminServicesController,
  listPublicServicesController,
  updateAdminServiceController,
} from './service.controller';

export const publicServicesModule = new Hono<AppEnv>();
export const adminServicesModule = new Hono<AppEnv>();

publicServicesModule.get('/', listPublicServicesController);
publicServicesModule.get('/:slug', getPublicServiceController);

adminServicesModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminServicesModule.get('/', listAdminServicesController);
adminServicesModule.post('/', createAdminServiceController);
adminServicesModule.get('/:id', getAdminServiceController);
adminServicesModule.patch('/:id', updateAdminServiceController);
adminServicesModule.delete('/:id', deleteAdminServiceController);
