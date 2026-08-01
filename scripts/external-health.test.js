import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {deriveProductionEntries} from './external-health.js';

const root = path.resolve(import.meta.dirname, '..');

test('production health endpoints preserve a legacy Pages subpath', () => {
  assert.deepEqual(deriveProductionEntries('https://true-ruslan.github.io/trueruslan-landing/'), [
    {
      name: 'Production homepage',
      category: 'production',
      url: 'https://true-ruslan.github.io/trueruslan-landing/',
    },
    {
      name: 'Production projects',
      category: 'production',
      url: 'https://true-ruslan.github.io/trueruslan-landing/landing/projects.html',
    },
    {
      name: 'Production resume',
      category: 'production',
      url: 'https://true-ruslan.github.io/trueruslan-landing/landing/resume.html',
    },
    {
      name: 'Production resume PDF',
      category: 'production',
      url: 'https://true-ruslan.github.io/trueruslan-landing/assets/documents/cv.pdf',
      expectedContentType: 'application/pdf',
    },
  ]);
});

test('production health endpoints use the custom domain root without a repository prefix', () => {
  assert.deepEqual(
    deriveProductionEntries('https://trueruslan.ru').map((entry) => entry.url),
    [
      'https://trueruslan.ru/',
      'https://trueruslan.ru/landing/projects.html',
      'https://trueruslan.ru/landing/resume.html',
      'https://trueruslan.ru/assets/documents/cv.pdf',
    ],
  );
});

test('external link manifest contains only non-production external identities', () => {
  const entries = JSON.parse(fs.readFileSync(path.join(root, 'data', 'external-links.json'), 'utf8'));
  assert.ok(entries.length > 0);
  assert.ok(entries.every((entry) => entry.category !== 'production'));
  assert.ok(entries.every((entry) => !entry.name.startsWith('Production ')));
});
