import { describe, expect, it } from 'vitest';
import {
  formatPublicBranchHours,
  formatPublicBranchSchedules,
  generateDynamicHoursAndSlots,
  getBranchScheduleForDate,
  getNextOpenDateKey,
  parseBranchScheduleRows,
  serializeBranchScheduleRows,
} from './public-branch';

describe('formatPublicBranchHours', () => {
  it('uses structured days and times instead of contradictory formatted copy', () => {
    expect(formatPublicBranchHours({
      closingTime: '16:00',
      openingDays: 'Mon - Sat',
      openingHours: 'Monday - Sunday: 8:00 AM - 4:00 PM',
      openingTime: '08:00',
    })).toEqual({ days: 'Mon - Sat', time: '08:00 – 16:00' });
  });

  it('removes a repeated day prefix from legacy formatted copy', () => {
    expect(formatPublicBranchHours({
      openingDays: 'Monday - Saturday',
      openingHours: 'Monday -\u200B Saturday: 8:00 AM - 6:00 PM',
    })).toEqual({ days: 'Monday - Saturday', time: '8:00 AM - 6:00 PM' });
  });

  it('removes a repeated or contradictory day prefix when openingDays is abbreviated', () => {
    expect(formatPublicBranchHours({
      openingDays: 'Mon - Sat',
      openingHours: 'Monday - Saturday: 8:00 AM - 6:00 PM',
    })).toEqual({ days: 'Mon - Sat', time: '8:00 AM - 6:00 PM' });

    expect(formatPublicBranchHours({
      openingDays: 'Mon - Sat',
      openingHours: 'Monday - Sunday: 8:00 AM - 4:00 PM',
    })).toEqual({ days: 'Mon - Sat', time: '8:00 AM - 4:00 PM' });
  });

  it('keeps localized fallback copy when structured times are absent', () => {
    expect(formatPublicBranchHours({
      openingDays: 'ច័ន្ទ - សៅរ៍',
      openingHours: '៨:០០ ព្រឹក - ៦:០០ ល្ងាច',
    })).toEqual({ days: 'ច័ន្ទ - សៅរ៍', time: '៨:០០ ព្រឹក - ៦:០០ ល្ងាច' });
  });

  it('supports multiple opening day and hour schedules per branch', () => {
    const serialized = serializeBranchScheduleRows([
      { daysEn: 'Mon - Sat', daysKm: 'ច័ន្ទ - សៅរ៍', openTime: '08:00', closeTime: '18:00' },
      { daysEn: 'Sun', daysKm: 'អាទិត្យ', openTime: '08:00', closeTime: '17:00' },
    ]);

    expect(serialized).toEqual({
      openingDays: 'Mon - Sat | Sun',
      openingDaysKm: 'ច័ន្ទ - សៅរ៍ | អាទិត្យ',
      openingTime: '08:00 | 08:00',
      closingTime: '18:00 | 17:00',
      openingHours: 'Monday - Saturday: 8:00 AM - 6:00 PM | Sunday: 8:00 AM - 5:00 PM',
      openingHoursKm: 'ច័ន្ទ - សៅរ៍៖ ៨:០០ ព្រឹក - ៦:០០ ល្ងាច | អាទិត្យ៖ ៨:០០ ព្រឹក - ៥:០០ ល្ងាច',
    });

    expect(parseBranchScheduleRows(serialized)).toEqual([
      { daysEn: 'Mon - Sat', daysKm: 'ច័ន្ទ - សៅរ៍', openTime: '08:00', closeTime: '18:00' },
      { daysEn: 'Sun', daysKm: 'អាទិត្យ', openTime: '08:00', closeTime: '17:00' },
    ]);

    expect(formatPublicBranchSchedules(serialized)).toEqual([
      { days: 'Mon - Sat', time: '08:00 – 18:00' },
      { days: 'Sun', time: '08:00 – 17:00' },
    ]);

    expect(formatPublicBranchHours(serialized)).toEqual({
      days: '',
      time: 'Mon - Sat: 08:00 – 18:00 • Sun: 08:00 – 17:00',
    });
  });

  describe('getBranchScheduleForDate and dynamic time slots', () => {
    const multiScheduleBranch = {
      openingDays: 'Mon - Sat | Sun',
      openingDaysKm: 'ច័ន្ទ - សៅរ៍ | អាទិត្យ',
      openingTime: '08:00 | 08:00',
      closingTime: '18:00 | 16:00',
    };

    it('resolves Mon-Sat schedule to 8:00 AM - 6:00 PM on weekdays', () => {
      // 2026-10-05 is Monday
      const monday = getBranchScheduleForDate(multiScheduleBranch, '2026-10-05', 'en');
      expect(monday.isOpen).toBe(true);
      expect(monday.openTime).toBe('08:00');
      expect(monday.closeTime).toBe('18:00');
      expect(monday.dayName).toBe('Monday');
      expect(monday.formattedHours).toBe('8:00 AM – 6:00 PM');

      // 2026-10-10 is Saturday
      const saturday = getBranchScheduleForDate(multiScheduleBranch, '2026-10-10', 'en');
      expect(saturday.isOpen).toBe(true);
      expect(saturday.openTime).toBe('08:00');
      expect(saturday.closeTime).toBe('18:00');
      expect(saturday.dayName).toBe('Saturday');
    });

    it('resolates Sunday schedule to 8:00 AM - 4:00 PM on Sunday', () => {
      // 2026-10-04 is Sunday
      const sunday = getBranchScheduleForDate(multiScheduleBranch, '2026-10-04', 'en');
      expect(sunday.isOpen).toBe(true);
      expect(sunday.openTime).toBe('08:00');
      expect(sunday.closeTime).toBe('16:00');
      expect(sunday.dayName).toBe('Sunday');
      expect(sunday.formattedHours).toBe('8:00 AM – 4:00 PM');
    });

    it('formats localized schedule in Khmer', () => {
      const sundayKm = getBranchScheduleForDate(multiScheduleBranch, '2026-10-04', 'km');
      expect(sundayKm.isOpen).toBe(true);
      expect(sundayKm.dayName).toBe('អាទិត្យ');
      expect(sundayKm.formattedHours).toContain('៨:០០ ព្រឹក');
      expect(sundayKm.formattedHours).toContain('៤:០០ រសៀល');
    });

    it('detects when branch is closed on a day without matching schedule row', () => {
      const weekdaysOnlyBranch = {
        openingDays: 'Mon - Fri',
        openingTime: '08:00',
        closingTime: '17:00',
      };

      // 2026-10-04 is Sunday
      const sunday = getBranchScheduleForDate(weekdaysOnlyBranch, '2026-10-04', 'en');
      expect(sunday.isOpen).toBe(false);
      expect(sunday.openTime).toBe('');
      expect(sunday.closeTime).toBe('');
      expect(sunday.dayName).toBe('Sunday');

      // 2026-10-03 is Saturday
      const saturday = getBranchScheduleForDate(weekdaysOnlyBranch, '2026-10-03', 'en');
      expect(saturday.isOpen).toBe(false);

      // 2026-10-02 is Friday
      const friday = getBranchScheduleForDate(weekdaysOnlyBranch, '2026-10-02', 'en');
      expect(friday.isOpen).toBe(true);
    });

    it('finds next open date when branch is closed on selected date', () => {
      const weekdaysOnlyBranch = {
        openingDays: 'Mon - Fri',
        openingTime: '08:00',
        closingTime: '17:00',
      };
      // 2026-10-04 is Sunday -> next open day is Monday 2026-10-05
      const nextOpen = getNextOpenDateKey(weekdaysOnlyBranch, '2026-10-04');
      expect(nextOpen).toBe('2026-10-05');
    });

    it('generates dynamic hours strictly matching branch operating window', () => {
      // 08:00 to 18:00 (8am to 6pm)
      const weekdaySlots = generateDynamicHoursAndSlots('08:00', '18:00');
      expect(weekdaySlots.baseHours).toEqual(['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18']);
      expect(weekdaySlots.isValidSlot('08:00')).toBe(true);
      expect(weekdaySlots.isValidSlot('18:00')).toBe(true);
      expect(weekdaySlots.isValidSlot('18:15')).toBe(false);
      expect(weekdaySlots.isValidSlot('07:45')).toBe(false);

      // 08:00 to 16:00 (8am to 4pm)
      const sundaySlots = generateDynamicHoursAndSlots('08:00', '16:00');
      expect(sundaySlots.baseHours).toEqual(['08', '09', '10', '11', '12', '13', '14', '15', '16']);
      expect(sundaySlots.baseHours).not.toContain('17');
      expect(sundaySlots.baseHours).not.toContain('18');
      expect(sundaySlots.isValidSlot('16:00')).toBe(true);
      expect(sundaySlots.isValidSlot('16:15')).toBe(false);
      expect(sundaySlots.isValidSlot('17:00')).toBe(false);
    });
  });
});
