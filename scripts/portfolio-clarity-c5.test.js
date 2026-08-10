import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function indexOfOrFail(source, token, label) {
  const index = source.indexOf(token);
  assert.notEqual(index, -1, `${label}: missing ${token}`);
  return index;
}

function proseBlocksBefore(source, marker) {
  const before = source.slice(0, indexOfOrFail(source, marker, marker));
  return before
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !block.startsWith('#'))
    .filter((block) => !block.startsWith('<'))
    .filter((block) => !/^\[.*\]\([^\n]+\)$/.test(block));
}

test('C5 Engineering Notes index derives compact cards from the canonical Notes Registry', () => {
  const source = read('docs/landing/notes.md');
  const module = read('scripts/notes-content.js');
  const build = read('scripts/copy-assets.js');
  const notes = JSON.parse(read('data/notes.json'));

  assert.match(source, /data-tr-notes-index-placeholder/);
  assert.doesNotMatch(source, /^### /m, 'Notes index must not hand-author a second title/summary catalogue');
  assert.ok(notes.length >= 10, 'canonical Notes Registry unexpectedly small');
  for (const note of notes) {
    assert.equal(typeof note.description, 'string');
    assert.ok(note.description.trim().length > 0, `note ${note.slug} lacks canonical concise summary`);
    assert.ok(Number.isInteger(note.readingMinutes), `note ${note.slug} lacks deterministic read time`);
  }
  assert.match(module, /export function renderNotesIndex\(/);
  assert.match(module, /export function applyNotesIndex\(/);
  assert.match(build, /applyNotesIndex/);
  assert.equal(fs.existsSync(path.join(ROOT, 'data', 'notes-index.json')), false, 'C5 may not add a second Notes index registry');
});

for (const [locale, relativePath, methodology] of [
  ['ru', 'docs/landing/publications.md', 'Это отдельный раздел сайта'],
  ['en', 'docs/en/publications.md', 'This is separate from'],
]) {
  test(`C5 Publications ${locale} shows published work before catalogue methodology`, () => {
    const source = read(relativePath);
    const featured = indexOfOrFail(source, '<div data-tr-publications-featured></div>', `${locale} featured`);
    const catalogue = indexOfOrFail(source, '{% include notitle', `${locale} catalogue`);
    const methodologyIndex = indexOfOrFail(source, methodology, `${locale} methodology`);

    assert.ok(featured < catalogue, `${locale}: Featured must precede catalogue`);
    assert.ok(catalogue < methodologyIndex, `${locale}: methodology must follow published work`);
    assert.ok(proseBlocksBefore(source, '<div data-tr-publications-featured></div>').length <= 2, `${locale}: Publications lead is too long`);
  });
}

test('C5 Engineering Map puts the map before taxonomy explanation', () => {
  const source = read('docs/landing/engineering-map.md');
  const slot = indexOfOrFail(source, 'engineering-map-build-slot', 'Engineering Map slot');
  const guide = indexOfOrFail(source, '## Как я сам читаю эту карту', 'Engineering Map guide');

  assert.ok(slot < guide, 'Engineering Map must render before its reading guide');
  assert.ok(proseBlocksBefore(source, 'engineering-map-build-slot').length <= 1, 'Engineering Map must have at most one concise lead before the map');
});

test('C5 Sources exposes the useful knowledge base before meta framing', () => {
  const source = read('docs/landing/bibliography.md');
  const placeholder = indexOfOrFail(source, '<div data-tr-sources-placeholder></div>', 'Sources placeholder');
  const framing = indexOfOrFail(source, 'Это не рейтинг', 'Sources framing');

  assert.ok(placeholder < framing, 'Sources knowledge utility must precede meta framing');
  assert.ok(proseBlocksBefore(source, '<div data-tr-sources-placeholder></div>').length <= 1, 'Sources lead is too long');
});
