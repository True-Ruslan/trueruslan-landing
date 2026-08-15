import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SCRIPT_PATH = path.join(ROOT, 'docs', '_assets', 'script', 'ai-search.js');
const STYLE_PATH = path.join(ROOT, 'docs', '_assets', 'style', 'ai-search.css');

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentElement = null;
    this.attributes = new Map();
    this.dataset = {};
    this.className = '';
    this.textContent = '';
    this.listeners = new Map();
  }

  get classList() {
    const element = this;
    return {
      add(...values) {
        const next = new Set(element.className.split(/\s+/).filter(Boolean));
        values.forEach((value) => next.add(value));
        element.className = [...next].join(' ');
      },
      remove(...values) {
        const removed = new Set(values);
        element.className = element.className.split(/\s+/).filter((value) => value && !removed.has(value)).join(' ');
      },
      contains(value) {
        return element.className.split(/\s+/).filter(Boolean).includes(value);
      },
      toggle(value, force) {
        const present = this.contains(value);
        const next = force === undefined ? !present : Boolean(force);
        if (next) this.add(value);
        else this.remove(value);
        return next;
      },
    };
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      this.dataset[key] = String(value);
    }
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  append(...nodes) {
    for (const node of nodes) {
      node.parentElement = this;
      this.children.push(node);
    }
  }

  appendChild(node) {
    this.append(node);
    return node;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    for (const listener of this.listeners.get(event.type) || []) listener.call(this, event);
    return true;
  }

  remove() {
    if (!this.parentElement) return;
    this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
    this.parentElement = null;
  }

  querySelector(selector) {
    const matches = (node) => {
      if (selector.startsWith('.')) return node.classList.contains(selector.slice(1));
      if (selector === 'button[role="switch"]') return node.tagName === 'BUTTON' && node.getAttribute('role') === 'switch';
      return false;
    };
    const stack = [...this.children];
    while (stack.length) {
      const node = stack.shift();
      if (matches(node)) return node;
      stack.unshift(...node.children);
    }
    return null;
  }
}

function fakeDocument({locale = 'ru', config = null} = {}) {
  const configNode = config ? new FakeElement('script') : null;
  if (configNode) {
    configNode.textContent = JSON.stringify(config);
    configNode.setAttribute('id', 'tr-ai-search-config');
    configNode.setAttribute('type', 'application/json');
  }
  return {
    documentElement: {lang: locale === 'en' ? 'en' : 'ru', dataset: {trAiMode: config?.mode || 'search'}},
    body: new FakeElement('body'),
    baseURI: locale === 'en' ? 'https://trueruslan.ru/_search/en/' : 'https://trueruslan.ru/_search/ru/',
    createElement(tagName) { return new FakeElement(tagName); },
    getElementById(id) { return id === 'tr-ai-search-config' ? configNode : null; },
  };
}

function publicConfig(mode = 'search') {
  return {
    mode,
    workerBaseUrl: 'https://ai.example.workers.dev',
    embeddingDimensions: 512,
    maxQueryChars: 500,
    maxResults: 5,
    answerMaxChunks: 5,
    hybridWeights: {semantic: 0.65, lexical: 0.20, title: 0.10, language: 0.05},
  };
}

function loadApi() {
  const source = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const sandbox = {
    globalThis: null,
    URL,
    ArrayBuffer,
    DataView,
    Map,
    Set,
    TextDecoder,
    console: {error() {}, warn() {}, log() {}},
    setTimeout() {},
    clearTimeout() {},
    addEventListener() {},
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, {filename: 'ai-search.js'});
  return {api: sandbox.TrueRuslanAiSearch, source};
}

test('AI search runtime is a classic dependency-free non-persistent progressive script', () => {
  const {api, source} = loadApi();
  assert.doesNotMatch(source, /^\s*(?:import|export)\s/m);
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/);
  assert.equal(Object.isFrozen(api), true);
  for (const name of [
    'readPublicConfig',
    'createAiSwitch',
    'decodeEmbeddingIndex',
    'loadAiIndex',
    'requestQueryEmbedding',
    'runSemanticSearch',
    'init',
  ]) assert.equal(typeof api[name], 'function', name);
});

