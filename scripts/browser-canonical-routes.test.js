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

const LEGACY_CANONICAL_PATTERNS = Object.freeze([
  /(?:pathname|route|path):\s*['"`]\/landing\//,
  /routeFragment:\s*['"`]landing\//,
  /page\.goto\([^\n]*\/landing\//,
  /endsWith\(['"`]\/landing\//,
  /startsWith\(['"`]landing\//,
]);

test('content browser smokes never treat the legacy /landing namespace as canonical', () => {
  for (const file of CANONICAL_ONLY_SMOKES) {
    const source = read(file);
    for (const pattern of LEGACY_CANONICAL_PATTERNS) {
      assert.doesNotMatch(source, pattern, `${file} leaks a legacy /landing browser route expectation`);
    }
  }
});

test('Photo Stories explicitly separates canonical /photos from legacy /landing/photos compatibility', () => {
  const source = read('photo-stories-browser-smoke.cjs');
  assert.match(source, /const CANONICAL_ROUTE = ['"]\/photos\/['"]/);
  assert.match(source, /const LEGACY_ROUTE = ['"]\/landing\/photos\/['"]/);
  assert.match(source, /page\.goto\(`\$\{baseUrl\}\$\{LEGACY_ROUTE\}`/);
  assert.match(source, /waitForURL\(new RegExp\(`\$\{CANONICAL_ROUTE/);
});

test('v0.3 related-material acceptance selects a visible link before choosing the first match', () => {
  const source = read('v03-browser-smoke.cjs');
  assert.match(source, /locator\(`a\[href\*=\"\$\{fragment\}\"\]:visible`\)\.first\(\)\.waitFor\(\{state: 'visible'\}\)/);
  assert.doesNotMatch(source, /locator\(`a\[href\*=\"\$\{fragment\}\"\]`\)\.first\(\)\.waitFor/);
});
