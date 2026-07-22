import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {validateSourcesRegistry} from './sources-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_BIBLIOGRAPHY_PATH = path.join(ROOT, 'docs', 'landing', 'bibliography.md');

const CYRILLIC = Object.freeze({
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
});

const TOPIC_LABELS = Object.freeze({
  'БД': 'Базы данных',
  'Postgres': 'PostgreSQL',
  'Инфра': 'Инфраструктура',
  'СУБД': 'Базы данных',
  'ЧистыйКод': 'Чистый код',
  'Тестирование': 'Тестирование',
});

function transliterate(value) {
  return [...String(value).toLocaleLowerCase('ru-RU')]
    .map((char) => CYRILLIC[char] ?? char)
    .join('');
}

function slugify(value) {
  return transliterate(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function createStableId(title, url) {
  const titleSlug = slugify(title).slice(0, 64).replace(/-+$/g, '') || 'source';
  const segments = new URL(url).pathname.split('/').filter(Boolean);
  const numericSuffix = [...segments].reverse().find((segment) => /^\d+$/.test(segment));
  const suffix = numericSuffix || stableHash(url);
  return `${titleSlug}-${suffix}`;
}

function normalizeTopics(raw) {
  const matches = [...String(raw).matchAll(/#([^\s#]+)/g)].map((match) => match[1]);
  if (matches.length === 0) throw new Error(`bibliography row must contain at least one tag: ${raw}`);
  return [...new Set(matches.map((tag) => TOPIC_LABELS[tag] || tag))];
}

function normalizeSummary(raw) {
  const parts = String(raw)
    .split(/<br\s*\/?\s*>/i)
    .map((part) => part.trim().replace(/^[•·-]\s*/, '').trim())
    .filter(Boolean);
  if (parts.length === 0) throw new Error('bibliography row must contain a non-empty summary');
  return parts;
}

function parseLink(raw, legacyId) {
  const match = String(raw).match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
  if (!match) throw new Error(`invalid bibliography link for row ${legacyId}: ${raw}`);
  const [, label, url] = match;
  const normalizedLabel = label.trim().toLocaleLowerCase('ru-RU');
  const sourceType = normalizedLabel === 'блог' ? 'blog' : normalizedLabel === 'статья' ? 'article' : 'other';
  return {url, sourceType};
}

export function parseBibliographyMarkdown(markdown) {
  if (typeof markdown !== 'string' || markdown.trim() === '') {
    throw new Error('bibliography markdown must be a non-empty string');
  }

  const rows = markdown.split(/\r?\n/).filter((line) => /^\|\s*\d+\s*\|/.test(line));
  if (rows.length === 0) throw new Error('bibliography markdown contains no data rows');

  const sources = rows.map((line) => {
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 6) throw new Error(`invalid bibliography row shape: ${line}`);

    const [legacyId, title, publisherCell, linkCell, tagsCell, summaryCell] = cells;
    if (!/^\d+$/.test(legacyId)) throw new Error(`invalid bibliography id: ${legacyId}`);
    if (!title) throw new Error(`bibliography row ${legacyId} is missing title`);

    const publisher = publisherCell.replace(/^#/, '').trim();
    if (!publisher) throw new Error(`bibliography row ${legacyId} is missing publisher`);

    const {url, sourceType} = parseLink(linkCell, legacyId);
    return {
      id: createStableId(title, url),
      title,
      url,
      sourceType,
      publisher,
      topics: normalizeTopics(tagsCell),
      summary: normalizeSummary(summaryCell),
      related: [],
    };
  });

  return {sources: validateSourcesRegistry({sources})};
}

export function migrateBibliographyFile(inputPath = DEFAULT_BIBLIOGRAPHY_PATH) {
  return parseBibliographyMarkdown(fs.readFileSync(inputPath, 'utf8'));
}

function main() {
  try {
    process.stdout.write(`${JSON.stringify(migrateBibliographyFile(), null, 2)}\n`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
