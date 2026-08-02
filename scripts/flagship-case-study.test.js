import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_DIR = path.join(ROOT, 'docs', 'landing', 'projects');

const FLAGSHIPS = Object.freeze([
  {
    slug: 'livingworld',
    file: 'livingworld.md',
    timeline: 'livingworld',
    evidence: 'livingworld',
    diagram: '../../assets/diagrams/livingworld-architecture.svg',
  },
  {
    slug: 'node-zero',
    file: 'node-zero.md',
    timeline: 'node-zero',
    evidence: 'node-zero',
    diagram: '../../assets/diagrams/node-zero-architecture.svg',
  },
  {
    slug: 'vlezet',
    file: 'vlezet.md',
    timeline: 'vlezet',
    evidence: 'vlezet',
    diagram: '../../assets/diagrams/vlezet-recognition-authority.svg',
  },
]);

const SECTION_MARKERS = Object.freeze([
  'problem',
  'constraints',
  'decisions',
  'failures',
  'current-state',
  'evidence',
  'retrospective',
]);

function count(text, token) {
  return text.split(token).length - 1;
}

for (const flagship of FLAGSHIPS) {
  test(`${flagship.slug} follows the flagship case-study narrative contract`, () => {
    const source = fs.readFileSync(path.join(PROJECT_DIR, flagship.file), 'utf8');

    let previousIndex = -1;
    for (const marker of SECTION_MARKERS) {
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
    assert.equal(count(source, flagship.diagram), 1, `${flagship.slug}: architecture diagram must remain exactly once`);
  });
}

test('controlled flagship set stays intentionally small', () => {
  assert.deepEqual(FLAGSHIPS.map(({slug}) => slug), ['livingworld', 'node-zero', 'vlezet']);
});
