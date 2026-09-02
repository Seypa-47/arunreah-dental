import { Hono } from 'hono';
import { errorResponse } from '@arunreah/shared';
import { corsMiddleware } from './middleware/cors';
import { globalErrorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { privateResponse } from './middleware/private-response';
import { requireTrustedOrigin } from './middleware/request-origin';
import { securityHeaders } from './middleware/security-headers';
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
import { adminDoctorsModule, publicDoctorsModule } from './modules/doctors/doctor.route';
import { adminShowcasesModule, publicShowcasesModule } from './modules/showcases/showcase.route';
import { adminMediaModule } from './modules/media/media.route';
import { adminDashboardModule } from './modules/dashboard/dashboard.route';
import {
  adminAppointmentsModule,
  publicAppointmentsModule,
} from './modules/appointments/appointment.route';
import type { AppEnv } from './types/env';

export const app = new Hono<AppEnv>();

app.use('*', requestLogger);
app.use('*', securityHeaders);
app.use('*', corsMiddleware);
app.use('/api/auth/*', privateResponse);
app.use('/api/admin/*', privateResponse);
app.use('/api/auth/login', requireTrustedOrigin);
app.use('/api/auth/logout', requireTrustedOrigin);
app.use('/api/admin/*', requireTrustedOrigin);

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
app.route('/api/admin/doctors', adminDoctorsModule);
app.route('/api/public/doctors', publicDoctorsModule);
app.route('/api/admin/showcases', adminShowcasesModule);
app.route('/api/admin/media', adminMediaModule);
app.route('/api/admin/dashboard', adminDashboardModule);
app.route('/api/public/appointments', publicAppointmentsModule);
app.route('/api/admin/appointments', adminAppointmentsModule);
app.route('/api/public/showcases', publicShowcasesModule);

app.notFound((context) => {
  return context.json(errorResponse('NOT_FOUND', 'The requested resource was not found.'), 404);
});

app.onError(globalErrorHandler);
