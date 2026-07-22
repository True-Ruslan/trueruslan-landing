import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(ROOT, 'docs', '_assets', 'script', 'custom.js'), 'utf8');

function loadApi() {
  const sandbox = {
    globalThis: {},
    URL,
  };
  vm.runInNewContext(script, sandbox, {filename: 'custom.js'});
  return sandbox.globalThis.TrueRuslanVisual;
}

test('Sources UI normalizes page-local queries without creating an index', () => {
  const api = loadApi();
  assert.equal(typeof api.normalizeSourcesQuery, 'function');
  assert.equal(api.normalizeSourcesQuery('  Spring   DATA  '), 'spring data');
  assert.equal(api.normalizeSourcesQuery(null), '');
});

test('Sources UI composes query, topic and source-type filters deterministically', () => {
  const api = loadApi();
  assert.equal(typeof api.sourceMatchesSourcesFilters, 'function');

  const source = {
    searchText: 'spring data jdbc базы данных jpa оптимизация запросов',
    topics: ['Базы данных', 'JPA'],
    sourceType: 'article',
  };

  assert.equal(api.sourceMatchesSourcesFilters(source, {}), true);
  assert.equal(api.sourceMatchesSourcesFilters(source, {query: 'SPRING   data'}), true);
  assert.equal(api.sourceMatchesSourcesFilters(source, {query: 'clickhouse'}), false);
  assert.equal(api.sourceMatchesSourcesFilters(source, {topic: 'JPA'}), true);
  assert.equal(api.sourceMatchesSourcesFilters(source, {topic: 'AI'}), false);
  assert.equal(api.sourceMatchesSourcesFilters(source, {sourceType: 'article'}), true);
  assert.equal(api.sourceMatchesSourcesFilters(source, {sourceType: 'book'}), false);
  assert.equal(api.sourceMatchesSourcesFilters(source, {query: 'jdbc', topic: 'JPA', sourceType: 'article'}), true);
  assert.equal(api.sourceMatchesSourcesFilters(source, {query: 'jdbc', topic: 'AI', sourceType: 'article'}), false);
});
