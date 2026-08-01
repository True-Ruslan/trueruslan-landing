import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const buildWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'build.yml'), 'utf8');
const staticWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'static.yml'), 'utf8');
const healthWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'external-health.yml'), 'utf8');
const packageManifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function assertOrdered(text, fragments, label) {
  let previous = -1;
  for (const fragment of fragments) {
    const index = text.indexOf(fragment);
    assert.notEqual(index, -1, `${label}: missing ${fragment}`);
    assert.ok(index > previous, `${label}: ${fragment} is out of order`);
    previous = index;
  }
}

test('Pages workflow exposes explicit auto legacy and custom site modes', () => {
  assert.match(staticWorkflow, /site_mode:/);
  assert.match(staticWorkflow, /description:\s*Production site deployment mode/);
  assert.match(staticWorkflow, /type:\s*choice/);
  assert.match(staticWorkflow, /default:\s*auto/);
  assert.match(staticWorkflow, /-\s*auto/);
  assert.match(staticWorkflow, /-\s*legacy/);
  assert.match(staticWorkflow, /-\s*custom/);
});

test('Pages workflow resolves repository site identity before analytics and build', () => {
  assert.match(staticWorkflow, /vars\.TR_PRODUCTION_SITE_URL/);
  assert.match(staticWorkflow, /SITE_DEPLOYMENT_MODE/);
  assert.match(staticWorkflow, /node scripts\/site-deployment\.js/);
  assertOrdered(staticWorkflow, [
    'npm test',
    'node scripts/site-deployment.js',
    'node scripts/analytics-deployment.js',
    'npm run build:docs',
    'actions/upload-pages-artifact@v3',
    'actions/deploy-pages@v4',
    'node scripts/production-smoke.js',
  ], 'Pages site deployment');
  assert.match(staticWorkflow, /EXPECTED_SITE_ORIGIN/);
  assert.match(staticWorkflow, /site-deployment-contract\.json/);
});

test('Pages workflow no longer derives canonical production identity from repository coordinates', () => {
  assert.doesNotMatch(staticWorkflow, /github\.repository_owner[^\n]*github\.io/);
  assert.doesNotMatch(staticWorkflow, /github\.event\.repository\.name/);
  assert.doesNotMatch(staticWorkflow, /PRODUCTION_URL:\s*\$\{\{\s*steps\.deployment\.outputs\.page_url/);
});

test('weekly health resolves the same site contract before analytics and checks', () => {
  assert.match(healthWorkflow, /vars\.TR_PRODUCTION_SITE_URL/);
  assert.match(healthWorkflow, /SITE_DEPLOYMENT_MODE:\s*auto/);
  assertOrdered(healthWorkflow, [
    'node scripts/site-deployment.js',
    'node scripts/analytics-deployment.js',
    'node scripts/external-health.js',
    'node scripts/production-smoke.js',
  ], 'Weekly site deployment monitoring');
  assert.match(healthWorkflow, /EXPECTED_SITE_ORIGIN/);
  assert.match(healthWorkflow, /site-deployment-contract\.json/);
  assert.doesNotMatch(healthWorkflow, /github\.repository_owner[^\n]*github\.io/);
  assert.doesNotMatch(healthWorkflow, /github\.event\.repository\.name/);
});

test('PR quality workflow verifies a real custom-domain artifact after the legacy browser matrix', () => {
  assertOrdered(buildWorkflow, [
    'npm run build:docs',
    'node scripts/visual-regression.cjs',
    'Verify custom domain artifact',
    'SITE_URL=https://trueruslan.ru npm run build:docs',
    'node scripts/site-artifact.js docs-html https://trueruslan.ru',
    'Preserve quality diagnostics',
  ], 'Dual-origin PR verification');
  assert.match(buildWorkflow, /custom-domain-build\.log/);
  assert.match(buildWorkflow, /custom-domain-integrity\.log/);
  assert.match(buildWorkflow, /custom-domain-artifact\.log/);
});

test('private package metadata does not own a duplicate production homepage', () => {
  assert.equal(packageManifest.private, true);
  assert.equal('homepage' in packageManifest, false);
});
