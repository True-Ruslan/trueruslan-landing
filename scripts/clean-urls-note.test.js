import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'clean-urls-without-cloudflare-routing';
const TITLE = 'Как clean URLs заработали на GitHub Pages без Cloudflare routing';
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('clean URLs note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing clean URLs Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-05');
  assert.equal(note.updated, '2026-08-05');
  assert.ok(note.tags.includes('Clean URLs'));
  assert.ok(note.tags.includes('GitHub Pages'));
  assert.ok(note.related.includes('deployment-success-is-not-production-verification'));
  assert.ok(note.related.includes('static-site-quality-gates'));
});

test('clean URLs note preserves the full repository-native routing contract', () => {
  const source = read('docs', 'landing', 'notes', `${SLUG}.md`);

  for (const marker of [
    'repository-native directory URLs',
    'publishDirectoryRoutes',
    'Diplodoc',
    '<base href>',
    'router.pathname',
    'router.depth',
    'canonical',
    'hreflang',
    'OpenGraph',
    'Sitemap',
    'Atom feed',
    'generated search',
    'Cloudflare',
    'DNS/CDN/analytics',
    'application router',
    'GitHub Pages',
    'HTTP 301',
    'noindex,follow',
    'query',
    'fragment',
    'search-engine observation',
    'PR #114',
    'PR #115',
    'cf07c39378e7c531583e80eaef5edc7e7d1f2bad',
    '4260d30cff4ebdbf3f666f4763aa667c8dc7ee6c',
    'Проверенный факт',
    'Инженерный вывод',
    'Ограничение',
    '../projects/portfolio-platform.md',
    'deployment-success-is-not-production-verification.md',
    'не доказывает',
  ]) {
    assert.ok(source.includes(marker), `missing required clean URL marker: ${marker}`);
  }

  assert.match(source, /clean URLs[^\n]*Cloudflare routing/i);
  assert.match(source, /legacy `?\.html`?/i);
  assert.doesNotMatch(source, /Google и Яндекс уже полностью заменили/i);
  assert.doesNotMatch(source, /GitHub Pages[^\n]*настраиваемый HTTP 301/i);
});

test('clean URLs note is exposed through index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), new RegExp(`${SLUG}\\.md`));
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));

  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  const meta = pageMeta.find((entry) => entry.path === `landing/notes/${SLUG}.html`);

  assert.ok(meta, 'missing clean URLs page metadata');
  assert.equal(meta.card, 'note-clean-urls');
  assert.equal(meta.displayTitle, 'CLEAN URL CONTRACT');
});
