-- LOCAL DEVELOPMENT EXAMPLES ONLY.
-- These three fictional team members are examples to be replaced with approved
-- clinic staff and content. Never run this seed against staging or production.

INSERT INTO doctors (
  id, slug, status, featured, display_order,
  name_en, name_km, role_en, role_km,
  specialty_en, specialty_km, short_bio_en, short_bio_km,
  biography_en, biography_km, photo_key,
  years_experience, successful_procedures, patient_satisfaction, phone,
  category, bookable, department_en, department_km, team_note_en, team_note_km,
  created_at, updated_at
) VALUES
(
  'f1000000-0000-4000-8000-000000000001',
  'example-general-practitioner',
  'PUBLISHED', 0, 0,
  'Example General Practitioner', 'គំរូគ្រូពេទ្យទូទៅ',
  'General Practitioner', 'គ្រូពេទ្យទូទៅ',
  NULL, NULL,
  'Supports patients with general health reviews before and after dental care.',
  'ជួយអ្នកជំងឺពិនិត្យសុខភាពទូទៅ មុន និងក្រោយការព្យាបាលធ្មេញ។',
  'Provides general medical assessment, reviews relevant health history, and coordinates with the dental team when treatment needs wider medical support.',
  'ផ្តល់ការពិនិត្យសុខភាពទូទៅ ពិនិត្យប្រវត្តិសុខភាពដែលពាក់ព័ន្ធ និងសម្របសម្រួលជាមួយក្រុមទន្តសាស្ត្រ នៅពេលការព្យាបាលត្រូវការការគាំទ្រផ្នែកវេជ្ជសាស្ត្របន្ថែម។',
  NULL, NULL, NULL, NULL, NULL,
  'GENERAL_PRACTITIONER', 1, NULL, NULL, NULL, NULL,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'f1000000-0000-4000-8000-000000000002',
  'example-receptionist',
  'PUBLISHED', 0, 0,
  'Example Receptionist', 'គំរូបុគ្គលិកទទួលភ្ញៀវ',
  'Patient Services Coordinator', 'អ្នកសម្របសម្រួលសេវាអ្នកជំងឺ',
  NULL, NULL,
  'Welcomes patients, coordinates appointment requests, and answers practical questions.',
  'ស្វាគមន៍អ្នកជំងឺ សម្របសម្រួលសំណើការណាត់ជួប និងឆ្លើយសំណួរទូទៅ។',
  'Helps each visit begin smoothly by confirming request details, sharing clinic information, and guiding patients to the right team member.',
  'ជួយឱ្យការមកគ្លីនិកចាប់ផ្តើមដោយរលូន តាមរយៈការផ្ទៀងផ្ទាត់ព័ត៌មានសំណើ ផ្តល់ព័ត៌មានគ្លីនិក និងណែនាំអ្នកជំងឺទៅកាន់សមាជិកក្រុមដែលសមស្រប។',
  NULL, NULL, NULL, NULL, NULL,
  'RECEPTIONIST', 0, NULL, NULL, NULL, NULL,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'f1000000-0000-4000-8000-000000000003',
  'example-dental-assistant',
  'PUBLISHED', 0, 0,
  'Example Dental Assistant', 'គំរូជំនួយការទន្តសាស្ត្រ',
  'Dental Assistant', 'ជំនួយការទន្តសាស្ត្រ',
  NULL, NULL,
  'Prepares treatment areas and supports patients and clinicians throughout each visit.',
  'រៀបចំកន្លែងព្យាបាល និងជួយអ្នកជំងឺ និងគ្រូពេទ្យពេញមួយដំណើរការព្យាបាល។',
  'Supports safe, comfortable care by preparing rooms and instruments, assisting chairside, and following the clinic hygiene process.',
  'គាំទ្រការថែទាំប្រកបដោយសុវត្ថិភាព និងផាសុខភាព តាមរយៈការរៀបចំបន្ទប់ និងឧបករណ៍ ជួយក្បែរកៅអីព្យាបាល និងអនុវត្តតាមនីតិវិធីអនាម័យរបស់គ្លីនិក។',
  NULL, NULL, NULL, NULL, NULL,
  'ASSISTANT', 0,
  'Clinical Support', 'ផ្នែកជំនួយគ្លីនិក',
  'Works alongside the clinical team to help each appointment run safely and smoothly.',
  'ធ្វើការជាមួយក្រុមគ្លីនិក ដើម្បីជួយឱ្យការណាត់ជួបនីមួយៗប្រព្រឹត្តទៅដោយសុវត្ថិភាព និងរលូន។',
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  status = excluded.status,
  featured = excluded.featured,
  display_order = excluded.display_order,
  name_en = excluded.name_en,
  name_km = excluded.name_km,
  role_en = excluded.role_en,
  role_km = excluded.role_km,
  specialty_en = excluded.specialty_en,
  specialty_km = excluded.specialty_km,
  short_bio_en = excluded.short_bio_en,
  short_bio_km = excluded.short_bio_km,
  biography_en = excluded.biography_en,
  biography_km = excluded.biography_km,
  photo_key = excluded.photo_key,
  years_experience = excluded.years_experience,
  successful_procedures = excluded.successful_procedures,
  patient_satisfaction = excluded.patient_satisfaction,
  phone = excluded.phone,
  category = excluded.category,
  bookable = excluded.bookable,
  department_en = excluded.department_en,
  department_km = excluded.department_km,
  team_note_en = excluded.team_note_en,
  team_note_km = excluded.team_note_km,
  updated_at = CURRENT_TIMESTAMP;
--> statement-breakpoint

DELETE FROM doctor_expertise
WHERE doctor_id = 'f1000000-0000-4000-8000-000000000001';
--> statement-breakpoint
INSERT INTO doctor_expertise (
  id, doctor_id, name_en, name_km, display_order, created_at, updated_at
) VALUES
  ('f1100000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 'Pre-treatment health review', 'ការពិនិត្យសុខភាពមុនព្យាបាល', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f1100000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000001', 'General medical follow-up', 'ការតាមដានសុខភាពទូទៅ', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint

DELETE FROM doctor_education
WHERE doctor_id = 'f1000000-0000-4000-8000-000000000001';
--> statement-breakpoint
INSERT INTO doctor_education (
  id, doctor_id, degree_en, degree_km, institution_en, institution_km,
  year_label, display_order, created_at, updated_at
) VALUES (
  'f1200000-0000-4000-8000-000000000001',
  'f1000000-0000-4000-8000-000000000001',
  'Doctor of Medicine', 'វេជ្ជបណ្ឌិតវេជ្ជសាស្ត្រ',
  'Example Medical University', 'សាកលវិទ្យាល័យវេជ្ជសាស្ត្រគំរូ',
  NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
--> statement-breakpoint

DELETE FROM doctor_profile_items
WHERE doctor_id IN (
  'f1000000-0000-4000-8000-000000000001',
  'f1000000-0000-4000-8000-000000000002',
  'f1000000-0000-4000-8000-000000000003'
);
--> statement-breakpoint
INSERT INTO doctor_profile_items (
  id, doctor_id, kind, icon, title_en, title_km,
  subtitle_en, subtitle_km, meta, display_order, created_at, updated_at
) VALUES
  ('f1300000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 'EXPERIENCE', NULL, 'Primary care practice', 'ការងារថែទាំសុខភាពបឋម', 'Community clinic', 'គ្លីនិកសហគមន៍', 'Example experience', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f1300000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000002', 'RESPONSIBILITY', 'welcome', 'Patient welcome', 'ស្វាគមន៍អ្នកជំងឺ', 'Greets patients and helps them understand the next step in their visit.', 'ស្វាគមន៍អ្នកជំងឺ និងជួយពន្យល់អំពីជំហានបន្ទាប់នៃការមកគ្លីនិក។', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f1300000-0000-4000-8000-000000000003', 'f1000000-0000-4000-8000-000000000002', 'RESPONSIBILITY', 'appointments', 'Appointment requests', 'សំណើការណាត់ជួប', 'Records appointment preferences and coordinates follow-up from the clinic.', 'កត់ត្រាជម្រើសការណាត់ជួប និងសម្របសម្រួលការឆ្លើយតបពីគ្លីនិក។', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f1300000-0000-4000-8000-000000000004', 'f1000000-0000-4000-8000-000000000002', 'LANGUAGE', NULL, 'Khmer', 'ភាសាខ្មែរ', NULL, NULL, NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f1300000-0000-4000-8000-000000000005', 'f1000000-0000-4000-8000-000000000002', 'LANGUAGE', NULL, 'English', 'ភាសាអង់គ្លេស', NULL, NULL, NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f1300000-0000-4000-8000-000000000006', 'f1000000-0000-4000-8000-000000000003', 'RESPONSIBILITY', 'equipment', 'Treatment preparation', 'ការរៀបចំការព្យាបាល', 'Prepares the room and required instruments before care begins.', 'រៀបចំបន្ទប់ និងឧបករណ៍ចាំបាច់ មុនពេលចាប់ផ្តើមការព្យាបាល។', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f1300000-0000-4000-8000-000000000007', 'f1000000-0000-4000-8000-000000000003', 'RESPONSIBILITY', 'comfort', 'Patient comfort', 'ផាសុខភាពអ្នកជំងឺ', 'Supports patient comfort and communication during treatment.', 'ជួយរក្សាផាសុខភាព និងការទំនាក់ទំនងជាមួយអ្នកជំងឺក្នុងពេលព្យាបាល។', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('f1300000-0000-4000-8000-000000000008', 'f1000000-0000-4000-8000-000000000003', 'TRAINING', NULL, 'Infection prevention', 'ការការពារការឆ្លងមេរោគ', 'Clinic hygiene and instrument handling programme', 'កម្មវិធីអនាម័យគ្លីនិក និងការគ្រប់គ្រងឧបករណ៍', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

