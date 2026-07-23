import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_ANALYTICS_POLICY_PATH = path.join(ROOT, 'data', 'analytics.json');

const POLICY_FIELDS = Object.freeze([
  'provider',
  'measurement',
  'activation',
  'customEvents',
  'cookies',
  'persistentStorage',
  'crossSiteTracking',
  'sessionReplay',
]);

const POLICY_FIELD_SET = new Set(POLICY_FIELDS);
const PRIVACY_FLAGS = Object.freeze([
  ['customEvents', 'custom events'],
  ['cookies', 'cookies'],
  ['persistentStorage', 'persistent storage'],
  ['crossSiteTracking', 'cross-site tracking'],
  ['sessionReplay', 'session replay'],
]);

export function validateAnalyticsPolicy(policy) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new Error('analytics policy must be an object');
  }

  for (const key of Object.keys(policy)) {
    if (!POLICY_FIELD_SET.has(key)) {
      throw new Error(`unknown analytics policy field: ${key}`);
    }
  }

  for (const field of POLICY_FIELDS) {
    if (!(field in policy)) {
      throw new Error(`analytics policy is missing required field: ${field}`);
    }
  }

  if (policy.provider !== 'cloudflare-web-analytics') {
    throw new Error(`unsupported analytics provider: ${policy.provider}`);
  }
  if (policy.measurement !== 'pageviews-and-rum') {
    throw new Error(`unsupported analytics measurement: ${policy.measurement}`);
  }
  if (policy.activation !== 'token-required') {
    throw new Error(`unsupported analytics activation: ${policy.activation}`);
  }

  for (const [field, label] of PRIVACY_FLAGS) {
    if (policy[field] !== false) {
      throw new Error(`${label} are forbidden by the privacy analytics policy`);
    }
  }

  return Object.freeze({...policy});
}

export function loadAnalyticsPolicy(manifestPath = DEFAULT_ANALYTICS_POLICY_PATH) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`analytics policy not found: ${manifestPath}`);
  }

  return validateAnalyticsPolicy(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
}

export function normalizeAnalyticsToken(token) {
  if (token === undefined || token === null) return null;
  const normalized = String(token).trim();
  if (!normalized) return null;
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(normalized)) {
    throw new Error('invalid configured analytics token');
  }
  return normalized;
}
