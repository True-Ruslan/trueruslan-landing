import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';

const MIN_CHUNK_CHARS = 80;
const SMALL_CHUNK_CHARS = 220;
const MAX_CHUNK_CHARS = 2400;

const CYRILLIC = Object.freeze({
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
});

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(value, 'utf8').digest('hex')}`;
}

function transliterate(value) {
  return [...String(value).toLocaleLowerCase('ru')]
    .map((char) => CYRILLIC[char] ?? char)
    .join('');
}

function slugify(value, fallback = 'intro') {
  const slug = transliterate(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return slug || fallback;
}

function stripFrontMatter(markdown) {
  return String(markdown).replace(/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/, '');
}

function stripNonReaderBlocks(markdown) {
  return stripFrontMatter(markdown)
    .replace(/```[\s\S]*?```/g, '\n')
    .replace(/~~~[\s\S]*?~~~/g, '\n')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, '\n')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\b[^>]*>/gi, '\n')
    .replace(/<!--[\s\S]*?-->/g, '\n')
    .replace(/^\s*\{%\s*include\b[^%]*%\}\s*$/gim, '\n')
    .replace(/^\s*\{#\s*include\b[^#]*#\}\s*$/gim, '\n');
}

export function normalizeChunkText(value) {
  return String(value)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<https?:\/\/[^>]+>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/[\\*_~`]+/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalUrlForRoute(route) {
  let value = route.replace(/\.html$/, '');
  if (value === 'landing') value = '';
  if (value.startsWith('landing/')) value = value.slice('landing/'.length);
  return `/${value ? `${value}/` : ''}`.replace(/\/+/g, '/');
}

function sourcePathForRoute(route) {
  return `docs/${route.replace(/\.html$/, '.md')}`;
}

function typeForSource(sourcePath) {
  if (/^docs\/landing\/notes\/[^/]+\.md$/.test(sourcePath)) return 'note';
  if (/^docs\/(?:en\/)?projects\/[^/]+\.md$/.test(sourcePath)
    || /^docs\/landing\/projects\/[^/]+\.md$/.test(sourcePath)) return 'project';
  return 'page';
}

function identitySlugForSource(sourcePath) {
  return path.posix.basename(sourcePath, '.md');
}

