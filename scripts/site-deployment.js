import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_SITE_MANIFEST_PATH = path.join(ROOT, 'data', 'site.json');
export const DEFAULT_SITE_DEPLOYMENT_REPORT_PATH = path.join(ROOT, 'site-deployment-contract.json');

const MANIFEST_FIELDS = Object.freeze([
  'legacyOrigin',
  'customOrigin',
  'customHostname',
  'alternateHostname',
]);
const SITE_DEPLOYMENT_MODES = new Set(['auto', 'legacy', 'custom']);

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function validateOrigin(value, label, {rootOnly = false} = {}) {
  const origin = requireString(value, label);
  if (origin.endsWith('/')) throw new Error(`${label} must not have a trailing slash`);

  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }

  if (parsed.protocol !== 'https:') throw new Error(`${label} must use https`);
  if (parsed.username || parsed.password) throw new Error(`${label} must not contain credentials`);
  if (parsed.search || parsed.hash) throw new Error(`${label} must not contain query or fragment`);
  if (parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname) !== origin) {
    throw new Error(`${label} must be a normalized HTTPS origin`);
  }
  if (rootOnly && parsed.pathname !== '/') {
    throw new Error(`${label} must be a root origin`);
  }

  return origin;
}

function validateHostname(value, label) {
  const hostname = requireString(value, label).toLowerCase();
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)) {
    throw new Error(`${label} must be a valid hostname`);
  }
  return hostname;
}

export function validateSiteManifest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('site manifest must be an object');
  }

  const keys = Object.keys(value).sort();
  const expectedKeys = [...MANIFEST_FIELDS].sort();
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    throw new Error(`site manifest fields must be exactly: ${MANIFEST_FIELDS.join(', ')}`);
  }

  const legacyOrigin = validateOrigin(value.legacyOrigin, 'legacyOrigin');
  const customOrigin = validateOrigin(value.customOrigin, 'customOrigin', {rootOnly: true});
  const customHostname = validateHostname(value.customHostname, 'customHostname');
  const alternateHostname = validateHostname(value.alternateHostname, 'alternateHostname');

  if (new URL(customOrigin).hostname !== customHostname) {
    throw new Error('customHostname must match customOrigin');
  }
  if (alternateHostname !== `www.${customHostname}`) {
    throw new Error('alternateHostname must be the www alternate for customHostname');
  }
  if (legacyOrigin === customOrigin) {
    throw new Error('legacyOrigin and customOrigin must be different');
  }

  return {legacyOrigin, customOrigin, customHostname, alternateHostname};
}

export function loadSiteManifest(manifestPath = DEFAULT_SITE_MANIFEST_PATH) {
  if (!fs.existsSync(manifestPath)) throw new Error(`site manifest not found: ${manifestPath}`);
  return validateSiteManifest(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
}

function state(mode, origin, target, reason) {
  return Object.freeze({
    mode,
    origin,
    productionUrl: `${origin}/`,
    target,
    reason,
  });
}

export function resolveSiteDeployment({
  mode = 'auto',
  configuredOrigin = '',
  manifest = loadSiteManifest(),
} = {}) {
  const validatedManifest = validateSiteManifest(manifest);
  const normalizedMode = String(mode || 'auto').trim().toLowerCase();
  if (!SITE_DEPLOYMENT_MODES.has(normalizedMode)) {
    throw new Error(`invalid site deployment mode: ${mode}`);
  }

  if (normalizedMode === 'legacy') {
    return state('legacy', validatedManifest.legacyOrigin, 'legacy', 'forced-legacy');
  }
  if (normalizedMode === 'custom') {
    return state('custom', validatedManifest.customOrigin, 'custom', 'forced-custom');
  }

  const configured = String(configuredOrigin || '').trim();
  if (!configured) {
    return state('auto', validatedManifest.legacyOrigin, 'legacy', 'legacy-default');
  }
  if (configured === validatedManifest.legacyOrigin) {
    return state('auto', validatedManifest.legacyOrigin, 'legacy', 'configured-legacy');
  }
  if (configured === validatedManifest.customOrigin) {
    return state('auto', validatedManifest.customOrigin, 'custom', 'configured-custom');
  }

  throw new Error(
    `configured production site origin must be exactly ${validatedManifest.legacyOrigin} or ${validatedManifest.customOrigin}`,
  );
}

export function writeSiteDeploymentEnvironment(stateValue, {envPath = process.env.GITHUB_ENV} = {}) {
  if (!envPath) throw new Error('GITHUB_ENV or envPath is required');
  const content = [
    `SITE_URL=${stateValue.origin}`,
    `PRODUCTION_URL=${stateValue.productionUrl}`,
    `SITE_DEPLOYMENT_TARGET=${stateValue.target}`,
    `SITE_DEPLOYMENT_REASON=${stateValue.reason}`,
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(envPath), {recursive: true});
  fs.appendFileSync(envPath, content, 'utf8');
  return envPath;
}

export function writeSiteDeploymentReport(
  stateValue,
  reportPath = DEFAULT_SITE_DEPLOYMENT_REPORT_PATH,
) {
  const bounded = {
    mode: stateValue.mode,
    origin: stateValue.origin,
    productionUrl: stateValue.productionUrl,
    target: stateValue.target,
    reason: stateValue.reason,
  };
  fs.mkdirSync(path.dirname(reportPath), {recursive: true});
  fs.writeFileSync(reportPath, `${JSON.stringify(bounded, null, 2)}\n`, 'utf8');
  return reportPath;
}

async function main() {
  const manifest = loadSiteManifest(process.env.SITE_MANIFEST_PATH || DEFAULT_SITE_MANIFEST_PATH);
  const deployment = resolveSiteDeployment({
    mode: process.env.SITE_DEPLOYMENT_MODE || 'auto',
    configuredOrigin: process.env.TR_PRODUCTION_SITE_URL || '',
    manifest,
  });

  writeSiteDeploymentEnvironment(deployment);
  writeSiteDeploymentReport(
    deployment,
    process.env.SITE_DEPLOYMENT_REPORT_PATH || DEFAULT_SITE_DEPLOYMENT_REPORT_PATH,
  );
  console.log(JSON.stringify(deployment, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
