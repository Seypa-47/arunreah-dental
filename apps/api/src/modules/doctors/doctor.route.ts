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
  updateAdminDoctorController,
} from './doctor.controller';

export const publicDoctorsModule = new Hono<AppEnv>();
export const adminDoctorsModule = new Hono<AppEnv>();

publicDoctorsModule.get('/', listPublicDoctorsController);
publicDoctorsModule.get('/:slug', getPublicDoctorController);

adminDoctorsModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminDoctorsModule.get('/', listAdminDoctorsController);
adminDoctorsModule.post('/', createAdminDoctorController);
adminDoctorsModule.get('/:id', getAdminDoctorController);
adminDoctorsModule.patch('/:id', updateAdminDoctorController);
adminDoctorsModule.delete('/:id', deleteAdminDoctorController);
