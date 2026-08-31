import { appointmentEmailSubject, appointmentEmailText } from './notification-formatters';
import type {
  AppointmentNotificationPayload,
  NotificationProvider,
  NotificationResult,
} from './types';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const NOTIFICATION_TIMEOUT_MS = 5_000;

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

  public async sendAppointmentRequest(
    payload: AppointmentNotificationPayload,
  ): Promise<NotificationResult> {
    const { recipient, fromAddress, apiKey } = this.config;
    if (!recipient || !fromAddress || !apiKey) {
      return { provider: this.name, success: false, errorCode: 'NOT_CONFIGURED' };
    }

    try {
      const response = await fetch(RESEND_EMAILS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [recipient],
          subject: appointmentEmailSubject(payload),
          text: appointmentEmailText(payload),
        }),
        signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
      });

      return response.ok
        ? { provider: this.name, success: true }
        : { provider: this.name, success: false, errorCode: 'PROVIDER_REQUEST_FAILED' };
    } catch (error) {
      return {
        provider: this.name,
        success: false,
        errorCode:
          error instanceof DOMException && error.name === 'TimeoutError'
            ? 'PROVIDER_TIMEOUT'
            : 'PROVIDER_REQUEST_FAILED',
      };
    }
  }
}
