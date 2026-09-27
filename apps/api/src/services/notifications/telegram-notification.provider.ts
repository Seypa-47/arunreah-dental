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

    const rawChatId = chatId.trim();
    // Resolve candidate IDs: Telegram Web K URLs often show -5593770369,
    // while the Telegram Bot API uses -1005593770369 for supergroups/channels,
    // or -5593770369 for basic groups.
    const candidateChatIds = [rawChatId];
    if (rawChatId.startsWith('-100')) {
      candidateChatIds.push(`-${rawChatId.slice(4)}`);
    } else if (rawChatId.startsWith('-')) {
      candidateChatIds.push(`-100${rawChatId.slice(1)}`);
    }

    let lastErrorCode: 'PROVIDER_TIMEOUT' | 'PROVIDER_REQUEST_FAILED' = 'PROVIDER_REQUEST_FAILED';

    for (const targetChatId of candidateChatIds) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChatId,
              text: appointmentTelegramText(payload),
              disable_web_page_preview: true,
            }),
            signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
          },
        );

        if (response.ok) {
          return { provider: this.name, success: true };
        }

        const errorText = await response.text().catch(() => '');
        console.error(`Telegram notification failed HTTP ${response.status} for chat ${targetChatId}: ${errorText}`);

        // If the group chat was upgraded/migrated, Telegram provides migrate_to_chat_id
        try {
          const parsed = JSON.parse(errorText) as { parameters?: { migrate_to_chat_id?: number } };
          const migratedId = parsed?.parameters?.migrate_to_chat_id;
          if (migratedId) {
            const retryRes = await fetch(
              `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: String(migratedId),
                  text: appointmentTelegramText(payload),
                  disable_web_page_preview: true,
                }),
                signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
              },
            );
            if (retryRes.ok) {
              return { provider: this.name, success: true };
            }
          }
        } catch {
          // Ignore JSON parse errors
        }

        const isChatNotFound = response.status === 400 && errorText.toLowerCase().includes('chat not found');
        if (!isChatNotFound) {
          break;
        }
      } catch (error) {
        lastErrorCode =
          error instanceof DOMException && error.name === 'TimeoutError'
            ? 'PROVIDER_TIMEOUT'
            : 'PROVIDER_REQUEST_FAILED';
        console.error(`Telegram notification exception for chat ${targetChatId}:`, error);
        break;
      }
    }

    return { provider: this.name, success: false, errorCode: lastErrorCode };
  }
}
