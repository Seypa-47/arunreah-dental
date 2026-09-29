export const DEFAULT_BRANCH_COORDINATES = { lat: 11.5451917, lng: 104.9179822 }; // Toul Tompoung (TTP - 159 St 113)

export const PSA_CHAS_COORDINATES = { lat: 11.5728199, lng: 104.924974 }; // Psa Chas (#111Eo, Street 110)

export const TOUL_TOMPOUNG_SATELLITE_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d244.31827136575225!2d104.918029!3d11.5452334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310951002ff4c16b%3A0x75bebcec6663c775!2z4Z6Y4Z6T4Z-S4Z6R4Z644Z6a4Z6W4Z-S4Z6Z4Z624Z6U4Z624Z6b4Z6Y4Z624Z6P4Z-L4Z6S4Z-S4Z6Y4Z-B4Z6JIOGeouGemuGeu-GejuGemuGfhy3hnpHhnr3hnpvhnpHhn4bhnpbhnrzhnoQgQXJ1bnJlYWggRGVudGFsIENsaW5pYy1UVFA!5e1!3m2!1sen!2skh';

export const PSA_CHAS_SATELLITE_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d300!2d104.924974!3d11.5728199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31095145b07774a7%3A0x4de3ff1bed8dd2ea!2sArunreah+Dental+clinic!5e1!3m2!1sen!2skh';

export function isPsaChasBranch(nameOrSlug?: string | null): boolean {
  if (!nameOrSlug) return false;
  const normalized = nameOrSlug.toLowerCase();
  return (
    normalized.includes('chas') ||
    normalized.includes('ផ្សារចាស់') ||
    normalized.includes('old market') ||
    normalized.includes('phsar')
  );
}

export function getBranchCoordinates(nameOrSlug?: string | null): { lat: number; lng: number } {
  if (isPsaChasBranch(nameOrSlug)) {
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

  const coords =
    typeof options.lat === 'number' && typeof options.lng === 'number'
      ? { lat: options.lat, lng: options.lng }
      : getBranchCoordinates(nameOrSlug);

  const trimmedKey = apiKey?.trim();
  if (trimmedKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(trimmedKey)}&q=${coords.lat},${coords.lng}&maptype=satellite&zoom=${zoom}`;
  }

  if (
    isPsaChasBranch(nameOrSlug) ||
    (Math.abs(coords.lat - PSA_CHAS_COORDINATES.lat) < 0.001 &&
      Math.abs(coords.lng - PSA_CHAS_COORDINATES.lng) < 0.001)
  ) {
    return PSA_CHAS_SATELLITE_EMBED_URL;
  }

  if (
    !nameOrSlug ||
    !isPsaChasBranch(nameOrSlug) ||
    (Math.abs(coords.lat - DEFAULT_BRANCH_COORDINATES.lat) < 0.001 &&
      Math.abs(coords.lng - DEFAULT_BRANCH_COORDINATES.lng) < 0.001)
  ) {
    if (
      Math.abs(coords.lat - DEFAULT_BRANCH_COORDINATES.lat) < 0.001 &&
      Math.abs(coords.lng - DEFAULT_BRANCH_COORDINATES.lng) < 0.001
    ) {
      return TOUL_TOMPOUNG_SATELLITE_EMBED_URL;
    }
  }

  return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
}

