import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_DIR = path.join(ROOT, 'docs', 'landing', 'projects');

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
    diagram: '../../assets/diagrams/villaigence-authority-and-acceptance.svg',
    markers: CLASSIC_MARKERS,
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
    diagram: '../../assets/diagrams/vlezet-recognition-authority.svg',
    markers: CLASSIC_MARKERS,
  },
  {
    slug: 'portfolio-platform',
    file: 'portfolio-platform.md',
    timeline: 'portfolio-platform',
    evidence: 'portfolio-platform',
    markers: EVIDENCE_FIRST_MARKERS,
  },
]);

function count(text, token) {
  return text.split(token).length - 1;
}

for (const flagship of FLAGSHIPS) {
  test(`${flagship.slug} follows the flagship case-study narrative contract`, () => {
    const source = fs.readFileSync(path.join(PROJECT_DIR, flagship.file), 'utf8');

    let previousIndex = -1;
    for (const marker of flagship.markers) {
      const token = `<!-- case-study:${marker} -->`;
      assert.equal(count(source, token), 1, `${flagship.slug}: ${token} must appear exactly once`);
      const index = source.indexOf(token);
      assert.ok(index > previousIndex, `${flagship.slug}: ${token} is out of canonical order`);
      previousIndex = index;
    }

    const timeline = `<div data-tr-project-timeline="${flagship.timeline}"></div>`;
    const evidence = `<div data-tr-project-evidence="${flagship.evidence}"></div>`;
    assert.equal(count(source, timeline), 1, `${flagship.slug}: timeline placeholder must appear exactly once`);
    assert.equal(count(source, evidence), 1, `${flagship.slug}: evidence placeholder must appear exactly once`);
    if (flagship.diagram) {
      assert.equal(count(source, flagship.diagram), 1, `${flagship.slug}: architecture diagram must remain exactly once`);
    }
  });
}

test('controlled flagship set stays intentionally small', () => {
  assert.deepEqual(FLAGSHIPS.map(({slug}) => slug), [
    'livingworld',
    'node-zero',
    'vlezet',
    'portfolio-platform',
  ]);
});
