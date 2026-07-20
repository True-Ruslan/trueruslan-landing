import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {globSync} from 'glob';
import {parse} from 'parse5';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'docs-html');

const REFERENCE_ATTRIBUTES = new Map([
  ['a', ['href']],
  ['area', ['href']],
  ['audio', ['src']],
  ['embed', ['src']],
  ['iframe', ['src']],
  ['img', ['src']],
  ['input', ['src']],
  ['link', ['href']],
  ['object', ['data']],
  ['script', ['src']],
  ['source', ['src']],
  ['track', ['src']],
  ['video', ['src', 'poster']],
]);

const EXTERNAL_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? null;
}

function stripQueryAndHash(reference) {
  const hashIndex = reference.indexOf('#');
  const queryIndex = reference.indexOf('?');
  const indexes = [hashIndex, queryIndex].filter((index) => index >= 0);
  const cutAt = indexes.length ? Math.min(...indexes) : reference.length;
  return reference.slice(0, cutAt);
}

function safeDecodePath(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function resolveLocalReference(reference, htmlPath, outputDir = DEFAULT_OUTPUT_DIR) {
  const raw = reference?.trim();
  if (!raw || raw.startsWith('#') || raw.startsWith('//') || EXTERNAL_SCHEME.test(raw)) {
    return null;
  }

  const clean = safeDecodePath(stripQueryAndHash(raw)).replaceAll('\\', '/');
  if (!clean) {
    return null;
  }

  if (clean.startsWith('/')) {
    return path.resolve(outputDir, `.${clean}`);
  }

  return path.resolve(path.dirname(htmlPath), clean);
}

function resolveExistingTarget(targetPath) {
  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.isFile()) {
      return targetPath;
    }
    if (stat.isDirectory()) {
      const indexPath = path.join(targetPath, 'index.html');
      return fs.existsSync(indexPath) ? indexPath : null;
    }
  }

  if (!path.extname(targetPath)) {
    const htmlPath = `${targetPath}.html`;
    if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
      return htmlPath;
    }

    const indexPath = path.join(targetPath, 'index.html');
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      return indexPath;
    }
  }

  return null;
}

function collectReferences(node, references) {
  const attributes = REFERENCE_ATTRIBUTES.get(node.tagName);
  if (attributes) {
    for (const attribute of attributes) {
      const value = getAttribute(node, attribute);
      if (value !== null) {
        references.push({tag: node.tagName, attribute, value});
      }
    }
  }

  for (const child of node.childNodes ?? []) {
    collectReferences(child, references);
  }
}

export function checkSiteIntegrity(outputDir = DEFAULT_OUTPUT_DIR) {
  if (!fs.existsSync(outputDir)) {
    throw new Error(`Generated site directory does not exist: ${outputDir}`);
  }

  const normalizedOutput = path.resolve(outputDir);
  const htmlPaths = globSync(path.join(normalizedOutput, '**', '*.html'), {nodir: true}).sort();
  if (htmlPaths.length === 0) {
    throw new Error(`No generated HTML files found in ${normalizedOutput}`);
  }

  const broken = [];
  let referencesChecked = 0;

  for (const htmlPath of htmlPaths) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const document = parse(html);
    const references = [];
    collectReferences(document, references);

    for (const reference of references) {
      const targetPath = resolveLocalReference(reference.value, htmlPath, normalizedOutput);
      if (!targetPath) {
        continue;
      }

      referencesChecked += 1;
      const insideOutput = targetPath === normalizedOutput
        || targetPath.startsWith(`${normalizedOutput}${path.sep}`);
      const resolvedTarget = insideOutput ? resolveExistingTarget(targetPath) : null;

      if (!resolvedTarget) {
        broken.push({
          source: path.relative(normalizedOutput, htmlPath),
          tag: reference.tag,
          attribute: reference.attribute,
          reference: reference.value,
          target: path.relative(normalizedOutput, targetPath),
        });
      }
    }
  }

  if (broken.length) {
    const lines = broken.map((item) => (
      `- ${item.source}: <${item.tag}> ${item.attribute}="${item.reference}" -> ${item.target || '.'}`
    ));
    throw new Error(`Broken local references found (${broken.length}):\n${lines.join('\n')}`);
  }

  return {htmlFiles: htmlPaths.length, referencesChecked};
}

function main() {
  try {
    const result = checkSiteIntegrity();
    console.log(`Site integrity OK: ${result.htmlFiles} HTML file(s), ${result.referencesChecked} local reference(s) checked.`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
