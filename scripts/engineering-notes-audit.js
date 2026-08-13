import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadNotesManifest} from './notes-content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const NOTES_DIR = path.join(ROOT, 'docs', 'landing', 'notes');

function proseForWordCount(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '');
}

export function countWords(markdown) {
  const words = proseForWordCount(markdown).match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’_-]*/gu);
  return words?.length ?? 0;
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

export function countGitHubEvidenceLinks(markdown) {
  const candidates = markdown.match(/https:\/\/[^\s)>'"]+/g) ?? [];
  let count = 0;
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (url.protocol === 'https:' && url.hostname === 'github.com') count += 1;
    } catch {
      // Malformed URL-like text is not evidence and must not affect the inventory.
    }
  }
  return count;
}

function tagJaccard(left, right) {
  const a = new Set(left);
  const b = new Set(right);
  const intersection = [...a].filter((value) => b.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

function descriptionTokens(value) {
  return new Set(
    String(value)
      .toLocaleLowerCase('ru')
      .match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}-]{2,}/gu) ?? [],
  );
}

function setJaccard(a, b) {
  const intersection = [...a].filter((value) => b.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

export function buildEngineeringNotesInventory({notes = loadNotesManifest(), notesDir = NOTES_DIR} = {}) {
  const inbound = new Map(notes.map((note) => [note.slug, 0]));
  for (const note of notes) {
    for (const related of note.related) inbound.set(related, (inbound.get(related) ?? 0) + 1);
  }

  const inventory = notes.map((note) => {
    const sourcePath = path.join(notesDir, `${note.slug}.md`);
    const markdown = fs.readFileSync(sourcePath, 'utf8');
    const noteLinks = [...markdown.matchAll(/\]\((?:\.\/)?([a-z0-9-]+)\.md(?:#[^)]+)?\)/g)]
      .map((match) => match[1])
      .filter((slug) => slug !== note.slug);

    return {
      slug: note.slug,
      title: note.title,
      readingMinutes: note.readingMinutes,
      sourceBytes: Buffer.byteLength(markdown, 'utf8'),
      wordCount: countWords(markdown),
      headingCount: countMatches(markdown, /^##+\s+/gm),
      markdownNoteLinks: [...new Set(noteLinks)].length,
      projectLinks: countMatches(markdown, /\]\(\.\.\/projects\//g),
      githubEvidenceLinks: countGitHubEvidenceLinks(markdown),
      explicitFactMarkers: countMatches(markdown, /\*\*Проверенный факт\.\*\*/g),
      relatedOut: note.related.length,
      relatedIn: inbound.get(note.slug) ?? 0,
      tags: note.tags,
    };
  });

  const overlapCandidates = [];
  for (let index = 0; index < notes.length; index += 1) {
    for (let next = index + 1; next < notes.length; next += 1) {
      const left = notes[index];
      const right = notes[next];
      const tagSimilarity = tagJaccard(left.tags, right.tags);
      const descriptionSimilarity = setJaccard(descriptionTokens(left.description), descriptionTokens(right.description));
      if (tagSimilarity >= 0.5 || descriptionSimilarity >= 0.28) {
        overlapCandidates.push({
          left: left.slug,
          right: right.slug,
          tagSimilarity: Number(tagSimilarity.toFixed(3)),
          descriptionSimilarity: Number(descriptionSimilarity.toFixed(3)),
        });
      }
    }
  }
  overlapCandidates.sort((a, b) => (
    b.tagSimilarity - a.tagSimilarity
    || b.descriptionSimilarity - a.descriptionSimilarity
    || a.left.localeCompare(b.left)
    || a.right.localeCompare(b.right)
  ));

  return {
    generatedFrom: 'data/notes.json + docs/landing/notes/*.md',
    noteCount: inventory.length,
    totals: {
      sourceBytes: inventory.reduce((sum, item) => sum + item.sourceBytes, 0),
      wordCount: inventory.reduce((sum, item) => sum + item.wordCount, 0),
      headings: inventory.reduce((sum, item) => sum + item.headingCount, 0),
    },
    inventory,
    overlapCandidates,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(buildEngineeringNotesInventory(), null, 2)}\n`);
}
