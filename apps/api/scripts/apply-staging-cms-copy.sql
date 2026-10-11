-- STAGING ONLY: reviewed bilingual CMS copy refresh.
-- Targets are exact IDs/slugs. This file must never be run against production.
-- New records use INSERT OR IGNORE so a repeated staging execution cannot create
-- duplicates. Existing records are refreshed by their exact UPDATE statements.
-- Wrangler's remote D1 file executor applies the upload atomically and does not
-- accept explicit BEGIN/COMMIT statements.

UPDATE clinic_settings
SET
  tagline_en = 'Thoughtful dental care for healthier, more confident smiles.',
  tagline_km = 'ការថែទាំធ្មេញដោយយកចិត្តទុកដាក់ សម្រាប់ស្នាមញញឹមមានសុខភាពល្អ និងទំនុកចិត្ត។',
  short_about_en = 'Arunreah Dental Clinic provides patient-focused dental care in Phnom Penh. Our team listens to your concerns, explains options clearly, and helps you plan the next step for your oral health.',
  short_about_km = 'គ្លីនិកធ្មេញ អរុណរះ ផ្តល់សេវាថែទាំធ្មេញដោយផ្តោតលើអ្នកជំងឺនៅរាជធានីភ្នំពេញ។ ក្រុមរបស់យើងស្តាប់កង្វល់របស់អ្នក ពន្យល់ជម្រើសឱ្យច្បាស់ និងជួយរៀបចំជំហានបន្ទាប់សម្រាប់សុខភាពមាត់របស់អ្នក។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'clinic';

UPDATE branches
SET
  badge_en = 'Phnom Penh clinic',
  badge_km = 'គ្លីនិកនៅរាជធានីភ្នំពេញ',
  short_location_label_en = 'Toul Tompoung, Phnom Penh',
  short_location_label_km = 'ទួលទំពូង រាជធានីភ្នំពេញ',
  hero_headline_en = 'Dental care close to home in Toul Tompoung',
  hero_headline_km = 'ការថែទាំធ្មេញនៅជិតអ្នក ក្នុងតំបន់ទួលទំពូង',
  hero_supporting_text_en = 'Visit our Toul Tompoung branch to discuss your dental concerns and request an appointment with our team.',
  hero_supporting_text_km = 'អញ្ជើញមកសាខាទួលទំពូង ដើម្បីពិភាក្សាអំពីកង្វល់ធ្មេញរបស់អ្នក និងស្នើសុំពេលជួបជាមួយក្រុមរបស់យើង។',
  hero_cta_label_en = 'Request an appointment',
  hero_cta_label_km = 'ស្នើសុំពេលជួប',
  short_summary_en = 'A welcoming Phnom Penh branch for consultations, routine dental care, and treatment planning.',
  short_summary_km = 'សាខាមួយនៅភ្នំពេញដែលស្វាគមន៍អ្នកសម្រាប់ការពិគ្រោះយោបល់ ការថែទាំធ្មេញជាប្រចាំ និងការរៀបចំផែនការព្យាបាល។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '40000000-0000-4000-8000-000000000001';

UPDATE branches
SET
  badge_en = 'Phnom Penh clinic',
  badge_km = 'គ្លីនិកនៅរាជធានីភ្នំពេញ',
  short_location_label_en = 'Near Old Market, Phnom Penh',
  short_location_label_km = 'ជិតផ្សារចាស់ រាជធានីភ្នំពេញ',
  hero_headline_en = 'Dental care in the heart of Psa Chas',
  hero_headline_km = 'ការថែទាំធ្មេញនៅកណ្ដាលតំបន់ផ្សារចាស់',
  hero_supporting_text_en = 'Visit our Psa Chas branch to share your concerns and discuss a suitable next step with our dental team.',
  hero_supporting_text_km = 'អញ្ជើញមកសាខាផ្សារចាស់ ដើម្បីប្រាប់កង្វល់របស់អ្នក និងពិភាក្សាជំហានបន្ទាប់ដែលសមស្របជាមួយក្រុមធ្មេញរបស់យើង។',
  hero_cta_label_en = 'Request an appointment',
  hero_cta_label_km = 'ស្នើសុំពេលជួប',
  short_summary_en = 'A convenient branch near Old Market for consultations, everyday dental care, and treatment planning.',
  short_summary_km = 'សាខាងាយស្រួលនៅជិតផ្សារចាស់ សម្រាប់ការពិគ្រោះយោបល់ ការថែទាំធ្មេញប្រចាំថ្ងៃ និងការរៀបចំផែនការព្យាបាល។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '40000000-0000-4000-8000-000000000002';

