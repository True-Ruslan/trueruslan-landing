import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  SOURCE_TYPE_VALUES,
  applySourcesKnowledgeBase,
  loadSourcesRegistry,
  renderSourcesKnowledgeBase,
  sortSources,
  validateSourcesRegistry,
} from './sources-registry.js';

const validSource = {
  id: 'postgres-clickhouse-kts-988510',
  title: 'Postgres to ClickHouse',
  url: 'https://habr.com/ru/companies/kts/articles/988510/',
  sourceType: 'article',
  publisher: 'Habr',
  topics: ['Databases', 'PostgreSQL', 'ClickHouse'],
  summary: ['Migration architecture', 'Compression and query trade-offs'],
  related: [],
};

test('Sources Registry module exposes the controlled source-type contract', () => {
  assert.deepEqual(SOURCE_TYPE_VALUES, [
    'article', 'documentation', 'book', 'course', 'talk', 'blog', 'paper', 'other',
  ]);
});

test('validateSourcesRegistry accepts canonical records and normalizes optional collections', () => {
  const [source] = validateSourcesRegistry({sources: [{...validSource, summary: 'One concise summary', related: undefined}]});

  assert.equal(source.id, validSource.id);
  assert.deepEqual(source.summary, ['One concise summary']);
  assert.deepEqual(source.related, []);
});

test('validateSourcesRegistry rejects duplicate ids and duplicate urls', () => {
  assert.throws(
    () => validateSourcesRegistry({sources: [validSource, {...validSource, url: 'https://example.com/other'}]}),
    /duplicate source id/i,
  );
  assert.throws(
    () => validateSourcesRegistry({sources: [validSource, {...validSource, id: 'another-source'}]}),
    /duplicate source url/i,
  );
});

test('validateSourcesRegistry rejects invalid ids, urls, source types and empty topics', () => {
  assert.throws(
    () => validateSourcesRegistry({sources: [{...validSource, id: 'Bad ID'}]}),
    /invalid source id/i,
  );
  assert.throws(
    () => validateSourcesRegistry({sources: [{...validSource, url: 'javascript:alert(1)'}]}),
    /invalid source url/i,
  );
  assert.throws(
    () => validateSourcesRegistry({sources: [{...validSource, sourceType: 'thread'}]}),
    /unsupported source type/i,
  );
  assert.throws(
    () => validateSourcesRegistry({sources: [{...validSource, topics: []}]}),
    /topics must be a non-empty array/i,
  );
});

test('validateSourcesRegistry rejects malformed dates and invalid related references', () => {
  assert.throws(
    () => validateSourcesRegistry({sources: [{...validSource, added: '22-07-2026'}]}),
    /invalid added date/i,
  );
  assert.throws(
    () => validateSourcesRegistry({sources: [{...validSource, related: ['missing-source']}]}),
    /unknown related source/i,
  );
  assert.throws(
    () => validateSourcesRegistry({sources: [{...validSource, related: [validSource.id]}]}),
    /cannot relate to itself/i,
  );
});

test('loadSourcesRegistry reads and validates a canonical json file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-sources-load-'));
  const registryPath = path.join(dir, 'sources.json');
  fs.writeFileSync(registryPath, JSON.stringify({sources: [validSource]}));

  assert.equal(loadSourcesRegistry(registryPath)[0].title, validSource.title);
});

test('sortSources orders dated records newest-first and preserves stable registry order', () => {
  const sources = validateSourcesRegistry({sources: [
    {...validSource, id: 'undated-a', url: 'https://example.com/undated-a'},
    {...validSource, id: 'dated-old', url: 'https://example.com/dated-old', added: '2026-01-01'},
    {...validSource, id: 'dated-new-a', url: 'https://example.com/dated-new-a', added: '2026-07-22'},
    {...validSource, id: 'dated-new-b', url: 'https://example.com/dated-new-b', added: '2026-07-22'},
    {...validSource, id: 'undated-b', url: 'https://example.com/undated-b'},
  ]});

  assert.deepEqual(sortSources(sources).map((source) => source.id), [
    'dated-new-a', 'dated-new-b', 'dated-old', 'undated-a', 'undated-b',
  ]);
});

test('renderSourcesKnowledgeBase renders semantic static content, controls and escaped values', () => {
  const html = renderSourcesKnowledgeBase(validateSourcesRegistry({sources: [{
    ...validSource,
    title: '<Postgres & ClickHouse>',
    publisher: 'Habr <Engineering>',
    topics: ['DB & Storage'],
    summary: ['Use <safe> migrations'],
  }]}));

  assert.match(html, /data-tr-sources-root/);
  assert.match(html, /data-tr-sources-query/);
  assert.match(html, /data-tr-sources-topic/);
  assert.match(html, /data-tr-sources-type/);
  assert.match(html, /data-tr-sources-clear/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="source-postgres-clickhouse-kts-988510"/);
  assert.match(html, /href="https:\/\/habr\.com\/ru\/companies\/kts\/articles\/988510\/"/);
  assert.match(html, /&lt;Postgres &amp; ClickHouse&gt;/);
  assert.match(html, /Habr &lt;Engineering&gt;/);
  assert.match(html, /DB &amp; Storage/);
  assert.match(html, /Use &lt;safe&gt; migrations/);
  assert.doesNotMatch(html, /<Postgres/);
});

test('renderSourcesKnowledgeBase includes declared related-material links', () => {
  const sources = validateSourcesRegistry({sources: [
    validSource,
    {
      ...validSource,
      id: 'related-source',
      title: 'Related source',
      url: 'https://example.com/related',
      related: [validSource.id],
    },
  ]});

  const html = renderSourcesKnowledgeBase(sources);
  assert.match(html, /href="#source-postgres-clickhouse-kts-988510"/);
  assert.match(html, /Postgres to ClickHouse/);
});

test('applySourcesKnowledgeBase replaces only the generated bibliography placeholder', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-sources-apply-'));
  const htmlPath = path.join(outputDir, 'landing', 'bibliography.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.writeFileSync(
    htmlPath,
    '<!doctype html><html><body><main><article><p>Keep intro</p><div data-tr-sources-placeholder></div><p>Keep outro</p></article></main></body></html>',
  );

  assert.equal(applySourcesKnowledgeBase(outputDir, validateSourcesRegistry({sources: [validSource]})), 'landing/bibliography.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /Keep intro/);
  assert.match(html, /Postgres to ClickHouse/);
  assert.match(html, /Keep outro/);
  assert.doesNotMatch(html, /data-tr-sources-placeholder/);
});

test('canonical data/sources.json preserves the 31 migrated bibliography records', () => {
  const registryPath = path.join(process.cwd(), 'data', 'sources.json');
  assert.ok(fs.existsSync(registryPath), 'canonical data/sources.json must exist after migration');

  const sources = loadSourcesRegistry(registryPath);
  assert.equal(sources.length, 31);

  const first = sources.find((source) => source.url === 'https://habr.com/ru/companies/kts/articles/988510/');
  const blog = sources.find((source) => source.url === 'https://360.yandex.ru/roadtohighload/');
  const last = sources.find((source) => source.url === 'https://habr.com/ru/companies/spring_aio/articles/1041836/');

  assert.ok(first);
  assert.match(first.title, /Postgres → ClickHouse/);
  assert.ok(first.summary.some((item) => item.includes('2 ТБ')));
  assert.equal(blog?.sourceType, 'blog');
  assert.equal(last?.title, 'Axelix. Cпецназ для Вашей Spring Boot экосистемы');
});
