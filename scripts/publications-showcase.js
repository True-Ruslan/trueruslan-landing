import fs from 'node:fs';
import path from 'node:path';

import {transformGeneratedContent} from './diplodoc-state.js';
import {
  renderFeaturedPublications,
  renderPublicationCatalogue,
} from './publication-renderer.js';

const DEFAULT_TARGET = 'landing/publications.html';
const FEATURED_PLACEHOLDER = /<div\s+data-tr-publications-featured(?:="")?\s*><\/div>/;
const PREBUILD_CATALOGUE = /<div\b[^>]*\bdata-tr-publications-root(?:="")?[^>]*>/;
const STYLE_MARKER = 'data-tr-publications-style';
const NOSCRIPT_MARKER = 'data-tr-publications-noscript';

function injectFeaturedPublications(html, featured) {
  const hasFeatured = FEATURED_PLACEHOLDER.test(html);
  const hasCatalogue = PREBUILD_CATALOGUE.test(html);

  if (!hasFeatured && !hasCatalogue) return html;
  if (!hasFeatured) throw new Error('publication featured placeholder is missing');
  if (!hasCatalogue) throw new Error('generated publication catalogue is missing');

  return html.replace(FEATURED_PLACEHOLDER, featured);
}

function injectStylesheet(html) {
  if (html.includes(STYLE_MARKER)) return html;
  const link = '<link rel="stylesheet" href="_assets/style/publications.css" data-tr-publications-style>';
  if (!html.includes('</head>')) throw new Error('publication showcase page is missing </head>');
  return html.replace('</head>', `  ${link}\n</head>`);
}

function injectNoScriptFallback(html, catalogue, locale) {
  if (html.includes(`${NOSCRIPT_MARKER}="${locale}"`)) return html;
  const heading = locale === 'en' ? 'Publications and talks' : 'Публикации и выступления';
  const fallback = `<noscript ${NOSCRIPT_MARKER}="${locale}"><style>#root{display:none!important}</style><section class="tr-publications-noscript"><h1>${heading}</h1>${catalogue}</section></noscript>`;
  const rootPattern = /(<div\s+id="root"[^>]*><\/div>)/;
  if (rootPattern.test(html)) return html.replace(rootPattern, `$1${fallback}`);
  if (html.includes('</body>')) return html.replace('</body>', `${fallback}</body>`);
  throw new Error('publication showcase page has no fallback insertion point');
}

export function applyPublicationsShowcase(outputDir, publications, {
  target = DEFAULT_TARGET,
  locale = 'ru',
  projectLabels,
  noteLabels,
} = {}) {
  const htmlPath = path.join(outputDir, ...target.split('/'));
  let source;
  try {
    source = fs.readFileSync(htmlPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`publication showcase page not found: ${target}`);
    throw error;
  }

  const featured = renderFeaturedPublications(publications, {surface: 'page', locale});
  const catalogue = renderPublicationCatalogue(publications, {projectLabels, noteLabels, locale});
  const transformed = transformGeneratedContent(
    source,
    (content) => injectFeaturedPublications(content, featured),
    `publication featured placeholder and prebuild catalogue (${locale})`,
  );

  if (!transformed.source) {
    throw new Error(`publication featured placeholder or generated catalogue is missing for ${target}`);
  }

  let html = injectStylesheet(transformed.html);
  if (transformed.source === 'diplodoc-state') {
    html = injectNoScriptFallback(html, catalogue, locale);
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
  return target;
}
