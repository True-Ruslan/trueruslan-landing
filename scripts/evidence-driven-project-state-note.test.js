import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'evidence-driven-project-state';
const TITLE = 'Как описывать состояние проекта без ложной уверенности';
const NOTE = path.join(ROOT, 'docs', 'landing', 'notes', `${SLUG}.md`);
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
