import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {parse, parseFragment, serialize} from 'parse5';
import * as utils from 'parse5-utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_MANIFEST = path.join(ROOT, 'data', 'engineering-graph.json');
const ALLOWED_KINDS = new Set(['technology', 'domain', 'project', 'note']);
const ALLOWED_TAGS = new Set(['backend', 'ai', 'reliability', 'gamedev']);
const KIND_ORDER = ['technology', 'domain', 'project', 'note'];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
  return value.trim();
}

function assertSafeHref(href) {
  if (href === undefined) return;
  const value = requireText(href, 'node href');
  if (value.startsWith('/') || value.includes('\\') || value.includes('..') || /^[a-z]+:/i.test(value)) {
    throw new Error(`Unsafe engineering graph href: ${value}`);
  }
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized.startsWith('../')) throw new Error(`Unsafe engineering graph href: ${value}`);
}

export function validateEngineeringGraph(raw) {
  if (!raw || !Array.isArray(raw.nodes) || raw.nodes.length < 2) throw new Error('Engineering graph must contain at least two nodes.');
  if (!Array.isArray(raw.edges) || raw.edges.length === 0) throw new Error('Engineering graph must contain edges.');
  if (!Array.isArray(raw.filters) || raw.filters.length === 0) throw new Error('Engineering graph must contain filters.');

  const filterIds = new Set();
  const filters = raw.filters.map((filter) => {
    const id = requireText(filter.id, 'filter id');
    const label = requireText(filter.label, 'filter label');
    if (!ALLOWED_TAGS.has(id)) throw new Error(`Unsupported engineering graph filter: ${id}`);
    if (filterIds.has(id)) throw new Error(`Duplicate engineering graph filter: ${id}`);
    filterIds.add(id);
    return {id, label};
  });

  const ids = new Set();
  const nodes = raw.nodes.map((node) => {
    const id = requireText(node.id, 'node id');
    const label = requireText(node.label, 'node label');
    const kind = requireText(node.kind, 'node kind');
    const description = requireText(node.description, 'node description');
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error(`Unsafe engineering graph node id: ${id}`);
    if (ids.has(id)) throw new Error(`Duplicate engineering graph node id: ${id}`);
    if (!ALLOWED_KINDS.has(kind)) throw new Error(`Unsupported engineering graph node kind: ${kind}`);
    if (!Number.isInteger(node.column) || node.column < 1 || node.column > 5) throw new Error(`Invalid column for node ${id}.`);
    if (!Number.isInteger(node.row) || node.row < 1 || node.row > 9) throw new Error(`Invalid row for node ${id}.`);
    if (!Array.isArray(node.tags) || node.tags.length === 0) throw new Error(`Node ${id} must have tags.`);
    const tags = [...new Set(node.tags.map((tag) => requireText(tag, `tag for ${id}`)))];
    for (const tag of tags) {
      if (!ALLOWED_TAGS.has(tag)) throw new Error(`Unsupported engineering graph tag ${tag} for ${id}.`);
    }
    assertSafeHref(node.href);
    ids.add(id);
    return {
      id, label, kind, description, column: node.column, row: node.row, tags,
      ...(node.href ? {href: node.href} : {}),
    };
  });

  const edgeKeys = new Set();
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  const edges = raw.edges.map((edge) => {
    const from = requireText(edge.from, 'edge from');
    const to = requireText(edge.to, 'edge to');
    const label = requireText(edge.label, 'edge label');
    if (!ids.has(from) || !ids.has(to)) throw new Error(`Engineering graph edge references missing node: ${from} -> ${to}`);
    if (from === to) throw new Error(`Engineering graph self-edge is not allowed: ${from}`);
    const key = `${from}->${to}`;
    if (edgeKeys.has(key)) throw new Error(`Duplicate engineering graph edge: ${key}`);
    edgeKeys.add(key);
    degree.set(from, degree.get(from) + 1);
    degree.set(to, degree.get(to) + 1);
    return {from, to, label};
  });

  const orphan = [...degree.entries()].find(([, count]) => count === 0);
  if (orphan) throw new Error(`Orphan engineering graph node: ${orphan[0]}`);

  return {filters, nodes, edges};
}

export function loadEngineeringGraph(manifestPath = DEFAULT_MANIFEST) {
  return validateEngineeringGraph(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
}

export function renderEngineeringGraphFallback(graph) {
  const groups = KIND_ORDER.map((kind) => {
    const nodes = graph.nodes.filter((node) => node.kind === kind);
    if (!nodes.length) return '';
    const items = nodes.map((node) => {
      const label = node.href
        ? `<a href="${escapeHtml(node.href)}">${escapeHtml(node.label)}</a>`
        : `<strong>${escapeHtml(node.label)}</strong>`;
      return `<li>${label}<span>${escapeHtml(node.description)}</span></li>`;
    }).join('');
    return `<section class="tr-engineering-graph-fallback__group"><h2>${escapeHtml(kind)}</h2><ul>${items}</ul></section>`;
  }).join('');

  return `<div class="tr-engineering-graph-fallback" data-tr-engineering-graph-fallback>${groups}</div>`;
}

function findNode(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes ?? []) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

function hasAttribute(node, name) {
  return node.attrs?.some((attribute) => attribute.name === name) ?? false;
}

function removeGraphDataScripts(node) {
  if (!node.childNodes) return;
  node.childNodes = node.childNodes.filter((child) => !(child.nodeName === 'script' && hasAttribute(child, 'data-tr-engineering-graph-data')));
  for (const child of node.childNodes) removeGraphDataScripts(child);
}

export function injectEngineeringGraph(html, graph) {
  const parsed = parse(html);
  const root = findNode(parsed, (node) => hasAttribute(node, 'data-tr-engineering-graph-root'));
  const head = findNode(parsed, (node) => node.nodeName === 'head');
  if (!root || !head) throw new Error('Engineering graph host/head not found in generated HTML.');

  const fallback = parseFragment(renderEngineeringGraphFallback(graph));
  root.childNodes = fallback.childNodes ?? [];
  for (const child of root.childNodes) child.parentNode = root;
  utils.setAttribute(root, 'data-tr-engineering-graph-build', 'ready');

  removeGraphDataScripts(parsed);
  const script = utils.createNode('script');
  utils.setAttribute(script, 'type', 'application/json');
  utils.setAttribute(script, 'data-tr-engineering-graph-data', '');
  const safeJson = JSON.stringify(graph).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e');
  utils.append(script, utils.createTextNode(safeJson));
  utils.append(head, script);

  return serialize(parsed);
}

export function applyEngineeringGraph(outputDir, graph, target = 'landing/engineering-map.html') {
  const targetPath = path.join(outputDir, ...target.split('/'));
  if (!fs.existsSync(targetPath)) throw new Error(`Engineering graph target does not exist: ${target}`);
  const html = fs.readFileSync(targetPath, 'utf8');
  fs.writeFileSync(targetPath, injectEngineeringGraph(html, graph), 'utf8');
  return target;
}
