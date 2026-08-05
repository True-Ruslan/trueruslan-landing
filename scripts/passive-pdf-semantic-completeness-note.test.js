import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'passive-pdf-validation-vs-semantic-completeness';
const TITLE = 'Почему валидный PDF ещё не доказывает полноту и актуальность резюме';
const NOTE = path.join(ROOT, 'docs', 'landing', 'notes', `${SLUG}.md`);
const PRODUCTION_SMOKE = path.join(ROOT, 'scripts', 'production-passive-pdf-semantic-completeness-note-smoke.cjs');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'production-live.yml');
const ROUTES = path.join(ROOT, 'scripts', 'production-live-routes.cjs');
const RESUME = path.join(ROOT, 'docs', 'landing', 'resume.md');
const PDF = path.join(ROOT, 'docs', 'assets', 'documents', 'cv.pdf');
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('passive PDF completeness Note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing P3.4E passive PDF Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-06');
  assert.equal(note.updated, '2026-08-06');
  assert.ok(note.tags.includes('PDF'));
  assert.ok(note.tags.includes('Validation'));
  assert.ok(note.tags.includes('Semantic Completeness'));
  assert.ok(note.related.includes('deployment-success-is-not-production-verification'));
  assert.ok(note.related.includes('source-tests-to-installed-acceptance'));
});

test('passive PDF completeness Note separates artifact validity from semantic truth', () => {
  assert.ok(fs.existsSync(NOTE), 'missing P3.4E Note source');
  assert.ok(fs.existsSync(RESUME), 'missing canonical web resume source');
  assert.ok(fs.existsSync(PDF), 'missing canonical PDF asset');
  const source = fs.readFileSync(NOTE, 'utf8');

  for (const marker of [
    'file existence',
    'stable route',
    '%PDF-',
    'parseability',
    'MIME',
    'Content-Disposition',
    'downloadable bytes',
    'passive',
    'no-JavaScript',
    'iframe',
    'noscript',
    'page count',
    'structural validation',
    'text extraction',
    'required sections',
    'web-CV',
    'semantic equivalence',
    'current professional-profile truth',
    'accessibility',
    'human-readable layout',
    'exact deployed PDF',
    'docs/assets/documents/cv.pdf',
    '277792',
    'a6d9871aed7f52992032fb04e5d6f12eeae72808',
    'Java Backend Engineer',
    'Руслан Немыкин',
    'QWEP',
    'Java 21–25',
    'Spring Boot 3.5–4',
    'Проверенный факт',
    'Инженерный вывод',
    'Ограничение',
    '../resume.md',
    'deployment-success-is-not-production-verification.md',
    'не доказывает',
  ]) {
    assert.ok(source.includes(marker), `missing required P3.4E marker: ${marker}`);
  }

  assert.match(source, /валидный PDF[^\n]*не доказывает[^\n]*(?:полноту|актуальность)/i);
  assert.match(source, /web-CV[^\n]*canonical editorial source/i);
  assert.doesNotMatch(source, /parseable PDF[^\n]*(?:гарантирует|полностью доказывает)[^\n]*(?:актуальность|доступность|полноту)/i);
  assert.doesNotMatch(source, /byte identity[^\n]*(?:равна|означает)[^\n]*semantic equivalence/i);
});

test('passive PDF completeness Note is exposed through index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), new RegExp(`${SLUG}\\.md`));
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));

  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  const meta = pageMeta.find((entry) => entry.path === `landing/notes/${SLUG}.html`);

  assert.ok(meta, 'missing P3.4E page metadata');
  assert.equal(meta.card, 'note-passive-pdf-completeness');
  assert.equal(meta.displayTitle, 'PDF VALIDITY VS MEANING');
});

test('deployment-only P3.4E smoke covers Note route PDF bytes resume semantics feed and search', () => {
  assert.ok(fs.existsSync(PRODUCTION_SMOKE), 'missing deployment-only P3.4E smoke');
  assert.ok(fs.existsSync(ROUTES), 'missing production route contract');
  assert.ok(fs.existsSync(WORKFLOW), 'missing production workflow');

  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${fs.readFileSync(PRODUCTION_SMOKE, 'utf8')}`;
  const workflow = fs.readFileSync(WORKFLOW, 'utf8');

  for (const marker of [
    'landing/notes/passive-pdf-validation-vs-semantic-completeness/',
    TITLE,
    'main.dc-doc-page__content',
    'landing/resume/',
    'assets/documents/cv.pdf',
    '%PDF-',
    'application/pdf',
    'Java Backend Engineer',
    'Руслан Немыкин',
    'QWEP',
    'Java 21–25',
    'Spring Boot 3.5–4',
    'feed.xml',
    'generated search',
    'passive-pdf-semantic-completeness-note-production-summary.json',
  ]) {
    assert.ok(source.includes(marker), `missing deployed P3.4E smoke marker: ${marker}`);
  }

  assert.match(workflow, /scripts\/production-passive-pdf-semantic-completeness-note-smoke\.cjs/);
  assert.match(workflow, /name: Run deployed P3\.4E Passive PDF Completeness Note smoke/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /link\[rel="canonical"\]/);
  assert.match(source, /meta\[property="og:url"\]/);
  assert.match(source, /page\.screenshot/);
});
