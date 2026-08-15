import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SCRIPT_PATH = path.join(ROOT, 'docs', '_assets', 'script', 'ai-search.js');

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentElement = null;
    this.attributes = new Map();
    this.className = '';
    this.textContent = '';
    this.listeners = new Map();
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  removeAttribute(name) { this.attributes.delete(name); }

  append(...nodes) {
    for (const node of nodes) {
      node.parentElement = this;
      this.children.push(node);
    }
  }

  addEventListener(type, listener) {
    const list = this.listeners.get(type) || [];
    list.push(listener);
    this.listeners.set(type, list);
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
    const matches = (node) => selector.startsWith('.') && node.className.split(/\s+/).includes(selector.slice(1));
    const stack = [...this.children];
    while (stack.length) {
      const node = stack.shift();
      if (matches(node)) return node;
      stack.unshift(...node.children);
    }
    return null;
  }
}

function fakeDocument(locale = 'ru') {
  return {
    documentElement: {lang: locale === 'en' ? 'en' : 'ru'},
    createElement(tagName) { return new FakeElement(tagName); },
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
    console: {error() {}, warn() {}, log() {}},
    setTimeout,
    clearTimeout,
    addEventListener() {},
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, {filename: 'ai-search.js'});
  return sandbox.TrueRuslanAiSearch;
}

const RESULTS = Object.freeze([
  {id: 'ru:note:green-ci-is-not-product-verification:intro', url: '/notes/green-ci-is-not-product-verification/', title: 'Green CI', section: 'Intro', type: 'note', lang: 'ru', text: 'Canonical text'},
  {id: 'ru:project:portfolio-platform:intro', url: '/projects/portfolio-platform/', title: 'Portfolio Platform', section: 'Intro', type: 'project', lang: 'ru', text: 'Canonical project text'},
]);

function answerConfig(mode = 'full') {
  return {
    mode,
    workerBaseUrl: 'https://ai.example.workers.dev',
    answerMaxChunks: 5,
  };
}

test('answer helpers are exposed only as dependency-free runtime primitives', () => {
  const api = loadApi();
  for (const name of [
    'selectAnswerChunkIds',
    'requestGroundedAnswer',
    'createAnswerAction',
    'renderGroundedAnswer',
    'renderAnswerFailure',
  ]) assert.equal(typeof api[name], 'function', name);
});

test('answer chunk selection keeps top-ranked unique stable IDs and never exceeds five', () => {
  const api = loadApi();
  const input = [
    RESULTS[0],
    RESULTS[0],
    RESULTS[1],
    {id: 'ru:page:about:intro'},
    {id: 'en:page:about:intro'},
    {id: 'ru:page:resume:intro'},
    {id: 'ru:page:now:intro'},
  ];
  assert.deepEqual(
    [...api.selectAnswerChunkIds(input, 5)],
    [
      RESULTS[0].id,
      RESULTS[1].id,
      'ru:page:about:intro',
      'en:page:about:intro',
      'ru:page:resume:intro',
    ],
  );
  assert.throws(() => api.selectAnswerChunkIds([{id: '../../escape'}], 5), /chunk|id/i);
});

test('grounded answer request sends only question and chunkIds and validates citation subset', async () => {
  const api = loadApi();
  let captured = null;
  const response = await api.requestGroundedAnswer({
    workerBaseUrl: 'https://ai.example.workers.dev',
    question: '  Почему green CI недостаточно?  ',
    chunkIds: [RESULTS[0].id],
    fetchImpl: async (url, init) => {
      captured = {url: String(url), init};
      return new Response(JSON.stringify({
        sufficientEvidence: true,
        answer: 'Потому что это разные слои проверки.',
        citations: [RESULTS[0].id],
      }), {status: 200});
    },
  });
  assert.equal(captured.url, 'https://ai.example.workers.dev/v1/answer');
  assert.equal(captured.init.method, 'POST');
  assert.deepEqual(JSON.parse(captured.init.body), {
    question: 'Почему green CI недостаточно?',
    chunkIds: [RESULTS[0].id],
  });
  assert.equal(/context|model|provider|messages/.test(captured.init.body), false);
  assert.deepEqual(JSON.parse(JSON.stringify(response)), {
    sufficientEvidence: true,
    answer: 'Потому что это разные слои проверки.',
    citations: [RESULTS[0].id],
  });

  await assert.rejects(api.requestGroundedAnswer({
    workerBaseUrl: 'https://ai.example.workers.dev',
    question: 'Question',
    chunkIds: [RESULTS[0].id],
    fetchImpl: async () => new Response(JSON.stringify({
      sufficientEvidence: true,
      answer: 'Invented',
      citations: [RESULTS[1].id],
    }), {status: 200}),
  }), /citation|response/i);
});

