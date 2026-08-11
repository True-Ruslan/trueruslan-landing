import {parse, serialize} from 'parse5';
import * as utils from 'parse5-utils';

import {
  DEFAULT_SITE_MANIFEST_PATH,
  loadSiteManifest,
} from './site-deployment.js';

export const DEFAULT_SITE_URL = loadSiteManifest(DEFAULT_SITE_MANIFEST_PATH).legacyOrigin;

export const PERSON_SCHEMA_MARKER = '"@type":"Person"';

export function getSiteUrl() {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;

  const manifestPath = process.env.SITE_MANIFEST_PATH || DEFAULT_SITE_MANIFEST_PATH;
  return loadSiteManifest(manifestPath).legacyOrigin;
}

export function collectPagesFromToc(tocContent) {
  const pages = new Set(['']);

  for (const match of tocContent.matchAll(/href:\s*\.\/([^#\s"']+)\.md(?:\s|$)/g)) {
    const relativePath = match[1].replaceAll('\\', '/');

    if (relativePath.startsWith('../') || relativePath.startsWith('/')) {
      continue;
    }

    pages.add(`${relativePath}.html`);
  }

  return [...pages];
}

export function buildPersonJsonLd(siteUrl = getSiteUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Руслан Немыкин',
    alternateName: 'Ruslan Nemykin',
    url: `${siteUrl}/`,
    jobTitle: 'Backend Engineer / Java Developer',
    knowsAbout: [
      'Java',
      'Spring Boot',
      'Backend Development',
      'Distributed Systems',
      'Databases',
      'DevOps',
      'AI Engineering',
    ],
    sameAs: [
      'https://github.com/True-Ruslan',
      'https://t.me/TrueRuslan_Blog',
      'https://habr.com/ru/users/trueruslan',
      'https://linkedin.com/in/trueruslan',
    ],
  };
}

export function injectPersonSchemaIntoHtml(html, siteUrl = getSiteUrl()) {
  if (html.includes(PERSON_SCHEMA_MARKER)) {
    return html;
  }

  const parsed = parse(html);
  const jsonLd = JSON.stringify(buildPersonJsonLd(siteUrl));

  traverse(parsed, (node) => {
    if (node.nodeName !== 'head') {
      return;
    }

    const scriptNode = utils.createNode('script');
    utils.setAttribute(scriptNode, 'type', 'application/ld+json');
    utils.append(scriptNode, utils.createTextNode(jsonLd));
    utils.append(node, scriptNode);
  });

  return serialize(parsed);
}

function traverse(node, callback) {
  callback(node);

  if (!node.childNodes) {
    return;
  }

  for (const childNode of node.childNodes) {
    traverse(childNode, callback);
  }
}
