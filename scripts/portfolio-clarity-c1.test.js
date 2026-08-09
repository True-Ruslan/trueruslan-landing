import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const TYPOGRAPHY = 'docs/_assets/style/typography.css';
const FONT_FILES = Object.freeze({
  'docs/assets/fonts/Onest-cyrillic-wght-normal.woff2': '37bc16874135c16134679b1db25b87fe80eb9fcd4ef3666af7c531bfde204fe2',
  'docs/assets/fonts/Onest-latin-wght-normal.woff2': '67849bcc11e02177442da14ad954bfe1cc709553dad137b5003449b303e83fc3',
});

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

test('C1: standalone RU and EN headers expose exactly five semantic primary destinations', () => {
  assert.deepEqual(standalonePrimaryLabels('templates/index.html'), EXPECTED_NAV.ru);
  assert.deepEqual(standalonePrimaryLabels('templates/index.en.html'), EXPECTED_NAV.en);
});

test('C1: Diplodoc primary header matches the five-destination RU presentation hierarchy', () => {
  assert.deepEqual(tocPrimaryLabels(), EXPECTED_NAV.ru);
});

test('C1: reviewed Onest variable subsets are vendored byte-exact and licensed', () => {
  for (const [relativePath, expectedSha] of Object.entries(FONT_FILES)) {
    const absolutePath = path.join(ROOT, relativePath);
    assert.ok(fs.existsSync(absolutePath), `${relativePath} missing`);
    const bytes = fs.readFileSync(absolutePath);
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'wOF2', `${relativePath} is not WOFF2`);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), expectedSha, `${relativePath} digest drift`);
  }

  const license = read('docs/assets/fonts/Onest-OFL.txt');
  assert.match(license, /Copyright 2021 The Onest Project Authors/);
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
});

test('C1: Onest is self-hosted with safe variable-font fallback and no runtime font CDN', () => {
  const css = read(TYPOGRAPHY);
  assert.equal((css.match(/@font-face\s*\{/g) ?? []).length, 2);
  assert.match(css, /font-family:\s*["']Onest["']/i);
  assert.equal((css.match(/font-weight:\s*100\s+900/g) ?? []).length, 2);
  assert.equal((css.match(/font-display:\s*swap/g) ?? []).length, 2);
  assert.match(css, /Onest-cyrillic-wght-normal\.woff2["']\)\s*format\(["']woff2["']\)/i);
  assert.match(css, /Onest-latin-wght-normal\.woff2["']\)\s*format\(["']woff2["']\)/i);
  assert.match(css, /--tr-font-sans:\s*["']Onest["']/i);
  assert.match(css, /body,[\s\S]*?\.g-root\s*\{[\s\S]*?font-family:\s*var\(--tr-font-sans\)/i);
  assert.doesNotMatch(css, /fonts\.(?:googleapis|gstatic)\.com|cdn\.jsdelivr\.net/i);

  for (const template of ['templates/index.html', 'templates/index.en.html']) {
    const html = read(template);
    assert.match(html, /_assets\/style\/typography\.css/);
    assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com|cdn\.jsdelivr\.net/i);
  }
  assert.match(read('docs/.yfm'), /- _assets\/style\/typography\.css/);
});

test('C1: typography tokens keep long-form reading bounded and comfortable', () => {
  const css = read(TYPOGRAPHY);
  assert.match(css, /--tr-prose-width:\s*(?:68|69|70|71|72)ch\s*;/i);
  assert.match(css, /--tr-body-size:\s*(?:1\.0(?:625|75|875)|1\.1(?:25)?)rem\s*;/i);
  assert.match(css, /--tr-body-line-height:\s*1\.[56]\d*\s*;/i);
  assert.match(css, /\.g-content\s+\.yfm\s*>\s*:where\(p,\s*ul,\s*ol,\s*blockquote\)[\s\S]*max-width:\s*var\(--tr-prose-width\)/i);
});

test('C1: production asset copying publishes font bytes and license', () => {
  const source = read('scripts/copy-assets.js');
  assert.match(source, /ASSET_EXTENSIONS\s*=\s*new Set\([^;]*["']\.woff2["']/s);
  assert.match(source, /ASSET_EXTENSIONS\s*=\s*new Set\([^;]*["']\.txt["']/s);
});
