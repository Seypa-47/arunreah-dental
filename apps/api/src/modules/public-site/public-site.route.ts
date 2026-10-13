import { Hono } from 'hono';
import type { AppEnv } from '../../types/env';
import { getPublicSiteController } from './public-site.controller';

export const publicSiteModule = new Hono<AppEnv>();

publicSiteModule.get('/', getPublicSiteController);
