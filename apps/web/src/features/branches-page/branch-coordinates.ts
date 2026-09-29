export const DEFAULT_BRANCH_COORDINATES = { lat: 11.5451917, lng: 104.9179822 }; // Toul Tompoung (TTP - 159 St 113)

export const PSA_CHAS_COORDINATES = { lat: 11.5728199, lng: 104.924974 }; // Psa Chas (#111Eo, Street 110)

export const TOUL_TOMPOUNG_GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/6HenBVpmvf4PiWwv6';

export const PSA_CHAS_GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/sxiKakoGPZEMzciB9';

export const TOUL_TOMPOUNG_SATELLITE_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d244.31827136575225!2d104.9179822!3d11.5451917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310951002ff4c16b%3A0x75bebcec6663c775!2z4Z6Y4Z6T4Z-S4Z6R4Z644Z6a4Z6W4Z-S4Z6Z4Z624Z6U4Z624Z6b4Z6Y4Z624Z6P4Z-L4Z6S4Z-S4Z6Y4Z-B4Z6JIOGeouGemuGeu-GejuGemuGfhy3hnpHhnr3hnpvhnpHhn4bhnpbhnrzhnoQgQXJ1bnJlYWggRGVudGFsIENsaW5pYy1UVFA!5e1!3m2!1sen!2skh';

export const PSA_CHAS_SATELLITE_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d244.31827136575225!2d104.924974!3d11.5728199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31095145b07774a7%3A0x4de3ff1bed8dd2ea!2sArunreah+Dental+clinic!5e1!3m2!1sen!2skh';

export function isPsaChasBranch(nameOrSlug?: string | null, googleMapsUrl?: string | null): boolean {
  const combined = `${nameOrSlug ?? ''} ${googleMapsUrl ?? ''}`.toLowerCase();
  if (!combined.trim()) return false;
  return (
    combined.includes('chas') ||
    combined.includes('ផ្សារចាស់') ||
    combined.includes('old market') ||
    combined.includes('phsar') ||
    combined.includes('sxikakogpzemzcib9') ||
    combined.includes('0x4de3ff1bed8dd2ea') ||
    combined.includes('m5gvtmwpzyydhm2v5') ||
    combined.includes('111eo') ||
    combined.includes('street 110') ||
    combined.includes('ផ្លូវលេខ 110') ||
    combined.includes('ផ្លូវលេខ ១១០')
  );
}

export function extractCoordinatesFromGoogleMapsUrl(
  googleMapsUrl?: string | null,
): { lat: number; lng: number } | null {
  if (!googleMapsUrl) return null;
  const trimmed = googleMapsUrl.trim();
  if (!trimmed) return null;

  const placePinMatch = trimmed.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (placePinMatch) {
    const lat = Number(placePinMatch[1]);
    const lng = Number(placePinMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = Number(atMatch[1]);
    const lng = Number(atMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  const queryMatch = trimmed.match(/[?&](?:q|ll|query)=(-?\d+\.\d+)(?:,|%2C|\+)(-?\d+\.\d+)/i);
  if (queryMatch) {
    const lat = Number(queryMatch[1]);
    const lng = Number(queryMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  return null;
}

export function getBranchDefaultMapUrl(nameOrSlug?: string | null, googleMapsUrl?: string | null): string {
  const trimmed = googleMapsUrl?.trim();
  if (trimmed && trimmed !== '#') return trimmed;
  return isPsaChasBranch(nameOrSlug, googleMapsUrl)
    ? PSA_CHAS_GOOGLE_MAPS_URL
    : TOUL_TOMPOUNG_GOOGLE_MAPS_URL;
}

export function getBranchCoordinates(
  nameOrSlug?: string | null,
  googleMapsUrl?: string | null,
): { lat: number; lng: number } {
  const extracted = extractCoordinatesFromGoogleMapsUrl(googleMapsUrl);
  if (extracted) return extracted;
  if (isPsaChasBranch(nameOrSlug, googleMapsUrl)) {
    return PSA_CHAS_COORDINATES;
  }
  return DEFAULT_BRANCH_COORDINATES;
}

export function getBranchSatelliteEmbedUrl(options: {
  apiKey?: string | null;
  googleMapsUrl?: string | null;
  lat?: number;
  lng?: number;
  nameOrSlug?: string | null;
  zoom?: number;
}): string {
  const { apiKey, googleMapsUrl, nameOrSlug, zoom = 18 } = options;
  const trimmedEmbedUrl = googleMapsUrl?.trim();
  if (trimmedEmbedUrl && trimmedEmbedUrl.startsWith('https://www.google.com/maps/embed')) {
    return trimmedEmbedUrl;
  }

  const extractedCoords = extractCoordinatesFromGoogleMapsUrl(googleMapsUrl);
  const coords =
    extractedCoords ??
    (typeof options.lat === 'number' && typeof options.lng === 'number'
      ? { lat: options.lat, lng: options.lng }
      : getBranchCoordinates(nameOrSlug, googleMapsUrl));

  const trimmedKey = apiKey?.trim();
  if (trimmedKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(trimmedKey)}&q=${coords.lat},${coords.lng}&maptype=satellite&zoom=${zoom}`;
  }

  if (
    isPsaChasBranch(nameOrSlug, googleMapsUrl) &&
    Math.abs(coords.lat - PSA_CHAS_COORDINATES.lat) < 0.002 &&
    Math.abs(coords.lng - PSA_CHAS_COORDINATES.lng) < 0.002
  ) {
    return PSA_CHAS_SATELLITE_EMBED_URL;
  }

  if (
    Math.abs(coords.lat - PSA_CHAS_COORDINATES.lat) < 0.001 &&
    Math.abs(coords.lng - PSA_CHAS_COORDINATES.lng) < 0.001
  ) {
    return PSA_CHAS_SATELLITE_EMBED_URL;
  }

  if (
    Math.abs(coords.lat - DEFAULT_BRANCH_COORDINATES.lat) < 0.002 &&
    Math.abs(coords.lng - DEFAULT_BRANCH_COORDINATES.lng) < 0.002
  ) {
    return TOUL_TOMPOUNG_SATELLITE_EMBED_URL;
  }

  return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
}


