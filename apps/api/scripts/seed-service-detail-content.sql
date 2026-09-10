-- Client-approved bilingual detail copy for the five non-journey service pages.
-- Images remain optional per section so editors can add approved clinical photography later.
DELETE FROM service_detail_sections
WHERE service_id IN (
  SELECT id FROM services WHERE slug IN (
    'general-dentistry', 'oral-surgery', 'dental-radiography', 'root-canal-treatment', 'pediatric-dentistry'
  )
);
--> statement-breakpoint

INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'general-cleaning', id, 'TEXT', 'Scaling and polishing', 'ការសម្អាតធ្មេញ', 'A professional cleaning removes plaque, calculus, and external stains to support periodontal health. We recommend a check-up every six months.', 'ជាការសម្អាតធ្មេញប្រកបដោយផាសុខភាព ដើម្បីសម្អាតយក កំណកកំបោរ និង ស្នាមប្រឡាក់ខាងក្រៅ ដើម្បីថែរក្សាសុខភាពមាត់ធ្មេញ និងការពារការរលាកអញ្ចាញធ្មេញ។', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'general-dentistry'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'general-fillings', id, 'TEXT', 'Dental fillings', 'ការប៉ះធ្មេញ', 'Dental fillings restore a tooth affected by decay, fracture, or loss of tooth structure, helping restore its shape, function, and appearance.', 'ជាការស្តារឡើងវិញនៅមុខងារទំពារនិងរូបរាងធ្មេញដែលខូចខាតដោយសាររោគពុកធ្មេញ ការប៉ះទង្គិចដែលប៉ះពាល់ដល់រចនាសម្ព័ន្ធរបស់ធ្មេញ។', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'general-dentistry'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'general-whitening', id, 'TEXT', 'Teeth whitening', 'ការធ្វើធ្មេញឲ្យសភ្លឺ', 'A cosmetic procedure that lightens the natural colour of teeth by reducing stains and discoloration.', 'ជាការកែសម្ផស្សធ្មេញដែលធ្វើឱ្យពណ៌ធម្មជាតិនៃធ្មេញសភ្លឺ ដោយការលុប ឬបំបែកស្នាមប្រឡាក់ និងការប្រែពណ៌។', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'general-dentistry';
--> statement-breakpoint

INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'oral-extraction', id, 'TEXT', 'Tooth extraction', 'ការដកធ្មេញ', 'Simple extraction, surgical extraction, and wisdom tooth removal are offered when clinically appropriate.', 'ការដកធ្មេញធម្មតា ការដកធ្មេញដោយការវះកាត់ និងការដកធ្មេញទាល់។', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'oral-surgery'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'oral-impacted', id, 'TEXT', 'Surgical removal of impacted teeth', 'ការវះកាត់យកធ្មេញដែលកប់', 'Surgical removal may be used for impacted third molars and other teeth that have not erupted fully.', 'ជាទូទៅអនុវត្តលើ ធ្មេញចង្កូមឬ ធ្មេញថ្គាមទី៣ដែលដុះកប់ ឬដុះមិនពេញលេញ។', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'oral-surgery'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'oral-drainage', id, 'TEXT', 'Incision and drainage', 'ការចោះបើក និងបង្ហូរខ្ទុះ', 'Treatment for odontogenic abscesses and localized infections, following a clinical assessment.', 'ប្រើសម្រាប់ព្យាបាល អាប់សែសធ្មេញ និងការឆ្លងមេរោគតំបន់ជាក់លាក់។', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'oral-surgery'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'oral-crown-lengthening', id, 'TEXT', 'Esthetic crown lengthening', 'ការកាត់អញ្ចាញធ្មេញ', 'This may reduce excessive gingival display (gummy smile) or improve an uneven gum contour.', 'ដើម្បីកាត់បន្ថយការបង្ហាញអញ្ចាញធ្មេញច្រើនពេក (Gummy Smile) ឬកែសម្រួលទម្រង់អញ្ចាញធ្មេញដែលមិនស្មើគ្នា។', NULL, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'oral-surgery'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'oral-root-planing', id, 'TEXT', 'Root planing', 'ការសម្អាតឬសធ្មេញ', 'A periodontal treatment that removes plaque, calculus, and contaminated deposits below the gumline so the root surface can support periodontal healing.', 'ជាការព្យាបាលផ្នែកជំងឺជាលិកាជុំវិញធ្មេញ ដែលមានគោលបំណងយក កំណកបាក់តេរីក្រោមអញ្ចាញធ្មេញ កំណកកំបោរ និងសំណល់ដែលមានមេរោគនៅលើផ្ទៃឫសធ្មេញចេញ ដើម្បីធ្វើឱ្យផ្ទៃឫសធ្មេញស្អាត និងរលោង ដែលអាចជួយឱ្យជាលិកាជុំវិញធ្មេញជាសះស្បើយបានល្អ។', NULL, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'oral-surgery';
--> statement-breakpoint

INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'radiography-understanding', id, 'TEXT', 'Understanding dental X-rays', 'ការយល់ដឹងអំពីការថត X-ray ធ្មេញ', 'Dental X-rays are images of teeth and jaws. They help dentists assess areas not visible in a regular examination, including jawbone, nerves, sinuses, tooth roots, and impacted teeth.', 'ការថត X-ray ធ្មេញគឺជាការថតរូបភាពធ្មេញ និងឆ្អឹងថ្គាម។ ទន្តបណ្ឌិតប្រើវាដើម្បីមើលផ្នែកដែលមើលមិនឃើញកំឡុងពេលពិនិត្យ ដូចជា ឆ្អឹងថ្គាម សរសៃប្រសាទ ឬសធ្មេញ និងធ្មេញកប់។', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'dental-radiography'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'radiography-intraoral', id, 'TEXT', 'Intraoral imaging', 'ការថត X-ray ក្នុងមាត់', 'The sensor is placed inside the mouth. Periapical X-rays show a complete tooth and surrounding bone; bitewings show upper and lower crowns to detect decay between back teeth; occlusal X-rays provide a wider view of the upper or lower jaw.', 'ឧបករណ៍ថតស្ថិតនៅក្នុងមាត់។ Periapical ថតធ្មេញទាំងមូលពីក្បាលដល់ចុងឬស និងឆ្អឹងជុំវិញ។ Bitewing ថតក្បាលធ្មេញលើ និងក្រោមរួមគ្នា ដើម្បីរករោគពុកនៅចន្លោះធ្មេញ។ Occlusal ថតមើលតំបន់ធំនៃថ្គាមលើ ឬក្រោម។', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'dental-radiography'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'radiography-extraoral', id, 'TEXT', 'Extraoral imaging', 'ការថត X-ray ក្រៅមាត់', 'The sensor stays outside the mouth. Panoramic imaging shows the whole mouth; cephalometric imaging gives a side view for orthodontic planning; CBCT provides three-dimensional views used for surgical and implant planning.', 'ឧបករណ៍ថតស្ថិតនៅក្រៅមាត់។ Panoramic ថតមើលមាត់ទាំងមូល។ Cephalometric បង្ហាញរូបភាពចំហៀងនៃក្បាល សម្រាប់រៀបចំផែនការពត់តម្រង់ធ្មេញ។ CBCT ថតរូបភាព 3D នៃធ្មេញ ឆ្អឹងថ្គាម សរសៃប្រសាទ និងថង់ខ្យល់ សម្រាប់រៀបចំផែនការវះកាត់ ឬដាំបង្គោលក្នុងឆ្អឹង។', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'dental-radiography';
--> statement-breakpoint

INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'root-what', id, 'TEXT', 'What is root canal treatment?', 'តើការព្យាបាលរន្ធឬសធ្មេញគឺជាអ្វី?', 'Root canal treatment removes inflamed or infected pulp inside a tooth. The canal is carefully cleaned, disinfected, filled, and sealed.', 'ការព្យាបាលរន្ធឬសធ្មេញគឺជាការយកសរសៃរន្ធឬសធ្មេញដែលរលាក ឬឆ្លងមេរោគចេញពីក្នុងធ្មេញ ហើយលាងសម្អាត និងសម្លាប់មេរោគដោយប្រុងប្រយ័ត្ន បន្ទាប់មកបញ្ចូលថ្នាំព្យាបាល និងបិទប៉ះមកវិញ។', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'root-canal-treatment'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'root-how', id, 'TEXT', 'How treatment works', 'របៀបដែលការព្យាបាលដំណើរការ', 'The aim is to remove bacteria from an infected root canal, help prevent reinfection, and preserve the natural tooth.', 'ការព្យាបាលនេះធ្វើឡើង ដើម្បីលុបបំបាត់មេរោគចេញពីរន្ធឬសធ្មេញដែលឆ្លងរោគ ការពារការឆ្លងមេរោគឡើងវិញ និងរក្សាធ្មេញធម្មជាតិ។', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'root-canal-treatment'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'root-appointment', id, 'TEXT', 'What to expect at your appointment', 'អ្វីដែលត្រូវរំពឹងក្នុងពេលណាត់ជួប', 'The time required cannot always be predicted. A visit may take about 30 to 120 minutes depending mostly on the tooth being treated.', 'រយៈពេលនៃការព្យាបាលមិនអាចកំណត់បានច្បាស់ទេ។ ការណាត់ជួបម្តងអាចចំណាយពេលពី 30 នាទីទៅ 2 ម៉ោង អាស្រ័យលើធ្មេញដែលកំពុងព្យាបាល។', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'root-canal-treatment'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'root-benefits', id, 'TEXT', 'Benefits of treatment', 'អត្ថប្រយោជន៍នៃការព្យាបាល', 'By removing inflamed or infected tissue, treatment can reduce pain while helping keep your natural tooth, smile, and bite intact.', 'អត្ថប្រយោជន៍គឺជាការរក្សាធ្មេញធម្មជាតិ និងកាត់បន្ថយការឈឺចាប់ ដោយយកចេញនូវជាលិកាធ្មេញដែលរលាក ឬឆ្លងមេរោគ។', NULL, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'root-canal-treatment';
--> statement-breakpoint

INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'pediatric-fluoride', id, 'TEXT', 'Fluoride application', 'ការលាប Fluoride', 'Professional fluoride treatment strengthens enamel and helps prevent dental caries.', 'ការព្យាបាលដោយ Fluoride ជាលក្ខណៈវិជ្ជាជីវៈ ដើម្បីពង្រឹង Enamel និងជួយការពារការកើត Dental Caries។', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'pediatric-dentistry'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'pediatric-sealant', id, 'TEXT', 'Pit & fissure sealant', 'Pit & Fissure Sealant', 'A protective coating placed in the grooves of teeth to help prevent cavities.', 'ការដាក់សារធាតុ Sealant សម្រាប់បិទរន្ធ និងចង្អូរលើផ្ទៃធ្មេញ ដើម្បីជួយការពារ Dental Caries។', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'pediatric-dentistry'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'pediatric-filling', id, 'TEXT', 'Children’s dental filling', 'ការបំពេញធ្មេញកុមារ', 'Restoration of decayed primary or permanent teeth to preserve tooth structure and function.', 'ការបំពេញសម្ភារៈស្តារធ្មេញដែលមាន Dental Caries លើធ្មេញទឹកដោះ ឬធ្មេញអចិន្ត្រៃយ៍ ដើម្បីរក្សាទុក Tooth Structure និងមុខងាររបស់ធ្មេញ។', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'pediatric-dentistry'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'pediatric-pulp', id, 'TEXT', 'Pulpotomy / pulpectomy', 'Pulpotomy / Pulpectomy', 'Pulp treatment for primary teeth affected by deep decay, infection, or pulp damage, with the aim of preserving the tooth.', 'ការព្យាបាល Pulp សម្រាប់ធ្មេញទឹកដោះដែលមាន Dental Caries ជ្រៅ ការឆ្លងមេរោគ ឬការខូចខាត Pulp ក្នុងគោលបំណងរក្សាទុកធ្មេញ។', NULL, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'pediatric-dentistry'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'pediatric-extraction', id, 'TEXT', 'Primary tooth extraction', 'ការដកធ្មេញទឹកដោះ', 'Removal of severely decayed, infected, or otherwise non-restorable primary teeth when clinically indicated.', 'ការដកធ្មេញទឹកដោះដែលពុកខ្លាំង មានការឆ្លងមេរោគ ឬមិនអាចស្តារឡើងវិញបាន នៅពេលមាន Clinical Indication សមស្រប។', NULL, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'pediatric-dentistry'
;
--> statement-breakpoint
INSERT INTO service_detail_sections (id, service_id, section_type, heading_en, heading_km, body_en, body_km, image_key, display_order, created_at, updated_at)
SELECT 'pediatric-space', id, 'TEXT', 'Space maintainer', 'ឧបករណ៍រក្សាទំហំចន្លោះ', 'An appliance used to preserve space after early loss of a primary tooth and support the proper eruption of permanent teeth.', 'ឧបករណ៍សម្រាប់រក្សាទំហំចន្លោះ បន្ទាប់ពីការបាត់បង់ធ្មេញទឹកដោះមុនពេលកំណត់ និងជួយគាំទ្រដល់ការដុះឡើងត្រឹមត្រូវរបស់ធ្មេញអចិន្ត្រៃយ៍។', NULL, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM services WHERE slug = 'pediatric-dentistry';
--> statement-breakpoint

