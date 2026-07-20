(function initSignatureExperience(root) {
  'use strict';

  function parseGraphData(container) {
    const node = container.querySelector('[data-tr-engineering-graph-data]');
    if (!node) return [];
    try {
      const parsed = JSON.parse(node.textContent || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Engineering Graph data could not be parsed.', error);
      return [];
    }
  }

  function createLink(document, link) {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = `${link.label} →`;
    return anchor;
  }

  function setupEngineeringGraph(document) {
    const container = document.querySelector('[data-tr-engineering-graph]');
    if (!container) return;

    const topics = parseGraphData(container);
    if (!topics.length) return;

    const byId = new Map(topics.map((topic) => [topic.id, topic]));
    const buttons = [...container.querySelectorAll('[data-tr-graph-topic]')];
    const title = container.querySelector('[data-tr-graph-title]');
    const description = container.querySelector('[data-tr-graph-description]');
    const links = container.querySelector('[data-tr-graph-links]');
    if (!buttons.length || !title || !description || !links) return;

    function selectTopic(id, {focus = false} = {}) {
      const topic = byId.get(id);
      if (!topic) return;

      for (const button of buttons) {
        const active = button.dataset.trGraphTopic === id;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        if (active && focus) button.focus();
      }

      title.textContent = topic.label;
      description.textContent = topic.description;
      links.replaceChildren(...topic.links.map((link) => createLink(document, link)));
    }

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => selectTopic(button.dataset.trGraphTopic));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = buttons.length - 1;
        selectTopic(buttons[nextIndex].dataset.trGraphTopic, {focus: true});
      });
    });

    container.classList.add('is-enhanced');
  }

  function init() {
    setupEngineeringGraph(root.document);
  }

  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this));
