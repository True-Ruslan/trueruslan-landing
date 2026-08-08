import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

export const DEFAULT_COLLABORATION_PATH = path.join(ROOT, 'data', 'collaboration.json');
export const AVAILABILITY_VALUES = Object.freeze(['available', 'limited', 'consulting-only', 'unavailable']);
export const COLLABORATION_CATEGORIES = Object.freeze(['engineering', 'ai-integration', 'education', 'expert-content']);

const AVAILABILITY_SET = new Set(AVAILABILITY_VALUES);
const CATEGORY_SET = new Set(COLLABORATION_CATEGORIES);
const SAFE_LOCAL_HTML = /^(?!\/)(?!.*\.\.)(?!.*\\)(?![a-z][a-z\d+.-]*:)[a-zA-Z0-9_./-]+\.html$/;
const TELEGRAM_URL = /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ROOT_FIELDS = new Set(['updated', 'availability', 'contact', 'pricing', 'legalFormat', 'contextualTargets']);

function requirePlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function assertExactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`unknown ${label} field: ${key}`);
  }
}

function isRealIsoDate(value) {
  if (typeof value !== 'string' || !DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateAvailability(value) {
  requirePlainObject(value, 'collaboration availability');
  assertExactKeys(value, new Set(['engineering', 'education']), 'collaboration availability');
  for (const field of ['engineering', 'education']) {
    if (!AVAILABILITY_SET.has(value[field])) {
      throw new Error(`unknown collaboration availability for ${field}: ${value[field]}`);
    }
  }
}

function validateContact(value) {
  requirePlainObject(value, 'collaboration contact');
  assertExactKeys(value, new Set(['telegram', 'email']), 'collaboration contact');
  if (typeof value.telegram !== 'string' || !TELEGRAM_URL.test(value.telegram)) {
    throw new Error(`invalid collaboration Telegram: ${value.telegram}`);
  }
  if (typeof value.email !== 'string' || !EMAIL.test(value.email)) {
    throw new Error(`invalid collaboration email: ${value.email}`);
  }
}

function validateContextualTargets(value) {
  requirePlainObject(value, 'collaboration contextualTargets');
  for (const [target, category] of Object.entries(value)) {
    if (!SAFE_LOCAL_HTML.test(target) || path.posix.normalize(target) !== target) {
      throw new Error(`unsafe collaboration target: ${target}`);
    }
    if (!CATEGORY_SET.has(category)) {
      throw new Error(`unknown collaboration category for ${target}: ${category}`);
    }
  }
}

export function validateCollaboration(value) {
  requirePlainObject(value, 'collaboration manifest');
  assertExactKeys(value, ROOT_FIELDS, 'collaboration');

  if (!isRealIsoDate(value.updated)) throw new Error(`invalid collaboration updated date: ${value.updated}`);
  validateAvailability(value.availability);
  validateContact(value.contact);
  if (value.pricing !== 'estimate-only') {
    throw new Error(`unsupported collaboration pricing policy: ${value.pricing}`);
  }
  if (value.legalFormat !== 'self-employed-receipt-supported') {
    throw new Error(`unsupported collaboration legal format: ${value.legalFormat}`);
  }
  validateContextualTargets(value.contextualTargets);

  return value;
}

export function loadCollaboration(manifestPath = DEFAULT_COLLABORATION_PATH) {
  let raw;
  try {
    raw = fs.readFileSync(manifestPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`collaboration manifest not found: ${manifestPath}`);
    throw error;
  }
  return validateCollaboration(JSON.parse(raw));
}

export function resolveContextualCollaboration(collaboration, target) {
  const validated = validateCollaboration(collaboration);
  if (typeof target !== 'string' || !SAFE_LOCAL_HTML.test(target) || path.posix.normalize(target) !== target) {
    return null;
  }
  const category = validated.contextualTargets[target];
  return category ? {target, category} : null;
}
