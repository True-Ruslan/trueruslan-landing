import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, 'production-p3-5c-english-publications-smoke.cjs'), 'utf8');
const routes = fs.readFileSync(path.join(__dirname, 'production-live-routes.cjs'), 'utf8');
const workflow = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'production-live.yml'), 'utf8');

test('P3.5C production smoke pins English Publications route, canonical identities, structural presentation, no-JS and search', () => {
  assert.match(routes, /PUBLICATIONS_PATH = 'landing\/publications\/'/);
  assert.match(routes, /PUBLICATIONS_EN_PATH = 'en\/publications\/'/);
  assert.match(source, /PUBLICATIONS_URL/);
  assert.match(source, /PUBLICATIONS_EN_URL/);
  assert.match(source, /publication\.canonicalUrl/);
  assert.match(source, /titleLanguage === publication\.language/);
  assert.match(source, /publication\.en\.summary/);
  assert.match(source, /assertEnglishPresentation/);
  assert.match(source, /\.tr-publication-card__topics\[aria-label=\\?"Topics\\?"\]/);
  assert.match(source, /\.tr-publication-card__meta span:last-child/);
  assert.match(source, /text\.trim\(\) === 'Author'/);
  assert.match(source, /Read on Habr/);
  assert.match(source, /August 23, 2025/);
  assert.match(source, /data-tr-publications-noscript=\\?"en\\?"/);
  assert.match(source, /multi-page site with Diplodoc/);
  assert.match(source, /en\/publications\//);
  assert.match(source, /LEGACY_ORIGIN/);
  assert.doesNotMatch(source, /bodyText\.includes\('Author'\)/);
});

test('P3.5C production smoke remains deployment-only in Production Live workflow', () => {
  assert.match(workflow, /Run deployed P3\.5C English Publications smoke/);
  assert.match(workflow, /Run deployed P3\.5C English Publications smoke\n\s+if: github\.event_name != 'pull_request'/);
  assert.match(workflow, /run: node scripts\/production-p3-5c-english-publications-smoke\.cjs/);
});
