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

test('standalone homepage points the Photos card and header to the canonical photo archive', () => {
  assert.match(home, /href="photos\/"[^>]*>Фото/);
  assert.match(home, /href="photos\/"[^>]*>[\s\S]*?<h3>Фотографии<\/h3>/);
  assert.doesNotMatch(home, /href="landing\/photos\.html"/);
});

test('Diplodoc header navigation points Photos to the canonical standalone route', () => {
  assert.match(toc, /- text: Фото[\s\S]*?url: photos\//);
  assert.match(toc, /- name: Фото[\s\S]*?href: \.\/landing\/photos\.md/);
});

test('Diplodoc resources publish photo stories CSS and JavaScript', () => {
  assert.match(yfm, /_assets\/style\/photo-stories\.css/);
  assert.match(yfm, /_assets\/script\/photo-stories\.js/);
});
