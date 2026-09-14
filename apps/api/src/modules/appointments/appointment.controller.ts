import {
  adminAppointmentListQuerySchema,
  createPublicAppointmentSchema,
  successResponse,
  updateAppointmentStatusSchema,
} from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { createAppointmentRequestRateLimitKey } from '../../services/appointment-abuse.service';
import { createPublicAppointmentRequest } from '../../services/appointment.service';
import * as adminAppointment from '../../services/admin-appointment.service';
import { HttpError } from '../../shared/http-error';
import { parseRequestBody, parseRequestQuery } from '../../shared/request';
import type { AppEnv } from '../../types/env';

export async function createPublicAppointmentController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, createPublicAppointmentSchema);
  const database = createDbClient(context.env.DB);
  const rateLimitKey = await createAppointmentRequestRateLimitKey(context.req.raw.headers);

  const result = await createPublicAppointmentRequest(
    database,
    input,
    context.env.APP_ENV,
    context.env.TURNSTILE_SECRET_KEY,
    context.env,
    context.req.raw.headers,
    rateLimitKey,
  );
  context.header('Cache-Control', 'no-store');
  return context.json(successResponse(result.appointment), result.created ? 201 : 200);
}

export async function listAdminAppointmentsController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, adminAppointmentListQuerySchema);
  const result = await adminAppointment.getAdminAppointmentList(
    createDbClient(context.env.DB),
    query,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(result));
}

export async function getAdminAppointmentController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Appointment not found.');
  const appointment = await adminAppointment.getAdminAppointmentDetail(
    createDbClient(context.env.DB),
    id,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ appointment }));
}

export async function updateAdminAppointmentStatusController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Appointment not found.');
  const input = await parseRequestBody(context, updateAppointmentStatusSchema);
  const admin = context.get('authenticatedAdmin');
  if (!admin) throw new HttpError(401, 'UNAUTHORIZED', 'Authentication is required.');
  const appointment = await adminAppointment.changeAppointmentStatus(
    createDbClient(context.env.DB),
    id,
    input,
    admin.id,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ appointment }));
}
