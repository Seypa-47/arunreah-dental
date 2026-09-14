import { appointmentTelegramText } from './notification-formatters';
import type {
  AppointmentNotificationPayload,
  NotificationProvider,
  NotificationResult,
} from './types';

const NOTIFICATION_TIMEOUT_MS = 5_000;

type TelegramNotificationConfig = {
  enabled: boolean;
  botToken: string | undefined;
  chatId: string | undefined;
};

export class TelegramNotificationProvider implements NotificationProvider {
  public readonly name = 'telegram' as const;

  public constructor(private readonly config: TelegramNotificationConfig) {}

  public isEnabled() {
    return this.config.enabled;
  }

  public async sendAppointmentRequest(
    payload: AppointmentNotificationPayload,
  ): Promise<NotificationResult> {
    const { botToken, chatId } = this.config;
    if (!botToken || !chatId) {
      return { provider: this.name, success: false, errorCode: 'NOT_CONFIGURED' };
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: appointmentTelegramText(payload),
            disable_web_page_preview: true,
          }),
          signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
        },
      );

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
