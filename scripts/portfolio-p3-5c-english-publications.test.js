import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {loadPublicationRegistry} from './publication-registry.js';
import {renderPublicationCatalogue} from './publication-renderer.js';
import {renderHomepageBridge} from './standalone-home.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

test('canonical Publications Registry owns English presentation without a second registry', () => {
  assert.equal(exists('data/publications-en.json'), false, 'P3.5C must not create publications-en.json');

  const raw = JSON.parse(read('data/publications.json'));
  assert.equal(raw.length, 4);
  for (const entry of raw) {
    assert.equal(typeof entry.en, 'object', `${entry.id} must keep English presentation in the canonical record`);
    assert.equal(typeof entry.en.summary, 'string');
    assert.ok(entry.en.summary.trim());
    assert.ok(Array.isArray(entry.en.topics) && entry.en.topics.length > 0);
    assert.equal(/[А-Яа-яЁё]/.test(entry.en.summary), false, `${entry.id} English summary must be English presentation copy`);
  }

  const normalized = loadPublicationRegistry();
  assert.equal(normalized.every(({en}) => en?.summary && en?.topics?.length), true);
  assert.equal(normalized.every(({canonicalUrl}) => canonicalUrl.startsWith('https://habr.com/ru/articles/')), true);
});

test('English renderer localizes UI while preserving original publication identity', () => {
  const publications = loadPublicationRegistry();
  const html = renderPublicationCatalogue(publications, {locale: 'en'});

  for (const marker of [
    'Technical articles',
    'Technical article',
    'Author',
    'Topics',
    'Read on Habr ↗',
    'August 23, 2025',
  ]) {
    assert.match(html, new RegExp(marker));
  }

  assert.match(html, /lang="ru"[^>]*>[^<]*покорить Diplodoc/);
  assert.match(html, new RegExp(publications[0].en.summary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(html, /Технические статьи|Техническая статья|Автор|Темы|Читать на/);
});

test('English Publications is one RU EN route pair with metadata and bounded English framing', () => {
  const i18n = JSON.parse(read('data/i18n.json'));
  assert.deepEqual(i18n.find(({id}) => id === 'publications'), {
    id: 'publications',
    ru: 'landing/publications.html',
    en: 'en/publications.html',
  });

  const meta = JSON.parse(read('data/page-meta.json'));
  const pageMeta = meta.find(({path: pagePath}) => pagePath === 'en/publications.html');
  assert.equal(pageMeta?.title, 'Publications — Ruslan Nemykin');
  assert.match(pageMeta?.description ?? '', /published work|technical articles/i);

  assert.equal(exists('docs/en/publications.md'), true);
  const source = read('docs/en/publications.md');
  assert.match(source, /^# Publications and talks$/m);
  assert.match(source, /data-tr-publications-featured/);
  assert.match(source, /publications-catalogue\.en\.md/);
  assert.doesNotMatch(source, /[А-Яа-яЁё]/);

  const toc = read('docs/toc.yaml');
  assert.match(toc, /name: Publications\s+href: \.\/en\/publications\.md/);
});

test('P3.5C keeps one generated search and integrates English Publications through C2 Writing and Personal bridges', () => {
  const generator = read('scripts/publication-content-generator.js');
  assert.match(generator, /publications-catalogue\.en\.md/);
  assert.match(generator, /locale: 'en'/);

  const copyAssets = read('scripts/copy-assets.js');
  assert.match(copyAssets, /target: 'en\/publications\.html'/);
  assert.match(copyAssets, /locale: 'en'/);

  const home = read('templates/index.en.html');
  assert.match(home, /href="en\/publications\.html">Writing<\/a>/);
  assert.match(home, /\{\{HOME_WRITING_BRIDGE\}\}/);
  assert.match(home, /\{\{HOME_PERSONAL_BRIDGE\}\}/);
  assert.doesNotMatch(home, /Now \(RU\)|PUBLICATIONS \/ RU|Open Russian page|Selected English layer/);

  const writing = renderHomepageBridge('writing', 'en');
  const personal = renderHomepageBridge('personal', 'en');
  assert.match(writing, /href="en\/publications\.html"/);
  assert.match(writing, /Publications →/);
  assert.match(personal, /href="en\/now\.html"/);

  const searchSmoke = read('scripts/search-smoke.cjs');
  assert.match(searchSmoke, /assertEnglishPublicationsSearchCoverage/);
  assert.match(searchSmoke, /syntax overhead/);
  assert.match(searchSmoke, /en\/publications\//);

  const i18nManifest = JSON.parse(read('data/i18n.json'));
  const i18nSmoke = read('scripts/i18n-browser-smoke.cjs');
  assert.ok(i18nManifest.some((pair) => pair.id === 'publications'
    && pair.ru === 'landing/publications.html'
    && pair.en === 'en/publications.html'));
  assert.match(i18nSmoke, /data['"]?,?['"]?\s*[,\/]?\s*i18n\.json|data\/i18n\.json/);

  assert.equal(exists('scripts/production-p3-5c-english-publications-smoke.cjs'), true);
  const workflow = read('.github/workflows/production-live.yml');
  assert.match(workflow, /production-p3-5c-english-publications-smoke\.cjs/);
  assert.match(workflow, /Run deployed P3\.5C English Publications smoke/);

  assert.equal(exists('data/search-en.json'), false);
  assert.equal(exists('docs/_search/en'), false);
});
