import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relative) => fs.readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');

const publicConfig = JSON.parse(read('data/ai-navigator.json'));

test('AI-8 production provisioning is manual, master-only, environment-scoped and cannot activate FULL', () => {
  const workflow = read('.github/workflows/ai-navigator-ai8-production-provision.yml');

  assert.match(workflow, /^name: AI Navigator AI-8 Production Provision$/m);
  assert.match(workflow, /on:\n  workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^  (?:push|pull_request|schedule):/m);
  assert.match(workflow, /confirm_provision:[\s\S]*?type: boolean[\s\S]*?default: false/);
  assert.match(workflow, /permissions:\n  contents: read/);
  assert.match(workflow, /environment: ai8-public-full-production/);
  assert.match(workflow, /refs\/heads\/master/);
  assert.match(workflow, /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID: \$\{\{ secrets\.CLOUDFLARE_ACCOUNT_ID \}\}/);
  assert.match(workflow, /OPENROUTER_AI8_API_KEY: \$\{\{ secrets\.OPENROUTER_AI8_API_KEY \}\}/);
  assert.match(workflow, /AI8_FULL_WORKER_BASE_URL: \$\{\{ secrets\.AI8_FULL_WORKER_BASE_URL \}\}/);

  assert.match(workflow, /wrangler@4\.120\.0 deploy[\s\S]*?--dry-run/);
  assert.match(workflow, /wrangler@4\.120\.0 deploy[\s\S]*?--strict/);
  assert.match(workflow, /--config infra\/cloudflare\/wrangler\.ai8-full-production\.jsonc/);
  assert.match(workflow, /--env ai8-full-production/);
  assert.match(workflow, /--secrets-file/);
  assert.match(workflow, /node scripts\/ai8-production-provisioning-verify\.js/);
  assert.match(workflow, /retention-days: 90/);

  assert.doesNotMatch(workflow, /data\/ai-navigator\.json\s*>/);
  assert.doesNotMatch(workflow, /git\s+(?:push|commit|checkout)/i);
  assert.doesNotMatch(workflow, /wrangler\s+delete/i);

  assert.equal(publicConfig.mode, 'search');
  assert.equal(
    publicConfig.workerBaseUrl,
    'https://trueruslan-ai-navigator-ai6-search-canary.trueruslan.workers.dev',
  );
});

test('AI-8 provisioning runbook keeps deploy evidence separate from public activation', () => {
  const runbook = read('docs/acceptance/ai-navigator-ai8-production-full.md');

  for (const phrase of [
    'AI Navigator AI-8 Production Provision',
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
    'OPENROUTER_AI8_API_KEY',
    'AI8_FULL_WORKER_BASE_URL',
    'pre-activation',
    'activation is a separate',
    '4.120.0',
  ]) {
    assert.match(runbook, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});
