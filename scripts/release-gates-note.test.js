import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'source-tests-to-installed-acceptance';
const TITLE = 'От source tests к installed acceptance: что доказывает каждый release gate';
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('release-gates note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing release-gates Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-03');
  assert.equal(note.updated, '2026-08-03');
  assert.ok(note.tags.includes('Release Engineering'));
  assert.ok(note.related.includes('green-ci-is-not-product-verification'));
});

test('release-gates note distinguishes every acceptance layer', () => {
  const source = read('docs', 'landing', 'notes', `${SLUG}.md`);

  for (const marker of [
    '0.1.20+1.21.1',
    '0.1.21+1.21.1',
    'PR #103',
    'PR #104',
    'source tests',
    'GameTests',
    'production JAR',
    'два отдельных JVM',
    'memory.json',
    'operator-lore.json',
    'cumulative acceptance',
    'rollback',
  ]) {
    assert.ok(source.includes(marker), `missing required evidence marker: ${marker}`);
  }

  assert.match(source, /не доказывает/i);
  assert.match(source, /оста[её]тся pending/i);
  assert.doesNotMatch(source, /полностью проверен(?:а|о|ы)?/i);
});

test('release-gates note is exposed through registry index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), /data-tr-notes-index-placeholder/);
  assert.ok(
    JSON.parse(read('data', 'notes.json')).some((note) => note.slug === SLUG),
    'missing release-gates Note from canonical Notes Registry',
  );
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));

  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  assert.ok(
    pageMeta.some((entry) => entry.path === `landing/notes/${SLUG}.html`),
    'missing release-gates page metadata',
  );
});
