import path from 'node:path';

import {parse, parseFragment, serialize} from 'parse5';

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name) ?? null;
}

function setAttribute(node, name, value) {
  const existing = getAttribute(node, name);
  if (existing) existing.value = value;
  else node.attrs = [...(node.attrs ?? []), {name, value}];
}

function normalizeBundleReference(value) {
  return value.replace(/^(?:\.\.\/)+(_bundle\/)/, '$1');
}

function findNode(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes ?? []) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

function hasResource(document, tagName, attributeName, expectedValue) {
  return Boolean(findNode(document, (node) => (
    node.tagName === tagName && getAttribute(node, attributeName)?.value === expectedValue
  )));
}

function appendFragmentChildren(parent, html) {
  const fragment = parseFragment(html);
  for (const child of fragment.childNodes ?? []) {
    child.parentNode = parent;
    parent.childNodes = [...(parent.childNodes ?? []), child];
  }
}

function injectProjectSearchResources(document) {
  const html = findNode(document, (node) => node.tagName === 'html');
  const body = findNode(document, (node) => node.tagName === 'body');
  const head = findNode(document, (node) => node.tagName === 'head');
  if (!html || !body || !head) return;

  setAttribute(html, 'data-tr-search-page', 'true');
  setAttribute(body, 'data-tr-search-page', 'true');

  const stylesheet = '_assets/style/search.css';
  const script = '_assets/script/search-ui.js';

  if (!hasResource(document, 'link', 'href', stylesheet)) {
    appendFragmentChildren(head, `<link rel="stylesheet" href="${stylesheet}" data-tr-search-resource="style">`);
  }
  if (!hasResource(document, 'script', 'src', script)) {
    appendFragmentChildren(body, `<script src="${script}" defer data-tr-search-resource="script"></script>`);
  }
}

export function normalizeSearchPageHtml(html, pageRelativePath) {
  const document = parse(html);
  const searchDirectory = path.posix.dirname(pageRelativePath.replaceAll('\\', '/'));
  const seenScripts = new Set();

  function visit(node) {
    if (node.tagName === 'link') {
      const href = getAttribute(node, 'href');
      if (href) href.value = normalizeBundleReference(href.value);
    }

    if (node.tagName === 'script') {
      const src = getAttribute(node, 'src');
      if (src) {
        let normalized = normalizeBundleReference(src.value);
        if (/^[^/]+-resources\.js$/.test(normalized)) {
          normalized = `${searchDirectory}/${normalized}`;
        }
        src.value = normalized;

        if (seenScripts.has(normalized)) return false;
        seenScripts.add(normalized);
      }
    }

    if (node.childNodes) {
      node.childNodes = node.childNodes.filter((child) => visit(child));
      for (const child of node.childNodes) child.parentNode = node;
    }

    return true;
  }

  visit(document);
  injectProjectSearchResources(document);
  return serialize(document);
}
