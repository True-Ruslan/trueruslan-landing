import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {transformGeneratedContent} from './diplodoc-state.js';
import {escapeHtml} from './project-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_NOTES_PATH = path.join(ROOT, 'data', 'notes.json');
const DEFAULT_DOCS_DIR = path.join(ROOT, 'docs');

export const NOTE_READER_SERIES = Object.freeze({
  'evidence-verification': Object.freeze({
    title: 'Evidence & Verification',
    promise: 'Разобраться, что именно доказывает каждый технический gate и где заканчивается область его evidence.',
  }),
  'ai-authority-protocols': Object.freeze({
    title: 'AI Authority & Protocol Boundaries',
    promise: 'Провести границу между вероятностным выводом модели, проверяемым протоколом и детерминированным применением изменений.',
  }),
  'static-first-web': Object.freeze({
    title: 'Static-first Web Engineering',
    promise: 'Понять, как build-time representation, browser behavior и публичная URL identity остаются воспроизводимыми без лишнего runtime.',
  }),
});

const NOTE_READER_ROLES = new Set(['start', 'path']);
const NOTE_READER_SERIES_KEYS = new Set(Object.keys(NOTE_READER_SERIES));

function isIsoDate(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function groupNotesBySeries(notes) {
  const groups = new Map();
  for (const note of notes) {
    const members = groups.get(note.series) ?? [];
    members.push(note);
    groups.set(note.series, members);
  }
  for (const members of groups.values()) members.sort((a, b) => a.seriesOrder - b.seriesOrder);
  return groups;
}

function validateReaderArchitecture(notes) {
  const groups = groupNotesBySeries(notes);

  for (const [series, members] of groups) {
    const orders = new Set();
    for (const note of members) {
      if (orders.has(note.seriesOrder)) throw new Error(`duplicate seriesOrder for ${series}: ${note.seriesOrder}`);
      orders.add(note.seriesOrder);
    }

    const ordered = [...members].sort((a, b) => a.seriesOrder - b.seriesOrder);
    ordered.forEach((note, index) => {
      if (note.seriesOrder !== index + 1) throw new Error(`non-contiguous seriesOrder for ${series}: ${note.seriesOrder}`);
    });

    const starts = members.filter((note) => note.readerRole === 'start');
    if (starts.length !== 1) throw new Error(`series ${series} must contain exactly one start note`);
    if (starts[0].seriesOrder !== 1) throw new Error(`series ${series} start note must have seriesOrder 1`);
    if (members.length < 2 || members.filter((note) => note.readerRole === 'path').length < 1) {
      throw new Error(`series ${series} must contain at least one path note`);
    }
  }
}

export function validateNotesManifest(notes, {docsDir = DEFAULT_DOCS_DIR, requireFiles = true} = {}) {
  if (!Array.isArray(notes) || notes.length === 0) throw new Error('notes manifest must be a non-empty array.');
  const slugs = new Set();

  for (const note of notes) {
    for (const field of ['slug', 'title', 'description', 'published', 'updated']) {
      if (typeof note[field] !== 'string' || note[field].trim() === '') {
        throw new Error(`note is missing required field: ${field}`);
      }
    }
    if (!/^[a-z0-9-]+$/.test(note.slug)) throw new Error(`invalid note slug: ${note.slug}`);
    if (slugs.has(note.slug)) throw new Error(`duplicate note slug: ${note.slug}`);
    slugs.add(note.slug);
    if (!isIsoDate(note.published) || !isIsoDate(note.updated)) throw new Error(`invalid note date for ${note.slug}`);
    if (note.updated < note.published) throw new Error(`note updated date precedes published date for ${note.slug}`);
    if (!Number.isInteger(note.readingMinutes) || note.readingMinutes < 1 || note.readingMinutes > 120) {
      throw new Error(`invalid readingMinutes for ${note.slug}`);
    }
    if (!Array.isArray(note.tags) || note.tags.length < 1 || note.tags.length > 6 || note.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
      throw new Error(`invalid tags for ${note.slug}`);
    }
    if (!Array.isArray(note.related) || note.related.some((slug) => typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug))) {
      throw new Error(`invalid related notes for ${note.slug}`);
    }
    if (new Set(note.related).size !== note.related.length) throw new Error(`duplicate related note for ${note.slug}`);
    if (!NOTE_READER_SERIES_KEYS.has(note.series)) throw new Error(`invalid note series for ${note.slug}: ${note.series}`);
    if (!Number.isInteger(note.seriesOrder) || note.seriesOrder < 1) throw new Error(`invalid seriesOrder for ${note.slug}`);
    if (!NOTE_READER_ROLES.has(note.readerRole)) throw new Error(`invalid readerRole for ${note.slug}: ${note.readerRole}`);
    if (requireFiles) {
      const notePath = path.join(docsDir, 'landing', 'notes', `${note.slug}.md`);
      if (!fs.existsSync(notePath)) throw new Error(`note source file not found for ${note.slug}`);
    }
  }

  for (const note of notes) {
    for (const relatedSlug of note.related) {
      if (!slugs.has(relatedSlug)) throw new Error(`related note points to unknown slug: ${relatedSlug}`);
      if (relatedSlug === note.slug) throw new Error(`note cannot relate to itself: ${note.slug}`);
    }
  }

  validateReaderArchitecture(notes);
  return notes;
}

