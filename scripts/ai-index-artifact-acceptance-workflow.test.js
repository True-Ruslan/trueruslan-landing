import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflowPath = '.github/workflows/ai-index-artifact-acceptance.yml';

function readWorkflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

test('reviewed AI index artifact acceptance is workflow-run gated, provider-free and write-bounded', () => {
  const source = readWorkflow();

  assert.match(source, /^name: AI Index Artifact Acceptance$/m);
  assert.match(
    source,
    /^\s{2}workflow_run:\s*\n\s{4}workflows: \[Build\]\s*\n\s{4}types: \[completed\]$/m,
  );
  assert.match(source, /permissions:\s*\n\s{2}contents: read/);
  assert.match(source, /actions: read/);
  assert.match(source, /pull-requests: read/);
  assert.match(source, /contents: write/);

  assert.match(source, /\/accept-ai-index/);
  assert.match(source, /CONFIRM_AI_INDEX_ARTIFACT_ACCEPTANCE/);
  assert.match(source, /github\.event\.workflow_run\.head_sha/);
  assert.match(source, /github\.event\.workflow_run\.pull_requests\[0\]\.number/);
  assert.match(source, /github\.repository_owner/);
  assert.match(source, /head\.repo\.full_name/);
  assert.match(source, /head\.sha/);

  assert.match(source, /actions\/artifacts\/\$ARTIFACT_ID/);
  assert.match(source, /actions\/runs\/\$MAINTENANCE_RUN_ID\/jobs/);
  assert.match(source, /ai-index-content-maintenance-/);
  assert.match(source, /sha256sum/);
  assert.match(source, /providerAccess/);
  assert.match(source, /real-provider-index-maintenance/);
  assert.match(source, /data\/ai-index-accepted\/ai5/);
  assert.match(source, /git diff --cached --name-only/);
  assert.match(source, /git push/);

  assert.doesNotMatch(source, /OPENROUTER_API_KEY|secrets\.OPENROUTER|ai5-provider-acceptance/);
  assert.doesNotMatch(source, /actions\/download-artifact|allow-unsafe-pr-checkout:\s*true/);
});
