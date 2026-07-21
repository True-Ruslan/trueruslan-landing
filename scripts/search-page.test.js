import test from 'node:test';
import assert from 'node:assert/strict';

import {normalizeSearchPageHtml} from './search-page.js';

const sourceHtml = `<!doctype html><html><head>
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

test('normalizeSearchPageHtml makes Diplodoc search assets base-safe and removes duplicate resources script', () => {
  const normalized = normalizeSearchPageHtml(sourceHtml, '_search/ru/index.html');

  assert.match(normalized, /href="_bundle\/vendor\.css"/);
  assert.match(normalized, /href="_bundle\/search\.css"/);
  assert.match(normalized, /src="_bundle\/vendor\.js"/);
  assert.match(normalized, /src="_bundle\/search\.js"/);
  assert.match(normalized, /href="assets\/images\/avatar\.png"/);
  assert.equal((normalized.match(/_search\/ru\/123-resources\.js/g) || []).length, 1);
  assert.doesNotMatch(normalized, /src="123-resources\.js"/);
  assert.doesNotMatch(normalized, /\.\.\/\.\.\/_bundle/);
});

test('normalizeSearchPageHtml injects branded search resources and page marker exactly once', () => {
  const normalized = normalizeSearchPageHtml(sourceHtml, '_search/ru/index.html');

  assert.match(normalized, /data-tr-search-page="true"/);
  assert.equal((normalized.match(/_assets\/style\/search\.css/g) || []).length, 1);
  assert.equal((normalized.match(/_assets\/script\/search-ui\.js/g) || []).length, 1);
});

test('normalizeSearchPageHtml is idempotent', () => {
  const once = normalizeSearchPageHtml(sourceHtml, '_search/ru/index.html');
  const twice = normalizeSearchPageHtml(once, '_search/ru/index.html');

  assert.equal(once, twice);
});
