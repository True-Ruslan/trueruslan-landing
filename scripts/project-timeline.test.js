import test from 'node:test';
import assert from 'node:assert/strict';

import {renderTimeline, validateTimeline} from './project-timeline.js';

const entries = [
  {
    date: '2026-07',
    title: 'Foundation',
    description: 'Built the first verified foundation.',
    state: 'past',
  },
  {
    date: '2026-07',
    title: 'Current milestone',
    description: 'Current work is intentionally explicit.',
    version: '0.1.2',
    state: 'current',
    evidence: 'https://github.com/True-Ruslan/example',
  },
  {
    date: 'NEXT',
    title: 'Next milestone',
    description: 'A future milestone, not a completed claim.',
    state: 'next',
  },
];

test('validateTimeline accepts past/current/next milestones', () => {
  assert.equal(validateTimeline('livingworld', entries).length, 3);
});

test('validateTimeline rejects multiple current entries', () => {
  assert.throws(
    () => validateTimeline('livingworld', [...entries, {...entries[1], title: 'Another current'}]),
    /more than one current entry/,
  );
});

test('validateTimeline rejects unsafe evidence links', () => {
  assert.throws(
    () => validateTimeline('livingworld', [{...entries[0], evidence: 'javascript:alert(1)'}]),
    /unsafe timeline evidence link/,
  );
});

test('renderTimeline produces semantic ordered timeline and escapes text', () => {
  const html = renderTimeline('livingworld', [{...entries[1], title: '<Current & safe>'}]);
  assert.match(html, /<section class="tr-project-timeline"/);
  assert.match(html, /<ol class="tr-project-timeline__list">/);
  assert.match(html, /tr-project-timeline__item--current/);
  assert.match(html, /0\.1\.2/);
  assert.match(html, /&lt;Current &amp; safe&gt;/);
  assert.doesNotMatch(html, /<Current/);
});
