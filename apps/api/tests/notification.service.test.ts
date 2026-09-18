import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmailNotificationProvider } from '../src/services/notifications/email-notification.provider';
import {
  appointmentEmailHtml,
  appointmentEmailSubject,
  appointmentEmailText,
  appointmentTelegramText,
  patientAppointmentEmailHtml,
  patientAppointmentEmailSubject,
  patientAppointmentEmailText,
  patientAppointmentStatusEmailHtml,
  patientAppointmentStatusEmailSubject,
  patientAppointmentStatusEmailText,
} from '../src/services/notifications/notification-formatters';
import { NotificationService } from '../src/services/notifications/notification.service';
import { TelegramNotificationProvider } from '../src/services/notifications/telegram-notification.provider';
import type {
  AppointmentNotificationPayload,
  AppointmentStatusUpdatePayload,
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
    expect(appointmentEmailHtml(payload)).toContain('Arunreah Dental Clinic');
    expect(appointmentEmailHtml(payload)).toContain('AR-20990101-ABC123');
    expect(appointmentEmailHtml(payload)).toContain('Pending');
    expect(appointmentEmailHtml(payload)).toContain('Sok Dara &lt;script&gt;');
    expect(appointmentEmailHtml(payload)).toContain('No preference');
    expect(appointmentTelegramText(payload)).toContain('Doctor: No preference');
    expect(appointmentTelegramText(payload)).toContain('Sok Dara <script>');
  });

  it('creates patient-facing acknowledgment content with clear PENDING status and escaping', () => {
    expect(patientAppointmentEmailSubject(payload)).toBe(
      'Appointment Request Received — AR-20990101-ABC123 | Arunreah Dental Clinic',
    );
    const textContent = patientAppointmentEmailText(payload);
    expect(textContent).toContain('Dear Sok Dara <script>,');
    expect(textContent).toContain('Appointment Reference: AR-20990101-ABC123');
    expect(textContent).toContain('Status: PENDING REVIEW');
    expect(textContent).toContain('Doctor: No preference');
    expect(textContent).toContain('WHAT HAPPENS NEXT?');
    expect(textContent).toContain('Toul Tompoung Branch: 098 701 302 / 012 964 200');
    expect(textContent).toContain('Psa Chas Branch: 069 978 997 / 061 978 997');

    const htmlContent = patientAppointmentEmailHtml(payload);
    expect(htmlContent).toContain('Arunreah Dental Clinic');
    expect(htmlContent).toContain('Dear Sok Dara &lt;script&gt;,');
    expect(htmlContent).toContain('AR-20990101-ABC123');
    expect(htmlContent).toContain('Pending Review');
    expect(htmlContent).toContain('This is a request acknowledgment. Your appointment is pending clinic review');
    expect(htmlContent).toContain('What Happens Next?');
    expect(htmlContent).toContain('Need Direct Assistance?');
    expect(htmlContent).toContain('098 701 302');
    expect(htmlContent).toContain('069 978 997');
  });

  it('creates patient-facing CONFIRMED status content with visiting guidelines', () => {
    const confirmedPayload: AppointmentStatusUpdatePayload = {
      reference: 'AR-20990101-ABC123',
      patientName: 'Sok Dara <script>',
      phone: '+855 12 345 678',
      email: 'patient@example.com',
      serviceName: 'Dental Implants',
      doctorName: null,
      branchName: 'Toul Tompoung Branch',
      preferredDate: '2099-01-01',
      preferredTime: '10:30',
      status: 'CONFIRMED',
      notes: 'Need morning appointment.',
    };

    expect(patientAppointmentStatusEmailSubject(confirmedPayload)).toBe(
      'Appointment Confirmed — AR-20990101-ABC123 | Arunreah Dental Clinic',
    );
    const text = patientAppointmentStatusEmailText(confirmedPayload);
    expect(text).toContain('Dear Sok Dara <script>,');
    expect(text).toContain('Status: CONFIRMED');
    expect(text).toContain('Doctor: Assigned upon arrival');
    expect(text).toContain('IMPORTANT VISITING INFORMATION');
    expect(text).toContain('Toul Tompoung Branch: 098 701 302 / 012 964 200');

    const html = patientAppointmentStatusEmailHtml(confirmedPayload);
    expect(html).toContain('Appointment Confirmed');
    expect(html).toContain('Dear Sok Dara &lt;script&gt;,');
    expect(html).toContain('AR-20990101-ABC123');
    expect(html).toContain('Confirmed');
    expect(html).toContain('Important Visiting Guidelines');
    expect(html).toContain('Need morning appointment.');
  });

  it('creates patient-facing CANCELLED status content with rescheduling options', () => {
    const cancelledPayload: AppointmentStatusUpdatePayload = {
      reference: 'AR-20990101-XYZ789',
      patientName: 'Chan Vanna',
      phone: '+855 98 765 432',
      email: 'chan@example.com',
      serviceName: 'General Dentistry',
      doctorName: 'Dr. Chea Roth',
      branchName: 'Psa Chas Branch',
      preferredDate: '2099-01-02',
      preferredTime: '14:00',
      status: 'CANCELLED',
      notes: null,
    };

    expect(patientAppointmentStatusEmailSubject(cancelledPayload)).toBe(
      'Appointment Request Cancelled — AR-20990101-XYZ789 | Arunreah Dental Clinic',
    );
    const text = patientAppointmentStatusEmailText(cancelledPayload);
    expect(text).toContain('Dear Chan Vanna,');
    expect(text).toContain('Status: CANCELLED');
    expect(text).toContain('Doctor: Dr. Chea Roth');
    expect(text).toContain('LOOKING TO RESCHEDULE?');
    expect(text).toContain('Psa Chas Branch: 069 978 997 / 061 978 997');

    const html = patientAppointmentStatusEmailHtml(cancelledPayload);
    expect(html).toContain('Request Cancelled');
    expect(html).toContain('Dear Chan Vanna,');
    expect(html).toContain('AR-20990101-XYZ789');
    expect(html).toContain('Cancelled');
    expect(html).toContain('Looking to Choose Another Time?');
  });
});

