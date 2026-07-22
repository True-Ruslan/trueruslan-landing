import test from 'node:test';
import assert from 'node:assert/strict';

import {deriveProductionEndpoints} from './production-smoke.js';

test('deriveProductionEndpoints supports Pages subpath with or without trailing slash', () => {
  const expected = [
    'https://true-ruslan.github.io/trueruslan-landing/',
    'https://true-ruslan.github.io/trueruslan-landing/landing/projects.html',
    'https://true-ruslan.github.io/trueruslan-landing/landing/now.html',
    'https://true-ruslan.github.io/trueruslan-landing/landing/engineering-map.html',
    'https://true-ruslan.github.io/trueruslan-landing/landing/notes.html',
    'https://true-ruslan.github.io/trueruslan-landing/photos/',
    'https://true-ruslan.github.io/trueruslan-landing/feed.xml',
    'https://true-ruslan.github.io/trueruslan-landing/landing/resume.html',
    'https://true-ruslan.github.io/trueruslan-landing/assets/documents/cv.pdf',
    'https://true-ruslan.github.io/trueruslan-landing/assets/og/home.png',
    'https://true-ruslan.github.io/trueruslan-landing/assets/og/engineering-map.png',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/style/custom.css',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/style/command-palette.css',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/style/photo-stories.css',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/script/custom.js',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/script/command-palette.js',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/script/photo-stories.js',
    'https://true-ruslan.github.io/trueruslan-landing/assets/images/favicon.svg',
  ];

  assert.deepEqual(
    deriveProductionEndpoints('https://true-ruslan.github.io/trueruslan-landing').map((entry) => entry.url),
    expected,
  );
  assert.deepEqual(
    deriveProductionEndpoints('https://true-ruslan.github.io/trueruslan-landing/').map((entry) => entry.url),
    expected,
  );
});

test('deriveProductionEndpoints marks binary assets with expected content types', () => {
  const endpoints = deriveProductionEndpoints('https://example.test/site/');
  const pdf = endpoints.find((entry) => entry.name === 'Resume PDF');
  const homepageOg = endpoints.find((entry) => entry.name === 'Homepage OpenGraph card');
  const mapOg = endpoints.find((entry) => entry.name === 'Engineering Map OpenGraph card');

  assert.equal(pdf.expectedContentType, 'application/pdf');
  assert.equal(homepageOg.expectedContentType, 'image/png');
  assert.equal(mapOg.expectedContentType, 'image/png');
});

test('deriveProductionEndpoints monitors now, feed, command palette and photo stories resources', () => {
  const endpoints = deriveProductionEndpoints('https://example.test/site/');
  assert.ok(endpoints.some((entry) => entry.name === 'Now'));
  assert.ok(endpoints.some((entry) => entry.name === 'Atom feed'));
  assert.ok(endpoints.some((entry) => entry.name === 'Photo Stories'));
  assert.ok(endpoints.some((entry) => entry.name === 'Command palette stylesheet'));
  assert.ok(endpoints.some((entry) => entry.name === 'Command palette script'));
  assert.ok(endpoints.some((entry) => entry.name === 'Photo Stories stylesheet'));
  assert.ok(endpoints.some((entry) => entry.name === 'Photo Stories script'));
});
