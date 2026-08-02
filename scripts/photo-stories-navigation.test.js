import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const home = fs.readFileSync(path.join(root, 'templates', 'index.html'), 'utf8');
const toc = fs.readFileSync(path.join(root, 'docs', 'toc.yaml'), 'utf8');
const yfm = fs.readFileSync(path.join(root, 'docs', '.yfm'), 'utf8');

test('standalone homepage points photo navigation directly to the canonical Diplodoc page', () => {
  assert.match(home, /href="landing\/photos\.html"[^>]*>Фото/);
  assert.match(home, /href="landing\/photos\.html"[^>]*>[\s\S]*?<h3>Фотографии<\/h3>/);
  assert.doesNotMatch(home, /href="photos\/"[^>]*>Фото/);
});

test('Diplodoc header and sidebar use one canonical photo route', () => {
  assert.match(toc, /- text: Фото[\s\S]*?url: landing\/photos\.html/);
  assert.match(toc, /- name: Фото[\s\S]*?href: \.\/landing\/photos\.md/);
  assert.doesNotMatch(toc, /url: photos\//);
});

test('Diplodoc resources publish shared and embedded photo styles with one runtime', () => {
  assert.match(yfm, /_assets\/style\/photo-stories\.css/);
  assert.match(yfm, /_assets\/style\/photo-embedded\.css/);
  assert.match(yfm, /_assets\/script\/photo-stories\.js/);
});
