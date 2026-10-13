import { publicSiteQuerySchema, successResponse } from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { applyPublicCmsCache } from '../../shared/public-cache';
import { parseRequestQuery } from '../../shared/request';
import { getPublicSiteSnapshot } from '../../services/public-site.service';
import type { AppEnv } from '../../types/env';

export async function getPublicSiteController(context: Context<AppEnv>) {
  const { lang } = parseRequestQuery(context, publicSiteQuerySchema);
  const site = await getPublicSiteSnapshot(createDbClient(context.env.DB), lang);
  applyPublicCmsCache(context);
  return context.json(successResponse({ site }));
}
