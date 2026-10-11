import { errorResponse, rolesByPermission } from '@arunreah/shared';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { requirePermission } from '../src/middleware/require-permission';
import { HttpError } from '../src/shared/http-error';
import type { AppEnv } from '../src/types/env';

function createProtectedApp(role: 'RECEPTIONIST' | 'CMS_ADMIN' | 'SUPER_ADMIN') {
  const app = new Hono<AppEnv>();

  app.use('*', async (context, next) => {
    context.set('authenticatedAdmin', {
      id: 'admin-id',
      name: 'Test Admin',
      email: 'test@example.com',
      role,
    });
    context.set('authenticatedSessionId', 'session-id');
    await next();
  });

  app.get('/appointments', requirePermission('APPOINTMENT_MANAGEMENT'), (context) =>
    context.json({ ok: true }),
  );
  app.get('/cms', requirePermission('CMS_MANAGEMENT'), (context) => context.json({ ok: true }));
  app.get('/admins', requirePermission('ADMIN_MANAGEMENT'), (context) =>
    context.json({ ok: true }),
  );

  app.onError((error, context) => {
    if (error instanceof HttpError) {
      return context.json(errorResponse(error.code, error.message), error.status);
    }

    return context.text('Unexpected error', 500);
  });

  return app;
}

describe('RBAC permission mapping', () => {
  it('matches the agreed role-access matrix', () => {
    expect(rolesByPermission.APPOINTMENT_MANAGEMENT).toEqual(['RECEPTIONIST', 'SUPER_ADMIN']);
    expect(rolesByPermission.CMS_MANAGEMENT).toEqual(['CMS_ADMIN', 'SUPER_ADMIN']);
    expect(rolesByPermission.ADMIN_MANAGEMENT).toEqual(['SUPER_ADMIN']);
  });

  it('allows receptionist appointment access but blocks CMS and admin management', async () => {
    const app = createProtectedApp('RECEPTIONIST');

    expect((await app.request('http://localhost/appointments')).status).toBe(200);
    expect((await app.request('http://localhost/cms')).status).toBe(403);
    expect((await app.request('http://localhost/admins')).status).toBe(403);
  });

  it('allows CMS admin CMS access but blocks appointments and admin management', async () => {
    const app = createProtectedApp('CMS_ADMIN');

    expect((await app.request('http://localhost/appointments')).status).toBe(403);
    expect((await app.request('http://localhost/cms')).status).toBe(200);
    expect((await app.request('http://localhost/admins')).status).toBe(403);
  });

  it('allows super admin access to every permission group', async () => {
    const app = createProtectedApp('SUPER_ADMIN');

    expect((await app.request('http://localhost/appointments')).status).toBe(200);
    expect((await app.request('http://localhost/cms')).status).toBe(200);
    expect((await app.request('http://localhost/admins')).status).toBe(200);
  });
});
