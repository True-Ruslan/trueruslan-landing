import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, 'production-p3-5b-english-now-smoke.cjs'), 'utf8');

test('P3.5B production smoke resolves project hrefs through document.baseURI before exact route comparison', () => {
  assert.match(source, /new URL\([^\n]*document\.baseURI\)\.href/);
  assert.match(source, /VLEZET_EN_URL/);
  assert.match(source, /VILLAIGENCE_EN_URL/);
  assert.match(source, /normalizeUrl\([^\n]*VLEZET_EN_URL/);
  assert.match(source, /normalizeUrl\([^\n]*VILLAIGENCE_EN_URL/);
  assert.doesNotMatch(source, /getAttribute\('href'\)\)\);\s*assert\(links\.some\(\(href\) => href\?\.includes\('\/en\/projects\//s);
});
