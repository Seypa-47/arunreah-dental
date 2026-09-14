-- STAGING ONLY: initial CMS content for the About · Advanced Facilities section.
-- The records are idempotent and target exact IDs. Run only after migration 0015.

INSERT INTO page_media (
  id, placement, status, title_en, title_km, body_en, body_km, image_key, display_order, created_at, updated_at
) VALUES
  (
    '90000000-0000-4000-8000-000000000001',
    'ABOUT_ADVANCED_FACILITIES', 'PUBLISHED',
    'Digital impression scanning', 'ការស្កេនបោះពុម្ពធ្មេញឌីជីថល',
    'A digital workflow that helps our team capture dental information clearly when planning suitable next steps.',
    'ប្រព័ន្ធឌីជីថលដែលជួយក្រុមរបស់យើងកត់ត្រាព័ត៌មានធ្មេញបានច្បាស់លាស់ ដើម្បីរៀបចំជំហានបន្ទាប់ដែលសមស្រប។',
    'clinic/digital-impression-scanner.jpg', 10,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    '90000000-0000-4000-8000-000000000002',
    'ABOUT_ADVANCED_FACILITIES', 'PUBLISHED',
    'Dental laser technology', 'បច្ចេកវិទ្យាឡាស៊ែរធ្មេញ',
    'A modern laser system available for treatments where your clinician considers it appropriate.',
    'ប្រព័ន្ធឡាស៊ែរទំនើបដែលអាចប្រើសម្រាប់ការព្យាបាល នៅពេលវេជ្ជបណ្ឌិតវាយតម្លៃថាសមស្រប។',
    'clinic/dental-laser-system.jpg', 20,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    '90000000-0000-4000-8000-000000000003',
    'ABOUT_ADVANCED_FACILITIES', 'PUBLISHED',
    'Versatile laser treatment tools', 'ឧបករណ៍ឡាស៊ែរសម្រាប់ការព្យាបាល',
    'Different handpieces support a clinician-led approach tailored to the treatment being considered.',
    'ក្បាលឧបករណ៍ផ្សេងៗគ្នា គាំទ្រវិធីសាស្ត្រដែលដឹកនាំដោយវេជ្ជបណ្ឌិត ស្របតាមការព្យាបាលដែលកំពុងពិចារណា។',
    'clinic/laser-treatment-handpieces.jpg', 30,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    '90000000-0000-4000-8000-000000000004',
    'ABOUT_ADVANCED_FACILITIES', 'PUBLISHED',
    '3D dental imaging', 'ការថតរូបភាពធ្មេញ 3D',
    'Three-dimensional imaging can support clear assessment and treatment planning when clinically indicated.',
    'ការថតរូបភាព 3D អាចជួយគាំទ្រការវាយតម្លៃ និងការរៀបចំផែនការព្យាបាលបានច្បាស់លាស់ នៅពេលមានការណែនាំពីវេជ្ជបណ្ឌិត។',
    'clinic/three-dimensional-dental-imaging.jpg', 40,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    '90000000-0000-4000-8000-000000000005',
    'ABOUT_ADVANCED_FACILITIES', 'PUBLISHED',
    'Digital facial scanning', 'ការស្កេនផ្ទៃមុខឌីជីថល',
    'Facial scanning can add useful information when planning selected restorative, orthodontic, or smile-design care.',
    'ការស្កេនផ្ទៃមុខអាចផ្តល់ព័ត៌មានបន្ថែមដែលមានប្រយោជន៍ សម្រាប់រៀបចំផែនការស្តារធ្មេញ ពត់តម្រង់ធ្មេញ ឬរចនាស្នាមញញឹមដែលបានជ្រើសរើស។',
    'clinic/digital-facial-scanner.jpg', 50,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    '90000000-0000-4000-8000-000000000006',
    'ABOUT_ADVANCED_FACILITIES', 'PUBLISHED',
    'Facial scanning in planning', 'ការស្កេនផ្ទៃមុខក្នុងការរៀបចំផែនការ',
    'A visual planning tool that can help connect facial proportions with a patient’s dental plan.',
    'ឧបករណ៍សម្រាប់រៀបចំផែនការដោយមើលឃើញ ដែលអាចជួយភ្ជាប់សមាមាត្រផ្ទៃមុខ ជាមួយផែនការថែទាំធ្មេញរបស់អ្នក។',
    'clinic/facial-scanning-workflow.jpg', 60,
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(id) DO UPDATE SET
  placement = excluded.placement,
  status = excluded.status,
  title_en = excluded.title_en,
  title_km = excluded.title_km,
  body_en = excluded.body_en,
  body_km = excluded.body_km,
  image_key = excluded.image_key,
  display_order = excluded.display_order,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
