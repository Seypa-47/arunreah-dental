import { errorResponse } from '@arunreah/shared';
import type { ErrorHandler } from 'hono';
import { HttpError } from '../shared/http-error';
import type { AppEnv } from '../types/env';

export const globalErrorHandler: ErrorHandler<AppEnv> = (error, context) => {
  const requestId = context.get('requestId');

  if (error instanceof HttpError) {
    console.warn('API request rejected', {
      requestId,
      method: context.req.method,
      path: context.req.path,
      status: error.status,
      code: error.code,
    });
    return context.json(errorResponse(error.code, error.message), error.status);
  }

  console.error('Unhandled API error', {
    requestId,
    method: context.req.method,
    path: context.req.path,
    errorType: error instanceof Error ? error.name : 'UnknownError',
  });

  return context.json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred.'), 500);
};
