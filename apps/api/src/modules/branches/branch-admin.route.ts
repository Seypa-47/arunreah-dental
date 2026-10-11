import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import {
  createAdminBranchController,
  deleteAdminBranchController,
  getAdminBranchController,
  listAdminBranchesController,
  updateAdminBranchController,
} from './branch.controller';
import type { AppEnv } from '../../types/env';

export const adminBranchesModule = new Hono<AppEnv>();

adminBranchesModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminBranchesModule.get('/', listAdminBranchesController);
adminBranchesModule.post('/', createAdminBranchController);
adminBranchesModule.get('/:id', getAdminBranchController);
adminBranchesModule.patch('/:id', updateAdminBranchController);
adminBranchesModule.delete('/:id', deleteAdminBranchController);
