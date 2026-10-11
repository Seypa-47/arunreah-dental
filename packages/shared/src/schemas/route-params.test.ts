import { describe, expect, it } from 'vitest';
import { slugPathParamSchema, uuidPathParamSchema } from './route-params';

describe('route parameter schemas', () => {
  it('accepts canonical UUID identifiers and rejects malformed identifiers', () => {
    expect(
      uuidPathParamSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' }).success,
    ).toBe(true);
    expect(uuidPathParamSchema.safeParse({ id: 'branch-1' }).success).toBe(false);
    expect(uuidPathParamSchema.safeParse({ id: '../branch' }).success).toBe(false);
  });

  it('accepts lowercase URL slugs and rejects ambiguous or unsafe values', () => {
    expect(slugPathParamSchema.safeParse({ slug: 'dental-implants' }).success).toBe(true);
    expect(slugPathParamSchema.safeParse({ slug: 'Dental-Implants' }).success).toBe(false);
    expect(slugPathParamSchema.safeParse({ slug: 'dental implants' }).success).toBe(false);
    expect(slugPathParamSchema.safeParse({ slug: '../dental-implants' }).success).toBe(false);
  });
});
