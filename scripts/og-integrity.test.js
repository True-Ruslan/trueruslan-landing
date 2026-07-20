import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {checkSiteIntegrity} from './site-integrity.js';

function createFixture(withImage) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-og-integrity-'));
  fs.mkdirSync(path.join(root, 'assets', 'og'), {recursive: true});
  fs.writeFileSync(
    path.join(root, 'index.html'),
    '<!doctype html><html><head><meta property="og:image" content="https://example.test/assets/og/home.png" data-tr-local-path="/assets/og/home.png"></head><body></body></html>',
  );
  if (withImage) fs.writeFileSync(path.join(root, 'assets', 'og', 'home.png'), 'png');
  return root;
}

test('site integrity validates generated OpenGraph local target', () => {
  const result = checkSiteIntegrity(createFixture(true));
  assert.equal(result.referencesChecked, 1);
});

test('site integrity fails when generated OpenGraph local target is missing', () => {
  assert.throws(
    () => checkSiteIntegrity(createFixture(false)),
    /assets\/og\/home\.png/,
  );
});
