import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderCurrentlyBuilding,
  renderStandaloneHome,
  validateCurrentlyBuilding,
} from './standalone-home.js';

const validEntries = [
  {
    slug: 'livingworld',
    name: 'LivingWorld',
    status: 'RELEASE CANDIDATE',
    summary: 'Server-authoritative AI NPC conversations.',
    href: 'landing/projects/livingworld.html',
    tags: ['Java 21', 'Fabric'],
  },
];

test('renderStandaloneHome injects site URL and currently-building cards without Diplodoc runtime bundles', () => {
  const template = `<!doctype html><html><head>
    <link rel="canonical" href="{{SITE_URL}}/">
    <meta property="og:image" content="{{SITE_URL}}/assets/images/avatar.png">
    <link rel="stylesheet" href="_assets/style/home.css">
  </head><body><h1>Руслан Немыкин</h1><section>{{CURRENTLY_BUILDING}}</section></body></html>`;

  const html = renderStandaloneHome(template, 'https://example.test/', validEntries);

  assert.match(html, /https:\/\/example\.test\//);
  assert.match(html, /https:\/\/example\.test\/assets\/images\/avatar\.png/);
  assert.match(html, /LivingWorld/);
  assert.match(html, /landing\/projects\/livingworld\.html/);
  assert.doesNotMatch(html, /\{\{SITE_URL\}\}|\{\{CURRENTLY_BUILDING\}\}/);
  assert.doesNotMatch(html, /_bundle\//);
});

test('renderCurrentlyBuilding escapes manifest text', () => {
  const html = renderCurrentlyBuilding([{
    ...validEntries[0],
    name: '<Living & World>',
    tags: ['Java <21>', 'AI & voice'],
  }]);

  assert.match(html, /&lt;Living &amp; World&gt;/);
  assert.match(html, /Java &lt;21&gt;/);
  assert.doesNotMatch(html, /<Living/);
});

test('validateCurrentlyBuilding rejects duplicate slugs', () => {
  assert.throws(
    () => validateCurrentlyBuilding([...validEntries, {...validEntries[0]}]),
    /duplicate currently-building slug/,
  );
});

test('validateCurrentlyBuilding rejects missing fields and unsafe hrefs', () => {
  assert.throws(
    () => validateCurrentlyBuilding([{...validEntries[0], summary: ''}]),
    /missing required field: summary/,
  );
  assert.throws(
    () => validateCurrentlyBuilding([{...validEntries[0], href: '../secrets.html'}]),
    /unsafe currently-building href/,
  );
  assert.throws(
    () => validateCurrentlyBuilding([{...validEntries[0], href: 'https://example.test/project.html'}]),
    /unsafe currently-building href/,
  );
});

test('validateCurrentlyBuilding enforces 2–5 non-empty tags', () => {
  assert.throws(
    () => validateCurrentlyBuilding([{...validEntries[0], tags: ['Java']}]),
    /2–5 items/,
  );
  assert.throws(
    () => validateCurrentlyBuilding([{...validEntries[0], tags: ['a', 'b', 'c', 'd', 'e', 'f']}]),
    /2–5 items/,
  );
  assert.throws(
    () => validateCurrentlyBuilding([{...validEntries[0], tags: ['Java', '']}]),
    /non-empty strings/,
  );
});
