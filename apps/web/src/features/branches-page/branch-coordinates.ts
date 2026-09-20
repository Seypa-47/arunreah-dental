export const DEFAULT_BRANCH_COORDINATES = { lat: 11.53982, lng: 104.91421 }; // Toul Tompoung (TTP)

export const PSA_CHAS_COORDINATES = { lat: 11.57351, lng: 104.92552 }; // Psa Chas (Old Market)

export function getBranchCoordinates(nameOrSlug?: string | null): { lat: number; lng: number } {
  if (!nameOrSlug) return DEFAULT_BRANCH_COORDINATES;
  const normalized = nameOrSlug.toLowerCase();
  if (
    normalized.includes('chas') ||
    normalized.includes('ផ្សារចាស់') ||
    normalized.includes('old market') ||
    normalized.includes('phsar')
  ) {
    return PSA_CHAS_COORDINATES;
  }
  return DEFAULT_BRANCH_COORDINATES;
}
