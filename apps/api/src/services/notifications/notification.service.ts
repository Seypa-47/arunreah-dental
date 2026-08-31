import type {
  AppointmentNotificationPayload,
  NotificationProvider,
  NotificationResult,
} from './types';

export class NotificationService {
  public constructor(private readonly providers: NotificationProvider[]) {}

  public async notifyAppointmentRequest(
    payload: AppointmentNotificationPayload,
  ): Promise<NotificationResult[]> {
    const results = await Promise.all(
      this.providers
        .filter((provider) => provider.isEnabled())
        .map(async (provider) => {
          try {
            return await provider.sendAppointmentRequest(payload);
          } catch {
            return {
              provider: provider.name,
              success: false,
              errorCode: 'PROVIDER_REQUEST_FAILED' as const,
            };
          }
        }),
    );

    for (const result of results) {
      if (!result.success) {
        console.error('Appointment notification delivery failed', {
          appointmentReference: payload.reference,
          provider: result.provider,
          errorCode: result.errorCode,
        });
      }
    }

    return results;
  }
}
