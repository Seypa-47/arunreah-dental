import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getCloudflareUsageWarning,
  getResendUsageWarnings,
  monitorProviderUsage,
} from '../src/services/provider-usage-monitor.service';
import type { Bindings } from '../src/types/env';

const usage = (dailyUsed: number, monthlyUsed: number) => ({
  emails: {
    daily: { used: dailyUsed, limit: 100, resets_at: '2026-10-13T00:00:00.000Z' },
    monthly: { used: monthlyUsed, limit: 3000, resets_at: '2026-11-01T00:00:00.000Z' },
  },
});

afterEach(() => vi.unstubAllGlobals());

describe('provider usage monitor', () => {
  it('selects the highest crossed warning level for each quota period', () => {
    expect(getResendUsageWarnings(usage(96, 2400))).toEqual([
      expect.objectContaining({ period: 'daily', threshold: 95, used: 96, limit: 100 }),
      expect.objectContaining({ period: 'monthly', threshold: 80, used: 2400, limit: 3000 }),
    ]);
    expect(getResendUsageWarnings(usage(79, 2399))).toEqual([]);
  });

  it('calculates the Cloudflare account-wide daily Workers warning', () => {
    const response = {
      data: {
        viewer: {
          accounts: [
            { workersInvocationsAdaptive: [{ sum: { requests: 81_000 } }] },
          ],
        },
      },
      errors: null,
    };
    expect(
      getCloudflareUsageWarning(response, 100_000, '2026-10-13T00:00:00.000Z'),
    ).toMatchObject({
      provider: 'cloudflare',
      period: 'daily',
      threshold: 80,
      used: 81_000,
      limit: 100_000,
    });
  });

  it('sends one warning email and reserves each threshold only once', async () => {
    const reserved = new Set<string>();
    const prepare = vi.fn((sql: string) => ({
      bind: (key: string) => ({
        run: async () => {
          if (sql.startsWith('INSERT')) {
            const changes = reserved.has(key) ? 0 : 1;
            reserved.add(key);
            return { meta: { changes } };
          }
          reserved.delete(key);
          return { meta: { changes: 1 } };
        },
      }),
    }));
    const environment = {
      APP_ENV: 'production',
      CORS_ALLOWED_ORIGINS: 'https://arunreahdental.com',
      DB: { prepare } as unknown as D1Database,
      ASSETS: {} as R2Bucket,
      EMAIL_FROM_ADDRESS: 'Arunreah Dental Clinic <appointments@send.arunreahdental.com>',
      RESEND_API_KEY: 'resend-secret',
      USAGE_MONITOR_ENABLED: 'true',
      USAGE_ALERT_RECIPIENT: 'owner@example.com',
    } satisfies Bindings;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(usage(80, 2400)))
      .mockResolvedValueOnce(Response.json({ id: 'email-id' }));
    vi.stubGlobal('fetch', fetchMock);

    await monitorProviderUsage(environment);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const emailRequest = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(JSON.parse(String(emailRequest.body))).toMatchObject({
      to: ['owner@example.com'],
      subject: 'Arunreah Dental — provider usage warning',
    });

    fetchMock.mockResolvedValueOnce(Response.json(usage(80, 2400)));
    await monitorProviderUsage(environment);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('combines Cloudflare and Resend threshold warnings into one email', async () => {
    const prepare = vi.fn(() => ({
      bind: () => ({ run: async () => ({ meta: { changes: 1 } }) }),
    }));
    const environment = {
      APP_ENV: 'production',
      CORS_ALLOWED_ORIGINS: 'https://arunreahdental.com',
      DB: { prepare } as unknown as D1Database,
      ASSETS: {} as R2Bucket,
      EMAIL_FROM_ADDRESS: 'Arunreah Dental Clinic <appointments@send.arunreahdental.com>',
      RESEND_API_KEY: 'resend-secret',
      CLOUDFLARE_ANALYTICS_API_TOKEN: 'cloudflare-read-only-secret',
      CLOUDFLARE_ACCOUNT_ID: 'account-id',
      CLOUDFLARE_WORKERS_DAILY_LIMIT: '100000',
      USAGE_MONITOR_ENABLED: 'true',
      USAGE_ALERT_RECIPIENT: 'owner@example.com',
    } satisfies Bindings;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(usage(80, 100)))
      .mockResolvedValueOnce(
        Response.json({
          data: {
            viewer: {
              accounts: [
                { workersInvocationsAdaptive: [{ sum: { requests: 95_500 } }] },
              ],
            },
          },
          errors: null,
        }),
      )
      .mockResolvedValueOnce(Response.json({ id: 'email-id' }));
    vi.stubGlobal('fetch', fetchMock);

    await monitorProviderUsage(environment);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const emailRequest = fetchMock.mock.calls[2]?.[1] as RequestInit;
    const body = JSON.parse(String(emailRequest.body)) as { text: string };
    expect(body.text).toContain('Resend daily usage: 80 of 100');
    expect(body.text).toContain('Cloudflare Workers daily usage: 95500 of 100000');
  });

  it('does no provider work when monitoring is disabled', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await monitorProviderUsage({
      APP_ENV: 'development',
      CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
      DB: {} as D1Database,
      ASSETS: {} as R2Bucket,
      USAGE_MONITOR_ENABLED: 'false',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
