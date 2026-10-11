import { describe, expect, it } from 'vitest';
import { getBranchScheduleForDate, parseBranchScheduleRows } from './branch-schedule';

describe('branch schedule validation', () => {
  it('requires aligned schedule rows and an increasing time range', () => {
    expect(() =>
      parseBranchScheduleRows({
        openingDays: 'Mon - Fri | Sat',
        openingTime: '08:00',
        closingTime: '17:00 | 12:00',
      }),
    ).toThrow(/aligned/);
    expect(() =>
      parseBranchScheduleRows({
        openingDays: 'Mon - Fri',
        openingTime: '17:00',
        closingTime: '08:00',
      }),
    ).toThrow(/after opening/);
  });

  it('distinguishes a closed day from an open day', () => {
    const schedule = { openingDays: 'Mon - Fri', openingTime: '08:00', closingTime: '17:00' };
    expect(getBranchScheduleForDate(schedule, '2026-10-12')).toMatchObject({
      openTime: '08:00',
      closeTime: '17:00',
    });
    expect(getBranchScheduleForDate(schedule, '2026-10-11')).toBeUndefined();
  });
});
