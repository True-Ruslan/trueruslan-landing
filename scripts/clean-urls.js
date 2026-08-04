import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const DEFAULT_SITE_URL = 'https://trueruslan.ru';
const TEXT_RESOURCE_EXTENSIONS = new Set(['.html', '.xml', '.js', '.json']);

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

function splitSuffix(value) {
  const match = String(value).match(/^([^?#]*)(.*)$/s);
  return {pathname: match?.[1] ?? String(value), suffix: match?.[2] ?? ''};
}

function cleanPathname(pathname) {
  if (pathname === 'index.html') return './';
  if (pathname.endsWith('/index.html')) return pathname.slice(0, -'index.html'.length);
  if (pathname.endsWith('.html')) return `${pathname.slice(0, -'.html'.length)}/`;
  return pathname;
}

export function toDirectoryUrl(value, siteUrl = DEFAULT_SITE_URL) {
  const raw = String(value);
  if (!raw.includes('.html')) return raw;

  if (/^[a-z][a-z\d+.-]*:/i.test(raw)) {
    let parsed;
    let site;
    try {
      parsed = new URL(raw);
      site = new URL(siteUrl);
    } catch {
      return raw;
    }
    if (!/^https?:$/.test(parsed.protocol) || parsed.origin !== site.origin) return raw;
    parsed.pathname = cleanPathname(parsed.pathname);
    return parsed.toString();
  }

  if (raw.startsWith('//')) return raw;
  const {pathname, suffix} = splitSuffix(raw);
  if (!pathname.endsWith('.html')) return raw;
  return `${cleanPathname(pathname)}${suffix}`;
}

const URL_TOKEN_PATTERN = /https?:\/\/[^\s"'<>\\]+|(?:\.\.?\/|\/)?(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.html(?:[?#][^\s"'<>\\]*)?/g;

export function rewriteUrlReferences(content, siteUrl = DEFAULT_SITE_URL) {
  return String(content).replace(URL_TOKEN_PATTERN, (value) => toDirectoryUrl(value, siteUrl));
}

function incrementBaseValue(value) {
  return `${value}../`;
}

export function incrementRelativeBase(html) {
  return String(html)
    .replace(
      /(<base\b[^>]*\bhref=(["']))((?:\.\.\/)+|\.\/)(\2[^>]*>)/i,
      (_match, prefix, _quote, href, suffix) => `${prefix}${incrementBaseValue(href)}${suffix}`,
    )
    .replace(
      /("router"\s*:\s*\{[^{}]*?"depth"\s*:\s*)(\d+)(\s*,[^{}]*?"base"\s*:\s*")((?:\.\.\/)+|\.\/)(")/g,
      (_match, prefix, depth, middle, routerBase, suffix) => (
        `${prefix}${Number(depth) + 1}${middle}${incrementBaseValue(routerBase)}${suffix}`
      ),
    );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function createLegacyRedirect(route, siteUrl = DEFAULT_SITE_URL) {
  const canonical = new URL(route, siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`).href;
  const escapedCanonical = escapeHtml(canonical);
  return `<!doctype html>\n<html lang="en" data-tr-clean-url-redirect>\n<head>\n<meta charset="utf-8">\n<meta name="robots" content="noindex,follow">\n<meta http-equiv="refresh" content="0; url=${escapedCanonical}">\n<link rel="canonical" href="${escapedCanonical}">\n<title>Redirecting…</title>\n<script>location.replace(${JSON.stringify(canonical)} + location.search + location.hash);</script>\n</head>\n<body><p><a href="${escapedCanonical}">Continue</a></p></body>\n</html>\n`;
}

function patchGeneratedRuntime(content, relativePath) {
  if (relativePath !== '_assets/script/custom.js') return content;
  return content
    .replace(
      "if (path === '/' || path === '/index.html' || path.endsWith('/index.html')) return 'home';",
      "if (path === '/' || path === '/en' || path === '/index.html' || path.endsWith('/index.html')) return 'home';",
    )
    .replace(
      'if (path.endsWith(`/landing/${page}.html`)) return page;',
      'if (path.endsWith(`/landing/${page}`) || path.endsWith(`/landing/${page}.html`)) return page;',
    )
    .replace(
      "return new URL('../assets/documents/cv.pdf', currentHref).href;",
      "return new URL('assets/documents/cv.pdf', document.baseURI || currentHref).href;",
    )
    .replace(
      "if (/landing\\/projects\\.(md|html)$/.test(href) || /\\/projects\\.html$/.test(href)) {",
      "if (/landing\\/projects(?:\\.(?:md|html)|\\/)$/.test(href) || /\\/projects(?:\\.html|\\/)$/.test(href)) {",
    )
    .replace(
      "/landing\\/resume\\.(md|html)$/.test(href)\n        || /\\/resume\\.html$/.test(href)",
      "/landing\\/resume(?:\\.(?:md|html)|\\/)$/.test(href)\n        || /\\/resume(?:\\.html|\\/)$/.test(href)",
    );
}

function shouldRewriteResource(relativePath) {
  const normalized = relativePath.replaceAll(path.sep, '/');
  if (normalized.startsWith('_bundle/')) return false;
  if (normalized.startsWith('assets/')) return false;
  return TEXT_RESOURCE_EXTENSIONS.has(path.extname(normalized).toLowerCase());
}

export function publishDirectoryRoutes({outputDir, siteUrl = DEFAULT_SITE_URL} = {}) {
  if (!outputDir || !fs.existsSync(outputDir)) {
    throw new Error(`Generated site directory missing: ${outputDir}`);
  }

  const normalizedOutput = path.resolve(outputDir);
  const sourcePages = walkFiles(normalizedOutput)
    .filter((filePath) => filePath.toLowerCase().endsWith('.html'))
    .filter((filePath) => path.basename(filePath).toLowerCase() !== 'index.html')
    .filter((filePath) => !fs.readFileSync(filePath, 'utf8').includes('data-tr-clean-url-redirect'))
    .sort((left, right) => left.localeCompare(right));

  const routes = [];
  for (const sourcePath of sourcePages) {
    const relativeSource = path.relative(normalizedOutput, sourcePath).replaceAll(path.sep, '/');
    const route = toDirectoryUrl(relativeSource, siteUrl);
    if (!route.endsWith('/')) throw new Error(`Unable to derive directory route for ${relativeSource}`);

    const targetPath = path.join(normalizedOutput, route, 'index.html');
    const sourceHtml = fs.readFileSync(sourcePath, 'utf8');
    const cleanHtml = incrementRelativeBase(rewriteUrlReferences(sourceHtml, siteUrl));
    fs.mkdirSync(path.dirname(targetPath), {recursive: true});
    fs.writeFileSync(targetPath, cleanHtml, 'utf8');
    fs.writeFileSync(sourcePath, createLegacyRedirect(route, siteUrl), 'utf8');
    routes.push(route);
  }

  const rewritten = [];
  for (const resourcePath of walkFiles(normalizedOutput)) {
    const relativePath = path.relative(normalizedOutput, resourcePath).replaceAll(path.sep, '/');
    if (!shouldRewriteResource(relativePath)) continue;
    const current = fs.readFileSync(resourcePath, 'utf8');
    const next = patchGeneratedRuntime(rewriteUrlReferences(current, siteUrl), relativePath);
    if (next === current) continue;
    fs.writeFileSync(resourcePath, next, 'utf8');
    rewritten.push(relativePath);
  }

  return {routes: routes.sort(), rewritten: rewritten.sort()};
}

function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.join(scriptDir, '..');
  const siteUrl = String(process.env.SITE_URL || DEFAULT_SITE_URL).trim();
  try {
    const result = publishDirectoryRoutes({outputDir: path.join(root, 'docs-html'), siteUrl});
    console.log(`Published ${result.routes.length} clean directory route(s).`);
    console.log(`Rewrote clean URL references in ${result.rewritten.length} generated resource(s).`);
  } catch (error) {
    console.error(`Clean URL post-processing failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
