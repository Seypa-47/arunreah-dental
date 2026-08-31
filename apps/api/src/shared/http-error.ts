import type { ApiErrorCode } from '@arunreah/shared';

export class HttpError extends Error {
  public constructor(
    public readonly status: 400 | 401 | 403 | 404 | 409 | 429 | 500,
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
