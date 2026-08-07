import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {loadNowData, renderNowContent} from './now-page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

const projects = [{
  slug: 'livingworld',
  name: 'VillAIgence',
  status: 'release-candidate',
  statusLabel: 'ACCEPTANCE IN PROGRESS',
  summary: 'Server-authoritative AI society.',
  featured: true,
  active: true,
  visibility: 'public',
  href: 'landing/projects/livingworld.html',
  tags: ['Java 21', 'AI security'],
}];

test('canonical now registry owns English editorial copy without a second state file', () => {
  const current = loadNowData();
  assert.equal(typeof current.en, 'object');
  assert.equal(typeof current.en.focus, 'string');
  assert.ok(current.en.focus.trim());
  assert.ok(Array.isArray(current.en.learning) && current.en.learning.length > 0);
  assert.ok(Array.isArray(current.en.writing) && current.en.writing.length > 0);
  assert.equal(fs.existsSync(path.join(ROOT, 'data', 'now-en.json')), false);
});

test('English now renderer localizes presentation and keeps project identity registry-backed', () => {
  const current = loadNowData();
  const html = renderNowContent(current, projects, {
    locale: 'en',
    hrefTransform: (href) => href.replace('landing/projects/', 'en/projects/'),
  });

  assert.match(html, /Current work/);
  assert.match(html, /What I(?:'|&#39;)m learning/);
  assert.match(html, /What I(?:'|&#39;)m writing/);
  assert.match(html, /VillAIgence/);
  assert.match(html, /href="en\/projects\/livingworld\.html"/);
  assert.doesNotMatch(html, /Сейчас в работе|Что изучаю|Что пишу/);
  assert.equal(html.includes(current.en.focus), true);
});

test('English now route is wired into one i18n, metadata and navigation architecture', () => {
  const i18n = JSON.parse(read('data/i18n.json'));
  const pair = i18n.find(({id}) => id === 'now');
  assert.deepEqual(pair, {
    id: 'now',
    ru: 'landing/now.html',
    en: 'en/now.html',
  });

  const pageMeta = JSON.parse(read('data/page-meta.json'));
  const meta = pageMeta.find(({path: pagePath}) => pagePath === 'en/now.html');
  assert.equal(meta?.title, 'Now — Ruslan Nemykin');
  assert.match(meta?.description ?? '', /current engineering focus/i);

  const source = read('docs/en/now.md');
  assert.match(source, /^# Now$/m);
  assert.match(source, /data-tr-now-placeholder/);
  assert.doesNotMatch(source, /[А-Яа-яЁё]/);

  const toc = read('docs/toc.yaml');
  assert.match(toc, /name: Now\s+href: \.\/en\/now\.md/);
});

test('English now is covered by browser, generated-search and exact-deployment gates', () => {
  const copyAssets = read('scripts/copy-assets.js');
  assert.match(copyAssets, /target: 'en\/now\.html'/);
  assert.match(copyAssets, /locale: 'en'/);
  assert.match(copyAssets, /hrefTransform: englishProjectHref/);

  const i18nSmoke = read('scripts/i18n-browser-smoke.cjs');
  assert.match(i18nSmoke, /id: 'now'/);
  assert.match(i18nSmoke, /data-tr-now-noscript=\\?"en\\?"/);
  assert.match(i18nSmoke, /Current work/);

  const searchSmoke = read('scripts/search-smoke.cjs');
  assert.match(searchSmoke, /assertEnglishNowSearchCoverage/);
  assert.match(searchSmoke, /en\/now\//);

  const routes = read('scripts/production-live-routes.cjs');
  assert.match(routes, /NOW_EN_PATH = 'en\/now\/'/);
  assert.match(routes, /NOW_EN_URL/);

  assert.equal(fs.existsSync(path.join(ROOT, 'scripts', 'production-p3-5b-english-now-smoke.cjs')), true);
  const workflow = read('.github/workflows/production-live.yml');
  assert.match(workflow, /production-p3-5b-english-now-smoke\.cjs/);
  assert.match(workflow, /Run deployed P3\.5B English Now smoke/);
});
