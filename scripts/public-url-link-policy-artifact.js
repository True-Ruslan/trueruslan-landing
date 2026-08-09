import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {globSync} from 'glob';
import {parse} from 'parse5';

const EXEMPT_SCHEME = /^(?:mailto|tel|javascript|data):/i;
const REQUIRED_CANONICAL_FILES = Object.freeze([
  'index.html',
  'resume/index.html',
  'projects/index.html',
  'projects/notchhub/index.html',
  'notes/index.html',
  'publications/index.html',
  'about/index.html',
  'work-with-me/index.html',
  'now/index.html',
  'en/index.html',
]);
const REQUIRED_LEGACY_FILES = Object.freeze([
  'landing/resume.html',
  'landing/resume/index.html',
  'landing/projects/notchhub.html',
  'landing/projects/notchhub/index.html',
]);

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name.toLowerCase() === name)?.value ?? null;
}

function hasAttribute(node, name) {
  return node.attrs?.some((attribute) => attribute.name.toLowerCase() === name) === true;
}

function relTokens(node) {
  return new Set(String(getAttribute(node, 'rel') ?? '').toLowerCase().split(/\s+/).filter(Boolean));
}

function shouldOpenInNewContext(href) {
  const value = String(href ?? '').trim();
  if (!value || value.startsWith('#')) return false;
  return !EXEMPT_SCHEME.test(value);
}

function containsLegacyLandingPath(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return false;
  if (/^(?:\.\.\/|\.\/)*landing\//.test(raw) || raw.startsWith('/landing/')) return true;
  try {
    const parsed = new URL(raw);
    return parsed.pathname.includes('/landing/');
  } catch {
    return false;
  }
}

function collectPolicyFindings(node, relativePath, findings) {
  if (!node || typeof node !== 'object') return;

  if (node.tagName === 'a') {
    const href = getAttribute(node, 'href');
    if (containsLegacyLandingPath(href)) {
      findings.push(`${relativePath}: anchor still exposes legacy /landing namespace: ${href}`);
    }
    if (shouldOpenInNewContext(href)) {
      const target = getAttribute(node, 'target');
      const rel = relTokens(node);
      if (target !== '_blank') findings.push(`${relativePath}: navigational anchor is not target=_blank: ${href}`);
      if (!rel.has('noopener') || !rel.has('noreferrer')) {
        findings.push(`${relativePath}: navigational anchor lacks noopener/noreferrer: ${href}`);
      }
    }
  }

  if (node.tagName === 'link') {
    const rel = relTokens(node);
    if (rel.has('canonical') || rel.has('alternate')) {
      const href = getAttribute(node, 'href');
      if (containsLegacyLandingPath(href)) {
        findings.push(`${relativePath}: canonical/alternate still exposes legacy /landing namespace: ${href}`);
      }
    }
  }

  for (const child of node.childNodes ?? []) collectPolicyFindings(child, relativePath, findings);
  if (node.content) collectPolicyFindings(node.content, relativePath, findings);
}

export function verifyPublicUrlLinkPolicyArtifact(outputDir) {
  if (!outputDir || !fs.existsSync(outputDir)) throw new Error(`Generated site directory missing: ${outputDir}`);
  const root = path.resolve(outputDir);
  const findings = [];

  for (const relativePath of REQUIRED_CANONICAL_FILES) {
    if (!fs.existsSync(path.join(root, ...relativePath.split('/')))) {
      findings.push(`canonical route artifact missing: ${relativePath}`);
    }
  }
  for (const relativePath of REQUIRED_LEGACY_FILES) {
    const absolutePath = path.join(root, ...relativePath.split('/'));
    if (!fs.existsSync(absolutePath)) {
      findings.push(`legacy compatibility artifact missing: ${relativePath}`);
      continue;
    }
    const html = fs.readFileSync(absolutePath, 'utf8');
    const document = parse(html);
    const htmlNode = document.childNodes?.find((node) => node.tagName === 'html');
    if (!htmlNode || !hasAttribute(htmlNode, 'data-tr-clean-url-redirect')) {
      findings.push(`${relativePath}: legacy artifact is not a clean-URL redirect`);
    }
  }

  const htmlPaths = globSync(path.join(root, '**', '*.html'), {nodir: true}).sort();
  for (const htmlPath of htmlPaths) {
    const relativePath = path.relative(root, htmlPath).replaceAll(path.sep, '/');
    const html = fs.readFileSync(htmlPath, 'utf8');
    collectPolicyFindings(parse(html), relativePath, findings);
  }

  for (const relativePath of ['sitemap.xml', 'feed.xml']) {
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      findings.push(`${relativePath}: missing`);
      continue;
    }
    const content = fs.readFileSync(absolutePath, 'utf8');
    if (/https?:\/\/[^\s"'<>]*\/landing\//i.test(content)) {
      findings.push(`${relativePath}: exposes legacy /landing public namespace`);
    }
  }

  return {
    ok: findings.length === 0,
    htmlFiles: htmlPaths.length,
    findings,
  };
}

function main() {
  const outputDir = process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs-html');
  const result = verifyPublicUrlLinkPolicyArtifact(path.resolve(outputDir));
  if (!result.ok) {
    console.error(`Public URL/link policy failed (${result.findings.length}):\n${result.findings.map((item) => `- ${item}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`Public URL/link policy OK: ${result.htmlFiles} HTML file(s) checked.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
