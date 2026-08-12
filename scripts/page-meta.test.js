import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {injectPageMeta, loadPageMeta, validatePageMeta} from './page-meta.js';

const validEntry = {
  path: 'landing/notes.html',
  card: 'notes',
  title: 'Engineering Notes — Руслан Немыкин',
  description: 'Technical notes about architecture and reliability.',
  displayTitle: 'ENGINEERING NOTES',
  kicker: 'TECHNICAL WRITING',
  tags: ['ARCHITECTURE', 'RELIABILITY'],
  accent: 'cyan',
};

test('validatePageMeta accepts a valid manifest', () => {
  const [entry] = validatePageMeta([validEntry]);
  assert.deepEqual(entry, validEntry);
});

test('validatePageMeta rejects duplicate paths and card slugs', () => {
  assert.throws(
    () => validatePageMeta([validEntry, {...validEntry, card: 'notes-2'}]),
    /Duplicate page metadata path/,
  );
  assert.throws(
    () => validatePageMeta([validEntry, {...validEntry, path: 'landing/other.html'}]),
    /Duplicate OpenGraph card slug/,
  );
});

test('validatePageMeta rejects unsafe paths and unsupported accents', () => {
  assert.throws(
    () => validatePageMeta([{...validEntry, path: '../escape.html'}]),
    /Unsafe page metadata path/,
  );
  assert.throws(
    () => validatePageMeta([{...validEntry, accent: 'red'}]),
    /Unsupported OpenGraph accent/,
  );
});

test('validatePageMeta rejects missing fields and invalid display alphabet', () => {
  const {description, ...missingDescription} = validEntry;
  assert.throws(() => validatePageMeta([missingDescription]), /description/);
  assert.throws(
    () => validatePageMeta([{...validEntry, displayTitle: 'Engineering Notes'}]),
    /uppercase ASCII display alphabet/,
  );
});

test('loadPageMeta derives missing Note metadata from the canonical Notes Registry', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'page-meta-notes-'));
  const pageMetaPath = path.join(root, 'page-meta.json');
  const notesPath = path.join(root, 'notes.json');
  fs.writeFileSync(pageMetaPath, `${JSON.stringify([validEntry], null, 2)}\n`, 'utf8');
  fs.writeFileSync(notesPath, `${JSON.stringify([{
    slug: 'evidence-driven-project-state',
    title: 'Как описывать состояние проекта без ложной уверенности',
    description: 'Canonical project-state evidence model.',
    tags: ['Evidence', 'Project State', 'Verification'],
  }], null, 2)}\n`, 'utf8');

  const entries = loadPageMeta(pageMetaPath, {notesManifestPath: notesPath, deriveNotes: true});
  const derived = entries.find((entry) => entry.path === 'landing/notes/evidence-driven-project-state.html');

  assert.ok(derived);
  assert.equal(derived.card, 'note-evidence-driven-project-state');
  assert.equal(derived.title, 'Как описывать состояние проекта без ложной уверенности');
  assert.equal(derived.displayTitle, 'EVIDENCE DRIVEN PROJECT STATE');
  assert.deepEqual(derived.tags, ['EVIDENCE', 'PROJECT STATE', 'VERIFICATION']);
});

test('loadPageMeta does not duplicate an explicitly registered Note path', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'page-meta-explicit-note-'));
  const explicit = {
    ...validEntry,
    path: 'landing/notes/evidence-driven-project-state.html',
    card: 'note-explicit-project-state',
  };
  const pageMetaPath = path.join(root, 'page-meta.json');
  const notesPath = path.join(root, 'notes.json');
  fs.writeFileSync(pageMetaPath, `${JSON.stringify([explicit], null, 2)}\n`, 'utf8');
  fs.writeFileSync(notesPath, `${JSON.stringify([{
    slug: 'evidence-driven-project-state',
    title: explicit.title,
    description: explicit.description,
    tags: ['Evidence'],
  }], null, 2)}\n`, 'utf8');

  const entries = loadPageMeta(pageMetaPath, {notesManifestPath: notesPath, deriveNotes: true});
  assert.equal(entries.filter((entry) => entry.path === explicit.path).length, 1);
  assert.equal(entries[0].card, explicit.card);
});