UPDATE services
SET
  summary_en = 'A carefully planned option for replacing missing teeth and restoring everyday function.',
  summary_km = 'ជម្រើសដែលរៀបចំផែនការយ៉ាងប្រុងប្រយ័ត្ន សម្រាប់ជំនួសធ្មេញដែលបាត់ និងស្តារមុខងារប្រចាំថ្ងៃ។',
  description_en = 'Dental implants use a small titanium post to support a replacement tooth or teeth. A consultation lets our team review your oral health and discuss whether implant treatment may be appropriate for you.',
  description_km = 'ការដាំធ្មេញប្រើដងទីតានីញ៉ូមតូចមួយ ដើម្បីទ្រទ្រង់ធ្មេញជំនួសមួយ ឬច្រើន។ ការពិគ្រោះយោបល់អនុញ្ញាតឱ្យក្រុមរបស់យើងពិនិត្យសុខភាពមាត់ និងពិភាក្សាថាតើការដាំធ្មេញអាចសមស្របសម្រាប់អ្នកឬទេ។',
  hero_eyebrow_en = 'Missing-tooth replacement', hero_eyebrow_km = 'ការជំនួសធ្មេញដែលបាត់',
  hero_title_en = 'Dental Implants', hero_title_km = 'ការដាំធ្មេញ',
  hero_summary_en = 'Explore a structured approach to replacing one or more missing teeth.',
  hero_summary_km = 'ស្វែងយល់ពីវិធីសាស្ត្ររៀបចំជាប្រព័ន្ធ សម្រាប់ជំនួសធ្មេញមួយ ឬច្រើនដែលបាត់។',
  about_title_en = 'Planning comes first', about_title_km = 'ការរៀបចំផែនការជាមុន',
  about_body_en = 'Your consultation considers oral health, bone support, bite, and the restoration you may need. Your clinician will explain the available options and the next steps clearly.',
  about_body_km = 'ការពិគ្រោះយោបល់របស់អ្នកពិចារណាសុខភាពមាត់ ការគាំទ្រឆ្អឹង ការខាំ និងការស្តារធ្មេញដែលអ្នកអាចត្រូវការ។ វេជ្ជបណ្ឌិតនឹងពន្យល់អំពីជម្រើស និងជំហានបន្ទាប់ឱ្យច្បាស់។',
  cta_title_en = 'Request an implant consultation', cta_title_km = 'ស្នើសុំការពិគ្រោះយោបល់អំពីការដាំធ្មេញ',
  cta_description_en = 'Send an appointment request to discuss your concerns and possible treatment options.', cta_description_km = 'ផ្ញើសំណើពេលជួប ដើម្បីពិភាក្សាកង្វល់ និងជម្រើសព្យាបាលដែលអាចមាន។',
  primary_cta_label_en = 'Request an appointment', primary_cta_label_km = 'ស្នើសុំពេលជួប',
  meta_title_en = 'Dental Implants in Phnom Penh | Arunreah Dental Clinic', meta_title_km = 'ការដាំធ្មេញនៅភ្នំពេញ | គ្លីនិកធ្មេញ អរុណរះ',
  meta_description_en = 'Learn how a dental implant consultation at Arunreah Dental Clinic can help you explore missing-tooth replacement options.', meta_description_km = 'ស្វែងយល់អំពីការពិគ្រោះយោបល់ដាំធ្មេញនៅគ្លីនិកធ្មេញ អរុណរះ សម្រាប់ជម្រើសជំនួសធ្មេញដែលបាត់។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '20000000-0000-4000-8000-000000000001';

UPDATE services
SET
  summary_en = 'Professional whitening options for people who want to address common tooth stains.',
  summary_km = 'ជម្រើសធ្វើឱ្យធ្មេញសដោយវិជ្ជាជីវៈ សម្រាប់អ្នកដែលចង់កាត់បន្ថយស្នាមប្រឡាក់ធ្មេញទូទៅ។',
  description_en = 'Teeth whitening may help improve the appearance of common surface stains. Your clinician can assess your teeth, discuss suitable options, and explain what to expect before treatment.',
  description_km = 'ការធ្វើឱ្យធ្មេញសអាចជួយកែលម្អរូបរាងស្នាមប្រឡាក់ទូទៅលើផ្ទៃធ្មេញ។ វេជ្ជបណ្ឌិតអាចពិនិត្យធ្មេញរបស់អ្នក ពិភាក្សាជម្រើសដែលសមស្រប និងពន្យល់អំពីអ្វីដែលត្រូវរំពឹងមុនព្យាបាល។',
  hero_eyebrow_en = 'Cosmetic dental care', hero_eyebrow_km = 'ការថែទាំធ្មេញផ្នែកសោភ័ណភាព',
  hero_summary_en = 'Discuss a whitening approach that suits your smile and oral-health needs.', hero_summary_km = 'ពិភាក្សាវិធីធ្វើឱ្យធ្មេញសដែលសមស្របនឹងស្នាមញញឹម និងតម្រូវការសុខភាពមាត់របស់អ្នក។',
  about_title_en = 'A considered approach to whitening', about_title_km = 'វិធីសាស្ត្រធ្វើឱ្យធ្មេញសដោយប្រុងប្រយ័ត្ន',
  about_body_en = 'A consultation helps identify the type of staining present and whether whitening is a suitable next step for you.', about_body_km = 'ការពិគ្រោះយោបល់ជួយកំណត់ប្រភេទស្នាមប្រឡាក់ និងថាតើការធ្វើឱ្យធ្មេញសជាជំហានបន្ទាប់ដែលសមស្របសម្រាប់អ្នកឬទេ។',
  cta_title_en = 'Talk with our team about whitening', cta_title_km = 'ពិភាក្សាជាមួយក្រុមរបស់យើងអំពីការធ្វើឱ្យធ្មេញស',
  cta_description_en = 'Send an appointment request to discuss your smile goals.', cta_description_km = 'ផ្ញើសំណើពេលជួប ដើម្បីពិភាក្សាអំពីគោលដៅស្នាមញញឹមរបស់អ្នក។',
  primary_cta_label_en = 'Request an appointment', primary_cta_label_km = 'ស្នើសុំពេលជួប',
  meta_title_en = 'Teeth Whitening in Phnom Penh | Arunreah Dental Clinic', meta_title_km = 'ការធ្វើឱ្យធ្មេញសនៅភ្នំពេញ | គ្លីនិកធ្មេញ អរុណរះ',
  meta_description_en = 'Discuss professional teeth whitening options with Arunreah Dental Clinic.', meta_description_km = 'ពិភាក្សាអំពីជម្រើសធ្វើឱ្យធ្មេញសដោយវិជ្ជាជីវៈជាមួយគ្លីនិកធ្មេញ អរុណរះ។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '20000000-0000-4000-8000-000000000002';

