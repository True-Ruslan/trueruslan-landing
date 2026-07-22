import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderAtomFeed,
  renderNoteMeta,
  renderNoteNavigation,
  validateNotesManifest,
} from './notes-content.js';

const notes = [
  {
    slug: 'first-note',
    title: 'First & note',
    description: 'A <useful> note.',
    published: '2026-07-20',
    updated: '2026-07-21',
    readingMinutes: 5,
    tags: ['Architecture', 'CI'],
    related: ['second-note'],
  },
  {
    slug: 'second-note',
    title: 'Second note',
    description: 'Another note.',
    published: '2026-07-20',
    updated: '2026-07-22',
    readingMinutes: 7,
    tags: ['AI'],
    related: ['first-note'],
  },
];

test('validateNotesManifest rejects invalid dates and unknown related notes', () => {
  assert.throws(
    () => validateNotesManifest([{...notes[0], updated: 'yesterday'}], {requireFiles: false}),
    /invalid note date/,
  );
  assert.throws(
    () => validateNotesManifest([{...notes[0], related: ['missing']}], {requireFiles: false}),
    /unknown slug/,
  );
});

test('renderNoteMeta exposes reading time, dates and escaped tags', () => {
  const html = renderNoteMeta({...notes[0], tags: ['<CI>']});
  assert.match(html, /5 мин/);
  assert.match(html, /datetime="2026-07-20"/);
  assert.match(html, /&lt;CI&gt;/);
});

test('renderNoteNavigation includes previous next and related links', () => {
  const html = renderNoteNavigation(notes[1], notes);
  assert.match(html, /first-note\.html/);
  assert.match(html, /Связанные заметки/);
});

test('renderAtomFeed is deterministic, ordered by update date and XML-safe', () => {
  const first = renderAtomFeed(notes, 'https://example.test/site/');
  const second = renderAtomFeed(notes, 'https://example.test/site/');
  assert.equal(first, second);
  assert.match(first, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/);
  assert.ok(first.indexOf('second-note.html') < first.indexOf('first-note.html'));
  assert.match(first, /First &amp; note/);
  assert.match(first, /A &lt;useful&gt; note\./);
  assert.doesNotMatch(first, /First & note/);
});
