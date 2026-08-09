import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, 'scripts', file), 'utf8');

const CANONICAL_ONLY_SMOKES = Object.freeze([
  'v03-browser-smoke.cjs',
  'project-evidence-smoke.cjs',
  'villaigence-diagram-smoke.cjs',
  'node-zero-diagram-smoke.cjs',
  'publications-browser-smoke.cjs',
  'sources-knowledge-base-smoke.cjs',
  'i18n-browser-smoke.cjs',
  'analytics-browser-smoke.cjs',
  'metadata-smoke.cjs',
  'engineering-graph-smoke.cjs',
  'villaigence-search-smoke.cjs',
  'work-with-me-browser-smoke.cjs',
  'search-smoke.cjs',
]);

test('content browser smokes never treat the legacy /landing namespace as canonical', () => {
  for (const file of CANONICAL_ONLY_SMOKES) {
    assert.doesNotMatch(read(file), /(?:['"`]|includes\(['"]|endsWith\(['"])[^\n]*\/landing\//, `${file} leaks a legacy /landing browser route expectation`);
  }
});

test('Photo Stories explicitly separates canonical /photos from legacy /landing/photos compatibility', () => {
  const source = read('photo-stories-browser-smoke.cjs');
  assert.match(source, /const CANONICAL_ROUTE = ['"]\/photos\/['"]/);
  assert.match(source, /const LEGACY_ROUTE = ['"]\/landing\/photos\/['"]/);
  assert.match(source, /page\.goto\(`\$\{baseUrl\}\$\{LEGACY_ROUTE\}`/);
  assert.match(source, /waitForURL\(new RegExp\(`\$\{CANONICAL_ROUTE/);
});
