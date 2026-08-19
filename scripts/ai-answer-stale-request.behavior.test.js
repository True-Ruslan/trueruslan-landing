import assert from 'node:assert/strict';
import test from 'node:test';

await import(new URL('../docs/_assets/script/ai-search.js', import.meta.url));

const {createAnswerAction} = globalThis.TrueRuslanAiSearch;

function createNode() {
  const listeners = new Map();
  const attributes = new Map();

  return {
    className: '',
    textContent: '',
    children: [],
    parent: null,
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type) {
      return listeners.get(type)?.();
    },
    append(...nodes) {
      for (const node of nodes) {
        if (node && typeof node === 'object') node.parent = this;
        this.children.push(node);
      }
    },
    querySelector(selector) {
      if (!selector.startsWith('.')) return null;
      const className = selector.slice(1);
      return this.children.find((node) => String(node?.className || '').split(/\s+/u).includes(className)) || null;
    },
    remove() {
      if (!this.parent) return;
      this.parent.children = this.parent.children.filter((node) => node !== this);
      this.parent = null;
    },
  };
}

function createDocument() {
  return {
    documentElement: {lang: 'en'},
    createElement() {
      return createNode();
    },
  };
}

function answerFixture() {
  return {
    config: {
      mode: 'full',
      workerBaseUrl: 'https://ai.example.workers.dev',
      answerMaxChunks: 5,
    },
    question: 'backend engineer',
    results: [{
      id: 'en:page:about:intro',
      url: '/en/about/',
      title: 'Backend engineer',
      section: 'About',
    }],
    index: {
      chunks: [{
        id: 'en:page:about:intro',
        url: '/en/about/',
        title: 'Backend engineer',
        section: 'About',
      }],
    },
  };
}

function invalidateLikeUiStateChange(state) {
  state.controller?.abort?.();
  state.controller = null;
  state.generation += 1;
}

async function runStaleOutcome({outcome}) {
  const document = createDocument();
  const panel = createNode();
  const answerRequestState = {controller: null, generation: 0};
  let settleFetch;
  let observedSignal;

  const fetchImpl = (_url, init) => {
    observedSignal = init.signal;
    return new Promise((resolve, reject) => {
      settleFetch = outcome === 'success'
        ? () => resolve({
            ok: true,
            status: 200,
            json: async () => ({
              sufficientEvidence: true,
              answer: 'This stale answer must never render.',
              citations: ['en:page:about:intro'],
            }),
          })
        : () => reject(new Error('AI grounded answer unavailable: HTTP 503'));
    });
  };

  const button = createAnswerAction({
    document,
    panel,
    ...answerFixture(),
    answerRequestState,
    fetchImpl,
  });

  assert.ok(button, 'FULL mode must expose an answer action');
  const clickPromise = button.dispatch('click');
  assert.ok(observedSignal, 'answer fetch must receive an AbortSignal');
  assert.equal(observedSignal.aborted, false);

  invalidateLikeUiStateChange(answerRequestState);
  assert.equal(observedSignal.aborted, true, 'UI invalidation must abort the active transport');

  settleFetch();
  await clickPromise;

  assert.equal(panel.querySelector('.tr-ai-answer'), null, `stale ${outcome} must not render an answer surface`);
}

test('stale successful FULL answer cannot repaint after UI generation changes even if fetch ignores abort', async () => {
  await runStaleOutcome({outcome: 'success'});
});

test('stale failed FULL answer cannot repaint an error after UI generation changes even if fetch ignores abort', async () => {
  await runStaleOutcome({outcome: 'error'});
});
