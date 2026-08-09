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

  assert.doesNotMatch(smoke, /missing target=_blank:\s*\$\{href\}/);
  assert.doesNotMatch(smoke, /missing noopener\/noreferrer:\s*\$\{href\}/);
});
