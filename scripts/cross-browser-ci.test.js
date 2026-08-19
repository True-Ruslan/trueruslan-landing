import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflow = fs.readFileSync(
  new URL('../.github/workflows/build.yml', import.meta.url),
  'utf8',
);

const PLAYWRIGHT_IMAGE = 'mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48';

test('cross-browser compatibility runs in a pinned Playwright container and gates build-docs', () => {
  assert.doesNotMatch(
    workflow,
    /playwright\/cli\.js install --with-deps firefox webkit/,
    'PR CI must not depend on a live apt-based Playwright browser install',
  );

  assert.match(
    workflow,
    /cross-browser:\n[\s\S]*?container:\n\s+image: mcr\.microsoft\.com\/playwright:v1\.61\.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48/,
  );
  assert.match(workflow, /cross-browser:\n[\s\S]*?options: --user 1001/);
  assert.match(workflow, /cross-browser:\n[\s\S]*?node-version: '24'/);
  assert.match(workflow, /cross-browser:\n[\s\S]*?playwright@1\.61\.1/);
  assert.match(workflow, /cross-browser:\n[\s\S]*?node scripts\/cross-browser-smoke\.cjs/);

  assert.match(
    workflow,
    /build-docs:\n\s+needs: cross-browser/,
    'the existing required build-docs check must not succeed unless cross-browser succeeds',
  );

  assert.ok(workflow.includes(PLAYWRIGHT_IMAGE));
});
