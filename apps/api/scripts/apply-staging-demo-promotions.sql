-- Staging demo content for the Home · Promotions CMS placement.
-- This script is idempotent and uses only staging R2 image keys.
INSERT INTO page_media (id, placement, status, title_en, title_km, body_en, body_km, image_key, display_order, created_at, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', 'HOME_PROMOTIONS', 'PUBLISHED', 'Your Dental Health Check-in', 'ពិគ្រោះសុខភាពមាត់ធ្មេញរបស់អ្នក', 'Meet with our team to discuss your oral health, questions, and suitable next steps.', 'ជួបពិគ្រោះជាមួយក្រុមរបស់យើង ដើម្បីពិភាក្សាអំពីសុខភាពមាត់ធ្មេញ សំណួរ និងជំហានបន្ទាប់ដែលសមស្រប។', 'clinic/promotion-preventive-care-consultation.png', 10, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('91000000-0000-4000-8000-000000000002', 'HOME_PROMOTIONS', 'PUBLISHED', 'Smile Design Consultation', 'ពិគ្រោះអំពីការរចនាស្នាមញញឹម', 'Explore your questions and treatment considerations with a clinician-led consultation.', 'ស្វែងយល់អំពីសំណួរ និងជម្រើសនៃការថែទាំរបស់អ្នក តាមរយៈការពិគ្រោះជាមួយវេជ្ជបណ្ឌិត។', 'clinic/promotion-smile-design-consultation.png', 20, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('91000000-0000-4000-8000-000000000003', 'HOME_PROMOTIONS', 'PUBLISHED', 'Family Oral Health Visit', 'ការថែទាំសុខភាពមាត់ធ្មេញសម្រាប់គ្រួសារ', 'A welcoming conversation for families who want to plan their next dental visit together.', 'ការពិភាក្សាប្រកបដោយភាពកក់ក្តៅ សម្រាប់គ្រួសារដែលចង់រៀបចំការមកពិនិត្យធ្មេញលើកបន្ទាប់ជាមួយគ្នា។', 'clinic/promotion-family-oral-health-visit.png', 30, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
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
