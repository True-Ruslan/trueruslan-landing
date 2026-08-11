import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(ROOT, 'scripts', 'production-p3-5b-english-now-smoke.cjs'), 'utf8');

test('C6 deployed English Now smoke searches stable current user-facing copy', () => {
  assert.match(source, /input\.fill\(['"]short snapshot['"]\)/);
  assert.doesNotMatch(source, /deliberately bounded snapshot of current engineering focus|current engineering focus/);
  assert.match(source, /en\/now\//, 'production search smoke must still require the canonical English Now route');
});
