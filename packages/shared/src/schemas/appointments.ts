import { z } from 'zod';

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
