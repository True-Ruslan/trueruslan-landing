import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = fs.readFileSync(path.join(__dirname, '..', 'docs', '_assets', 'script', 'command-palette.js'), 'utf8');
const sandbox = {URL, setTimeout, clearTimeout};
sandbox.globalThis = sandbox;
vm.runInNewContext(script, sandbox, {filename: 'command-palette.js'});
const palette = sandbox.TrueRuslanCommandPalette;

test('command palette exposes deterministic quick destinations and one search handoff', () => {
  const commands = palette.getCommands();
  assert.deepEqual(
    commands.map((command) => command.id),
    ['projects', 'now', 'notes', 'map', 'resume', 'search', 'github'],
  );
  assert.equal(commands.filter((command) => command.kind === 'search').length, 1);
  assert.equal(commands.find((command) => command.kind === 'search').target, '_search/ru/index.html');
});

test('resolveCommandHref is safe for root and GitHub Pages subpath deployments', () => {
  assert.equal(
    palette.resolveCommandHref('landing/projects.html', 'https://example.test/index.html'),
    'https://example.test/landing/projects.html',
  );
  assert.equal(
    palette.resolveCommandHref('landing/projects.html', 'https://example.test/trueruslan-landing/landing/now.html'),
    'https://example.test/trueruslan-landing/landing/projects.html',
  );
  assert.equal(
    palette.resolveCommandHref('_search/ru/index.html', 'https://example.test/trueruslan-landing/landing/notes/foo.html'),
    'https://example.test/trueruslan-landing/_search/ru/index.html',
  );
});

test('isEditableTarget protects slash shortcut inside editable controls', () => {
  assert.equal(palette.isEditableTarget({tagName: 'INPUT'}), true);
  assert.equal(palette.isEditableTarget({tagName: 'TEXTAREA'}), true);
  assert.equal(palette.isEditableTarget({tagName: 'DIV', isContentEditable: true}), true);
  assert.equal(palette.isEditableTarget({tagName: 'A'}), false);
});