export function loadNotesManifest(notesPath = DEFAULT_NOTES_PATH, options = {}) {
  if (!fs.existsSync(notesPath)) throw new Error(`notes manifest not found: ${notesPath}`);
  return validateNotesManifest(JSON.parse(fs.readFileSync(notesPath, 'utf8')), options);
}

export function renderNoteMeta(note) {
  return `<aside class="tr-note-meta" aria-label="Метаданные заметки">
  <span><strong>${escapeHtml(String(note.readingMinutes))} мин</strong> чтения</span>
  <span>Опубликовано <time datetime="${escapeHtml(note.published)}">${escapeHtml(note.published)}</time></span>
  <span>Обновлено <time datetime="${escapeHtml(note.updated)}">${escapeHtml(note.updated)}</time></span>
  <span class="tr-note-meta__tags">${note.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</span>
</aside>`;
}

function noteHref(slug) {
  return `landing/notes/${escapeHtml(slug)}.html`;
}

function orderedNotes(notes) {
  return [...notes].sort((a, b) => b.updated.localeCompare(a.updated) || b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));
}

function renderStartHere(notes) {
  const groups = groupNotesBySeries(notes);
  const choices = Object.entries(NOTE_READER_SERIES).map(([series, presentation]) => {
    const members = groups.get(series);
    if (!members?.length) return '';
    const start = members.find((note) => note.readerRole === 'start');
    if (!start) throw new Error(`series ${series} is missing its start note`);
    return `<article class="tr-notes-start__choice" data-tr-notes-start-choice="${escapeHtml(series)}">
  <h3>${escapeHtml(presentation.title)}</h3>
  <p>${escapeHtml(presentation.promise)}</p>
  <a class="tr-notes-start__link" href="${noteHref(start.slug)}">
    <span>${escapeHtml(start.title)}</span>
    <span>${escapeHtml(String(start.readingMinutes))} мин</span>
  </a>
</article>`;
  }).filter(Boolean).join('\n');

  return `<section class="tr-notes-start" data-tr-notes-start-here aria-labelledby="tr-notes-start-title">
  <div class="tr-notes-section-heading">
    <p class="tr-notes-section-heading__eyebrow">Reader paths</p>
    <h2 id="tr-notes-start-title">С чего начать</h2>
    <p>Выберите ближайшую задачу. Каждый маршрут начинается с одной базовой заметки и ведёт к более узким разборам.</p>
  </div>
  <div class="tr-notes-start__grid">
${choices}
  </div>
</section>`;
}

function renderGuidedSeries(notes) {
  const groups = groupNotesBySeries(notes);
  return Object.entries(NOTE_READER_SERIES).map(([series, presentation]) => {
    const members = groups.get(series);
    if (!members?.length) return '';
    const items = members.map((note) => `<li data-tr-notes-series-note="${escapeHtml(note.slug)}">
  <a href="${noteHref(note.slug)}">${escapeHtml(note.title)}</a>
  <span>${escapeHtml(String(note.readingMinutes))} мин</span>
</li>`).join('\n');
    return `<section class="tr-notes-series" data-tr-notes-series="${escapeHtml(series)}" aria-labelledby="tr-notes-series-${escapeHtml(series)}">
  <div class="tr-notes-series__heading">
    <h3 id="tr-notes-series-${escapeHtml(series)}">${escapeHtml(presentation.title)}</h3>
    <p>${escapeHtml(presentation.promise)}</p>
  </div>
  <ol class="tr-notes-series__path">
${items}
  </ol>
</section>`;
  }).filter(Boolean).join('\n');
}

