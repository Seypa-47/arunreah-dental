import {
  appointmentStatusTelegramHtml,
  appointmentStatusTelegramText,
  appointmentTelegramHtml,
  appointmentTelegramText,
} from './notification-formatters';
import type {
  AppointmentNotificationPayload,
  AppointmentStatusUpdatePayload,
  NotificationProvider,
  NotificationResult,
} from './types';

const NOTIFICATION_TIMEOUT_MS = 5_000;

export type TelegramNotificationConfig = {
  enabled: boolean;
  botToken: string | undefined;
  chatId: string | undefined;
};

/**
 * Normalizes a raw chat ID string into an array of clean Telegram chat IDs.
 * Handles:
 * - Single chat ID: "-1005593770369" or "909395067"
 * - Comma-separated or whitespace-separated list of chat IDs
 * - Full Telegram Web URLs: "https://web.telegram.org/a/#-5593770369" -> "-1005593770369"
 * - Telegram Web A supergroup IDs missing "-100" prefix: "-5593770369" -> "-1005593770369"
 */
export function normalizeTelegramChatIds(rawChatId: string): string[] {
  return rawChatId
    .split(/[,;\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      // Strip web.telegram.org URL wrapper if present
      const stripped = item.replace(/^https?:\/\/web\.telegram\.org\/[ak]\/#/, '');
      // If negative ID with 10+ digits not starting with -100, normalize to supergroup -100 prefix
      if (stripped.startsWith('-') && !stripped.startsWith('-100') && stripped.length >= 11) {
        return `-100${stripped.slice(1)}`;
      }
      return stripped;
    });
}

export class TelegramNotificationProvider implements NotificationProvider {
  public readonly name = 'telegram' as const;

  public constructor(private readonly config: TelegramNotificationConfig) {}

  public isEnabled() {
    return this.config.enabled;
  }

  private async sendSingleChat(
    botToken: string,
    chatId: string,
    htmlText: string,
    plainText: string,
  ): Promise<{ success: boolean; errorCode?: NotificationResult['errorCode'] }> {
    try {
      // 1. Try sending formatted HTML first
      let response = await fetch(
        `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: htmlText,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
          signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
        },
      );

      if (response.ok) {
        return { success: true };
      }

      // 2. If HTML parse failed, fall back to plain text
      response = await fetch(
        `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: plainText,
            disable_web_page_preview: true,
          }),
          signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
        },
      );

      if (response.ok) {
        return { success: true };
      }

      // 3. Fallback for supergroup / basic group ID mismatch if applicable
      const alternativeId = chatId.startsWith('-100')
        ? `-${chatId.slice(4)}`
        : chatId.startsWith('-')
          ? `-100${chatId.slice(1)}`
          : undefined;

      if (alternativeId) {
        const altResponse = await fetch(
          `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: alternativeId,
              text: plainText,
              disable_web_page_preview: true,
            }),
            signal: AbortSignal.timeout(NOTIFICATION_TIMEOUT_MS),
          },
        );

        if (altResponse.ok) {
          return { success: true };
        }
      }

      return { success: false, errorCode: 'PROVIDER_REQUEST_FAILED' };
    } catch (error) {
      return {
        success: false,
        errorCode:
          error instanceof DOMException && error.name === 'TimeoutError'
            ? 'PROVIDER_TIMEOUT'
            : 'PROVIDER_REQUEST_FAILED',
      };
    }
  }

  private async deliverToTargets(
    botToken: string,
    rawChatId: string,
    htmlText: string,
    plainText: string,
  ): Promise<NotificationResult> {
    const chatIds = normalizeTelegramChatIds(rawChatId);
    if (chatIds.length === 0) {
      return { provider: this.name, success: false, errorCode: 'NOT_CONFIGURED' };
    }

    const results = await Promise.all(
      chatIds.map((targetId) => this.sendSingleChat(botToken, targetId, htmlText, plainText)),
    );

    const anySuccess = results.some((r) => r.success);
    if (anySuccess) {
      return { provider: this.name, success: true };
    }

    const firstError = results.find((r) => !r.success);
    return {
      provider: this.name,
      success: false,
      errorCode: firstError?.errorCode ?? 'PROVIDER_REQUEST_FAILED',
    };
  }

  public async sendAppointmentRequest(
    payload: AppointmentNotificationPayload,
  ): Promise<NotificationResult> {
    const { botToken, chatId } = this.config;
    if (!botToken || !chatId) {
      return { provider: this.name, success: false, errorCode: 'NOT_CONFIGURED' };
    }

    return this.deliverToTargets(
      botToken,
      chatId,
      appointmentTelegramHtml(payload),
      appointmentTelegramText(payload),
    );
  }

  public async sendAppointmentStatusUpdate(
    payload: AppointmentStatusUpdatePayload,
  ): Promise<NotificationResult> {
    const { botToken, chatId } = this.config;
    if (!botToken || !chatId) {
      return { provider: this.name, success: false, errorCode: 'NOT_CONFIGURED' };
    }

    return this.deliverToTargets(
      botToken,
      chatId,
      appointmentStatusTelegramHtml(payload),
      appointmentStatusTelegramText(payload),
    );
  }
}
