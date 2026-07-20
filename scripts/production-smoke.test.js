import test from 'node:test';
import assert from 'node:assert/strict';

import {deriveProductionEndpoints} from './production-smoke.js';

test('deriveProductionEndpoints supports Pages subpath with or without trailing slash', () => {
  const expected = [
    'https://true-ruslan.github.io/trueruslan-landing/',
    'https://true-ruslan.github.io/trueruslan-landing/landing/projects.html',
    'https://true-ruslan.github.io/trueruslan-landing/landing/notes.html',
    'https://true-ruslan.github.io/trueruslan-landing/landing/resume.html',
    'https://true-ruslan.github.io/trueruslan-landing/assets/documents/cv.pdf',
    'https://true-ruslan.github.io/trueruslan-landing/assets/og/home.png',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/style/custom.css',
    'https://true-ruslan.github.io/trueruslan-landing/_assets/script/custom.js',
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
  const og = endpoints.find((entry) => entry.name === 'Homepage OpenGraph card');

  assert.equal(pdf.expectedContentType, 'application/pdf');
  assert.equal(og.expectedContentType, 'image/png');
});
