import type { Context } from 'hono';
import type { ZodType } from 'zod';
import { HttpError } from './http-error';
import type { AppEnv } from '../types/env';

export async function parseRequestBody<T>(
  context: Context<AppEnv>,
  schema: ZodType<T>,
): Promise<T> {
  const body: unknown = await context.req.json().catch(() => undefined);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Request body is invalid.');
  }

  return result.data;
}
