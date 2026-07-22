import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {transformGeneratedContent} from './diplodoc-state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

export const DEFAULT_SOURCES_PATH = path.join(ROOT, 'data', 'sources.json');

export const SOURCE_TYPE_VALUES = Object.freeze([
  'article',
  'documentation',
  'book',
  'course',
  'talk',
  'blog',
  'paper',
  'other',
]);

const SOURCE_TYPE_SET = new Set(SOURCE_TYPE_VALUES);
const SOURCE_TYPE_LABELS = Object.freeze({
  article: 'Статья',
  documentation: 'Документация',
  book: 'Книга',
  course: 'Курс',
  talk: 'Доклад',
  blog: 'Блог',
  paper: 'Исследование',
  other: 'Другое',
});
const SOURCE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function requiredString(source, field) {
  const value = source?.[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`source entry is missing required field: ${field}`);
  }
  return value.trim();
}

function optionalString(source, field) {
  const value = source?.[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`source field ${field} must be a non-empty string for ${source.id || '<unknown>'}`);
  }
  return value.trim();
}

function validateDate(source, field) {
  const value = source?.[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !ISO_DATE.test(value)) {
    throw new Error(`invalid ${field} date for ${source.id}: ${value}`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`invalid ${field} date for ${source.id}: ${value}`);
  }
  return value;
}

function validateUrl(source) {
  let parsed;
  try {
    parsed = new URL(source.url);
  } catch {
    throw new Error(`invalid source url for ${source.id}: ${source.url}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`invalid source url for ${source.id}: ${source.url}`);
  }
  return source.url;
}

function normalizeStringArray(source, field, {required = false} = {}) {
  const value = source?.[field];
  if (value === undefined && !required) return [];
  if (!Array.isArray(value) || (required && value.length === 0)) {
    const qualifier = required ? 'non-empty ' : '';
    throw new Error(`${field} must be a ${qualifier}array for ${source.id || '<unknown>'}`);
  }
  const normalized = value.map((entry) => {
    if (typeof entry !== 'string' || entry.trim() === '') {
      throw new Error(`${field} must contain non-empty strings for ${source.id || '<unknown>'}`);
    }
    return entry.trim();
  });
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${field} must not contain duplicates for ${source.id || '<unknown>'}`);
  }
  return normalized;
}

function normalizeSummary(source) {
  const {summary} = source;
  if (typeof summary === 'string') {
    if (summary.trim() === '') throw new Error(`summary must be non-empty for ${source.id}`);
    return [summary.trim()];
  }
  if (!Array.isArray(summary) || summary.length === 0) {
    throw new Error(`summary must be a non-empty string or array for ${source.id}`);
  }
  return summary.map((entry) => {
    if (typeof entry !== 'string' || entry.trim() === '') {
      throw new Error(`summary must contain non-empty strings for ${source.id}`);
    }
    return entry.trim();
  });
}

export function validateSourcesRegistry(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !Array.isArray(raw.sources) || raw.sources.length === 0) {
    throw new Error('sources registry must be an object with a non-empty sources array.');
  }

  const ids = new Set();
  const urls = new Set();

  const sources = raw.sources.map((source) => {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      throw new Error('source entries must be objects.');
    }

    const id = requiredString(source, 'id');
    if (!SOURCE_ID.test(id)) throw new Error(`invalid source id: ${id}`);
    if (ids.has(id)) throw new Error(`duplicate source id: ${id}`);
    ids.add(id);

    const title = requiredString(source, 'title');
    const url = requiredString(source, 'url');
    validateUrl({id, url});
    if (urls.has(url)) throw new Error(`duplicate source url: ${url}`);
    urls.add(url);

    const sourceType = requiredString(source, 'sourceType');
    if (!SOURCE_TYPE_SET.has(sourceType)) {
      throw new Error(`unsupported source type for ${id}: ${sourceType}`);
    }

    const publisher = requiredString(source, 'publisher');
    const topics = normalizeStringArray({...source, id}, 'topics', {required: true});
    const summary = normalizeSummary({...source, id});
    const related = normalizeStringArray({...source, id}, 'related');
    const added = validateDate({...source, id}, 'added');
    const published = validateDate({...source, id}, 'published');
    const author = optionalString({...source, id}, 'author');
    const language = optionalString({...source, id}, 'language');
    const notes = optionalString({...source, id}, 'notes');

    return {
      id,
      title,
      url,
      sourceType,
      publisher,
      topics,
      summary,
      related,
      ...(added ? {added} : {}),
      ...(published ? {published} : {}),
      ...(author ? {author} : {}),
      ...(language ? {language} : {}),
      ...(notes ? {notes} : {}),
    };
  });

  for (const source of sources) {
    for (const relatedId of source.related) {
      if (relatedId === source.id) throw new Error(`source ${source.id} cannot relate to itself`);
      if (!ids.has(relatedId)) throw new Error(`unknown related source for ${source.id}: ${relatedId}`);
    }
  }

  return sources;
}

