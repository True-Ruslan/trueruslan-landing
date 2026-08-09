import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'production-live.yml');
const ROUTES = path.join(ROOT, 'scripts', 'production-live-routes.cjs');
const SMOKE = path.join(ROOT, 'scripts', 'production-clean-urls-note-smoke.cjs');

test('deployment-only P3.4B smoke covers clean route legacy compatibility feed and search', () => {
  assert.ok(fs.existsSync(WORKFLOW), 'missing Production Live Smoke workflow');
  assert.ok(fs.existsSync(ROUTES), 'missing production route contract');
  assert.ok(fs.existsSync(SMOKE), 'missing deployment-only P3.4B smoke');

  const workflow = fs.readFileSync(WORKFLOW, 'utf8');
  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${fs.readFileSync(SMOKE, 'utf8')}`;

  assert.ok(workflow.includes('scripts/production-clean-urls-note-smoke.cjs'));
  assert.match(
    workflow,
    /name: Run deployed P3\.4B Clean URLs Note smoke\s*\n\s*if: github\.event_name != 'pull_request'/,
  );
  assert.match(workflow, /node scripts\/production-clean-urls-note-smoke\.cjs/);

  for (const marker of [
    'notes/clean-urls-without-cloudflare-routing/',
    'Как clean URLs заработали на GitHub Pages без Cloudflare routing',
    'main.dc-doc-page__content',
    'repository-native directory URLs',
    'publishDirectoryRoutes',
    'router.pathname',
    'router.depth',
    'canonical',
    'hreflang',
    'OpenGraph',
    'Sitemap',
    'Atom feed',
    'generated search',
    'DNS/CDN/analytics',
    'application router',
    'HTTP 301',
    'noindex,follow',
    'query',
    'fragment',
    'PR #114',
    'PR #115',
    'search-engine observation',
    'clean-urls-note-production-summary.json',
  ]) {
    assert.ok(source.includes(marker), `missing deployed P3.4B marker: ${marker}`);
  }

  assert.doesNotMatch(fs.readFileSync(SMOKE, 'utf8'), /page\.locator\(['"]main['"]\)\.innerText/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /link\[rel="canonical"\]/);
  assert.match(source, /meta\[property="og:url"\]/);
  assert.match(source, /feed\.xml/);
  assert.match(source, /page\.screenshot/);
  assert.match(source, /queryPreserved/);
  assert.match(source, /fragmentPreserved/);
});
