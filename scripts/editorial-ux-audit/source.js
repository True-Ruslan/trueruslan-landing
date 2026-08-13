import { classifyRoute, normalizeRoute } from './core.js';

const normalizeText = (value = '') => value.replace(/\s+/gu, ' ').trim();
const countWords = (value = '') => normalizeText(value) ? normalizeText(value).split(/\s+/u).length : 0;

export function sourceOwnerForRoute(route) {
  const normalized = normalizeRoute(route);
  if (normalized === '/') return 'templates/index.html';
  if (normalized === '/en/') return 'templates/index.en.html';

  if (normalized.startsWith('/landing/')) {
    return `docs/${normalized.slice(1).replace(/\/$/u, '')}.md`;
  }
  if (normalized.startsWith('/en/')) {
    return `docs/en/${normalized.slice('/en/'.length).replace(/\/$/u, '')}.md`;
  }
  return `docs/landing/${normalized.slice(1).replace(/\/$/u, '')}.md`;
}

function cleanInlineMarkdown(value) {
  return normalizeText(
    value
      .replace(/!\[[^\]]*\]\([^)]*\)/gu, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
      .replace(/`([^`]+)`/gu, '$1')
      .replace(/<[^>]+>/gu, '')
      .replace(/[*_~]/gu, '')
  );
}

function isInternalMarkdownHref(href) {
  if (!href || href.startsWith('#') || /^(?:mailto:|tel:)/iu.test(href)) return false;
  if (!/^https?:\/\//iu.test(href)) return true;
  try {
    return new URL(href).origin === 'https://trueruslan.ru';
  } catch {
    return false;
  }
}

function countInternalLinks(markdown) {
  let count = 0;
  for (const match of markdown.matchAll(/(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu)) {
    if (isInternalMarkdownHref(match[1])) count += 1;
  }
  return count;
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/u, '');
}

export function extractMarkdownMetrics(markdown, route) {
  const source = stripFrontmatter(markdown);
  const lines = source.split(/\r?\n/u);
  const headings = [];
  const paragraphs = [];
  const listItems = [];
  let paragraphBuffer = [];
  let inFence = false;

  const flushParagraph = () => {
    const value = cleanInlineMarkdown(paragraphBuffer.join(' '));
    if (value) paragraphs.push(value);
    paragraphBuffer = [];
  };

  for (const line of lines) {
    if (/^\s*```/u.test(line)) {
      flushParagraph();
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^\s*\{%[\s\S]*%\}\s*$/u.test(line)) {
      flushParagraph();
      continue;
    }

    const heading = line.match(/^\s*(#{1,3})\s+(.+)$/u);
    if (heading) {
      flushParagraph();
      headings.push([heading[1].length, cleanInlineMarkdown(heading[2])]);
      continue;
    }

    const list = line.match(/^\s*(?:[-+*]|\d+\.)\s+(.+)$/u);
    if (list) {
      flushParagraph();
      const value = cleanInlineMarkdown(list[1]);
      if (value) listItems.push(value);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    if (/^\s*<[^>]+>\s*$/u.test(line)) {
      flushParagraph();
      continue;
    }

    paragraphBuffer.push(line.trim());
  }
  flushParagraph();

  const paragraphWords = paragraphs.map(countWords);
  const listWords = listItems.map(countWords);
  const normalizedRoute = normalizeRoute(route);

  return {
    route: normalizedRoute,
    locale: normalizedRoute.startsWith('/en/') ? 'en' : 'ru',
    tier: classifyRoute(normalizedRoute),
    title: headings.find(([level]) => level === 1)?.[1] ?? '',
    h1: headings.find(([level]) => level === 1)?.[1] ?? '',
    wordCount: [...paragraphWords, ...listWords].reduce((sum, count) => sum + count, 0),
    paragraphCount: paragraphs.length,
    firstParagraphWords: paragraphWords[0] ?? 0,
    longestParagraphWords: paragraphWords.length ? Math.max(...paragraphWords) : 0,
    headingCount: headings.length,
    listItemCount: listItems.length,
    internalLinkCount: countInternalLinks(source),
    actionLinkCount: 0,
    counterpartRoute: null,
    counterpartPresent: false,
    warnings: [],
    __proseText: [...paragraphs, ...listItems].join(' ')
  };
}