import type { z } from 'zod';

export type ApiHttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST';

export type ApiRequestOptions<T = unknown> = {
  authenticated?: boolean;
  body?: BodyInit | null;
  headers?: HeadersInit;
  json?: unknown;
  method?: ApiHttpMethod;
  signal?: AbortSignal;
  responseSchema?: z.ZodType<T, z.ZodTypeDef, unknown>;
};

export type ApiClient = {
  delete<T>(path: string, options?: Omit<ApiRequestOptions<T>, 'method'>): Promise<T>;
  get<T>(path: string, options?: Omit<ApiRequestOptions<T>, 'method'>): Promise<T>;
  patch<T>(path: string, options?: Omit<ApiRequestOptions<T>, 'method'>): Promise<T>;
  post<T>(path: string, options?: Omit<ApiRequestOptions<T>, 'method'>): Promise<T>;
  request<T>(path: string, options?: ApiRequestOptions<T>): Promise<T>;
};

export type ApiClientConfig = {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
};
