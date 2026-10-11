import {
  adminBranchListQuerySchema,
  createBranchSchema,
  publicBranchQuerySchema,
  successResponse,
  updateBranchSchema,
  slugPathParamSchema,
  uuidPathParamSchema,
} from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { parseRequestBody, parseRequestParams, parseRequestQuery } from '../../shared/request';
import {
  createManagedBranch,
  deleteManagedBranch,
  getAdminBranch,
  getAdminBranchList,
  getPublicBranch,
  getPublicBranchList,
  updateManagedBranch,
} from '../../services/branch.service';
import type { AppEnv } from '../../types/env';
import { applyPublicCmsCache } from '../../shared/public-cache';

export async function listPublicBranchesController(context: Context<AppEnv>) {
  const { lang, scope } = parseRequestQuery(context, publicBranchQuerySchema);
  const branches = await getPublicBranchList(createDbClient(context.env.DB), lang, scope);
  applyPublicCmsCache(context);
  return context.json(successResponse({ branches }));
}

export async function getPublicBranchController(context: Context<AppEnv>) {
  const { lang } = parseRequestQuery(context, publicBranchQuerySchema);
  const { slug } = parseRequestParams(context, slugPathParamSchema);
  const branch = await getPublicBranch(createDbClient(context.env.DB), slug, lang);
  applyPublicCmsCache(context);
  return context.json(successResponse({ branch }));
}

export async function listAdminBranchesController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, adminBranchListQuerySchema);
  const result = await getAdminBranchList(createDbClient(context.env.DB), query);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(result));
}

export async function getAdminBranchController(context: Context<AppEnv>) {
  const { id } = parseRequestParams(context, uuidPathParamSchema);
  const branch = await getAdminBranch(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ branch }));
}

export async function createAdminBranchController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, createBranchSchema);
  const branch = await createManagedBranch(createDbClient(context.env.DB), input);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ branch }), 201);
}

export async function updateAdminBranchController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, updateBranchSchema);
  const { id } = parseRequestParams(context, uuidPathParamSchema);
  const branch = await updateManagedBranch(createDbClient(context.env.DB), id, input);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ branch }));
}

export async function deleteAdminBranchController(context: Context<AppEnv>) {
  const { id } = parseRequestParams(context, uuidPathParamSchema);
  await deleteManagedBranch(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ deleted: true }));
}
