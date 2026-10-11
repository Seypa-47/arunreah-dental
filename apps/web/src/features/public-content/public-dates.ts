import type { PublicLanguage } from '@/services/public-content';

/**
 * Date formatting for the public site.
 *
 * `Intl.DateTimeFormat('km-KH')` cannot be trusted: browsers built without the
 * Khmer locale fall back to English without reporting it, which left Khmer
 * visitors reading "September 2026" in the booking calendar. Khmer names are
 * therefore spelled out here, so the language the visitor picked is the one
 * they get on every browser. English keeps using Intl.
 */

const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const khmerWeekdays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const khmerWeekdaysShort = ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស'];

const isKm = (language: PublicLanguage) => language === 'km';

/** "កញ្ញា 2026" / "September 2026" — the calendar's month heading. */
export function formatMonthYear(date: Date, language: PublicLanguage) {
  if (isKm(language)) return `${khmerMonths[date.getMonth()]} ${date.getFullYear()}`;
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

/** "ព្រ" / "Thu" — the calendar's weekday column headings. */
export function formatWeekdayShort(date: Date, language: PublicLanguage) {
  if (isKm(language)) return khmerWeekdaysShort[date.getDay()] ?? '';
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

/** "ថ្ងៃព្រហស្បតិ៍ ទី24 ខែកញ្ញា ឆ្នាំ2026" / "Thursday, September 24, 2026". */
export function formatFullDate(date: Date, language: PublicLanguage) {
  if (isKm(language)) {
    return `ថ្ងៃ${khmerWeekdays[date.getDay()]} ទី${date.getDate()} ខែ${khmerMonths[date.getMonth()]} ឆ្នាំ${date.getFullYear()}`;
  }
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date);
}

/** "24 កញ្ញា 2026" / "Sep 24, 2026" — compact dates such as promotion end dates. */
export function formatShortDate(date: Date, language: PublicLanguage) {
  if (isKm(language)) return `${date.getDate()} ${khmerMonths[date.getMonth()]} ${date.getFullYear()}`;
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
