import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, 'production-p3-5b-english-now-smoke.cjs'), 'utf8');

test('P3.5B production smoke resolves project hrefs through document.baseURI before exact route comparison', () => {
  assert.match(source, /new URL\([^\n]*document\.baseURI\)\.href/);
  assert.match(source, /NOTCHHUB_EN_URL/);
  assert.match(source, /VILLAIGENCE_EN_URL/);
  assert.match(source, /normalizeUrl\([^\n]*NOTCHHUB_EN_URL/);
  assert.match(source, /normalizeUrl\([^\n]*VILLAIGENCE_EN_URL/);
  assert.doesNotMatch(source, /getAttribute\('href'\)\)\);\s*assert\(links\.some\(\(href\) => href\?\.includes\('\/en\/projects\//s);
});

test('P3.5B production smoke verifies current Now content from the canonical registry instead of historical literals', () => {
  assert.match(source, /data\/now\.json/);
  assert.match(source, /text\.includes\(NOW\.en\.focus\)/);
  assert.doesNotMatch(source, /0\.1\.25\+1\.21\.1/);
  assert.doesNotMatch(source, /M7\.8B/);
});

test('P3.5B production smoke preserves rendered, no-JS, localized-route and search acceptance', () => {
  for (const marker of [
    'Current work',
    "What I'm learning",
    "What I'm writing",
    'VillAIgence',
    'NotchHub',
    '0.1.0',
    'Draft PR #10',
    'verifyNoJavaScript',
    'NOTCHHUB_EN_URL',
    'VILLAIGENCE_EN_URL',
    'generated search does not expose English Now route',
    'data-tr-now-noscript',
  ]) {
    assert.ok(source.includes(marker), `missing P3.5B verifier marker: ${marker}`);
  }
});
