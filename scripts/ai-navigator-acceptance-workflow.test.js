import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'ai-navigator-acceptance.yml');

function workflowSource() {
  return fs.readFileSync(WORKFLOW_PATH, 'utf8');
}

test('real AI acceptance workflow is manual-only, read-only and explicitly confirms provider calls', () => {
  const workflow = workflowSource();

  assert.match(workflow, /name: AI Navigator Real Acceptance/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /pull_request:|push:|schedule:/);
  assert.match(workflow, /confirm_provider_calls:/);
  assert.match(workflow, /type: boolean/);
  assert.match(workflow, /default: false/);
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.doesNotMatch(workflow, /contents: write|issues: write|pull-requests: write|deployments: write|pages: write/);
  assert.doesNotMatch(workflow, /git push|gh pr|wrangler deploy|actions\/deploy-pages|actions\/upload-pages-artifact/);
});

test('provider credential is scoped only to refresh steps and never reaches offline benchmark', () => {
  const workflow = workflowSource();

  assert.doesNotMatch(workflow, /^env:\s*$|^\s{4}env:\s*$/m, 'provider secret must not be workflow- or job-scoped');
  assert.equal((workflow.match(/OPENROUTER_API_KEY:\s*\$\{\{ secrets\.OPENROUTER_API_KEY \}\}/g) || []).length, 2);
  assert.match(workflow, /name: Refresh document embeddings[\s\S]*?OPENROUTER_API_KEY:[\s\S]*?node scripts\/ai-index\.js/);
  assert.match(workflow, /name: Refresh benchmark query embeddings[\s\S]*?OPENROUTER_API_KEY:[\s\S]*?node scripts\/ai-benchmark-embeddings\.js/);

  const offlineStart = workflow.indexOf('name: Offline semantic acceptance');
  assert.ok(offlineStart >= 0, 'offline semantic acceptance step is required');
  const offlineEnd = workflow.indexOf('\n      - name:', offlineStart + 1);
  const offlineStep = workflow.slice(offlineStart, offlineEnd >= 0 ? offlineEnd : workflow.length);
  assert.doesNotMatch(offlineStep, /secrets\.|OPENROUTER_API_KEY:\s*/);
  assert.match(offlineStep, /test -z "\$\{OPENROUTER_API_KEY:-\}"/);
  assert.match(offlineStep, /node scripts\/ai-index-verify\.js/);
  assert.match(offlineStep, /node scripts\/ai-benchmark\.js --mode semantic --index data\/ai-index/);
});

test('real AI acceptance uploads reviewable candidate index and evidence without enabling public AI', () => {
  const workflow = workflowSource();

  assert.match(workflow, /actions\/upload-artifact@[a-f0-9]{40}/);
  assert.match(workflow, /data\/ai-index\/chunks\.json/);
  assert.match(workflow, /data\/ai-index\/index-meta\.json/);
  assert.match(workflow, /data\/ai-index\/embeddings\.bin/);
  assert.match(workflow, /data\/ai-index\/benchmark-query-cache\//);
  assert.match(workflow, /quality-artifacts\/ai-index-verify\.json/);
  assert.match(workflow, /quality-artifacts\/ai-semantic-benchmark\.json/);
  assert.match(workflow, /git diff --exit-code -- data\/ai-navigator\.json/);
  assert.doesNotMatch(workflow, /sed .*ai-navigator|mode:\s*(search|full)|"mode"\s*:\s*"(search|full)"/);
});