UPDATE services
SET
  summary_en = 'Professional cleaning and oral-health review to support healthy teeth and gums.',
  summary_km = 'ការសម្អាតធ្មេញ និងពិនិត្យសុខភាពមាត់ដោយវិជ្ជាជីវៈ ដើម្បីគាំទ្រធ្មេញ និងអញ្ចាញដែលមានសុខភាពល្អ។',
  description_en = 'Routine cleaning helps remove plaque and tartar while giving your clinician a chance to review your oral health and discuss daily care habits.',
  description_km = 'ការសម្អាតធ្មេញជាប្រចាំជួយកម្ចាត់កំណក និងថ្មធ្មេញ ព្រមទាំងផ្តល់ឱកាសឱ្យវេជ្ជបណ្ឌិតពិនិត្យសុខភាពមាត់ និងពិភាក្សាអំពីទម្លាប់ថែទាំប្រចាំថ្ងៃ។',
  hero_eyebrow_en = 'Preventive dental care', hero_eyebrow_km = 'ការថែទាំធ្មេញបង្ការ',
  hero_summary_en = 'Make regular oral-health care part of your routine.', hero_summary_km = 'ធ្វើឱ្យការថែទាំសុខភាពមាត់ជាប្រចាំក្លាយជាផ្នែកមួយនៃទម្លាប់របស់អ្នក។',
  about_title_en = 'Small visits can support long-term care', about_title_km = 'ការមកពិនិត្យតូចៗ អាចគាំទ្រការថែទាំរយៈពេលវែង',
  about_body_en = 'Regular visits give you time to raise questions, review your oral health, and receive practical advice for home care.', about_body_km = 'ការមកពិនិត្យជាប្រចាំផ្តល់ពេលឱ្យអ្នកសួរសំណួរ ពិនិត្យសុខភាពមាត់ និងទទួលបានការណែនាំអនុវត្តបានសម្រាប់ថែទាំនៅផ្ទះ។',
  cta_title_en = 'Plan your next cleaning visit', cta_title_km = 'រៀបចំពេលសម្អាតធ្មេញលើកក្រោយរបស់អ្នក',
  cta_description_en = 'Send an appointment request for a cleaning and oral-health review.', cta_description_km = 'ផ្ញើសំណើពេលជួបសម្រាប់សម្អាតធ្មេញ និងពិនិត្យសុខភាពមាត់។',
  primary_cta_label_en = 'Request an appointment', primary_cta_label_km = 'ស្នើសុំពេលជួប',
  meta_title_en = 'Routine Dental Cleaning | Arunreah Dental Clinic', meta_title_km = 'ការសម្អាតធ្មេញជាប្រចាំ | គ្លីនិកធ្មេញ អរុណរះ',
  meta_description_en = 'Request a professional dental cleaning and oral-health review at Arunreah Dental Clinic.', meta_description_km = 'ស្នើសុំពេលសម្អាតធ្មេញ និងពិនិត្យសុខភាពមាត់ដោយវិជ្ជាជីវៈនៅគ្លីនិកធ្មេញ អរុណរះ។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '20000000-0000-4000-8000-000000000003';

UPDATE services
SET
  summary_en = 'Personalized orthodontic planning for tooth alignment and bite concerns.',
  summary_km = 'ការរៀបចំផែនការកែតម្រូវធ្មេញផ្ទាល់ខ្លួន សម្រាប់បញ្ហាការតម្រឹមធ្មេញ និងការខាំ។',
  description_en = 'Orthodontic care addresses tooth alignment and bite concerns through a plan tailored to your needs. A consultation helps your clinician explain suitable options and the care involved.',
  description_km = 'ការថែទាំកែតម្រូវធ្មេញដោះស្រាយបញ្ហាការតម្រឹមធ្មេញ និងការខាំ តាមរយៈផែនការដែលសមស្របនឹងតម្រូវការរបស់អ្នក។ ការពិគ្រោះយោបល់ជួយឱ្យវេជ្ជបណ្ឌិតពន្យល់អំពីជម្រើស និងការថែទាំដែលពាក់ព័ន្ធ។',
  hero_eyebrow_en = 'Alignment and bite care', hero_eyebrow_km = 'ការថែទាំការតម្រឹម និងការខាំ',
  hero_summary_en = 'Understand your options for a more balanced smile and bite.', hero_summary_km = 'ស្វែងយល់ពីជម្រើសសម្រាប់ស្នាមញញឹម និងការខាំដែលមានតុល្យភាពជាងមុន។',
  about_title_en = 'Orthodontic care starts with assessment', about_title_km = 'ការកែតម្រូវធ្មេញចាប់ផ្តើមពីការពិនិត្យ',
  about_body_en = 'Your clinician will assess your alignment and bite, listen to your goals, and discuss the appropriate next steps.', about_body_km = 'វេជ្ជបណ្ឌិតនឹងពិនិត្យការតម្រឹម និងការខាំ ស្តាប់គោលដៅរបស់អ្នក ហើយពិភាក្សាអំពីជំហានបន្ទាប់ដែលសមស្រប។',
  cta_title_en = 'Discuss orthodontic care', cta_title_km = 'ពិភាក្សាអំពីការកែតម្រូវធ្មេញ',
  cta_description_en = 'Send an appointment request to discuss alignment or bite concerns.', cta_description_km = 'ផ្ញើសំណើពេលជួប ដើម្បីពិភាក្សាអំពីបញ្ហាការតម្រឹម ឬការខាំ។',
  primary_cta_label_en = 'Request an appointment', primary_cta_label_km = 'ស្នើសុំពេលជួប',
  meta_title_en = 'Orthodontics in Phnom Penh | Arunreah Dental Clinic', meta_title_km = 'ការកែតម្រូវធ្មេញនៅភ្នំពេញ | គ្លីនិកធ្មេញ អរុណរះ',
  meta_description_en = 'Explore orthodontic consultation and treatment-planning options at Arunreah Dental Clinic.', meta_description_km = 'ស្វែងយល់អំពីការពិគ្រោះយោបល់ និងការរៀបចំផែនការកែតម្រូវធ្មេញនៅគ្លីនិកធ្មេញ អរុណរះ។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '20000000-0000-4000-8000-000000000004';

