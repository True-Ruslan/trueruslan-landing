import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {walkAssets, writeRobotsTxt, writeSitemap} from './copy-assets.js';
import {injectSseIntoHtml} from './serve.js';

test('walkAssets copies supported files', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-assets-'));
  const docsDir = path.join(tempRoot, 'docs');
  const assetsDir = path.join(docsDir, 'assets', 'images');
  const outputDir = path.join(tempRoot, 'docs-html');

  fs.mkdirSync(assetsDir, {recursive: true});
  fs.mkdirSync(outputDir);
  fs.writeFileSync(path.join(assetsDir, 'avatar.png'), 'png');

  const copied = walkAssets(path.join(docsDir, 'assets'), outputDir, docsDir);
  assert.equal(copied.length, 1);
  assert.ok(fs.existsSync(path.join(outputDir, 'assets', 'images', 'avatar.png')));
});

test('injectSseIntoHtml is idempotent', () => {
  const html = '<!DOCTYPE html><html><head></head><body></body></html>';
  const sseScript = 'const events = new EventSource("/events");';
  const once = injectSseIntoHtml(html, sseScript);
  const twice = injectSseIntoHtml(once, sseScript);

  assert.match(once, /EventSource/);
  assert.equal(once, twice);
});

test('writeRobotsTxt and writeSitemap create files', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-seo-'));
  const original = process.env.SITE_URL;
  process.env.SITE_URL = 'https://example.test';

  try {
    writeRobotsTxt(tempRoot);
    writeSitemap(tempRoot);

    const robots = fs.readFileSync(path.join(tempRoot, 'robots.txt'), 'utf8');
    const sitemap = fs.readFileSync(path.join(tempRoot, 'sitemap.xml'), 'utf8');

    assert.match(robots, /https:\/\/example\.test\/sitemap\.xml/);
    assert.match(sitemap, /https:\/\/example\.test\/landing\/about\.html/);
  } finally {
    if (original === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = original;
    }
  }
});
