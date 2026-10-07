import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  AppointmentCalendar,
  AppointmentSuccessModal,
  AvailableTimes,
  dateLabel,
  formatDisplayTime,
  getPhnomPenhDateTime,
  isTimeSlotPastForPhnomPenh,
  matchesBookingOption,
  toDateKey,
  withOptionalServiceOption,
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

  describe('matchesBookingOption', () => {
    it('matches booking options by id/value, slug, or case-insensitive name', () => {
      const branch = { id: 'branch-1', name: 'Psa Chas Branch', slug: 'psa-chas' };
      expect(matchesBookingOption(branch, 'branch-1')).toBe(true);
      expect(matchesBookingOption(branch, 'psa-chas')).toBe(true);
      expect(matchesBookingOption(branch, 'PSA-CHAS')).toBe(true);
      expect(matchesBookingOption(branch, 'psa chas branch')).toBe(true);
      expect(matchesBookingOption(branch, 'toul-tompoung')).toBe(false);

      const doctor = { name: 'Dr. Dara', slug: 'dara', value: 'doc-uuid' };
      expect(matchesBookingOption(doctor, 'doc-uuid')).toBe(true);
      expect(matchesBookingOption(doctor, 'dara')).toBe(true);
      expect(matchesBookingOption(doctor, 'dr. dara')).toBe(true);
    });
  });

  describe('optional service selection', () => {
    it('places a no-preference choice before the published services', () => {
      expect(
        withOptionalServiceOption(
          [{ name: 'Dental Implants', slug: 'dental-implants', value: 'service-1' }],
          'Not sure / No preference',
        ),
      ).toEqual([
        { name: 'Not sure / No preference', value: '' },
        { name: 'Dental Implants', slug: 'dental-implants', value: 'service-1' },
      ]);
    });
  });

  describe('Asia/Phnom_Penh date & time helpers', () => {
    it('computes Asia/Phnom_Penh (UTC+7) date and time parts regardless of host timezone', () => {
      // 2026-09-28T03:20:00Z is 2026-09-28 10:20 in Asia/Phnom_Penh (UTC+7)
      const instant = new Date('2026-09-28T03:20:00.000Z');
      const pp = getPhnomPenhDateTime(instant);
      expect(pp).toEqual({
        dateKey: '2026-09-28',
        day: 28,
        hour: 10,
        minute: 20,
        month: 9,
        year: 2026,
      });
    });

    it('identifies past time slots for today in Asia/Phnom_Penh time', () => {
      // 10:20 AM Phnom Penh time on 2026-09-28
      const instant = new Date('2026-09-28T03:20:00.000Z');
      expect(isTimeSlotPastForPhnomPenh('09:45', '2026-09-28', instant)).toBe(true);
      expect(isTimeSlotPastForPhnomPenh('10:15', '2026-09-28', instant)).toBe(true);
      expect(isTimeSlotPastForPhnomPenh('10:30', '2026-09-28', instant)).toBe(false);
      expect(isTimeSlotPastForPhnomPenh('08:00', '2026-09-29', instant)).toBe(false);
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

    it('disables already-passed hours and minutes for today in Asia/Phnom_Penh time', () => {
      // 10:20 AM Phnom Penh time on 2026-09-28
      const instant = new Date('2026-09-28T03:20:00.000Z');
      const html = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AvailableTimes
            now={instant}
            onSelectTime={vi.fn()}
            selectedDate="2026-09-28"
            selectedTime="10:30"
            times={times}
          />
        </PublicLanguageProvider>,
      );

      // 08:00 AM and 09:00 AM hours are completely in the past -> disabled
      expect(html).toMatch(/aria-label="Select 08:00 AM"[^>]*disabled=""/);
      expect(html).toMatch(/aria-label="Select 09:00 AM"[^>]*disabled=""/);
      // Within active 10:xx hour, 10:00 AM and 10:15 AM are disabled while 10:30 AM is active
      expect(html).toMatch(/aria-label="10:00 AM"[^>]*disabled=""/);
      expect(html).toMatch(/aria-label="10:15 AM"[^>]*disabled=""/);
      expect(html).toContain('aria-label="10:30 AM" aria-pressed="true"');
    });

    it('dynamically adapts hours based on branch schedule for Mon-Sat (8am-6pm) vs Sunday (8am-4pm)', () => {
      const dynamicBranch = {
        address: '123 Norodom Blvd',
        id: 'branch-dynamic',
        imageAlt: 'Dynamic Branch',
        imageUrl: '',
        mapLabel: 'View on map',
        mapUrl: 'https://maps.app.goo.gl/test',
        name: 'Dynamic Branch',
        slug: 'dynamic',
        openingDays: 'Mon - Sat | Sun',
        openingDaysKm: 'ច័ន្ទ - សៅរ៍ | អាទិត្យ',
        openingTime: '08:00 | 08:00',
        closingTime: '18:00 | 16:00',
      };

      // 1. Monday 2026-10-05: open until 6:00 PM (18:00)
      const mondayHtml = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AvailableTimes
            branch={dynamicBranch}
            onSelectTime={vi.fn()}
            selectedDate="2026-10-05"
            selectedTime="10:00"
          />
        </PublicLanguageProvider>,
      );

      expect(mondayHtml).toContain('08:00 AM');
      expect(mondayHtml).toContain('05:00 PM');
      expect(mondayHtml).toContain('06:00 PM');
      expect(mondayHtml).toContain('8:00 AM – 6:00 PM');

      // 2. Sunday 2026-10-04: open until 4:00 PM (16:00)
      const sundayHtml = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AvailableTimes
            branch={dynamicBranch}
            onSelectTime={vi.fn()}
            selectedDate="2026-10-04"
            selectedTime="10:00"
          />
        </PublicLanguageProvider>,
      );

      expect(sundayHtml).toContain('08:00 AM');
      expect(sundayHtml).toContain('04:00 PM');
      expect(sundayHtml).toContain('8:00 AM – 4:00 PM');
      // Must NOT contain 5pm or 6pm on Sunday
      expect(sundayHtml).not.toContain('05:00 PM');
      expect(sundayHtml).not.toContain('06:00 PM');
    });

    it('renders a friendly closed state with next open date button when branch is closed on that day', () => {
      const weekdayOnlyBranch = {
        address: '456 Monivong Blvd',
        id: 'branch-weekday',
        imageAlt: 'Weekday Branch',
        imageUrl: '',
        mapLabel: 'View on map',
        mapUrl: 'https://maps.app.goo.gl/test',
        name: 'Weekday Branch',
        slug: 'weekday',
        openingDays: 'Mon - Fri',
        openingTime: '08:00',
        closingTime: '17:00',
      };

      // Sunday 2026-10-04: Closed
      const closedHtml = renderToStaticMarkup(
        <PublicLanguageProvider>
          <AvailableTimes
            branch={weekdayOnlyBranch}
            onSelectDate={vi.fn()}
            onSelectTime={vi.fn()}
            selectedDate="2026-10-04"
            selectedTime=""
          />
        </PublicLanguageProvider>,
      );

      expect(closedHtml).toContain('Branch is closed on this date');
      expect(closedHtml).toContain('This branch is closed on Sunday');
      expect(closedHtml).toContain('Select next open date');
    });

    it('renders bilingual Khmer closed notice when branch is closed on that day', () => {
      const weekdayOnlyBranch = {
        address: '456 Monivong Blvd',
        id: 'branch-weekday',
        imageAlt: 'Weekday Branch',
        imageUrl: '',
        mapLabel: 'View on map',
        mapUrl: 'https://maps.app.goo.gl/test',
        name: 'Weekday Branch',
        slug: 'weekday',
        openingDays: 'Mon - Fri',
        openingTime: '08:00',
        closingTime: '17:00',
      };

      const closedKmHtml = renderToStaticMarkup(
        <PublicLanguageProvider initialLanguage="km">
          <AvailableTimes
            branch={weekdayOnlyBranch}
            onSelectDate={vi.fn()}
            onSelectTime={vi.fn()}
            selectedDate="2026-10-04"
            selectedTime=""
          />
        </PublicLanguageProvider>,
      );

      expect(closedKmHtml).toContain('សាខាបិទនៅថ្ងៃនេះ');
      expect(closedKmHtml).toContain('សាខានេះមិនបើកដំណើរការនៅអាទិត្យទេ');
      expect(closedKmHtml).toContain('ជ្រើសរើសថ្ងៃបើកបន្ទាប់');
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
