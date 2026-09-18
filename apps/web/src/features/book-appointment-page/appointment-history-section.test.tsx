import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { AppointmentHistorySection } from './appointment-history-section';
import type { StoredAppointmentReceipt } from './appointment-history';

const dummyReceipt: StoredAppointmentReceipt = {
  bookingDetails: {
    branchName: 'Psa Chas Branch',
    branchPhone: '069 978 997',
    dateLabel: 'Tuesday, September 22, 2026',
    doctorName: 'No preference',
    email: 'patient@example.com',
    patientName: 'Hong Than Brathna',
    phone: '0969849988',
    serviceName: 'General Dentistry',
    time: '10:00',
  },
  createdAt: '2026-09-19T01:00:00.000Z',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  message: 'Your appointment request has been submitted for clinic review.',
  reference: 'AR-20260919-E3BFE2',
  status: 'PENDING',
};

describe('AppointmentHistorySection', () => {
  it('renders nothing when history is empty', () => {
    const html = renderToStaticMarkup(
      <AppointmentHistorySection
        history={[]}
        onClearHistory={vi.fn()}
        onViewReceipt={vi.fn()}
      />,
    );

    expect(html).toBe('');
  });

  it('renders history items with reference, status, and view receipt action', () => {
    const html = renderToStaticMarkup(
      <AppointmentHistorySection
        history={[dummyReceipt]}
        onClearHistory={vi.fn()}
        onViewReceipt={vi.fn()}
      />,
    );

    expect(html).toContain('Your Recent Requests (Past 7 Days)');
    expect(html).toContain('Appointment request received');
    expect(html).toContain('PENDING');
    expect(html).toContain('Reference:');
    expect(html).toContain('AR-20260919-E3BFE2');
    expect(html).toContain('General Dentistry • Psa Chas Branch');
    expect(html).toContain('View Request Receipt');
    expect(html).toContain('Clear History');
  });

  it('renders Khmer translations when language is km', () => {
    const html = renderToStaticMarkup(
      <AppointmentHistorySection
        history={[dummyReceipt]}
        language="km"
        onClearHistory={vi.fn()}
        onViewReceipt={vi.fn()}
      />,
    );

    expect(html).toContain('សំណើថ្មីៗរបស់អ្នក (៧ ថ្ងៃចុងក្រោយ)');
    expect(html).toContain('សំណើសុំណាត់ជួបត្រូវបានទទួល');
    expect(html).toContain('លេខយោង:');
    expect(html).toContain('AR-20260919-E3BFE2');
    expect(html).toContain('មើលវិក្កយបត្រសំណើ');
    expect(html).toContain('សម្អាតប្រវត្តិ');
  });
});
