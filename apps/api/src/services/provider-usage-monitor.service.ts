import { z } from 'zod';
import { createDbClient } from '../db/client';
import {
  releaseProviderUsageAlert,
  reserveProviderUsageAlert,
} from '../repositories/provider-usage-alert.repository';
import type { Bindings } from '../types/env';

const resendUsageUrl = 'https://api.resend.com/usage';
const resendEmailsUrl = 'https://api.resend.com/emails';
const cloudflareGraphqlUrl = 'https://api.cloudflare.com/client/v4/graphql';
const requestTimeoutMs = 5_000;
const warningThresholds = [80, 95] as const;

const quotaSchema = z.object({
  used: z.number().int().nonnegative(),
  limit: z.number().int().positive().nullable(),
  resets_at: z.string().datetime({ offset: true }),
});

const resendUsageSchema = z.object({
  emails: z.object({
    daily: quotaSchema,
    monthly: quotaSchema,
  }),
});

const cloudflareUsageSchema = z.object({
  data: z.object({
    viewer: z.object({
      accounts: z
        .array(
          z.object({
            workersInvocationsAdaptive: z.array(
              z.object({ sum: z.object({ requests: z.number().int().nonnegative() }) }),
            ),
          }),
        )
        .min(1),
    }),
  }),
  errors: z.array(z.unknown()).nullable().optional(),
});

type QuotaPeriod = 'daily' | 'monthly';
type UsageWarning = {
  alertKey: string;
  provider: 'cloudflare' | 'resend';
  period: QuotaPeriod;
  threshold: (typeof warningThresholds)[number];
  used: number;
  limit: number;
  resetsAt: string;
};

function warningForQuota(
  period: QuotaPeriod,
  quota: z.infer<typeof quotaSchema>,
): UsageWarning | null {
  if (quota.limit === null) return null;
  const percentage = (quota.used / quota.limit) * 100;
  const threshold = [...warningThresholds].reverse().find((value) => percentage >= value);
  if (!threshold) return null;
  return {
    alertKey: `resend:${period}:${quota.resets_at}:${threshold}`,
    provider: 'resend',
    period,
    threshold,
    used: quota.used,
    limit: quota.limit,
    resetsAt: quota.resets_at,
  };
}

export function getCloudflareUsageWarning(
  input: unknown,
  dailyLimit: number,
  resetsAt: string,
): UsageWarning | null {
  const parsed = cloudflareUsageSchema.parse(input);
  if (parsed.errors && parsed.errors.length > 0) throw new Error('Cloudflare analytics returned errors');
  const used = parsed.data.viewer.accounts.reduce(
    (accountTotal, account) =>
      accountTotal +
      account.workersInvocationsAdaptive.reduce(
        (requestTotal, invocation) => requestTotal + invocation.sum.requests,
        0,
      ),
    0,
  );
  const percentage = (used / dailyLimit) * 100;
  const threshold = [...warningThresholds].reverse().find((value) => percentage >= value);
  if (!threshold) return null;
  return {
    alertKey: `cloudflare:workers-daily:${resetsAt}:${threshold}`,
    provider: 'cloudflare',
    period: 'daily',
    threshold,
    used,
    limit: dailyLimit,
    resetsAt,
  };
}

export function getResendUsageWarnings(input: unknown): UsageWarning[] {
  const usage = resendUsageSchema.parse(input);
  return (['daily', 'monthly'] as const)
    .map((period) => warningForQuota(period, usage.emails[period]))
    .filter((warning): warning is UsageWarning => warning !== null);
}

async function fetchResendUsage(apiKey: string): Promise<unknown> {
  const response = await fetch(resendUsageUrl, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (!response.ok) throw new Error(`Resend usage request failed with status ${response.status}`);
  return response.json();
}

async function fetchCloudflareUsage(
  apiToken: string,
  accountId: string,
  now: Date,
): Promise<unknown> {
  const datetimeStart = new Date(now);
  datetimeStart.setUTCHours(0, 0, 0, 0);
  const response = await fetch(cloudflareGraphqlUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `query WorkerUsage($accountTag: string!, $datetimeStart: string!, $datetimeEnd: string!) {
        viewer {
          accounts(filter: { accountTag: $accountTag }) {
            workersInvocationsAdaptive(
              limit: 1
              filter: { datetime_geq: $datetimeStart, datetime_leq: $datetimeEnd }
            ) { sum { requests } }
          }
        }
      }`,
      variables: {
        accountTag: accountId,
        datetimeStart: datetimeStart.toISOString(),
        datetimeEnd: now.toISOString(),
      },
    }),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (!response.ok) {
    throw new Error(`Cloudflare analytics request failed with status ${response.status}`);
  }
  return response.json();
}

