ALTER TABLE services ADD COLUMN editorial_label_en TEXT;
ALTER TABLE services ADD COLUMN editorial_label_km TEXT;
ALTER TABLE services ADD COLUMN editorial_title_en TEXT;
ALTER TABLE services ADD COLUMN editorial_title_km TEXT;

UPDATE services
SET
  editorial_label_en = 'Treatment guide',
  editorial_label_km = 'ព័ត៌មានអំពីការព្យាបាល',
  editorial_title_en = 'Your implant treatment journey',
  editorial_title_km = 'ដំណើរការព្យាបាលដាំបង្គោលក្នុងឆ្អឹងរបស់អ្នក'
WHERE slug = 'dental-implants';

UPDATE services
SET
  editorial_label_en = 'Treatment guide',
  editorial_label_km = 'ព័ត៌មានអំពីការព្យាបាល',
  editorial_title_en = 'Your orthodontic treatment journey',
  editorial_title_km = 'ដំណើរការព្យាបាលពត់តម្រង់ធ្មេញរបស់អ្នក'
WHERE slug = 'orthodontics';

UPDATE services
SET
  editorial_label_en = 'Service guide',
  editorial_label_km = 'ព័ត៌មានអំពីសេវា',
  editorial_title_en = 'Your smile design journey',
  editorial_title_km = 'ដំណើរការរចនាស្នាមញញឹមរបស់អ្នក'
WHERE slug = 'digital-smile-design';
