import {
  adminDoctorListQuerySchema,
  createDoctorSchema,
  publicDoctorQuerySchema,
  successResponse,
  updateDoctorSchema,
} from '@arunreah/shared';
import type { Context } from 'hono';
import { createDbClient } from '../../db/client';
import { parseRequestBody, parseRequestQuery } from '../../shared/request';
import { HttpError } from '../../shared/http-error';
import * as doctor from '../../services/doctor.service';
import type { AppEnv } from '../../types/env';

export async function listPublicDoctorsController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, publicDoctorQuerySchema);
  const doctors = await doctor.getPublicDoctorList(createDbClient(context.env.DB), query.lang);
  context.header('Cache-Control', 'public, max-age=300');
  return context.json(successResponse({ doctors }));
}

export async function getPublicDoctorController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, publicDoctorQuerySchema);
  const slug = context.req.param('slug');
  if (!slug) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  const doctorDetail = await doctor.getPublicDoctor(
    createDbClient(context.env.DB),
    slug,
    query.lang,
  );
  context.header('Cache-Control', 'public, max-age=300');
  return context.json(successResponse({ doctor: doctorDetail }));
}

export async function listAdminDoctorsController(context: Context<AppEnv>) {
  const query = parseRequestQuery(context, adminDoctorListQuerySchema);
  const result = await doctor.getAdminDoctorList(createDbClient(context.env.DB), query);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(result));
}

export async function createAdminDoctorController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, createDoctorSchema);
  const doctorDetail = await doctor.createManagedDoctor(createDbClient(context.env.DB), input);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ doctor: doctorDetail }), 201);
}

export async function getAdminDoctorController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  const doctorDetail = await doctor.getAdminDoctor(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ doctor: doctorDetail }));
}

export async function updateAdminDoctorController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  const input = await parseRequestBody(context, updateDoctorSchema);
  const doctorDetail = await doctor.updateManagedDoctor(createDbClient(context.env.DB), id, input);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ doctor: doctorDetail }));
}

export async function deleteAdminDoctorController(context: Context<AppEnv>) {
  const id = context.req.param('id');
  if (!id) throw new HttpError(404, 'NOT_FOUND', 'Doctor not found.');
  await doctor.deleteManagedDoctor(createDbClient(context.env.DB), id);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ deleted: true }));
}
