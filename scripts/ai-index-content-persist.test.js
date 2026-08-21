import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflowPath = '.github/workflows/ai-index-content-maintenance.yml';

function readWorkflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

test('successful provider maintenance persists only verified accepted-index bytes from a secret-free job', () => {
  const source = readWorkflow();
  const maintenanceStart = source.indexOf('  maintenance:');
  const persistStart = source.indexOf('  persist:');
  const reportStart = source.indexOf('  report:');

  assert.ok(maintenanceStart >= 0 && persistStart > maintenanceStart && reportStart > persistStart,
    'persist must be isolated after provider maintenance and before reporting');

  const maintenance = source.slice(maintenanceStart, persistStart);
  const persist = source.slice(persistStart, reportStart);

  assert.match(maintenance, /permissions:\s*\n\s{6}contents: read\s*\n\s{6}pull-requests: read/);
  assert.doesNotMatch(maintenance, /contents:\s*write/);

  assert.match(persist, /needs: maintenance/);
  assert.match(persist, /needs\.maintenance\.result == 'success'/);
  assert.match(persist, /needs\.maintenance\.outputs\.deduplicated != 'true'/);
  assert.match(persist, /permissions:[\s\S]*?actions: read[\s\S]*?contents: write[\s\S]*?pull-requests: read/);
  assert.doesNotMatch(persist, /environment:|OPENROUTER|secrets\./);

  assert.match(persist, /ARTIFACT_ID: \$\{\{ needs\.maintenance\.outputs\.artifact_id \}\}/);
  assert.match(persist, /ARTIFACT_DIGEST: \$\{\{ needs\.maintenance\.outputs\.artifact_digest \}\}/);
  assert.match(persist, /CANDIDATE_SHA: \$\{\{ needs\.maintenance\.outputs\.candidate_sha \}\}/);
  assert.match(persist, /actions\/artifacts\/\$ARTIFACT_ID/);
  assert.match(persist, /sha256sum/);
  assert.match(persist, /workflow_run\.id/);
  assert.match(persist, /AI index persistence refuses unexpected artifact files/);
  assert.match(persist, /find .* -type l/);

  assert.match(persist, /real-provider-index-maintenance/);
  assert.match(persist, /providerAccess/);
  assert.match(persist, /sourceCommit/);
  assert.match(persist, /corpusDigest/);
  assert.match(persist, /embeddingsDigest/);
});

test('accepted-index persistence is exact-head race-safe and writes exactly three durable files in one commit', () => {
  const source = readWorkflow();
  const persist = source.slice(source.indexOf('  persist:'), source.indexOf('  report:'));

  assert.match(persist, /pulls\/\$PR_NUMBER/);
  assert.match(persist, /HEAD_SHA/);
  assert.match(persist, /HEAD_REPO/);
  assert.match(persist, /HEAD_REF/);
  assert.match(persist, /CANDIDATE_SHA/);
  assert.match(persist, /Persistence candidate no longer matches the current PR head/);
  assert.match(persist, /git\/ref\/heads\/\$HEAD_REF/);
  assert.match(persist, /Ref moved before accepted-index persistence/);

  for (const path of [
    'data/ai-index-accepted/ai5/chunks.json',
    'data/ai-index-accepted/ai5/index-meta.json',
    'data/ai-index-accepted/ai5/embeddings.bin',
  ]) {
    assert.match(persist, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(persist, /git\/blobs/);
  assert.match(persist, /git\/trees/);
  assert.match(persist, /git\/commits/);
  assert.match(persist, /git\/refs\/heads\/\$HEAD_REF/);
  assert.match(persist, /Persist verified AI index for \$CANDIDATE_SHA/);
  assert.doesNotMatch(persist, /git push|persist-credentials:\s*true|allow-unsafe-pr-checkout:\s*true/);
});

test('workflow-run reporting uses PR-scoped write permission and concurrency stays PR-scoped', () => {
  const source = readWorkflow();
  const receipt = source.slice(source.indexOf('  receipt:'), source.indexOf('  maintenance:'));
  const maintenance = source.slice(source.indexOf('  maintenance:'), source.indexOf('  persist:'));
  const report = source.slice(source.indexOf('  report:'));

  assert.match(receipt, /permissions:\s*\n\s{6}pull-requests: write/);
  assert.doesNotMatch(receipt, /issues:\s*write/);
  assert.match(report, /permissions:\s*\n\s{6}pull-requests: write/);
  assert.doesNotMatch(report, /issues:\s*write/);

  assert.match(
    maintenance,
    /group: ai-index-content-maintenance-\$\{\{ github\.event_name == 'issue_comment' && github\.event\.issue\.number \|\| github\.event\.pull_request\.number \|\| needs\.workflow_run_gate\.outputs\.pr_number \}\}/,
  );
});