INSERT OR IGNORE INTO services (id, slug, status, featured, display_order, name_en, name_km, summary_en, summary_km, category, description_en, description_km, hero_eyebrow_en, hero_eyebrow_km, hero_title_en, hero_title_km, hero_summary_en, hero_summary_km, about_title_en, about_title_km, about_body_en, about_body_km, cta_title_en, cta_title_km, cta_description_en, cta_description_km, primary_cta_label_en, primary_cta_label_km, meta_title_en, meta_title_km, meta_description_en, meta_description_km)
VALUES
('20000000-0000-4000-8000-000000000005', 'general-dentistry', 'PUBLISHED', 1, 50, 'General Dentistry', 'ទន្តសាស្ត្រទូទៅ', 'Everyday dental care, checkups, and practical guidance for your oral health.', 'ការថែទាំធ្មេញប្រចាំថ្ងៃ ការពិនិត្យធ្មេញ និងការណែនាំអនុវត្តបានសម្រាប់សុខភាពមាត់របស់អ្នក។', 'Preventive', 'General dentistry covers routine checkups, cleaning, and discussion of common dental concerns. Our team can help you understand your oral health and plan an appropriate next step.', 'ទន្តសាស្ត្រទូទៅរួមមានការពិនិត្យធ្មេញជាប្រចាំ ការសម្អាតធ្មេញ និងការពិភាក្សាអំពីបញ្ហាធ្មេញទូទៅ។ ក្រុមរបស់យើងអាចជួយអ្នកយល់ពីសុខភាពមាត់ និងរៀបចំជំហានបន្ទាប់ដែលសមស្រប។', 'Everyday oral health', 'សុខភាពមាត់ប្រចាំថ្ងៃ', 'General Dentistry', 'ទន្តសាស្ត្រទូទៅ', 'Start with a clear conversation about your teeth, gums, and oral-health goals.', 'ចាប់ផ្តើមដោយការពិភាក្សាច្បាស់លាស់អំពីធ្មេញ អញ្ចាញ និងគោលដៅសុខភាពមាត់របស់អ្នក។', 'Care that begins with listening', 'ការថែទាំដែលចាប់ផ្តើមពីការស្តាប់', 'A routine visit gives you time to ask questions, review your oral health, and receive guidance tailored to your needs.', 'ការមកពិនិត្យជាប្រចាំផ្តល់ពេលឱ្យអ្នកសួរសំណួរ ពិនិត្យសុខភាពមាត់ និងទទួលការណែនាំដែលសមស្របនឹងតម្រូវការរបស់អ្នក។', 'Request a general dental visit', 'ស្នើសុំពេលជួបទន្តសាស្ត្រទូទៅ', 'Send an appointment request and our clinic team will review it with you.', 'ផ្ញើសំណើពេលជួប ហើយក្រុមគ្លីនិករបស់យើងនឹងពិនិត្យជាមួយអ្នក។', 'Request an appointment', 'ស្នើសុំពេលជួប', 'General Dentistry in Phnom Penh | Arunreah Dental Clinic', 'ទន្តសាស្ត្រទូទៅនៅភ្នំពេញ | គ្លីនិកធ្មេញ អរុណរះ', 'Request a general dental checkup or consultation at Arunreah Dental Clinic.', 'ស្នើសុំពេលពិនិត្យ ឬពិគ្រោះយោបល់ទន្តសាស្ត្រទូទៅនៅគ្លីនិកធ្មេញ អរុណរះ។'),
('20000000-0000-4000-8000-000000000006', 'gum-periodontal-treatment', 'PUBLISHED', 0, 60, 'Gum & Periodontal Care', 'ការថែទាំអញ្ចាញ និងជាលិកាជុំវិញធ្មេញ', 'Focused care for gum-health concerns and the tissues that support your teeth.', 'ការថែទាំផ្តោតលើបញ្ហាសុខភាពអញ្ចាញ និងជាលិកាដែលគាំទ្រធ្មេញរបស់អ្នក។', 'Preventive', 'Gum and periodontal care focuses on the gums and supporting tissues around your teeth. A consultation helps us understand your concerns and discuss suitable care options.', 'ការថែទាំអញ្ចាញ និងជាលិកាជុំវិញធ្មេញ ផ្តោតលើអញ្ចាញ និងជាលិកាដែលគាំទ្រធ្មេញ។ ការពិគ្រោះយោបល់ជួយឱ្យយើងយល់ពីកង្វល់ និងពិភាក្សាជម្រើសថែទាំដែលសមស្រប។', 'Gum-health support', 'ការគាំទ្រសុខភាពអញ្ចាញ', 'Gum & Periodontal Care', 'ការថែទាំអញ្ចាញ និងជាលិកាជុំវិញធ្មេញ', 'Talk with our team about gum-health concerns and the next appropriate step.', 'ពិភាក្សាជាមួយក្រុមរបស់យើងអំពីកង្វល់សុខភាពអញ្ចាញ និងជំហានបន្ទាប់ដែលសមស្រប។', 'A closer look at gum health', 'ការពិនិត្យសុខភាពអញ្ចាញឱ្យលម្អិត', 'Your clinician can assess your gums, explain what they see, and discuss a care plan suited to your oral-health needs.', 'វេជ្ជបណ្ឌិតអាចពិនិត្យអញ្ចាញ ពន្យល់អំពីអ្វីដែលបានឃើញ និងពិភាក្សាផែនការថែទាំដែលសមស្របនឹងតម្រូវការសុខភាពមាត់របស់អ្នក។', 'Request a gum-health consultation', 'ស្នើសុំការពិគ្រោះយោបល់អំពីសុខភាពអញ្ចាញ', 'Send an appointment request to discuss your gum-health concerns.', 'ផ្ញើសំណើពេលជួប ដើម្បីពិភាក្សាអំពីកង្វល់សុខភាពអញ្ចាញរបស់អ្នក។', 'Request an appointment', 'ស្នើសុំពេលជួប', 'Gum Care in Phnom Penh | Arunreah Dental Clinic', 'ការថែទាំអញ្ចាញនៅភ្នំពេញ | គ្លីនិកធ្មេញ អរុណរះ', 'Discuss gum and periodontal care options at Arunreah Dental Clinic.', 'ពិភាក្សាអំពីជម្រើសថែទាំអញ្ចាញ និងជាលិកាជុំវិញធ្មេញនៅគ្លីនិកធ្មេញ អរុណរះ។'),
('20000000-0000-4000-8000-000000000007', 'root-canal-and-fillings', 'PUBLISHED', 0, 70, 'Root Canal & Fillings', 'ការព្យាបាលឫសធ្មេញ និងប៉ះធ្មេញ', 'Care for damaged teeth that focuses on protecting function and preserving tooth structure where appropriate.', 'ការថែទាំធ្មេញដែលខូច ផ្តោតលើការគាំទ្រមុខងារ និងរក្សារចនាសម្ព័ន្ធធ្មេញនៅពេលសមស្រប។', 'Restorative', 'Root canal treatment and fillings may be considered for damaged or decayed teeth. Your clinician will assess the tooth, explain the findings, and discuss suitable treatment options.', 'ការព្យាបាលឫសធ្មេញ និងការប៉ះធ្មេញ អាចត្រូវបានពិចារណាសម្រាប់ធ្មេញខូច ឬពុក។ វេជ្ជបណ្ឌិតនឹងពិនិត្យធ្មេញ ពន្យល់លទ្ធផល និងពិភាក្សាជម្រើសព្យាបាលដែលសមស្រប។', 'Restorative dental care', 'ការថែទាំស្តារធ្មេញ', 'Root Canal & Fillings', 'ការព្យាបាលឫសធ្មេញ និងប៉ះធ្មេញ', 'Discuss tooth pain, damage, or decay with a dental clinician.', 'ពិភាក្សាអំពីការឈឺធ្មេញ ធ្មេញខូច ឬពុក ជាមួយវេជ្ជបណ្ឌិតធ្មេញ។', 'Understanding your treatment options', 'យល់ដឹងអំពីជម្រើសព្យាបាលរបស់អ្នក', 'A consultation helps identify the condition of the tooth and the treatment options that may be appropriate.', 'ការពិគ្រោះយោបល់ជួយកំណត់សភាពធ្មេញ និងជម្រើសព្យាបាលដែលអាចសមស្រប។', 'Request a dental consultation', 'ស្នើសុំការពិគ្រោះយោបល់ធ្មេញ', 'Send an appointment request to discuss a tooth concern with our team.', 'ផ្ញើសំណើពេលជួប ដើម្បីពិភាក្សាបញ្ហាធ្មេញជាមួយក្រុមរបស់យើង។', 'Request an appointment', 'ស្នើសុំពេលជួប', 'Root Canal & Fillings | Arunreah Dental Clinic', 'ការព្យាបាលឫសធ្មេញ និងប៉ះធ្មេញ | គ្លីនិកធ្មេញ អរុណរះ', 'Discuss root canal treatment and fillings with Arunreah Dental Clinic.', 'ពិភាក្សាអំពីការព្យាបាលឫសធ្មេញ និងការប៉ះធ្មេញនៅគ្លីនិកធ្មេញ អរុណរះ។'),
('20000000-0000-4000-8000-000000000008', 'oral-surgery', 'PUBLISHED', 0, 80, 'Oral Surgery', 'ការវះកាត់មាត់ធ្មេញ', 'Consultation and treatment planning for dental surgical needs, including extraction-related concerns.', 'ការពិគ្រោះយោបល់ និងរៀបចំផែនការព្យាបាលសម្រាប់តម្រូវការវះកាត់មាត់ធ្មេញ រួមទាំងបញ្ហាដែលពាក់ព័ន្ធនឹងការដកធ្មេញ។', 'Specialty', 'Oral surgery may be recommended for certain dental concerns, including extraction-related needs. A consultation helps your clinician assess the situation and explain the available next steps.', 'ការវះកាត់មាត់ធ្មេញអាចត្រូវបានណែនាំសម្រាប់បញ្ហាធ្មេញមួយចំនួន រួមទាំងតម្រូវការដែលពាក់ព័ន្ធនឹងការដកធ្មេញ។ ការពិគ្រោះយោបល់ជួយឱ្យវេជ្ជបណ្ឌិតពិនិត្យស្ថានភាព និងពន្យល់អំពីជំហានបន្ទាប់ដែលអាចមាន។', 'Surgical dental planning', 'ការរៀបចំផែនការវះកាត់ធ្មេញ', 'Oral Surgery', 'ការវះកាត់មាត់ធ្មេញ', 'Discuss your dental concern and the care options available to you.', 'ពិភាក្សាអំពីបញ្ហាធ្មេញ និងជម្រើសថែទាំដែលអាចមានសម្រាប់អ្នក។', 'A clear plan for your next step', 'ផែនការច្បាស់លាស់សម្រាប់ជំហានបន្ទាប់', 'Your clinician will review your concern and explain the recommended next steps in clear, practical language.', 'វេជ្ជបណ្ឌិតនឹងពិនិត្យកង្វល់របស់អ្នក និងពន្យល់អំពីជំហានបន្ទាប់ដែលបានណែនាំដោយភាសាច្បាស់លាស់ និងអនុវត្តបាន។', 'Request a consultation', 'ស្នើសុំការពិគ្រោះយោបល់', 'Send an appointment request to discuss your dental concern.', 'ផ្ញើសំណើពេលជួប ដើម្បីពិភាក្សាបញ្ហាធ្មេញរបស់អ្នក។', 'Request an appointment', 'ស្នើសុំពេលជួប', 'Oral Surgery Consultation | Arunreah Dental Clinic', 'ការពិគ្រោះយោបល់វះកាត់មាត់ធ្មេញ | គ្លីនិកធ្មេញ អរុណរះ', 'Request an oral-surgery consultation at Arunreah Dental Clinic.', 'ស្នើសុំការពិគ្រោះយោបល់វះកាត់មាត់ធ្មេញនៅគ្លីនិកធ្មេញ អរុណរះ។');

