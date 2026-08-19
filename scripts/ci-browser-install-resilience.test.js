import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflow = fs.readFileSync(
  new URL('../.github/workflows/build.yml', import.meta.url),
  'utf8',
);

test('cross-browser installation is bounded and retries once without weakening the gate', () => {
  assert.match(workflow, /- name: Install Firefox and WebKit for compatibility smoke \(attempt 1\)/);
  assert.match(workflow, /id: install-cross-browser-attempt-1/);
  assert.match(workflow, /timeout-minutes: 8/);
  assert.match(workflow, /continue-on-error: true/);

  assert.match(workflow, /- name: Install Firefox and WebKit for compatibility smoke \(attempt 2\)/);
  assert.match(workflow, /if: steps\.install-cross-browser-attempt-1\.outcome != 'success'/);

  const installCommands = workflow.match(/node \.quality-tools\/node_modules\/playwright\/cli\.js install --with-deps firefox webkit/g) || [];
  assert.equal(installCommands.length, 2, 'both bounded attempts must execute the same pinned Playwright install');
});
