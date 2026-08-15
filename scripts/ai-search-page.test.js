import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {refreshAiIndex} from './ai-index.js';
import {copyAiSearchResources, publishAiArtifacts} from './ai-static-assets.js';
import {normalizeSearchPageHtml} from './search-page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const sourceHtml = `<!doctype html><html><head>
  <base href="../../">
  <link rel="stylesheet" href="../../_bundle/search.css">
</head><body>
  <script src="../../_bundle/search.js"></script>
  <script src="123-resources.js"></script>
</body></html>`;

const VECTOR = Object.freeze(Array.from({length: 512}, (_, index) => (index + 1) / 10000));

function config(mode = 'off', overrides = {}) {
  return {
    schemaVersion: 1,
    mode,
    workerBaseUrl: mode === 'off' ? '' : 'https://ai.example.workers.dev',
    embeddingModel: 'openai/text-embedding-3-small',
    embeddingDimensions: 512,
    answerModel: 'google/gemini-2.5-flash-lite',
    maxQueryChars: 500,
    maxResults: 5,
    answerMaxChunks: 5,
    answerMaxContextChars: 18000,
    answerMaxTokens: 700,
    includePagePaths: ['landing/about.html'],
    hybridWeights: mode === 'off' ? null : {
      semantic: 0.65,
      lexical: 0.20,
      title: 0.10,
      language: 0.05,
    },
    ...overrides,
  };
}

function count(source, pattern) {
  return (source.match(pattern) || []).length;
}

function writeSearchResourceFixture(rootDir) {
  const files = [
    '_assets/style/ai-search.css',
    '_assets/script/ai-retrieval.js',
    '_assets/script/ai-search.js',
  ];
  for (const relative of files) {
    const target = path.join(rootDir, relative);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, `fixture:${relative}\n`);
  }
  return files;
}

function indexFixtureRoot(text = 'stable') {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-static-'));
  fs.mkdirSync(path.join(rootDir, 'data'), {recursive: true});
  fs.mkdirSync(path.join(rootDir, 'docs', 'landing'), {recursive: true});
  fs.writeFileSync(path.join(rootDir, 'data', 'page-meta.json'), JSON.stringify([
    {path: 'landing/about.html', title: 'About'},
  ]));
  fs.writeFileSync(path.join(rootDir, 'data', 'notes.json'), '[]');
  fs.writeFileSync(path.join(rootDir, 'data', 'publications.json'), '[]');
  fs.writeFileSync(
    path.join(rootDir, 'docs', 'landing', 'about.md'),
    `# About\n\n${text} canonical public engineering profile is long enough to create a deterministic semantic chunk and verify static AI artifact publication safely.\n`,
  );
  return rootDir;
}

async function buildIndex(rootDir) {
  await refreshAiIndex({
    rootDir,
    config: config('off'),
    apiKey: 'test-key',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() { return {data: [{index: 0, embedding: VECTOR}]}; },
    }),
  });
}

test('OFF search normalization preserves ordinary project resources and emits no AI surface', () => {
  const normalized = normalizeSearchPageHtml(sourceHtml, '_search/ru/index.html', {aiConfig: config('off')});
  assert.equal(count(normalized, /_assets\/style\/search\.css/g), 1);
  assert.equal(count(normalized, /_assets\/script\/search-ui\.js/g), 1);
  assert.doesNotMatch(normalized, /data-tr-ai-mode/);
  assert.doesNotMatch(normalized, /tr-ai-search-config/);
  assert.doesNotMatch(normalized, /ai-search\.css/);
  assert.doesNotMatch(normalized, /ai-retrieval\.js/);
  assert.doesNotMatch(normalized, /ai-search\.js/);
});

