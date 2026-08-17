import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'ai-navigator-search-canary.yml');

function workflowSource() {
  return fs.readFileSync(WORKFLOW_PATH, 'utf8');
}

function stepSource(workflow, stepName) {
  const start = workflow.indexOf(`name: ${stepName}`);
  assert.ok(start >= 0, `workflow step is required: ${stepName}`);
  const end = workflow.indexOf('\n      - name:', start + 1);
  return workflow.slice(start, end >= 0 ? end : workflow.length);
}

test('AI-6 SEARCH canary is manual-only, master-only and cannot deploy or mutate repository/product state', () => {
  const workflow = workflowSource();

  assert.match(workflow, /name: AI Navigator SEARCH Canary/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /pull_request:|push:|schedule:/);
  assert.match(workflow, /confirm_search_canary:/);
  assert.match(workflow, /type: boolean/);
  assert.match(workflow, /default: false/);
  assert.match(workflow, /GITHUB_REF.*refs\/heads\/master/);
  assert.match(workflow, /permissions:\s*\n\s+actions: read\s*\n\s+contents: read/);
  assert.doesNotMatch(workflow, /contents: write|issues: write|pull-requests: write|deployments: write|pages: write/);
  assert.doesNotMatch(workflow, /git push|gh pr|wrangler deploy|actions\/deploy-pages|actions\/upload-pages-artifact/);
  assert.doesNotMatch(workflow, /mode:\s*(search|full)|"mode"\s*:\s*"(search|full)"|sed .*ai-navigator/);
  assert.match(workflow, /git diff --exit-code -- data\/ai-navigator\.json/);
});

test('AI-6 SEARCH canary restores only the exact accepted AI-5 artifact and re-runs offline retrieval acceptance before live calls', () => {
  const workflow = workflowSource();
  const restore = stepSource(workflow, 'Restore exact accepted AI-5 static index artifact');
  const offline = stepSource(workflow, 'Verify accepted static index and hybrid ranking offline');
  const live = stepSource(workflow, 'Execute bounded SEARCH-only live canary');

  assert.match(restore, /artifact_id=9283608793/);
  assert.match(restore, /artifact_sha256=71260072c273588c4b8a4ab53180b6dfc5c39be8612aee21f91721c7d2919e1f/);
  assert.match(restore, /sha256sum --check --strict/);
  assert.match(restore, /actions\/artifacts\/\$\{artifact_id\}\/zip/);

  assert.doesNotMatch(offline, /secrets\./);
  assert.match(offline, /test -z "\$\{OPENROUTER_AI6_API_KEY:-\}"/);
  assert.match(offline, /test -z "\$\{AI6_SEARCH_WORKER_BASE_URL:-\}"/);
  assert.match(offline, /node scripts\/ai-index-verify\.js/);
  assert.match(offline, /node scripts\/ai-benchmark\.js --mode semantic --index data\/ai-index/);

  assert.match(live, /AI6_SEARCH_WORKER_BASE_URL:\s*\$\{\{ secrets\.AI6_SEARCH_WORKER_BASE_URL \}\}/);
  assert.match(live, /OPENROUTER_AI6_API_KEY:\s*\$\{\{ secrets\.OPENROUTER_AI6_API_KEY \}\}/);
  assert.match(live, /node scripts\/ai6-config-evidence\.js --output-dir quality-artifacts/);
  assert.match(live, /quality-artifacts\/ai6-config-pair-evidence\.json/);
  assert.match(live, /node scripts\/ai6-search-canary\.js/);
});

test('AI-6 workflow retains sanitized candidate SEARCH and exact OFF rollback evidence', () => {
  const workflow = workflowSource();
  const upload = stepSource(workflow, 'Upload AI-6 canary evidence');

  assert.match(upload, /quality-artifacts\/ai6-config-pair-evidence\.json/);
  assert.match(upload, /quality-artifacts\/ai6-candidate-search-config\.json/);
  assert.match(upload, /quality-artifacts\/ai6-rollback-off-config\.json/);
  assert.match(upload, /quality-artifacts\/ai6-search-canary\.json/);
  assert.match(upload, /retention-days: 14/);
});

test('AI-6 credentials are dedicated, environment-scoped and absent from ordinary/offline workflow scope', () => {
  const workflow = workflowSource();

  assert.match(workflow, /environment:\s*ai6-search-canary/);
  assert.doesNotMatch(workflow, /^env:\s*$|^\s{4}env:\s*$/m, 'AI-6 secrets must not be workflow- or job-scoped');
  assert.equal((workflow.match(/secrets\.AI6_SEARCH_WORKER_BASE_URL/g) || []).length, 1);
  assert.equal((workflow.match(/secrets\.OPENROUTER_AI6_API_KEY/g) || []).length, 1);
  assert.doesNotMatch(workflow, /OPENROUTER_AI5_API_KEY|secrets\.OPENROUTER_API_KEY/);

  const publicOff = stepSource(workflow, 'Require public AI to remain OFF');
  assert.doesNotMatch(publicOff, /secrets\./);
  assert.match(publicOff, /config\.mode !== 'off'/);
  assert.match(publicOff, /config\.workerBaseUrl !== ''/);
});
