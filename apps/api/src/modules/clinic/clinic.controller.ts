import { successResponse } from '@arunreah/shared';
import { createDbClient } from '../../db/client';
import { parseRequestBody } from '../../shared/request';
import {
  getAdminClinicSettings,
  getPublicClinicSettings,
  saveClinicSettings,
} from '../../services/clinic-settings.service';
import { updateClinicSettingsSchema } from '@arunreah/shared';
import type { AppEnv } from '../../types/env';
import type { Context } from 'hono';

export async function getPublicClinicController(context: Context<AppEnv>) {
  const clinic = await getPublicClinicSettings(createDbClient(context.env.DB));
  return context.json(successResponse({ clinic }));
}

export async function getAdminClinicController(context: Context<AppEnv>) {
  const clinic = await getAdminClinicSettings(createDbClient(context.env.DB));
  return context.json(successResponse({ clinic }));
}

export async function updateAdminClinicController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, updateClinicSettingsSchema);
  const clinic = await saveClinicSettings(createDbClient(context.env.DB), input);
  return context.json(successResponse({ clinic }));
}
