export type NotificationProviderName = 'email' | 'telegram';

export type AppointmentNotificationPayload = {
  reference: string;
  patientName: string;
  phone: string;
  email: string;
  serviceName: string;
  doctorName: string | null;
  branchName: string;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  createdAt: string;
};

export type NotificationResult = {
  provider: NotificationProviderName;
  success: boolean;
  errorCode?: 'NOT_CONFIGURED' | 'PROVIDER_REQUEST_FAILED' | 'PROVIDER_TIMEOUT';
};

export interface NotificationProvider {
  readonly name: NotificationProviderName;
  isEnabled(): boolean;
  sendAppointmentRequest(payload: AppointmentNotificationPayload): Promise<NotificationResult>;
}
