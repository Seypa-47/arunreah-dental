# Staging CMS copy inventory

This inventory records the reviewed copy refresh applied only to the staging
D1 database by `apps/api/scripts/apply-staging-cms-copy.sql`. It is content
data, not a schema migration. It must never be applied to production.

## Editorial standard

- English and Khmer were independently written for clear, patient-friendly
  reading; neither language is a literal fallback for the other.
- Copy uses *appointment request* language and never promises confirmation,
  treatment outcomes, comfort, or medical results.
- Existing factual addresses, phone numbers, hours, statistics, media keys,
  statuses, IDs, slugs, and display order are retained.
- No credentials, training claims, or clinician statistics were added where the
  existing static source did not provide verified support.

## Content records

| Record type | ID / slug | Existing issue | Revised English summary | Revised Khmer summary | Source / basis |
| --- | --- | --- | --- | --- | --- |
| Clinic | `clinic` | Generic tagline and about text | Clear patient-first introduction and planning language | Clear Khmer clinic introduction and care-planning language | Existing clinic facts; neutral wording |
| Branch | `toul-tompoung` | Missing public summary and hero copy | Local, welcoming appointment-request copy | Local Khmer branch and request copy | Existing address, hours, and branch identity; neutral wording |
| Branch | `psa-chas` | Missing public summary and hero copy | Local, welcoming appointment-request copy | Local Khmer branch and request copy | Existing address, hours, and branch identity; neutral wording |
| Service | `dental-implants` | Repetitive claims and sparse benefits | Consultation-led missing-tooth replacement explanation | Consultation-led Khmer explanation | Existing service scope; neutral wording |
| Service | `teeth-whitening` | Generic marketing language | Assessment-led whitening explanation | Assessment-led Khmer explanation | Existing service scope; neutral wording |
| Service | `routine-cleaning` | Sparse detail and benefits | Preventive cleaning and oral-health review | Preventive Khmer cleaning guidance | Existing service scope; neutral wording |
| Service | `orthodontics` | Sparse detail and benefits | Alignment and bite consultation explanation | Alignment and bite Khmer explanation | Existing service scope; neutral wording |
| Service | `general-dentistry` | Missing staging record | Everyday checkup and preventive-care content | Everyday Khmer dental-care content | Existing static public service record |
| Service | `gum-periodontal-treatment` | Missing staging record | Gum-health assessment and care options | Khmer gum-health assessment content | Existing static public service record |
| Service | `root-canal-and-fillings` | Missing staging record | Tooth-assessment and restorative-options content | Khmer restorative-care content | Existing static public service record |
| Service | `oral-surgery` | Missing staging record | Consultation-led surgical dental-care content | Khmer surgical-care content | Existing static public service record |
| Doctor | `sreng-heng` | Promotional biography | Patient-first implant/restorative profile | Khmer patient-first profile | Existing doctor profile; retained existing stats/education |
| Doctor | `chho-sonthary` | Repetitive short biography | Clear orthodontic/implant profile | Khmer orthodontic/implant profile | Existing doctor profile; education unchanged |
| Doctor | `yim-delux` | Generic biography | Alignment and bite-care profile | Khmer alignment and bite profile | Existing doctor profile; education unchanged |
| Doctor | `chuong-kunthy` | Outcome-focused biography | Assessment-led implant profile | Khmer assessment-led profile | Existing doctor profile; education unchanged |
| Doctor | `taing-thanith` | Missing staging record | Smile-planning and implant-related profile | Khmer smile-planning profile | Existing static doctor profile; no credentials/statistics/media invented |
| Doctor | `chea-kimly` | Missing staging record | Multidisciplinary, coordinated-care profile | Khmer multidisciplinary profile | Existing static doctor profile; no credentials/statistics/media invented |
| Doctor | `heng-bunhabb` | Missing staging record | Root-focused and implant-related profile | Khmer root-focused profile | Existing static doctor profile; no credentials/statistics/media invented |
| Showcase | `restore-your-smile-with-dental-implants` | Guarantee-like wording | Patient education about discussing options | Khmer patient-education copy | Existing topic; neutral wording |
| Showcase | `caring-for-your-familys-smile-at-every-age` | Generic education wording | Family oral-health habits and visits | Khmer family oral-health copy | Existing topic; neutral wording |
| Showcase | `what-to-expect-during-your-first-visit` | Vague first-visit copy | Clear first-consultation guidance | Khmer first-consultation guidance | Existing topic; neutral wording |

## Intentionally unchanged facts

- Branch addresses, phone numbers, map URLs, opening hours, and operational
  flags.
- Clinic statistics and all existing media object keys.
- Existing doctor education records and existing numeric doctor statistics.
- Contact phone, email, social links, and business hours.
- Relationships, appointments, and all production resources.

## Known content limits

Newly represented doctors have no verified staging R2 photo key, numeric
statistics, or education record in the supplied source. Their records use
neutral text and intentionally leave those optional fields empty until the
clinic supplies verified information.
