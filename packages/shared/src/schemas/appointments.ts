import { z } from 'zod';

export const appointmentStatusValues = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

export const appointmentStatusSchema = z.enum(appointmentStatusValues);

const cambodianPhone = z
  .string()
  .trim()
  .min(8)
  .max(32)
  .regex(/^[0-9+()\- ]+$/)
  .refine((value) => value.replace(/\D/g, '').length >= 8);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  });

export const createPublicAppointmentSchema = z
  .object({
    patientName: z.string().trim().min(2).max(160),
    phone: cambodianPhone.transform((value) => value.replace(/\s+/g, ' ').trim()),
    email: z.string().trim().email().max(320),
    serviceId: z.string().uuid(),
    doctorId: z.string().uuid().nullable().optional(),
    branchId: z.string().uuid(),
    preferredDate: isoDate,
    preferredTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    notes: z.string().trim().max(2_000).nullable().optional(),
    turnstileToken: z.string().trim().min(1).max(2_048).optional(),
    idempotencyKey: z.string().uuid(),
  })
  .strict();

export type CreatePublicAppointmentInput = z.infer<typeof createPublicAppointmentSchema>;
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

const appointmentListDate = isoDate.optional();

export const adminAppointmentListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(160).optional(),
    status: appointmentStatusSchema.optional(),
    serviceId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    fromDate: appointmentListDate,
    toDate: appointmentListDate,
    sort: z.enum(['createdAt', 'preferredDate', 'updatedAt', 'status']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.fromDate && value.toDate && value.fromDate > value.toDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['toDate'],
        message: 'toDate must be on or after fromDate.',
      });
    }
  });

export const updateAppointmentStatusSchema = z.object({ status: appointmentStatusSchema }).strict();

export type AdminAppointmentListQuery = z.infer<typeof adminAppointmentListQuerySchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
