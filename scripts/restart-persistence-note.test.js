import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'restart-persistence-is-a-product-contract';
const TITLE = 'Restart — это часть продукта: почему сохранённый JSON ещё не доказывает persistence';
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('restart persistence note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing restart persistence Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-04');
  assert.equal(note.updated, '2026-08-04');
  assert.equal(note.readingMinutes, 12);
  for (const tag of ['Persistence', 'Reliability', 'Recovery', 'Acceptance']) {
    assert.ok(note.tags.includes(tag), `missing note tag: ${tag}`);
  }
  assert.ok(note.related.includes('source-tests-to-installed-acceptance'));
  assert.ok(note.related.includes('green-ci-is-not-product-verification'));
  assert.ok(note.related.includes('probabilistic-proposals-deterministic-authority'));
});

test('restart persistence note separates byte structural semantic and behavioral continuity', () => {
  const source = read('docs', 'landing', 'notes', `${SLUG}.md`);

  for (const marker of [
    'PR #66',
    'PR #67',
    'PR #103',
    'PR #104',
    'memory.json',
    'memory2.json',
    'semantic-memory.json',
    'relationships.json',
    'voices.json',
    'operator-lore.json',
    'SHA-256',
    'controlled shutdown',
    'rollback',
    'schema',
    'migration',
    'semantic continuity',
    'behavioral continuity',
  ]) {
    assert.ok(source.includes(marker), `missing required persistence marker: ${marker}`);
  }

  assert.match(source, /byte continuity/i);
  assert.match(source, /structural readability/i);
  assert.match(source, /equal hashes?.*(не доказыва|недостаточ)/is);
  assert.match(source, /intentional.*(write|mutation).*hash/is);
  assert.match(source, /cumulative.*(pending|не заверш)/is);
  assert.doesNotMatch(
    source,
    /хеши доказывают полную корректность|полностью исключает потерю данных|cumulative acceptance завершена/i,
  );
});

test('restart persistence note is exposed through index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), new RegExp(`${SLUG}\\.md`));
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));

  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  assert.ok(
    pageMeta.some((entry) => entry.path === `landing/notes/${SLUG}.html`),
    'missing restart persistence page metadata',
  );
});
