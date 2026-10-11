import { describe, expect, it } from 'vitest';
import { formatFullDate, formatMonthYear, formatShortDate, formatWeekdayShort } from './public-dates';
import { publicUiCopy } from './public-ui-copy';

const thursday = new Date(2026, 8, 24);

describe('public date formatting', () => {
  // Browsers built without Khmer locale data silently format km-KH as English,
  // which is why these names are spelled out instead of delegating to Intl.
  it('formats Khmer dates without depending on the browser locale data', () => {
    expect(formatMonthYear(thursday, 'km')).toBe('កញ្ញា 2026');
    expect(formatWeekdayShort(thursday, 'km')).toBe('ព្រ');
    expect(formatFullDate(thursday, 'km')).toBe('ថ្ងៃព្រហស្បតិ៍ ទី24 ខែកញ្ញា ឆ្នាំ2026');
    expect(formatShortDate(thursday, 'km')).toBe('24 កញ្ញា 2026');
  });

  it('keeps the English formats unchanged', () => {
    expect(formatMonthYear(thursday, 'en')).toBe('September 2026');
    expect(formatWeekdayShort(thursday, 'en')).toBe('Thu');
    expect(formatFullDate(thursday, 'en')).toBe('Thursday, September 24, 2026');
    expect(formatShortDate(thursday, 'en')).toBe('Sep 24, 2026');
  });
});

describe('publicUiCopy', () => {
  it('returns Khmer interface copy for km and English for en', () => {
    expect(publicUiCopy('km').showcases.readMore).toBe('អានស្នាដៃ');
    expect(publicUiCopy('en').showcases.readMore).toBe('Read showcase');
    expect(publicUiCopy('km').common.retry).toBe('ព្យាយាមម្ដងទៀត');
  });

  it('has no English text left in the Khmer copy', () => {
    const khmerValues = JSON.stringify(publicUiCopy('km'));
    // Latin letters would mean a string was never translated.
    const untranslated = khmerValues.match(/"[^"]*[A-Za-z]{4}[^"]*"/g) ?? [];
    expect(untranslated.filter((value) => !/^"[a-zA-Z]+"$/.test(value))).toEqual([]);
  });
});
