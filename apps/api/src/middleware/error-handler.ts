import { errorResponse } from '@arunreah/shared';
import type { ErrorHandler } from 'hono';
import { HttpError } from '../shared/http-error';
import type { AppEnv } from '../types/env';

export const globalErrorHandler: ErrorHandler<AppEnv> = (error, context) => {
  const requestId = context.get('requestId');

  console.error('Unhandled API error', {
    requestId,
    method: context.req.method,
    path: context.req.path,
    message: error instanceof Error ? error.message : 'Unknown error',
  });

  if (error instanceof HttpError) {
    return context.json(errorResponse(error.code, error.message), error.status);
  }

  return context.json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred.'), 500);
};
