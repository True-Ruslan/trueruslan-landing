import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(ROOT, 'scripts', 'browser-quality.cjs'), 'utf8');

test('browser quality waits for the intentionally deferred custom visual initialization', () => {
  assert.match(source, /page\.waitForFunction\([\s\S]*?tr-visual-ready[\s\S]*?timeout:\s*2500/);
  assert.doesNotMatch(
    source,
    /const visualReady = await page\.evaluate\(\(\) => document\.documentElement\.classList\.contains\('tr-visual-ready'\)\)/,
  );
  assert.match(source, /Custom visual layer did not initialize/);
});
