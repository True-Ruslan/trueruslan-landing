import {parse, serialize} from 'parse5';
import * as utils from 'parse5-utils';

export const DEFAULT_SITE_URL = 'https://wiki.marketdb.ru';

export const PERSON_SCHEMA_MARKER = '"@type":"Person"';

export function getSiteUrl() {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, '');
  return configured || DEFAULT_SITE_URL;
}

export function collectPagesFromToc(tocContent) {
  const pages = [''];

  for (const match of tocContent.matchAll(/href:\s*\.\/landing\/([a-z]+)\.md/g)) {
    pages.push(`landing/${match[1]}.html`);
  }

  return pages;
}

export function buildPersonJsonLd(siteUrl = getSiteUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Руслан Немыкин',
    url: `${siteUrl}/`,
    jobTitle: 'Java Developer',
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
