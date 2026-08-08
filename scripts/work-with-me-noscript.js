import {parse} from 'parse5';

const WORK_PAGES = Object.freeze([
  Object.freeze({path: 'landing/work-with-me.html', locale: 'ru'}),
  Object.freeze({path: 'en/work-with-me.html', locale: 'en'}),
]);

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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readState(documentHtml) {
  const parsed = parse(documentHtml);
  const stateScript = findNode(parsed, (node) => node.nodeName === 'script' && getAttribute(node, 'id') === 'diplodoc-state');
  const textNode = stateScript?.childNodes?.find((node) => node.nodeName === '#text');
  if (!textNode?.value) throw new Error('Diplodoc state is missing for Work with me no-JS fallback.');
  const state = decodeDiplodocState(textNode.value.trim());
  if (typeof state?.data?.html !== 'string' || typeof state?.title !== 'string' || !state.title.trim()) {
    throw new Error('Diplodoc state is incomplete for Work with me no-JS fallback.');
  }
  return state;
}

function removeBoundedCollaborationFallbacks(documentHtml) {
  return String(documentHtml).replace(
    /\s*<noscript\s+data-tr-collaboration-noscript="[^"]+">[\s\S]*?<\/noscript>/gi,
    '',
  );
}

export function injectWorkWithMeNoJavaScriptFallback(documentHtml, {locale}) {
  if (!['ru', 'en'].includes(locale)) throw new Error(`unsupported Work with me fallback locale: ${locale}`);
  const marker = `data-tr-work-with-me-fallback="${locale}"`;
  if (documentHtml.includes(marker)) return documentHtml;

  const state = readState(documentHtml);
  const cleaned = removeBoundedCollaborationFallbacks(documentHtml);
  const rootPattern = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
  if (!rootPattern.test(cleaned)) throw new Error(`Work with me ${locale} root host is missing.`);

  const fallback = `<noscript ${marker}><main class="tr-work-with-me-noscript" data-tr-work-with-me-semantic="true" lang="${locale}"><h1>${escapeHtml(state.title)}</h1>${state.data.html}</main></noscript>`;
  return cleaned.replace(rootPattern, (rootHost) => `${rootHost}\n${fallback}`);
}

export function workWithMeNoJavaScriptTargets() {
  return WORK_PAGES.map((target) => ({...target}));
}
