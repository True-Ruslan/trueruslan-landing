import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const EXPECTED_NAV = Object.freeze({
  ru: Object.freeze(['Проекты', 'Опыт', 'Материалы', 'Работа со мной', 'Обо мне']),
  en: Object.freeze(['Projects', 'Experience', 'Writing', 'Work with me', 'About']),
});

function standalonePrimaryLabels(relativePath) {
  const html = read(relativePath);
  const nav = html.match(/<nav\b[^>]*class=["'][^"']*\btr-site-nav\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i);
  assert.ok(nav, `${relativePath}: tr-site-nav missing`);
  return [...nav[1].matchAll(/<a\b[^>]*>([^<]+)<\/a>/gi)].map((match) => match[1].trim());
}

function tocPrimaryLabels() {
  const source = read('docs/toc.yaml');
  const header = source.match(/\n  header:\n([\s\S]*?)\n    rightItems:/);
  assert.ok(header, 'docs/toc.yaml: navigation.header block missing');
  return [...header[1].matchAll(/^      - text:\s*(.+)$/gm)].map((match) => match[1].trim());
}

test('C1 RED: standalone RU and EN headers expose exactly five semantic primary destinations', () => {
  assert.deepEqual(standalonePrimaryLabels('templates/index.html'), EXPECTED_NAV.ru);
  assert.deepEqual(standalonePrimaryLabels('templates/index.en.html'), EXPECTED_NAV.en);
});

test('C1 RED: Diplodoc primary header matches the five-destination RU presentation hierarchy', () => {
  assert.deepEqual(tocPrimaryLabels(), EXPECTED_NAV.ru);
});

test('C1 RED: Onest is self-hosted as a visible-text variable WOFF2 with a safe fallback policy', () => {
  const css = read('docs/_assets/style/custom.css');
  const fontPath = path.join(ROOT, 'docs', '_assets', 'fonts', 'Onest-Variable.woff2');

  assert.ok(fs.existsSync(fontPath), 'self-hosted Onest variable WOFF2 missing');
  assert.match(css, /@font-face\s*\{[\s\S]*font-family:\s*['"]Onest['"][\s\S]*font-weight:\s*100\s+900[\s\S]*font-display:\s*swap[\s\S]*format\(['"]woff2['"]\)[\s\S]*\}/i);
  assert.match(css, /--tr-font-sans:\s*['"]Onest['"]/i);
  assert.match(css, /body,?\s*[\s\S]*font-family:\s*var\(--tr-font-sans\)/i);
  assert.doesNotMatch(css, /fonts\.(?:googleapis|gstatic)\.com/i);
});

test('C1 RED: typography tokens keep long-form reading bounded and comfortable', () => {
  const css = read('docs/_assets/style/custom.css');
  assert.match(css, /--tr-prose-width:\s*(?:68|69|70|71|72)ch\s*;/i);
  assert.match(css, /--tr-body-size:\s*(?:1\.0(?:625|75|875)|1\.1(?:25)?)rem\s*;/i);
  assert.match(css, /--tr-body-line-height:\s*1\.[56]\d*\s*;/i);
});

test('C1 RED: production asset copying publishes WOFF2 font resources', () => {
  const source = read('scripts/copy-assets.js');
  assert.match(source, /ASSET_EXTENSIONS\s*=\s*new Set\([^;]*['"]\.woff2['"]/s);
});
