import { createAdminSchema, successResponse, updateAdminSchema } from '@arunreah/shared';
import { Hono } from 'hono';
import { createDbClient } from '../../db/client';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import { listAdmins } from '../../repositories/admin.repository';
import { toSafeAdmin } from '../../shared/admin';
import { parseRequestBody } from '../../shared/request';
import { createManagedAdmin, updateManagedAdmin } from '../../services/admin.service';
import type { AppEnv } from '../../types/env';

export const adminsModule = new Hono<AppEnv>();

adminsModule.use('*', requireAdmin, requirePermission('ADMIN_MANAGEMENT'));

adminsModule.get('/', async (context) => {
  const database = createDbClient(context.env.DB);
  const admins = await listAdmins(database);

  return context.json(successResponse({ admins: admins.map(toSafeAdmin) }));
});

adminsModule.post('/', async (context) => {
  const input = await parseRequestBody(context, createAdminSchema);
  const admin = await createManagedAdmin(createDbClient(context.env.DB), input);

  return context.json(successResponse({ admin }), 201);
});

adminsModule.patch('/:id', async (context) => {
  const input = await parseRequestBody(context, updateAdminSchema);
  const admin = await updateManagedAdmin(
    createDbClient(context.env.DB),
    context.get('authenticatedAdmin').id,
    context.req.param('id'),
    input,
  );

  return context.json(successResponse({ admin }));
});
