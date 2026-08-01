import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonical = 'https://trueruslan.ru/';
const legacy = 'https://true-ruslan.github.io/trueruslan-landing/';

test('repository README exposes the canonical production site once', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const canonicalCount = readme.split(canonical).length - 1;
  assert.equal(canonicalCount, 1, `expected one canonical README link, found ${canonicalCount}`);
});

test('CV contains the canonical website URI and no public legacy URI', () => {
  const pdf = fs.readFileSync(path.join(root, 'docs/assets/documents/cv.pdf')).toString('latin1');
  assert.match(pdf, /https:\/\/trueruslan\.ru\//, 'canonical website URI is missing from the CV');
  assert.doesNotMatch(
    pdf,
    /https:\/\/true-ruslan\.github\.io\/trueruslan-landing\//,
    'legacy public website URI remains in the CV',
  );
});
