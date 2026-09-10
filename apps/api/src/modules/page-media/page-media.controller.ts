import { createPageMediaSchema, pageMediaPlacementSchema, pageMediaPublicQuerySchema, successResponse, updatePageMediaSchema } from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { parseRequestBody, parseRequestQuery } from '../../shared/request';
import { HttpError } from '../../shared/http-error';
import type { AppEnv } from '../../types/env';
import * as service from '../../services/page-media.service';
export async function listPublic(c: Context<AppEnv>) { const q = parseRequestQuery(c, pageMediaPublicQuerySchema); c.header('Cache-Control', 'public, max-age=300'); return c.json(successResponse(await service.listPublic(createDbClient(c.env.DB), q.placement, q.lang))); }
export async function listAdmin(c: Context<AppEnv>) { const placement = pageMediaPlacementSchema.parse(c.req.query('placement')); c.header('Cache-Control', 'private, no-store'); return c.json(successResponse(await service.listAdmin(createDbClient(c.env.DB), placement))); }
export async function create(c: Context<AppEnv>) { const item = await service.create(createDbClient(c.env.DB), await parseRequestBody(c, createPageMediaSchema)); return c.json(successResponse({ item }), 201); }
export async function update(c: Context<AppEnv>) { const id = c.req.param('id'); if (!id) throw new HttpError(404, 'NOT_FOUND', 'Page media was not found.'); return c.json(successResponse({ item: await service.update(createDbClient(c.env.DB), id, await parseRequestBody(c, updatePageMediaSchema)) })); }
export async function remove(c: Context<AppEnv>) { const id = c.req.param('id'); if (!id) throw new HttpError(404, 'NOT_FOUND', 'Page media was not found.'); await service.remove(createDbClient(c.env.DB), id); return c.json(successResponse({ deleted: true })); }
