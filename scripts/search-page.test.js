import test from 'node:test';
import assert from 'node:assert/strict';

import {normalizeSearchPageHtml} from './search-page.js';

test('normalizeSearchPageHtml makes Diplodoc search assets base-safe and removes duplicate resources script', () => {
  const html = `<!doctype html><html><head>
    <base href="../../">
    <link rel="icon" href="assets/images/avatar.png">
    <link rel="stylesheet" href="../../_bundle/vendor.css">
    <link rel="stylesheet" href="../../_bundle/search.css">
  </head><body>
    <script src="_search/ru/123-resources.js"></script>
    <script src="../../_bundle/vendor.js"></script>
    <script src="../../_bundle/search.js"></script>
    <script src="123-resources.js"></script>
  </body></html>`;

  const normalized = normalizeSearchPageHtml(html, '_search/ru/index.html');

  assert.match(normalized, /href="_bundle\/vendor\.css"/);
  assert.match(normalized, /href="_bundle\/search\.css"/);
  assert.match(normalized, /src="_bundle\/vendor\.js"/);
  assert.match(normalized, /src="_bundle\/search\.js"/);
  assert.match(normalized, /href="assets\/images\/avatar\.png"/);
  assert.equal((normalized.match(/_search\/ru\/123-resources\.js/g) || []).length, 1);
  assert.doesNotMatch(normalized, /src="123-resources\.js"/);
  assert.doesNotMatch(normalized, /\.\.\/\.\.\/_bundle/);
});
