import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'ai-navigator-full-canary.yml');

function workflowSource() {
  return fs.readFileSync(WORKFLOW_PATH, 'utf8');
}

function stepSource(workflow, stepName) {
  const start = workflow.indexOf(`name: ${stepName}`);
  assert.ok(start >= 0, `workflow step is required: ${stepName}`);
  const end = workflow.indexOf('\n      - name:', start + 1);
  return workflow.slice(start, end >= 0 ? end : workflow.length);
}

test('AI-7 FULL canary is manual-only, master-only, read-only and never deploys or activates public FULL', () => {
  const workflow = workflowSource();

  assert.match(workflow, /name: AI Navigator FULL Canary/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /pull_request:|push:|schedule:/);
  assert.match(workflow, /confirm_full_canary:/);
  assert.match(workflow, /type: boolean/);
  assert.match(workflow, /default: false/);
  assert.match(workflow, /GITHUB_REF.*refs\/heads\/master/);
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.doesNotMatch(workflow, /contents: write|issues: write|pull-requests: write|deployments: write|pages: write/);
  assert.doesNotMatch(workflow, /git push|gh pr|wrangler deploy|actions\/deploy-pages|actions\/upload-pages-artifact/);
  assert.doesNotMatch(workflow, /sed .*ai-navigator|jq .*mode.*full.*ai-navigator/);
  assert.match(workflow, /git diff --exit-code -- data\/ai-navigator\.json/);
});

test('AI-7 credentials are dedicated, environment-scoped and used only by the bounded live step', () => {
  const workflow = workflowSource();
  assert.match(workflow, /environment:\s*ai7-full-canary/);
  assert.doesNotMatch(workflow, /^env:\s*$|^\s{4}env:\s*$/m, 'AI-7 secrets must not be workflow- or job-scoped');
  assert.equal((workflow.match(/secrets\.AI7_FULL_WORKER_BASE_URL/g) || []).length, 1);
  assert.equal((workflow.match(/secrets\.OPENROUTER_AI7_API_KEY/g) || []).length, 1);
  assert.doesNotMatch(workflow, /OPENROUTER_AI5_API_KEY|OPENROUTER_AI6_API_KEY|secrets\.OPENROUTER_API_KEY/);

  const live = stepSource(workflow, 'Execute bounded FULL canary');
  assert.match(live, /AI7_FULL_WORKER_BASE_URL:\s*\$\{\{ secrets\.AI7_FULL_WORKER_BASE_URL \}\}/);
  assert.match(live, /OPENROUTER_AI7_API_KEY:\s*\$\{\{ secrets\.OPENROUTER_AI7_API_KEY \}\}/);
  assert.match(live, /node scripts\/ai7-full-canary\.js/);
  assert.match(live, /quality-artifacts\/ai7-full-canary\.json/);
});

test('AI-7 workflow proves public SEARCH invariants and uploads only sanitized bounded evidence', () => {
  const workflow = workflowSource();
  const publicBaseline = stepSource(workflow, 'Require accepted public SEARCH baseline');
  const upload = stepSource(workflow, 'Upload AI-7 FULL canary evidence');

  assert.doesNotMatch(publicBaseline, /secrets\./);
  assert.match(publicBaseline, /config\.mode !== 'search'/);
  assert.match(publicBaseline, /config\.workerBaseUrl/);
  assert.match(publicBaseline, /AI_ANSWER_ENABLED/);

  assert.match(upload, /quality-artifacts\/ai7-full-canary\.json/);
  assert.match(upload, /retention-days: 14/);
  assert.doesNotMatch(upload, /\.dev\.vars|OPENROUTER|WORKER_BASE_URL/);
});
