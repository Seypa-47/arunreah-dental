import { describe, expect, it, vi } from 'vitest';
import type { DatabaseClient } from '../src/db/client';
import { isMediaDeletionConflict } from '../src/middleware/error-handler';
import { createMediaDeletionLock } from '../src/repositories/media.repository';
import { runBoundedMaintenance } from '../src/services/maintenance.service';

const maintenance = vi.hoisted(() => ({
  authentication: vi.fn(),
  appointments: vi.fn(),
  media: vi.fn(),
  passwordResets: vi.fn(),
}));

vi.mock('../src/repositories/session.repository', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/repositories/session.repository')>()),
  cleanupExpiredAuthenticationRecords: maintenance.authentication,
}));
vi.mock('../src/repositories/appointment.repository', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/repositories/appointment.repository')>()),
  cleanupExpiredAppointmentRateLimits: maintenance.appointments,
}));
vi.mock('../src/repositories/media.repository', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/repositories/media.repository')>()),
  cleanupStaleMediaDeletionLocks: maintenance.media,
}));
vi.mock('../src/repositories/password-reset.repository', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/repositories/password-reset.repository')>()),
  cleanupExpiredPasswordResetTokens: maintenance.passwordResets,
}));

describe('production-readiness safeguards', () => {
  it('maps only the stable media deletion sentinel to a conflict', () => {
    expect(isMediaDeletionConflict(new Error('D1: MEDIA_DELETION_IN_PROGRESS'))).toBe(true);
    expect(isMediaDeletionConflict(new Error('media deletion in progress'))).toBe(false);
    expect(isMediaDeletionConflict(new Error('unrelated database failure'))).toBe(false);
  });

  it('allows the atomic lock query to reclaim an expired lock', async () => {
    const get = vi.fn().mockResolvedValue({ key: 'services/example.jpg' });
    const database = {
      get,
    } as unknown as DatabaseClient;

    await expect(createMediaDeletionLock(database, 'services/example.jpg')).resolves.toBe(true);
    expect(get).toHaveBeenCalledOnce();
    const query = get.mock.calls[0]?.[0] as { queryChunks?: unknown[] };
    expect(JSON.stringify(query.queryChunks)).toContain('ON CONFLICT');
    expect(JSON.stringify(query.queryChunks)).toContain('media_deletion_locks.created_at');
  });

  it('uses bounded retention cutoffs for every cleanup category', async () => {
    maintenance.authentication.mockResolvedValue(undefined);
    maintenance.appointments.mockResolvedValue(undefined);
    maintenance.media.mockResolvedValue(undefined);
    maintenance.passwordResets.mockResolvedValue(undefined);
    const now = new Date('2026-10-11T12:00:00.000Z');

    await runBoundedMaintenance({} as DatabaseClient, now);

    expect(maintenance.authentication).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        now: now.toISOString(),
        inactiveRateLimitCutoff: '2026-10-11T11:45:00.000Z',
        revokedSessionCutoff: '2026-10-04T12:00:00.000Z',
        limit: 100,
      }),
    );
    expect(maintenance.appointments).toHaveBeenCalledWith(
      expect.anything(),
      '2026-10-11T11:45:00.000Z',
      100,
    );
    expect(maintenance.passwordResets).toHaveBeenCalledWith(
      expect.anything(),
      now.toISOString(),
      '2026-10-10T12:00:00.000Z',
      100,
    );
    expect(maintenance.media).toHaveBeenCalledWith(
      expect.anything(),
      '2026-10-11T11:55:00.000Z',
      100,
    );
  });
});
