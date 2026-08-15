import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, ...relativePath.split('/')), 'utf8');
}

test('provider-free check:ai command accepts canonical OFF mode without committed index', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['check:ai'], 'node scripts/ai-index-verify.js --allow-off');
  const result = spawnSync(process.execPath, ['scripts/ai-index-verify.js', '--allow-off'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {...process.env, OPENROUTER_API_KEY: ''},
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'off');
  assert.equal(report.indexRequired, false);
  assert.equal(report.providerAccess, false);
});

test('Build wires offline verification and browser smoke immediately after generated search without secrets', () => {
  const workflow = read('.github/workflows/build.yml');
  const generated = workflow.indexOf('- name: Generated search browser smoke');
  const verify = workflow.indexOf('- name: AI Navigator offline verification');
  const smoke = workflow.indexOf('- name: AI Navigator browser smoke');
  const villa = workflow.indexOf('- name: VillAIgence generated search smoke');
  assert.ok(generated >= 0 && verify > generated && smoke > verify && villa > smoke, 'AI gates must follow generated search and precede VillAIgence search');
  assert.match(workflow, /npm run check:ai 2>&1 \| tee ai-navigator-verify\.log/);
  assert.match(workflow, /node scripts\/ai-navigator-browser-smoke\.cjs 2>&1 \| tee ai-navigator-browser-smoke\.log/);
  assert.equal(/OPENROUTER_API_KEY\s*:/.test(workflow), false);
  for (const file of [
    'ai-navigator-verify.log',
    'ai-navigator-browser-smoke.log',
    'ai-navigator-summary.json',
    'ai-navigator-search-mobile.png',
    'ai-navigator-full-desktop.png',
  ]) assert.ok(workflow.includes(file), `quality preservation missing ${file}`);
});

test('browser smoke is explicitly fake-provider, three-mode and storage-free', () => {
  const source = read('scripts/ai-navigator-browser-smoke.cjs');
  for (const token of ['off', 'search', 'full']) assert.ok(source.includes(token), `missing ${token} fixture mode`);
  assert.match(source, /ai-navigator-summary\.json/);
  assert.match(source, /ai-navigator-search-mobile\.png/);
  assert.match(source, /ai-navigator-full-desktop\.png/);
  assert.match(source, /openrouter\.ai/);
  assert.match(source, /localStorage/);
  assert.match(source, /sessionStorage/);
  assert.match(source, /402/);
  assert.match(source, /429/);
  assert.match(source, /503/);
  assert.match(source, /sufficientEvidence/);
  assert.equal(/OPENROUTER_API_KEY/.test(source), false);
});
