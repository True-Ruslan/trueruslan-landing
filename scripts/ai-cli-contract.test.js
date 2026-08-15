import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

test('package exposes explicit AI maintenance commands without coupling them to normal build or test', () => {
  assert.equal(pkg.scripts['ai:corpus'], 'node scripts/ai-corpus.js --write data/ai-index/chunks.json');
  assert.equal(pkg.scripts['ai:index'], 'node scripts/ai-index.js');
  assert.equal(pkg.scripts['ai:verify'], 'node scripts/ai-index-verify.js');

  for (const scriptName of ['start', 'build', 'build:docs', 'build:docs:fast', 'copy-assets', 'test']) {
    const command = pkg.scripts[scriptName] || '';
    assert.doesNotMatch(command, /ai:index|OPENROUTER_API_KEY|openrouter/i, `${scriptName} must stay provider-independent`);
  }
});

test('ai-corpus --write emits deterministic JSON to an explicit path without provider access', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-corpus-cli-'));
  const output = path.join('out', 'chunks.json');
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'ai-corpus.js'), '--write', output], {
    cwd,
    encoding: 'utf8',
    env: {...process.env, OPENROUTER_API_KEY: ''},
  });
  assert.equal(result.status, 0, result.stderr);
  const absoluteOutput = path.join(cwd, output);
  assert.equal(fs.existsSync(absoluteOutput), true);
  const chunks = JSON.parse(fs.readFileSync(absoluteOutput, 'utf8'));
  assert.ok(chunks.length > 20);
  assert.ok(chunks.every(({id, contentHash}) => typeof id === 'string' && /^sha256:[a-f0-9]{64}$/.test(contentHash)));
  assert.match(result.stdout, /AI corpus written:/);
});
