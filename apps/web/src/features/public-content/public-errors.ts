import { isApiClientError } from '@/lib/api';

export function isPublicNotFoundError(error: unknown) {
  return isApiClientError(error) && error.status === 404;
}
