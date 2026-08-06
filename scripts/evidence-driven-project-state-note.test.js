import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'evidence-driven-project-state';
const TITLE = 'Как описывать состояние проекта без ложной уверенности';
const NOTE = path.join(ROOT, 'docs', 'landing', 'notes', `${SLUG}.md`);
const PRODUCTION_SMOKE = path.join(ROOT, 'scripts', 'production-evidence-driven-project-state-note-smoke.cjs');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'production-live.yml');
const ROUTES = path.join(ROOT, 'scripts', 'production-live-routes.cjs');
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('P3.4F Note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing P3.4F evidence-driven project state Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-06');
  assert.equal(note.updated, '2026-08-06');
  assert.ok(note.tags.includes('Evidence'));
  assert.ok(note.tags.includes('Project State'));
  assert.ok(note.tags.includes('Verification'));
  assert.ok(note.related.includes('deployment-success-is-not-production-verification'));
  assert.ok(note.related.includes('passive-pdf-validation-vs-semantic-completeness'));
});

test('P3.4F Note separates evidence layers and uncertainty classes', () => {
  assert.ok(fs.existsSync(NOTE), 'missing P3.4F Note source');
  const source = fs.readFileSync(NOTE, 'utf8');

  for (const marker of [
    'canonical registry',
    'Проверенный факт',
    'Инженерный вывод',
    'Ограничение',
    'stale',
    'unverified',
    'observedAt',
    'commit SHA',
    'artifact digest',
    'deployment identity',
    'repository activity',
    'generated artifact',
    'deployed production',
    'external-product acceptance',
    'operator/search-engine state',
    'Draft',
    'product-owner',
    'reviewable',
    'non-mutating',
    'no-JavaScript',
    'Atom feed',
    'generated search',
    'exact-head',
    'exact-deployment',
  ]) {
    assert.ok(source.includes(marker), `missing required P3.4F marker: ${marker}`);
  }

  assert.match(source, /Draft[^\n]*не является[^\n]*accepted evidence/i);
  assert.match(source, /автоматическ[^\n]*не[^\n]*(?:повышает|продвигает|изменяет)[^\n]*статус/i);
  assert.match(source, /последний commit[^\n]*не доказывает[^\n]*production/i);
  assert.doesNotMatch(source, /последний commit[^\n]*(?:гарантирует|полностью доказывает)[^\n]*production/i);
});

test('P3.4F Note is exposed through index and toc', () => {
  assert.match(read('docs', 'landing', 'notes.md'), new RegExp(`${SLUG}\\.md`));
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));
});

test('deployment-only P3.4F smoke covers route content feed search and uncertainty boundaries', () => {
  assert.ok(fs.existsSync(PRODUCTION_SMOKE), 'missing deployment-only P3.4F smoke');
  assert.ok(fs.existsSync(ROUTES), 'missing production route contract');
  assert.ok(fs.existsSync(WORKFLOW), 'missing production workflow');

  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${fs.readFileSync(PRODUCTION_SMOKE, 'utf8')}`;
  const workflow = fs.readFileSync(WORKFLOW, 'utf8');

  for (const marker of [
    'landing/notes/evidence-driven-project-state/',
    TITLE,
    'main.dc-doc-page__content',
    'canonical registry',
    'verified',
    'stale',
    'unverified',
    'Draft не является accepted evidence',
    'feed.xml',
    'generated search',
    'evidence-driven-project-state-note-production-summary.json',
  ]) {
    assert.ok(source.includes(marker), `missing deployed P3.4F smoke marker: ${marker}`);
  }

  assert.match(workflow, /scripts\/production-evidence-driven-project-state-note-smoke\.cjs/);
  assert.match(workflow, /name: Run deployed P3\.4F Evidence-Driven Project State Note smoke/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /link\[rel="canonical"\]/);
  assert.match(source, /meta\[property="og:url"\]/);
  assert.match(source, /page\.screenshot/);
});
