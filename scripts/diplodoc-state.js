import {parse, serialize} from 'parse5';

function findNode(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes ?? []) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? null;
}

function decodeDiplodocState(raw) {
  return JSON.parse(raw.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'));
}

function encodeDiplodocState(state) {
  return JSON.stringify(state).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function readGeneratedContentState(documentHtml, label = 'generated content') {
  const parsed = parse(documentHtml);
  const stateScript = findNode(parsed, (node) => node.nodeName === 'script' && getAttribute(node, 'id') === 'diplodoc-state');
  const textNode = stateScript?.childNodes?.find((node) => node.nodeName === '#text');
  if (!textNode?.value) return null;

  let state;
  try {
    state = decodeDiplodocState(textNode.value.trim());
  } catch (error) {
    throw new Error(`${label} contains invalid Diplodoc state: ${error.message}`);
  }
  if (typeof state?.data?.html !== 'string') return null;
  return {state, html: state.data.html};
}

export function transformGeneratedContent(documentHtml, transform, label = 'generated content') {
  const direct = transform(documentHtml, {source: 'document'});
  if (typeof direct !== 'string') throw new Error(`${label} transform must return a string.`);
  if (direct !== documentHtml) return {html: direct, source: 'document'};

  const parsed = parse(documentHtml);
  const stateScript = findNode(parsed, (node) => node.nodeName === 'script' && getAttribute(node, 'id') === 'diplodoc-state');
  const textNode = stateScript?.childNodes?.find((node) => node.nodeName === '#text');
  if (!textNode?.value) return {html: documentHtml, source: null};

  const state = decodeDiplodocState(textNode.value.trim());
  if (typeof state?.data?.html !== 'string') return {html: documentHtml, source: null};

  const transformed = transform(state.data.html, {source: 'diplodoc-state', state});
  if (typeof transformed !== 'string') throw new Error(`${label} transform must return a string.`);
  if (transformed === state.data.html) return {html: documentHtml, source: null};

  state.data.html = transformed;
  textNode.value = `\n            ${encodeDiplodocState(state)}\n        `;
  return {html: serialize(parsed), source: 'diplodoc-state'};
}
