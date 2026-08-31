import { Hono } from 'hono';
import { createPublicAppointmentController } from './appointment.controller';
import type { AppEnv } from '../../types/env';

export const publicAppointmentsModule = new Hono<AppEnv>();

publicAppointmentsModule.post('/', createPublicAppointmentController);
