import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmailNotificationProvider } from '../src/services/notifications/email-notification.provider';
import {
  appointmentEmailSubject,
  appointmentEmailText,
  appointmentTelegramText,
} from '../src/services/notifications/notification-formatters';
import { NotificationService } from '../src/services/notifications/notification.service';
import { TelegramNotificationProvider } from '../src/services/notifications/telegram-notification.provider';
import type {
  AppointmentNotificationPayload,
  NotificationProvider,
} from '../src/services/notifications/types';

const payload: AppointmentNotificationPayload = {
  reference: 'AR-20990101-ABC123',
  patientName: 'Sok Dara <script>',
  phone: '+855 12 345 678',
  email: 'patient@example.com',
  serviceName: 'Dental Implants',
  doctorName: null,
  branchName: 'Main Branch',
  preferredDate: '2099-01-01',
  preferredTime: '10:30',
  notes: 'Please call before visiting.',
  createdAt: '2098-12-01T00:00:00.000Z',
};

function fakeProvider(
  name: 'email' | 'telegram',
  enabled: boolean,
  outcome: 'success' | 'failure',
): NotificationProvider {
  return {
    name,
    isEnabled: () => enabled,
    sendAppointmentRequest: async () =>
      outcome === 'success'
        ? { provider: name, success: true }
        : { provider: name, success: false, errorCode: 'PROVIDER_REQUEST_FAILED' },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('NotificationService', () => {
  it('invokes only enabled providers and isolates provider failures', async () => {
    const service = new NotificationService([
      fakeProvider('email', true, 'success'),
      fakeProvider('telegram', true, 'failure'),
    ]);
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const results = await service.notifyAppointmentRequest(payload);

    expect(results).toEqual([
      { provider: 'email', success: true },
      { provider: 'telegram', success: false, errorCode: 'PROVIDER_REQUEST_FAILED' },
    ]);
    expect(log).toHaveBeenCalledWith('Appointment notification delivery failed', {
      appointmentReference: payload.reference,
      provider: 'telegram',
      errorCode: 'PROVIDER_REQUEST_FAILED',
    });
  });

  it('does not invoke disabled providers', async () => {
    const service = new NotificationService([
      fakeProvider('email', false, 'success'),
      fakeProvider('telegram', false, 'success'),
    ]);

    await expect(service.notifyAppointmentRequest(payload)).resolves.toEqual([]);
  });

  it('supports either channel independently', async () => {
    const emailOnly = new NotificationService([fakeProvider('email', true, 'success')]);
    const telegramOnly = new NotificationService([fakeProvider('telegram', true, 'success')]);

    await expect(emailOnly.notifyAppointmentRequest(payload)).resolves.toEqual([
      { provider: 'email', success: true },
    ]);
    await expect(telegramOnly.notifyAppointmentRequest(payload)).resolves.toEqual([
      { provider: 'telegram', success: true },
    ]);
  });
});

describe('notification formatters', () => {
  it('creates operational PENDING content and handles No Preference', () => {
    expect(appointmentEmailSubject(payload)).toBe('New Appointment Request — AR-20990101-ABC123');
    expect(appointmentEmailText(payload)).toContain('Status: PENDING');
    expect(appointmentEmailText(payload)).toContain('Doctor: No preference');
    expect(appointmentEmailText(payload)).toContain(
      'Clinic review and manual confirmation are required.',
    );
    expect(appointmentTelegramText(payload)).toContain('Doctor: No preference');
    expect(appointmentTelegramText(payload)).toContain('Sok Dara <script>');
  });
});

describe('HTTP notification providers', () => {
  it('sends a configured email through the Resend HTTP API', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Appointments <appointments@example.com>',
      apiKey: 'test-secret',
    });

    await expect(provider.sendAppointmentRequest(payload)).resolves.toEqual({
      provider: 'email',
      success: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    );
    const options = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      to: ['clinic@example.com'],
      subject: 'New Appointment Request — AR-20990101-ABC123',
    });
  });

  it('fails safely when email is not configured or its provider fails', async () => {
    const unconfigured = new EmailNotificationProvider({
      enabled: true,
      recipient: undefined,
      fromAddress: undefined,
      apiKey: undefined,
    });
    await expect(unconfigured.sendAppointmentRequest(payload)).resolves.toEqual({
      provider: 'email',
      success: false,
      errorCode: 'NOT_CONFIGURED',
    });

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    const configured = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Appointments <appointments@example.com>',
      apiKey: 'test-secret',
    });
    await expect(configured.sendAppointmentRequest(payload)).resolves.toEqual({
      provider: 'email',
      success: false,
      errorCode: 'PROVIDER_REQUEST_FAILED',
    });
  });

  it('reports a timeout without exposing a provider error', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException('Timed out', 'TimeoutError'));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Appointments <appointments@example.com>',
      apiKey: 'test-secret',
    });

    await expect(provider.sendAppointmentRequest(payload)).resolves.toEqual({
      provider: 'email',
      success: false,
      errorCode: 'PROVIDER_TIMEOUT',
    });
  });

  it('sends Telegram as simple text and returns provider failures safely', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new TelegramNotificationProvider({
      enabled: true,
      botToken: 'test-token',
      chatId: '-100123',
    });

    await expect(provider.sendAppointmentRequest(payload)).resolves.toEqual({
      provider: 'telegram',
      success: true,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.telegram.org/bottest-token/sendMessage');
    const options = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      chat_id: '-100123',
      text: expect.stringContaining('Status: PENDING'),
    });

    fetchMock.mockRejectedValueOnce(new Error('network failure'));
    await expect(provider.sendAppointmentRequest(payload)).resolves.toEqual({
      provider: 'telegram',
      success: false,
      errorCode: 'PROVIDER_REQUEST_FAILED',
    });
  });
});
