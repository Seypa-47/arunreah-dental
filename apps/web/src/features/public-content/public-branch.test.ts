import { describe, expect, it } from 'vitest';
import { formatPublicBranchHours } from './public-branch';

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
});
