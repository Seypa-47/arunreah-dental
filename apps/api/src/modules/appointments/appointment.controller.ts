import { createPublicAppointmentSchema, successResponse } from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { createAppointmentRequestRateLimitKey } from '../../services/appointment-abuse.service';
import { createPublicAppointmentRequest } from '../../services/appointment.service';
import { parseRequestBody } from '../../shared/request';
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