UPDATE services SET
  editorial_label_en = CASE slug
    WHEN 'general-dentistry' THEN 'Everyday dental care'
    WHEN 'oral-surgery' THEN 'Clinical services'
    WHEN 'dental-radiography' THEN 'Imaging guide'
    WHEN 'root-canal-treatment' THEN 'Problem to care'
    WHEN 'pediatric-dentistry' THEN 'Children’s dental care' END,
  editorial_label_km = CASE slug
    WHEN 'general-dentistry' THEN 'ការថែទាំធ្មេញប្រចាំថ្ងៃ'
    WHEN 'oral-surgery' THEN 'សេវាគ្លីនិក'
    WHEN 'dental-radiography' THEN 'ព័ត៌មានអំពីការថតរូបភាព'
    WHEN 'root-canal-treatment' THEN 'ពីបញ្ហាទៅការថែទាំ'
    WHEN 'pediatric-dentistry' THEN 'ការថែទាំធ្មេញកុមារ' END,
  editorial_title_en = CASE slug
    WHEN 'general-dentistry' THEN 'Services included in your everyday care'
    WHEN 'oral-surgery' THEN 'Clinical care tailored to your diagnosis'
    WHEN 'dental-radiography' THEN 'The right image for a clearer diagnosis'
    WHEN 'root-canal-treatment' THEN 'Protecting your natural tooth'
    WHEN 'pediatric-dentistry' THEN 'Gentle care for growing smiles' END,
  editorial_title_km = CASE slug
    WHEN 'general-dentistry' THEN 'សេវាដែលរួមបញ្ចូលក្នុងការថែទាំប្រចាំថ្ងៃ'
    WHEN 'oral-surgery' THEN 'ការថែទាំគ្លីនិកសមស្របតាមការវិនិច្ឆ័យ'
    WHEN 'dental-radiography' THEN 'រូបភាពត្រឹមត្រូវសម្រាប់ការវិនិច្ឆ័យច្បាស់លាស់'
    WHEN 'root-canal-treatment' THEN 'ការពារធ្មេញធម្មជាតិរបស់អ្នក'
    WHEN 'pediatric-dentistry' THEN 'ការថែទាំទន់ភ្លន់សម្រាប់ស្នាមញញឹមកំពុងលូតលាស់' END
WHERE slug IN ('general-dentistry', 'oral-surgery', 'dental-radiography', 'root-canal-treatment', 'pediatric-dentistry');
--> statement-breakpoint
