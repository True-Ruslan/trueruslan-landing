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
  assert.match(workflow, /environment: ai8-public-full-production\n\n    steps:/);
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

test('AI-8 provisioning keeps provider and deployment secrets out of provider-free steps', () => {
  const workflow = read('.github/workflows/ai-navigator-ai8-production-provision.yml');

  const installStep = workflow.match(/      - name: Install dependencies[\s\S]*?(?=\n      - name:)/)?.[0] || '';
  const contractStep = workflow.match(/      - name: Re-prove provider-free AI-8 provisioning contracts[\s\S]*?(?=\n      - name:)/)?.[0] || '';
  const restoreStep = workflow.match(/      - name: Restore exact accepted AI index[\s\S]*?(?=\n      - name:)/)?.[0] || '';
  const dryRunStep = workflow.match(/      - name: Wrangler dry run[\s\S]*?(?=\n      - name:)/)?.[0] || '';
  const deployStep = workflow.match(/      - name: Deploy dedicated AI-8 production Worker[\s\S]*?(?=\n      - name:)/)?.[0] || '';
  const verifyStep = workflow.match(/      - name: Verify provisioned Worker before public activation[\s\S]*?(?=\n      - name:)/)?.[0] || '';

  for (const step of [installStep, contractStep, restoreStep]) {
    assert.ok(step, 'provider-free step must exist');
    assert.doesNotMatch(step, /secrets\./);
    assert.doesNotMatch(step, /CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|OPENROUTER_AI8_API_KEY|AI8_FULL_WORKER_BASE_URL/);
  }

  for (const step of [dryRunStep, deployStep]) {
    assert.ok(step, 'deployment step must exist');
    assert.match(step, /CLOUDFLARE_API_TOKEN: \$\{\{ secrets\.CLOUDFLARE_API_TOKEN \}\}/);
    assert.match(step, /CLOUDFLARE_ACCOUNT_ID: \$\{\{ secrets\.CLOUDFLARE_ACCOUNT_ID \}\}/);
    assert.doesNotMatch(step, /OPENROUTER_AI8_API_KEY: \$\{\{ secrets\./);
  }

  assert.ok(verifyStep, 'verification step must exist');
  assert.match(verifyStep, /OPENROUTER_AI8_API_KEY: \$\{\{ secrets\.OPENROUTER_AI8_API_KEY \}\}/);
  assert.match(verifyStep, /AI8_FULL_WORKER_BASE_URL: \$\{\{ secrets\.AI8_FULL_WORKER_BASE_URL \}\}/);
  assert.doesNotMatch(verifyStep, /CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID/);
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
