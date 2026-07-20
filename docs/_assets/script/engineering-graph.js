(function bootstrapEngineeringGraph(root) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function parseData(document) {
    const script = document.querySelector('script[data-tr-engineering-graph-data]');
    if (!script?.textContent) return null;
    try { return JSON.parse(script.textContent); } catch { return null; }
  }

  function create(tag, className, text) {
    const node = root.document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function mountGraph(document) {
    const host = document.querySelector('[data-tr-engineering-graph-root]');
    const graph = parseData(document);
    if (!host || !graph || host.dataset.trEngineeringGraphEnhanced === 'true') return false;

    const fallback = host.querySelector('[data-tr-engineering-graph-fallback]');
    const enhanced = create('div', 'tr-engineering-graph is-enhanced');
    const toolbar = create('div', 'tr-engineering-graph__toolbar');
    toolbar.setAttribute('aria-label', 'Фильтр Engineering Map');
    const shell = create('div', 'tr-engineering-graph__shell');
    const stage = create('div', 'tr-engineering-graph__stage');
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('tr-engineering-graph__edges');
    svg.setAttribute('aria-hidden', 'true');
    const detail = create('aside', 'tr-engineering-graph__detail');
    detail.setAttribute('aria-live', 'polite');

    const nodesById = new Map();
    const edges = [];
    let activeFilter = 'all';
    let selectedId = null;

    function renderDetail(node) {
      detail.replaceChildren();
      detail.append(create('span', 'tr-engineering-graph__detail-kicker', node ? node.kind : 'Engineering Map'));
      detail.append(create('h2', '', node ? node.label : 'Выберите узел'));
      detail.append(create('p', '', node ? node.description : 'Фокусируйте или выбирайте узлы, чтобы увидеть их прямые связи с технологиями, доменами, проектами и заметками.'));
      if (!node) return;
      const tags = create('div', 'tr-engineering-graph__detail-tags');
      for (const tag of node.tags) tags.append(create('span', 'tr-engineering-graph__detail-tag', tag));
      detail.append(tags);
      if (node.href) {
        const link = create('a', 'tr-engineering-graph__detail-link', 'Открыть связанный материал →');
        link.href = node.href;
        detail.append(link);
      }
    }

    function isVisible(node) {
      return activeFilter === 'all' || node.tags.includes(activeFilter);
    }

    function updateSelection(id) {
      selectedId = id;
      const neighbors = new Set();
      for (const edge of graph.edges) {
        if (edge.from === id) neighbors.add(edge.to);
        if (edge.to === id) neighbors.add(edge.from);
      }
      for (const [nodeId, element] of nodesById) {
        element.classList.toggle('is-selected', nodeId === id);
        element.classList.toggle('is-neighbor', neighbors.has(nodeId));
      }
      for (const edge of edges) {
        edge.element.classList.toggle('is-related', edge.from === id || edge.to === id);
      }
      renderDetail(graph.nodes.find((node) => node.id === id) || null);
    }

    function updateFilter(filter) {
      activeFilter = filter;
      for (const button of toolbar.querySelectorAll('.tr-engineering-graph__filter')) {
        button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
      }
      for (const node of graph.nodes) {
        nodesById.get(node.id)?.classList.toggle('is-filtered-out', !isVisible(node));
      }
      for (const edge of edges) {
        const from = graph.nodes.find((node) => node.id === edge.from);
        const to = graph.nodes.find((node) => node.id === edge.to);
        edge.element.classList.toggle('is-filtered-out', !isVisible(from) || !isVisible(to));
      }
      if (selectedId && !isVisible(graph.nodes.find((node) => node.id === selectedId))) {
        selectedId = null;
        for (const element of nodesById.values()) element.classList.remove('is-selected', 'is-neighbor');
        for (const edge of edges) edge.element.classList.remove('is-related');
        renderDetail(null);
      }
    }

    const filters = [{id:'all', label:'Все'}, ...graph.filters];
    for (const filter of filters) {
      const button = create('button', 'tr-engineering-graph__filter', filter.label);
      button.type = 'button';
      button.dataset.filter = filter.id;
      button.setAttribute('aria-pressed', String(filter.id === 'all'));
      button.addEventListener('click', () => updateFilter(filter.id));
      toolbar.append(button);
    }

    stage.append(svg);
    for (const node of graph.nodes) {
      const element = create(node.href ? 'a' : 'button', 'tr-engineering-graph__node');
      if (!node.href) element.type = 'button';
      if (node.href) element.href = node.href;
      element.dataset.nodeId = node.id;
      element.dataset.kind = node.kind;
      element.style.gridColumn = String(node.column);
      element.style.gridRow = String(node.row);
      element.append(create('span', 'tr-engineering-graph__node-kind', node.kind));
      element.append(create('span', 'tr-engineering-graph__node-label', node.label));
      element.addEventListener('focus', () => updateSelection(node.id));
      element.addEventListener('mouseenter', () => updateSelection(node.id));
      element.addEventListener('click', (event) => {
        if (!node.href) event.preventDefault();
        updateSelection(node.id);
      });
      nodesById.set(node.id, element);
      stage.append(element);
    }

    for (const edge of graph.edges) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.classList.add('tr-engineering-graph__edge');
      path.dataset.from = edge.from;
      path.dataset.to = edge.to;
      svg.append(path);
      edges.push({from:edge.from, to:edge.to, element:path});
    }

    function renderEdges() {
      if (!stage.isConnected || root.innerWidth <= 980) return;
      const stageRect = stage.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
      for (const edge of edges) {
        const fromRect = nodesById.get(edge.from)?.getBoundingClientRect();
        const toRect = nodesById.get(edge.to)?.getBoundingClientRect();
        if (!fromRect || !toRect) continue;
        const x1 = fromRect.left - stageRect.left + fromRect.width / 2;
        const y1 = fromRect.top - stageRect.top + fromRect.height / 2;
        const x2 = toRect.left - stageRect.left + toRect.width / 2;
        const y2 = toRect.top - stageRect.top + toRect.height / 2;
        const midY = (y1 + y2) / 2;
        edge.element.setAttribute('d', `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`);
      }
    }

    shell.append(stage, detail);
    enhanced.append(toolbar, shell);
    host.append(enhanced);
    if (fallback) enhanced.prepend(fallback);
    host.dataset.trEngineeringGraphEnhanced = 'true';
    renderDetail(null);

    let resizeScheduled = false;
    root.addEventListener('resize', () => {
      if (resizeScheduled) return;
      resizeScheduled = true;
      root.requestAnimationFrame(() => { resizeScheduled = false; renderEdges(); });
    });
    root.requestAnimationFrame(() => root.requestAnimationFrame(renderEdges));
    return true;
  }

  function scheduleMount() {
    const document = root.document;
    const attempt = () => mountGraph(document);
    root.setTimeout(() => root.requestAnimationFrame?.(() => root.requestAnimationFrame(attempt)), 80);
    if (typeof root.MutationObserver === 'function' && document.documentElement) {
      const observer = new root.MutationObserver(() => attempt());
      observer.observe(document.documentElement, {childList:true, subtree:true});
      root.setTimeout(() => observer.disconnect(), 2500);
    }
  }

  if (!root.document) return;
  if (root.document.readyState === 'complete') scheduleMount();
  else root.addEventListener('load', scheduleMount, {once:true});
})(typeof window !== 'undefined' ? window : globalThis);
