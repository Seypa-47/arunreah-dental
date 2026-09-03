import { describe, expect, it } from 'vitest';
import type { ApiClient, ApiRequestOptions } from '@/lib/api';
import { getApiHealth } from './health';

describe('getApiHealth', () => {
  it('uses the shared client health endpoint and forwards cancellation', async () => {
    let requestedPath = '';
    let requestedSignal: AbortSignal | undefined;
    const client: Pick<ApiClient, 'get'> = {
      get: async <T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) => {
        requestedPath = path;
        requestedSignal = options?.signal;
        return { service: 'arunreah-api', status: 'ok' } as T;
      },
    };
    const controller = new AbortController();

    await expect(getApiHealth(client, controller.signal)).resolves.toEqual({
      service: 'arunreah-api',
      status: 'ok',
    });
    expect(requestedPath).toBe('/api/health');
    expect(requestedSignal).toBe(controller.signal);
  });
});
