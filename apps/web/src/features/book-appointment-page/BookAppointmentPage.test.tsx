import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  AppointmentCalendar,
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
        <AvailableTimes
          onSelectTime={vi.fn()}
          selectedTime="10:00"
          times={times}
        />,
      );

      expect(html).toContain('08:00 AM');
      expect(html).toContain('09:00 AM');
      expect(html).toContain('10:00 AM');
      expect(html).toContain('01:00 PM');
      expect(html).toContain('02:00 PM');
    });

    it('displays the minute selector below the active hour', () => {
      const html = renderToStaticMarkup(
        <AvailableTimes
          onSelectTime={vi.fn()}
          selectedTime="10:30"
          times={times}
        />,
      );

      expect(html).toContain('Select Minute');
      expect(html).toContain(':00');
      expect(html).toContain(':15');
      expect(html).toContain(':30');
      expect(html).toContain(':45');
      // The active hour button displays 10:30 AM
      expect(html).toContain('10:30 AM');
      // The selected minute :30 has aria-pressed="true"
      expect(html).toContain('aria-label="10:30 AM" aria-pressed="true"');
    });
  });
});
