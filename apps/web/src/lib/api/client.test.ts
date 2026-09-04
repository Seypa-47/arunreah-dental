import { describe, expect, it } from 'vitest';
import type { ApiClientError } from './api-error';
import { createApiClient } from './client';

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

describe('API client', () => {
  it('calls the configured base URL and unwraps a health response without credentials', async () => {
    let receivedUrl: RequestInfo | URL | undefined;
    let receivedInit: RequestInit | undefined;
    const fetchImplementation: typeof fetch = async (input, init) => {
      receivedUrl = input;
      receivedInit = init;
      return jsonResponse({ success: true, data: { service: 'arunreah-api', status: 'ok' } });
    };
    const client = createApiClient({
      baseUrl: 'https://api.example.test/',
      fetchImplementation,
    });

    await expect(client.get('/api/health')).resolves.toEqual({
      service: 'arunreah-api',
      status: 'ok',
    });
    expect(receivedUrl).toBe('https://api.example.test/api/health');
    expect(receivedInit?.credentials).toBe('omit');
    expect(receivedInit?.method).toBe('GET');
  });

  it('includes credentials only when an authenticated request explicitly requests them', async () => {
    let receivedInit: RequestInit | undefined;
    const fetchImplementation: typeof fetch = async (_input, init) => {
      receivedInit = init;
      return jsonResponse({ success: true, data: { loggedOut: true } });
    };
    const client = createApiClient({ baseUrl: 'https://api.example.test', fetchImplementation });

    await client.post('/api/auth/logout', { authenticated: true });

    expect(receivedInit?.credentials).toBe('include');
    expect(receivedInit?.method).toBe('POST');
  });

  it('serializes JSON only when JSON data is provided and forwards cancellation signals', async () => {
    let receivedInit: RequestInit | undefined;
    const fetchImplementation: typeof fetch = async (_input, init) => {
      receivedInit = init;
      return jsonResponse({ success: true, data: { updated: true } });
    };
    const controller = new AbortController();
    const client = createApiClient({ baseUrl: 'https://api.example.test', fetchImplementation });

    await client.patch('/api/admin/clinic', {
      authenticated: true,
      json: { clinicNameEn: 'Arunreah Dental Clinic' },
      signal: controller.signal,
    });

    expect(receivedInit?.body).toBe('{"clinicNameEn":"Arunreah Dental Clinic"}');
    expect(new Headers(receivedInit?.headers).get('Content-Type')).toBe('application/json');
    expect(receivedInit?.signal).toBe(controller.signal);
  });

  it('converts backend errors into typed safe errors', async () => {
    const fetchImplementation: typeof fetch = async () =>
      jsonResponse(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to do this.' },
        },
        403,
      );
    const client = createApiClient({ baseUrl: 'https://api.example.test', fetchImplementation });

    await expect(client.delete('/api/admin/services/service-1', { authenticated: true })).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'You do not have permission to do this.',
      status: 403,
    } satisfies Partial<ApiClientError>);
  });

  it('fails safely for malformed responses and network failures', async () => {
    const malformedClient = createApiClient({
      baseUrl: 'https://api.example.test',
      fetchImplementation: async () => jsonResponse({ unexpected: true }),
    });
    const unavailableClient = createApiClient({
      baseUrl: 'https://api.example.test',
      fetchImplementation: async () => Promise.reject(new TypeError('Connection refused')),
    });

    await expect(malformedClient.get('/api/health')).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      status: 200,
    });
    await expect(unavailableClient.get('/api/health')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the clinic service. Please try again.',
      status: 0,
    });
  });
});
