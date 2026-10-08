type BranchHoursInput = {
  closingTime?: string | null;
  openingDays?: string | null;
  openingHours?: string | null;
  openingTime?: string | null;
};

export type PublicBranchScheduleItem = {
  days: string;
  time: string;
};

export type BranchScheduleRow = {
  daysEn: string;
  daysKm: string;
  openTime: string;
  closeTime: string;
};

export const BRANCH_DAY_PRESETS = [
  { value: 'Mon - Sun', labelEn: 'Mon - Sun (Every Day)', fullEn: 'Monday - Sunday', km: 'ច័ន្ទ - អាទិត្យ' },
  { value: 'Mon - Sat', labelEn: 'Mon - Sat', fullEn: 'Monday - Saturday', km: 'ច័ន្ទ - សៅរ៍' },
  { value: 'Mon - Fri', labelEn: 'Mon - Fri (Weekdays)', fullEn: 'Monday - Friday', km: 'ច័ន្ទ - សុក្រ' },
  { value: 'Sat - Sun', labelEn: 'Sat - Sun (Weekend)', fullEn: 'Saturday - Sunday', km: 'សៅរ៍ - អាទិត្យ' },
  { value: 'Sun', labelEn: 'Sun (Sunday Only)', fullEn: 'Sunday', km: 'អាទិត្យ' },
  { value: 'Sat', labelEn: 'Sat (Saturday Only)', fullEn: 'Saturday', km: 'សៅរ៍' },
  { value: 'Mon - Thu', labelEn: 'Mon - Thu', fullEn: 'Monday - Thursday', km: 'ច័ន្ទ - ព្រហស្បតិ៍' },
  { value: 'Fri - Sun', labelEn: 'Fri - Sun', fullEn: 'Friday - Sunday', km: 'សុក្រ - អាទិត្យ' },
  { value: 'Tue - Sun', labelEn: 'Tue - Sun', fullEn: 'Tuesday - Sunday', km: 'អង្គារ - អាទិត្យ' },
  { value: 'Tue - Sat', labelEn: 'Tue - Sat', fullEn: 'Tuesday - Saturday', km: 'អង្គារ - សៅរ៍' },
  { value: 'Mon', labelEn: 'Monday', fullEn: 'Monday', km: 'ច័ន្ទ' },
  { value: 'Tue', labelEn: 'Tuesday', fullEn: 'Tuesday', km: 'អង្គារ' },
  { value: 'Wed', labelEn: 'Wednesday', fullEn: 'Wednesday', km: 'ពុធ' },
  { value: 'Thu', labelEn: 'Thursday', fullEn: 'Thursday', km: 'ព្រហស្បតិ៍' },
  { value: 'Fri', labelEn: 'Friday', fullEn: 'Friday', km: 'សុក្រ' },
] as const;

export const PRESET_DAYS_MAP: Record<string, number[]> = {
  'Mon - Sun': [0, 1, 2, 3, 4, 5, 6],
  'Mon - Sat': [1, 2, 3, 4, 5, 6],
  'Mon - Fri': [1, 2, 3, 4, 5],
  'Sat - Sun': [0, 6],
  'Sun': [0],
  'Sat': [6],
  'Mon - Thu': [1, 2, 3, 4],
  'Fri - Sun': [0, 5, 6],
  'Tue - Sun': [0, 2, 3, 4, 5, 6],
  'Tue - Sat': [2, 3, 4, 5, 6],
  'Mon': [1],
  'Tue': [2],
  'Wed': [3],
  'Thu': [4],
  'Fri': [5],
};

const DAY_TOKEN_TO_INDEX: Record<string, number> = {
  sun: 0,
  sunday: 0,
  អាទិត្យ: 0,
  mon: 1,
  monday: 1,
  ច័ន្ទ: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  អង្គារ: 2,
  wed: 3,
  wednesday: 3,
  ពុធ: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  ព្រហស្បតិ៍: 4,
  fri: 5,
  friday: 5,
  សុក្រ: 5,
  sat: 6,
  saturday: 6,
  សៅរ៍: 6,
};

export const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const DAY_NAMES_KM = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'] as const;

export function getPresetForDays(daysString: string) {
  const trimmed = daysString.trim();
  const normalized = trimmed.toLowerCase();
  return BRANCH_DAY_PRESETS.find(
    (preset) =>
      preset.value.toLowerCase() === normalized ||
      preset.fullEn.toLowerCase() === normalized ||
      preset.labelEn.toLowerCase() === normalized ||
      preset.km === trimmed ||
      preset.km.replace(/\s+/g, '') === trimmed.replace(/\s+/g, ''),
  );
}

