import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_PUBLICATIONS_PATH = path.join(ROOT, 'data', 'publications.json');

export const PUBLICATION_KINDS = Object.freeze([
  'technical-article',
  'scientific-publication',
  'talk',
  'interview',
  'proceedings-publication',
]);

export const PUBLICATION_ROLES = Object.freeze([
  'author',
  'co-author',
  'speaker',
  'panellist',
  'interview-subject',
]);

export const PUBLICATION_LINK_TYPES = Object.freeze([
  'video',
  'slides',
  'doi',
  'pdf',
  'event',
  'source',
]);

export const PUBLICATION_GROUPS = Object.freeze([
  Object.freeze({kind: 'technical-article', title: 'Технические статьи'}),
  Object.freeze({kind: 'scientific-publication', title: 'Научные публикации'}),
  Object.freeze({kind: 'talk', title: 'Доклады и конференции'}),
  Object.freeze({kind: 'interview', title: 'Интервью и приглашённые материалы'}),
  Object.freeze({kind: 'proceedings-publication', title: 'Публикации в сборниках'}),
]);

const KIND_SET = new Set(PUBLICATION_KINDS);
const ROLE_SET = new Set(PUBLICATION_ROLES);
const LINK_TYPE_SET = new Set(PUBLICATION_LINK_TYPES);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeAsOf(asOf) {
  if (asOf instanceof Date && !Number.isNaN(asOf.getTime())) return asOf.toISOString().slice(0, 10);
  if (typeof asOf === 'string' && isExactIsoDate(asOf)) return asOf;
  throw new Error('publication registry asOf must be a valid YYYY-MM-DD date');
}

function isExactIsoDate(value) {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function requireString(entry, field) {
  if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
    throw new Error(`publication ${entry.id || '<unknown>'} is missing required field: ${field}`);
  }
  return entry[field].trim();
}

function normalizeStringArray(value, {field, id, required = false, max = 12} = {}) {
  if (value === undefined && !required) return Object.freeze([]);
  if (!Array.isArray(value) || (required && value.length === 0) || value.length > max) {
    throw new Error(`invalid publication ${field} for ${id}`);
  }
  const normalized = value.map((item) => {
    if (typeof item !== 'string' || item.trim() === '') throw new Error(`invalid publication ${field} for ${id}`);
    return item.trim();
  });
  if (new Set(normalized).size !== normalized.length) throw new Error(`duplicate publication ${field} for ${id}`);
  return Object.freeze(normalized);
}

