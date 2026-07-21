import test from 'node:test';
import assert from 'node:assert/strict';

import {renderNowContent, validateNowData} from './now-page.js';

const nowData = {
  updated: '2026-07-22',
  focus: 'Current engineering focus.',
  learning: ['AI systems'],
  writing: ['Engineering Notes'],
};

const projects = [{
  slug: 'livingworld',
  name: 'LivingWorld',
  status: 'release-candidate',
  statusLabel: 'RELEASE CANDIDATE',
  summary: 'Server-authoritative AI NPC conversations.',
  featured: true,
  active: true,
  visibility: 'public',
  href: 'landing/projects/livingworld.html',
  tags: ['Java 21', 'Fabric'],
}];

test('validateNowData rejects invalid dates and empty lists', () => {
  assert.throws(() => validateNowData({...nowData, updated: '22-07-2026'}), /ISO date/);
  assert.throws(() => validateNowData({...nowData, learning: []}), /non-empty string array/);
});

test('renderNowContent derives active project cards and safe relative links', () => {
  const html = renderNowContent(nowData, projects);
  assert.match(html, /LivingWorld/);
  assert.match(html, /href="projects\/livingworld\.html"/);
  assert.doesNotMatch(html, /landing\/projects\/livingworld\.html/);
  assert.match(html, /AI systems/);
  assert.match(html, /Engineering Notes/);
  assert.match(html, /datetime="2026-07-22"/);
});

test('renderNowContent escapes editorial copy', () => {
  const html = renderNowContent({...nowData, focus: '<script>alert(1)</script>'}, projects);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
