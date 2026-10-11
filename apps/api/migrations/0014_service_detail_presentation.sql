ALTER TABLE services ADD COLUMN detail_presentation TEXT NOT NULL DEFAULT 'STANDARD';

UPDATE services SET detail_presentation = 'JOURNEY'
WHERE slug IN ('dental-implants', 'orthodontics', 'digital-smile-design');

UPDATE services SET detail_presentation = 'CARE_MENU' WHERE slug = 'general-dentistry';
UPDATE services SET detail_presentation = 'CLINICAL_SCOPE' WHERE slug = 'oral-surgery';
UPDATE services SET detail_presentation = 'IMAGING_GUIDE' WHERE slug = 'dental-radiography';
UPDATE services SET detail_presentation = 'PROBLEM_TO_CARE' WHERE slug = 'root-canal-treatment';
UPDATE services SET detail_presentation = 'FAMILY_CARE' WHERE slug = 'pediatric-dentistry';
