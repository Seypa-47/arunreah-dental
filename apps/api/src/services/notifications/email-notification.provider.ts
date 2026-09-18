import {
  appointmentEmailHtml,
  appointmentEmailSubject,
  appointmentEmailText,
} from './notification-formatters';
import type {
  AppointmentNotificationPayload,
  NotificationProvider,
  NotificationResult,
} from './types';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const NOTIFICATION_TIMEOUT_MS = 5_000;
const RESEND_FALLBACK_FROM = 'Arunreah Dental Clinic <onboarding@resend.dev>';

type EmailNotificationConfig = {
  enabled: boolean;
  recipient: string | undefined;
  fromAddress: string | undefined;
  apiKey: string | undefined;
};

export class EmailNotificationProvider implements NotificationProvider {
  public readonly name = 'email' as const;

  public constructor(private readonly config: EmailNotificationConfig) {}

  public isEnabled() {
    return this.config.enabled;
  }

  private async postResend(
    from: string,
    recipient: string,
    apiKey: string,
    payload: AppointmentNotificationPayload,
  ) {
    const response = await fetch(RESEND_EMAILS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: appointmentEmailSubject(payload),
        text: appointmentEmailText(payload),
        html: appointmentEmailHtml(payload),
      }),
      signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
    });

    if (response.ok) {
      return { ok: true, status: response.status, statusText: response.statusText, errorBody: undefined };
    }

    const errorBody = await response.text().catch(() => '');
    return { ok: false, status: response.status, statusText: response.statusText, errorBody };
  }

  public async sendAppointmentRequest(
    payload: AppointmentNotificationPayload,
  ): Promise<NotificationResult> {
    const { recipient, fromAddress, apiKey } = this.config;
    if (!recipient || !fromAddress || !apiKey) {
      return { provider: this.name, success: false, errorCode: 'NOT_CONFIGURED' };
    }

    try {
      let result = await this.postResend(fromAddress, recipient, apiKey, payload);

      if (!result.ok) {
        console.error('Resend email delivery failed', {
          status: result.status,
          statusText: result.statusText,
          from: fromAddress,
          recipient,
          error: result.errorBody,
        });

        // When the custom domain is not yet verified in Resend (HTTP 403), try the default sandbox sender.
        const isDomainError = result.status === 403 || result.errorBody?.toLowerCase().includes('domain');
        if (isDomainError && fromAddress !== RESEND_FALLBACK_FROM) {
          console.warn('Attempting Resend email delivery fallback with onboarding@resend.dev');
          result = await this.postResend(RESEND_FALLBACK_FROM, recipient, apiKey, payload);
          if (result.ok) {
            return { provider: this.name, success: true };
          }
          console.error('Resend fallback email delivery failed', {
            status: result.status,
            statusText: result.statusText,
            error: result.errorBody,
          });
        }

        return { provider: this.name, success: false, errorCode: 'PROVIDER_REQUEST_FAILED' };
      }

      return { provider: this.name, success: true };
    } catch (error) {
      const errorCode =
        error instanceof DOMException && error.name === 'TimeoutError'
          ? 'PROVIDER_TIMEOUT'
          : 'PROVIDER_REQUEST_FAILED';

      console.error('Resend email delivery exception', {
        errorCode,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        provider: this.name,
        success: false,
        errorCode,
      };
    }
  }
}

