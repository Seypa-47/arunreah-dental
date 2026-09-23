import {
  adminAppointmentListQuerySchema,
  createPublicAppointmentSchema,
  errorResponse,
  successResponse,
  updateAppointmentStatusSchema,
} from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { createAppointmentRequestRateLimitKey } from '../../services/appointment-abuse.service';
import { createPublicAppointmentRequest } from '../../services/appointment.service';
import * as adminAppointment from '../../services/admin-appointment.service';
import { HttpError } from '../../shared/http-error';
import { parseRequestBody, parseRequestQuery } from '../../shared/request';
import type { AppEnv } from '../../types/env';

export async function createPublicAppointmentController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, createPublicAppointmentSchema);
  const database = createDbClient(context.env.DB);
  const rateLimitKey = await createAppointmentRequestRateLimitKey(context.req.raw.headers);

  const result = await createPublicAppointmentRequest(
    database,
    input,
    context.env.APP_ENV,
    context.env.TURNSTILE_SECRET_KEY,
    context.env,
    context.req.raw.headers,
    rateLimitKey,
  );
  context.header('Cache-Control', 'no-store');
  return context.json(successResponse(result.appointment), result.created ? 201 : 200);
}

export async function listAdminAppointmentsController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, adminAppointmentListQuerySchema);
  const result = await adminAppointment.getAdminAppointmentList(
    createDbClient(context.env.DB),
    query,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(result));
}

export async function getAdminAppointmentController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Appointment not found.');
  const appointment = await adminAppointment.getAdminAppointmentDetail(
    createDbClient(context.env.DB),
    id,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ appointment }));
}

export async function updateAdminAppointmentStatusController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Appointment not found.');
  const input = await parseRequestBody(context, updateAppointmentStatusSchema);
  const admin = context.get('authenticatedAdmin');
  if (!admin) throw new HttpError(401, 'UNAUTHORIZED', 'Authentication is required.');
  const appointment = await adminAppointment.changeAppointmentStatus(
    createDbClient(context.env.DB),
    id,
    input,
    admin.id,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ appointment }));
}

export async function getAdminTelegramStatusController(context: Context<AppEnv>) {
  const enabled = context.env.TELEGRAM_NOTIFICATIONS_ENABLED === 'true';
  const configuredChatId = context.env.TELEGRAM_CHAT_ID;
  const botToken = context.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return context.json(
      successResponse({
        enabled,
        configuredChatId,
        botConfigured: false,
        message: 'TELEGRAM_BOT_TOKEN is not configured.',
      }),
    );
  }

  let botInfo: unknown = null;
  const recentChats: Array<{ id: number | string; title?: string; type: string; username?: string }> = [];

  try {
    const meRes = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/getMe`, {
      signal: AbortSignal.timeout(5000),
    });
    if (meRes.ok) {
      const data = (await meRes.json()) as { result?: unknown };
      botInfo = data.result;
    }

    const updatesRes = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(botToken)}/getUpdates?limit=20`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (updatesRes.ok) {
      const data = (await updatesRes.json()) as {
        result?: Array<{
          message?: { chat?: { id: number; title?: string; type: string; username?: string } };
          my_chat_member?: { chat?: { id: number; title?: string; type: string } };
        }>;
      };
      if (Array.isArray(data.result)) {
        const seen = new Set<number>();
        for (const update of data.result) {
          const chat = update.message?.chat ?? update.my_chat_member?.chat;
          if (chat && !seen.has(chat.id)) {
            seen.add(chat.id);
            recentChats.push(chat);
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to query Telegram API:', error);
  }

  context.header('Cache-Control', 'private, no-store');
  return context.json(
    successResponse({
      enabled,
      configuredChatId,
      botInfo,
      recentChats,
      isGroupConfigured: Boolean(
        configuredChatId && (configuredChatId.startsWith('-') || configuredChatId.startsWith('@')),
      ),
    }),
  );
}

export async function testAdminTelegramNotificationController(context: Context<AppEnv>) {
  const botToken = context.env.TELEGRAM_BOT_TOKEN;
  const chatId = context.req.query('chatId') || context.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Bot token or Chat ID is not configured.');
  }

  const text = '🔔 Arunreah Dental Clinic — Test notification to Telegram group. Group notifications are active!';
  const response = await fetch(
    `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
      }),
      signal: AbortSignal.timeout(5000),
    },
  );

  const responseBody = await response.text();
  context.header('Cache-Control', 'private, no-store');
  if (!response.ok) {
    return context.json(
      errorResponse('INTERNAL_ERROR', `Telegram API returned ${response.status}: ${responseBody}`),
      400,
    );
  }

  return context.json(
    successResponse({
      sent: true,
      chatId,
      telegramResponse: JSON.parse(responseBody),
    }),
  );
}