DELETE FROM service_benefits
WHERE service_id IN (
  '20000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000004',
  '20000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000006',
  '20000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000008'
);

INSERT INTO service_benefits (id, service_id, title_en, title_km, description_en, description_km, display_order) VALUES
('61000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Personalized assessment','ការពិនិត្យផ្ទាល់ខ្លួន','Your clinician reviews your oral-health needs before recommending a plan.','វេជ្ជបណ្ឌិតពិនិត្យតម្រូវការសុខភាពមាត់របស់អ្នក មុនពេលណែនាំផែនការ។',10),
('61000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','Clear treatment discussion','ការពិភាក្សាព្យាបាលច្បាស់លាស់','Understand the options and next steps before you decide.','យល់ពីជម្រើស និងជំហានបន្ទាប់ មុនពេលអ្នកសម្រេចចិត្ត។',20),
('61000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','Professional assessment','ការពិនិត្យដោយវិជ្ជាជីវៈ','Discuss whether whitening is suitable for your teeth.','ពិភាក្សាថាតើការធ្វើឱ្យធ្មេញសសមស្របសម្រាប់ធ្មេញរបស់អ្នកឬទេ។',10),
('61000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000002','Smile-focused options','ជម្រើសផ្តោតលើស្នាមញញឹម','Explore options based on your goals and oral health.','ស្វែងយល់ជម្រើសដោយផ្អែកលើគោលដៅ និងសុខភាពមាត់របស់អ្នក។',20),
('61000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000003','Plaque and tartar removal','កម្ចាត់កំណក និងថ្មធ្មេញ','Professional cleaning supports your daily home-care routine.','ការសម្អាតដោយវិជ្ជាជីវៈគាំទ្រទម្លាប់ថែទាំនៅផ្ទះប្រចាំថ្ងៃរបស់អ្នក។',10),
('61000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000003','Oral-health review','ពិនិត្យសុខភាពមាត់','Raise questions and discuss practical care habits.','សួរសំណួរ និងពិភាក្សាទម្លាប់ថែទាំដែលអនុវត្តបាន។',20),
('61000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000004','Alignment assessment','ពិនិត្យការតម្រឹម','Review your tooth alignment and bite with a clinician.','ពិនិត្យការតម្រឹមធ្មេញ និងការខាំជាមួយវេជ្ជបណ្ឌិត។',10),
('61000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000004','Options explained clearly','ពន្យល់ជម្រើសឱ្យច្បាស់','Discuss suitable orthodontic care options for your needs.','ពិភាក្សាជម្រើសកែតម្រូវធ្មេញដែលសមស្របនឹងតម្រូវការរបស់អ្នក។',20),
('61000000-0000-4000-8000-000000000009','20000000-0000-4000-8000-000000000005','Routine checkups','ការពិនិត្យជាប្រចាំ','Review your teeth and gums as part of everyday oral care.','ពិនិត្យធ្មេញ និងអញ្ចាញជាផ្នែកមួយនៃការថែទាំមាត់ប្រចាំថ្ងៃ។',10),
('61000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000005','Practical guidance','ការណែនាំអនុវត្តបាន','Receive clear advice for your next oral-health step.','ទទួលបានការណែនាំច្បាស់លាស់សម្រាប់ជំហានសុខភាពមាត់បន្ទាប់របស់អ្នក។',20),
('61000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000006','Gum assessment','ពិនិត្យអញ្ចាញ','Discuss gum-health concerns with a dental clinician.','ពិភាក្សាកង្វល់សុខភាពអញ្ចាញជាមួយវេជ្ជបណ្ឌិតធ្មេញ។',10),
('61000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000006','Appropriate next steps','ជំហានបន្ទាប់សមស្រប','Understand the care options that may suit your needs.','យល់ពីជម្រើសថែទាំដែលអាចសមស្របនឹងតម្រូវការរបស់អ្នក។',20),
('61000000-0000-4000-8000-000000000013','20000000-0000-4000-8000-000000000007','Tooth assessment','ពិនិត្យធ្មេញ','Review a damaged or painful tooth before choosing care.','ពិនិត្យធ្មេញខូច ឬឈឺ មុនពេលជ្រើសរើសការថែទាំ។',10),
('61000000-0000-4000-8000-000000000014','20000000-0000-4000-8000-000000000007','Options for restoration','ជម្រើសស្តារធ្មេញ','Discuss options that may protect tooth function and structure.','ពិភាក្សាជម្រើសដែលអាចគាំទ្រមុខងារ និងរចនាសម្ព័ន្ធធ្មេញ។',20),
('61000000-0000-4000-8000-000000000015','20000000-0000-4000-8000-000000000008','Careful consultation','ការពិគ្រោះយោបល់ដោយប្រុងប្រយ័ត្ន','Share your concern and receive a clear explanation of next steps.','ប្រាប់កង្វល់របស់អ្នក និងទទួលបានការពន្យល់ច្បាស់លាស់អំពីជំហានបន្ទាប់។',10),
('61000000-0000-4000-8000-000000000016','20000000-0000-4000-8000-000000000008','Treatment planning','ការរៀបចំផែនការព្យាបាល','Discuss an approach suited to your dental needs.','ពិភាក្សាវិធីសាស្ត្រដែលសមស្របនឹងតម្រូវការធ្មេញរបស់អ្នក។',20);

