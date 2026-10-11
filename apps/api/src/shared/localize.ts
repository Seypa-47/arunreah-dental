/**
 * CMS fields may legitimately be optional.  Public Khmer responses fall back
 * to English when Khmer copy is absent, so an incomplete translation does not
 * create an empty UI element.
 */
export function localize(en: string | null, km: string | null, language: 'en' | 'km') {
  if (language === 'km' && km?.trim()) return km;
  return en;
}
