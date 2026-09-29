import { describe, expect, it } from 'vitest';
import {
  formatPublicBranchHours,
  formatPublicBranchSchedules,
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
});
