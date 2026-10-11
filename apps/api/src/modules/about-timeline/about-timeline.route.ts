import { Hono } from 'hono';
import { requireAdmin } from '../../middleware/require-admin';
import { requirePermission } from '../../middleware/require-permission';
import type { AppEnv } from '../../types/env';
import * as controller from './about-timeline.controller';

export const publicAboutTimelineModule = new Hono<AppEnv>();
export const adminAboutTimelineModule = new Hono<AppEnv>();
publicAboutTimelineModule.get('/', controller.listPublic);
adminAboutTimelineModule.use('*', requireAdmin, requirePermission('CMS_MANAGEMENT'));
adminAboutTimelineModule.get('/', controller.listAdmin);
adminAboutTimelineModule.post('/', controller.create);
adminAboutTimelineModule.patch('/:id', controller.update);
adminAboutTimelineModule.delete('/:id', controller.remove);
