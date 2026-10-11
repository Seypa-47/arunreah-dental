export type BranchScheduleInput = {
  openingDays?: string | null;
  openingDaysKm?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
};

export type BranchScheduleRow = {
  daysEn: string;
  daysKm: string;
  openTime: string;
  closeTime: string;
};

const dayIndexes: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

const presets: Record<string, number[]> = {
  'mon - sun': [0, 1, 2, 3, 4, 5, 6],
  'monday - sunday': [0, 1, 2, 3, 4, 5, 6],
  'mon - sat': [1, 2, 3, 4, 5, 6],
  'monday - saturday': [1, 2, 3, 4, 5, 6],
  'mon - fri': [1, 2, 3, 4, 5],
  'monday - friday': [1, 2, 3, 4, 5],
  'sat - sun': [0, 6],
  'saturday - sunday': [0, 6],
};

const clean = (value?: string | null) => value?.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() ?? '';
const split = (value?: string | null) =>
  clean(value)
    ? clean(value)
        .split('|')
        .map((item) => item.trim())
    : [];
const isTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

export function parseBranchScheduleRows(input: BranchScheduleInput): BranchScheduleRow[] {
  const daysEn = split(input.openingDays);
  const daysKm = split(input.openingDaysKm);
  const opens = split(input.openingTime);
  const closes = split(input.closingTime);
  const count = Math.max(daysEn.length, daysKm.length, opens.length, closes.length);
  if (count === 0) return [];
  if ([daysEn, opens, closes].some((items) => items.length !== count)) {
    throw new Error(
      'Branch schedule rows must have aligned days, opening times, and closing times.',
    );
  }
  if (daysKm.length !== 0 && daysKm.length !== count) {
    throw new Error('Khmer branch schedule rows must align with English schedule rows.');
  }
  return Array.from({ length: count }, (_, index) => {
    const row = {
      daysEn: daysEn[index] ?? '',
      daysKm: daysKm[index] ?? '',
      openTime: opens[index] ?? '',
      closeTime: closes[index] ?? '',
    };
    if (!row.daysEn || !isTime(row.openTime) || !isTime(row.closeTime)) {
      throw new Error(
        'Branch schedule rows require valid days and HH:mm opening and closing times.',
      );
    }
    if (row.closeTime <= row.openTime) {
      throw new Error('Branch closing time must be after opening time.');
    }
    return row;
  });
}

export function getDaysOfWeekForSchedule(value: string): number[] {
  const normalized = clean(value).toLowerCase().replaceAll(/\s+/g, ' ');
  if (presets[normalized]) return presets[normalized];
  const range = normalized.match(/^([^\s–-]+)\s*[-–—]\s*([^\s–-]+)$/i);
  if (range?.[1] && range[2]) {
    const start = dayIndexes[range[1]];
    const end = dayIndexes[range[2]];
    if (start !== undefined && end !== undefined) {
      const result: number[] = [];
      for (let current = start; ; current = (current + 1) % 7) {
        result.push(current);
        if (current === end) return result;
      }
    }
  }
  const single = dayIndexes[normalized];
  if (single !== undefined) return [single];
  throw new Error(`Unsupported branch schedule day expression: ${value}`);
}

export function getBranchScheduleForDate(input: BranchScheduleInput, date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1, 12)).getUTCDay();
  const rows = parseBranchScheduleRows(input);
  if (rows.length === 0) return undefined;
  return rows.find((row) => getDaysOfWeekForSchedule(row.daysEn).includes(weekday));
}
