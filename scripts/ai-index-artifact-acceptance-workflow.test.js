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
  assert.match(source, /github\.repository_owner/);
  assert.match(source, /head\.repo\.full_name/);
  assert.match(source, /head\.sha/);

  assert.match(source, /actions\/artifacts\/\$ARTIFACT_ID/);
  assert.match(source, /actions\/runs\/\$MAINTENANCE_RUN_ID\/jobs/);
  assert.match(source, /ai-index-content-maintenance-/);
  assert.match(source, /MAX_ARTIFACT_BYTES/);
  assert.match(source, /sha256sum/);
  assert.match(source, /providerAccess/);
  assert.match(source, /real-provider-index-maintenance/);
  assert.match(source, /data\/ai-index-accepted\/ai5/);
  assert.match(source, /git -C candidate diff --cached --name-only/);
  assert.match(source, /git -C candidate push origin/);

  assert.doesNotMatch(source, /OPENROUTER_API_KEY|secrets\.OPENROUTER|ai5-provider-acceptance/);
  assert.doesNotMatch(source, /actions\/download-artifact|allow-unsafe-pr-checkout:\s*true/);
});

test('workflow_run is only a wake-up signal and unrelated Builds stay non-failing', () => {
  const source = readWorkflow();
  const gateStart = source.indexOf('  gate:');
  const acceptStart = source.indexOf('  accept:');

  assert.ok(gateStart >= 0 && acceptStart > gateStart, 'read-only gate must precede the write-capable accept job');
  const gate = source.slice(gateStart, acceptStart);

  assert.match(gate, /permissions:\s*\n\s{6}pull-requests: read/);
  assert.doesNotMatch(gate, /contents: write|actions: read/);
  assert.match(gate, /echo "authorized=false"/);
  assert.match(gate, /WORKFLOW_HEAD_BRANCH: \$\{\{ github\.event\.workflow_run\.head_branch \}\}/);
  assert.match(gate, /-f state=open/);
  assert.match(gate, /-f head="\$REPOSITORY_OWNER:\$WORKFLOW_HEAD_BRANCH"/);
  assert.match(gate, /PR_COUNT=.*length/);
  assert.match(gate, /\[ "\$COMMAND" != "\/accept-ai-index" \]/);
  assert.match(gate, /echo "authorized=true"/);
  assert.doesNotMatch(source, /workflow_run\.pull_requests\[/);
});

test('write-capable acceptance requires gate authorization and rechecks revocable operator intent', () => {
  const source = readWorkflow();
  const acceptStart = source.indexOf('  accept:');
  assert.ok(acceptStart >= 0, 'accept job must exist');
  const accept = source.slice(acceptStart);

  assert.match(accept, /needs: gate/);
  assert.match(accept, /if: needs\.gate\.outputs\.authorized == 'true'/);
  assert.match(accept, /contents: write/);
  assert.match(accept, /PR_NUMBER: \$\{\{ needs\.gate\.outputs\.pr_number \}\}/);
  assert.match(accept, /CANDIDATE_SHA: \$\{\{ needs\.gate\.outputs\.candidate_sha \}\}/);
  assert.match(accept, /CURRENT_BODY/);
  assert.match(accept, /CURRENT_COMMAND_LINE/);
  assert.match(accept, /EXPECTED_COMMAND_LINE/);
  assert.match(accept, /acceptance command changed before repository mutation/i);
});