test('answer action is absent in search mode, appears only with full-mode results, and deduplicates in-flight clicks', async () => {
  const api = loadApi();
  const document = fakeDocument('ru');
  const searchPanel = new FakeElement('section');
  assert.equal(api.createAnswerAction({
    document,
    panel: searchPanel,
    config: answerConfig('search'),
    question: 'Question',
    results: RESULTS,
    index: {chunks: RESULTS},
    fetchImpl: async () => { throw new Error('must not run'); },
  }), null);

  const emptyPanel = new FakeElement('section');
  assert.equal(api.createAnswerAction({
    document,
    panel: emptyPanel,
    config: answerConfig('full'),
    question: 'Question',
    results: [],
    index: {chunks: RESULTS},
    fetchImpl: async () => { throw new Error('must not run'); },
  }), null);

  let release;
  let calls = 0;
  const deferred = new Promise((resolve) => { release = resolve; });
  const fullPanel = new FakeElement('section');
  const action = api.createAnswerAction({
    document,
    panel: fullPanel,
    config: answerConfig('full'),
    question: 'Почему green CI недостаточно?',
    results: RESULTS,
    index: {chunks: RESULTS},
    fetchImpl: async () => {
      calls += 1;
      await deferred;
      return new Response(JSON.stringify({sufficientEvidence: false, answer: '', citations: []}), {status: 200});
    },
  });
  assert.ok(action);
  assert.equal(action.className, 'tr-ai-answer-action');
  action.dispatchEvent({type: 'click'});
  action.dispatchEvent({type: 'click'});
  await Promise.resolve();
  assert.equal(calls, 1);
  release();
  await new Promise((resolve) => setTimeout(resolve, 0));
});

test('grounded answer rendering uses textContent and local canonical citation metadata only', () => {
  const api = loadApi();
  const document = fakeDocument('ru');
  const panel = new FakeElement('section');
  const rendered = api.renderGroundedAnswer({
    document,
    panel,
    result: {
      sufficientEvidence: true,
      answer: '<img src=x onerror=alert(1)> Проверенный ответ.',
      citations: [RESULTS[0].id],
    },
    selectedIds: [RESULTS[0].id],
    chunks: RESULTS,
  });
  assert.equal(rendered.className, 'tr-ai-answer');
  const body = rendered.querySelector('.tr-ai-answer__body');
  assert.equal(body.textContent, '<img src=x onerror=alert(1)> Проверенный ответ.');
  assert.equal(body.children.length, 0);
  const sources = rendered.querySelector('.tr-ai-answer__sources');
  assert.equal(sources.children.length, 1);
  const link = sources.children[0].children[0];
  assert.equal(link.tagName, 'A');
  assert.equal(link.getAttribute('href'), RESULTS[0].url);
  assert.equal(link.getAttribute('target'), null);

  assert.throws(() => api.renderGroundedAnswer({
    document,
    panel: new FakeElement('section'),
    result: {sufficientEvidence: true, answer: 'Bad', citations: [RESULTS[1].id]},
    selectedIds: [RESULTS[0].id],
    chunks: RESULTS,
  }), /citation|selected/i);
});

test('insufficient and answer failures stay bounded inside answer surface without removing semantic results', () => {
  const api = loadApi();
  const ru = fakeDocument('ru');
  const panel = new FakeElement('section');
  const semantic = new FakeElement('article');
  semantic.className = 'tr-ai-result';
  panel.append(semantic);

  const insufficient = api.renderGroundedAnswer({
    document: ru,
    panel,
    result: {sufficientEvidence: false, answer: '', citations: []},
    selectedIds: [RESULTS[0].id],
    chunks: RESULTS,
  });
  assert.match(insufficient.querySelector('.tr-ai-answer__body').textContent, /недостаточно|не хватает/i);
  assert.equal(panel.querySelector('.tr-ai-result'), semantic);

  const failure = api.renderAnswerFailure({document: ru, panel, status: 429});
  assert.match(failure.textContent, /недоступ|попроб/i);
  assert.equal(panel.querySelector('.tr-ai-result'), semantic);
});

test('rendering a new semantic result set removes previous answer surfaces instead of creating chat history', () => {
  const api = loadApi();
  const document = fakeDocument('en');
  const panel = new FakeElement('section');
  api.renderGroundedAnswer({
    document,
    panel,
    result: {sufficientEvidence: false, answer: '', citations: []},
    selectedIds: [RESULTS[0].id],
    chunks: RESULTS,
  });
  assert.ok(panel.querySelector('.tr-ai-answer'));
  api.renderResults(document, panel, RESULTS);
  assert.equal(panel.querySelector('.tr-ai-answer'), null);
  assert.equal(panel.children.filter((node) => node.className === 'tr-ai-result').length, RESULTS.length);
});
