import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const CONFIG_PATH = new URL('../infra/cloudflare/wrangler.ai7-full-canary.jsonc', import.meta.url);
const RUNBOOK_PATH = new URL('../docs/acceptance/ai-navigator-ai7-worker-provisioning.md', import.meta.url);
const EXPECTED_VARS = {
  AI_ENABLED: 'true',
  AI_MODE: 'full',
  AI_ANSWER_ENABLED: 'true',
  AI_ALLOWED_ORIGIN: 'https://trueruslan.ru',
  AI_CORPUS_ORIGIN: 'https://trueruslan.ru',
  AI_EMBEDDING_MODEL: 'openai/text-embedding-3-small',
  AI_EMBEDDING_DIMENSIONS: '512',
  AI_ANSWER_MODEL: 'google/gemini-2.5-flash-lite',
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

test('AI-7 Wrangler config is isolated and fails closed outside the named FULL canary environment', () => {
  const config = loadConfig();
  assert.equal(config.main, './ai-navigator-runtime.mjs');
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.deepEqual(config.compatibility_flags, ['global_fetch_strictly_public']);
  assertNoRoutes(config);
  assert.equal(config.vars, undefined, 'top-level Worker must not receive enabled AI vars');

  const canary = config.env?.['ai7-full-canary'];
  assert.ok(canary, 'named AI-7 FULL canary environment is required');
  assert.equal(canary.workers_dev, true);
  assert.equal(canary.preview_urls, false);
  assert.deepEqual(canary.vars, EXPECTED_VARS);
  assert.deepEqual(canary.secrets?.required, ['OPENROUTER_API_KEY']);
});

test('AI-7 Wrangler config stores no credential and enables answers only inside FULL canary', () => {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const config = JSON.parse(raw);
  assert.equal(raw.includes('OPENROUTER_API_KEY='), false);
  assert.equal(raw.includes('sk-or-'), false);
  assert.equal(config.vars, undefined);
  assert.equal(config.env['ai7-full-canary'].vars.AI_MODE, 'full');
  assert.equal(config.env['ai7-full-canary'].vars.AI_ENABLED, 'true');
  assert.equal(config.env['ai7-full-canary'].vars.AI_ANSWER_ENABLED, 'true');
  assert.equal(config.env['ai7-full-canary'].vars.AI_ANSWER_MODEL, 'google/gemini-2.5-flash-lite');
});

test('AI-7 operator runbook pins isolated provisioning and preserves SEARCH as public baseline', () => {
  const runbook = fs.readFileSync(RUNBOOK_PATH, 'utf8');
  assert.match(runbook, /wrangler@4\.118\.0/u);
  assert.match(runbook, /--config infra\/cloudflare\/wrangler\.ai7-full-canary\.jsonc/u);
  assert.match(runbook, /--env ai7-full-canary/u);
  assert.match(runbook, /--secrets-file infra\/cloudflare\/\.dev\.vars\.ai7-full-canary/u);
  assert.match(runbook, /--dry-run/u);
  assert.match(runbook, /--strict/u);
  assert.match(runbook, /wrangler@4\.118\.0 delete/u);
  assert.match(runbook, /confirm_full_canary=true/u);
  assert.match(runbook, /PUBLIC SEARCH/u);
  assert.match(runbook, /FULL[^\n]*not[^\n]*production/iu);
  assert.match(runbook, /global_fetch_strictly_public/u);
  assert.match(runbook, /public(?: Internet| front door)/iu);
  assert.doesNotMatch(runbook, /sk-or-/u);
});
