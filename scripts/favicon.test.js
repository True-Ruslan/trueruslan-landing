import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const modulePath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'favicon.js');

async function loadFaviconModule() {
  assert.ok(fs.existsSync(modulePath), 'scripts/favicon.js must implement the favicon build contract');
  return import(pathToFileURL(modulePath));
}

test('copyRootFavicon publishes byte-equal SVG at the generated root', async () => {
  const {copyRootFavicon} = await loadFaviconModule();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'favicon-copy-'));
  const docsDir = path.join(tempRoot, 'docs');
  const outputDir = path.join(tempRoot, 'docs-html');
  const sourcePath = path.join(docsDir, 'assets', 'images', 'favicon.svg');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"></svg>\n';

  fs.mkdirSync(path.dirname(sourcePath), {recursive: true});
  fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(sourcePath, svg);

  const relativePath = copyRootFavicon({docsDir, outputDir});

  assert.equal(relativePath, 'favicon.svg');
  assert.equal(fs.readFileSync(path.join(outputDir, 'favicon.svg'), 'utf8'), svg);
});

test('normalizeFaviconLinks makes root and nested pages independent of base href', async () => {
  const {normalizeFaviconLinks} = await loadFaviconModule();
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'favicon-links-'));
  const nestedPath = path.join(outputDir, 'landing', 'resume.html');
  const rootPath = path.join(outputDir, 'index.html');

  fs.mkdirSync(path.dirname(nestedPath), {recursive: true});
  fs.writeFileSync(
    rootPath,
    '<html><head><link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="app.css"></head></html>',
  );
  fs.writeFileSync(
    nestedPath,
    '<html><head><base href="../"><link type="image/svg+xml" href="assets/images/favicon.svg" rel="icon"></head></html>',
  );

  const updated = normalizeFaviconLinks(outputDir);

  assert.deepEqual(updated.sort(), ['index.html', 'landing/resume.html']);
  assert.match(fs.readFileSync(rootPath, 'utf8'), /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">/);
  assert.match(fs.readFileSync(nestedPath, 'utf8'), /href="\/favicon\.svg"/);
  assert.match(fs.readFileSync(rootPath, 'utf8'), /<link rel="stylesheet" href="app\.css">/);
});
