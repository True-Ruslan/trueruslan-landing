import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));

const REQUIRED_KEYWORDS = [
  'engineering-portfolio',
  'knowledge-platform',
  'backend-engineering',
  'software-architecture',
  'engineering-notes',
  'diplodoc',
  'personal-site',
];

test('package metadata reflects the engineering portfolio and knowledge platform identity', () => {
  assert.equal(pkg.name, '@true-ruslan/trueruslan-landing');
  assert.equal(pkg.private, true);
  assert.match(pkg.description, /engineering portfolio/i);
  assert.match(pkg.description, /knowledge platform/i);
  assert.doesNotMatch(pkg.description, /многостраничный лендинг/i);

  for (const keyword of REQUIRED_KEYWORDS) {
    assert.ok(pkg.keywords.includes(keyword), `missing package keyword: ${keyword}`);
  }
  assert.equal(pkg.keywords.includes('landing'), false);

  assert.equal(pkg.repository.url, 'https://github.com/True-Ruslan/trueruslan-landing.git');
  assert.equal(pkg.bugs.url, 'https://github.com/True-Ruslan/trueruslan-landing/issues');
  assert.equal(pkg.homepage, 'https://true-ruslan.github.io/trueruslan-landing/');
});

test('package version remains deliberately stable and lockfile root metadata matches', () => {
  assert.equal(pkg.version, '0.2.0');
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].name, pkg.name);
  assert.equal(lock.packages[''].version, pkg.version);
});
