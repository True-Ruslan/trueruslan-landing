import test from 'node:test';
import assert from 'node:assert/strict';

import {loadNowData, renderNowContent, validateNowData} from './now-page.js';

const nowData = {
  updated: '2026-07-22',
  focus: 'Current engineering focus.',
  learning: ['AI systems'],
  writing: ['Engineering Notes'],
};

const projects = [{
  slug: 'livingworld',
  name: 'VillAIgence',
  status: 'release-candidate',
  statusLabel: 'ACCEPTANCE IN PROGRESS',
  summary: 'Server-authoritative Minecraft AI society with bounded installed acceptance.',
  featured: true,
  active: true,
  visibility: 'public',
  href: 'landing/projects/livingworld.html',
  tags: ['Java 21', 'Memory 2.0'],
}];

test('validateNowData rejects invalid dates and empty lists', () => {
  assert.throws(() => validateNowData({...nowData, updated: '22-07-2026'}), /ISO date/);
  assert.throws(() => validateNowData({...nowData, learning: []}), /non-empty string array/);
});

test('renderNowContent preserves the stable route under the public VillAIgence identity', () => {
  const html = renderNowContent(nowData, projects);
  assert.match(html, /VillAIgence/);
  assert.doesNotMatch(html, /LivingWorld/);
  assert.match(html, /href="landing\/projects\/livingworld\.html"/);
  assert.match(html, /AI systems/);
  assert.match(html, /Engineering Notes/);
  assert.match(html, /datetime="2026-07-22"/);
});

test('repository now snapshot reflects current bounded external-project evidence', () => {
  const current = loadNowData();
  const editorialText = [current.focus, ...current.learning, ...current.writing].join('\n');

  assert.equal(current.updated, '2026-08-05');
  assert.match(editorialText, /Vlezet/);
  assert.match(editorialText, /M7\.8B/);
  assert.match(editorialText, /M7\.9/);
  assert.match(editorialText, /M7\.8C\.1/);
  assert.match(editorialText, /VillAIgence/);
  assert.match(editorialText, /0\.1\.25\+1\.21\.1/);
  assert.match(editorialText, /production-JAR/);
  assert.match(editorialText, /cumulative|совокупн/i);
  assert.match(editorialText, /pending|Draft/i);
  assert.match(editorialText, /Engineering Note/);
  assert.doesNotMatch(editorialText, /LivingWorld/);
});

test('renderNowContent escapes editorial copy', () => {
  const html = renderNowContent({...nowData, focus: '<script>alert(1)</script>'}, projects);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
