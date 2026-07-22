import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.join(__dirname, '..', 'docs', '_assets', 'script', 'photo-stories.js');
const script = fs.readFileSync(scriptPath, 'utf8');
const sandbox = {URL, URLSearchParams, setTimeout, clearTimeout};
sandbox.globalThis = sandbox;
vm.runInNewContext(script, sandbox, {filename: 'photo-stories.js'});
const ui = sandbox.TrueRuslanPhotoStories;

test('photo stories browser script exposes deterministic dependency-free helpers', () => {
  assert.ok(ui);
  assert.equal(typeof ui.init, 'function');
  assert.equal(ui.parsePhotoHash('#photo-5'), 'photo-5');
  assert.equal(ui.parsePhotoHash('#archive-semihatov'), 'archive-semihatov');
  assert.equal(ui.parsePhotoHash('#other'), null);
  assert.equal(ui.parsePhotoHash(''), null);
  assert.equal(ui.buildPhotoHash('photo-5'), '#photo-5');
  assert.equal(ui.buildPhotoHash('archive-semihatov'), '#archive-semihatov');
});

test('nextPhotoIndex wraps in both directions', () => {
  assert.equal(ui.nextPhotoIndex(0, 1, 3), 1);
  assert.equal(ui.nextPhotoIndex(2, 1, 3), 0);
  assert.equal(ui.nextPhotoIndex(0, -1, 3), 2);
  assert.equal(ui.nextPhotoIndex(1, -1, 3), 0);
  assert.equal(ui.nextPhotoIndex(0, 1, 0), -1);
});

test('isEditableTarget protects keyboard shortcuts inside editable controls', () => {
  assert.equal(ui.isEditableTarget({tagName: 'INPUT'}), true);
  assert.equal(ui.isEditableTarget({tagName: 'TEXTAREA'}), true);
  assert.equal(ui.isEditableTarget({tagName: 'SELECT'}), true);
  assert.equal(ui.isEditableTarget({tagName: 'DIV', isContentEditable: true}), true);
  assert.equal(ui.isEditableTarget({tagName: 'A'}), false);
});

test('browser script stays classic and avoids runtime dependencies', () => {
  assert.doesNotMatch(script, /\bimport\s/);
  assert.doesNotMatch(script, /\bfetch\s*\(/);
  assert.doesNotMatch(script, /XMLHttpRequest/);
  assert.match(script, /TrueRuslanPhotoStories/);
});
