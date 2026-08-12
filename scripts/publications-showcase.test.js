import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {renderHomepageBridge} from './standalone-home.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_PATH = path.join(ROOT, 'data', 'publications.json');
const PAGE_PATH = path.join(ROOT, 'docs', 'landing', 'publications.md');
const HOME_TEMPLATE_PATH = path.join(ROOT, 'templates', 'index.html');
const TOC_PATH = path.join(ROOT, 'docs', 'toc.yaml');
const META_PATH = path.join(ROOT, 'data', 'page-meta.json');
const PACKAGE_PATH = path.join(ROOT, 'package.json');

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

test('publications page has stable framing, one featured placeholder and one generated catalogue include', () => {
  const page = read(PAGE_PATH);

  assert.match(page, /^# Публикации и выступления/m);
  assert.match(page, /PUBLICATIONS · TALKS · RESEARCH/);
  assert.match(page, /только уже опубликованные или состоявшиеся материалы/i);
  assert.equal((page.match(/data-tr-publications-featured/g) ?? []).length, 1);
  assert.equal((page.match(/publications-catalogue\.md/g) ?? []).length, 1);
  assert.match(page, /\{% include notitle \[Generated publications catalogue\]\(\.\.\/_includes\/publications-catalogue\.md\) %\}/);
  assert.doesNotMatch(page, /data-tr-publications-catalogue/);
  assert.match(page, /внешн/i);
  assert.doesNotMatch(page, /\bTODO\b|\bTBD\b/i);
});

test('Diplodoc builds generate publication content before indexing', () => {
  const packageJson = JSON.parse(read(PACKAGE_PATH));

  assert.equal(packageJson.scripts['generate:publications'], 'node scripts/publication-content-generator.js');
  assert.match(packageJson.scripts['build:docs'], /^npm run generate:publications && yfm /);
  assert.match(packageJson.scripts['build:docs:fast'], /^npm run generate:publications && yfm /);
});

test('C2 homepage exposes Publications through the compact Writing bridge instead of a second catalogue surface', () => {
  const home = read(HOME_TEMPLATE_PATH);
  const flagshipsIndex = home.indexOf('{{HOME_FLAGSHIPS}}');
  const experienceIndex = home.indexOf('{{HOME_EXPERIENCE_BRIDGE}}');
  const writingIndex = home.indexOf('{{HOME_WRITING_BRIDGE}}');
  const collaborationIndex = home.indexOf('{{HOME_COLLABORATION_BRIDGE}}');

  assert.notEqual(flagshipsIndex, -1, 'homepage must contain {{HOME_FLAGSHIPS}}');
  assert.ok(experienceIndex > flagshipsIndex, 'experience must follow selected work');
  assert.ok(writingIndex > experienceIndex, 'writing must follow experience');
  assert.ok(collaborationIndex > writingIndex, 'collaboration must follow writing');
  assert.doesNotMatch(home, /\{\{FEATURED_PUBLICATIONS\}\}|id="now-title"|id="explore-title"/);

  const writing = renderHomepageBridge('writing', 'ru');
  assert.match(writing, /href="landing\/notes\.html"/);
  assert.match(writing, /href="landing\/publications\.html"/);
  assert.match(writing, /Инженерные материалы/);
});

test('Publications stays first-class inside Materials while primary navigation uses one Materials hub entry', () => {
  const toc = read(TOC_PATH);
  assert.match(toc, /- text: Материалы[\s\S]{0,160}url: landing\/materials\.html/);

  const materialsIndex = toc.indexOf('  - name: Материалы');
  const publicationsIndex = toc.indexOf('      - name: Публикации', materialsIndex);
  const mapIndex = toc.indexOf('      - name: Engineering Map', materialsIndex);
  const notesIndex = toc.indexOf('      - name: Engineering Notes', materialsIndex);
  const sourcesIndex = toc.indexOf('      - name: Источники', materialsIndex);
  const aboutIndex = toc.indexOf('  - name: Обо мне');

  assert.notEqual(materialsIndex, -1);
  assert.ok(publicationsIndex > materialsIndex, 'Publications must be the first Materials child');
  assert.ok(mapIndex > publicationsIndex, 'Engineering Map must follow Publications');
  assert.ok(notesIndex > mapIndex, 'Engineering Notes must follow Engineering Map');
  assert.ok(sourcesIndex > notesIndex, 'Sources must follow the complete Engineering Notes tree');
  assert.ok(sourcesIndex < aboutIndex, 'Materials must remain before About');
  assert.match(toc, /href: \.\/landing\/publications\.md/);

  const home = read(HOME_TEMPLATE_PATH);
  assert.match(home, /landing\/materials\.html">Материалы<\/a>/);
  assert.doesNotMatch(home, /<nav[^>]*tr-site-nav[\s\S]*?>[\s\S]*?<a[^>]+>Публикации<\/a>[\s\S]*?<\/nav>/);

  const writing = renderHomepageBridge('writing', 'ru');
  assert.match(writing, /href="landing\/publications\.html"/);
});

test('publications page has canonical metadata/OpenGraph configuration', () => {
  const meta = JSON.parse(read(META_PATH));
  const publicationMeta = meta.find(({path: route}) => route === 'landing/publications.html');

  assert.ok(publicationMeta, 'landing/publications.html metadata must exist');
  assert.match(publicationMeta.title, /Публикации/i);
  assert.match(publicationMeta.description, /стать/i);
  assert.equal(publicationMeta.displayTitle, 'PUBLICATIONS');
});
