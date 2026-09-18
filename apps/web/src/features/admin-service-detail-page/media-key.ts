/**
 * Safe R2 object key extractor for service CMS payloads.
 * Strips full public URLs, protocol/origin prefixes, and rejects local/dummy asset paths,
 * ensuring values sent to the API strictly match optionalMediaKeySchema.
 */
export function toMediaKey(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('/') || trimmed.startsWith('.')) return null;
  const match = trimmed.match(
    /(?:^|https?:\/\/[^/]+\/)(clinic|branches|services|doctors|showcases)\/((?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|png|webp))(?=[?#]|$)/i,
  );
  if (!match) return null;
  const category = match[1];
  const relativePath = match[2];
  if (!category || !relativePath) return null;
  return `${category.toLowerCase()}/${relativePath.toLowerCase()}`;
}
