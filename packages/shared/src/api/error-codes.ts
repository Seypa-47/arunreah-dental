export const apiErrorCodes = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INVALID_MEDIA_TYPE',
  'MEDIA_TOO_LARGE',
  'INVALID_MEDIA_CATEGORY',
  'MEDIA_NOT_FOUND',
  'MEDIA_IN_USE',
  'MEDIA_UPLOAD_FAILED',
  'INTERNAL_ERROR',
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];
