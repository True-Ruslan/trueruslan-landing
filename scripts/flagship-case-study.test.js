import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_DIR = path.join(ROOT, 'docs', 'landing', 'projects');
const EN_PROJECT_DIR = path.join(ROOT, 'docs', 'en', 'projects');

const CLASSIC_MARKERS = Object.freeze([
  'problem',
  'constraints',
  'decisions',
  'failures',
  'current-state',
  'evidence',
  'retrospective',
]);

const EVIDENCE_FIRST_MARKERS = Object.freeze([
  'problem',
  'constraints',
  'current-state',
  'decisions',
  'alternatives',
  'evidence',
  'limitations',
  'next',
  'related',
  'retrospective',
]);

const FLAGSHIPS = Object.freeze([
  {
    slug: 'livingworld',
    file: 'livingworld.md',
    timeline: 'livingworld',
    evidence: 'livingworld',
    status: 'livingworld',
    diagram: '../../assets/diagrams/villaigence-authority-and-acceptance.svg',
    markers: EVIDENCE_FIRST_MARKERS,
  },
  {
    slug: 'node-zero',
    file: 'node-zero.md',
    timeline: 'node-zero',
    evidence: 'node-zero',
    diagram: '../../assets/diagrams/node-zero-architecture.svg',
    markers: CLASSIC_MARKERS,
  },
  {
    slug: 'vlezet',
    file: 'vlezet.md',
    timeline: 'vlezet',
    evidence: 'vlezet',
    status: 'vlezet',
    diagram: '../../assets/diagrams/vlezet-recognition-authority.svg',
    markers: EVIDENCE_FIRST_MARKERS,
  },
  {
    slug: 'portfolio-platform',
    file: 'portfolio-platform.md',
    timeline: 'portfolio-platform',
    evidence: 'portfolio-platform',
    status: 'portfolio-platform',
    markers: EVIDENCE_FIRST_MARKERS,
  },
]);

function count(text, token) {
  return text.split(token).length - 1;
}

function assertMarkerOrder(source, slug, markers) {
  let previousIndex = -1;
  for (const marker of markers) {
    const token = `<!-- case-study:${marker} -->`;
    assert.equal(count(source, token), 1, `${slug}: ${token} must appear exactly once`);
    const index = source.indexOf(token);
    assert.ok(index > previousIndex, `${slug}: ${token} is out of canonical order`);
    previousIndex = index;
  }
}

for (const flagship of FLAGSHIPS) {
  test(`${flagship.slug} follows the flagship case-study narrative contract`, () => {
    const source = fs.readFileSync(path.join(PROJECT_DIR, flagship.file), 'utf8');

    assertMarkerOrder(source, flagship.slug, flagship.markers);

    const timeline = `<div data-tr-project-timeline="${flagship.timeline}"></div>`;
    const evidence = `<div data-tr-project-evidence="${flagship.evidence}"></div>`;
    assert.equal(count(source, timeline), 1, `${flagship.slug}: timeline placeholder must appear exactly once`);
    assert.equal(count(source, evidence), 1, `${flagship.slug}: evidence placeholder must appear exactly once`);
    if (flagship.status) {
      const status = `<span data-tr-project-status="${flagship.status}"></span>`;
      assert.equal(count(source, status), 1, `${flagship.slug}: status placeholder must appear exactly once`);
    }
    if (flagship.markers === EVIDENCE_FIRST_MARKERS) {
      assert.equal(
        count(source, '<!-- case-study:failures -->'),
        0,
        `${flagship.slug}: obsolete failures marker must be removed`,
      );
    }
    if (flagship.diagram) {
      assert.equal(count(source, flagship.diagram), 1, `${flagship.slug}: architecture diagram must remain exactly once`);
    }
  });
}

test('controlled English VillAIgence follows the evidence-first narrative contract', () => {
  const source = fs.readFileSync(path.join(EN_PROJECT_DIR, 'livingworld.md'), 'utf8');

  assertMarkerOrder(source, 'livingworld-en', EVIDENCE_FIRST_MARKERS);
  assert.equal(count(source, '<span data-tr-project-status="livingworld"></span>'), 1);
  assert.equal(count(source, '<!-- case-study:failures -->'), 0);
  assert.equal(
    count(source, '../../assets/diagrams/villaigence-authority-and-acceptance.svg'),
    1,
    'livingworld-en: authority diagram must remain exactly once',
  );
  assert.ok(
    source.includes('../../landing/projects/livingworld.md'),
    'livingworld-en: shared RU canonical evidence link must remain explicit',
  );
});

test('controlled flagship set stays intentionally small', () => {
  assert.deepEqual(FLAGSHIPS.map(({slug}) => slug), [
    'livingworld',
    'node-zero',
    'vlezet',
    'portfolio-platform',
  ]);
});
