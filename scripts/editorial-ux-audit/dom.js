import { parse } from 'parse5';
import { classifyRoute, normalizeRoute } from './core.js';

const clean = (value = '') => value.replace(/\s+/gu, ' ').trim();
const wordCount = (value = '') => clean(value) ? clean(value).split(/\s+/u).length : 0;
const attribute = (node, name) => node.attrs?.find((item) => item.name === name)?.value ?? '';

function content(node) {
  if (!node) return '';
  if (node.nodeName === '#text') return node.value ?? '';
  if (['script', 'style', 'template', 'svg'].includes(node.tagName)) return '';
  return (node.childNodes ?? []).map(content).join(' ');
}

function first(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes ?? []) {
    const match = first(child, predicate);
    if (match) return match;
  }
  return null;
}

function actionContext(node) {
  return attribute(node, 'class').split(/\s+/u).some((token) =>
    token.toLowerCase().split(/[-_]/u).some((part) =>
      ['action', 'actions', 'cta', 'button', 'btn'].includes(part)
    )
  );
}

function internalLink(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (!href.startsWith('http://') && !href.startsWith('https://')) return true;
  try { return new URL(href).origin === 'https://trueruslan.ru'; } catch { return false; }
}

export function extractPageMetrics(html, route) {
  const document = parse(html);
  const main = first(document, (node) => node.tagName === 'main');
  if (!main) throw new Error(`Generated page ${route} has no <main> element`);

  const title = first(document, (node) => node.tagName === 'title');
  const paragraphs = [];
  const listItems = [];
  const headings = [];
  let internalLinkCount = 0;
  let actionLinkCount = 0;

  function walk(node, insideAction = false) {
    if (['script', 'style', 'template', 'svg'].includes(node.tagName)) return;
    const action = insideAction || actionContext(node);
    const value = clean(content(node));
    if (node.tagName === 'p' && value) paragraphs.push(value);
    if (node.tagName === 'li' && value) listItems.push(value);
    if (['h1', 'h2', 'h3'].includes(node.tagName)) headings.push([node.tagName, value]);
    if (node.tagName === 'a') {
      if (internalLink(attribute(node, 'href'))) internalLinkCount += 1;
      if (action) actionLinkCount += 1;
    }
    for (const child of node.childNodes ?? []) walk(child, action);
  }

  walk(main);
  const pWords = paragraphs.map(wordCount);
  const liWords = listItems.map(wordCount);
  const path = normalizeRoute(route);

  return {
    route: path,
    locale: path.startsWith('/en/') ? 'en' : 'ru',
    tier: classifyRoute(path),
    title: clean(content(title)),
    h1: headings.find(([level]) => level === 'h1')?.[1] ?? '',
    wordCount: [...pWords, ...liWords].reduce((sum, count) => sum + count, 0),
    paragraphCount: paragraphs.length,
    firstParagraphWords: pWords[0] ?? 0,
    longestParagraphWords: pWords.length ? Math.max(...pWords) : 0,
    headingCount: headings.length,
    listItemCount: listItems.length,
    internalLinkCount,
    actionLinkCount,
    counterpartRoute: null,
    counterpartPresent: false,
    warnings: [],
    __proseText: [...paragraphs, ...listItems].join(' ')
  };
}
