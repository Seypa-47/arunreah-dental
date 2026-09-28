type BranchHoursInput = {
  closingTime?: string | null;
  openingDays?: string | null;
  openingHours?: string | null;
  openingTime?: string | null;
};

const clean = (value?: string | null) => value?.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() ?? '';

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