test('injectPageMeta replaces stale metadata idempotently with clean launch metadata', () => {
  const source = `<!doctype html><html><head>
    <title>Old</title>
    <meta name="description" content="old">
    <meta property="og:title" content="old">
    <link rel="canonical" href="https://old.example/page">
  </head><body><h1>Notes</h1></body></html>`;

  const once = injectPageMeta(source, validEntry, 'https://example.test');
  const twice = injectPageMeta(once, validEntry, 'https://example.test');

  assert.equal(once, twice);
  assert.match(once, /Engineering Notes — Руслан Немыкин/);
  assert.match(once, /rel="canonical" href="https:\/\/example\.test\/notes\/"/);
  assert.match(once, /property="og:url" content="https:\/\/example\.test\/notes\/"/);
  assert.doesNotMatch(once, /https:\/\/example\.test\/landing\/notes\.html/);
  assert.match(once, /https:\/\/example\.test\/assets\/og\/notes\.png/);
  assert.match(once, /property="og:site_name" content="TrueRuslan"/);
  assert.match(once, /property="og:locale" content="ru_RU"/);
  assert.match(once, /property="og:image:type" content="image\/png"/);
  assert.match(once, /name="twitter:image:alt" content="ENGINEERING NOTES — TECHNICAL WRITING"/);
  assert.match(once, /summary_large_image/);
  assert.equal((once.match(/property="og:title"/g) ?? []).length, 1);
  assert.equal((once.match(/rel="canonical"/g) ?? []).length, 1);
});

test('injectPageMeta projects clean URLs inside a configured site subpath', () => {
  const source = '<!doctype html><html><head><title>Old</title></head><body><h1>Resume</h1></body></html>';
  const html = injectPageMeta(
    source,
    {...validEntry, path: 'landing/resume.html', card: 'resume'},
    'https://example.test/site/',
  );

  assert.match(html, /rel="canonical" href="https:\/\/example\.test\/site\/resume\/"/);
  assert.match(html, /property="og:url" content="https:\/\/example\.test\/site\/resume\/"/);
  assert.match(html, /property="og:image" content="https:\/\/example\.test\/site\/assets\/og\/resume\.png"/);
  assert.doesNotMatch(html, /\/site\/landing\/resume\.html/);
});

test('injectPageMeta canonicalizes nested English pages and emits English locale metadata', () => {
  const source = '<!doctype html><html><head><title>Old</title></head><body><h1>English</h1></body></html>';
  const html = injectPageMeta(
    source,
    {...validEntry, path: 'en/work-with-me.html', card: 'work-with-me-en'},
    'https://example.test/site/',
  );

  assert.match(html, /rel="canonical" href="https:\/\/example\.test\/site\/en\/work-with-me\/"/);
  assert.match(html, /property="og:url" content="https:\/\/example\.test\/site\/en\/work-with-me\/"/);
  assert.match(html, /property="og:locale" content="en_US"/);
  assert.doesNotMatch(html, /https:\/\/example\.test\/site\/en\/work-with-me\.html/);
});

test('injectPageMeta canonicalizes nested index pages to their public directory URL', () => {
  const source = '<!doctype html><html><head><title>Old</title></head><body><h1>English home</h1></body></html>';
  const html = injectPageMeta(source, {...validEntry, path: 'en/index.html', card: 'home-en'}, 'https://example.test/site/');

  assert.match(html, /rel="canonical" href="https:\/\/example\.test\/site\/en\/"/);
  assert.match(html, /property="og:url" content="https:\/\/example\.test\/site\/en\/"/);
  assert.match(html, /property="og:locale" content="en_US"/);
  assert.doesNotMatch(html, /https:\/\/example\.test\/site\/en\/index\.html/);
});
