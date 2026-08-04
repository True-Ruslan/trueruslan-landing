import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'production-live.yml');
const SMOKE = path.join(ROOT, 'scripts', 'production-favicon-smoke.cjs');

test('production workflow runs the favicon contract only after a deployable event', () => {
  const workflow = fs.readFileSync(WORKFLOW, 'utf8');

  assert.ok(workflow.includes('scripts/production-favicon-smoke.cjs'));
  assert.match(workflow, /name:\s*Run deployed favicon smoke/);
  assert.match(workflow, /if:\s*github\.event_name != 'pull_request'/);
  assert.match(workflow, /run:\s*node scripts\/production-favicon-smoke\.cjs/);
});

test('production favicon smoke checks the root SVG and rendered root-absolute links', () => {
  assert.ok(fs.existsSync(SMOKE), 'missing production favicon smoke');
  const source = fs.readFileSync(SMOKE, 'utf8');

  for (const marker of [
    'https://trueruslan.ru/',
    'favicon.svg',
    'landing/resume.html',
    'link[rel="icon"]',
    'image/svg+xml',
    'production-artifacts',
  ]) {
    assert.ok(source.includes(marker), `missing production favicon marker: ${marker}`);
  }

  assert.match(source, /response\.ok\(\)/);
  assert.match(source, /normalizeUrl/);
  assert.match(source, /writeFileSync/);
});
