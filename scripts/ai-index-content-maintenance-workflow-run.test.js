import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflowPath = '.github/workflows/ai-index-content-maintenance.yml';

function readWorkflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

test('completed Build workflow_run gates AI maintenance without trusting prior-run artifacts or PR code', () => {
  const source = readWorkflow();

  assert.match(
    source,
    /^\s{2}workflow_run:\s*\n\s{4}workflows: \[Build\]\s*\n\s{4}types: \[completed\]$/m,
  );

  const gateStart = source.indexOf('  workflow_run_gate:');
  const receiptStart = source.indexOf('  receipt:');
  assert.ok(gateStart >= 0 && receiptStart > gateStart, 'secret-free workflow_run gate must precede receipt/provider jobs');
  const gate = source.slice(gateStart, receiptStart);

  assert.match(gate, /if: github\.event_name == 'workflow_run'/);
  assert.match(gate, /permissions:\s*\n\s{6}pull-requests: read/);
  assert.match(gate, /WORKFLOW_HEAD_SHA: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(gate, /WORKFLOW_HEAD_REPO: \$\{\{ github\.event\.workflow_run\.head_repository\.full_name \}\}/);
  assert.match(gate, /WORKFLOW_PR_NUMBER: \$\{\{ github\.event\.workflow_run\.pull_requests\[0\]\.number \}\}/);
  assert.match(gate, /github\.repository_owner/);
  assert.match(gate, /authorized=false/);
  assert.match(gate, /authorized=true/);
  assert.doesNotMatch(gate, /environment:|OPENROUTER|actions\/checkout|download-artifact|actions\/cache/);

  assert.match(source, /needs\.workflow_run_gate\.outputs\.authorized == 'true'/);
  assert.match(source, /needs\.workflow_run_gate\.outputs\.pr_number/);
  assert.match(source, /WORKFLOW_RUN_HEAD_SHA/);
  assert.doesNotMatch(source, /actions\/download-artifact|download-artifact@/);
  assert.doesNotMatch(source, /allow-unsafe-pr-checkout:\s*true/);
});
