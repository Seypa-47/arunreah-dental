import type { Context } from 'hono';
import type { ZodType, ZodTypeDef } from 'zod';
import { HttpError } from './http-error';
import type { AppEnv } from '../types/env';

export async function parseRequestBody<TOutput, TInput>(
  context: Context<AppEnv>,
  schema: ZodType<TOutput, ZodTypeDef, TInput>,
): Promise<TOutput> {
  const body: unknown = await context.req.json().catch(() => undefined);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Request body is invalid.');
  }

  return result.data;
}

export function parseRequestQuery<TOutput, TInput>(
  context: Context<AppEnv>,
  schema: ZodType<TOutput, ZodTypeDef, TInput>,
): TOutput {
  const result = schema.safeParse(context.req.query());

  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Query parameters are invalid.');
  }

  return result.data;
}