export function loadSourcesRegistry(manifestPath = DEFAULT_SOURCES_PATH) {
  if (!fs.existsSync(manifestPath)) throw new Error(`sources registry not found: ${manifestPath}`);
  return validateSourcesRegistry(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
}

export function sortSources(sources) {
  return sources
    .map((source, index) => ({source, index}))
    .sort((left, right) => {
      const leftDate = left.source.added;
      const rightDate = right.source.added;
      if (leftDate && rightDate && leftDate !== rightDate) return rightDate.localeCompare(leftDate);
      if (leftDate && !rightDate) return -1;
      if (!leftDate && rightDate) return 1;
      return left.index - right.index;
    })
    .map(({source}) => source);
}

function renderSummary(source) {
  const items = source.summary.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  if (source.summary.length > 3) {
    return `<details class="tr-source-card__summary">
  <summary>Краткое резюме · ${source.summary.length} пунктов</summary>
  <ul>${items}</ul>
</details>`;
  }
  return `<div class="tr-source-card__summary"><ul>${items}</ul></div>`;
}

function renderRelated(source, sourceById) {
  if (source.related.length === 0) return '';
  const links = source.related.map((id) => {
    const related = sourceById.get(id);
    return `<li><a href="#source-${escapeHtml(id)}">${escapeHtml(related.title)}</a></li>`;
  }).join('');
  return `<div class="tr-source-card__related"><strong>Связанные материалы</strong><ul>${links}</ul></div>`;
}

function buildTopicCounts(sources) {
  const counts = new Map();
  for (const source of sources) {
    for (const topic of source.topics) counts.set(topic, (counts.get(topic) || 0) + 1);
  }
  return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right, 'ru'));
}

export function renderSourcesKnowledgeBase(sources) {
  const ordered = sortSources(sources);
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const topics = buildTopicCounts(sources);
  const usedTypes = SOURCE_TYPE_VALUES.filter((type) => sources.some((source) => source.sourceType === type));

  const topicOptions = topics
    .map(([topic, count]) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)} (${count})</option>`)
    .join('');
  const typeOptions = usedTypes
    .map((type) => `<option value="${type}">${SOURCE_TYPE_LABELS[type]}</option>`)
    .join('');
  const topicCounters = topics
    .map(([topic, count]) => `<span class="tr-sources__topic-count"><span>${escapeHtml(topic)}</span><strong>${count}</strong></span>`)
    .join('');

  const cards = ordered.map((source) => {
    const topicsHtml = source.topics.map((topic) => `<span class="tr-source-card__topic">${escapeHtml(topic)}</span>`).join('');
    const searchText = [source.title, source.publisher, ...source.topics, ...source.summary].join(' ').toLocaleLowerCase('ru-RU');
    const dateHtml = source.added ? `<time datetime="${source.added}">Добавлено ${escapeHtml(source.added)}</time>` : '';
    const notesHtml = source.notes ? `<p class="tr-source-card__notes">${escapeHtml(source.notes)}</p>` : '';

    return `<article id="source-${escapeHtml(source.id)}" class="tr-source-card" data-tr-source data-tr-source-type="${source.sourceType}" data-tr-source-topics="${escapeHtml(source.topics.join('|'))}" data-tr-source-search="${escapeHtml(searchText)}">
  <div class="tr-source-card__meta">
    <span>${escapeHtml(source.publisher)}</span>
    <span>${SOURCE_TYPE_LABELS[source.sourceType]}</span>
    ${dateHtml}
  </div>
  <h2><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a></h2>
  <div class="tr-source-card__topics" aria-label="Темы">${topicsHtml}</div>
  ${renderSummary(source)}
  ${notesHtml}
  ${renderRelated(source, sourceById)}
  <a class="tr-source-card__external" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Открыть источник ↗</a>
</article>`;
  }).join('\n');

  return `<section class="tr-sources" data-tr-sources-root>
  <div class="tr-sources__summary" aria-label="Статистика базы источников">
    <p><strong data-tr-sources-total>${sources.length}</strong> источников · <strong>${topics.length}</strong> тем</p>
    <div class="tr-sources__topic-counts">${topicCounters}</div>
  </div>
  <div class="tr-sources__controls" data-tr-sources-controls>
    <label class="tr-sources__field">Поиск по базе
      <input type="search" autocomplete="off" placeholder="Название, резюме, источник или тема" data-tr-sources-query>
    </label>
    <label class="tr-sources__field">Тема
      <select data-tr-sources-topic><option value="">Все темы</option>${topicOptions}</select>
    </label>
    <label class="tr-sources__field">Тип
      <select data-tr-sources-type><option value="">Все типы</option>${typeOptions}</select>
    </label>
    <button type="button" class="tr-sources__clear" data-tr-sources-clear>Сбросить</button>
  </div>
  <p class="tr-sources__result-count" aria-live="polite" data-tr-sources-count>Показано: ${sources.length} из ${sources.length}</p>
  <div class="tr-sources__list" data-tr-sources-list>
${cards}
  </div>
</section>`;
}

export function applySourcesKnowledgeBase(outputDir, sources) {
  const relativePath = path.join('landing', 'bibliography.html');
  const htmlPath = path.join(outputDir, relativePath);
  if (!fs.existsSync(htmlPath)) throw new Error('generated bibliography page not found: landing/bibliography.html');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const marker = /<div[^>]*data-tr-sources-placeholder(?:=["'][^"']*["'])?[^>]*>\s*<\/div>/i;
  const content = renderSourcesKnowledgeBase(sources);
  const transformed = transformGeneratedContent(
    html,
    (contentHtml) => marker.test(contentHtml) ? contentHtml.replace(marker, content) : contentHtml,
    'Sources Knowledge Base',
  );

  if (!transformed.source) {
    throw new Error('Sources Knowledge Base placeholder not found in rendered DOM or Diplodoc state payload.');
  }
  fs.writeFileSync(htmlPath, transformed.html, 'utf8');
  return relativePath.replaceAll(path.sep, '/');
}
