import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import type { AppEnv } from '../../types/env';
import {
  createAdminDoctorController,
  deleteAdminDoctorController,
  getAdminDoctorController,
  getPublicDoctorController,
  listAdminDoctorsController,
  listPublicDoctorsController,
  reorderAdminDoctorsController,
  updateAdminDoctorController,
} from './doctor.controller';

export const publicTeamModule = new Hono<AppEnv>();
export const adminTeamModule = new Hono<AppEnv>();

publicTeamModule.get('/', listPublicDoctorsController);
publicTeamModule.get('/:slug', getPublicDoctorController);

adminTeamModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminTeamModule.get('/', listAdminDoctorsController);
adminTeamModule.post('/', createAdminDoctorController);
adminTeamModule.patch('/reorder', reorderAdminDoctorsController);
adminTeamModule.get('/:id', getAdminDoctorController);
adminTeamModule.patch('/:id', updateAdminDoctorController);
adminTeamModule.delete('/:id', deleteAdminDoctorController);
