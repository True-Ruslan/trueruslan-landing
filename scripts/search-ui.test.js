import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, '..', 'docs', '_assets', 'script', 'search-ui.js'), 'utf8');

function loadApi() {
  const sandbox = {
    globalThis: null,
    setTimeout() {},
    addEventListener() {},
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, {filename: 'search-ui.js'});
  return sandbox.TrueRuslanSearchUI;
}

test('search-ui classic script exposes stable progressive API', () => {
  const api = loadApi();
  assert.equal(typeof api.isEditableTarget, 'function');
  assert.equal(typeof api.findSearchInput, 'function');
  assert.equal(typeof api.decorate, 'function');
  assert.equal(typeof api.init, 'function');
});

test('search keyboard shortcut contract excludes editable targets', () => {
  const {isEditableTarget} = loadApi();
  assert.equal(isEditableTarget({tagName: 'INPUT'}), true);
  assert.equal(isEditableTarget({tagName: 'textarea'}), true);
  assert.equal(isEditableTarget({tagName: 'SELECT'}), true);
  assert.equal(isEditableTarget({tagName: 'DIV', isContentEditable: true}), true);
  assert.equal(isEditableTarget({tagName: 'DIV', isContentEditable: false}), false);
  assert.equal(isEditableTarget(null), false);
});

test('search-ui remains a classic dependency-free script', () => {
  assert.doesNotMatch(source, /^\s*(?:import|export)\s/m);
  assert.match(source, /data-tr-search-enhanced/);
  assert.match(source, /event\.key === '\/'/);
  assert.match(source, /ctrlKey \|\| event\.metaKey/);
});
