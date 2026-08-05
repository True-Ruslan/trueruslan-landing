import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'production-live.yml');
const SMOKE = path.join(ROOT, 'scripts', 'production-live-smoke.cjs');
const ROUTES = path.join(ROOT, 'scripts', 'production-live-routes.cjs');

test('live production workflow is read-only, deployment-aware and artifact-producing', () => {
  assert.ok(fs.existsSync(WORKFLOW), 'missing live production workflow');
  const workflow = fs.readFileSync(WORKFLOW, 'utf8');

  assert.match(workflow, /^name: Production Live Smoke$/m);
  assert.match(workflow, /push:/);
  assert.match(workflow, /branches:\s*\n\s*- master/);
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /workflows:\s*\n\s*- ['"]?Deploy static content to Pages['"]?/);
  assert.match(workflow, /types:\s*\n\s*- completed/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /pull_request:/);
  for (const controlledPath of [
    '.github/workflows/production-live.yml',
    'scripts/production-live-smoke.cjs',
    'scripts/production-live-routes.cjs',
    'scripts/production-live-routes.test.js',
    'scripts/production-live-workflow.test.js',
  ]) {
    assert.ok(workflow.includes(controlledPath), `missing live-production PR path: ${controlledPath}`);
  }

  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /pages:\s*read/);
  assert.match(workflow, /deployments:\s*read/);
  assert.doesNotMatch(workflow, /contents:\s*write|issues:\s*write|deployments:\s*write|actions:\s*write/);
  assert.match(workflow, /actions\/github-script@[0-9a-f]{40}/i);
  assert.match(workflow, /GET \/repos\/\{owner\}\/\{repo\}\/deployments/);
  assert.match(workflow, /GET \/repos\/\{owner\}\/\{repo\}\/deployments\/\{deployment_id\}\/statuses/);
  assert.match(workflow, /github-pages/);
  assert.match(workflow, /deployment\.sha/);
  assert.match(workflow, /github\.event\.workflow_run\.head_sha/);
  assert.match(workflow, /github\.event\.workflow_run\.conclusion/);
  assert.match(workflow, /EXACT_DEPLOYMENT/);
  assert.match(workflow, /EXPECTED_SHA/);
  assert.match(workflow, /playwright@1\.61\.1/);
  assert.match(workflow, /install --with-deps chromium/);
  assert.match(workflow, /production-live-smoke\.cjs/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/i);
  assert.match(workflow, /name:\s*production-live-evidence/);
  assert.match(workflow, /retention-days:\s*30/);
  assert.doesNotMatch(workflow, /\bgit\s+(?:commit|push)\b|npm\s+audit\s+fix/);
});

test('live production smoke covers domain, clean routes, legacy compatibility, feed, search and telemetry boundaries', () => {
  assert.ok(fs.existsSync(SMOKE), 'missing live production smoke script');
  assert.ok(fs.existsSync(ROUTES), 'missing live production route contract');
  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${fs.readFileSync(SMOKE, 'utf8')}`;

  for (const marker of [
    'https://trueruslan.ru/',
    'https://www.trueruslan.ru/',
    'restart-persistence-is-a-product-contract/',
    'restart-persistence-is-a-product-contract.html',
    'feed.xml',
    '_search/ru/',
    'persistence contract',
    'static.cloudflareinsights.com/beacon.min.js',
    'true-ruslan.github.io/trueruslan-landing',
    'link[rel="canonical"]',
    'meta[property="og:url"]',
  ]) {
    assert.ok(source.includes(marker), `missing live smoke marker: ${marker}`);
  }

  assert.match(source, /production-artifacts/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /page\.screenshot/);
  assert.match(source, /writeFileSync/);
  assert.match(source, /queryPreserved/);
  assert.match(source, /fragmentPreserved/);
});
