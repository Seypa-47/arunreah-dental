import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  AppointmentCalendar,
  AppointmentSuccessModal,
  AvailableTimes,
  dateLabel,
  formatDisplayTime,
  toDateKey,
} from './BookAppointmentPage';
import { PublicLanguageProvider } from '@/features/public-content/public-language-provider';

describe('BookAppointmentPage Date & Time features', () => {
  describe('formatDisplayTime', () => {
    it('formats 24-hour HH:mm times into clean 12-hour AM/PM display strings', () => {
      expect(formatDisplayTime('08:00')).toBe('08:00 AM');
      expect(formatDisplayTime('10:30')).toBe('10:30 AM');
      expect(formatDisplayTime('11:45')).toBe('11:45 AM');
      expect(formatDisplayTime('13:00')).toBe('01:00 PM');
      expect(formatDisplayTime('14:30')).toBe('02:30 PM');
      expect(formatDisplayTime('16:15')).toBe('04:15 PM');
    });

    it('returns empty string if time is empty', () => {
      expect(formatDisplayTime('')).toBe('');
    });
  });

  describe('toDateKey', () => {
    it('formats dates as YYYY-MM-DD strings', () => {
      expect(toDateKey(new Date(2026, 9, 9))).toBe('2026-10-09');
      expect(toDateKey(new Date(2026, 8, 20))).toBe('2026-09-20');
    });
  });

  describe('dateLabel', () => {
    it('formats dates for English display', () => {
      const label = dateLabel('2026-10-09', 'en');
      expect(label).toContain('October');
      expect(label).toContain('2026');
    });

    it('formats dates for Khmer display', () => {
      const label = dateLabel('2026-10-09', 'km');
      expect(label.length).toBeGreaterThan(0);
    });
  });

  describe('AppointmentCalendar', () => {
    const defaultCalendar = {
      dates: [],
      monthLabel: 'September 2026',
      selectedDateKey: '2026-09-20',
      selectedDateLabel: 'Sunday, September 20, 2026',
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    };

    it('renders month navigation buttons with next month enabled', () => {
      const html = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AppointmentCalendar
            calendar={defaultCalendar}
            onSelectDate={vi.fn()}
            selectedDate="2026-09-20"
          />
        </PublicLanguageProvider>,
      );

      expect(html).toContain('aria-label="Next month"');
      expect(html).toContain('Next month');
    });

    it('renders previous month as enabled when selectedDate is in a future month', () => {
      const html = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AppointmentCalendar
            calendar={defaultCalendar}
            onSelectDate={vi.fn()}
            selectedDate="2027-02-15"
          />
        </PublicLanguageProvider>,
      );

      expect(html).toContain('aria-label="Previous month"');
      expect(html).toContain('February 2027');
    });

    it('renders 42 date buttons on the calendar grid', () => {
      const html = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AppointmentCalendar
            calendar={defaultCalendar}
            onSelectDate={vi.fn()}
            selectedDate="2026-10-09"
          />
        </PublicLanguageProvider>,
      );

      // Matches date buttons rendered on the 6x7 grid
      const buttons = html.match(/aria-pressed=/g);
      expect(buttons?.length).toBe(42);
      expect(html).toContain('aria-pressed="true"');
    });
  });

  describe('AvailableTimes', () => {
    const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    it('renders hours with 12-hour AM/PM labels', () => {
      const html = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AvailableTimes
            onSelectTime={vi.fn()}
            selectedTime="10:00"
            times={times}
          />
        </PublicLanguageProvider>,
      );

      expect(html).toContain('08:00 AM');
      expect(html).toContain('09:00 AM');
      expect(html).toContain('10:00 AM');
      expect(html).toContain('01:00 PM');
      expect(html).toContain('02:00 PM');
    });

    it('displays the minute selector below the active hour', () => {
      const html = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AvailableTimes
            onSelectTime={vi.fn()}
            selectedTime="10:30"
            times={times}
          />
        </PublicLanguageProvider>,
      );

      expect(html).toContain('Select Minute');
      expect(html).toContain(':00');
      expect(html).toContain(':15');
      expect(html).toContain(':30');
      expect(html).toContain(':45');
      // The selected minute :30 has aria-pressed="true"
      expect(html).toContain('aria-label="10:30 AM" aria-pressed="true"');
    });
  });

  describe('AppointmentSuccessModal', () => {
    const defaultAcknowledgement = {
      message: 'Your request has been received. Our team will contact you shortly.',
      reference: 'ARUN-2026-9876',
      status: 'PENDING',
    };

    const defaultDetails = {
      branchName: 'Main Branch - Phnom Penh',
      dateLabel: 'Friday, October 9, 2026',
      doctorName: 'Dr. John Doe',
      patientName: 'Sophea Pich',
      phone: '012 345 678',
      serviceName: 'General Consultation',
      time: '10:30 AM',
    };

    it('renders confirmation details and reference code in English', () => {
      const html = renderToStaticMarkup(
        <AppointmentSuccessModal
          acknowledgement={defaultAcknowledgement}
          details={defaultDetails}
          language="en"
          onClose={vi.fn()}
        />,
      );

      expect(html).toContain('Appointment Request Received');
      expect(html).toContain('ARUN-2026-9876');
      expect(html).toContain('Pending Confirmation');
      expect(html).toContain('Main Branch - Phnom Penh');
      expect(html).toContain('General Consultation');
      expect(html).toContain('Dr. John Doe');
      expect(html).toContain('Friday, October 9, 2026 — 10:30 AM');
      expect(html).toContain('Sophea Pich (012 345 678)');
      expect(html).toContain('Notice: Appointments are requests subject to confirmation');
    });

    it('renders confirmation details in Khmer', () => {
      const html = renderToStaticMarkup(
        <AppointmentSuccessModal
          acknowledgement={defaultAcknowledgement}
          details={defaultDetails}
          language="km"
          onClose={vi.fn()}
        />,
      );

      expect(html).toContain('បានទទួលសំណើសុំការណាត់ជួប');
      expect(html).toContain('ARUN-2026-9876');
      expect(html).toContain('រង់ចាំការបញ្ជាក់');
      expect(html).toContain('សាខា');
      expect(html).toContain('សេវាកម្ម');
      expect(html).toContain('ទន្តបណ្ឌិត');
    });
  });
});
