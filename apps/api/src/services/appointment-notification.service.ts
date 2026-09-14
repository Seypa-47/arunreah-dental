import { EmailNotificationProvider } from './notifications/email-notification.provider';
import { NotificationService } from './notifications/notification.service';
import { TelegramNotificationProvider } from './notifications/telegram-notification.provider';
import type { AppointmentNotificationPayload, NotificationResult } from './notifications/types';
import type { Bindings } from '../types/env';

export type AppointmentNotification = AppointmentNotificationPayload;

/**
 * This boundary deliberately keeps provider details out of appointment
 * persistence. The returned delivery results are operational information only;
 * callers must not treat them as a condition of a successful request.
 */
export async function notifyClinicOfAppointment(
  appointment: AppointmentNotification,
  environment: Bindings,
): Promise<NotificationResult[]> {
  const notificationService = new NotificationService([
    new EmailNotificationProvider({
      enabled: environment.EMAIL_NOTIFICATIONS_ENABLED === 'true',
      recipient: environment.EMAIL_NOTIFICATION_RECIPIENT,
      fromAddress: environment.EMAIL_FROM_ADDRESS,
      apiKey: environment.RESEND_API_KEY,
    }),
    new TelegramNotificationProvider({
      enabled: environment.TELEGRAM_NOTIFICATIONS_ENABLED === 'true',
      botToken: environment.TELEGRAM_BOT_TOKEN,
      chatId: environment.TELEGRAM_CHAT_ID,
    }),
  ]);

  return notificationService.notifyAppointmentRequest(appointment);
}
