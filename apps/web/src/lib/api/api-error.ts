import type { ApiErrorCode } from '@arunreah/shared';

export type ApiClientErrorCode = ApiErrorCode | 'INVALID_RESPONSE' | 'NETWORK_ERROR';

export class ApiClientError extends Error {
  readonly code: ApiClientErrorCode;
  readonly status: number;

  constructor({ code, message, status }: { code: ApiClientErrorCode; message: string; status: number }) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}
