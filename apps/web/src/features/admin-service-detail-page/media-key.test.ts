import { describe, expect, it } from 'vitest';
import { optionalMediaKeySchema } from '@arunreah/shared';
import { toMediaKey } from './media-key';

describe('toMediaKey', () => {
  it('preserves clean media keys matching category and format', () => {
    const key = 'services/077de4d8-d6c2-4c2f-b78d-e0a5a842cda9-routine-cleaning.png';
    const parsed = toMediaKey(key);
    expect(parsed).toBe(key);
    expect(optionalMediaKeySchema.safeParse(parsed).success).toBe(true);
  });

  it('extracts relative media key from full public R2 URLs', () => {
    const fullUrl = 'https://pub-0dae1b4d79d0465fa30f0366829841b4.r2.dev/services/077de4d8-d6c2-4c2f-b78d-e0a5a842cda9-routine-cleaning.png';
    const parsed = toMediaKey(fullUrl);
    expect(parsed).toBe('services/077de4d8-d6c2-4c2f-b78d-e0a5a842cda9-routine-cleaning.png');
    expect(optionalMediaKeySchema.safeParse(parsed).success).toBe(true);
  });

  it('extracts media keys from URLs with query strings or hashes', () => {
    const url = 'https://example.com/doctors/dr-kimly.webp?v=123#preview';
    const parsed = toMediaKey(url);
    expect(parsed).toBe('doctors/dr-kimly.webp');
    expect(optionalMediaKeySchema.safeParse(parsed).success).toBe(true);
  });

  it('returns null for local or dummy asset paths', () => {
    expect(toMediaKey('/assets/landing/service-veneer.png')).toBeNull();
    expect(toMediaKey('/assets/landing/service-implant.png')).toBeNull();
    expect(toMediaKey('./relative/path.png')).toBeNull();
  });

  it('returns null for null, undefined, empty, or whitespace strings', () => {
    expect(toMediaKey(null)).toBeNull();
    expect(toMediaKey(undefined)).toBeNull();
    expect(toMediaKey('')).toBeNull();
    expect(toMediaKey('   ')).toBeNull();
  });

  it('returns null for unsupported categories or invalid extensions', () => {
    expect(toMediaKey('random/image.png')).toBeNull();
    expect(toMediaKey('services/image.gif')).toBeNull();
    expect(toMediaKey('https://example.com/other/test.png')).toBeNull();
  });
});
