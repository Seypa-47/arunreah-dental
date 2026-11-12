import assert from 'node:assert/strict';
import test from 'node:test';
import { applySeoToHtml, buildPublishedRoutes, buildSitemapXml } from './seo-build-lib.mjs';

const site = {
  services: [{ slug: 'dental-implants', name: 'Dental Implants', shortDescription: 'Replace missing teeth.' }],
  doctors: [{ slug: 'dr-test', name: 'Dr. Test', shortBio: 'Dentist in Phnom Penh.' }],
  showcases: [],
};

test('published routes contain live CMS entries and omit absent showcase entries', () => {
  const routes = buildPublishedRoutes(site);
  assert.ok(routes.some((route) => route.path === '/services/dental-implants'));
  assert.ok(routes.some((route) => route.path === '/team/dr-test'));
  assert.equal(routes.some((route) => route.path.startsWith('/showcases/')), false);
});

test('sitemap contains canonical public URLs without duplicates', () => {
  const xml = buildSitemapXml([{ path: '/', title: '', description: '' }, { path: '/', title: '', description: '' }]);
  assert.equal(xml.match(/<loc>/g)?.length, 1);
  assert.match(xml, /https:\/\/arunreahdental\.com\//);
});

test('route HTML has matching canonical, title, and descriptions before JavaScript runs', () => {
  const template = '<head><title>Old</title><meta name="description" content="Old" /><link rel="canonical" href="https://example.com/" /><meta property="og:title" content="Old" /><meta property="og:description" content="Old" /><meta property="og:url" content="https://example.com/" /><meta name="twitter:title" content="Old" /><meta name="twitter:description" content="Old" /></head>';
  const html = applySeoToHtml(template, { path: '/team/dr-test', title: 'Dr. Test | Arunreah Dental Clinic', description: 'Dentist & clinician' });
  assert.match(html, /<title>Dr\. Test \| Arunreah Dental Clinic<\/title>/);
  assert.match(html, /href="https:\/\/arunreahdental\.com\/team\/dr-test"/);
  assert.match(html, /content="Dentist &amp; clinician"/);
});
