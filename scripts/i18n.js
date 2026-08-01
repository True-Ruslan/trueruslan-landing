import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parse, serialize} from 'parse5';
import * as utils from 'parse5-utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_I18N_PATH = path.join(ROOT, 'data', 'i18n.json');

const SAFE_HTML_PATH = /^(?!\/)(?!.*\.\.)(?!.*\\)(?![a-z][a-z\d+.-]*:)[a-zA-Z0-9_./-]+\.html$/;
const ID = /^[a-z0-9-]+$/;

function requireString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function assertSafePath(value, label) {
  if (!SAFE_HTML_PATH.test(value) || path.posix.normalize(value) !== value) {
    throw new Error(`unsafe i18n path for ${label}: ${value}`);
  }
}

export function validateI18nManifest(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('i18n manifest must be a non-empty array');
  }

  const ids = new Set();
  const paths = new Set();

  return entries.map((raw) => {
    const id = requireString(raw?.id, 'i18n id');
    const ru = requireString(raw?.ru, `RU path for ${id}`);
    const en = requireString(raw?.en, `EN path for ${id}`);

    if (!ID.test(id)) throw new Error(`invalid i18n id: ${id}`);
    if (ids.has(id)) throw new Error(`duplicate i18n id: ${id}`);
    ids.add(id);

    assertSafePath(ru, `${id}.ru`);
    assertSafePath(en, `${id}.en`);
    if (ru.startsWith('en/')) throw new Error(`RU i18n path must not be inside en/: ${ru}`);
    if (!en.startsWith('en/')) throw new Error(`EN i18n path must be inside en/: ${en}`);

    for (const value of [ru, en]) {
      if (paths.has(value)) throw new Error(`duplicate i18n path: ${value}`);
      paths.add(value);
    }

    return {id, ru, en};
  });
}

export function loadI18nManifest(manifestPath = DEFAULT_I18N_PATH) {
  if (!fs.existsSync(manifestPath)) throw new Error(`i18n manifest not found: ${manifestPath}`);
  return validateI18nManifest(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
}

function findNode(root, name) {
  if (root.nodeName === name) return root;
  for (const child of root.childNodes ?? []) {
    const found = findNode(child, name);
    if (found) return found;
  }
  return null;
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? null;
}

function removeGeneratedChildren(node) {
  if (!node?.childNodes) return;
  node.childNodes = node.childNodes.filter((child) => getAttribute(child, 'data-tr-i18n') !== 'true');
}

function createElement(name, attributes) {
  const node = utils.createNode(name);
  for (const [attribute, value] of Object.entries(attributes)) utils.setAttribute(node, attribute, value);
  utils.setAttribute(node, 'data-tr-i18n', 'true');
  return node;
}

function createLink(attributes) {
  return createElement('link', attributes);
}

function publicUrl(siteUrl, relativePath) {
  const base = siteUrl.trim().replace(/\/$/, '');
  if (!base) throw new Error('siteUrl is required for i18n injection');
  if (relativePath === 'index.html') return `${base}/`;
  if (relativePath === 'en/index.html') return `${base}/en/`;
  return `${base}/${relativePath}`;
}

function appendStandaloneHeaderAssets(head, pair) {
  if (pair.id !== 'home') return;
  utils.append(head, createLink({rel: 'stylesheet', href: '_assets/style/header-utilities.css'}));
  utils.append(head, createElement('script', {src: '_assets/script/header-utilities.js', defer: ''}));
}

export function injectI18nLinks(html, {pair, locale, siteUrl}) {
  if (!pair || !['ru', 'en'].includes(locale)) throw new Error('pair and locale ru/en are required for i18n injection');

  const document = parse(html);
  const htmlNode = findNode(document, 'html');
  const head = findNode(document, 'head');
  const body = findNode(document, 'body');
  if (!htmlNode || !head || !body) throw new Error(`HTML document structure missing for i18n pair ${pair.id}`);

  const ruUrl = publicUrl(siteUrl, pair.ru);
  const enUrl = publicUrl(siteUrl, pair.en);

  utils.setAttribute(htmlNode, 'lang', locale);
  utils.setAttribute(htmlNode, 'data-tr-i18n-locale', locale);
  utils.setAttribute(htmlNode, 'data-tr-i18n-ru', ruUrl);
  utils.setAttribute(htmlNode, 'data-tr-i18n-en', enUrl);
  removeGeneratedChildren(head);
  removeGeneratedChildren(body);

  utils.append(head, createLink({rel: 'alternate', hreflang: 'ru', href: ruUrl}));
  utils.append(head, createLink({rel: 'alternate', hreflang: 'en', href: enUrl}));
  utils.append(head, createLink({rel: 'alternate', hreflang: 'x-default', href: ruUrl}));
  appendStandaloneHeaderAssets(head, pair);

  return serialize(document);
}

export function applyI18n(outputDir, pairs, siteUrl) {
  const validated = validateI18nManifest(pairs);
  const updated = [];

  for (const pair of validated) {
    for (const locale of ['ru', 'en']) {
      const relativePath = pair[locale];
      const htmlPath = path.join(outputDir, ...relativePath.split('/'));
      if (!fs.existsSync(htmlPath)) throw new Error(`i18n target does not exist: ${relativePath}`);
      const html = fs.readFileSync(htmlPath, 'utf8');
      fs.writeFileSync(htmlPath, injectI18nLinks(html, {pair, locale, siteUrl}), 'utf8');
      updated.push(relativePath);
    }
  }

  return updated.sort();
}
