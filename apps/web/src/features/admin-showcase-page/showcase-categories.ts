/**
 * Showcase categories. The English list is fixed; the Khmer label is free text
 * so the clinic can word it their way, and each English category carries a
 * suggested Khmer translation that the editors pre-fill.
 *
 * A showcase saved without a Khmer category falls back to the English one on
 * the public site, which is why the suggestion is offered rather than required.
 */
export const showcaseCategoryOptions = [
  'Treatment',
  'Smile Makeover',
  'Restorative Dentistry',
  'Cosmetic Dentistry',
  'Patient Education',
  'Clinic Experience',
  'Smile Care',
  'Technology',
] as const;

const khmerByCategory: Record<string, string> = {
  'Clinic Experience': 'បទពិសោធន៍នៅគ្លីនិក',
  'Cosmetic Dentistry': 'ទន្តសាស្ត្រសម្ផស្ស',
  'Patient Education': 'ការអប់រំអ្នកជំងឺ',
  'Restorative Dentistry': 'ទន្តសាស្ត្រស្ដារឡើងវិញ',
  'Smile Care': 'ការថែទាំស្នាមញញឹម',
  'Smile Makeover': 'ការកែសម្ផស្សស្នាមញញឹម',
  Technology: 'បច្ចេកវិទ្យា',
  Treatment: 'ការព្យាបាល',
};

/** The Khmer wording offered for an English category, or '' when there is none. */
export function suggestedKhmerCategory(categoryEn: string | null | undefined): string {
  return khmerByCategory[(categoryEn ?? '').trim()] ?? '';
}

/**
 * Keeps the Khmer field in step with the English one without overwriting the
 * clinic's own wording: it only replaces an empty value or the suggestion that
 * the previous English category had put there.
 */
export function nextKhmerCategory(currentKm: string, previousEn: string, nextEn: string): string {
  const trimmed = currentKm.trim();
  if (trimmed === '' || trimmed === suggestedKhmerCategory(previousEn)) return suggestedKhmerCategory(nextEn);
  return currentKm;
}
