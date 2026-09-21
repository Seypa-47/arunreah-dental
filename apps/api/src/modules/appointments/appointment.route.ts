import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import {
  createPublicAppointmentController,
  getAdminAppointmentController,
  getAdminTelegramStatusController,
  listAdminAppointmentsController,
  testAdminTelegramNotificationController,
  updateAdminAppointmentStatusController,
} from './appointment.controller';
import type { AppEnv } from '../../types/env';

export const publicAppointmentsModule = new Hono<AppEnv>();
export const adminAppointmentsModule = new Hono<AppEnv>();

publicAppointmentsModule.post('/', createPublicAppointmentController);
adminAppointmentsModule.use('*', requireAdmin, requirePermission('APPOINTMENT_MANAGEMENT'));
adminAppointmentsModule.get('/', listAdminAppointmentsController);
adminAppointmentsModule.get('/telegram-status', getAdminTelegramStatusController);
adminAppointmentsModule.post('/telegram-test', testAdminTelegramNotificationController);
adminAppointmentsModule.get('/:id', getAdminAppointmentController);
adminAppointmentsModule.patch('/:id/status', updateAdminAppointmentStatusController);