export function getPresetForDaysEn(daysEn: string) {
  return getPresetForDays(daysEn);
}

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'] as const;

export function toKhmerDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => KHMER_DIGITS[Number(digit)] ?? digit);
}

export function formatTime12hEn(hhmm: string): string {
  const match = hhmm.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return hhmm.trim();
  const hour24 = Number(match[1]);
  const minutes = match[2];
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minutes} ${period}`;
}

export function formatTime12hKm(hhmm: string): string {
  const match = hhmm.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return toKhmerDigits(hhmm.trim());
  const hour24 = Number(match[1]);
  const minutes = match[2] ?? '00';
  const periodKm =
    hour24 < 12
      ? 'ព្រឹក'
      : hour24 < 17
        ? 'រសៀល'
        : hour24 < 19
          ? 'ល្ងាច'
          : 'យប់';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${toKhmerDigits(String(hour12))}:${toKhmerDigits(minutes)} ${periodKm}`;
}

const clean = (value?: string | null) => value?.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() ?? '';

export function parseBranchScheduleRows(branch: {
  openingDays?: string | null;
  openingDaysKm?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
}): BranchScheduleRow[] {
  const daysEnParts = clean(branch.openingDays)
    ? clean(branch.openingDays).split('|').map((item) => item.trim())
    : [];
  const daysKmParts = clean(branch.openingDaysKm)
    ? clean(branch.openingDaysKm).split('|').map((item) => item.trim())
    : [];
  const openParts = clean(branch.openingTime)
    ? clean(branch.openingTime).split('|').map((item) => item.trim())
    : [];
  const closeParts = clean(branch.closingTime)
    ? clean(branch.closingTime).split('|').map((item) => item.trim())
    : [];

  const count = Math.max(1, daysEnParts.length, openParts.length, closeParts.length);

  return Array.from({ length: count }, (_, index) => {
    const daysEn = daysEnParts[index] ?? (index === 0 ? 'Mon - Sun' : 'Sun');
    const preset = getPresetForDaysEn(daysEn);
    const daysKm = daysKmParts[index] ?? preset?.km ?? '';
    const openTime = openParts[index] ?? openParts[0] ?? '08:00';
    const closeTime = closeParts[index] ?? closeParts[0] ?? '18:00';
    return {
      daysEn,
      daysKm,
      openTime,
      closeTime,
    };
  });
}

export function serializeBranchScheduleRows(rows: BranchScheduleRow[]): {
  openingDays: string;
  openingDaysKm: string;
  openingTime: string;
  closingTime: string;
  openingHours: string;
  openingHoursKm: string;
} {
  const normalizedRows = rows.length > 0
    ? rows
    : [{ daysEn: 'Mon - Sun', daysKm: 'ច័ន្ទ - អាទិត្យ', openTime: '08:00', closeTime: '18:00' }];

  const openingDays = normalizedRows.map((row) => row.daysEn.trim()).join(' | ');
  const openingDaysKm = normalizedRows.map((row) => row.daysKm.trim()).join(' | ');
  const openingTime = normalizedRows.map((row) => row.openTime.trim()).join(' | ');
  const closingTime = normalizedRows.map((row) => row.closeTime.trim()).join(' | ');

  const openingHours = normalizedRows
    .map((row) => {
      const preset = getPresetForDaysEn(row.daysEn);
      const dayLabel = preset?.fullEn ?? row.daysEn.trim();
      const openLabel = formatTime12hEn(row.openTime);
      const closeLabel = formatTime12hEn(row.closeTime);
      return dayLabel ? `${dayLabel}: ${openLabel} - ${closeLabel}` : `${openLabel} - ${closeLabel}`;
    })
    .join(' | ');

  const openingHoursKm = normalizedRows
    .map((row) => {
      const preset = getPresetForDaysEn(row.daysEn);
      const dayLabelKm = row.daysKm.trim() || preset?.km || row.daysEn.trim();
      const openLabelKm = formatTime12hKm(row.openTime);
      const closeLabelKm = formatTime12hKm(row.closeTime);
      return dayLabelKm ? `${dayLabelKm}៖ ${openLabelKm} - ${closeLabelKm}` : `${openLabelKm} - ${closeLabelKm}`;
    })
    .join(' | ');

  return {
    openingDays,
    openingDaysKm,
    openingTime,
    closingTime,
    openingHours,
    openingHoursKm,
  };
}

