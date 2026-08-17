import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const CONFIG_PATH = new URL('../infra/cloudflare/wrangler.ai6-search-canary.jsonc', import.meta.url);
const GITIGNORE_PATH = new URL('../.gitignore', import.meta.url);
const RUNBOOK_PATH = new URL('../docs/acceptance/ai-navigator-ai6-worker-provisioning.md', import.meta.url);
const EXPECTED_VARS = {
  AI_ENABLED: 'true',
  AI_MODE: 'search',
  AI_ALLOWED_ORIGIN: 'https://trueruslan.ru',
  AI_CORPUS_ORIGIN: 'https://trueruslan.ru',
  AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
  AI_EMBEDDING_DIMENSIONS: '512',
};

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function assertNoRoutes(value, path = 'config') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.notEqual(key, 'route', `${path} must not declare a production route`);
    assert.notEqual(key, 'routes', `${path} must not declare production routes`);
    if (child && typeof child === 'object') assertNoRoutes(child, `${path}.${key}`);
  }
}

test('AI-6 Wrangler config is isolated and fails closed outside the named canary environment', () => {
  const config = loadConfig();
  assert.equal(config.main, './ai-navigator-runtime.mjs');
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assertNoRoutes(config);
  assert.equal(config.vars, undefined, 'top-level Worker must not receive enabled AI vars');

  const canary = config.env?.['ai6-search-canary'];
  assert.ok(canary, 'named AI-6 canary environment is required');
  assert.equal(canary.workers_dev, true);
  assert.equal(canary.preview_urls, false);
  assert.deepEqual(canary.vars, EXPECTED_VARS);
  assert.deepEqual(canary.secrets?.required, ['OPENROUTER_API_KEY']);
});

test('AI-6 Wrangler config never stores provider credentials or enables FULL mode', () => {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const config = JSON.parse(raw);
  assert.equal(raw.includes('OPENROUTER_API_KEY='), false);
  assert.equal(raw.includes('sk-or-'), false);
  assert.equal(config.env['ai6-search-canary'].vars.AI_MODE, 'search');
  assert.equal(config.env['ai6-search-canary'].vars.AI_ENABLED, 'true');
  assert.equal(config.env['ai6-search-canary'].vars.AI_ANSWER_MODEL, undefined);
});

test('AI-6 local secret and Wrangler state files are gitignored', () => {
  const ignored = new Set(
    fs.readFileSync(GITIGNORE_PATH, 'utf8')
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter(Boolean),
  );

  assert.ok(ignored.has('.dev.vars*'));
  assert.ok(ignored.has('.env*'));
  assert.ok(ignored.has('.wrangler/'));
});

test('AI-6 operator runbook pins the isolated config and preserves the acceptance boundary', () => {
  const runbook = fs.readFileSync(RUNBOOK_PATH, 'utf8');
  assert.match(runbook, /wrangler@4\.118\.0/u);
  assert.match(runbook, /--config infra\/cloudflare\/wrangler\.ai6-search-canary\.jsonc/u);
  assert.match(runbook, /--env ai6-search-canary/u);
  assert.match(runbook, /--secrets-file infra\/cloudflare\/\.dev\.vars\.ai6-search-canary/u);
  assert.match(runbook, /--dry-run/u);
  assert.match(runbook, /--strict/u);
  assert.match(runbook, /wrangler@4\.118\.0 delete/u);
  assert.match(runbook, /confirm_search_canary=true/u);
  assert.match(runbook, /PUBLIC AI OFF/u);
  assert.doesNotMatch(runbook, /sk-or-/u);
});
