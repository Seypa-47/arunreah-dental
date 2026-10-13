import { HttpError } from '../shared/http-error';

type TurnstileResponse = { action?: string; hostname?: string; success?: boolean };
const turnstileTimeoutMs = 5_000;

export async function verifyTurnstile(
  token: string | undefined,
  secret: string | undefined,
  configuredHostnames: string | undefined,
  clientIp: string,
  environment: 'development' | 'staging' | 'production',
  expectedAction = 'appointment_request',
) {
  if (!secret) {
    if (environment === 'development') return;
    throw new HttpError(500, 'INTERNAL_ERROR', 'Verification is unavailable.');
  }

  if (!token) {
    throw new HttpError(400, 'TURNSTILE_FAILED', 'Please complete the verification challenge.');
  }

  const allowedHostnames = new Set(
    (configuredHostnames ?? '')
      .split(',')
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );
  if (allowedHostnames.size === 0) {
    throw new HttpError(500, 'INTERNAL_ERROR', 'Verification is unavailable.');
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: clientIp }),
      signal: AbortSignal.timeout(turnstileTimeoutMs),
    });
    const result = (await response.json().catch(() => undefined)) as TurnstileResponse | undefined;
    if (
      !response.ok ||
      result?.success !== true ||
      result.action !== expectedAction ||
      !result.hostname ||
      !allowedHostnames.has(result.hostname)
    ) {
      throw new HttpError(400, 'TURNSTILE_FAILED', 'Verification failed. Please try again.');
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Turnstile verification request failed');
    throw new HttpError(400, 'TURNSTILE_FAILED', 'Verification failed. Please try again.');
  }
}