UPDATE doctors SET
  short_bio_en = 'Senior clinician focused on implant and restorative treatment planning.',
  short_bio_km = 'វេជ្ជបណ្ឌិតជាន់ខ្ពស់ ផ្តោតលើការរៀបចំផែនការដាំធ្មេញ និងស្តារធ្មេញ។',
  biography_en = 'Asst. Prof. Sreng Heng combines clinical experience with a practical, patient-focused approach to implant and restorative care. He takes time to explain treatment options and help patients understand the next step.',
  biography_km = 'សាស្ត្រាចារ្យជំនួយ ស្រេង ហេង រួមបញ្ចូលបទពិសោធន៍គ្លីនិកជាមួយវិធីសាស្ត្រជាក់ស្តែង និងផ្តោតលើអ្នកជំងឺ សម្រាប់ការដាំធ្មេញ និងស្តារធ្មេញ។ លោកយកចិត្តទុកដាក់ពន្យល់ជម្រើសព្យាបាល និងជួយអ្នកជំងឺយល់ពីជំហានបន្ទាប់។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '30000000-0000-4000-8000-000000000001';

UPDATE doctors SET
  short_bio_en = 'Clinician focused on orthodontic planning, implant care, and clear patient communication.',
  short_bio_km = 'វេជ្ជបណ្ឌិតផ្តោតលើការរៀបចំផែនការកែតម្រូវធ្មេញ ការដាំធ្មេញ និងការប្រាស្រ័យច្បាស់លាស់ជាមួយអ្នកជំងឺ។',
  biography_en = 'Dr. Chho Sonthary supports patients with orthodontic and implant-related concerns through careful assessment and clear treatment discussions. Her approach is centered on understanding each patient’s goals and needs.',
  biography_km = 'វេជ្ជបណ្ឌិត ឈូ សុនថារី គាំទ្រអ្នកជំងឺដែលមានកង្វល់អំពីការកែតម្រូវធ្មេញ និងការដាំធ្មេញ តាមរយៈការពិនិត្យយ៉ាងប្រុងប្រយ័ត្ន និងការពិភាក្សាព្យាបាលច្បាស់លាស់។ វិធីសាស្ត្ររបស់លោកស្រីផ្តោតលើការយល់ពីគោលដៅ និងតម្រូវការរបស់អ្នកជំងឺម្នាក់ៗ។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '30000000-0000-4000-8000-000000000002';

