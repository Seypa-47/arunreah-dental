import { env } from '@/config/env';
import { createApiClient } from './client';
import type { ApiClient } from './types';

let configuredApiClient: ApiClient | undefined;

export function getApiClient(): ApiClient {
  configuredApiClient ??= createApiClient({ baseUrl: env.apiBaseUrl });
  return configuredApiClient;
}

export { ApiClientError, isApiClientError } from './api-error';
export { buildApiUrl, createApiClient } from './client';
export type { ApiClient, ApiClientConfig, ApiHttpMethod, ApiRequestOptions } from './types';
