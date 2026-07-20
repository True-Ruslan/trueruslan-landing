import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {checkSiteIntegrity, resolveLocalReference} from './site-integrity.js';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-integrity-'));
  fs.mkdirSync(path.join(root, 'landing'), {recursive: true});
  fs.mkdirSync(path.join(root, 'assets', 'documents'), {recursive: true});
  fs.mkdirSync(path.join(root, 'assets', 'images'), {recursive: true});
  fs.writeFileSync(path.join(root, 'index.html'), '<!doctype html><html><body></body></html>');
  fs.writeFileSync(path.join(root, 'assets', 'documents', 'cv.pdf'), 'pdf');
  fs.writeFileSync(path.join(root, 'assets', 'images', 'avatar.png'), 'png');
  return root;
}

test('resolveLocalReference strips query/hash and resolves nested paths', () => {
  const root = '/tmp/site';
  const html = '/tmp/site/landing/resume.html';

  assert.equal(
    resolveLocalReference('../assets/documents/cv.pdf?download=1#page=1', html, root),
    '/tmp/site/assets/documents/cv.pdf',
  );
  assert.equal(resolveLocalReference('/assets/images/avatar.png', html, root), '/tmp/site/assets/images/avatar.png');
  assert.equal(resolveLocalReference('#section', html, root), null);
  assert.equal(resolveLocalReference('https://example.com/file.pdf', html, root), null);
  assert.equal(resolveLocalReference('about:blank', html, root), null);
});

test('checkSiteIntegrity validates nested html, images, scripts and pdf iframe targets', () => {
  const root = fixture();
  fs.writeFileSync(
    path.join(root, 'landing', 'resume.html'),
    `<!doctype html><html><head>
      <link rel="stylesheet" href="../assets/site.css">
    </head><body>
      <a href="../index.html#top">Home</a>
      <img src="../assets/images/avatar.png">
      <iframe src="../assets/documents/cv.pdf"></iframe>
      <script src="../assets/app.js"></script>
    </body></html>`,
  );
  fs.writeFileSync(path.join(root, 'assets', 'site.css'), 'body{}');
  fs.writeFileSync(path.join(root, 'assets', 'app.js'), '');

  const result = checkSiteIntegrity(root);
  assert.equal(result.htmlFiles, 2);
  assert.equal(result.referencesChecked, 5);
});

test('checkSiteIntegrity reports all missing local references with source context', () => {
  const root = fixture();
  fs.writeFileSync(
    path.join(root, 'landing', 'broken.html'),
    '<!doctype html><html><body><img src="../assets/missing.png"><a href="missing.html">Missing</a></body></html>',
  );

  assert.throws(
    () => checkSiteIntegrity(root),
    (error) => {
      assert.match(error.message, /landing\/broken\.html/);
      assert.match(error.message, /assets\/missing\.png/);
      assert.match(error.message, /landing\/missing\.html/);
      return true;
    },
  );
});
