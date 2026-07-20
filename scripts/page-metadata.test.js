import test from 'node:test';
import assert from 'node:assert/strict';

import {applyPageMetadataToHtml, buildPageMetadata} from './page-metadata.js';

const metadata = {
  title: 'LivingWorld — AI NPC Architecture',
  description: 'Server-authoritative AI NPC systems.',
  image: 'assets/images/og/livingworld.png',
  type: 'article',
};

test('buildPageMetadata creates absolute canonical and OG image URLs for nested routes', () => {
  const built = buildPageMetadata(
    'landing/projects/livingworld.html',
    metadata,
    'https://example.test/site/',
  );

  assert.equal(built.canonical, 'https://example.test/site/landing/projects/livingworld.html');
  assert.equal(built.image, 'https://example.test/site/assets/images/og/livingworld.png');
});

test('applyPageMetadataToHtml replaces generic tags without duplicating them', () => {
  const input = `<!doctype html><html><head>
    <title>Old</title>
    <meta name="description" content="Old description">
    <meta property="og:title" content="Old OG">
    <meta property="og:image" content="old.png">
    <link rel="canonical" href="https://old.test/old">
  </head><body><h1>Page</h1></body></html>`;

  const output = applyPageMetadataToHtml(
    input,
    'landing/projects/livingworld.html',
    metadata,
    'https://example.test/site/',
  );

  assert.equal((output.match(/<title>/g) || []).length, 1);
  assert.equal((output.match(/name="description"/g) || []).length, 1);
  assert.equal((output.match(/property="og:title"/g) || []).length, 1);
  assert.equal((output.match(/property="og:image"/g) || []).length, 1);
  assert.equal((output.match(/rel="canonical"/g) || []).length, 1);
  assert.match(output, /LivingWorld — AI NPC Architecture/);
  assert.match(output, /https:\/\/example\.test\/site\/assets\/images\/og\/livingworld\.png/);
  assert.match(output, /https:\/\/example\.test\/site\/landing\/projects\/livingworld\.html/);
  assert.match(output, /property="og:type" content="article"/);
});
