import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const REQUIRED_BRIDGES = [
  '{{HOME_EXPERIENCE_BRIDGE}}',
  '{{HOME_WRITING_BRIDGE}}',
  '{{HOME_COLLABORATION_BRIDGE}}',
  '{{HOME_PERSONAL_BRIDGE}}',
];

test('homepage keeps the four approved bridge surfaces and their existing content ownership', () => {
  const template = read('templates/index.html');
  for (const marker of REQUIRED_BRIDGES) {
    assert.match(template, new RegExp(marker.replace(/[{}]/g, '\\$&')));
  }
  assert.match(template, /class="tr-home-shell"/);
  assert.match(template, /class="tr-home-section" aria-labelledby="flagships-title"/);
});

test('homepage layout polish is owned by the existing refinement stylesheet', () => {
  const template = read('templates/index.html');
  assert.match(template, /href="_assets\/style\/home-refinement\.css"/);
  const css = read('docs/_assets/style/home-refinement.css');
  assert.match(css, /\.tr-home-bridge\s*\{/);
  assert.match(css, /\.tr-home-bridge__actions\s*\{/);
});

test('Build owns a dedicated homepage layout browser acceptance gate and preserves its evidence', () => {
  const smokePath = path.join(ROOT, 'scripts', 'homepage-layout-polish-browser-smoke.cjs');
  assert.equal(fs.existsSync(smokePath), true, 'homepage layout browser smoke must exist');

  const workflow = read('.github/workflows/build.yml');
  assert.match(workflow, /- name: Homepage layout polish browser smoke/);
  assert.match(workflow, /node scripts\/homepage-layout-polish-browser-smoke\.cjs/);
  assert.match(workflow, /cp homepage-layout-polish-browser-smoke\.log quality-artifacts\/homepage-layout-polish-browser-smoke\.log/);
  assert.match(workflow, /cp artifacts\/homepage-layout-polish-summary\.json quality-artifacts\/homepage-layout-polish-summary\.json/);
  assert.match(workflow, /cp artifacts\/homepage-layout-polish-desktop\.png quality-artifacts\/homepage-layout-polish-desktop\.png/);
  assert.match(workflow, /cp artifacts\/homepage-layout-polish-mobile\.png quality-artifacts\/homepage-layout-polish-mobile\.png/);
});
