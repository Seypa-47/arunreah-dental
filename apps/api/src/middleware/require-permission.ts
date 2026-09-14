import { rolesByPermission } from '@arunreah/shared';
import type { Permission } from '@arunreah/shared';
import type { MiddlewareHandler } from 'hono';
import { HttpError } from '../shared/http-error';
import type { AppEnv } from '../types/env';

export function requirePermission(permission: Permission): MiddlewareHandler<AppEnv> {
  return async (context, next) => {
    const admin = context.get('authenticatedAdmin');

    if (!admin) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Authentication is required.');
    }

    if (!rolesByPermission[permission].includes(admin.role)) {
      throw new HttpError(403, 'FORBIDDEN', 'You do not have permission to perform this action.');
    }

    await next();
  };
}
