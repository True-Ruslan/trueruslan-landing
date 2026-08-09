import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {renderHomepageBridge} from './standalone-home.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const home = fs.readFileSync(path.join(root, 'templates', 'index.html'), 'utf8');
const toc = fs.readFileSync(path.join(root, 'docs', 'toc.yaml'), 'utf8');
const yfm = fs.readFileSync(path.join(root, 'docs', '.yfm'), 'utf8');

test('standalone homepage keeps the canonical photo route reachable through the C2 personal bridge, outside primary navigation', () => {
  const personal = renderHomepageBridge('personal', 'ru');
  assert.match(personal, /href="landing\/photos\.html"[^>]*>Фото →<\/a>/);
  assert.doesNotMatch(home, /<nav class="tr-site-nav"[\s\S]*?href="landing\/photos\.html"[^>]*>Фото/);
  assert.doesNotMatch(home, /href="photos\/"[^>]*>Фото/);
});

test('Diplodoc sidebar keeps the canonical photo route while the bounded header omits it', () => {
  const headerStart = toc.indexOf('    leftItems:');
  const headerEnd = toc.indexOf('    rightItems:', headerStart);
  assert.ok(headerStart !== -1 && headerEnd > headerStart);
  const header = toc.slice(headerStart, headerEnd);

  assert.doesNotMatch(header, /- text: Фото/);
  assert.match(toc, /- name: Фото[\s\S]*?href: \.\/landing\/photos\.md/);
  assert.doesNotMatch(toc, /url: photos\//);
});

test('Diplodoc resources publish shared and embedded photo styles with one runtime', () => {
  assert.match(yfm, /_assets\/style\/photo-stories\.css/);
  assert.match(yfm, /_assets\/style\/photo-embedded\.css/);
  assert.match(yfm, /_assets\/script\/photo-stories\.js/);
});
