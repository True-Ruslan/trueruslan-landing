import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const staticWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'static.yml'), 'utf8');
const healthWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'external-health.yml'), 'utf8');

function assertOrdered(text, fragments, label) {
  let previous = -1;
  for (const fragment of fragments) {
    const index = text.indexOf(fragment);
    assert.notEqual(index, -1, `${label}: missing ${fragment}`);
    assert.ok(index > previous, `${label}: ${fragment} is out of order`);
    previous = index;
  }
}

test('Pages workflow exposes explicit auto required and disabled deployment modes', () => {
  assert.match(staticWorkflow, /analytics_mode:/);
  assert.match(staticWorkflow, /type:\s*choice/);
  assert.match(staticWorkflow, /default:\s*auto/);
  assert.match(staticWorkflow, /-\s*auto/);
  assert.match(staticWorkflow, /-\s*required/);
  assert.match(staticWorkflow, /-\s*disabled/);
});

test('Pages workflow resolves repository analytics configuration before build', () => {
  assert.match(staticWorkflow, /vars\.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN/);
  assert.match(staticWorkflow, /ANALYTICS_DEPLOYMENT_MODE/);
  assert.match(staticWorkflow, /ANALYTICS_SITE_TOKEN/);
  assertOrdered(staticWorkflow, [
    'node scripts/analytics-deployment.js',
    'npm run build:docs',
    'verifyAnalyticsArtifact',
    'actions/upload-pages-artifact@v3',
    'actions/deploy-pages@v4',
    'node scripts/production-smoke.js',
  ], 'Pages analytics activation');
});

test('Pages workflow preserves bounded activation and production reports', () => {
  assert.match(staticWorkflow, /ANALYTICS_EXPECTATION/);
  assert.match(staticWorkflow, /analytics-deployment-contract\.json/);
  assert.match(staticWorkflow, /production-smoke-report\.json/);
  assert.doesNotMatch(staticWorkflow, /testAnalyticsToken0123456789ABCDEF/);
});

test('weekly health reuses the same analytics configuration and production verifier', () => {
  assert.match(healthWorkflow, /npm ci/);
  assert.match(healthWorkflow, /vars\.TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN/);
  assertOrdered(healthWorkflow, [
    'node scripts/analytics-deployment.js',
    'node scripts/external-health.js',
    'node scripts/production-smoke.js',
  ], 'Weekly analytics monitoring');
  assert.match(healthWorkflow, /ANALYTICS_EXPECTATION/);
  assert.match(healthWorkflow, /analytics-deployment-contract\.json/);
  assert.match(healthWorkflow, /production-smoke-report\.json/);
  assert.doesNotMatch(healthWorkflow, /testAnalyticsToken0123456789ABCDEF/);
});
