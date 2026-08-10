import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'hybrid-cv-ai-recognition-boundaries';
const TITLE = 'Как соединить local CV и AI, не отдавая модели authority над геометрией';
const NOTE = path.join(ROOT, 'docs', 'landing', 'notes', `${SLUG}.md`);
const PRODUCTION_SMOKE = path.join(ROOT, 'scripts', 'production-hybrid-recognition-note-smoke.cjs');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'production-live.yml');
const ROUTES = path.join(ROOT, 'scripts', 'production-live-routes.cjs');
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('hybrid recognition Note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing P3.4C hybrid recognition Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-05');
  assert.equal(note.updated, '2026-08-05');
  assert.ok(note.tags.includes('Computer Vision'));
  assert.ok(note.tags.includes('AI'));
  assert.ok(note.tags.includes('Authority'));
  assert.ok(note.related.includes('probabilistic-proposals-deterministic-authority'));
  assert.ok(note.related.includes('green-ci-is-not-product-verification'));
});

test('hybrid recognition Note preserves authority, validation and acceptance boundaries', () => {
  assert.ok(fs.existsSync(NOTE), 'missing P3.4C Note source');
  const source = fs.readFileSync(NOTE, 'utf8');

  for (const marker of [
    'VlezetDocument',
    'local CV',
    'AI proposal',
    'raw provider output',
    'localDraftFingerprint',
    'requestId',
    'referenceRevision',
    'immutable',
    'deterministic validation',
    'current-state revalidation',
    'explicit Apply',
    'atomic',
    'Undo/Redo',
    'stale',
    'malformed',
    'overload',
    'fail closed',
    'no mutation',
    'M7.8B',
    'M7.8C',
    'PR #41',
    'PR #42',
    'PR #44',
    'PR #45',
    '08800dd66fa298ff31d1a7e6b33e91964cdb8d16',
    'product-owner retest',
    'benchmark',
    'browser',
    'CI',
    'product acceptance',
    'Проверенный факт',
    'Инженерный вывод',
    'Ограничение',
    '../projects/vlezet.md',
    'probabilistic-proposals-deterministic-authority.md',
    'не доказывает',
  ]) {
    assert.ok(source.includes(marker), `missing required P3.4C marker: ${marker}`);
  }

  assert.doesNotMatch(source, /распознавание (?:полностью )?готово/i);
  assert.doesNotMatch(source, /M7\.8C[^\n]*(?:принят|accepted|production-ready)/i);
  assert.doesNotMatch(source, /PR #(?:42|44|45)[^\n]*(?:merged|слит)/i);
  assert.doesNotMatch(source, /AI[^\n]*(?:автоматически применяет|authoritative coordinates)/i);
});

test('hybrid recognition Note is exposed through registry index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), /data-tr-notes-index-placeholder/);
  assert.ok(
    JSON.parse(read('data', 'notes.json')).some((note) => note.slug === SLUG),
    'missing P3.4C hybrid Note from canonical Notes Registry',
  );
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));

  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  const meta = pageMeta.find((entry) => entry.path === `landing/notes/${SLUG}.html`);

  assert.ok(meta, 'missing P3.4C page metadata');
  assert.equal(meta.card, 'note-hybrid-recognition');
  assert.equal(meta.displayTitle, 'HYBRID RECOGNITION');
});

test('deployment-only P3.4C smoke covers route content feed search and Draft boundaries', () => {
  assert.ok(fs.existsSync(PRODUCTION_SMOKE), 'missing deployment-only P3.4C smoke');
  assert.ok(fs.existsSync(ROUTES), 'missing production route contract');
  assert.ok(fs.existsSync(WORKFLOW), 'missing production workflow');

  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${fs.readFileSync(PRODUCTION_SMOKE, 'utf8')}`;
  const workflow = fs.readFileSync(WORKFLOW, 'utf8');

  for (const marker of [
    'notes/hybrid-cv-ai-recognition-boundaries/',
    TITLE,
    'main.dc-doc-page__content',
    'VlezetDocument',
    'localDraftFingerprint',
    'explicit Apply',
    'M7.8B',
    'PR #42',
    'PR #44',
    'PR #45',
    'product-owner retest',
    'feed.xml',
    'generated search',
    'hybrid-recognition-note-production-summary.json',
  ]) {
    assert.ok(source.includes(marker), `missing deployed P3.4C smoke marker: ${marker}`);
  }

  assert.match(workflow, /scripts\/production-hybrid-recognition-note-smoke\.cjs/);
  assert.match(workflow, /name: Run deployed P3\.4C Hybrid Recognition Note smoke/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /link\[rel="canonical"\]/);
  assert.match(source, /meta\[property="og:url"\]/);
  assert.match(source, /page\.screenshot/);
});
