import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

test('dedicated Publications browser smoke exercises canonical RU and EN routes, not legacy aliases', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'publications-browser-smoke.cjs'), 'utf8');
  const localeBlock = source.match(/const LOCALES = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
  assert.ok(localeBlock, 'Publications locale route table is missing');
  assert.match(localeBlock[1], /ru:[\s\S]*?route:\s*['"]\/publications\/['"]/);
  assert.match(localeBlock[1], /en:[\s\S]*?route:\s*['"]\/en\/publications\/['"]/);
  assert.doesNotMatch(localeBlock[1], /\/landing\/publications\//);
});