UPDATE doctors SET
  short_bio_en = 'Orthodontics clinician focused on alignment, bite concerns, and thoughtful treatment planning.',
  short_bio_km = 'វេជ្ជបណ្ឌិតកែតម្រូវធ្មេញ ផ្តោតលើការតម្រឹមធ្មេញ បញ្ហាការខាំ និងការរៀបចំផែនការព្យាបាលដោយយកចិត្តទុកដាក់។',
  biography_en = 'Dr. Yim Delux focuses on orthodontic care for patients with alignment and bite concerns. He works with patients to understand their needs and discuss a structured approach to treatment.',
  biography_km = 'វេជ្ជបណ្ឌិត យឹម ដេលុច ផ្តោតលើការថែទាំកែតម្រូវធ្មេញសម្រាប់អ្នកជំងឺដែលមានបញ្ហាការតម្រឹម និងការខាំ។ លោកធ្វើការជាមួយអ្នកជំងឺ ដើម្បីយល់ពីតម្រូវការ និងពិភាក្សាវិធីសាស្ត្រព្យាបាលដែលរៀបចំជាប្រព័ន្ធ។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '30000000-0000-4000-8000-000000000003';

UPDATE doctors SET
  short_bio_en = 'Implant dentistry clinician focused on careful assessment and restorative planning.',
  short_bio_km = 'វេជ្ជបណ្ឌិតដាំធ្មេញ ផ្តោតលើការពិនិត្យយ៉ាងប្រុងប្រយ័ត្ន និងការរៀបចំផែនការស្តារធ្មេញ។',
  biography_en = 'Dr. Chuong Kunthy supports patients considering implant-related care through careful assessment and clear discussion of treatment options. He focuses on planning that considers comfort, function, and the patient’s goals.',
  biography_km = 'វេជ្ជបណ្ឌិត ជួង គន្ធី គាំទ្រអ្នកជំងឺដែលកំពុងពិចារណាការថែទាំពាក់ព័ន្ធនឹងការដាំធ្មេញ តាមរយៈការពិនិត្យប្រុងប្រយ័ត្ន និងការពិភាក្សាជម្រើសព្យាបាលឱ្យច្បាស់។ លោកផ្តោតលើផែនការដែលពិចារណាភាពងាយស្រួល មុខងារ និងគោលដៅរបស់អ្នកជំងឺ។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '30000000-0000-4000-8000-000000000004';

INSERT OR IGNORE INTO doctors (id, slug, status, featured, display_order, name_en, name_km, role_en, role_km, specialty_en, specialty_km, short_bio_en, short_bio_km, biography_en, biography_km)
VALUES
('30000000-0000-4000-8000-000000000005','taing-thanith','PUBLISHED',0,50,'Dr. Taing Thanith','វេជ្ជបណ្ឌិត តាំង ថានិត','Digital Smile Design Clinician','វេជ្ជបណ្ឌិតរចនាស្នាមញញឹមឌីជីថល','Digital Smile Design & Implant Dentistry','ការរចនាស្នាមញញឹមឌីជីថល និងការដាំធ្មេញ','Clinician focused on smile planning and implant-related restorative care.','វេជ្ជបណ្ឌិតផ្តោតលើការរៀបចំផែនការស្នាមញញឹម និងការថែទាំស្តារធ្មេញពាក់ព័ន្ធនឹងការដាំធ្មេញ។','Dr. Taing Thanith supports patients who wish to discuss smile planning and implant-related restorative options. He focuses on understanding treatment goals and explaining the next steps clearly.','វេជ្ជបណ្ឌិត តាំង ថានិត គាំទ្រអ្នកជំងឺដែលចង់ពិភាក្សាអំពីការរៀបចំស្នាមញញឹម និងជម្រើសស្តារធ្មេញពាក់ព័ន្ធនឹងការដាំធ្មេញ។ លោកផ្តោតលើការយល់ពីគោលដៅព្យាបាល និងពន្យល់ជំហានបន្ទាប់ឱ្យច្បាស់។'),
('30000000-0000-4000-8000-000000000006','chea-kimly','PUBLISHED',0,60,'Dr. Chea Kimly','វេជ្ជបណ្ឌិត ជា គឹមលី','Multidisciplinary Dental Clinician','វេជ្ជបណ្ឌិតធ្មេញពហុជំនាញ','Restorative, Orthodontic & Endodontic Care','ការថែទាំស្តារធ្មេញ កែតម្រូវធ្មេញ និងព្យាបាលឫសធ្មេញ','Clinician with a broad focus on restorative, orthodontic, endodontic, and implant-related care.','វេជ្ជបណ្ឌិតមានការផ្តោតទូលំទូលាយលើការស្តារធ្មេញ កែតម្រូវធ្មេញ ព្យាបាលឫសធ្មេញ និងការថែទាំពាក់ព័ន្ធនឹងការដាំធ្មេញ។','Dr. Chea Kimly works with patients whose concerns may involve several areas of dental care. He helps explain the findings and discusses a coordinated next step that reflects each patient’s needs.','វេជ្ជបណ្ឌិត ជា គឹមលី ធ្វើការជាមួយអ្នកជំងឺដែលអាចមានកង្វល់ពាក់ព័ន្ធនឹងផ្នែកថែទាំធ្មេញជាច្រើន។ លោកជួយពន្យល់លទ្ធផល និងពិភាក្សាជំហានបន្ទាប់ដែលរៀបចំសម្របតាមតម្រូវការរបស់អ្នកជំងឺម្នាក់ៗ។'),
('30000000-0000-4000-8000-000000000007','heng-bunhabb','PUBLISHED',0,70,'Dr. Heng Bunhabb','វេជ្ជបណ្ឌិត ហេង ប៊ុនហាប់','Endodontic & Implant Dentistry Clinician','វេជ្ជបណ្ឌិតព្យាបាលឫសធ្មេញ និងដាំធ្មេញ','Endodontics & Implant Dentistry','ការព្យាបាលឫសធ្មេញ និងការដាំធ្មេញ','Clinician focused on tooth-preservation discussions and implant-related restorative care.','វេជ្ជបណ្ឌិតផ្តោតលើការពិភាក្សាអំពីការរក្សាធ្មេញ និងការថែទាំស្តារធ្មេញពាក់ព័ន្ធនឹងការដាំធ្មេញ។','Dr. Heng Bunhabb supports patients with root-focused dental concerns and implant-related restorative questions. He takes a careful approach to assessment and helps patients understand the treatment options available.','វេជ្ជបណ្ឌិត ហេង ប៊ុនហាប់ គាំទ្រអ្នកជំងឺដែលមានកង្វល់ពាក់ព័ន្ធនឹងឫសធ្មេញ និងសំណួរអំពីការស្តារធ្មេញពាក់ព័ន្ធនឹងការដាំធ្មេញ។ លោកប្រើវិធីសាស្ត្រពិនិត្យយ៉ាងប្រុងប្រយ័ត្ន និងជួយអ្នកជំងឺយល់ពីជម្រើសព្យាបាលដែលអាចមាន។');