test('public runtime config is strict, safe and contains no provider secret/model authority', () => {
  const {api} = loadApi();
  const value = publicConfig();
  assert.deepEqual(JSON.parse(JSON.stringify(api.readPublicConfig(fakeDocument({config: value})))), value);
  assert.throws(() => api.readPublicConfig(fakeDocument({config: {...value, mode: 'auto'}})), /mode/i);
  assert.throws(() => api.readPublicConfig(fakeDocument({config: {...value, workerBaseUrl: 'http://unsafe.example'}})), /https/i);
  assert.throws(() => api.readPublicConfig(fakeDocument({config: {...value, OPENROUTER_API_KEY: 'secret'}})), /field|config/i);
});

test('AI switch is created once, starts OFF, has localized accessible state and never persists', () => {
  const {api} = loadApi();
  const shell = new FakeElement('div');
  const ru = api.createAiSwitch(fakeDocument({locale: 'ru'}), shell, 'search');
  const again = api.createAiSwitch(fakeDocument({locale: 'ru'}), shell, 'search');
  assert.equal(again, ru);
  assert.equal(shell.children.length, 1);
  assert.equal(ru.className, 'tr-ai-switch');
  assert.equal(ru.children[0].textContent, 'AI');
  const button = ru.querySelector('button[role="switch"]');
  assert.ok(button);
  assert.equal(button.getAttribute('aria-checked'), 'false');
  assert.match(button.getAttribute('aria-label'), /поиск по смыслу/i);

  const enShell = new FakeElement('div');
  const en = api.createAiSwitch(fakeDocument({locale: 'en'}), enShell, 'full');
  assert.match(en.querySelector('button[role="switch"]').getAttribute('aria-label'), /semantic search|AI/i);
});

test('binary index decoder validates chunk order, dimensions and little-endian Float32 values', () => {
  const {api} = loadApi();
  const meta = {dimensions: 2, chunkIds: ['en:page:a:intro', 'ru:page:b:intro']};
  const buffer = new ArrayBuffer(16);
  const view = new DataView(buffer);
  [1, 2, 3, 4].forEach((value, index) => view.setFloat32(index * 4, value, true));
  const decoded = api.decodeEmbeddingIndex(buffer, meta);
  assert.deepEqual([...decoded.get('en:page:a:intro')], [1, 2]);
  assert.deepEqual([...decoded.get('ru:page:b:intro')], [3, 4]);
  assert.throws(() => api.decodeEmbeddingIndex(buffer.slice(0, 12), meta), /length|bytes/i);
  assert.throws(() => api.decodeEmbeddingIndex(buffer, {...meta, dimensions: 0}), /dimension/i);
});

test('lazy index loader fetches exactly the three same-site static artifacts and validates ID alignment', async () => {
  const {api} = loadApi();
  const chunks = [
    {id: 'en:page:a:intro', url: '/en/a/', title: 'A', section: 'Intro', type: 'page', lang: 'en', text: 'Alpha source text'},
  ];
  const meta = {dimensions: 2, chunkIds: ['en:page:a:intro']};
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat32(0, 1, true);
  view.setFloat32(4, 0, true);
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (String(url).endsWith('/ai/index-meta.json')) return new Response(JSON.stringify(meta), {status: 200});
    if (String(url).endsWith('/ai/chunks.json')) return new Response(JSON.stringify(chunks), {status: 200});
    if (String(url).endsWith('/ai/embeddings.bin')) return new Response(buffer, {status: 200});
    return new Response('', {status: 404});
  };
  const index = await api.loadAiIndex({baseUrl: 'https://trueruslan.ru/', fetchImpl});
  assert.deepEqual(calls, [
    'https://trueruslan.ru/ai/index-meta.json',
    'https://trueruslan.ru/ai/chunks.json',
    'https://trueruslan.ru/ai/embeddings.bin',
  ]);
  assert.equal(index.chunks.length, 1);
  assert.deepEqual([...index.embeddings.get('en:page:a:intro')], [1, 0]);

  const badFetch = async (url) => {
    if (String(url).endsWith('/ai/index-meta.json')) return new Response(JSON.stringify(meta), {status: 200});
    if (String(url).endsWith('/ai/chunks.json')) return new Response(JSON.stringify([{...chunks[0], id: 'en:page:other:intro'}]), {status: 200});
    return new Response(buffer, {status: 200});
  };
  await assert.rejects(api.loadAiIndex({baseUrl: 'https://trueruslan.ru/', fetchImpl: badFetch}), /chunk.*order|ID/i);
});

