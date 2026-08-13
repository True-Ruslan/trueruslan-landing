import { readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

const INCLUDE_PATTERN = /\{%\s*include(?:\s+notitle)?\s+\[[^\]]*\]\(([^)]+)\)\s*%\}/gu;

function insideProject(projectRoot, candidate) {
  const rel = relative(projectRoot, candidate);
  return rel === '' || (!rel.startsWith('..') && !rel.startsWith('/'));
}

export async function loadMarkdownSource(projectDir, relativePath, seen = new Set()) {
  const projectRoot = resolve(projectDir);
  const absolutePath = resolve(projectRoot, relativePath);
  if (!insideProject(projectRoot, absolutePath)) {
    throw new Error(`Editorial source escapes project root: ${relativePath}`);
  }
  if (seen.has(absolutePath)) {
    throw new Error(`Editorial include cycle detected at ${relativePath}`);
  }

  const nextSeen = new Set(seen);
  nextSeen.add(absolutePath);
  const source = await readFile(absolutePath, 'utf8');
  const matches = [...source.matchAll(INCLUDE_PATTERN)];
  if (!matches.length) return source;

  let output = source;
  for (const match of matches) {
    const includePath = match[1].trim();
    const includeAbsolute = resolve(dirname(absolutePath), includePath);
    if (!insideProject(projectRoot, includeAbsolute)) {
      throw new Error(`Editorial include escapes project root: ${includePath}`);
    }
    const includeRelative = relative(projectRoot, includeAbsolute);
    const included = await loadMarkdownSource(projectRoot, includeRelative, nextSeen);
    output = output.replace(match[0], included);
  }
  return output;
}