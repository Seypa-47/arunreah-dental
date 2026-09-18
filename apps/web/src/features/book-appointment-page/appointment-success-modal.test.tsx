import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  AppointmentSuccessModal,
  type AppointmentSuccessBookingDetails,
} from './appointment-success-modal';
import { PublicLanguageProvider } from '@/features/public-content/public-language-provider';

const dummyAcknowledgement = {
  message: 'Your appointment request has been submitted for clinic review.',
  reference: 'AR-20260919-ABC123',
  status: 'PENDING',
};

const dummyDetails: AppointmentSuccessBookingDetails = {
  branchName: 'Toul Tompoung Branch',
  branchPhone: '098 701 302',
  dateLabel: 'Tuesday, September 22, 2026',
  doctorName: 'Dr. Chan Vanna',
  email: 'patient@example.com',
  patientName: 'Hong Than Brathna',
  phone: '0969849988',
  serviceName: 'General Dentistry',
  time: '10:00',
};

describe('AppointmentSuccessModal', () => {
  it('does not render markup when isOpen is false', () => {
    const html = renderToStaticMarkup(
      <PublicLanguageProvider>
        <AppointmentSuccessModal
          acknowledgement={dummyAcknowledgement}
          bookingDetails={dummyDetails}
          isOpen={false}
          onBookAnother={vi.fn()}
          onClose={vi.fn()}
        />
      </PublicLanguageProvider>,
    );

    expect(html).toBe('');
  });

  it('renders all key appointment details and pending status when open', () => {
    const html = renderToStaticMarkup(
      <PublicLanguageProvider>
        <AppointmentSuccessModal
          acknowledgement={dummyAcknowledgement}
          bookingDetails={dummyDetails}
          isOpen={true}
          onBookAnother={vi.fn()}
          onClose={vi.fn()}
        />
      </PublicLanguageProvider>,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('Appointment Request Received!');
    expect(html).toContain('Hong Than Brathna');
    expect(html).toContain('AR-20260919-ABC123');
    expect(html).toContain('Pending Review');
    expect(html).toContain('General Dentistry');
    expect(html).toContain('Toul Tompoung Branch');
    expect(html).toContain('Dr. Chan Vanna');
    expect(html).toContain('Tuesday, September 22, 2026 • 10:00');
    expect(html).toContain('0969849988');
    expect(html).toContain('patient@example.com');
    expect(html).toContain('098 701 302');
    expect(html).toContain('Done');
    expect(html).toContain('Book Another Request');
  });

  it('omits email notification callout when email is undefined or empty', () => {
    const detailsWithoutEmail = { ...dummyDetails, email: undefined };
    const html = renderToStaticMarkup(
      <PublicLanguageProvider>
        <AppointmentSuccessModal
          acknowledgement={dummyAcknowledgement}
          bookingDetails={detailsWithoutEmail}
          isOpen={true}
          onBookAnother={vi.fn()}
          onClose={vi.fn()}
        />
      </PublicLanguageProvider>,
    );

    expect(html).not.toContain('An acknowledgment email with complete details has been sent to');
    expect(html).toContain('AR-20260919-ABC123');
  });
});
