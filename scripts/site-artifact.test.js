import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {verifySiteArtifact} from './site-artifact.js';

function write(root, relativePath, content) {
  const target = path.join(root, ...relativePath.split('/'));
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, content, 'utf8');
}

function fixture({origin, staleOrigin = null} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-artifact-'));
  const base = origin.replace(/\/$/, '');
  const stale = staleOrigin ? `<meta property="og:url" content="${staleOrigin}/">` : '';
  write(root, 'index.html', `<!doctype html><html><head><link rel="canonical" href="${base}/">${stale}<link rel="alternate" hreflang="en" href="${base}/en/"><script type="application/ld+json">{"url":"${base}/"}</script></head></html>`);
  write(root, 'en/index.html', `<!doctype html><html><head><link rel="canonical" href="${base}/en/"><link rel="alternate" hreflang="ru" href="${base}/"></head></html>`);
  write(root, 'robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
  write(root, 'sitemap.xml', `<?xml version="1.0"?><urlset><url><loc>${base}/</loc></url><url><loc>${base}/en/</loc></url></urlset>`);
  write(root, 'feed.xml', `<?xml version="1.0"?><feed><id>${base}/feed.xml</id><link href="${base}/feed.xml" rel="self"/><link href="${base}/landing/notes/"/></feed>`);
  return root;
}

test('site artifact accepts exact custom root public identity', () => {
  const outputDir = fixture({origin: 'https://trueruslan.ru'});
  const result = verifySiteArtifact(outputDir, {
    expectedOrigin: 'https://trueruslan.ru',
    forbiddenOrigin: 'https://true-ruslan.github.io/trueruslan-landing',
  });

  assert.equal(result.ok, true);
  assert.equal(result.expectedOrigin, 'https://trueruslan.ru');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.checkedFiles, [
    'index.html',
    'en/index.html',
    'robots.txt',
    'sitemap.xml',
    'feed.xml',
  ]);
});

test('site artifact accepts a legacy subpath identity', () => {
  const origin = 'https://true-ruslan.github.io/trueruslan-landing';
  const outputDir = fixture({origin});
  const result = verifySiteArtifact(outputDir, {
    expectedOrigin: origin,
    forbiddenOrigin: 'https://trueruslan.ru',
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('site artifact rejects public html routes in sitemap and feed', () => {
  const outputDir = fixture({origin: 'https://trueruslan.ru'});
  write(outputDir, 'sitemap.xml', '<?xml version="1.0"?><urlset><url><loc>https://trueruslan.ru/landing/projects.html</loc></url><url><loc>https://trueruslan.ru/</loc></url><url><loc>https://trueruslan.ru/en/</loc></url></urlset>');
  write(outputDir, 'feed.xml', '<?xml version="1.0"?><feed><id>https://trueruslan.ru/feed.xml</id><link href="https://trueruslan.ru/feed.xml" rel="self"/><link href="https://trueruslan.ru/landing/notes.html"/></feed>');

  const result = verifySiteArtifact(outputDir, {
    expectedOrigin: 'https://trueruslan.ru',
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /sitemap\.xml contains a public \.html route/i);
  assert.match(result.errors.join(' '), /feed\.xml contains a public \.html route/i);
});

test('site artifact reports missing files, stale origins and wrong canonical routes', () => {
  const outputDir = fixture({
    origin: 'https://trueruslan.ru',
    staleOrigin: 'https://true-ruslan.github.io/trueruslan-landing',
  });
  fs.unlinkSync(path.join(outputDir, 'feed.xml'));
  write(outputDir, 'en/index.html', '<!doctype html><html><head><link rel="canonical" href="https://trueruslan.ru/wrong/"></head></html>');

  const result = verifySiteArtifact(outputDir, {
    expectedOrigin: 'https://trueruslan.ru',
    forbiddenOrigin: 'https://true-ruslan.github.io/trueruslan-landing',
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /forbidden origin/i);
  assert.match(result.errors.join(' '), /en\/index\.html canonical/i);
  assert.match(result.errors.join(' '), /feed\.xml is missing/i);
});
