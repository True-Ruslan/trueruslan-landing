import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as parse5 from 'parse5';

const EXEMPT_SCHEME = /^(?:mailto|tel|javascript|data):/i;

function walkFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function attrValue(node, name) {
  return node.attrs?.find((attr) => attr.name.toLowerCase() === name)?.value ?? null;
}

function shouldOpenInNewContext(href) {
  const value = String(href ?? '').trim();
  if (!value || value.startsWith('#')) return false;
  if (EXEMPT_SCHEME.test(value)) return false;
  return true;
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;');
}

function mergeRelTokens(value) {
  const tokens = [];
  const seen = new Set();
  for (const token of String(value ?? '').trim().split(/\s+/).filter(Boolean)) {
    const normalized = token.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    tokens.push(token);
  }
  for (const required of ['noopener', 'noreferrer']) {
    if (seen.has(required)) continue;
    seen.add(required);
    tokens.push(required);
  }
  return tokens.join(' ');
}

function renderAnchorStartTag(node) {
  const href = attrValue(node, 'href');
  const currentRel = attrValue(node, 'rel');
  const attrs = (node.attrs ?? [])
    .filter((attr) => !['target', 'rel'].includes(attr.name.toLowerCase()))
    .map((attr) => ({name: attr.name, value: attr.value}));

  attrs.push({name: 'target', value: '_blank'});
  attrs.push({name: 'rel', value: mergeRelTokens(currentRel)});

  return `<a${attrs.map((attr) => ` ${attr.name}="${escapeAttribute(attr.value)}"`).join('')}>`;
}

function collectAnchorReplacements(node, replacements) {
  if (!node || typeof node !== 'object') return;
  if (node.tagName === 'a') {
    const href = attrValue(node, 'href');
    const startTag = node.sourceCodeLocation?.startTag;
    if (shouldOpenInNewContext(href) && startTag) {
      replacements.push({
        start: startTag.startOffset,
        end: startTag.endOffset,
        value: renderAnchorStartTag(node),
      });
    }
  }

  for (const child of node.childNodes ?? []) collectAnchorReplacements(child, replacements);
  if (node.content) collectAnchorReplacements(node.content, replacements);
}

export function applyLinkPolicy(html) {
  const source = String(html);
  const document = parse5.parse(source, {sourceCodeLocationInfo: true});
  const replacements = [];
  collectAnchorReplacements(document, replacements);
  if (replacements.length === 0) return source;

  let output = source;
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    output = `${output.slice(0, replacement.start)}${replacement.value}${output.slice(replacement.end)}`;
  }
  return output;
}

export function applyLinkPolicyToSite({outputDir} = {}) {
  if (!outputDir || !fs.existsSync(outputDir)) {
    throw new Error(`Generated site directory missing: ${outputDir}`);
  }

  const changed = [];
  const htmlFiles = walkFiles(path.resolve(outputDir))
    .filter((filePath) => filePath.toLowerCase().endsWith('.html'))
    .sort((left, right) => left.localeCompare(right));

  for (const filePath of htmlFiles) {
    const current = fs.readFileSync(filePath, 'utf8');
    const next = applyLinkPolicy(current);
    if (next === current) continue;
    fs.writeFileSync(filePath, next, 'utf8');
    changed.push(path.relative(path.resolve(outputDir), filePath).replaceAll(path.sep, '/'));
  }

  return {changed};
}

function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.join(scriptDir, '..');
  try {
    const result = applyLinkPolicyToSite({outputDir: path.join(root, 'docs-html')});
    console.log(`Applied link policy to ${result.changed.length} generated HTML file(s).`);
  } catch (error) {
    console.error(`Link policy post-processing failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
