import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMOKE = path.join(ROOT, 'scripts', 'production-live-smoke.cjs');

function source() {
  return fs.readFileSync(SMOKE, 'utf8');
}

test('production live link verifier delegates navigation classification to the shipped runtime policy', () => {
  const smoke = source();

  assert.match(smoke, /window\.TrueRuslanLinkPolicy\?\.shouldOpenInNewContext/);
  assert.match(smoke, /link policy runtime is unavailable/);
  assert.match(smoke, /external link missing target=_blank/);
  assert.match(smoke, /external link missing noopener\/noreferrer/);
  assert.match(smoke, /current-context link unexpectedly declares target/);
});

test('production live link verifier no longer requires new-tab attributes from every navigational link', () => {
  const smoke = source();

  assert.doesNotMatch(smoke, /violations\.push\(`missing target=_blank: \$\{href\}`\)/);
  assert.doesNotMatch(smoke, /violations\.push\(`missing noopener\/noreferrer: \$\{href\}`\)/);
});

test('production generated-search acceptance verifies actual current-tab navigation', () => {
  const smoke = source();

  assert.doesNotMatch(smoke, /search result does not open in a new tab/);
  assert.doesNotMatch(smoke, /search result lacks noopener\/noreferrer/);
  assert.match(smoke, /search result opened a new tab/);
  assert.match(smoke, /search result did not navigate the current tab/);
  assert.match(smoke, /page\.once\(['"]popup['"]/);
  assert.match(smoke, /result\.click\(\)/);
});
