import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const BUCKET_NAME = 'arunreah-dental-staging';
const ROOT_DIR = process.cwd();
const PUBLIC_ASSETS = resolve(ROOT_DIR, 'apps/web/public/assets/landing');

// Map R2 object keys in staging database to local high-resolution assets
const MEDIA_MAPPINGS = [
  // Clinic logo
  {
    key: 'clinic/8d0d3c50-9bfd-4aa4-9a8f-8ee5a2a9b4f3-clinic-logo.png',
    file: join(PUBLIC_ASSETS, 'footer-logo.png'),
    contentType: 'image/png'
  },
  // Branches
  {
    key: 'branches/0ff68fa7-c1fa-48ef-a043-722f65353d0f-psa-chas-hero.png',
    file: join(PUBLIC_ASSETS, 'hero-psa-chas.png'),
    contentType: 'image/png'
  },
  {
    key: 'branches/09781bcf-a1fc-4caa-94c4-90a4c8ced07e-psa-chas-card.png',
    file: join(PUBLIC_ASSETS, 'branch-card-clinic.png'),
    contentType: 'image/png'
  },
  {
    key: 'branches/f90c2194-fc94-4572-8987-9b6f77a53fe2-img-4005.png',
    file: join(PUBLIC_ASSETS, 'branches-clinic.png'),
    contentType: 'image/png'
  },
  {
    key: 'branches/46f423d9-4c0c-43da-8b74-5df713ae5693-vmqr0.jpg',
    file: join(PUBLIC_ASSETS, 'branch-card-clinic.png'),
    contentType: 'image/png'
  },
  // Services
  {
    key: 'services/077de4d8-d6c2-4c2f-b78d-e0a5a842cda9-routine-cleaning.png',
    file: join(PUBLIC_ASSETS, 'service-general.png'),
    contentType: 'image/png'
  },
  {
    key: 'services/5b2a04ec-303b-4f4e-a5b9-c7b9647f0be1-dental-implants.png',
    file: join(PUBLIC_ASSETS, 'hero-clinic.png'),
    contentType: 'image/png'
  },
  {
    key: 'services/6afb2a3c-61af-4ea5-94e5-7d34845d4b3a-orthodontics.png',
    file: join(PUBLIC_ASSETS, 'service-general.png'),
    contentType: 'image/png'
  },
  // Doctors
  {
    key: 'doctors/ab2bcf1d-b3c4-4400-ad90-5a042b70b00d-sreng-heng.jpg',
    file: join(PUBLIC_ASSETS, 'doctor-sreng-heng.jpg'),
    contentType: 'image/jpeg'
  },
  {
    key: 'doctors/a807276d-4878-4cb4-b90d-6e4e40650d7c-chho-sonthary.jpg',
    file: join(PUBLIC_ASSETS, 'doctor-chho-sontary.jpg'),
    contentType: 'image/jpeg'
  },
  {
    key: 'doctors/5f5073a2-61cc-48fc-b462-8a20c131194c-yim-delux.jpg',
    file: join(PUBLIC_ASSETS, 'doctor-yim-delux-new.jpg'),
    contentType: 'image/jpeg'
  },
  {
    key: 'doctors/113bff65-410d-4fa2-bc4d-80b1a1441fe7-chuong-kunthy.jpg',
    file: join(PUBLIC_ASSETS, 'doctor-chuong-kunthy.jpg'),
    contentType: 'image/jpeg'
  },
  // Showcases
  {
    key: 'showcases/bb3cb831-3b2a-43ba-8d39-635998bf4f80-implant-story.jpg',
    file: join(PUBLIC_ASSETS, 'showcase-family.png'),
    contentType: 'image/png'
  },
  {
    key: 'showcases/911bdb33-7337-4b61-8d9e-64e60a4c6323-family-smile.png',
    file: join(PUBLIC_ASSETS, 'showcase-family.png'),
    contentType: 'image/png'
  },
  {
    key: 'showcases/clinic-reception-2026-09-06.jpg',
    file: join(PUBLIC_ASSETS, 'hero-clinic.png'),
    contentType: 'image/png'
  }
];

async function syncMedia() {
  console.log(`Starting media sync to R2 bucket: ${BUCKET_NAME}...`);

  for (const item of MEDIA_MAPPINGS) {
    if (!existsSync(item.file)) {
      console.warn(`[SKIP] Local file not found: ${item.file}`);
      continue;
    }

    const destination = `${BUCKET_NAME}/${item.key}`;
    console.log(`Uploading ${item.key}...`);
    try {
      execSync(
        `pnpm --filter @arunreah/api exec wrangler r2 object put "${destination}" --file="${item.file}" --content-type="${item.contentType}" --remote`,
        { stdio: 'inherit' }
      );
      console.log(`✓ Uploaded ${item.key}`);
    } catch (err) {
      console.error(`✗ Failed to upload ${item.key}:`, err.message);
    }
  }

  console.log('Media sync complete!');
}

syncMedia();
