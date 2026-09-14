import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import {
  createPublicAppointmentController,
  getAdminAppointmentController,
  listAdminAppointmentsController,
  updateAdminAppointmentStatusController,
} from './appointment.controller';
import type { AppEnv } from '../../types/env';

export const publicAppointmentsModule = new Hono<AppEnv>();
export const adminAppointmentsModule = new Hono<AppEnv>();

publicAppointmentsModule.post('/', createPublicAppointmentController);
adminAppointmentsModule.use('*', requireAdmin, requirePermission('APPOINTMENT_MANAGEMENT'));
adminAppointmentsModule.get('/', listAdminAppointmentsController);
adminAppointmentsModule.get('/:id', getAdminAppointmentController);
adminAppointmentsModule.patch('/:id/status', updateAdminAppointmentStatusController);
