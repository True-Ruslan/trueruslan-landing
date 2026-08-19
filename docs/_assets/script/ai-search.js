(function bootstrapAiSearch(root) {
  'use strict';

  const CONFIG_ID = 'tr-ai-search-config';
  const CONFIG_KEYS = Object.freeze([
    'mode',
    'workerBaseUrl',
    'embeddingDimensions',
    'maxQueryChars',
    'maxResults',
    'answerMaxChunks',
    'hybridWeights',
  ]);
  const WEIGHT_KEYS = Object.freeze(['semantic', 'lexical', 'title', 'language']);
  const STABLE_CHUNK_ID = /^(?:ru|en):(note|project|publication|page):[a-z0-9](?:[a-z0-9-]*[a-z0-9])?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  const MAX_ANSWER_CHUNKS = 5;
  const MAX_ANSWER_WORDS = 450;

  function locale(document) {
    return String(document?.documentElement?.lang || '').toLowerCase().startsWith('en') ? 'en' : 'ru';
  }

  function assertPositiveInteger(value, field) {
    if (!Number.isInteger(value) || value <= 0) throw new Error(`${field} must be a positive integer`);
  }

  function validateWeights(weights) {
    if (!weights || typeof weights !== 'object' || Array.isArray(weights)) {
      throw new Error('hybridWeights must be an object');
    }
    const actual = Object.keys(weights).sort();
    const expected = [...WEIGHT_KEYS].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
      throw new Error(`hybridWeights must contain exactly ${WEIGHT_KEYS.join(', ')}`);
    }
    let sum = 0;
    for (const key of WEIGHT_KEYS) {
      const value = weights[key];
      if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new Error(`hybridWeights.${key} must be between 0 and 1`);
      }
      sum += value;
    }
    if (Math.abs(sum - 1) > 1e-9) throw new Error(`hybridWeights must sum to 1; got ${sum}`);
  }

  function validateWorkerBaseUrl(value) {
    if (typeof value !== 'string' || !value) throw new Error('workerBaseUrl must be a non-empty HTTPS URL');
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error('workerBaseUrl must be a valid HTTPS URL');
    }
    if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search) {
      throw new Error('workerBaseUrl must be a credential-free HTTPS URL without query or fragment');
    }
  }

  function validatePublicConfig(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('AI runtime config must be an object');
    const actual = Object.keys(value).sort();
    const expected = [...CONFIG_KEYS].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
      throw new Error(`AI runtime config has an unexpected field set; expected ${CONFIG_KEYS.join(', ')}`);
    }
    if (!['search', 'full'].includes(value.mode)) throw new Error(`Unsupported AI mode: ${String(value.mode)}`);
    validateWorkerBaseUrl(value.workerBaseUrl);
    assertPositiveInteger(value.embeddingDimensions, 'embeddingDimensions');
    assertPositiveInteger(value.maxQueryChars, 'maxQueryChars');
    assertPositiveInteger(value.maxResults, 'maxResults');
    assertPositiveInteger(value.answerMaxChunks, 'answerMaxChunks');
    if (value.answerMaxChunks > MAX_ANSWER_CHUNKS) throw new Error(`answerMaxChunks must be at most ${MAX_ANSWER_CHUNKS}`);
    validateWeights(value.hybridWeights);
    return value;
  }

  function readPublicConfig(document = root.document) {
    const node = document?.getElementById?.(CONFIG_ID);
    if (!node) throw new Error('AI runtime config is missing');
    let value;
    try {
      value = JSON.parse(String(node.textContent || ''));
    } catch {
      throw new Error('AI runtime config is invalid JSON');
    }
    validatePublicConfig(value);
    return value;
  }

  function createAiSwitch(document, inputShell, mode) {
    if (!inputShell || typeof inputShell.querySelector !== 'function') return null;
    const existing = inputShell.querySelector('.tr-ai-switch');
    if (existing) return existing;

    const wrapper = document.createElement('label');
    wrapper.className = 'tr-ai-switch';
    wrapper.setAttribute('data-tr-ai-mode', mode);

    const label = document.createElement('span');
    label.className = 'tr-ai-switch__label';
    label.textContent = 'AI';

    const button = document.createElement('button');
    button.className = 'tr-ai-switch__control';
    button.setAttribute('type', 'button');
    button.setAttribute('role', 'switch');
    button.setAttribute('aria-checked', 'false');
    button.setAttribute(
      'aria-label',
      locale(document) === 'en' ? 'Semantic search with AI' : 'Поиск по смыслу с помощью AI',
    );
    button.setAttribute('data-tr-ai-enabled', 'false');

    const knob = document.createElement('span');
    knob.className = 'tr-ai-switch__knob';
    knob.setAttribute('aria-hidden', 'true');
    button.append(knob);
    wrapper.append(label, button);
    inputShell.append(wrapper);
    return wrapper;
  }

  function decodeEmbeddingIndex(buffer, meta) {
    if (!(buffer instanceof ArrayBuffer)) throw new Error('embedding index must be an ArrayBuffer');
    if (!meta || typeof meta !== 'object') throw new Error('embedding index metadata is missing');
    assertPositiveInteger(meta.dimensions, 'embedding dimension');
    if (!Array.isArray(meta.chunkIds) || meta.chunkIds.length === 0) throw new Error('embedding index chunkIds are missing');
    if (new Set(meta.chunkIds).size !== meta.chunkIds.length || meta.chunkIds.some((id) => typeof id !== 'string' || !id)) {
      throw new Error('embedding index chunk ID order is invalid');
    }
    const expectedBytes = meta.chunkIds.length * meta.dimensions * 4;
    if (buffer.byteLength !== expectedBytes) {
      throw new Error(`embedding index byte length mismatch: expected ${expectedBytes}, got ${buffer.byteLength}`);
    }

    const view = new DataView(buffer);
    const embeddings = new Map();
    let offset = 0;
    for (const chunkId of meta.chunkIds) {
      const vector = new Array(meta.dimensions);
      for (let index = 0; index < meta.dimensions; index += 1) {
        const value = view.getFloat32(offset, true);
        if (!Number.isFinite(value)) throw new Error(`embedding index has a non-finite value for ${chunkId}`);
        vector[index] = value;
        offset += 4;
      }
      embeddings.set(chunkId, vector);
    }
    return embeddings;
  }

  async function fetchOk(fetchImpl, url, responseType) {
    const response = await fetchImpl(url, {method: 'GET', credentials: 'same-origin'});
    if (!response?.ok) throw new Error(`AI static artifact unavailable: HTTP ${response?.status ?? 'unknown'}`);
    if (responseType === 'json') return response.json();
    return response.arrayBuffer();
  }

  async function loadAiIndex({baseUrl, fetchImpl = root.fetch?.bind(root)}) {
    if (typeof fetchImpl !== 'function') throw new Error('fetch is unavailable');
    const siteRoot = new URL('/', baseUrl).href;
    const meta = await fetchOk(fetchImpl, new URL('ai/index-meta.json', siteRoot).href, 'json');
    const chunks = await fetchOk(fetchImpl, new URL('ai/chunks.json', siteRoot).href, 'json');
    const binary = await fetchOk(fetchImpl, new URL('ai/embeddings.bin', siteRoot).href, 'arrayBuffer');

    assertPositiveInteger(meta?.dimensions, 'embedding dimension');
    if (!Array.isArray(meta?.chunkIds) || !Array.isArray(chunks) || chunks.length !== meta.chunkIds.length) {
      throw new Error('AI index chunk order is inconsistent');
    }
    for (let index = 0; index < chunks.length; index += 1) {
      if (!chunks[index] || chunks[index].id !== meta.chunkIds[index]) {
        throw new Error(`AI index chunk ID order mismatch at ${index}`);
      }
      if (typeof chunks[index].url !== 'string' || !chunks[index].url.startsWith('/') || chunks[index].url.startsWith('//')) {
        throw new Error(`AI index contains a non-canonical URL for ${chunks[index].id}`);
      }
    }

    return {chunks, meta, embeddings: decodeEmbeddingIndex(binary, meta)};
  }

  async function requestQueryEmbedding({workerBaseUrl, query, expectedDimensions, fetchImpl = root.fetch?.bind(root)}) {
    if (typeof fetchImpl !== 'function') throw new Error('fetch is unavailable');
    validateWorkerBaseUrl(workerBaseUrl);
    assertPositiveInteger(expectedDimensions, 'expectedDimensions');
    if (typeof query !== 'string' || !query.trim()) throw new Error('query must be non-empty');
    const response = await fetchImpl(new URL('/v1/embed', workerBaseUrl).href, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query: query.trim()}),
    });
    if (!response?.ok) throw new Error(`AI query embedding unavailable: HTTP ${response?.status ?? 'unknown'}`);
    const payload = await response.json();
    if (payload?.dimensions !== expectedDimensions
      || !Array.isArray(payload?.embedding)
      || payload.embedding.length !== expectedDimensions
      || !payload.embedding.every(Number.isFinite)) {
      throw new Error(`AI query embedding dimension mismatch: expected ${expectedDimensions}`);
    }
    return payload.embedding;
  }

  async function runSemanticSearch({
    query,
    config,
    index,
    fetchImpl,
    preferredLanguage = null,
    retrievalApi = root.TrueRuslanAiRetrieval,
  }) {
    validatePublicConfig(config);
    const normalizedQuery = typeof query === 'string' ? query.trim() : '';
    if (!normalizedQuery || normalizedQuery.length > config.maxQueryChars) {
      throw new Error(`query length must be from 1 to ${config.maxQueryChars}`);
    }
    if (!index || !Array.isArray(index.chunks) || !index.embeddings || !index.meta) throw new Error('AI index is unavailable');
    if (!retrievalApi || typeof retrievalApi.rankChunks !== 'function') throw new Error('AI retrieval runtime is unavailable');

    const queryVector = await requestQueryEmbedding({
      workerBaseUrl: config.workerBaseUrl,
      query: normalizedQuery,
      expectedDimensions: config.embeddingDimensions,
      fetchImpl,
    });
    const ranked = retrievalApi.rankChunks({
      query: normalizedQuery,
      queryVector,
      chunks: index.chunks,
      embeddings: index.embeddings,
      config,
      preferredLanguage,
    });
    const chunksById = new Map(index.chunks.map((chunk) => [chunk.id, chunk]));
    return ranked.slice(0, config.maxResults).map((item) => {
      const chunk = chunksById.get(item.chunkId);
      if (!chunk) throw new Error(`AI ranking returned an unknown chunk ID: ${item.chunkId}`);
      return {...chunk, score: item.score};
    });
  }

  function selectAnswerChunkIds(results, maxChunks = MAX_ANSWER_CHUNKS) {
    assertPositiveInteger(maxChunks, 'answerMaxChunks');
    if (!Array.isArray(results)) throw new Error('answer results must be an array');
    const limit = Math.min(maxChunks, MAX_ANSWER_CHUNKS);
    const ids = [];
    const seen = new Set();
    for (const result of results) {
      const id = result?.id;
      if (typeof id !== 'string' || !STABLE_CHUNK_ID.test(id)) throw new Error('answer result contains an invalid chunk ID');
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
      if (ids.length >= limit) break;
    }
    return ids;
  }

  function validateGroundedAnswerPayload(payload, selectedIds) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('AI answer response is invalid');
    const keys = Object.keys(payload).sort();
    const expected = ['answer', 'citations', 'sufficientEvidence'].sort();
    if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
      throw new Error('AI answer response has an invalid field set');
    }
    if (typeof payload.sufficientEvidence !== 'boolean' || typeof payload.answer !== 'string' || !Array.isArray(payload.citations)) {
      throw new Error('AI answer response is invalid');
    }
    const allowed = new Set(selectedIds);
    if (payload.citations.length > MAX_ANSWER_CHUNKS
      || payload.citations.some((id) => typeof id !== 'string' || !STABLE_CHUNK_ID.test(id) || !allowed.has(id))
      || new Set(payload.citations).size !== payload.citations.length) {
      throw new Error('AI answer citation is outside selected canonical chunks');
    }
    const answer = payload.answer.trim();
    if (!payload.sufficientEvidence) {
      if (answer || payload.citations.length) throw new Error('AI insufficient response must not contain claims or citations');
      return {sufficientEvidence: false, answer: '', citations: []};
    }
    const words = answer ? answer.split(/\s+/u).length : 0;
    if (!answer || words > MAX_ANSWER_WORDS || payload.citations.length < 1) throw new Error('AI answer response is invalid');
    return {sufficientEvidence: true, answer, citations: [...payload.citations]};
  }

  async function requestGroundedAnswer({workerBaseUrl, question, chunkIds, signal, fetchImpl = root.fetch?.bind(root)}) {
    if (typeof fetchImpl !== 'function') throw new Error('fetch is unavailable');
    validateWorkerBaseUrl(workerBaseUrl);
    const normalizedQuestion = typeof question === 'string' ? question.trim() : '';
    if (!normalizedQuestion || normalizedQuestion.length > 500) throw new Error('question length must be from 1 to 500');
    if (!Array.isArray(chunkIds)
      || chunkIds.length < 1
      || chunkIds.length > MAX_ANSWER_CHUNKS
      || chunkIds.some((id) => typeof id !== 'string' || !STABLE_CHUNK_ID.test(id))
      || new Set(chunkIds).size !== chunkIds.length) {
      throw new Error('chunkIds must contain one to five unique stable chunk IDs');
    }
    const response = await fetchImpl(new URL('/v1/answer', workerBaseUrl).href, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question: normalizedQuestion, chunkIds}),
      signal,
    });
    if (!response?.ok) throw new Error(`AI grounded answer unavailable: HTTP ${response?.status ?? 'unknown'}`);
    return validateGroundedAnswerPayload(await response.json(), chunkIds);
  }

  function removeByClass(panel, className) {
    if (!panel?.querySelector) return;
    let node = panel.querySelector(`.${className}`);
    while (node) {
      node.remove?.();
      node = panel.querySelector(`.${className}`);
    }
  }

  function removeAnswerSurfaces(panel) {
    removeByClass(panel, 'tr-ai-answer-action');
    removeByClass(panel, 'tr-ai-answer');
  }

  function resolveCitationChunks({citations, selectedIds, chunks}) {
    const allowed = new Set(selectedIds);
    const byId = new Map((Array.isArray(chunks) ? chunks : []).map((chunk) => [chunk.id, chunk]));
    return citations.map((id) => {
      if (!allowed.has(id)) throw new Error('AI answer citation is outside selected results');
      const chunk = byId.get(id);
      if (!chunk
        || typeof chunk.url !== 'string'
        || !chunk.url.startsWith('/')
        || chunk.url.startsWith('//')
        || chunk.url.includes('..')) {
        throw new Error('AI answer citation metadata is unavailable or unsafe');
      }
      return chunk;
    });
  }

  function renderGroundedAnswer({document, panel, result, selectedIds, chunks}) {
    if (!document || !panel) throw new Error('AI answer render target is unavailable');
    removeByClass(panel, 'tr-ai-answer');
    const normalized = validateGroundedAnswerPayload(result, selectedIds);
    const section = document.createElement('section');
    section.className = 'tr-ai-answer';
    section.setAttribute('aria-live', 'polite');

    const body = document.createElement('div');
    body.className = 'tr-ai-answer__body';
    if (!normalized.sufficientEvidence) {
      body.textContent = locale(document) === 'en'
        ? 'The site does not contain enough evidence to answer this question.'
        : 'На сайте недостаточно данных, чтобы ответить на этот вопрос.';
      section.append(body);
      panel.append(section);
      return section;
    }

    body.textContent = normalized.answer;
    const sources = document.createElement('ol');
    sources.className = 'tr-ai-answer__sources';
    const citationChunks = resolveCitationChunks({citations: normalized.citations, selectedIds, chunks});
    for (const chunk of citationChunks) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.setAttribute('href', chunk.url);
      link.textContent = [chunk.title, chunk.section].filter(Boolean).join(' · ') || chunk.url;
      item.append(link);
      sources.append(item);
    }
    section.append(body, sources);
    panel.append(section);
    return section;
  }

  function renderAnswerFailure({document, panel, status = null}) {
    if (!document || !panel) throw new Error('AI answer render target is unavailable');
    removeByClass(panel, 'tr-ai-answer');
    const section = document.createElement('section');
    section.className = 'tr-ai-answer tr-ai-answer--error';
    section.setAttribute('aria-live', 'polite');
    const suffix = status ? ` (${status})` : '';
    section.textContent = locale(document) === 'en'
      ? `AI answer is temporarily unavailable. The semantic results remain available${suffix}.`
      : `Ответ AI временно недоступен. Результаты поиска по смыслу остаются доступными${suffix}.`;
    panel.append(section);
    return section;
  }

  function invalidatePendingAnswer(state) {
    state.controller?.abort?.();
    state.controller = null;
    state.generation += 1;
  }

  function beginAnswerRequest(state) {
    invalidatePendingAnswer(state);
    const controller = typeof root.AbortController === 'function' ? new root.AbortController() : null;
    state.controller = controller;
    return {controller, generation: state.generation};
  }

  function isCurrentAnswerRequest(state, generation) {
    return state.generation === generation;
  }

  function createAnswerAction({
    document,
    panel,
    config,
    question,
    results,
    index,
    answerRequestState = {controller: null, generation: 0},
    fetchImpl = root.fetch?.bind(root),
  }) {
    if (!document || !panel || config?.mode !== 'full' || !Array.isArray(results) || results.length === 0) return null;
    const selectedIds = selectAnswerChunkIds(results, config.answerMaxChunks);
    if (selectedIds.length === 0) return null;
    removeByClass(panel, 'tr-ai-answer-action');
    removeByClass(panel, 'tr-ai-answer');

    const button = document.createElement('button');
    button.className = 'tr-ai-answer-action';
    button.setAttribute('type', 'button');
    button.textContent = locale(document) === 'en' ? 'Ask AI about these results' : 'Спросить AI по найденному';
    let inFlight = false;
    button.addEventListener('click', async () => {
      if (inFlight) return;
      inFlight = true;
      const request = beginAnswerRequest(answerRequestState);
      button.setAttribute('aria-busy', 'true');
      button.setAttribute('disabled', '');
      try {
        const result = await requestGroundedAnswer({
          workerBaseUrl: config.workerBaseUrl,
          question,
          chunkIds: selectedIds,
          signal: request.controller?.signal,
          fetchImpl,
        });
        if (!isCurrentAnswerRequest(answerRequestState, request.generation)) return;
        renderGroundedAnswer({document, panel, result, selectedIds, chunks: index?.chunks});
      } catch (error) {
        if (error?.name === 'AbortError') return;
        if (!isCurrentAnswerRequest(answerRequestState, request.generation)) return;
        const match = String(error?.message || '').match(/HTTP\s+(\d+)/i);
        renderAnswerFailure({document, panel, status: match ? Number(match[1]) : null});
      } finally {
        if (isCurrentAnswerRequest(answerRequestState, request.generation)) {
          answerRequestState.controller = null;
          inFlight = false;
          button.removeAttribute('aria-busy');
          button.removeAttribute('disabled');
        }
      }
    });
    panel.append(button);
    return button;
  }

  function findInput(document) {
    if (root.TrueRuslanSearchUI?.findSearchInput) return root.TrueRuslanSearchUI.findSearchInput(document);
    return document?.querySelector?.('.tr-search-input, .dc-search-page__search-field input, input[type="search"]') || null;
  }

  function ensureResultsPanel(document, input) {
    const host = input?.closest?.('.tr-search-app, .Search') || input?.closest?.('main') || document.body;
    let panel = host?.querySelector?.('.tr-ai-results');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.className = 'tr-ai-results';
    panel.setAttribute('aria-live', 'polite');
    panel.setAttribute('aria-label', locale(document) === 'en' ? 'AI semantic results' : 'Результаты поиска по смыслу');
    host?.append?.(panel);
    return panel;
  }

  function clearPanel(panel) {
    if (!panel) return;
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    if (Array.isArray(panel.children)) panel.children.splice(0, panel.children.length);
    panel.textContent = '';
    panel.setAttribute?.('hidden', '');
  }

  function renderResults(document, panel, results) {
    if (!panel) return;
    clearPanel(panel);
    panel.removeAttribute?.('hidden');
    const heading = document.createElement('h2');
    heading.className = 'tr-ai-results__heading';
    heading.textContent = locale(document) === 'en' ? 'Found by meaning' : 'Найдено по смыслу';
    panel.append(heading);

    for (const result of results) {
      const article = document.createElement('article');
      article.className = 'tr-ai-result';
      const link = document.createElement('a');
      link.className = 'tr-ai-result__title';
      link.setAttribute('href', result.url);
      link.textContent = result.title || result.section || result.url;
      const meta = document.createElement('p');
      meta.className = 'tr-ai-result__meta';
      meta.textContent = [result.type, result.section].filter(Boolean).join(' · ');
      const snippet = document.createElement('p');
      snippet.className = 'tr-ai-result__snippet';
      const text = String(result.text || '').trim();
      snippet.textContent = text.length > 280 ? `${text.slice(0, 277).trimEnd()}…` : text;
      article.append(link, meta, snippet);
      panel.append(article);
    }
  }

  function renderFailure(document, panel, onOrdinarySearch) {
    if (!panel) return;
    clearPanel(panel);
    panel.removeAttribute?.('hidden');
    const message = document.createElement('p');
    message.className = 'tr-ai-results__status';
    message.textContent = locale(document) === 'en'
      ? 'AI search is temporarily unavailable. Ordinary site search still works.'
      : 'AI-поиск временно недоступен. Обычный поиск по сайту продолжает работать.';
    const button = document.createElement('button');
    button.className = 'tr-ai-results__fallback';
    button.setAttribute('type', 'button');
    button.textContent = locale(document) === 'en' ? 'Ordinary search' : 'Обычный поиск';
    button.addEventListener('click', onOrdinarySearch);
    panel.append(message, button);
  }

  function init(document = root.document) {
    if (!document?.documentElement) return false;
    const mode = document.documentElement.dataset?.trAiMode;
    if (!['search', 'full'].includes(mode)) return false;

    let config;
    try {
      config = readPublicConfig(document);
    } catch (error) {
      root.console?.warn?.(`AI search disabled: ${error.message}`);
      return false;
    }

    const input = findInput(document);
    if (!input) return false;
    const inputShell = input.closest?.('.tr-search-input-shell') || input.parentElement;
    const wrapper = createAiSwitch(document, inputShell, config.mode);
    const switchButton = wrapper?.querySelector?.('button[role="switch"]');
    if (!switchButton) return false;

    const form = input.closest?.('form');
    const searchButton = document.querySelector?.('.tr-search-button, .dc-search-page__search-button');
    const originalPlaceholder = input.getAttribute?.('placeholder') || '';
    const panel = ensureResultsPanel(document, input);
    clearPanel(panel);
    let enabled = false;
    let indexPromise = null;
    let inFlight = false;
    const answerRequestState = {controller: null, generation: 0};

    function setEnabled(next) {
      enabled = Boolean(next);
      if (!enabled) invalidatePendingAnswer(answerRequestState);
      switchButton.setAttribute('aria-checked', enabled ? 'true' : 'false');
      switchButton.setAttribute('data-tr-ai-enabled', enabled ? 'true' : 'false');
      wrapper.classList?.toggle('tr-ai-switch--enabled', enabled);
      if (enabled) {
        input.setAttribute?.(
          'placeholder',
          locale(document) === 'en' ? 'Find by meaning…' : 'Найти по смыслу…',
        );
      } else {
        if (originalPlaceholder) input.setAttribute?.('placeholder', originalPlaceholder);
        else input.removeAttribute?.('placeholder');
        clearPanel(panel);
      }
    }

    switchButton.addEventListener('click', () => setEnabled(!enabled));

    async function submitAi(event) {
      if (!enabled) return;
      event?.preventDefault?.();
      if (inFlight) return;
      const query = String(input.value || '').trim();
      if (!query || query.length > config.maxQueryChars) return;
      invalidatePendingAnswer(answerRequestState);
      removeAnswerSurfaces(panel);
      inFlight = true;
      switchButton.setAttribute('aria-busy', 'true');
      try {
        if (!indexPromise) {
          indexPromise = loadAiIndex({baseUrl: document.baseURI || root.location?.href, fetchImpl: root.fetch?.bind(root)});
        }
        const index = await indexPromise;
        const results = await runSemanticSearch({
          query,
          config,
          index,
          fetchImpl: root.fetch?.bind(root),
          preferredLanguage: locale(document),
          retrievalApi: root.TrueRuslanAiRetrieval,
        });
        renderResults(document, panel, results);
        createAnswerAction({
          document,
          panel,
          config,
          question: query,
          results,
          index,
          answerRequestState,
          fetchImpl: root.fetch?.bind(root),
        });
      } catch {
        renderFailure(document, panel, () => {
          setEnabled(false);
          if (typeof form?.requestSubmit === 'function') form.requestSubmit();
          else searchButton?.click?.();
        });
      } finally {
        inFlight = false;
        switchButton.removeAttribute('aria-busy');
      }
    }

    function onSearchButtonClick(event) {
      if (!enabled) return;
      event?.preventDefault?.();
      event?.stopImmediatePropagation?.();
      void submitAi(event);
    }

    if (form?.addEventListener) form.addEventListener('submit', submitAi);
    if (searchButton?.addEventListener) searchButton.addEventListener('click', onSearchButtonClick, true);
    return true;
  }

  root.TrueRuslanAiSearch = Object.freeze({
    readPublicConfig,
    createAiSwitch,
    decodeEmbeddingIndex,
    loadAiIndex,
    requestQueryEmbedding,
    runSemanticSearch,
    selectAnswerChunkIds,
    requestGroundedAnswer,
    createAnswerAction,
    renderGroundedAnswer,
    renderAnswerFailure,
    renderResults,
    init,
  });

  if (!root.document) return;
  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', () => init(), {once: true});
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);