async function sendUsageWarning(
  warnings: UsageWarning[],
  environment: Bindings,
): Promise<boolean> {
  const apiKey = environment.RESEND_API_KEY;
  const from = environment.EMAIL_FROM_ADDRESS;
  const recipient = environment.USAGE_ALERT_RECIPIENT;
  if (!apiKey || !from || !recipient) return false;

  const lines = warnings.map(
    (warning) =>
      `${warning.provider === 'cloudflare' ? 'Cloudflare Workers' : 'Resend'} ${warning.period} usage: ${warning.used} of ${warning.limit} (${warning.threshold}% warning). Resets at ${warning.resetsAt}.`,
  );
  const text = [
    'Arunreah Dental Clinic provider usage warning',
    '',
    ...lines,
    '',
    'Review usage in the Resend dashboard to avoid interrupted appointment emails.',
  ].join('\n');
  const htmlLines = lines.map((line) => `<li>${line}</li>`).join('');
  const html = `<h1>Provider usage warning</h1><ul>${htmlLines}</ul><p>Review usage in the Resend dashboard to avoid interrupted appointment emails.</p>`;
  const response = await fetch(resendEmailsUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: 'Arunreah Dental — provider usage warning',
      text,
      html,
    }),
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  return response.ok;
}

export async function monitorProviderUsage(environment: Bindings): Promise<void> {
  if (environment.USAGE_MONITOR_ENABLED !== 'true') return;
  const apiKey = environment.RESEND_API_KEY;
  if (!apiKey) {
    console.error({ event: 'provider_usage_monitor_failed', provider: 'resend', code: 'NOT_CONFIGURED' });
    return;
  }

  const warnings: UsageWarning[] = [];
  try {
    warnings.push(...getResendUsageWarnings(await fetchResendUsage(apiKey)));
  } catch {
    console.error({
      event: 'provider_usage_monitor_failed',
      provider: 'resend',
      code: 'USAGE_REQUEST_FAILED',
    });
  }

  const cloudflareToken = environment.CLOUDFLARE_ANALYTICS_API_TOKEN;
  const cloudflareAccountId = environment.CLOUDFLARE_ACCOUNT_ID;
  const cloudflareDailyLimit = Number(environment.CLOUDFLARE_WORKERS_DAILY_LIMIT);
  if (cloudflareToken && cloudflareAccountId && Number.isSafeInteger(cloudflareDailyLimit) && cloudflareDailyLimit > 0) {
    try {
      const now = new Date();
      const resetsAt = new Date(now);
      resetsAt.setUTCDate(resetsAt.getUTCDate() + 1);
      resetsAt.setUTCHours(0, 0, 0, 0);
      const warning = getCloudflareUsageWarning(
        await fetchCloudflareUsage(cloudflareToken, cloudflareAccountId, now),
        cloudflareDailyLimit,
        resetsAt.toISOString(),
      );
      if (warning) warnings.push(warning);
    } catch {
      console.error({
        event: 'provider_usage_monitor_failed',
        provider: 'cloudflare',
        code: 'USAGE_REQUEST_FAILED',
      });
    }
  } else {
    console.error({
      event: 'provider_usage_monitor_failed',
      provider: 'cloudflare',
      code: 'NOT_CONFIGURED',
    });
  }

  if (warnings.length === 0) return;

  try {
    const database = createDbClient(environment.DB);
    const reserved: UsageWarning[] = [];
    for (const warning of warnings) {
      if (await reserveProviderUsageAlert(database, warning.alertKey)) reserved.push(warning);
    }
    if (reserved.length === 0) return;

    if (await sendUsageWarning(reserved, environment)) {
      console.log({
        event: 'provider_usage_alert_sent',
        provider: 'usage',
        warnings: reserved.map(({ provider, period, threshold }) => ({
          provider,
          period,
          threshold,
        })),
      });
      return;
    }

    await Promise.all(
      reserved.map((warning) => releaseProviderUsageAlert(database, warning.alertKey)),
    );
    console.error({
      event: 'provider_usage_monitor_failed',
      provider: 'resend',
      code: 'ALERT_DELIVERY_FAILED',
    });
  } catch {
    console.error({
      event: 'provider_usage_monitor_failed',
      provider: 'alerting',
      code: 'ALERT_PROCESSING_FAILED',
    });
  }
}
