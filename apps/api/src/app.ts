import { Hono } from 'hono';
import { errorResponse } from '@arunreah/shared';
import { corsMiddleware } from './middleware/cors';
import { globalErrorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { healthModule } from './modules/health/health.route';
import { adminsModule } from './modules/admins/admins.route';
import { authModule } from './modules/auth/auth.route';
import { adminClinicModule } from './modules/clinic/clinic-admin.route';
import { publicClinicModule } from './modules/clinic/clinic.route';
import { adminContactModule } from './modules/contact/contact-admin.route';
import { publicContactModule } from './modules/contact/contact.route';
import { adminBranchesModule } from './modules/branches/branch-admin.route';
import { publicBranchesModule } from './modules/branches/branch.route';
import { adminServicesModule, publicServicesModule } from './modules/services/service.route';
import type { AppEnv } from './types/env';

export const app = new Hono<AppEnv>();

app.use('*', requestLogger);
app.use('*', corsMiddleware);

app.route('/api/health', healthModule);
app.route('/api/auth', authModule);
app.route('/api/admin/admins', adminsModule);
app.route('/api/admin/clinic', adminClinicModule);
app.route('/api/public/clinic', publicClinicModule);
app.route('/api/admin/contact', adminContactModule);
app.route('/api/public/contact', publicContactModule);
app.route('/api/admin/branches', adminBranchesModule);
app.route('/api/public/branches', publicBranchesModule);
app.route('/api/admin/services', adminServicesModule);
app.route('/api/public/services', publicServicesModule);

app.notFound((context) => {
  return context.json(errorResponse('NOT_FOUND', 'The requested resource was not found.'), 404);
});

app.onError(globalErrorHandler);
