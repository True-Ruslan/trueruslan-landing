import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'publications.json');
const PAGE_PATH = path.join(ROOT, 'docs', 'landing', 'publications.md');
const HOME_TEMPLATE_PATH = path.join(ROOT, 'templates', 'index.html');
const TOC_PATH = path.join(ROOT, 'docs', 'toc.yaml');
const META_PATH = path.join(ROOT, 'data', 'page-meta.json');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

test('publication showcase owns one canonical data registry and page', () => {
  assert.equal(fs.existsSync(REGISTRY_PATH), true, 'data/publications.json must exist');
  assert.equal(fs.existsSync(PAGE_PATH), true, 'docs/landing/publications.md must exist');

  const registry = JSON.parse(read(REGISTRY_PATH));
  assert.equal(registry.length, 3, 'initial catalogue must contain exactly three verified Habr articles');
  assert.deepEqual(registry.map(({date}) => date), ['2025-08-23', '2025-08-01', '2025-03-04']);
  assert.equal(new Set(registry.map(({id}) => id)).size, registry.length);
  assert.equal(registry.every(({platform}) => platform === 'Habr'), true);
  assert.equal(registry.every(({kind}) => kind === 'technical-article'), true);
  assert.equal(registry.every(({role}) => role === 'author'), true);
  assert.equal(registry.every(({verifiedAt}) => verifiedAt === '2026-08-02'), true);
  assert.equal(registry.some((entry) => 'views' in entry || 'votes' in entry || 'likes' in entry), false);
});

test('publications page has stable framing and exactly one build-time catalogue placeholder', () => {
  const page = read(PAGE_PATH);

  assert.match(page, /^# Публикации и выступления/m);
  assert.match(page, /PUBLICATIONS · TALKS · RESEARCH/);
  assert.match(page, /только уже опубликованные или состоявшиеся материалы/i);
  assert.equal((page.match(/data-tr-publications-featured/g) ?? []).length, 1);
  assert.equal((page.match(/data-tr-publications-catalogue/g) ?? []).length, 1);
  assert.match(page, /внешн/i);
  assert.doesNotMatch(page, /\bTODO\b|\bTBD\b/i);
});

test('standalone homepage reserves one featured-publications surface below active projects', () => {
  const home = read(HOME_TEMPLATE_PATH);
  const activeIndex = home.indexOf('{{CURRENTLY_BUILDING}}');
  const publicationsIndex = home.indexOf('{{FEATURED_PUBLICATIONS}}');
  const focusIndex = home.indexOf('id="focus-title"');

  assert.notEqual(activeIndex, -1);
  assert.notEqual(publicationsIndex, -1, 'homepage must contain {{FEATURED_PUBLICATIONS}}');
  assert.equal(home.indexOf('{{FEATURED_PUBLICATIONS}}', publicationsIndex + 1), -1);
  assert.ok(publicationsIndex > activeIndex, 'featured publications must follow active projects');
  assert.ok(publicationsIndex < focusIndex, 'featured publications must precede broad focus cards');
  assert.match(home, /landing\/publications\.html/);
});

test('primary and side navigation expose Publications after Notes', () => {
  const toc = read(TOC_PATH);
  assert.match(toc, /- text: Notes[\s\S]{0,180}- text: Публикации/);

  const notesIndex = toc.indexOf('  - name: Engineering Notes');
  const publicationsIndex = toc.indexOf('  - name: Публикации');
  const aboutIndex = toc.indexOf('  - name: Обо мне');
  assert.notEqual(notesIndex, -1);
  assert.notEqual(publicationsIndex, -1);
  assert.ok(publicationsIndex > notesIndex, 'Publications must follow the complete Engineering Notes tree');
  assert.ok(publicationsIndex < aboutIndex, 'Publications must remain a first-class content surface before About');
  assert.match(toc, /href: \.\/landing\/publications\.md/);

  const home = read(HOME_TEMPLATE_PATH);
  assert.match(home, /landing\/notes\.html">Notes<\/a>\s*<a href="landing\/publications\.html">Публикации<\/a>/);
});

test('publications page has canonical metadata/OpenGraph configuration', () => {
  const meta = JSON.parse(read(META_PATH));
  const publicationMeta = meta.find(({path: route}) => route === 'landing/publications.html');

  assert.ok(publicationMeta, 'landing/publications.html metadata must exist');
  assert.match(publicationMeta.title, /Публикации/i);
  assert.match(publicationMeta.description, /стать/i);
  assert.equal(publicationMeta.displayTitle, 'PUBLICATIONS');
});
