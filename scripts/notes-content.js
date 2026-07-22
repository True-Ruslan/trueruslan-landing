import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {transformGeneratedContent} from './diplodoc-state.js';
import {escapeHtml} from './project-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
export const DEFAULT_NOTES_PATH = path.join(ROOT, 'data', 'notes.json');
const DEFAULT_DOCS_DIR = path.join(ROOT, 'docs');

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
  const ordered = [...notes].sort((a, b) => b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug));
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
