import type { Bindings } from '../types/env';

const resendEmailsUrl = 'https://api.resend.com/emails';
const requestTimeoutMs = 5_000;

function passwordResetUrl(baseUrl: string, token: string) {
  const url = new URL('/admin/reset-password', baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}

export async function sendAdminPasswordResetEmail(
  recipient: string,
  token: string,
  environment: Bindings,
): Promise<boolean> {
  const apiKey = environment.RESEND_API_KEY;
  const from = environment.EMAIL_FROM_ADDRESS;
  const baseUrl = environment.ADMIN_APP_BASE_URL;
  if (!apiKey || !from || !baseUrl) {
    console.error('Password reset email delivery failed', {
      provider: 'resend',
      code: 'NOT_CONFIGURED',
    });
    return false;
  }

  let resetUrl: string;
  try {
    resetUrl = passwordResetUrl(baseUrl, token);
  } catch {
    console.error('Password reset email delivery failed', {
      provider: 'resend',
      code: 'INVALID_APP_URL',
    });
    return false;
  }

  const subject = 'Reset your Arunreah Dental CMS password';
  const text = [
    'A password reset was requested for your Arunreah Dental Clinic CMS account.',
    '',
    `Reset your password: ${resetUrl}`,
    '',
    'This link expires in 30 minutes and can only be used once.',
    'If you did not request this reset, you can ignore this email.',
  ].join('\n');
  const html = `<!doctype html><html lang="en"><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e2e8f0;border-radius:16px"><tr><td style="padding:32px"><h1 style="margin:0 0 16px;color:#005687;font-size:24px">Reset your CMS password</h1><p style="line-height:1.6">A password reset was requested for your Arunreah Dental Clinic CMS account.</p><p style="margin:28px 0"><a href="${resetUrl}" style="display:inline-block;background:#2187a8;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:10px">Reset password</a></p><p style="line-height:1.6;color:#475569">This link expires in 30 minutes and can only be used once. If you did not request this reset, you can ignore this email.</p></td></tr></table></td></tr></table></body></html>`;

  try {
    const response = await fetch(resendEmailsUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [recipient], subject, text, html }),
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
    if (response.ok) return true;
    console.error('Password reset email delivery failed', {
      provider: 'resend',
      code: 'PROVIDER_REQUEST_FAILED',
      status: response.status,
    });
  } catch {
    console.error('Password reset email delivery failed', {
      provider: 'resend',
      code: 'PROVIDER_REQUEST_FAILED',
    });
  }
  return false;
}
