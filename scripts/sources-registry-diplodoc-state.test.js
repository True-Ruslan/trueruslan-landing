import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {applySourcesKnowledgeBase, validateSourcesRegistry} from './sources-registry.js';

const source = {
  id: 'state-source',
  title: 'State Source',
  url: 'https://example.com/state-source',
  sourceType: 'article',
  publisher: 'Example',
  topics: ['Testing'],
  summary: ['Injected from Diplodoc state'],
  related: [],
};

test('applySourcesKnowledgeBase injects Diplodoc state plus a semantic no-JavaScript fallback', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-sources-state-'));
  const htmlPath = path.join(outputDir, 'landing', 'bibliography.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});

  const state = JSON.stringify({
    data: {
      html: '<article><p>Intro</p><div data-tr-sources-placeholder></div></article>',
    },
  }).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  fs.writeFileSync(
    htmlPath,
    `<!doctype html><html><body><div id="root"></div><script id="diplodoc-state" type="application/json">${state}</script></body></html>`,
  );

  assert.equal(
    applySourcesKnowledgeBase(outputDir, validateSourcesRegistry({sources: [source]})),
    'landing/bibliography.html',
  );

  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /State Source/);
  assert.doesNotMatch(html, /data-tr-sources-placeholder/);
  assert.match(html, /<noscript[^>]*data-tr-sources-noscript/);
  assert.match(html, /<h1>Список изученных источников<\/h1>/);
  assert.match(html, /<section class="tr-sources" data-tr-sources-root>/);
  assert.match(html, /Injected from Diplodoc state/);
});
