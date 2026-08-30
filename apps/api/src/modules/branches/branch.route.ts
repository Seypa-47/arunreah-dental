import { Hono } from 'hono';
import { getPublicBranchController, listPublicBranchesController } from './branch.controller';
import type { AppEnv } from '../../types/env';

export const publicBranchesModule = new Hono<AppEnv>();

publicBranchesModule.get('/', listPublicBranchesController);
publicBranchesModule.get('/:slug', getPublicBranchController);
