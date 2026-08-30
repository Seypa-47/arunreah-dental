import { Hono } from 'hono';
import { getPublicContactController } from './contact.controller';
import type { AppEnv } from '../../types/env';

export const publicContactModule = new Hono<AppEnv>();

publicContactModule.get('/', getPublicContactController);