INSERT OR IGNORE INTO doctor_expertise (id, doctor_id, name_en, name_km, display_order) VALUES
('62000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000005','Digital Smile Design','ការរចនាស្នាមញញឹមឌីជីថល',10),
('62000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000005','Implant Dentistry','ការដាំធ្មេញ',20),
('62000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000006','Restorative Dentistry','ការស្តារធ្មេញ',10),
('62000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000006','Orthodontics','ការកែតម្រូវធ្មេញ',20),
('62000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000006','Endodontics','ការព្យាបាលឫសធ្មេញ',30),
('62000000-0000-4000-8000-000000000006','30000000-0000-4000-8000-000000000007','Endodontics','ការព្យាបាលឫសធ្មេញ',10),
('62000000-0000-4000-8000-000000000007','30000000-0000-4000-8000-000000000007','Implant Dentistry','ការដាំធ្មេញ',20);

UPDATE showcases SET
  excerpt_en = 'A patient-friendly introduction to discussing implant options for missing teeth.',
  excerpt_km = 'ការណែនាំងាយយល់សម្រាប់ការពិភាក្សាអំពីជម្រើសដាំធ្មេញសម្រាប់ធ្មេញដែលបាត់។',
  body_en = 'Missing teeth can affect everyday comfort and confidence. A dental implant consultation is an opportunity to discuss your oral health, understand the available options, and decide on an appropriate next step with your clinician.',
  body_km = 'ធ្មេញដែលបាត់អាចប៉ះពាល់ដល់ភាពងាយស្រួលក្នុងជីវិតប្រចាំថ្ងៃ និងទំនុកចិត្ត។ ការពិគ្រោះយោបល់អំពីការដាំធ្មេញ គឺជាឱកាសដើម្បីពិភាក្សាសុខភាពមាត់ យល់ពីជម្រើសដែលអាចមាន និងសម្រេចជំហានបន្ទាប់ដែលសមស្របជាមួយវេជ្ជបណ្ឌិត។',
  meta_description_en = 'A clear introduction to discussing dental implant options for missing teeth at Arunreah Dental Clinic.',
  meta_description_km = 'ការណែនាំច្បាស់លាស់អំពីការពិភាក្សាជម្រើសដាំធ្មេញសម្រាប់ធ្មេញដែលបាត់នៅគ្លីនិកធ្មេញ អរុណរះ។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '50000000-0000-4000-8000-000000000001';

UPDATE showcases SET
  excerpt_en = 'Simple oral-health habits and regular dental visits can support your family at every stage of life.',
  excerpt_km = 'ទម្លាប់ថែទាំសុខភាពមាត់សាមញ្ញ និងការមកពិនិត្យធ្មេញជាប្រចាំ អាចគាំទ្រគ្រួសាររបស់អ្នកគ្រប់ដំណាក់កាលជីវិត។',
  body_en = 'Oral-health needs change through childhood, adulthood, and later life. Consistent daily care and regular dental visits give families a practical way to ask questions, address concerns early, and maintain healthy routines together.',
  body_km = 'តម្រូវការសុខភាពមាត់ផ្លាស់ប្តូរតាមវ័យកុមារ វ័យពេញវ័យ និងវ័យចាស់។ ការថែទាំប្រចាំថ្ងៃជាប់លាប់ និងការមកពិនិត្យធ្មេញជាប្រចាំ ផ្តល់វិធីអនុវត្តបានសម្រាប់គ្រួសារសួរសំណួរ ដោះស្រាយកង្វល់ឱ្យបានឆាប់ និងរក្សាទម្លាប់ល្អរួមគ្នា។',
  meta_description_en = 'Practical oral-health guidance for families at every stage of life.',
  meta_description_km = 'ការណែនាំអនុវត្តបានអំពីសុខភាពមាត់សម្រាប់គ្រួសារគ្រប់ដំណាក់កាលជីវិត។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '50000000-0000-4000-8000-000000000002';

UPDATE showcases SET
  excerpt_en = 'A straightforward guide to preparing for your first dental consultation at our clinic.',
  excerpt_km = 'ការណែនាំងាយយល់សម្រាប់ត្រៀមខ្លួនមកពិគ្រោះធ្មេញលើកដំបូងនៅគ្លីនិករបស់យើង។',
  body_en = 'Your first visit is a time to share your concerns and ask questions. Our team will listen, review your oral-health needs, and explain suitable next steps so you can make an informed decision about your care.',
  body_km = 'ការមកពិនិត្យលើកដំបូង គឺជាពេលសម្រាប់អ្នកប្រាប់កង្វល់ និងសួរសំណួរ។ ក្រុមរបស់យើងនឹងស្តាប់ ពិនិត្យតម្រូវការសុខភាពមាត់ និងពន្យល់ជំហានបន្ទាប់ដែលសមស្រប ដើម្បីឱ្យអ្នកអាចសម្រេចចិត្តអំពីការថែទាំរបស់អ្នកដោយមានព័ត៌មានគ្រប់គ្រាន់។',
  meta_description_en = 'Know what to expect from your first dental consultation at Arunreah Dental Clinic.',
  meta_description_km = 'ដឹងពីអ្វីដែលត្រូវរំពឹងពីការពិគ្រោះធ្មេញលើកដំបូងនៅគ្លីនិកធ្មេញ អរុណរះ។',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = '50000000-0000-4000-8000-000000000003';
