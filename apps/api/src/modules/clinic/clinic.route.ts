import { Hono } from 'hono';
import { getPublicClinicController } from './clinic.controller';
import type { AppEnv } from '../../types/env';

export const publicClinicModule = new Hono<AppEnv>();

publicClinicModule.get('/', getPublicClinicController);
