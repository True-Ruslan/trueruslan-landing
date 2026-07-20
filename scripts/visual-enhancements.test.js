import test from 'node:test';
import assert from 'node:assert/strict';

import {getPageKind, getTerminalLines} from '../docs/_assets/script/custom.js';

test('getPageKind classifies homepage and portfolio routes', () => {
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
  const lines = getTerminalLines();

  assert.ok(Array.isArray(lines));
  assert.ok(lines.length >= 4);
  assert.ok(lines.some((line) => line.includes('java --version')));
  assert.ok(lines.some((line) => line.includes('Backend Engineer')));
  assert.ok(lines.some((line) => line.includes('distributed systems')));
});
