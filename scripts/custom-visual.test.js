import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = fs.readFileSync(path.join(__dirname, '..', 'docs', '_assets', 'script', 'custom.js'), 'utf8');
const sandbox = {URL, setTimeout, clearTimeout};
sandbox.globalThis = sandbox;
vm.runInNewContext(script, sandbox, {filename: 'custom.js'});
const visual = sandbox.TrueRuslanVisual;

test('reveal observer does not require a visible percentage of very tall content', () => {
  const options = visual.getRevealObserverOptions();

  assert.equal(options.threshold, 0);
  assert.equal(options.rootMargin, '0px 0px -7% 0px');
});
