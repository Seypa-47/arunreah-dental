import { relations } from 'drizzle-orm';
import { adminSessions, admins } from './admins';
import { appointments } from './appointments';
import { branches } from './branches';
import {
  doctorEducation,
  doctorExpertise,
  doctorRelatedDoctors,
  doctors,
} from './doctors';
import {
  serviceBenefits,
  serviceRelatedServices,
  services,
} from './services';
import { showcaseRelated, showcaseSections, showcases } from './showcases';

export const adminsRelations = relations(admins, ({ many }) => ({
  sessions: many(adminSessions),
  appointmentStatusUpdates: many(appointments),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  admin: one(admins, {
    fields: [adminSessions.adminId],
    references: [admins.id],
  }),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  appointments: many(appointments),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  benefits: many(serviceBenefits),
  relatedServices: many(serviceRelatedServices, { relationName: 'relatedServiceSource' }),
  relatedToServices: many(serviceRelatedServices, { relationName: 'relatedServiceTarget' }),
  appointments: many(appointments),
}));

export const serviceBenefitsRelations = relations(serviceBenefits, ({ one }) => ({
  service: one(services, {
    fields: [serviceBenefits.serviceId],
    references: [services.id],
  }),
}));

export const serviceRelatedServicesRelations = relations(serviceRelatedServices, ({ one }) => ({
  service: one(services, {
    fields: [serviceRelatedServices.serviceId],
    references: [services.id],
    relationName: 'relatedServiceSource',
  }),
  relatedService: one(services, {
    fields: [serviceRelatedServices.relatedServiceId],
    references: [services.id],
    relationName: 'relatedServiceTarget',
  }),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  expertise: many(doctorExpertise),
  education: many(doctorEducation),
  relatedDoctors: many(doctorRelatedDoctors, { relationName: 'relatedDoctorSource' }),
  relatedToDoctors: many(doctorRelatedDoctors, { relationName: 'relatedDoctorTarget' }),
  appointments: many(appointments),
}));

export const doctorExpertiseRelations = relations(doctorExpertise, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorExpertise.doctorId],
    references: [doctors.id],
  }),
}));

export const doctorEducationRelations = relations(doctorEducation, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorEducation.doctorId],
    references: [doctors.id],
  }),
}));

export const doctorRelatedDoctorsRelations = relations(doctorRelatedDoctors, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorRelatedDoctors.doctorId],
    references: [doctors.id],
    relationName: 'relatedDoctorSource',
  }),
  relatedDoctor: one(doctors, {
    fields: [doctorRelatedDoctors.relatedDoctorId],
    references: [doctors.id],
    relationName: 'relatedDoctorTarget',
  }),
}));

export const showcasesRelations = relations(showcases, ({ many }) => ({
  sections: many(showcaseSections),
  relatedShowcases: many(showcaseRelated, { relationName: 'relatedShowcaseSource' }),
  relatedToShowcases: many(showcaseRelated, { relationName: 'relatedShowcaseTarget' }),
}));

export const showcaseSectionsRelations = relations(showcaseSections, ({ one }) => ({
  showcase: one(showcases, {
    fields: [showcaseSections.showcaseId],
    references: [showcases.id],
  }),
}));

export const showcaseRelatedRelations = relations(showcaseRelated, ({ one }) => ({
  showcase: one(showcases, {
    fields: [showcaseRelated.showcaseId],
    references: [showcases.id],
    relationName: 'relatedShowcaseSource',
  }),
  relatedShowcase: one(showcases, {
    fields: [showcaseRelated.relatedShowcaseId],
    references: [showcases.id],
    relationName: 'relatedShowcaseTarget',
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
  branch: one(branches, {
    fields: [appointments.branchId],
    references: [branches.id],
  }),
  statusUpdatedByAdmin: one(admins, {
    fields: [appointments.statusUpdatedByAdminId],
    references: [admins.id],
  }),
}));