test('SEARCH and FULL normalization inject exactly one safe runtime config and resource set', () => {
  for (const mode of ['search', 'full']) {
    const normalized = normalizeSearchPageHtml(sourceHtml, '_search/ru/index.html', {aiConfig: config(mode)});
    assert.equal(count(normalized, new RegExp(`data-tr-ai-mode="${mode}"`, 'g')), 2);
    assert.equal(count(normalized, /_assets\/style\/search\.css/g), 1);
    assert.equal(count(normalized, /_assets\/script\/search-ui\.js/g), 1);
    assert.equal(count(normalized, /_assets\/style\/ai-search\.css/g), 1);
    assert.equal(count(normalized, /_assets\/script\/ai-retrieval\.js/g), 1);
    assert.equal(count(normalized, /_assets\/script\/ai-search\.js/g), 1);
    assert.equal(count(normalized, /id="tr-ai-search-config"/g), 1);
    assert.equal(count(normalized, /type="application\/json"/g), 1);
    assert.match(normalized, /"workerBaseUrl":"https:\/\/ai\.example\.workers\.dev"/);
    assert.match(normalized, /"embeddingDimensions":512/);
    assert.match(normalized, /"maxQueryChars":500/);
    assert.match(normalized, /"maxResults":5/);
    assert.match(normalized, /"answerMaxChunks":5/);
    assert.match(normalized, /"hybridWeights"/);
    assert.doesNotMatch(normalized, /OPENROUTER_API_KEY|test-secret-key|answerModel|embeddingModel/);

    const twice = normalizeSearchPageHtml(normalized, '_search/ru/index.html', {aiConfig: config(mode)});
    assert.equal(twice, normalized);
  }
});

test('AI static resource copier is a no-op OFF and copies only the three AI resources when enabled', () => {
  const docsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-resource-src-'));
  writeSearchResourceFixture(docsDir);

  const offOutput = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-resource-off-'));
  assert.deepEqual(copyAiSearchResources({docsDir, outputDir: offOutput, config: config('off')}), []);
  assert.equal(fs.existsSync(path.join(offOutput, '_assets', 'style', 'ai-search.css')), false);

  const enabledOutput = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-resource-on-'));
  const enabled = copyAiSearchResources({docsDir, outputDir: enabledOutput, config: config('search')});
  assert.deepEqual(enabled, [
    '_assets/style/ai-search.css',
    '_assets/script/ai-retrieval.js',
    '_assets/script/ai-search.js',
  ]);
  for (const relative of enabled) assert.equal(fs.existsSync(path.join(enabledOutput, relative)), true, relative);
});

test('publishAiArtifacts is a no-op when mode is OFF', () => {
  const rootDir = indexFixtureRoot();
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-publish-off-'));
  const report = publishAiArtifacts({rootDir, outputDir, config: config('off')});
  assert.deepEqual(report, {published: false, files: []});
  assert.equal(fs.existsSync(path.join(outputDir, 'ai')), false);
});

test('enabled publication verifies the committed index offline and copies exactly three artifacts', async () => {
  const rootDir = indexFixtureRoot();
  await buildIndex(rootDir);
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-publish-on-'));
  const report = publishAiArtifacts({rootDir, outputDir, config: config('search')});
  assert.equal(report.published, true);
  assert.deepEqual(report.files, ['ai/chunks.json', 'ai/index-meta.json', 'ai/embeddings.bin']);
  for (const relative of report.files) assert.equal(fs.existsSync(path.join(outputDir, relative)), true, relative);
});

test('enabled publication fails closed on stale index before writing public AI artifacts', async () => {
  const rootDir = indexFixtureRoot();
  await buildIndex(rootDir);
  fs.writeFileSync(
    path.join(rootDir, 'docs', 'landing', 'about.md'),
    '# About\n\nChanged canonical public content makes the committed semantic index stale and must prevent enabled build publication without contacting OpenRouter.\n',
  );
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-publish-stale-'));
  assert.throws(
    () => publishAiArtifacts({rootDir, outputDir, config: config('search')}),
    /stale|AI index unavailable|hash/i,
  );
  assert.equal(fs.existsSync(path.join(outputDir, 'ai')), false);
});

test('normal build chain runs the isolated AI postprocessor without coupling ordinary build to OpenRouter', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['postprocess:ai-search'], 'node scripts/ai-static-assets.js');
  assert.match(pkg.scripts['copy-assets'], /node scripts\/copy-assets\.js && npm run postprocess:ai-search/);
  assert.doesNotMatch(pkg.scripts['copy-assets'], /ai:index|OPENROUTER_API_KEY|openrouter/i);
});