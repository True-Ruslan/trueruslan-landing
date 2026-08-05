import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'deployment-success-is-not-production-verification';
const TITLE = 'Почему успешный deployment ещё не означает production verification';
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('deployment verification note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing deployment verification Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-05');
  assert.equal(note.updated, '2026-08-05');
  assert.ok(note.tags.includes('Deployment'));
  assert.ok(note.tags.includes('Verification'));
  assert.ok(note.related.includes('green-ci-is-not-product-verification'));
  assert.ok(note.related.includes('static-site-quality-gates'));
});

test('deployment verification note separates every evidence layer', () => {
  const source = read('docs', 'landing', 'notes', `${SLUG}.md`);

  for (const marker of [
    'repository readiness',
    'generated artifact',
    'GitHub Pages deployment',
    'Production Live Smoke',
    'exact deployed SHA',
    'PR #119',
    'PR #120',
    'main.dc-doc-page__content',
    'search-engine observation',
    'не доказывает',
  ]) {
    assert.ok(source.includes(marker), `missing required evidence marker: ${marker}`);
  }

  assert.match(source, /deployment success[^\n]*production verification/i);
  assert.match(source, /verifier defect/i);
  assert.doesNotMatch(source, /успешный deployment автоматически доказывает/i);
});

test('deployment verification note is exposed through index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), new RegExp(`${SLUG}\\.md`));
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));

  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  const meta = pageMeta.find((entry) => entry.path === `landing/notes/${SLUG}.html`);

  assert.ok(meta, 'missing deployment verification page metadata');
  assert.equal(meta.card, 'note-deployment-verification');
  assert.equal(meta.displayTitle, 'DEPLOYMENT VERIFICATION');
});