export function formatPublicBranchSchedules({
  closingTime,
  openingDays,
  openingHours,
  openingTime,
}: BranchHoursInput): PublicBranchScheduleItem[] {
  const days = clean(openingDays);
  const opens = clean(openingTime);
  const closes = clean(closingTime);

  if (days.includes('|') || opens.includes('|') || closes.includes('|')) {
    const daysParts = days ? days.split('|').map((part) => part.trim()) : [];
    const openParts = opens ? opens.split('|').map((part) => part.trim()) : [];
    const closeParts = closes ? closes.split('|').map((part) => part.trim()) : [];
    const count = Math.max(daysParts.length, openParts.length, closeParts.length);

    return Array.from({ length: count }, (_, index) => {
      const dayItem = daysParts[index] ?? '';
      const openItem = openParts[index] ?? openParts[0] ?? '';
      const closeItem = closeParts[index] ?? closeParts[0] ?? '';
      return {
        days: dayItem,
        time: openItem && closeItem ? `${openItem} – ${closeItem}` : openItem || closeItem,
      };
    }).filter((item) => Boolean(item.days || item.time));
  }

  const single = formatPublicBranchHours({ closingTime, openingDays, openingHours, openingTime });
  return single.days || single.time ? [single] : [];
}

/**
 * Structured days and times are the canonical public display. The localized
 * free-text value remains a fallback for older records that predate them.
 */
export function formatPublicBranchHours({
  closingTime,
  openingDays,
  openingHours,
  openingTime,
}: BranchHoursInput) {
  const days = clean(openingDays);
  const opens = clean(openingTime);
  const closes = clean(closingTime);

  if (days.includes('|') || opens.includes('|') || closes.includes('|')) {
    const schedules = formatPublicBranchSchedules({ closingTime, openingDays, openingHours, openingTime });
    if (schedules.length > 1) {
      return {
        days: '',
        time: schedules
          .map((item) => (item.days && item.time ? `${item.days}: ${item.time}` : item.days || item.time))
          .filter(Boolean)
          .join(' • '),
      };
    }
    if (schedules[0]) {
      return schedules[0];
    }
  }

  if (opens && closes) {
    return { days, time: `${opens} – ${closes}` };
  }

  const formatted = clean(openingHours);
  if (!days) return { days: '', time: formatted };
  if (!formatted) return { days, time: '' };

  const normalizedDays = days.toLocaleLowerCase().replaceAll(/\s+/g, ' ');
  const normalizedFormatted = formatted.toLocaleLowerCase().replaceAll(/\s+/g, ' ');
  if (normalizedFormatted.startsWith(normalizedDays)) {
    return { days, time: formatted.slice(days.length).replace(/^[:៖\s-]+/, '') };
  }

  const dayPrefixMatch = formatted.match(/^[^0-9០-៩]+[:៖\s-]\s*([0-9០-៩].*)$/);
  if (dayPrefixMatch?.[1]) {
    return { days, time: dayPrefixMatch[1].trim() };
  }

  return { days, time: formatted };
}

export function getDaysOfWeekForSchedule(daysString: string): number[] {
  const cleanStr = clean(daysString);
  if (!cleanStr) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  const preset = getPresetForDays(cleanStr);
  if (preset) {
    const days = PRESET_DAYS_MAP[preset.value];
    if (days) return days;
  }

  const rangeMatch = cleanStr.match(/^([^\s–-]+)\s*(?:[-–—]|ទៅ|ដល់)\s*([^\s–-]+)$/i);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    const startIdx = DAY_TOKEN_TO_INDEX[rangeMatch[1].toLowerCase().trim()];
    const endIdx = DAY_TOKEN_TO_INDEX[rangeMatch[2].toLowerCase().trim()];
    if (startIdx !== undefined && endIdx !== undefined) {
      const days: number[] = [];
      let curr = startIdx;
      while (true) {
        days.push(curr);
        if (curr === endIdx) break;
        curr = (curr + 1) % 7;
      }
      return days;
    }
  }

  const singleIdx = DAY_TOKEN_TO_INDEX[cleanStr.toLowerCase()];
  if (singleIdx !== undefined) {
    return [singleIdx];
  }

  return [0, 1, 2, 3, 4, 5, 6];
}

