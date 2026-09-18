import {
  appointmentEmailHtml,
  appointmentEmailSubject,
  appointmentEmailText,
  patientAppointmentEmailHtml,
  patientAppointmentEmailSubject,
  patientAppointmentEmailText,
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

type DeliveryResult = {
  success: boolean;
  errorCode?: 'PROVIDER_TIMEOUT' | 'PROVIDER_REQUEST_FAILED';
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
    subject: string,
    text: string,
    html: string,
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
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
    });

    if (response.ok) {
      return { ok: true, status: response.status, statusText: response.statusText, errorBody: undefined };
    }

    const errorBody = await response.text().catch(() => '');
    return { ok: false, status: response.status, statusText: response.statusText, errorBody };
  }

  private async deliverEmailWithFallback(
    fromAddress: string,
    recipient: string,
    apiKey: string,
    subject: string,
    text: string,
    html: string,
    targetType: 'clinic' | 'patient',
  ): Promise<DeliveryResult> {
    try {
      let result = await this.postResend(fromAddress, recipient, apiKey, subject, text, html);

      if (!result.ok) {
        console.error(`Resend ${targetType} email delivery failed`, {
          status: result.status,
          statusText: result.statusText,
          from: fromAddress,
          recipient: targetType === 'clinic' ? recipient : '[redacted]',
          error: result.errorBody,
        });

        // When the custom domain is not yet verified in Resend (HTTP 403), try the default sandbox sender.
        const isDomainError = result.status === 403 || result.errorBody?.toLowerCase().includes('domain');
        if (isDomainError && fromAddress !== RESEND_FALLBACK_FROM) {
          console.warn(`Attempting Resend ${targetType} email delivery fallback with onboarding@resend.dev`);
          result = await this.postResend(RESEND_FALLBACK_FROM, recipient, apiKey, subject, text, html);
          if (result.ok) {
            return { success: true };
          }
          console.error(`Resend fallback ${targetType} email delivery failed`, {
            status: result.status,
            statusText: result.statusText,
            error: result.errorBody,
          });
        }

        return { success: false, errorCode: 'PROVIDER_REQUEST_FAILED' };
      }

      return { success: true };
    } catch (error) {
      const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
      const errorCode = isTimeout ? 'PROVIDER_TIMEOUT' : 'PROVIDER_REQUEST_FAILED';

      console.error(`Resend ${targetType} email delivery exception`, {
        errorCode,
        error: error instanceof Error ? error.message : String(error),
      });

      return { success: false, errorCode };
    }
  }

  public async sendAppointmentRequest(
    payload: AppointmentNotificationPayload,
  ): Promise<NotificationResult> {
    const { recipient, fromAddress, apiKey } = this.config;
    if (!recipient || !fromAddress || !apiKey) {
      return { provider: this.name, success: false, errorCode: 'NOT_CONFIGURED' };
    }

    const patientEmail = payload.email?.trim();
    const tasks: [Promise<DeliveryResult>, Promise<DeliveryResult>?] = [
      this.deliverEmailWithFallback(
        fromAddress,
        recipient,
        apiKey,
        appointmentEmailSubject(payload),
        appointmentEmailText(payload),
        appointmentEmailHtml(payload),
        'clinic',
      ),
    ];

    if (patientEmail) {
      tasks.push(
        this.deliverEmailWithFallback(
          fromAddress,
          patientEmail,
          apiKey,
          patientAppointmentEmailSubject(payload),
          patientAppointmentEmailText(payload),
          patientAppointmentEmailHtml(payload),
          'patient',
        ),
      );
    }

    const [clinicResult] = await Promise.all(tasks);

    if (!clinicResult.success) {
      return {
        provider: this.name,
        success: false,
        errorCode: clinicResult.errorCode ?? 'PROVIDER_REQUEST_FAILED',
      };
    }

    return { provider: this.name, success: true };
  }
}

