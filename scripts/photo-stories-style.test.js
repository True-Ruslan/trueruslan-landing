import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.join(__dirname, '..', 'docs', '_assets', 'style', 'photo-stories.css'), 'utf8');

test('photo stories stylesheet scopes cinematic index, album and lightbox surfaces', () => {
  assert.match(css, /\.tr-photo-index-hero/);
  assert.match(css, /\.tr-photo-album-hero/);
  assert.match(css, /\.tr-photo-editorial/);
  assert.match(css, /\.tr-photo-lightbox/);
  assert.match(css, /data-tr-photo-layout/);
});

test('photo stories stylesheet has explicit mobile and reduced-motion behavior', () => {
  assert.match(css, /@media\s*\(max-width:\s*720px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /overflow-x:\s*clip|overflow-x:\s*hidden/);
});

test('lightbox has fixed viewport containment and touch-friendly controls', () => {
  assert.match(css, /\.tr-photo-lightbox\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /\.tr-photo-lightbox__close[^}]*min-(?:width|inline-size):\s*44px/s);
  assert.match(css, /\.tr-photo-lightbox__nav[^}]*min-(?:width|inline-size):\s*44px/s);
});
