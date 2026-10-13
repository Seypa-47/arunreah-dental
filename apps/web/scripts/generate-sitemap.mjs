import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const siteOrigin = 'https://arunreahdental.com';
const apiBaseUrl = (process.env.SEO_API_BASE_URL || 'https://api.arunreahdental.com').replace(/\/+$/, '');
const outputPath = fileURLToPath(new URL('../public/sitemap.xml', import.meta.url));
const staticPaths = [
  '/',
  '/about',
  '/services',
  '/team',
  '/branches',
  '/showcases',
  '/contact',
  '/book-appointment',
];

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

const response = await fetch(`${apiBaseUrl}/api/public/site?lang=en`);
if (!response.ok) throw new Error(`Unable to load published CMS routes (${response.status}).`);

const payload = await response.json();
const site = payload?.data?.site;
if (!site || !Array.isArray(site.services) || !Array.isArray(site.doctors) || !Array.isArray(site.showcases)) {
  throw new Error('The public site response did not contain the expected published content.');
}

const dynamicPaths = [
  ...site.services.map((service) => `/services/${encodeURIComponent(service.slug)}`),
  ...site.doctors.map((doctor) => `/team/${encodeURIComponent(doctor.slug)}`),
  ...site.showcases.map((showcase) => `/showcases/${encodeURIComponent(showcase.slug)}`),
];
const paths = [...new Set([...staticPaths, ...dynamicPaths])];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${escapeXml(new URL(path, siteOrigin).toString())}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

await writeFile(outputPath, sitemap, 'utf8');
console.log(`Generated ${paths.length} canonical URLs in ${outputPath}`);
