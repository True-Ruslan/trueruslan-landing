import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relative) => fs.readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');

const publicConfig = JSON.parse(read('data/ai-navigator.json'));
const ai7Config = JSON.parse(read('infra/cloudflare/wrangler.ai7-full-canary.jsonc'));

test('AI-8 preparation keeps the accepted public SEARCH baseline untouched', () => {
  assert.equal(publicConfig.mode, 'search');
  assert.equal(
    publicConfig.workerBaseUrl,
    'https://trueruslan-ai-navigator-ai6-search-canary.trueruslan.workers.dev',
  );
});

test('AI-8 has an isolated production FULL Worker contract without route takeover', () => {
  const config = JSON.parse(read('infra/cloudflare/wrangler.ai8-full-production.jsonc'));
  const production = config.env?.['ai8-full-production'];
  const canary = ai7Config.env?.['ai7-full-canary'];

  assert.equal(config.main, './ai-navigator-ai8-runtime.mjs');
  assert.equal(config.workers_dev, false);
  assert.equal(config.preview_urls, false);
  assert.equal('route' in config, false);
  assert.equal('routes' in config, false);

  assert.ok(production);
  assert.equal(production.name, 'trueruslan-ai-navigator-ai8-full-production');
  assert.notEqual(production.name, canary?.name);
  assert.equal(production.workers_dev, true);
  assert.equal(production.preview_urls, false);
  assert.equal('route' in production, false);
  assert.equal('routes' in production, false);
  assert.equal(production.vars?.AI_ENABLED, 'true');
  assert.equal(production.vars?.AI_MODE, 'full');
  assert.equal(production.vars?.AI_ANSWER_ENABLED, 'true');
  assert.equal(production.vars?.AI_ALLOWED_ORIGIN, 'https://trueruslan.ru');
  assert.equal(production.vars?.AI_EMBEDDING_MODEL, publicConfig.embeddingModel);
  assert.equal(production.vars?.AI_EMBEDDING_DIMENSIONS, String(publicConfig.embeddingDimensions));
  assert.equal(production.vars?.AI_ANSWER_MODEL, publicConfig.answerModel);
  assert.deepEqual(production.secrets?.required, ['OPENROUTER_API_KEY']);
});

test('AI-8 public FULL acceptance is manual, read-only, master-only and environment-scoped', () => {
  const workflow = read('.github/workflows/ai-navigator-public-full-acceptance.yml');

  assert.match(workflow, /^name: AI Navigator Public FULL Acceptance$/m);
  assert.match(workflow, /on:\n  workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^  (?:push|pull_request|schedule):/m);
  assert.match(workflow, /confirm_public_full:[\s\S]*?type: boolean[\s\S]*?default: false/);
  assert.match(workflow, /permissions:\n  contents: read/);
  assert.match(workflow, /environment: ai8-public-full-production/);
  assert.match(workflow, /refs\/heads\/master/);
  assert.match(workflow, /AI8_FULL_WORKER_BASE_URL: \$\{\{ secrets\.AI8_FULL_WORKER_BASE_URL \}\}/);
  assert.match(workflow, /OPENROUTER_AI8_API_KEY: \$\{\{ secrets\.OPENROUTER_AI8_API_KEY \}\}/);
  assert.match(workflow, /node scripts\/ai8-public-full-acceptance\.js/);

  assert.doesNotMatch(workflow, /wrangler\s+(?:deploy|delete|secret|versions)/i);
  assert.doesNotMatch(workflow, /git\s+(?:push|commit|checkout)/i);
  assert.doesNotMatch(workflow, /data\/ai-navigator\.json\s*>/);
});

test('AI-8 preparation documents explicit deploy, verification, rollback and activation boundaries', () => {
  const runbook = read('docs/acceptance/ai-navigator-ai8-production-full.md');
  for (const phrase of [
    'Dry run',
    'Deploy',
    'Verification',
    'Rollback to SEARCH',
    'Activation boundary',
    'AI8_FULL_WORKER_BASE_URL',
    'OPENROUTER_AI8_API_KEY',
  ]) {
    assert.match(runbook, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});
