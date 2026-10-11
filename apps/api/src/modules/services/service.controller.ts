import {
  createServiceSchema,
  serviceListQuerySchema,
  servicePublicQuerySchema,
  successResponse,
  updateServiceSchema,
  slugPathParamSchema,
  uuidPathParamSchema,
} from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { parseRequestBody, parseRequestParams, parseRequestQuery } from '../../shared/request';
import * as service from '../../services/service.service';
import type { AppEnv } from '../../types/env';
import { applyPublicCmsCache } from '../../shared/public-cache';

export async function listPublicServicesController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, servicePublicQuerySchema);
  const services = await service.getPublicServiceList(createDbClient(context.env.DB), query.lang);
  applyPublicCmsCache(context);
  return context.json(successResponse({ services }));
}

export async function getPublicServiceController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, servicePublicQuerySchema);
  const { slug } = parseRequestParams(context, slugPathParamSchema);
  const serviceDetail = await service.getPublicService(
    createDbClient(context.env.DB),
    slug,
    query.lang,
  );
  applyPublicCmsCache(context);
  return context.json(successResponse({ service: serviceDetail }));
}

export async function listAdminServicesController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, serviceListQuerySchema);
  const result = await service.getAdminServiceList(createDbClient(context.env.DB), query);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(result));
}

export async function createAdminServiceController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, createServiceSchema);
  const serviceDetail = await service.createManagedService(createDbClient(context.env.DB), input);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ service: serviceDetail }), 201);
}

export async function getAdminServiceController(context: Context<AppEnv>) {
  const { id } = parseRequestParams(context, uuidPathParamSchema);
  const serviceDetail = await service.getAdminService(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ service: serviceDetail }));
}

export async function updateAdminServiceController(context: Context<AppEnv>) {
  const { id } = parseRequestParams(context, uuidPathParamSchema);
  const input = await parseRequestBody(context, updateServiceSchema);
  const serviceDetail = await service.updateManagedService(
    createDbClient(context.env.DB),
    id,
    input,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ service: serviceDetail }));
}

export async function deleteAdminServiceController(context: Context<AppEnv>) {
  const { id } = parseRequestParams(context, uuidPathParamSchema);
  await service.deleteManagedService(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ deleted: true }));
}
