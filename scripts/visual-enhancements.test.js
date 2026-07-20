import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(ROOT, 'docs', '_assets', 'script', 'custom.js');

function loadVisualApi() {
  const source = fs.readFileSync(scriptPath, 'utf8');
  const context = {console};
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context, {filename: scriptPath});
  return context.TrueRuslanVisual;
}

test('getPageKind classifies homepage and portfolio routes', () => {
  const {getPageKind} = loadVisualApi();

  assert.equal(getPageKind('/'), 'home');
  assert.equal(getPageKind('/index.html'), 'home');
  assert.equal(getPageKind('/landing/projects.html'), 'projects');
  assert.equal(getPageKind('/landing/about.html'), 'about');
  assert.equal(getPageKind('/landing/resume.html'), 'resume');
  assert.equal(getPageKind('/landing/bibliography.html'), 'bibliography');
  assert.equal(getPageKind('/landing/contacts.html'), 'contacts');
  assert.equal(getPageKind('/landing/photos.html'), 'photos');
  assert.equal(getPageKind('/anything/else.html'), 'content');
});

test('terminal lines communicate identity without replacing page content', () => {
  const {getTerminalLines} = loadVisualApi();
  const lines = getTerminalLines();

  assert.ok(Array.isArray(lines));
  assert.ok(lines.length >= 4);
  assert.ok(lines.some((line) => line.includes('java --version')));
  assert.ok(lines.some((line) => line.includes('Backend Engineer')));
  assert.ok(lines.some((line) => line.includes('distributed systems')));
});