function renderCatalogue(notes) {
  const cards = orderedNotes(notes).map((note) => `<article class="tr-note-index-card" data-tr-note-index-card="${escapeHtml(note.slug)}">
  <div class="tr-note-index-card__meta">
    <time datetime="${escapeHtml(note.updated)}">${escapeHtml(note.updated)}</time>
    <span>${escapeHtml(String(note.readingMinutes))} мин</span>
  </div>
  <h3><a href="${noteHref(note.slug)}">${escapeHtml(note.title)}</a></h3>
  <p>${escapeHtml(note.description)}</p>
  <div class="tr-note-index-card__tags" aria-label="Темы">${note.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
</article>`).join('\n');

  return `<section class="tr-notes-catalogue" data-tr-notes-catalogue aria-labelledby="tr-notes-catalogue-title">
  <div class="tr-notes-section-heading">
    <p class="tr-notes-section-heading__eyebrow">Archive</p>
    <h2 id="tr-notes-catalogue-title">Все заметки</h2>
    <p>Полный каталог остаётся доступен в хронологическом порядке — guided paths ничего не скрывают.</p>
  </div>
  <div class="tr-notes-catalogue__grid">
${cards}
  </div>
</section>`;
}

export function renderNotesIndex(notes) {
  validateNotesManifest(notes, {requireFiles: false});
  return `<div class="tr-notes-reader" data-tr-notes-index>
${renderStartHere(notes)}
<section class="tr-notes-guided" aria-labelledby="tr-notes-guided-title">
  <div class="tr-notes-section-heading">
    <p class="tr-notes-section-heading__eyebrow">Guided series</p>
    <h2 id="tr-notes-guided-title">Маршруты чтения</h2>
    <p>Три последовательности покрывают все текущие Engineering Notes ровно один раз и не меняют их публичную identity.</p>
  </div>
${renderGuidedSeries(notes)}
</section>
${renderCatalogue(notes)}
</div>`;
}

function injectNotesIndexNoJavaScriptFallback(html, content) {
  if (/data-tr-notes-index-noscript/i.test(html)) return html;
  const rootMarker = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
  if (!rootMarker.test(html)) {
    throw new Error('Engineering Notes index could not place the no-JavaScript fallback: #root host not found.');
  }
  const fallback = `<noscript data-tr-notes-index-noscript>
  <main class="tr-notes-index-noscript">
    <h1>Engineering Notes</h1>
    <p>Короткие инженерные разборы из реальной разработки.</p>
    ${content}
  </main>
</noscript>`;
  return html.replace(rootMarker, (rootHost) => `${rootHost}\n${fallback}`);
}

export function applyNotesIndex(outputDir, notes, target = 'landing/notes.html') {
  const relativePath = target.replaceAll('/', path.sep);
  const htmlPath = path.join(outputDir, relativePath);
  let html;
  try {
    html = fs.readFileSync(htmlPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`generated Notes index page not found: ${target}`);
    throw error;
  }

  const marker = /<div[^>]*data-tr-notes-index-placeholder(?:=["'][^"']*["'])?[^>]*>\s*<\/div>/i;
  const content = renderNotesIndex(notes);
  const transformed = transformGeneratedContent(
    html,
    (contentHtml) => marker.test(contentHtml) ? contentHtml.replace(marker, content) : contentHtml,
    'Engineering Notes index',
  );
  if (!transformed.source) {
    throw new Error('Engineering Notes index placeholder not found in rendered DOM or Diplodoc state payload.');
  }

  const finalHtml = transformed.source === 'diplodoc-state'
    ? injectNotesIndexNoJavaScriptFallback(transformed.html, content)
    : transformed.html;
  fs.writeFileSync(htmlPath, finalHtml, 'utf8');
  return target;
}

export function renderNoteNavigation(note, notes) {
  const index = notes.findIndex((candidate) => candidate.slug === note.slug);
  const previous = index > 0 ? notes[index - 1] : null;
  const next = index >= 0 && index < notes.length - 1 ? notes[index + 1] : null;
  const bySlug = new Map(notes.map((candidate) => [candidate.slug, candidate]));
  const related = note.related.map((slug) => bySlug.get(slug)).filter(Boolean);

  const sequence = [
    previous ? `<a href="${noteHref(previous.slug)}">← ${escapeHtml(previous.title)}</a>` : '',
    next ? `<a href="${noteHref(next.slug)}">${escapeHtml(next.title)} →</a>` : '',
  ].filter(Boolean).join('');
  const relatedMarkup = related.length
    ? `<div class="tr-note-nav__related"><strong>Связанные заметки</strong><ul>${related.map((item) => `<li><a href="${noteHref(item.slug)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul></div>`
    : '';

  return `<nav class="tr-note-nav" aria-label="Навигация по Engineering Notes">
  <div class="tr-note-nav__sequence">${sequence}</div>
  ${relatedMarkup}
</nav>`;
}

