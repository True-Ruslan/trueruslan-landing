import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cleanUrlsPath = path.join(ROOT, 'scripts', 'clean-urls.js');
const linkPolicyPath = path.join(ROOT, 'scripts', 'link-policy.js');

async function loadCleanUrls() {
  return import(pathToFileURL(cleanUrlsPath));
}

test('public route projection removes only the leading RU landing namespace', async () => {
  const {toPublicRoute} = await loadCleanUrls();
  assert.equal(typeof toPublicRoute, 'function', 'clean URL module must expose toPublicRoute');

  assert.equal(toPublicRoute('landing/resume.html'), 'resume/');
  assert.equal(toPublicRoute('/landing/projects/notchhub.html#ui'), '/projects/notchhub/#ui');
  assert.equal(toPublicRoute('landing/notes/green-ci-is-not-product-verification.html?from=home'), 'notes/green-ci-is-not-product-verification/?from=home');
  assert.equal(toPublicRoute('en/about.html'), 'en/about/');
  assert.equal(toPublicRoute('index.html'), './');
  assert.equal(
    toPublicRoute(
      'https://true-ruslan.github.io/trueruslan-landing/landing/resume.html',
      'https://true-ruslan.github.io/trueruslan-landing/',
    ),
    'https://true-ruslan.github.io/trueruslan-landing/resume/',
  );
  assert.equal(
    toPublicRoute(
      'https://true-ruslan.github.io/another-project/landing/resume.html',
      'https://true-ruslan.github.io/trueruslan-landing/',
    ),
    'https://true-ruslan.github.io/another-project/landing/resume.html',
  );
});

test('directory publisher creates root canonical RU pages plus landing compatibility aliases', async () => {
  const {publishDirectoryRoutes} = await loadCleanUrls();
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'public-route-policy-'));
  const legacyHtml = path.join(outputDir, 'landing', 'resume.html');
  const nestedLegacyHtml = path.join(outputDir, 'landing', 'projects', 'notchhub.html');
  fs.mkdirSync(path.dirname(legacyHtml), {recursive: true});
  fs.mkdirSync(path.dirname(nestedLegacyHtml), {recursive: true});

  fs.writeFileSync(
    legacyHtml,
    '<html><head><base href="../"><link rel="canonical" href="https://trueruslan.ru/landing/resume.html"></head><body><a href="landing/projects/notchhub.html">NotchHub</a></body></html>',
  );
  fs.writeFileSync(
    nestedLegacyHtml,
    '<html><head><base href="../../"><link rel="canonical" href="https://trueruslan.ru/landing/projects/notchhub.html"></head><body><a href="landing/resume.html">Resume</a></body></html>',
  );
  fs.writeFileSync(path.join(outputDir, 'index.html'), '<a href="landing/resume.html">Resume</a>');
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), '<loc>https://trueruslan.ru/landing/resume.html</loc>');

  const result = publishDirectoryRoutes({outputDir, siteUrl: 'https://trueruslan.ru'});

  assert.deepEqual(result.routes, ['projects/notchhub/', 'resume/']);
  assert.ok(fs.existsSync(path.join(outputDir, 'resume', 'index.html')));
  assert.ok(fs.existsSync(path.join(outputDir, 'projects', 'notchhub', 'index.html')));
  assert.ok(fs.existsSync(path.join(outputDir, 'landing', 'resume', 'index.html')), 'old directory URL must remain an alias');

  const canonical = fs.readFileSync(path.join(outputDir, 'resume', 'index.html'), 'utf8');
  assert.match(canonical, /https:\/\/trueruslan\.ru\/resume\//);
  assert.doesNotMatch(canonical, /https:\/\/trueruslan\.ru\/landing\/resume\//);

  const directoryAlias = fs.readFileSync(path.join(outputDir, 'landing', 'resume', 'index.html'), 'utf8');
  assert.match(directoryAlias, /data-tr-clean-url-redirect/);
  assert.match(directoryAlias, /noindex,follow/);
  assert.match(directoryAlias, /https:\/\/trueruslan\.ru\/resume\//);

  const htmlAlias = fs.readFileSync(legacyHtml, 'utf8');
  assert.match(htmlAlias, /data-tr-clean-url-redirect/);
  assert.match(htmlAlias, /https:\/\/trueruslan\.ru\/resume\//);
  assert.match(htmlAlias, /location\.search \+ location\.hash/);

  assert.equal(fs.readFileSync(path.join(outputDir, 'sitemap.xml'), 'utf8'), '<loc>https://trueruslan.ru/resume/</loc>');
  assert.match(fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8'), /href="resume\/"/);
});

test('search worker projects landing result routes without mutating registry identity', async () => {
  const {patchSearchWorker} = await loadCleanUrls();
  const source = 'const item = {link: `${base.replace(/\\/?$/, "")}/${entry.ref.replace(/&\\/?/, "")}`, title: doc.title};';
  const patched = patchSearchWorker(source);

  assert.match(patched, /replace\([^\n]*landing/i, 'search result formatter must project the landing namespace');
  assert.match(patched, /replace\(\/index\\\.html\$\/, ""\)/);
  assert.match(patched, /replace\(\/\\\.html\$\/, "\/"\)/);
});

test('final HTML link policy exists in the production build chain', () => {
  assert.ok(fs.existsSync(linkPolicyPath), 'scripts/link-policy.js must exist');
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(typeof pkg.scripts['postprocess:link-policy'], 'string');
  assert.match(pkg.scripts['copy-assets'], /postprocess:clean-urls[^\n]*postprocess:link-policy[^\n]*postprocess:yandex-metrica/);
});

test('link policy module enforces new-tab navigation but preserves local fragments and protocols', async () => {
  assert.ok(fs.existsSync(linkPolicyPath), 'scripts/link-policy.js must exist');
  const {applyLinkPolicy} = await import(pathToFileURL(linkPolicyPath));
  assert.equal(typeof applyLinkPolicy, 'function');

  const input = '<main>'
    + '<a href="/projects/">Projects</a>'
    + '<a href="https://github.com/True-Ruslan" rel="nofollow">GitHub</a>'
    + '<a href="#architecture">Architecture</a>'
    + '<a href="mailto:ruslan@example.com">Mail</a>'
    + '<a href="tel:+10000000000">Call</a>'
    + '</main>';
  const output = applyLinkPolicy(input);

  assert.match(output, /href="\/projects\/"[^>]*target="_blank"[^>]*rel="[^"]*noopener[^"]*noreferrer[^"]*"/);
  assert.match(output, /href="https:\/\/github\.com\/True-Ruslan"[^>]*target="_blank"[^>]*rel="[^"]*nofollow[^"]*noopener[^"]*noreferrer[^"]*"/);
  assert.doesNotMatch(output, /href="#architecture"[^>]*target=/);
  assert.doesNotMatch(output, /href="mailto:ruslan@example\.com"[^>]*target=/);
  assert.doesNotMatch(output, /href="tel:\+10000000000"[^>]*target=/);
  assert.equal(applyLinkPolicy(output), output, 'link policy must be idempotent');
});
