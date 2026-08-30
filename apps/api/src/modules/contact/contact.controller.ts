import { successResponse, updateContactSettingsSchema } from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { parseRequestBody } from '../../shared/request';
import {
  getAdminContactSettings,
  getPublicContactSettings,
  saveContactSettings,
} from '../../services/contact-settings.service';
import type { AppEnv } from '../../types/env';

export async function getPublicContactController(context: Context<AppEnv>) {
  const contact = await getPublicContactSettings(createDbClient(context.env.DB));
  return context.json(successResponse({ contact }));
}

export async function getAdminContactController(context: Context<AppEnv>) {
  const contact = await getAdminContactSettings(createDbClient(context.env.DB));
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ contact }));
}

export async function updateAdminContactController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, updateContactSettingsSchema);
  const contact = await saveContactSettings(createDbClient(context.env.DB), input);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ contact }));
}
