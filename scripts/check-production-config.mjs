import { readFile } from 'node:fs/promises';

const configUrl = new URL('../apps/api/wrangler.jsonc', import.meta.url);

function stripJsonComments(source) {
  let result = '';
  let inString = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (inString) {
      result += character;
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      result += character;
      continue;
    }
    if (character === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') index += 1;
      result += '\n';
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        if (source[index] === '\n') result += '\n';
        index += 1;
      }
      index += 1;
      continue;
    }
    result += character;
  }
  return result.replace(/,\s*([}\]])/g, '$1');
}

function firstBinding(environment, key) {
  return Array.isArray(environment?.[key]) ? environment[key][0] : undefined;
}

function isPlaceholder(value) {
  return (
    typeof value !== 'string' ||
    value.trim() === '' ||
    /REPLACE_|PLACEHOLDER|example\.(?:com|test)|00000000-0000-0000-0000-000000000000/i.test(
      value,
    )
  );
}

function httpsOrigin(value, expectedHost) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === expectedHost &&
      url.username === '' &&
      url.password === '' &&
      url.search === '' &&
      url.hash === ''
    );
  } catch {
    return false;
  }
}

const source = await readFile(configUrl, 'utf8');
let config;
try {
  config = JSON.parse(stripJsonComments(source));
} catch {
  console.error('Production configuration check failed: wrangler.jsonc could not be parsed safely.');
  process.exit(1);
}

const staging = config.env?.staging;
const production = config.env?.production;
const failures = [];
const expectedProductionAccountId = 'e3fab4e544dd014935f9289d297c0945';

if (!staging || !production) {
  failures.push('staging and production environments must both exist');
} else {
  const stagingD1 = firstBinding(staging, 'd1_databases');
  const productionD1 = firstBinding(production, 'd1_databases');
  const stagingR2 = firstBinding(staging, 'r2_buckets');
  const productionR2 = firstBinding(production, 'r2_buckets');
  const productionRoute = production.routes?.[0]?.pattern;
  const productionVars = production.vars ?? {};

  if (productionVars.APP_ENV !== 'production') failures.push('APP_ENV=production');
  if (production.account_id !== expectedProductionAccountId) {
    failures.push('the official production Cloudflare account id');
  }
  if (production.account_id === staging.account_id) {
    failures.push('separate staging and production Cloudflare accounts');
  }
  if (
    isPlaceholder(productionD1?.database_id) ||
    productionD1?.database_id === stagingD1?.database_id
  ) failures.push('a non-placeholder production-only D1 database id');
  if (
    isPlaceholder(productionR2?.bucket_name) ||
    productionR2?.bucket_name === stagingR2?.bucket_name
  ) failures.push('a production-only R2 bucket');
  if (!httpsOrigin(productionVars.CORS_ALLOWED_ORIGINS, 'arunreahdental.com')) {
    failures.push('the exact HTTPS production frontend origin');
  }
  if (!httpsOrigin(productionVars.ADMIN_APP_BASE_URL, 'arunreahdental.com')) {
    failures.push('the exact HTTPS production admin application origin');
  }
  if (!httpsOrigin(`https://${productionRoute ?? ''}`, 'api.arunreahdental.com')) {
    failures.push('the expected production API custom domain');
  }
  if (!httpsOrigin(productionVars.MEDIA_PUBLIC_BASE_URL, 'media.arunreahdental.com')) {
    failures.push('the expected production media custom domain');
  }
  if (production.workers_dev !== false) failures.push('workers_dev=false in production');
  if (production.observability?.logs?.persist !== true) failures.push('persisted production logs');

  const productionDestinations = [
    productionVars.EMAIL_NOTIFICATION_RECIPIENT,
    productionVars.TELEGRAM_CHAT_ID,
  ].filter(Boolean);
  if (productionDestinations.some((value) => /staging|development|dev-only|test/i.test(value))) {
    failures.push('production-only notification destinations');
  }
}

if (failures.length > 0) {
  console.error(`Production configuration check failed: configure ${failures.join('; ')}.`);
  process.exitCode = 1;
} else {
  console.log('Production Worker configuration passed repository safety checks.');
}
