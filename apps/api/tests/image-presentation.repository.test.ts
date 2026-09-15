import { describe, expect, it, vi } from 'vitest';
import type { DatabaseClient } from '../src/db/client';
import { imagePresentations } from '../src/db/schema/image-presentations';
import {
  listForOwners,
  listForPageMedia,
  removeForPageMedia,
  upsertForPageMedia,
} from '../src/repositories/image-presentation.repository';

describe('image-presentation repository', () => {
  it('supports typed owner and slot lookups beyond page media', async () => {
    const rows = [{ ownerType: 'SERVICE', ownerId: 'service-1', slot: 'HERO' }];
    const where = vi.fn(async () => rows);
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    const db = { select } as unknown as DatabaseClient;

    await expect(listForOwners(db, [{ ownerType: 'SERVICE', ownerId: 'service-1', slot: 'HERO' }])).resolves.toEqual(rows);
    expect(from).toHaveBeenCalledWith(imagePresentations);
  });
  it('returns an empty list without querying when no owner ids are given', async () => {
    const select = vi.fn();
    const db = { select } as unknown as DatabaseClient;

    await expect(listForPageMedia(db, [])).resolves.toEqual([]);
    expect(select).not.toHaveBeenCalled();
  });

  it('queries presentations scoped to PAGE_MEDIA/PRIMARY for the given owner ids', async () => {
    const rows = [{ ownerId: 'page-1', positionX: 10, positionY: 20, zoom: 1.5 }];
    const where = vi.fn(async () => rows);
    const from = vi.fn(() => ({ where }));
    const select = vi.fn(() => ({ from }));
    const db = { select } as unknown as DatabaseClient;

    await expect(listForPageMedia(db, ['page-1'])).resolves.toEqual(rows);
    expect(from).toHaveBeenCalledWith(imagePresentations);
  });

  it('upserts a presentation keyed by owner type/id/slot', async () => {
    const onConflictDoUpdate = vi.fn(async () => undefined);
    const values = vi.fn(() => ({ onConflictDoUpdate }));
    const insert = vi.fn(() => ({ values }));
    const db = { insert } as unknown as DatabaseClient;

    await upsertForPageMedia(db, 'page-1', { positionX: 10, positionY: 20, zoom: 1.5 });

    expect(insert).toHaveBeenCalledWith(imagePresentations);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: 'PAGE_MEDIA',
        ownerId: 'page-1',
        slot: 'PRIMARY',
        positionX: 10,
        positionY: 20,
        zoom: 1.5,
      }),
    );
    expect(onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        target: [imagePresentations.ownerType, imagePresentations.ownerId, imagePresentations.slot],
        set: expect.objectContaining({ positionX: 10, positionY: 20, zoom: 1.5 }),
      }),
    );
  });

  it('removes a presentation scoped to PAGE_MEDIA/PRIMARY for the given owner id', async () => {
    const where = vi.fn(async () => undefined);
    const del = vi.fn(() => ({ where }));
    const db = { delete: del } as unknown as DatabaseClient;

    await removeForPageMedia(db, 'page-1');

    expect(del).toHaveBeenCalledWith(imagePresentations);
    expect(where).toHaveBeenCalled();
  });
});