export function getDayOfWeekForDateKey(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return 0;
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.getUTCDay();
}

export type BranchDailySchedule = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  dayIndex: number;
  dayName: string;
  formattedHours: string;
};

export function getBranchScheduleForDate(
  branch: BranchHoursInput | undefined,
  dateKey?: string,
  language: 'en' | 'km' = 'en',
): BranchDailySchedule {
  const isKm = language === 'km';
  const effectiveDateKey = dateKey || '2026-10-02';
  const dayIndex = getDayOfWeekForDateKey(effectiveDateKey);
  const dayName = isKm ? (DAY_NAMES_KM[dayIndex] ?? '') : (DAY_NAMES_EN[dayIndex] ?? '');

  if (!branch) {
    return {
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
      dayIndex,
      dayName,
      formattedHours: isKm ? '៨:០០ ព្រឹក - ៦:០០ ល្ងាច' : '8:00 AM – 6:00 PM',
    };
  }

  const rows = parseBranchScheduleRows(branch);
  const hasConfiguredSchedule = Boolean(
    clean(branch.openingDays) || clean(branch.openingTime) || clean(branch.closingTime) || clean(branch.openingHours),
  );

  if (!hasConfiguredSchedule) {
    return {
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
      dayIndex,
      dayName,
      formattedHours: isKm ? '៨:០០ ព្រឹក - ៦:០០ ល្ងាច' : '8:00 AM – 6:00 PM',
    };
  }

  const matchingRow = rows.find((row) => {
    const daysEn = getDaysOfWeekForSchedule(row.daysEn);
    const daysKm = row.daysKm ? getDaysOfWeekForSchedule(row.daysKm) : [];
    return daysEn.includes(dayIndex) || daysKm.includes(dayIndex);
  });

  if (!matchingRow) {
    return {
      isOpen: false,
      openTime: '',
      closeTime: '',
      dayIndex,
      dayName,
      formattedHours: '',
    };
  }

  const openTime = matchingRow.openTime || '08:00';
  const closeTime = matchingRow.closeTime || '18:00';
  const formattedHours = isKm
    ? `${formatTime12hKm(openTime)} - ${formatTime12hKm(closeTime)}`
    : `${formatTime12hEn(openTime)} – ${formatTime12hEn(closeTime)}`;

  return {
    isOpen: true,
    openTime,
    closeTime,
    dayIndex,
    dayName,
    formattedHours,
  };
}

export function getNextOpenDateKey(branch: BranchHoursInput | undefined, fromDateKey: string): string {
  const [year, month, day] = fromDateKey.split('-').map(Number);
  if (!year || !month || !day) return fromDateKey;
  const current = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  for (let offset = 1; offset <= 14; offset++) {
    const nextDate = new Date(current);
    nextDate.setUTCDate(current.getUTCDate() + offset);
    const y = nextDate.getUTCFullYear();
    const m = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(nextDate.getUTCDate()).padStart(2, '0');
    const candidateKey = `${y}-${m}-${d}`;
    const schedule = getBranchScheduleForDate(branch, candidateKey);
    if (schedule.isOpen) {
      return candidateKey;
    }
  }
  return fromDateKey;
}

export function generateDynamicHoursAndSlots(openTime: string, closeTime: string): {
  baseHours: string[];
  isValidSlot: (slotTime: string) => boolean;
} {
  const parseMins = (hhmm: string): number | null => {
    const parts = hhmm.split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1] ?? '0');
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const openMins = parseMins(openTime) ?? 8 * 60;
  const closeMins = parseMins(closeTime) ?? 18 * 60;

  const isValidSlot = (slotTime: string): boolean => {
    const slotMins = parseMins(slotTime);
    if (slotMins === null) return false;
    return slotMins >= openMins && slotMins <= closeMins;
  };

  const startHour = Math.floor(openMins / 60);
  const endHour = Math.floor(closeMins / 60);
  const baseHours: string[] = [];

  for (let h = startHour; h <= endHour; h++) {
    const hourStr = String(h).padStart(2, '0');
    const hasAnySlot = ['00', '15', '30', '45'].some((min) => isValidSlot(`${hourStr}:${min}`));
    if (hasAnySlot) {
      baseHours.push(hourStr);
    }
  }

  return {
    baseHours: baseHours.length > 0 ? baseHours : ['08', '09', '10', '11', '13', '14', '15', '16'],
    isValidSlot,
  };
}
