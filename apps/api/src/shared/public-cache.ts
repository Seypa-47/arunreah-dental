import type { Context } from 'hono';
import type { AppEnv } from '../types/env';

/**
 * Public CMS content is inexpensive to fetch but must reflect editor changes
 * promptly. A one-minute browser cache retains a small performance benefit
 * while `must-revalidate` prevents serving it once it is stale.
 */
export const publicCmsCacheControl = 'public, max-age=60, must-revalidate';

export function applyPublicCmsCache(context: Context<AppEnv>) {
  context.header('Cache-Control', publicCmsCacheControl);
}
