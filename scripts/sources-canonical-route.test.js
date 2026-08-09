import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

test('dedicated Sources browser smoke exercises the canonical RU route, not a legacy alias', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'sources-knowledge-base-smoke.cjs'), 'utf8');
  const route = source.match(/const ROUTE = ['"]([^'"]+)['"]/);
  assert.ok(route, 'Sources Knowledge Base route constant is missing');
  assert.equal(route[1], '/bibliography/');
  assert.doesNotMatch(route[1], /\/landing\//);
});