test('query embedding request sends only the trimmed query and validates the pinned dimension', async () => {
  const {api} = loadApi();
  let captured = null;
  const embedding = [1, 0];
  const fetchImpl = async (url, init) => {
    captured = {url: String(url), init};
    return new Response(JSON.stringify({embedding, model: 'openai/text-embedding-3-small', dimensions: 2}), {status: 200});
  };
  const result = await api.requestQueryEmbedding({
    workerBaseUrl: 'https://ai.example.workers.dev',
    query: '  Spring Boot  ',
    expectedDimensions: 2,
    fetchImpl,
  });
  assert.deepEqual(result, embedding);
  assert.equal(captured.url, 'https://ai.example.workers.dev/v1/embed');
  assert.equal(captured.init.method, 'POST');
  assert.equal(captured.init.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(captured.init.body), {query: 'Spring Boot'});

  await assert.rejects(api.requestQueryEmbedding({
    workerBaseUrl: 'https://ai.example.workers.dev',
    query: 'x',
    expectedDimensions: 3,
    fetchImpl,
  }), /dimension/i);
});

test('semantic search performs one query embedding call, ranks locally and returns at most configured canonical results', async () => {
  const {api} = loadApi();
  const config = publicConfig();
  config.embeddingDimensions = 2;
  config.maxResults = 2;
  const chunks = [
    {id: 'en:page:a:intro', url: '/en/a/', title: 'A', section: 'Intro', type: 'page', lang: 'en', text: 'Alpha'},
    {id: 'en:page:b:intro', url: '/en/b/', title: 'B', section: 'Intro', type: 'page', lang: 'en', text: 'Beta'},
    {id: 'en:page:c:intro', url: '/en/c/', title: 'C', section: 'Intro', type: 'page', lang: 'en', text: 'Gamma'},
  ];
  const embeddings = new Map(chunks.map((item) => [item.id, [1, 0]]));
  let providerCalls = 0;
  let rankCalls = 0;
  const result = await api.runSemanticSearch({
    query: 'alpha systems',
    config,
    index: {chunks, embeddings, meta: {dimensions: 2, chunkIds: chunks.map(({id}) => id)}},
    fetchImpl: async () => {
      providerCalls += 1;
      return new Response(JSON.stringify({embedding: [1, 0], dimensions: 2}), {status: 200});
    },
    retrievalApi: {
      rankChunks(options) {
        rankCalls += 1;
        assert.equal(options.query, 'alpha systems');
        return chunks.map((item, index) => ({chunkId: item.id, score: 1 - index / 10}));
      },
    },
  });
  assert.equal(providerCalls, 1);
  assert.equal(rankCalls, 1);
  assert.deepEqual(result.map(({id}) => id), ['en:page:a:intro', 'en:page:b:intro']);
  assert.ok(result.every(({url}) => url.startsWith('/')));
});

test('AI switch styles are restrained, accessible, mobile-safe and respect reduced motion', () => {
  const css = fs.readFileSync(STYLE_PATH, 'utf8');
  assert.match(css, /\.tr-ai-switch/);
  assert.match(css, /min-width:\s*40px/);
  assert.match(css, /min-height:\s*40px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\([^)]*max-width/i);
  assert.match(css, /prefers-reduced-motion:\s*reduce/i);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|drop-shadow/i);
});