function enhanceNoteContent(contentHtml, note, notes, source) {
  const meta = renderNoteMeta(note);
  const navigation = renderNoteNavigation(note, notes);

  if (source === 'diplodoc-state') return `${meta}${contentHtml}${navigation}`;

  const heading = /<h1\b[^>]*>[\s\S]*?<\/h1>/i;
  const headingMatch = contentHtml.match(heading);
  if (!headingMatch) return contentHtml;
  const withMeta = contentHtml.replace(heading, `${headingMatch[0]}${meta}`);
  const mainClose = withMeta.lastIndexOf('</main>');
  if (mainClose < 0) return contentHtml;
  return `${withMeta.slice(0, mainClose)}${navigation}${withMeta.slice(mainClose)}`;
}

export function applyNoteEnhancements(outputDir, notes) {
  const updated = [];
  for (const note of notes) {
    const htmlPath = path.join(outputDir, 'landing', 'notes', `${note.slug}.html`);
    if (!fs.existsSync(htmlPath)) throw new Error(`generated note page not found: ${note.slug}`);
    const html = fs.readFileSync(htmlPath, 'utf8');
    const transformed = transformGeneratedContent(
      html,
      (contentHtml, context) => enhanceNoteContent(contentHtml, note, notes, context.source),
      `note enhancement for ${note.slug}`,
    );
    if (!transformed.source) throw new Error(`note content container not found for ${note.slug}`);
    fs.writeFileSync(htmlPath, transformed.html, 'utf8');
    updated.push(`landing/notes/${note.slug}.html`);
  }
  return updated;
}

function atomTimestamp(date) {
  return `${date}T00:00:00Z`;
}

export function renderAtomFeed(notes, siteUrl) {
  validateNotesManifest(notes, {requireFiles: false});
  const base = siteUrl.trim().replace(/\/$/, '');
  if (!/^https:\/\//.test(base)) throw new Error('siteUrl must be an https URL for feed generation.');
  const ordered = orderedNotes(notes);
  const feedUpdated = ordered[0].updated;
  const entries = ordered.map((note) => `  <entry>
    <title>${escapeXml(note.title)}</title>
    <id>${escapeXml(`${base}/landing/notes/${note.slug}.html`)}</id>
    <link href="${escapeXml(`${base}/landing/notes/${note.slug}.html`)}"/>
    <published>${atomTimestamp(note.published)}</published>
    <updated>${atomTimestamp(note.updated)}</updated>
    <summary>${escapeXml(note.description)}</summary>
${note.tags.map((tag) => `    <category term="${escapeXml(tag)}"/>`).join('\n')}
  </entry>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>TrueRuslan Engineering Notes</title>
  <id>${escapeXml(`${base}/feed.xml`)}</id>
  <link href="${escapeXml(`${base}/feed.xml`)}" rel="self"/>
  <link href="${escapeXml(`${base}/landing/notes.html`)}"/>
  <updated>${atomTimestamp(feedUpdated)}</updated>
${entries}
</feed>
`;
}

export function writeAtomFeed(outputDir, notes, siteUrl) {
  const feedPath = path.join(outputDir, 'feed.xml');
  fs.writeFileSync(feedPath, renderAtomFeed(notes, siteUrl), 'utf8');
  return feedPath;
}

export function applyFeedDiscovery(outputDir, siteUrl) {
  const base = siteUrl.trim().replace(/\/$/, '');
  const tag = `<link rel="alternate" type="application/atom+xml" title="TrueRuslan Engineering Notes" href="${escapeHtml(`${base}/feed.xml`)}">`;
  const targets = [path.join(outputDir, 'index.html'), path.join(outputDir, 'landing', 'notes.html')];
  let updated = 0;
  for (const htmlPath of targets) {
    if (!fs.existsSync(htmlPath)) continue;
    const html = fs.readFileSync(htmlPath, 'utf8');
    if (html.includes('application/atom+xml')) continue;
    if (!html.includes('</head>')) throw new Error(`cannot inject feed discovery into ${htmlPath}`);
    fs.writeFileSync(htmlPath, html.replace('</head>', `  ${tag}\n</head>`), 'utf8');
    updated += 1;
  }
  return updated;
}
