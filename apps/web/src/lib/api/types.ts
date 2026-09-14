export type ApiHttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST';

export type ApiRequestOptions = {
  authenticated?: boolean;
  body?: BodyInit | null;
  headers?: HeadersInit;
  json?: unknown;
  method?: ApiHttpMethod;
  signal?: AbortSignal;
};

export type ApiClient = {
  delete<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<T>;
  get<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<T>;
  patch<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<T>;
  post<T>(path: string, options?: Omit<ApiRequestOptions, 'method'>): Promise<T>;
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

export type ApiClientConfig = {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
};
