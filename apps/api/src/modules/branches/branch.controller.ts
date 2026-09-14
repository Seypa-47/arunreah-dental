import {
  adminBranchListQuerySchema,
  createBranchSchema,
  publicBranchQuerySchema,
  successResponse,
  updateBranchSchema,
} from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { parseRequestBody, parseRequestQuery } from '../../shared/request';
import { HttpError } from '../../shared/http-error';
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

export async function listPublicBranchesController(context: Context<AppEnv>) {
  const { lang } = parseRequestQuery(context, publicBranchQuerySchema);
  const branches = await getPublicBranchList(createDbClient(context.env.DB), lang);
  context.header('Cache-Control', 'public, max-age=300');
  return context.json(successResponse({ branches }));
}

export async function getPublicBranchController(context: Context<AppEnv>) {
  const { lang } = parseRequestQuery(context, publicBranchQuerySchema);
  const slug = context.req.param('slug');
  if (!slug) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');
  const branch = await getPublicBranch(
    createDbClient(context.env.DB),
    slug,
    lang,
  );
  context.header('Cache-Control', 'public, max-age=300');
  return context.json(successResponse({ branch }));
}

export async function listAdminBranchesController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, adminBranchListQuerySchema);
  const result = await getAdminBranchList(createDbClient(context.env.DB), query);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(result));
}

export async function getAdminBranchController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');
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
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');
  const branch = await updateManagedBranch(
    createDbClient(context.env.DB),
    id,
    input,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ branch }));
}

export async function deleteAdminBranchController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Branch not found.');
  await deleteManagedBranch(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ deleted: true }));
}
