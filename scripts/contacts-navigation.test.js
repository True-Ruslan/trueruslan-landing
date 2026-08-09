import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('Contacts remains a first-class route while C2 keeps it out of primary navigation', () => {
  const toc = read('docs/toc.yaml');
  const home = read('templates/index.html');
  const leftItems = toc.split('    leftItems:\n', 2)[1]?.split('    rightItems:\n', 1)[0] ?? '';
  const primaryNav = home.match(/<nav class="tr-site-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const footer = home.match(/<footer class="tr-site-footer"[^>]*>([\s\S]*?)<\/footer>/)?.[1] ?? '';

  assert.doesNotMatch(leftItems, /- text: Контакты/);
  assert.doesNotMatch(primaryNav, />Контакты<\/a>/);
  assert.match(toc, /- name: Контакты\s+href: \.\/landing\/contacts\.md/);
  assert.match(footer, /<a href="landing\/contacts\.html">Контакты<\/a>/);
});

test('Contacts uses a simple primary contact block without the collaboration handoff', () => {
  const contacts = read('docs/landing/contacts.md');

  assert.match(contacts, /## Основные контакты/);
  assert.match(contacts, /\[@TrueRuslan_Blog\]\(https:\/\/t\.me\/TrueRuslan_Blog\)/);
  assert.match(contacts, /\[nemykin@true-ruslan\.ru\]\(mailto:nemykin@true-ruslan\.ru\)/);
  assert.doesNotMatch(contacts, /contact@trueruslan\.ru|ruslan\.nemikin@gmail\.com/i);
  assert.doesNotMatch(contacts, /data-tr-collaboration-handoff/);
  assert.doesNotMatch(contacts, /## Написать мне/);
  assert.doesNotMatch(contacts, /Описать задачу/i);
});

test('collaboration postprocessor no longer owns or mutates the Contacts page', () => {
  const collaboration = read('scripts/collaboration.js');
  assert.doesNotMatch(collaboration, /landing\/contacts\.html/);
  assert.doesNotMatch(collaboration, /handoff for Contacts/i);
});
