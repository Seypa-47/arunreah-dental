import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import type { AppEnv } from '../../types/env';
import {
  createAdminShowcaseController,
  deleteAdminShowcaseController,
  getAdminShowcaseController,
  getPublicShowcaseController,
  listAdminShowcasesController,
  listPublicShowcasesController,
  updateAdminShowcaseController,
} from './showcase.controller';

export const publicShowcasesModule = new Hono<AppEnv>();
export const adminShowcasesModule = new Hono<AppEnv>();

publicShowcasesModule.get('/', listPublicShowcasesController);
publicShowcasesModule.get('/:slug', getPublicShowcaseController);

adminShowcasesModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminShowcasesModule.get('/', listAdminShowcasesController);
adminShowcasesModule.post('/', createAdminShowcaseController);
adminShowcasesModule.get('/:id', getAdminShowcaseController);
adminShowcasesModule.patch('/:id', updateAdminShowcaseController);
adminShowcasesModule.delete('/:id', deleteAdminShowcaseController);