function requireHttpsUrl(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be an https URL`);
  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new Error(`${label} must be an https URL`);
  }
  if (parsed.protocol !== 'https:' || !parsed.hostname) throw new Error(`${label} must be an https URL`);
  return parsed.href;
}

function validateDate(value, {field, id, asOf}) {
  if (!isExactIsoDate(value)) throw new Error(`publication ${field} must use YYYY-MM-DD for ${id}`);
  if (value > asOf) {
    const label = field === 'date' ? 'future publication date' : 'future verification date';
    throw new Error(`${label} for ${id}: ${value}`);
  }
  return value;
}

function normalizeLinks(value, {id, canonicalUrl}) {
  if (value === undefined) return Object.freeze([]);
  if (!Array.isArray(value)) throw new Error(`publication links must be an array for ${id}`);

  const seen = new Set();
  const normalized = value.map((link, index) => {
    if (!link || typeof link !== 'object' || Array.isArray(link)) {
      throw new Error(`invalid publication link for ${id} at index ${index}`);
    }
    if (!LINK_TYPE_SET.has(link.type)) throw new Error(`unsupported publication link type for ${id}: ${link.type}`);
    if (typeof link.label !== 'string' || link.label.trim() === '') throw new Error(`publication link label is required for ${id}`);
    const url = requireHttpsUrl(link.url, `publication link for ${id}`);
    if (url === canonicalUrl) throw new Error(`publication link duplicates canonical URL for ${id}`);
    if (seen.has(url)) throw new Error(`duplicate publication link URL for ${id}: ${url}`);
    seen.add(url);
    return Object.freeze({type: link.type, label: link.label.trim(), url});
  });

  return Object.freeze(normalized);
}

function normalizeReferenceSet(value) {
  if (value === undefined || value === null) return null;
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  throw new Error('publication reference collection must be a Set or array');
}

export function validatePublicationRegistry(raw, {
  asOf = new Date(),
  projectSlugs,
  noteSlugs,
} = {}) {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('publication registry must be a non-empty array');

  const normalizedAsOf = normalizeAsOf(asOf);
  const projects = normalizeReferenceSet(projectSlugs);
  const notes = normalizeReferenceSet(noteSlugs);
  const ids = new Set();
  const canonicalUrls = new Set();
  const featuredOrders = new Set();

  const publications = raw.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`publication entry at index ${index} must be an object`);
    }

    const id = requireString(entry, 'id');
    if (!ID_PATTERN.test(id)) throw new Error(`invalid publication id: ${id}`);
    if (ids.has(id)) throw new Error(`duplicate publication id: ${id}`);
    ids.add(id);

    const title = requireString(entry, 'title');
    const kind = requireString(entry, 'kind');
    const platform = requireString(entry, 'platform');
    const date = requireString(entry, 'date');
    const role = requireString(entry, 'role');
    const language = requireString(entry, 'language');
    const summary = requireString(entry, 'summary');
    const canonicalUrlValue = requireString(entry, 'canonicalUrl');
    const verifiedAt = requireString(entry, 'verifiedAt');

    if (!KIND_SET.has(kind)) throw new Error(`unsupported publication kind for ${id}: ${kind}`);
    if (!ROLE_SET.has(role)) throw new Error(`unsupported publication role for ${id}: ${role}`);
    if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(language)) throw new Error(`invalid publication language for ${id}: ${language}`);

    const canonicalUrl = requireHttpsUrl(canonicalUrlValue, `publication canonical URL for ${id}`);
    if (canonicalUrls.has(canonicalUrl)) throw new Error(`duplicate publication canonical URL: ${canonicalUrl}`);
    canonicalUrls.add(canonicalUrl);

    const featured = entry.featured;
    if (typeof featured !== 'boolean') throw new Error(`publication featured flag must be boolean for ${id}`);
    let featuredOrder;
    if (featured) {
      if (!Number.isInteger(entry.featuredOrder) || entry.featuredOrder < 1) {
        throw new Error(`featuredOrder must be a positive integer for featured publication ${id}`);
      }
      if (featuredOrders.has(entry.featuredOrder)) throw new Error(`duplicate featured order: ${entry.featuredOrder}`);
      featuredOrders.add(entry.featuredOrder);
      featuredOrder = entry.featuredOrder;
    } else {
      if (entry.featuredOrder !== undefined) throw new Error(`featuredOrder is not allowed for non-featured publication ${id}`);
      featuredOrder = undefined;
    }

    const topics = normalizeStringArray(entry.topics, {field: 'topics', id, required: true, max: 8});
    const relatedProjects = normalizeStringArray(entry.relatedProjects, {field: 'relatedProjects', id});
    const relatedNotes = normalizeStringArray(entry.relatedNotes, {field: 'relatedNotes', id});

    if (projects) {
      for (const slug of relatedProjects) {
        if (!projects.has(slug)) throw new Error(`unknown related project for ${id}: ${slug}`);
      }
    }
    if (notes) {
      for (const slug of relatedNotes) {
        if (!notes.has(slug)) throw new Error(`unknown related note for ${id}: ${slug}`);
      }
    }

    const normalized = {
      id,
      title,
      kind,
      platform,
      date: validateDate(date, {field: 'date', id, asOf: normalizedAsOf}),
      role,
      language,
      summary,
      topics,
      canonicalUrl,
      links: normalizeLinks(entry.links, {id, canonicalUrl}),
      featured,
      ...(featured ? {featuredOrder} : {}),
      relatedProjects,
      relatedNotes,
      verifiedAt: validateDate(verifiedAt, {field: 'verifiedAt', id, asOf: normalizedAsOf}),
    };

    return Object.freeze(normalized);
  });

  return Object.freeze(publications);
}

export function loadPublicationRegistry(manifestPath = DEFAULT_PUBLICATIONS_PATH, options = {}) {
  if (!fs.existsSync(manifestPath)) throw new Error(`publication registry not found: ${manifestPath}`);
  return validatePublicationRegistry(JSON.parse(fs.readFileSync(manifestPath, 'utf8')), options);
}

export function getFeaturedPublications(publications, limit = 3) {
  if (!Array.isArray(publications)) throw new Error('publications must be an array');
  if (!Number.isInteger(limit) || limit < 0) throw new Error('featured publication limit must be a non-negative integer');
  return Object.freeze([...publications]
    .filter(({featured}) => featured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder || a.id.localeCompare(b.id))
    .slice(0, limit));
}

function compareCatalogueEntries(a, b) {
  return b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'ru');
}

export function groupPublications(publications) {
  if (!Array.isArray(publications)) throw new Error('publications must be an array');
  return Object.freeze(PUBLICATION_GROUPS.flatMap((group) => {
    const entries = publications.filter(({kind}) => kind === group.kind).sort(compareCatalogueEntries);
    if (entries.length === 0) return [];
    return [Object.freeze({
      kind: group.kind,
      title: group.title,
      publications: Object.freeze(entries),
    })];
  }));
}