describe('HTTP notification providers', () => {
  it('sends both clinic and patient emails when patient email is provided', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Appointments <appointments@send.mekhla.digital>',
      apiKey: 'test-secret',
    });

    await expect(provider.sendAppointmentRequest(payload)).resolves.toEqual({
      provider: 'email',
      success: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const calls = fetchMock.mock.calls.map((call) => JSON.parse(String(call[1]?.body)));
    const clinicCall = calls.find((c) => c.to[0] === 'clinic@example.com');
    const patientCall = calls.find((c) => c.to[0] === 'patient@example.com');

    expect(clinicCall).toBeDefined();
    expect(clinicCall?.subject).toBe('New Appointment Request — AR-20990101-ABC123');

    expect(patientCall).toBeDefined();
    expect(patientCall?.subject).toBe(
      'Appointment Request Received — AR-20990101-ABC123 | Arunreah Dental Clinic',
    );
    expect(patientCall?.html).toContain('Dear Sok Dara &lt;script&gt;,');
  });

  it('sends only clinic email when patient email is omitted or empty', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Appointments <appointments@send.mekhla.digital>',
      apiKey: 'test-secret',
    });

    const payloadWithoutEmail = { ...payload, email: '   ' };
    await expect(provider.sendAppointmentRequest(payloadWithoutEmail)).resolves.toEqual({
      provider: 'email',
      success: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const clinicBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(clinicBody.to).toEqual(['clinic@example.com']);
  });

  it('tolerates patient email delivery failure without failing clinic notification', async () => {
    const logSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      if (body.to[0] === 'patient@example.com') {
        return new Response(JSON.stringify({ error: 'Mailbox not found' }), { status: 400 });
      }
      return new Response('{}', { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Appointments <appointments@send.mekhla.digital>',
      apiKey: 'test-secret',
    });

    await expect(provider.sendAppointmentRequest(payload)).resolves.toEqual({
      provider: 'email',
      success: true,
    });
    expect(logSpy).toHaveBeenCalledWith(
      'Resend patient email delivery failed',
      expect.objectContaining({
        recipient: '[redacted]',
        status: 400,
      }),
    );
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

  it('falls back to onboarding@resend.dev when custom domain returns 403', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            statusCode: 403,
            name: 'validation_error',
            message: 'Domain not verified. Please verify your domain at https://resend.com/domains',
          }),
          { status: 403 },
        ),
      )
      .mockResolvedValueOnce(new Response('{"id":"fallback-id"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const provider = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Arunreah Dental Clinic <appointments@send.mekhla.digital>',
      apiKey: 'test-secret',
    });

    const payloadWithoutEmail = { ...payload, email: '' };
    await expect(provider.sendAppointmentRequest(payloadWithoutEmail)).resolves.toEqual({
      provider: 'email',
      success: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCallBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(secondCallBody.from).toBe('Arunreah Dental Clinic <onboarding@resend.dev>');
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

  it('sends patient email on appointment status update when email is provided', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Arunreah Dental Clinic <appointments@send.mekhla.digital>',
      apiKey: 'test-secret',
    });

    const statusPayload: AppointmentStatusUpdatePayload = {
      reference: 'AR-20990101-ABC123',
      patientName: 'Sok Dara',
      phone: '+855 12 345 678',
      email: 'patient@example.com',
      serviceName: 'Dental Implants',
      doctorName: 'Dr. John',
      branchName: 'Main Branch',
      preferredDate: '2099-01-01',
      preferredTime: '10:30',
      status: 'CONFIRMED',
      notes: null,
    };

    await expect(provider.sendAppointmentStatusUpdate(statusPayload)).resolves.toEqual({
      provider: 'email',
      success: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const callBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(callBody.to).toEqual(['patient@example.com']);
    expect(callBody.subject).toBe(
      'Appointment Confirmed — AR-20990101-ABC123 | Arunreah Dental Clinic',
    );
    expect(callBody.html).toContain('Appointment Confirmed');
  });

  it('skips status update email delivery cleanly when patient email is blank', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = new EmailNotificationProvider({
      enabled: true,
      recipient: 'clinic@example.com',
      fromAddress: 'Arunreah Dental Clinic <appointments@send.mekhla.digital>',
      apiKey: 'test-secret',
    });

    const statusPayload: AppointmentStatusUpdatePayload = {
      reference: 'AR-20990101-ABC123',
      patientName: 'Sok Dara',
      phone: '+855 12 345 678',
      email: '   ',
      serviceName: 'Dental Implants',
      doctorName: null,
      branchName: 'Main Branch',
      preferredDate: '2099-01-01',
      preferredTime: '10:30',
      status: 'CANCELLED',
      notes: null,
    };

    await expect(provider.sendAppointmentStatusUpdate(statusPayload)).resolves.toEqual({
      provider: 'email',
      success: true,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
