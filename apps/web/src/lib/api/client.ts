import { apiErrorCodes, type ApiErrorCode } from '@arunreah/shared';
import { ApiClientError } from './api-error';
import type { ApiClient, ApiClientConfig, ApiRequestOptions } from './types';

type UnknownRecord = Record<string, unknown>;

const genericErrorMessage = 'Unable to complete the request. Please try again.';
const networkErrorMessage = 'Unable to reach the clinic service. Please try again.';

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && (apiErrorCodes as readonly string[]).includes(value);
}

function getSafeErrorMessage(value: unknown): string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 500
    ? value
    : genericErrorMessage;
}

function normalizeBaseUrl(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  if (!normalized) throw new Error('The API base URL must not be empty.');

  return normalized;
}

export function buildApiUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeBaseUrl(baseUrl)}${normalizedPath}`;
}

async function readResponsePayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiClientError({
      code: 'INVALID_RESPONSE',
      message: genericErrorMessage,
      status: response.status,
    });
  }
}

function throwApiError(payload: unknown, status: number): never {
  if (isRecord(payload) && payload.success === false && isRecord(payload.error)) {
    const code = isApiErrorCode(payload.error.code) ? payload.error.code : 'INTERNAL_ERROR';
    throw new ApiClientError({
      code,
      message: getSafeErrorMessage(payload.error.message),
      status,
    });
  }

  throw new ApiClientError({
    code: 'INVALID_RESPONSE',
    message: genericErrorMessage,
    status,
  });
}

function unwrapSuccess<T>(payload: unknown, status: number): T {
  if (isRecord(payload) && payload.success === true && 'data' in payload) {
    return payload.data as T;
  }

  return throwApiError(payload, status);
}

function createRequestInit(options: ApiRequestOptions): RequestInit {
  if (options.body !== undefined && options.json !== undefined) {
    throw new Error('Provide either body or json, not both.');
  }

  const headers = new Headers(options.headers);
  const hasJson = options.json !== undefined;
  if (hasJson && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  return {
    body: hasJson ? JSON.stringify(options.json) : options.body,
    credentials: options.authenticated ? 'include' : 'omit',
    headers,
    method: options.method ?? 'GET',
    signal: options.signal,
  };
}

export function createApiClient({ baseUrl, fetchImplementation = fetch }: ApiClientConfig): ApiClient {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    let response: Response;

    try {
      response = await fetchImplementation(buildApiUrl(normalizedBaseUrl, path), createRequestInit(options));
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError({
        code: 'NETWORK_ERROR',
        message: networkErrorMessage,
        status: 0,
      });
    }

    const payload = await readResponsePayload(response);
    if (!response.ok) return throwApiError(payload, response.status);

    return unwrapSuccess<T>(payload, response.status);
  }

  return {
    request,
    get: <T>(path: string, options: Omit<ApiRequestOptions, 'method'> = {}) =>
      request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, options: Omit<ApiRequestOptions, 'method'> = {}) =>
      request<T>(path, { ...options, method: 'POST' }),
    patch: <T>(path: string, options: Omit<ApiRequestOptions, 'method'> = {}) =>
      request<T>(path, { ...options, method: 'PATCH' }),
    delete: <T>(path: string, options: Omit<ApiRequestOptions, 'method'> = {}) =>
      request<T>(path, { ...options, method: 'DELETE' }),
  };
}
