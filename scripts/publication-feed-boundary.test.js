import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {loadNotesManifest, renderAtomFeed} from './notes-content.js';
import {loadPublicationRegistry} from './publication-registry.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_DIR = path.join(ROOT, 'docs');

test('Engineering Notes Atom feed excludes every external publication record', () => {
  const notes = loadNotesManifest(path.join(ROOT, 'data', 'notes.json'), {docsDir: DOCS_DIR});
  const publications = loadPublicationRegistry(path.join(ROOT, 'data', 'publications.json'), {
    asOf: '2026-09-02',
    projectSlugs: [],
    noteSlugs: notes.map(({slug}) => slug),
  });
  const feed = renderAtomFeed(notes, 'https://trueruslan.ru');

  assert.equal((feed.match(/<entry>/g) ?? []).length, notes.length);
  assert.match(feed, /TrueRuslan Engineering Notes/);
  assert.match(feed, /\/landing\/notes\//);
  assert.doesNotMatch(feed, /\/landing\/publications(?:\.html)?/);

  for (const publication of publications) {
    assert.equal(feed.includes(publication.title), false, publication.id);
    assert.equal(feed.includes(publication.canonicalUrl), false, publication.id);
  }
});
