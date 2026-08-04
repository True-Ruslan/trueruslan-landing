import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const modulePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'clean-urls.js');

async function loadCleanUrlsModule() {
  assert.ok(fs.existsSync(modulePath), 'scripts/clean-urls.js must implement the clean URL build contract');
  return import(pathToFileURL(modulePath));
}

test('toDirectoryUrl converts generated HTML routes while preserving query and fragment', async () => {
  const {toDirectoryUrl} = await loadCleanUrlsModule();

  assert.equal(toDirectoryUrl('landing/resume.html'), 'landing/resume/');
  assert.equal(toDirectoryUrl('/landing/projects/vlezet.html#recognition'), '/landing/projects/vlezet/#recognition');
  assert.equal(toDirectoryUrl('https://trueruslan.ru/en/about.html?from=home'), 'https://trueruslan.ru/en/about/?from=home');
  assert.equal(toDirectoryUrl('index.html'), './');
  assert.equal(toDirectoryUrl('https://example.com/file.html'), 'https://example.com/file.html');
  assert.equal(toDirectoryUrl('assets/example.html.png'), 'assets/example.html.png');
});

test('publishDirectoryRoutes creates directory indexes, rewrites references and preserves legacy entrypoints', async () => {
  const {publishDirectoryRoutes} = await loadCleanUrlsModule();
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clean-urls-'));
  const pagePath = path.join(outputDir, 'landing', 'resume.html');
  const nestedPath = path.join(outputDir, 'landing', 'projects', 'vlezet.html');
  const searchRegistry = path.join(outputDir, '_search', 'ru', 'registry.js');

  fs.mkdirSync(path.dirname(pagePath), {recursive: true});
  fs.mkdirSync(path.dirname(nestedPath), {recursive: true});
  fs.mkdirSync(path.dirname(searchRegistry), {recursive: true});

  fs.writeFileSync(pagePath, '<html><head><base href="../"><link rel="canonical" href="https://trueruslan.ru/landing/resume.html"></head><body><script id="diplodoc-state" type="application/json">{"router":{"pathname":"landing/resume","depth":2,"base":"../"},"search":{"api":"_search/api.js","link":"_search/ru/"}}</script><a href="landing/projects.html#work">Projects</a></body></html>');
  fs.writeFileSync(nestedPath, '<html><head><base href="../../"></head><body><script id="diplodoc-state" type="application/json">{"router":{"pathname":"landing/projects/vlezet","depth":3,"base":"../../"},"search":{"api":"_search/api.js"}}</script><a href="landing/resume.html">Resume</a></body></html>');
  fs.writeFileSync(path.join(outputDir, 'index.html'), '<a href="landing/resume.html">Resume</a>');
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), '<loc>https://trueruslan.ru/landing/resume.html</loc>');
  fs.writeFileSync(searchRegistry, 'self.registry={"landing/resume.html":{"href":"landing/resume.html#profile"}};');

  const result = publishDirectoryRoutes({outputDir, siteUrl: 'https://trueruslan.ru'});

  assert.deepEqual(result.routes, ['landing/projects/vlezet/', 'landing/resume/']);
  assert.ok(fs.existsSync(path.join(outputDir, 'landing', 'resume', 'index.html')));
  assert.ok(fs.existsSync(path.join(outputDir, 'landing', 'projects', 'vlezet', 'index.html')));

  const cleanPage = fs.readFileSync(path.join(outputDir, 'landing', 'resume', 'index.html'), 'utf8');
  assert.match(cleanPage, /<base href="\.\.\/\.\.\/">/);
  assert.match(cleanPage, /"router":\{"pathname":"landing\/resume","depth":2,"base":"\.\.\/\.\.\/"\}/);
  assert.match(cleanPage, /https:\/\/trueruslan\.ru\/landing\/resume\//);
  assert.match(cleanPage, /landing\/projects\/#work/);

  const nestedCleanPage = fs.readFileSync(path.join(outputDir, 'landing', 'projects', 'vlezet', 'index.html'), 'utf8');
  assert.match(nestedCleanPage, /<base href="\.\.\/\.\.\/\.\.\/">/);
  assert.match(nestedCleanPage, /"base":"\.\.\/\.\.\/\.\.\/"/);

  const legacyPage = fs.readFileSync(pagePath, 'utf8');
  assert.match(legacyPage, /http-equiv="refresh"/i);
  assert.match(legacyPage, /url=\/landing\/resume\//i);
  assert.match(legacyPage, /rel="canonical" href="https:\/\/trueruslan\.ru\/landing\/resume\/"/);

  assert.equal(fs.readFileSync(path.join(outputDir, 'sitemap.xml'), 'utf8'), '<loc>https://trueruslan.ru/landing/resume/</loc>');
  assert.equal(fs.readFileSync(searchRegistry, 'utf8'), 'self.registry={"landing/resume/":{"href":"landing/resume/#profile"}};');
  assert.match(fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8'), /href="landing\/resume\/"/);
});
