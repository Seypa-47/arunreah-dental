import {
  adminShowcaseListQuerySchema,
  createShowcaseSchema,
  publicShowcaseQuerySchema,
  successResponse,
  updateShowcaseSchema,
} from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { parseRequestBody, parseRequestQuery } from '../../shared/request';
import { HttpError } from '../../shared/http-error';
import * as showcase from '../../services/showcase.service';
import type { AppEnv } from '../../types/env';

export async function listPublicShowcasesController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, publicShowcaseQuerySchema);
  const showcases = await showcase.getPublicShowcaseList(
    createDbClient(context.env.DB),
    query.lang,
    query.homepage,
  );
  context.header('Cache-Control', 'public, max-age=300');
  return context.json(successResponse({ showcases }));
}

export async function getPublicShowcaseController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, publicShowcaseQuerySchema);
  const slug = context.req.param('slug');
  if (!slug) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  const showcaseDetail = await showcase.getPublicShowcase(
    createDbClient(context.env.DB),
    slug,
    query.lang,
  );
  context.header('Cache-Control', 'public, max-age=300');
  return context.json(successResponse({ showcase: showcaseDetail }));
}

export async function listAdminShowcasesController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, adminShowcaseListQuerySchema);
  const result = await showcase.getAdminShowcaseList(createDbClient(context.env.DB), query);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(result));
}

export async function createAdminShowcaseController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, createShowcaseSchema);
  const showcaseDetail = await showcase.createManagedShowcase(
    createDbClient(context.env.DB),
    input,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ showcase: showcaseDetail }), 201);
}

export async function getAdminShowcaseController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  const showcaseDetail = await showcase.getAdminShowcase(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ showcase: showcaseDetail }));
}

export async function updateAdminShowcaseController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  const input = await parseRequestBody(context, updateShowcaseSchema);
  const showcaseDetail = await showcase.updateManagedShowcase(
    createDbClient(context.env.DB),
    id,
    input,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ showcase: showcaseDetail }));
}

export async function deleteAdminShowcaseController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Showcase not found.');
  await showcase.deleteManagedShowcase(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ deleted: true }));
}
