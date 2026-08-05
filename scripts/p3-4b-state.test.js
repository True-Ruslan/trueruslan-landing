import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_STATE = path.join(ROOT, 'docs', 'PROJECT_STATE.md');
const ROADMAP = path.join(ROOT, 'docs', 'ROADMAP.md');
const CHANGELOG = path.join(ROOT, 'docs', 'CHANGELOG.md');
const PORTFOLIO_SPEC = path.join(
  ROOT,
  'docs',
  'keystone',
  'specs',
  '2026-08-05-portfolio-1-0-evidence-first.md',
);

function read(file) {
  assert.ok(fs.existsSync(file), `missing durable file: ${path.relative(ROOT, file)}`);
  return fs.readFileSync(file, 'utf8');
}

test('durable state preserves P3.4B production acceptance after later slices', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const spec = read(PORTFOLIO_SPEC);
  const combined = `${state}\n${roadmap}\n${changelog}\n${spec}`;

  for (const marker of [
    'P3.4B — Clean URLs without Cloudflare routing',
    'PR #128',
    '4d14dd6842423a17f12d8cb2734df36cdb162b41',
    'dd1911ebbc5faf66a56144c75dd45215b4042293',
    '4ebaaa0b4ea2b3ceb602a70c100a6ec58bf738cb',
    '#945 / 31021101326',
    '8936766318',
    'sha256:38d1a612b9e684a2faccf71f889217933b115434391a5e60a5baff49b746178d',
    'Pages deployment ID:            5764711503',
    '#123 / 31021657939',
    '8936914548',
    'sha256:cc250f9ea49d4214c5b815ebb9ee067f540e54124e0edbbef46391ccc2b4fa51',
    '/landing/notes/clean-urls-without-cloudflare-routing/',
    'repository-native directory URLs',
    'legacy `.html`',
    'query and fragment',
    'P3.4C — Hybrid CV + AI recognition boundaries',
  ]) {
    assert.ok(combined.includes(marker), `missing P3.4B closure marker: ${marker}`);
  }

  assert.ok(spec.includes('### P3.4B — Clean URLs without Cloudflare routing — DONE'));
  assert.ok(spec.includes('### P3.4C — Hybrid CV + AI recognition boundaries — DONE'));
  assert.ok(state.includes('issue #111'), 'P3.4B closure must preserve search-engine observation');
  assert.ok(state.includes('issue #82'), 'P3.4B closure must preserve dependency blocker');
  assert.ok(state.includes('issue #78'), 'P3.4B closure must preserve Content Freshness owner state');
});
