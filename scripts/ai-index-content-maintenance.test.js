import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflowPath = '.github/workflows/ai-index-content-maintenance.yml';

function readWorkflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

test('AI index content maintenance is explicit owner-triggered and keeps provider job read-only', () => {
  const source = readWorkflow();

  assert.match(source, /^name: AI Index Content Maintenance$/m);
  assert.match(source, /^\s{2}issue_comment:\s*$/m);
  assert.match(source, /^\s{4}types: \[created\]$/m);
  assert.match(source, /github\.event\.issue\.pull_request/);
  assert.match(source, /github\.event\.comment\.author_association == 'OWNER'/);
  assert.match(source, /CONFIRM_OPENROUTER_REAL_EMBEDDING_RUN/);
  assert.match(source, /^\s{4}environment: ai5-provider-acceptance$/m);

  const maintenance = source.slice(source.indexOf('  maintenance:'), source.indexOf('  report:'));
  assert.match(maintenance, /permissions:\s*\n\s{6}contents: read\s*\n\s{6}pull-requests: read/);
  assert.doesNotMatch(maintenance, /contents:\s*write|issues:\s*write|pull-requests:\s*write/);
  assert.doesNotMatch(source, /contents:\s*write|pull-requests:\s*write/);
});

test('AI index content maintenance binds the command to the same-repository current PR head before provider access', () => {
  const source = readWorkflow();

  assert.match(source, /gh api .*pulls\/\$ISSUE_NUMBER/);
  assert.match(source, /REQUESTED_SHA/);
  assert.match(source, /HEAD_SHA/);
  assert.match(source, /HEAD_REPO/);
  assert.match(source, /requested SHA must equal current PR head/i);
  assert.match(source, /candidate repository must equal current repository/i);
  assert.match(source, /ref: \$\{\{ steps\.candidate\.outputs\.sha \}\}/);
  assert.match(source, /persist-credentials: false/g);
});

test('trusted authority is pinned to the issue-comment event SHA and candidate paths are content-only allowlisted', () => {
  const source = readWorkflow();

  assert.match(source, /name: Checkout trusted workflow commit[\s\S]*?ref: \$\{\{ github\.sha \}\}/);
  assert.doesNotMatch(source, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/);
  assert.match(source, /docs\/\*\|scripts\/\*\.test\.js\|tests\/\*/);
  assert.match(source, /AI maintenance refuses non-content candidate:/);
});

test('AI index content maintenance executes trusted indexing code and rejects unsafe candidate inputs', () => {
  const source = readWorkflow();

  assert.match(source, /path: trusted/);
  assert.match(source, /path: candidate/);
  assert.match(source, /Reject executable or authority changes/);
  assert.match(source, /scripts\/.*\.js/);
  assert.match(source, /\.github\//);
  assert.match(source, /package-lock\.json/);
  assert.match(source, /data\/ai-navigator\.json/);
  assert.match(source, /find candidate\/docs candidate\/data -type l/);
  assert.match(source, /rm -rf candidate\/scripts/);
  assert.match(source, /cp -a trusted\/scripts candidate\/scripts/);
  assert.match(source, /cp trusted\/data\/ai-navigator\.json candidate\/data\/ai-navigator\.json/);
  assert.match(source, /cp -a trusted\/data\/ai-index-accepted\/ai5 candidate\/data\/ai-index/);
});

test('AI index content maintenance uses bounded real-provider accounting and preserves reviewable evidence', () => {
  const source = readWorkflow();

  const preflight = source.indexOf('Reject executable or authority changes');
  const secretUse = source.indexOf('OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_AI5_API_KEY }}');
  assert.ok(preflight >= 0 && secretUse > preflight, 'provider secret must appear only after candidate preflight');
  assert.match(source, /fetchCurrentKeyMetadata/);
  assert.match(source, /createEmbeddingAccountingFetch/);
  assert.match(source, /refreshAiIndex/);
  assert.match(source, /refreshed > 8/);
  assert.match(source, /after\.limitUsd !== before\.limitUsd/);
  assert.match(source, /after\.limitReset !== null/);
  assert.match(source, /after\.usageUsd \+ 1e-9 < before\.usageUsd/);
  assert.match(source, /provider key policy changed during maintenance/);
  assert.match(source, /provider usage moved backwards during maintenance/);
  assert.match(source, /node scripts\/ai-index-verify\.js/);
  assert.match(source, /"providerAccess": false/);
  assert.match(source, /actions\/upload-artifact@[a-f0-9]{40}/);
  assert.match(source, /retention-days: 1/);
  assert.doesNotMatch(source, /npm audit fix|--force/);
});

test('write permission is isolated to a secret-free reporting job that surfaces the run URL', () => {
  const source = readWorkflow();
  const report = source.slice(source.indexOf('  report:'));

  assert.match(report, /needs: maintenance/);
  assert.match(report, /permissions:\s*\n\s{6}issues: write/);
  assert.doesNotMatch(report, /environment:|OPENROUTER|contents:\s*write|pull-requests:\s*write/);
  assert.match(report, /github\.server_url.*actions\/runs\/.*github\.run_id/);
});