function titleFromMarkdown(markdown, fallback) {
  const match = stripFrontMatter(markdown).match(/^#\s+(.+)$/m);
  return normalizeChunkText(match?.[1] || fallback);
}

function splitAtHeadings(markdown) {
  const lines = stripNonReaderBlocks(markdown).split(/\r?\n/);
  const intro = [];
  const sections = [];
  let current = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      if (current) sections.push(current);
      current = {heading: normalizeChunkText(h2[1]), lines: [], children: []};
      continue;
    }

    const h3 = line.match(/^###\s+(.+?)\s*$/);
    if (h3 && current) {
      current.children.push({heading: normalizeChunkText(h3[1]), start: current.lines.length});
      current.lines.push(line);
      continue;
    }

    if (current) current.lines.push(line);
    else if (!/^#\s+/.test(line)) intro.push(line);
  }
  if (current) sections.push(current);
  return {intro, sections};
}

function splitLongSection(section) {
  const whole = normalizeChunkText(section.lines.join('\n'));
  if (whole.length <= MAX_CHUNK_CHARS || section.children.length === 0) {
    return [{heading: section.heading, parent: section.heading, text: whole}];
  }

  const pieces = [];
  const firstStart = section.children[0].start;
  const preamble = normalizeChunkText(section.lines.slice(0, firstStart).join('\n'));
  if (preamble) pieces.push({heading: section.heading, parent: section.heading, text: preamble});

  for (let index = 0; index < section.children.length; index += 1) {
    const child = section.children[index];
    const next = section.children[index + 1];
    const start = child.start + 1;
    const end = next ? next.start : section.lines.length;
    const text = normalizeChunkText(section.lines.slice(start, end).join('\n'));
    if (text) pieces.push({heading: child.heading, parent: section.heading, text});
  }
  return pieces;
}

function coalesceSmallPieces(pieces) {
  const output = [];
  for (const piece of pieces) {
    const previous = output.at(-1);
    if (previous
      && previous.parent === piece.parent
      && (previous.text.length < SMALL_CHUNK_CHARS || piece.text.length < SMALL_CHUNK_CHARS)
      && `${previous.text} ${piece.text}`.length <= MAX_CHUNK_CHARS) {
      previous.text = `${previous.text} ${piece.text}`.trim();
      previous.heading = previous.heading === previous.parent ? previous.heading : `${previous.heading} / ${piece.heading}`;
      continue;
    }
    output.push({...piece});
  }
  return output;
}

function makeChunk({sourcePath, url, title, type, lang, identitySlug, section, text}) {
  const normalized = normalizeChunkText(text);
  if (normalized.length < MIN_CHUNK_CHARS) return null;
  const sectionSlug = slugify(section, 'intro');
  const id = `${lang}:${type}:${slugify(identitySlug, 'page')}:${sectionSlug}`;
  return {
    id,
    url,
    sourcePath,
    title,
    section,
    type,
    lang,
    text: normalized,
    contentHash: sha256(normalized),
  };
}

export function chunkMarkdown({sourcePath, url, title, type, lang, markdown}) {
  const resolvedTitle = normalizeChunkText(title || titleFromMarkdown(markdown, identitySlugForSource(sourcePath)));
  const identitySlug = identitySlugForSource(sourcePath);
  const {intro, sections} = splitAtHeadings(markdown);
  const pieces = [];

  const introText = normalizeChunkText(intro.join('\n'));
  if (introText) pieces.push({heading: 'Intro', parent: 'Intro', text: introText});
  for (const section of sections) pieces.push(...splitLongSection(section));

  const coalesced = coalesceSmallPieces(pieces);
  const chunks = [];
  const seen = new Set();
  for (const piece of coalesced) {
    const chunk = makeChunk({
      sourcePath,
      url,
      title: resolvedTitle,
      type,
      lang,
      identitySlug,
      section: piece.heading,
      text: piece.text,
    });
    if (!chunk) continue;
    if (seen.has(chunk.id)) throw new Error(`AI corpus chunk ID collision inside ${sourcePath}: ${chunk.id}`);
    seen.add(chunk.id);
    chunks.push(chunk);
  }
  return chunks;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadPageTitle(pageMeta, route, markdown) {
  const record = pageMeta.find(({path: pagePath}) => pagePath === route);
  return record?.title || titleFromMarkdown(markdown, path.posix.basename(route, '.html'));
}

function buildPublicationChunks({publications}) {
  const chunks = [];
  for (const publication of publications) {
    const ruText = normalizeChunkText([
      publication.title,
      publication.summary,
      ...(publication.topics || []),
      publication.platform,
    ].filter(Boolean).join('. '));
    const ru = makeChunk({
      sourcePath: 'docs/landing/publications.md',
      url: '/publications/',
      title: publication.title,
      type: 'publication',
      lang: 'ru',
      identitySlug: publication.id,
      section: 'Intro',
      text: ruText,
    });
    if (ru) chunks.push(ru);

    if (publication.en?.summary) {
      const enText = normalizeChunkText([
        publication.title,
        publication.en.summary,
        ...(publication.en.topics || []),
        publication.platform,
      ].filter(Boolean).join('. '));
      const en = makeChunk({
        sourcePath: 'docs/en/publications.md',
        url: '/en/publications/',
        title: publication.title,
        type: 'publication',
        lang: 'en',
        identitySlug: publication.id,
        section: 'Intro',
        text: enText,
      });
      if (en) chunks.push(en);
    }
  }
  return chunks;
}

function assertCorpusIntegrity(chunks) {
  const ids = new Set();
  const texts = new Set();
  for (const chunk of chunks) {
    if (ids.has(chunk.id)) throw new Error(`Duplicate AI corpus chunk ID: ${chunk.id}`);
    ids.add(chunk.id);
    const normalized = normalizeChunkText(chunk.text);
    if (texts.has(normalized)) throw new Error(`Duplicate AI corpus text: ${chunk.id}`);
    texts.add(normalized);
  }
}

export function buildAiCorpus({rootDir, config}) {
  const pageMeta = readJson(path.join(rootDir, 'data', 'page-meta.json'));
  const notes = readJson(path.join(rootDir, 'data', 'notes.json'));
  const publications = readJson(path.join(rootDir, 'data', 'publications.json'));
  const chunks = [];

  for (const route of config.includePagePaths) {
    const sourcePath = sourcePathForRoute(route);
    const absolutePath = path.join(rootDir, sourcePath);
    const markdown = fs.readFileSync(absolutePath, 'utf8');
    chunks.push(...chunkMarkdown({
      sourcePath,
      url: canonicalUrlForRoute(route),
      title: loadPageTitle(pageMeta, route, markdown),
      type: typeForSource(sourcePath),
      lang: route.startsWith('en/') ? 'en' : 'ru',
      markdown,
    }));
  }

  for (const note of notes) {
    const sourcePath = `docs/landing/notes/${note.slug}.md`;
    const markdown = fs.readFileSync(path.join(rootDir, sourcePath), 'utf8');
    chunks.push(...chunkMarkdown({
      sourcePath,
      url: `/notes/${note.slug}/`,
      title: note.title,
      type: 'note',
      lang: 'ru',
      markdown,
    }));
  }

  chunks.push(...buildPublicationChunks({publications}));
  chunks.sort((left, right) => left.id.localeCompare(right.id, 'en'));
  assertCorpusIntegrity(chunks);
  return chunks;
}

export function serializeCorpus(chunks) {
  return `${JSON.stringify(chunks, null, 2)}\n`;
}

export function writeAiCorpus({rootDir, config, outputPath}) {
  const chunks = buildAiCorpus({rootDir, config});
  const serialized = serializeCorpus(chunks);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, serialized, 'utf8');
  return {chunks, corpusDigest: sha256(serialized)};
}

function isMainModule() {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function runCli() {
  const args = process.argv.slice(2);
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));

  if (args.length === 1 && args[0] === '--print-ids') {
    const chunks = buildAiCorpus({rootDir, config});
    process.stdout.write(`${chunks.map(({id}) => id).join('\n')}\n`);
    return;
  }

  if (args.length === 2 && args[0] === '--write' && args[1].trim()) {
    const outputPath = path.resolve(process.cwd(), args[1]);
    const {chunks, corpusDigest} = writeAiCorpus({rootDir, config, outputPath});
    process.stdout.write(`AI corpus written: ${outputPath} (${chunks.length} chunks, ${corpusDigest})\n`);
    return;
  }

  process.stderr.write('Usage: node scripts/ai-corpus.js --print-ids | --write <output-path>\n');
  process.exitCode = 2;
}

if (isMainModule()) runCli();
