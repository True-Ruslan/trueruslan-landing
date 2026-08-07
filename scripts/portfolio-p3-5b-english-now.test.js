import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {loadNowData, renderNowContent} from './now-page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

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
  const i18n = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'i18n.json'), 'utf8'));
  const pair = i18n.find(({id}) => id === 'now');
  assert.deepEqual(pair, {
    id: 'now',
    ru: 'landing/now.html',
    en: 'en/now.html',
  });

  const pageMeta = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'page-meta.json'), 'utf8'));
  const meta = pageMeta.find(({path: pagePath}) => pagePath === 'en/now.html');
  assert.equal(meta?.title, 'Now — Ruslan Nemykin');
  assert.match(meta?.description ?? '', /current engineering focus/i);

  const source = fs.readFileSync(path.join(ROOT, 'docs', 'en', 'now.md'), 'utf8');
  assert.match(source, /^# Now$/m);
  assert.match(source, /data-tr-now-placeholder/);
  assert.doesNotMatch(source, /[А-Яа-яЁё]/);

  const toc = fs.readFileSync(path.join(ROOT, 'docs', 'toc.yaml'), 'utf8');
  assert.match(toc, /name: Now\s+href: \.\/en\/now\.md/);
});
