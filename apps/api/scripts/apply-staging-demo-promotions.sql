-- Staging demo content for the Home · Promotions CMS placement.
-- This script is idempotent and uses only staging R2 image keys.
INSERT INTO page_media (id, placement, status, title_en, title_km, body_en, body_km, badge_en, badge_km, discount_en, discount_km, benefits_en, benefits_km, valid_until, image_key, display_order, created_at, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', 'HOME_PROMOTIONS', 'PUBLISHED', 'Professional Teeth Cleaning', 'សម្អាតធ្មេញដោយអ្នកជំនាញ', 'A cleaner smile and a healthier you.', 'ស្នាមញញឹមស្អាត និងសុខភាពមាត់ធ្មេញកាន់តែល្អ។', 'Limited-time offer', 'ការផ្តល់ជូនរយៈពេលកំណត់', '20% OFF', 'បញ្ចុះតម្លៃ 20%', 'Remove plaque and stain\nHealthier gums\nFresher breath', 'កម្ចាត់កំណក និងស្នាមប្រឡាក់\nអញ្ចាញធ្មេញមានសុខភាពល្អ\nដង្ហើមស្រស់ស្រាយ', '2026-12-31', 'clinic/promotion-dental-health-checkin.png', 10, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('91000000-0000-4000-8000-000000000002', 'HOME_PROMOTIONS', 'PUBLISHED', 'Teeth Whitening', 'ធ្វើឱ្យធ្មេញស', 'Brighter teeth, more confident you.', 'ធ្មេញកាន់តែភ្លឺ ស្នាមញញឹមកាន់តែជឿជាក់។', 'Most popular offer', 'កម្មវិធីពេញនិយម', '30% OFF', 'បញ្ចុះតម្លៃ 30%', 'Whiter, brighter smile\nSafe and effective\nLonger-lasting results', 'ស្នាមញញឹមកាន់តែភ្លឺ\nមានសុវត្ថិភាព និងប្រសិទ្ធភាព\nលទ្ធផលយូរអង្វែង', '2026-12-31', 'clinic/promotion-smile-design.png', 20, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('91000000-0000-4000-8000-000000000003', 'HOME_PROMOTIONS', 'PUBLISHED', 'Family Dental Check-up', 'ពិនិត្យសុខភាពមាត់ធ្មេញសម្រាប់គ្រួសារ', 'Healthy smiles for the whole family.', 'ស្នាមញញឹមមានសុខភាពល្អសម្រាប់គ្រួសារទាំងមូល។', 'Family package', 'កញ្ចប់សម្រាប់គ្រួសារ', '15% OFF', 'បញ្ចុះតម្លៃ 15%', 'Comprehensive examination\nFamily-friendly care\nPersonalized care plan', 'ពិនិត្យសុខភាពមាត់ធ្មេញគ្រប់ជ្រុងជ្រោយ\nការថែទាំសម្រាប់គ្រួសារ\nផែនការថែទាំសមស្រប', '2026-12-31', 'clinic/promotion-family-oral-health.png', 30, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT(id) DO UPDATE SET
  placement = excluded.placement,
  status = excluded.status,
  title_en = excluded.title_en,
  title_km = excluded.title_km,
  body_en = excluded.body_en,
  body_km = excluded.body_km,
  badge_en = excluded.badge_en,
  badge_km = excluded.badge_km,
  discount_en = excluded.discount_en,
  discount_km = excluded.discount_km,
  benefits_en = excluded.benefits_en,
  benefits_km = excluded.benefits_km,
  valid_until = excluded.valid_until,
  image_key = excluded.image_key,
  display_order = excluded.display_order,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
