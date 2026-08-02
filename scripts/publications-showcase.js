import fs from 'node:fs';
import path from 'node:path';

import {transformGeneratedContent} from './diplodoc-state.js';
import {
  renderFeaturedPublications,
  renderPublicationCatalogue,
} from './publication-renderer.js';

const TARGET = 'landing/publications.html';
const FEATURED_PLACEHOLDER = /<div\s+data-tr-publications-featured(?:="")?\s*><\/div>/;
const CATALOGUE_PLACEHOLDER = /<div\s+data-tr-publications-catalogue(?:="")?\s*><\/div>/;
const STYLE_MARKER = 'data-tr-publications-style';
const NOSCRIPT_MARKER = 'data-tr-publications-noscript';

function replacePublicationPlaceholders(html, featured, catalogue) {
  const hasFeatured = FEATURED_PLACEHOLDER.test(html);
  const hasCatalogue = CATALOGUE_PLACEHOLDER.test(html);

  if (!hasFeatured && !hasCatalogue) return html;
  if (!hasFeatured) throw new Error('publication featured placeholder is missing');
  if (!hasCatalogue) throw new Error('publication catalogue placeholder is missing');

  return html
    .replace(FEATURED_PLACEHOLDER, featured)
    .replace(CATALOGUE_PLACEHOLDER, catalogue);
}

function injectStylesheet(html) {
  if (html.includes(STYLE_MARKER)) return html;
  const link = '<link rel="stylesheet" href="_assets/style/publications.css" data-tr-publications-style>';
  if (!html.includes('</head>')) throw new Error('publication showcase page is missing </head>');
  return html.replace('</head>', `  ${link}\n</head>`);
}

function injectNoScriptFallback(html, featured, catalogue) {
  if (html.includes(NOSCRIPT_MARKER)) return html;
  const fallback = `<noscript data-tr-publications-noscript><section aria-labelledby="publications-noscript-title"><h1 id="publications-noscript-title">Публикации и выступления</h1>${featured}${catalogue}</section></noscript>`;
  const rootPattern = /(<div\s+id="root"[^>]*><\/div>)/;
  if (rootPattern.test(html)) return html.replace(rootPattern, `$1${fallback}`);
  if (html.includes('</body>')) return html.replace('</body>', `${fallback}</body>`);
  throw new Error('publication showcase page has no fallback insertion point');
}

export function applyPublicationsShowcase(outputDir, publications, {
  projectLabels,
  noteLabels,
} = {}) {
  const htmlPath = path.join(outputDir, TARGET);
  if (!fs.existsSync(htmlPath)) throw new Error(`publication showcase page not found: ${htmlPath}`);

  const featured = renderFeaturedPublications(publications, {surface: 'page'});
  const catalogue = renderPublicationCatalogue(publications, {projectLabels, noteLabels});
  const source = fs.readFileSync(htmlPath, 'utf8');

  const transformed = transformGeneratedContent(
    source,
    (content) => replacePublicationPlaceholders(content, featured, catalogue),
    'publication showcase placeholders',
  );

  if (!transformed.source) {
    throw new Error('publication featured and catalogue placeholders are missing');
  }

  let html = injectStylesheet(transformed.html);
  if (transformed.source === 'diplodoc-state') {
    html = injectNoScriptFallback(html, featured, catalogue);
  }

  fs.writeFileSync(htmlPath, html);
  return TARGET;
}
