import { describe, expect, it } from 'vitest';
import type { DatabaseClient } from '../src/db/client';
import { serviceDetailSections, showcaseSections } from '../src/db/schema';
import { isMediaKeyReferenced } from '../src/repositories/media.repository';

function createFakeDatabase(referencedTable: unknown = null): DatabaseClient {
  return {
    select: () => ({
      from: (table: unknown) => ({
        where: () => ({
          limit: async () => (table === referencedTable ? [{ id: 'row-1' }] : []),
        }),
      }),
    }),
  } as unknown as DatabaseClient;
}

describe('isMediaKeyReferenced', () => {
  it('returns false when no CMS table references the key', async () => {
    await expect(
      isMediaKeyReferenced(createFakeDatabase(), 'unused/key.jpg'),
    ).resolves.toBe(false);
  });

  it('detects a key still referenced by a service detail section image', async () => {
    await expect(
      isMediaKeyReferenced(createFakeDatabase(serviceDetailSections), 'services/detail.jpg'),
    ).resolves.toBe(true);
  });

  it('detects a key still referenced by a showcase section image', async () => {
    await expect(
      isMediaKeyReferenced(createFakeDatabase(showcaseSections), 'showcases/section.jpg'),
    ).resolves.toBe(true);
  });
});
