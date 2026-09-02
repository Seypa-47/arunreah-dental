export const CLINIC_TIME_ZONE = 'Asia/Phnom_Penh';

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function shiftCalendarDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function getClinicDate(date = new Date()) {
  return dateParts(date);
}

/** Monday through Sunday, calculated against Cambodia's local calendar date. */
export function getClinicWeekRange(date = new Date()) {
  const today = getClinicDate(date);
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TIME_ZONE,
    weekday: 'short',
  }).format(date);
  const weekdayOffset: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const fromDate = shiftCalendarDate(today, -(weekdayOffset[weekday] ?? 0));
  return { today, fromDate, toDate: shiftCalendarDate(fromDate, 6) };
}
