export const siteOrigin = 'https://arunreahdental.com';

export const staticSeoRoutes = [
  {
    path: '/',
    title: 'Dental Clinic in Phnom Penh | Arunreah Dental Clinic',
    description: 'Arunreah Dental Clinic provides patient-focused dental care in Phnom Penh, Cambodia, with an emphasis on comfort, precision, and clinical excellence.',
  },
  {
    path: '/about',
    title: 'About Our Dental Clinic | Arunreah Dental Clinic',
    description: 'Learn about Arunreah Dental Clinic, our patient-focused approach, and our commitment to high-quality dental care in Phnom Penh.',
  },
  {
    path: '/services',
    title: 'Dental Services in Phnom Penh | Arunreah Dental Clinic',
    description: 'Explore preventive, restorative, cosmetic, orthodontic, implant, and family dental services at Arunreah Dental Clinic in Phnom Penh.',
  },
  {
    path: '/team',
    title: 'Dentists and Dental Team in Phnom Penh | Arunreah Dental Clinic',
    description: 'Meet the dentists and care team at Arunreah Dental Clinic in Phnom Penh, Cambodia.',
  },
  {
    path: '/branches',
    title: 'Dental Clinic Locations in Phnom Penh | Arunreah Dental Clinic',
    description: 'Find Arunreah Dental Clinic branches, opening hours, phone numbers, and directions in Phnom Penh.',
  },
  {
    path: '/showcases',
    title: 'Dental Care Stories and Showcases | Arunreah Dental Clinic',
    description: 'Read dental care stories, patient education, and clinic updates from Arunreah Dental Clinic.',
  },
  {
    path: '/contact',
    title: 'Contact Our Dental Clinic | Arunreah Dental Clinic',
    description: 'Contact Arunreah Dental Clinic in Phnom Penh for clinic information, directions, and dental appointment enquiries.',
  },
  {
    path: '/book-appointment',
    title: 'Request a Dental Appointment | Arunreah Dental Clinic',
    description: 'Request a dental appointment with Arunreah Dental Clinic in Phnom Penh. Appointment requests are reviewed by the clinic team.',
  },
];

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function cleanDescription(value, fallback) {
  const cleaned = value?.replaceAll(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function withSiteName(title) {
  const cleaned = title?.trim();
  if (!cleaned) return 'Arunreah Dental Clinic';
  return cleaned.toLowerCase().includes('arunreah dental clinic')
    ? cleaned
    : `${cleaned} | Arunreah Dental Clinic`;
}

export function buildPublishedRoutes(site, serviceDetails = new Map()) {
  const fallback = staticSeoRoutes[0].description;
  const services = site.services.map((service) => {
    const detail = serviceDetails.get(service.slug);
    return {
      path: `/services/${encodeURIComponent(service.slug)}`,
      title: withSiteName(detail?.seo?.title || service.name),
      description: cleanDescription(
        detail?.seo?.description || detail?.hero?.summary || service.shortDescription,
        fallback,
      ),
    };
  });
  const team = site.doctors.map((doctor) => ({
    path: `/team/${encodeURIComponent(doctor.slug)}`,
    title: withSiteName(doctor.name),
    description: cleanDescription(
      doctor.shortBio,
      `${doctor.name} is part of the dental care team at Arunreah Dental Clinic in Phnom Penh.`,
    ),
  }));
  const showcases = site.showcases.map((showcase) => ({
    path: `/showcases/${encodeURIComponent(showcase.slug)}`,
    title: withSiteName(showcase.title),
    description: cleanDescription(showcase.summary, fallback),
  }));

  return [...staticSeoRoutes, ...services, ...team, ...showcases];
}

export function buildSitemapXml(routes) {
  const uniquePaths = [...new Set(routes.map((route) => route.path))];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniquePaths.map((routePath) => {
      const url = new URL(routePath, siteOrigin).toString();
      return `  <url><loc>${escapeXml(url)}</loc></url>`;
    }),
    '</urlset>',
    '',
  ].join('\n');
}

function replaceOrInsert(html, expression, replacement) {
  if (expression.test(html)) return html.replace(expression, replacement);
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

export function applySeoToHtml(template, route) {
  const canonicalUrl = new URL(route.path, siteOrigin).toString();
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const canonical = escapeHtml(canonicalUrl);
  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  html = replaceOrInsert(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${description}" />`,
  );
  html = replaceOrInsert(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${canonical}" />`,
  );
  html = replaceOrInsert(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${description}" />`);
  return html;
}
