import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const TARGETS_PATH = path.join(ROOT, 'data', 'distribution-targets.json');
const EXTERNAL_PATH = path.join(ROOT, 'data', 'external-links.json');
const PAGE_META_PATH = path.join(ROOT, 'data', 'page-meta.json');
const MODULE_PATH = path.join(ROOT, 'scripts', 'distribution-readiness.js');
const RUNBOOK_PATH = path.join(ROOT, 'docs', 'DISTRIBUTION.md');
const WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'distribution-readiness.yml');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function loadModule() {
  assert.ok(fs.existsSync(MODULE_PATH), 'missing distribution readiness module');
  return import('./distribution-readiness.js');
}

test('canonical distribution targets resolve only through page metadata', async () => {
  assert.ok(fs.existsSync(TARGETS_PATH), 'missing distribution target registry');
  const api = await loadModule();
  const rawTargets = readJson(TARGETS_PATH);
  const pageMeta = readJson(PAGE_META_PATH);

  assert.equal(rawTargets.length, 8);
  assert.ok(rawTargets.every((target) => !Object.hasOwn(target, 'title')));
  assert.ok(rawTargets.every((target) => !Object.hasOwn(target, 'description')));
  assert.ok(rawTargets.every((target) => !Object.hasOwn(target, 'url')));

  const targets = api.validateDistributionTargets(rawTargets, {pageMeta});
  const resolved = api.resolveDistributionTargets(targets, pageMeta, 'https://trueruslan.ru');

  assert.equal(resolved.length, 8);
  assert.equal(new Set(resolved.map(({id}) => id)).size, resolved.length);
  assert.equal(new Set(resolved.map(({pagePath}) => pagePath)).size, resolved.length);
  assert.deepEqual(resolved.map(({priority}) => priority), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.ok(resolved.every(({canonicalUrl}) => {
    const parsed = new URL(canonicalUrl);
    return parsed.protocol === 'https:'
      && parsed.hostname === 'trueruslan.ru'
      && parsed.search === ''
      && parsed.hash === '';
  }));
});

test('external profile audit exposes the fresh three-verified one-stale snapshot', async () => {
  const api = await loadModule();
  const entries = readJson(EXTERNAL_PATH);
  const profiles = api.validateExternalProfileAudit(entries);
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));

  for (const id of ['github-profile', 'habr-profile', 'telegram-personal']) {
    assert.equal(byId.get(id)?.distributionState, 'verified');
    assert.match(byId.get(id)?.verificationScope ?? '', /canonical.*trueruslan\.ru|trueruslan\.ru.*canonical/i);
    assert.doesNotMatch(byId.get(id)?.verificationScope ?? '', /legacy|github pages/i);
  }

  assert.equal(byId.get('telegram-blog')?.distributionState, 'stale');
  assert.match(byId.get('telegram-blog')?.verificationScope ?? '', /legacy|github pages/i);
  assert.match(byId.get('telegram-blog')?.requiredAction ?? '', /https:\/\/trueruslan\.ru\//i);

  const summary = api.buildDistributionSummary({targets: [], profiles});
  assert.deepEqual(summary.profileStateCounts, {
    verified: 3,
    stale: 1,
    unverified: 0,
  });
});

test('tracked distribution runbook is deterministic and registry-backed', async () => {
  assert.ok(fs.existsSync(RUNBOOK_PATH), 'missing tracked distribution runbook');
  const api = await loadModule();
  const rawTargets = readJson(TARGETS_PATH);
  const pageMeta = readJson(PAGE_META_PATH);
  const externalLinks = readJson(EXTERNAL_PATH);
  const targets = api.validateDistributionTargets(rawTargets, {pageMeta});
  const resolved = api.resolveDistributionTargets(targets, pageMeta, 'https://trueruslan.ru');
  const profiles = api.validateExternalProfileAudit(externalLinks);
  const expected = api.renderDistributionRunbook({targets: resolved, profiles});

  assert.equal(fs.readFileSync(RUNBOOK_PATH, 'utf8'), expected);
  assert.match(expected, /GitHub.*verified/is);
  assert.match(expected, /Habr.*verified/is);
  assert.match(expected, /### Telegram — verified/is);
  assert.match(expected, /Telegram Blog.*stale/is);
  assert.match(expected, /post-update verification/i);
  assert.doesNotMatch(expected, /utm_|session replay|automatic posting/i);
});

test('distribution workflow is read-only, path-scoped and artifact-producing', () => {
  assert.ok(fs.existsSync(WORKFLOW_PATH), 'missing distribution readiness workflow');
  const workflow = fs.readFileSync(WORKFLOW_PATH, 'utf8');

  assert.match(workflow, /^name: Distribution Readiness$/m);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /pull_request:/);
  for (const controlledPath of [
    'data/distribution-targets.json',
    'data/external-links.json',
    'data/page-meta.json',
    'scripts/distribution-readiness.js',
    'scripts/distribution-readiness.test.js',
    'docs/DISTRIBUTION.md',
  ]) {
    assert.ok(workflow.includes(controlledPath), `missing workflow path: ${controlledPath}`);
  }
  assert.match(workflow, /contents:\s*read/);
  assert.doesNotMatch(workflow, /contents:\s*write|issues:\s*write|deployments:\s*write/);
  assert.match(workflow, /distribution-readiness\.js/);
  assert.match(workflow, /--check-runbook/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/i);
  assert.match(workflow, /name:\s*distribution-readiness-evidence/);
  assert.match(workflow, /retention-days:\s*30/);
  assert.doesNotMatch(workflow, /\bgit\s+(?:commit|push)\b|npm\s+audit\s+fix/);
});
