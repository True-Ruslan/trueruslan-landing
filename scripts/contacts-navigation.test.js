import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('Contacts is a first-class primary navigation item in Diplodoc and standalone home', () => {
  const toc = read('docs/toc.yaml');
  const home = read('templates/index.html');
  const leftItems = toc.split('    leftItems:\n', 2)[1]?.split('    rightItems:\n', 1)[0] ?? '';

  assert.match(leftItems, /- text: Контакты\n\s+type: link\n\s+url: landing\/contacts\.html/);
  assert.match(home, /<nav class="tr-site-nav"[^>]*>[\s\S]*<a href="landing\/contacts\.html">Контакты<\/a>[\s\S]*<\/nav>/);
});

test('Contacts uses a simple primary contact block without the collaboration handoff', () => {
  const contacts = read('docs/landing/contacts.md');

  assert.match(contacts, /## Основные контакты/);
  assert.match(contacts, /\[@TrueRuslan_Blog\]\(https:\/\/t\.me\/TrueRuslan_Blog\)/);
  assert.match(contacts, /\[contact@trueruslan\.ru\]\(mailto:contact@trueruslan\.ru\)/);
  assert.doesNotMatch(contacts, /data-tr-collaboration-handoff/);
  assert.doesNotMatch(contacts, /## Написать мне/);
  assert.doesNotMatch(contacts, /Описать задачу/i);
});

test('collaboration postprocessor no longer owns or mutates the Contacts page', () => {
  const collaboration = read('scripts/collaboration.js');
  assert.doesNotMatch(collaboration, /landing\/contacts\.html/);
  assert.doesNotMatch(collaboration, /handoff for Contacts/i);
});
