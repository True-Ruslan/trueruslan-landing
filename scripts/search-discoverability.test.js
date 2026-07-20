import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const template = fs.readFileSync(path.join(ROOT, 'templates', 'index.html'), 'utf8');
const toc = fs.readFileSync(path.join(ROOT, 'docs', 'toc.yaml'), 'utf8');

const SEARCH_PATH = '_search/ru/index.html';

test('standalone homepage exposes an accessible site-search entry', () => {
  assert.match(template, new RegExp(`href=["']${SEARCH_PATH.replaceAll('/', '\\/')}["']`));
  assert.ok(
    template.includes('aria-label="Поиск по сайту"') || template.includes('>Поиск</a>'),
    'standalone search entry must have a visible or accessible Russian label',
  );
});

test('Diplodoc navigation exposes the generated local-search page', () => {
  assert.match(toc, /text:\s*Поиск/);
  assert.match(toc, /url:\s*_search\/ru\/index\.html/);
});
