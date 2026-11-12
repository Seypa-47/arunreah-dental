import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySeoToHtml, buildPublishedRoutes, buildSitemapXml } from './seo-build-lib.mjs';

const apiBaseUrl = (process.env.SEO_API_BASE_URL || 'https://api.arunreahdental.com').replace(/\/+$/, '');
const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url));
const indexPath = fileURLToPath(new URL('../dist/index.html', import.meta.url));

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load published SEO data (${response.status}) from ${url}.`);
  return response.json();
}

const payload = await fetchJson(`${apiBaseUrl}/api/public/site?lang=en`);
const site = payload?.data?.site;
if (!site || !Array.isArray(site.services) || !Array.isArray(site.doctors) || !Array.isArray(site.showcases)) {
  throw new Error('The public site response did not contain the expected published content.');
}

const serviceDetailEntries = await Promise.all(site.services.map(async (service) => {
  const detailPayload = await fetchJson(`${apiBaseUrl}/api/public/services/${encodeURIComponent(service.slug)}?lang=en`);
  return [service.slug, detailPayload?.data?.service];
}));
const serviceDetails = new Map(serviceDetailEntries);
const routes = buildPublishedRoutes(site, serviceDetails);
const template = await readFile(indexPath, 'utf8');

for (const route of routes) {
  const outputPath = route.path === '/'
    ? indexPath
    : `${distDirectory}${route.path.slice(1)}.html`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, applySeoToHtml(template, route), 'utf8');
}

await writeFile(`${distDirectory}sitemap.xml`, buildSitemapXml(routes), 'utf8');
console.log(`Prepared route-specific metadata and ${routes.length} published sitemap URLs.`);
