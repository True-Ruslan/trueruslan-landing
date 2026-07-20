import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parse, serialize} from 'parse5';
import * as utils from 'parse5-utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_MANIFEST = path.join(ROOT, 'data', 'page-meta.json');
const ALLOWED_ACCENTS = new Set(['cyan', 'violet', 'green']);
const DISPLAY_TEXT = /^[A-Z0-9 .&/+_:-]+$/;

function requireString(entry, field) {
  const value = entry?.[field];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Page metadata field ${field} must be a non-empty string.`);
  }
  return value.trim();
}

function assertSafeRelativeHtmlPath(value) {
  if (value.includes('\\') || value.startsWith('/') || value.includes('..') || !value.endsWith('.html')) {
    throw new Error(`Unsafe page metadata path: ${value}`);
  }
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized.startsWith('../')) {
    throw new Error(`Unsafe page metadata path: ${value}`);
  }
}

function assertDisplayText(value, field) {
  if (!DISPLAY_TEXT.test(value)) {
    throw new Error(`${field} must use the constrained uppercase ASCII display alphabet: ${value}`);
  }
}

export function validatePageMeta(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('Page metadata manifest must be a non-empty array.');
  }

  const paths = new Set();
  const cards = new Set();

  return entries.map((rawEntry) => {
    const pathValue = requireString(rawEntry, 'path');
    const card = requireString(rawEntry, 'card');
    const title = requireString(rawEntry, 'title');
    const description = requireString(rawEntry, 'description');
    const displayTitle = requireString(rawEntry, 'displayTitle');
    const kicker = requireString(rawEntry, 'kicker');
    const accent = requireString(rawEntry, 'accent');

    assertSafeRelativeHtmlPath(pathValue);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(card)) {
      throw new Error(`Unsafe OpenGraph card slug: ${card}`);
    }
    if (!ALLOWED_ACCENTS.has(accent)) {
      throw new Error(`Unsupported OpenGraph accent: ${accent}`);
    }
    assertDisplayText(displayTitle, 'displayTitle');
    assertDisplayText(kicker, 'kicker');

    if (paths.has(pathValue)) {
      throw new Error(`Duplicate page metadata path: ${pathValue}`);
    }
    if (cards.has(card)) {
      throw new Error(`Duplicate OpenGraph card slug: ${card}`);
    }
    paths.add(pathValue);
    cards.add(card);

    if (!Array.isArray(rawEntry.tags) || rawEntry.tags.length === 0 || rawEntry.tags.length > 4) {
      throw new Error(`Page metadata tags must contain 1-4 values for ${pathValue}.`);
    }
    const tags = rawEntry.tags.map((tag) => {
      if (typeof tag !== 'string' || !tag.trim()) {
        throw new Error(`Page metadata tags must be non-empty strings for ${pathValue}.`);
      }
      const normalized = tag.trim();
      assertDisplayText(normalized, 'tag');
      return normalized;
    });

    return {
      path: pathValue,
      card,
      title,
      description,
      displayTitle,
      kicker,
      tags,
      accent,
    };
  });
}

export function loadPageMeta(manifestPath = DEFAULT_MANIFEST) {
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return validatePageMeta(raw);
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? null;
}

function findHead(node) {
  if (node.nodeName === 'head') return node;
  for (const child of node.childNodes ?? []) {
    const found = findHead(child);
    if (found) return found;
  }
  return null;
}

function createMeta(attributes) {
  const node = utils.createNode('meta');
  for (const [name, value] of Object.entries(attributes)) {
    utils.setAttribute(node, name, value);
  }
  utils.setAttribute(node, 'data-tr-generated', 'page-meta');
  return node;
}

function createCanonical(href) {
  const node = utils.createNode('link');
  utils.setAttribute(node, 'rel', 'canonical');
  utils.setAttribute(node, 'href', href);
  utils.setAttribute(node, 'data-tr-generated', 'page-meta');
  return node;
}

function shouldRemoveMetadataNode(node) {
  if (node.nodeName === 'link' && getAttribute(node, 'rel')?.toLowerCase() === 'canonical') {
    return true;
  }
  if (node.nodeName !== 'meta') return false;

  const name = getAttribute(node, 'name')?.toLowerCase();
  const property = getAttribute(node, 'property')?.toLowerCase();
  if (name === 'description' || name?.startsWith('twitter:')) return true;
  if (property?.startsWith('og:')) return true;
  return getAttribute(node, 'data-tr-generated') === 'page-meta';
}

function setDocumentTitle(head, title) {
  const existing = (head.childNodes ?? []).find((node) => node.nodeName === 'title');
  if (existing) {
    existing.childNodes = [utils.createTextNode(title)];
    return;
  }
  const titleNode = utils.createNode('title');
  utils.append(titleNode, utils.createTextNode(title));
  utils.append(head, titleNode);
}

export function injectPageMeta(html, entry, siteUrl) {
  const normalizedSiteUrl = siteUrl.trim().replace(/\/$/, '');
  if (!normalizedSiteUrl) throw new Error('siteUrl is required for page metadata injection.');

  const parsed = parse(html);
  const head = findHead(parsed);
  if (!head) throw new Error(`HTML head not found for ${entry.path}.`);

  head.childNodes = (head.childNodes ?? []).filter((node) => !shouldRemoveMetadataNode(node));
  setDocumentTitle(head, entry.title);

  const canonical = entry.path === 'index.html'
    ? `${normalizedSiteUrl}/`
    : `${normalizedSiteUrl}/${entry.path}`;
  const image = `${normalizedSiteUrl}/assets/og/${entry.card}.png`;

  utils.append(head, createMeta({name: 'description', content: entry.description}));
  utils.append(head, createCanonical(canonical));
  utils.append(head, createMeta({property: 'og:title', content: entry.title}));
  utils.append(head, createMeta({property: 'og:description', content: entry.description}));
  utils.append(head, createMeta({property: 'og:type', content: 'website'}));
  utils.append(head, createMeta({property: 'og:url', content: canonical}));
  utils.append(head, createMeta({property: 'og:image', content: image}));
  utils.append(head, createMeta({property: 'og:image:width', content: '1200'}));
  utils.append(head, createMeta({property: 'og:image:height', content: '630'}));
  utils.append(head, createMeta({property: 'og:image:alt', content: `${entry.displayTitle} — ${entry.kicker}`}));
  utils.append(head, createMeta({name: 'twitter:card', content: 'summary_large_image'}));
  utils.append(head, createMeta({name: 'twitter:title', content: entry.title}));
  utils.append(head, createMeta({name: 'twitter:description', content: entry.description}));
  utils.append(head, createMeta({name: 'twitter:image', content: image}));

  return serialize(parsed);
}

export function applyPageMeta(outputDir, entries, siteUrl) {
  let updated = 0;
  for (const entry of entries) {
    const htmlPath = path.join(outputDir, ...entry.path.split('/'));
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`Page metadata target does not exist: ${entry.path}`);
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    fs.writeFileSync(htmlPath, injectPageMeta(html, entry, siteUrl), 'utf8');
    updated += 1;
  }
  return updated;
}
